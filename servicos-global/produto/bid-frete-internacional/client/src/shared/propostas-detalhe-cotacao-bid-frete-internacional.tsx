/**
 * Lista de propostas no detalhe da cotação — ranking, % vs demais e avaliação.
 */

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Star,
  Trophy,
  Timer,
  CurrencyDollar,
  Ranking,
  PaperPlaneTilt,
  CheckCircle,
  SortAscending,
  SortDescending,
  Path,
  Hourglass,
  Boat,
  Coins,
  CalendarBlank,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { TFunction } from 'i18next'
import type { PropostaRankingBidFreteInternacional, StatusCotacao } from './types'
import { aprovarResposta } from './api'
import { ModalAprovarPropostaBidFreteInternacional } from './modal-aprovar-proposta-bid-frete-internacional'
import {
  calcularMetricasPropostas,
  criterioOrdenacaoAscendentePorPadrao,
  ordenarPropostasPorCriterio,
  type CriterioOrdenacaoRespostaDetalhe,
  type MetricasExibicaoProposta,
} from './metricas-proposta-cotacao-bid-frete-internacional'
import { FaixaMetricasComparativoSparkProposta } from './metricas-comparativo-spark-card-proposta'

interface OpcaoOrdenacaoResposta {
  key: CriterioOrdenacaoRespostaDetalhe
  labelKey: string
  labelPadrao: string
  icone: React.ReactNode
}

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const moeda = (val: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)

const STATUS_COTACAO_SEM_ACOES_RESPOSTA: StatusCotacao[] = [
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'EXPIRADA',
]

function cotacaoPermiteAcoesResposta(status: StatusCotacao | null | undefined): boolean {
  if (!status) return true
  return !STATUS_COTACAO_SEM_ACOES_RESPOSTA.includes(status)
}

function propostaPermiteAcoes(proposta: PropostaRankingBidFreteInternacional): boolean {
  const status = proposta.status_proposta_bid_frete_internacional
  return status !== 'APROVADA' && status !== 'REPROVADA'
}

function nomeFornecedorProposta(
  proposta: PropostaRankingBidFreteInternacional,
  t: TFunction,
): string {
  return (
    proposta.fornecedor_nome
    ?? proposta.fornecedor?.nome_fornecedor_bid_frete_internacional
    ?? t('bidfrete.comparativo.fornecedor', 'Fornecedor')
  )
}

function coresColocacao(posicao: number): { bg: string; color: string; border: string } {
  const textoColocacao = '#ffffff'
  if (posicao === 1) return { bg: 'rgba(234,179,8,0.18)', color: textoColocacao, border: 'rgba(234,179,8,0.45)' }
  if (posicao === 2) return { bg: 'rgba(148,163,184,0.14)', color: textoColocacao, border: 'rgba(148,163,184,0.35)' }
  if (posicao === 3) return { bg: 'rgba(180,83,9,0.14)', color: textoColocacao, border: 'rgba(180,83,9,0.35)' }
  return { bg: 'rgba(100,116,139,0.12)', color: textoColocacao, border: 'rgba(100,116,139,0.25)' }
}

function classeBarraColocacao(posicaoScore: number): string {
  if (posicaoScore === 1) return 'dc-prop-card--lider'
  if (posicaoScore === 2) return 'dc-prop-card--segundo'
  if (posicaoScore === 3) return 'dc-prop-card--terceiro'
  return ''
}

function tagLabel(tag: string, t: TFunction): string {
  const mapa: Record<string, string> = {
    MELHOR_PRECO: t('bidfrete.comparativo.tag_melhor_preco', 'Melhor preço'),
    MELHOR_TRANSIT: t('bidfrete.comparativo.tag_melhor_transit', 'Melhor trânsito'),
    MELHOR_AVALIACAO: t('bidfrete.comparativo.tag_melhor_avaliacao', 'Melhor avaliação'),
  }
  return mapa[tag] ?? tag
}

const ROTULO_CRITERIO_ORDENACAO: Record<
  CriterioOrdenacaoRespostaDetalhe,
  { labelKey: string; labelPadrao: string }
