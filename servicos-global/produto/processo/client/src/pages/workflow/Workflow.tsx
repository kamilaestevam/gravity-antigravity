/**
 * Workflow.tsx — Tela principal de Workflow do Processo
 *
 * Segue padroes do Configurador:
 * - PaginaGlobal com layout="lista"
 * - CabecalhoGlobal com icone Phosphor duotone size={22}
 * - CardBasicoGlobal com periodos para estimativas de custo
 * - TooltipGlobal em campos/acoes nao-obvios
 * - CampoGeralGlobal para input de comentario
 * - ModalConfirmarExcluirGlobal para confirmacao de exclusao
 * - useShellStore para addNotification
 * - StatusBadgeGlobal para status de etapas
 * - BotaoGlobal com variantes corretas
 * - Stepper: circulos 2rem, min-width 2rem, flex-shrink 0
 * - CSS variables, ws-fade-up, empty states, loading skeleton
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { useShellStore } from '@gravity/shell'
import {
  FlowArrow,
  ChatText,
  File as FileIcon,
  Envelope,
  Robot,
  Check,
  Trash,
  PaperPlaneRight,
  CurrencyDollar,
  Package,
  Truck,
  ShieldCheck,
  Clock,
  Warning,
  Empty,
  ArrowsClockwise,
  ClipboardText,
  Anchor,
  House,
  FolderOpen,
  Trophy,
  PencilSimple,
} from '@phosphor-icons/react'

// Mapa de icone por ordem da etapa — Abertura → Entrega.
// Espelha o padrao do BID Frete (icone semantico em cada step do timeline).
// Size 18 ajustado para a nova caixa de 40px.
const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <FolderOpen   weight="duotone" size={18} />, // Abertura
  2: <Package      weight="duotone" size={18} />, // Pedido
  3: <ClipboardText weight="duotone" size={18} />, // LI
  4: <Anchor       weight="duotone" size={18} />, // Embarque
  5: <ShieldCheck  weight="duotone" size={18} />, // Desembaraco
  6: <House        weight="duotone" size={18} />, // Entrega
}
import { useProcesso } from '../ProcessoLayout'
import { getFollowUps, createFollowUp, deleteDocumento } from '../../shared/api'
import type { FollowUp, FilterFollowUp } from '../../shared/types'
import './Workflow.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

const getInitials = (nome: string) =>
  nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

// ─── Helpers de timeline (agrupamento por data + tempo relativo) ───────────

/** Bucket de data: "Hoje", "Ontem", "Há N dias", "MARÇO 2026", "MAR/24" */
const dateBucket = (iso: string, today: Date): string => {
  const d = new Date(iso)
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffDays = Math.round((todayDay.getTime() - day.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays > 1 && diffDays <= 6) return `Há ${diffDays} dias`
  if (today.getFullYear() === d.getFullYear()) {
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()
  }
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase()
}

/** Tempo relativo curto: "agora", "5 min", "3h", "2d", "1sem", "DD/MM" */
const relativeTime = (iso: string, today: Date): string => {
  const d = new Date(iso)
  const diffSec = Math.round((today.getTime() - d.getTime()) / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDays = Math.round(diffHr / 24)
  if (diffSec < 60) return 'agora'
  if (diffMin < 60) return `${diffMin} min`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.round(diffDays / 7)}sem`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** Cor da categoria — pontinho no header do item */
const CATEGORIA_COR: Record<string, string> = {
  geral:       '#94a3b8',
  financeiro:  '#f59e0b',
  documental:  '#22d3ee',
  operacional: '#a78bfa',
  cliente:     '#34d399',
}

const TIPO_LABELS: Record<string, string> = {
  comentario: 'Comentario',
  alteracao_status: 'Status',
  documento: 'Documento',
  email: 'Email',
  sistema: 'Sistema',
}

const CATEGORIA_LABELS: Record<string, string> = {
  geral: 'Geral',
  financeiro: 'Financeiro',
  documental: 'Documental',
  operacional: 'Operacional',
  cliente: 'Cliente',
}

const CATEGORIAS = ['geral', 'financeiro', 'documental', 'operacional', 'cliente'] as const

// Mock de follow-ups — usado como fallback quando a API falha (modo dev sem
// backend). Conta a historia do processo: Abertura -> Pedido -> LI -> Embarque.
// Cada entrada tem id_organizacao e processo_id apontando para o MOCK_PROCESSO.
const MOCK_FOLLOWUPS: FollowUp[] = [
  { id: 'fu-12', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'sys', user_nome: 'Sistema Gravity',
    tipo: 'sistema', categoria: 'operacional', titulo: 'Etapa Embarque iniciada',
    descricao: 'O processo avançou para a etapa de Embarque. Container ZIMU2042389 saiu do depósito do exportador em direção ao porto.',
    created_at: '2026-03-15T08:30:00Z' },
  { id: 'fu-11', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-marina', user_nome: 'Marina Albuquerque',
    tipo: 'comentario', categoria: 'operacional', titulo: 'Container chegou ao porto de Shanghai',
    descricao: 'Confirmado pelo agente da Maersk em SHA. Aguardando booking do navio MSKU-1234567 (ETD 18/03).',
    created_at: '2026-03-14T17:42:00Z' },
  { id: 'fu-10', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'sys', user_nome: 'Sistema Gravity',
    tipo: 'documento', categoria: 'documental', titulo: 'BL_MSKU1234567.pdf anexado',
    descricao: 'Bill of Lading recebido do armador (Maersk). 305 KB.',
    created_at: '2026-03-15T11:05:00Z' },
  { id: 'fu-09', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-rafael', user_nome: 'Rafael Mendes',
    tipo: 'email', categoria: 'cliente', titulo: 'Aviso de embarque enviado',
    descricao: 'Cliente Acme Importações notificado por e-mail (contato@acme.com.br) sobre o embarque previsto para 14/03/26.',
    created_at: '2026-03-13T10:15:00Z' },
  { id: 'fu-08', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-rafael', user_nome: 'Rafael Mendes',
    tipo: 'comentario', categoria: 'financeiro', titulo: 'Cotação de frete travada',
    descricao: 'Cotação de US$ 4.200 confirmada com o agente. Diferença de +4% vs estimativa inicial — registrado em Estimativa de Custos.',
    created_at: '2026-03-10T14:20:00Z' },
  { id: 'fu-07', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'sys', user_nome: 'Sistema Gravity',
    tipo: 'alteracao_status', categoria: 'operacional', titulo: 'LI deferida',
    descricao: 'Licença de Importação aprovada pelo SISCOMEX. Processo liberado para embarque.',
    created_at: '2026-02-20T09:00:00Z' },
  { id: 'fu-06', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-juliana', user_nome: 'Juliana Costa',
    tipo: 'documento', categoria: 'documental', titulo: 'CO_Shanghai_Electronics.pdf anexado',
    descricao: 'Certificado de Origem (Form A) emitido pela CCPIT. Necessário para usufruir do benefício tarifário.',
    created_at: '2026-02-15T16:10:00Z' },
  { id: 'fu-05', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'sys', user_nome: 'Sistema Gravity',
    tipo: 'documento', categoria: 'documental', titulo: 'Packing_List_PO2026001.pdf anexado',
    descricao: 'Recebido do exportador. 125 KB. NCM 8517.62.99 — Equipamentos de comunicação.',
    created_at: '2026-02-09T11:30:00Z' },
  { id: 'fu-04', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-juliana', user_nome: 'Juliana Costa',
    tipo: 'comentario', categoria: 'documental', titulo: 'LI registrada no SISCOMEX',
    descricao: 'Protocolo nº 26/0123456-7. Status: em análise. Prazo médio do anuente: 15 dias úteis.',
    created_at: '2026-02-05T08:45:00Z' },
  { id: 'fu-03', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-rafael', user_nome: 'Rafael Mendes',
    tipo: 'email', categoria: 'cliente', titulo: 'Confirmação de pedido enviada ao exportador',
    descricao: 'Email para sales@shanghai-electronics.com.cn confirmando PO #PO2026001, valor FOB US$ 108.050,00, condição CIF Santos.',
    created_at: '2026-01-20T15:00:00Z' },
  { id: 'fu-02', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'sys', user_nome: 'Sistema Gravity',
    tipo: 'documento', categoria: 'documental', titulo: 'Invoice_Proforma_PO2026001.pdf anexado',
    descricao: 'Recebido do exportador. 245 KB. Valor total US$ 108.050,00.',
    created_at: '2026-01-19T10:00:00Z' },
  { id: 'fu-01', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', user_id: 'u-rafael', user_nome: 'Rafael Mendes',
    tipo: 'sistema', categoria: 'geral', titulo: 'Processo criado',
    descricao: 'Processo IMP-2026/0150 aberto por Rafael Mendes. Importador: Acme Importações Ltda. Exportador: Shanghai Electronics Co.',
    created_at: '2026-01-10T09:00:00Z' },
]

const CUSTO_ICONS: Record<string, React.ReactNode> = {
  frete: <Truck weight="duotone" size={16} />,
  seguro: <ShieldCheck weight="duotone" size={16} />,
  impostos: <CurrencyDollar weight="duotone" size={16} />,
  despachante: <Package weight="duotone" size={16} />,
}

// ─── Componente ─────────────────────────────────────────────────────────────

export default function Workflow() {
  const { t } = useTranslation()
  const { processo, loading, refetch } = useProcesso()
  const addNotification = useShellStore((state) => state.addNotification)

  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [followUpsLoading, setFollowUpsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterFollowUp>({})
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [docToDelete, setDocToDelete] = useState<{ id: string; nome: string } | null>(null)

  const idOrganizacao = processo?.id_organizacao ?? ''
  const processoId = processo?.id ?? ''

  // ─── Fetch Follow-ups ───────────────────────────────────────────────

  const fetchFollowUps = useCallback(async () => {
    if (!idOrganizacao || !processoId) return
    setFollowUpsLoading(true)
    // Modo mock (sem backend) — detectado pelos identificadores da MOCK_PROCESSO
    // em ProcessoLayout (tenant-demo / core_id_000001). Pula a API direto.
    const isMock = idOrganizacao === 'tenant-demo' || processoId.startsWith('core_id_')
    if (isMock) {
      const filtrados = filter.categoria
        ? MOCK_FOLLOWUPS.filter(fu => fu.categoria === filter.categoria)
        : MOCK_FOLLOWUPS
      setFollowUps(filtrados)
      setFollowUpsLoading(false)
      return
    }
    try {
      const data = await getFollowUps(idOrganizacao, processoId, filter)
      setFollowUps(data)
    } catch {
      // Fallback: se a API falhar tambem cai no mock (defesa em profundidade).
      const filtrados = filter.categoria
        ? MOCK_FOLLOWUPS.filter(fu => fu.categoria === filter.categoria)
        : MOCK_FOLLOWUPS
      setFollowUps(filtrados)
    } finally {
      setFollowUpsLoading(false)
    }
  }, [idOrganizacao, processoId, filter])

  useEffect(() => {
    fetchFollowUps()
  }, [fetchFollowUps])

  // ─── Add Comment ────────────────────────────────────────────────────

  const handleAddComment = async () => {
    if (!comment.trim() || submitting) return
    setSubmitting(true)
    try {
      await createFollowUp(idOrganizacao, processoId, {
        tipo: 'comentario',
        categoria: 'geral',
        titulo: 'Comentario',
        descricao: comment.trim(),
      })
      setComment('')
      await fetchFollowUps()
      addNotification({ type: 'success', message: 'Comentario adicionado com sucesso' })
    } catch {
      addNotification({ type: 'danger', message: 'Erro ao adicionar comentario' })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Delete Document ────────────────────────────────────────────────

  const handleConfirmDeleteDoc = async () => {
    if (!docToDelete) return
    try {
      await deleteDocumento(idOrganizacao, docToDelete.id)
      addNotification({ type: 'success', message: 'Documento excluido com sucesso' })
      setDocToDelete(null)
      refetch()
    } catch {
      addNotification({ type: 'danger', message: 'Erro ao excluir documento' })
    }
  }

  // ─── Filter Toggle ──────────────────────────────────────────────────

  const toggleFilter = (key: keyof FilterFollowUp, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }))
  }

  // ─── Loading Skeleton ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="wf-loading">
        <div className="wf-skeleton-stepper">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="wf-skeleton-step">
              <div className="wf-skeleton-circle" />
              <div className="wf-skeleton-label" />
            </div>
          ))}
        </div>
        <div className="wf-skeleton-content">
          <div className="wf-skeleton-block wf-skeleton-block--lg" />
          <div className="wf-skeleton-block wf-skeleton-block--sm" />
        </div>
      </div>
    )
  }

  // ─── Empty State ────────────────────────────────────────────────────

  if (!processo) {
    return (
      <div className="wf-empty-state ws-fade-up">
        <FlowArrow weight="duotone" size={48} className="wf-empty-icon" />
        <p className="wf-empty-title">{t('processo.workflow.sem_processo', 'Nenhum processo selecionado')}</p>
        <p className="wf-empty-desc">{t('processo.workflow.sem_processo_desc', 'Selecione um processo para visualizar o workflow')}</p>
      </div>
    )
  }

  const etapas = [...(processo.etapas ?? [])].sort((a, b) => a.ordem - b.ordem)
  const documentos = processo.documentos ?? []
  const custos = processo.estimativasCusto ?? []

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<FlowArrow weight="duotone" size={22} />}
          titulo={`Workflow — ${processo.numero}`}
          subtitulo={`${processo.importador_nome} | ${processo.exportador_nome}`}
        />
      }
    >
      {/* ─── Timeline (cabecalho + stepper) — padrao BID Frete ───────────────── */}
      {(() => {
        // Status: NO PRAZO se data_chegada e futura/igual hoje; ATRASADO se passou.
        const hoje = new Date()
        const chegada = processo.data_chegada ? new Date(processo.data_chegada) : null
        const concluido = processo.status === 'concluido'
        const atrasado = chegada !== null && chegada < hoje && !concluido
        const exibeBadge = chegada !== null
        return (
          <div className="wf-timeline ws-fade-up">
            <div className="wf-timeline-header">
              <div className="wf-timeline-status">
                <Clock weight="duotone" size={18} className="wf-timeline-status-icon" />
                <div className="wf-timeline-info">
                  <span className="wf-timeline-label">{t('processo.workflow.previsao_chegada', 'Previsão de chegada')}</span>
                  <span className="wf-timeline-date">{chegada ? formatDate(processo.data_chegada!) : '—'}</span>
                </div>
                {exibeBadge && (
                  <span className={`wf-timeline-badge ${atrasado ? 'wf-timeline-badge--overdue' : 'wf-timeline-badge--ontime'}`}>
                    {atrasado ? t('processo.workflow.atrasado', 'Atrasado') : t('processo.workflow.no_prazo', 'No prazo')}
                  </span>
                )}
              </div>
              <div className="wf-timeline-actions">
                <TooltipGlobal
                  titulo={t('processo.workflow.atualizar', 'Atualizar dados')}
                  descricao={t('processo.workflow.atualizar_desc', 'Recarregar informações do workflow')}
                >
                  <button
                    type="button"
                    className="wf-timeline-action-btn"
                    onClick={refetch}
                    aria-label={t('processo.workflow.atualizar', 'Atualizar dados')}
                  >
                    <ArrowsClockwise weight="duotone" size={16} />
                  </button>
                </TooltipGlobal>
              </div>
            </div>

            <div className="wf-stepper">
              {etapas.map((etapa, idx) => {
                const isDone = etapa.status === 'concluida'
                const isActive = etapa.status === 'em_andamento'
                const prevDone = idx > 0 && (etapas[idx - 1].status === 'concluida')

                // Conector que ENTRA nesta etapa (a esquerda):
                //   done = ambos os lados concluidos (verde solido)
                //   active = passo anterior done + este ativo (gradiente verde -> roxo)
                //   default = transparente/muted
                const connectorClass = isDone
                  ? 'wf-connector--done'
                  : (isActive && prevDone)
                    ? 'wf-connector--active'
                    : prevDone ? 'wf-connector--done' : ''
                return (
                  <React.Fragment key={etapa.id}>
                    {idx > 0 && (
                      <div className={`wf-connector ${connectorClass}`} />
                    )}
                    <div className="wf-step">
                      <TooltipGlobal
                        titulo={etapa.nome}
                        descricao={
                          isDone
                            ? `${t('processo.workflow.concluida_em', 'Concluída em')} ${etapa.data_conclusao ? formatDate(etapa.data_conclusao) : '—'}`
                            : isActive
                              ? t('processo.workflow.em_andamento', 'Etapa em andamento')
                              : t('processo.workflow.pendente', 'Etapa pendente')
                        }
                      >
                        <div className={`wf-step-circle ${
                          isDone ? 'wf-step-circle--done' :
                          isActive ? 'wf-step-circle--active' :
                          'wf-step-circle--pending'
                        }`}>
                          {isDone ? (
                            <Check size={14} weight="bold" />
                          ) : (
                            STEP_ICONS[etapa.ordem] ?? <span>{etapa.ordem}</span>
                          )}
                        </div>
                      </TooltipGlobal>
                      <span className={`wf-step-label ${
                        isDone ? 'wf-step-label--done' :
                        isActive ? 'wf-step-label--active' : ''
                      }`}>
                        {etapa.nome}
                      </span>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ─── Painel de Insights — padrao BID Frete (3 cards) ──────────────────── */}
      {(() => {
        // Tempo de transito (dias) entre embarque e chegada — null se faltar data.
        const embarque = processo.data_embarque ? new Date(processo.data_embarque) : null
        const chegada = processo.data_chegada ? new Date(processo.data_chegada) : null
        const transitoDias = (embarque && chegada)
          ? Math.max(0, Math.round((chegada.getTime() - embarque.getTime()) / (1000 * 60 * 60 * 24)))
          : null
        const etapaAtual = etapas.find(e => e.status === 'em_andamento')
        const etapasTotal = etapas.length
        const etapasConcluidas = etapas.filter(e => e.status === 'concluida').length
        const moedaFob = processo.moeda_fob || 'USD'
        const valorFob = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moedaFob }).format(processo.valor_fob_total || 0)
        const pesoBruto = processo.peso_bruto_total
          ? `${processo.peso_bruto_total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`
          : '—'

        return (
          <div className="wf-insights ws-fade-up">
            <div className="wf-insights-title">{t('processo.workflow.insights', 'Painel de Insights')}</div>
            <div className="wf-insights-grid">

              {/* Card 1 — Valor FOB da mercadoria */}
              <div className="wf-insight-card">
                <div className="wf-insight-card-header">
                  <span className="wf-insight-card-label">{t('processo.workflow.valor_fob', 'Valor FOB total')}</span>
                  <Trophy weight="fill" size={20} className="wf-insight-card-icon" style={{ color: '#facc15' }} />
                </div>
                <div className="wf-insight-card-metric">{valorFob}</div>
                <div className="wf-insight-card-stats">
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.peso_bruto', 'Peso bruto')}</div>
                    <div className="wf-insight-stat-value">{pesoBruto}</div>
                  </div>
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.incoterm', 'Incoterm')}</div>
                    <div className="wf-insight-stat-value">{processo.incoterm || '—'}</div>
                  </div>
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.canal', 'Canal')}</div>
                    <div className="wf-insight-stat-value" style={{ textTransform: 'capitalize' }}>{processo.canal || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Card 2 — Tempo de transito */}
              <div className="wf-insight-card">
                <div className="wf-insight-card-header">
                  <span className="wf-insight-card-label">{t('processo.workflow.tempo_transito', 'Tempo de trânsito')}</span>
                  <Clock weight="fill" size={20} className="wf-insight-card-icon" style={{ color: '#a78bfa' }} />
                </div>
                <div className="wf-insight-card-metric">
                  {transitoDias !== null ? `${transitoDias} ${transitoDias === 1 ? 'dia' : 'dias'}` : '—'}
                </div>
                <div className="wf-insight-card-stats">
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.embarque', 'Embarque')}</div>
                    <div className="wf-insight-stat-value">{embarque ? formatDate(processo.data_embarque!) : '—'}</div>
                  </div>
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.chegada', 'Chegada')}</div>
                    <div className="wf-insight-stat-value">{chegada ? formatDate(processo.data_chegada!) : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Card 3 — Progresso */}
              <div className="wf-insight-card">
                <div className="wf-insight-card-header">
                  <span className="wf-insight-card-label">{t('processo.workflow.progresso', 'Progresso')}</span>
                  <FlowArrow weight="fill" size={20} className="wf-insight-card-icon" style={{ color: '#10b981' }} />
                </div>
                <div className="wf-insight-card-metric">{etapasConcluidas}/{etapasTotal}</div>
                <div className="wf-insight-card-stats">
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.etapa_atual', 'Etapa atual')}</div>
                    <div className="wf-insight-stat-value">{etapaAtual?.nome || '—'}</div>
                  </div>
                  <div className="wf-insight-stat">
                    <div className="wf-insight-stat-label">{t('processo.workflow.concluido', 'Concluído')}</div>
                    <div className="wf-insight-stat-value">{etapasTotal > 0 ? Math.round((etapasConcluidas / etapasTotal) * 100) : 0}%</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )
      })()}

      {/* ─── Conteudo em 2 colunas ─────────────────────── */}
      <div className="wf-content">
        {/* ─── Coluna Esquerda: Follow-ups ──────────────── */}
        <div className="wf-followup-section ws-fade-up">
          <div className="wf-followup-header">
            <span className="wf-followup-title">{t('processo.workflow.followup', 'Follow-up')}</span>

            {/* Pill Tabs para filtro de categoria */}
            <div className="wf-tabs-pill">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  className={`wf-tab-pill ${filter.categoria === cat ? 'wf-tab-pill--active' : ''}`}
                  onClick={() => toggleFilter('categoria', cat)}
                  type="button"
                >
                  {CATEGORIA_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="wf-feed">
            {followUpsLoading && (
              <div className="wf-feed-skeleton">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="wf-feed-skeleton-item">
                    <div className="wf-skeleton-avatar" />
                    <div className="wf-skeleton-lines">
                      <div className="wf-skeleton-line wf-skeleton-line--md" />
                      <div className="wf-skeleton-line wf-skeleton-line--lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!followUpsLoading && followUps.length === 0 && (
              <div className="wf-feed-empty ws-fade-up">
                <ChatText weight="duotone" size={32} className="wf-feed-empty-icon" />
                <p>{t('processo.workflow.followup_vazio', 'Nenhum follow-up registrado ainda')}</p>
              </div>
            )}

            {!followUpsLoading && followUps.length > 0 && (() => {
              // Agrupa os follow-ups por bucket de data — preserva a ordem
              // original (mais novo no topo) usando array de grupos.
              const today = new Date()
              const grupos: { bucket: string; items: typeof followUps }[] = []
              let lastBucket = ''
              for (const fu of followUps) {
                const b = dateBucket(fu.created_at, today)
                if (b !== lastBucket) {
                  grupos.push({ bucket: b, items: [] })
                  lastBucket = b
                }
                grupos[grupos.length - 1].items.push(fu)
              }
              let globalIdx = 0
              return grupos.map(g => (
                <div className="wf-feed-group" key={g.bucket}>
                  <div className="wf-feed-group-header">{g.bucket}</div>
                  <ul className="wf-feed-timeline">
                    {g.items.map(fu => {
                      const idx = globalIdx++
                      return (
                        <li
                          className="wf-feed-item ws-fade-up"
                          key={fu.id}
                          style={{ animationDelay: `${idx * 0.04}s` }}
                        >
                          <div className={`wf-feed-avatar wf-feed-avatar--${fu.tipo}`}>
                            {fu.tipo === 'sistema' ? (
                              <Robot size={14} weight="duotone" />
                            ) : fu.tipo === 'email' ? (
                              <Envelope size={14} weight="duotone" />
                            ) : fu.tipo === 'documento' ? (
                              <FileIcon size={14} weight="duotone" />
                            ) : (
                              getInitials(fu.user_nome)
                            )}
                          </div>
                          <div className="wf-feed-body">
                            <div className="wf-feed-meta">
                              <span
                                className="wf-feed-cat-dot"
                                style={{ background: CATEGORIA_COR[fu.categoria] }}
                                title={CATEGORIA_LABELS[fu.categoria]}
                              />
                              <span className="wf-feed-nome">{fu.user_nome}</span>
                              <span className="wf-feed-tipo">
                                {TIPO_LABELS[fu.tipo]?.toLowerCase() ?? fu.tipo}
                              </span>
                              <time
                                className="wf-feed-time"
                                dateTime={fu.created_at}
                                title={formatDateTime(fu.created_at)}
                              >
                                {relativeTime(fu.created_at, today)}
                              </time>
                            </div>
                            <div className="wf-feed-titulo">{fu.titulo}</div>
                            <div className="wf-feed-descricao">{fu.descricao}</div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))
            })()}
          </div>

          {/* Caixa de Comentario */}
          <div className="wf-comment-box">
            <CampoGeralGlobal
              label={t('processo.workflow.novo_comentario', 'Novo comentário')}
              tooltipTitulo={t('processo.workflow.comentario', 'Comentário')}
              tooltipDescricao={t('processo.workflow.comentario_desc', 'Adicione observações visíveis para a equipe')}
              className="wf-comment-field"
            >
              <textarea
                className="wf-comment-input"
                placeholder={t('processo.workflow.comentario_placeholder', 'Adicionar comentário...')}
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
            </CampoGeralGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<PaperPlaneRight weight="duotone" size={16} />}
              onClick={handleAddComment}
              disabled={submitting || !comment.trim()}
              className="wf-comment-submit"
            >
              {t('comum.enviar', 'Enviar')}
            </BotaoGlobal>
          </div>
        </div>

        {/* ─── Coluna Direita: Custos + Documentos ─────── */}
        <div className="wf-right-panel">
          {/* Estimativas de Custo — lista vertical com status + variacao real vs estimado */}
          <div className="wf-custos-section ws-fade-up">
            <h3 className="wf-section-title">{t('processo.workflow.estimativa_custos', 'Estimativa de Custos')}</h3>
            {custos.length === 0 ? (
              <div className="wf-panel-empty">
                <CurrencyDollar weight="duotone" size={28} className="wf-panel-empty-icon" />
                <p>{t('processo.workflow.sem_estimativa', 'Nenhuma estimativa cadastrada')}</p>
              </div>
            ) : (
              <div className="wf-custos-list">
                {custos.map(c => {
                  const fmtMoney = (val: number) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: c.moeda || 'BRL',
                    }).format(val)
                  const hasReal = c.valor_real != null
                  const variacao = hasReal
                    ? ((c.valor_real! - c.valor_estimado) / c.valor_estimado) * 100
                    : null
                  // Semantica de custo: 'up' (real maior que estimado) = ruim/vermelho.
                  const direcao: 'up' | 'down' | 'neutral' = variacao === null
                    ? 'neutral'
                    : variacao > 0.5 ? 'up'
                    : variacao < -0.5 ? 'down'
                    : 'neutral'
                  // Status + Real + observacoes ficam no titulo do tooltip — mantem
                  // a info acessivel sem sobrecarregar o card.
                  const statusLabel = c.status === 'estimado'
                    ? t('processo.workflow.status_estimado', 'Estimado')
                    : c.status === 'confirmado'
                      ? t('processo.workflow.status_confirmado', 'Confirmado')
                      : t('processo.workflow.status_pago', 'Pago')
                  const tooltipDesc = [
                    `${t('comum.status', 'Status')}: ${statusLabel}`,
                    hasReal ? `${t('processo.workflow.custo_real', 'Real')}: ${fmtMoney(c.valor_real!)}` : t('processo.workflow.aguardando_real', 'Aguardando valor real'),
                    c.data_vencimento ? `${t('processo.workflow.vencimento', 'Vencimento')}: ${formatDate(c.data_vencimento)}` : null,
                    c.observacoes || null,
                  ].filter(Boolean).join(' · ')
                  return (
                    <div key={c.id} className="wf-custo-item">
                      <TooltipGlobal titulo={c.categoria} descricao={tooltipDesc}>
                        <div className="wf-custo-item-header">
                          <span className="wf-custo-item-icon">
                            {CUSTO_ICONS[c.categoria.toLowerCase()] ?? <CurrencyDollar weight="duotone" size={16} />}
                          </span>
                          <span className="wf-custo-item-label">{c.categoria}</span>
                          {hasReal && (
                            <span className={`wf-custo-item-var wf-custo-item-var--${direcao}`}>
                              {direcao === 'up' && '↑'}
                              {direcao === 'down' && '↓'}
                              {direcao === 'neutral' && '→'}
                              {' '}{Math.abs(variacao!).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </TooltipGlobal>
                      <div className="wf-custo-item-metric">{fmtMoney(c.valor_estimado)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="wf-docs-section ws-fade-up">
            <h3 className="wf-section-title">
              {t('processo.workflow.documentos', 'Documentos')}
              {documentos.length > 0 && (
                <span className="wf-section-count">{documentos.length}</span>
              )}
            </h3>
            {documentos.length === 0 ? (
              <div className="wf-panel-empty">
                <FileIcon weight="duotone" size={28} className="wf-panel-empty-icon" />
                <p>{t('processo.workflow.sem_documentos', 'Nenhum documento anexado')}</p>
              </div>
            ) : (
              <div className="wf-docs-list">
                {documentos.map(doc => {
                  // Meta detalhada vive no atributo title nativo do navegador —
                  // evita a caixa do TooltipGlobal cobrindo cards vizinhos.
                  const titleAttr = `${doc.nome}\n${doc.tipo.toUpperCase()} · ${formatDate(doc.created_at)} · ${(doc.tamanho_bytes / 1024).toFixed(0)} KB`
                  return (
                  <div key={doc.id} className="wf-doc-item">
                    <div className="wf-doc-trigger" title={titleAttr}>
                      <div className="wf-doc-icon">
                        <FileIcon size={16} weight="duotone" />
                      </div>
                      <div className="wf-doc-nome">{doc.nome}</div>
                    </div>
                    <div className="wf-doc-actions">
                      <TooltipGlobal
                        titulo={t('processo.workflow.editar_doc', 'Editar documento')}
                        descricao={t('processo.workflow.editar_doc_desc', 'Renomear ou trocar este documento')}
                      >
                        <button
                          className="wf-doc-action"
                          onClick={() => { /* TODO: abrir modal de edicao do documento */ }}
                          type="button"
                          aria-label={t('processo.workflow.editar_doc', 'Editar documento')}
                        >
                          <PencilSimple size={14} weight="duotone" />
                        </button>
                      </TooltipGlobal>
                      <TooltipGlobal
                        titulo={t('processo.workflow.excluir_doc', 'Excluir documento')}
                        descricao={t('processo.workflow.excluir_doc_desc', 'Remover este documento do processo')}
                      >
                        <button
                          className="wf-doc-action wf-doc-action--delete"
                          onClick={() => setDocToDelete({ id: doc.id, nome: doc.nome })}
                          type="button"
                          aria-label={t('processo.workflow.excluir_doc', 'Excluir documento')}
                        >
                          <Trash size={14} weight="duotone" />
                        </button>
                      </TooltipGlobal>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal de Confirmacao de Exclusao ───────────── */}
      <ModalConfirmarExcluirGlobal
        aberto={!!docToDelete}
        titulo={t('processo.workflow.excluir_doc_modal', 'Excluir Documento')}
        descricao={t('processo.workflow.excluir_doc_confirm', 'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')}
        nomeItem={docToDelete?.nome}
        aoConfirmar={handleConfirmDeleteDoc}
        aoCancelar={() => setDocToDelete(null)}
      />
    </PaginaGlobal>
  )
}
