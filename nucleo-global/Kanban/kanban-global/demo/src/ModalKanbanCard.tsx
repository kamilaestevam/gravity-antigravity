/**
 * CardKanbanModal — modal padrão de detalhe de card Kanban.
 *
 * Padrão de referência para produtos. Estrutura:
 *   1. Informações  — CONFIGURAÇÕES · EMPRESA VINCULADA · CONTEÚDO · PARTICIPANTES
 *   2. Tempo        — data, horário, valor financeiro
 *   3. Próximo Passo — ação e data do próximo passo
 *   4. Lembrete     — antecedência + canal de notificação
 */

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Kanban,
  BuildingOffice,
  User,
  MagnifyingGlass,
  CalendarBlank,
  CurrencyDollar,
  ArrowRight,
  Check,
  PencilSimple,
  ArrowsClockwise,
  CircleNotch,
  Bell,
  Clock,
  ListChecks,
  Trash,
  At,
  EnvelopeSimple,
  WhatsappLogo,
  Plus,
} from '@phosphor-icons/react'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import './ModalKanbanCard.css'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'

export interface CardKanbanItem {
  id:             string
  colunaKey:      string
  nome:           string
  empresa:        string
  responsavel:    string
  valor:          number
  data:           string
  prioridade:     Prioridade
  // Campos editáveis no modal — persistidos de volta ao item
  descricao?:     string
  tipoAtividade?: string
  proximoPasso?:  string
}

