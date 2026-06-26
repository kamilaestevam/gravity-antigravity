/**
 * AcoesCorrecaoRiscoNovaLeituraSmartRead — e-mail fornecedor + notificação interna (um ou vários riscos)
 */

import { useMemo, useState } from 'react'
import { Bell, Copy, EnvelopeSimple, PaperPlaneTilt } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { RiscoAduaneiroLeitura } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import {
  montarEmailFornecedorRiscosSmartRead,
  montarMensagemNotificacaoRiscosSmartRead,
  type IdiomaEmailFornecedorRisco,
} from '../../shared/montar-email-fornecedor-risco-smart-read'

type Props = {
  riscos: RiscoAduaneiroLeitura[]
}

const IDIOMAS: { id: IdiomaEmailFornecedorRisco; rotulo: string }[] = [
  { id: 'pt', rotulo: 'Português' },
  { id: 'en', rotulo: 'English' },
  { id: 'es', rotulo: 'Español' },
]

export function AcoesCorrecaoRiscoNovaLeituraSmartRead({ riscos }: Props) {
  const [idioma, setIdioma] = useState<IdiomaEmailFornecedorRisco>('pt')
  const [modo, setModo] = useState<'email' | 'notificacao' | null>('email')
  const [feedback, setFeedback] = useState<string | null>(null)

  const email = useMemo(
    () => montarEmailFornecedorRiscosSmartRead(riscos, idioma),
    [riscos, idioma],
  )
  const notificacao = useMemo(() => montarMensagemNotificacaoRiscosSmartRead(riscos), [riscos])

  if (riscos.length === 0) return null

  async function copiar(texto: string, mensagem: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setFeedback(mensagem)
      window.setTimeout(() => setFeedback(null), 2500)
    } catch {
      setFeedback('Não foi possível copiar — selecione o texto manualmente.')
    }
  }

  function abrirClienteEmail() {
    const mailto = `mailto:?subject=${encodeURIComponent(email.assunto)}&body=${encodeURIComponent(email.corpo)}`
    window.open(mailto, '_blank', 'noopener,noreferrer')
  }

  const rotuloEmail =
    riscos.length === 1
      ? 'E-mail ao fornecedor'
      : `E-mail consolidado (${riscos.length})`

  return (
    <div className="sr-conf-risco-acoes">
      <div className="sr-conf-risco-acoes-barra">
        <label className="sr-conf-risco-idioma">
          <span>Idioma do e-mail</span>
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value as IdiomaEmailFornecedorRisco)}
            aria-label="Idioma do e-mail ao fornecedor"
          >
            {IDIOMAS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.rotulo}
              </option>
            ))}
          </select>
        </label>
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          type="button"
          onClick={() => setModo((m) => (m === 'email' ? null : 'email'))}
        >
          <EnvelopeSimple size={14} weight="duotone" aria-hidden />
          {rotuloEmail}
        </BotaoGlobal>
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          type="button"
          onClick={() => setModo((m) => (m === 'notificacao' ? null : 'notificacao'))}
        >
          <Bell size={14} weight="duotone" aria-hidden />
          Notificação
        </BotaoGlobal>
      </div>

      {feedback && (
        <p className="sr-conf-risco-acoes-feedback" role="status">
          {feedback}
        </p>
      )}

      {modo === 'email' && (
        <div className="sr-conf-risco-compose">
          <span className="sr-conf-risco-compose-rotulo">Assunto</span>
          <p className="sr-conf-risco-compose-assunto">{email.assunto}</p>
          <textarea
            className="sr-conf-risco-compose-texto"
            readOnly
            value={email.corpo}
            rows={Math.min(16, 6 + riscos.length * 3)}
            aria-label="Corpo do e-mail ao fornecedor"
          />
          <div className="sr-conf-risco-compose-botoes">
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              type="button"
              onClick={() => void copiar(`${email.assunto}\n\n${email.corpo}`, 'E-mail copiado.')}
            >
              <Copy size={14} aria-hidden />
              Copiar
            </BotaoGlobal>
            <BotaoGlobal variante="primario" tamanho="pequeno" type="button" onClick={abrirClienteEmail}>
              <PaperPlaneTilt size={14} weight="fill" aria-hidden />
              Abrir e-mail
            </BotaoGlobal>
          </div>
        </div>
      )}

      {modo === 'notificacao' && (
        <div className="sr-conf-risco-compose">
          <span className="sr-conf-risco-compose-rotulo">Canal interno</span>
          <textarea
            className="sr-conf-risco-compose-texto"
            readOnly
            value={notificacao}
            rows={Math.min(12, 4 + riscos.length * 2)}
            aria-label="Mensagem para notificações"
          />
          <div className="sr-conf-risco-compose-botoes">
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              type="button"
              onClick={() => void copiar(notificacao, 'Mensagem copiada — cole em Notificações.')}
            >
              <Copy size={14} aria-hidden />
              Copiar para Notificações
            </BotaoGlobal>
          </div>
        </div>
      )}
    </div>
  )
}
