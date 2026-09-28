const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN não definido');
}

export const MAPBOX_TOKEN: string = token;

export const MAPBOX_STYLE =
  'mapbox://styles/jusenx/cmg9pmy5d006b01s2959hdkmb';

export const MAPBOX_DEFAULT_CENTER: [number, number] = [
  -43.17572436276286,
  -22.5101573150628,
];

export const MAPBOX_DEFAULT_ZOOM = 13;