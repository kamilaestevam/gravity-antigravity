import React, { useState } from 'react'
import { PlugsConnected, Sparkle, Warning, CheckCircle, Code, Wrench, Pulse, Key, WebhooksLogo, BookOpen, ShareNetwork, Funnel, Terminal, Activity, Monitor, Trash } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
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

// ─── Mocks ───────────────────────────────────────────────────────────────

const SERVICES_MOCK: ApiService[] = [
  { id: 's1', produto: 'SimulaCusto', organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/sim-custo/v1', status: 'Online', tipoCobranca: 'Documento', consumoAtual: 850, consumoLimite: 1000 },
  { id: 's2', produto: 'Gestão de Atividades', organizacao: 'Importas SA', baseUrl: 'https://api.gravity.com.br/atividades/v2', status: 'Online', tipoCobranca: 'Processo', consumoAtual: 1450, consumoLimite: 5000 },
]

const LOGS_MOCK: ApiLog[] = [
  {
    id: 'req1', data: '24/03/2026', hora: '21:55:12', organizacao: 'Importas SA', produto: 'SimulaCusto', consumoAtual: 850, consumoLimite: 1000, tipoCobranca: 'Documento', api: 'Cálculo Frete', metodo: 'POST', endpoint: '/v1/simulacoes', statusCode: 201, status: 'SUCESSO', duracao: '124ms', apiStatus: 'Online'
  },
  {
    id: 'req2', data: '24/03/2026', hora: '21:30:10', organizacao: 'Importas SA', produto: 'Gestão de Atividades', consumoAtual: 1450, consumoLimite: 5000, tipoCobranca: 'Processo', api: 'Update Task', metodo: 'PUT', endpoint: '/v2/tarefas/8812', statusCode: 400, status: 'ERRO_CLIENTE', duracao: '15ms', apiStatus: 'Online',
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
  },
  {
    id: 'req3', data: '24/03/2026', hora: '21:10:05', organizacao: 'Importas SA', produto: 'SimulaCusto', consumoAtual: 850, consumoLimite: 1000, tipoCobranca: 'Documento', api: 'Cálculo Frete', metodo: 'GET', endpoint: '/v1/simulacoes', statusCode: 200, status: 'SUCESSO', duracao: '88ms', apiStatus: 'Online'
  }
]

export function ApiCockpit() {
  const [tab, setTab] = useState<'monitor' | 'tokens' | 'webhooks' | 'docs' | 'connectors'>('monitor')
  const [logs, setLogs] = useState<ApiLog[]>(LOGS_MOCK)
  const [loadingCode, setLoadingCode] = useState<string | null>(null)

  // Estados de Filtro - UX Padrão Gravity
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | ApiStatus>('Todos')
  const [filtroProduto, setFiltroProduto] = useState('Todos')

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
      log.endpoint.toLowerCase().includes(filtroTexto.toLowerCase())
    
    const matchStatus = filtroStatus === 'Todos' || log.apiStatus === filtroStatus
    const matchProduto = filtroProduto === 'Todos' || log.produto === filtroProduto

    return matchTexto && matchStatus && matchProduto
  })

  // ─── Colunas: Cockpit Unificado (11 colunas) ───────────────────────────

  const COLUNAS_LOGS: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'data', label: 'DATA', tipo: 'texto', tooltipTitulo: 'Data do Registro' },
    { key: 'hora', label: 'HORA', tipo: 'texto', tooltipTitulo: 'Horário Preciso' },
    { 
      key: 'organizacao', label: 'ORGANIZAÇÃO', tipo: 'texto', 
      tooltipTitulo: 'Nome da sua Organização',
      render: (v) => <span style={{ fontSize: '0.8125rem', color: '#a78bfa', fontWeight: 600 }}>{v as string}</span> 
    },
    { 
      key: 'produto', label: 'PRODUTO', tipo: 'texto', 
      tooltipTitulo: 'Produto Gravity associado',
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
          <div style={{ background: '#0f172a', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
               <Warning size={16} color="#ef4444" weight="bold" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#f87171' }}>Payload / Erro Bruto</span>
            </div>
            <div style={{ padding: '1rem' }}>
               <code style={{ color: '#fca5a5', fontSize: '0.85rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{item.erroLog}</code>
            </div>
          </div>
        )}

        {item.aiAnalise && (
           <div style={{ 
               background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
               borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '1.25rem'
            }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ background: 'rgba(139,92,246,0.2)', color: '#c084fc', padding: '0.5rem', borderRadius: '8px' }}><Sparkle size={18} weight="fill" /></div>
                   <div>
                     <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Análise Especialista Gabi IA</h4>
                     <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: 0 }}>Diagnóstico preditivo de correção</p>
                   </div>
                </div>
                <BotaoGlobal variante="primario" tamanho="pequeno" icone={loadingCode === item.id ? <Pulse className="ws-rotate" /> : <Wrench weight="fill" />} onClick={() => aplicarCorrecaoIA(item.id)} disabled={loadingCode === item.id}>
                  {loadingCode === item.id ? 'Modificando código...' : 'Corrigir Bug (1 Clique)'}
                </BotaoGlobal>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(350px, 1.5fr)', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa' }}>Erro Interpretado</span>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#f8fafc' }}>{item.aiAnalise.erroResumo}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa' }}>Causa Raiz</span>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>{item.aiAnalise.motivo}</p>
                  </div>
               </div>
               <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa' }}>Sugestão de Patch</span>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>{item.aiAnalise.sugestaoCorrecao}</p>
                  {item.aiAnalise.codigoDiff && (
                    <div style={{ background: '#000', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.75rem' }}>
                       <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.5rem' }}>- {item.aiAnalise.codigoDiff.old}</div>
                       <div style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.5rem' }}>+ {item.aiAnalise.codigoDiff.new}</div>
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
      cabecalho={
        <CabecalhoGlobal
          icone={<PlugsConnected weight="duotone" size={24} />}
          titulo="API Cockpit"
          subtitulo="Central consolidada de todas as suas APIs Gravity com status e tráfego em tempo real"
        />
      }
      stats={
        <>
          <StatCardGlobal titulo="APIs Online" valor={SERVICES_MOCK.filter(s => s.status === 'Online').length} subtexto={`de ${SERVICES_MOCK.length} serviços`} variante="sucesso" />
          <StatCardGlobal titulo="APIs com Problema" valor={SERVICES_MOCK.filter(s => s.status !== 'Online').length} variante={SERVICES_MOCK.filter(s => s.status !== 'Online').length ? 'perigo' : 'padrao'} />
          <StatCardGlobal titulo="Alertas de Consumo" valor={SERVICES_MOCK.filter(s => (s.consumoAtual / (s.consumoLimite || 1)) > 0.85).length} subtexto="Serviços com >85% de uso" variante={SERVICES_MOCK.filter(s => (s.consumoAtual / (s.consumoLimite || 1)) > 0.85).length ? 'perigo' : 'sucesso'} />
          <StatCardGlobal titulo="Requisições Hoje" valor={logs.length} subtexto="da sua organização" variante="primario" />
        </>
      }
      toolbar={
        <div className="ws-tabs">
          <button className={`ws-tab${tab === 'monitor' ? ' active' : ''}`} onClick={() => setTab('monitor')}>Visão Geral &amp; Monitor</button>
          <button className={`ws-tab${tab === 'tokens' ? ' active' : ''}`} onClick={() => setTab('tokens')}>Tokens de Acesso</button>
          <button className={`ws-tab${tab === 'webhooks' ? ' active' : ''}`} onClick={() => setTab('webhooks')}>Webhooks &amp; Eventos</button>
          <button className={`ws-tab${tab === 'docs' ? ' active' : ''}`} onClick={() => setTab('docs')}>Documentação &amp; Playground</button>
          <button className={`ws-tab${tab === 'connectors' ? ' active' : ''}`} onClick={() => setTab('connectors')}>Conectores (ERP/SAP)</button>
        </div>
      }
    >
      {tab === 'monitor' && (
        <div className="ws-fade-up">
          <p className="ws-section-title">
            <Pulse weight="duotone" size={14} color="#818cf8" />
            Monitoramento em Tempo Real — {logs[0]?.organizacao || 'Importas SA'}
          </p>

          {/* Toolbar de Filtros - Standard UX Pattern */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <GeralCampoGlobal label="Localizar Log (Produto, Endpoint)">
              <input type="text" className="ws-input" value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} placeholder="Pesquisar..." />
            </GeralCampoGlobal>
            <GeralCampoGlobal label="Status da API">
              <SelectGlobal valor={filtroStatus} aoMudarValor={(v) => setFiltroStatus(v as any)} opcoes={[{ valor: 'Todos', rotulo: 'Todos os Status' }, { valor: 'Online', rotulo: 'Online' }, { valor: 'Offline', rotulo: 'Offline' }, { valor: 'Degradado', rotulo: 'Degradado' }]} />
            </GeralCampoGlobal>
            <GeralCampoGlobal label="Filtrar por Produto">
              <SelectGlobal valor={filtroProduto} aoMudarValor={(v) => setFiltroProduto(v as string || 'Todos')} opcoes={[{ valor: 'Todos', rotulo: 'Todos os Produtos' }, ...Array.from(new Set(logs.map(l => l.produto))).map(p => ({ valor: p, rotulo: p }))]} />
            </GeralCampoGlobal>
          </div>

          <TabelaGlobal<ApiLog>
            dados={logsFiltrados}
            colunas={COLUNAS_LOGS}
            idKey="id"
            renderExpandido={renderExpandido}
            mensagemVazio="Nenhum log encontrado para os filtros aplicados."
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_LOGS, 'logs_monitoramento', 'Monitoramento e Logs')}
          />
        </div>
      )}

      {/* Outras abas simplificadas para o protótipo */}
      {(tab === 'tokens' || tab === 'webhooks') && (
         <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Key size={48} color="rgba(255,255,255,0.2)" weight="duotone" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--ws-text)', marginBottom: '0.5rem' }}>Configurações de {tab === 'tokens' ? 'Segurança' : 'Webhooks'}</h3>
            <p style={{ color: 'var(--ws-muted)', fontSize: '0.9rem' }}>Módulo em desenvolvimento. Aqui você poderá gerenciar {tab === 'tokens' ? 'chaves de API e segredos.' : 'endpoints de callback e eventos.'}</p>
         </div>
      )}
    </PaginaGlobal>
  )
}
