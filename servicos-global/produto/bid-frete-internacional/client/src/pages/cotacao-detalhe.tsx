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
import { formatarContainersPersistidosParaExibicao } from '../shared/containers-cotacao-bid-frete-internacional'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import {
  FileText,
  ArrowLeft,
  Trash,
  PaperPlaneTilt,
  Ranking,
  CheckCircle,
  Clock,
  Eye,
  Envelope,
  ChatCircle,
  Anchor,
  AirplaneTilt,
  Van,
  MapPin,
  Package,
  Scales,
  Warning,
  XCircle,
  LinkSimple,
  Hourglass,
  UserCircle,
  ArrowRight,
  Cube,
} from '@phosphor-icons/react'

import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { getCotacao, getDisparoPorCotacaoBidFreteInternacional, excluirCotacao, mudarStatusCotacao } from '../shared/api'
import { ModalEnviarCotacaoBidFreteInternacional } from './modal-enviar-cotacao-bid-frete-internacional'
import type {
  Cotacao,
  DisparoCotacaoBidFreteInternacional,
  PropostaBidFreteInternacional,
  StatusCotacao,
  StatusDisparoCotacaoBidFreteInternacional,
} from '../shared/types'
import type { TFunction } from 'i18next'
import {
  STATUS_LABELS,
  MODAL_LABELS,
  MODALIDADE_LABELS,
  OPERACAO_LABELS,
  CANAL_LABELS,
  STATUS_DISPARO_COTACAO_BID_FRETE_INTERNACIONAL_LABELS,
} from '../shared/types'

// ─── Formatação ──────────────────────────────────────────────────────────────

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

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

// ─── Timeline ────────────────────────────────────────────────────────────────

const STATUS_COTACAO_OPCOES: SelectOpcao[] = (Object.keys(STATUS_LABELS) as StatusCotacao[]).map((status) => ({
  valor: status,
  rotulo: STATUS_LABELS[status],
}))

const FLUXO_ETAPAS: { indice: number; labelKey: string }[] = [
  { indice: 0, labelKey: 'bidfrete.detalhe_cotacao.timeline_rascunho' },
  { indice: 1, labelKey: 'bidfrete.detalhe_cotacao.timeline_enviada' },
  { indice: 2, labelKey: 'bidfrete.detalhe_cotacao.timeline_em_cotacao' },
  { indice: 3, labelKey: 'bidfrete.detalhe_cotacao.timeline_aguardando' },
  { indice: 4, labelKey: 'bidfrete.detalhe_cotacao.timeline_aprovada' },
]

function indiceFluxoPorStatus(status: StatusCotacao): number {
  const mapa: Partial<Record<StatusCotacao, number>> = {
    RASCUNHO: 0,
    FALTA_INFORMACAO: 0,
    ENVIADA_FORNECEDORES: 1,
    EM_COTACAO: 2,
    AGUARDANDO_APROVACAO: 3,
    APROVADA: 4,
    REPROVADA: 3,
    CANCELADA: 0,
    EXPIRADA: 2,
  }
  return mapa[status] ?? 0
}

function emojiBandeiraPais(codigoPais: string): string {
  const cod = codigoPais.trim().toUpperCase()
  if (cod.length !== 2 || !/^[A-Z]{2}$/.test(cod)) return ''
  return String.fromCodePoint(
    ...[...cod].map((letra) => 0x1f1e6 + letra.charCodeAt(0) - 65),
  )
}