> = {
  ranking_geral: {
    labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_score',
    labelPadrao: 'Score geral',
  },
  valor_total_proposta_bid_frete_internacional: {
    labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_preco',
    labelPadrao: 'Menor preço',
  },
  dias_transito_proposta_bid_frete_internacional: {
    labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_transito',
    labelPadrao: 'Melhor trânsito',
  },
  rating: {
    labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_avaliacao',
    labelPadrao: 'Melhor avaliação',
  },
  quantidade_transbordo_proposta_bid_frete_internacional: {
    labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_transbordo',
    labelPadrao: 'Menor transbordo',
  },
  dias_free_time_proposta_bid_frete_internacional: {
    labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_free_time',
    labelPadrao: 'Maior free time',
  },
}

function rotuloCriterioOrdenacao(criterio: CriterioOrdenacaoRespostaDetalhe, t: TFunction): string {
  const cfg = ROTULO_CRITERIO_ORDENACAO[criterio]
  return t(cfg.labelKey, cfg.labelPadrao)
}

function montarResumoComparativo(metricas: MetricasExibicaoProposta, t: TFunction): string {
  const partes: string[] = []

  if (metricas.totalPropostas > 1) {
    const pct = metricas.percentualVsMelhorPreco
    if (pct != null && Math.abs(pct) < 0.05) {
      partes.push(t('bidfrete.detalhe_cotacao.resposta_melhor_preco', 'Melhor preço'))
    } else if (pct != null) {
      partes.push(`${pct > 0 ? '+' : ''}${pct.toFixed(1)}% ${t('bidfrete.detalhe_cotacao.resposta_vs_melhor', 'vs 1º preço')}`)
    }
    const pctMedia = metricas.percentualVsMedia
    if (pctMedia != null) {
      partes.push(`${pctMedia > 0 ? '+' : ''}${pctMedia.toFixed(1)}% ${t('bidfrete.detalhe_cotacao.resposta_vs_media', 'vs média')}`)
    }
  }

  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_rank_preco', 'Preço')} ${metricas.rankPreco}º`)
  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_rank_transito', 'Trânsito')} ${metricas.rankTransito}º`)
  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_rank_avaliacao', 'Avaliação')} ${metricas.rankAvaliacao}º`)
  partes.push(`${t('bidfrete.detalhe_cotacao.resposta_score', 'Score')} ${metricas.scoreGeral}`)

  return partes.join(' · ')
}

function TagPropostaInline({ tag, t }: { tag: string; t: TFunction }) {
  return (
    <span className="dc-prop-tag">
      {tagLabel(tag, t)}
    </span>
  )
}

