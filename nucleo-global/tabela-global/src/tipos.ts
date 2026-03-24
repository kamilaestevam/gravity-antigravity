/**
 * @nucleo/tabela-global — tipos
 * Definições de tipos para TabelaGlobal.
 * Sem estado de servidor. Sem API calls.
 */

import type { ReactNode } from 'react'

// ─── Coluna ───────────────────────────────────────────────────────────────────

export type ColunaAlinhamento = 'left' | 'center' | 'right'
export type ColunaTipo = 'text' | 'number' | 'date' | 'datetime' | 'currency' | 'badge' | 'custom'

export interface BadgeConfig {
  /** Mapa de valor → classe de badge (success | warning | danger | default) */
  mapaClasses: Record<string, 'success' | 'warning' | 'danger' | 'default'>
  /** Mapa de valor → rótulo de exibição */
  mapaRotulos?: Record<string, string>
}

export interface Coluna<T extends RegistroTabela = RegistroTabela> {
  /** Chave do campo no objeto de dados */
  key: keyof T & string
  /** Rótulo exibido no cabeçalho */
  label: string
  /** Tipo de dado (afeta formatação e sort) */
  tipo?: ColunaTipo
  /** Permite ordenação por esta coluna */
  ordenavel?: boolean
  /** Permite filtrar por esta coluna */
  filtravel?: boolean
  /** Alinhamento do conteúdo da célula */
  alinhamento?: ColunaAlinhamento
  /** Largura mínima em px */
  larguraMin?: number
  /** Largura fixa (ex: '120px', '10%') */
  largura?: string
  /** Configuração quando tipo = 'badge' */
  badgeConfig?: BadgeConfig
  /** Renderizador customizado de célula */
  renderizar?: (valor: unknown, linha: T) => ReactNode
  /** Ocultar coluna */
  oculta?: boolean
  /** Coluna não pode ser escondida pelo usuário */
  naoOcultavel?: boolean
}

// ─── Filtro ───────────────────────────────────────────────────────────────────

export type FiltroTipo = 'texto' | 'select' | 'data' | 'intervalo-data' | 'booleano'

export interface OpcaoFiltro {
  valor: string | number | boolean
  rotulo: string
}

export interface FiltroConfig {
  /** Chave da coluna alvo */
  key: string
  /** Tipo de filtro */
  tipo: FiltroTipo
  /** Rótulo do filtro */
  rotulo?: string
  /** Opções para tipo 'select' */
  opcoes?: OpcaoFiltro[]
  /** Valor inicial */
  valorInicial?: unknown
}

export type EstadoFiltros = Record<string, unknown>

// ─── Ordenação ────────────────────────────────────────────────────────────────

export type DirecaoOrdenacao = 'asc' | 'desc'

export interface EstadoOrdenacao {
  coluna: string
  direcao: DirecaoOrdenacao
}

// ─── Seleção ──────────────────────────────────────────────────────────────────

export type IdRegistro = string | number

// ─── Ação de linha ────────────────────────────────────────────────────────────

export interface AcaoLinha<T extends RegistroTabela = RegistroTabela> {
  /** Identificador único da ação */
  id: string
  /** Rótulo da ação */
  rotulo: string
  /** Ícone Phosphor (ex: 'pencil', 'trash') */
  icone?: string
  /** Variante visual */
  variante?: 'default' | 'danger'
  /** Condicional para exibir a ação */
  mostrar?: (linha: T) => boolean
  /** Callback ao clicar */
  ao_clicar: (linha: T) => void
}

// ─── Dados ────────────────────────────────────────────────────────────────────

export interface RegistroTabela {
  /** Identificador único obrigatório */
  id: IdRegistro
  [key: string]: unknown
}

// ─── Exportação ───────────────────────────────────────────────────────────────

export type FormatoExport = 'csv' | 'json' | 'excel' | 'txt' | 'xml'

export interface ExportConfig {
  /** Formatos disponíveis */
  formatos: FormatoExport[]
  /** Nome do arquivo (sem extensão) */
  nomeArquivo?: string
  /** Se true, exporta apenas linhas selecionadas */
  apenasSelecao?: boolean
}

// ─── Props principais ─────────────────────────────────────────────────────────

export interface TabelaProps<T extends RegistroTabela = RegistroTabela> {
  /** Array de definições de colunas */
  colunas: Coluna<T>[]
  /** Array de dados */
  dados: T[]

  // Paginação
  /** Número de itens por página. Padrão: 20 */
  itensPorPagina?: number
  /** Opções de itens por página */
  opcoesItensPorPagina?: number[]

  // Filtros e busca
  /** Habilita campo de busca global */
  buscaGlobal?: boolean
  /** Placeholder da busca global */
  buscaPlaceholder?: string
  /** Filtros configuráveis */
  filtros?: FiltroConfig[]

  // Seleção
  /** Habilita checkboxes de seleção */
  selecao?: boolean
  /** IDs selecionados (modo controlado) */
  selecionados?: IdRegistro[]
  /** Callback de mudança de seleção */
  aoMudarSelecao?: (ids: IdRegistro[]) => void

  // Ações
  /** Ações por linha */
  acoesLinha?: AcaoLinha<T>[]

  // Exportação
  /** Configuração de exportação */
  exportConfig?: ExportConfig

  // Estado visual
  /** Exibe skeleton de carregamento */
  carregando?: boolean
  /** Mensagem quando não há dados */
  mensagemVazia?: string
  /** Componente customizado para estado vazio */
  renderizarVazio?: () => ReactNode

  // Callbacks
  /** Callback ao clicar em uma linha */
  aoClicarLinha?: (linha: T) => void
}
