import React from 'react'
import { 
  ChartBar, 
  TrendUp, 
  CurrencyDollar, 
  Calculator, 
  Sparkle, 
  ArrowRight,
  CaretRight,
  WarningCircle,
  Clock,
  ArrowCircleUpRight,
  ArrowCircleDownRight
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'

// ─── Formatação ──────────────────────────────────────────────────────────────
const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const usd = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

// ─── Componentes Auxiliares ──────────────────────────────────────────────────

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }: any) => (
  <div className="db-stat-card">
    <div className="db-stat-header">
      <span className="db-stat-title">{title}</span>
      <div className={`db-stat-icon-wrapper`} style={{ color }}>
        <Icon weight="duotone" size={20} />
      </div>
    </div>
    <div className="db-stat-content">
      <span className="db-stat-value">{value}</span>
      {trend && (
        <span className={`db-stat-trend db-trend-${trend}`}>
          {trend === 'up' ? <ArrowCircleUpRight weight="fill" /> : <ArrowCircleDownRight weight="fill" />}
          {trendValue}
        </span>
      )}
    </div>
  </div>
)

const GabiInsight = ({ text }: { text: string }) => (
  <div className="db-gabi-insight">
    <div className="db-gabi-header">
      <div className="db-gabi-avatar">
        <Sparkle weight="fill" size={14} color="#fff" />
      </div>
      <span className="db-gabi-title">GABI AI • INSIGHT</span>
    </div>
    <p className="db-gabi-text">{text}</p>
    <div className="db-gabi-footer">
      <button className="db-gabi-btn">Ver Detalhes <CaretRight size={12} /></button>
    </div>
  </div>
)

// ─── Componente Principal ────────────────────────────────────────────────────

