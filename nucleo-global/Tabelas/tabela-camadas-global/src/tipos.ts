/**
 * @nucleo/tabela-camadas-global — tipos
 * Tabela com suporte a linhas pai/filho expansíveis (tree table).
 */

import type { ReactNode } from 'react'

// ─── Coluna ────────────────────────────────────────────────────────────────────

export type TCGTipo = 'texto' | 'numero' | 'periodo' | 'badge' | 'custom'

export interface TCGColuna<T = any> {
  key: string
  label: string
  /** Tipo do dado — define o modo de filtro: texto → lista, numero → intervalo, periodo → datas */
  tipo?: TCGTipo
  align?: 'left' | 'center' | 'right'
  tooltipTitulo?: string
  tooltipDescricao?: string
  render?: (valor: any, item: T) => ReactNode
  oculta?: boolean
  naoOcultavel?: boolean
  /** Exibe o ícone de filtro no cabeçalho desta coluna */
  filtravel?: boolean
  /** Permite ordenação por esta coluna */
  sortavel?: boolean
  largura?: string | number
}

// ─── Ação de linha ─────────────────────────────────────────────────────────────

export interface TCGAcao<T = any> {
  id: string
  tooltip?: string
  icone?: ReactNode
  renderCustom?: (item: T) => ReactNode
  onClick?: (item: T) => void
}

// ─── Ação de exportação ────────────────────────────────────────────────────────

export interface TCGAcaoExport<T = any> {
  label: string
  icone?: ReactNode
  /** Recebe os dados filtrados/visíveis no momento da exportação */
  onClick: (dados: T[]) => void
}

// ─── Ações em lote ─────────────────────────────────────────────────────────────

export interface TCGAcaoLote<T = any> {
  id: string
  label: string
  icone?: ReactNode
  variant?: 'default' | 'danger'
  onClick: (itens: T[]) => void
}

// ─── Props principais ──────────────────────────────────────────────────────────

export interface TabelaCamadasGlobalProps<T = any, C = any> {
  dados: T[]
  colunas: TCGColuna<T>[]
  colunasFilhas: TCGColuna<C>[]
  filhos: (item: T) => C[]
  acoes?: TCGAcao<T>[]
  acoesFilhas?: TCGAcao<C>[]
  acoesExportacao?: TCGAcaoExport<T>[]
  placeholderBusca?: string
  campoBusca?: keyof T
  mensagemVazio?: string
  carregando?: boolean
  expandidosPadrao?: string[]
  itemId?: (item: T) => string
  itensPorPagina?: number
  /** ID único para persistência de colunas (localStorage) */
  id?: string
  /** Ações em lote — ativa checkboxes de seleção */
  acoesLote?: TCGAcaoLote<T>[]
  /** Slot de ações no toolbar (ex: botão "Novo") */
  acoesBarra?: ReactNode
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}
