import React, { useState } from 'react'
import { PlugsConnected, Sparkle, Warning, CheckCircle, Code, Wrench, EnvelopeSimple, WhatsappLogo, SlackLogo, Plus, Trash, Pulse, Funnel } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'

type ApiStatus = 'Online' | 'Offline' | 'Degradado'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type LogStatus = 'SUCESSO' | 'ERRO_CLIENTE' | 'ERRO_SERVIDOR'

// ─── Interfaces ───────────────────────────────────────────────────────────

interface ApiService {
  id: string
  produto: string
  organizacao: string
  baseUrl: string
  status: ApiStatus
  tipoCobranca: 'Processo' | 'Documento' | 'Requisição' | 'Fixo'
  consumoAtual: number
  consumoLimite: number | null
}

interface ApiLog {
  id: string
  data: string
  hora: string
  organizacao: string
  produto: string
  consumoAtual: number
  consumoLimite: number | null
  tipoCobranca: string
  api: string
  metodo: HttpMethod
  endpoint: string
  statusCode: number
  status: LogStatus
  duracao: string
  apiStatus: ApiStatus
  erroLog?: string
  aiAnalise?: {
    erroResumo: string
    motivo: string
    sugestaoCorrecao: string
    arquivo: string
    codigoDiff?: { old: string; new: string }
  }
}

interface AlertaConfig {
  id: string
  nome: string
  webhookUrl: string
  canais: ('E-mail' | 'WhatsApp' | 'Slack')[]
  gatilhos: string[]
  ativo: boolean
}

// ─── Mocks ───────────────────────────────────────────────────────────────

const SERVICES_MOCK: ApiService[] = [
  { id: 's1', produto: 'Dashboard Global',     organizacao: 'Importas SA',    baseUrl: 'https://api.gravity.com.br/dashboard/v1',   status: 'Online',    tipoCobranca: 'Fixo',       consumoAtual: 0,    consumoLimite: null },
  { id: 's2', produto: 'Gestão de Atividades', organizacao: 'LogTech Ltda',   baseUrl: 'https://api.gravity.com.br/atividades/v2', status: 'Online',    tipoCobranca: 'Processo',   consumoAtual: 1450, consumoLimite: 5000 },
  { id: 's3', produto: 'SimulaCusto',          organizacao: 'Frete Express',  baseUrl: 'https://api.gravity.com.br/sim-custo/v1',  status: 'Online',    tipoCobranca: 'Documento',  consumoAtual: 850,  consumoLimite: 1000 },
  { id: 's4', produto: 'Gabi IA Assistant',    organizacao: 'Importas SA',    baseUrl: 'https://api.gravity.com.br/gabi/v1',      status: 'Degradado', tipoCobranca: 'Requisição', consumoAtual: 9800, consumoLimite: 10000 },
]

