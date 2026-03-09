import mapboxgl from 'mapbox-gl';
import { Vaga } from '@/lib/types/vaga';

// Converte a String Localização em latitude e longitude
function parseCoordinates(coord: string): [number, number] {
  const [lat, lng] = coord.split(',').map((v) => parseFloat(v.trim()));
  return [lng, lat];
}

export function addVagaMarkers(
  map: mapboxgl.Map,
  vagas: Vaga[],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  onClickVaga?: (vaga: Vaga) => void,
) {
  vagas.forEach((vaga) => {
    if (!vaga.referenciaGeoInicio) return;

    const el = document.createElement('div');
    el.className =
      'vaga-marker w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer';

    const coordinates = parseCoordinates(vaga.referenciaGeoInicio);

    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${vaga.numeroEndereco}</strong><br/>${vaga.endereco.logradouro}, ${vaga.endereco.bairro}`,
        ),
      )
      .addTo(map);

    if (onClickVaga) {
      el.addEventListener('click', () => onClickVaga(vaga));
    }

    markersRef.current.push(marker);
  });
}
