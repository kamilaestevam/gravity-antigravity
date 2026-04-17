import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bug, Sparkle, XCircle, CheckCircle, Warning, PlayCircle, CalendarBlank, Clock, SpinnerGap } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { ModalAgendamentoTestes } from './ModalAgendamentoTestes'
import { ModalExecutarTestes } from './ModalExecutarTestes'
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
    codigoDiff?: { arquivo?: string; linha?: number; old: string; new: string; explicacao?: string }
    provaVisual?: string
    categoria?: 'BUG_REAL' | 'TESTE_DESATUALIZADO' | 'FLAKY_TIMING' | 'REGRESSAO_RECENTE' | 'INFRA' | 'NAO_CLASSIFICAVEL'
    confianca?: 'alta' | 'media' | 'baixa'
    commitSuspeito?: { hash: string; autor: string; data: string; mensagem: string }
    modeloUsado?: string
  }
  aiRejected?: boolean
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
      codigoDiff: (log.ai_analysis as Record<string, unknown>).codigoDiff as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['codigoDiff'],
      categoria: (log.ai_analysis as Record<string, string>).categoria as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['categoria'],
      confianca: (log.ai_analysis as Record<string, string>).confianca as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['confianca'],
      commitSuspeito: (log.ai_analysis as Record<string, unknown>).commitSuspeito as LogTeste['aiAnalise'] extends undefined ? never : NonNullable<LogTeste['aiAnalise']>['commitSuspeito'],
      modeloUsado: (log.ai_analysis as Record<string, string>).modeloUsado,
    } : undefined,
    aiRejected: Boolean((log as unknown as Record<string, unknown>).ai_rejected),
  }
}

