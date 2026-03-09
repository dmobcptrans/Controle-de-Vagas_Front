export const toDateKey = (iso: string) => {
  return iso.split('T')[0];
};

export const dayStartISO = (dateKey: string) => {
  return `${dateKey}T00:00:00`;
};

export const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

export const areaColors: Record<string, string> = {
  VERMELHA: '#ef4444',
  AMARELA: '#facc15',
  AZUL: '#3b82f6',
  BRANCA: '#e5e7eb',
  DEFAULT: '#6b7280',
};

export function getColorByArea(area?: string) {
  if (!area) return areaColors.DEFAULT;
  return areaColors[area.toUpperCase()] ?? areaColors.DEFAULT;
}
