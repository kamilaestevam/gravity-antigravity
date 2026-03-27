import React, { useState } from 'react'
import { Pulse, Sparkle, Warning, CheckCircle, Code, Wrench, BellRinging, EnvelopeSimple, WhatsappLogo, SlackLogo, Plus, Trash } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type LogStatus = 'SUCESSO' | 'ERRO_CLIENTE' | 'ERRO_SERVIDOR'

interface ApiLog {
  id: string
  data: string
  hora: string
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

interface AlertaConfig {
  id: string
  nome: string
  webhookUrl: string
  canais: ('E-mail' | 'WhatsApp' | 'Slack')[]
  gatilhos: string[]
  ativo: boolean
}

const LOGS_MOCK: ApiLog[] = [
  {
    id: 'req1', data: '24/03/2026', hora: '21:55:12', api: 'SimulaCusto', metodo: 'POST', endpoint: '/v1/simulacoes', statusCode: 201, status: 'SUCESSO', duracao: '124ms'
  },
  {
    id: 'req2', data: '24/03/2026', hora: '21:50:05', api: 'Gabi IA Assistant', metodo: 'POST', endpoint: '/v1/chat', statusCode: 500, status: 'ERRO_SERVIDOR', duracao: '2041ms',
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
    id: 'req3', data: '24/03/2026', hora: '21:45:00', api: 'Dashboard Global', metodo: 'GET', endpoint: '/v1/metricas', statusCode: 200, status: 'SUCESSO', duracao: '45ms'
  },
  {
    id: 'req4', data: '24/03/2026', hora: '21:30:10', api: 'Gestão de Atividades', metodo: 'PUT', endpoint: '/v2/tarefas/8812', statusCode: 400, status: 'ERRO_CLIENTE', duracao: '15ms',
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
  const [tab, setTab] = useState<'logs' | 'alertas'>('logs')
  const [logs, setLogs] = useState<ApiLog[]>(LOGS_MOCK)
  const [alertas, setAlertas] = useState<AlertaConfig[]>(ALERTAS_MOCK)
  const [loadingCode, setLoadingCode] = useState<string | null>(null)

  const aplicarCorrecaoIA = (id: string) => {
    setLoadingCode(id)
    setTimeout(() => {
      setLogs(prev => prev.map(t => t.id === id ? { ...t, statusCode: 200, status: 'SUCESSO', erroLog: undefined, aiAnalise: undefined } : t))
      setLoadingCode(null)
    }, 1500)
  }

  const colunasLogs: TabelaGlobalColuna<ApiLog>[] = [
    { key: 'data', label: 'DATA', tipo: 'texto', tooltipTitulo: 'Data da Requisição', tooltipDescricao: 'Extraída do payload da requisição no gateway.' },
    { key: 'hora', label: 'HORA', tipo: 'texto', tooltipTitulo: 'Hora do Servidor', tooltipDescricao: 'Timestamp GMT e timezone convertido para local.' },
    { key: 'api', label: 'API / SERVIÇO', tipo: 'texto', tooltipTitulo: 'Serviço de Destino', tooltipDescricao: 'Módulo do monolito ou microserviço acessado.', render: (v) => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v}</span> },
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
      key: 'endpoint', label: 'ENDPOINT', tipo: 'texto', tooltipTitulo: 'Endpoint', tooltipDescricao: 'Caminho exato e recursos solicitados na API (URI).',
      render: (v) => (
        <TooltipGlobal titulo="URI do Recurso" descricao="Caminho relativo do endpoint requisitado pelo cliente.">
          <code style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{v}</code>
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
      key: 'duracao', label: 'LATÊNCIA', tipo: 'texto', tooltipTitulo: 'Tempo Relativo', tooltipDescricao: 'Representa a performance no tempo total de resposta de ponta-a-ponta.',
      render: (v) => (
        <TooltipGlobal titulo="Time-To-First-Byte (TTFB)" descricao="Tempo total de processamento no gateway antes do primeiro byte da resposta.">
          <span style={{ color: '#cbd5e1' }}>{v}</span>
        </TooltipGlobal>
      ) 
    },
  ]

  const colunasAlertas: TabelaGlobalColuna<AlertaConfig>[] = [
    { key: 'nome', label: 'GRUPO / IDENTIFICAÇÃO', tipo: 'texto', tooltipTitulo: 'Chave do Grupo', tooltipDescricao: 'Nome amigável da regra de notificação.', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { 
      key: 'canais', label: 'CANAIS DE ENVIO', tipo: 'texto', tooltipTitulo: 'Endpoint do Notificador', tooltipDescricao: 'Rotas de envio programático mapeadas pelo webhook.',
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
      key: 'gatilhos', label: 'GATILHOS (TRIGGERS)', tipo: 'texto', tooltipTitulo: 'Critérios Lógicos', tooltipDescricao: 'Quais parâmetros lógicos disparam a rule set no sistema (por ex. ERRO 5xx).',
      render: (v: string[]) => (
        <TooltipGlobal titulo="Condição de Disparo" descricao="Regras da pipeline de monitoramento que, se atingidas, disparam a notificação.">
          <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{v.join(', ')}</span>
        </TooltipGlobal>
      ) 
    },
    { 
      key: 'ativo', label: 'STATUS', tipo: 'texto', tooltipTitulo: 'Condição da Regra', tooltipDescricao: 'Mostra se a pipeline de envio escuta este evento agora.',
      render: (v: boolean) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: v ? '#10b981' : '#64748b' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: v ? '#10b981' : '#64748b' }} />
          {v ? 'Ativo' : 'Pausado'}
        </span>
      )
    },
    { key: 'id', label: 'AÇÕES', tipo: 'texto', render: () => (
       <div style={{ display: 'flex', gap: '0.5rem' }}>
         <TooltipGlobal descricao="Editar configuração de alerta">
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Wrench size={13} />}>Editar</BotaoGlobal>
         </TooltipGlobal>
         <TooltipGlobal descricao="Excluir alerta permanentemente">
            <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Trash size={13} color="#ef4444" />} style={{ color: '#ef4444' }}>Excluir</BotaoGlobal>
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
        {/* Mensagem de Erro Bruta */}
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

