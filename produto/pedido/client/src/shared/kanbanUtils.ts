/**
 * kanbanUtils.ts — Lógica pura de colunas do Kanban de Pedidos
 *
 * Separado de KanbanPedidos.tsx para permitir testes unitários sem precisar
 * importar componentes React pesados (@nucleo/kanban-global, @phosphor-icons).
 */

import type { PedidoStatusConfig } from './types'

/** Nomes de status que são somente-leitura no Kanban (drop desativado) */
export const IS_READ_ONLY_MAP: Record<string, true> = { cancelado: true }

/** Shape de uma coluna do Kanban (sem ícone — ícone é responsabilidade do componente) */
export interface KanbanColunaShape {
  key: string
  label: string
  color: string
  isReadOnly?: true
}

/** Colunas fallback usadas quando a API falha (degradação graciosa).
 *  Nomes = mesmo STATUS_PADRAO do servidor (auto-seed). */
export const COLUNAS_FALLBACK_SHAPE: KanbanColunaShape[] = [
  { key: 'rascunho',      label: 'Rascunho',     color: '#94a3b8' },
  { key: 'aberto',        label: 'Aberto',        color: '#3b82f6' },
  { key: 'em_andamento',  label: 'Em Andamento',  color: '#f97316' },
  { key: 'aprovado',      label: 'Aprovado',      color: '#facc15' },
  { key: 'transferencia', label: 'Transferido',   color: '#2dd4bf' },
  { key: 'consolidado',   label: 'Consolidado',   color: '#a78bfa' },
  { key: 'cancelado',     label: 'Cancelado',     color: '#ef4444', isReadOnly: true },
]

/**
 * Computa as colunas do Kanban a partir do statusConfig da API.
 * - Vazio → retorna COLUNAS_FALLBACK_SHAPE
 * - Com dados → ordena por `ordem`, mapeia label/color da API, aplica isReadOnly do map
 */
export function computarColunasKanban(statusConfig: PedidoStatusConfig[]): KanbanColunaShape[] {
  if (!statusConfig.length) return COLUNAS_FALLBACK_SHAPE

  return statusConfig
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map(s => {
      const readOnly = IS_READ_ONLY_MAP[s.nome]
      return {
        key:        s.nome,
        label:      s.rotulo,
        color:      s.cor,
        ...(readOnly ? { isReadOnly: true as const } : {}),
      }
    })
}
