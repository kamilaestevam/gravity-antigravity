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

/** Props do TooltipAcao */
export interface TooltipAcaoProps {
  /** ID único da ação — usado na chave do localStorage para controlar se foi visto */
  acaoId: string
  /** Título do card (ex: "Filtro por coluna") */
  titulo: string
  /** Descrição curta orientada à ação (máx 2 linhas) */
  descricao: string
  /** URL/import da mídia de preview (WebP animado) */
  midia?: string
  /** Chip de categoria. Padrão: 'TUTORIAL' */
  categoria?: string
  /** Duração exibida no chip e no rodapé (ex: '0:12') */
  duracao?: string
  /** Link de documentação opcional */
  linkDoc?: string
  /** Botão/elemento que recebe o hover */
  children: React.ReactElement
}
