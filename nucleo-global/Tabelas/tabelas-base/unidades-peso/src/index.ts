/**
 * @nucleo/tabelas-base-unidades-peso
 * Unidades de peso do Siscomex — fonte única de verdade para todo o ecossistema Gravity.
 * Fonte: Portal Único Siscomex
 */

export interface UnidadePeso {
  codigo: number
  sigla: string
  descricao: string
  rotulo: string
}

export const UNIDADES_PESO: UnidadePeso[] = [
  { codigo: 10, sigla: 'KG',   descricao: 'Quilograma',              rotulo: 'KG — Quilograma' },
  { codigo: 22, sigla: 'G',    descricao: 'Grama',                   rotulo: 'G — Grama' },
  { codigo: 21, sigla: 'TON',  descricao: 'Tonelada Métrica',        rotulo: 'TON — Tonelada Métrica' },
  { codigo: 24, sigla: 'KGBR', descricao: 'Quilograma Bruto',        rotulo: 'KGBR — Quilograma Bruto' },
]

/** Para uso em SelectGlobal — rotulo = sigla (compacto no gatilho), descricao = nome completo (visível na lista) */
export const OPCOES_PESO = UNIDADES_PESO.map(u => ({
  valor: u.sigla,
  rotulo: u.sigla,
  descricao: u.descricao,
}))

/** Para uso em GTColuna.unidades (tabela virtual) */
export const UNIDADES_PESO_OPCOES = UNIDADES_PESO.map(u => ({
  sigla: u.sigla,
  rotulo: u.rotulo,
}))