function subtituloEtapaFluxo(
  indiceEtapa: number,
  indiceAtual: number,
  dataCriacao: string,
  t: TFunction,
): string {
  if (indiceEtapa < indiceAtual) {
    if (indiceEtapa === 0) {
      return t('bidfrete.detalhe_cotacao.fluxo_rascunho_concluido', {
        data: dataBR(dataCriacao),
        defaultValue: `Rascunho Concluído. Criada em ${dataBR(dataCriacao)}`,
      })
    }
    if (indiceEtapa === 1) {
      return t('bidfrete.detalhe_cotacao.fluxo_cotacao_enviada', 'Cotação Enviada')
    }
    return t('bidfrete.detalhe_cotacao.fluxo_concluido', 'Concluído')
  }
  if (indiceEtapa === indiceAtual) {
    if (indiceEtapa === 2) {
      return t('bidfrete.detalhe_cotacao.fluxo_aguardando_propostas', 'Aguardando Propostas (Em Progresso)')
    }
    if (indiceEtapa === 0) {
      return t('bidfrete.detalhe_cotacao.fluxo_rascunho_concluido', {
        data: dataBR(dataCriacao),
        defaultValue: `Rascunho Concluído. Criada em ${dataBR(dataCriacao)}`,
      })
    }
    if (indiceEtapa === 1) {
      return t('bidfrete.detalhe_cotacao.fluxo_cotacao_enviada', 'Cotação Enviada')
    }
    if (indiceEtapa === 4) {
      return t('bidfrete.comparativo.aprovar', 'Aprovada')
    }
    return t('bidfrete.detalhe_cotacao.fluxo_pendente', 'Pendente')
  }
  return t('bidfrete.detalhe_cotacao.fluxo_pendente', 'Pendente')
}

