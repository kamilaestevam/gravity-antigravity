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
  Receipt,
  CurrencyDollar,
  Trophy,
  ChartBar,
  Lightning,
  Robot,
} from '@phosphor-icons/react'
import type { StatusCotacao } from './types'
import {
  calcularInfograficosFluxoCotacao,
  calcularPainelSmartInsights,
  FLUXO_ETAPAS_RESUMIDAS,
  formatarHorasResposta,
  indiceFluxoPorStatus,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import type {
  BarraComparativoInsight,
  ComparativoMetricaPainel,
  InfograficosFluxoCotacao,
  PainelSmartInsightsDados,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import type { TFunction } from 'i18next'
import {
  AnelProgressoInsight,
  GraficoAreaTermometro,
  SparkBarrasComparativo,
} from './graficos-insights-cotacao-bid-frete-internacional'
import type {
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  Cotacao,
} from './types'

const moeda = (val: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)

export function TimelineFluxoCotacao({ statusAtual }: { statusAtual: StatusCotacao }) {
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

function CelulaMetrica({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="dc-info-metrica">
      <span className="dc-info-metrica-label">{label}</span>
      <span className="dc-info-metrica-valor">{valor}</span>
    </div>
  )
}

function InfograficoResumoMelhorProposta({
  info,
  t,
}: {
  info: InfograficosFluxoCotacao
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  const resumo = info.melhorPropostaResumo

  if (!resumo) {
    return (
      <CardInfografico
        icone={<Receipt weight="duotone" size={18} />}
        titulo={t('bidfrete.detalhe_cotacao.info_resumo_proposta', 'Melhor proposta')}
        valor="—"
        vazio
      />
    )
  }

  const fmt = (val: number) => moeda(val, resumo.moeda)
  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const transbordo =
    resumo.quantidadeTransbordo === 0
      ? t('bidfrete.comparativo.direto', 'Direto')
      : String(resumo.quantidadeTransbordo)
  const freeTime =
    resumo.diasFreeTime != null ? `${resumo.diasFreeTime} ${diasLabel}` : '—'

  return (
    <div className="dc-info-card dc-info-card--wide dc-info-card--metricas">
      <div className="dc-info-card-icon" aria-hidden>
        <Receipt weight="duotone" size={18} />
      </div>
      <div className="dc-info-card-body dc-info-card-body--wide">
        <span className="dc-info-card-titulo">
          {t('bidfrete.detalhe_cotacao.info_resumo_proposta', 'Melhor proposta')}
        </span>
        <span className="dc-info-card-detalhe dc-info-card-detalhe--fornecedor" title={resumo.fornecedor}>
          {resumo.fornecedor.length > 28 ? `${resumo.fornecedor.slice(0, 26)}…` : resumo.fornecedor}
        </span>
        <div className="dc-info-metricas-grid" role="list">
          <CelulaMetrica
            label={t('bidfrete.detalhe_cotacao.info_valor_frete', 'Valor do frete')}
            valor={fmt(resumo.valorFrete)}
          />
          <CelulaMetrica
            label={t('bidfrete.detalhe_cotacao.info_valor_taxas', 'Valor taxas')}
            valor={fmt(resumo.valorTaxas)}
          />
          <CelulaMetrica
            label={t('bidfrete.detalhe_cotacao.info_valor_total', 'Valor total')}
            valor={fmt(resumo.valorTotal)}
          />
          <CelulaMetrica
            label={t('bidfrete.detalhe_cotacao.info_transito_total', 'Trânsito total')}
            valor={`${resumo.diasTransito} ${diasLabel}`}
          />
          <CelulaMetrica
            label={t('bidfrete.detalhe_cotacao.info_num_transbordo', 'Nº transbordo')}
            valor={transbordo}
          />
          <CelulaMetrica
            label={t('bidfrete.detalhe_cotacao.info_free_time', 'Free time')}
            valor={freeTime}
          />
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

function criarTextoVsGanhador(
  t: TFunction,
  melhorMenor: boolean,
  sufixoDiff: string,
): (barra: BarraComparativoInsight, valorGanhador: number) => string {
  return (barra, valorGanhador) => {
    if (barra.destaque) {
      return t('bidfrete.detalhe_cotacao.spark_melhor_proposta', 'Melhor proposta (ganhador)')
    }
    const diff = Math.abs(barra.valor - valorGanhador)
    if (diff === 0) {
      return t('bidfrete.detalhe_cotacao.spark_igual_ganhador', 'Igual ao ganhador')
    }
    const diffFmt = sufixoDiff ? `${diff} ${sufixoDiff}` : String(diff)
    if (melhorMenor) {
      if (barra.valor > valorGanhador) {
        return t('bidfrete.detalhe_cotacao.spark_pior_vs_ganhador', '+{{diff}} vs ganhador', { diff: diffFmt })
      }
      return t('bidfrete.detalhe_cotacao.spark_melhor_vs_ganhador', '{{diff}} melhor que o ganhador', { diff: diffFmt })
    }
    if (barra.valor < valorGanhador) {
      return t('bidfrete.detalhe_cotacao.spark_pior_vs_ganhador_menos', '−{{diff}} vs ganhador', { diff: diffFmt })
    }
    return t('bidfrete.detalhe_cotacao.spark_melhor_vs_ganhador_mais', '+{{diff}} vs ganhador', { diff: diffFmt })
  }
}

function CelulaMetricaComparativo({
  label,
  valor,
  comparativo,
  rotuloMetrica,
  formatarValor,
  sufixoDiff = '',
}: {
  label: string
  valor: string
  comparativo: ComparativoMetricaPainel | null
  rotuloMetrica: string
  formatarValor: (v: number) => string
  sufixoDiff?: string
}) {
  const { t } = useTranslation()
  const textoVsGanhador = comparativo != null
    ? criarTextoVsGanhador(t, comparativo.melhorMenor, sufixoDiff)
    : () => ''

  if (comparativo == null || comparativo.barras.length === 0) {
    return (
      <div className="dc-smart-metrica-col">
        <span className="dc-smart-metrica-label">{label}</span>
        <span className="dc-smart-metrica-valor">{valor}</span>
      </div>
    )
  }

  return (
    <div className="dc-smart-metrica-col">
      <span className="dc-smart-metrica-label">{label}</span>
      <span className="dc-smart-metrica-valor">{valor}</span>
      <div className="dc-smart-metrica-spark">
        <SparkBarrasComparativo
          barras={comparativo.barras}
          melhorMenor={comparativo.melhorMenor}
          variante="indigo"
          rotuloMetrica={rotuloMetrica}
          formatarValor={formatarValor}
          textoVsGanhador={textoVsGanhador}
        />
      </div>
    </div>
  )
}

function CardMelhorPropostaSmart({
  info,
  smart,
  t,
}: {
  info: InfograficosFluxoCotacao
  smart: PainelSmartInsightsDados
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  const resumo = info.melhorPropostaResumo
  if (!resumo) {
    return (
      <article className="dc-smart-card dc-smart-card--melhor dc-smart-card--vazio">
        <header className="dc-smart-card-head">
          <span>{t('bidfrete.detalhe_cotacao.cockpit_melhor_proposta', 'Melhor proposta')}</span>
        </header>
        <div className="dc-smart-card-body">
          <p className="dc-smart-vazio">—</p>
        </div>
      </article>
    )
  }

  const diasLabel = t('bidfrete.detalhe_cotacao.dias', 'dias')
  const freeTime = resumo.diasFreeTime != null ? `${resumo.diasFreeTime} ${diasLabel}` : '—'
  const escala = resumo.quantidadeEscala === 0
    ? t('bidfrete.comparativo.direto', 'Direto')
    : String(resumo.quantidadeEscala)
  const fmtDias = (v: number) => `${v} ${diasLabel}`
  const fmtEscala = (v: number) => (v === 0 ? t('bidfrete.comparativo.direto', 'Direto') : String(v))
  const rotuloTransit = t('bidfrete.detalhe_cotacao.cockpit_transit_time', 'Transit Time')
  const rotuloFree = t('bidfrete.detalhe_cotacao.info_free_time', 'Free Time')
  const rotuloEscala = t('bidfrete.detalhe_cotacao.cockpit_escala', 'Escala')

  return (
    <article className="dc-smart-card dc-smart-card--melhor">
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_melhor_proposta', 'Melhor proposta')}</span>
        <Trophy weight="duotone" size={22} className="dc-smart-trophy" aria-hidden />
      </header>
      <div className="dc-smart-card-body">
        <p className="dc-smart-valor-hero">{moeda(resumo.valorTotal, resumo.moeda)}</p>
        <div className="dc-smart-metricas-row" role="list">
          <CelulaMetricaComparativo
            label={rotuloTransit}
            valor={`${resumo.diasTransito} ${diasLabel}`}
            comparativo={smart.comparativoTransito}
            rotuloMetrica={rotuloTransit}
            formatarValor={fmtDias}
            sufixoDiff={diasLabel}
          />
          <CelulaMetricaComparativo
            label={rotuloFree}
            valor={freeTime}
            comparativo={smart.comparativoFreeTime}
            rotuloMetrica={rotuloFree}
            formatarValor={fmtDias}
            sufixoDiff={diasLabel}
          />
          <CelulaMetricaComparativo
            label={rotuloEscala}
            valor={escala}
            comparativo={smart.comparativoEscala}
            rotuloMetrica={rotuloEscala}
            formatarValor={fmtEscala}
            sufixoDiff={t('bidfrete.detalhe_cotacao.spark_sufixo_escala', 'escala(s)')}
          />
        </div>
      </div>
      <footer className="dc-smart-fornecedor-foot">
        <span className="dc-smart-fornecedor-avatar" aria-hidden>
          {resumo.fornecedor.slice(0, 1).toUpperCase()}
        </span>
        <span className="dc-smart-fornecedor-nome" title={resumo.fornecedor}>
          {resumo.fornecedor.length > 24 ? `${resumo.fornecedor.slice(0, 22)}…` : resumo.fornecedor}
        </span>
        <Trophy weight="fill" size={16} className="dc-smart-trophy-sm" aria-hidden />
      </footer>
    </article>
  )
}

function CardTermometroSmart({
  smart,
  t,
}: {
  smart: PainelSmartInsightsDados
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  const valorMedia = smart.termometroMedia6Meses != null
    ? moeda(smart.termometroMedia6Meses, smart.termometroMoeda)
    : '—'
  const savings = smart.termometroSavingsValor != null && smart.termometroSavingsValor > 0
    ? moeda(smart.termometroSavingsValor, smart.termometroMoeda)
    : null

  return (
    <article className="dc-smart-card dc-smart-card--termometro">
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_termometro', 'Termômetro histórico')}</span>
      </header>
      <div className="dc-smart-card-body dc-smart-card-body--termometro">
        <div className="dc-smart-termometro-topo">
          <div>
            <p className="dc-smart-valor-hero">{valorMedia}</p>
            <span className="dc-smart-termometro-sub">
              {t('bidfrete.detalhe_cotacao.cockpit_media_6_meses', 'Média 6 Meses')}
            </span>
          </div>
          {savings != null && (
            <span className="dc-smart-savings-pill">
              {t('bidfrete.detalhe_cotacao.cockpit_savings_valor', {
                valor: savings,
                defaultValue: `Savings de ${savings}`,
              })}
            </span>
          )}
        </div>
        <GraficoAreaTermometro serie={smart.serieHistorico6Meses} moeda={smart.termometroMoeda} />
      </div>
    </article>
  )
}

function CardResumoCompeticaoSmart({
  info,
  smart,
  propostas,
  t,
}: {
  info: InfograficosFluxoCotacao
  smart: PainelSmartInsightsDados
  propostas: PropostaRankingBidFreteInternacional[]
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  return (
    <article className="dc-smart-card dc-smart-card--resumo">
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_resumo_competicao', 'Resumo da competição')}</span>
      </header>
      <div className="dc-smart-card-body dc-smart-card-body--resumo">
      <div className="dc-smart-resumo-stats" role="list">
        <div className="dc-smart-resumo-stat" role="listitem">
          <span className="dc-smart-resumo-stat-val">{info.quantidadeDisparosEnviados}</span>
          <span className="dc-smart-resumo-stat-lbl">
            {t('bidfrete.detalhe_cotacao.cockpit_disparos', 'Disparos')}
          </span>
        </div>
        <span className="dc-smart-resumo-divider" aria-hidden />
        <div className="dc-smart-resumo-stat" role="listitem">
          <span className="dc-smart-resumo-stat-val">{propostas.length}</span>
          <span className="dc-smart-resumo-stat-lbl">
            {t('bidfrete.detalhe_cotacao.cockpit_respostas', 'Respostas')}
          </span>
        </div>
        <span className="dc-smart-resumo-divider" aria-hidden />
        <div className="dc-smart-resumo-stat" role="listitem">
          <span className="dc-smart-resumo-stat-val">{smart.quantidadeRecusasSemResposta}</span>
          <span className="dc-smart-resumo-stat-lbl">
            {t('bidfrete.detalhe_cotacao.cockpit_recusas', 'Recusas')}
          </span>
        </div>
      </div>
      <div className="dc-smart-ia-panel">
        <span className="dc-smart-ia-titulo">
          {t('bidfrete.detalhe_cotacao.cockpit_ia_trust', 'AI Trust Badge')}
        </span>
        <div className="dc-smart-ia-corpo">
          <div className="dc-smart-ia-confianca">
            <span className="dc-smart-ia-pct-grande">{smart.pctConfiabilidadeIa}%</span>
            <span className="dc-smart-ia-pct-legenda">
              {t('bidfrete.detalhe_cotacao.cockpit_confiabilidade', 'Confiabilidade')}
            </span>
            <div className="dc-smart-ia-bar" aria-hidden>
              <div className="dc-smart-ia-bar-fill" style={{ width: `${smart.pctConfiabilidadeIa}%` }} />
            </div>
          </div>
          <Robot weight="duotone" size={36} className="dc-smart-ia-mascote" aria-hidden />
          <AnelProgressoInsight pct={smart.pctCoberturaRespostas} variante="ambar" />
        </div>
      </div>
      </div>
    </article>
  )
}

export function InsightsGridFluxoCotacao({
  cotacao,
  disparos,
  propostas,
}: Pick<PainelFluxoInfograficosCotacaoProps, 'disparos' | 'propostas'> & {
  cotacao?: Cotacao | null
}) {
  const { t } = useTranslation()

  const info = useMemo(
    () => calcularInfograficosFluxoCotacao(disparos, propostas),
    [disparos, propostas],
  )

  const smart = useMemo(
    () => calcularPainelSmartInsights(disparos, propostas, info, cotacao?.historico_aprovado),
    [disparos, propostas, info, cotacao],
  )

  return (
    <div className="dc-smart-insights">
      <h2 className="dc-smart-insights-titulo">
        {t('bidfrete.detalhe_cotacao.cockpit_painel_titulo', 'Painel de Insights Inteligente')}
      </h2>
      <div className="dc-smart-insights-grid">
        <CardMelhorPropostaSmart info={info} smart={smart} t={t} />
        <CardTermometroSmart smart={smart} t={t} />
        <CardResumoCompeticaoSmart info={info} smart={smart} propostas={propostas} t={t} />
      </div>
      {propostas.length >= 2 && (
        <p className="dc-smart-legenda" aria-hidden>
          <ChartBar weight="duotone" size={12} />
          {t('bidfrete.detalhe_cotacao.info_legenda', 'Insights com base em {{n}} propostas recebidas', {
            n: propostas.length,
          })}
        </p>
      )}
    </div>
  )
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

  const detalheLider =
    info.liderScore != null
      ? t('bidfrete.detalhe_cotacao.info_score_lider', {
          score: info.liderScore,
          defaultValue: `Score ${info.liderScore}`,
        })
      : undefined

  return (
    <div className="dc-fluxo-painel-corpo">
      <TimelineFluxoCotacao statusAtual={statusAtual} />

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
        <InfograficoResumoMelhorProposta info={info} t={t} />
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
