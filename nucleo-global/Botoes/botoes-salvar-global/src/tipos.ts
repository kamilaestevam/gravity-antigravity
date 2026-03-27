/**
 * @nucleo/botoes-salvar-global — tipos
 * Props dos componentes BotaoSalvar, BotaoCancelar e BotoesSalvarGlobal.
 */

export interface BotaoSalvarProps {
  /** Habilita o botão — false enquanto não houver alterações */
  dirty?: boolean
  /** Estado de loading (enquanto a mutation está em andamento) */
  carregando?: boolean
  /** Texto alternativo ao padrão "Salvar" */
  rotulo?: string
  /** Callback de clique */
  onClick?: () => void
  /** Tipo do botão HTML */
  type?: 'button' | 'submit'
  /** Tooltip informativa UX 10 */
  tooltipDescricao?: string | React.ReactNode
}

export interface BotaoCancelarProps {
  /** Habilita o botão — false enquanto não houver alterações */
  dirty?: boolean
  /** Texto alternativo ao padrão "Cancelar" */
  rotulo?: string
  /** Callback de clique */
  onClick?: () => void
  /** Tipo do botão HTML */
  type?: 'button' | 'reset'
  /** Tooltip informativa UX 10 */
  tooltipDescricao?: string | React.ReactNode
}

export interface BotoesSalvarGlobalProps {
  /** Há alterações pendentes? Controla enable/disable dos dois botões */
  dirty?: boolean
  /** Loading do save */
  salvando?: boolean
  /** Callback de salvar */
  onSalvar?: () => void
  /** Callback de cancelar (resetar para o estado original) */
  onCancelar?: () => void
  /** Alinhamento do grupo de botões. Padrão: 'direita' */
  alinhamento?: 'esquerda' | 'centro' | 'direita'
}
