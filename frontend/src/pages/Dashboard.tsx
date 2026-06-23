import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehiclesApi, Vehicle } from '../services/api';

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await vehiclesApi.list();
      setVehicles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, vehicle: Vehicle) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Remover ${vehicle.make} ${vehicle.model}? Todas as manutenções serão perdidas.`)) return;
    try {
      await vehiclesApi.remove(vehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao remover');
    }
  }

  return (
    <div className="page">
      <div className="container content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Meus Veículos</h1>
            <p className="page-subtitle">{vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} cadastrado{vehicles.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/vehicles/new" className="btn btn-primary">
            + Adicionar Veículo
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <p className="empty-state-title">Nenhum veículo cadastrado</p>
            <p className="empty-state-text">Clique em "Adicionar Veículo" para começar</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((v) => (
              <Link key={v.id} to={`/vehicles/${v.id}`} className="vehicle-card">
                <div className="vehicle-card-header">
                  <div className="vehicle-icon">🚗</div>
                  <div style={{ flex: 1 }}>
                    <div className="vehicle-name">{v.make} {v.model}</div>
                    <div className="vehicle-year">{v.year}</div>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={(e) => handleDelete(e, v)}
                    title="Remover veículo"
                    style={{ fontSize: 14, color: 'var(--muted)' }}
                  >
                    🗑
                  </button>
                </div>
                <div className="vehicle-badges">
                  {v.license_plate && <span className="badge">{v.license_plate}</span>}
                  {v.color && <span className="badge badge-gray">{v.color}</span>}
                </div>
                <div className="vehicle-footer">
                  <span>🔧 {v.maintenance_count} {v.maintenance_count === 1 ? 'manutenção' : 'manutenções'}</span>
                  {v.last_maintenance_date && (
                    <>
                      <span className="vehicle-footer-sep" />
                      <span>📅 Última: {formatDate(v.last_maintenance_date)}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
