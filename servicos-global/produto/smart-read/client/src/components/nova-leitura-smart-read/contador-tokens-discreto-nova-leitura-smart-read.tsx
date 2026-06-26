/**
 * ContadorTokensDiscretoNovaLeituraSmartRead — badge discreto de tokens IA na sidebar
 */

import { Cpu } from '@phosphor-icons/react'
import { formatarTokensDiscretoLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'

type Props = {
  tokensTotal: number
  carregando?: boolean
}

export function ContadorTokensDiscretoNovaLeituraSmartRead({ tokensTotal, carregando }: Props) {
  const rotulo = carregando ? '…' : formatarTokensDiscretoLeituraSmartRead(tokensTotal)

  return (
    <p
      className="sr-wizard-tokens-discreto"
      title="Tokens Gemini nesta leitura (Conferência: Análise de Riscos e Consultor Rafa). Extração do passo 2 ainda não entra. Abra essas abas para o valor subir."
      aria-label={`Tokens de IA nesta leitura: ${tokensTotal}`}
    >
      <Cpu size={14} weight="duotone" aria-hidden />
      <span>{rotulo} tokens IA</span>
    </p>
  )
}
