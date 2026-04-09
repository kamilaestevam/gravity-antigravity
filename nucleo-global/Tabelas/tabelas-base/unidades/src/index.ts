/**
 * @nucleo/tabelas-base-unidades
 * Unidades de medida do Siscomex — fonte única de verdade para todo o ecossistema Gravity.
 * Fonte: Portal Único Siscomex
 */

export interface UnidadeMedida {
  codigo: number | null
  sigla: string
  descricao: string
  rotulo: string
}

export const UNIDADES_SISCOMEX: UnidadeMedida[] = [
  { codigo: 10,   sigla: 'KG',    descricao: 'Quilograma',       rotulo: 'KG — Quilograma' },
  { codigo: 24,   sigla: 'KGBR',  descricao: 'Quilograma Bruto', rotulo: 'KGBR — Quilograma Bruto' },
  { codigo: 11,   sigla: 'UNID',  descricao: 'Unidade',          rotulo: 'UNID — Unidade' },
  { codigo: 12,   sigla: 'MIL',   descricao: 'Milheiro',         rotulo: 'MIL — Milheiro' },
  { codigo: 13,   sigla: 'PARES', descricao: 'Pares',            rotulo: 'PARES — Pares' },
  { codigo: 14,   sigla: 'M',     descricao: 'Metro',            rotulo: 'M — Metro' },
  { codigo: 15,   sigla: 'M2',    descricao: 'Metro Quadrado',   rotulo: 'M² — Metro Quadrado' },
  { codigo: 16,   sigla: 'M3',    descricao: 'Metro Cúbico',     rotulo: 'M³ — Metro Cúbico' },
  { codigo: 17,   sigla: 'LT',    descricao: 'Litro',            rotulo: 'LT — Litro' },
  { codigo: 18,   sigla: 'MKW',   descricao: 'Megawatt-hora',    rotulo: 'MKW — Megawatt-hora' },
  { codigo: 19,   sigla: 'QUILT', descricao: 'Quilate',          rotulo: 'QUILT — Quilate' },
  { codigo: 20,   sigla: 'DUZIA', descricao: 'Dúzia',            rotulo: 'DUZIA — Dúzia' },
  { codigo: 21,   sigla: 'TON',   descricao: 'Tonelada',         rotulo: 'TON — Tonelada' },
  { codigo: 22,   sigla: 'G',     descricao: 'Grama',            rotulo: 'G — Grama' },
  { codigo: 23,   sigla: 'BUI',   descricao: 'Bushel',           rotulo: 'BUI — Bushel' },
  { codigo: null, sigla: 'JOGO',  descricao: 'Jogo / Conjunto',  rotulo: 'JOGO — Jogo / Conjunto' },
]

/** Para uso em SelectGlobal — rotulo = sigla (compacto no gatilho), descricao = nome completo (visível na lista) */
export const OPCOES_UOM = UNIDADES_SISCOMEX.map(u => ({
  valor: u.sigla,
  rotulo: u.sigla,
  descricao: u.descricao,
}))

/** Subconjunto de unidades de peso */
export const UNIDADES_PESO = UNIDADES_SISCOMEX.filter(u =>
  ['KG', 'KGBR', 'G', 'TON'].includes(u.sigla)
)
