import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { vehiclesApi, maintenancesApi, Vehicle, Maintenance } from '../services/api';

const TYPE_LABELS: Record<string, string> = {
  oil_change:   'Troca de Óleo',
  tire_rotation:'Rodízio de Pneus',
  brakes:       'Freios',
  air_filter:   'Filtro de Ar',
  coolant:      'Fluido de Arrefecimento',
  timing_belt:  'Correia Dentada',
  battery:      'Bateria',
  inspection:   'Revisão Geral',
  transmission: 'Câmbio / Transmissão',
  suspension:   'Suspensão',
  alignment:    'Alinhamento e Balanceamento',
  other:        'Outro',
};

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}
function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [vRes, mRes] = await Promise.all([
        vehiclesApi.get(Number(id)),
        maintenancesApi.listByVehicle(Number(id)),
      ]);
      setVehicle(vRes.data);
      setMaintenances(mRes.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMaintenance(item: Maintenance) {
    if (!confirm('Remover esta manutenção?')) return;
    try {
      await maintenancesApi.remove(item.id);
      setMaintenances((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao remover');
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!vehicle) return <div className="container content"><div className="alert alert-error">{error || 'Veículo não encontrado'}</div></div>;

  const totalCost = maintenances.reduce((s, m) => s + (m.cost ?? 0), 0);
  const completed = maintenances.filter((m) => m.status === 'completed').length;

  return (
    <div className="page">
      <div className="container content">
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => navigate('/')}>← Voltar</button>
            <div>
              <h1 className="page-title">{vehicle.make} {vehicle.model}</h1>
              <p className="page-subtitle">{vehicle.year}</p>
            </div>
          </div>
          <Link to={`/vehicles/${id}/maintenance/new`} className="btn btn-primary">
            + Nova Manutenção
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Vehicle card */}
        <div className="vehicle-detail-card">
          <div className="vehicle-detail-icon">🚗</div>
          <div>
            <div className="vehicle-detail-name">{vehicle.make} {vehicle.model}</div>
            <div className="vehicle-detail-sub">{vehicle.year}</div>
            <div className="vehicle-badges" style={{ marginTop: 10 }}>
              {vehicle.license_plate && <span className="badge">{vehicle.license_plate}</span>}
              {vehicle.color && <span className="badge badge-gray">{vehicle.color}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-value">{maintenances.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{completed}</div>
            <div className="stat-label">Realizadas</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{fmtCurrency(totalCost)}</div>
            <div className="stat-label">Gasto total</div>
          </div>
        </div>

        {/* Maintenance list */}
        <div className="section-title">Histórico de Manutenções</div>

        {maintenances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔧</div>
            <p className="empty-state-title">Nenhuma manutenção registrada</p>
            <p className="empty-state-text">Clique em "Nova Manutenção" para adicionar</p>
          </div>
        ) : (
          <div className="maintenance-list">
            {maintenances.map((m) => (
              <div key={m.id} className="maintenance-card">
                <div className="maintenance-card-header">
                  <span className="maintenance-type">{TYPE_LABELS[m.type] ?? m.type}</span>
                  <span className={`status-badge ${m.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                    {m.status === 'completed' ? 'Realizada' : 'Pendente'}
                  </span>
                </div>
                <div className="maintenance-meta">
                  <span>📅 {fmtDate(m.date)}</span>
                  {m.mileage && <span>🛣 {m.mileage.toLocaleString('pt-BR')} km</span>}
                  {m.cost && <span>💰 {fmtCurrency(m.cost)}</span>}
                </div>
                {m.description && <p style={{ fontSize: 13, color: 'var(--text)' }}>{m.description}</p>}
                {m.notes && <p className="maintenance-notes">{m.notes}</p>}
                <div className="maintenance-actions">
                  <button
                    className="btn btn-sm"
                    style={{ color: 'var(--danger)', background: 'var(--danger-light)', border: 'none' }}
                    onClick={() => handleDeleteMaintenance(m)}
                  >
                    🗑 Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
