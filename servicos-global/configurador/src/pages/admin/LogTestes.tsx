import React, { useState, useEffect } from 'react'
import { Bug, Sparkle, XCircle, CheckCircle, Warning, Code, Wrench, PlayCircle, CalendarBlank, Clock } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { ModalAgendamentoTestes } from './ModalAgendamentoTestes'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { adminTestLogsApi, type TestLogApi } from '../../services/apiClient'
import { useShellStore } from '@gravity/shell'


type TipoTeste = 'E2E' | 'FUNCIONAL' | 'UNITARIO'
type Resultado = 'APROVADO' | 'REPROVADO' | 'ERRO_CATASTROFICO'

interface LogTeste {
  id: string
  data: string
  hora: string
  tipo: TipoTeste
  modulo: string
  teste: string
  resultado: Resultado
  duracao: string
  erroLog?: string
  aiAnalise?: {
    erroResumo: string
    motivo: string
    sugestaoCorrecao: string
    arquivo: string
    codigoDiff?: { old: string; new: string }
    provaVisual?: string
  }
}

// Helper: mapeia dados do backend para o formato do frontend
function mapTestLogToLocal(log: TestLogApi): LogTeste {
  const created = new Date(log.created_at)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return {
    id: log.id,
    data: `${pad(created.getDate())}/${pad(created.getMonth() + 1)}/${created.getFullYear()}`,
    hora: `${pad(created.getHours())}:${pad(created.getMinutes())}:${pad(created.getSeconds())}`,
    tipo: (log.type as TipoTeste) || 'E2E',
    modulo: log.module || 'N/A',
    teste: log.test_name || 'N/A',
    resultado: (log.result as Resultado) || 'APROVADO',
    duracao: log.duration || 'N/A',
    erroLog: log.error_log ?? undefined,
    aiAnalise: log.ai_analysis ? {
      erroResumo: (log.ai_analysis as Record<string, string>).erroResumo ?? '',
      motivo: (log.ai_analysis as Record<string, string>).motivo ?? '',
      sugestaoCorrecao: (log.ai_analysis as Record<string, string>).sugestaoCorrecao ?? '',
      arquivo: (log.ai_analysis as Record<string, string>).arquivo ?? '',
    } : undefined,
  }
}

