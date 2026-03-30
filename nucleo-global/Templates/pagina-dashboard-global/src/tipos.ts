import type { ReactNode } from 'react'

/**
 * Props do template PaginaDashboardGlobal.
 *
 * Compõe automaticamente: CabecalhoGlobal + grid de KPI cards + seções de conteúdo
 * dentro de um PaginaGlobal otimizado para dashboards.
 */
export interface PaginaDashboardProps {
  /* ─── Cabeçalho ─── */
  /** Título da página */
  titulo: string
  /** Subtítulo da página */
  subtitulo?: string
  /** Ícone do cabeçalho (Phosphor React element) */
  icone?: ReactNode
  /** Ações no canto direito do cabeçalho */
  acoes?: ReactNode
  /** Slot para view toggle */
  viewToggle?: ReactNode

  /* ─── KPIs ─── */
  /** Cards de KPI exibidos em grid no topo */
  kpis?: ReactNode

  /* ─── Toolbar ─── */
  /** Toolbar fixo (filtros de período, abas) */
  toolbar?: ReactNode

  /* ─── Conteúdo ─── */
  /** Conteúdo principal (gráficos, tabelas, seções) */
  children: ReactNode

  /** Classes extras no container raiz */
  className?: string
}
