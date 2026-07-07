/**
 * Minhas propostas — Portal do Fornecedor: histórico de propostas enviadas
 * Tabs de filtro + TabelaGlobal com status badges e exclusão
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../../shared/pagina-carregando-bid-frete-internacional'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import {
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
  ClockCountdown,
  Anchor,
  AirplaneTilt,
  Van,
  Trash,
} from '@phosphor-icons/react'

import {
  excluirVisaoFornecedorBidFreteInternacionalProposta,
  getVisaoFornecedorBidFreteInternacionalPropostas,
} from '../../shared/api'
import type { ModalFrete, PropostaBidFreteInternacional } from '../../shared/types'
import { MODAL_LABELS } from '../../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

type FiltroTab = 'TODAS' | 'PENDENTES' | 'APROVADAS' | 'REPROVADAS'

const TAB_KEYS: FiltroTab[] = ['TODAS', 'PENDENTES', 'APROVADAS', 'REPROVADAS']

type RespostaStatus = 'aprovada' | 'reprovada' | 'pendente'

const STATUS_PROPOSTA_NAO_EXCLUIVEL = new Set(['APROVADA', 'REPROVADA'])

function getRespostaStatus(r: PropostaBidFreteInternacional): RespostaStatus {
  if (r.status_proposta_bid_frete_internacional === 'APROVADA') return 'aprovada'
  if (r.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA') return 'aprovada'
  if (r.status_proposta_bid_frete_internacional === 'REPROVADA') return 'reprovada'
  return 'pendente'
}

const STATUS_MAP: Record<RespostaStatus, { labelKey: string; bg: string; color: string }> = {
  pendente:  { labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.propostas.status_pendente',  bg: 'rgba(245,158,11,0.15)', color: 'var(--warning, #f59e0b)' },
  aprovada:  { labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.propostas.status_aprovada',  bg: 'rgba(34,197,94,0.15)',  color: 'var(--success, #22c55e)' },
  reprovada: { labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.propostas.status_reprovada', bg: 'rgba(239,68,68,0.15)',  color: 'var(--danger, #ef4444)' },
}

const MODAL_ICON_MAP: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={14} />,
  AEREO: <AirplaneTilt weight="duotone" size={14} />,
  RODOVIARIO: <Van weight="duotone" size={14} />,
}

const fmtMoeda = (val: number) => {
  if (!Number.isFinite(val)) return '—'
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}

const fmtData = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function rotuloCotacao(row: PropostaBidFreteInternacional): string {
  return (
    row.cotacao?.numero_cotacao_bid_frete_internacional
    ?? row.id_cotacao_bid_frete_internacional.slice(0, 8).toUpperCase()
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MinhasRespostas() {
  const { t } = useTranslation()
  const [respostas, setRespostas] = useState<PropostaBidFreteInternacional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<FiltroTab>('TODAS')

  const TABS: { key: FiltroTab; label: string }[] = [
    { key: 'TODAS', label: t('comum.todos') },
    { key: 'PENDENTES', label: t('comum.pendente') },
    { key: 'APROVADAS', label: t('bidfrete.visao_fornecedor_bid_frete_internacional.dashboard.aprovadas') },
    { key: 'REPROVADAS', label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.tab_reprovadas') },
  ]

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getVisaoFornecedorBidFreteInternacionalPropostas()
      setRespostas(data)
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

  useSincronizarTituloPaginaTopo(useMemo(() => {
    if (carregando) {
      return criarTituloCarregandoTopo(<PaperPlaneTilt weight="duotone" size={22} />, t)
    }
    return {
      label:     t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.titulo'),
      icone:     <PaperPlaneTilt weight="duotone" size={22} />,
      subtitulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.subtitulo', { count: respostas.length }),
    }
  }, [carregando, t, respostas.length]))

  const handleExcluir = useCallback(async (item: PropostaBidFreteInternacional) => {
    try {
      await excluirVisaoFornecedorBidFreteInternacionalProposta(item.id_proposta_bid_frete_internacional)
      await carregar()
    } catch {
      // silencioso — toast futuro
    }
  }, [carregar])

  const colunas: TabelaGlobalColuna<PropostaBidFreteInternacional>[] = useMemo(() => [
    {
      key: 'cotacao',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_cotacao'),
      tipo: 'texto',
      largura: 140,
      render: (_val: unknown, row: PropostaBidFreteInternacional) => (
        <span className="mr-cell mr-cell--mono mr-cell--cotacao">
          {rotuloCotacao(row)}
        </span>
      ),
    },
    {
      key: 'rota',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_rota'),
      tipo: 'texto',
      largura: 200,
      render: (_val: unknown, row: PropostaBidFreteInternacional) => {
        const origem = row.cotacao?.origem_nome_cotacao_bid_frete_internacional
        const destino = row.cotacao?.destino_nome_cotacao_bid_frete_internacional
        if (!origem && !destino) {
          return <span className="mr-cell">—</span>
        }
        return (
          <span className="mr-cell">
            {origem ?? '—'} &rarr; {destino ?? '—'}
          </span>
        )
      },
    },
    {
      key: 'modal_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_modal'),
      tipo: 'texto',
      largura: 120,
      render: (_val: unknown, row: PropostaBidFreteInternacional) => {
        const modal = row.cotacao?.modal_cotacao_bid_frete_internacional
        if (!modal) {
          return <span className="mr-cell">—</span>
        }
        return (
          <span className="mr-cell mr-cell--modal">
            {MODAL_ICON_MAP[modal]}
            {MODAL_LABELS[modal]}
          </span>
        )
      },
    },
    {
      key: 'valor_total_proposta_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_valor_total'),
      tipo: 'numero',
      largura: 140,
      align: 'right',
      render: (_val: unknown, row: PropostaBidFreteInternacional) => (
        <span className="mr-cell mr-cell--mono mr-cell--valor">
          {row.moeda_proposta_bid_frete_internacional} {fmtMoeda(row.valor_total_proposta_bid_frete_internacional)}
        </span>
      ),
    },
    {
      key: 'dias_transito_proposta_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_transit_time'),
      tipo: 'numero',
      largura: 110,
      align: 'center',
      render: (_val: unknown, row: PropostaBidFreteInternacional) => {
        const dias = row.dias_transito_proposta_bid_frete_internacional
        if (!Number.isFinite(dias) || dias <= 0) {
          return <span className="mr-cell mr-cell--mono">—</span>
        }
        return (
          <span className="mr-cell mr-cell--mono">
            {t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.dias', { val: dias })}
          </span>
        )
      },
    },
    {
      key: 'validade_proposta_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (val: unknown) => (
        <span className="mr-cell">{fmtData(val as string)}</span>
      ),
    },
    {
      key: 'status',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_status'),
      tipo: 'texto',
      largura: 120,
      render: (_val: unknown, row: PropostaBidFreteInternacional) => {
        const status = getRespostaStatus(row)
        const cfg = STATUS_MAP[status]
        return (
          <span className="mr-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
            {status === 'aprovada' && <CheckCircle weight="fill" size={12} />}
            {status === 'reprovada' && <XCircle weight="fill" size={12} />}
            {status === 'pendente' && <ClockCountdown weight="fill" size={12} />}
            {t(cfg.labelKey)}
          </span>
        )
      },
    },
  ], [t])

  const acoes: TabelaGlobalAcao<PropostaBidFreteInternacional>[] = useMemo(() => [
    {
      id: 'excluir',
      icone: <Trash weight="duotone" size={16} />,
      tooltip: (item) =>
        STATUS_PROPOSTA_NAO_EXCLUIVEL.has(item.status_proposta_bid_frete_internacional)
          ? t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.excluir_bloqueado')
          : t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.tooltip_excluir'),
      disabled: (item) => STATUS_PROPOSTA_NAO_EXCLUIVEL.has(item.status_proposta_bid_frete_internacional),
      confirmarExclusao: {
        titulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.modal_excluir_titulo'),
        descricao: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.modal_excluir_desc'),
        nomeItem: (item) => rotuloCotacao(item),
      },
      onClick: handleExcluir,
    },
  ], [handleExcluir, t])

  return (
    <PaginaGlobal className="mr-page bid-frete-page-shell">
      <div className="mr-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
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
        <ConteudoCarregandoBidFreteInternacional />
      ) : (
        <TabelaGlobal
          dados={filtradas}
          colunas={colunas}
          acoes={acoes}
          idKey="id_proposta_bid_frete_internacional"
          mensagemVazio={t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.vazio')}
          tooltipBusca={t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.buscar')}
        />
      )}

      <style>{`
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
          font-family: inherit;
          color: var(--text-secondary, #94a3b8);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
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
          font-family: inherit;
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

        .mr-cell {
          font-size: 0.8125rem;
          font-family: inherit;
          color: var(--text-primary, #f1f5f9);
        }
        .mr-cell--mono {
          font-family: 'DM Mono', ui-monospace, monospace;
        }
        .mr-cell--cotacao {
          color: var(--accent, #6366f1);
        }
        .mr-cell--valor {
          font-weight: 600;
        }
        .mr-cell--modal {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .mr-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: inherit;
          white-space: nowrap;
        }
      `}</style>
    </PaginaGlobal>
  )
}
