const router = require('express').Router();
const db = require('../database');
const auth = require('../middleware/auth');
const { publish } = require('../rabbitmq');

router.use(auth);

function getVehicle(vehicleId, userId) {
  return db
    .prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?')
    .get(vehicleId, userId);
}

router.get('/vehicle/:vehicleId', (req, res) => {
  if (!getVehicle(req.params.vehicleId, req.userId)) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  const items = db
    .prepare('SELECT * FROM maintenances WHERE vehicle_id = ? ORDER BY date DESC')
    .all(req.params.vehicleId);
  res.json(items);
});

router.post('/', async (req, res) => {
  const { vehicle_id, type, description, date, mileage, cost, status, notes } = req.body;
  if (!vehicle_id || !type || !date) {
    return res.status(400).json({ error: 'Veículo, tipo e data são obrigatórios' });
  }
  const vehicle = getVehicle(vehicle_id, req.userId);
  if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });

  const { lastInsertRowid: id } = db.prepare(`
    INSERT INTO maintenances (vehicle_id, type, description, date, mileage, cost, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    vehicle_id, type, description || null, date,
    mileage ? Number(mileage) : null,
    cost ? Number(cost) : null,
    status || 'completed',
    notes || null,
  );

  const maintenance = db.prepare('SELECT * FROM maintenances WHERE id = ?').get(id);

  await publish('maintenance.created', {
    id: maintenance.id,
    vehicle: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
    type: maintenance.type,
    date: maintenance.date,
    cost: maintenance.cost,
  });

  res.status(201).json(maintenance);
});

router.put('/:id', async (req, res) => {
  const m = db.prepare(`
    SELECT m.*, v.user_id FROM maintenances m
    JOIN vehicles v ON v.id = m.vehicle_id
    WHERE m.id = ?
  `).get(req.params.id);

  if (!m || m.user_id !== req.userId) {
    return res.status(404).json({ error: 'Manutenção não encontrada' });
  }

  const { type, description, date, mileage, cost, status, notes } = req.body;
  db.prepare(`
    UPDATE maintenances
    SET type=?, description=?, date=?, mileage=?, cost=?, status=?, notes=?
    WHERE id=?
  `).run(
    type ?? m.type,
    description !== undefined ? description : m.description,
    date ?? m.date,
    mileage !== undefined ? (mileage ? Number(mileage) : null) : m.mileage,
    cost !== undefined ? (cost ? Number(cost) : null) : m.cost,
    status ?? m.status,
    notes !== undefined ? notes : m.notes,
    m.id,
  );

  const updated = db.prepare('SELECT * FROM maintenances WHERE id = ?').get(m.id);
  await publish('maintenance.updated', { id: updated.id, type: updated.type, status: updated.status });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const m = db.prepare(`
    SELECT m.*, v.user_id FROM maintenances m
    JOIN vehicles v ON v.id = m.vehicle_id
    WHERE m.id = ?
  `).get(req.params.id);

  if (!m || m.user_id !== req.userId) {
    return res.status(404).json({ error: 'Manutenção não encontrada' });
  }

  db.prepare('DELETE FROM maintenances WHERE id = ?').run(m.id);
  await publish('maintenance.deleted', { id: m.id });
  res.json({ message: 'Manutenção removida com sucesso' });
});

module.exports = router;
