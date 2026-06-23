import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi } from '../services/api';

const CAR_COLORS = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Bege', 'Outra'];

export default function AddVehicle() {
  const navigate = useNavigate();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      setError('Ano inválido.'); return;
    }
    setLoading(true);
    try {
      await vehiclesApi.create({
        make: make.trim(),
        model: model.trim(),
        year: yearNum,
        license_plate: plate.trim().toUpperCase() || undefined,
        color: color || undefined,
      });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container content" style={{ maxWidth: 560 }}>
        <div className="page-header">
          <div className="page-header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
            <h1 className="page-title">Novo Veículo</h1>
          </div>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Marca *</label>
              <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Ex: Toyota" required autoFocus />
            </div>
            <div className="field">
              <label>Modelo *</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex: Corolla" required />
            </div>
            <div className="field">
              <label>Ano *</label>
              <input
                type="number" value={year} onChange={(e) => setYear(e.target.value)}
                placeholder={String(new Date().getFullYear())} min="1900" max={new Date().getFullYear() + 1} required
              />
            </div>
            <div className="field">
              <label>Placa</label>
              <input
                value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234" maxLength={8}
              />
            </div>
            <div className="field">
              <label>Cor</label>
              <div className="chip-grid">
                {CAR_COLORS.map((c) => (
                  <button
                    key={c} type="button"
                    className={`chip-option${color === c ? ' active' : ''}`}
                    onClick={() => setColor(c === color ? '' : c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Veículo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