export function LogTestes() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const addAviso = useShellStore((s) => s.addAviso)
  const [dados, setDados] = useState<LogTeste[]>([])
  const [carregando, setCarregando] = useState(true)
  const [rodandoTestes, setRodandoTestes] = useState(false)
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false)
  const [modalExecutarAberto, setModalExecutarAberto] = useState(false)
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(false)

  async function loadLogs(): Promise<LogTeste[]> {
    try {
      setCarregando(true)
      const res = await adminTestLogsApi.list()
      const novos = res.logs.map(mapTestLogToLocal)
      setDados(novos)
      return novos
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : t('admin.testes-gerais.msg_erro_carregar') })
      return []
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  // Carrega status do agendamento na montagem
  useEffect(() => {
    adminTestLogsApi.listSchedules()
      .then(({ schedules }) => {
        if (schedules.length) {
          const s = schedules[0] as Record<string, unknown>
          setAgendamentoAtivo(Boolean(s.is_active))
        }
      })
      .catch(() => {})
  }, [])

  // Auto-detecta run em progresso quando a tela monta (resiliente a F5 / navegação)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const status = await adminTestLogsApi.runStatus()
        if (!cancelled && status.running) setRodandoTestes(true)
      } catch { /* offline / erro — ignora */ }
    })()
    return () => { cancelled = true }
  }, [])

  // Polling enquanto testes estão rodando.
  // Tick imediato (não espera os 5s iniciais) + polling a cada 3s para feedback rápido.
  useEffect(() => {
    if (!rodandoTestes) return
    let stopped = false

    async function handleCompletion() {
      const novosLogs = await loadLogs()

      // Contagem apenas dos resultados gerados nesta rodada (snapshot mais recente)
      const totalRun   = novosLogs.length
      const aprovRun   = novosLogs.filter(d => d.resultado === 'APROVADO').length
      const reprovRun  = novosLogs.filter(d => d.resultado === 'REPROVADO').length
      const tudoVerde  = reprovRun === 0 && totalRun > 0
      const resultado  = tudoVerde
        ? `${aprovRun}/${totalRun} aprovados`
        : `${aprovRun} aprovados · ${reprovRun} reprovados`

      // Toast efêmero (feedback imediato caso o usuário esteja na tela)
      addNotification({
        type: tudoVerde ? 'success' : 'error',
        message: tudoVerde
          ? `Execução concluída: ${resultado}`
          : `Execução concluída com falhas: ${resultado}`,
      })

      // Aviso persistente no sininho (com link direto para a tela)
      addAviso({
        conteudo: tudoVerde
          ? `Execução de testes concluída — ${resultado}. Clique para abrir a tela.`
          : `Execução de testes concluída com falhas — ${resultado}. Clique para ver detalhes.`,
        autor: { nome: 'Motor de Testes' },
        tipo: tudoVerde ? 'sistema' : 'aviso',
        href: '/admin/testes-gerais',
      })
    }

    async function tick() {
      if (stopped) return
      try {
        const status = await adminTestLogsApi.runStatus()
        if (!status.running) {
          stopped = true
          setRodandoTestes(false)
          await handleCompletion()
        }
      } catch { /* ignora falha de polling */ }
    }

    // Primeira verificação imediata — pega o caso de testes que já terminaram
    // antes do primeiro tick do intervalo.
    tick()
    const interval = setInterval(tick, 3000)
    return () => { stopped = true; clearInterval(interval) }
  }, [rodandoTestes])

  const aprovadosCount = dados.filter(d => d.resultado === 'APROVADO').length
  const reprovadosCount = dados.filter(d => d.resultado === 'REPROVADO').length
  const erroCount = dados.filter(d => d.resultado === 'ERRO_CATASTROFICO').length

  // Handlers para os botões de ação Gemini
  const handleReanalyze = async (id: string) => {
    try {
      const res = await adminTestLogsApi.reanalyze(id)
      addNotification({ type: 'success', message: 'Re-análise concluída' })
      await loadLogs()
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao reanalisar' })
    }
  }

  const handleApplyFix = async (id: string) => {
    try {
      const res = await adminTestLogsApi.applyFix(id)
      addNotification({ type: 'success', message: `Correção aplicada em ${res.arquivo}` })
      await loadLogs()
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao aplicar correção' })
    }
  }

  const handleReject = async (id: string) => {
    const motivo = window.prompt('Motivo da rejeição (min 10 chars):')
    if (!motivo || motivo.length < 10) return
    try {
      await adminTestLogsApi.reject(id, motivo)
      addNotification({ type: 'success', message: 'Análise rejeitada — feedback registrado' })
      await loadLogs()
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao rejeitar' })
    }
  }

  const colunas: TabelaGlobalColuna<LogTeste>[] = [
    {
      key: 'data', label: t('admin.testes-gerais.col_data'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_data'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_data_desc')
    },
    {
      key: 'hora', label: t('admin.testes-gerais.col_hora'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_hora'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_hora_desc')
    },
    {
      key: 'tipo',
      label: t('admin.testes-gerais.col_tipo'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_tipo'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_tipo_desc'),
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
      key: 'modulo', label: t('admin.testes-gerais.col_modulo'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_modulo'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_modulo_desc')
    },
    {
      key: 'teste', label: t('admin.testes-gerais.col_teste'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_teste'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_teste_desc'),
      render: (v) => <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v}</span> 
    },
    {
      key: 'resultado',
      label: t('admin.testes-gerais.col_resultado'),
      tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_resultado'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_resultado_desc'),
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
      key: 'duracao', label: t('admin.testes-gerais.col_duracao'), tipo: 'texto',
      tooltipTitulo: t('admin.testes-gerais.tooltip_duracao'),
      tooltipDescricao: t('admin.testes-gerais.tooltip_duracao_desc'),
      render: (v) => <span style={{ color: '#94a3b8' }}>{v}</span> 
    },
  ]

  const renderExpandido = (item: LogTeste) => {
    if (item.resultado === 'APROVADO') return (
       <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', margin: '0.5rem 1rem' }}>
          <CheckCircle size={20} weight="fill" /> 
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('admin.testes-gerais.expandido_sucesso')}</span>
       </div>
    )

    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Mensagem de Erro Bruta */}
        {item.erroLog && (
          <div style={{ background: 'var(--ws-bg-body, #0f172a)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
               <Warning size={16} color="#ef4444" weight="bold" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f87171' }}>{t('admin.testes-gerais.expandido_erro_titulo')}</span>
            </div>
            <div style={{ padding: '1rem' }}>
               <code style={{ color: '#fca5a5', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                 {item.erroLog}
               </code>
            </div>
          </div>
        )}

        {/* Análise Gemini — badges, diff, ações */}
        {item.aiAnalise && (
           <div style={{
               background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
               borderRadius: '12px',
               border: '1px solid rgba(139, 92, 246, 0.4)',
               boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
               position: 'relative', overflow: 'hidden'
            }}>
             <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '150%', height: '100%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

             {/* Header com badges e botões de ação */}
             <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.2)', color: '#c084fc', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}>
                      <Sparkle size={18} weight="fill" />
                   </div>
                   <div>
                     <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{t('admin.testes-gerais.expandido_ia_titulo')}</h4>
                     <p style={{ fontSize: '0.75rem', color: '#a78bfa', margin: 0 }}>
                       {item.aiAnalise.modeloUsado ? `via ${item.aiAnalise.modeloUsado}` : t('admin.testes-gerais.expandido_ia_subtitulo')}
                     </p>
                   </div>
                   {/* Badge de categoria */}
                   {item.aiAnalise.categoria && (() => {
                     const catColors: Record<string, { bg: string; border: string; text: string }> = {
                       BUG_REAL:             { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
                       TESTE_DESATUALIZADO:  { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308' },
                       FLAKY_TIMING:         { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.4)', text: '#fb923c' },
                       REGRESSAO_RECENTE:    { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#a855f7' },
                       INFRA:                { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.4)', text: '#94a3b8' },
                       NAO_CLASSIFICAVEL:    { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', text: '#64748b' },
                     }
                     const c = catColors[item.aiAnalise!.categoria!] ?? catColors.NAO_CLASSIFICAVEL
                     return (
                       <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                         {item.aiAnalise!.categoria!.replace(/_/g, ' ')}
                       </span>
                     )
                   })()}
                   {/* Badge de confiança */}
                   {item.aiAnalise.confianca && (() => {
                     const confColors: Record<string, { bg: string; border: string; text: string }> = {
                       alta:  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#10b981' },
                       media: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308' },
                       baixa: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', text: '#64748b' },
                     }
                     const c = confColors[item.aiAnalise!.confianca!] ?? confColors.baixa
                     return (
                       <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: '0.65rem', fontWeight: 800 }}>
                         {item.aiAnalise!.confianca}
                       </span>
                     )
                   })()}
                </div>
                {/* Botões de ação */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {item.aiAnalise.confianca === 'alta' && item.aiAnalise.codigoDiff && (
                    <button
                      onClick={() => handleApplyFix(item.id)}
                      style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Aplicar correção
                    </button>
                  )}
                  <button
                    onClick={() => handleReanalyze(item.id)}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reanalisar
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Rejeitar
                  </button>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(350px, 1.5fr)', gap: '1rem', padding: '1.25rem', position: 'relative' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_o_que_e')}</span>
                    <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{item.aiAnalise.erroResumo}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_motivo')}</span>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{item.aiAnalise.motivo}</p>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_onde')}</span>
                    <code style={{ display: 'inline-block', padding: '0.3rem 0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                       {item.aiAnalise.arquivo}
                    </code>
                  </div>
                  {/* Commit suspeito */}
                  {item.aiAnalise.commitSuspeito && (
                    <div style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '8px' }}>
                      <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#a855f7', marginBottom: '0.4rem' }}>COMMIT SUSPEITO</span>
                      <code style={{ fontSize: '0.75rem', color: '#e2e8f0', fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.aiAnalise.commitSuspeito.hash.slice(0, 7)}
                      </code>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}> por {item.aiAnalise.commitSuspeito.autor} em {item.aiAnalise.commitSuspeito.data}</span>
                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>{item.aiAnalise.commitSuspeito.mensagem}</p>
                    </div>
                  )}
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#a78bfa', marginBottom: '0.25rem' }}>{t('admin.testes-gerais.expandido_ia_correcao')}</span>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>{item.aiAnalise.sugestaoCorrecao}</p>
                  </div>

                  {item.aiAnalise.codigoDiff && (
                    <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)' }}>
                       {item.aiAnalise.codigoDiff.explicacao && (
                         <div style={{ background: 'rgba(139,92,246,0.08)', color: '#a78bfa', padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                           {item.aiAnalise.codigoDiff.arquivo && <span style={{ color: '#64748b' }}>{item.aiAnalise.codigoDiff.arquivo}{item.aiAnalise.codigoDiff.linha ? `:${item.aiAnalise.codigoDiff.linha}` : ''} — </span>}
                           {item.aiAnalise.codigoDiff.explicacao}
                         </div>
                       )}
                       <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ opacity: 0.5, userSelect: 'none' }}>-</span>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalise.codigoDiff.old}</span>
                       </div>
                       <div style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ opacity: 0.5, userSelect: 'none' }}>+</span>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{item.aiAnalise.codigoDiff.new}</span>
                       </div>
                    </div>
                  )}

                  {item.aiAnalise.provaVisual && (
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#f87171', marginBottom: '0.5rem' }}>
                        {t('admin.testes-gerais.expandido_ia_prova_visual')}
                      </span>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        <img src={item.aiAnalise.provaVisual} alt={t('admin.testes-gerais.expandido_ia_evidencia_alt')} style={{ width: '100%', display: 'block' }} />
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
          titulo={t('admin.testes-gerais.titulo')}
          subtitulo={t('admin.testes-gerais.subtitulo')}
        />
      }
      toolbar={
        <>
          <style>{`
            @keyframes ws-pulse-active {
              0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
              70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
              100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            @keyframes ws-running-shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes ws-running-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%      { opacity: 0.55; transform: scale(1.05); }
            }
            @keyframes ws-running-spin {
              to { transform: rotate(360deg); }
            }
            @keyframes ws-running-bar {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Bug weight="duotone" size={14} color="#818cf8" />
              {t('admin.testes-gerais.historico_titulo', { count: dados.length })}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <TooltipGlobal descricao={t('admin.testes-gerais.tooltip_agendamento')}>
                <button
                  type="button"
                  onClick={() => setModalAgendamentoAberto(true)}
                  aria-label={t('admin.testes-gerais.btn_agendamento')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    height: '2.5rem', padding: '0 1rem', borderRadius: '8px',
                    background: agendamentoAtivo ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                    border: `1px solid ${agendamentoAtivo ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                    color: agendamentoAtivo ? '#10b981' : '#818cf8',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    animation: agendamentoAtivo ? 'ws-pulse-active 2s infinite' : 'none',
                  }}
                >
                  <Clock size={15} weight={agendamentoAtivo ? 'fill' : 'regular'} />
                  {t('admin.testes-gerais.btn_agendamento')}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                    background: agendamentoAtivo ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                    color: agendamentoAtivo ? '#10b981' : '#64748b',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {agendamentoAtivo ? t('admin.testes-gerais.badge_ativo') : t('admin.testes-gerais.badge_inativo')}
                  </span>
                </button>
              </TooltipGlobal>
              <TooltipGlobal descricao={t('admin.testes-gerais.tooltip_rodar')}>
                <BotaoGlobal
                  variante="primario"
                  icone={rodandoTestes
                    ? <SpinnerGap size={16} weight="bold" style={{ animation: 'ws-running-spin 0.9s linear infinite' }} />
                    : <PlayCircle size={16} weight="bold" />
                  }
                  onClick={() => setModalExecutarAberto(true)}
                  disabled={rodandoTestes}
                >
                  {rodandoTestes ? 'Rodando...' : t('admin.testes-gerais.btn_rodar')}
                </BotaoGlobal>
              </TooltipGlobal>
            </div>
          </div>
        </>
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('admin.testes-gerais.card_aprovados')}
            valor={aprovadosCount}
            icone={<CheckCircle weight="duotone" size={18} />}
            variante="sucesso"
            tooltip={<span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>{t('admin.testes-gerais.card_aprovados_tooltip')}</span>}
          />
          <CardBasicoGlobal
            titulo={t('admin.testes-gerais.card_reprovados')}
            valor={reprovadosCount}
            icone={<XCircle weight="duotone" size={18} />}
            variante="perigo"
            tooltip={<span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>{t('admin.testes-gerais.card_reprovados_tooltip')}</span>}
          />
          <CardBasicoGlobal
            titulo={t('admin.testes-gerais.card_erro')}
            valor={erroCount}
            icone={<Warning weight="duotone" size={18} />}
            variante="aviso"
            tooltip={<span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>{t('admin.testes-gerais.card_erro_tooltip')}</span>}
          />
        </>
      }
    >
      {/* Container pai: trava qualquer scroll externo herdado do pg-conteudo-area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* Banner de execução — estático, nunca rola */}
        {rodandoTestes && (
          <div
            role="status"
            aria-live="polite"
            style={{
              flexShrink: 0,
              marginBottom: '12px',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              background:
                'linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.12) 50%, rgba(16, 185, 129, 0.12) 100%)',
              backgroundSize: '200% 100%',
              animation: 'ws-running-shimmer 2.5s linear infinite',
              boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 12px 32px rgba(16, 185, 129, 0.12)',
            }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem', position: 'relative', zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '3px solid rgba(16, 185, 129, 0.25)',
                  borderTopColor: '#10b981',
                  animation: 'ws-running-spin 0.9s linear infinite',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9',
                    letterSpacing: '0.01em',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: '#10b981',
                      animation: 'ws-running-pulse 1.4s ease-in-out infinite',
                    }}
                  />
                  Testes em execução...
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Aguarde o término — você será avisado na mensageria quando concluir.
                </p>
              </div>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.35rem 0.75rem', borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981', fontSize: '0.7rem', fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                <PlayCircle size={14} weight="fill" />
                Running
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                height: 3,
                background: 'rgba(16, 185, 129, 0.15)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '40%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                  animation: 'ws-running-bar 1.6s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* Único container com scroll — abraça exclusivamente a tabela */}
        <div
          className="ws-fade-up"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', zIndex: 10 }}
        >
          <TabelaGlobal
            id="admin-test-logs"
            dados={dados}
            colunas={colunas}
            idKey="id"
            renderExpandido={renderExpandido}
            mensagemVazio={t('admin.testes-gerais.vazio')}
            mensagemSemFiltro={t('admin.testes-gerais.vazio_filtro')}
            tooltipBusca={t('admin.testes-gerais.tooltip_busca')}
            tooltipExpandir={t('admin.testes-gerais.tooltip_expandir')}
            acoesExportacao={getAcoesExportacaoPadrao(colunas, 'dados_tabela', 'Exportação de Logs')}
          />
        </div>

        <ModalAgendamentoTestes
          aberto={modalAgendamentoAberto}
          aoFechar={() => {
            setModalAgendamentoAberto(false)
            adminTestLogsApi.listSchedules()
              .then(({ schedules }) => {
                if (schedules.length) {
                  const s = schedules[0] as Record<string, unknown>
                  setAgendamentoAtivo(Boolean(s.is_active))
                }
              })
              .catch(() => {})
          }}
          aoMudarStatus={(ativo) => setAgendamentoAtivo(ativo)}
        />

        <ModalExecutarTestes
          aberto={modalExecutarAberto}
          aoFechar={() => setModalExecutarAberto(false)}
          aoIniciarRun={(_planos) => { setRodandoTestes(true); setModalExecutarAberto(false) }}
        />
      </div>
    </PaginaGlobal>
  )
}
