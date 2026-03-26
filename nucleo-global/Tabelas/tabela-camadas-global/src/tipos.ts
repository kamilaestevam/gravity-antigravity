/**
 * @nucleo/tabela-camadas-global — tipos
 * Tabela com suporte a linhas pai/filho expansíveis (tree table).
 * Não modifica nem depende de TabelaGlobal.
 */

import type { ReactNode } from 'react'

// ─── Coluna ────────────────────────────────────────────────────────────────────

export interface TCGColuna<T = any> {
  /** Chave do campo no objeto */
  key: string
  /** Rótulo exibido no cabeçalho */
  label: string
  /** Tipo visual */
  tipo?: 'texto' | 'numero' | 'badge' | 'custom'
  /** Alinhamento da célula */
  align?: 'left' | 'center' | 'right'
  /** Tooltip título (aparece no ícone do cabeçalho) */
  tooltipTitulo?: string
  /** Tooltip descrição */
  tooltipDescricao?: string
  /** Renderizador customizado de célula */
  render?: (valor: any, item: T) => ReactNode
}

// ─── Ação de linha ─────────────────────────────────────────────────────────────

export interface TCGAcao<T = any> {
  id: string
  tooltip?: string
  icone?: ReactNode
  /** Renderizador completamente customizado (substitui o botão padrão) */
  renderCustom?: (item: T) => ReactNode
  onClick?: (item: T) => void
}

// ─── Ação de exportação ────────────────────────────────────────────────────────

export interface TCGAcaoExport {
  label: string
  icone?: ReactNode
  onClick: () => void
}

// ─── Props principais ──────────────────────────────────────────────────────────

export interface TabelaCamadasGlobalProps<T = any, C = any> {
  /** Dados das linhas pai (Organizações) */
  dados: T[]
  /** Colunas da linha pai */
  colunas: TCGColuna<T>[]
  /** Colunas da linha filha (Workspaces) */
  colunasFilhas: TCGColuna<C>[]
  /** Função que retorna os filhos de um item pai */
  filhos: (item: T) => C[]
  /** Ações da linha pai */
  acoes?: TCGAcao<T>[]
  /** Ações da linha filha */
  acoesFilhas?: TCGAcao<C>[]
  /** Ações de exportação */
  acoesExportacao?: TCGAcaoExport[]
  /** Texto placeholder da busca */
  placeholderBusca?: string
  /** Campo da linha pai usado na busca */
  campoBusca?: keyof T
  /** Mensagem estado vazio */
  mensagemVazio?: string
  /** Exibe skeleton de carregamento */
  carregando?: boolean
  /** IDs das linhas abertas por padrão */
  expandidosPadrao?: string[]
  /** Função que retorna o id de um item pai */
  itemId?: (item: T) => string
  /** Itens por página */
  itensPorPagina?: number
}
