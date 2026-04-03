/**
 * CardKanbanModal — modal padrão de detalhe de card Kanban.
 *
 * Padrão de referência para produtos: usa a mesma estrutura de
 * ModalGlobal + GeralCampoGlobal + SelectGlobal do nucleo-global.
 *
 * Abas:
 *   1. Dados      — campos editáveis do card
 *   2. Detalhes   — descrição e observações (textareas)
 *   3. Histórico  — timeline de movimentações (read-only)
 */

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Kanban,
  BuildingOffice,
  User,
  CalendarBlank,
  CurrencyDollar,
  ArrowRight,
  Check,
  PencilSimple,
  ArrowsClockwise,
  CircleNotch,
} from '@phosphor-icons/react'
import './CardKanbanModal.css'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'

export interface CardKanbanItem {
  id:          string
  colunaKey:   string
  nome:        string
  empresa:     string
  responsavel: string
  valor:       number
  data:        string
  prioridade:  Prioridade
}

export interface CardKanbanModalProps<T extends CardKanbanItem = CardKanbanItem> {
  aberto:     boolean
  item:       T | null
  colunas:    { key: string; label: string; color: string }[]
  onFechar:   () => void
  onSalvar:   (item: CardKanbanItem) => void
}

// ── Constantes ────────────────────────────────────────────────────────────────

const PRIORIDADE_COR: Record<Prioridade, string> = {
  urgente: '#ef4444',
  alta:    '#f97316',
  media:   '#f59e0b',
  baixa:   '#64748b',
}

const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  urgente: 'Urgente',
  alta:    'Alta',
  media:   'Média',
  baixa:   'Baixa',
}

const RESPONSAVEIS = [
  'Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira',
]

const ABAS = [
  { id: 'dados',     rotulo: 'Dados' },
  { id: 'detalhes',  rotulo: 'Detalhes' },
  { id: 'historico', rotulo: 'Histórico' },
]

// ── Mock histórico ─────────────────────────────────────────────────────────────

function gerarHistorico(item: CardKanbanItem) {
  return [
    {
      icone: <PencilSimple size={14} />,
      acao: `Card criado por ${item.responsavel}`,
      meta: `${new Date(item.data).toLocaleDateString('pt-BR')} · ${item.empresa}`,
    },
    {
      icone: <ArrowRight size={14} />,
      acao: `Movido para "${item.colunaKey}"`,
      meta: 'Há 2 dias · Sistema',
    },
    {
      icone: <ArrowsClockwise size={14} />,
      acao: 'Prioridade alterada para ' + PRIORIDADE_LABEL[item.prioridade],
      meta: 'Há 5 dias · ' + item.responsavel,
    },
  ]
}

// ── Campos auxiliares ─────────────────────────────────────────────────────────

function Campo({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="ckm-campo">
      <label className="ckm-label">{label}</label>
      {children}
    </div>
  )
}

// ── Aba Dados ─────────────────────────────────────────────────────────────────

