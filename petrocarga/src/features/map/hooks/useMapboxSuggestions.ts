import { useEffect, useState } from 'react';

import {
  MapboxResponse,
  SuggestionWithCoords,
} from '../types/map';

import { MAPBOX_TOKEN } from '../config/mapbox';
import { formatMapboxPlace } from '../utils/formatMapboxPlace';

export function useMapboxSuggestions(
  query: string,
  withCoords: true,
): SuggestionWithCoords[];

export function useMapboxSuggestions(
  query: string,
  withCoords?: false,
): string[];

export function useMapboxSuggestions(
  query: string,
  withCoords = false,
) {
  const [suggestions, setSuggestions] = useState<
    SuggestionWithCoords[] | string[]
  >([]);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
          `${encodeURIComponent(query)}.json` +
          `?access_token=${MAPBOX_TOKEN}` +
          `&autocomplete=true` +
          `&country=BR` +
          `&types=address,place` +
          `&limit=5` +
          `&proximity=-43.178,-22.505`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Erro na requisição ao Mapbox');
        }

        const data: MapboxResponse = await response.json();

        if (withCoords) {
          const formattedSuggestions: SuggestionWithCoords[] =
            (data.features ?? []).map(feature => {
              const label = formatMapboxPlace(feature);
              const [lng, lat] = feature.center;

              return {
                id: feature.id,
                label,
                lat,
                lng,
              };
            });

          setSuggestions(formattedSuggestions);
          return;
        }

        const formattedSuggestions: string[] =
          (data.features ?? []).map(feature =>
            formatMapboxPlace(feature),
          );

        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error(
          'Erro ao buscar sugestões do Mapbox:',
          error,
        );

        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, withCoords]);

  return suggestions;
}