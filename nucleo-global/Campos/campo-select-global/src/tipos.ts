/**
 * @nucleo/select — tipos
 * Definições de tipos para SelectGlobal.
 * Nunca usa <select> nativo.
 */

import type { ReactNode } from 'react'

// ─── Opções ───────────────────────────────────────────────────────────────────

export interface SelectOpcao {
  /** Valor real da opção */
  valor: string | number
  /** Rótulo exibido na lista */
  rotulo: string
  /** Ícone Phosphor (opcional) */
  icone?: string
  /** Se true, a opção está desabilitada */
  desabilitada?: boolean
  /** Descrição secundária abaixo do rótulo */
  descricao?: string
  /** Qualquer dado extra para uso em renderizadores customizados */
  meta?: Record<string, unknown>
}

export interface SelectGrupo {
  /** Rótulo do grupo */
  rotulo: string
  /** Opções do grupo */
  opcoes: SelectOpcao[]
}

// ─── Props principais ─────────────────────────────────────────────────────────

export interface SelectProps {
  // Dados
  /** Lista plana de opções */
  opcoes?: SelectOpcao[]
  /** Lista de grupos de opções */
  grupos?: SelectGrupo[]

  // Valor
  /** Valor selecionado (modo controlado — single select) */
  valor?: string | number | null
  /** Valores selecionados (modo controlado — multi select) */
  valores?: (string | number)[]
  /** Callback de mudança (single) */
  aoMudarValor?: (valor: string | number | null) => void
  /** Callback de mudança (multi) */
  aoMudarValores?: (valores: (string | number)[]) => void

  // Modo
  /** Permite seleção múltipla */
  multiplo?: boolean
  /** Permite busca interna na lista */
  buscavel?: boolean
  /** Placeholder do campo */
  placeholder?: string

  // Estado
  /** Desabilita o componente */
  desabilitado?: boolean
  /** Estado de carregamento */
  carregando?: boolean
  /** Campo obrigatório (aria) */
  obrigatorio?: boolean
  /** Mensagem de erro */
  erro?: string

  // Visual
  /** Label do campo */
  label?: string
  /** Hint abaixo do campo */
  hint?: string
  /** Ícone à esquerda do campo */
  iconeEsquerda?: ReactNode
  /**
   * Posicionamento do dropdown.
   * - `'auto'` (padrão): abre para baixo, mas faz flip para cima quando não há
   *   espaço suficiente abaixo do trigger.
   * - `'baixo'`: força o dropdown a sempre abrir para baixo, sem flip.
   *   Útil quando o campo fica perto do final do viewport e o flip-up
   *   prejudica a UX (ex: ModalSelectGlobal em formulários longos).
   */
  posicao?: 'auto' | 'baixo'
  /**
   * Variante de altura do campo trigger.
   * - `'normal'` (padrão): padding `0.5625rem 0.875rem`, altura ~32px.
   *   Usar em forms verticais e telas espaçadas.
   * - `'compacto'`: padding `0.375rem 0.625rem`, altura ~24px.
   *   Usar em tabelas/grids densos onde inputs vizinhos são compactos
   *   (ex: linha de item no modal de pedido).
   */
  tamanho?: 'normal' | 'compacto'
  /**
   * Exibe o valor selecionado em fonte mono (`var(--font-mono)`).
   * Usar quando o valor é um CÓDIGO (ISO de moeda, NCM, código país, ticker
   * financeiro, etc.) onde alinhamento e legibilidade tipográfica importam.
   * Não afeta a lista de opções no dropdown.
   */
  monoValor?: boolean
  /** Renderizador customizado de opção na lista */
  renderizarOpcao?: (opcao: SelectOpcao) => ReactNode
  /** Renderizador customizado do valor selecionado */
  renderizarValorSelecionado?: (opcao: SelectOpcao | SelectOpcao[]) => ReactNode

  // Identificadores e acessibilidade
  id?: string
  name?: string
  'aria-label'?: string
  'aria-describedby'?: string
}