function StepperFluxoCotacao({
  statusAtual,
  dataCriacao,
}: {
  statusAtual: StatusCotacao
  dataCriacao: string
}) {
  const { t } = useTranslation()
  const indiceAtual = indiceFluxoPorStatus(statusAtual)

  return (
    <div className="dc-fluxo-stepper" role="list" aria-label={t('bidfrete.detalhe_cotacao.status', 'Status')}>
      {FLUXO_ETAPAS.map((etapa) => {
        const concluida = etapa.indice < indiceAtual
        const ativa = etapa.indice === indiceAtual
        const pendente = etapa.indice > indiceAtual
        const IconeEtapa = concluida
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
              'dc-fluxo-card',
              concluida ? 'dc-fluxo-card--done' : '',
              ativa ? 'dc-fluxo-card--active' : '',
              pendente ? 'dc-fluxo-card--pending' : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="dc-fluxo-card-icon-wrap" aria-hidden>
              <IconeEtapa weight={concluida ? 'fill' : 'duotone'} size={20} />
            </div>
            <div className="dc-fluxo-card-text">
              <span className="dc-fluxo-card-title">{t(etapa.labelKey)}</span>
              <span className="dc-fluxo-card-sub">
                {subtituloEtapaFluxo(etapa.indice, indiceAtual, dataCriacao, t)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
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
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [erroStatus, setErroStatus] = useState<string | null>(null)

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
    } catch (e: unknown) {
      setCotacao(null)
      setBids([])
      setErro(e instanceof Error ? e.message : 'Erro ao carregar cotação')
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  const tituloTopo = useMemo(() => {
    if (carregando) {
      return {
        label: t('comum.carregando'),
        icone: <FileText weight="duotone" size={22} />,
      }
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

  const handleMudarStatus = useCallback(async (novoStatus: string | number | null) => {
    if (!cotacao || novoStatus == null || novoStatus === '') return
    const status = String(novoStatus) as StatusCotacao
    if (status === cotacao.status_cotacao_bid_frete_internacional) return

    setSalvandoStatus(true)
    setErroStatus(null)
    try {
      const atualizada = await mudarStatusCotacao(cotacao.id_cotacao_bid_frete_internacional, status)
      setCotacao(atualizada)
    } catch (e: unknown) {
      setErroStatus(e instanceof Error ? e.message : t('bidfrete.detalhe_cotacao.erro_status', 'Erro ao alterar status'))
    } finally {
      setSalvandoStatus(false)
    }
  }, [cotacao, t])

  const acoesToolbar = cotacao ? (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      <button className="dc-btn dc-btn--secondary" type="button" onClick={() => navigate('/bid-frete/cotacoes')}>
        <ArrowLeft weight="bold" size={14} /> {t('comum.voltar')}
      </button>
      <button
        className="dc-btn dc-btn--primary"
        type="button"
        onClick={() => setModalDisparoAberto(true)}
      >
        <PaperPlaneTilt weight="bold" size={14} /> {t('bidfrete.disparo.enviar', 'Enviar aos fornecedores')}
      </button>
      {cotacao.status_cotacao_bid_frete_internacional === 'AGUARDANDO_APROVACAO' && (
        <button className="dc-btn dc-btn--primary" type="button" onClick={() => navigate(`/bid-frete/cotacoes/${id}/comparativo`)}>
          <Ranking weight="bold" size={14} /> {t('bidfrete.detalhe_cotacao.comparativo')}
        </button>
      )}
      {cotacao.status_cotacao_bid_frete_internacional === 'RASCUNHO' && (
        <button
          className="dc-btn dc-btn--danger"
          type="button"
          onClick={async () => { await excluirCotacao(cotacao.id_cotacao_bid_frete_internacional); navigate('/bid-frete/cotacoes') }}
        >
          <Trash weight="bold" size={14} /> {t('comum.excluir')}
        </button>
      )}
    </div>
  ) : null

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
    return (
      <PaginaGlobal>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
          <Clock weight="duotone" size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </PaginaGlobal>
    )
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
    <PaginaGlobal className="dc-page bid-frete-page-shell">
      {acoesToolbar}

      <div className="dc-fluxo-panel">
        <div className="dc-fluxo-panel-top">
          <div className="dc-status-select">
            <span className="dc-status-select-label">{t('bidfrete.detalhe_cotacao.status', 'Status')}</span>
            <SelectGlobal
              opcoes={STATUS_COTACAO_OPCOES}
              valor={cotacao.status_cotacao_bid_frete_internacional}
              aoMudarValor={handleMudarStatus}
              desabilitado={salvandoStatus}
              placeholder={t('bidfrete.detalhe_cotacao.selecionar_status', 'Selecione o status')}
            />
          </div>
          <span className="dc-status-date">
            {t('bidfrete.detalhe_cotacao.criada_em')} {dataBR(cotacao.data_criacao_cotacao_bid_frete_internacional)}
          </span>
          {erroStatus && <span className="dc-status-erro" role="alert">{erroStatus}</span>}
          {cotacao.ganho_percentual_cotacao_bid_frete_internacional != null && cotacao.ganho_percentual_cotacao_bid_frete_internacional > 0 && (
            <span className="dc-saving-badge">
              {t('bidfrete.detalhe_cotacao.saving_label', 'Saving:')} {cotacao.ganho_percentual_cotacao_bid_frete_internacional.toFixed(1)}%
            </span>
          )}
        </div>
        <StepperFluxoCotacao
          statusAtual={cotacao.status_cotacao_bid_frete_internacional}
          dataCriacao={cotacao.data_criacao_cotacao_bid_frete_internacional}
        />
      </div>

      {/* Tabs */}
      <div className="dc-tabs">
        <button className={`dc-tab ${tab === 'dados' ? 'dc-tab--ativo' : ''}`} onClick={() => setTab('dados')}>
          {t('bidfrete.detalhe_cotacao.tab_dados')}
        </button>
        <button className={`dc-tab ${tab === 'bids' ? 'dc-tab--ativo' : ''}`} onClick={() => setTab('bids')}>
          {t('bidfrete.detalhe_cotacao.tab_disparos')} ({bids.length})
        </button>
        <button className={`dc-tab ${tab === 'respostas' ? 'dc-tab--ativo' : ''}`} onClick={() => setTab('respostas')}>
          {t('bidfrete.detalhe_cotacao.tab_respostas')} ({cotacao.propostas_bid_frete_internacional?.length ?? 0})
        </button>
      </div>

      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div className="dc-dados-layout">
          <CardSecaoDados variante="gerais" titulo={t('bidfrete.detalhe_cotacao.card_detalhes_gerais', 'Detalhes Gerais')}>
            <InfoRow label={t('bidfrete.detalhe_cotacao.tipo_operacao')} value={OPERACAO_LABELS[cotacao.tipo_operacao_cotacao_bid_frete_internacional]} />
            <InfoRow label={t('bidfrete.detalhe_cotacao.modal')} value={MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional]} />
            <InfoRow label={t('bidfrete.detalhe_cotacao.modalidade')} value={MODALIDADE_LABELS[cotacao.modalidade_cotacao_bid_frete_internacional]} />
            <InfoRow label={t('bidfrete.detalhe_cotacao.incoterm')} value={cotacao.incoterm_cotacao_bid_frete_internacional} mono />
            <InfoRow
              label={t('bidfrete.detalhe_cotacao.visibilidade')}
              value={cotacao.visibilidade_cotacao_bid_frete_internacional === 'ABERTA' ? t('bidfrete.nova_cotacao.tipo_aberta') : t('bidfrete.nova_cotacao.tipo_direcionada')}
            />
          </CardSecaoDados>

          <CardSecaoDados variante="rota" titulo={t('bidfrete.detalhe_cotacao.card_rota', 'Rota')}>
            <div className="dc-rota-visual">
              <div className="dc-rota-ponto">
                <span className="dc-rota-flag" aria-hidden>{emojiBandeiraPais(cotacao.origem_pais_cotacao_bid_frete_internacional)}</span>
                <div className="dc-rota-ponto-text">
                  <span className="dc-rota-ponto-label">{t('bidfrete.detalhe_cotacao.origem')}</span>
                  <span className="dc-rota-ponto-nome">{cotacao.origem_nome_cotacao_bid_frete_internacional}</span>
                  <span className="dc-rota-ponto-codigo dc-info-mono">{cotacao.origem_codigo_cotacao_bid_frete_internacional}</span>
                </div>
              </div>
              <div className="dc-rota-seta" aria-hidden>
                <ArrowRight weight="bold" size={28} />
              </div>
              <div className="dc-rota-ponto">
                <span className="dc-rota-flag" aria-hidden>{emojiBandeiraPais(cotacao.destino_pais_cotacao_bid_frete_internacional)}</span>
                <div className="dc-rota-ponto-text">
                  <span className="dc-rota-ponto-label">{t('bidfrete.detalhe_cotacao.destino')}</span>
                  <span className="dc-rota-ponto-nome">{cotacao.destino_nome_cotacao_bid_frete_internacional}</span>
                  <span className="dc-rota-ponto-codigo dc-info-mono">{cotacao.destino_codigo_cotacao_bid_frete_internacional}</span>
                </div>
              </div>
            </div>
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
      {tab === 'respostas' && (
        <div className="dc-card">
          {(!cotacao.propostas_bid_frete_internacional || cotacao.propostas_bid_frete_internacional.length === 0) ? (
            <div className="dc-empty">
              <PaperPlaneTilt weight="duotone" size={40} style={{ opacity: 0.3 }} />
              <p>{t('bidfrete.detalhe_cotacao.vazio_respostas')}</p>
            </div>
          ) : (
            <div className="dc-responses-list">
              {cotacao.propostas_bid_frete_internacional.map((resp: PropostaBidFreteInternacional) => {
                const aprovada = resp.status_proposta_bid_frete_internacional === 'APROVADA'
                return (
                <div key={resp.id_proposta_bid_frete_internacional} className={`dc-response-card ${aprovada ? 'dc-response-card--aprovada' : ''}`}>
                  <div className="dc-resp-header">
                    <span className="dc-resp-fornecedor">{resp.fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor'}</span>
                    {aprovada && <Badge label={t('bidfrete.comparativo.aprovar')} variante="success" />}
                  </div>
                  <div className="dc-resp-grid">
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_frete')}</span>
                      <span className="dc-resp-value">{resp.moeda_proposta_bid_frete_internacional} {resp.valor_frete_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_taxas_origem')}</span>
                      <span className="dc-resp-value">{resp.moeda_proposta_bid_frete_internacional} {resp.taxas_origem_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_taxas_destino')}</span>
                      <span className="dc-resp-value">{resp.moeda_proposta_bid_frete_internacional} {resp.taxas_destino_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item dc-resp-item--destaque">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_total')}</span>
                      <span className="dc-resp-value">{resp.moeda_proposta_bid_frete_internacional} {resp.valor_total_proposta_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.comparativo.transit_time')}</span>
                      <span className="dc-resp-value">{resp.dias_transito_proposta_bid_frete_internacional} {t('bidfrete.detalhe_cotacao.dias')}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_free_time')}</span>
                      <span className="dc-resp-value">{resp.dias_free_time_proposta_bid_frete_internacional ?? '—'} {t('bidfrete.detalhe_cotacao.dias')}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_transbordos')}</span>
                      <span className="dc-resp-value">{resp.quantidade_transbordo_proposta_bid_frete_internacional}</span>
                    </div>
                    <div className="dc-resp-item">
                      <span className="dc-resp-label">{t('bidfrete.detalhe_cotacao.resp_validade')}</span>
                      <span className="dc-resp-value">{dataBR(resp.validade_proposta_bid_frete_internacional)}</span>
                    </div>
                  </div>
                  {resp.observacoes_proposta_bid_frete_internacional && (
                    <p className="dc-resp-obs">{resp.observacoes_proposta_bid_frete_internacional}</p>
                  )}
                </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .dc-page { }

        /* ── Painel fluxo (status + stepper) ── */
        .dc-fluxo-panel {
          background: linear-gradient(165deg, #293548 0%, #1a2332 48%, #151d2b 100%);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 16px;
          padding: 1.35rem 1.5rem 1.5rem;
          margin-bottom: 1.35rem;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 12px 40px rgba(0, 0, 0, 0.28);
        }
        .dc-fluxo-panel-top {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1rem 1.5rem;
          margin-bottom: 1.35rem;
          padding-bottom: 1.1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }
        .dc-status-select {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 240px;
        }
        .dc-status-select-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }
        .dc-status-erro {
          font-size: 0.8125rem;
          color: var(--danger, #ef4444);
        }
        .dc-status-date {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          padding-bottom: 0.35rem;
        }
        .dc-saving-badge {
          margin-left: auto;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-pill, 9999px);
          background: rgba(34,197,94,0.15);
          color: var(--success, #22c55e);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .dc-fluxo-stepper {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.85rem;
        }
        @media (max-width: 1100px) {
          .dc-fluxo-stepper { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .dc-fluxo-stepper { grid-template-columns: 1fr; }
        }

        .dc-fluxo-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 1.05rem 1rem 1.05rem 1.1rem;
          border-radius: 12px;
          border: 1px solid rgba(100, 116, 139, 0.28);
          background: linear-gradient(160deg, rgba(51, 65, 85, 0.55) 0%, rgba(15, 23, 42, 0.92) 100%);
          min-height: 96px;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .dc-fluxo-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: rgba(100, 116, 139, 0.35);
          border-radius: 12px 0 0 12px;
        }
        .dc-fluxo-card--done {
          border-color: rgba(34, 197, 94, 0.55);
          background: linear-gradient(155deg, rgba(34, 197, 94, 0.22) 0%, rgba(15, 23, 42, 0.95) 55%);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.12);
        }
        .dc-fluxo-card--done::before {
          background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
          width: 4px;
        }
        .dc-fluxo-card--done .dc-fluxo-card-icon-wrap {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }
        .dc-fluxo-card--done .dc-fluxo-card-title { color: #86efac; }

        .dc-fluxo-card--active {
          border-color: rgba(129, 140, 248, 0.75);
          background: linear-gradient(155deg, rgba(99, 102, 241, 0.35) 0%, rgba(30, 27, 75, 0.85) 50%, rgba(15, 23, 42, 0.98) 100%);
          box-shadow:
            0 0 0 1px rgba(129, 140, 248, 0.5),
            0 0 32px rgba(99, 102, 241, 0.35),
            0 12px 28px rgba(0, 0, 0, 0.35);
          transform: translateY(-2px);
        }
        .dc-fluxo-card--active::before {
          background: linear-gradient(180deg, #a5b4fc 0%, #6366f1 50%, #4f46e5 100%);
          width: 4px;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.8);
        }
        .dc-fluxo-card--active .dc-fluxo-card-icon-wrap {
          background: rgba(99, 102, 241, 0.35);
          color: #c7d2fe;
          border: 1px solid rgba(165, 180, 252, 0.45);
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
        }
        .dc-fluxo-card--active .dc-fluxo-card-title { color: #e0e7ff; }
        .dc-fluxo-card--active .dc-fluxo-card-sub { color: #a5b4fc; }

        .dc-fluxo-card--pending {
          border-color: rgba(71, 85, 105, 0.45);
          background: linear-gradient(160deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.88) 100%);
        }
        .dc-fluxo-card--pending .dc-fluxo-card-icon-wrap {
          background: rgba(51, 65, 85, 0.65);
          color: #94a3b8;
          border: 1px solid rgba(100, 116, 139, 0.35);
        }
        .dc-fluxo-card--pending .dc-fluxo-card-title { color: #cbd5e1; }
        .dc-fluxo-card--pending .dc-fluxo-card-sub { color: #64748b; }

        .dc-fluxo-card-icon-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          margin-top: 0.05rem;
        }
        .dc-fluxo-card-text {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          min-width: 0;
          padding-top: 0.1rem;
        }
        .dc-fluxo-card-title {
          font-size: 0.875rem;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: 0.01em;
        }
        .dc-fluxo-card-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
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

        .dc-rota-visual {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 0.65rem;
          padding: 0.85rem 1rem;
          margin-top: 0.15rem;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(56, 189, 248, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        @media (max-width: 480px) {
          .dc-rota-visual { flex-direction: column; }
          .dc-rota-seta { transform: rotate(90deg); }
        }
        .dc-rota-ponto {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          min-width: 0;
          padding: 0.5rem 0.65rem;
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.08);
        }
        .dc-rota-flag {
          font-size: 1.65rem;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
        }
        .dc-rota-ponto-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .dc-rota-ponto-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
        }
        .dc-rota-ponto-nome {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }
        .dc-rota-ponto-codigo {
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
        }
        .dc-rota-seta {
          flex-shrink: 0;
          align-self: center;
          color: #38bdf8;
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.45));
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
          padding: 0.4rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
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

        /* ── Response Cards ── */
        .dc-responses-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .dc-response-card {
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 1rem;
          border: 1px solid var(--bg-elevated, #475569);
        }
        .dc-response-card--aprovada {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.03);
        }
        .dc-resp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .dc-resp-fornecedor {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }
        .dc-resp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 800px) {
          .dc-resp-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .dc-resp-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .dc-resp-item--destaque {
          background: rgba(99,102,241,0.1);
          padding: 0.5rem;
          border-radius: var(--radius-sm, 4px);
        }
        .dc-resp-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          letter-spacing: 0.04em;
        }
        .dc-resp-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }
        .dc-resp-obs {
          margin-top: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          font-style: italic;
          padding-top: 0.5rem;
          border-top: 1px solid var(--bg-elevated, #475569);
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

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
