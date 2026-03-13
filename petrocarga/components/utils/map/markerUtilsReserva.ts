import mapboxgl from 'mapbox-gl';
import { Vaga } from '@/lib/types/vaga';

function parseCoordinates(coord: string): [number, number] {
  const [lat, lng] = coord.split(',').map((v) => parseFloat(v.trim()));
  return [lng, lat];
}

export function addVagaMarkersReserva(
  map: mapboxgl.Map,
  vagas: Vaga[],
  markersRef: React.MutableRefObject<mapboxgl.Marker[]>,
  onClickVaga?: (vaga: Vaga) => void,
) {
  vagas.forEach((vaga) => {
    if (!vaga.referenciaGeoInicio) return;

    const isDisponivel = vaga.status === 'DISPONIVEL';

    const el = document.createElement('div');
    el.className = `
      vaga-marker w-6 h-6 rounded-full border-2 border-white shadow-lg
      ${
        isDisponivel
          ? 'bg-blue-500 cursor-pointer'
          : 'bg-red-500 opacity-60 cursor-not-allowed'
      }
    `;

    const coordinates = parseCoordinates(vaga.referenciaGeoInicio);

    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${vaga.endereco.logradouro}</strong><br/>${vaga.status}`,
        ),
      )
      .addTo(map);

    // Apenas se estiver disponível permite clique
    if (isDisponivel && onClickVaga) {
      el.addEventListener('click', () => onClickVaga(vaga));
    }

    markersRef.current.push(marker);
  });
}
