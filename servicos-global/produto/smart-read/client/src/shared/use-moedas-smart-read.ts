/**
 * useMoedasSmartRead — SSOT cadastros.moeda para selects na lista Smart Docs.
 * Paridade Pedido (`useMoedasPedido`).
 */
import { useMemo } from 'react'
import {
  useMoedas,
  type Moeda,
} from '../../../../../../nucleo-global/Modais/modal-tabela-moeda/src/useMoedas'
import type { OpcaoMoedaListaSmartRead } from './colunas-lista-leitura-smart-read'

function formatarRotuloMoeda(m: Moeda): string {
  return `${m.codigo_moeda} — ${m.nome_moeda}`
}

export function useMoedasSmartRead(): {
  moedasOpcoes: OpcaoMoedaListaSmartRead[]
  loading: boolean
  erro: string | null
} {
  const { moedas, loading, erro } = useMoedas()

  return useMemo(
    () => ({
      moedasOpcoes: moedas.map((m) => ({
        valor: m.codigo_moeda,
        label: formatarRotuloMoeda(m),
      })),
      loading,
      erro,
    }),
    [moedas, loading, erro],
  )
}
