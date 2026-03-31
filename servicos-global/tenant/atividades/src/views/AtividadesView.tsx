// src/views/AtividadesView.tsx
// ============================================================================
// Minhas Atividades — Tasks Board
// Portado do Journey (js/modules/tasks-board.js) para React + TypeScript.
// Suporta: Kanban (4 colunas), Vista Lista (tabela), Filtros, Modal com tabs,
//          Cronômetro, Participantes e CRUD completo.
// ============================================================================

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import '../atividades.css'

// ─── Constantes (espelham o Journey) ─────────────────────────────────────────

const KANBAN_COLS = [
  { key: 'A Fazer',      label: 'A Fazer',      color: '#6366f1', icon: '▷' },
  { key: 'Em Andamento', label: 'Em Andamento', color: '#f59e0b', icon: '↻' },
  { key: 'Concluída',    label: 'Concluída',    color: '#10b981', icon: '✓' },
  { key: 'Cancelada',    label: 'Cancelada',    color: '#64748b', icon: '✕' },
] as const

type KanbanStatus = typeof KANBAN_COLS[number]['key']

const PRIORITY_COLORS: Record<string, string> = {
  urgente: '#ef4444', alta: '#f97316', 'média': '#f59e0b', baixa: '#64748b',
}

const TYPE_CONFIG: Record<string, { color: string }> = {
  'Comentário':      { color: '#64748b' },
  'Reunião':         { color: '#6366f1' },
  'Chamados HD':     { color: '#f59e0b' },
  'Chamados CS':     { color: '#10b981' },
  'Ação necessária': { color: '#f97316' },
  'Tarefa':          { color: '#818cf8' },
  'Outros':          { color: '#64748b' },
}

const TIPOS   = ['Comentário','Reunião','Chamados HD','Chamados CS','Ação necessária','Tarefa','Outros'] as const
const PRIOS   = ['baixa','média','alta','urgente'] as const
const PRIO_LABEL: Record<string, string> = { baixa:'Baixa', 'média':'Média', alta:'Alta', urgente:'Urgente' }
const STATUS_COLORS: Record<string, string> = {
  'A Fazer':'#818cf8','Em Andamento':'#f59e0b','Concluída':'#10b981','Cancelada':'#64748b',
}
const STATUS_BG: Record<string, string> = {
  'A Fazer':'rgba(99,102,241,0.12)','Em Andamento':'rgba(245,158,11,0.12)',
  'Concluída':'rgba(16,185,129,0.12)','Cancelada':'rgba(100,116,139,0.12)',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Participante { user_id: string; user_nome?: string }
interface SessaoTimer  { id: string; iniciado_em: string; duracao_min: number; assunto?: string }

interface Atividade {
  id: string
  titulo: string
  descricao?: string
  tipo: string
  status: string
  prioridade?: string
  data_atividade?: string
  data_vencimento?: string
  tempo_gasto_minutos: number
  proximo_passo_titulo?: string
  proximo_passo_data?: string
  lembrete_em?: string
  lembrete_email: boolean
  lembrete_whatsapp: boolean
  notificar_ao_atribuir: boolean
  processo_id?: string
  participantes: Participante[]
  sessoes_timer: SessaoTimer[]
  user_id?: string
  created_at: string
  updated_at: string
}

type ModalTab = 'informacoes' | 'tempo' | 'proximo-passo' | 'lembrete'
type ViewMode = 'kanban' | 'lista'

interface Filters {
  search: string
  status: string
  prioridade: string
  prazo: string
  dateFrom: string
  dateTo: string
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const API_BASE = '/api/v1/atividades'
const headers = { 'Content-Type': 'application/json' }

async function apiGet(params: Record<string, string> = {}): Promise<Atividade[]> {
  const qs = new URLSearchParams({ assignee: 'me', limit: '200', ...params })
  const r  = await fetch(`${API_BASE}?${qs}`)
  if (!r.ok) throw new Error('Erro ao carregar atividades')
  const body = await r.json()
  return body.data ?? []
}

async function apiCreate(data: Partial<Atividade>): Promise<Atividade> {
  const r = await fetch(API_BASE, { method: 'POST', headers, body: JSON.stringify(data) })
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message ?? 'Erro ao criar') }
  return r.json()
}

