export const MAINTENANCE_TYPES = [
  { value: 'oil_change',     label: 'Troca de Óleo' },
  { value: 'tire_rotation',  label: 'Rodízio de Pneus' },
  { value: 'brakes',         label: 'Freios' },
  { value: 'air_filter',     label: 'Filtro de Ar' },
  { value: 'coolant',        label: 'Fluido de Arrefecimento' },
  { value: 'timing_belt',    label: 'Correia Dentada' },
  { value: 'battery',        label: 'Bateria' },
  { value: 'inspection',     label: 'Revisão Geral' },
  { value: 'transmission',   label: 'Câmbio / Transmissão' },
  { value: 'suspension',     label: 'Suspensão' },
  { value: 'alignment',      label: 'Alinhamento e Balanceamento' },
  { value: 'other',          label: 'Outro' },
] as const;

export type MaintenanceTypeValue = typeof MAINTENANCE_TYPES[number]['value'];

export function getMaintenanceLabel(value: string) {
  return MAINTENANCE_TYPES.find((t) => t.value === value)?.label ?? value;
}
