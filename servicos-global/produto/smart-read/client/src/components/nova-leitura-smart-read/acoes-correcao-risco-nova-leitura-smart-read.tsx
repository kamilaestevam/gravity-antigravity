/**
 * AcoesCorrecaoRiscoNovaLeituraSmartRead — e-mail fornecedor + notificação interna
 * (riscos e/ou campos editados na conferência)
 */

import { useEffect, useMemo, useState } from 'react'
import { Bell, Copy, EnvelopeSimple, PaperPlaneTilt } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { RiscoAduaneiroLeitura } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { CampoEditadoComunicacaoSmartRead } from '../../shared/listar-campos-editados-comunicacao-smart-read'
import {
  montarEmailFornecedorRiscosSmartRead,
  montarMensagemNotificacaoRiscosSmartRead,
  type IdiomaEmailFornecedorRisco,
} from '../../shared/montar-email-fornecedor-risco-smart-read'

type Props = {
  riscos: RiscoAduaneiroLeitura[]
  camposEditados?: CampoEditadoComunicacaoSmartRead[]
}

const OPCOES_IDIOMA = [
  { valor: 'pt', rotulo: 'Português' },
  { valor: 'en', rotulo: 'English' },
  { valor: 'es', rotulo: 'Español' },
] as const

export function AcoesCorrecaoRiscoNovaLeituraSmartRead({
  riscos,
  camposEditados = [],
}: Props) {
  const [idioma, setIdioma] = useState<IdiomaEmailFornecedorRisco>('pt')
  const [modo, setModo] = useState<'email' | 'notificacao' | null>('email')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [assuntoEditado, setAssuntoEditado] = useState<string | null>(null)
  const [corpoEditado, setCorpoEditado] = useState<string | null>(null)
  const [notificacaoEditada, setNotificacaoEditada] = useState<string | null>(null)

  const totalItens = riscos.length + camposEditados.length

  const emailGerado = useMemo(
    () => montarEmailFornecedorRiscosSmartRead(riscos, idioma, camposEditados),
    [riscos, idioma, camposEditados],
  )
  const notificacaoGerada = useMemo(
    () => montarMensagemNotificacaoRiscosSmartRead(riscos, camposEditados),
    [riscos, camposEditados],
  )

  useEffect(() => {
    setAssuntoEditado(null)
    setCorpoEditado(null)
  }, [emailGerado.assunto, emailGerado.corpo])

  useEffect(() => {
    setNotificacaoEditada(null)
  }, [notificacaoGerada])

  const assunto = assuntoEditado ?? emailGerado.assunto
  const corpo = corpoEditado ?? emailGerado.corpo
  const notificacao = notificacaoEditada ?? notificacaoGerada

  if (totalItens === 0) return null

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
    const mailto = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
    window.open(mailto, '_blank', 'noopener,noreferrer')
  }

  const rotuloEmail = 'Gerar e-mail'

  return (
    <div className="sr-conf-risco-acoes">
      <div className="sr-conf-risco-acoes-barra">
        <div className="sr-conf-risco-idioma">
          <SelectGlobal
            id="sr-conf-risco-idioma"
            label="Idioma do e-mail"
            opcoes={[...OPCOES_IDIOMA]}
            valor={idioma}
            aoMudarValor={(v) => {
              if (v === 'pt' || v === 'en' || v === 'es') setIdioma(v)
            }}
            buscavel={false}
            tamanho="compacto"
            placeholder="Idioma"
            posicao="baixo"
            aria-label="Idioma do e-mail ao fornecedor"
          />        </div>
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
          <label className="sr-conf-risco-compose-rotulo" htmlFor="sr-conf-risco-email-assunto">
            Assunto
          </label>
          <input
            id="sr-conf-risco-email-assunto"
            type="text"
            className="sr-conf-risco-compose-assunto-input"
            value={assunto}
            onChange={(e) => setAssuntoEditado(e.target.value)}
            aria-label="Assunto do e-mail ao fornecedor"
          />
          <label className="sr-conf-risco-compose-rotulo" htmlFor="sr-conf-risco-email-corpo">
            Mensagem
          </label>
          <textarea
            id="sr-conf-risco-email-corpo"
            className="sr-conf-risco-compose-texto"
            value={corpo}
            onChange={(e) => setCorpoEditado(e.target.value)}
            rows={Math.min(16, 6 + totalItens * 3)}
            aria-label="Corpo do e-mail ao fornecedor"
          />
          <div className="sr-conf-risco-compose-botoes">
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              type="button"
              onClick={() => void copiar(`${assunto}\n\n${corpo}`, 'E-mail copiado.')}
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
          <label className="sr-conf-risco-compose-rotulo" htmlFor="sr-conf-risco-notificacao">
            Canal interno
          </label>
          <textarea
            id="sr-conf-risco-notificacao"
            className="sr-conf-risco-compose-texto"
            value={notificacao}
            onChange={(e) => setNotificacaoEditada(e.target.value)}
            rows={Math.min(12, 4 + totalItens * 2)}
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
