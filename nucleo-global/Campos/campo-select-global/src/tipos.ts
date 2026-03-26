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
