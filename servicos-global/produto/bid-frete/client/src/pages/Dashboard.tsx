/**
 * Dashboard.tsx — Dashboard Premium do BID Frete
 *
 * Layout glassmorphism com KPIs + sparklines, gráficos SVG,
 * funil com percentuais, donut com progress bars, câmbio do dia.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  MagnifyingGlass,
  Export,
  DownloadSimple,
  TrendUp,
  Timer,
  Anchor,
  AirplaneTilt,
  Truck,
  Trophy,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'

import { DEMO_KPIS, DEMO_CALENDARIO, DEMO_MENSAL, DEMO_MODAL, DEMO_MELHOR_COTACAO, DEMO_INCOTERMS } from '../shared/demo-data'
import { STATUS_LABELS, MODAL_LABELS } from '../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

const FUNIL_COLORS: Record<string, string> = {
  RASCUNHO: '#94a3b8',
  ENVIADA_FORNECEDORES: '#60a5fa',
  EM_COTACAO: '#818cf8',
  AGUARDANDO_APROVACAO: '#fbbf24',
  APROVADA: '#34d399',
  REPROVADA: '#f87171',
  EXPIRADA: '#64748b',
}

const MODAL_ICONS: Record<string, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={16} />,
  AEREO: <AirplaneTilt weight="duotone" size={16} />,
  RODOVIARIO: <Truck weight="duotone" size={16} />,
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, badge, badgeColor, sparkData }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  badge?: string
  badgeColor?: string
  sparkData?: number[]
}) {
  const maxSpark = sparkData ? Math.max(...sparkData) : 0
  return (
    <div className="bfd-kpi">
      <div className="bfd-kpi__header">
        <span className="bfd-kpi__icon">{icon}</span>
        <span className="bfd-kpi__label">{label}</span>
      </div>
      <div className="bfd-kpi__row">
        <span className="bfd-kpi__value">{value}</span>
        {badge && (
          <span className="bfd-kpi__badge" style={{ color: badgeColor || '#34d399' }}>
            {badge}
          </span>
        )}
      </div>
      {sparkData && (
        <div className="bfd-kpi__spark">
          {sparkData.map((d, i) => (
            <div
              key={i}
              className="bfd-kpi__spark-bar"
              style={{
                height: `${(d / maxSpark) * 100}%`,
                background: `rgba(99,91,255,${0.3 + (i / sparkData.length) * 0.7})`,
              }}
            />
          ))}
        </div>
      )}
      <span className="bfd-kpi__sub">{sub}</span>
    </div>
  )
}

// ─── Gráfico de Barras Mensal (SVG) ─────────────────────────────────────────

function GraficoBarrasMensal() {
  const W = 460
  const H = 260
  const pad = { top: 30, right: 10, bottom: 40, left: 10 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const barW = innerW / DEMO_MENSAL.length
  const maxVal = Math.max(...DEMO_MENSAL.map(d => d.aprovadas + d.andamento + d.recusadas))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bfd-chart-svg">
      {DEMO_MENSAL.map((d, i) => {
        const total = d.aprovadas + d.andamento + d.recusadas
        const x = pad.left + i * barW + barW * 0.15
        const w = barW * 0.7
        const fullH = (total / maxVal) * innerH

        const hAprov = (d.aprovadas / total) * fullH
        const hAnd = (d.andamento / total) * fullH
        const hRec = (d.recusadas / total) * fullH
        const base = pad.top + innerH - fullH

        return (
          <g key={i}>
            <rect x={x} y={base} width={w} height={hAprov} rx={3} fill="#6ee7b7" opacity={0.85} />
            <rect x={x} y={base + hAprov} width={w} height={hAnd} fill="#7dd3fc" opacity={0.7} />
            <rect x={x} y={base + hAprov + hAnd} width={w} height={hRec} fill="#fca5a5" opacity={0.6} />
            <text x={x + w / 2} y={base - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600">{total}</text>
            <text x={x + w / 2} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize="11">{d.mes}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Donut Modal (SVG + progress bars) ──────────────────────────────────────

function GraficoDonutModal() {
  const total = DEMO_MODAL.reduce((s, m) => s + m.count, 0)
  const cx = 80
  const cy = 80
  const r = 58
  const stroke = 16
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = DEMO_MODAL.map(m => {
    const pct = m.count / total
    const dashLen = pct * circ
    const arc = { ...m, dashLen, dashOffset: -offset }
    offset += dashLen
    return arc
  })

  return (
    <div className="bfd-donut">
      <svg viewBox="0 0 160 160" width="140" height="140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={a.cor}
            strokeWidth={stroke}
            strokeDasharray={`${a.dashLen} ${circ - a.dashLen}`}
            strokeDashoffset={a.dashOffset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="28" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="10">cotacoes</text>
      </svg>
      <div className="bfd-donut__legend">
        {DEMO_MODAL.map(m => (
          <div key={m.modal} className="bfd-donut__legend-row">
            <span className="bfd-donut__legend-icon">{MODAL_ICONS[m.modal]}</span>
            <span className="bfd-donut__legend-label">{MODAL_LABELS[m.modal as keyof typeof MODAL_LABELS] ?? m.modal}</span>
            <div className="bfd-donut__legend-bar">
              <div className="bfd-donut__legend-bar-fill" style={{ width: `${m.pct}%`, background: m.cor }} />
            </div>
            <span className="bfd-donut__legend-count" style={{ color: m.cor }}>{m.count}</span>
            <span className="bfd-donut__legend-pct">{m.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Funil ──────────────────────────────────────────────────────────────────

function FunilStatus() {
  const total = DEMO_KPIS.funil.reduce((s, f) => s + f.count, 0)
  const maxCount = Math.max(...DEMO_KPIS.funil.map(f => f.count))
  return (
    <div className="bfd-funil">
      {DEMO_KPIS.funil.map(f => {
        const pct = total ? Math.round((f.count / total) * 100) : 0
        const barW = maxCount ? (f.count / maxCount) * 100 : 0
        return (
          <div key={f.status} className="bfd-funil__row">
            <span className="bfd-funil__label">{STATUS_LABELS[f.status] ?? f.status}</span>
            <div className="bfd-funil__bar-wrap">
              <div
                className="bfd-funil__bar"
                style={{ width: `${barW}%`, background: FUNIL_COLORS[f.status] || '#60a5fa' }}
              />
            </div>
            <span className="bfd-funil__count">{f.count}</span>
            <span className="bfd-funil__pct">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Taxa Aprovação (donut) ──────────────────────────────────────────────────

function TaxaAprovacao() {
  const { percentual_em_tempo, percentual_atraso, nao_respondidas } = DEMO_KPIS.aprovacao
  const cx = 55
  const cy = 55
  const r = 42
  const stroke = 10
  const circ = 2 * Math.PI * r

  const segments = [
    { pct: percentual_em_tempo, cor: '#34d399', label: `Em tempo: ${percentual_em_tempo}%` },
    { pct: percentual_atraso, cor: '#fbbf24', label: `Atrasadas: ${percentual_atraso}%` },
    { pct: nao_respondidas, cor: '#f87171', label: `Sem resposta: ${nao_respondidas}%` },
  ]
  let off = 0

  return (
    <div className="bfd-taxa">
      <svg viewBox="0 0 110 110" width="110" height="110">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const dashLen = (s.pct / 100) * circ
          const arc = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.cor}
              strokeWidth={stroke}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={-off}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
            />
          )
          off += dashLen
          return arc
        })}
        <text x={cx} y={cy + 2} textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="700">{percentual_em_tempo}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="8">em tempo</text>
      </svg>
      <div className="bfd-taxa__legend">
        {segments.map((s, i) => (
          <div key={i} className="bfd-taxa__legend-row">
            <span className="bfd-taxa__dot" style={{ background: s.cor }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const [_calIdx, setCalIdx] = useState(0)

  const kpis = DEMO_KPIS
  const alertas = DEMO_CALENDARIO

  return (
    <div className="bfd-dashboard">
      <style>{`
        .bfd-dashboard { padding: 0 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── Header ──────────────────────────────────────────────── */
        .bfd-header { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; }
        .bfd-header__left h1 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .bfd-header__left p { font-size: 0.8rem; color: var(--text-muted); margin: 0.15rem 0 0; }
        .bfd-header__actions { display: flex; align-items: center; gap: 0.5rem; }
        .bfd-header__icon-btn {
          width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); color: var(--text-secondary);
          transition: background 0.15s;
        }
        .bfd-header__icon-btn:hover { background: rgba(255,255,255,0.1); }
        .bfd-header__actions .gb-btn--primario { background: #635BFF !important; border-color: #635BFF !important; }

        /* ── KPI Grid ────────────────────────────────────────────── */
        .bfd-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .bfd-kpi {
          background: rgba(255,255,255,0.04); border-radius: 12px; padding: 1.25rem 1.5rem;
          border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 0.35rem;
        }
        .bfd-kpi__header { display: flex; align-items: center; gap: 0.5rem; }
        .bfd-kpi__icon { color: var(--text-muted); }
        .bfd-kpi__label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .bfd-kpi__row { display: flex; align-items: baseline; gap: 0.6rem; }
        .bfd-kpi__value { font-size: 1.85rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; }
        .bfd-kpi__badge {
          font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.5rem;
          border-radius: 6px; background: rgba(52,211,153,0.12);
        }
        .bfd-kpi__sub { font-size: 0.75rem; color: var(--text-muted); }
        .bfd-kpi__spark { display: flex; align-items: flex-end; gap: 3px; height: 32px; margin: 0.25rem 0; }
        .bfd-kpi__spark-bar { flex: 1; border-radius: 2px; min-width: 8px; transition: height 0.3s; }

        /* ── Card genérico ───────────────────────────────────────── */
        .bfd-card {
          background: rgba(255,255,255,0.04); border-radius: 12px; padding: 1.25rem 1.5rem;
          border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column;
        }
        .bfd-card__title { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; }

        /* ── Charts Grid ─────────────────────────────────────────── */
        .bfd-charts-grid { display: grid; grid-template-columns: 1.2fr 1fr 0.8fr; gap: 1rem; }
        .bfd-chart-svg { width: 100%; height: auto; }
        .bfd-chart__legend { display: flex; gap: 1rem; margin-top: 0.5rem; }
        .bfd-chart__legend span { font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .bfd-chart__legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .bfd-chart__subtitle { font-size: 0.7rem; color: var(--text-muted); text-align: right; margin-bottom: 0.5rem; }

        /* ── Câmbio ──────────────────────────────────────────────── */
        .bfd-cambio { display: flex; flex-direction: column; gap: 0; margin-top: auto; }
        .bfd-cambio__row {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .bfd-cambio__row:last-child { border-bottom: none; }
        .bfd-cambio__code { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); min-width: 36px; }
        .bfd-cambio__val { font-size: 0.8rem; color: var(--text-secondary); flex: 1; }
        .bfd-cambio__var {
          font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 6px;
        }

        /* ── Insights Grid ───────────────────────────────────────── */
        .bfd-insights-grid { display: grid; grid-template-columns: 1.1fr 1.2fr 0.7fr; gap: 1rem; }

        /* ── Melhor cotação ──────────────────────────────────────── */
        .bfd-best { display: flex; flex-direction: column; gap: 0.75rem; }
        .bfd-best__route { display: flex; align-items: center; justify-content: space-between; }
        .bfd-best__port { text-align: center; }
        .bfd-best__port-flag { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
        .bfd-best__port-code { font-size: 0.7rem; color: var(--text-muted); }
        .bfd-best__arrow { display: flex; align-items: center; gap: 0.25rem; color: var(--text-muted); flex: 1; justify-content: center; }
        .bfd-best__arrow-line { height: 1px; flex: 1; background: rgba(255,255,255,0.15); max-width: 120px; }
        .bfd-best__arrow-tt { font-size: 0.65rem; color: var(--text-muted); }
        .bfd-best__saving { display: flex; align-items: center; gap: 0.75rem; }
        .bfd-best__saving-badge {
          font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 6px;
          background: rgba(52,211,153,0.12); color: #34d399; display: flex; align-items: center; gap: 4px;
        }
        .bfd-best__saving-val { font-size: 1.3rem; font-weight: 800; color: #34d399; }
        .bfd-best__meta { font-size: 0.7rem; color: var(--text-muted); }

        /* ── Donut ───────────────────────────────────────────────── */
        .bfd-donut { display: flex; align-items: center; gap: 1.5rem; }
        .bfd-donut__legend { display: flex; flex-direction: column; gap: 0.6rem; flex: 1; }
        .bfd-donut__legend-row { display: flex; align-items: center; gap: 0.5rem; }
        .bfd-donut__legend-icon { color: var(--text-muted); display: flex; }
        .bfd-donut__legend-label { font-size: 0.78rem; color: var(--text-secondary); min-width: 72px; }
        .bfd-donut__legend-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .bfd-donut__legend-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
        .bfd-donut__legend-count { font-size: 0.8rem; font-weight: 700; min-width: 24px; text-align: right; }
        .bfd-donut__legend-pct { font-size: 0.7rem; color: var(--text-muted); min-width: 28px; text-align: right; }

        /* ── Funil ───────────────────────────────────────────────── */
        .bfd-funil { display: flex; flex-direction: column; gap: 0.4rem; }
        .bfd-funil__row { display: flex; align-items: center; gap: 0.5rem; }
        .bfd-funil__label { font-size: 0.73rem; color: var(--text-secondary); min-width: 130px; white-space: nowrap; }
        .bfd-funil__bar-wrap { flex: 1; height: 14px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden; }
        .bfd-funil__bar { height: 100%; border-radius: 4px; transition: width 0.4s; }
        .bfd-funil__count { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); min-width: 20px; text-align: right; }
        .bfd-funil__pct { font-size: 0.7rem; color: var(--text-muted); min-width: 28px; text-align: right; }

        /* ── Top Incoterms ───────────────────────────────────────── */
        .bfd-incoterms { display: flex; flex-direction: column; gap: 0.35rem; }
        .bfd-incoterms__row { display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0; }
        .bfd-incoterms__code { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
        .bfd-incoterms__count { font-size: 0.8rem; color: var(--text-muted); }

        /* ── Bottom Grid ─────────────────────────────────────────── */
        .bfd-bottom-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }

        /* ── Taxa ────────────────────────────────────────────────── */
        .bfd-taxa { display: flex; align-items: center; gap: 1rem; }
        .bfd-taxa__legend { display: flex; flex-direction: column; gap: 0.35rem; }
        .bfd-taxa__legend-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); }
        .bfd-taxa__dot { width: 8px; height: 8px; border-radius: 50%; }

        /* ── Alertas ─────────────────────────────────────────────── */
        .bfd-alertas { display: flex; flex-direction: column; gap: 0.75rem; }
        .bfd-alertas__nav { display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; margin-bottom: 0.5rem; }
        .bfd-alertas__nav button {
          background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center;
        }
        .bfd-alertas__nav span { font-size: 0.75rem; color: var(--text-muted); }
        .bfd-alertas__pills { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .bfd-alertas__pill {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.85rem;
          border-radius: 8px; font-size: 0.78rem; color: var(--text-primary);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        }
        .bfd-alertas__pill-count { font-weight: 700; }

        /* ── Footer ──────────────────────────────────────────────── */
        .bfd-footer { text-align: center; font-size: 0.7rem; color: var(--text-muted); padding: 0.5rem 0; opacity: 0.6; }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .bfd-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .bfd-charts-grid { grid-template-columns: 1fr; }
          .bfd-insights-grid { grid-template-columns: 1fr; }
          .bfd-bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="bfd-header">
        <div className="bfd-header__left">
          <h1>Dashboard</h1>
          <p>Visao geral das cotacoes de frete</p>
        </div>
        <div className="bfd-header__actions">
          <button className="bfd-header__icon-btn" title="Exportar"><Export weight="bold" size={18} /></button>
          <button className="bfd-header__icon-btn" title="Download"><DownloadSimple weight="bold" size={18} /></button>
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            iconeEsquerda={<MagnifyingGlass weight="bold" size={16} />}
            onClick={() => navigate('/produto/bid-frete/cotacoes/nova')}
          >
            Buscar frete
          </BotaoGlobal>
        </div>
      </div>

      {/* KPIs */}
      <div className="bfd-kpi-grid">
        <KpiCard
          icon={<Timer weight="duotone" size={18} />}
          label="Em andamento"
          value={String(kpis.cotacoes_andamento)}
          badge="+3 semana"
          badgeColor="#34d399"
          sub={`USD ${fmtMoeda(kpis.valor_andamento_usd)} em aberto`}
        />
        <KpiCard
          icon={<TrendUp weight="duotone" size={18} />}
          label="Aprovadas"
          value={String(kpis.cotacoes_passadas)}
          badge="+12% mes"
          badgeColor="#34d399"
          sparkData={DEMO_MENSAL.map(d => d.aprovadas)}
          sub={`USD ${fmtMoeda(kpis.valor_aprovado_usd)} total`}
        />
        <KpiCard
          icon={<TrendUp weight="duotone" size={18} />}
          label="Saving medio"
          value={`${kpis.savings.media_saving_percentual}%`}
          badge="+2.3pp"
          badgeColor="#34d399"
          sub={`USD ${fmtMoeda(kpis.savings.total_saving_usd)} acumulado`}
        />
        <KpiCard
          icon={<Timer weight="duotone" size={18} />}
          label="Tempo medio resp."
          value="2.4 di."
          badge="-0.8d"
          badgeColor="#f87171"
          sub="Meta: 3 dias"
        />
      </div>

      {/* Charts Row */}
      <div className="bfd-charts-grid">
        {/* Barras mensal */}
        <div className="bfd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bfd-card__title">Cotacoes por mes</span>
            <span className="bfd-chart__subtitle">Ultimos 6 meses</span>
          </div>
          <GraficoBarrasMensal />
          <div className="bfd-chart__legend">
            <span><span className="bfd-chart__legend-dot" style={{ background: '#6ee7b7' }} /> Aprovadas</span>
            <span><span className="bfd-chart__legend-dot" style={{ background: '#7dd3fc' }} /> Em andamento</span>
            <span><span className="bfd-chart__legend-dot" style={{ background: '#fca5a5' }} /> Recusadas</span>
          </div>
        </div>

        {/* Donut modal */}
        <div className="bfd-card">
          <span className="bfd-card__title">Distribuicao por modal</span>
          <GraficoDonutModal />
        </div>

        {/* Câmbio */}
        <div className="bfd-card">
          <span className="bfd-card__title">Cambio do dia</span>
          <div className="bfd-cambio">
            {kpis.moedas.map(m => (
              <div key={m.codigo} className="bfd-cambio__row">
                <span className="bfd-cambio__code">{m.codigo}</span>
                <span className="bfd-cambio__val">R$ {m.valor_brl.toFixed(2).replace('.', ',')}</span>
                <span
                  className="bfd-cambio__var"
                  style={{
                    color: m.variacao >= 0 ? '#34d399' : '#f87171',
                    background: m.variacao >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  }}
                >
                  {m.variacao >= 0 ? '+' : ''}{m.variacao.toFixed(2).replace('.', ',')}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="bfd-insights-grid">
        {/* Melhor cotação */}
        <div className="bfd-card">
          <span className="bfd-card__title"><Trophy weight="duotone" size={16} style={{ marginRight: 6, verticalAlign: -2 }} />Melhor cotacao do mes</span>
          <div className="bfd-best">
            <div className="bfd-best__route">
              <div className="bfd-best__port">
                <div className="bfd-best__port-flag">CN</div>
                <div className="bfd-best__port-code">{DEMO_MELHOR_COTACAO.origem}</div>
              </div>
              <div className="bfd-best__arrow">
                <div className="bfd-best__arrow-line" />
                <Anchor weight="duotone" size={14} />
                <div className="bfd-best__arrow-tt">{DEMO_MELHOR_COTACAO.transit_time}d</div>
                <div className="bfd-best__arrow-line" />
              </div>
              <div className="bfd-best__port">
                <div className="bfd-best__port-flag">BR</div>
                <div className="bfd-best__port-code">{DEMO_MELHOR_COTACAO.destino}</div>
              </div>
            </div>
            <div className="bfd-best__saving">
              <span className="bfd-best__saving-badge">
                <TrendUp size={12} /> {DEMO_MELHOR_COTACAO.saving_pct}% saving
              </span>
              <span className="bfd-best__saving-val">USD {fmtMoeda(DEMO_MELHOR_COTACAO.saving_valor)}</span>
            </div>
            <div className="bfd-best__meta">
              {DEMO_MELHOR_COTACAO.numero} | {DEMO_MELHOR_COTACAO.fornecedor} | USD {fmtMoeda(DEMO_MELHOR_COTACAO.valor_aprovado)}
            </div>
          </div>
        </div>

        {/* Funil */}
        <div className="bfd-card">
          <span className="bfd-card__title">Funil de cotacoes</span>
          <FunilStatus />
        </div>

        {/* Top Incoterms */}
        <div className="bfd-card">
          <span className="bfd-card__title">Top incoterms</span>
          <div className="bfd-incoterms">
            {DEMO_INCOTERMS.map(inc => (
              <div key={inc.incoterm} className="bfd-incoterms__row">
                <span className="bfd-incoterms__code">{inc.incoterm}</span>
                <span className="bfd-incoterms__count">{inc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bfd-bottom-grid">
        {/* Taxa aprovação */}
        <div className="bfd-card">
          <span className="bfd-card__title">Taxa de aprovacao</span>
          <TaxaAprovacao />
        </div>

        {/* Alertas */}
        <div className="bfd-card bfd-alertas">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bfd-card__title" style={{ marginBottom: 0 }}>Alertas</span>
            <div className="bfd-alertas__nav">
              <button onClick={() => setCalIdx(i => Math.max(0, i - 1))}><CaretLeft size={14} /></button>
              <span>Hoje</span>
              <button onClick={() => setCalIdx(i => i + 1)}><CaretRight size={14} /></button>
              <span style={{ marginLeft: 8 }}>Amanha</span>
            </div>
          </div>
          <div className="bfd-alertas__pills">
            {alertas.map((a, i) => {
              const pillColors: Record<string, string> = { red: '#f87171', orange: '#fbbf24', yellow: '#eab308', green: '#34d399' }
              return (
                <div key={i} className="bfd-alertas__pill">
                  <span className="bfd-alertas__pill-count" style={{ color: pillColors[a.cor] || '#60a5fa' }}>{a.count}</span>
                  <span>{a.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bfd-footer">
        ⚙ Dados demonstrativos — conecte o backend para dados reais
      </div>
    </div>
  )
}
