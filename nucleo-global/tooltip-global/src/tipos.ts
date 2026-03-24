/**
 * @nucleo/tooltip-global — tipos
 * Definições de tipos do componente TooltipGlobal.
 */
import type React from 'react'

/** Posição preferida da tooltip em relação ao elemento âncora */
export type TooltipPosicao = 'top' | 'bottom' | 'left' | 'right'

/** Props do TooltipGlobal */
export interface TooltipProps {
  /** Texto exibido na tooltip */
  texto: string
  /** Posição preferida. Padrão: 'top' */
  posicao?: TooltipPosicao
  /** Delay em ms antes de mostrar. Padrão: 300 */
  delay?: number
  /** Conteúdo que vai receber o hover — deve ser um único elemento React */
  children: React.ReactElement
}