async function apiUpdate(id: string, data: Partial<Atividade>): Promise<Atividade> {
  const r = await fetch(`${API_BASE}/${id}`, { method: 'PATCH', headers, body: JSON.stringify(data) })
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message ?? 'Erro ao salvar') }
  return r.json()
}

async function apiDelete(id: string): Promise<void> {
  await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
}

async function apiTimer(id: string, sessao: { iniciado_em: string; duracao_min: number; assunto?: string }): Promise<void> {
  await fetch(`${API_BASE}/${id}/timer`, { method: 'POST', headers, body: JSON.stringify(sessao) })
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function fmtDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

function fmtDateShort(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR')
}

function fmtMin(min: number): string {
  if (!min) return '0min'
  const h = Math.floor(min / 60), m = min % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

function fmtTimerHMS(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [h,m,s].map(n => String(n).padStart(2,'0')).join(':')
}

function isOverdue(atividade: Atividade): boolean {
  if (!atividade.data_atividade) return false
  if (atividade.status === 'Concluída' || atividade.status === 'Cancelada') return false
  return new Date(atividade.data_atividade) < new Date()
}

function applyFilters(list: Atividade[], f: Filters): Atividade[] {
  return list.filter(t => {
    if (f.status && t.status !== f.status) return false
    if (f.prioridade && t.prioridade !== f.prioridade) return false

    if (f.prazo) {
      const today = new Date(); today.setHours(0,0,0,0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
      const dt = t.data_atividade ? (() => { const d = new Date(t.data_atividade); d.setHours(0,0,0,0); return d })() : null
      if (f.prazo === 'sem_prazo' && dt) return false
      if (f.prazo !== 'sem_prazo') {
        if (!dt) return false
        if (f.prazo === 'atrasado' && dt >= today) return false
        if (f.prazo === 'hoje' && dt.getTime() !== today.getTime()) return false
        if (f.prazo === 'futuro' && dt < tomorrow) return false
      }
    }

    if (f.dateFrom || f.dateTo) {
      if (!t.data_atividade) return false
      const tDay = new Date(t.data_atividade); tDay.setHours(0,0,0,0)
      if (f.dateFrom && tDay < new Date(f.dateFrom + 'T00:00:00')) return false
      if (f.dateTo && tDay > new Date(f.dateTo + 'T23:59:59')) return false
    }

    if (f.search) {
      const q = f.search.toLowerCase()
      const txt = [
        t.titulo, t.descricao, t.tipo, t.prioridade, t.status,
        fmtDateShort(t.data_atividade),
        ...(t.participantes ?? []).map(p => p.user_nome),
      ].filter(Boolean).join(' ').toLowerCase()
      if (!txt.includes(q)) return false
    }

    return true
  })
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AtividadesView(): React.ReactElement {
  const { t } = useTranslation()
  const [atividades, setAtividades]   = useState<Atividade[]>([])
  const [loading, setLoading]         = useState(true)
  const [view, setView]               = useState<ViewMode>('kanban')
  const [filters, setFilters]         = useState<Filters>({ search:'', status:'', prioridade:'', prazo:'', dateFrom:'', dateTo:'' })
  const [modalAtvId, setModalAtvId]   = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [page, setPage]               = useState(1)
  const PAGE_SIZE = 15

  const contentRef = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet()
      setAtividades(data)
    } catch (e) {
      console.error('[Atividades]', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Sticky header shadow on scroll
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const onScroll = () => { headerRef.current?.classList.toggle('is-stuck', el.scrollTop > 4) }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = applyFilters(atividades, filters)

  function clearFilters() {
    setFilters({ search:'', status:'', prioridade:'', prazo:'', dateFrom:'', dateTo:'' })
  }

  const modalAtv = atividades.find(a => a.id === modalAtvId) ?? null

  return (
    <div className="ativ-page">

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <div className="ativ-sticky-header" ref={headerRef}>

        {/* Título + CTA */}
        <div className="ativ-title-row">
          <div>
            <h1 className="ativ-title">
              <span style={{ color: '#6366f1' }}>◈</span> {t('atividades.titulo')}
            </h1>
            <p className="ativ-subtitle">
              {t('atividades.subtitulo')}
            </p>
          </div>
          <button className="ativ-btn-primary" onClick={() => setShowNewModal(true)}>
            {t('atividades.nova_atividade')}
          </button>
        </div>

        {/* Filtros */}
        <div className="ativ-filters">
          <div className="ativ-filters__left">
            {/* Busca */}
            <div className="ativ-search-wrap">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
              <input
                placeholder={t('atividades.localizar')}
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>

            {/* Status */}
            <select
              className="ativ-select"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">{t('atividades.status')}</option>
              {KANBAN_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>

            {/* Prazo */}
            <select
              className="ativ-select"
              value={filters.prazo}
              onChange={e => setFilters(f => ({ ...f, prazo: e.target.value }))}
            >
              <option value="">{t('atividades.prazo')}</option>
              <option value="atrasado">{t('atividades.prazo_atrasado')}</option>
              <option value="hoje">{t('atividades.prazo_hoje')}</option>
              <option value="futuro">{t('atividades.prazo_futuro')}</option>
              <option value="sem_prazo">{t('atividades.prazo_sem_prazo')}</option>
            </select>

            {/* Prioridade */}
            <select
              className="ativ-select"
              value={filters.prioridade}
              onChange={e => setFilters(f => ({ ...f, prioridade: e.target.value }))}
            >
              <option value="">{t('atividades.prioridade')}</option>
              {PRIOS.map(p => <option key={p} value={p}>{PRIO_LABEL[p]}</option>)}
            </select>

            {/* Datas */}
            <div className="ativ-date-range">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                title={t('atividades.data_inicial')}
              />
              <span>até</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                title={t('atividades.data_final')}
              />
            </div>

            {/* Limpar */}
            <button className="ativ-btn-ghost" onClick={clearFilters}>{t('atividades.limpar_filtros')}</button>
          </div>

          {/* Toggle Kanban / Lista */}
          <div className="ativ-view-toggle">
            <button
              className={`ativ-view-btn${view === 'kanban' ? ' active' : ''}`}
              onClick={() => setView('kanban')}
            >{t('atividades.kanban')}</button>
            <button
              className={`ativ-view-btn${view === 'lista' ? ' active' : ''}`}
              onClick={() => { setView('lista'); setPage(1) }}
            >{t('atividades.lista')}</button>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      <div className="ativ-content" ref={contentRef}>
        {loading ? (
          <div className="ativ-empty-state">
            <span className="ativ-spin" style={{ fontSize: '2rem' }}>↻</span>
            <p>{t('atividades.carregando_atividades')}</p>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            atividades={filtered}
            onOpen={(id) => setModalAtvId(id)}
            onStatusChange={async (id, newStatus) => {
              setAtividades(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
              await apiUpdate(id, { status: newStatus } as Partial<Atividade>)
            }}
          />
        ) : (
          <ListaView
            atividades={filtered}
            page={page}
            pageSize={PAGE_SIZE}
            onPage={setPage}
            onOpen={(id) => setModalAtvId(id)}
            onDelete={async (id) => {
              await apiDelete(id)
              setAtividades(prev => prev.filter(a => a.id !== id))
            }}
          />
        )}
      </div>

      {/* ── Modal Detalhe / Editar ──────────────────────────────────── */}
      {modalAtv && (
        <AtividadeModal
          atividade={modalAtv}
          onClose={() => setModalAtvId(null)}
          onSave={async (data) => {
            const updated = await apiUpdate(modalAtv.id, data)
            setAtividades(prev => prev.map(a => a.id === modalAtv.id ? updated : a))
            setModalAtvId(null)
          }}
          onDelete={async () => {
            await apiDelete(modalAtv.id)
            setAtividades(prev => prev.filter(a => a.id !== modalAtv.id))
            setModalAtvId(null)
          }}
          onSaveTimer={async (sessao) => {
            await apiTimer(modalAtv.id, sessao)
            // Recarrega para atualizar tempo acumulado
            const data = await apiGet()
            setAtividades(data)
          }}
        />
      )}

      {/* ── Modal Nova Atividade ────────────────────────────────────── */}
      {showNewModal && (
        <AtividadeModal
          atividade={null}
          onClose={() => setShowNewModal(false)}
          onSave={async (data) => {
            const created = await apiCreate(data)
            setAtividades(prev => [created, ...prev])
            setShowNewModal(false)
          }}
          onDelete={async () => { setShowNewModal(false) }}
          onSaveTimer={async () => { /* não aplica ao criar */ }}
        />
      )}
    </div>
  )
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  atividades: Atividade[]
  onOpen: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

function KanbanBoard({ atividades, onOpen, onStatusChange }: KanbanBoardProps) {
  const { t } = useTranslation()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  return (
    <div className="ativ-kanban-grid">
      {KANBAN_COLS.map(col => {
        const cards = atividades.filter(a => a.status === col.key)
        return (
          <div key={col.key} className="ativ-kanban-col">
            <div className="ativ-kanban-col__header">
              <div className="ativ-kanban-col__title" style={{ color: col.color }}>
                <span>{col.icon}</span>
                <span style={{ color: 'var(--text-primary)' }}>{col.label}</span>
              </div>
              <span
                className="ativ-kanban-col__badge"
                style={{ background: col.color + '20', color: col.color, border: `1px solid ${col.color}44` }}
              >
                {cards.length}
              </span>
            </div>
            <div
              className={`ativ-kanban-dropzone${dragOverCol === col.key ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => {
                e.preventDefault()
                setDragOverCol(null)
                if (draggingId) onStatusChange(draggingId, col.key)
                setDraggingId(null)
              }}
            >
              {cards.length === 0 ? (
                <div className="ativ-empty-col">
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>🗃</div>
                  {t('atividades.nenhuma_atividade')}
                </div>
              ) : (
                cards.map(a => (
                  <KanbanCard
                    key={a.id}
                    atividade={a}
                    onOpen={onOpen}
                    onDragStart={() => setDraggingId(a.id)}
                    onDragEnd={() => setDraggingId(null)}
                    isDragging={draggingId === a.id}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

interface KanbanCardProps {
  atividade: Atividade
  onOpen: (id: string) => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}

function KanbanCard({ atividade: a, onOpen, onDragStart, onDragEnd, isDragging }: KanbanCardProps) {
  const { t } = useTranslation()
  const pc     = a.prioridade ? PRIORITY_COLORS[a.prioridade] ?? '#64748b' : null
  const tc     = TYPE_CONFIG[a.tipo]?.color ?? '#64748b'
  const overdue = isOverdue(a)

  return (
    <div
      className={`ativ-card${isDragging ? ' dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(a.id)}
      style={pc ? { borderLeft: `3px solid ${pc}` } : undefined}
    >
      {pc && (
        <span
          className="ativ-card__priority"
          style={{ background: pc + '20', color: pc, border: `1px solid ${pc}44` }}
        >
          {PRIO_LABEL[a.prioridade!]}
        </span>
      )}
      <div className="ativ-card__company">
        🏢 {a.processo_id ? `${t('atividades.processo_prefixo')}${a.processo_id.slice(-6)}` : t('atividades.sem_vinculo')}
      </div>
      <div className="ativ-card__title">{a.titulo}</div>
      {a.data_atividade && (
        <div className="ativ-card__date" style={{ color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
          📅 {fmtDateShort(a.data_atividade)}{overdue ? ` · ${t('atividades.atrasada')}` : ''}
        </div>
      )}
      <div className="ativ-card__footer">
        <span className="ativ-card__type" style={{ color: tc }}>
          {a.tipo}
        </span>
        <span className="ativ-card__edit">✏ {t('atividades.editar')}</span>
      </div>
    </div>
  )
}

// ─── Vista Lista ──────────────────────────────────────────────────────────────

interface ListaViewProps {
  atividades: Atividade[]
  page: number
  pageSize: number
  onPage: (p: number) => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

function ListaView({ atividades, page, pageSize, onPage, onOpen, onDelete }: ListaViewProps) {
  const { t } = useTranslation()
  const total   = atividades.length
  const pages   = Math.max(1, Math.ceil(total / pageSize))
  const start   = (page - 1) * pageSize
  const visible = atividades.slice(start, start + pageSize)

  return (
    <div className="ativ-table-wrap">
      <table className="ativ-table">
        <thead>
          <tr>
            <th>{t('atividades.tabela.tipo')}</th>
            <th>{t('atividades.tabela.titulo_col')}</th>
            <th>{t('atividades.tabela.status')}</th>
            <th>{t('atividades.tabela.prioridade')}</th>
            <th>{t('atividades.tabela.data')}</th>
            <th>{t('atividades.tabela.tempo')}</th>
            <th>{t('atividades.tabela.participantes')}</th>
            <th style={{ textAlign: 'right' }}>{t('atividades.tabela.acoes')}</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="ativ-empty-state">
                  <div className="ativ-empty-state__icon">📭</div>
                  <div className="ativ-empty-state__title">{t('atividades.vazio.titulo')}</div>
                  <div className="ativ-empty-state__desc">{t('atividades.vazio.desc')}</div>
                </div>
              </td>
            </tr>
          ) : visible.map(a => {
            const tc = TYPE_CONFIG[a.tipo]?.color ?? '#64748b'
            const pc = a.prioridade ? PRIORITY_COLORS[a.prioridade] : null
            const overdue = isOverdue(a)
            return (
              <tr key={a.id} onClick={() => onOpen(a.id)}>
                <td>
                  <span className="ativ-badge" style={{ background: tc + '18', color: tc, borderColor: tc + '44' }}>
                    {a.tipo}
                  </span>
                </td>
                <td style={{ fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.titulo}
                </td>
                <td>
                  <span className="ativ-badge" style={{ background: STATUS_BG[a.status], color: STATUS_COLORS[a.status], borderColor: STATUS_COLORS[a.status] + '44' }}>
                    {a.status}
                  </span>
                </td>
                <td>
                  {pc && (
                    <span className="ativ-badge" style={{ background: pc + '20', color: pc, borderColor: pc + '44' }}>
                      {PRIO_LABEL[a.prioridade!]}
                    </span>
                  )}
                </td>
                <td style={{ color: overdue ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {fmtDateShort(a.data_atividade)}
                </td>
                <td style={{ fontSize: '0.8rem' }}>
                  {a.tempo_gasto_minutos ? (
                    <span className="ativ-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>
                      ⏱ {fmtMin(a.tempo_gasto_minutos)}
                    </span>
                  ) : '-'}
                </td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.participantes.map(p => p.user_nome ?? p.user_id).join(', ') || '-'}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                  <button
                    className="ativ-btn-secondary"
                    style={{ display: 'inline-flex', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => onOpen(a.id)}
                  >✏</button>
                  {' '}
                  <button
                    className="ativ-btn-danger"
                    style={{ display: 'inline-flex', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => { if (confirm(t('atividades.modal.confirmar_excluir'))) onDelete(a.id) }}
                  >🗑</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Paginação */}
      {pages > 1 && (
        <div className="ativ-pagination">
          <span>{start + 1}–{Math.min(start + pageSize, total)} {t('atividades.paginacao.de')} {total} {t('atividades.paginacao.registros')}</span>
          <div className="ativ-pagination-btns">
            <button className="ativ-page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`ativ-page-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>{p}</button>
            ))}
            <button className="ativ-page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>›</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Modal de Atividade ───────────────────────────────────────────────────────

interface AtividadeModalProps {
  atividade: Atividade | null
  onClose: () => void
  onSave: (data: Partial<Atividade>) => Promise<void>
  onDelete: () => Promise<void>
  onSaveTimer: (sessao: { iniciado_em: string; duracao_min: number; assunto?: string }) => Promise<void>
}

function AtividadeModal({ atividade, onClose, onSave, onDelete, onSaveTimer }: AtividadeModalProps) {
  const { t } = useTranslation()
  const isNew = !atividade

  const [tab, setTab] = useState<ModalTab>('informacoes')
  const [saving, setSaving] = useState(false)

  // Form state
  const [titulo,      setTitulo]      = useState(atividade?.titulo ?? '')
  const [descricao,   setDescricao]   = useState(atividade?.descricao ?? '')
  const [tipo,        setTipo]        = useState(atividade?.tipo ?? 'Tarefa')
  const [status,      setStatus]      = useState<KanbanStatus>((atividade?.status as KanbanStatus) ?? 'A Fazer')
  const [prioridade,  setPrioridade]  = useState(atividade?.prioridade ?? '')
  const [dataAtvStr,  setDataAtvStr]  = useState(atividade?.data_atividade ? new Date(atividade.data_atividade).toISOString().slice(0,16) : '')
  const [pPassoTit,   setPPassoTit]   = useState(atividade?.proximo_passo_titulo ?? '')
  const [pPassoData,  setPPassoData]  = useState(atividade?.proximo_passo_data ? new Date(atividade.proximo_passo_data).toISOString().slice(0,10) : '')
  const [lembreteEm,  setLembreteEm]  = useState(atividade?.lembrete_em ? new Date(atividade.lembrete_em).toISOString().slice(0,16) : '')
  const [lemEmail,    setLemEmail]    = useState(atividade?.lembrete_email ?? false)
  const [lemWpp,      setLemWpp]      = useState(atividade?.lembrete_whatsapp ?? false)
  const [participantes, setParticipantes] = useState<Participante[]>(atividade?.participantes ?? [])
  const [newPart,     setNewPart]     = useState('')

  // Timer
  const [timerSec,    setTimerSec]    = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerStart,  setTimerStart]  = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timerAssunto, setTimerAssunto] = useState('')

  function startTimer() {
    setTimerRunning(true)
    setTimerStart(new Date())
    timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000)
  }

  function pauseTimer() {
    setTimerRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function stopTimer() {
    pauseTimer()
    if (!atividade || timerSec < 60) { setTimerSec(0); return }
    const durMin = Math.ceil(timerSec / 60)
    await onSaveTimer({
      iniciado_em: (timerStart ?? new Date()).toISOString(),
      duracao_min: durMin,
      assunto: timerAssunto || undefined,
    })
    setTimerSec(0)
    setTimerAssunto('')
  }

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function addParticipant() {
    const nome = newPart.trim()
    if (!nome) return
    setParticipantes(prev => [...prev, { user_id: nome, user_nome: nome }])
    setNewPart('')
  }

  function removeParticipant(uid: string) {
    setParticipantes(prev => prev.filter(p => p.user_id !== uid))
  }

  async function handleSave() {
    if (!titulo.trim()) { alert(t('atividades.modal.titulo_obrigatorio')); return }
    setSaving(true)
    try {
      await onSave({
        titulo,
        descricao:             descricao || undefined,
        tipo,
        status,
        prioridade:            prioridade || undefined,
        data_atividade:        dataAtvStr ? new Date(dataAtvStr).toISOString() : undefined,
        proximo_passo_titulo:  pPassoTit || undefined,
        proximo_passo_data:    pPassoData ? new Date(pPassoData + 'T00:00:00').toISOString() : undefined,
        lembrete_em:           lembreteEm ? new Date(lembreteEm).toISOString() : undefined,
        lembrete_email:        lemEmail,
        lembrete_whatsapp:     lemWpp,
        participantes,
      } as Partial<Atividade>)
    } finally {
      setSaving(false)
    }
  }

  const sessoes = atividade?.sessoes_timer ?? []

  return (
    <div className="ativ-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ativ-modal" style={{ position: 'relative' }}>

        {/* Topo */}
        <div className="ativ-modal__head">
          <div className="ativ-modal__meta">
            <span>🏢 {atividade?.processo_id ? `${t('atividades.processo_prefixo')}${atividade.processo_id.slice(-6)}` : t('atividades.modal.sem_vinculo')}</span>
            <span>·</span>
            {atividade && <span>{t('atividades.modal.criado')} {fmtDateShort(atividade.created_at)}</span>}
          </div>
          <button className="ativ-modal__close" onClick={onClose}>✕</button>
          <div className="ativ-modal__title-text">
            {isNew ? t('atividades.modal.nova') : atividade?.titulo}
          </div>
          {!isNew && (
            <div className="ativ-modal__badges">
              <span className="ativ-badge" style={{ background: STATUS_BG[atividade!.status], color: STATUS_COLORS[atividade!.status], borderColor: STATUS_COLORS[atividade!.status] + '44' }}>
                {atividade!.status}
              </span>
              {atividade!.prioridade && (
                <span className="ativ-badge" style={{ background: PRIORITY_COLORS[atividade!.prioridade] + '20', color: PRIORITY_COLORS[atividade!.prioridade], borderColor: PRIORITY_COLORS[atividade!.prioridade] + '44' }}>
                  {PRIO_LABEL[atividade!.prioridade]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="ativ-modal__tabs">
          {([
            { id: 'informacoes',    labelKey: 'atividades.modal.informacoes' },
            { id: 'tempo',          labelKey: 'atividades.modal.tempo' },
            { id: 'proximo-passo',  labelKey: 'atividades.modal.proximo_passo' },
            { id: 'lembrete',       labelKey: 'atividades.modal.lembrete' },
          ] as const).map(tabItem => (
            <button
              key={tabItem.id}
              className={`ativ-modal__tab${tab === tabItem.id ? ' active' : ''}`}
              onClick={() => setTab(tabItem.id)}
            >{t(tabItem.labelKey)}</button>
          ))}
        </div>

        {/* Body */}
        <div className="ativ-modal__body">

          {/* ── Tab: Informações ─────────────────────────────────── */}
          {tab === 'informacoes' && (
            <>
              <p className="ativ-section-label">{t('atividades.modal.configuracoes')}</p>
              <div className="ativ-grid-2">
                <div className="ativ-field">
                  <label>{t('atividades.modal.tipo_atividade')}</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)}>
                    {TIPOS.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
                <div className="ativ-field">
                  <label>{t('atividades.modal.fase_atividade')}</label>
                  <select value={status} onChange={e => setStatus(e.target.value as KanbanStatus)}>
                    {KANBAN_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="ativ-grid-2">
                <div className="ativ-field">
                  <label>{t('atividades.modal.prioridade')}</label>
                  <select value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                    <option value="">{t('atividades.modal.sem_prioridade')}</option>
                    {PRIOS.map(p => <option key={p} value={p}>{PRIO_LABEL[p]}</option>)}
                  </select>
                </div>
                <div className="ativ-field">
                  <label>{t('atividades.modal.data_horario')}</label>
                  <input type="datetime-local" value={dataAtvStr} onChange={e => setDataAtvStr(e.target.value)} />
                </div>
              </div>

              <p className="ativ-section-label" style={{ marginTop: '1rem' }}>{t('atividades.modal.conteudo')}</p>
              <div className="ativ-field" style={{ marginBottom: '0.85rem' }}>
                <label>{t('atividades.modal.titulo_label')}</label>
                <input
                  placeholder={t('atividades.modal.titulo_placeholder')}
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                />
              </div>
              <div className="ativ-field" style={{ marginBottom: '1rem' }}>
                <label>{t('atividades.modal.descricao_label')}</label>
                <textarea
                  placeholder={t('atividades.modal.descricao_placeholder')}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={4}
                />
              </div>

              <p className="ativ-section-label">{t('atividades.modal.participantes')}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  className="ativ-field"
                  style={{ flex: 1 }}
                  placeholder={t('atividades.modal.participante_placeholder')}
                  value={newPart}
                  onChange={e => setNewPart(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addParticipant() } }}
                />
                <button className="ativ-btn-secondary" onClick={addParticipant}>{t('atividades.modal.adicionar_participante')}</button>
              </div>
              <div className="ativ-chips">
                {participantes.map(p => (
                  <span key={p.user_id} className="ativ-chip">
                    👤 {p.user_nome ?? p.user_id}
                    <button onClick={() => removeParticipant(p.user_id)}>×</button>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* ── Tab: Tempo ──────────────────────────────────────── */}
          {tab === 'tempo' && (
            <>
              <p className="ativ-section-label">{t('atividades.modal.cronometro')}</p>
              <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('atividades.modal.tempo_trabalhado')}</div>
                    <div className={`ativ-timer-display${timerRunning ? ' ativ-timer-running' : ''}`}>
                      {fmtTimerHMS(timerSec)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!timerRunning ? (
                      <button className="ativ-btn-primary" onClick={startTimer}>{t('atividades.modal.iniciar')}</button>
                    ) : (
                      <>
                        <button className="ativ-btn-secondary" onClick={pauseTimer}>{t('atividades.modal.pausar')}</button>
                        <button className="ativ-btn-danger" onClick={stopTimer}>{t('atividades.modal.finalizar')}</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="ativ-field" style={{ marginTop: '0.85rem' }}>
                  <label>{t('atividades.modal.assunto_sessao')}</label>
                  <input placeholder={t('atividades.modal.assunto_placeholder')} value={timerAssunto} onChange={e => setTimerAssunto(e.target.value)} />
                </div>
              </div>

              <p className="ativ-section-label">{t('atividades.modal.sessoes_registradas')}</p>
              {atividade && (
                <div style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {t('atividades.modal.total_acumulado')} <strong>{fmtMin(atividade.tempo_gasto_minutos)}</strong>
                </div>
              )}
              {sessoes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t('atividades.modal.nenhuma_sessao')}</p>
              ) : (
                <table className="ativ-sessoes-table">
                  <thead>
                    <tr>
                      <th>{t('atividades.modal.sessao_data')}</th>
                      <th>{t('atividades.modal.sessao_hora')}</th>
                      <th>{t('atividades.modal.sessao_duracao')}</th>
                      <th>{t('atividades.modal.sessao_assunto')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessoes.map(s => (
                      <tr key={s.id}>
                        <td>{fmtDateShort(s.iniciado_em)}</td>
                        <td>{new Date(s.iniciado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <span className="ativ-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>
                            ⏱ {fmtMin(s.duracao_min)}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{s.assunto ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ── Tab: Próximo Passo ───────────────────────────────── */}
          {tab === 'proximo-passo' && (
            <>
              <p className="ativ-section-label">→ Próximo Passo</p>
              <div className="ativ-grid-2" style={{ marginBottom: '0.85rem' }}>
                <div className="ativ-field">
                  <label>Título do Próximo Passo</label>
                  <input placeholder="O que fazer a seguir?" value={pPassoTit} onChange={e => setPPassoTit(e.target.value)} />
                </div>
                <div className="ativ-field">
                  <label>Data do Próximo Passo</label>
                  <input type="date" value={pPassoData} onChange={e => setPPassoData(e.target.value)} />
                </div>
              </div>
              {pPassoData && (
                <div className="ativ-field" style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input type="checkbox" /> Lembrar por e-mail (1 dia antes)
                  </label>
                </div>
              )}
              {pPassoTit || pPassoData ? (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.83rem', color: '#10b981' }}>
                  ✓ Próximo passo configurado:{' '}
                  <strong>{pPassoTit}</strong>
                  {pPassoData && ` · ${fmtDateShort(pPassoData + 'T00:00:00')}`}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Nenhum próximo passo definido. Adicione um título e data para ajudar na gestão das atividades.
                </p>
              )}
            </>
          )}

          {/* ── Tab: Lembrete ────────────────────────────────────── */}
          {tab === 'lembrete' && (
            <>
              <p className="ativ-section-label">🔔 Lembrete</p>
              <div className="ativ-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="ativ-field">
                  <label>Data e hora do lembrete</label>
                  <input type="datetime-local" value={lembreteEm} onChange={e => setLembreteEm(e.target.value)} />
                </div>
                <div className="ativ-field" style={{ justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={lemEmail} onChange={e => setLemEmail(e.target.checked)} />
                    Por e-mail
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={lemWpp} onChange={e => setLemWpp(e.target.checked)} />
                    Por WhatsApp
                  </label>
                </div>
              </div>
              {lembreteEm ? (
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.83rem', color: '#f59e0b' }}>
                  🔔 Lembrete agendado para{' '}
                  <strong>{fmtDate(lembreteEm + ':00')}</strong>
                  {lemEmail && ' · E-mail'}{lemWpp && ' · WhatsApp'}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Nenhum lembrete configurado. Defina uma data/hora acima para receber uma notificação.
                </p>
              )}
            </>
          )}

          {/* Ações do Modal */}
          <div className="ativ-modal-actions">
            {!isNew ? (
              <button className="ativ-btn-danger" onClick={async () => { if (confirm(t('atividades.modal.confirmar_excluir'))) await onDelete() }}>
                {t('atividades.modal.excluir')}
              </button>
            ) : <div />}
            <div className="ativ-modal-actions__right">
              <button className="ativ-btn-secondary" onClick={onClose}>{t('atividades.modal.cancelar')}</button>
              <button className="ativ-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? t('atividades.modal.salvando') : t('atividades.modal.salvar')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
