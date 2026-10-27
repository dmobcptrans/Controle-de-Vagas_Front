'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';

interface CardMapEditProps {
  mode: 'create' | 'edit'; 
  defaultValue?: {
    latitudeInicio: number;
    longitudeInicio: number;
    latitudeFim: number;
    longitudeFim: number;
  };
  onChange: (data: {
    latitudeInicio: number;
    longitudeInicio: number;
    latitudeFim: number;
    longitudeFim: number;
  }) => void;
}

export default function CardMapEdit({
  mode,
  onChange,
  defaultValue,
}: CardMapEditProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const defaultValueRef = useRef(defaultValue);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb',
      center: [-43.17, -22.51],
      zoom: 15,
      attributionControl: false,
    });

    let points: [number, number][] = [];
    let markers: mapboxgl.Marker[] = [];

    function createRectangle(
      start: [number, number],
      end: [number, number],
      widthMeters = 2.5,
    ): [number, number][] {
      const [lng1, lat1] = start;
      const [lng2, lat2] = end;

      const dx = lng2 - lng1;
      const dy = lat2 - lat1;
      const angle = Math.atan2(dy, dx);

      const metersToDeg = 0.00001 * widthMeters;

      const offsetLng = metersToDeg * Math.sin(angle);
      const offsetLat = metersToDeg * Math.cos(angle);

      return [
        [lng1 - offsetLng, lat1 + offsetLat],
        [lng2 - offsetLng, lat2 + offsetLat],
        [lng2 + offsetLng, lat2 - offsetLat],
        [lng1 + offsetLng, lat1 - offsetLat],
        [lng1 - offsetLng, lat1 + offsetLat],
      ];
    }

    function initDrawLayer(data: GeoJSON.Feature) {
      if (!map.getSource('draw')) {
        map.addSource('draw', {
          type: 'geojson',
          data,
        });

        map.addLayer({
          id: 'draw-line',
          type: 'line',
          source: 'draw',
          paint: {
            'line-color': '#2563EB',
            'line-width': 2,
          },
        });

        map.addLayer({
          id: 'draw-fill',
          type: 'fill',
          source: 'draw',
          paint: {
            'fill-color': '#2563EB',
            'fill-opacity': 0.3,
          },
        });
      } else {
        const source = map.getSource('draw') as GeoJSONSource;
        source.setData(data);
      }
    }

map.on('load', () => {
  map.resize();

  if (mode === 'edit') {
    const initial = defaultValueRef.current;

    if (initial) {
      const p1: [number, number] = [
        initial.longitudeInicio,
        initial.latitudeInicio,
      ];
      const p2: [number, number] = [
        initial.longitudeFim,
        initial.latitudeFim,
      ];

      const rectangle = createRectangle(p1, p2);

      initDrawLayer({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [rectangle],
        },
        properties: {},
      });

      map.fitBounds([p1, p2], { padding: 40 });
    }
  }
});

    map.on('click', (e) => {
      const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (points.length === 2) {
        points = [];
        markers.forEach((m) => m.remove());
        markers = [];
      }

      points.push(point);

      const el = document.createElement('div');
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.backgroundColor = '#2563EB';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(point)
        .addTo(map);

      markers.push(marker);

      if (points.length === 1) {
        initDrawLayer({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: points,
          },
          properties: {},
        });
        return;
      }

      if (points.length === 2) {
        const [p1, p2] = points;

        onChangeRef.current({
          latitudeInicio: p1[1],
          longitudeInicio: p1[0],
          latitudeFim: p2[1],
          longitudeFim: p2[0],
        });

        const rectangle = createRectangle(p1, p2);

        initDrawLayer({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [rectangle],
          },
          properties: {},
        });
      }
    });

    return () => {
      map.remove();
    };
  }, []); // <-- array vazio: monta uma vez

  return (
    <div ref={mapContainer} className="w-full h-64 rounded-lg shadow-md" />
  );
}
