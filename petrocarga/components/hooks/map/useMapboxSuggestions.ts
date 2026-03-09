import { useEffect, useState } from 'react';

// Tipos que representam a resposta da API do Mapbox
interface MapboxContext {
  id: string;
  text: string;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  context?: MapboxContext[];
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

export function useMapboxSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
            query,
          )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=BR&types=address,place&limit=5`,
        );

        if (!response.ok) throw new Error('Erro na requisição ao Mapbox');

        const data: MapboxResponse = await response.json();

        const places =
          data.features?.map((f) => {
            const context = f.context ?? [];

            const city = context.find((c) => c.id.includes('place'))?.text;
            const state = context.find((c) => c.id.includes('region'))?.text;
            const street = f.text;

            if (street && city && state) return `${street}, ${city} - ${state}`;
            if (city && state) return `${city} - ${state}`;
            return f.place_name;
          }) ?? [];

        setSuggestions(places);
      } catch (err) {
        console.error('Erro ao buscar sugestões do Mapbox:', err);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 400); // debounce leve
    return () => clearTimeout(timeout);
  }, [query, MAPBOX_TOKEN]);

  return suggestions;
}
