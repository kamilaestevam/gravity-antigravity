/** Unidades de Medida — Portal Único Siscomex
 * Fonte: documentos-tecnicos/Unidades de Medida Portal Único Siscomex.pdf
 */

export interface UnidadeMedida {
  codigo: number | null
  sigla: string
  descricao: string
  rotulo: string
}

export const UNIDADES_SISCOMEX: UnidadeMedida[] = [
  { codigo: 10,   sigla: 'KG',    descricao: 'Quilograma Líquido',                  rotulo: 'KG - Quilograma líquido' },
  { codigo: 24,   sigla: 'KGBR',  descricao: 'Quilograma Bruto',                    rotulo: 'KGBR - Quilograma bruto' },
  { codigo: 11,   sigla: 'UNID',  descricao: 'Número (Unidade)',                    rotulo: 'UNID - Unidade' },
  { codigo: 12,   sigla: 'MIL',   descricao: 'Milheiro',                            rotulo: 'MIL - Milheiro' },
  { codigo: 13,   sigla: 'PARES', descricao: 'Pares',                               rotulo: 'Pares' },
  { codigo: 14,   sigla: 'M',     descricao: 'Metro',                               rotulo: 'M - Metro' },
  { codigo: 15,   sigla: 'M2',    descricao: 'Metro Quadrado',                      rotulo: 'M² - Metro quadrado' },
  { codigo: 16,   sigla: 'M3',    descricao: 'Metro Cúbico',                        rotulo: 'M³ - Metro cúbico' },
  { codigo: 17,   sigla: 'LT',    descricao: 'Litro',                               rotulo: 'LT - Litro' },
  { codigo: 18,   sigla: 'MKW/H', descricao: 'Mil Quilowatt Hora',                  rotulo: 'MKW/H - Mil Quil/hora' },
  { codigo: 19,   sigla: 'QUILT', descricao: 'Quilate',                             rotulo: 'QUILT - Quilate' },
  { codigo: 20,   sigla: 'DUZIA', descricao: 'Dúzia',                               rotulo: 'Duzia' },
  { codigo: 21,   sigla: 'TON',   descricao: 'Tonelada Métrica Líquida',            rotulo: 'TON - Tonelada Métrica' },
  { codigo: 22,   sigla: 'G',     descricao: 'Grama Líquido',                       rotulo: 'G - Grama líquido' },
  { codigo: 23,   sigla: 'BUI',   descricao: 'Bilhões de Unidades Internacionais',  rotulo: 'BUI - Bilhões' },
  { codigo: null, sigla: 'JOGO',  descricao: 'Jogo',                               rotulo: 'Jogo' },
]

/** Opções completas para SelectGlobal (valor + rotulo) */
export const OPCOES_UOM = UNIDADES_SISCOMEX.map(u => ({
  valor: u.sigla,
  rotulo: u.rotulo,
}))

/** Opções completas para GTColuna.unidades (tabela virtual) */
export const UNIDADES_SISCOMEX_OPCOES = UNIDADES_SISCOMEX.map(u => ({
  sigla: u.sigla,
  rotulo: u.rotulo,
}))

/** Unidades de peso para GTColuna.unidades */
export const UNIDADES_PESO = UNIDADES_SISCOMEX
  .filter(u => ['KG', 'KGBR', 'G', 'TON'].includes(u.sigla))
  .map(u => ({ sigla: u.sigla, rotulo: u.rotulo }))
