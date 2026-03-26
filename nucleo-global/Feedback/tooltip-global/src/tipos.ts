/**
 * @nucleo/tooltip-global — tipos
 */
import type React from 'react'

export interface TooltipProps {
  /** Título em bold (opcional) */
  titulo?: string
  /** Texto descritivo da tooltip */
  descricao: string
  /** Elemento que recebe o hover */
  children: React.ReactElement
}
