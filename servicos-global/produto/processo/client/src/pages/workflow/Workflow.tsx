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
import { CardBasicoGlobal } from '@nucleo/card-global'
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
} from '@phosphor-icons/react'
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
    try {
      const data = await getFollowUps(idOrganizacao, processoId, filter)
      setFollowUps(data)
    } catch {
      addNotification({ type: 'danger', message: 'Erro ao carregar follow-ups' })
    } finally {
      setFollowUpsLoading(false)
    }
  }, [idOrganizacao, processoId, filter, addNotification])

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
          acoes={
            <TooltipGlobal
              titulo={t('processo.workflow.atualizar', 'Atualizar dados')}
              descricao={t('processo.workflow.atualizar_desc', 'Recarregar informações do workflow')}
            >
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                onClick={refetch}
              >
                {t('comum.atualizar', 'Atualizar')}
              </BotaoGlobal>
            </TooltipGlobal>
          }
        />
      }
    >
      {/* ─── Timeline Stepper ───────────────────────────── */}
      <div className="wf-stepper ws-fade-up">
        {etapas.map((etapa, idx) => {
          const isDone = etapa.status === 'concluida'
          const isActive = etapa.status === 'em_andamento'
          const prevDone = idx > 0 && (etapas[idx - 1].status === 'concluida')

          return (
            <React.Fragment key={etapa.id}>
              {/* Connector line (before step, except first) */}
              {idx > 0 && (
                <div className={`wf-connector ${prevDone || isDone ? 'wf-connector--done' : ''}`} />
              )}

              {/* Step circle + label */}
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
                      <span>{etapa.ordem}</span>
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

            {!followUpsLoading && followUps.map((fu, idx) => (
              <div
                className="wf-feed-item ws-fade-up"
                key={fu.id}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className={`wf-feed-avatar wf-feed-avatar--${fu.tipo}`}>
                  {fu.tipo === 'sistema' ? (
                    <Robot size={16} weight="duotone" />
                  ) : fu.tipo === 'email' ? (
                    <Envelope size={16} weight="duotone" />
                  ) : (
                    getInitials(fu.user_nome)
                  )}
                </div>
                <div className="wf-feed-body">
                  <div className="wf-feed-meta">
                    <span className="wf-feed-nome">{fu.user_nome}</span>
                    <span className={`wf-feed-tipo wf-feed-tipo--${fu.tipo}`}>
                      {TIPO_LABELS[fu.tipo] ?? fu.tipo}
                    </span>
                    <span className="wf-feed-data">{formatDateTime(fu.created_at)}</span>
                  </div>
                  <div className="wf-feed-titulo">{fu.titulo}</div>
                  <div className="wf-feed-descricao">{fu.descricao}</div>
                </div>
              </div>
            ))}
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
          {/* Estimativas de Custo — CardBasicoGlobal */}
          <div className="wf-custos-section ws-fade-up">
            <h3 className="wf-section-title">{t('processo.workflow.estimativa_custos', 'Estimativa de Custos')}</h3>
            {custos.length === 0 ? (
              <div className="wf-panel-empty">
                <CurrencyDollar weight="duotone" size={28} className="wf-panel-empty-icon" />
                <p>{t('processo.workflow.sem_estimativa', 'Nenhuma estimativa cadastrada')}</p>
              </div>
            ) : (
              <div className="wf-custos-grid">
                {custos.map(c => (
                  <CardBasicoGlobal
                    key={c.id}
                    titulo={c.categoria}
                    icone={CUSTO_ICONS[c.categoria.toLowerCase()] ?? <CurrencyDollar weight="duotone" size={16} />}
                    valor={brl(c.valor_estimado)}
                    periodos={[
                      {
                        periodo: '30d',
                        rotulo: '30 dias',
                        valor: c.valor_real != null
                          ? `${((c.valor_real - c.valor_estimado) / c.valor_estimado * 100).toFixed(0)}%`
                          : '—',
                        direcao: c.valor_real != null
                          ? (c.valor_real > c.valor_estimado ? 'up' : c.valor_real < c.valor_estimado ? 'down' : 'neutral')
                          : 'neutral',
                      },
                    ]}
                    subtexto={
                      c.valor_real != null
                        ? <span className="wf-custo-real">{t('processo.workflow.custo_real', 'Real')}: {brl(c.valor_real)}</span>
                        : <span className="wf-custo-pendente">{t('processo.workflow.aguardando_real', 'Aguardando valor real')}</span>
                    }
                    tooltip={
                      <div className="wf-custo-tooltip">
                        <p>{t('comum.status', 'Status')}: <strong>{c.status === 'estimado' ? t('processo.workflow.status_estimado', 'Estimado') : c.status === 'confirmado' ? t('processo.workflow.status_confirmado', 'Confirmado') : t('processo.workflow.status_pago', 'Pago')}</strong></p>
                        {c.data_vencimento && <p>{t('processo.workflow.vencimento', 'Vencimento')}: {formatDate(c.data_vencimento)}</p>}
                        {c.observacoes && <p>{c.observacoes}</p>}
                      </div>
                    }
                    className="wf-custo-card"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="wf-docs-section ws-fade-up">
            <h3 className="wf-section-title">{t('processo.workflow.documentos', 'Documentos')}</h3>
            {documentos.length === 0 ? (
              <div className="wf-panel-empty">
                <FileIcon weight="duotone" size={28} className="wf-panel-empty-icon" />
                <p>{t('processo.workflow.sem_documentos', 'Nenhum documento anexado')}</p>
              </div>
            ) : (
              <div className="wf-docs-list">
                {documentos.map(doc => (
                  <TooltipGlobal
                    key={doc.id}
                    titulo={doc.nome}
                    descricao={`${doc.tipo.toUpperCase()} - ${(doc.tamanho_bytes / 1024).toFixed(0)} KB`}
                  >
                    <div className="wf-doc-item">
                      <div className="wf-doc-icon">
                        <FileIcon size={16} weight="duotone" />
                      </div>
                      <div className="wf-doc-info">
                        <div className="wf-doc-nome">{doc.nome}</div>
                        <div className="wf-doc-meta">
                          {doc.tipo.toUpperCase()} &middot; {formatDate(doc.created_at)} &middot; {(doc.tamanho_bytes / 1024).toFixed(0)} KB
                        </div>
                      </div>
                      <TooltipGlobal
                        titulo={t('processo.workflow.excluir_doc', 'Excluir documento')}
                        descricao={t('processo.workflow.excluir_doc_desc', 'Remover este documento do processo')}
                      >
                        <button
                          className="wf-doc-delete"
                          onClick={() => setDocToDelete({ id: doc.id, nome: doc.nome })}
                          type="button"
                        >
                          <Trash size={16} weight="duotone" />
                        </button>
                      </TooltipGlobal>
                    </div>
                  </TooltipGlobal>
                ))}
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
