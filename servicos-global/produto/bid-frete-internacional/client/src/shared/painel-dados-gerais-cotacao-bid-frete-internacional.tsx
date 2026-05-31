/**
 * Aba Dados gerais — cronograma da cotação (datas globais, prazo editável).
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarBlank, Clock, FloppyDisk, PaperPlaneTilt, CheckCircle, XCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { atualizarCotacao } from './api'
import {
  calcularDatasDerivadasCronogramaCotacao,
  cotacaoPermiteEditarPrazoResposta,
  inputDatetimeLocalParaIso,
  isoParaInputDatetimeLocal,
} from './calcular-cronograma-cotacao-bid-frete-internacional'
import { fmtDataCotacaoBidFrete } from './colunas-datas-motivos-cotacao-bid-frete-internacional'
import { formatarDataBidFrete } from './formato-data-bid-frete'
import type { Cotacao, DisparoCotacaoBidFreteInternacional } from './types'

const dataHoraBR = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '—'

function LinhaCronograma({
  icone,
  label,
  value,
  children,
}: {
  icone: React.ReactNode
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div className="dc-cronograma-linha">
      <div className="dc-cronograma-linha-label">
        <span className="dc-cronograma-linha-icone" aria-hidden>{icone}</span>
        <span>{label}</span>
      </div>
      {children ?? <span className="dc-cronograma-linha-valor">{value ?? '—'}</span>}
    </div>
  )
}

export interface PainelDadosGeraisCotacaoBidFreteInternacionalProps {
  cotacao: Cotacao
  disparos: DisparoCotacaoBidFreteInternacional[]
  onCotacaoAtualizada: (cotacao: Cotacao) => void
}

export function PainelDadosGeraisCotacaoBidFreteInternacional({
  cotacao,
  disparos,
  onCotacaoAtualizada,
}: PainelDadosGeraisCotacaoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const [prazoLocal, setPrazoLocal] = useState('')
  const [salvandoPrazo, setSalvandoPrazo] = useState(false)
  const [erroPrazo, setErroPrazo] = useState<string | null>(null)

  const derivadas = useMemo(
    () => calcularDatasDerivadasCronogramaCotacao(disparos),
    [disparos],
  )

  const permiteEditarPrazo = cotacaoPermiteEditarPrazoResposta(
    cotacao.status_cotacao_bid_frete_internacional,
  )

  useEffect(() => {
    setPrazoLocal(isoParaInputDatetimeLocal(cotacao.data_limite_resposta_cotacao_bid_frete_internacional))
    setErroPrazo(null)
  }, [cotacao.data_limite_resposta_cotacao_bid_frete_internacional])

  const prazoAlterado = prazoLocal !== isoParaInputDatetimeLocal(
    cotacao.data_limite_resposta_cotacao_bid_frete_internacional,
  )

  async function salvarPrazoResposta() {
    if (!permiteEditarPrazo || salvandoPrazo || !prazoAlterado) return
    setSalvandoPrazo(true)
    setErroPrazo(null)
    try {
      const iso = inputDatetimeLocalParaIso(prazoLocal)
      const cotacaoAtualizada = await atualizarCotacao(
        cotacao.id_cotacao_bid_frete_internacional,
        { data_limite_resposta_cotacao_bid_frete_internacional: iso },
      )
      onCotacaoAtualizada(cotacaoAtualizada)
    } catch (e: unknown) {
      setErroPrazo(
        e instanceof Error
          ? e.message
          : t('bidfrete.detalhe_cotacao.cronograma_erro_salvar', 'Não foi possível salvar o prazo.'),
      )
    } finally {
      setSalvandoPrazo(false)
    }
  }

  return (
    <div className="dc-dados-gerais-layout">
      <section className="dc-dados-card dc-dados-card--cronograma">
        <h3 className="dc-dados-card-title">
          {t('bidfrete.detalhe_cotacao.card_cronograma', 'Cronograma')}
        </h3>
        <div className="dc-dados-card-body dc-dados-card-body--cronograma">
          <LinhaCronograma
            icone={<CalendarBlank weight="duotone" size={16} />}
            label={t('bidfrete.detalhe_cotacao.cronograma_data_criacao', 'Data de criação')}
            value={dataHoraBR(cotacao.data_criacao_cotacao_bid_frete_internacional)}
          />
          <LinhaCronograma
            icone={<PaperPlaneTilt weight="duotone" size={16} />}
            label={t('bidfrete.detalhe_cotacao.cronograma_primeiro_envio', 'Primeiro envio')}
            value={dataHoraBR(derivadas.data_primeiro_envio_disparo)}
          />
          <LinhaCronograma
            icone={<Clock weight="duotone" size={16} />}
            label={t('bidfrete.detalhe_cotacao.cronograma_prazo_resposta', 'Prazo para resposta')}
          >
            <div className="dc-cronograma-prazo-editor">
              <input
                type="datetime-local"
                className="dc-cronograma-input"
                value={prazoLocal}
                disabled={!permiteEditarPrazo || salvandoPrazo}
                onChange={(e) => setPrazoLocal(e.target.value)}
                aria-label={t('bidfrete.detalhe_cotacao.cronograma_prazo_resposta', 'Prazo para resposta')}
              />
              {permiteEditarPrazo && (
                <BotaoGlobal
                  variante="secundario"
                  tamanho="pequeno"
                  icone={<FloppyDisk weight="bold" size={14} />}
                  carregando={salvandoPrazo}
                  disabled={!prazoAlterado || salvandoPrazo}
                  onClick={() => void salvarPrazoResposta()}
                >
                  {t('comum.salvar', 'Salvar')}
                </BotaoGlobal>
              )}
            </div>
          </LinhaCronograma>
          {!permiteEditarPrazo && (
            <p className="dc-cronograma-aviso">
              {t(
                'bidfrete.detalhe_cotacao.cronograma_prazo_somente_leitura',
                'Prazo bloqueado para edição neste status da cotação.',
              )}
            </p>
          )}
          {erroPrazo && (
            <p className="dc-cronograma-erro" role="alert">{erroPrazo}</p>
          )}
          <LinhaCronograma
            icone={<CheckCircle weight="duotone" size={16} />}
            label={t('bidfrete.detalhe_cotacao.cronograma_ultima_resposta', 'Última resposta')}
            value={dataHoraBR(derivadas.data_ultima_resposta_disparo)}
          />
          <LinhaCronograma
            icone={<CheckCircle weight="fill" size={16} />}
            label={t('bidfrete.lista.colunas.data_aprovacao', 'Data aprovação')}
            value={fmtDataCotacaoBidFrete(cotacao.data_aprovacao_cotacao_bid_frete_internacional)}
          />
          <LinhaCronograma
            icone={<XCircle weight="fill" size={16} />}
            label={t('bidfrete.lista.colunas.data_cancelamento', 'Data cancelamento')}
            value={fmtDataCotacaoBidFrete(cotacao.data_cancelamento_cotacao_bid_frete_internacional)}
          />
          <LinhaCronograma
            icone={<CalendarBlank weight="duotone" size={16} />}
            label={t('bidfrete.detalhe_cotacao.cronograma_ultima_atualizacao', 'Última atualização')}
            value={formatarDataBidFrete(cotacao.data_atualizacao_cotacao_bid_frete_internacional)}
          />
        </div>
      </section>

      <section className="dc-dados-card dc-dados-card--gerais dc-dados-card--metadados">
        <h3 className="dc-dados-card-title">
          {t('bidfrete.detalhe_cotacao.card_metadados', 'Metadados')}
        </h3>
        <div className="dc-dados-card-body">
          <div className="dc-info-row">
            <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.numero_cotacao', 'Número')}</span>
            <span className="dc-info-value dc-info-mono">
              {cotacao.numero_cotacao_bid_frete_internacional}
            </span>
          </div>
          <div className="dc-info-row">
            <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.referencia_interna', 'Referência interna')}</span>
            <span className="dc-info-value">
              {cotacao.referencia_interna_cotacao_bid_frete_internacional?.trim() || '—'}
            </span>
          </div>
          <div className="dc-info-row">
            <span className="dc-info-label">{t('comum.status')}</span>
            <span className="dc-info-value">{cotacao.status_cotacao_bid_frete_internacional}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
