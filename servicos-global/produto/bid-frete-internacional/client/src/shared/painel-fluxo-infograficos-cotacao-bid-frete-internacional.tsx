/**
 * Painel compacto: linha do tempo resumida + infográficos das propostas.
 */

import React, { useMemo, useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import {
  CheckCircle,
  Clock,
  Hourglass,
  UserCircle,
  Receipt,
  CurrencyDollar,
  Trophy,
  ChartBar,
  ChartLineUp,
  Lightning,
  PaperPlaneTilt,
  XCircle,
  Info,
  FunnelSimple,
  Check,
  X,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { StatusCotacao } from './types'
import {
  calcularInfograficosFluxoCotacao,
  calcularPainelSmartInsights,
  buildSerieTermometroBases,
  FLUXO_ETAPAS_RESUMIDAS,
  formatarHorasResposta,
  indiceFluxoPorStatus,
  montarConteudoAvisoGraficosInsights,
  formatarMoedaInsightsBidFrete,
  resolverNomeGanhadorCotacao,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import { filtrarHistoricoTermometro } from '../../../shared/filtro-historico-termometro-bid-frete-internacional'
import {
  calcularDatasEtapasFluxoTimeline,
  normalizarHistoricoTimeline,
} from './datas-fluxo-timeline-cotacao-bid-frete-internacional'
import { formatarDataBidFrete } from './formato-data-bid-frete'
import type {
  BarraComparativoInsight,
  ComparativoMetricaPainel,
  InfograficosFluxoCotacao,
  PainelSmartInsightsDados,
  TipoBaseTermometroHistorico,
  ComponentePrecoTermometro,
} from './infograficos-fluxo-cotacao-bid-frete-internacional'
import type { TFunction } from 'i18next'
import {
  GraficoAreaTermometro,
  SPARK_SLOT_MELHOR_PROPOSTA_PX,
  SPARK_VIEW_MELHOR_PROPOSTA,
  SparkBarrasComparativo,
} from './graficos-insights-cotacao-bid-frete-internacional'
import type {
  Cotacao,
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
} from './types'
import { INCOTERMS } from './types'
import { BotaoGlobal } from '@nucleo/botao-global'
import { listarUsuariosOrganizacao, getApiContext } from './api'
import { ModalAprovarPropostaBidFreteInternacional } from './modal-aprovar-proposta-bid-frete-internacional'
import {
  cotacaoPermiteAcoesResposta,
  ListaPropostasDetalheCotacao,
  propostaPermiteAcoes,
} from './propostas-detalhe-cotacao-bid-frete-internacional'

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

const ESTILO_COLUNA_METRICA_MELHOR: CSSProperties = {
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gridTemplateColumns: '1fr',
  gap: 4,
  minHeight: 0,
  minWidth: 0,
  height: '100%',
  alignSelf: 'stretch',
}

const ESTILO_SPARK_SLOT_MELHOR: CSSProperties = {
  height: '100%',
  minHeight: SPARK_SLOT_MELHOR_PROPOSTA_PX,
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  lineHeight: 0,
  overflow: 'hidden',
}

const ESTILO_METRICAS_ROW_MELHOR: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: '0.5rem',
  flex: '0 0 auto',
  width: '100%',
  minHeight: 0,
}

const ESTILO_BODY_MELHOR_PROPOSTA: CSSProperties = {
  flex: '0 0 auto',
  flexGrow: 0,
  minHeight: 0,
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
    <div
      className="dc-smart-metrica-col dc-smart-metrica-col--insights-spark"
      style={ESTILO_COLUNA_METRICA_MELHOR}
    >
      <div className="dc-smart-metrica-col-texto">
        <span className="dc-smart-metrica-label">{label}</span>
        <span className="dc-smart-metrica-valor">{valor}</span>
      </div>
      <div
        className="dc-smart-metrica-spark dc-smart-metrica-spark--melhor-proposta"
        style={ESTILO_SPARK_SLOT_MELHOR}
      >
        <SparkBarrasComparativo
          barras={comparativo.barras}
          melhorMenor={comparativo.melhorMenor}
          variante="indigo"
          rotuloMetrica={rotuloMetrica}
          formatarValor={formatarValor}
          textoVsGanhador={textoVsGanhador}
          dimensoesView={SPARK_VIEW_MELHOR_PROPOSTA}
          ancoraBarras="base"
          preencherSlot
        />
      </div>
    </div>
  )
}

function FaixaResumoAprovacaoInsightsCotacao({
  cotacao,
  propostasRanking,
  t,
}: {
  cotacao: Cotacao
  propostasRanking: PropostaRankingBidFreteInternacional[]
  t: TFunction
}) {
  const { getToken } = useAuth()
  const currentUser = useShellStore((s) => s.currentUser)
  const [nomeQuemAprovou, setNomeQuemAprovou] = useState<string | null>(null)

  const valor = cotacao.valor_aprovado_ganho_bid_frete_internacional
  const idUsuarioAprovacao = cotacao.id_usuario_aprovacao_ganho_bid_frete_internacional
  const nomeAprovacaoServidor = cotacao.nome_usuario_aprovacao_ganho_bid_frete_internacional
  const { userId: idUsuarioLogado, userName: nomeUsuarioLogado } = getApiContext()

  useEffect(() => {
    if (nomeAprovacaoServidor) {
      setNomeQuemAprovou(nomeAprovacaoServidor)
      return
    }
    if (!idUsuarioAprovacao) {
      setNomeQuemAprovou(null)
      return
    }
    if (idUsuarioLogado === idUsuarioAprovacao && nomeUsuarioLogado) {
      setNomeQuemAprovou(nomeUsuarioLogado)
      return
    }
    if (currentUser?.id === idUsuarioAprovacao && currentUser.name) {
      setNomeQuemAprovou(currentUser.name)
      return
    }

    let cancelado = false
    void (async () => {
      const usuarios = await listarUsuariosOrganizacao(getToken)
      if (cancelado) return
      const encontrado = usuarios.find((u) => u.id_usuario === idUsuarioAprovacao)
      setNomeQuemAprovou(encontrado?.nome_usuario ?? null)
    })()

    return () => {
      cancelado = true
    }
  }, [
    currentUser?.id,
    currentUser?.name,
    getToken,
    idUsuarioAprovacao,
    idUsuarioLogado,
    nomeAprovacaoServidor,
    nomeUsuarioLogado,
  ])

  if (valor == null) return null

  const moeda = cotacao.moeda_aprovada ?? 'USD'
  const valorFormatado = formatarMoedaInsightsBidFrete(valor, moeda)
  const nomeGanhador = resolverNomeGanhadorCotacao(cotacao, propostasRanking)
  const dataAprovacao = formatarDataBidFrete(cotacao.data_aprovacao_cotacao_bid_frete_internacional)
  const vazio = t('bidfrete.detalhe_cotacao.faixa_aprovacao_vazio', '—')
  const quemAprovou =
    nomeAprovacaoServidor ??
    nomeQuemAprovou ??
    (idUsuarioAprovacao && idUsuarioLogado === idUsuarioAprovacao ? nomeUsuarioLogado : null) ??
    vazio

  const itens = [
    {
      rotulo: t('bidfrete.detalhe_cotacao.faixa_aprovacao_valor', 'Valor aprovado'),
      valor: valorFormatado,
      destaque: true,
    },
    {
      rotulo: t('bidfrete.detalhe_cotacao.faixa_aprovacao_data', 'Data da aprovação'),
      valor: cotacao.data_aprovacao_cotacao_bid_frete_internacional ? dataAprovacao : vazio,
      destaque: false,
    },
    {
      rotulo: t('bidfrete.detalhe_cotacao.faixa_aprovacao_ganhador', 'Ganhador'),
      valor: nomeGanhador ?? vazio,
      destaque: false,
    },
    {
      rotulo: t('bidfrete.detalhe_cotacao.faixa_aprovacao_quem', 'Quem aprovou'),
      valor: quemAprovou,
      destaque: false,
    },
  ]

  return (
    <div className="dc-smart-faixa-aprovada" role="status" aria-live="polite">
      <div className="dc-smart-faixa-aprovada-cabecalho">
        <CheckCircle weight="fill" size={20} className="dc-smart-faixa-aprovada-icone" aria-hidden />
        <span className="dc-smart-faixa-aprovada-titulo">
          {t('bidfrete.detalhe_cotacao.aprovado', 'Aprovada')}
        </span>
      </div>
      <dl className="dc-smart-faixa-aprovada-grid">
        {itens.map((item) => (
          <div
            key={item.rotulo}
            className={`dc-smart-faixa-aprovada-item${item.destaque ? ' dc-smart-faixa-aprovada-item--destaque' : ''}`}
          >
            <dt className="dc-smart-faixa-aprovada-label">{item.rotulo}</dt>
            <dd className="dc-smart-faixa-aprovada-valor">{item.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function AvisoGraficosInsightsCotacao({
  status,
  info,
  smart,
  quantidadePropostas,
  t,
}: {
  status?: StatusCotacao | null
  info: InfograficosFluxoCotacao
  smart: PainelSmartInsightsDados
  quantidadePropostas: number
  t: TFunction
}) {
  const conteudo = useMemo(
    () => montarConteudoAvisoGraficosInsights(
      status,
      quantidadePropostas,
      info.quantidadeDisparosEnviados,
      t,
    ),
    [status, quantidadePropostas, info.quantidadeDisparosEnviados, t],
  )

  if (conteudo == null) return null

  const IconePrincipal =
    conteudo.variante === 'aguardando'
      ? PaperPlaneTilt
      : conteudo.variante === 'comparativo_parcial'
        ? ChartLineUp
        : Info

  return (
    <aside
      className={`dc-smart-aviso-graficos dc-smart-aviso-graficos--${conteudo.variante}`}
      role="status"
      aria-live="polite"
      aria-label={conteudo.titulo}
    >
      <div className="dc-smart-aviso-graficos-icone" aria-hidden>
        <IconePrincipal weight="duotone" size={26} />
      </div>
      <div className="dc-smart-aviso-graficos-corpo">
        <p className="dc-smart-aviso-graficos-titulo">{conteudo.titulo}</p>
        <p className="dc-smart-aviso-graficos-texto">{conteudo.texto}</p>
        <ul className="dc-smart-aviso-graficos-passos">
          {conteudo.passos.map((passo) => (
            <li key={passo}>
              <CheckCircle weight="duotone" size={14} className="dc-smart-aviso-graficos-passo-icone" aria-hidden />
              <span>{passo}</span>
            </li>
          ))}
        </ul>
        {smart.termometroDadosDemonstracao && (
          <p className="dc-smart-aviso-graficos-nota-termometro">
            <span>
              {t(
                'bidfrete.detalhe_cotacao.cockpit_aviso_graficos_termometro',
                'O termômetro histórico será preenchido quando existirem dados nas mesmas condições.',
              )}
            </span>
          </p>
        )}
      </div>
    </aside>
  )
}

function CardMelhorPropostaSmart({
  info,
  smart,
  id_cotacao_bid_frete_internacional,
  status_cotacao_bid_frete_internacional,
  propostasRanking,
  empresa_pagadora_taxa_fechamento_plataforma_gravity,
  onCotacaoAtualizada,
  t,
}: {
  info: InfograficosFluxoCotacao
  smart: PainelSmartInsightsDados
  id_cotacao_bid_frete_internacional?: string | null
  status_cotacao_bid_frete_internacional?: StatusCotacao | null
  propostasRanking: PropostaRankingBidFreteInternacional[]
  empresa_pagadora_taxa_fechamento_plataforma_gravity?: Cotacao['empresa_pagadora_taxa_fechamento_plataforma_gravity']
  onCotacaoAtualizada?: (cotacaoAtualizada?: Cotacao) => void
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  const [modalAprovar, setModalAprovar] = useState(false)

  const resumo = info.melhorPropostaResumo
  const propostaMelhor = useMemo(
    () => (resumo
      ? propostasRanking.find(
        (p) => p.id_proposta_bid_frete_internacional === resumo.id_proposta_bid_frete_internacional,
      ) ?? null
      : null),
    [propostasRanking, resumo],
  )

  const exibirAprovar = Boolean(
    id_cotacao_bid_frete_internacional
    && propostaMelhor
    && propostasRanking.length > 0
    && cotacaoPermiteAcoesResposta(status_cotacao_bid_frete_internacional)
    && propostaPermiteAcoes(propostaMelhor),
  )

  function abrirModalAprovar() {
    if (!propostaMelhor) return
    setModalAprovar(true)
  }

  function fecharModalAprovar() {
    setModalAprovar(false)
  }

  function aoAprovarProposta(cotAtualizada: Cotacao) {
    onCotacaoAtualizada?.(cotAtualizada)
    fecharModalAprovar()
  }

  if (!resumo) {
    return (
      <article className="dc-smart-card dc-smart-card--melhor dc-smart-card--vazio">
        <header className="dc-smart-card-head">
          <span>{t('bidfrete.detalhe_cotacao.cockpit_melhor_proposta', 'Melhor proposta')}</span>
        </header>
        <div className="dc-smart-card-body dc-smart-card-body--ranking">
          <div className="dc-empty">
            <PaperPlaneTilt weight="duotone" size={40} style={{ opacity: 0.3 }} />
            <p>{t('bidfrete.detalhe_cotacao.vazio_respostas')}</p>
          </div>
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
    <article
      className="dc-smart-card dc-smart-card--melhor dc-smart-card--melhor-compacto"
      data-layout-melhor-proposta="compacto-v2"
    >
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_melhor_proposta', 'Melhor proposta')}</span>
        <Trophy weight="duotone" size={18} className="dc-smart-trophy" aria-hidden />
      </header>
      <div
        className="dc-smart-card-body dc-smart-card-body--melhor-proposta"
        style={ESTILO_BODY_MELHOR_PROPOSTA}
      >
        <p className="dc-smart-valor-hero">{moeda(resumo.valorTotal, resumo.moeda)}</p>
        <div
          className="dc-smart-metricas-row dc-smart-metricas-row--melhor-proposta"
          role="list"
          style={ESTILO_METRICAS_ROW_MELHOR}
        >
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
        {exibirAprovar && (
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            className="dc-prop-btn-aprovar dc-smart-btn-aprovar"
            icone={<CheckCircle weight="bold" size={14} />}
            onClick={abrirModalAprovar}
            disabled={modalAprovar}
          >
            {t('bidfrete.comparativo.aprovar', 'Aprovar')}
          </BotaoGlobal>
        )}
      </footer>
      {propostaMelhor && id_cotacao_bid_frete_internacional && (
        <ModalAprovarPropostaBidFreteInternacional
          aberto={modalAprovar}
          id_cotacao_bid_frete_internacional={id_cotacao_bid_frete_internacional}
          proposta={propostaMelhor}
          empresa_pagadora_taxa_fechamento_plataforma_gravity={
            empresa_pagadora_taxa_fechamento_plataforma_gravity
          }
          onFechar={fecharModalAprovar}
          onAprovado={aoAprovarProposta}
        />
      )}
    </article>
  )
}

const COMPONENTES_TERMOMETRO: ComponentePrecoTermometro[] = [
  'FRETE_BASE',
  'TAXAS_ORIGEM',
  'TAXAS_DESTINO',
  'TOTAL',
]

function rotuloComponenteTermometro(
  componente: ComponentePrecoTermometro,
  t: (k: string, d?: string) => string,
): string {
  switch (componente) {
    case 'FRETE_BASE':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_frete', 'Frete base')
    case 'TAXAS_ORIGEM':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_origem', 'Taxas origem')
    case 'TAXAS_DESTINO':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_destino', 'Taxas destino')
    case 'TOTAL':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_total', 'Total')
    default:
      return componente
  }
}

function CardTermometroHistoricoSmart({
  cotacao,
  propostas,
  info,
  historico_aprovado,
  historico_propostas_recebidas,
  t,
}: {
  cotacao: Cotacao | null | undefined
  propostas: PropostaRankingBidFreteInternacional[]
  info: InfograficosFluxoCotacao
  historico_aprovado?: Cotacao['historico_aprovado']
  historico_propostas_recebidas?: Cotacao['historico_propostas_recebidas']
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  const [bases, setBases] = useState<TipoBaseTermometroHistorico[]>(['CONTRATADO'])
  const [componentes, setComponentes] = useState<ComponentePrecoTermometro[]>(['FRETE_BASE'])
  // Vazio = todos os incoterms (sem filtro)
  const [incotermsSelecionados, setIncotermsSelecionados] = useState<string[]>([])

  const alternarIncoterm = useCallback((item: string) => {
    setIncotermsSelecionados((atual) => (
      atual.includes(item) ? atual.filter((i) => i !== item) : [...atual, item]
    ))
  }, [])

  const alternarBase = useCallback((item: TipoBaseTermometroHistorico) => {
    setBases((atual) => {
      const proximo = atual.includes(item)
        ? atual.filter((b) => b !== item)
        : [...atual, item]
      // Nunca deixar a seleção vazia
      return proximo.length > 0 ? proximo : atual
    })
  }, [])

  const alternarComponente = useCallback((item: ComponentePrecoTermometro) => {
    setComponentes((atual) => {
      // TOTAL já é a soma completa da proposta — seleção exclusiva
      if (item === 'TOTAL') return ['TOTAL']
      const semTotal = atual.filter((c) => c !== 'TOTAL')
      const proximo = semTotal.includes(item)
        ? semTotal.filter((c) => c !== item)
        : [...semTotal, item]
      // Nunca deixar a seleção vazia
      return proximo.length > 0 ? proximo : atual
    })
  }, [])
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const filtroBotaoRef = useRef<HTMLDivElement>(null)
  const filtroPainelRef = useRef<HTMLDivElement>(null)
  const [filtroCoords, setFiltroCoords] = useState({ top: 0, right: 0 })

  const atualizarFiltroCoords = useCallback(() => {
    if (!filtroBotaoRef.current) return
    const r = filtroBotaoRef.current.getBoundingClientRect()
    setFiltroCoords({ top: r.bottom + 6, right: window.innerWidth - r.right })
  }, [])

  useEffect(() => {
    if (!filtrosAbertos) return
    atualizarFiltroCoords()
    window.addEventListener('resize', atualizarFiltroCoords)
    window.addEventListener('scroll', atualizarFiltroCoords, true)
    return () => {
      window.removeEventListener('resize', atualizarFiltroCoords)
      window.removeEventListener('scroll', atualizarFiltroCoords, true)
    }
  }, [filtrosAbertos, atualizarFiltroCoords])

  useEffect(() => {
    if (!filtrosAbertos) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (filtroBotaoRef.current?.contains(target)) return
      if (filtroPainelRef.current?.contains(target)) return
      setFiltrosAbertos(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filtrosAbertos])

  const referenciaTermometro = useMemo(() => {
    if (cotacao == null) return null
    return {
      id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
      tipo_operacao_cotacao_bid_frete_internacional: cotacao.tipo_operacao_cotacao_bid_frete_internacional,
      modal_cotacao_bid_frete_internacional: cotacao.modal_cotacao_bid_frete_internacional,
      origem_codigo_cotacao_bid_frete_internacional: cotacao.origem_codigo_cotacao_bid_frete_internacional,
      destino_codigo_cotacao_bid_frete_internacional: cotacao.destino_codigo_cotacao_bid_frete_internacional,
      modalidade_cotacao_bid_frete_internacional: cotacao.modalidade_cotacao_bid_frete_internacional,
      tipo_container_cotacao_bid_frete_internacional: cotacao.tipo_container_cotacao_bid_frete_internacional,
      incoterm_cotacao_bid_frete_internacional: cotacao.incoterm_cotacao_bid_frete_internacional,
      peso_kg_cotacao_bid_frete_internacional: cotacao.peso_kg_cotacao_bid_frete_internacional,
      peso_ton_cotacao_bid_frete_internacional: cotacao.peso_ton_cotacao_bid_frete_internacional,
      cubagem_m3_cotacao_bid_frete_internacional: cotacao.cubagem_m3_cotacao_bid_frete_internacional,
    }
  }, [cotacao])

  const entradasBases = useMemo(() => {
    return bases.map((tipoBase) => {
      const bruto = tipoBase === 'CONTRATADO' ? historico_aprovado : historico_propostas_recebidas
      const historico = referenciaTermometro == null
        ? bruto
        : filtrarHistoricoTermometro(referenciaTermometro, bruto, {
          incoterms: incotermsSelecionados,
        })
      return { tipoBase, historico }
    })
  }, [
    bases,
    historico_aprovado,
    historico_propostas_recebidas,
    referenciaTermometro,
    incotermsSelecionados,
  ])

  const termometro = useMemo(
    () => buildSerieTermometroBases(propostas, entradasBases, componentes),
    [propostas, entradasBases, componentes],
  )

  const aguardandoDados = termometro.termometroDadosDemonstracao
  const valorMercado = !aguardandoDados && termometro.termometroMedia6Meses != null
    ? moeda(termometro.termometroMedia6Meses, info.melhorValorMoeda)
    : '—'
  const valorDele = termometro.termometroValorDele != null
    ? moeda(termometro.termometroValorDele, info.melhorValorMoeda)
    : '—'
  const savings = !aguardandoDados
    && termometro.termometroSavingsValor != null
    && termometro.termometroSavingsValor > 0
    ? moeda(termometro.termometroSavingsValor, info.melhorValorMoeda)
    : null
  const contexto = t(
    'bidfrete.detalhe_cotacao.cockpit_termometro_contexto_resumo',
    'Mesma operação, rota e modal — ver documentação para faixas',
  )
  const mensagemAguardando = bases.length > 1
    ? t(
      'bidfrete.detalhe_cotacao.cockpit_termometro_aguardando_dados_ambas',
      'Aguardando cotações aprovadas ou com proposta nas mesmas condições.',
    )
    : bases[0] === 'CONTRATADO'
      ? t(
        'bidfrete.detalhe_cotacao.cockpit_termometro_aguardando_dados',
        'Aguardando cotações aprovadas nas mesmas condições.',
      )
      : t(
        'bidfrete.detalhe_cotacao.cockpit_termometro_aguardando_dados_propostas',
        'Aguardando cotações com proposta nas mesmas condições.',
      )

  const incotermCotacao = cotacao?.incoterm_cotacao_bid_frete_internacional?.trim() ?? ''
  const filtrosDestacados =
    bases.length !== 1
    || bases[0] !== 'CONTRATADO'
    || componentes.length !== 1
    || componentes[0] !== 'FRETE_BASE'
    || incotermsSelecionados.length > 0

  const rotuloComponentes = componentes
    .map((item) => rotuloComponenteTermometro(item, t))
    .join(' + ')

  // Lista de seleções ativas para o chip de filtros (padrão fc-chip da plataforma)
  const selecoesFiltros = [
    ...(['CONTRATADO', 'PROPOSTAS_RECEBIDAS'] as const)
      .filter((item) => bases.includes(item))
      .map((item) => item === 'CONTRATADO'
        ? t('bidfrete.detalhe_cotacao.cockpit_termometro_base_contratado', 'Contratado')
        : t('bidfrete.detalhe_cotacao.cockpit_termometro_base_propostas', 'Propostas')),
    ...componentes.map((item) => rotuloComponenteTermometro(item, t)),
    ...incotermsSelecionados,
  ]

  // Híbrido (padrão rotulofiltro): até 2 nomes diretos; 3+ consolida em "N selecionados"
  const valorChipFiltros = selecoesFiltros.length <= 2
    ? selecoesFiltros.join(', ')
    : t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros_n', {
      n: selecoesFiltros.length,
      defaultValue: `${selecoesFiltros.length} selecionados`,
    })

  const limparFiltrosTermometro = () => {
    setBases(['CONTRATADO'])
    setComponentes(['FRETE_BASE'])
    setIncotermsSelecionados([])
  }

  const painelFiltros = filtrosAbertos && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={filtroPainelRef}
          className="dc-termometro-filtros-painel"
          style={{ top: filtroCoords.top, right: filtroCoords.right }}
          role="dialog"
          aria-label={t(
            'bidfrete.detalhe_cotacao.cockpit_termometro_filtros_aria',
            'Filtros do termômetro histórico',
          )}
        >
          <div
            className="dc-termometro-filtros-secao"
            role="listbox"
            aria-multiselectable="true"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_seletor_aria',
              'Base do termômetro histórico',
            )}
          >
            <span className="dc-termometro-filtros-secao-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_base_label', 'Base')}
            </span>
            {(['CONTRATADO', 'PROPOSTAS_RECEBIDAS'] as const).map((item) => {
              const ativo = bases.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  className={`dc-termometro-filtros-opcao${ativo ? ' dc-termometro-filtros-opcao--ativa' : ''}`}
                  onClick={() => alternarBase(item)}
                >
                  <span
                    className={`dc-termometro-filtros-check dc-termometro-filtros-check--caixa${ativo ? ' dc-termometro-filtros-check--marcado' : ''}`}
                    aria-hidden
                  >
                    {ativo ? <Check size={11} weight="bold" /> : null}
                  </span>
                  {item === 'CONTRATADO'
                    ? t('bidfrete.detalhe_cotacao.cockpit_termometro_base_contratado', 'Contratado')
                    : t('bidfrete.detalhe_cotacao.cockpit_termometro_base_propostas', 'Propostas')}
                </button>
              )
            })}
          </div>
          <div className="dc-termometro-filtros-separador" role="separator" />
          <div
            className="dc-termometro-filtros-secao"
            role="listbox"
            aria-multiselectable="true"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_componente_aria',
              'Componente de preço',
            )}
          >
            <span className="dc-termometro-filtros-secao-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_componente', 'Componente')}
            </span>
            {COMPONENTES_TERMOMETRO.map((item) => {
              const ativo = componentes.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  className={`dc-termometro-filtros-opcao${ativo ? ' dc-termometro-filtros-opcao--ativa' : ''}`}
                  onClick={() => alternarComponente(item)}
                >
                  <span
                    className={`dc-termometro-filtros-check dc-termometro-filtros-check--caixa${ativo ? ' dc-termometro-filtros-check--marcado' : ''}`}
                    aria-hidden
                  >
                    {ativo ? <Check size={11} weight="bold" /> : null}
                  </span>
                  {rotuloComponenteTermometro(item, t)}
                </button>
              )
            })}
          </div>
          <div className="dc-termometro-filtros-separador" role="separator" />
          <div
            className="dc-termometro-filtros-secao"
            role="listbox"
            aria-multiselectable="true"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_aria',
              'Filtrar por incoterm',
            )}
          >
            <span className="dc-termometro-filtros-secao-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_label', 'Incoterm')}
            </span>
            <button
              type="button"
              role="option"
              aria-selected={incotermsSelecionados.length === 0}
              className={`dc-termometro-filtros-opcao${incotermsSelecionados.length === 0 ? ' dc-termometro-filtros-opcao--ativa' : ''}`}
              onClick={() => setIncotermsSelecionados([])}
            >
              <span
                className={`dc-termometro-filtros-check dc-termometro-filtros-check--caixa${incotermsSelecionados.length === 0 ? ' dc-termometro-filtros-check--marcado' : ''}`}
                aria-hidden
              >
                {incotermsSelecionados.length === 0 ? <Check size={11} weight="bold" /> : null}
              </span>
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_todos', 'Todos')}
            </button>
            <div className="dc-termometro-filtros-incoterm-grid">
              {INCOTERMS.map((item) => {
                const ativo = incotermsSelecionados.includes(item)
                const daCotacao = item === incotermCotacao
                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={ativo}
                    className={`dc-termometro-filtros-incoterm-chip${ativo ? ' dc-termometro-filtros-incoterm-chip--ativo' : ''}${daCotacao ? ' dc-termometro-filtros-incoterm-chip--cotacao' : ''}`}
                    title={daCotacao
                      ? t(
                        'bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_da_cotacao',
                        'Incoterm desta cotação',
                      )
                      : undefined}
                    onClick={() => alternarIncoterm(item)}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <article
      className={`dc-smart-card dc-smart-card--termometro${aguardandoDados ? ' dc-smart-card--vazio' : ''}`}
    >
      <header className="dc-smart-card-head dc-smart-card-head--termometro">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_termometro', 'Termômetro histórico')}</span>
        <div className="dc-termometro-head-acoes" ref={filtroBotaoRef}>
          {filtrosDestacados && (
            <span className="dc-termometro-chip" role="status">
              <TooltipGlobal
                titulo={t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}
                descricao={(
                  <ol
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.125rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {selecoesFiltros.map((item, i) => (
                      <li key={item} style={{ display: 'flex', gap: '0.45rem' }}>
                        <span style={{ opacity: 0.55, minWidth: '1.4rem', textAlign: 'right' }}>
                          {i + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              >
                <button
                  type="button"
                  className="dc-termometro-chip-body"
                  onClick={() => setFiltrosAbertos(true)}
                >
                  <span className="dc-termometro-chip-label">
                    {t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}:
                  </span>
                  <span className="dc-termometro-chip-valor">{valorChipFiltros}</span>
                </button>
              </TooltipGlobal>
              <button
                type="button"
                className="dc-termometro-chip-remove"
                aria-label={t(
                  'bidfrete.detalhe_cotacao.cockpit_termometro_filtros_limpar',
                  'Limpar filtros do termômetro',
                )}
                onClick={limparFiltrosTermometro}
              >
                <X size={9} weight="bold" aria-hidden />
              </button>
            </span>
          )}
          <button
            type="button"
            className={`dc-termometro-filtros-botao${filtrosDestacados ? ' dc-termometro-filtros-botao--destacado' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={filtrosAbertos}
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_filtros_aria',
              'Filtros do termômetro histórico',
            )}
            title={t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}
            onClick={() => setFiltrosAbertos((v) => !v)}
          >
            <FunnelSimple weight={filtrosDestacados ? 'fill' : 'duotone'} size={14} aria-hidden />
          </button>
        </div>
      </header>
      {painelFiltros}
      <div className="dc-smart-termometro-canvas">
        {!aguardandoDados && (
          <div className="dc-smart-termometro-canvas-metricas">
            <div className="dc-smart-termometro-dele-mercado">
              <div className="dc-smart-termometro-preco">
                <span className="dc-smart-termometro-preco-rotulo">
                  {t('bidfrete.detalhe_cotacao.cockpit_termometro_dele', 'Dele')}
                </span>
                <p className="dc-smart-valor-hero dc-smart-valor-hero--secundario">{valorDele}</p>
              </div>
              <div className="dc-smart-termometro-preco dc-smart-termometro-preco--mercado">
                <span className="dc-smart-termometro-preco-rotulo">
                  {t('bidfrete.detalhe_cotacao.cockpit_termometro_mercado', 'Mercado')}
                </span>
                <p className="dc-smart-valor-hero">{valorMercado}</p>
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
            <span className="dc-smart-termometro-contexto" title={contexto}>
              {rotuloComponentes}
            </span>
          </div>
        )}
        <div
          className={`dc-term-chart-slot${aguardandoDados ? ' dc-term-chart-slot--aguardando' : ''}`}
        >
          {aguardandoDados ? (
            <div className="dc-smart-termometro-canvas-vazio">
              <ChartLineUp weight="duotone" size={32} style={{ opacity: 0.28 }} />
              <p>{mensagemAguardando}</p>
              <span
                className="dc-smart-termometro-contexto dc-smart-termometro-contexto--vazio"
                title={contexto}
              >
                {contexto}
              </span>
            </div>
          ) : (
            <GraficoAreaTermometro
              serie={termometro.serieHistorico6Meses ?? []}
              moeda={info.melhorValorMoeda}
              mediaFallback={termometro.termometroMedia6Meses}
              modoDemonstracao={false}
            />
          )}
        </div>
      </div>
    </article>
  )
}

function CardRankingRespostasInsights({
  id_cotacao_bid_frete_internacional,
  status_cotacao_bid_frete_internacional,
  propostasRanking,
  carregandoRanking,
  empresa_pagadora_taxa_fechamento_plataforma_gravity,
  onCotacaoAtualizada,
  t,
}: {
  id_cotacao_bid_frete_internacional: string
  status_cotacao_bid_frete_internacional?: StatusCotacao | null
  propostasRanking: PropostaRankingBidFreteInternacional[]
  carregandoRanking: boolean
  empresa_pagadora_taxa_fechamento_plataforma_gravity?: Cotacao['empresa_pagadora_taxa_fechamento_plataforma_gravity']
  onCotacaoAtualizada?: (cotacaoAtualizada?: Cotacao) => void
  t: (k: string, d?: string | Record<string, unknown>) => string
}) {
  return (
    <article className="dc-smart-card dc-smart-card--ranking">
      <header className="dc-smart-card-head">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_combat_matrix', 'Ranking das respostas')}</span>
      </header>
      <div className="dc-smart-card-body dc-smart-card-body--ranking">
        <ListaPropostasDetalheCotacao
          id_cotacao_bid_frete_internacional={id_cotacao_bid_frete_internacional}
          status_cotacao_bid_frete_internacional={status_cotacao_bid_frete_internacional}
          propostasRanking={propostasRanking}
          carregandoRanking={carregandoRanking}
          variante="combate"
          onCotacaoAtualizada={onCotacaoAtualizada}
          empresa_pagadora_taxa_fechamento_plataforma_gravity={
            empresa_pagadora_taxa_fechamento_plataforma_gravity
          }
        />
      </div>
    </article>
  )
}

const STATUS_COTACAO_BLOQUEIA_DISPARO: StatusCotacao[] = [
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'EXPIRADA',
]

export function podeDispararCotacaoBidFrete(status: StatusCotacao | null | undefined): boolean {
  if (!status) return false
  return !STATUS_COTACAO_BLOQUEIA_DISPARO.includes(status)
}

function RotuloSegmentoCompeticao({
  rotulo,
  rotuloLinhas,
}: {
  rotulo?: string
  rotuloLinhas?: readonly [string, string]
}) {
  if (rotuloLinhas) {
    return (
      <span className="dc-competicao-seg-lbl dc-competicao-seg-lbl--duas-linhas">
        <span className="dc-competicao-seg-lbl-linha">{rotuloLinhas[0]}</span>
        <span className="dc-competicao-seg-lbl-linha">{rotuloLinhas[1]}</span>
      </span>
    )
  }
  return <span className="dc-competicao-seg-lbl">{rotulo}</span>
}

function SegmentoCompeticaoHero({
  rotulo,
  rotuloLinhas,
  valor,
  variante,
  icone,
  interativo = false,
  onAcao,
  habilitado = true,
  titulo,
}: {
  rotulo?: string
  rotuloLinhas?: readonly [string, string]
  valor: number
  variante: 'disparos' | 'respostas' | 'recusas'
  icone: React.ReactNode
  interativo?: boolean
  onAcao?: () => void
  habilitado?: boolean
  titulo?: string
}) {
  const rotuloTexto = rotuloLinhas ? rotuloLinhas.join(' ') : (rotulo ?? '')
  const rotuloAcessivel = titulo ?? `${rotuloTexto}: ${valor}`
  const classe = [
    'dc-competicao-seg',
    `dc-competicao-seg--${variante}`,
    interativo ? 'dc-competicao-seg--acao' : '',
    interativo && habilitado ? 'dc-competicao-seg--acao-ativo' : '',
    interativo && !habilitado ? 'dc-competicao-seg--acao-inativo' : '',
  ].filter(Boolean).join(' ')

  if (interativo) {
    return (
      <button
        type="button"
        className={classe}
        onClick={habilitado ? onAcao : undefined}
        disabled={!habilitado}
        title={rotuloAcessivel}
        aria-label={rotuloAcessivel}
      >
        <span className="dc-competicao-seg-icone" aria-hidden>{icone}</span>
        <span className="dc-competicao-seg-val">{valor}</span>
        <RotuloSegmentoCompeticao rotulo={rotulo} rotuloLinhas={rotuloLinhas} />
      </button>
    )
  }

  return (
    <div className={classe} title={rotuloAcessivel} aria-label={rotuloAcessivel}>
      <span className="dc-competicao-seg-icone" aria-hidden>{icone}</span>
      <span className="dc-competicao-seg-val">{valor}</span>
      <RotuloSegmentoCompeticao rotulo={rotulo} rotuloLinhas={rotuloLinhas} />
    </div>
  )
}

function ResumoCompeticaoHero({
  info,
  smart,
  propostas,
  t,
  onIrDisparos,
  onIrRespostas,
  onIrRecusas,
}: {
  info: InfograficosFluxoCotacao
  smart: PainelSmartInsightsDados
  propostas: PropostaRankingBidFreteInternacional[]
  t: (k: string, d?: string | Record<string, unknown>) => string
  onIrDisparos?: () => void
  onIrRespostas?: () => void
  onIrRecusas?: () => void
}) {
  const rotuloDisparosLinhas: readonly [string, string] = [
    t('bidfrete.detalhe_cotacao.cockpit_disparos_linha1', 'Solicitações de'),
    t('bidfrete.detalhe_cotacao.cockpit_disparos_linha2', 'cotação'),
  ]
  const rotuloRespostas = t('bidfrete.detalhe_cotacao.cockpit_respostas', 'Respostas')
  const rotuloRecusas = t('bidfrete.detalhe_cotacao.cockpit_recusas', 'Recusas')

  return (
    <div
      className="dc-cockpit-competicao-resumo"
      role="group"
      aria-label={t('bidfrete.detalhe_cotacao.cockpit_metricas_competicao', 'Métricas da competição')}
    >
      <SegmentoCompeticaoHero
        rotuloLinhas={rotuloDisparosLinhas}
        valor={info.quantidadeDisparosEnviados}
        variante="disparos"
        icone={<PaperPlaneTilt weight="duotone" size={16} />}
        interativo={onIrDisparos != null}
        onAcao={onIrDisparos}
        titulo={t('bidfrete.detalhe_cotacao.ir_aba_disparos', {
          n: info.quantidadeDisparosEnviados,
          defaultValue: `Ver ${info.quantidadeDisparosEnviados} disparos`,
        })}
      />
      <span className="dc-competicao-seg-divider" aria-hidden />
      <SegmentoCompeticaoHero
        rotulo={rotuloRespostas}
        valor={propostas.length}
        variante="respostas"
        icone={<CheckCircle weight="duotone" size={16} />}
        interativo={onIrRespostas != null}
        onAcao={onIrRespostas}
        titulo={t('bidfrete.detalhe_cotacao.ir_aba_respostas', {
          n: propostas.length,
          defaultValue: `Ver ${propostas.length} respostas`,
        })}
      />
      <span className="dc-competicao-seg-divider" aria-hidden />
      <SegmentoCompeticaoHero
        rotulo={rotuloRecusas}
        valor={smart.quantidadeRecusasSemResposta}
        variante="recusas"
        icone={<XCircle weight="duotone" size={16} />}
        interativo={onIrRecusas != null}
        onAcao={onIrRecusas}
        titulo={t('bidfrete.detalhe_cotacao.ir_aba_recusas', {
          n: smart.quantidadeRecusasSemResposta,
          defaultValue: `Ver ${smart.quantidadeRecusasSemResposta} recusas sem resposta`,
        })}
      />
    </div>
  )
}

export interface MetricasCompeticaoHeroCotacaoProps {
  disparos: DisparoCotacaoBidFreteInternacional[]
  propostas: PropostaRankingBidFreteInternacional[]
  historico_aprovado?: Cotacao['historico_aprovado']
  onIrDisparos?: () => void
  onIrRespostas?: () => void
  onIrRecusas?: () => void
}

/** Disparos / Respostas / Recusas — faixa superior do cockpit (hero). */
export function MetricasCompeticaoHeroCotacao({
  disparos,
  propostas,
  historico_aprovado,
  onIrDisparos,
  onIrRespostas,
  onIrRecusas,
}: MetricasCompeticaoHeroCotacaoProps) {
  const { t } = useTranslation()

  const info = useMemo(
    () => calcularInfograficosFluxoCotacao(disparos, propostas),
    [disparos, propostas],
  )

  const smart = useMemo(
    () => calcularPainelSmartInsights(disparos, propostas, info, historico_aprovado),
    [disparos, propostas, info, historico_aprovado],
  )

  return (
    <ResumoCompeticaoHero
      info={info}
      smart={smart}
      propostas={propostas}
      t={t}
      onIrDisparos={onIrDisparos}
      onIrRespostas={onIrRespostas}
      onIrRecusas={onIrRecusas}
    />
  )
}

export interface InsightsGridFluxoCotacaoProps {
  cotacao?: Cotacao | null
  disparos: DisparoCotacaoBidFreteInternacional[]
  propostas: PropostaRankingBidFreteInternacional[]
  id_cotacao_bid_frete_internacional?: string | null
  status_cotacao_bid_frete_internacional?: StatusCotacao | null
  propostasRanking?: PropostaRankingBidFreteInternacional[]
  carregandoRanking?: boolean
  onCotacaoAtualizada?: (cotacaoAtualizada?: Cotacao) => void
}

export function InsightsGridFluxoCotacao({
  cotacao,
  disparos,
  propostas,
  id_cotacao_bid_frete_internacional,
  status_cotacao_bid_frete_internacional,
  propostasRanking = [],
  carregandoRanking = false,
  onCotacaoAtualizada,
}: InsightsGridFluxoCotacaoProps) {
  const { t } = useTranslation()
  const idCotacao = id_cotacao_bid_frete_internacional ?? cotacao?.id_cotacao_bid_frete_internacional ?? null

  const info = useMemo(
    () => calcularInfograficosFluxoCotacao(disparos, propostas),
    [disparos, propostas],
  )

  const smart = useMemo(
    () => calcularPainelSmartInsights(disparos, propostas, info, cotacao?.historico_aprovado),
    [disparos, propostas, info, cotacao?.historico_aprovado],
  )

  return (
    <div className="dc-smart-insights">
      <div className="dc-smart-insights-titulo-linha">
        <h2 className="dc-smart-insights-titulo">
          {t('bidfrete.detalhe_cotacao.cockpit_painel_titulo', 'Painel de Insights Inteligente')}
        </h2>
      </div>
      {status_cotacao_bid_frete_internacional === 'APROVADA' && cotacao != null ? (
        <FaixaResumoAprovacaoInsightsCotacao
          cotacao={cotacao}
          propostasRanking={propostasRanking}
          t={t}
        />
      ) : (
        <AvisoGraficosInsightsCotacao
          status={status_cotacao_bid_frete_internacional}
          info={info}
          smart={smart}
          quantidadePropostas={propostas.length}
          t={t}
        />
      )}
      <div className="dc-smart-insights-grid">
        <CardMelhorPropostaSmart
          info={info}
          smart={smart}
          id_cotacao_bid_frete_internacional={idCotacao}
          status_cotacao_bid_frete_internacional={status_cotacao_bid_frete_internacional}
          propostasRanking={propostasRanking}
          empresa_pagadora_taxa_fechamento_plataforma_gravity={
            cotacao?.empresa_pagadora_taxa_fechamento_plataforma_gravity
          }
          onCotacaoAtualizada={onCotacaoAtualizada}
          t={t}
        />
        {idCotacao != null && (
          <CardRankingRespostasInsights
            id_cotacao_bid_frete_internacional={idCotacao}
            status_cotacao_bid_frete_internacional={status_cotacao_bid_frete_internacional}
            propostasRanking={propostasRanking}
            carregandoRanking={carregandoRanking}
            empresa_pagadora_taxa_fechamento_plataforma_gravity={
              cotacao?.empresa_pagadora_taxa_fechamento_plataforma_gravity
            }
            onCotacaoAtualizada={onCotacaoAtualizada}
            t={t}
          />
        )}
        <CardTermometroHistoricoSmart
          cotacao={cotacao}
          propostas={propostas}
          info={info}
          historico_aprovado={cotacao?.historico_aprovado}
          historico_propostas_recebidas={cotacao?.historico_propostas_recebidas}
          t={t}
        />
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
