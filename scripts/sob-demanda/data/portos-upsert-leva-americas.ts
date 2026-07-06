/**
 * Portos da leva Américas ausentes do import UN/LOCODE no Cadastros (dev).
 * Nomes e coordenadas conforme UN/LOCODE 2025-1 (UNECE).
 */
export type PortoUpsertCadastros = {
  codigo_unlocode_porto: string
  codigo_pais_porto: string
  nome_porto: string
  nome_ascii_porto: string
  subdivisao_porto?: string
  latitude_porto?: number
  longitude_porto?: number
}

export const PORTOS_UPSERT_LEVA_AMERICAS: PortoUpsertCadastros[] = [
  {
    codigo_unlocode_porto: 'KNBAS',
    codigo_pais_porto: 'KN',
    nome_porto: 'Basseterre, Saint Kitts',
    nome_ascii_porto: 'Basseterre, Saint Kitts',
    latitude_porto: 17.3,
    longitude_porto: -62.716667,
  },
  {
    codigo_unlocode_porto: 'BSFPO',
    codigo_pais_porto: 'BS',
    nome_porto: 'Freeport, Grand Bahama',
    nome_ascii_porto: 'Freeport, Grand Bahama',
    subdivisao_porto: 'FP',
    latitude_porto: 26.533333,
    longitude_porto: -78.7,
  },
]
