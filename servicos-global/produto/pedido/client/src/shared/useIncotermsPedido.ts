/**
 * useIncotermsPedido.ts — Helper que envelopa `useIncoterms()` do nucleo-global
 * formatando como `SIGLA — Nome` (decisão UX 2026-05-12, padrão global Gravity
 * para todos os dropdowns de catálogo).
 *
 * SSOT: lista vem de `cadastros.incoterm` via /api/v1/cadastros/incoterms.
 * Substitui as 5 cópias hardcoded deletadas:
 *   - pedido/shared/kind-ui-pedido.ts (OPCOES_INCOTERM_PEDIDO)
 *   - pedido/client/components/ModalPedidoNovo.tsx (OPCOES_INCOTERM)
 *   - pedido/server/services/smartImportService.ts (linha 797)
 *   - (seed.ts e auditarSeed.ts permanecem — são scripts internos)
 *
 * Categoria de modal de transporte (maritimo|qualquer) pode ser filtrada
 * via opção — útil em flows que aceitam só marítimo.
 *
 * Mandamento 06+09: Zod do useIncoterms garante contrato bilateral com
 * Cadastros. Aqui só transformamos a saída em `GTOpcao` (formato do select).
 */
import { useMemo } from 'react'
// Path relativo (não alias) — fallback para garantir resolução em qualquer
// configuração do Vite (alias scan pode ficar stale após criar pacotes novos
// com dev server rodando; o cache não invalida sempre com restart).
// Quando o monorepo migrar para workspace gerenciado, voltar a usar
// `@nucleo/modal-tabela-incoterm`.
import {
  useIncoterms,
  type Incoterm,
  type ModalTransporte,
} from '../../../../../../nucleo-global/Modais/modal-tabela-incoterm/src/useIncoterms'

export interface GTOpcaoIncoterm {
  valor: string
  label: string
}

function formatarLabel(i: Incoterm): string {
  return `${i.codigo_incoterm} — ${i.nome_incoterm}`
}

export interface UseIncotermsPedidoResult {
  /** Todos os incoterms ativos (qualquer modal) — usado por default. */
  incotermsOpcoes: GTOpcaoIncoterm[]
  /** Apenas marítimos (FAS, FOB, CFR, CIF). */
  incotermsMaritimos: GTOpcaoIncoterm[]
  /** Apenas multimodais (EXW, FCA, CPT, CIP, DAP, DPU, DDP). */
  incotermsMultimodais: GTOpcaoIncoterm[]
  loading: boolean
  erro: string | null
}

function filtrarPorModal(incoterms: Incoterm[], modal: ModalTransporte): GTOpcaoIncoterm[] {
  return incoterms
    .filter((i) => i.modal_transporte === modal)
    .map((i) => ({ valor: i.codigo_incoterm, label: formatarLabel(i) }))
}

export function useIncotermsPedido(): UseIncotermsPedidoResult {
  const { incoterms, loading, erro } = useIncoterms()

  return useMemo(() => ({
    incotermsOpcoes: incoterms.map((i) => ({
      valor: i.codigo_incoterm,
      label: formatarLabel(i),
    })),
    incotermsMaritimos:   filtrarPorModal(incoterms, 'maritimo'),
    incotermsMultimodais: filtrarPorModal(incoterms, 'qualquer'),
    loading,
    erro,
  }), [incoterms, loading, erro])
}
