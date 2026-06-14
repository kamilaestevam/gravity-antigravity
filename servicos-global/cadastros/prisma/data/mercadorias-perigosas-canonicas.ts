/**
 * SSOT — amostra canônica da lista ONU (Orange Book).
 * Seed completo pode ser expandido pelo Coordenador via script dedicado.
 */

export type MercadoriaPerigosaCanonica = {
  numero_onu: string
  nome_tecnico_embarque: string
  nome_ingles: string
  classe: number
  divisao?: string
  grupo_embalagem?: 'I' | 'II' | 'III'
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()
}

export function nomeAsciiMercadoriaPerigosa(nome: string): string {
  return semAcento(nome)
}

/** Entradas frequentes em cotação de frete internacional (marítimo/aéreo/rodoviário). */
export const MERCADORIAS_PERIGOSAS_CANONICAS: MercadoriaPerigosaCanonica[] = [
  { numero_onu: '1203', nome_tecnico_embarque: 'GASOLINA', nome_ingles: 'GASOLINE', classe: 3, grupo_embalagem: 'II' },
  { numero_onu: '1170', nome_tecnico_embarque: 'ETANOL', nome_ingles: 'ETHANOL', classe: 3, grupo_embalagem: 'II' },
  { numero_onu: '1830', nome_tecnico_embarque: 'ACIDO SULFURICO', nome_ingles: 'SULPHURIC ACID', classe: 8, grupo_embalagem: 'II' },
  { numero_onu: '1789', nome_tecnico_embarque: 'ACIDO CLORIDRICO', nome_ingles: 'HYDROCHLORIC ACID', classe: 8, grupo_embalagem: 'II' },
  { numero_onu: '1017', nome_tecnico_embarque: 'CLORO', nome_ingles: 'CHLORINE', classe: 2, divisao: '3' },
  { numero_onu: '1072', nome_tecnico_embarque: 'OXIGENIO COMPRIMIDO', nome_ingles: 'OXYGEN, COMPRESSED', classe: 2, divisao: '2' },
  { numero_onu: '1950', nome_tecnico_embarque: 'AEROSSOIS', nome_ingles: 'AEROSOLS', classe: 2, divisao: '1' },
  { numero_onu: '3480', nome_tecnico_embarque: 'BATERIAS DE IONS DE LITIO', nome_ingles: 'LITHIUM ION BATTERIES', classe: 9 },
  { numero_onu: '3481', nome_tecnico_embarque: 'BATERIAS DE IONS DE LITIO CONTIDAS EM EQUIPAMENTO', nome_ingles: 'LITHIUM ION BATTERIES CONTAINED IN EQUIPMENT', classe: 9 },
  { numero_onu: '2794', nome_tecnico_embarque: 'BATERIAS ACIDAS UMIDAS', nome_ingles: 'BATTERIES, WET, FILLED WITH ACID', classe: 8, grupo_embalagem: 'III' },
  { numero_onu: '1993', nome_tecnico_embarque: 'LIQUIDO INFLAMAVEL N.E.', nome_ingles: 'FLAMMABLE LIQUID, N.O.S.', classe: 3, grupo_embalagem: 'III' },
  { numero_onu: '1866', nome_tecnico_embarque: 'SOLUCAO DE RESINA', nome_ingles: 'RESIN SOLUTION', classe: 3, grupo_embalagem: 'III' },
  { numero_onu: '3082', nome_tecnico_embarque: 'SUBSTANCIA LIQUIDA PERIGOSA AO MEIO AMBIENTE N.E.', nome_ingles: 'ENVIRONMENTALLY HAZARDOUS SUBSTANCE, LIQUID, N.O.S.', classe: 9, grupo_embalagem: 'III' },
  { numero_onu: '1263', nome_tecnico_embarque: 'TINTA', nome_ingles: 'PAINT', classe: 3, grupo_embalagem: 'III' },
  { numero_onu: '1090', nome_tecnico_embarque: 'ACETONA', nome_ingles: 'ACETONE', classe: 3, grupo_embalagem: 'II' },
  { numero_onu: '1230', nome_tecnico_embarque: 'METANOL', nome_ingles: 'METHANOL', classe: 3, grupo_embalagem: 'II' },
  { numero_onu: '2814', nome_tecnico_embarque: 'INFECCIOSO SUBSTANCIA AFETANDO HUMANOS', nome_ingles: 'INFECTIOUS SUBSTANCE, AFFECTING HUMANS', classe: 6, divisao: '2' },
  { numero_onu: '2910', nome_tecnico_embarque: 'RADIOATIVO MATERIAL EXCEPTED PACKAGE', nome_ingles: 'RADIOACTIVE MATERIAL, EXCEPTED PACKAGE', classe: 7 },
  { numero_onu: '0335', nome_tecnico_embarque: 'FUMOS DE SEGURANCA', nome_ingles: 'SAFETY DEVICES', classe: 1, divisao: '4' },
  { numero_onu: '3269', nome_tecnico_embarque: 'POLIESTER RESIN KIT', nome_ingles: 'POLYESTER RESIN KIT', classe: 3, grupo_embalagem: 'III' },
]
