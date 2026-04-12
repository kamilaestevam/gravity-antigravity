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
  /** Quando true: pointer-events ativo no card e delay de 3s para fechar (permite clicar links) */
  interativo?: boolean
}
