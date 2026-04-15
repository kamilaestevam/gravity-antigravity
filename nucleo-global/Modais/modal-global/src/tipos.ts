/**
 * @nucleo/modal-global — tipos
 * Definições de tipos para ModalGlobal.
 */

import type { ReactNode } from 'react'

// ─── Configuração de aba ──────────────────────────────────────────────────────

export interface AbaModal {
  /** Identificador único da aba */
  id: string
  /** Rótulo exibido na aba */
  rotulo: string
  /** Ícone Phosphor (opcional) */
  icone?: string
  /** Conteúdo da aba */
  conteudo: ReactNode
  /** Se true, a aba está desabilitada */
  desabilitada?: boolean
  /** Título do tooltip (opcional) */
  tooltipTitulo?: string
  /** Descrição do tooltip (opcional) */
  tooltipDescricao?: string
}

// ─── Botões do footer ─────────────────────────────────────────────────────────

export type BotaoModalVariante = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface BotaoModal {
  /** Rótulo do botão */
  rotulo: string
  /** Variante visual */
  variante?: BotaoModalVariante
  /** Callback ao clicar */
  ao_clicar: () => void
  /** Se true, bloqueia interação */
  desabilitado?: boolean
  /** Exibe estado de carregamento */
  carregando?: boolean
  /** Ícone Phosphor (opcional) */
  icone?: string
}

// ─── Tamanhos ─────────────────────────────────────────────────────────────────

export type TamanhoModal = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// ─── Props do ModalGlobal ─────────────────────────────────────────────────────

export interface ModalProps {
  /** Identificador único (para o modal-manager) */
  id?: string
  /** Se true, o modal está aberto */
  aberto: boolean
  /** Callback para fechar */
  aoFechar: () => void

  // Conteúdo
  /** Título do modal */
  titulo: string | ReactNode
  /** Subtítulo opcional */
  subtitulo?: string | ReactNode
  /** Ícone no header (Phosphor) */
  iconeTitulo?: string
  /** Abas do modal */
  abas?: AbaModal[]
  /** Estilo das abas. Padrão: 'underline' */
  tipoAbas?: 'underline' | 'pill'
  /** Aba a ser selecionada inicialmente ao abrir o modal */
  abaAtivaInicial?: string
  /** Header inteiro customizado (substitui o padrão do modal) */
  cabecalhoPersonalizado?: ReactNode
  /** Conteúdo direto (quando não usa abas) */
  children?: ReactNode

  // Rodapé
  /** Botões do footer */
  botoes?: BotaoModal[]
  /** Renderizador customizado de footer. Recebe o id da aba ativa para permitir footers contextuais. */
  renderizarFooter?: (abaAtivaId?: string) => ReactNode

  // Tamanho
  /** Tamanho do modal. Padrão: 'md' */
  tamanho?: TamanhoModal
  /** Altura fixa do diálogo (ex: '680px'). Por padrão é dinâmica (fit-content). */
  altura?: string

  // Comportamento
  /** Fechar ao clicar no overlay. Padrão: true */
  fecharAoClicarOverlay?: boolean
  /** Fechar ao pressionar ESC. Padrão: true */
  fecharPorESC?: boolean
  /** Se true, desabilita o botão X e o fechamento externo */
  semFechar?: boolean
}

// ─── Estado do Modal Manager ──────────────────────────────────────────────────

export interface ItemModalStack {
  /** ID único do modal no stack */
  id: string
  /** Props do modal */
  props: Omit<ModalProps, 'aberto' | 'aoFechar'>
  /** Dados passados ao abrir */
  dados?: Record<string, unknown>
}

export interface ModalManagerState {
  /** Stack de modais abertos */
  stack: ItemModalStack[]
}
