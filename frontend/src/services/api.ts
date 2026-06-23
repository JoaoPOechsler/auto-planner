import axios from 'axios';

// Backend rodando na mesma máquina
const API_URL = 'http://localhost:3000';

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message ?? 'Erro desconhecido';
    return Promise.reject(new Error(message));
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// ── Vehicles ──────────────────────────────────────────────────────────────────

export const vehiclesApi = {
  list: () => api.get<Vehicle[]>('/vehicles'),
  get: (id: number) => api.get<Vehicle>(`/vehicles/${id}`),
  create: (data: VehiclePayload) => api.post<Vehicle>('/vehicles', data),
  update: (id: number, data: Partial<VehiclePayload>) => api.put<Vehicle>(`/vehicles/${id}`, data),
  remove: (id: number) => api.delete(`/vehicles/${id}`),
};

// ── Maintenances ──────────────────────────────────────────────────────────────

export const maintenancesApi = {
  listByVehicle: (vehicleId: number) => api.get<Maintenance[]>(`/maintenances/vehicle/${vehicleId}`),
  create: (data: MaintenancePayload) => api.post<Maintenance>('/maintenances', data),
  remove: (id: number) => api.delete(`/maintenances/${id}`),
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VehiclePayload {
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  color?: string;
}

export interface Vehicle extends VehiclePayload {
  id: number;
  user_id: number;
  maintenance_count: number;
  last_maintenance_date: string | null;
  created_at: string;
}

export interface MaintenancePayload {
  vehicle_id: number;
  type: string;
  description?: string;
  date: string;
  mileage?: number;
  cost?: number;
  status?: 'completed' | 'pending';
  notes?: string;
}

export interface Maintenance extends MaintenancePayload {
  id: number;
  created_at: string;
}
