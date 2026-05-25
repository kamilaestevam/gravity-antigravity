/**
 * @nucleo/tooltip-global — tipos
 */
import type React from 'react'

export interface TooltipProps {
  /** Título em bold (opcional) — aceita string ou ReactNode */
  titulo?: React.ReactNode
  /** Texto descritivo da tooltip — aceita string ou ReactNode */
  descricao: React.ReactNode
  /** Elemento que recebe o hover */
  children: React.ReactElement
  /** Quando true: pointer-events ativo no card e delay breve ao sair (permite rolar/conteúdo) */
  interativo?: boolean
  /** Preferência de posição do card em relação ao gatilho */
  posicaoPreferida?: 'auto' | 'abaixo' | 'acima'
}