const LOGS_MOCK: ApiLog[] = [
  {
    id: 'req1', data: '24/03/2026', hora: '21:55:12', organizacao: 'Importas SA', produto: 'SimulaCusto', consumoAtual: 850, consumoLimite: 1000, tipoCobranca: 'Documento', api: 'Cálculo Frete', metodo: 'POST', endpoint: '/v1/simulacoes', statusCode: 201, status: 'SUCESSO', duracao: '124ms', apiStatus: 'Online'
  },
  {
    id: 'req2', data: '24/03/2026', hora: '21:50:05', organizacao: 'LogTech Ltda', produto: 'Gabi IA Assistant', consumoAtual: 9800, consumoLimite: 10000, tipoCobranca: 'Requisição', api: 'Chat Engine', metodo: 'POST', endpoint: '/v1/chat', statusCode: 500, status: 'ERRO_SERVIDOR', duracao: '2041ms', apiStatus: 'Degradado',
    erroLog: 'Internal Server Error: Failed to fetch from Google Generative AI API. Quota exceeded or API key compromised.',
    aiAnalise: {
      erroResumo: 'Limite de Cota Excedida / Chave Bloqueada no Gemini',
      motivo: 'As requisições para a API do Google Generative AI estão falhando com status 429/500 devido ao estouro de cota no projeto GCP ou chave revogada por segurança.',
      sugestaoCorrecao: 'Configure um fallback automático para o provedor Claude/OpenAI em caso de falha do Gemini, e dispare um alerta financeiro para aumentar o limite do GCP imediatamente.',
      arquivo: 'servicos-global/gabi/chat_handler.ts',
      codigoDiff: {
        old: "const response = await gemini.generateContent(prompt);\nreturn res.send(response);",
        new: "try {\n  const response = await gemini.generateContent(prompt);\n  return res.send(response);\n} catch (e) {\n  if (e.status === 429 || e.status >= 500) {\n    const fallback = await claude.generateContent(prompt);\n    return res.send(fallback);\n  }\n  throw e;\n}"
      }
    }
  },
  {
    id: 'req3', data: '24/03/2026', hora: '21:45:00', organizacao: 'Frete Express', produto: 'Dashboard Global', consumoAtual: 0, consumoLimite: null, tipoCobranca: 'Fixo', api: 'Métricas Real-time', metodo: 'GET', endpoint: '/v1/metricas', statusCode: 200, status: 'SUCESSO', duracao: '45ms', apiStatus: 'Online'
  },
  {
    id: 'req4', data: '24/03/2026', hora: '21:30:10', organizacao: 'Importas SA', produto: 'Gestão de Atividades', consumoAtual: 1450, consumoLimite: 5000, tipoCobranca: 'Processo', api: 'Update Task', metodo: 'PUT', endpoint: '/v2/tarefas/8812', statusCode: 400, status: 'ERRO_CLIENTE', duracao: '15ms', apiStatus: 'Online',
    erroLog: 'Validation Error: "prazo" must be a valid ISO-8601 date string.',
    aiAnalise: {
      erroResumo: 'Validação de Data Falhou no Payload',
      motivo: 'O cliente está enviando o campo de data no formato DD/MM/YYYY em vez de YYYY-MM-DD (ISO-8601). O middleware Zod recusa a requisição.',
      sugestaoCorrecao: 'Embora o erro seja do cliente, podemos aprimorar a UX criando um parser flexível no Zod que aceite DD/MM/YYYY e converta automaticamente para ISO-8601 antes de persistir.',
      arquivo: 'servicos/atividades/validators/update_task.ts',
      codigoDiff: {
        old: "prazo: z.string().datetime()",
        new: "prazo: z.string().transform((val) => {\n  const date = parseDateBrToIso(val);\n  return date ?? val;\n}).pipe(z.string().datetime())"
      }
    }
  }
]

const ALERTAS_MOCK: AlertaConfig[] = [
  { id: 'al1', nome: 'DevOps Team', webhookUrl: 'devops@gravity.com.br', canais: ['E-mail', 'Slack'], gatilhos: ['Erros 5xx', 'Latência > 2s'], ativo: true },
  { id: 'al2', nome: 'Sustentação (SRE)', webhookUrl: '+5511999999999', canais: ['WhatsApp'], gatilhos: ['Erros 5xx Críticos'], ativo: true },
]


