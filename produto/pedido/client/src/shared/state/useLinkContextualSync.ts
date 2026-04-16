/**
 * useLinkContextualSync.ts
 *
 * Hook reativo que sincroniza a seleção do produto Pedido com o
 * shell store `linkContextual`. Quando o usuário seleciona um pedido
 * ou item na tabela, o link do sininho "Enviar Para" reflete
 * automaticamente o item selecionado em vez do pathname genérico.
 *
 * Prioridade:
 *   1. Item selecionado → /workspace/pedido/{pedidoId}/item/{itemId}
 *   2. Pedido selecionado (1 único) → /workspace/pedido/{pedidoId}
 *   3. Múltiplos pedidos → /workspace/pedido?ids={id1,id2,...}
 *   4. Nada selecionado → null (fallback para pathname)
 */

import { useEffect } from 'react'
import { useShellStore } from '@gravity/shell'
import { usePedidosSelecionados, useItensSelecionados } from './selecaoStore'

export function useLinkContextualSync(): void {
  const pedidos = usePedidosSelecionados()
  const itens = useItensSelecionados()
  const setLinkContextual = useShellStore((s) => s.setLinkContextual)

  useEffect(() => {
    // Item selecionado tem prioridade
    if (itens.length === 1) {
      const item = itens[0]
      setLinkContextual(`/workspace/pedido/${item.pedido_id}/item/${item.id}`)
      return
    }
    if (itens.length > 1) {
      const ids = itens.map((i) => i.id).join(',')
      setLinkContextual(`/workspace/pedido/itens?ids=${ids}`)
      return
    }

    // Pedido selecionado
    if (pedidos.length === 1) {
      setLinkContextual(`/workspace/pedido/${pedidos[0].id}`)
      return
    }
    if (pedidos.length > 1) {
      const ids = pedidos.map((p) => p.id).join(',')
      setLinkContextual(`/workspace/pedido?ids=${ids}`)
      return
    }

    // Nada selecionado — limpa para fallback para pathname
    setLinkContextual(null)
  }, [pedidos, itens, setLinkContextual])

  // Cleanup ao desmontar (saiu da tela de pedido)
  useEffect(() => {
    return () => setLinkContextual(null)
  }, [setLinkContextual])
}
