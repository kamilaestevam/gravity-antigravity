import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { CardBasicoGlobal, CardEstatisticaGlobal } from '@nucleo/card-global'
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
  const { t } = useTranslation()
  const [servicos, setServicos] = useState<ApiService[]>([])
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'logs' | 'config'>('geral')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarCockpit = async () => {
      setLoading(true)
      try {
        const [svcRes, logsRes] = await Promise.all([
          fetch('/api/v1/api-cockpit/services', { credentials: 'include' }),
          fetch('/api/v1/api-cockpit/logs?limit=50', { credentials: 'include' }),
        ])

        if (svcRes.ok) {
          const svcData = await svcRes.json()
          setServicos(svcData.services || [])
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData.logs || [])
        }
      } catch (err) {
        // ApiCockpit ainda sem endpoint real — silencia durante desenvolvimento
      } finally {
        setLoading(false)
      }
    }
    carregarCockpit()
  }, [])

  const colunasServicos: TabelaGlobalColuna<ApiService>[] = [
    { key: 'name', label: t('admin.cockpit.tabela.servico'), tipo: 'texto',
      tooltipTitulo: 'Serviço', tooltipDescricao: 'Nome do serviço ou integração monitorada pela plataforma' },
    { key: 'type', label: t('admin.cockpit.tabela.tipo'), tipo: 'texto',
      tooltipTitulo: 'Tipo', tooltipDescricao: 'Categoria do serviço: interno, externo ou webhook',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{val as string}</span> },
    { key: 'status', label: t('admin.cockpit.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o serviço está respondendo normalmente',
      render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: val === 'online' ? '#10b981' : '#f59e0b' }}>
        {val === 'online' ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} weight="fill" />}
        {(val as string).toUpperCase()}
      </div>
    )},
    { key: 'latency', label: t('admin.cockpit.tabela.latencia'), tipo: 'texto',
      tooltipTitulo: 'Latência', tooltipDescricao: 'Tempo médio de resposta do serviço na última verificação' },
    { key: 'version', label: t('admin.cockpit.tabela.versao'), tipo: 'texto',
      tooltipTitulo: 'Versão', tooltipDescricao: 'Versão da API ou serviço atualmente em execução' },
    { key: 'lastCheck', label: t('admin.cockpit.tabela.ultimo_check'), tipo: 'texto',
      tooltipTitulo: 'Último Check', tooltipDescricao: 'Data e hora da última verificação de disponibilidade' },
  ]

  const colunasLogs: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'timestamp', label: t('admin.cockpit.tabela.data_hora'), tipo: 'texto',
      tooltipTitulo: 'Data e Hora', tooltipDescricao: 'Momento exato em que a requisição foi registrada' },
    { key: 'method', label: t('admin.cockpit.tabela.metodo'), tipo: 'texto',
      tooltipTitulo: 'Método', tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE',
      render: (val) => <strong style={{ color: 'var(--brand-primary)' }}>{val as string}</strong> },
    { key: 'path', label: t('admin.cockpit.tabela.endpoint'), tipo: 'texto',
      tooltipTitulo: 'Endpoint', tooltipDescricao: 'Rota da API que recebeu a requisição' },
    { key: 'statusCode', label: t('admin.cockpit.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso',
      render: (val) => (
      <span style={{ color: (val as number) < 400 ? '#10b981' : '#ef4444' }}>{val as number}</span>
    )},
    { key: 'organizacao', label: t('admin.cockpit.tabela.organizacao'), tipo: 'texto',
      tooltipTitulo: 'Organização', tooltipDescricao: 'Empresa que originou esta requisição à API' },
    { key: 'produto', label: t('admin.cockpit.tabela.produto'), tipo: 'texto',
      tooltipTitulo: 'Produto', tooltipDescricao: 'Módulo ou produto que realizou a chamada' },
    { key: 'duracao', label: t('admin.cockpit.tabela.duracao'), tipo: 'texto',
      tooltipTitulo: 'Duração', tooltipDescricao: 'Tempo total de processamento da requisição em milissegundos' },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          titulo={t('admin.cockpit.titulo')}
          subtitulo={t('admin.cockpit.subtitulo')}
          icone={<Pulse size={32} weight="duotone" />}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <CardEstatisticaGlobal titulo={t('admin.cockpit.status_geral')} valor={t('admin.cockpit.operacional')} variante="sucesso" />
          <CardEstatisticaGlobal titulo={t('admin.cockpit.uptime_24h')} valor="100%" variante="primario" />
          <CardEstatisticaGlobal titulo={t('admin.cockpit.latencia_media')} valor="24ms" variante="padrao" />
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
            <Monitor size={20} /> {t('admin.cockpit.aba_inventario')}
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
            <TerminalWindow size={20} /> {t('admin.cockpit.aba_logs')}
          </button>
        </div>

        {/* Content */}
        <div style={{ background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          {abaAtiva === 'geral' ? (
            <TabelaGlobal 
              id="cockpit-services"
              colunas={colunasServicos}
              dados={servicos}
              mensagemVazio={t('admin.cockpit.vazio.sem_servicos')}
            />
          ) : (
            <TabelaGlobal 
              id="cockpit-logs"
              colunas={colunasLogs}
              dados={logs}
              mensagemVazio={t('admin.cockpit.vazio.sem_requisicoes')}
            />
          )}
        </div>
      </div>
    </PaginaGlobal>
  )
}
