/**
 * Fornecedores.tsx — Lista de Fornecedores (T5)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Baseado nos prints: modelo 5 (donut fornecedores)
 * Layout: KPIs + Donut + Search/Filter + TabelaGlobal
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import {
  Buildings,
  Plus,
  Eye,
  Star,
  MagnifyingGlass,
  FunnelSimple,
  CheckCircle,
  XCircle,
  ChartPieSlice,
} from '@phosphor-icons/react'

import { getFornecedores } from '../shared/api'
import type { Fornecedor, TipoFornecedor, StatusFornecedor } from '../shared/types'
import { TIPO_FORNECEDOR_LABELS, STATUS_FORNECEDOR_LABELS } from '../shared/types'

// ─── Badge colors ───────────────────────────────────────────────────────────

const STATUS_FORNECEDOR_COLORS: Record<StatusFornecedor, { bg: string; color: string }> = {
  ATIVO:              { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  INATIVO:            { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
  PENDENTE_APROVACAO: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  BLOQUEADO:          { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
}

const TIPO_FORNECEDOR_COLORS: Record<TipoFornecedor, { bg: string; color: string }> = {
  AGENTE_CARGA:   { bg: 'rgba(34,197,94,0.15)',  color: 'var(--success, #22c55e)' },
  ARMADOR:        { bg: 'rgba(99,102,241,0.15)',  color: 'var(--accent, #6366f1)' },
  CIA_AEREA:      { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  TRANSPORTADORA: { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
}

const TIPO_DONUT_COLORS: Record<TipoFornecedor, string> = {
  AGENTE_CARGA:   '#22c55e',
  ARMADOR:        '#6366f1',
  CIA_AEREA:      '#f59e0b',
  TRANSPORTADORA: '#ef4444',
}

// ─── Stars renderer ─────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>—</span>
  const full = Math.round(rating)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          weight={i <= full ? 'fill' : 'regular'}
          size={14}
          style={{ color: i <= full ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)' }}
        />
      ))}
      <span style={{
        marginLeft: '0.35rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary, #94a3b8)',
      }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Fornecedores() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await getFornecedores({ busca, tipo: filtroTipo || undefined, limit: 100 })
      setFornecedores(res.fornecedores)
    } catch {
      setFornecedores([])
    } finally {
      setCarregando(false)
    }
  }, [busca, filtroTipo])

  useEffect(() => { carregar() }, [carregar])

  // ─── KPI computations ─────────────────────────────────────────────────

  const total = fornecedores.length
  const ativos = fornecedores.filter(f => f.status === 'ATIVO').length
  const inativos = fornecedores.filter(f => f.status === 'INATIVO').length
  const ratingsValidos = fornecedores.filter(f => f.nota_global_classificacao_bid_frete_internacional != null)
  const ratingMedio = ratingsValidos.length > 0
    ? ratingsValidos.reduce((acc, f) => acc + (f.nota_global_classificacao_bid_frete_internacional ?? 0), 0) / ratingsValidos.length
    : 0

  // ─── Donut data ───────────────────────────────────────────────────────

  const porTipo = (Object.keys(TIPO_FORNECEDOR_LABELS) as TipoFornecedor[]).map(tipo => ({
    tipo,
    count: fornecedores.filter(f => f.tipo === tipo).length,
  }))

  // ─── Colunas TabelaGlobal ─────────────────────────────────────────────

  const colunas: TabelaGlobalColuna<Fornecedor>[] = [
    {
      key: 'nome',
      label: t('bidfrete.fornecedores.col_nome'),
      tipo: 'texto',
      largura: 220,
      render: (val: unknown, item: Fornecedor) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #f1f5f9)', fontSize: '0.8125rem' }}>{String(val ?? '')}</span>
          {item.nome_fantasia && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>{item.nome_fantasia}</span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: t('bidfrete.fornecedores.col_email'),
      tipo: 'texto',
      largura: 200,
      render: (val: unknown) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>{String(val ?? '')}</span>
      ),
    },
    {
      key: 'tipo',
      label: t('bidfrete.fornecedores.col_tipo'),
      tipo: 'texto',
      largura: 140,
      render: (val: unknown) => {
        const tipo = val as TipoFornecedor
        const cores = TIPO_FORNECEDOR_COLORS[tipo]
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
            {TIPO_FORNECEDOR_LABELS[tipo]}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: t('comum.status'),
      tipo: 'texto',
      largura: 120,
      render: (val: unknown) => {
        const status = val as StatusFornecedor
        const cores = STATUS_FORNECEDOR_COLORS[status]
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
            {STATUS_FORNECEDOR_LABELS[status]}
          </span>
        )
      },
    },
    {
      key: 'nota_global_classificacao_bid_frete_internacional',
      label: t('bidfrete.fornecedores.col_rating'),
      tipo: 'numero',
      largura: 150,
      render: (val: unknown) => <Stars rating={Number(val ?? 0)} />,
    },
    {
      key: 'total_cotacoes',
      label: t('bidfrete.fornecedores.col_total_cotacoes'),
      tipo: 'numero',
      largura: 120,
      align: 'right',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--text-primary, #f1f5f9)' }}>
          {String(val ?? '')}
        </span>
      ),
    },
  ]

  const acoes: TabelaGlobalAcao<Fornecedor>[] = [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: t('bidfrete.fornecedores.ver_detalhes'),
      onClick: (item: Fornecedor) => navigate(`/produto/bid-frete/fornecedores/${item.id}`),
    },
  ]

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="bf-fornecedores"
    >
      {/* Ação da página (Novo Fornecedor) — cabeçalho agora vive no top bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary">
          <Plus weight="bold" size={16} />
          {t('bidfrete.fornecedores.novo_fornecedor')}
        </button>
      </div>

      {/* ════════ LINHA 1: KPIs + Donut ════════ */}
      <div className="bf-forn-top">
        <div className="bf-forn-kpis">
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_total')}
            icone={<Buildings weight="duotone" size={16} />}
            valor={total}
            className="bf-forn-kpi"
          />
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_ativos')}
            icone={<CheckCircle weight="duotone" size={16} />}
            valor={ativos}
            className="bf-forn-kpi"
          />
          <CardBasicoGlobal
            titulo={t('bidfrete.fornecedores.kpi_inativos')}
            icone={<XCircle weight="duotone" size={16} />}
            valor={inativos}
            className="bf-forn-kpi"
          />
          <div className="bf-forn-kpi bf-forn-rating-card">
            <div className="bf-forn-rating-label">
              <Star weight="duotone" size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
              <span>{t('bidfrete.fornecedores.kpi_rating_medio')}</span>
            </div>
            <div className="bf-forn-rating-value">
              {ratingMedio > 0 ? ratingMedio.toFixed(1) : '—'}
            </div>
            {ratingMedio > 0 && (
              <div className="bf-forn-rating-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    weight={i <= Math.round(ratingMedio) ? 'fill' : 'regular'}
                    size={14}
                    style={{ color: i <= Math.round(ratingMedio) ? 'var(--warning, #f59e0b)' : 'var(--text-muted, #64748b)' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <CardGraficoGlobal
          titulo={t('bidfrete.fornecedores.grafico_por_tipo')}
          icone={<ChartPieSlice weight="duotone" size={16} />}
          total={total}
          valorPrincipal={total}
          corGauge="#6366f1"
          legenda={porTipo.map(f => ({
            label: TIPO_FORNECEDOR_LABELS[f.tipo],
            valor: f.count,
            cor: TIPO_DONUT_COLORS[f.tipo],
          }))}
        />
      </div>

      {/* ════════ LINHA 2: Filtros + Tabela ════════ */}
      <div className="bf-forn-table-section">
        <div className="bf-forn-filters">
          <div className="bf-forn-search">
            <MagnifyingGlass weight="bold" size={16} />
            <input
              type="text"
              placeholder={t('bidfrete.fornecedores.buscar_placeholder')}
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="bf-forn-search-input"
            />
          </div>
          <div className="bf-forn-filter-select-wrap">
            <FunnelSimple weight="duotone" size={16} />
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="bf-forn-filter-select"
            >
              <option value="">{t('bidfrete.fornecedores.todos_tipos')}</option>
              {(Object.keys(TIPO_FORNECEDOR_LABELS) as TipoFornecedor[]).map(tipo => (
                <option key={tipo} value={tipo}>{TIPO_FORNECEDOR_LABELS[tipo]}</option>
              ))}
            </select>
          </div>
        </div>

        {carregando ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
            Carregando fornecedores...
          </div>
        ) : (
          <TabelaGlobal
            dados={fornecedores}
            colunas={colunas}
            acoes={acoes}
            idKey="id"
            mensagemVazio={t('bidfrete.fornecedores.vazio')}
            tooltipBusca={t('bidfrete.fornecedores.buscar_tabela')}
          />
        )}
      </div>

      <style>{`
        .bf-fornecedores { padding: 0; }

        /* ── Top row: KPIs + Donut ── */
        .bf-forn-top {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 1100px) {
          .bf-forn-top { grid-template-columns: 1fr; }
        }

        .bf-forn-kpis {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .bf-forn-kpis { grid-template-columns: 1fr; }
        }

        .bf-forn-kpi {
          min-height: 100px;
        }

        /* ── Rating card ── */
        .bf-forn-rating-card {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .bf-forn-rating-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted, #64748b);
        }

        .bf-forn-rating-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
          font-family: 'DM Mono', monospace;
        }

        .bf-forn-rating-stars {
          display: flex;
          gap: 2px;
        }

        /* ── Filters ── */
        .bf-forn-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
        }

        .bf-forn-filters {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--bg-elevated, #475569);
        }
        @media (max-width: 640px) {
          .bf-forn-filters { flex-direction: column; }
        }

        .bf-forn-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 0 0.75rem;
          border: 1px solid var(--bg-elevated, #475569);
          color: var(--text-muted, #64748b);
        }
        .bf-forn-search:focus-within {
          border-color: var(--accent, #6366f1);
        }

        .bf-forn-search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          padding: 0.5rem 0;
          font-size: 0.8125rem;
          font-family: inherit;
          color: var(--text-primary, #f1f5f9);
        }
        .bf-forn-search-input::placeholder {
          color: var(--text-muted, #64748b);
        }

        .bf-forn-filter-select-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 0 0.75rem;
          border: 1px solid var(--bg-elevated, #475569);
          color: var(--text-muted, #64748b);
        }
        .bf-forn-filter-select-wrap:focus-within {
          border-color: var(--accent, #6366f1);
        }

        .bf-forn-filter-select {
          background: none;
          border: none;
          outline: none;
          padding: 0.5rem 0;
          font-size: 0.8125rem;
          font-family: inherit;
          color: var(--text-primary, #f1f5f9);
          cursor: pointer;
          min-width: 160px;
        }
        .bf-forn-filter-select option {
          background: var(--bg-base, #1e293b);
          color: var(--text-primary, #f1f5f9);
        }

        /* ── Botoes ── */
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
      `}</style>
    </PaginaGlobal>
  )
}
