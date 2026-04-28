import type { ReactNode } from 'react'
import type { TabelaProps, RegistroTabela } from '../../../Tabelas/tabela-global/src/tipos.js'

/**
 * Props do template PaginaTabelaGlobal.
 *
 * Compõe automaticamente: CabecalhoGlobal + stats + toolbar + TabelaGlobal
 * dentro de um PaginaGlobal, sem precisar montar manualmente.
 */
export interface PaginaTabelaProps<T extends RegistroTabela = RegistroTabela> {
  /* ─── Cabeçalho ─── */
  /** Título da página */
  titulo: string
  /** Subtítulo da página */
  subtitulo?: string
  /** Ícone do cabeçalho (Phosphor React element) */
  icone?: ReactNode
  /** Botão de ação primária no canto direito do cabeçalho */
  acaoPrimaria?: ReactNode
  /** Slot para view toggle (lista/kanban/dashboard) */
  viewToggle?: ReactNode

  /* ─── Métricas ─── */
  /** Cards de estatísticas (CardEstatisticaGlobal) */
  stats?: ReactNode

  /* ─── Toolbar ─── */
  /** Toolbar fixo entre stats e tabela (abas, filtros rápidos) */
  toolbar?: ReactNode

  /* ─── Tabela ─── */
  /** Props da TabelaGlobal — passadas diretamente */
  tabela: TabelaProps<T>

  /** Classes extras no container raiz */
  className?: string
}
