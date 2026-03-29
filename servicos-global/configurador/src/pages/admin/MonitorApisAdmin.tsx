import React, { useState, useEffect } from 'react'
import { 
  PlugsConnected, 
  Plus, 
  Trash, 
  Pulse, 
  Monitor, 
  Wrench, 
  EnvelopeSimple, 
  WhatsappLogo, 
  SlackLogo,
  CheckCircle,
  Warning
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/card-global'

// ─── Interfaces ───────────────────────────────────────────────────────────

interface ApiService {
  id: string
  produto: string
  organizacao: string
  baseUrl: string
  status: 'Online' | 'Offline' | 'Degradado'
  tipoCobranca: string
  consumoAtual: number
  consumoLimite: number | null
}

interface ApiLog {
  id: string
  data: string
  hora: string
  organizacao: string
  produto: string
  metodo: string
  endpoint: string
  statusCode: number
  duracao: string
}

interface AlertaConfig {
  id: string
  nome: string
  webhookUrl: string
  canais: ('E-mail' | 'WhatsApp' | 'Slack')[]
  gatilhos: string[]
  ativo: boolean
}

export function MonitorApisAdmin() {
  const [tab, setTab] = useState<'cockpit' | 'alertas'>('cockpit')
  const [servicos, setServicos] = useState<ApiService[]>([])
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [alertas, setAlertas] = useState<AlertaConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Estado Real: banco iniciando vazio no Railway
    const carregarMonitor = async () => {
      setLoading(true)
      try {
        setServicos([])
        setLogs([])
        setAlertas([])
      } catch (err) {
        console.error('Erro ao carregar monitor real:', err)
      } finally {
        setLoading(false)
      }
    }
    carregarMonitor()
  }, [])

  const colunasInventario: TabelaGlobalColuna<ApiService>[] = [
    { key: 'produto', label: 'Serviço', tipo: 'texto' },
    { key: 'organizacao', label: 'Organização', tipo: 'texto' },
    { key: 'status', label: 'Status', tipo: 'texto' },
    { key: 'consumoAtual', label: 'Consumo', tipo: 'texto' },
  ]

  const colunasLogs: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'data', label: 'Data', tipo: 'texto' },
    { key: 'hora', label: 'Hora', tipo: 'texto' },
    { key: 'organizacao', label: 'Org', tipo: 'texto' },
    { key: 'metodo', label: 'Método', tipo: 'texto' },
    { key: 'endpoint', label: 'Endpoint', tipo: 'texto' },
    { key: 'statusCode', label: 'Status', tipo: 'texto' },
  ]

  const colunasAlertas: TabelaGlobalColuna<AlertaConfig>[] = [
    { key: 'nome', label: 'Grupo', tipo: 'texto' },
    { key: 'canais', label: 'Canais', tipo: 'texto', render: (v: any) => (v as string[]).join(', ') },
    { key: 'ativo', label: 'Ativo', tipo: 'texto', render: (v: any) => v ? 'SIM' : 'NÃO' },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} />}
          titulo="Monitor de Infraestrutura"
          subtitulo="Visão administrativa global da saúde das APIs no Railway"
        />
      }
      stats={
        <>
          <StatCardGlobal titulo="APIs Online" valor={String(servicos.filter(s => s.status === 'Online').length)} variante="sucesso" />
          <StatCardGlobal titulo="Requisições (24h)" valor={String(logs.length)} variante="primario" />
          <StatCardGlobal titulo="Alertas Ativos" valor={String(alertas.filter(a => a.ativo).length)} variante="padrao" />
        </>
      }
      toolbar={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            style={{ 
              background: tab === 'cockpit' ? 'var(--brand-primary)' : 'transparent',
              color: tab === 'cockpit' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setTab('cockpit')}
          >
            Monitoramento
          </button>
          <button 
            style={{ 
              background: tab === 'alertas' ? 'var(--brand-primary)' : 'transparent',
              color: tab === 'alertas' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setTab('alertas')}
          >
            Alertas
          </button>
        </div>
      }
    >
      {tab === 'cockpit' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
          <TabelaGlobal
            id="admin-inventory"
            colunas={colunasInventario}
            dados={servicos}
            mensagemVazio="Nenhum serviço registrado no Railway."
          />
          <TabelaGlobal
            id="admin-telemetry"
            colunas={colunasLogs}
            dados={logs}
            mensagemVazio="Nenhum registro de tráfego nas últimas 24h."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              style={{ 
                background: 'var(--brand-primary)', 
                color: '#fff', 
                border: 'none', 
                padding: '0.5rem 1.25rem', 
                borderRadius: '6px', 
                fontWeight: 600,
                cursor: 'pointer' 
              }}
            >
              Novo Alerta
            </button>
          </div>
          <TabelaGlobal
            id="admin-alerts"
            colunas={colunasAlertas}
            dados={alertas}
            mensagemVazio="Nenhuma regra de alerta configurada."
          />
        </div>
      )}
    </PaginaGlobal>
  )
}
