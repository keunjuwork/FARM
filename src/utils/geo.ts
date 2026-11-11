import { LatLngLiteral } from '../types';

export function getGoogleMapsApiKey(): string {
  const fromVite = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (typeof fromVite === 'string' && fromVite.trim()) {
    return fromVite.trim();
  }
  if (typeof __GOOGLE_MAPS_API_KEY__ === 'string' && __GOOGLE_MAPS_API_KEY__.trim()) {
    return __GOOGLE_MAPS_API_KEY__.trim();
  }
  return '';
}

export function calculateDistanceKm(a: LatLngLiteral, b: LatLngLiteral): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) {
    return `${Math.max(100, Math.round(km * 1000))}m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)}km`;
  }
  return `${Math.round(km).toLocaleString('ko-KR')}km`;
}

export function isQuotaOrRateLimitError(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err || '');
  return (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('429')
  );
}
