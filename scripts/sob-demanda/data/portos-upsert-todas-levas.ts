import type { PortoUpsertCadastros } from './portos-upsert-leva-oceania-oriente.js'
import { PORTOS_UPSERT_LEVA_AMERICAS } from './portos-upsert-leva-americas.js'
import { PORTOS_UPSERT_LEVA_OCEANIA_ORIENTE } from './portos-upsert-leva-oceania-oriente.js'

/**
 * Portos ausentes confirmados no import UN/LOCODE (todas as levas).
 * Siglas validadas contra UNECE UN/LOCODE 2025-1.
 */
export const PORTOS_UPSERT_LEVAS_ASIA_EUROPA_AFRICA: PortoUpsertCadastros[] = [
  { codigo_unlocode_porto: 'HKMUN', codigo_pais_porto: 'HK', nome_porto: 'Tuen Mun', nome_ascii_porto: 'Tuen Mun' },
  { codigo_unlocode_porto: 'VNLHP', codigo_pais_porto: 'VN', nome_porto: 'Lach Huyen', nome_ascii_porto: 'Lach Huyen' },
  { codigo_unlocode_porto: 'MYBTU', codigo_pais_porto: 'MY', nome_porto: 'Bintulu', nome_ascii_porto: 'Bintulu' },
  { codigo_unlocode_porto: 'MYKCH', codigo_pais_porto: 'MY', nome_porto: 'Kuching', nome_ascii_porto: 'Kuching' },
  { codigo_unlocode_porto: 'MYBKI', codigo_pais_porto: 'MY', nome_porto: 'Kota Kinabalu', nome_ascii_porto: 'Kota Kinabalu' },
  { codigo_unlocode_porto: 'IDBLW', codigo_pais_porto: 'ID', nome_porto: 'Belawan', nome_ascii_porto: 'Belawan' },
  { codigo_unlocode_porto: 'IDDUM', codigo_pais_porto: 'ID', nome_porto: 'Dumai', nome_ascii_porto: 'Dumai' },
  { codigo_unlocode_porto: 'IDBIT', codigo_pais_porto: 'ID', nome_porto: 'Bitung', nome_ascii_porto: 'Bitung' },
  { codigo_unlocode_porto: 'EGAAC', codigo_pais_porto: 'EG', nome_porto: 'El Arish', nome_ascii_porto: 'El Arish' },
  { codigo_unlocode_porto: 'SOBSA', codigo_pais_porto: 'SO', nome_porto: 'Bossaso', nome_ascii_porto: 'Bossaso' },
]

export const PORTOS_UPSERT_TODAS_LEVAS: PortoUpsertCadastros[] = [
  ...PORTOS_UPSERT_LEVA_AMERICAS,
  ...PORTOS_UPSERT_LEVA_OCEANIA_ORIENTE,
  ...PORTOS_UPSERT_LEVAS_ASIA_EUROPA_AFRICA,
]
