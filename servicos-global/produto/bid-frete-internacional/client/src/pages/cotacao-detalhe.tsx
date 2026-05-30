/**
 * DetalheCotacao.tsx — Detalhe de Cotação (T4)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Baseado nos prints: modelo 8, 9
 * Layout: Header + Timeline + Dados + BidRequests + BidResponses
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { useSincronizarTituloPaginaTopo } from '../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  PaginaCarregandoBidFreteInternacional,
} from '../shared/pagina-carregando-bid-frete-internacional'
import { formatarContainersPersistidosParaExibicao } from '../shared/containers-cotacao-bid-frete-internacional'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import {
  FileText,
  ArrowLeft,
  Trash,
  PaperPlaneTilt,
  Ranking,
  Medal,
  ChartLineUp,
  CheckCircle,
  Eye,
  Envelope,
  ChatCircle,
  Anchor,
  AirplaneTilt,
  Truck,
  Package,
  Scales,
  Warning,
  XCircle,
  LinkSimple,
  Cube,
  DownloadSimple,
  Export,
  Globe,
  UsersThree,
} from '@phosphor-icons/react'

import {
  getCotacao,
  getDisparoPorCotacaoBidFreteInternacional,
  excluirCotacao,
  rankingCotacoesBidFreteInternacional,
} from '../shared/api'
import { ModalEnviarCotacaoBidFreteInternacional } from './modal-enviar-cotacao-bid-frete-internacional'
import { RotaVisualBidFrete } from '../shared/rota-visual-bid-frete-internacional'
import { ListaPropostasDetalheCotacao } from '../shared/propostas-detalhe-cotacao-bid-frete-internacional'
import {
  TimelineFluxoCotacao,
  InsightsGridFluxoCotacao,
} from '../shared/painel-fluxo-infograficos-cotacao-bid-frete-internacional'
import './cotacao-detalhe-cockpit.css'
import {
  mesclarPropostasComRanking,
  ranquearPropostasLocal,
} from '../shared/metricas-proposta-cotacao-bid-frete-internacional'
import type {
  Cotacao,
  DisparoCotacaoBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  StatusDisparoCotacaoBidFreteInternacional,
  ModalFrete,
  TipoOperacao,
  Visibilidade,
} from '../shared/types'
import type { TFunction } from 'i18next'
import {
  MODAL_LABELS,
  MODALIDADE_LABELS,
  OPERACAO_LABELS,
  CANAL_LABELS,
  STATUS_LABELS,
  STATUS_DISPARO_COTACAO_BID_FRETE_INTERNACIONAL_LABELS,
} from '../shared/types'

// ─── Formatação ──────────────────────────────────────────────────────────────

const dataHoraBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const usd = (val: number | null) =>
  val != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(val) : '—'

// ─── Badge de Status ─────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: '#6366f1' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  default: { bg: 'rgba(100,116,139,0.15)', color: '#64748b' },
}

function Badge({ label, variante }: { label: string; variante: string }) {
  const cores = BADGE_COLORS[variante] ?? BADGE_COLORS.default
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem',
      borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
      background: cores.bg, color: cores.color,
    }}>
      {label}
    </span>
  )
}

// ─── BidRequest Status Badge ─────────────────────────────────────────────────

const BID_STATUS_VARIANTE: Record<StatusDisparoCotacaoBidFreteInternacional, string> = {
  PENDENTE: 'default',
  ENVIADO: 'info',
  VISUALIZADO: 'info',
  RESPONDIDO: 'success',
  EXPIRADO: 'danger',
  ERRO_ENVIO: 'danger',
}

function montarLinkRespostaPublicoDisparo(token: string): string {
  const base = window.location.origin.replace(/\/$/, '')
  return `${base}/bid-frete/visao-fornecedor-bid-frete-internacional/publico/${encodeURIComponent(token)}`
}

function iconeModalFrete(modal: ModalFrete): React.ReactNode {
  if (modal === 'MARITIMO') return <Anchor weight="duotone" size={16} />
  if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={16} />
  return <Truck weight="duotone" size={16} />
}

function iconeTipoOperacao(tipo: TipoOperacao): React.ReactNode {
  return tipo === 'IMPORTACAO'
    ? <DownloadSimple weight="duotone" size={16} />
    : <Export weight="duotone" size={16} />
}

function iconeVisibilidadeCotacao(visibilidade: Visibilidade): React.ReactNode {
  return visibilidade === 'ABERTA'
    ? <Globe weight="duotone" size={16} />
    : <UsersThree weight="duotone" size={16} />
}

type VarianteCardDados = 'gerais' | 'rota' | 'carga'

function CardSecaoDados({
  titulo,
  children,
  variante,
}: {
  titulo: string
  children: React.ReactNode
  variante: VarianteCardDados
}) {
  return (
    <section className={`dc-dados-card dc-dados-card--${variante}`}>
      <h3 className="dc-dados-card-title">{titulo}</h3>
      <div className="dc-dados-card-body">{children}</div>
    </section>
  )
}

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="dc-info-row">
      <span className="dc-info-label">{label}</span>
      <span className={`dc-info-value ${mono ? 'dc-info-mono' : ''}`}>{value}</span>
    </div>
  )
}

function InfoRowComIcone({
  icone,
  label,
  value,
  mono,
}: {
  icone: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="dc-info-row dc-info-row--com-icone">
      <div className="dc-info-label-group">
        <span className="dc-info-icon-badge" aria-hidden>
          {icone}
        </span>
        <span className="dc-info-label">{label}</span>
      </div>
      <span className={`dc-info-value ${mono ? 'dc-info-mono' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function DetalheCotacao() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_cotacao: id } = useParams<{ id_cotacao: string }>()
  const [cotacao, setCotacao] = useState<Cotacao | null>(null)
  const [bids, setBids] = useState<DisparoCotacaoBidFreteInternacional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tab, setTab] = useState<'dados' | 'bids' | 'respostas'>('dados')
  const [modalDisparoAberto, setModalDisparoAberto] = useState(false)
  const [propostasRanking, setPropostasRanking] = useState<PropostaRankingBidFreteInternacional[]>([])
  const [carregandoRanking, setCarregandoRanking] = useState(false)

  const carregarRankingPropostas = useCallback(async (cot: Cotacao) => {
    const propostas = cot.propostas_bid_frete_internacional ?? []
    if (propostas.length === 0) {
      setPropostasRanking([])
      return
    }
    setCarregandoRanking(true)
    try {
      const ranking = await rankingCotacoesBidFreteInternacional(cot.id_cotacao_bid_frete_internacional)
      const mescladas = mesclarPropostasComRanking(propostas, ranking)
      setPropostasRanking(mescladas.length > 0 ? mescladas : ranquearPropostasLocal(propostas))
    } catch {
      setPropostasRanking(ranquearPropostasLocal(propostas))
    } finally {
      setCarregandoRanking(false)
    }
  }, [])

  const carregar = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    setErro(null)
    try {
      const [cot, bidList] = await Promise.all([
        getCotacao(id),
        getDisparoPorCotacaoBidFreteInternacional(id),
      ])
      setCotacao(cot)
      setBids(bidList)
      void carregarRankingPropostas(cot)
    } catch (e: unknown) {
      setCotacao(null)
      setBids([])
      setPropostasRanking([])
      setErro(e instanceof Error ? e.message : 'Erro ao carregar cotação')
    } finally {
      setCarregando(false)
    }
  }, [id, carregarRankingPropostas])

  useEffect(() => { carregar() }, [carregar])

  const tituloTopo = useMemo(() => {
    if (carregando) {
      return criarTituloCarregandoTopo(<FileText weight="duotone" size={22} />, t)
    }
    if (erro || !cotacao) {
      return {
        label: erro ?? t('bidfrete.detalhe_cotacao.nao_encontrada', 'Cotação não encontrada'),
        icone: <Warning weight="duotone" size={22} />,
      }
    }
    return {
      label:     `Cotação ${cotacao.numero_cotacao_bid_frete_internacional}`,
      icone:     <FileText weight="duotone" size={22} />,
      subtitulo: cotacao.referencia_interna_cotacao_bid_frete_internacional
        ? `Ref: ${cotacao.referencia_interna_cotacao_bid_frete_internacional}`
        : undefined,
    }
  }, [carregando, cotacao, erro, t])

  useSincronizarTituloPaginaTopo(tituloTopo)

  const propostasParaInfograficos = useMemo(() => {
    if (propostasRanking.length > 0) return propostasRanking
    const raw = cotacao?.propostas_bid_frete_internacional ?? []
    return raw.length > 0 ? ranquearPropostasLocal(raw) : []
  }, [propostasRanking, cotacao])

  // ─── Tabela de Bids ───────────────────────────────────────────────────

  const bidColunas: TabelaGlobalColuna<DisparoCotacaoBidFreteInternacional>[] = [
    {
      key: 'id_fornecedor_bid_frete_internacional',
      label: t('bidfrete.comparativo.fornecedor'),
      tipo: 'texto',
      largura: 200,
      render: (valor: unknown, row: DisparoCotacaoBidFreteInternacional) => {
        const _val = valor as string
        return row.fornecedor?.nome_fornecedor_bid_frete_internacional ?? _val.slice(0, 8)
      },
    },
    {
      key: 'canal_disparo_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.canal_pedido'),
      tipo: 'texto',
      largura: 100,
      render: (valor: unknown) => {
        const val = valor as string
        const icon = val === 'EMAIL' ? <Envelope weight="duotone" size={14} /> :
                     val === 'WHATSAPP' ? <ChatCircle weight="duotone" size={14} /> :
                     <Eye weight="duotone" size={14} />
        return <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{icon} {CANAL_LABELS[val as keyof typeof CANAL_LABELS] ?? val}</span>
      },
    },
    {
      key: 'status_disparo_cotacao_bid_frete_internacional',
      label: t('comum.status'),
      tipo: 'texto',
      largura: 130,
      render: (valor: unknown, row: DisparoCotacaoBidFreteInternacional) => {
        const val = valor as StatusDisparoCotacaoBidFreteInternacional
        const erro = row.erro_envio_disparo_cotacao_bid_frete_internacional?.trim()
        return (
          <span title={val === 'ERRO_ENVIO' && erro ? erro : undefined}>
            <Badge label={STATUS_DISPARO_COTACAO_BID_FRETE_INTERNACIONAL_LABELS[val]} variante={BID_STATUS_VARIANTE[val]} />
          </span>
        )
      },
    },
    {
      key: 'erro_envio_disparo_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.motivo_erro', 'Motivo'),
      tipo: 'texto',
      largura: 280,
      render: (valor: unknown, row: DisparoCotacaoBidFreteInternacional) => {
        const erro = (valor as string | null | undefined)?.trim()
          || row.erro_envio_disparo_cotacao_bid_frete_internacional?.trim()
        const texto =
          erro
          || (row.status_disparo_cotacao_bid_frete_internacional === 'ERRO_ENVIO'
            ? t(
                'bidfrete.detalhe_cotacao.erro_envio_sem_detalhe',
                'Serviço de e-mail indisponível ou URL incorreta (verifique EMAIL_SERVICE_URL na porta 8008)',
              )
            : null)
        if (!texto) return '—'
        return (
          <span
            title={texto}
            style={{
              fontSize: '0.75rem',
              lineHeight: 1.4,
              color: 'var(--danger, #ef4444)',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              display: 'block',
            }}
          >
            {texto}
          </span>
        )
      },
    },
    {
      key: 'token_resposta_disparo_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.link_resposta', 'Link resposta'),
      tipo: 'texto',
      largura: 120,
      render: (_valor: unknown, row: DisparoCotacaoBidFreteInternacional) => {
        const token = row.token_resposta_disparo_cotacao_bid_frete_internacional
        if (!token) return '—'
        const href = montarLinkRespostaPublicoDisparo(token)
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--ws-accent, #818cf8)',
              textDecoration: 'none',
            }}
          >
            <LinkSimple weight="bold" size={14} />
            {t('bidfrete.detalhe_cotacao.abrir_link', 'Abrir')}
          </a>
        )
      },
    },
    {
      key: 'data_envio_disparo_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.data_envio'),
      tipo: 'periodo',
      largura: 140,
      render: (valor: unknown) => dataHoraBR(valor as string | null),
    },
    {
      key: 'data_resposta_disparo_cotacao_bid_frete_internacional',
      label: t('bidfrete.detalhe_cotacao.data_resposta'),
      tipo: 'periodo',
      largura: 140,
      render: (valor: unknown) => dataHoraBR(valor as string | null),
    },
  ]

  // ─── Loading ──────────────────────────────────────────────────────────

  if (carregando) {
    return <PaginaCarregandoBidFreteInternacional />
  }

  if (erro || !cotacao) {
    return (
      <PaginaGlobal>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', height: '50vh', color: 'var(--text-muted)' }}>
          <Warning weight="duotone" size={40} />
          <p>{erro ?? t('bidfrete.detalhe_cotacao.nao_encontrada', 'Cotação não encontrada')}</p>
          <button className="dc-btn dc-btn--secondary" type="button" onClick={() => navigate('/bid-frete/cotacoes')}>
            <ArrowLeft weight="bold" size={14} /> {t('comum.voltar')}
          </button>
        </div>
      </PaginaGlobal>
    )
  }

  // --- Render ---

  return (
    <PaginaGlobal className="dc-page dc-cockpit bid-frete-page-shell">
      <div className="dc-cockpit-hero">
        <div className="dc-cockpit-status-panel">
          <div className="dc-cockpit-status-head">
            <span className="dc-cockpit-status-titulo">
              {STATUS_LABELS[cotacao.status_cotacao_bid_frete_internacional]}
            </span>
            <div className="dc-cockpit-quick-actions">
              {cotacao.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO' && (
                <button
                  type="button"
                  className="dc-cockpit-icon-btn dc-cockpit-icon-btn--primary"
                  title={t('bidfrete.detalhe_cotacao.comparativo')}
                  onClick={() => navigate(`/bid-frete/cotacoes/${id}/comparativo`)}
                >
                  <Medal weight="duotone" size={18} />
                </button>
              )}
              <button
                type="button"
                className="dc-cockpit-icon-btn"
                title={t('bidfrete.disparo.enviar', 'Enviar aos fornecedores')}
                onClick={() => setModalDisparoAberto(true)}
              >
                <PaperPlaneTilt weight="duotone" size={18} />
              </button>
              {cotacao.status_cotacao_bid_frete_internacional === 'RASCUNHO' && (
                <button
                  type="button"
                  className="dc-cockpit-icon-btn dc-cockpit-icon-btn--danger"
                  title={t('comum.excluir')}
                  onClick={async () => {
                    await excluirCotacao(cotacao.id_cotacao_bid_frete_internacional)
                    navigate('/bid-frete/cotacoes')
                  }}
                >
                  <Trash weight="duotone" size={18} />
                </button>
              )}
              <span className="dc-cockpit-topbar-divider" aria-hidden />
              <button type="button" className="dc-cockpit-icon-btn" title={t('bidfrete.detalhe_cotacao.cockpit_metricas', 'Métricas')}>
                <ChartLineUp weight="duotone" size={18} />
              </button>
            </div>
          </div>
          <TimelineFluxoCotacao statusAtual={cotacao.status_cotacao_bid_frete_internacional} />
        </div>
      </div>

      <section className="dc-cockpit-insights-row" aria-label={t('bidfrete.detalhe_cotacao.cockpit_insights', 'Insights')}>
        <InsightsGridFluxoCotacao
          cotacao={cotacao}
          disparos={bids}
          propostas={propostasParaInfograficos}
        />
      </section>

      <nav className="dc-cockpit-tabs" aria-label={t('bidfrete.detalhe_cotacao.cockpit_abas', 'Abas')}>
        <button
          type="button"
          className={`dc-cockpit-tab ${tab === 'dados' ? 'dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setTab('dados')}
        >
          {t('bidfrete.detalhe_cotacao.tab_dados')}
        </button>
        <button
          type="button"
          className={`dc-cockpit-tab ${tab === 'respostas' ? 'dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setTab('respostas')}
        >
          {t('bidfrete.detalhe_cotacao.tab_respostas')}
        </button>
        <button
          type="button"
          className={`dc-cockpit-tab ${tab === 'bids' ? 'dc-cockpit-tab--ativo' : ''}`}
          onClick={() => setTab('bids')}
        >
          {t('bidfrete.detalhe_cotacao.tab_disparos')}
        </button>
        <button type="button" className="dc-cockpit-tab" disabled title={t('bidfrete.detalhe_cotacao.cockpit_em_breve', 'Em breve')}>
          {t('bidfrete.detalhe_cotacao.cockpit_historico', 'Histórico')}
        </button>
        <button type="button" className="dc-cockpit-tab" disabled title={t('bidfrete.detalhe_cotacao.cockpit_em_breve', 'Em breve')}>
          {t('bidfrete.detalhe_cotacao.cockpit_documentos', 'Documentos')}
        </button>
      </nav>

      <div className={tab === 'dados' ? 'dc-cockpit-workspace' : 'dc-cockpit-main'}>
        <div className="dc-cockpit-main">
      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div className="dc-dados-layout">
          <CardSecaoDados variante="gerais" titulo={t('bidfrete.detalhe_cotacao.card_detalhes_gerais', 'Detalhes Gerais')}>
            <InfoRowComIcone
              icone={iconeTipoOperacao(cotacao.tipo_operacao_cotacao_bid_frete_internacional)}
              label={t('bidfrete.detalhe_cotacao.tipo_operacao')}
              value={OPERACAO_LABELS[cotacao.tipo_operacao_cotacao_bid_frete_internacional]}
            />
            <InfoRowComIcone
              icone={iconeModalFrete(cotacao.modal_cotacao_bid_frete_internacional)}
              label={t('bidfrete.detalhe_cotacao.modal')}
              value={MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional]}
            />
            <InfoRowComIcone
              icone={<Package weight="duotone" size={16} />}
              label={t('bidfrete.detalhe_cotacao.modalidade')}
              value={MODALIDADE_LABELS[cotacao.modalidade_cotacao_bid_frete_internacional]}
            />
            <InfoRowComIcone
              icone={<Scales weight="duotone" size={16} />}
              label={t('bidfrete.detalhe_cotacao.incoterm')}
              value={cotacao.incoterm_cotacao_bid_frete_internacional}
              mono
            />
            <InfoRowComIcone
              icone={iconeVisibilidadeCotacao(cotacao.visibilidade_cotacao_bid_frete_internacional)}
              label={t('bidfrete.detalhe_cotacao.visibilidade')}
              value={
                cotacao.visibilidade_cotacao_bid_frete_internacional === 'ABERTA'
                  ? t('bidfrete.nova_cotacao.tipo_aberta')
                  : t('bidfrete.nova_cotacao.tipo_direcionada')
              }
            />
          </CardSecaoDados>

          <CardSecaoDados variante="rota" titulo={t('bidfrete.detalhe_cotacao.card_rota', 'Rota')}>
            <RotaVisualBidFrete
              modal={cotacao.modal_cotacao_bid_frete_internacional}
              origemPais={cotacao.origem_pais_cotacao_bid_frete_internacional}
              origemCodigo={cotacao.origem_codigo_cotacao_bid_frete_internacional}
              origemNome={cotacao.origem_nome_cotacao_bid_frete_internacional}
              destinoPais={cotacao.destino_pais_cotacao_bid_frete_internacional}
              destinoCodigo={cotacao.destino_codigo_cotacao_bid_frete_internacional}
              destinoNome={cotacao.destino_nome_cotacao_bid_frete_internacional}
              rotuloOrigem={t('bidfrete.detalhe_cotacao.origem')}
              rotuloDestino={t('bidfrete.detalhe_cotacao.destino')}
            />
          </CardSecaoDados>

          <CardSecaoDados variante="carga" titulo={t('bidfrete.detalhe_cotacao.card_detalhes_carga', 'Detalhes da Carga')}>
            <div className="dc-mercadoria-destaque">
              <Cube weight="duotone" size={20} className="dc-mercadoria-icon" />
              <div>
                <span className="dc-info-label">{t('bidfrete.detalhe_cotacao.mercadoria')}</span>
                <p className="dc-mercadoria-texto">{cotacao.descricao_mercadoria_cotacao_bid_frete_internacional}</p>
              </div>
            </div>
            <InfoRow label={t('bidfrete.detalhe_cotacao.ncm')} value={cotacao.ncm_cotacao_bid_frete_internacional ?? '—'} mono />
            <InfoRow label={t('bidfrete.detalhe_cotacao.quantidade')} value={String(cotacao.quantidade_cotacao_bid_frete_internacional)} />
            <InfoRow
              label={t('bidfrete.detalhe_cotacao.peso')}
              value={cotacao.peso_kg_cotacao_bid_frete_internacional ? `${cotacao.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} Kg` : '—'}
            />
            {cotacao.tipo_container_cotacao_bid_frete_internacional && (
              <InfoRow
                label={t('bidfrete.detalhe_cotacao.container')}
                value={formatarContainersPersistidosParaExibicao(
                  cotacao.tipo_container_cotacao_bid_frete_internacional,
                  cotacao.quantidade_cotacao_bid_frete_internacional,
                  (codigo) => codigo,
                )}
              />
            )}
            <InfoRow
              label={t('bidfrete.detalhe_cotacao.cubagem')}
              value={cotacao.cubagem_m3_cotacao_bid_frete_internacional ? `${cotacao.cubagem_m3_cotacao_bid_frete_internacional} m³` : '—'}
            />
          </CardSecaoDados>

          <div className="dc-dados-extras">

          {/* Valor alvo */}
          {cotacao.valor_meta_cotacao_bid_frete_internacional != null && (
            <div className="dc-target">
              <span className="dc-target-label">{t('bidfrete.detalhe_cotacao.valor_alvo')}:</span>
              <span className="dc-target-value">{cotacao.moeda_meta_cotacao_bid_frete_internacional} {cotacao.valor_meta_cotacao_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {/* Valor aprovado */}
          {cotacao.valor_aprovado_ganho_bid_frete_internacional != null && (
            <div className="dc-aprovado">
              <CheckCircle weight="fill" size={20} style={{ color: 'var(--success)' }} />
              <span>{t('bidfrete.detalhe_cotacao.aprovado')}: <strong>{cotacao.moeda_aprovada ?? 'USD'} {cotacao.valor_aprovado_ganho_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              {cotacao.ganho_valor_cotacao_bid_frete_internacional != null && (
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                  Saving: {usd(cotacao.ganho_valor_cotacao_bid_frete_internacional)} ({cotacao.ganho_percentual_cotacao_bid_frete_internacional?.toFixed(1)}%)
                </span>
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Tab: Bids */}
      {tab === 'bids' && (
        <div className="dc-card">
          {bids.length === 0 && (
            <div className="dc-empty" style={{ height: 'auto', paddingBottom: '1rem' }}>
              <PaperPlaneTilt weight="duotone" size={40} style={{ opacity: 0.3 }} />
              <p>{t('bidfrete.detalhe_cotacao.vazio_disparos')}</p>
              <button className="dc-btn dc-btn--primary" type="button" onClick={() => setModalDisparoAberto(true)}>
                <PaperPlaneTilt weight="bold" size={14} /> {t('bidfrete.disparo.enviar', 'Enviar aos fornecedores')}
              </button>
            </div>
          )}
          <TabelaGlobal
            dados={bids}
            colunas={bidColunas}
            idKey="id_disparo_cotacao_bid_frete_internacional"
            mensagemVazio={t('bidfrete.detalhe_cotacao.vazio_disparos')}
            tooltipBusca={t('bidfrete.detalhe_cotacao.buscar_fornecedor')}
          />
        </div>
      )}

      {/* Tab: Respostas */}
      {tab === 'respostas' && id && (
        <ListaPropostasDetalheCotacao
          id_cotacao_bid_frete_internacional={id}
          propostasRanking={propostasRanking}
          carregandoRanking={carregandoRanking}
          variante="padrao"
        />
      )}
        </div>

        {tab === 'dados' && id && (
          <aside className="dc-cockpit-combat" aria-label={t('bidfrete.detalhe_cotacao.cockpit_combat', 'Matriz de propostas')}>
            <h2 className="dc-cockpit-combat-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_combat_matrix', 'Combat Matrix')}
            </h2>
            <ListaPropostasDetalheCotacao
              id_cotacao_bid_frete_internacional={id}
              propostasRanking={propostasRanking}
              carregandoRanking={carregandoRanking}
              variante="combate"
            />
          </aside>
        )}
      </div>

      <style>{`
        .dc-page { }

        /* ── Painel fluxo (timeline + infográficos) ── */
        .dc-fluxo-panel {
          background: linear-gradient(165deg, #293548 0%, #1a2332 48%, #151d2b 100%);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 14px;
          padding: 1rem 1.15rem 1.1rem;
          margin-bottom: 1rem;
        }

        .dc-resumo-kpis {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 720px) {
          .dc-resumo-kpis { grid-template-columns: 1fr; }
        }
        .dc-resumo-kpi {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: linear-gradient(165deg, rgba(51, 65, 85, 0.4) 0%, rgba(15, 23, 42, 0.88) 100%);
          text-align: left;
          cursor: pointer;
          transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }
        .dc-resumo-kpi:hover {
          border-color: color-mix(in srgb, var(--dc-kpi-accent, #818cf8) 45%, transparent);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
        }
        .dc-resumo-kpi:focus-visible {
          outline: 2px solid var(--dc-kpi-accent, #818cf8);
          outline-offset: 2px;
        }
        .dc-resumo-kpi-icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--dc-kpi-accent, #818cf8) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--dc-kpi-accent, #818cf8) 28%, transparent);
          color: var(--dc-kpi-accent, #818cf8);
        }
        .dc-resumo-kpi-body {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }
        .dc-resumo-kpi-valor {
          font-size: 1.375rem;
          font-weight: 700;
          line-height: 1.1;
          color: var(--text-primary, #f1f5f9);
          font-variant-numeric: tabular-nums;
        }
        .dc-resumo-kpi-rotulo {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, #94a3b8);
        }
        .dc-resumo-kpi-sub {
          font-size: 0.75rem;
          color: var(--text-secondary, #64748b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dc-fluxo-painel-corpo {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .dc-fluxo-compact {
          position: relative;
          padding-top: 0.35rem;
        }
        .dc-fluxo-compact-track {
          position: relative;
          height: 4px;
          margin-bottom: 0.55rem;
          border-radius: 4px;
          overflow: hidden;
        }
        .dc-fluxo-compact-track-base {
          position: absolute;
          inset: 0;
          background: rgba(71, 85, 105, 0.4);
        }
        .dc-fluxo-compact-track-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #22c55e, #6366f1);
          border-radius: 4px;
          transition: width 0.35s ease;
        }
        .dc-fluxo-compact-etapas {
          display: flex;
          justify-content: space-between;
          gap: 0.25rem;
        }
        .dc-fluxo-compact-etapa {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
          min-width: 0;
        }
        .dc-fluxo-compact-node {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          border: 1px solid rgba(100, 116, 139, 0.35);
          background: rgba(30, 41, 59, 0.8);
          color: #94a3b8;
        }
        .dc-fluxo-compact-etapa--done .dc-fluxo-compact-node {
          border-color: rgba(74, 222, 128, 0.4);
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
        }
        .dc-fluxo-compact-etapa--active .dc-fluxo-compact-node {
          border-color: rgba(129, 140, 248, 0.55);
          background: rgba(99, 102, 241, 0.2);
          color: #c7d2fe;
        }
        .dc-fluxo-compact-label {
          font-size: 0.5625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          text-align: center;
          line-height: 1.2;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dc-fluxo-compact-etapa--done .dc-fluxo-compact-label { color: #86efac; }
        .dc-fluxo-compact-etapa--active .dc-fluxo-compact-label { color: #a5b4fc; }
        @media (max-width: 640px) {
          .dc-fluxo-compact-label { font-size: 0.5rem; }
          .dc-fluxo-compact-node { width: 22px; height: 22px; }
        }

        .dc-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.55rem;
        }
        @media (max-width: 960px) {
          .dc-info-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .dc-info-grid { grid-template-columns: 1fr; }
        }
        .dc-info-card {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          padding: 0.65rem 0.75rem;
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(15, 23, 42, 0.45);
          min-height: 72px;
        }
        .dc-info-card--wide {
          grid-column: 1 / -1;
        }
        @media (min-width: 961px) {
          .dc-info-card--wide { grid-column: span 3; }
        }
        @media (max-width: 960px) and (min-width: 521px) {
          .dc-info-card--wide { grid-column: span 2; }
        }
        .dc-info-card--destaque {
          border-color: rgba(129, 140, 248, 0.28);
          background: rgba(99, 102, 241, 0.08);
        }
        .dc-info-card--vazio { opacity: 0.65; }
        .dc-info-card-icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(129, 140, 248, 0.2);
          color: #a5b4fc;
        }
        .dc-info-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
          min-width: 0;
          flex: 1;
        }
        .dc-info-card-body--wide { gap: 0.35rem; }
        .dc-info-card-titulo {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }
        .dc-info-card-valor {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.2;
        }
        .dc-info-card-valor--truncate {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dc-info-card-detalhe {
          font-size: 0.6875rem;
          color: #94a3b8;
          line-height: 1.35;
        }
        .dc-info-card-detalhe--fornecedor {
          margin-top: -0.05rem;
          margin-bottom: 0.15rem;
        }
        .dc-info-card--metricas {
          min-height: auto;
        }
        .dc-info-metricas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem 0.65rem;
          margin-top: 0.2rem;
        }
        @media (max-width: 640px) {
          .dc-info-metricas-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .dc-info-metrica {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
        }
        .dc-info-metrica-label {
          font-size: 0.5625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          line-height: 1.2;
        }
        .dc-info-metrica-valor {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #e2e8f0;
          font-family: 'DM Mono', monospace;
          line-height: 1.25;
        }
        .dc-info-legenda {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.625rem;
          color: #64748b;
          padding-top: 0.1rem;
        }

        /* ── Dados — 3 cards ── */
        .dc-dados-layout {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.15rem;
          align-items: stretch;
        }
        @media (max-width: 1100px) {
          .dc-dados-layout { grid-template-columns: 1fr; }
        }
        .dc-dados-extras {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .dc-dados-card {
          position: relative;
          height: 100%;
          padding: 0;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: linear-gradient(168deg, #2a3548 0%, #1e293b 42%, #161f2e 100%);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.05) inset,
            0 8px 32px rgba(0, 0, 0, 0.22);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .dc-dados-card:hover {
          transform: translateY(-3px);
          border-color: rgba(148, 163, 184, 0.22);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.06) inset,
            0 16px 40px rgba(0, 0, 0, 0.32);
        }
        .dc-dados-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 14px 14px 0 0;
        }
        .dc-dados-card--gerais::after {
          background: linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%);
        }
        .dc-dados-card--rota::after {
          background: linear-gradient(90deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%);
        }
        .dc-dados-card--carga::after {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%);
        }
        .dc-dados-card-title {
          margin: 0;
          padding: 1.15rem 1.35rem 0.85rem;
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #f8fafc;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }
        .dc-dados-card--gerais .dc-dados-card-title { color: #e0e7ff; }
        .dc-dados-card--rota .dc-dados-card-title { color: #e0f2fe; }
        .dc-dados-card--carga .dc-dados-card-title { color: #fef3c7; }
        .dc-dados-card-body {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0 1.35rem 1.25rem;
        }
        .dc-dados-card-body .dc-info-row {
          border-bottom-color: rgba(148, 163, 184, 0.1);
          padding: 0.55rem 0;
        }
        .dc-dados-card-body .dc-info-row:last-child {
          border-bottom: none;
        }
        .dc-dados-card-body .dc-info-label {
          color: #94a3b8;
        }
        .dc-dados-card-body .dc-info-value {
          color: #f1f5f9;
          font-weight: 600;
        }

        .dc-mercadoria-destaque {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
          padding: 0.9rem 1rem;
          margin-bottom: 0.5rem;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.22);
        }
        .dc-mercadoria-icon {
          flex-shrink: 0;
          color: #fbbf24;
          margin-top: 0.1rem;
          padding: 0.45rem;
          border-radius: 8px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.25);
        }
        .dc-mercadoria-texto {
          margin: 0.25rem 0 0;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #f8fafc;
          font-weight: 500;
        }

        /* ── Tabs ── */
        .dc-tabs {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
          margin-bottom: 1rem;
        }
        .dc-tab {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .dc-tab:hover { color: var(--text-primary, #f1f5f9); }
        .dc-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }

        /* ── Card ── */
        .dc-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1.5rem;
        }

        .dc-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }
        .dc-info-row--com-icone {
          padding: 0.55rem 0;
        }
        .dc-info-label-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }
        .dc-info-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(129, 140, 248, 0.18);
          color: #a5b4fc;
        }
        .dc-dados-card--gerais .dc-info-icon-badge {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(129, 140, 248, 0.22);
          color: #818cf8;
        }
        .dc-info-label {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dc-info-value {
          font-size: 0.8125rem;
          color: var(--text-primary, #f1f5f9);
          font-weight: 500;
          text-align: right;
        }
        .dc-info-mono { font-family: 'DM Mono', monospace; }

        /* ── Target / Aprovado ── */
        .dc-target, .dc-aprovado {
          margin-top: 0;
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(51, 65, 85, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-secondary, #94a3b8);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .dc-target-label { font-weight: 600; }
        .dc-target-value {
          font-family: 'DM Mono', monospace;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }
        .dc-aprovado {
          border: 1px solid rgba(34, 197, 94, 0.4);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(15, 23, 42, 0.92) 100%);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.12);
        }

        /* ── Propostas (Respostas) ── */
        .dc-prop-panel {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .dc-prop-panel-toolbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          background: rgba(30, 41, 59, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }
        .dc-prop-sort-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          flex: 1;
          min-width: 0;
        }
        .dc-prop-sort-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }
        .dc-prop-sort-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .dc-prop-sort-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(15, 23, 42, 0.55);
          color: #94a3b8;
          font-size: 0.6875rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
        }
        .dc-prop-sort-btn:hover {
          border-color: rgba(129, 140, 248, 0.45);
          color: #e2e8f0;
        }
        .dc-prop-sort-btn--ativo {
          border-color: rgba(129, 140, 248, 0.55);
          background: rgba(99, 102, 241, 0.18);
          color: #e0e7ff;
        }
        .dc-prop-comparativo-btn {
          flex-shrink: 0;
          align-self: center;
        }
        @media (max-width: 720px) {
          .dc-prop-comparativo-btn { align-self: flex-start; width: 100%; justify-content: center; }
        }
        .dc-prop-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .dc-prop-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          min-height: 160px;
          color: var(--text-muted, #94a3b8);
          font-size: 0.875rem;
        }
        .dc-prop-loading-icon {
          animation: dc-prop-pulse 1.2s ease-in-out infinite;
        }
        @keyframes dc-prop-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .dc-prop-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(168deg, #2a3548 0%, #1e293b 42%, #161f2e 100%);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }
        .dc-prop-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%);
        }
        .dc-prop-card--lider::after {
          background: linear-gradient(90deg, #ca8a04 0%, #facc15 50%, #fde047 100%);
        }
        .dc-prop-card--aprovada::after {
          background: linear-gradient(90deg, #16a34a 0%, #4ade80 50%, #86efac 100%);
        }
        .dc-prop-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem 0.65rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        @media (max-width: 640px) {
          .dc-prop-card-head { flex-direction: column; gap: 0.65rem; }
          .dc-prop-card-total-block { align-items: flex-start; }
        }
        .dc-prop-card-head-main {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          min-width: 0;
          flex: 1;
        }
        .dc-prop-rank-inline {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.15rem;
          min-width: 2.25rem;
          height: 2.25rem;
          padding: 0 0.45rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 800;
          font-family: 'DM Mono', monospace;
        }
        .dc-prop-card-titulos { min-width: 0; }
        .dc-prop-card-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.45rem 0.65rem;
        }
        .dc-prop-fornecedor {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.01em;
        }
        .dc-prop-card-meta {
          margin: 0.25rem 0 0;
          font-size: 0.6875rem;
          font-weight: 500;
          color: #94a3b8;
          line-height: 1.45;
        }
        .dc-prop-badge-aprovada {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.15rem 0.45rem;
          border-radius: 999px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #86efac;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(74, 222, 128, 0.28);
        }
        .dc-prop-card-total-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.15rem;
          flex-shrink: 0;
        }
        .dc-prop-total-valor {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #f1f5f9;
        }
        .dc-prop-resumo {
          margin: 0;
          padding: 0.5rem 1.25rem 0.65rem;
          font-size: 0.6875rem;
          font-weight: 500;
          color: #64748b;
          line-height: 1.5;
          border-bottom: 1px solid rgba(148, 163, 184, 0.08);
        }
        .dc-prop-card-body {
          display: flex;
          flex-direction: column;
          padding: 0 1.25rem 0.35rem;
        }
        .dc-prop-card-body .dc-info-row {
          border-bottom-color: rgba(148, 163, 184, 0.1);
          padding: 0.55rem 0;
        }
        .dc-prop-card-body .dc-info-row:last-child {
          border-bottom: none;
        }
        .dc-prop-icon-badge {
          background: rgba(56, 189, 248, 0.12);
          border-color: rgba(125, 211, 252, 0.28);
          color: #38bdf8;
        }
        .dc-prop-obs {
          margin: 0;
          padding: 0.65rem 1.25rem 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          font-style: italic;
        }
        .dc-btn--sm {
          padding: 0.4rem 0.75rem;
          font-size: 0.8125rem;
        }

        /* ── Empty ── */
        .dc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 0.75rem;
          color: var(--text-muted, #64748b);
          font-size: 0.875rem;
        }

        /* ── Botões ── */
        .dc-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          font-family: inherit;
        }
        .dc-btn--primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .dc-btn--primary:hover { background: var(--accent-hover, #4f46e5); }
        .dc-btn--secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .dc-btn--secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
        .dc-btn--danger {
          background: rgba(239,68,68,0.15);
          color: var(--danger, #ef4444);
        }
        .dc-btn--danger:hover {
          background: var(--danger, #ef4444);
          color: #fff;
        }

      `}</style>
      <ModalEnviarCotacaoBidFreteInternacional
        cotacao={cotacao}
        aberto={modalDisparoAberto}
        onFechar={() => setModalDisparoAberto(false)}
        onEnviado={() => {
          setModalDisparoAberto(false)
          setTab('bids')
          void carregar()
        }}
      />
    </PaginaGlobal>
  )
}
