/**
 * useCambioSiscomexPedido — opções formatadas para selects do Pedido.
 * SSOT: cadastros.cambio_siscomex
 */
import { useMemo } from 'react'
import {
  useCambioSiscomex,
  type CambioSiscomex,
} from '../../../../../../nucleo-global/Modais/modal-tabela-cambio-siscomex/src/useCambioSiscomex'

export interface GTOpcaoCambioSiscomex {
  valor: string
  label: string
}

/** Rótulo de exibição — só descrição legível; código fica em `valor` (persistência/API). */
function formatarLabel(i: CambioSiscomex): string {
  return i.nome_cambio_siscomex
}

function paraOpcoes(itens: CambioSiscomex[]): GTOpcaoCambioSiscomex[] {
  return itens.map((i) => ({
    valor: i.codigo_cambio_siscomex,
    label: formatarLabel(i),
  }))
}

export interface UseCambioSiscomexPedidoResult {
  coberturaCambialOpcoes: GTOpcaoCambioSiscomex[]
  modalidadePagamentoOpcoes: GTOpcaoCambioSiscomex[]
  loading: boolean
  erro: string | null
}

export function useCambioSiscomexPedido(): UseCambioSiscomexPedidoResult {
  const { coberturaCambial, modalidadePagamento, loading, erro } = useCambioSiscomex()

  return useMemo(() => ({
    coberturaCambialOpcoes: paraOpcoes(coberturaCambial),
    modalidadePagamentoOpcoes: paraOpcoes(modalidadePagamento),
    loading,
    erro,
  }), [coberturaCambial, modalidadePagamento, loading, erro])
}

/** Resolve rótulo de exibição a partir do código armazenado no pedido. */
export function rotuloCambioSiscomex(
  codigo: string | null | undefined,
  opcoes: GTOpcaoCambioSiscomex[],
): string {
  if (!codigo) return '—'
  const hit = opcoes.find((o) => o.valor === codigo)
  return hit?.label ?? codigo
}
