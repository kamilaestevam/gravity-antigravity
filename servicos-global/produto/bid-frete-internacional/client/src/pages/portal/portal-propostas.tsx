/**
 * MinhasRespostas.tsx — Portal do Fornecedor: Historico de Respostas
 * Tabs de filtro + TabelaGlobal com status badges
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import {
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
  ClockCountdown,
  Anchor,
  AirplaneTilt,
  Van,
} from '@phosphor-icons/react'

import { getPortalRespostas } from '../../shared/api'
import type { BidResponse, ModalFrete } from '../../shared/types'
import { MODAL_LABELS } from '../../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

type FiltroTab = 'TODAS' | 'PENDENTES' | 'APROVADAS' | 'REPROVADAS'

// Labels initialized in component since they need t()
const TAB_KEYS: FiltroTab[] = ['TODAS', 'PENDENTES', 'APROVADAS', 'REPROVADAS']

interface RespostaComCotacao extends BidResponse {
  cotacao?: {
    numero_cotacao_bid_frete_internacional: string
    origem_nome_cotacao_bid_frete_internacional: string
    destino_nome_cotacao_bid_frete_internacional: string
    modal_cotacao_bid_frete_internacional: ModalFrete
  }
}

type RespostaStatus = 'aprovada' | 'reprovada' | 'pendente'

function getRespostaStatus(r: BidResponse): RespostaStatus {
  if (r.aprovada) return 'aprovada'
  if (r.aprovada_em && !r.aprovada) return 'reprovada'
  return 'pendente'
}

const STATUS_MAP: Record<RespostaStatus, { labelKey: string; bg: string; color: string }> = {
  pendente:  { labelKey: 'bidfrete.portal.minhas_respostas.status_pendente',  bg: 'rgba(245,158,11,0.15)', color: 'var(--warning, #f59e0b)' },
  aprovada:  { labelKey: 'bidfrete.portal.minhas_respostas.status_aprovada',  bg: 'rgba(34,197,94,0.15)',  color: 'var(--success, #22c55e)' },
  reprovada: { labelKey: 'bidfrete.portal.minhas_respostas.status_reprovada', bg: 'rgba(239,68,68,0.15)',  color: 'var(--danger, #ef4444)' },
}

const MODAL_ICON_MAP: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={14} />,
  AEREO: <AirplaneTilt weight="duotone" size={14} />,
  RODOVIARIO: <Van weight="duotone" size={14} />,
}

const fmtMoeda = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Component ──────────────────────────────────────────────────────────────

export default function MinhasRespostas() {
  const { t } = useTranslation()
  const [respostas, setRespostas] = useState<RespostaComCotacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<FiltroTab>('TODAS')

  const TABS: { key: FiltroTab; label: string }[] = [
    { key: 'TODAS', label: t('comum.todos') },
    { key: 'PENDENTES', label: t('comum.pendente') },
    { key: 'APROVADAS', label: t('bidfrete.portal.dashboard.aprovadas') },
    { key: 'REPROVADAS', label: t('bidfrete.portal.minhas_respostas.tab_reprovadas') },
  ]

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getPortalRespostas()
      setRespostas(data as RespostaComCotacao[])
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtradas = useMemo(() => {
    if (filtro === 'TODAS') return respostas
    return respostas.filter(r => {
      const status = getRespostaStatus(r)
      if (filtro === 'PENDENTES') return status === 'pendente'
      if (filtro === 'APROVADAS') return status === 'aprovada'
      if (filtro === 'REPROVADAS') return status === 'reprovada'
      return true
    })
  }, [respostas, filtro])

  const contadores = useMemo(() => ({
    TODAS: respostas.length,
    PENDENTES: respostas.filter(r => getRespostaStatus(r) === 'pendente').length,
    APROVADAS: respostas.filter(r => getRespostaStatus(r) === 'aprovada').length,
    REPROVADAS: respostas.filter(r => getRespostaStatus(r) === 'reprovada').length,
  }), [respostas])

  useSincronizarTituloPaginaTopo(useMemo(() => ({
    label:     t('bidfrete.portal.minhas_respostas.titulo'),
    icone:     <PaperPlaneTilt weight="duotone" size={22} />,
    subtitulo: t('bidfrete.portal.minhas_respostas.subtitulo', { count: respostas.length }),
  }), [t, respostas.length]))

  const colunas: TabelaGlobalColuna<any>[] = [
    {
      key: 'cotacao',
      label: t('bidfrete.portal.minhas_respostas.col_cotacao'),
      tipo: 'texto',
      largura: 140,
      render: (_val: unknown, row: RespostaComCotacao) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)' }}>
          {row.cotacao?.numero_cotacao_bid_frete_internacional ?? row.id_cotacao_bid_frete_internacional.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'rota',
      label: t('bidfrete.portal.minhas_respostas.col_rota'),
      tipo: 'texto',
      largura: 200,
      render: (_val: unknown, row: RespostaComCotacao) => (
        <span style={{ fontSize: '0.8125rem' }}>
          {row.cotacao?.origem_nome_cotacao_bid_frete_internacional ?? '—'} &rarr; {row.cotacao?.destino_nome_cotacao_bid_frete_internacional ?? '—'}
        </span>
      ),
    },
    {
      key: 'modal_cotacao_bid_frete_internacional',
      label: t('bidfrete.portal.minhas_respostas.col_modal'),
      tipo: 'texto',
      largura: 120,
      render: (_val: unknown, row: RespostaComCotacao) => {
        const modal_cotacao_bid_frete_internacional = row.cotacao?.modal_cotacao_bid_frete_internacional
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
            {modal_cotacao_bid_frete_internacional ? MODAL_ICON_MAP[modal_cotacao_bid_frete_internacional] : null}
            {modal_cotacao_bid_frete_internacional ? MODAL_LABELS[modal_cotacao_bid_frete_internacional] : '—'}
          </span>
        )
      },
    },
    {
      key: 'valor_total_proposta_bid_frete_internacional',
      label: t('bidfrete.portal.minhas_respostas.col_valor_total'),
      tipo: 'numero',
      largura: 140,
      align: 'right',
      render: (val: unknown, row: RespostaComCotacao) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
          {row.moeda_ganho_bid_frete_internacional} {fmtMoeda(val as number)}
        </span>
      ),
    },
    {
      key: 'dias_transito_proposta_bid_frete_internacional',
      label: t('bidfrete.portal.minhas_respostas.col_transit_time'),
      tipo: 'numero',
      largura: 110,
      align: 'center',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>
          {t('bidfrete.portal.minhas_respostas.dias', { val })}
        </span>
      ),
    },
    {
      key: 'validade',
      label: t('bidfrete.portal.minhas_respostas.col_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'status',
      label: t('bidfrete.portal.minhas_respostas.col_status'),
      tipo: 'texto',
      largura: 120,
      render: (_val: unknown, row: RespostaComCotacao) => {
        const status = getRespostaStatus(row)
        const cfg = STATUS_MAP[status]
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: cfg.bg,
            color: cfg.color,
          }}>
            {status === 'aprovada' && <CheckCircle weight="fill" size={12} />}
            {status === 'reprovada' && <XCircle weight="fill" size={12} />}
            {status === 'pendente' && <ClockCountdown weight="fill" size={12} />}
            {t(cfg.labelKey)}
          </span>
        )
      },
    },
  ]

  return (
    <PaginaGlobal className="mr-page bid-frete-page-shell">
      {/* Tabs */}
      <div className="mr-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`mr-tab ${filtro === tab.key ? 'mr-tab--ativo' : ''}`}
            onClick={() => setFiltro(tab.key)}
          >
            {tab.label}
            <span className={`mr-tab-count ${filtro === tab.key ? 'mr-tab-count--ativo' : ''}`}>
              {contadores[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {carregando ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Carregando respostas...
        </div>
      ) : (
        <TabelaGlobal
          dados={filtradas}
          colunas={colunas}
          idKey="id"
          mensagemVazio={t('bidfrete.portal.minhas_respostas.vazio')}
          tooltipBusca={t('bidfrete.portal.minhas_respostas.buscar')}
        />
      )}

      <style>{`
        .mr-page { }

        .mr-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
          margin-bottom: 1rem;
        }

        .mr-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }
        .mr-tab:hover { color: var(--text-primary, #f1f5f9); }
        .mr-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }

        .mr-tab-count {
          font-size: 0.6875rem;
          font-weight: 700;
          background: var(--bg-elevated, #475569);
          color: var(--text-secondary, #94a3b8);
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          min-width: 1.25rem;
          text-align: center;
        }
        .mr-tab-count--ativo {
          background: rgba(99,102,241,0.2);
          color: var(--accent, #6366f1);
        }
      `}</style>
    </PaginaGlobal>
  )
}
