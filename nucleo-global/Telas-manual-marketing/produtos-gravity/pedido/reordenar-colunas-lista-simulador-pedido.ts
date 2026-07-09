import type { ColunaListaSimuladorPedido } from './colunas-lista-simulador-pedido'

export type LadoDropColuna = 'before' | 'after'

export function reordenarColunasListaSimulador(
  colunas: ColunaListaSimuladorPedido[],
  fromId: string,
  toId: string,
  lado: LadoDropColuna,
): ColunaListaSimuladorPedido[] {
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

export function resolverLadoDropColuna(
  e: React.DragEvent<HTMLElement>,
  horizontal = true,
): LadoDropColuna {
  const rect = e.currentTarget.getBoundingClientRect()
  if (horizontal) {
    const mid = rect.left + rect.width / 2
    return e.clientX < mid ? 'before' : 'after'
  }
  const mid = rect.top + rect.height / 2
  return e.clientY < mid ? 'before' : 'after'
}
