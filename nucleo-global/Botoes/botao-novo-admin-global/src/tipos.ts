export interface BotaoNovoAdminProps {
  /** Texto exibido no botão quando no estado padrão */
  rotulo: string
  /** Callback disparado ao clicar */
  onClick: () => void
  /** Quando true, o botão exibe ícone X e texto "Cancelar" */
  ativo?: boolean
  /** Texto exibido no estado ativo (padrão: "Cancelar") */
  rotuloAtivo?: string
  /** Classe CSS extra para customizações pontuais */
  className?: string
}
