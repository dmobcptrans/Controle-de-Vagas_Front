import { useEffect, useState } from 'react';

interface SuggestionWithCoords {
  label: string;
  lat: number;
  lng: number;
}

interface MapboxContext {
  id: string;
  text: string;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  context?: MapboxContext[];
  center: [number, number];
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

// ✅ OVERLOADS (ESSENCIAL)
export function useMapboxSuggestions(
  query: string,
  withCoords: true
): SuggestionWithCoords[];

export function useMapboxSuggestions(
  query: string,
  withCoords?: false
): string[];

// ✅ IMPLEMENTAÇÃO
export function useMapboxSuggestions(
  query: string,
  withCoords: boolean = false
) {
  const [suggestions, setSuggestions] = useState<
    SuggestionWithCoords[] | string[]
  >([]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=BR&types=address,place&limit=5&proximity=-43.178,-22.505`
        );

        if (!response.ok) throw new Error('Erro na requisição ao Mapbox');

        const data: MapboxResponse = await response.json();

        if (withCoords) {
          const places: SuggestionWithCoords[] =
            data.features?.map((f) => {
              const context = f.context ?? [];

              const city = context.find((c) =>
                c.id.includes('place')
              )?.text;
              const state = context.find((c) =>
                c.id.includes('region')
              )?.text;
              const street = f.text;

              let label = f.place_name;

              if (street && city && state) {
                label = `${street}, ${city} - ${state}`;
              } else if (city && state) {
                label = `${city} - ${state}`;
              }

              const [lng, lat] = f.center;

              return { label, lat, lng };
            }) ?? [];

          setSuggestions(places);
        } else {
          const places: string[] =
            data.features?.map((f) => {
              const context = f.context ?? [];

              const city = context.find((c) =>
                c.id.includes('place')
              )?.text;
              const state = context.find((c) =>
                c.id.includes('region')
              )?.text;
              const street = f.text;

              if (street && city && state)
                return `${street}, ${city} - ${state}`;
              if (city && state)
                return `${city} - ${state}`;

              return f.place_name;
            }) ?? [];

          setSuggestions(places);
        }
      } catch (err) {
        console.error('Erro ao buscar sugestões do Mapbox:', err);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeout);
  }, [query, withCoords, MAPBOX_TOKEN]);

  return suggestions;
}