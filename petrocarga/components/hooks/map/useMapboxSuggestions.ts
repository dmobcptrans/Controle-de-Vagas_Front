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

/**
 * @hook useMapboxSuggestions
 * @version 1.0.0
 * 
 * @description Hook customizado para buscar sugestões de endereços usando a API do Mapbox.
 * Utiliza autocomplete para fornecer sugestões de localidades no Brasil.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PARÂMETROS:
 * ----------------------------------------------------------------------------
 * 
 * @param {string} query - Texto digitado pelo usuário (mínimo 3 caracteres)
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @returns {string[]} - Lista de sugestões de endereços formatadas
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. DEBOUNCE:
 *    - Aguarda 400ms após o último caractere digitado
 *    - Evita chamadas desnecessárias à API
 * 
 * 2. VALIDAÇÃO:
 *    - Só busca se query tem pelo menos 3 caracteres
 * 
 * 3. FORMATAÇÃO DOS RESULTADOS:
 *    - Prioriza formato: "Rua, Cidade - Estado"
 *    - Fallback: "Cidade - Estado"
 *    - Último fallback: place_name original
 * 
 * 4. PARÂMETROS DA API:
 *    - Autocomplete: true
 *    - País: BR (Brasil)
 *    - Tipos: address, place
 *    - Limite: 5 resultados
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - DEBOUNCE: Reduz chamadas API durante digitação
 * - FORMATAÇÃO AMIGÁVEL: Extrai rua, cidade e estado para exibição limpa
 * - TRATAMENTO DE ERRO: Console.error silencioso (não quebra UI)
 * - LIMPEZA: ClearTimeout no cleanup
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - OriginVehicleStep: Componente que utiliza este hook
 * - Mapbox API: Serviço de geocodificação
 * 
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const suggestions = useMapboxSuggestions(query);
 * 
 * return (
 *   <div>
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Digite um endereço..."
 *     />
 *     {suggestions.length > 0 && (
 *       <ul>
 *         {suggestions.map((suggestion, idx) => (
 *           <li key={idx}>{suggestion}</li>
 *         ))}
 *       </ul>
 *     )}
 *   </div>
 * );
 * ```
 */

export function useMapboxSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    // Validação: query com menos de 3 caracteres não busca
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

        // Formata os resultados para exibição amigável
        const places =
          data.features?.map((f) => {
            const context = f.context ?? [];

            // Extrai cidade e estado do contexto
            const city = context.find((c) => c.id.includes('place'))?.text;
            const state = context.find((c) => c.id.includes('region'))?.text;
            const street = f.text; // nome da rua/avenida

            // Formatação: prioriza rua + cidade + estado
            if (street && city && state) return `${street}, ${city} - ${state}`;
            if (city && state) return `${city} - ${state}`;
            
            // Fallback: place_name original
            return f.place_name;
          }) ?? [];

        setSuggestions(places);
      } catch (err) {
        console.error('Erro ao buscar sugestões do Mapbox:', err);
      }
    };

    // Debounce de 400ms para evitar chamadas excessivas
    const timeout = setTimeout(fetchSuggestions, 400);
    
    return () => clearTimeout(timeout);
  }, [query, MAPBOX_TOKEN]);

  return suggestions;
}