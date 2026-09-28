import {
  useEffect,
  useState,
} from 'react';

import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import {
  MAPBOX_DEFAULT_CENTER,
  MAPBOX_DEFAULT_ZOOM,
  MAPBOX_STYLE,
  MAPBOX_TOKEN,
} from '../config/mapbox';

import {
  MapboxSelectedPlace,
  UseMapboxProps,
} from '../types/map';

let globalMap: mapboxgl.Map | null = null;

function adjustGeocoder() {
  const wrapper = document.querySelector(
    '.mapboxgl-ctrl-top-left',
  ) as HTMLElement | null;

  const geocoderContainer = document.querySelector(
    '.mapboxgl-ctrl-geocoder',
  ) as HTMLElement | null;

  if (!wrapper || !geocoderContainer) {
    return;
  }

  geocoderContainer.classList.add('my-custom-geocoder');

  wrapper.style.width = '100%';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.position = 'absolute';
  wrapper.style.top = '10px';
  wrapper.style.left = '0';

  geocoderContainer.style.width = '80%';
  geocoderContainer.style.maxWidth = '800px';
  geocoderContainer.style.boxSizing = 'border-box';

  const input = geocoderContainer.querySelector(
    'input',
  ) as HTMLInputElement | null;

  if (input) {
    input.style.width = '100%';
  }
}

function moveMapToContainer(
  map: mapboxgl.Map,
  container: HTMLDivElement,
) {
  const mapContainer = map.getContainer();

  if (
    mapContainer !== container &&
    !container.contains(mapContainer)
  ) {
    mapContainer.parentNode?.removeChild(mapContainer);
    container.appendChild(mapContainer);
  }
}

export function useMapbox({
  containerRef,
  onSelectPlace,
  enableSearch = false,
  enableNavigation = false,
  enableGeolocate = false,
  expandSearch = false,
}: UseMapboxProps) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    /*
     * ============================================================
     * REUTILIZA MAPA EXISTENTE
     * ============================================================
     */

    if (globalMap) {
      moveMapToContainer(globalMap, container);

      globalMap.resize();

      setMap(globalMap);

      if (globalMap.isStyleLoaded()) {
        setMapLoaded(true);
      } else {
        const handleStyleLoad = () => {
          setMapLoaded(true);
        };

        globalMap.once('load', handleStyleLoad);

        return () => {
          globalMap?.off('load', handleStyleLoad);
        };
      }

      return;
    }

    /*
     * ============================================================
     * CRIA MAPA
     * ============================================================
     */

    const newMap = new mapboxgl.Map({
      container,
      style: MAPBOX_STYLE,
      center: MAPBOX_DEFAULT_CENTER,
      zoom: MAPBOX_DEFAULT_ZOOM,
    });

    globalMap = newMap;

    setMap(newMap);

    /*
     * ============================================================
     * CONTROLE DE NAVEGAÇÃO
     * ============================================================
     */

    if (enableNavigation) {
      newMap.addControl(
        new mapboxgl.NavigationControl(),
        'top-right',
      );
    }

    /*
     * ============================================================
     * CONTROLE DE GEOLOCALIZAÇÃO
     * ============================================================
     */

    if (enableGeolocate) {
      const geolocateControl =
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        });

      newMap.addControl(
        geolocateControl,
        'top-right',
      );
    }

    /*
     * ============================================================
     * GEOCODER
     * ============================================================
     */

    if (enableSearch) {
      const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        mapboxgl,
        marker: false,
        placeholder: 'Pesquisar endereço',
      });

      newMap.addControl(
        geocoder,
        'top-left',
      );

      geocoder.on('result', event => {
        const [lng, lat] =
          event.result.geometry.coordinates;

        const input = document.querySelector(
          '.mapboxgl-ctrl-geocoder input',
        ) as HTMLInputElement | null;

        input?.blur();

        const place: MapboxSelectedPlace = {
          id: event.result.id,
          place_name: event.result.place_name,
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        };

        onSelectPlace?.(place);

        newMap.flyTo({
          center: [lng, lat],
          zoom: 16,
        });
      });

      if (expandSearch) {
        requestAnimationFrame(() => {
          setTimeout(adjustGeocoder, 0);
        });
      }
    }

    /*
     * ============================================================
     * LOAD
     * ============================================================
     */

    const handleLoad = () => {
      setMapLoaded(true);

      if (expandSearch) {
        adjustGeocoder();
      }
    };

    newMap.once('load', handleLoad);

    /*
     * ============================================================
     * RESIZE
     * ============================================================
     */

    const handleResize = () => {
      globalMap?.resize();

      if (expandSearch) {
        adjustGeocoder();
      }
    };

    window.addEventListener(
      'resize',
      handleResize,
    );

    /*
     * ============================================================
     * CLEANUP
     * ============================================================
     */

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      );
    };
  }, [
    containerRef,
    onSelectPlace,
    enableSearch,
    enableNavigation,
    enableGeolocate,
    expandSearch,
  ]);

  return {
    map,
    mapLoaded,
  };
}