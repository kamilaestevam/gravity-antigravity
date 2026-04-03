import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { KanbanColunaDef, KanbanItem } from './tipos'

// ── Contrato do contexto interno ──────────────────────────────────────────────

export interface KanbanContextValue {
  /** Colunas visíveis (já filtrada por colunasVisiveis) */
  colunas: KanbanColunaDef[]
  /** Renderizador de card delegado ao consumidor */
  renderCard: (item: KanbanItem, isDragging: boolean) => ReactNode
  /** isReadOnly global — combina prop + ausência de onMoverItem */
  isReadOnly: boolean
  /** Texto do empty state por coluna */
  emptyLabel: string
  /** ID do item sendo arrastado (null se nenhum) */
  activeId: string | null
  /** ID do item em processo de move assíncrono (otimista pendente) */
  movingId: string | null
  /** Prefixo para data-testid — default 'kg' */
  testIdPrefix: string
  /** Modo visão global cross-tenant — exibe tenantLabel nos cards */
  modoGlobal: boolean
  /** Slot de rodapé por coluna, ex: botão "+ Adicionar" */
  colunaFooterSlot?: (coluna: KanbanColunaDef) => ReactNode
  /**
   * Move item para nova coluna com update otimista interno.
   * Já inclui rollback automático se a Promise rejeitar.
   */
  onMoverItemInternal: (itemId: string, novaColunaKey: string) => Promise<void>
  /** Clique no card (sem arrastar) */
  onCardClick?: (item: KanbanItem) => void
}

export const KanbanContext = createContext<KanbanContextValue | null>(null)

export function useKanban(): KanbanContextValue {
  const ctx = useContext(KanbanContext)
  if (!ctx) throw new Error('useKanban deve ser usado dentro de <KanbanGlobal>')
  return ctx
}
