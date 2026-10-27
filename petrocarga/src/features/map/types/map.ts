export interface BoundsMapa {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export interface SuggestionWithCoords {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface MapboxContext {
  id: string;
  text: string;
}

export interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  context?: MapboxContext[];
  center: [number, number];
}

export interface MapboxResponse {
  features?: MapboxFeature[];
}

export interface MapboxSelectedPlace {
  id: string;
  place_name: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface UseMapboxProps {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  onSelectPlace?: (place: MapboxSelectedPlace) => void;
  enableSearch?: boolean;
  enableNavigation?: boolean;
  enableGeolocate?: boolean;
  expandSearch?: boolean;
}