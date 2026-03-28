import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Warning, 
  WarningCircle, 
  Clock, 
  Database, 
  Globe, 
  ShieldCheck, 
  Key, 
  MagnifyingGlass, 
  FileCode, 
  ChartLineUp, 
  CaretRight,
  Monitor,
  Pulse,
  TerminalWindow,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { CardBasicoGlobal, StatCardGlobal } from '@nucleo/card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'

// ─── Tipos ───────────────────────────────────────────────────────────────

interface ApiService {
  id: string
  name: string
  status: 'online' | 'degraded' | 'offline'
  latency: string
  version: string
  lastCheck: string
  type: 'core' | 'product' | 'gateway'
}

interface ApiLog {
  id: string
  timestamp: string
  method: string
  path: string
  statusCode: number
  status: 'SUCESSO' | 'ERRO_CLIENTE' | 'ERRO_SERVER' | 'NEGADO'
  duracao: string
  organizacao: string
  produto: string
}

export function ApiCockpit() {
  const [servicos, setServicos] = useState<ApiService[]>([])
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'logs' | 'config'>('geral')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarCockpit = async () => {
      setLoading(true)
      try {
        setServicos([])
        setLogs([])
      } catch (err) {
        console.error('Erro ao carregar dados reais:', err)
      } finally {
        setLoading(false)
      }
    }
    carregarCockpit()
  }, [])

  const colunasServicos: TabelaGlobalColuna<ApiService>[] = [
    { key: 'name', label: 'Serviço', tipo: 'texto' },
    { key: 'type', label: 'Tipo', tipo: 'texto', render: (val) => <span style={{ textTransform: 'capitalize' }}>{val as string}</span> },
    { key: 'status', label: 'Status', tipo: 'texto', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: val === 'online' ? '#10b981' : '#f59e0b' }}>
        {val === 'online' ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} weight="fill" />}
        {(val as string).toUpperCase()}
      </div>
    )},
    { key: 'latency', label: 'Latência', tipo: 'texto' },
    { key: 'version', label: 'Versão', tipo: 'texto' },
    { key: 'lastCheck', label: 'Último Check', tipo: 'texto' },
  ]

  const colunasLogs: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'timestamp', label: 'Data/Hora', tipo: 'texto' },
    { key: 'method', label: 'Método', tipo: 'texto', render: (val) => <strong style={{ color: 'var(--brand-primary)' }}>{val as string}</strong> },
    { key: 'path', label: 'Endpoint', tipo: 'texto' },
    { key: 'statusCode', label: 'Status', tipo: 'texto', render: (val) => (
      <span style={{ color: (val as number) < 400 ? '#10b981' : '#ef4444' }}>{val as number}</span>
    )},
    { key: 'organizacao', label: 'Organização', tipo: 'texto' },
    { key: 'produto', label: 'Produto', tipo: 'texto' },
    { key: 'duracao', label: 'Duração', tipo: 'texto' },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal 
          titulo="API Cockpit" 
          subtitulo="Monitoramento em tempo real da infraestrutura no Railway"
          icone={<Pulse size={32} weight="duotone" />}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <StatCardGlobal titulo="Status Geral" valor="Operacional" variante="sucesso" />
          <StatCardGlobal titulo="Uptime (24h)" valor="100%" variante="primario" />
          <StatCardGlobal titulo="Latência Média" valor="24ms" variante="padrao" />
        </div>

        {/* Tabs Control */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '2rem' }}>
          <button 
            onClick={() => setAbaAtiva('geral')}
            style={{ 
              padding: '1rem 0.5rem', 
              borderBottom: abaAtiva === 'geral' ? '2px solid var(--brand-primary)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: abaAtiva === 'geral' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Monitor size={20} /> Inventário de Serviços
          </button>
          <button 
            onClick={() => setAbaAtiva('logs')}
            style={{ 
              padding: '1rem 0.5rem', 
              borderBottom: abaAtiva === 'logs' ? '2px solid var(--brand-primary)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: abaAtiva === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <TerminalWindow size={20} /> Logs de Requisições
          </button>
        </div>

        {/* Content */}
        <div style={{ background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          {abaAtiva === 'geral' ? (
            <TabelaGlobal 
              id="cockpit-services"
              colunas={colunasServicos}
              dados={servicos}
              mensagemVazio="Nenhum serviço registrado no momento."
            />
          ) : (
            <TabelaGlobal 
              id="cockpit-logs"
              colunas={colunasLogs}
              dados={logs}
              mensagemVazio="Nenhuma requisição processada nas últimas 24h."
            />
          )}
        </div>
      </div>
    </PaginaGlobal>
  )
}
