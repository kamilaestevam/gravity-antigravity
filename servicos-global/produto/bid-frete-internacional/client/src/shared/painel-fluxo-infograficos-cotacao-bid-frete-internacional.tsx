/**
 * Painel compacto: linha do tempo resumida + infográficos das propostas.
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  Clock,
  Hourglass,
  UserCircle,
  Timer,
  CurrencyDollar,
  Trophy,
  ChartBar,
  Lightning,
} from '@phosphor-icons/react'
import type { StatusCotacao } from './types'
import {
  calcularInfograficosFluxoCotacao,
  FLUXO_ETAPAS_RESUMIDAS,
  formatarHorasResposta,
  indiceFluxoPorStatus,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import type { InfograficosFluxoCotacao } from './infograficos-fluxo-cotacao-bid-frete-internacional'
import type {
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
} from './types'

const moeda = (val: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)

function TimelineCompacta({ statusAtual }: { statusAtual: StatusCotacao }) {
  const { t } = useTranslation()
  const indiceAtual = indiceFluxoPorStatus(statusAtual)
  const progresso = FLUXO_ETAPAS_RESUMIDAS.length <= 1
    ? 0
    : (indiceAtual / (FLUXO_ETAPAS_RESUMIDAS.length - 1)) * 100

  return (
    <div className="dc-fluxo-compact" role="list" aria-label={t('bidfrete.detalhe_cotacao.status', 'Status')}>
      <div className="dc-fluxo-compact-track" aria-hidden>
        <div className="dc-fluxo-compact-track-base" />
        <div className="dc-fluxo-compact-track-fill" style={{ width: `${progresso}%` }} />
      </div>
      <div className="dc-fluxo-compact-etapas">
        {FLUXO_ETAPAS_RESUMIDAS.map((etapa) => {
          const concluida = etapa.indice < indiceAtual
          const ativa = etapa.indice === indiceAtual
          const Icone = concluida
            ? CheckCircle
            : ativa
              ? Clock
              : etapa.indice === 4
                ? UserCircle
                : Hourglass

          return (
            <div
              key={etapa.indice}
              role="listitem"
              className={[
                'dc-fluxo-compact-etapa',
                concluida ? 'dc-fluxo-compact-etapa--done' : '',
                ativa ? 'dc-fluxo-compact-etapa--active' : '',
              ].filter(Boolean).join(' ')}
              title={t(etapa.labelKey)}
            >
              <span className="dc-fluxo-compact-node" aria-hidden>
                <Icone weight={concluida ? 'fill' : 'duotone'} size={14} />
              </span>
              <span className="dc-fluxo-compact-label">{t(etapa.labelKey)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CardInfografico({
  icone,
  titulo,
  valor,
  detalhe,
  destaque = false,
  vazio = false,
}: {
  icone: React.ReactNode
  titulo: string
  valor: React.ReactNode
  detalhe?: React.ReactNode
  destaque?: boolean
  vazio?: boolean
}) {
  return (
    <div
      className={[
        'dc-info-card',
        destaque ? 'dc-info-card--destaque' : '',
        vazio ? 'dc-info-card--vazio' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="dc-info-card-icon" aria-hidden>{icone}</div>
      <div className="dc-info-card-body">
        <span className="dc-info-card-titulo">{titulo}</span>
        <span className="dc-info-card-valor">{valor}</span>
        {detalhe != null && <span className="dc-info-card-detalhe">{detalhe}</span>}
      </div>
    </div>
  )
}

function InfograficoTransito({
  info,
  t,
}: {
  info: InfograficosFluxoCotacao
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  if (info.barrasTransito.length === 0) {
    return (
      <CardInfografico
        icone={<Timer weight="duotone" size={18} />}
        titulo={t('bidfrete.detalhe_cotacao.info_transito', 'Trânsito')}
        valor="—"
        vazio
      />
    )
  }

  return (
    <div className="dc-info-card dc-info-card--wide">
      <div className="dc-info-card-icon" aria-hidden>
        <Timer weight="duotone" size={18} />
      </div>
      <div className="dc-info-card-body dc-info-card-body--wide">
        <span className="dc-info-card-titulo">
          {t('bidfrete.detalhe_cotacao.info_transito', 'Trânsito')}
        </span>
        <span className="dc-info-card-valor">
          {info.transitoMinDias === info.transitoMaxDias
            ? `${info.transitoMinDias} ${t('bidfrete.detalhe_cotacao.dias')}`
            : `${info.transitoMinDias}–${info.transitoMaxDias} ${t('bidfrete.detalhe_cotacao.dias')}`}
        </span>
        <div className="dc-info-barras" role="img" aria-label={t('bidfrete.detalhe_cotacao.info_transito_comparativo', 'Comparativo de trânsito')}>
          {info.barrasTransito.map((barra) => (
            <div key={barra.id} className="dc-info-barra-linha">
              <span className="dc-info-barra-nome" title={barra.nome}>
                {barra.nome.length > 14 ? `${barra.nome.slice(0, 12)}…` : barra.nome}
              </span>
              <div className="dc-info-barra-trilha">
                <div
                  className={[
                    'dc-info-barra-fill',
                    barra.ehMelhor ? 'dc-info-barra-fill--melhor' : '',
                  ].filter(Boolean).join(' ')}
                  style={{ width: `${Math.max(12, barra.percentualLargura)}%` }}
                />
              </div>
              <span className="dc-info-barra-dias">{barra.dias}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export interface PainelFluxoInfograficosCotacaoProps {
  statusAtual: StatusCotacao
  disparos: DisparoCotacaoBidFreteInternacional[]
  propostas: PropostaRankingBidFreteInternacional[]
}

export function PainelFluxoInfograficosCotacao({
  statusAtual,
  disparos,
  propostas,
}: PainelFluxoInfograficosCotacaoProps) {
  const { t } = useTranslation()

  const info = useMemo(
    () => calcularInfograficosFluxoCotacao(disparos, propostas),
    [disparos, propostas],
  )

  const valorTempoResposta = info.tempoRespostaMediaHoras != null
    ? formatarHorasResposta(info.tempoRespostaMediaHoras, t)
    : '—'

  const detalheTempo =
    info.tempoRespostaMaisRapidoHoras != null && info.tempoRespostaMaisRapidoFornecedor
      ? t('bidfrete.detalhe_cotacao.info_resposta_rapida', {
          tempo: formatarHorasResposta(info.tempoRespostaMaisRapidoHoras, t),
          fornecedor: info.tempoRespostaMaisRapidoFornecedor,
          defaultValue: `Mais rápido: ${formatarHorasResposta(info.tempoRespostaMaisRapidoHoras, t)} (${info.tempoRespostaMaisRapidoFornecedor})`,
        })
      : info.quantidadeDisparosEnviados > 0
        ? t('bidfrete.detalhe_cotacao.info_aguardando_respostas', '{{n}} disparos · aguardando', {
            n: info.quantidadeDisparosEnviados,
          })
        : undefined

  const valorMelhorPreco = info.melhorValor != null
    ? moeda(info.melhorValor, info.melhorValorMoeda)
    : '—'

  const detalheMelhorPreco =
    info.melhorValorFornecedor != null
      ? [
          info.melhorValorFornecedor,
          info.economiaVsSegundoPercentual != null && info.economiaVsSegundoPercentual > 0
            ? t('bidfrete.detalhe_cotacao.info_economia_2', {
                pct: info.economiaVsSegundoPercentual.toFixed(1),
                defaultValue: `−${info.economiaVsSegundoPercentual.toFixed(1)}% vs 2º`,
              })
            : null,
        ].filter(Boolean).join(' · ')
      : undefined

  const valorLider = info.liderFornecedor ?? '—'
  const detalheLider =
    info.liderScore != null
      ? t('bidfrete.detalhe_cotacao.info_score_lider', {
          score: info.liderScore,
          defaultValue: `Score ${info.liderScore}`,
        })
      : undefined

  return (
    <div className="dc-fluxo-painel-corpo">
      <TimelineCompacta statusAtual={statusAtual} />

      <div className="dc-info-grid">
        <CardInfografico
          icone={<Lightning weight="duotone" size={18} />}
          titulo={t('bidfrete.detalhe_cotacao.info_tempo_resposta', 'Tempo de resposta')}
          valor={valorTempoResposta}
          detalhe={
            detalheTempo ?? (
              info.quantidadeRespostasComTempo > 0
                ? t('bidfrete.detalhe_cotacao.info_respostas_n', '{{n}} respostas', {
                    n: info.quantidadeRespostasComTempo,
                  })
                : undefined
            )
          }
          destaque={info.tempoRespostaMediaHoras != null}
        />
        <CardInfografico
          icone={<CurrencyDollar weight="duotone" size={18} />}
          titulo={t('bidfrete.detalhe_cotacao.info_melhor_valor', 'Melhor valor')}
          valor={valorMelhorPreco}
          detalhe={detalheMelhorPreco}
          destaque={info.melhorValor != null}
        />
        <CardInfografico
          icone={<Trophy weight="duotone" size={18} />}
          titulo={t('bidfrete.detalhe_cotacao.info_ranking', 'Ranking')}
          valor={
            info.liderFornecedor != null ? (
              <span className="dc-info-card-valor--truncate" title={info.liderFornecedor}>
                {info.liderFornecedor.length > 18
                  ? `${info.liderFornecedor.slice(0, 16)}…`
                  : info.liderFornecedor}
              </span>
            ) : (
              '—'
            )
          }
          detalhe={detalheLider}
          destaque={info.liderFornecedor != null}
        />
        <InfograficoTransito info={info} t={t} />
      </div>

      {propostas.length >= 2 && (
        <div className="dc-info-legenda" aria-hidden>
          <ChartBar weight="duotone" size={12} />
          <span>
            {t('bidfrete.detalhe_cotacao.info_legenda', 'Insights com base em {{n}} propostas recebidas', {
              n: propostas.length,
            })}
          </span>
        </div>
      )}
    </div>
  )
}
