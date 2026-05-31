/**
 * Regra UX: visual "somente leitura" (texto muted) só quando a coluna inteira
 * não é editável no pai E no filho. Se o item ainda edita, a coluna permanece normal.
 */

import type { GTColuna, GTMapaColunasFilho } from './tipos'

/** Coluna editável no nível pai (config estática — função editavel = condicional por linha). */
export function colunaEditavelConfigPai(
  col: GTColuna<unknown>,
  camposEditaveis: string[],
): boolean {
  if (typeof col.editavel === 'function') return true
  return camposEditaveis.includes(col.key as string) || col.editavel === true
}

/** Coluna editável no nível filho (mapa tem prioridade sobre camposEditaveisFilhos). */
export function colunaEditavelConfigItem(
  col: GTColuna<unknown>,
  camposEditaveisFilhos: string[] | undefined,
  mapaColunasFilho: Record<string, GTMapaColunasFilho<unknown>> | undefined,
): boolean {
  const key = col.key as string
  const mapa = mapaColunasFilho?.[key]
  if (mapa) {
    const ev = mapa.editavel
    if (typeof ev === 'function') return true
    if (ev !== undefined) return !!ev
  }
  return camposEditaveisFilhos?.includes(key) ?? false
}

/**
 * Coluna bloqueada em todos os níveis da hierarquia.
 * Sem mapa/filhos (lista plana): basta o pai não ser editável.
 */
export function colunaSomenteLeituraCompleta(
  col: GTColuna<unknown>,
  camposEditaveis: string[],
  camposEditaveisFilhos: string[] | undefined,
  mapaColunasFilho: Record<string, GTMapaColunasFilho<unknown>> | undefined,
  temHierarquiaFilho: boolean,
): boolean {
  const paiEditavel = colunaEditavelConfigPai(col, camposEditaveis)
  if (!temHierarquiaFilho) return !paiEditavel
  const itemEditavel = colunaEditavelConfigItem(col, camposEditaveisFilhos, mapaColunasFilho)
  return !paiEditavel && !itemEditavel
}

export function deveAplicarVisualSomenteLeitura(
  col: GTColuna<unknown>,
  camposEditaveis: string[],
  camposEditaveisFilhos: string[] | undefined,
  mapaColunasFilho: Record<string, GTMapaColunasFilho<unknown>> | undefined,
  temHierarquiaFilho: boolean,
  podeEditar: boolean,
  semPermissao: boolean,
): boolean {
  if (podeEditar || semPermissao) return false
  return colunaSomenteLeituraCompleta(col, camposEditaveis, camposEditaveisFilhos, mapaColunasFilho, temHierarquiaFilho)
}
