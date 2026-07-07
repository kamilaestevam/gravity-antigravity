export type PortoUpsertCadastros = {
  codigo_unlocode_porto: string
  codigo_pais_porto: string
  nome_porto: string
  nome_ascii_porto: string
  subdivisao_porto?: string
  latitude_porto?: number
  longitude_porto?: number
}

export const PORTOS_UPSERT_LEVA_OCEANIA_ORIENTE: PortoUpsertCadastros[] = [
  {
    codigo_unlocode_porto: 'OMKHS',
    codigo_pais_porto: 'OM',
    nome_porto: 'Khasab',
    nome_ascii_porto: 'Khasab',
    latitude_porto: 26.183333,
    longitude_porto: 56.25,
  },
  {
    codigo_unlocode_porto: 'KYGEC',
    codigo_pais_porto: 'KY',
    nome_porto: 'George Town',
    nome_ascii_porto: 'George Town',
    latitude_porto: 19.3,
    longitude_porto: -81.383333,
  },
  {
    codigo_unlocode_porto: 'VICHA',
    codigo_pais_porto: 'VI',
    nome_porto: 'Charlotte Amalie, Saint Thomas',
    nome_ascii_porto: 'Charlotte Amalie, Saint Thomas',
    latitude_porto: 18.341944,
    longitude_porto: -64.930833,
  },
  {
    codigo_unlocode_porto: 'VICTD',
    codigo_pais_porto: 'VI',
    nome_porto: 'Christiansted, Saint Croix',
    nome_ascii_porto: 'Christiansted, Saint Croix',
    latitude_porto: 17.75,
    longitude_porto: -64.75,
  },
]
