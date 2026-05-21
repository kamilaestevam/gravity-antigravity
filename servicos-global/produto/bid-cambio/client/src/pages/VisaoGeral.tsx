/**
 * VisaoGeral.tsx — Pagina inicial do BID Cambio
 *
 * Resumo rapido com KPIs, acoes principais e links para as areas do produto.
 * Design System: Solid Slate (dark mode)
 * Cor do produto: #06b6d4 (Cyan 500)
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  ChartBar,
  FileText,
  Buildings,
  Gear,
  ArrowRight,
  ArrowsLeftRight,
  Compass,
  Lightning,
  ChartPieSlice,
  Trophy,
  TrendUp,
  CurrencyDollar,
  Percent,
} from '@phosphor-icons/react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface KpiResumo {
  saving_total: number
  valor_operado: number
  taxa_resposta: number
}

// ─── Formatação ───────────────────────────────────────────────────────────────

const fmtMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(val)

const fmtPercent = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val) + '%'

function getTenantId(): string {
  return localStorage.getItem('x-id-organizacao') ?? ''
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  accentColor?: string
}

function KpiCard({ icon, label, value, sublabel, accentColor = 'var(--accent, #06b6d4)' }: KpiCardProps) {
  return (
    <div className="vg-kpi">
      <div className="vg-kpi__header">
        <span style={{ color: accentColor }}>{icon}</span>
        <span className="vg-kpi__label">{label}</span>
      </div>
      <div className="vg-kpi__value">{value}</div>
      {sublabel && <div className="vg-kpi__sub">{sublabel}</div>}
      <div className="vg-kpi__bar" style={{ background: accentColor }} />
    </div>
  )
}

// ─── Cards de acesso rapido ─────────────────────────────────────────────────

interface QuickCardProps {
  icone: React.ReactNode
  titulo: string
  descricao: string
  rota: string
  acento: string
}

function QuickCard({ icone, titulo, descricao, rota, acento }: QuickCardProps) {
  const navigate = useNavigate()
  return (
    <button className="vg-quick" onClick={() => navigate(rota)} type="button">
      <div className="vg-quick__icon" style={{ color: acento, background: `${acento}15` }}>{icone}</div>
      <div className="vg-quick__body">
        <span className="vg-quick__titulo">{titulo}</span>
        <span className="vg-quick__desc">{descricao}</span>
      </div>
      <ArrowRight weight="bold" size={16} className="vg-quick__arrow" />
    </button>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────

export default function VisaoGeral() {
  const navigate = useNavigate()
  const idOrganizacao = getTenantId()

  const [kpiResumo, setKpiResumo] = useState<KpiResumo | null>(null)
  const [loadingKpis, setLoadingKpis] = useState(true)

  const carregarKpis = useCallback(async () => {
    setLoadingKpis(true)
    try {
      const res = await fetch('/api/v1/bid-cambio/dashboard/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-id-organizacao': idOrganizacao },
        body: JSON.stringify({
          metrics: ['saving_total', 'valor_operado', 'taxa_resposta'],
          filters: { period: '30d' },
        }),
      })
      if (!res.ok) return
      const body: { data: KpiResumo } = await res.json()
      setKpiResumo(body.data)
    } catch {
      // KPIs de resumo são best-effort
    } finally {
      setLoadingKpis(false)
    }
  }, [idOrganizacao])

  useEffect(() => { void carregarKpis() }, [carregarKpis])

  return (
    <PaginaGlobal
      className="vg-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<Compass weight="duotone" size={22} />}
          titulo="Visão Geral"
          subtitulo="Cotações de câmbio com competição entre corretoras"
          acoes={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <BotaoGlobal variante="primario" icone={<ArrowsLeftRight weight="bold" size={18} />}
                onClick={() => navigate('/produto/bid-cambio/cotacoes/nova')}>
                Nova Cotação
              </BotaoGlobal>
              <BotaoGlobal variante="secundario" icone={<ChartBar weight="duotone" size={18} />}
                onClick={() => navigate('/produto/bid-cambio/dashboard')}>
                Ver Dashboard
              </BotaoGlobal>
            </div>
          }
        />
      }
    >

      {/* KPIs */}
      <div className="vg-section-label">Resumo</div>
      <div className="vg-kpis">
        <KpiCard
          icon={<TrendUp size={16} />}
          label="ECONOMIA ACUMULADA"
          value={!loadingKpis && kpiResumo ? fmtMoney(kpiResumo.saving_total) : '—'}
          sublabel="Últimos 30 dias"
          accentColor="var(--success, #22c55e)"
        />
        <KpiCard
          icon={<CurrencyDollar size={16} />}
          label="VALOR OPERADO"
          value={!loadingKpis && kpiResumo ? fmtMoney(kpiResumo.valor_operado) : '—'}
          sublabel="Últimos 30 dias"
          accentColor="var(--accent, #06b6d4)"
        />
        <KpiCard
          icon={<Percent size={16} />}
          label="TAXA DE RESPOSTA"
          value={!loadingKpis && kpiResumo ? fmtPercent(kpiResumo.taxa_resposta) : '—'}
          sublabel="Corretoras ativas"
          accentColor="var(--warning, #f59e0b)"
        />
      </div>

      {/* Grid de acesso rapido */}
      <div className="vg-section-label">Acesso rápido</div>
      <div className="vg-grid">
        <QuickCard
          icone={<ChartBar weight="duotone" size={24} />}
          titulo="Dashboard"
          descricao="KPIs, gráficos de cotações, widgets configuráveis"
          rota="/produto/bid-cambio/dashboard"
          acento="#06b6d4"
        />
        <QuickCard
          icone={<FileText weight="duotone" size={24} />}
          titulo="Câmbios"
          descricao="Listar e gerenciar operações de câmbio"
          rota="/produto/bid-cambio/cambios"
          acento="#a78bfa"
        />
        <QuickCard
          icone={<Buildings weight="duotone" size={24} />}
          titulo="Corretoras"
          descricao="Base de corretoras, avaliações e desempenho"
          rota="/produto/bid-cambio/corretoras"
          acento="#34d399"
        />
        <QuickCard
          icone={<Gear weight="duotone" size={24} />}
          titulo="Configurações"
          descricao="Regras de aprovação, templates e preferências"
          rota="/produto/bid-cambio/configuracoes"
          acento="#f59e0b"
        />
      </div>

      {/* Destaques */}
      <div className="vg-section-label">Destaques do produto</div>
      <div className="vg-features">
        <div className="vg-feature">
          <Lightning weight="duotone" size={20} color="#06b6d4" />
          <div>
            <span className="vg-feature__titulo">Disparo multi-canal</span>
            <span className="vg-feature__desc">Envie cotações por email e portal ao mesmo tempo</span>
          </div>
        </div>
        <div className="vg-feature">
          <ChartPieSlice weight="duotone" size={20} color="#a78bfa" />
          <div>
            <span className="vg-feature__titulo">Comparativo automático</span>
            <span className="vg-feature__desc">Ranking de propostas com destaque de saving e melhor taxa</span>
          </div>
        </div>
        <div className="vg-feature">
          <Trophy weight="duotone" size={20} color="#f59e0b" />
          <div>
            <span className="vg-feature__titulo">Savings tracking</span>
            <span className="vg-feature__desc">Acompanhe economia acumulada por cotação, corretora e período</span>
          </div>
        </div>
      </div>

      <style>{`
        .vg-page { display: flex; flex-direction: column; gap: 1.25rem; }

        /* KPIs */
        .vg-kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .vg-kpi {
          background: var(--bg-surface, #334155);
          border-radius: 12px;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
        }
        .vg-kpi__bar {
          position: absolute; top: 0; left: 0; width: 3px; height: 100%;
          border-radius: 3px 0 0 3px;
        }
        .vg-kpi__header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
        .vg-kpi__label {
          font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-muted, #64748b);
        }
        .vg-kpi__value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary, #f1f5f9); }
        .vg-kpi__sub { font-size: 0.75rem; color: var(--text-muted, #64748b); margin-top: 0.25rem; }

        /* Section label */
        .vg-section-label {
          font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--text-muted, #64748b);
        }

        /* Grid */
        .vg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }

        /* Quick card */
        .vg-quick {
          display: flex; align-items: center; gap: 1rem;
          background: var(--bg-surface, #334155); border: 1px solid transparent;
          border-radius: 10px; padding: 1rem 1.25rem;
          cursor: pointer; transition: all 0.15s; text-align: left; font-family: inherit;
          color: inherit; width: 100%;
        }
        .vg-quick:hover {
          border-color: rgba(6,182,212,0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .vg-quick__icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .vg-quick__body { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
        .vg-quick__titulo { font-size: 0.875rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .vg-quick__desc { font-size: 0.75rem; color: var(--text-secondary, #94a3b8); line-height: 1.4; }
        .vg-quick__arrow { color: var(--text-muted, #64748b); flex-shrink: 0; transition: transform 0.15s; }
        .vg-quick:hover .vg-quick__arrow { transform: translateX(3px); color: #06b6d4; }

        /* Features */
        .vg-features { display: flex; flex-direction: column; gap: 0.5rem; }
        .vg-feature {
          display: flex; align-items: flex-start; gap: 0.75rem;
          background: var(--bg-surface, #334155); border-radius: 10px; padding: 1rem 1.25rem;
        }
        .vg-feature > div { display: flex; flex-direction: column; gap: 0.15rem; }
        .vg-feature__titulo { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .vg-feature__desc { font-size: 0.75rem; color: var(--text-secondary, #94a3b8); line-height: 1.4; }
      `}</style>
    </PaginaGlobal>
  )
}
