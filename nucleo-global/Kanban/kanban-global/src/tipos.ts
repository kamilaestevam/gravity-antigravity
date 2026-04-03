import type { ReactNode } from 'react'

// ── Coluna ────────────────────────────────────────────────────────────────────

export interface KanbanColunaDef {
  /** Identificador único — deve corresponder ao valor em KanbanItem.colunaKey */
  key: string
  /** Label exibido no cabeçalho */
  label: string
  /** Cor hex usada no badge, hints e WIP badge */
  color: string
  /** Ícone Phosphor opcional para o cabeçalho */
  icon?: ReactNode
  /** Limite WIP — exibe badge vermelho quando itens.length > limiteWip */
  limiteWip?: number
  /** Coluna pode ser colapsada pelo usuário (oculta cards, mantém header) */
  colapsavel?: boolean
  /** Esta coluna não aceita drops nem permite arrastar de dentro dela */
  isReadOnly?: boolean
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
  /** Posição para ordenação estável e reorder em batch */
  posicao?: number
  /** Para visão global cross-tenant: ID da empresa */
  tenantId?: string
  /** Para visão global: label da empresa exibido no card */
  tenantLabel?: string
  /** Para visão global: cor de acento da empresa */
  tenantColor?: string
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
  /** Itens a exibir. Filtro externo via filterFn ou pelo pai antes de passar. */
  itens: T[]
  /**
   * Renderiza o conteúdo visual do card.
   * isDragging = true quando o card está no DragOverlay (use para ajuste visual).
   */
  renderCard: (item: T, isDragging: boolean) => ReactNode
  /**
   * Chamado quando o usuário move um item para outra coluna.
   * Suporta Promise — o componente faz update otimista e reverte automaticamente se rejeitar.
   * posicao = índice de destino na nova coluna.
   */
  onMoverItem?: (itemId: string, novaColunaKey: string, posicao: number) => void | Promise<void>
  /** Callback de clique no card (sem arrastar) */
  onCardClick?: (item: T) => void
  /** Oculta drag handles e desabilita arrastar */
  isReadOnly?: boolean
  /** Texto exibido no empty state de cada coluna. Default: 'Nenhum item' */
  emptyLabel?: string
  /**
   * Extrai um label texto do item — usado para ordenação alfabética por coluna.
   * Se não fornecido, ordenação 'alpha' usa item.id.
   */
  getItemLabel?: (item: T) => string
  /**
   * Extrai a data do item — usada para ordenações newest/oldest.
   * Retorna ISO string ou Date.
   */
  getItemDate?: (item: T) => string | Date | undefined
  /** Filtro interno opcional — aplicado antes de distribuir nas colunas */
  filterFn?: (item: T) => boolean
  /** Exibe skeleton de carregamento em todas as colunas */
  isLoading?: boolean
  /** Quantos cards-skeleton por coluna quando isLoading=true. Default: 3 */
  skeletonCount?: number
  /** Mostra apenas estas colunas (por key) — útil para controle de permissões */
  colunasVisiveis?: string[]
  /** Slot acima do board (busca, filtros, botão "Novo") */
  toolbarSlot?: ReactNode
  /** Slot no rodapé de cada coluna, ex: botão "+ Adicionar" */
  colunaFooterSlot?: (coluna: KanbanColunaDef) => ReactNode
  /** Prefixo para data-testid. Default: 'kg' */
  testIdPrefix?: string
  /**
   * Ativa modo visão global cross-tenant.
   * Exibe tenantLabel nos cards como badge de empresa.
   */
  modoGlobal?: boolean
}
