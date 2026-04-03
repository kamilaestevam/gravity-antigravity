import type { ReactNode } from 'react'

// ── Coluna ────────────────────────────────────────────────────────────────────

export interface KanbanColunaDef {
  /** Identificador único da coluna — deve corresponder ao valor em KanbanItem.colunaKey */
  key: string
  /** Label exibido no cabeçalho */
  label: string
  /** Cor hex usada no badge de contagem e nos destaques visuais */
  color: string
  /** Ícone Phosphor opcional para o cabeçalho */
  icon?: ReactNode
}

// ── Item ──────────────────────────────────────────────────────────────────────

export interface KanbanItem {
  /** Identificador único do item */
  id: string
  /**
   * Chave da coluna onde este item se encontra.
   * Deve corresponder a um KanbanColunaDef.key.
   */
  colunaKey: string
}

// ── Ordenação ─────────────────────────────────────────────────────────────────

export type KanbanSortKey = 'newest' | 'oldest' | 'alpha'

export interface KanbanSortOpcao {
  value: KanbanSortKey
  label: string
}

// ── Props do componente principal ─────────────────────────────────────────────

export interface KanbanGlobalProps<T extends KanbanItem = KanbanItem> {
  /** Definição das colunas (ordem e visual) */
  colunas: KanbanColunaDef[]
  /**
   * Itens já filtrados pelo pai.
   * O pai é responsável por aplicar busca/filtros antes de passar.
   */
  itens: T[]
  /**
   * Renderiza o conteúdo visual do card.
   * isDragging = true quando o card está sendo arrastado (use para ajuste visual no DragOverlay).
   */
  renderCard: (item: T, isDragging: boolean) => ReactNode
  /**
   * Chamado quando o usuário arrasta um item para outra coluna.
   * Se não fornecido, o kanban fica em modo somente-leitura.
   */
  onMoverItem?: (itemId: string, novaColunaKey: string) => void
  /** Oculta os drag handles e desabilita arrastar */
  isReadOnly?: boolean
  /** Texto exibido no empty state de cada coluna */
  emptyLabel?: string
  /**
   * Extrai um label texto do item — usado para ordenação alfabética por coluna.
   * Se não fornecido, ordenação 'alpha' não faz efeito.
   */
  getItemLabel?: (item: T) => string
  /**
   * Extrai a data do item — usada para ordenações newest/oldest.
   * Retorna ISO string ou Date.
   */
  getItemDate?: (item: T) => string | Date | undefined
}
