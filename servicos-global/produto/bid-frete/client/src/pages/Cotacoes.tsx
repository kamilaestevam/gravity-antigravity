/**
 * Cotacoes.tsx — Lista + Kanban de Cotações (T2/T3)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Baseado nos prints: modelo 1.png (lista), modelo 3/4.png (kanban)
 * Toggle lista/kanban, filtros por aba, TabelaGlobal, cards kanban
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

const NovaCotacao = React.lazy(() => import('./NovaCotacao'))
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  FileText,
  Truck,
  Eye,
  ListBullets,
  Kanban,
  Upload,
  FunnelSimple,
  MagnifyingGlass,
  Anchor,
  AirplaneTilt,
  Van,
} from '@phosphor-icons/react'

import { getCotacoes } from '../shared/api'
import type { Cotacao, StatusCotacao } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'

// ─── Badge de status ─────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

function BadgeStatus({ status }: { status: StatusCotacao }) {
  const variante = STATUS_BADGE[status]
  const cores = BADGE_COLORS[variante]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: cores.bg,
      color: cores.color,
    }}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Modal icon ──────────────────────────────────────────────────────────────

function ModalIcon({ modal }: { modal: string }) {
  const size = 14
  if (modal === 'MARITIMO') return <Anchor weight="duotone" size={size} />
  if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={size} />
  return <Van weight="duotone" size={size} />
}

// ─── Tabs de filtro ──────────────────────────────────────────────────────────

const TABS: { key: string; label: string }[] = [
  { key: 'TODAS', label: 'Todas as cotações' },
  { key: 'DATA_LIMITE', label: 'Data limite para resposta' },
  { key: 'PROXIMO_VENCIMENTO', label: 'Próximos ao vencimento' },
  { key: 'FALTA_INFORMACAO', label: 'Falta de informação para cotação' },
]

// ─── Kanban Columns ──────────────────────────────────────────────────────────

interface KanbanColConfig {
  status: StatusCotacao
  label: string
  headerColor: string
  headerBg: string
}

const KANBAN_COLS: KanbanColConfig[] = [
  { status: 'ENVIADA_FORNECEDORES',  label: 'Enviada ao fornecedor', headerColor: '#3b82f6', headerBg: 'rgba(59,130,246,0.15)' },
  { status: 'AGUARDANDO_APROVACAO',  label: 'Aprovação pendente',    headerColor: '#f59e0b', headerBg: 'rgba(245,158,11,0.15)' },
  { status: 'FALTA_INFORMACAO',      label: 'Falta de informação',   headerColor: '#f97316', headerBg: 'rgba(249,115,22,0.15)' },
  { status: 'EM_COTACAO',            label: 'Baixo limite de resposta', headerColor: '#ef4444', headerBg: 'rgba(239,68,68,0.15)' },
  { status: 'EXPIRADA',              label: 'Fora de prazo',         headerColor: '#ef4444', headerBg: 'rgba(239,68,68,0.15)' },
  { status: 'APROVADA',              label: 'Encerradas',            headerColor: '#22c55e', headerBg: 'rgba(34,197,94,0.15)' },
]

// ─── Formatação ──────────────────────────────────────────────────────────────

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Cotacoes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isNovaCotacao = location.pathname.endsWith('/nova')
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [visao, setVisao] = useState<'lista' | 'kanban'>('lista')
  const [filtroTab, setFiltroTab] = useState('TODAS')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await getCotacoes({ limit: 50 })
      setCotacoes(res.cotacoes)
    } catch {
      setCotacoes([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ─── Colunas TabelaGlobal ──────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<Cotacao>[] = [
    {
      key: 'numero',
      label: 'Processo (DATI)',
      tipo: 'texto',
      largura: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'referencia_interna',
      label: 'Referência',
      tipo: 'texto',
      largura: 110,
      render: (val: string | null) => val ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      largura: 170,
      render: (val: StatusCotacao) => <BadgeStatus status={val} />,
    },
    {
      key: 'created_at',
      label: 'Data da cotação',
      tipo: 'periodo',
      largura: 120,
      render: (val: string) => dataBR(val),
    },
    {
      key: 'user_id',
      label: 'Quem gerou',
      tipo: 'texto',
      largura: 100,
      render: () => 'DATI',
    },
    {
      key: 'prazo_resposta',
      label: 'Respondido em',
      tipo: 'periodo',
      largura: 120,
      render: (val: string | null) => val ? dataBR(val) : '—',
    },
    {
      key: 'origem_nome',
      label: 'Origem',
      tipo: 'texto',
      largura: 140,
    },
    {
      key: 'destino_nome',
      label: 'Destino',
      tipo: 'texto',
      largura: 120,
    },
    {
      key: 'modal',
      label: 'Modal',
      tipo: 'texto',
      largura: 100,
      render: (val: string) => MODAL_LABELS[val as keyof typeof MODAL_LABELS] ?? val,
    },
    {
      key: 'modalidade',
      label: 'Modalidade',
      tipo: 'texto',
      largura: 90,
      render: (val: string) => MODALIDADE_LABELS[val as keyof typeof MODALIDADE_LABELS] ?? val,
    },
    {
      key: 'peso_kg',
      label: 'Peso (Kg)',
      tipo: 'numero',
      largura: 100,
      align: 'right',
      render: (val: number | null) => val != null ? val.toLocaleString('pt-BR') : '—',
    },
  ]

  const acoes: TabelaGlobalAcao<Cotacao>[] = [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item: Cotacao) => navigate(`/cotacoes/${item.id}`),
    },
  ]

  // ─── Kanban Card ──────────────────────────────────────────────────────

  function KanbanCard({ cotacao }: { cotacao: Cotacao }) {
    return (
      <div
        className="bf-kanban-card"
        onClick={() => navigate(`/cotacoes/${cotacao.id}`)}
      >
        <div className="bf-kanban-card-header">
          <span className="bf-kanban-card-numero">{cotacao.numero}</span>
          <BadgeStatus status={cotacao.status} />
        </div>
        <div className="bf-kanban-card-route">
          <ModalIcon modal={cotacao.modal} />
          <span>{cotacao.origem_nome}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span>{cotacao.destino_nome}</span>
        </div>
        <div className="bf-kanban-card-meta">
          <span>{MODAL_LABELS[cotacao.modal] ?? cotacao.modal}</span>
          <span>{MODALIDADE_LABELS[cotacao.modalidade] ?? cotacao.modalidade}</span>
          {cotacao.peso_kg && <span>{cotacao.peso_kg.toLocaleString('pt-BR')} Kg</span>}
        </div>
        {cotacao.referencia_interna && (
          <div className="bf-kanban-card-ref">
            Ref: {cotacao.referencia_interna}
          </div>
        )}
        <div className="bf-kanban-card-footer">
          <span>{dataBR(cotacao.created_at)}</span>
          {cotacao.bid_responses && cotacao.bid_responses.length > 0 && (
            <span style={{ color: 'var(--success)' }}>
              {cotacao.bid_responses.length} {t('bidfrete.cotacoes.respostas')}
            </span>
          )}
        </div>
      </div>
    )
  }

  // ─── Kanban Board ─────────────────────────────────────────────────────

  function KanbanBoard() {
    return (
      <div className="bf-kanban-board">
        {KANBAN_COLS.map(col => {
          const cards = cotacoes.filter(c => c.status === col.status)
          return (
            <div key={col.status} className="bf-kanban-col">
              <div className="bf-kanban-col-header" style={{ background: col.headerBg, color: col.headerColor }}>
                <span className="bf-kanban-col-dot" style={{ background: col.headerColor }} />
                {col.label}
                <span className="bf-kanban-col-count">{cards.length}</span>
              </div>
              <div className="bf-kanban-col-body">
                {cards.length === 0 ? (
                  <div className="bf-kanban-empty">{t('bidfrete.cotacoes.vazio')}</div>
                ) : (
                  cards.map(c => <KanbanCard key={c.id} cotacao={c} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="bf-cotacoes"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo={t('bidfrete.cotacoes.titulo')}
          acoes={
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className={`bf-toggle-btn ${visao === 'lista' ? 'bf-toggle-btn--ativo' : ''}`}
                onClick={() => setVisao('lista')}
                title={t('bidfrete.cotacoes.vista_lista')}
              >
                <ListBullets weight="duotone" size={18} />
              </button>
              <button
                className={`bf-toggle-btn ${visao === 'kanban' ? 'bf-toggle-btn--ativo' : ''}`}
                onClick={() => setVisao('kanban')}
                title={t('bidfrete.cotacoes.vista_kanban')}
              >
                <Kanban weight="duotone" size={18} />
              </button>
              <div style={{ width: 1, height: 24, background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />
              <button className="btn btn-secondary" onClick={() => navigate('/cotacoes/importar')}>
                <Upload weight="bold" size={14} />
                {t('comum.importar')}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/cotacoes/nova')}>
                <Truck weight="bold" size={16} />
                {t('bidfrete.cotacoes.buscar_frete')}
              </button>
            </div>
          }
        />
      }
    >
      {/* Tabs de filtro */}
      <div className="bf-cotacoes-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`bf-tab ${filtroTab === tab.key ? 'bf-tab--ativo' : ''}`}
            onClick={() => setFiltroTab(tab.key)}
          >
            {tab.label}
            <span className="bf-tab-count">
              {tab.key === 'TODAS' ? cotacoes.length :
               tab.key === 'FALTA_INFORMACAO' ? cotacoes.filter(c => c.status === 'FALTA_INFORMACAO').length :
               tab.key === 'PROXIMO_VENCIMENTO' ? cotacoes.filter(c => c.status === 'EM_COTACAO').length :
               cotacoes.filter(c => c.status === 'AGUARDANDO_APROVACAO').length}
            </span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {visao === 'lista' ? (
        <div className="bf-table-section">
          <TabelaGlobal
            dados={cotacoes}
            colunas={colunas}
            acoes={acoes}
            idKey="id"
            carregando={carregando}
            mensagemVazio={t('bidfrete.cotacoes.vazio')}
            tooltipBusca={t('bidfrete.dashboard.buscar')}
            aoClicarLinha={(item: Cotacao) => navigate(`/cotacoes/${item.id}`)}
          />
        </div>
      ) : (
        <KanbanBoard />
      )}

      <style>{`
        .bf-cotacoes { padding: 0; }

        /* ── Tabs ── */
        .bf-cotacoes-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0 0 0;
          border-bottom: 1px solid var(--bg-elevated, #475569);
          margin-bottom: 1rem;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
          padding: 0.75rem 1.25rem 0;
        }

        .bf-tab {
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
        .bf-tab:hover { color: var(--text-primary, #f1f5f9); }
        .bf-tab--ativo {
          color: var(--accent, #6366f1);
          border-bottom-color: var(--accent, #6366f1);
        }
        .bf-tab-count {
          font-size: 0.6875rem;
          font-weight: 700;
          background: var(--bg-elevated, #475569);
          color: var(--text-secondary, #94a3b8);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-pill, 9999px);
          min-width: 1.25rem;
          text-align: center;
        }
        .bf-tab--ativo .bf-tab-count {
          background: rgba(99,102,241,0.2);
          color: var(--accent, #6366f1);
        }

        /* ── Toggle lista/kanban ── */
        .bf-toggle-btn {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-md, 8px);
          padding: 0.4rem 0.5rem;
          cursor: pointer;
          color: var(--text-muted, #64748b);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .bf-toggle-btn:hover {
          color: var(--text-secondary, #94a3b8);
        }
        .bf-toggle-btn--ativo {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .bf-toggle-btn--ativo:hover {
          color: #fff;
        }

        /* ── Table section ── */
        .bf-table-section {
          background: var(--bg-surface, #334155);
          border-radius: 0 0 var(--radius-lg, 12px) var(--radius-lg, 12px);
          overflow: hidden;
        }

        /* ── Kanban Board ── */
        .bf-kanban-board {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        .bf-kanban-col {
          min-width: 280px;
          max-width: 320px;
          flex-shrink: 0;
          flex: 1;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          display: flex;
          flex-direction: column;
        }

        .bf-kanban-col-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .bf-kanban-col-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bf-kanban-col-count {
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.8;
        }

        .bf-kanban-col-body {
          flex: 1;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 200px;
        }

        .bf-kanban-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
          opacity: 0.5;
        }

        .bf-kanban-card {
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 0.75rem;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          border: 1px solid var(--bg-elevated, #475569);
        }
        .bf-kanban-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.5));
        }

        .bf-kanban-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .bf-kanban-card-numero {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        .bf-kanban-card-route {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-ref {
          font-size: 0.6875rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.6875rem;
          color: var(--text-muted, #64748b);
          padding-top: 0.35rem;
          border-top: 1px solid var(--bg-elevated, #475569);
        }

        /* ── Botões ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
        }
        .btn-primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .btn-primary:hover { background: var(--accent-hover, #4f46e5); }
        .btn-secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .btn-secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
      `}</style>
      {isNovaCotacao && (
        <React.Suspense fallback={null}>
          <NovaCotacao />
        </React.Suspense>
      )}
    </PaginaGlobal>
  )
}
