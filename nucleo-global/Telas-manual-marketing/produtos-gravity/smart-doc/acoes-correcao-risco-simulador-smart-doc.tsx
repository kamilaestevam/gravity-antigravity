/**
 * AcoesCorrecaoRiscoSimuladorSmartDoc — e-mail fornecedor + notificação interna (mock com dados do simulador)
 */

import { useMemo, useState } from 'react'
import { Bell, Copy, EnvelopeSimple, PaperPlaneTilt } from '@phosphor-icons/react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { RiscoSimuladorSmartDoc } from './dados-riscos-simulador-smart-doc'
import {
  montarEmailFornecedorRiscosSimuladorSmartDoc,
  montarMensagemNotificacaoRiscosSimuladorSmartDoc,
  type IdiomaEmailFornecedorRiscoSimulador,
} from './montar-email-fornecedor-risco-simulador-smart-doc'

type Props = {
  riscos: RiscoSimuladorSmartDoc[]
}

const IDIOMAS: { id: IdiomaEmailFornecedorRiscoSimulador; rotulo: string }[] = [
  { id: 'pt', rotulo: 'Português' },
  { id: 'en', rotulo: 'English' },
  { id: 'es', rotulo: 'Español' },
]

const OPCOES_IDIOMA = IDIOMAS.map((item) => ({ valor: item.id, rotulo: item.rotulo }))

export function AcoesCorrecaoRiscoSimuladorSmartDoc({ riscos }: Props) {
  const [idioma, setIdioma] = useState<IdiomaEmailFornecedorRiscoSimulador>('pt')
  const [modo, setModo] = useState<'email' | 'notificacao' | null>('email')
  const [feedback, setFeedback] = useState<string | null>(null)

  const email = useMemo(
    () => montarEmailFornecedorRiscosSimuladorSmartDoc(riscos, idioma),
    [riscos, idioma],
  )
  const notificacao = useMemo(() => montarMensagemNotificacaoRiscosSimuladorSmartDoc(riscos), [riscos])

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
    riscos.length === 1 ? 'E-mail ao fornecedor' : `E-mail consolidado (${riscos.length})`

  return (
    <div className="sr-conf-risco-acoes">
      <div className="sr-conf-risco-acoes-barra">
        <div className="sr-conf-risco-idioma">
          <SelectGlobal
            label="Idioma do e-mail"
            opcoes={OPCOES_IDIOMA}
            valor={idioma}
            aoMudarValor={(valor) => {
              if (valor === 'pt' || valor === 'en' || valor === 'es') {
                setIdioma(valor)
              }
            }}
            buscavel={false}
            tamanho="compacto"
            aria-label="Idioma do e-mail ao fornecedor"
          />
        </div>
        <button
          type="button"
          className={`sds-nl-btn sds-nl-btn--sec sds-nl-btn--sm sds-nl-btn--icone${modo === 'email' ? ' sr-conf-risco-acoes-btn--ativo' : ''}`}
          onClick={() => setModo((m) => (m === 'email' ? null : 'email'))}
        >
          <EnvelopeSimple size={16} weight="duotone" aria-hidden />
          <span>{rotuloEmail}</span>
        </button>
        <button
          type="button"
          className={`sds-nl-btn sds-nl-btn--sec sds-nl-btn--sm sds-nl-btn--icone${modo === 'notificacao' ? ' sr-conf-risco-acoes-btn--ativo' : ''}`}
          onClick={() => setModo((m) => (m === 'notificacao' ? null : 'notificacao'))}
        >
          <Bell size={16} weight="duotone" aria-hidden />
          <span>Notificação</span>
        </button>
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
            <button
              type="button"
              className="sds-nl-btn sds-nl-btn--sec sds-nl-btn--sm sds-nl-btn--icone"
              onClick={() => void copiar(`${email.assunto}\n\n${email.corpo}`, 'E-mail copiado.')}
            >
              <Copy size={16} aria-hidden />
              <span>Copiar</span>
            </button>
            <button
              type="button"
              className="sds-nl-btn sds-nl-btn--prim sds-nl-btn--sm sds-nl-btn--icone"
              onClick={abrirClienteEmail}
            >
              <PaperPlaneTilt size={16} weight="fill" aria-hidden />
              <span>Abrir e-mail</span>
            </button>
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
            <button
              type="button"
              className="sds-nl-btn sds-nl-btn--prim sds-nl-btn--sm sds-nl-btn--icone"
              onClick={() => void copiar(notificacao, 'Mensagem copiada — cole em Notificações.')}
            >
              <Copy size={16} aria-hidden />
              <span>Copiar para Notificações</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
