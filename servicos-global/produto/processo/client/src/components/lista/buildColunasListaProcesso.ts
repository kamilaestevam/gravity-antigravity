/**
 * buildColunasListaProcesso — cabeçalho unificado: colunas Processo (avô) + Pedido (pai).
 * Linhas de processo preenchem só colunas avô; colunas pedido ficam vazias (agregado).
 */
import type { TFunction } from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'
import { buildColunasAvo } from './ColunasAvo'
import { buildColunasPai, renderAgregado, type OpcoesUnidadesColunas } from './ColunasPai'

export function buildColunasListaProcesso(
  t: TFunction,
  opcoes: OpcoesUnidadesColunas,
): GTColuna<ProcessoAvoLinha>[] {
  const colunasAvo = buildColunasAvo(t)
  const chavesAvo = new Set(colunasAvo.map(c => c.key as string))

  const colunasPedido = buildColunasPai(t, opcoes)
    .filter(col => !chavesAvo.has(col.key as string))
    .map((col): GTColuna<ProcessoAvoLinha> => ({
      ...col,
      editavel: false,
      render: () => renderAgregado(null, false),
    }))

  return [...colunasAvo, ...colunasPedido]
}

export function chavesColunasAvo(t: TFunction): Set<string> {
  return new Set(buildColunasAvo(t).map(c => c.key as string))
}