export function MonitorApisAdmin() {
  const [tab, setTab] = useState<'cockpit' | 'alertas'>('cockpit')
  const [logs, setLogs] = useState<ApiLog[]>(LOGS_MOCK)
  const [alertas, setAlertas] = useState<AlertaConfig[]>(ALERTAS_MOCK)
  const [loadingCode, setLoadingCode] = useState<string | null>(null)

  // Estados de Filtro - UX Padrão Gravity
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | ApiStatus>('Todos')
  const [filtroProduto, setFiltroProduto] = useState('Todos')
  const [filtroOrg, setFiltroOrg] = useState('Todos')

  const aplicarCorrecaoIA = (id: string) => {
    setLoadingCode(id)
    setTimeout(() => {
      setLogs(prev => prev.map(t => t.id === id ? { ...t, statusCode: 200, status: 'SUCESSO', erroLog: undefined, aiAnalise: undefined } : t))
      setLoadingCode(null)
    }, 1500)
  }

  // Lógica de filtragem real
  const logsFiltrados = logs.filter(log => {
    const matchTexto = !filtroTexto || 
      log.produto.toLowerCase().includes(filtroTexto.toLowerCase()) || 
      log.endpoint.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      log.organizacao.toLowerCase().includes(filtroTexto.toLowerCase())
    
    const matchStatus = filtroStatus === 'Todos' || log.apiStatus === filtroStatus
    const matchProduto = filtroProduto === 'Todos' || log.produto === filtroProduto
    const matchOrg = filtroOrg === 'Todos' || log.organizacao === filtroOrg

    return matchTexto && matchStatus && matchProduto && matchOrg
  })

  // ─── Colunas: Cockpit Unificado (11 colunas) ───────────────────────────

  const COLUNAS_LOGS: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'data', label: 'DATA', tipo: 'texto', tooltipTitulo: 'Data do Registro' },
    { key: 'hora', label: 'HORA', tipo: 'texto', tooltipTitulo: 'Horário Preciso' },
    { 
      key: 'organizacao', label: 'ORGANIZAÇÃO', tipo: 'texto',
      tooltipTitulo: 'Tenant / Cliente',
      render: (v) => <span style={{ fontSize: '0.8125rem', color: '#a78bfa', fontWeight: 600 }}>{v as string}</span> 
    },
    { 
      key: 'produto', label: 'PRODUTO', tipo: 'texto',
      tooltipTitulo: 'Produto Gravity',
      render: (v) => <span style={{ fontWeight: 600 }}>{v as string}</span> 
    },
    { 
      key: 'consumoAtual', label: 'VOLUME CONSUMIDO', tipo: 'texto',
      tooltipTitulo: 'Uso de Quota (Atual / Limite)',
      render: (_, item) => {
        if (item.tipoCobranca === 'Fixo') return <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>Ilimitado</span>
        
        const perc = item.consumoLimite ? Math.round((item.consumoAtual / item.consumoLimite) * 100) : 0
        const color = perc > 90 ? '#f87171' : perc > 75 ? '#fbbf24' : '#34d399'
        const sigla = item.tipoCobranca === 'Processo' ? 'procs' : item.tipoCobranca === 'Documento' ? 'docs' : 'reqs'

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--ws-text, #f1f5f9)' }}>{item.consumoAtual.toLocaleString('pt-BR')}</span>
              <span style={{ color: 'var(--ws-muted, #94a3b8)' }}>/ {item.consumoLimite?.toLocaleString('pt-BR')} <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>{sigla}</span></span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', width: `${Math.min(perc, 100)}%`, background: color, 
                boxShadow: `0 0 6px ${color}44`, transition: 'width 0.5s ease-out' 
              }} />
            </div>
          </div>
        )
      }
    },
    { key: 'api', label: 'API / SERVIÇO', tipo: 'texto', tooltipTitulo: 'Serviço Interno', render: (v) => <span style={{ color: '#94a3b8' }}>{v as string}</span> },
    { 
      key: 'metodo', label: 'MÉTODO', tipo: 'texto',
      tooltipTitulo: 'Verbo HTTP',
      render: (v: HttpMethod) => (
        <span style={{
          fontSize: '0.7rem', fontWeight: 800,
          color: v === 'GET' ? '#38bdf8' : v === 'POST' ? '#34d399' : v === 'PUT' ? '#fbbf24' : '#f87171'
        }}>{v}</span>
      )
    },
    { key: 'endpoint', label: 'ENDPOINT', tipo: 'texto', tooltipTitulo: 'URI do Recurso', render: (v) => <code style={{ color: '#64748b', fontSize: '0.75rem' }}>{v}</code> },
    { 
      key: 'duracao', label: 'LATÊNCIA', tipo: 'texto',
      tooltipTitulo: 'Tempo de Resposta',
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{v}</span>
    },
    { 
      key: 'apiStatus', label: 'STATUS DA API', tipo: 'texto',
      tooltipTitulo: 'Health Score do Serviço',
      render: (v: ApiStatus) => (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 800,
          color: v === 'Online' ? '#10b981' : v === 'Offline' ? '#ef4444' : '#f59e0b'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: v === 'Online' ? '#10b981' : v === 'Offline' ? '#ef4444' : '#f59e0b' }} />
          {v.toUpperCase()}
        </span>
      )
    },
    { 
      key: 'statusCode', label: 'VER LOGS', tipo: 'texto',
      tooltipTitulo: 'HTTP Response Code',
      render: (v: number) => {
        const pass = v < 400
        return (
          <span style={{
            padding: '0.2rem 0.5rem', borderRadius: '4px',
            background: pass ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: pass ? '#10b981' : '#ef4444',
            fontSize: '0.75rem', fontWeight: 700
          }}>
            {v} {pass ? 'OK' : 'ERR'}
          </span>
        )
      }
    },
  ]

  const colunasAlertas: TabelaGlobalColuna<AlertaConfig>[] = [
    { key: 'nome', label: 'GRUPO / IDENTIFICAÇÃO', tipo: 'texto', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { 
      key: 'canais', label: 'CANAIS DE ENVIO', tipo: 'texto',
      render: (v: string[]) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {v.map(c => (
             <span key={c} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem'
             }}>
               {c === 'E-mail' && <EnvelopeSimple />}
               {c === 'WhatsApp' && <WhatsappLogo color="#22c55e" />}
               {c === 'Slack' && <SlackLogo color="#eab308" />}
               {c}
             </span>
          ))}
        </div>
      )
    },
    { 
      key: 'gatilhos', label: 'GATILHOS (TRIGGERS)', tipo: 'texto',
      render: (v: string[]) => (
        <TooltipGlobal titulo="Condição de Disparo" descricao="Regras da pipeline de monitoramento que, se atingidas, disparam a notificação.">
          <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{v.join(', ')}</span>
        </TooltipGlobal>
      ) 
    },
    { 
      key: 'ativo', label: 'STATUS', tipo: 'texto',
      render: (v: boolean) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: v ? '#10b981' : '#64748b' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: v ? '#10b981' : '#64748b' }} />
          {v ? 'ATIVO' : 'PAUSADO'}
        </span>
      )
    },
    { key: 'id', label: 'AÇÕES', tipo: 'texto', render: () => (
       <div style={{ display: 'flex', gap: '0.5rem' }}>
         <TooltipGlobal descricao="Editar configuração de alerta">
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Wrench size={13} />}>EDITAR</BotaoGlobal>
         </TooltipGlobal>
         <TooltipGlobal descricao="Excluir alerta permanentemente">
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Trash size={13} color="#ef4444" />} style={{ color: '#ef4444' }}>EXCLUIR</BotaoGlobal>
         </TooltipGlobal>
       </div>
    ) }
  ]

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
                   <BotaoGlobal 
                     variante="primario" 
                     tamanho="pequeno" 
                     icone={loadingCode === item.id ? <Plus className="ws-rotate" /> : <Wrench weight="fill" />} 
                     onClick={() => aplicarCorrecaoIA(item.id)}
                     disabled={loadingCode === item.id}
                   >
                     {loadingCode === item.id ? 'Modificando código...' : 'Corrigir Bug (1 Clique)'}
                   </BotaoGlobal>
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

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} />}
          titulo="API Cockpit"
          subtitulo="Central consolidada de saúde, tráfego e diagnósticos IA preditivos"
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="APIs Online"
            valor={SERVICES_MOCK.filter(s => s.status === 'Online').length}
            subtexto={`de ${SERVICES_MOCK.length} serviços`}
            variante="sucesso"
          />
          <StatCardGlobal
            titulo="APIs com Problema"
            valor={SERVICES_MOCK.filter(s => s.status !== 'Online').length}
            variante={SERVICES_MOCK.filter(s => s.status !== 'Online').length ? 'perigo' : 'padrao'}
          />
          <StatCardGlobal
            titulo="Alertas de Consumo"
            valor={SERVICES_MOCK.filter(s => s.consumoLimite && (s.consumoAtual / s.consumoLimite) > 0.85).length}
            subtexto="Serviços com >85% de uso"
            variante={SERVICES_MOCK.filter(s => s.consumoLimite && (s.consumoAtual / s.consumoLimite) > 0.85).length > 0 ? 'perigo' : 'sucesso'}
          />
          <StatCardGlobal
            titulo="Requisições Hoje"
            valor={logs.length}
            subtexto="Total transacionado hoje"
            variante="primario"
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'cockpit' ? ' active' : ''}`} onClick={() => setTab('cockpit')}>
            Visão Geral &amp; Monitor
          </button>
          <button className={`ws-tab${tab === 'alertas' ? ' active' : ''}`} onClick={() => setTab('alertas')}>
            Configuração de Alertas
          </button>
        </div>
      }
    >
      {tab === 'cockpit' && (
         <div className="ws-fade-up">
           <p className="ws-section-title">
             <Pulse weight="duotone" size={14} color="#818cf8" />
             Monitoramento e Telemetria em Tempo Real
           </p>

           {/* Toolbar de Filtros - Standard UX Pattern */}
           <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <GeralCampoGlobal label="Localizar Log (Produto, Org, Endpoint)">
                <input type="text" className="ws-input" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Pesquisar..." />
              </GeralCampoGlobal>
              <GeralCampoGlobal label="Status da API">
                <SelectGlobal valor={filtroStatus} aoMudarValor={(v) => setFiltroStatus(v as any)} opcoes={[{ valor: 'Todos', rotulo: 'Todos os Status' }, { valor: 'Online', rotulo: 'Online' }, { valor: 'Offline', rotulo: 'Offline' }, { valor: 'Degradado', rotulo: 'Degradado' }]} />
              </GeralCampoGlobal>
              <GeralCampoGlobal label="Filtrar por Produto">
                <SelectGlobal valor={filtroProduto} aoMudarValor={(v) => setFiltroProduto(v as string || 'Todos')} opcoes={[{ valor: 'Todos', rotulo: 'Todos os Produtos' }, ...Array.from(new Set(logs.map(l => l.produto))).map(p => ({ valor: p, rotulo: p }))]} />
              </GeralCampoGlobal>
              <GeralCampoGlobal label="Organização">
                <SelectGlobal valor={filtroOrg} aoMudarValor={(v) => setFiltroOrg(v as string || 'Todos')} opcoes={[{ valor: 'Todos', rotulo: 'Todas Orgs' }, ...Array.from(new Set(logs.map(l => l.organizacao))).map(o => ({ valor: o, rotulo: o }))]} />
              </GeralCampoGlobal>
           </div>

           <TabelaGlobal<ApiLog>
             dados={logsFiltrados}
             colunas={COLUNAS_LOGS}
             idKey="id"
             renderExpandido={renderExpandido}
             mensagemVazio="Nenhum log encontrado para os filtros aplicados."
             mensagemSemFiltro="Os logs de API estão vazios."
             acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_LOGS, 'monitor_logs', 'Monitoramento e Logs')}
           />
         </div>
      )}

      {tab === 'alertas' && (
         <div className="ws-fade-up">
           <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
             <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Plus weight="bold" size={14} />}>Novo Alerta</BotaoGlobal>
           </div>
           <TabelaGlobal<AlertaConfig>
             dados={alertas}
             colunas={colunasAlertas}
             idKey="id"
             mensagemVazio="Nenhum alerta configurado."
             mensagemSemFiltro="Adicione um alerta para ser notificado de quedas de API."
             acoesExportacao={getAcoesExportacaoPadrao(colunasAlertas, 'alertas', 'Configuração de Alertas')}
           />
         </div>
      )}
    </PaginaGlobal>
  )
}
