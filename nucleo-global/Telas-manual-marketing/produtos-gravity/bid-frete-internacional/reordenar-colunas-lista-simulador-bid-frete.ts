import type { ColunaListaSimuladorBidFrete } from './colunas-lista-simulador-bid-frete'

export type LadoDropColuna = 'before' | 'after'

export function reordenarColunasListaSimuladorBidFrete(
  colunas: ColunaListaSimuladorBidFrete[],
  fromId: string,
  toId: string,
  lado: LadoDropColuna,
): ColunaListaSimuladorBidFrete[] {
  if (fromId === toId) return colunas

  const fromIdx = colunas.findIndex((c) => c.id === fromId)
  const toIdx = colunas.findIndex((c) => c.id === toId)
  if (fromIdx < 0 || toIdx < 0) return colunas

  const next = [...colunas]
  const [movida] = next.splice(fromIdx, 1)
  let insertIdx = next.findIndex((c) => c.id === toId)
  if (lado === 'after') insertIdx += 1
  next.splice(insertIdx, 0, movida)
  return next
}
