import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  Warning,
  Clock,
  Tag,
  Database,
  Buildings,
  SpinnerGap,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { useShellStore } from '@gravity/shell'
import { adminNcmApi, type NcmSyncLogApi, type NcmSyncStatusApi } from '../../services/api-client'
import { ModalAgendamentoSincronizacaoNcm } from './ModalNcmAgendamentoSincronizacao'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDuracao(log: NcmSyncLogApi): string {
  if (!log.data_inicio_ncm_sync_log || !log.data_conclusao_ncm_sync_log) return '—'
  const ms = new Date(log.data_conclusao_ncm_sync_log).getTime() - new Date(log.data_inicio_ncm_sync_log).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms / 60_000)}min`
}

function StatusBadge({ status }: { status: NcmSyncLogApi['status_ncm_sync_log'] }) {
  const { t } = useTranslation()
  if (status === 'SUCESSO') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
      <CheckCircle size={14} weight="fill" /> {t('admin.ncm.status_sucesso')}
    </span>
  )
  if (status === 'ERRO') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#f87171', fontWeight: 600, fontSize: '0.8rem' }}>
      <XCircle size={14} weight="fill" /> {t('admin.ncm.status_erro')}
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#fbbf24', fontWeight: 600, fontSize: '0.8rem' }}>
      <SpinnerGap size={14} weight="bold" style={{ animation: 'spin 1s linear infinite' }} /> {t('admin.ncm.status_andamento')}
    </span>
  )
}

function OrigemBadge({ origem }: { origem: NcmSyncLogApi['origem_ncm_sync_log'] }) {
  const { t } = useTranslation()
  return (
    <span style={{
      padding: '0.15rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: origem === 'MANUAL' ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.15)',
      color: origem === 'MANUAL' ? '#a5b4fc' : '#94a3b8',
    }}>
      {origem === 'MANUAL' ? t('admin.ncm.origem_manual') : t('admin.ncm.origem_auto')}
    </span>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function NcmIntegracaoAdmin() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)

  const [status, setStatus]     = useState<NcmSyncStatusApi | null>(null)
  const [logs, setLogs]         = useState<NcmSyncLogApi[]>([])
  const [pagina, setPagina]     = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalLogs, setTotalLogs]       = useState(0)
  const [carregando, setCarregando]     = useState(true)
  const [sincronizando, setSincronizando] = useState(false)
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false)
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(false)

  const carregarStatus = useCallback(async () => {
    try {
      const res = await adminNcmApi.getStatus()
      setStatus(res)
    } catch (err) {
      addNotification({ type: 'error', message: t('admin.ncm.notif_erro_status') })
    }
  }, [addNotification, t])

  const carregarHistorico = useCallback(async (pag: number) => {
    try {
      const res = await adminNcmApi.getHistorico({ pagina: pag, por_page: 20 })
      setLogs(res.logs)
      setTotalPaginas(res.paginacao.paginas)
      setTotalLogs(res.paginacao.total)
    } catch (err) {
      addNotification({ type: 'error', message: t('admin.ncm.notif_erro_historico') })
    }
  }, [addNotification, t])

  useEffect(() => {
    async function init() {
      setCarregando(true)
      await Promise.all([carregarStatus(), carregarHistorico(1)])
      // Carregar estado do agendamento para o badge no botão
      adminNcmApi.getSchedule().then(cfg => setAgendamentoAtivo(cfg.ativo)).catch(() => {})
      setCarregando(false)
    }
    init()
  }, [carregarStatus, carregarHistorico])

  const handlePaginaChange = async (pag: number) => {
    setPagina(pag)
    await carregarHistorico(pag)
  }

  // NCM é catálogo global da Receita Federal — sync é único para todo o sistema
  // (sem id_organizacao). Backend chama o serviço Cadastros via REST.
  const handleSync = async () => {
    setSincronizando(true)
    try {
      await adminNcmApi.triggerSync()
      addNotification({ type: 'success', message: t('admin.ncm.notif_sync_ok') })
      await Promise.all([carregarStatus(), carregarHistorico(pagina)])
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : t('admin.ncm.notif_erro_sync'),
      })
    } finally {
      setSincronizando(false)
    }
  }

  // ── Colunas da tabela de histórico ─────────────────────────────────────────

  const COLUNAS: TabelaGlobalColuna<NcmSyncLogApi>[] = [
    {
      key: 'data_inicio_ncm_sync_log',
      label: t('admin.ncm.col_data'),
      tipo: 'periodo',
      tooltipTitulo: 'Início da sincronização',
      tooltipDescricao: 'Data e hora em que o processo de sincronização foi iniciado.',
      render: (v) => <span style={{ color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>{formatDate(v)}</span>,
    },
    {
      key: 'origem_ncm_sync_log',
      label: t('admin.ncm.col_origem'),
      tipo: 'texto',
      tooltipTitulo: 'Origem da sincronização',
      tooltipDescricao: 'Indica se foi disparada pelo job automático diário ou manualmente por um administrador.',
      render: (_v, row) => <OrigemBadge origem={row.origem_ncm_sync_log} />,
    },
    {
      key: 'total_ncm_sync_log',
      label: t('admin.ncm.col_total'),
      tipo: 'numero',
      tooltipTitulo: 'Total processado',
      tooltipDescricao: 'Quantidade de NCMs processados nesta sincronização.',
      render: (v) => <span style={{ color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>{(v as number).toLocaleString('pt-BR')}</span>,
    },
    {
      key: 'adicionados_ncm_sync_log',
      label: t('admin.ncm.col_adicionados'),
      tipo: 'numero',
      tooltipTitulo: 'Novos NCMs',
      tooltipDescricao: 'Códigos NCM que não existiam no cache e foram inseridos.',
      render: (v) => (
        <span style={{ color: v ? '#34d399' : '#475569', fontVariantNumeric: 'tabular-nums', fontWeight: v ? 700 : 400 }}>
          {v ? `+${(v as number).toLocaleString('pt-BR')}` : '—'}
        </span>
      ),
    },
    {
      key: 'alterados_ncm_sync_log',
      label: t('admin.ncm.col_alterados'),
      tipo: 'numero',
      tooltipTitulo: 'NCMs modificados',
      tooltipDescricao: 'Códigos NCM que tiveram a descrição atualizada.',
      render: (v) => (
        <span style={{ color: v ? '#fbbf24' : '#475569', fontVariantNumeric: 'tabular-nums', fontWeight: v ? 700 : 400 }}>
          {v ? `~${(v as number).toLocaleString('pt-BR')}` : '—'}
        </span>
      ),
    },
    {
      key: 'removidos_ncm_sync_log',
      label: t('admin.ncm.col_removidos'),
      tipo: 'numero',
      tooltipTitulo: 'NCMs removidos',
      tooltipDescricao: 'Códigos NCM que foram desativados por não constarem mais na tabela do Portal Único.',
      render: (v) => (
        <span style={{ color: v ? '#f87171' : '#475569', fontVariantNumeric: 'tabular-nums', fontWeight: v ? 700 : 400 }}>
          {v ? `-${(v as number).toLocaleString('pt-BR')}` : '—'}
        </span>
      ),
    },
    {
      key: 'status_ncm_sync_log',
      label: t('admin.ncm.col_status'),
      tipo: 'texto',
      tooltipTitulo: 'Status da sincronização',
      tooltipDescricao: 'Resultado final da sincronização: Concluído, Erro ou Em andamento.',
      render: (_v, row) => <StatusBadge status={row.status_ncm_sync_log} />,
    },
    {
      key: 'data_conclusao_ncm_sync_log',
      label: t('admin.ncm.col_duracao'),
      tipo: 'texto',
      tooltipTitulo: 'Tempo de execução',
      tooltipDescricao: 'Tempo total decorrido entre início e conclusão da sincronização.',
      render: (_v, row) => (
        <span style={{ color: '#64748b', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {formatDuracao(row)}
        </span>
      ),
    },
  ]

  // ── Alerta de desatualização ────────────────────────────────────────────────

  const alertaDesatualizado = status?.desatualizado && !sincronizando && status?.status !== 'EXECUTANDO' && (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      background: 'rgba(251,191,36,0.1)',
      border: '1px solid rgba(251,191,36,0.3)',
      borderRadius: '0.5rem',
      color: '#fbbf24',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '1.5rem',
    }}>
      <Warning size={18} weight="fill" style={{ flexShrink: 0 }} />
      <span>{t('admin.ncm.alerta_texto', { data: formatDate(status.ultima_sync) })}</span>
    </div>
  )

  const ultimaSyncLabel = status?.ultima_sync
    ? `${formatDate(status.ultima_sync)}${status.status === 'SUCESSO' ? ' ✓' : status.status === 'ERRO' ? ' ✗' : ''}`
    : t('admin.ncm.nunca_sincronizado')

  const statusCorIcone = !status ? '#64748b'
    : status.status === 'SUCESSO' ? '#34d399'
    : status.status === 'ERRO' ? '#f87171'
    : '#fbbf24'

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo={t('admin.ncm.titulo')}
          subtitulo={t('admin.ncm.subtitulo')}
          icone={<ArrowsClockwise size={22} weight="duotone" />}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('admin.ncm.card_ativos')}
            valor={carregando ? '—' : (status?.total_ativos ?? 0).toLocaleString('pt-BR')}
            icone={<Tag size={20} weight="duotone" />}
            cor="#10b981"
          />
          <CardEstatisticaGlobal
            titulo={t('admin.ncm.card_ultima_sync')}
            valor={carregando ? '—' : ultimaSyncLabel}
            icone={<Clock size={20} weight="duotone" />}
            cor={statusCorIcone}
          />
          <CardEstatisticaGlobal
            titulo={t('admin.ncm.card_erros')}
            valor={carregando ? '—' : String(status?.erros_48h ?? 0)}
            icone={<Database size={20} weight="duotone" />}
            cor={status?.erros_48h ? '#f87171' : '#34d399'}
          />
        </>
      }
      toolbar={
        <>
          <style>{`
            @keyframes ws-pulse-active {
              0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
              70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
              100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
          `}</style>
          {alertaDesatualizado}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Database weight="duotone" size={14} color="#818cf8" />
              {t('admin.ncm.historico_titulo', { count: totalLogs.toLocaleString('pt-BR') })}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setModalAgendamentoAberto(true)}
                aria-label={t('admin.ncm.btn_agendamento')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  height: '2.5rem', padding: '0 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                  background: agendamentoAtivo ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                  border: `1px solid ${agendamentoAtivo ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                  color: agendamentoAtivo ? '#10b981' : '#818cf8',
                  cursor: 'pointer', transition: 'all 0.2s',
                  animation: agendamentoAtivo ? 'ws-pulse-active 2s infinite' : 'none',
                }}
              >
                <Clock size={15} weight={agendamentoAtivo ? 'fill' : 'regular'} />
                {t('admin.ncm.btn_agendamento')}
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px',
                  background: agendamentoAtivo ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                  color: agendamentoAtivo ? '#10b981' : '#64748b',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {agendamentoAtivo ? t('admin.ncm.badge_ativo') : t('admin.ncm.badge_inativo')}
                </span>
              </button>
              <BotaoGlobal
                variante="primario"
                tamanho="md"
                icone={sincronizando
                  ? <SpinnerGap size={16} weight="bold" style={{ animation: 'spin 1s linear infinite' }} />
                  : <ArrowsClockwise size={16} weight="bold" />
                }
                onClick={handleSync}
                disabled={sincronizando}
              >
                {sincronizando ? t('admin.ncm.btn_sincronizando') : t('admin.ncm.btn_sincronizar')}
              </BotaoGlobal>
            </div>
          </div>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <TabelaGlobal<NcmSyncLogApi>
            colunas={COLUNAS}
            dados={logs}
            carregando={carregando}
            paginacao={totalPaginas > 1 ? {
              paginaAtual: pagina,
              totalPaginas,
              onPaginaChange: handlePaginaChange,
            } : undefined}
          />
        </div>

        <ModalAgendamentoSincronizacaoNcm
          aberto={modalAgendamentoAberto}
          aoFechar={() => {
            setModalAgendamentoAberto(false)
            adminNcmApi.getSchedule()
              .then(cfg => setAgendamentoAtivo(cfg.ativo))
              .catch(() => {})
          }}
          aoMudarStatus={(ativo) => setAgendamentoAtivo(ativo)}
        />
      </div>
    </PaginaGlobal>
  )
}