export interface ModalCardKanbanProps<T extends CardKanbanItem = CardKanbanItem> {
  aberto:   boolean
  item:     T | null
  colunas:  { key: string; label: string; color: string }[]
  onFechar: () => void
  onSalvar: (item: CardKanbanItem) => void
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

const TIPOS_ATIVIDADE = [
  'Ação necessária', 'Reunião', 'Ligação', 'E-mail', 'Visita', 'Proposta', 'Entrega',
]

const RESPONSAVEIS = [
  'Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira',
]

const ANTECEDENCIA_OPTS = [
  { id: '15min',    label: '15 min antes' },
  { id: '1h',       label: '1 hora antes' },
  { id: '1dia',     label: '1 dia antes'  },
  { id: 'nadata',   label: 'Na data'      },
  { id: 'custom',   label: 'Personalizado'},
]

const ABAS = [
  { id: 'informacoes', rotulo: 'Informações', icone: <ListChecks size={14} /> },
  { id: 'tempo',       rotulo: 'Tempo',       icone: <Clock       size={14} /> },
  { id: 'proximo',     rotulo: 'Próximo Passo', icone: <ArrowRight size={14} /> },
  { id: 'lembrete',    rotulo: 'Lembrete',    icone: <Bell        size={14} /> },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function gerarHistorico(item: CardKanbanItem) {
  return [
    {
      icone: <PencilSimple size={13} />,
      acao: `Card criado por ${item.responsavel}`,
      meta: `${new Date(item.data).toLocaleDateString('pt-BR')} · ${item.empresa}`,
    },
    {
      icone: <ArrowRight size={13} />,
      acao: `Movido para "${item.colunaKey}"`,
      meta: 'Há 2 dias · Sistema',
    },
    {
      icone: <ArrowsClockwise size={13} />,
      acao: `Prioridade alterada para ${PRIORIDADE_LABEL[item.prioridade]}`,
      meta: `Há 5 dias · ${item.responsavel}`,
    },
  ]
}

// Campo removido — substituído por CampoGeralGlobal do design system

// ── Seção ─────────────────────────────────────────────────────────────────────

function Secao({
  titulo,
  icone,
  modifier,
  children,
}: {
  titulo: string
  icone: React.ReactNode
  modifier?: string
  children: React.ReactNode
}) {
  return (
    <div className={`ckm-secao ${modifier ?? ''}`}>
      <div className="ckm-secao-titulo">
        {icone}
        {titulo}
      </div>
      {children}
    </div>
  )
}

// ── Aba Informações ───────────────────────────────────────────────────────────

function AbaInformacoes({
  form,
  colunas,
  descricao,
  tipoAtividade,
  participantes,
  onChange,
  onChangeDescricao,
  onChangeTipo,
  onAddParticipante,
  onRemoveParticipante,
}: {
  form:                 CardKanbanItem
  colunas:              { key: string; label: string; color: string }[]
  descricao:            string
  tipoAtividade:        string
  participantes:        string[]
  onChange:             (patch: Partial<CardKanbanItem>) => void
  onChangeDescricao:    (v: string) => void
  onChangeTipo:         (v: string) => void
  onAddParticipante:    (v: string) => void
  onRemoveParticipante: (v: string) => void
}) {
  const [buscaEmpresa, setBuscaEmpresa] = useState(form.empresa)
  const [buscaUser, setBuscaUser]       = useState('')
  const [tipoAdd, setTipoAdd]           = useState<'usuario' | 'email' | 'whatsapp'>('usuario')
  const pc = PRIORIDADE_COR[form.prioridade]

  return (
    <>
      {/* CONFIGURAÇÕES */}
      <Secao titulo="Configurações" icone={<ListChecks size={12} />}>
        <div className="ckm-grid">
          <SelectGlobal
            label="Tipo de Atividade"
            buscavel={false}
            opcoes={TIPOS_ATIVIDADE.map(t => ({ valor: t, rotulo: t }))}
            valor={tipoAtividade}
            aoMudarValor={v => onChangeTipo(String(v ?? ''))}
          />

          <SelectGlobal
            label="Fase da Atividade"
            buscavel={false}
            opcoes={colunas.map(c => ({ valor: c.key, rotulo: c.label }))}
            valor={form.colunaKey}
            aoMudarValor={v => onChange({ colunaKey: String(v ?? '') })}
          />

          <SelectGlobal
            label="Prioridade"
            buscavel={false}
            opcoes={(Object.keys(PRIORIDADE_LABEL) as Prioridade[]).map(p => ({ valor: p, rotulo: PRIORIDADE_LABEL[p] }))}
            valor={form.prioridade}
            aoMudarValor={v => onChange({ prioridade: v as Prioridade })}
          />

          <CampoCalendarioGlobal
            label="Data e Horário"
            valor={{ inicio: form.data ? new Date(form.data) : null, fim: null }}
            aoMudarValor={v => onChange({ data: v.inicio?.toISOString() ?? form.data })}
          />
        </div>
      </Secao>

      {/* EMPRESA VINCULADA */}
      <Secao titulo="Empresa Vinculada" icone={<BuildingOffice size={12} />} modifier="ckm-secao--empresa">
        <CampoGeralGlobal
          label="Buscar empresa"
          erro={!buscaEmpresa.trim() ? 'Nenhum cliente vinculado' : undefined}
        >
          <div className="ckm-input-wrap">
            <input
              className="ckm-sg-input"
              value={buscaEmpresa}
              onChange={e => {
                setBuscaEmpresa(e.target.value)
                onChange({ empresa: e.target.value })
              }}
              placeholder="Buscar empresa..."
            />
            <span className="ckm-input-icon"><MagnifyingGlass size={14} /></span>
          </div>
        </CampoGeralGlobal>
      </Secao>

      {/* CONTEÚDO */}
      <Secao titulo="Conteúdo" icone={<PencilSimple size={12} />} modifier="ckm-secao--conteudo">
        <CampoGeralGlobal label="Título">
          <input
            className="ckm-sg-input"
            value={form.nome}
            onChange={e => onChange({ nome: e.target.value })}
            placeholder="Título do card"
          />
        </CampoGeralGlobal>

        <CampoGeralGlobal label="Descrição">
          <textarea
            className="ckm-sg-textarea"
            value={descricao}
            onChange={e => onChangeDescricao(e.target.value)}
            placeholder="Descreva o objetivo, contexto ou detalhes deste card…"
          />
        </CampoGeralGlobal>
      </Secao>

      {/* PARTICIPANTES */}
      <Secao titulo="Participantes" icone={<User size={12} />} modifier="ckm-secao--participantes">
        <div className="ckm-parte-tipo-row">
          <span className="ckm-part-tipo-label">Adicionar via:</span>
          <div className="ckm-part-tipo">
            <button
              type="button"
              className={`ckm-part-btn ${tipoAdd === 'usuario' ? 'ckm-part-btn--ativo' : ''}`}
              onClick={() => setTipoAdd('usuario')}
            >
              <At size={12} /> @usuário
            </button>
            <button
              type="button"
              className={`ckm-part-btn ${tipoAdd === 'email' ? 'ckm-part-btn--ativo' : ''}`}
              onClick={() => setTipoAdd('email')}
            >
              <EnvelopeSimple size={12} /> E-mail
            </button>
            <button
              type="button"
              className={`ckm-part-btn ${tipoAdd === 'whatsapp' ? 'ckm-part-btn--ativo' : ''}`}
              onClick={() => setTipoAdd('whatsapp')}
            >
              <WhatsappLogo size={12} /> WhatsApp
            </button>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Combine tipos livremente
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <input
              className="ckm-sg-input"
              value={buscaUser}
              onChange={e => setBuscaUser(e.target.value)}
              placeholder={tipoAdd === 'usuario' ? 'Buscar usuário...' : tipoAdd === 'email' ? 'Digite o e-mail...' : 'Digite o WhatsApp...'}
              onKeyDown={e => {
                if (e.key === 'Enter' && buscaUser.trim()) {
                  onAddParticipante(buscaUser.trim())
                  setBuscaUser('')
                }
              }}
            />
          </div>
          <button
            type="button"
            className="ckm-btn-salvar"
            style={{ padding: '0.45rem 0.75rem', flexShrink: 0 }}
            onClick={() => {
              if (buscaUser.trim()) {
                onAddParticipante(buscaUser.trim())
                setBuscaUser('')
              }
            }}
          >
            <Plus size={14} />
          </button>
        </div>

        {participantes.length > 0 && (
          <div className="ckm-part-chips">
            {participantes.map(p => (
              <span key={p} className="ckm-chip">
                <User size={11} />
                {p}
                <button className="ckm-chip-remove" onClick={() => onRemoveParticipante(p)}>
                  <X size={10} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Secao>
    </>
  )
}

// ── Aba Tempo ─────────────────────────────────────────────────────────────────

function AbaTempo({
  form,
  onChange,
}: {
  form:     CardKanbanItem
  onChange: (patch: Partial<CardKanbanItem>) => void
}) {
  return (
    <Secao titulo="Tempo e Valor" icone={<Clock size={12} />} modifier="ckm-secao--tempo">
      <div className="ckm-grid">
        <CampoCalendarioGlobal
          label="Data de início"
          valor={{ inicio: form.data ? new Date(form.data) : null, fim: null }}
          aoMudarValor={v => onChange({ data: v.inicio?.toISOString() ?? form.data })}
        />

        <CampoGeralGlobal label="Valor (R$)">
          <input
            type="number"
            className="ckm-sg-input"
            value={form.valor}
            min={0}
            step={0.01}
            onChange={e => onChange({ valor: parseFloat(e.target.value) || 0 })}
          />
        </CampoGeralGlobal>

        <SelectGlobal
          label="Responsável"
          buscavel={false}
          opcoes={RESPONSAVEIS.map(r => ({ valor: r, rotulo: r }))}
          valor={form.responsavel}
          aoMudarValor={v => onChange({ responsavel: String(v ?? '') })}
        />

        <CampoGeralGlobal label="Valor formatado">
          <input
            className="ckm-sg-input"
            readOnly
            value={form.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
        </CampoGeralGlobal>
      </div>
    </Secao>
  )
}

// ── Aba Próximo Passo ─────────────────────────────────────────────────────────

function AbaProximoPasso({
  proximoPasso,
  dataProximo,
  onChangePasso,
  onChangeData,
}: {
  proximoPasso:   string
  dataProximo:    string
  onChangePasso:  (v: string) => void
  onChangeData:   (v: string) => void
}) {
  return (
    <Secao titulo="Próximo Passo" icone={<ArrowRight size={12} />} modifier="ckm-secao--proximo">
      <CampoGeralGlobal label="O que deve acontecer a seguir?">
        <textarea
          className="ckm-sg-textarea"
          style={{ minHeight: 120 }}
          value={proximoPasso}
          onChange={e => onChangePasso(e.target.value)}
          placeholder="Descreva a próxima ação necessária para avançar este card…"
        />
      </CampoGeralGlobal>

      <CampoCalendarioGlobal
        label="Data prevista para o próximo passo"
        valor={{ inicio: dataProximo ? new Date(dataProximo) : null, fim: null }}
        aoMudarValor={v => onChangeData(v.inicio?.toISOString().slice(0, 16) ?? '')}
      />
    </Secao>
  )
}

// ── Aba Lembrete ──────────────────────────────────────────────────────────────

function AbaLembrete({
  antecedencia,
  dataLembrete,
  notificarEmail,
  notificarWhatsApp,
  onChangeAntecedencia,
  onChangeData,
  onToggleEmail,
  onToggleWhatsApp,
}: {
  antecedencia:         string
  dataLembrete:         string
  notificarEmail:       boolean
  notificarWhatsApp:    boolean
  onChangeAntecedencia: (v: string) => void
  onChangeData:         (v: string) => void
  onToggleEmail:        () => void
  onToggleWhatsApp:     () => void
}) {
  return (
    <Secao titulo="Lembrete" icone={<Bell size={12} />} modifier="ckm-secao--lembrete">
      <div className="ckm-lembrete-info">
        <Bell size={16} color="#f59e0b" weight="duotone" style={{ flexShrink: 0, marginTop: 1 }} />
        Receba uma notificação para não esquecer de agir. O lembrete é enviado no horário que você definir abaixo.
      </div>

      <div>
        <div className="ckm-ant-label">Lembrar com antecedência</div>
        <div className="ckm-ant-pills">
          {ANTECEDENCIA_OPTS.map(opt => (
            <button
              key={opt.id}
              type="button"
              className={`ckm-ant-pill ${antecedencia === opt.id ? 'ckm-ant-pill--ativo' : ''}`}
              onClick={() => onChangeAntecedencia(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <CampoCalendarioGlobal
        label="Data e Hora do Lembrete"
        valor={{ inicio: dataLembrete ? new Date(dataLembrete) : null, fim: null }}
        aoMudarValor={v => onChangeData(v.inicio?.toISOString().slice(0, 16) ?? '')}
      />

      <div>
        <div className="ckm-ant-label">Notificar por</div>
        <div className="ckm-check-group">
          <label className={`ckm-check-label ${notificarEmail ? 'ckm-check-label--ativo' : ''}`}>
            <input type="checkbox" checked={notificarEmail} onChange={onToggleEmail} />
            <EnvelopeSimple size={14} />
            E-mail
          </label>
          <label className={`ckm-check-label ${notificarWhatsApp ? 'ckm-check-label--ativo' : ''}`}>
            <input type="checkbox" checked={notificarWhatsApp} onChange={onToggleWhatsApp} />
            <WhatsappLogo size={14} />
            WhatsApp
          </label>
        </div>
      </div>
    </Secao>
  )
}

// ── Modal principal ───────────────────────────────────────────────────────────

export function ModalCardKanban<T extends CardKanbanItem>({
  aberto,
  item,
  colunas,
  onFechar,
  onSalvar,
}: ModalCardKanbanProps<T>) {
  const [abaAtiva,          setAbaAtiva]          = useState('informacoes')
  const [form,              setForm]              = useState<T | null>(null)
  const [descricao,         setDescricao]         = useState('')
  const [tipoAtividade,     setTipoAtividade]     = useState(TIPOS_ATIVIDADE[0])
  const [participantes,     setParticipantes]     = useState<string[]>([])
  const [proximoPasso,      setProximoPasso]      = useState('')
  const [dataProximo,       setDataProximo]       = useState('')
  const [antecedencia,      setAntecedencia]      = useState('')
  const [dataLembrete,      setDataLembrete]      = useState('')
  const [notificarEmail,    setNotificarEmail]    = useState(false)
  const [notificarWhatsApp, setNotificarWhatsApp] = useState(false)
  const [salvando,          setSalvando]          = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto && item) {
      setForm({ ...item })
      setAbaAtiva('informacoes')
      setDescricao(item.descricao ?? '')
      setTipoAtividade(item.tipoAtividade ?? TIPOS_ATIVIDADE[0])
      setParticipantes([item.responsavel])
      setProximoPasso(item.proximoPasso ?? '')
      setDataProximo('')
      setAntecedencia('')
      setDataLembrete('')
      setNotificarEmail(false)
      setNotificarWhatsApp(false)
    }
  }, [aberto, item])

  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar])

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  if (!aberto || !item || !form) return null

  const dirty = (
    JSON.stringify(form) !== JSON.stringify(item) ||
    descricao !== '' ||
    proximoPasso !== '' ||
    antecedencia !== ''
  )

  const coluna   = colunas.find(c => c.key === form.colunaKey)
  const pc       = PRIORIDADE_COR[form.prioridade]
  const historico = gerarHistorico(item)

  function handleChange(patch: Partial<CardKanbanItem>) {
    setForm(prev => prev ? ({ ...prev, ...patch } as T) : prev)
  }

  async function handleSalvar() {
    if (!form || salvando) return
    setSalvando(true)
    await new Promise(r => setTimeout(r, 500))
    onSalvar({
      ...form,
      descricao:     descricao     || undefined,
      tipoAtividade: tipoAtividade || undefined,
      proximoPasso:  proximoPasso  || undefined,
    })
    setSalvando(false)
    onFechar()
  }

  const modal = (
    <div className="ckm-overlay" onClick={e => { if (e.target === e.currentTarget) onFechar() }}>
      <div ref={dialogRef} className="ckm-dialog" role="dialog" aria-modal="true" aria-label={form.nome}>

        {/* ── Header ── */}
        <div className="ckm-header">
          <div className="ckm-header-meta">
            <BuildingOffice size={11} />
            <span>{form.empresa || 'Sem vínculo empresa'}</span>
            <span className="ckm-header-meta-sep">·</span>
            <span style={{ color: 'var(--text-muted)' }}>—</span>
          </div>

          <div className="ckm-header-badges">
            {coluna && (
              <span
                className="ckm-badge ckm-badge-status"
                style={{
                  background: `${coluna.color}18`,
                  color: coluna.color,
                  borderColor: `${coluna.color}35`,
                }}
              >
                <span className="ckm-badge-dot" />
                {coluna.label}
              </span>
            )}
            <span
              className="ckm-badge ckm-badge-prioridade"
              style={{
                background: `${pc}15`,
                color: pc,
                borderColor: `${pc}30`,
                border: '1px solid',
              }}
            >
              {PRIORIDADE_LABEL[form.prioridade]}
            </span>
          </div>

          <h2 className="ckm-header-titulo">{form.nome}</h2>

          <button className="ckm-btn-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={16} weight="bold" />
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
              {aba.icone}
              {aba.rotulo}
            </button>
          ))}
        </nav>

        {/* ── Body ── */}
        <div className="ckm-body" role="tabpanel">
          {abaAtiva === 'informacoes' && (
            <AbaInformacoes
              form={form}
              colunas={colunas}
              descricao={descricao}
              tipoAtividade={tipoAtividade}
              participantes={participantes}
              onChange={handleChange}
              onChangeDescricao={setDescricao}
              onChangeTipo={setTipoAtividade}
              onAddParticipante={p => setParticipantes(prev => prev.includes(p) ? prev : [...prev, p])}
              onRemoveParticipante={p => setParticipantes(prev => prev.filter(x => x !== p))}
            />
          )}

          {abaAtiva === 'tempo' && (
            <AbaTempo form={form} onChange={handleChange} />
          )}

          {abaAtiva === 'proximo' && (
            <AbaProximoPasso
              proximoPasso={proximoPasso}
              dataProximo={dataProximo}
              onChangePasso={setProximoPasso}
              onChangeData={setDataProximo}
            />
          )}

          {abaAtiva === 'lembrete' && (
            <AbaLembrete
              antecedencia={antecedencia}
              dataLembrete={dataLembrete}
              notificarEmail={notificarEmail}
              notificarWhatsApp={notificarWhatsApp}
              onChangeAntecedencia={setAntecedencia}
              onChangeData={setDataLembrete}
              onToggleEmail={() => setNotificarEmail(p => !p)}
              onToggleWhatsApp={() => setNotificarWhatsApp(p => !p)}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="ckm-footer">
          <div className="ckm-footer-esquerda">
            <button className="ckm-btn-excluir">
              <Trash size={13} />
              Excluir
            </button>
            <span className={`ckm-footer-status ${dirty ? 'ckm-footer-status--dirty' : ''}`}>
              {dirty
                ? <><CircleNotch size={11} /> Alterações não salvas</>
                : <><Check size={11} /> Sem alterações</>
              }
            </span>
          </div>

          <div className="ckm-footer-acoes">
            <button className="ckm-btn-cancelar" onClick={onFechar}>Cancelar</button>
            <button
              className="ckm-btn-salvar"
              disabled={!dirty || salvando}
              onClick={handleSalvar}
            >
              {salvando
                ? <><CircleNotch size={12} className="demo-spin" /> Salvando…</>
                : <><Check size={12} /> Salvar Alterações</>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
