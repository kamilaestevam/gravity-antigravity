import React, { useState } from 'react'
import { PlugsConnected, Key, Copy, CheckCircle, Database, Trash, Target, Plugs, ShieldCheck, Pulse, Sparkle, Warning, Wrench, Code } from '@phosphor-icons/react'
import { Conectores } from './Conectores'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { DocPortal } from './DocPortal'
import { mockProdutos } from './Assinaturas'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


type ApiStatus = 'Online' | 'Offline' | 'Degradado'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type LogStatus = 'SUCESSO' | 'ERRO_CLIENTE' | 'ERRO_SERVIDOR'

// ─── Serviços (Visão Geral) ────────────────────────────────────────────────

type ApiService = {
  id: string
  produto: string
  organizacao: string
  baseUrl: string
  status: ApiStatus
  tipoCobranca: 'Processo' | 'Documento' | 'Requisição' | 'Fixo'
  consumoAtual: number
  consumoLimite: number | null
}

const services: ApiService[] = [
  { id: 's1', produto: 'Dashboard Global',     organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/dashboard/v1',   status: 'Online',    tipoCobranca: 'Fixo',       consumoAtual: 0,    consumoLimite: null },
  { id: 's2', produto: 'Gestão de Atividades', organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/atividades/v2', status: 'Online',    tipoCobranca: 'Processo',   consumoAtual: 1450, consumoLimite: 5000 },
  { id: 's3', produto: 'SimulaCusto',          organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/sim-custo/v1',  status: 'Online',    tipoCobranca: 'Documento',  consumoAtual: 850,  consumoLimite: 1000 },
  { id: 's4', produto: 'Gabi IA Assistant',    organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/gabi/v1',      status: 'Degradado', tipoCobranca: 'Requisição', consumoAtual: 9800, consumoLimite: 10000 },
  { id: 's5', produto: 'WhatsApp Business',    organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/whatsapp/v1',  status: 'Offline',   tipoCobranca: 'Fixo',       consumoAtual: 0,    consumoLimite: null },
]

const statusBadge: Record<ApiStatus, string> = {
  Online:   'ws-badge-success',
  Offline:  'ws-badge-danger',
  Degradado:'ws-badge-warning',
}

// ─── Logs de Tráfego ──────────────────────────────────────────────────────

interface ApiLog {
  id: string
  data: string
  hora: string
  organizacao: string
  api: string
  metodo: HttpMethod
  endpoint: string
  statusCode: number
  status: LogStatus
  duracao: string
  erroLog?: string
  aiAnalise?: {
    erroResumo: string
    motivo: string
    sugestaoCorrecao: string
    arquivo: string
    codigoDiff?: { old: string; new: string }
  }
}

// Logs filtrados por tenant (apenas da org atual — na implementação real: WHERE tenant_id = jwt.tenant_id)
const LOGS_MOCK: ApiLog[] = [
  {
    id: 'req1', data: '24/03/2026', hora: '21:55:12', organizacao: 'Importas SA', api: 'SimulaCusto', metodo: 'POST', endpoint: '/v1/simulacoes', statusCode: 201, status: 'SUCESSO', duracao: '124ms'
  },
  {
    id: 'req2', data: '24/03/2026', hora: '21:30:10', organizacao: 'Importas SA', api: 'Gestão de Atividades', metodo: 'PUT', endpoint: '/v2/tarefas/8812', statusCode: 400, status: 'ERRO_CLIENTE', duracao: '15ms',
    erroLog: 'Validation Error: "prazo" must be a valid ISO-8601 date string.',
    aiAnalise: {
      erroResumo: 'Validação de Data Falhou no Payload',
      motivo: 'O cliente está enviando o campo de data no formato DD/MM/YYYY em vez de YYYY-MM-DD (ISO-8601). O middleware Zod recusa a requisição.',
      sugestaoCorrecao: 'Podemos aprimorar a UX criando um parser flexível no Zod que aceite DD/MM/YYYY e converta automaticamente para ISO-8601 antes de persistir.',
      arquivo: 'servicos/atividades/validators/update_task.ts',
      codigoDiff: {
        old: "prazo: z.string().datetime()",
        new: "prazo: z.string().transform((val) => {\n  const date = parseDateBrToIso(val);\n  return date ?? val;\n}).pipe(z.string().datetime())"
      }
    }
  },
  {
    id: 'req3', data: '24/03/2026', hora: '21:10:05', organizacao: 'Importas SA', api: 'SimulaCusto', metodo: 'GET', endpoint: '/v1/simulacoes', statusCode: 200, status: 'SUCESSO', duracao: '88ms'
  },
]

// ─── Outros mocks ─────────────────────────────────────────────────────────

const curlExample = `curl -X GET \\
  https://api.gravity.com.br/sim-custo/v1/simulacoes \\
  -H "Authorization: Bearer gv_live_sk_xxxx" \\
  -H "Content-Type: application/json"`

type Token = {
  id: string
  nome: string
  produto: string
  ambiente: 'Live' | 'Sandbox'
  criadoEm: string
  ultimoUso: string
}
const mockTokens: Token[] = [
  { id: 'tk1', nome: 'Integração SAP', produto: 'SimulaCusto', ambiente: 'Live', criadoEm: '10/03/2026', ultimoUso: 'Hoje' },
  { id: 'tk2', nome: 'Testes Locais', produto: 'Dashboard Global', ambiente: 'Sandbox', criadoEm: '20/03/2026', ultimoUso: 'Ontem' },
]

type Webhook = {
  id: string
  url: string
  eventos: number
  status: 'Ativo' | 'Falhando'
}
const mockWebhooks: Webhook[] = [
  { id: 'wh1', url: 'https://api.empresa.com.br/hooks/simulacusto', eventos: 3, status: 'Ativo' },
  { id: 'wh2', url: 'https://erp.empresa.com.br/gravity-sync', eventos: 1, status: 'Falhando' },
]

// ─── Componente Principal ─────────────────────────────────────────────────

export function ApiCockpit() {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'visao_geral' | 'trafego' | 'tokens' | 'webhooks' | 'docs' | 'conectores'>('visao_geral')
  const [loadingCode, setLoadingCode] = useState<string | null>(null)
  const [logs, setLogs] = useState<ApiLog[]>(LOGS_MOCK)

  function handleCopy() {
    navigator.clipboard.writeText(curlExample).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const aplicarCorrecaoIA = (id: string) => {
    setLoadingCode(id)
    setTimeout(() => {
      setLogs(prev => prev.map(t => t.id === id ? { ...t, statusCode: 200, status: 'SUCESSO', erroLog: undefined, aiAnalise: undefined } : t))
      setLoadingCode(null)
    }, 1500)
  }

  // ─── Colunas: Visão Geral ───────────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<ApiService>[] = [
    {
      key: 'produto', label: 'Produto', tipo: 'texto',
      render: (v) => <span style={{ fontWeight: 600 }}>{v as string}</span>
    },
    {
      key: 'organizacao', label: 'Organização', tipo: 'texto',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', color: '#a78bfa', fontWeight: 600 }}>
          {v as string}
        </span>
      )
    },
    {
      key: 'baseUrl', label: 'Base URL', tipo: 'texto',
      render: (v) => (
        <code style={{
          fontSize: '0.78125rem', color: '#818cf8',
          background: 'rgba(129,140,248,0.07)',
          padding: '0.2rem 0.5rem', borderRadius: '5px',
          display: 'block', maxWidth: '320px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {v as string}
        </code>
      )
    },
    {
      key: 'consumoAtual', label: 'Volume Consumido', tipo: 'periodo',
      render: (_, item) => {
        if (item.tipoCobranca === 'Fixo') return <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>Ilimitado (Fixo)</span>

        const perc = item.consumoLimite ? Math.round((item.consumoAtual / item.consumoLimite) * 100) : 0
        const color = perc > 90 ? '#f87171' : perc > 75 ? '#fbbf24' : '#34d399'
        const sigla = item.tipoCobranca === 'Processo' ? 'procs' : item.tipoCobranca === 'Documento' ? 'docs' : 'reqs'

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{item.consumoAtual.toLocaleString('pt-BR')}</span>
              <span style={{ color: 'var(--ws-muted)' }}>/ {item.consumoLimite?.toLocaleString('pt-BR')} {sigla}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(perc, 100)}%`, background: color }} />
            </div>
          </div>
        )
      }
    },
    {
      key: 'status', label: 'Status da API', tipo: 'texto',
      render: (v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: item.status === 'Online' ? '#34d399' : item.status === 'Offline' ? '#f87171' : '#fbbf24',
            display: 'inline-block',
            boxShadow: `0 0 6px ${item.status === 'Online' ? '#34d39966' : item.status === 'Offline' ? '#f8717166' : '#fbbf2466'}`,
          }} />
          <span className={`ws-badge ${statusBadge[item.status]}`}>{item.status}</span>
        </div>
      )
    },
    {
      key: 'id', label: 'Ações', tipo: 'texto',
      render: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <BotaoGlobal
            variante="fantasma"
            tamanho="pequeno"
            icone={<Pulse weight="bold" size={13} />}
            onClick={() => setTab('trafego')}
          >
            Ver Logs
          </BotaoGlobal>
        </div>
      )
    }
  ]

  // ─── Colunas: Tráfego & Logs ───────────────────────────────────────────

  const COLUNAS_LOGS: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'data', label: 'DATA', tipo: 'texto', tooltipTitulo: 'Data da Requisição', tooltipDescricao: 'Extraída do payload da requisição no gateway.' },
    { key: 'hora', label: 'HORA', tipo: 'texto', tooltipTitulo: 'Hora do Servidor', tooltipDescricao: 'Timestamp GMT e timezone convertido para local.' },
    {
      key: 'organizacao', label: 'ORGANIZAÇÃO', tipo: 'texto', tooltipTitulo: 'Organização', tooltipDescricao: 'Tenant proprietário da integração (sempre a sua organização nesta visão).',
      render: (v) => <span style={{ fontSize: '0.8125rem', color: '#a78bfa', fontWeight: 600 }}>{v as string}</span>
    },
    { key: 'api', label: 'API / SERVIÇO', tipo: 'texto', tooltipTitulo: 'Serviço de Destino', tooltipDescricao: 'Módulo ou microserviço acessado.', render: (v) => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v as string}</span> },
    {
      key: 'metodo', label: 'MÉTODO', tipo: 'texto', tooltipTitulo: 'Método HTTP', tooltipDescricao: 'Verbo padronizado pela RFC do protocolo HTTP.',
      render: (v: HttpMethod) => (
        <span style={{
          fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em',
          color: v === 'GET' ? '#38bdf8' : v === 'POST' ? '#34d399' : v === 'PUT' ? '#fbbf24' : '#f87171'
        }}>{v}</span>
      )
    },
    {
      key: 'endpoint', label: 'ENDPOINT', tipo: 'texto', tooltipTitulo: 'Endpoint', tooltipDescricao: 'Caminho exato do recurso solicitado (URI).',
      render: (v) => (
        <TooltipGlobal titulo="URI do Recurso" descricao="Caminho relativo do endpoint requisitado pelo cliente.">
          <code style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{v as string}</code>
        </TooltipGlobal>
      )
    },
    {
      key: 'statusCode', label: 'STATUS', tipo: 'texto', tooltipTitulo: 'Status Code', tooltipDescricao: 'Código indicando aceitação (200) ou tipo de erro (4xx/5xx).',
      render: (v: number) => {
        const pass = v < 400
        const isServerErr = v >= 500
        return (
          <TooltipGlobal titulo="HTTP Status Code" descricao="Código RFC de resposta. Valores 4xx indicam erro do cliente; 5xx erro no servidor.">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
              background: pass ? 'rgba(16, 185, 129, 0.15)' : isServerErr ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: pass ? '#10b981' : isServerErr ? '#ef4444' : '#f59e0b',
              fontSize: '0.75rem', fontWeight: 700
            }}>
              {v} {pass ? 'OK' : 'ERR'}
            </span>
          </TooltipGlobal>
        )
      }
    },
    {
      key: 'duracao', label: 'LATÊNCIA', tipo: 'texto', tooltipTitulo: 'Tempo de Resposta', tooltipDescricao: 'Tempo total de processamento de ponta-a-ponta.',
      render: (v) => (
        <TooltipGlobal titulo="Time-To-First-Byte (TTFB)" descricao="Tempo total de processamento no gateway antes do primeiro byte da resposta.">
          <span style={{ color: '#cbd5e1' }}>{v as string}</span>
        </TooltipGlobal>
      )
    },
  ]

  // ─── Camada expandida com análise Gabi IA ─────────────────────────────

  const renderExpandido = (item: ApiLog) => {
    if (item.status === 'SUCESSO') return (
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', margin: '0.5rem 1rem' }}>
        <CheckCircle size={20} weight="fill" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Requisição concluída sem erros em {item.duracao}.</span>
      </div>
    )

    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {item.erroLog && (
          <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
              <Warning size={16} color="#ef4444" weight="bold" />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171' }}>Payload / Erro Bruto</span>
            </div>
            <div style={{ padding: '1rem' }}>
              <code style={{ color: '#fca5a5', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {item.erroLog}
              </code>
            </div>
          </div>
        )}

        {item.aiAnalise && (
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '150%', height: '100%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.2)', color: '#c084fc', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}>
                  <Sparkle size={18} weight="fill" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Análise Especialista Gabi IA</h4>
                  <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: 0 }}>Diagnóstico de erro de integração API</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button" onClick={() => aplicarCorrecaoIA(item.id)} disabled={loadingCode === item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', color: '#fff',
                    fontSize: '0.8125rem', fontWeight: 700, cursor: loadingCode === item.id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)', opacity: loadingCode === item.id ? 0.7 : 1
                  }}
                  onMouseEnter={e => { if (loadingCode !== item.id) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)' }}
                  onMouseLeave={e => { if (loadingCode !== item.id) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)' }}
                >
                  {loadingCode === item.id ? <>Modificando código...</> : <><Wrench size={16} weight="fill" /> Corrigir Bug (1 Clique)</>}
                </button>
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0',
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                >
                  <Code size={16} /> Ver no Editor
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(350px, 1.5fr)', gap: '1rem', padding: '1.25rem', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>O que o erro significa</span>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{item.aiAnalise.erroResumo}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>Causa Raiz</span>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{item.aiAnalise.motivo}</p>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>Local do Erro</span>
                  <code style={{ display: 'inline-block', padding: '0.3rem 0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                    {item.aiAnalise.arquivo}
                  </code>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>Estratégia de Resolução</span>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>{item.aiAnalise.sugestaoCorrecao}</p>
                </div>
                {item.aiAnalise.codigoDiff && (
                  <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ opacity: 0.5, userSelect: 'none', lineHeight: 1.5 }}>-</span>
                      <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{item.aiAnalise.codigoDiff.old}</span>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ opacity: 0.5, userSelect: 'none', lineHeight: 1.5 }}>+</span>
                      <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{item.aiAnalise.codigoDiff.new}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Colunas: Tokens ──────────────────────────────────────────────────

  const COLUNAS_TOKENS: TabelaGlobalColuna<Token>[] = [
    { key: 'nome', label: 'Nome', tipo: 'texto', render: (v) => <span style={{ fontWeight: 600 }}>{v as string}</span> },
    { key: 'produto', label: 'Produto', tipo: 'texto' },
    { key: 'ambiente', label: 'Ambiente', tipo: 'texto', render: (v) => <span className={`ws-badge ${v === 'Live' ? 'ws-badge-success' : 'ws-badge-warning'}`}>{v as string}</span> },
    { key: 'criadoEm', label: 'Criado em', tipo: 'texto' },
    { key: 'ultimoUso', label: 'Último Uso', tipo: 'texto' },
    { key: 'id', label: 'Ações', tipo: 'texto', render: () => <BotaoGlobal variante="perigo" tamanho="pequeno" icone={<Trash weight="bold" size={13} />}>Revogar</BotaoGlobal> }
  ]

  // ─── Colunas: Webhooks ────────────────────────────────────────────────

  const COLUNAS_WEBHOOKS: TabelaGlobalColuna<Webhook>[] = [
    { key: 'url', label: 'URL de Destino', tipo: 'texto', render: (v) => <code style={{ color: '#818cf8', fontSize: '13px' }}>{v as string}</code> },
    { key: 'eventos', label: 'Qtd Eventos', tipo: 'texto' },
    { key: 'status', label: 'Status', tipo: 'texto', render: (v) => <span className={`ws-badge ${v === 'Ativo' ? 'ws-badge-success' : 'ws-badge-danger'}`}>{v as string}</span> },
    { key: 'id', label: 'Ações', tipo: 'texto', render: () => <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Target weight="bold" size={13} />}>Testar</BotaoGlobal> }
  ]

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} color="#818cf8" />}
          titulo="API Cockpit"
          subtitulo="Central consolidada de todas as suas APIs Gravity com status e tráfego em tempo real"
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="APIs Online"
            valor={services.filter(s => s.status === 'Online').length}
            subtexto={`de ${services.length} serviços`}
            variante="sucesso"
          />
          <StatCardGlobal
            titulo="APIs com Problema"
            valor={services.filter(s => s.status !== 'Online').length}
            variante={services.filter(s => s.status !== 'Online').length ? 'perigo' : 'padrao'}
          />
          <StatCardGlobal
            titulo="Alertas de Consumo"
            valor={services.filter(s => s.consumoLimite && (s.consumoAtual / s.consumoLimite) > 0.85).length}
            subtexto="Serviços com >85% de uso"
            variante={services.filter(s => s.consumoLimite && (s.consumoAtual / s.consumoLimite) > 0.85).length > 0 ? 'perigo' : 'sucesso'}
          />
          <StatCardGlobal
            titulo="Requisições Hoje"
            valor={logs.length}
            subtexto="da sua organização"
            variante="primario"
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'visao_geral' ? ' active' : ''}`} onClick={() => setTab('visao_geral')}>
            Visão Geral
          </button>
          <button className={`ws-tab${tab === 'trafego' ? ' active' : ''}`} onClick={() => setTab('trafego')}>
            Tráfego & Logs
          </button>
          <button className={`ws-tab${tab === 'tokens' ? ' active' : ''}`} onClick={() => setTab('tokens')}>
            Tokens de Acesso
          </button>
          <button className={`ws-tab${tab === 'webhooks' ? ' active' : ''}`} onClick={() => setTab('webhooks')}>
            Webhooks & Eventos
          </button>
          <button className={`ws-tab${tab === 'docs' ? ' active' : ''}`} onClick={() => setTab('docs')}>
            Documentação & Playground
          </button>
          <button className={`ws-tab${tab === 'conectores' ? ' active' : ''}`} onClick={() => setTab('conectores')}>
            Conectores (ERP/SAP)
          </button>
        </div>
      }
    >
      {/* ── Visão Geral ── */}
      {tab === 'visao_geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div className="ws-fade-up ws-fade-up-d2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="ws-section-title" style={{ margin: 0 }}>
                <PlugsConnected weight="duotone" size={14} color="#818cf8" />
                Status dos Serviços
              </p>
            </div>
            <div className="ws-fade-up ws-fade-up-d2" style={{ position: 'relative', zIndex: 10 }}>
              <TabelaGlobal<ApiService>
                dados={services}
                colunas={COLUNAS}
                mensagemVazio="Nenhum serviço encontrado."
                mensagemSemFiltro="Nenhum serviço disponível no momento."
                tooltipBusca="Localizar serviço por nome do produto ou status operacional"
                acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
              />
            </div>
          </div>

          {/* Como usar */}
          <div>
            <p className="ws-section-title ws-fade-up ws-fade-up-d3">
              Como usar a API Gravity
            </p>
            <div className="ws-fade-up ws-fade-up-d3" style={{
              background: 'var(--ws-surface)',
              border: '1px solid var(--ws-accent-border)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid rgba(129,140,248,0.08)',
                background: 'rgba(129,140,248,0.04)',
              }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ws-muted)' }}>
                  cURL — Exemplo de requisição autenticada
                </span>
                <BotaoGlobal
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={handleCopy}
                  style={{ gap: '0.375rem' }}
                >
                  {copied
                    ? <><CheckCircle weight="fill" size={13} color="#34d399" /> Copiado!</>
                    : <><Copy weight="bold" size={13} /> Copiar</>
                  }
                </BotaoGlobal>
              </div>
              <pre className="ws-code-block" style={{ borderRadius: 0, border: 'none', margin: 0 }}>
                {curlExample}
              </pre>
            </div>

            <div className="ws-fade-up ws-fade-up-d4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { title: 'API Key', desc: 'Inclua o token no header Authorization: Bearer <token>. Tokens são gerados por produto e têm escopos específicos.' },
                { title: 'Rate Limits', desc: 'Plano Enterprise: 10.000 req/hora por serviço. Erros 429 indicam throttling — retry com backoff exponencial.' },
                { title: 'Ambientes', desc: 'Prefixo gv_live_sk_ para produção e gv_test_sk_ para sandbox. Todos os endpoints aceitam ambos os prefixos.' },
              ].map(card => (
                <div key={card.title} style={{
                  background: 'rgba(129,140,248,0.04)',
                  border: '1px solid rgba(129,140,248,0.1)',
                  borderRadius: '10px',
                  padding: '1rem 1.125rem',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#818cf8', marginBottom: '0.375rem' }}>{card.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tráfego & Logs ── */}
      {tab === 'trafego' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Pulse weight="duotone" size={14} color="#818cf8" />
              Tráfego & Logs — Importas SA
            </p>
          </div>
          <TabelaGlobal<ApiLog>
            dados={logs}
            colunas={COLUNAS_LOGS}
            idKey="id"
            renderExpandido={renderExpandido}
            mensagemVazio="Nenhuma requisição na base de logs."
            mensagemSemFiltro="Os logs de API estão vazios."
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_LOGS, 'dados_tabela', 'Exportação de Dados')}
          />
        </div>
      )}

      {/* ── Tokens ── */}
      {tab === 'tokens' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Key weight="duotone" size={14} color="#818cf8" /> Tokens de Acesso
            </p>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Key weight="bold" size={14} />}>Novo Token</BotaoGlobal>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<Token>
              dados={mockTokens}
              colunas={COLUNAS_TOKENS}
              mensagemVazio="Nenhum token encontrado."
              mensagemSemFiltro="Nenhum token criado ainda."
              tooltipBusca="Localizar token por nome ou produto vinculado"
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_TOKENS, 'dados_tabela', 'Exportação de Dados')}
            />
          </div>
        </div>
      )}

      {/* ── Webhooks ── */}
      {tab === 'webhooks' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <PlugsConnected weight="duotone" size={14} color="#818cf8" /> Webhooks & Eventos
            </p>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<PlugsConnected weight="bold" size={14} />}>Adicionar Webhook</BotaoGlobal>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<Webhook>
              dados={mockWebhooks}
              colunas={COLUNAS_WEBHOOKS}
              mensagemVazio="Nenhum webhook encontrado."
              mensagemSemFiltro="Nenhum webhook configurado."
              tooltipBusca="Localizar webhook pela URL de destino"
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_WEBHOOKS, 'dados_tabela', 'Exportação de Dados')}
            />
          </div>
        </div>
      )}

      {/* ── Docs ── */}
      {tab === 'docs' && (
        <div className="ws-fade-up">
          <DocPortal produtosAssinados={mockProdutos} />
        </div>
      )}

      {/* ── Conectores ── */}
      {tab === 'conectores' && <Conectores />}
    </PaginaGlobal>
  )
}
