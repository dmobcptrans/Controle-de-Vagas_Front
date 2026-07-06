declare module '@mapbox/mapbox-gl-geocoder' {
  import mapboxgl from 'mapbox-gl';

  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl?: typeof mapboxgl;
    marker?: boolean | object;
    placeholder?: string;
    bbox?: number[];
    proximity?: { longitude: number; latitude: number };
    countries?: string;
    types?: string;
    flyTo?: boolean;
    container?: string | HTMLElement;
  }

  interface GeocoderResultEvent {
    result: {
      id: string;
      place_name: string;
      geometry: { coordinates: [number, number] };
    };
  }

  class MapboxGeocoder implements mapboxgl.IControl {
    constructor(options: MapboxGeocoderOptions);
    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(): void;
    on(
      event: 'result' | 'clear',
      callback: (event: GeocoderResultEvent) => void,
    ): void;
  }

  export default MapboxGeocoder;
}
