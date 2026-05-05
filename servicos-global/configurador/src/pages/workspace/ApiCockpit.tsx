import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import {
  CheckCircle,
  WarningCircle,
  Monitor,
  Pulse,
  TerminalWindow,
  Key,
  WebhooksLogo,
  ChartLineUp,
  CaretRight,
} from '@phosphor-icons/react'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const servicoPlataformaSchema = z.object({
  nome_servico_plataforma:              z.string(),
  status_servico_plataforma:            z.enum(['ONLINE', 'DEGRADADO', 'OFFLINE']),
  latencia_ms_servico_plataforma:       z.number(),
  versao_servico_plataforma:            z.string(),
  data_ultimo_check_servico_plataforma: z.string(),
  tipo_servico_plataforma:              z.enum(['NUCLEO', 'PRODUTO_GRAVITY', 'GATEWAY']),
})

const servicosResponseSchema = z.object({
  servicos: z.array(servicoPlataformaSchema),
  error:    z.string().optional(),
})

const logConsumoSchema = z.object({
  id_log_consumo:                   z.string(),
  id_organizacao:                   z.string(),
  id_produto_gravity:               z.string(),
  id_usuario:                       z.string().nullable(),
  id_correlacao:                    z.string().nullable(),
  endpoint_log_consumo:             z.string(),
  metodo_http_log_consumo:          z.string(),
  codigo_resposta_http_log_consumo: z.number(),
  latencia_ms_log_consumo:          z.number(),
  data_criacao_log_consumo:         z.string(),
  data_log_consumo:                 z.string(),
  hora_log_consumo:                 z.string(),
  resultado_log_consumo:            z.enum(['SUCESSO', 'ERRO_CLIENTE', 'ERRO_SERVIDOR']),
})

const logsResponseSchema = z.object({
  logs: z.array(logConsumoSchema),
  paginacao: z.object({
    pagina:  z.number(),
    limite:  z.number(),
    total:   z.number(),
    paginas: z.number(),
  }),
  error: z.string().optional(),
})

const estatisticasLogConsumoSchema = z.object({
  quantidade_requisicoes_log_consumo: z.number(),
  quantidade_erros_log_consumo:       z.number(),
  latencia_media_log_consumo:         z.number(),
  percentual_uptime_log_consumo:      z.number(),
  por_id_produto_gravity:             z.record(z.number()),
  por_faixa_codigo_resposta_http:     z.record(z.number()),
})

type ServicoPlataforma = z.infer<typeof servicoPlataformaSchema>
type LogConsumo = z.infer<typeof logConsumoSchema>
type EstatisticasLogConsumo = z.infer<typeof estatisticasLogConsumoSchema>

