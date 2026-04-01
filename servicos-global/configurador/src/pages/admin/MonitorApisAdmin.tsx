import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [tab, setTab] = useState<'cockpit' | 'alertas'>('cockpit')
  const [servicos, setServicos] = useState<ApiService[]>([])
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [alertas, setAlertas] = useState<AlertaConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarMonitor = async () => {
      setLoading(true)
      try {
        const [svcRes, logsRes] = await Promise.all([
          fetch('/api/admin/cockpit/services', { credentials: 'include' }),
          fetch('/api/admin/cockpit/logs?limit=50', { credentials: 'include' }),
        ])

        if (svcRes.ok) {
          const svcData = await svcRes.json()
          setServicos((svcData.services || []).map((s: any) => ({
            id: s.name,
            produto: s.name,
            organizacao: 'Gravity',
            baseUrl: `http://localhost`,
            status: s.status === 'online' ? 'Online' : s.status === 'degraded' ? 'Degradado' : 'Offline',
            tipoCobranca: s.type,
            consumoAtual: 0,
            consumoLimite: null,
          })))
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs((logsData.logs || []).map((l: any) => ({
            id: l.id,
            data: l.data,
            hora: l.hora,
            organizacao: l.organizacao,
            produto: l.produto,
            metodo: l.metodo || l.method,
            endpoint: l.endpoint || l.path,
            statusCode: l.statusCode,
            duracao: l.duracao,
          })))
        }

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
    { key: 'produto', label: t('admin.monitor.tabela.servico'), tipo: 'texto',
      tooltipTitulo: 'Serviço', tooltipDescricao: 'Produto ou integração monitorada pela plataforma' },
    { key: 'organizacao', label: t('admin.monitor.tabela.organizacao'), tipo: 'texto',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Empresa associada a este serviço' },
    { key: 'status', label: t('admin.monitor.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o serviço está operando normalmente' },
    { key: 'consumoAtual', label: t('admin.monitor.tabela.consumo'), tipo: 'texto',
      tooltipTitulo: 'Consumo', tooltipDescricao: 'Volume de requisições processadas no período atual' },
  ]

  const colunasLogs: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'data', label: t('admin.monitor.tabela.data'), tipo: 'texto',
      tooltipTitulo: 'Data', tooltipDescricao: 'Data em que a requisição foi registrada' },
    { key: 'hora', label: t('admin.monitor.tabela.hora'), tipo: 'texto',
      tooltipTitulo: 'Hora', tooltipDescricao: 'Hora exata em que a requisição ocorreu' },
    { key: 'organizacao', label: t('admin.monitor.tabela.org'), tipo: 'texto',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Empresa que originou esta chamada à API' },
    { key: 'metodo', label: t('admin.monitor.tabela.metodo'), tipo: 'texto',
      tooltipTitulo: 'Método', tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE' },
    { key: 'endpoint', label: t('admin.monitor.tabela.endpoint'), tipo: 'texto',
      tooltipTitulo: 'Endpoint', tooltipDescricao: 'Rota da API que recebeu a chamada' },
    { key: 'statusCode', label: t('admin.monitor.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso' },
  ]

  const colunasAlertas: TabelaGlobalColuna<AlertaConfig>[] = [
    { key: 'nome', label: t('admin.monitor.tabela.grupo'), tipo: 'texto',
      tooltipTitulo: 'Grupo', tooltipDescricao: 'Nome da regra de alerta configurada' },
    { key: 'canais', label: t('admin.monitor.tabela.canais'), tipo: 'texto',
      tooltipTitulo: 'Canais', tooltipDescricao: 'Meios de notificação ativados para este alerta',
      render: (v: any) => (v as string[]).join(', ') },
    { key: 'ativo', label: t('admin.monitor.tabela.ativo'), tipo: 'texto',
      tooltipTitulo: 'Ativo', tooltipDescricao: 'Indica se este alerta está disparando notificações',
      render: (v: any) => v ? t('comum.sim') : t('comum.nao') },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} />}
          titulo={t('admin.monitor.titulo')}
          subtitulo={t('admin.monitor.subtitulo')}
        />
      }
      stats={
        <>
          <StatCardGlobal titulo={t('admin.monitor.apis_online')} valor={String(servicos.filter(s => s.status === 'Online').length)} variante="sucesso" />
          <StatCardGlobal titulo={t('admin.monitor.requisicoes_24h')} valor={String(logs.length)} variante="primario" />
          <StatCardGlobal titulo={t('admin.monitor.alertas_ativos')} valor={String(alertas.filter(a => a.ativo).length)} variante="padrao" />
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
            {t('admin.monitor.aba_monitoramento')}
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
            {t('admin.monitor.aba_alertas')}
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
            mensagemVazio={t('admin.monitor.vazio.sem_servicos')}
          />
          <TabelaGlobal
            id="admin-telemetry"
            colunas={colunasLogs}
            dados={logs}
            mensagemVazio={t('admin.monitor.vazio.sem_trafego')}
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
              {t('admin.monitor.novo_alerta')}
            </button>
          </div>
          <TabelaGlobal
            id="admin-alerts"
            colunas={colunasAlertas}
            dados={alertas}
            mensagemVazio={t('admin.monitor.vazio.sem_alertas')}
          />
        </div>
      )}
    </PaginaGlobal>
  )
}
