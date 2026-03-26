import type { ReactNode } from 'react'

// ── Tipos compartilhados ───────────────────────────────────────────────────

/** Direção da tendência */
export type TendenciaDirecao = 'up' | 'down' | 'neutral'

/** Variantes de cor dos cards */
export type CardVariante = 'padrao' | 'sucesso' | 'aviso' | 'perigo' | 'primario'

/** Alinhamento interno do conteúdo */
export type CardAlinhamento = 'esquerda' | 'centro'

/** Objeto de tendência simples com valor e direção */
export interface CardTendencia {
  valor: string
  direcao: TendenciaDirecao
}

// ── Período de comparação ─────────────────────────────────────────────────

/** Códigos dos períodos suportados */
export type PeriodoCodigo = '7d' | '30d' | '6m' | '1a'

/** Dado de tendência para um período específico */
export interface PeriodoTendencia {
  /** Código do período */
  periodo: PeriodoCodigo
  /** Rótulo exibido no seletor (ex: "7 dias", "30 dias") */
  rotulo: string
  /** Valor formatado do badge (ex: "+5%", "-2", "0%") */
  valor: string
  /** Direção da variação */
  direcao: TendenciaDirecao
  /** Descrição opcional exibida no seletor */
  descricao?: string
}

// ── CardBasicoGlobal ───────────────────────────────────────────────────────

export interface CardBasicoProps {
  /** Rótulo principal do card (ex: "TOTAL DE FILHAS") */
  titulo: string
  /** Valor numérico ou string em destaque (ex: 30 ou "2") */
  valor: ReactNode
  /**
   * Tendência estática simples (sem seletor de período).
   * Use `periodos` para habilitar o seletor interativo.
   */
  tendencia?: CardTendencia
  /**
   * Dados de tendência por período.
   * Quando fornecido, substitui `tendencia` e exibe um seletor
   * de período no hover do badge (7d / 30d / 6m / 1a).
   * O período padrão exibido é `30d`.
   */
  periodos?: PeriodoTendencia[]
  /** Subtexto abaixo do valor */
  subtexto?: ReactNode
  /** Ícone Phosphor ao lado do título */
  icone?: ReactNode
  /** Variante de cor do card */
  variante?: CardVariante
  /** Alinhamento do conteúdo */
  alinhamento?: CardAlinhamento
  /** Classe CSS extra */
  className?: string
  /**
   * Conteúdo do tooltip (abre abaixo do card ao hover).
   * O cabeçalho com ícone+título é gerado automaticamente.
   */
  tooltip?: ReactNode
}

/** @deprecated Use CardBasicoProps */
export type StatCardProps = CardBasicoProps

// ── CardGraficoGlobal ──────────────────────────────────────────────────────

/** Item da legenda do gráfico gauge */
export interface GaugeLegendaItem {
  label: string
  valor: number
  cor: 'green' | 'yellow' | 'red' | string
}

export interface CardGraficoProps {
  /** Rótulo principal do card */
  titulo: string
  /** Ícone ao lado do título */
  icone?: ReactNode
  /** Variante de cor do card */
  variante?: CardVariante
  /** Classe CSS extra */
  className?: string
  /**
   * Total usado para calcular a % do gauge.
   * Os valores da legenda devem somar ≤ total.
   */
  total: number
  /** Número principal exibido no centro do gauge */
  valorPrincipal: number
  /** Cor do arco do gauge (hex ou var()) */
  corGauge?: string
  /** Itens da legenda (ponto colorido + label + quantidade) */
  legenda: GaugeLegendaItem[]
  /** Conteúdo do tooltip com detalhe hover */
  tooltip?: ReactNode
}
