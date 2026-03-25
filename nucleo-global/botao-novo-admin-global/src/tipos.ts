export interface BotaoSalvarAdminProps {
  dirty?: boolean
  carregando?: boolean
  rotulo?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}

export interface BotaoCancelarAdminProps {
  dirty?: boolean
  rotulo?: string
  onClick?: () => void
  type?: 'button' | 'reset'
}

export interface BotoesSalvarAdminGlobalProps {
  dirty?: boolean
  salvando?: boolean
  onSalvar?: () => void
  onCancelar?: () => void
  alinhamento?: 'esquerda' | 'centro' | 'direita'
}