export function ApiCockpit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [servicos, setServicos] = useState<ServicoPlataforma[]>([])
  const [logs, setLogs] = useState<LogConsumo[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasLogConsumo | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'logs' | 'config'>('geral')
  const [, setLoading] = useState(true)

  useEffect(() => {
    const carregarCockpit = async () => {
      setLoading(true)
      try {
        const [svcRes, logsRes, statsRes] = await Promise.all([
          requisicaoAutenticada('/api/v1/api-cockpit/saude-servicos'),
          requisicaoAutenticada('/api/v1/api-cockpit/log-consumo?limite=50'),
          requisicaoAutenticada('/api/v1/api-cockpit/log-consumo/estatisticas'),
        ])

        if (svcRes.ok) {
          const svcRaw = await svcRes.json()
          const svcData = servicosResponseSchema.safeParse(svcRaw)
          if (svcData.success) {
            setServicos(svcData.data.servicos)
          } else {
            console.warn('[ApiCockpit] /saude-servicos payload invalido', svcData.error)
          }
        }

        if (logsRes.ok) {
          const logsRaw = await logsRes.json()
          const logsData = logsResponseSchema.safeParse(logsRaw)
          if (logsData.success) {
            setLogs(logsData.data.logs)
          } else {
            console.warn('[ApiCockpit] /log-consumo payload invalido', logsData.error)
          }
        }

        if (statsRes.ok) {
          const statsRaw = await statsRes.json()
          const statsData = estatisticasLogConsumoSchema.safeParse(statsRaw)
          if (statsData.success) {
            setEstatisticas(statsData.data)
          } else {
            console.warn('[ApiCockpit] /log-consumo/estatisticas payload invalido', statsData.error)
          }
        }
      } catch (err) {
        console.warn('[ApiCockpit] falha ao carregar cockpit', err)
      } finally {
        setLoading(false)
      }
    }
    carregarCockpit()
  }, [])

  // ─── Derivados dos cards ─────────────────────────────────────────────
  const servicosOnline   = servicos.filter((s) => s.status_servico_plataforma === 'ONLINE').length
  const servicosOffline  = servicos.filter((s) => s.status_servico_plataforma === 'OFFLINE').length
  const statusGeral      = servicos.length === 0
    ? 'Indisponível'
    : servicosOffline === 0
      ? 'Operacional'
      : servicosOffline === servicos.length
        ? 'Crítico'
        : 'Degradado'
  const uptimePercent    = estatisticas ? `${estatisticas.percentual_uptime_log_consumo.toFixed(1)}%` : '—'
  const latenciaMediaMs  = estatisticas ? `${estatisticas.latencia_media_log_consumo}ms` : '—'
  const apisOnlineLabel  = `${servicosOnline}/${servicos.length || 0}`
  const requisicoes24h   = estatisticas ? String(estatisticas.quantidade_requisicoes_log_consumo) : '—'
  const statusVariante: 'sucesso' | 'aviso' | 'perigo' | 'padrao' =
    statusGeral === 'Operacional' ? 'sucesso'
    : statusGeral === 'Degradado' ? 'aviso'
    : statusGeral === 'Crítico'   ? 'perigo'
    : 'padrao'

  const colunasServicos: TabelaGlobalColuna<ServicoPlataforma>[] = [
    {
      key: 'nome_servico_plataforma',
      label: t('admin.cockpit.tabela.servico'),
      tipo: 'texto',
      tooltipTitulo: 'Serviço',
      tooltipDescricao: 'Nome do serviço ou integração monitorada pela plataforma',
    },
    {
      key: 'tipo_servico_plataforma',
      label: t('admin.cockpit.tabela.tipo'),
      tipo: 'texto',
      tooltipTitulo: 'Tipo',
      tooltipDescricao: 'Categoria do serviço: núcleo, produto Gravity ou gateway',
      render: (val) => <span style={{ textTransform: 'capitalize' }}>{(val as string).toLowerCase().replace('_', ' ')}</span>,
    },
    {
      key: 'status_servico_plataforma',
      label: t('admin.cockpit.tabela.status'),
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Indica se o serviço está respondendo normalmente',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: val === 'ONLINE' ? '#10b981' : '#f59e0b' }}>
          {val === 'ONLINE' ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} weight="fill" />}
          {val as string}
        </div>
      ),
    },
    {
      key: 'latencia_ms_servico_plataforma',
      label: t('admin.cockpit.tabela.latencia'),
      tipo: 'texto',
      tooltipTitulo: 'Latência',
      tooltipDescricao: 'Tempo médio de resposta do serviço na última verificação',
      render: (val) => `${val as number}ms`,
    },
    {
      key: 'versao_servico_plataforma',
      label: t('admin.cockpit.tabela.versao'),
      tipo: 'texto',
      tooltipTitulo: 'Versão',
      tooltipDescricao: 'Versão da API ou serviço atualmente em execução',
    },
    {
      key: 'data_ultimo_check_servico_plataforma',
      label: t('admin.cockpit.tabela.ultimo_check'),
      tipo: 'texto',
      tooltipTitulo: 'Último Check',
      tooltipDescricao: 'Data e hora da última verificação de disponibilidade',
    },
  ]

  const colunasLogs: TabelaGlobalColuna<LogConsumo>[] = [
    {
      key: 'data_criacao_log_consumo',
      label: t('admin.cockpit.tabela.data_hora'),
      tipo: 'texto',
      tooltipTitulo: 'Data e Hora',
      tooltipDescricao: 'Momento exato em que a requisição foi registrada',
      render: (_val, row) => `${row.data_log_consumo} ${row.hora_log_consumo}`,
    },
    {
      key: 'metodo_http_log_consumo',
      label: t('admin.cockpit.tabela.metodo'),
      tipo: 'texto',
      tooltipTitulo: 'Método',
      tooltipDescricao: 'Verbo HTTP da requisição: GET, POST, PUT ou DELETE',
      render: (val) => <strong style={{ color: 'var(--brand-primary)' }}>{val as string}</strong>,
    },
    {
      key: 'endpoint_log_consumo',
      label: t('admin.cockpit.tabela.endpoint'),
      tipo: 'texto',
      tooltipTitulo: 'Endpoint',
      tooltipDescricao: 'Rota da API que recebeu a requisição',
    },
    {
      key: 'codigo_resposta_http_log_consumo',
      label: t('admin.cockpit.tabela.status'),
      tipo: 'texto',
      tooltipTitulo: 'Status',
      tooltipDescricao: 'Código de resposta HTTP — abaixo de 400 indica sucesso',
      render: (val) => (
        <span style={{ color: (val as number) < 400 ? '#10b981' : '#ef4444' }}>{val as number}</span>
      ),
    },
    {
      key: 'id_organizacao',
      label: t('admin.cockpit.tabela.organizacao'),
      tipo: 'texto',
      tooltipTitulo: 'Organização',
      tooltipDescricao: 'Empresa que originou esta requisição à API',
    },
    {
      key: 'id_produto_gravity',
      label: t('admin.cockpit.tabela.produto'),
      tipo: 'texto',
      tooltipTitulo: 'Produto',
      tooltipDescricao: 'Produto Gravity que realizou a chamada',
    },
    {
      key: 'latencia_ms_log_consumo',
      label: t('admin.cockpit.tabela.duracao'),
      tipo: 'texto',
      tooltipTitulo: 'Duração',
      tooltipDescricao: 'Tempo total de processamento da requisição em milissegundos',
      render: (val) => `${val as number}ms`,
    },
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
        {/* KPI Row — 5 cards dinamicos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <CardEstatisticaGlobal titulo={t('admin.cockpit.status_geral')}    valor={statusGeral}      variante={statusVariante} />
          <CardEstatisticaGlobal titulo={t('admin.cockpit.uptime_24h')}      valor={uptimePercent}    variante="primario" />
          <CardEstatisticaGlobal titulo={t('admin.cockpit.latencia_media')}  valor={latenciaMediaMs}  variante="padrao" />
          <CardEstatisticaGlobal titulo={t('admin.cockpit.apis_online')}     valor={apisOnlineLabel}  variante="sucesso" />
          <CardEstatisticaGlobal titulo={t('admin.cockpit.requisicoes_24h')} valor={requisicoes24h}   variante="primario" />
        </div>

        {/* Sub-paginas — navegacao */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <button
            onClick={() => navigate('/workspace/api-cockpit/tokens')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem', borderRadius: '12px',
              background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', cursor: 'pointer',
              fontSize: '0.875rem', textAlign: 'left',
            }}
            aria-label="Acessar tokens de API"
          >
            <Key size={20} weight="duotone" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Tokens de API</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gerar e revogar tokens</div>
            </div>
            <CaretRight size={16} />
          </button>
          <button
            onClick={() => navigate('/workspace/api-cockpit/webhooks')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem', borderRadius: '12px',
              background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', cursor: 'pointer',
              fontSize: '0.875rem', textAlign: 'left',
            }}
            aria-label="Acessar webhooks"
          >
            <WebhooksLogo size={20} weight="duotone" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Webhooks</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Notificacoes em tempo real</div>
            </div>
            <CaretRight size={16} />
          </button>
          <button
            onClick={() => navigate('/workspace/api-cockpit/consumo')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.25rem', borderRadius: '12px',
              background: 'var(--ws-bg-card, rgba(30, 41, 59, 0.5))',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', cursor: 'pointer',
              fontSize: '0.875rem', textAlign: 'left',
            }}
            aria-label="Acessar consumo da API"
          >
            <ChartLineUp size={20} weight="duotone" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Consumo da API</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Logs detalhados de requisicoes</div>
            </div>
            <CaretRight size={16} />
          </button>
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
              gap: '0.5rem',
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
              gap: '0.5rem',
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
