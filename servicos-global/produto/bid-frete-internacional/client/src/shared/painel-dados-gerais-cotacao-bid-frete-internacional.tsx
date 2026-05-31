/**
 * Aba Dados gerais — cronograma da cotação (datas globais, prazo editável).
 */

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarBlank, Clock, PaperPlaneTilt, CheckCircle, XCircle } from '@phosphor-icons/react'
import { atualizarCotacao } from './api'
import {
  calcularDatasDerivadasCronogramaCotacao,
  cotacaoPermiteEditarPrazoResposta,
} from './calcular-cronograma-cotacao-bid-frete-internacional'
import { EdicaoPrazoCronogramaCotacaoBidFreteInternacional } from './edicao-prazo-cronograma-cotacao-bid-frete-internacional'
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
  const [salvandoPrazo, setSalvandoPrazo] = useState(false)
  const [erroPrazo, setErroPrazo] = useState<string | null>(null)
  const [resultadoPrazo, setResultadoPrazo] = useState<'sucesso' | 'erro' | null>(null)

  const derivadas = useMemo(
    () => calcularDatasDerivadasCronogramaCotacao(disparos),
    [disparos],
  )

  const permiteEditarPrazo = cotacaoPermiteEditarPrazoResposta(
    cotacao.status_cotacao_bid_frete_internacional,
  )

  async function salvarPrazoResposta(iso: string | null) {
    if (!permiteEditarPrazo || salvandoPrazo) return
    setSalvandoPrazo(true)
    setErroPrazo(null)
    setResultadoPrazo(null)
    try {
      const cotacaoAtualizada = await atualizarCotacao(
        cotacao.id_cotacao_bid_frete_internacional,
        { data_limite_resposta_cotacao_bid_frete_internacional: iso },
      )
      onCotacaoAtualizada(cotacaoAtualizada)
      setResultadoPrazo('sucesso')
      window.setTimeout(() => setResultadoPrazo(null), 1200)
    } catch (e: unknown) {
      setResultadoPrazo('erro')
      setErroPrazo(
        e instanceof Error
          ? e.message
          : t('bidfrete.detalhe_cotacao.cronograma_erro_salvar', 'Não foi possível salvar o prazo.'),
      )
      window.setTimeout(() => setResultadoPrazo(null), 2000)
    } finally {
      setSalvandoPrazo(false)
    }
  }

  return (
    <section className="dc-dados-card dc-dados-card--gerais dc-dados-card--dados-gerais-unificado">
      <div className="dc-dados-card-body dc-dados-card-body--dados-gerais-unificado">
        <div className="dc-dados-secao dc-dados-secao--cronograma">
          <h4 className="dc-dados-secao-titulo">
            {t('bidfrete.detalhe_cotacao.card_cronograma', 'Cronograma')}
          </h4>
          <div className="dc-dados-secao-conteudo dc-dados-secao-conteudo--cronograma">
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
              <EdicaoPrazoCronogramaCotacaoBidFreteInternacional
                label={t('bidfrete.detalhe_cotacao.cronograma_prazo_resposta', 'Prazo para resposta')}
                valorIso={cotacao.data_limite_resposta_cotacao_bid_frete_internacional}
                permiteEditar={permiteEditarPrazo}
                salvando={salvandoPrazo}
                resultadoSalvar={resultadoPrazo}
                onConfirmar={salvarPrazoResposta}
                avisoSomenteLeitura={
                  !permiteEditarPrazo
                    ? t(
                      'bidfrete.detalhe_cotacao.cronograma_prazo_somente_leitura',
                      'Prazo bloqueado para edição neste status da cotação.',
                    )
                    : undefined
                }
              />
            </LinhaCronograma>
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
        </div>

        <div className="dc-dados-secao dc-dados-secao--metadados">
          <h4 className="dc-dados-secao-titulo">
            {t('bidfrete.detalhe_cotacao.card_metadados', 'Metadados')}
          </h4>
          <div className="dc-dados-secao-conteudo dc-dados-secao-conteudo--metadados">
            <div className="dc-info-row">
              <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.numero_cotacao', 'Número')}</span>
              <span className="dc-info-value dc-info-mono">
                {cotacao.numero_cotacao_bid_frete_internacional}
              </span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">
                {t('bidfrete.detalhe_cotacao.referencia_interna', 'Referência interna')}
              </span>
              <span className="dc-info-value">
                {cotacao.referencia_interna_cotacao_bid_frete_internacional?.trim() || '—'}
              </span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">{t('comum.status')}</span>
              <span className="dc-info-value">{cotacao.status_cotacao_bid_frete_internacional}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