function LinhaProposta({
  icone,
  label,
  value,
  mono = false,
  destaqueTotal = false,
}: {
  icone: React.ReactNode
  label: string
  value: string
  mono?: boolean
  destaqueTotal?: boolean
}) {
  return (
    <div
      className={[
        'dc-info-row',
        'dc-info-row--com-icone',
        destaqueTotal ? 'dc-info-row--frete-total' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="dc-info-label-group">
        <span className="dc-info-icon-badge dc-prop-icon-badge" aria-hidden>
          {icone}
        </span>
        <span className="dc-info-label">{label}</span>
      </div>
      <span
        className={[
          destaqueTotal ? 'dc-prop-total-valor' : 'dc-info-value',
          mono ? 'dc-info-mono' : '',
        ].filter(Boolean).join(' ')}
      >
        {value}
      </span>
    </div>
  )
}

function BarraMetrica({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.round(Math.max(0, Math.min(100, pct)))
  return (
    <div className="dc-prop-bar-row">
      <span>{label}</span>
      <div className="dc-prop-bar-track">
        <div className="dc-prop-bar-fill" style={{ width: `${clamped}%` }} />
      </div>
      <span>{clamped}%</span>
    </div>
  )
}

function TagsProposta({ tags, t }: { tags: string[]; t: TFunction }) {
  return (
    <div className="dc-prop-tags">
      {tags.map((tag) => (
        <TagPropostaInline key={tag} tag={tag} t={t} />
      ))}
    </div>
  )
}

function RodapeAcoesProposta({
  visivel,
  desabilitado,
  onAprovar,
  t,
}: {
  visivel: boolean
  desabilitado: boolean
  onAprovar: () => void
  t: TFunction
}) {
  if (!visivel) return null
  return (
    <div className="dc-prop-card-acoes">
      <BotaoGlobal
        variante="secundario"
        tamanho="pequeno"
        blocoCompleto
        className="dc-prop-btn-aprovar"
        icone={<CheckCircle weight="bold" size={14} />}
        onClick={onAprovar}
        disabled={desabilitado}
      >
        {t('bidfrete.comparativo.aprovar', 'Aprovar')}
      </BotaoGlobal>
    </div>
  )
}

function GrupoRankProposta({
  posicaoScore,
  posicaoLista,
  criterioOrdenacao,
  t,
}: {
  posicaoScore: number
  posicaoLista: number
  criterioOrdenacao: CriterioOrdenacaoRespostaDetalhe
  t: TFunction
}) {
  const rankCores = coresColocacao(posicaoScore)
  const mostrarChipOrdenacao = criterioOrdenacao !== 'ranking_geral'

  return (
    <div className="dc-prop-rank-group">
      <span
        className="dc-prop-rank-inline"
        title={t('bidfrete.detalhe_cotacao.resposta_rank_score_tooltip', 'Colocação no score geral')}
        style={{
          background: rankCores.bg,
          color: rankCores.color,
          border: `1px solid ${rankCores.border}`,
        }}
      >
        {posicaoScore <= 3 && <Trophy weight="duotone" size={14} />}
        {posicaoScore}º
      </span>
      {mostrarChipOrdenacao && (
        <span className="dc-prop-rank-criterio">
          {t('bidfrete.detalhe_cotacao.resposta_posicao_por_criterio', {
            posicao: posicaoLista,
            criterio: rotuloCriterioOrdenacao(criterioOrdenacao, t),
            defaultValue: `${posicaoLista}º por ${rotuloCriterioOrdenacao(criterioOrdenacao, t)}`,
          })}
        </span>
      )}
    </div>
  )
}

function CorpoMetricasProposta({
  proposta,
  moedaProposta,
  t,
}: {
  proposta: PropostaRankingBidFreteInternacional
  moedaProposta: string
  t: TFunction
}) {
  const valorTransbordo =
    proposta.quantidade_transbordo_proposta_bid_frete_internacional === 0
      ? t('bidfrete.comparativo.direto', 'Direto')
      : String(proposta.quantidade_transbordo_proposta_bid_frete_internacional)

  const valorFreeTime =
    proposta.dias_free_time_proposta_bid_frete_internacional != null
      ? `${proposta.dias_free_time_proposta_bid_frete_internacional} ${t('bidfrete.detalhe_cotacao.dias')}`
      : '—'

  return (
    <div className="dc-prop-metricas-grid">
      <div className="dc-prop-metricas-col">
        <LinhaProposta
          icone={<Boat weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_frete', 'Frete Básico')}
          value={moeda(proposta.valor_frete_proposta_bid_frete_internacional, moedaProposta)}
        />
        <LinhaProposta
          icone={<Coins weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_taxas_origem', 'Taxas da Origem')}
          value={moeda(proposta.taxas_origem_proposta_bid_frete_internacional, moedaProposta)}
        />
        <LinhaProposta
          icone={<Coins weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_taxas_destino', 'Taxas do Destino')}
          value={moeda(proposta.taxas_destino_proposta_bid_frete_internacional, moedaProposta)}
        />
        <LinhaProposta
          icone={<CurrencyDollar weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_frete_total', 'Frete Total')}
          value={moeda(proposta.valor_total_proposta_bid_frete_internacional, moedaProposta)}
          destaqueTotal
        />
      </div>
      <div className="dc-prop-metricas-col">
        <LinhaProposta
          icone={<Timer weight="duotone" size={16} />}
          label={t('bidfrete.comparativo.transit_time', 'Transit time')}
          value={`${proposta.dias_transito_proposta_bid_frete_internacional} ${t('bidfrete.detalhe_cotacao.dias')}`}
        />
        <LinhaProposta
          icone={<Hourglass weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_free_time', 'Free Time')}
          value={valorFreeTime}
        />
        <LinhaProposta
          icone={<Path weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_transbordos', 'Transbordo')}
          value={valorTransbordo}
        />
        <LinhaProposta
          icone={<CalendarBlank weight="duotone" size={16} />}
          label={t('bidfrete.detalhe_cotacao.resp_validade', 'Validade')}
          value={dataBR(proposta.validade_proposta_bid_frete_internacional)}
          mono={false}
        />
      </div>
    </div>
  )
}

function DestaquesCardProposta({
  proposta,
  propostasTodas,
  tags,
  t,
}: {
  proposta: PropostaRankingBidFreteInternacional
  propostasTodas: PropostaRankingBidFreteInternacional[]
  tags: string[]
  t: TFunction
}) {
  const exibirSpark = propostasTodas.length >= 2
  const exibirTags = tags.length > 0
  if (!exibirSpark && !exibirTags) return null

  return (
    <div className="dc-prop-card-destaques">
      {exibirTags && <TagsProposta tags={tags} t={t} />}
      {exibirSpark && (
        <FaixaMetricasComparativoSparkProposta
          proposta={proposta}
          propostas={propostasTodas}
        />
      )}
    </div>
  )
}

function CardProposta({
  proposta,
  propostasTodas,
  metricas,
  posicaoLista,
  criterioOrdenacao,
  t,
  variante = 'padrao',
  densidade = 'expandido',
  exibirAcoes = false,
  acoesDesabilitadas = false,
  onAprovar,
}: {
  proposta: PropostaRankingBidFreteInternacional
  propostasTodas: PropostaRankingBidFreteInternacional[]
  metricas: MetricasExibicaoProposta
  posicaoLista: number
  criterioOrdenacao: CriterioOrdenacaoRespostaDetalhe
  t: TFunction
  variante?: 'padrao' | 'combate'
  densidade?: 'podio' | 'expandido'
  exibirAcoes?: boolean
  acoesDesabilitadas?: boolean
  onAprovar?: () => void
}) {
  const aprovada = proposta.status_proposta_bid_frete_internacional === 'APROVADA'
  const nome = nomeFornecedorProposta(proposta, t)
  const moedaProposta = proposta.moeda_proposta_bid_frete_internacional
  const posicaoScore = metricas.posicaoGeral
  const colocacaoVisualPodio = densidade === 'podio' ? posicaoLista : posicaoScore
  const nota =
    metricas.notaFornecedor != null ? `${metricas.notaFornecedor.toFixed(1)}/5` : null

  const pctPreco = metricas.percentualVsMelhorPreco != null
    ? Math.max(12, Math.min(100, 100 - metricas.percentualVsMelhorPreco))
    : Math.max(15, 100 - (metricas.rankPreco - 1) * 22)
  const pctTransito = metricas.rankTransito <= 1
    ? 100
    : Math.max(20, 100 - (metricas.rankTransito - 1) * 18)

  if (variante === 'combate') {
    return (
      <article
        className={[
          'dc-prop-card',
          aprovada ? 'dc-prop-card--aprovada' : '',
          classeBarraColocacao(colocacaoVisualPodio),
        ].filter(Boolean).join(' ')}
      >
        <header className="dc-prop-card-head">
          <div className="dc-prop-card-head-main">
            <GrupoRankProposta
              posicaoScore={colocacaoVisualPodio}
              posicaoLista={posicaoLista}
              criterioOrdenacao={criterioOrdenacao}
              t={t}
            />
            <div className="dc-prop-card-titulos dc-prop-card-titulos--combate">
              <h3 className="dc-prop-fornecedor">{nome}</h3>
              <span className="dc-prop-total-valor">
                {moeda(proposta.valor_total_proposta_bid_frete_internacional, moedaProposta)}
              </span>
            </div>
          </div>
        </header>
        <div className="dc-prop-barras">
          <BarraMetrica label={t('bidfrete.detalhe_cotacao.resp_frete', 'Frete Básico')} pct={pctPreco} />
          <BarraMetrica label={t('bidfrete.detalhe_cotacao.resp_taxas', 'Taxas')} pct={Math.min(95, pctPreco + 8)} />
          <BarraMetrica label={t('bidfrete.comparativo.transit_time', 'Transit Time')} pct={pctTransito} />
        </div>
        <DestaquesCardProposta
          proposta={proposta}
          propostasTodas={propostasTodas}
          tags={metricas.tags}
          t={t}
        />
        <RodapeAcoesProposta
          visivel={exibirAcoes}
          desabilitado={acoesDesabilitadas}
          onAprovar={() => onAprovar?.()}
          t={t}
        />
      </article>
    )
  }

  if (densidade === 'podio') {
    return (
      <article
        className={[
          'dc-prop-card',
          'dc-prop-card--compacto',
          aprovada ? 'dc-prop-card--aprovada' : '',
          classeBarraColocacao(colocacaoVisualPodio),
        ].filter(Boolean).join(' ')}
      >
        <header className="dc-prop-card-head">
          <div className="dc-prop-card-head-main">
            <GrupoRankProposta
              posicaoScore={colocacaoVisualPodio}
              posicaoLista={posicaoLista}
              criterioOrdenacao={criterioOrdenacao}
              t={t}
            />
            <div className="dc-prop-card-titulos">
              <div className="dc-prop-card-title-row">
                <h3 className="dc-prop-fornecedor" title={nome}>{nome}</h3>
                {aprovada && (
                  <span className="dc-prop-badge-aprovada">
                    <CheckCircle weight="fill" size={13} />
                    {t('bidfrete.comparativo.aprovada', 'Aprovada')}
                  </span>
                )}
                {nota && (
                  <span className="dc-prop-nota">
                    <Star weight="duotone" size={12} aria-hidden />
                    {nota}
                  </span>
                )}
              </div>
              <DestaquesCardProposta
                proposta={proposta}
                propostasTodas={propostasTodas}
                tags={metricas.tags}
                t={t}
              />
            </div>
          </div>
          <div className="dc-prop-card-total-block">
            <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.resp_total')}</span>
            <span className="dc-prop-total-valor">
              {moeda(proposta.valor_total_proposta_bid_frete_internacional, moedaProposta)}
            </span>
          </div>
        </header>

        <div className="dc-prop-card-body">
          <CorpoMetricasProposta proposta={proposta} moedaProposta={moedaProposta} t={t} />
        </div>

        <p className="dc-prop-resumo dc-prop-resumo--rodape">{montarResumoComparativo(metricas, t)}</p>

        <RodapeAcoesProposta
          visivel={exibirAcoes}
          desabilitado={acoesDesabilitadas}
          onAprovar={() => onAprovar?.()}
          t={t}
        />

        {proposta.observacoes_proposta_bid_frete_internacional?.trim() && (
          <p className="dc-prop-obs">{proposta.observacoes_proposta_bid_frete_internacional}</p>
        )}
      </article>
    )
  }

  return (
    <article
      className={[
        'dc-prop-card',
        aprovada ? 'dc-prop-card--aprovada' : '',
        classeBarraColocacao(posicaoScore),
      ].filter(Boolean).join(' ')}
    >
      <header className="dc-prop-card-head">
        <div className="dc-prop-card-head-main">
          <GrupoRankProposta
            posicaoScore={colocacaoVisualPodio}
            posicaoLista={posicaoLista}
            criterioOrdenacao={criterioOrdenacao}
            t={t}
          />
          <div className="dc-prop-card-titulos">
            <div className="dc-prop-card-title-row">
              <h3 className="dc-prop-fornecedor">{nome}</h3>
              {aprovada && (
                <span className="dc-prop-badge-aprovada">
                  <CheckCircle weight="fill" size={13} />
                  {t('bidfrete.comparativo.aprovada', 'Aprovada')}
                </span>
              )}
              {nota && (
                <span className="dc-prop-nota">
                  <Star weight="duotone" size={12} aria-hidden />
                  {nota}
                </span>
              )}
            </div>
            <DestaquesCardProposta
              proposta={proposta}
              propostasTodas={propostasTodas}
              tags={metricas.tags}
              t={t}
            />
          </div>
        </div>
        <div className="dc-prop-card-total-block">
          <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.resp_total')}</span>
          <span className="dc-prop-total-valor">
            {moeda(proposta.valor_total_proposta_bid_frete_internacional, moedaProposta)}
          </span>
        </div>
      </header>

      <div className="dc-prop-card-body">
        <CorpoMetricasProposta proposta={proposta} moedaProposta={moedaProposta} t={t} />
      </div>

      <p className="dc-prop-resumo dc-prop-resumo--rodape">{montarResumoComparativo(metricas, t)}</p>

      <RodapeAcoesProposta
        visivel={exibirAcoes}
        desabilitado={acoesDesabilitadas}
        onAprovar={() => onAprovar?.()}
        t={t}
      />

      {proposta.observacoes_proposta_bid_frete_internacional?.trim() && (
        <p className="dc-prop-obs">{proposta.observacoes_proposta_bid_frete_internacional}</p>
      )}
    </article>
  )
}

export interface ListaPropostasDetalheCotacaoProps {
  id_cotacao_bid_frete_internacional: string
  status_cotacao_bid_frete_internacional?: StatusCotacao | null
  propostasRanking: PropostaRankingBidFreteInternacional[]
  carregandoRanking?: boolean
  /** Sidebar compacta estilo Combat Matrix (mockup cockpit). */
  variante?: 'padrao' | 'combate'
  onCotacaoAtualizada?: () => void
}

export function ListaPropostasDetalheCotacao({
  id_cotacao_bid_frete_internacional,
  status_cotacao_bid_frete_internacional,
  propostasRanking,
  carregandoRanking = false,
  variante = 'padrao',
  onCotacaoAtualizada,
}: ListaPropostasDetalheCotacaoProps) {
  const { t } = useTranslation()
  const [criterioOrdenacao, setCriterioOrdenacao] =
    useState<CriterioOrdenacaoRespostaDetalhe>('ranking_geral')
  const [ordenacaoAsc, setOrdenacaoAsc] = useState(true)
  const [modalAprovar, setModalAprovar] = useState(false)
  const [propostaSelecionada, setPropostaSelecionada] =
    useState<PropostaRankingBidFreteInternacional | null>(null)
  const [aprovando, setAprovando] = useState(false)
  const [aprovacaoSucesso, setAprovacaoSucesso] = useState(false)

  const acoesGlobaisHabilitadas =
    propostasRanking.length > 0
    && cotacaoPermiteAcoesResposta(status_cotacao_bid_frete_internacional)

  const opcoesOrdenacao: OpcaoOrdenacaoResposta[] = useMemo(
    () => [
      {
        key: 'ranking_geral',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_score',
        labelPadrao: 'Score geral',
        icone: <Trophy weight="duotone" size={14} />,
      },
      {
        key: 'valor_total_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_preco',
        labelPadrao: 'Menor preço',
        icone: <CurrencyDollar weight="duotone" size={14} />,
      },
      {
        key: 'dias_transito_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_transito',
        labelPadrao: 'Melhor trânsito',
        icone: <Timer weight="duotone" size={14} />,
      },
      {
        key: 'rating',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_avaliacao',
        labelPadrao: 'Melhor avaliação',
        icone: <Star weight="duotone" size={14} />,
      },
      {
        key: 'quantidade_transbordo_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_transbordo',
        labelPadrao: 'Menor transbordo',
        icone: <Path weight="duotone" size={14} />,
      },
      {
        key: 'dias_free_time_proposta_bid_frete_internacional',
        labelKey: 'bidfrete.detalhe_cotacao.resposta_ordem_free_time',
        labelPadrao: 'Maior free time',
        icone: <Hourglass weight="duotone" size={14} />,
      },
    ],
    [],
  )

  const metricasPorId = useMemo(
    () => calcularMetricasPropostas(propostasRanking),
    [propostasRanking],
  )

  const propostasOrdenadas = useMemo(
    () => ordenarPropostasPorCriterio(propostasRanking, criterioOrdenacao, ordenacaoAsc),
    [propostasRanking, criterioOrdenacao, ordenacaoAsc],
  )

  function alternarCriterio(key: CriterioOrdenacaoRespostaDetalhe) {
    if (key === criterioOrdenacao) {
      setOrdenacaoAsc((prev) => !prev)
      return
    }
    setCriterioOrdenacao(key)
    setOrdenacaoAsc(criterioOrdenacaoAscendentePorPadrao(key))
  }

  function abrirModalAprovar(proposta: PropostaRankingBidFreteInternacional) {
    setPropostaSelecionada(proposta)
    setModalAprovar(true)
  }

  function fecharModalAprovar() {
    if (aprovando || aprovacaoSucesso) return
    setModalAprovar(false)
    setPropostaSelecionada(null)
  }

  async function confirmarAprovar() {
    if (!propostaSelecionada || aprovando || aprovacaoSucesso) return
    setAprovando(true)
    try {
      await aprovarResposta(
        id_cotacao_bid_frete_internacional,
        propostaSelecionada.id_proposta_bid_frete_internacional,
      )
      setAprovacaoSucesso(true)
      await new Promise((resolve) => { window.setTimeout(resolve, 600) })
      setModalAprovar(false)
      setPropostaSelecionada(null)
      onCotacaoAtualizada?.()
    } finally {
      setAprovando(false)
      setAprovacaoSucesso(false)
    }
  }

  if (carregandoRanking) {
    return (
      <div className="dc-prop-loading">
        <Ranking weight="duotone" size={28} className="dc-prop-loading-icon" />
        <span>{t('bidfrete.detalhe_cotacao.resposta_carregando_ranking', 'Calculando colocação...')}</span>
      </div>
    )
  }

  if (propostasRanking.length === 0) {
    return (
      <div className="dc-empty">
        <PaperPlaneTilt weight="duotone" size={40} style={{ opacity: 0.3 }} />
        <p>{t('bidfrete.detalhe_cotacao.vazio_respostas')}</p>
      </div>
    )
  }

  const propostasPodio = variante === 'padrao' ? propostasOrdenadas.slice(0, 3) : []
  const propostasRestantes = variante === 'padrao'
    ? propostasOrdenadas.slice(3)
    : propostasOrdenadas

  function renderCard(
    proposta: PropostaRankingBidFreteInternacional,
    indice: number,
    densidade: 'podio' | 'expandido',
  ) {
    const metricas = metricasPorId.get(proposta.id_proposta_bid_frete_internacional)
    if (!metricas) return null
    const exibirAcoes = acoesGlobaisHabilitadas && propostaPermiteAcoes(proposta)
    return (
      <CardProposta
        key={proposta.id_proposta_bid_frete_internacional}
        proposta={proposta}
        propostasTodas={propostasRanking}
        metricas={metricas}
        posicaoLista={indice + 1}
        criterioOrdenacao={criterioOrdenacao}
        t={t}
        variante={variante}
        densidade={densidade}
        exibirAcoes={exibirAcoes}
        acoesDesabilitadas={aprovando || modalAprovar}
        onAprovar={() => abrirModalAprovar(proposta)}
      />
    )
  }

  return (
    <div
      className={[
        'dc-prop-panel',
        variante === 'combate' ? 'dc-cockpit-combat' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="dc-prop-panel-toolbar">
        <div className="dc-prop-sort-wrap">
          <span className="dc-prop-sort-label">
            {t('bidfrete.detalhe_cotacao.resposta_ordenar_por', 'Ordenar por')}:
          </span>
          <div className="dc-prop-sort-bar" role="group" aria-label={t('bidfrete.detalhe_cotacao.resposta_ordenar_por', 'Ordenar por')}>
            {opcoesOrdenacao.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={[
                  'dc-prop-sort-btn',
                  criterioOrdenacao === opt.key ? 'dc-prop-sort-btn--ativo' : '',
                ].join(' ')}
                onClick={() => alternarCriterio(opt.key)}
                aria-pressed={criterioOrdenacao === opt.key}
              >
                {opt.icone}
                {t(opt.labelKey, opt.labelPadrao)}
                {criterioOrdenacao === opt.key && (
                  ordenacaoAsc
                    ? <SortAscending weight="bold" size={12.5} aria-hidden />
                    : <SortDescending weight="bold" size={12.5} aria-hidden />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dc-prop-list-wrap">
        {propostasPodio.length > 0 && (
          <div className="dc-prop-list dc-prop-list--podio">
            {propostasPodio.map((proposta, indice) => renderCard(proposta, indice, 'podio'))}
          </div>
        )}
        {propostasRestantes.length > 0 && (
          <div className="dc-prop-list">
            {propostasRestantes.map((proposta, indice) =>
              renderCard(proposta, propostasPodio.length + indice, 'expandido'),
            )}
          </div>
        )}
      </div>

      <ModalAprovarPropostaBidFreteInternacional
        aberto={modalAprovar}
        proposta={propostaSelecionada}
        aprovando={aprovando}
        aprovacaoSucesso={aprovacaoSucesso}
        onFechar={fecharModalAprovar}
        onConfirmar={() => void confirmarAprovar()}
      />
    </div>
  )
}
