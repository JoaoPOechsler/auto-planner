import { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { maintenancesApi } from '../services/api';

const TYPES = [
  { value: 'oil_change',   label: 'Troca de Óleo' },
  { value: 'tire_rotation',label: 'Rodízio de Pneus' },
  { value: 'brakes',       label: 'Freios' },
  { value: 'air_filter',   label: 'Filtro de Ar' },
  { value: 'coolant',      label: 'Fluido de Arrefecimento' },
  { value: 'timing_belt',  label: 'Correia Dentada' },
  { value: 'battery',      label: 'Bateria' },
  { value: 'inspection',   label: 'Revisão Geral' },
  { value: 'transmission', label: 'Câmbio / Transmissão' },
  { value: 'suspension',   label: 'Suspensão' },
  { value: 'alignment',    label: 'Alinhamento e Balanceamento' },
  { value: 'other',        label: 'Outro' },
];

export default function AddMaintenance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState('');
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending'>('completed');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!type) { setError('Selecione o tipo de manutenção.'); return; }
    setLoading(true);
    try {
      await maintenancesApi.create({
        vehicle_id: Number(id),
        type,
        date,
        description: description.trim() || undefined,
        mileage: mileage ? Number(mileage) : undefined,
        cost: cost ? Number(cost.replace(',', '.')) : undefined,
        status,
        notes: notes.trim() || undefined,
      });
      navigate(`/vehicles/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container content" style={{ maxWidth: 600 }}>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
            <h1 className="page-title">Nova Manutenção</h1>
          </div>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Tipo de manutenção *</label>
              <div className="chip-grid">
                {TYPES.map((t) => (
                  <button
                    key={t.value} type="button"
                    className={`chip-option${type === t.value ? ' active' : ''}`}
                    onClick={() => setType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Data *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="field">
              <label>Descrição</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes da manutenção" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field">
                <label>Quilometragem</label>
                <input
                  type="number" value={mileage} onChange={(e) => setMileage(e.target.value)}
                  placeholder="Ex: 45000" min="0"
                />
              </div>
              <div className="field">
                <label>Custo (R$)</label>
                <input
                  type="number" value={cost} onChange={(e) => setCost(e.target.value)}
                  placeholder="Ex: 180.00" min="0" step="0.01"
                />
              </div>
            </div>

            <div className="field">
              <label>Status</label>
              <div className="status-toggle">
                <button
                  type="button"
                  className={`status-option${status === 'completed' ? ' active' : ''}`}
                  onClick={() => setStatus('completed')}
                >
                  ✅ Realizada
                </button>
                <button
                  type="button"
                  className={`status-option${status === 'pending' ? ' active' : ''}`}
                  onClick={() => setStatus('pending')}
                >
                  ⏳ Pendente
                </button>
              </div>
            </div>

            <div className="field">
              <label>Observações</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionais..." />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Manutenção'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
