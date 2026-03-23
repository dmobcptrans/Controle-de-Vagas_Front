'use client';

import { createContext, useContext, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const MapContext = createContext<mapboxgl.Map | null>(null);

/**
 * @component MapProvider
 * @version 1.0.0
 * 
 * @description Provider para compartilhar uma instância única do mapa Mapbox GL.
 * Cria um mapa em um container temporário para uso global na aplicação.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. INSTÂNCIA ÚNICA:
 *    - Cria uma única instância do mapa no provider
 *    - Compartilhada entre todos os componentes filhos
 * 
 * 2. CONTAINER TEMPORÁRIO:
 *    - Cria um div temporário para inicialização
 *    - O mapa será posteriormente reanexado ao container real
 * 
 * 3. CONFIGURAÇÃO:
 *    - Centro: Petrópolis (-43.1757, -22.5101)
 *    - Zoom: 13
 *    - Estilo: mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - CONTAINER TEMPORÁRIO: Permite criar o mapa antes de ter o container real
 * - SINGLETON: Uma única instância para toda aplicação (evita múltiplos mapas)
 * - REUTILIZAÇÃO: O mapa pode ser reanexado a diferentes containers
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useGlobalMap: Hook para acessar o mapa
 * - ViewMap: Componente que utiliza o mapa global
 * - MapReserva: Componente que utiliza o mapa global
 * 
 * @example
 * ```tsx
 * // Provider no layout
 * <MapProvider>
 *   <App />
 * </MapProvider>
 * 
 * // Uso do hook
 * const map = useGlobalMap();
 * 
 * useEffect(() => {
 *   if (map) {
 *     // Adicionar marcadores, camadas, etc.
 *   }
 * }, [map]);
 * ```
 */

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      mapboxgl.accessToken = token!;
      
      // Cria mapa em container temporário
      mapRef.current = new mapboxgl.Map({
        container: document.createElement('div'), // container temporário
        style: 'mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb',
        center: [-43.1757, -22.5101],
        zoom: 13,
      });
    }

    return () => {};
  }, []);

  return (
    <MapContext.Provider value={mapRef.current}>{children}</MapContext.Provider>
  );
}

/**
 * @hook useGlobalMap
 * @description Hook para acessar a instância global do mapa
 * @returns Instância do mapa Mapbox GL ou null
 */
export function useGlobalMap() {
  return useContext(MapContext);
}