        {/* Análise da IA Especialista */}
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
                {/* Botões de Ação Global para o Erro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <button 
                     type="button" onClick={() => aplicarCorrecaoIA(item.id)} disabled={loadingCode === item.id}
                     style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', color: '#fff', 
                        fontSize: '0.8125rem', fontWeight: 700, cursor: loadingCode === item.id ? 'not-allowed' : 'pointer', 
                        transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)', opacity: loadingCode === item.id ? 0.7 : 1
                     }}
                     onMouseEnter={e => { if(loadingCode !== item.id) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)' }}
                     onMouseLeave={e => { if(loadingCode !== item.id) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)' }}
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

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Pulse weight="duotone" size={24} />}
          titulo="Monitor de APIs"
          subtitulo="Dashboard unificado de requisições, diagnósticos IA e configuração de alertas"
        />
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'logs' ? ' active' : ''}`} onClick={() => setTab('logs')}>
            Logs &amp; Análise IA
          </button>
          <button className={`ws-tab${tab === 'alertas' ? ' active' : ''}`} onClick={() => setTab('alertas')}>
            Configuração de Alertas
          </button>
        </div>
      }
    >
      {tab === 'logs' && (
         <div className="ws-fade-up">
           <TabelaGlobal<ApiLog>
             dados={logs}
             colunas={colunasLogs}
             idKey="id"
             renderExpandido={renderExpandido}
             mensagemVazio="Nenhuma requisição na base de logs."
             mensagemSemFiltro="Os logs de API estão vazios."
           
        acoesExportacao={getAcoesExportacaoPadrao(colunasLogs, 'dados_tabela', 'Exportação de Dados')}
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
           
        acoesExportacao={getAcoesExportacaoPadrao(colunasAlertas, 'dados_tabela', 'Exportação de Dados')}
      />
         </div>
      )}
    </PaginaGlobal>
  )
}
