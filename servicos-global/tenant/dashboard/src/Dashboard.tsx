import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChartBar,
  TrendUp,
  Warehouse,
  Users,
  Target,
  ChartPieSlice,
  ArrowsClockwise,
  WarningCircle,
  Clock,
  Briefcase,
  Headset,
  ArrowRight,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardKPIs {
  totalSimulacoes: number
  mediaLandedCostBrl: number
  crm: {
    totalEmpresas: number
    clientesAtivos: number
    clientesInativos: number
    leadsFunil: number
    novosEsteMes: number
    funil: Array<{ etapa: string; valor: number; meta: number; totalEstimado: number }>
    healthScore: {
      saudavel: number
      atencao: number
      risco: number
      total: number
    }
    helpDesk: {
      abertos: number
      emAndamento: number
      tempoMedio: string
    }
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch('/api/v1/dashboard/kpis?tenant_id=tenant-1')
      if (!res.ok) throw new Error(`Status: ${res.status}`)
      const { data } = await res.json()
      setKpis(data)
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (loading) return <div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Carregando visão geral...</div>

  const crm = kpis?.crm

  const statsContent = (
    <>
      <CardBasicoGlobal
        titulo="Total de Empresas"
        icone={<Warehouse weight="duotone" size={16} />}
        valor={crm?.totalEmpresas ?? 0}
        periodos={[{ periodo: '30d', rotulo: 'Este mês', valor: '+0%', direcao: 'up' }] as PeriodoTendencia[]}
      />
      <CardBasicoGlobal
        titulo="Clientes Ativos"
        icone={<Users weight="duotone" size={16} />}
        valor={crm?.clientesAtivos ?? 0}
        variante="sucesso"
        periodos={[{ periodo: '30d', rotulo: 'Este mês', valor: '+0%', direcao: 'up' }] as PeriodoTendencia[]}
      />
      <CardBasicoGlobal
        titulo="Leads no Funil"
        icone={<Target weight="duotone" size={16} />}
        valor={crm?.leadsFunil ?? 0}
        variante="aviso"
        periodos={[{ periodo: '30d', rotulo: 'Este mês', valor: '+0%', direcao: 'up' }] as PeriodoTendencia[]}
      />
      <CardBasicoGlobal
        titulo="Novos este Mês"
        icone={<Briefcase weight="duotone" size={16} />}
        valor={crm?.novosEsteMes ?? 0}
        periodos={[{ periodo: '30d', rotulo: '30 dias', valor: '+0%', direcao: 'up' }] as PeriodoTendencia[]}
      />
    </>
  )

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Dashboard Consolidado"
          subtitulo="O que precisa acontecer hoje — e quem é o responsável por fazer acontecer."
          icone={<ChartBar weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={statsContent}
      acoes={
        <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<ArrowsClockwise />} onClick={fetchDashboard}>
          Atualizar
        </BotaoGlobal>
      }
    >
      <div className="db-grid-container">
        {/* Coluna Principal: Funil de Vendas */}
        <div className="db-col db-col-main">
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title"><Target weight="duotone" size={18} /> Funil de Vendas</span>
            </div>
            <div className="db-funnel-container">
              {crm?.funil.map((item, idx) => (
                <div key={idx} className="db-funnel-row">
                  <div className="db-funnel-label">
                    <span>{item.etapa}</span>
                    <strong>{item.valor}</strong>
                  </div>
                  <div className="db-funnel-bar-bg">
                    <div 
                      className="db-funnel-bar-fill" 
                      style={{ 
                        width: `${(item.valor / item.meta) * 100}%`,
                        opacity: 1 - (idx * 0.15)
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title"><Headset weight="duotone" size={18} /> Chamados & Help Desk</span>
            </div>
            <div className="db-helpdesk-grid">
               <div className="db-hd-card hd-danger">
                  <span className="hd-value">{crm?.helpDesk.abertos}</span>
                  <span className="hd-label">Abertos</span>
               </div>
               <div className="db-hd-card hd-warning">
                  <span className="hd-value">{crm?.helpDesk.emAndamento}</span>
                  <span className="hd-label">Em Andamento</span>
               </div>
               <div className="db-hd-card hd-info">
                  <span className="hd-value">{crm?.helpDesk.tempoMedio}</span>
                  <span className="hd-label">Tempo Médio</span>
               </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Health Score e Alertas */}
        <div className="db-col db-col-side">
          <div className="db-panel">
            <div className="db-panel-header">
              <span className="db-panel-title"><ChartPieSlice weight="duotone" size={18} /> Health Score</span>
            </div>
            <CardGraficoGlobal
              titulo="Saúde da Base"
              total={crm?.healthScore.total ?? 0}
              valorPrincipal={crm?.healthScore.saudavel ?? 0}
              corGauge="#10b981"
              legenda={[
                { label: 'Saudável', valor: crm?.healthScore.saudavel ?? 0, cor: '#10b981' },
                { label: 'Atenção', valor: crm?.healthScore.atencao ?? 0, cor: '#fbbf24' },
                { label: 'Risco', valor: crm?.healthScore.risco ?? 0, cor: '#ef4444' },
              ]}
            />
          </div>

          <div className="db-panel db-panel-warning">
            <div className="db-panel-header">
              <span className="db-panel-title"><WarningCircle weight="fill" size={16} /> Alertas Críticos</span>
            </div>
            <div className="db-warning-content">
              <p>Nenhum chamado crítico aberto no momento.</p>
              <span className="db-time"><Clock weight="bold" /> Sincronizado agora</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .db-grid-container { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; margin-top: 1.5rem; padding-bottom: 2rem; }
        .db-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .db-panel { background: var(--ws-surface, #1e293b); border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.15)); border-radius: 16px; padding: 1.5rem; }
        .db-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .db-panel-title { font-size: 0.875rem; font-weight: 700; color: var(--ws-text, #f1f5f9); display: flex; align-items: center; gap: 0.5rem; }
        
        .db-funnel-container { display: flex; flex-direction: column; gap: 1rem; }
        .db-funnel-row { display: flex; flex-direction: column; gap: 0.5rem; }
        .db-funnel-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--ws-muted); }
        .db-funnel-label strong { color: var(--ws-text); }
        .db-funnel-bar-bg { background: rgba(129, 140, 248, 0.1); height: 8px; border-radius: 4px; overflow: hidden; }
        .db-funnel-bar-fill { background: var(--ws-accent, #818cf8); height: 100%; border-radius: 4px; transition: width 0.5s ease; }

        .db-helpdesk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .db-hd-card { padding: 1rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(129, 140, 248, 0.05); border: 1px solid rgba(129,140,248,0.1); }
        .hd-value { font-size: 1.5rem; font-weight: 700; color: var(--ws-text); }
        .hd-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: var(--ws-muted); margin-top: 0.25rem; }
        .hd-danger .hd-value { color: #f87171; }
        .hd-warning .hd-value { color: #fbbf24; }
        .hd-info .hd-value { color: #60a5fa; }

        .db-panel-warning { border-left: 4px solid #f59e0b; }
        .db-warning-content p { font-size: 0.8125rem; color: var(--ws-text); line-height: 1.4; }
        .db-time { font-size: 0.7rem; color: var(--ws-muted); display: flex; align-items: center; gap: 0.3rem; margin-top: 0.5rem; }
      `}</style>
    </PaginaGlobal>
  )
}

export default Dashboard