export function LogTestes() {
  const addNotification = useShellStore((s) => s.addNotification)
  const [dados, setDados] = useState<LogTeste[]>([])
  const [carregando, setCarregando] = useState(true)
  const [loadingCode, setLoadingCode] = useState<string | null>(null)
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false)
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(false)

  useEffect(() => {
    async function loadLogs() {
      try {
        setCarregando(true)
        const res = await adminTestLogsApi.list()
        setDados(res.logs.map(mapTestLogToLocal))
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Falha ao carregar logs de teste.' })
      } finally {
        setCarregando(false)
      }
    }
    loadLogs()
  }, [])

  const aprovadosCount = dados.filter(d => d.resultado === 'APROVADO').length
  const reprovadosCount = dados.filter(d => d.resultado === 'REPROVADO').length
  const erroCount = dados.filter(d => d.resultado === 'ERRO_CATASTROFICO').length

  const aplicarCorrecaoIA = (id: string) => {
    setLoadingCode(id)
    setTimeout(() => {
      // Fake a fix
      setDados(prev => prev.map(t => t.id === id ? { ...t, resultado: 'APROVADO', erroLog: undefined, aiAnalise: undefined } : t))
      setLoadingCode(null)
    }, 1500)
  }
  const colunas: TabelaGlobalColuna<LogTeste>[] = [
    { 
      key: 'data', label: 'DATA', tipo: 'texto',
      tooltipTitulo: 'Data de Execução',
      tooltipDescricao: 'Data em que a bateria de testes foi disparada pelo runner.'
    },
    { 
      key: 'hora', label: 'HORA', tipo: 'texto',
      tooltipTitulo: 'Horário de Início',
      tooltipDescricao: 'Horário exato do início da execução desta suíte de testes.'
    },
    { 
      key: 'tipo', 
      label: 'TIPO', 
      tipo: 'texto',
      tooltipTitulo: 'Categoria do Teste',
      tooltipDescricao: 'Define se o teste é Unitário, E2E (End-to-End) ou Funcional.',
      render: (v: TipoTeste) => (
        <span style={{
          display: 'inline-flex', padding: '0.15rem 0.6rem', borderRadius: '4px',
          background: v === 'E2E' ? 'rgba(234, 179, 8, 0.15)' : v === 'UNITARIO' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(167, 139, 250, 0.15)',
          color: v === 'E2E' ? '#eab308' : v === 'UNITARIO' ? '#38bdf8' : '#a78bfa',
          border: `1px solid ${v === 'E2E' ? 'rgba(234, 179, 8, 0.4)' : v === 'UNITARIO' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(167, 139, 250, 0.4)'}`,
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em'
        }}>
          {v}
        </span>
      )
    },
    { 
      key: 'modulo', label: 'MÓDULO', tipo: 'texto',
      tooltipTitulo: 'Módulo Alvo',
      tooltipDescricao: 'Identifica qual microsserviço ou área do sistema está sendo validada.'
    },
    { 
      key: 'teste', label: 'O QUE FOI TESTADO', tipo: 'texto', 
      tooltipTitulo: 'Contexto do Teste',
      tooltipDescricao: 'Descrição da funcionalidade específica ou fluxo de usuário testado.',
      render: (v) => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v}</span> 
    },
    { 
      key: 'resultado', 
      label: 'RESULTADO', 
      tipo: 'texto',
      tooltipTitulo: 'Status da Execução',
      tooltipDescricao: 'Indica se todas as asserções do teste passaram (APROVADO) ou se houve falha (REPROVADO).',
      render: (v: Resultado) => {
        const pass = v === 'APROVADO'
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: '999px',
            background: pass ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${pass ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: pass ? '#10b981' : '#ef4444',
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase'
          }}>
            {pass ? <CheckCircle size={14} weight="bold" /> : <XCircle size={14} weight="bold" />}
            {v}
          </span>
        )
      }
    },
    { 
      key: 'duracao', label: 'DURAÇÃO', tipo: 'texto', 
      tooltipTitulo: 'Tempo de Resposta',
      tooltipDescricao: 'Duração total do processamento do teste, incluindo setup e teardown.',
      render: (v) => <span style={{ color: '#94a3b8' }}>{v}</span> 
    },
  ]

  const renderExpandido = (item: LogTeste) => {
    if (item.resultado === 'APROVADO') return (
       <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', margin: '0.5rem 1rem' }}>
          <CheckCircle size={20} weight="fill" /> 
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Teste passou com sucesso. Nenhuma ação necessária.</span>
       </div>
    )

    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Mensagem de Erro Bruta */}
        {item.erroLog && (
          <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
               <Warning size={16} color="#ef4444" weight="bold" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171' }}>Mensagem de Erro</span>
            </div>
            <div style={{ padding: '1rem' }}>
               <code style={{ color: '#fca5a5', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                 {item.erroLog}
               </code>
            </div>
          </div>
        )}

        {/* Análise da IA - Correção em Um Clique */}
        {item.aiAnalise && (
           <div style={{ 
               background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
               borderRadius: '12px', 
               border: '1px solid rgba(139, 92, 246, 0.4)', 
               boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
               position: 'relative', overflow: 'hidden' 
            }}>
             {/* Glow decorativo */}
             <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '150%', height: '100%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
             
             <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.2)', color: '#c084fc', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}>
                      <Sparkle size={18} weight="fill" />
                   </div>
                   <div>
                     <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Análise Especialista IA</h4>
                     <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: 0 }}>Troubleshooting automatizado por Gabi AI</p>
                   </div>
                </div>
                {/* Botões de Ação Global para o Erro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <button 
                     type="button"
                     onClick={() => aplicarCorrecaoIA(item.id)}
                     disabled={loadingCode === item.id}
                     style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                        border: 'none', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, 
                        cursor: loadingCode === item.id ? 'not-allowed' : 'pointer', 
                        transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                        opacity: loadingCode === item.id ? 0.7 : 1
                     }}
                     onMouseEnter={e => { if(loadingCode !== item.id) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)' }}
                     onMouseLeave={e => { if(loadingCode !== item.id) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)' }}
                   >
                     {loadingCode === item.id ? (
                        <>Processando Alterações...</>
                     ) : (
                        <><Wrench size={16} weight="fill" /> Corrigir Código (1 Clique)</>
                     )}
                   </button>
                   <button
                     type="button"
                     style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.8125rem', fontWeight: 600, 
                        cursor: 'pointer', transition: 'all 0.2s'
                     }}
                     onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                     onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                   >
                     <Code size={16} /> Alterar Manualmente
                   </button>
                </div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(350px, 1.5fr)', gap: '1rem', padding: '1.25rem', position: 'relative' }}>
               {/* Resumo e Motivos */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>O que é o erro</span>
                    <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{item.aiAnalise.erroResumo}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>Motivo</span>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{item.aiAnalise.motivo}</p>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>Onde</span>
                    <code style={{ display: 'inline-block', padding: '0.3rem 0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                       {item.aiAnalise.arquivo}
                    </code>
                  </div>
               </div>

               {/* Sugestão de Código e Preview de Alteração */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>Correção Sugerida</span>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>{item.aiAnalise.sugestaoCorrecao}</p>
                  </div>
                  
                  {item.aiAnalise.codigoDiff && (
                    <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)' }}>
                       <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ opacity: 0.5, userSelect: 'none' }}>-</span>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalise.codigoDiff.old}</span>
                       </div>
                       <div style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ opacity: 0.5, userSelect: 'none' }}>+</span>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalise.codigoDiff.new}</span>
                       </div>
                    </div>
                  )}

                  {item.aiAnalise.provaVisual && (
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#f87171', marginBottom: '0.5rem' }}>
                        📸 Prova Visual (QA E2E)
                      </span>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        <img src={item.aiAnalise.provaVisual} alt="Evidência do Erro" style={{ width: '100%', display: 'block' }} />
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
          icone={
            <div style={{ position: 'relative' }}>
              <Bug weight="duotone" size={22} />
              {agendamentoAtivo && (
                <div style={{ 
                  position: 'absolute', top: -3, right: -3, 
                  width: 10, height: 10, borderRadius: '50%', 
                  background: '#10b981', border: '2px solid #0f172a',
                  animation: 'ws-pulse-active 2s infinite' 
                }} />
              )}
            </div>
          }
          titulo="Testes"
          subtitulo="Acompanhamento e correção automatizada de testes vitest e playwright"
        />
      }
      acoes={
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '100%', paddingBottom: '0.1rem' }}>
          <style>
            {`
              @keyframes ws-pulse-active {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
                70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
              }
            `}
          </style>
          <TooltipGlobal descricao="Gerenciar e configurar horários de execução automática dos testes">
            <button
               type="button"
               onClick={() => setModalAgendamentoAberto(true)}
               style={{ 
                 display: 'flex', alignItems: 'center', gap: '0.5rem', 
                 padding: '0.5rem 1rem', borderRadius: '8px', 
                 background: agendamentoAtivo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', 
                 border: `1px solid ${agendamentoAtivo ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                 color: agendamentoAtivo ? '#10b981' : '#e2e8f0', 
                 fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                 animation: agendamentoAtivo ? 'ws-pulse-active 2s infinite' : 'none'
               }}
               onMouseEnter={e => e.currentTarget.style.background = agendamentoAtivo ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.currentTarget.style.background = agendamentoAtivo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)'}
            >
              <Clock size={16} weight={agendamentoAtivo ? "fill" : "bold"} style={{ color: agendamentoAtivo ? '#10b981' : 'inherit' }} />
              Agendamento ativo
            </button>
          </TooltipGlobal>
          <TooltipGlobal descricao="Disparar manualmente a execução de toda a suíte de testes em todos os módulos">
            <button
               style={{ 
                 display: 'flex', alignItems: 'center', gap: '0.5rem', 
                 padding: '0.5rem 1rem', borderRadius: '8px', 
                 background: 'var(--cl-primary, #10b981)', border: 'none', color: '#fff', 
                 fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'filter 0.15s' 
               }}
               onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
               onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <PlayCircle size={16} weight="bold" /> Rodar Todos os Testes
            </button>
          </TooltipGlobal>
        </div>
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Aprovados"
            valor={aprovadosCount}
            icone={<CheckCircle weight="duotone" size={18} />}
            variante="sucesso"
            tooltip={<span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>Quantidade de suítes de teste (unitários, integração e e2e) que completaram toda asserção sem falhas ou gargalos e cumpriram a pipeline de CI.</span>}
          />
          <CardBasicoGlobal
            titulo="Reprovados"
            valor={reprovadosCount}
            icone={<XCircle weight="duotone" size={18} />}
            variante="perigo"
            tooltip={<span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>Conjunto de testes que não atenderam às premissas de asserção definidas, retornando códigos de erro de validação ou timeouts durante a execução.</span>}
          />
          <CardBasicoGlobal
            titulo="Erro de Teste Em Execução"
            valor={erroCount}
            icone={<Warning weight="duotone" size={18} />}
            variante="aviso"
            tooltip={<span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>Testes sinalizados com crash completo (OOM, pânico de sistema ou erro de parser de sintaxe) cujo processo travou inesperadamente no runner.</span>}
          />
        </>
      }
    >
      <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10, marginTop: '32px' }}>
        <TabelaGlobal
          id="admin-test-logs"
          dados={dados}
          colunas={colunas}
          idKey="id"
          renderExpandido={renderExpandido}
          mensagemVazio="Nenhum log encontrado."
          mensagemSemFiltro="Pipeline de testes aguardando execução."
          tooltipBusca="Localizar teste por nome, módulo ou tipo"
          tooltipExpandir="Ver análise técnica da IA e motivos detalhados de falhas ou sucessos"
        
        acoesExportacao={getAcoesExportacaoPadrao(colunas, 'dados_tabela', 'Exportação de Logs')}
      />
      </div>

      <ModalAgendamentoTestes 
        aberto={modalAgendamentoAberto} 
        aoFechar={() => setModalAgendamentoAberto(false)}
        aoMudarStatus={(ativo) => setAgendamentoAtivo(ativo)}
      />
    </PaginaGlobal>
  )
}