function AbaDados({
  form,
  colunas,
  onChange,
}: {
  form:    CardKanbanItem
  colunas: CardKanbanModalProps['colunas']
  onChange: (patch: Partial<CardKanbanItem>) => void
}) {
  const pc = PRIORIDADE_COR[form.prioridade]

  return (
    <>
      {/* Linha 1 — Nome */}
      <div className="ckm-grid">
        <div className="ckm-col-full">
          <Campo label="Nome">
            <input
              className="ckm-input"
              value={form.nome}
              onChange={e => onChange({ nome: e.target.value })}
              placeholder="Nome do card"
            />
          </Campo>
        </div>
      </div>

      {/* Linha 2 — Empresa + Responsável */}
      <div className="ckm-grid">
        <Campo label="Empresa">
          <input
            className="ckm-input"
            value={form.empresa}
            onChange={e => onChange({ empresa: e.target.value })}
            placeholder="Nome da empresa"
          />
        </Campo>

        <Campo label="Responsável">
          <select
            className="ckm-select"
            value={form.responsavel}
            onChange={e => onChange({ responsavel: e.target.value })}
          >
            {RESPONSAVEIS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Campo>
      </div>

      {/* Linha 3 — Prioridade + Status */}
      <div className="ckm-grid">
        <Campo label="Prioridade">
          <select
            className="ckm-select"
            value={form.prioridade}
            onChange={e => onChange({ prioridade: e.target.value as Prioridade })}
            style={{ borderLeftColor: pc, borderLeftWidth: 3 }}
          >
            {(Object.keys(PRIORIDADE_LABEL) as Prioridade[]).map(p => (
              <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>
            ))}
          </select>
        </Campo>

        <Campo label="Coluna / Status">
          <select
            className="ckm-select"
            value={form.colunaKey}
            onChange={e => onChange({ colunaKey: e.target.value })}
          >
            {colunas.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </Campo>
      </div>

      {/* Linha 4 — Data + Valor */}
      <div className="ckm-grid">
        <Campo label="Data limite">
          <input
            type="date"
            className="ckm-input"
            value={form.data ? form.data.slice(0, 10) : ''}
            onChange={e => onChange({ data: new Date(e.target.value).toISOString() })}
          />
        </Campo>

        <Campo label="Valor (R$)">
          <input
            type="number"
            className="ckm-input"
            value={form.valor}
            min={0}
            step={0.01}
            onChange={e => onChange({ valor: parseFloat(e.target.value) || 0 })}
          />
        </Campo>
      </div>
    </>
  )
}

// ── Aba Detalhes ──────────────────────────────────────────────────────────────

function AbaDetalhes({
  descricao,
  observacoes,
  onChangeDescricao,
  onChangeObservacoes,
}: {
  descricao:           string
  observacoes:         string
  onChangeDescricao:   (v: string) => void
  onChangeObservacoes: (v: string) => void
}) {
  return (
    <>
      <Campo label="Descrição">
        <textarea
          className="ckm-textarea"
          style={{ minHeight: 120 }}
          value={descricao}
          onChange={e => onChangeDescricao(e.target.value)}
          placeholder="Descreva o objetivo ou contexto deste card…"
        />
      </Campo>

      <Campo label="Observações internas">
        <textarea
          className="ckm-textarea"
          value={observacoes}
          onChange={e => onChangeObservacoes(e.target.value)}
          placeholder="Observações visíveis apenas para a equipe…"
        />
      </Campo>
    </>
  )
}

// ── Aba Histórico ─────────────────────────────────────────────────────────────

function AbaHistorico({ item }: { item: CardKanbanItem }) {
  const historico = gerarHistorico(item)

  return (
    <div className="ckm-timeline">
      {historico.map((h, i) => (
        <div key={i} className="ckm-timeline-item">
          <div className="ckm-timeline-dot">{h.icone}</div>
          <div className="ckm-timeline-content">
            <div className="ckm-timeline-acao">{h.acao}</div>
            <div className="ckm-timeline-meta">{h.meta}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Modal principal ───────────────────────────────────────────────────────────

export function CardKanbanModal<T extends CardKanbanItem>({
  aberto,
  item,
  colunas,
  onFechar,
  onSalvar,
}: CardKanbanModalProps<T>) {
  const [abaAtiva,    setAbaAtiva]    = useState('dados')
  const [form,        setForm]        = useState<T | null>(null)
  const [descricao,   setDescricao]   = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvando,    setSalvando]    = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Sincroniza form com item ao abrir
  useEffect(() => {
    if (aberto && item) {
      setForm({ ...item })
      setAbaAtiva('dados')
      setDescricao('')
      setObservacoes('')
    }
  }, [aberto, item])

  // ESC fecha
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  // Trava scroll
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  if (!aberto || !item || !form) return null

  const dirty = JSON.stringify(form) !== JSON.stringify(item) || descricao !== '' || observacoes !== ''

  const coluna = colunas.find(c => c.key === form.colunaKey)

  function handleChange(patch: Partial<CardKanbanItem>) {
    setForm(prev => prev ? ({ ...prev, ...patch } as T) : prev)
  }

  async function handleSalvar() {
    if (!form || salvando) return
    setSalvando(true)
    await new Promise(r => setTimeout(r, 500))
    onSalvar(form)
    setSalvando(false)
    onFechar()
  }

  const modal = (
    <div
      className="ckm-overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div
        ref={dialogRef}
        className="ckm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={form.nome}
      >
        {/* ── Header ── */}
        <div className="ckm-header">
          <div className="ckm-header-left">
            <div
              className="ckm-header-icon"
              style={{
                background: `${PRIORIDADE_COR[form.prioridade]}18`,
                border: `1px solid ${PRIORIDADE_COR[form.prioridade]}35`,
              }}
            >
              <Kanban
                size={18}
                weight="duotone"
                color={PRIORIDADE_COR[form.prioridade]}
              />
            </div>
            <div className="ckm-header-text">
              <h2 className="ckm-titulo">{form.nome}</h2>
              <p className="ckm-subtitulo">
                <BuildingOffice size={11} />
                {form.empresa}
                {coluna && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span
                      style={{
                        color: coluna.color,
                        fontWeight: 600,
                        fontSize: '0.72rem',
                      }}
                    >
                      {coluna.label}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button className="ckm-btn-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* ── Abas ── */}
        <nav className="ckm-abas" role="tablist">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              role="tab"
              aria-selected={abaAtiva === aba.id}
              className={`ckm-aba ${abaAtiva === aba.id ? 'ckm-aba--ativa' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.rotulo}
            </button>
          ))}
        </nav>

        {/* ── Body ── */}
        <div className="ckm-body" role="tabpanel">
          {abaAtiva === 'dados' && (
            <AbaDados form={form} colunas={colunas} onChange={handleChange} />
          )}
          {abaAtiva === 'detalhes' && (
            <AbaDetalhes
              descricao={descricao}
              observacoes={observacoes}
              onChangeDescricao={setDescricao}
              onChangeObservacoes={setObservacoes}
            />
          )}
          {abaAtiva === 'historico' && (
            <AbaHistorico item={item} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="ckm-footer">
          <span className={`ckm-footer-status ${dirty ? 'ckm-footer-status--dirty' : ''}`}>
            {dirty
              ? <><CircleNotch size={12} /> Alterações não salvas</>
              : <><Check size={12} /> Sem alterações</>
            }
          </span>

          <div className="ckm-footer-acoes">
            <button className="ckm-btn-cancelar" onClick={onFechar}>
              Cancelar
            </button>
            <button
              className="ckm-btn-salvar"
              disabled={!dirty || salvando}
              onClick={handleSalvar}
            >
              {salvando
                ? <><CircleNotch size={13} className="demo-spin" /> Salvando…</>
                : <><Check size={13} /> Salvar alterações</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
