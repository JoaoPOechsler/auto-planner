const router = require('express').Router();
const db = require('../database');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', (req, res) => {
  const vehicles = db.prepare(`
    SELECT
      v.*,
      COUNT(m.id) AS maintenance_count,
      MAX(m.date) AS last_maintenance_date
    FROM vehicles v
    LEFT JOIN maintenances m ON m.vehicle_id = v.id
    WHERE v.user_id = ?
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `).all(req.userId);
  res.json(vehicles);
});

router.get('/:id', (req, res) => {
  const vehicle = db
    .prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);
  if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });
  res.json(vehicle);
});

router.post('/', (req, res) => {
  const { make, model, year, license_plate, color } = req.body;
  if (!make || !model || !year) {
    return res.status(400).json({ error: 'Marca, modelo e ano são obrigatórios' });
  }
  const { lastInsertRowid: id } = db
    .prepare('INSERT INTO vehicles (user_id, make, model, year, license_plate, color) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.userId, make, model, Number(year), license_plate || null, color || null);

  res.status(201).json(db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const v = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });

  const { make, model, year, license_plate, color } = req.body;
  db.prepare('UPDATE vehicles SET make=?, model=?, year=?, license_plate=?, color=? WHERE id=?').run(
    make ?? v.make,
    model ?? v.model,
    year ? Number(year) : v.year,
    license_plate !== undefined ? license_plate : v.license_plate,
    color !== undefined ? color : v.color,
    v.id,
  );
  res.json(db.prepare('SELECT * FROM vehicles WHERE id = ?').get(v.id));
});

router.delete('/:id', (req, res) => {
  const v = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!v) return res.status(404).json({ error: 'Veículo não encontrado' });
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(v.id);
  res.json({ message: 'Veículo removido com sucesso' });
});

module.exports = router;
