import { MapboxFeature } from '../types/map';

export function formatMapboxPlace(feature: MapboxFeature): string {
  const context = feature.context ?? [];

  const city = context.find(c => c.id.includes('place'))?.text;
  const state = context.find(c => c.id.includes('region'))?.text;
  const street = feature.text;

  if (street && city && state) {
    return `${street}, ${city} - ${state}`;
  }

  if (city && state) {
    return `${city} - ${state}`;
  }

  return feature.place_name;
}