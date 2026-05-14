/**
 * useMoedasPedido.ts — Helper que envelopa `useMoedas()` do nucleo-global
 * formatando como `CODIGO — Nome` (decisão UX 2026-05-12, padrão global Gravity
 * para todos os dropdowns de catálogo).
 *
 * SSOT: lista vem de `cadastros.moeda` via /api/v1/cadastros/moedas.
 * Substitui o array hardcoded `OPCOES_MOEDA_PEDIDO` de
 * shared/kind-ui-pedido.ts (removido neste commit).
 *
 * Mandamento 06+09: Zod do useMoedas garante contrato bilateral com
 * Cadastros. Aqui só transformamos a saída em `GTOpcao` (formato do select).
 *
 * Espelho do `useIncotermsPedido.ts` — mesma estrutura, mesmo padrão de uso.
 */
import { useMemo } from 'react'
// Path relativo (não alias) — fallback para garantir resolução em qualquer
// configuração do Vite. Quando o monorepo migrar para workspace gerenciado,
// voltar a usar `@nucleo/modal-tabela-moeda`.
import {
  useMoedas,
  type Moeda,
} from '../../../../../../nucleo-global/Modais/modal-tabela-moeda/src/useMoedas'

export interface GTOpcaoMoeda {
  valor: string
  label: string
}

function formatarLabel(m: Moeda): string {
  return `${m.codigo_moeda} — ${m.nome_moeda}`
}

export interface UseMoedasPedidoResult {
  /** Todas as moedas ativas (já ordenadas com prioridade UX no nucleo). */
  moedasOpcoes: GTOpcaoMoeda[]
  loading: boolean
  erro: string | null
}

export function useMoedasPedido(): UseMoedasPedidoResult {
  const { moedas, loading, erro } = useMoedas()

  return useMemo(() => ({
    moedasOpcoes: moedas.map((m) => ({
      valor: m.codigo_moeda,
      label: formatarLabel(m),
    })),
    loading,
    erro,
  }), [moedas, loading, erro])
}
