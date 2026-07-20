/**
 * ContadorTokensDiscretoNovaLeituraSmartRead — uso IA na sidebar
 * Grande: sessão (esta leitura) · Pequeno: acumulado do plano no mês
 *
 * Opção A: durante OCR (`extracaoEmAndamento`) exibe estado honesto (—), sem número falso.
 */

import { Sparkle } from '@phosphor-icons/react'
import { formatarTokensDiscretoLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'
import { useValorTokensAnimadoSmartRead } from '../../shared/use-valor-tokens-animado-smart-read'

type Props = {
  tokensSessao: number
  tokensMesOrganizacao: number
  iaAtiva?: boolean
  /** OCR legado em andamento — sem tokens nossos ainda */
  extracaoEmAndamento?: boolean
}

function formatarMesPlano(valor: number, extracaoEmAndamento: boolean): string {
  if (extracaoEmAndamento && valor === 0) return '—'
  return formatarTokensDiscretoLeituraSmartRead(valor)
}

export function ContadorTokensDiscretoNovaLeituraSmartRead({
  tokensSessao,
  tokensMesOrganizacao,
  iaAtiva = false,
  extracaoEmAndamento = false,
}: Props) {
  const sessaoAnimada = useValorTokensAnimadoSmartRead(tokensSessao, {
    animar: iaAtiva && !extracaoEmAndamento,
  })
  const mesAnimado = useValorTokensAnimadoSmartRead(tokensMesOrganizacao, {
    animar: iaAtiva && !extracaoEmAndamento,
  })

  const aguardandoExtracao = extracaoEmAndamento
  const contandoIaNossa = iaAtiva && !extracaoEmAndamento && tokensSessao === 0

  const rotuloSessao = aguardandoExtracao
    ? 'aguardando extração do documento'
    : contandoIaNossa
      ? 'contabilizando tokens'
      : 'tokens nesta sessão'

  const painelAtivo = aguardandoExtracao || iaAtiva || tokensSessao > 0

  const valorSessaoExibido = aguardandoExtracao
    ? '—'
    : formatarTokensDiscretoLeituraSmartRead(iaAtiva ? sessaoAnimada : tokensSessao)

  const valorMesExibido =
    iaAtiva && !extracaoEmAndamento
      ? formatarTokensDiscretoLeituraSmartRead(mesAnimado)
      : formatarMesPlano(tokensMesOrganizacao, extracaoEmAndamento)

  return (
    <div
      className={[
        'sr-wizard-tokens-painel',
        painelAtivo ? 'sr-wizard-tokens-painel--ativo' : '',
        aguardandoExtracao ? 'sr-wizard-tokens-painel--extracao' : '',
        contandoIaNossa ? 'sr-wizard-tokens-painel--sincronizando' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={
        aguardandoExtracao
          ? 'A contagem de tokens desta leitura começa após a extração do documento, quando nossa IA (Gemini) for acionada.'
          : 'Tokens Gemini: consumo desta leitura e total do plano da organização no mês.'
      }
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="sr-wizard-tokens-painel-topo">
        <Sparkle size={16} weight="fill" className="sr-wizard-tokens-painel-icone" aria-hidden />
        <span className="sr-wizard-tokens-painel-label">Uso de IA</span>
      </div>
      <strong className="sr-wizard-tokens-painel-valor" aria-label={rotuloSessao}>
        {valorSessaoExibido}
      </strong>
      <span className="sr-wizard-tokens-painel-sub">{rotuloSessao}</span>
      <span className="sr-wizard-tokens-painel-plano">
        {valorMesExibido} tokens no plano · mês
      </span>
    </div>
  )
}