export default function DashboardSimulaCusto() {
  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Dashboard SimulaCusto"
          subtitulo="Indicadores estratégicos e visão consolidada de viabilidade fiscal"
          icone={<ChartBar weight="duotone" size={22} />}
        />
      }
      stats={
        <div className="db-top-stats">
          <StatCard 
            title="TOTAL DE SIMULAÇÕES" 
            value="128" 
            trend="up" 
            trendValue="+12%" 
            icon={Calculator} 
            color="#818cf8" 
          />
          <StatCard 
            title="CUSTO MÉDIO (BRL)" 
            value={brl(24500)} 
            trend="down" 
            trendValue="-4%" 
            icon={TrendUp} 
            color="#10b981" 
          />
          <StatCard 
            title="BASE CIF TOTAL (USD)" 
            value={usd(152000)} 
            icon={CurrencyDollar} 
            color="#f59e0b" 
          />
          <StatCard 
            title="FATOR DE IMPORTAÇÃO" 
            value="1.660x" 
            trend="up" 
            trendValue="+2%" 
            icon={TrendUp} 
            color="#ec4899" 
          />
        </div>
      }
      acoes={
        <div className="db-actions-row">
          <button className="db-btn-primary">
            <Calculator weight="bold" size={16} /> Nova Simulação
          </button>
        </div>
      }
    >
      <div className="db-grid-container">
        {/* Coluna Esquerda */}
        <div className="db-col db-col-main">
          {/* Card: Fluxo de Caixa / Cenários */}
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Projeção de Fluxo de Caixa (Câmbio)</span>
              <div className="db-panel-legend">
                <span className="dot dot-opt"></span> Otimista
                <span className="dot dot-base"></span> Base
                <span className="dot dot-pess"></span> Pessimista
              </div>
            </div>
            <div className="db-chart-placeholder">
              {/* Gráfico Visual Complexo via CSS/SVG */}
              <svg width="100%" height="200" viewBox="0 0 800 200">
                <path d="M0,150 Q200,100 400,120 T800,50" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.6" />
                <path d="M0,160 Q200,110 400,130 T800,60" fill="none" stroke="#818cf8" strokeWidth="4" />
                <path d="M0,170 Q200,120 400,140 T800,70" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.6" />
                <circle cx="400" cy="130" r="6" fill="#818cf8" />
                <text x="415" y="130" fill="var(--ws-text)" fontSize="12">R$ 54.300 (Base)</text>
              </svg>
            </div>
          </div>

          {/* Card: Últimas Simulações */}
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Simulações Recentes</span>
              <button className="db-btn-ghost">Ver todas <ArrowRight size={14} /></button>
            </div>
            <table className="db-table">
              <thead>
                <tr>
                  <th>NCM</th>
                  <th>PAÍS</th>
                  <th>VALOR FOB</th>
                  <th>LANDED COST</th>
                  <th>DATA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>8471.30.19</strong></td>
                  <td>US</td>
                  <td>{usd(5925)}</td>
                  <td className="txt-success">R$ 54.320,00</td>
                  <td>27/03/2026</td>
                </tr>
                <tr>
                  <td><strong>8517.13.00</strong></td>
                  <td>CN</td>
                  <td>{usd(12400)}</td>
                  <td className="txt-success">R$ 112.450,00</td>
                  <td>26/03/2026</td>
                </tr>
                <tr>
                  <td><strong>8413.70.10</strong></td>
                  <td>DE</td>
                  <td>{usd(4200)}</td>
                  <td className="txt-success">R$ 38.900,00</td>
                  <td>25/03/2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="db-col db-col-side">
          <GabiInsight text="Identificamos que 40% das suas simulações recentes para NCM 8471 poderiam economizar até 12% em ICMS se o desembaraço fosse feito via Santa Catarina." />
          
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title">Composição do Custo</span>
            </div>
            <div className="db-donut-container">
               <svg width="160" height="160" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(129,140,248,0.1)" strokeWidth="4"></circle>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#818cf8" strokeWidth="4" strokeDasharray="60 40" strokeDashoffset="25"></circle>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="85"></circle>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="60"></circle>
                <text x="21" y="21" textAnchor="middle" dy=".3em" fontSize="4" fill="var(--ws-text)">{brl(24500)}</text>
              </svg>
              <div className="db-donut-legend">
                <div className="leg-item"><span className="dot" style={{background: '#818cf8'}}></span> Produto (60%)</div>
                <div className="leg-item"><span className="dot" style={{background: '#10b981'}}></span> Impostos (25%)</div>
                <div className="leg-item"><span className="dot" style={{background: '#f59e0b'}}></span> Taxas (15%)</div>
              </div>
            </div>
          </div>

          <div className="db-panel db-panel-warning">
            <div className="db-panel-header">
              <span className="db-panel-title"><WarningCircle weight="fill" size={16} /> Alertas de Câmbio</span>
            </div>
            <div className="db-warning-content">
              <p>A taxa PTAX do USD subiu <strong>1.4%</strong> hoje. Recomenda-se revisar simulações em rascunho.</p>
              <span className="db-time"><Clock weight="bold" /> há 45 min</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .db-top-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1rem; width: 100%; }
        .db-stat-card { background: var(--ws-surface, #1e293b); border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.2)); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .db-stat-header { display: flex; justify-content: space-between; align-items: center; }
        .db-stat-title { font-size: 0.65rem; font-weight: 700; color: var(--ws-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.08em; }
        .db-stat-icon-wrapper { background: rgba(129,140,248,0.1); padding: 0.5rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .db-stat-content { display: flex; align-items: baseline; gap: 0.75rem; }
        .db-stat-value { font-size: 1.5rem; font-weight: 800; color: var(--ws-text, #f1f5f9); }
        .db-stat-trend { display: flex; align-items: center; gap: 0.2rem; font-size: 0.75rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 4px; }
        .db-trend-up { color: #10b981; background: rgba(16,185,129,0.1); }
        .db-trend-down { color: #ef4444; background: rgba(239,68,68,0.1); }

        .db-actions-row { display: flex; height: 100%; align-items: flex-end; }
        .db-btn-primary { background: var(--ws-accent, #818cf8); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.2s; }
        .db-btn-primary:hover { transform: translateY(-2px); opacity: 0.9; box-shadow: 0 4px 12px rgba(129,140,248,0.3); }

        .db-grid-container { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; margin-top: 1.5rem; padding-bottom: 2rem; }
        .db-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .db-panel { background: var(--ws-surface, #1e293b); border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.15)); border-radius: 16px; padding: 1.5rem; }
        .db-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .db-panel-title { font-size: 0.875rem; font-weight: 700; color: var(--ws-text, #f1f5f9); display: flex; align-items: center; gap: 0.5rem; }
        .db-panel-legend { display: flex; gap: 1rem; font-size: 0.7rem; color: var(--ws-muted); }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
        .dot-opt { background: #10b981; }
        .dot-base { background: #818cf8; }
        .dot-pess { background: #ef4444; }

        .db-chart-placeholder { padding: 1rem 0; }
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th { text-align: left; padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--ws-accent-border, rgba(129,140,248,0.1)); font-size: 0.65rem; color: var(--ws-muted); text-transform: uppercase; }
        .db-table td { padding: 1rem 0.5rem; border-bottom: 1px solid rgba(129,140,248,0.05); font-size: 0.875rem; color: var(--ws-text, #f1f5f9); }
        .txt-success { color: #10b981; font-weight: 600; }
        .db-btn-ghost { background: transparent; border: none; color: var(--ws-accent, #818cf8); font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }

        .db-gabi-insight { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 16px; padding: 1.25rem; color: white; box-shadow: 0 8px 24px rgba(79,70,229,0.3); }
        .db-gabi-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .db-gabi-avatar { background: rgba(255,255,255,0.2); width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .db-gabi-title { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; }
        .db-gabi-text { font-size: 0.875rem; font-weight: 500; line-height: 1.5; color: rgba(255,255,255,0.95); margin-bottom: 1rem; }
        .db-gabi-footer { display: flex; justify-content: flex-end; }
        .db-gabi-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }

        .db-donut-container { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; padding: 0.5rem 0; }
        .db-donut-legend { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
        .leg-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--ws-text); }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        .db-panel-warning { border-left: 4px solid #f59e0b; }
        .db-warning-content p { font-size: 0.8125rem; color: var(--ws-text); line-height: 1.4; margin-bottom: 0.75rem; }
        .db-time { font-size: 0.7rem; color: var(--ws-muted); display: flex; align-items: center; gap: 0.3rem; }
      `}</style>
    </PaginaGlobal>
  )
}
