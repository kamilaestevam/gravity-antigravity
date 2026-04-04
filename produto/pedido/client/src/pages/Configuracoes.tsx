/**
 * Configuracoes.tsx — Página de configurações do produto Pedido
 *
 * Categorias:
 *  ├── Cards       ← DnD + toggle + período padrão + catálogo de colunas
 *  ├── Tabela      ← em breve
 *  ├── Colunas     ← casas decimais + criar coluna personalizada
 *  ├── Notificações ← em breve
 *  └── Exportação  ← em breve
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SquaresFour, Table, Bell, DownloadSimple,
  ArrowCounterClockwise, Eye, EyeSlash, Plus, X, DotsSixVertical,
  Package, CurrencyDollar, Scales, Warning, CheckCircle, Coins,
  ClipboardText, ArrowRight, Gauge, ArrowsLeftRight, StackSimple, Money,
  Columns, TextT, Hash, CalendarBlank, Percent, ListBullets,
} from '@phosphor-icons/react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useCardPreferences, CARDS_CATALOGO, type CardPreferencia } from '../shared/useCardPreferences'
import './Configuracoes.css'

// ─── Mapa visual dos cards ────────────────────────────────────────────────────

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total_pedidos:        { icone: <Package           weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  valor_total:          { icone: <CurrencyDollar    weight="duotone" size={18} />, cor: '#34d399' },
  qtd_total:            { icone: <Scales            weight="duotone" size={18} />, cor: '#fbbf24' },
  pedidos_atrasados:    { icone: <Warning           weight="duotone" size={18} />, cor: '#f87171' },
  pedidos_abertos:      { icone: <ClipboardText     weight="duotone" size={18} />, cor: '#60a5fa' },
  pedidos_em_andamento: { icone: <ArrowRight        weight="duotone" size={18} />, cor: '#a78bfa' },
  cobertura_pendente:   { icone: <Coins             weight="duotone" size={18} />, cor: '#fb923c' },
  itens_prontos:        { icone: <CheckCircle       weight="duotone" size={18} />, cor: '#34d399' },
  qtd_atual_total:      { icone: <Gauge             weight="duotone" size={18} />, cor: '#38bdf8' },
  qtd_transferida_total:{ icone: <ArrowsLeftRight   weight="duotone" size={18} />, cor: '#a3e635' },
  qtd_inicial_total:    { icone: <StackSimple       weight="duotone" size={18} />, cor: '#94a3b8' },
  valor_itens_total:    { icone: <Money             weight="duotone" size={18} />, cor: '#f59e0b' },
}

const PERIODOS = [
  { id: '7d',   label: '7 dias'  },
  { id: '30d',  label: '30 dias' },
  { id: '6m',   label: '6 meses' },
  { id: '1a',   label: '1 ano'   },
  { id: 'tudo', label: 'Tudo'    },
]

// ─── Item sortável (DnD) ──────────────────────────────────────────────────────

function CardSortavel({
  pref, onToggle, onRemover,
}: {
  pref: CardPreferencia
  onToggle: () => void
  onRemover: () => void
}) {
  const { t } = useTranslation()
  const def    = CARDS_CATALOGO.find(c => c.id === pref.id)!
  const visual = CARD_VISUAL[pref.id]

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: pref.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 999 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}`}
    >
      <button
        type="button"
        className="cfg-drag-handle"
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
      >
        <DotsSixVertical size={16} weight="bold" />
      </button>

      <div className="cfg-card-row__info">
        <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
          {visual.icone}
        </span>
        <div>
          <p className="cfg-card-row__nome">{t(def.labelKey)}</p>
          <p className="cfg-card-row__desc">{t(def.descKey)}</p>
        </div>
      </div>

      <span className="cfg-origem-badge cfg-origem-badge--meus">{def.origem}</span>

      <TooltipGlobal descricao={pref.visible ? 'Ocultar na lista' : 'Exibir na lista'}>
        <button
          type="button"
          className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
          onClick={onToggle}
          aria-label={pref.visible ? 'Ocultar card' : 'Exibir card'}
        >
          {pref.visible
            ? <Eye      size={15} weight="bold" />
            : <EyeSlash size={15} weight="bold" />
          }
        </button>
      </TooltipGlobal>

      <TooltipGlobal descricao="Remover da lista">
        <button
          type="button"
          className="cfg-remove-btn"
          onClick={onRemover}
          aria-label="Remover card"
        >
          <X size={13} weight="bold" />
        </button>
      </TooltipGlobal>
    </div>
  )
}

// ─── Categorias sidebar ───────────────────────────────────────────────────────

const CATEGORIAS = [
  { id: 'cards',        label: 'Cards',        icone: <SquaresFour    size={15} weight="duotone" />, ativo: true  },
  { id: 'tabela',       label: 'Tabela',       icone: <Table          size={15} weight="duotone" />, ativo: false },
  { id: 'colunas',      label: 'Colunas',      icone: <Columns        size={15} weight="duotone" />, ativo: true  },
  { id: 'notificacoes', label: 'Notificações', icone: <Bell           size={15} weight="duotone" />, ativo: false },
  { id: 'exportacao',   label: 'Exportação',   icone: <DownloadSimple size={15} weight="duotone" />, ativo: false },
] as const

type CategoriaId = (typeof CATEGORIAS)[number]['id']

// ─── Tipos para colunas personalizadas ───────────────────────────────────────

type TipoColuna = 'alfanumerico' | 'numerico' | 'data' | 'valor' | 'percentual' | 'select'
type EscopoColuna = 'pedido' | 'item' | 'ambos'

interface ColunaUsuario {
  id: string
  nome: string
  tipo: TipoColuna
  casas_decimais: number
  escopo: EscopoColuna
  opcoes: string[]
}

interface NovaColuna {
  nome: string
  tipo: TipoColuna
  casas_decimais: number
  escopo: EscopoColuna
  opcoes: string[]
}

// ─── Colunas numéricas nativas — casas decimais ───────────────────────────────

const COLUNAS_NUMERICAS = [
  { campo: 'valor_total_pedido',           label: 'Valor Total',                    padrao: 2 },
  { campo: 'quantidade_total_pedido',      label: 'Quantidade Total',               padrao: 0 },
  { campo: 'quantidade_inicial_total',     label: 'Quantidade Inicial Total',       padrao: 0 },
  { campo: 'quantidade_transferida_total', label: 'Quantidade Transferida Total',   padrao: 0 },
  { campo: 'peso_liquido_total_pedido',    label: 'Peso Líquido Total',             padrao: 3 },
  { campo: 'peso_bruto_total_pedido',      label: 'Peso Bruto Total',               padrao: 3 },
  { campo: 'cubagem_total_pedido',         label: 'Cubagem Total',                  padrao: 4 },
] as const

const TIPOS_COLUNA: { id: TipoColuna; label: string; icone: React.ReactNode }[] = [
  { id: 'alfanumerico', label: 'Alfanumérico', icone: <TextT         size={16} weight="duotone" /> },
  { id: 'numerico',     label: 'Numérico',     icone: <Hash          size={16} weight="duotone" /> },
  { id: 'data',         label: 'Data',         icone: <CalendarBlank size={16} weight="duotone" /> },
  { id: 'valor',        label: 'Valor $',      icone: <CurrencyDollar size={16} weight="duotone" /> },
  { id: 'percentual',   label: 'Percentual %', icone: <Percent       size={16} weight="duotone" /> },
  { id: 'select',       label: 'Select/Lista', icone: <ListBullets   size={16} weight="duotone" /> },
]

function carregarCasasDecimais(): Record<string, number> {
  try {
    const raw = localStorage.getItem('pedido:casas_decimais')
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch { /* ignore */ }
  return Object.fromEntries(COLUNAS_NUMERICAS.map(c => [c.campo, c.padrao]))
}

function carregarColunasUsuario(): ColunaUsuario[] {
  try {
    const raw = localStorage.getItem('pedido:colunas_usuario')
    if (raw) return JSON.parse(raw) as ColunaUsuario[]
  } catch { /* ignore */ }
  return []
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Configuracoes() {
  const { t } = useTranslation()
  const [categoria, setCategoria] = useState<CategoriaId>('cards')
  const [periodoAtivo, setPeriodoAtivo] = useState('30d')

  // ── Estado: casas decimais ──
  const [casasDecimais, setCasasDecimais] = useState<Record<string, number>>(carregarCasasDecimais)

  function handleCasasDecimaisChange(campo: string, valor: number) {
    const next = { ...casasDecimais, [campo]: valor }
    setCasasDecimais(next)
    localStorage.setItem('pedido:casas_decimais', JSON.stringify(next))
  }

  // ── Estado: colunas personalizadas ──
  const [colunasUsuario, setColunasUsuario] = useState<ColunaUsuario[]>(carregarColunasUsuario)
  const [novaColuna, setNovaColuna] = useState<NovaColuna>({
    nome: '',
    tipo: 'alfanumerico',
    casas_decimais: 2,
    escopo: 'pedido',
    opcoes: [],
  })
  const [novaOpcao, setNovaOpcao] = useState('')

  function handleCriarColuna() {
    if (!novaColuna.nome.trim()) return
    const coluna: ColunaUsuario = {
      id: `col_${Date.now()}`,
      nome: novaColuna.nome.trim(),
      tipo: novaColuna.tipo,
      casas_decimais: novaColuna.casas_decimais,
      escopo: novaColuna.escopo,
      opcoes: novaColuna.opcoes,
    }
    const next = [...colunasUsuario, coluna]
    setColunasUsuario(next)
    localStorage.setItem('pedido:colunas_usuario', JSON.stringify(next))
    setNovaColuna({ nome: '', tipo: 'alfanumerico', casas_decimais: 2, escopo: 'pedido', opcoes: [] })
    setNovaOpcao('')
  }

  function handleRemoverColuna(id: string) {
    const next = colunasUsuario.filter(c => c.id !== id)
    setColunasUsuario(next)
    localStorage.setItem('pedido:colunas_usuario', JSON.stringify(next))
  }

  function handleAdicionarOpcao() {
    const trimmed = novaOpcao.trim()
    if (!trimmed || novaColuna.opcoes.includes(trimmed)) return
    setNovaColuna(prev => ({ ...prev, opcoes: [...prev.opcoes, trimmed] }))
    setNovaOpcao('')
  }

  function handleRemoverOpcao(opcao: string) {
    setNovaColuna(prev => ({ ...prev, opcoes: prev.opcoes.filter(o => o !== opcao) }))
  }

  const { prefs, disponiveis, adicionar, remover, toggle, reordenar, resetar } = useCardPreferences()

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = prefs.findIndex(p => p.id === active.id)
    const newIndex = prefs.findIndex(p => p.id === over.id)
    reordenar(arrayMove(prefs, oldIndex, newIndex))
  }

  return (
    <div className="cfg-page ws-fade-up">

      {/* ── Sidebar ── */}
      <aside className="cfg-sidebar">
        <p className="cfg-sidebar__titulo">Configurações</p>
        <nav className="cfg-sidebar__nav">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={[
                'cfg-sidebar__item',
                categoria === cat.id ? 'cfg-sidebar__item--ativo' : '',
                !cat.ativo           ? 'cfg-sidebar__item--breve' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => { if (cat.ativo) setCategoria(cat.id) }}
            >
              <span className="cfg-sidebar__item-icon">{cat.icone}</span>
              <span className="cfg-sidebar__item-label">{cat.label}</span>
              {!cat.ativo && <span className="cfg-badge-breve">Em breve</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="cfg-conteudo">

        {categoria === 'cards' && (
          <div className="cfg-cards-wrapper">

            {/* ── Período padrão ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Período de comparação</h2>
                  <p className="cfg-secao__desc">
                    Define o intervalo padrão exibido nos badges de tendência dos cards
                  </p>
                </div>
              </div>
              <div className="cfg-periodo-pills">
                {PERIODOS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`cfg-periodo-pill${periodoAtivo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                    onClick={() => setPeriodoAtivo(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Meus cards ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Meus cards</h2>
                  <p className="cfg-secao__desc">
                    Arraste para reordenar · olho para ocultar · × para remover
                  </p>
                </div>
                <TooltipGlobal descricao="Restaura os 3 cards padrão do produto">
                  <button type="button" className="cfg-reset-btn" onClick={resetar}>
                    <ArrowCounterClockwise size={13} weight="bold" />
                    Restaurar padrão
                  </button>
                </TooltipGlobal>
              </div>

              {prefs.length === 0 ? (
                <p className="cfg-empty">Nenhum card adicionado. Escolha na tabela abaixo.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={prefs.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="cfg-cards-lista">
                      {prefs.map(pref => (
                        <CardSortavel
                          key={pref.id}
                          pref={pref}
                          onToggle={() => toggle(pref.id)}
                          onRemover={() => remover(pref.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>

            {/* ── Catálogo — tabela de colunas disponíveis ── */}
            {disponiveis.length > 0 && (
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Colunas disponíveis</h2>
                    <p className="cfg-secao__desc">
                      Todas as colunas da tabela de pedidos · clique em + para adicionar como card
                    </p>
                  </div>
                </div>

                {/* Cabeçalho da tabela */}
                <div className="cfg-tabela-head">
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--nome">Coluna</span>
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--origem">Origem</span>
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--agg">Agregação</span>
                  <span className="cfg-tabela-head__col cfg-tabela-head__col--acao" />
                </div>

                <div className="cfg-cards-lista">
                  {disponiveis.map(def => {
                    const visual = CARD_VISUAL[def.id]
                    return (
                      <div key={def.id} className="cfg-card-row cfg-card-row--disponivel">
                        <span className="cfg-drag-handle cfg-drag-handle--ghost">
                          <DotsSixVertical size={16} weight="bold" />
                        </span>
                        <div className="cfg-card-row__info">
                          <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
                            {visual.icone}
                          </span>
                          <div>
                            <p className="cfg-card-row__nome">{t(def.labelKey)}</p>
                            <p className="cfg-card-row__desc">{t(def.descKey)}</p>
                          </div>
                        </div>
                        <span className={`cfg-origem-badge cfg-origem-badge--${def.origem === 'Pedido' ? 'pedido' : 'item'}`}>
                          {def.origem}
                        </span>
                        <span className="cfg-agg-badge">{def.tipoAgg}</span>
                        <TooltipGlobal descricao="Adicionar aos meus cards">
                          <button
                            type="button"
                            className="cfg-add-btn"
                            onClick={() => adicionar(def.id)}
                            aria-label="Adicionar card"
                          >
                            <Plus size={13} weight="bold" />
                          </button>
                        </TooltipGlobal>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

          </div>
        )}

        {categoria === 'colunas' && (
          <div className="cfg-cards-wrapper">

            {/* ── Casas Decimais ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Casas Decimais por Coluna</h2>
                  <p className="cfg-secao__desc">
                    Define quantas casas decimais são exibidas em colunas numéricas. Padrão: 2
                  </p>
                </div>
              </div>
              <div className="cfg-colunas-lista">
                {COLUNAS_NUMERICAS.map(col => (
                  <div key={col.campo} className="cfg-coluna-row">
                    <span className="cfg-coluna-row__label">{col.label}</span>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      className="cfg-casas-input"
                      value={casasDecimais[col.campo] ?? col.padrao}
                      onChange={e => handleCasasDecimaisChange(col.campo, Math.min(8, Math.max(0, Number(e.target.value))))}
                      aria-label={`Casas decimais para ${col.label}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Criar Coluna Personalizada ── */}
            <section className="cfg-secao">
              <div className="cfg-secao__header">
                <div>
                  <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                  <p className="cfg-secao__desc">
                    Adicione campos extras à tabela de pedidos. As colunas criadas ficam disponíveis para todos os usuários.
                  </p>
                </div>
              </div>

              {/* Formulário */}
              <div className="cfg-nova-coluna-form">

                {/* Nome */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label" htmlFor="nova-coluna-nome">Nome</label>
                  <input
                    id="nova-coluna-nome"
                    type="text"
                    className="cfg-form-input"
                    placeholder="Ex: Código ERP"
                    value={novaColuna.nome}
                    onChange={e => setNovaColuna(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>

                {/* Tipo */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label">Tipo</label>
                  <div className="cfg-tipo-grid">
                    {TIPOS_COLUNA.map(tipo => (
                      <button
                        key={tipo.id}
                        type="button"
                        className={`cfg-tipo-btn${novaColuna.tipo === tipo.id ? ' cfg-tipo-btn--ativo' : ''}`}
                        onClick={() => setNovaColuna(prev => ({ ...prev, tipo: tipo.id }))}
                        aria-pressed={novaColuna.tipo === tipo.id}
                      >
                        <span className="cfg-tipo-btn__icone">{tipo.icone}</span>
                        <span className="cfg-tipo-btn__label">{tipo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Casas decimais (só para numérico ou valor) */}
                {(novaColuna.tipo === 'numerico' || novaColuna.tipo === 'valor') && (
                  <div className="cfg-form-group">
                    <label className="cfg-form-label" htmlFor="nova-coluna-casas">Casas decimais</label>
                    <input
                      id="nova-coluna-casas"
                      type="number"
                      min={0}
                      max={8}
                      className="cfg-casas-input"
                      value={novaColuna.casas_decimais}
                      onChange={e => setNovaColuna(prev => ({ ...prev, casas_decimais: Math.min(8, Math.max(0, Number(e.target.value))) }))}
                      aria-label="Casas decimais da nova coluna"
                    />
                  </div>
                )}

                {/* Opções do select */}
                {novaColuna.tipo === 'select' && (
                  <div className="cfg-form-group">
                    <label className="cfg-form-label">Opções</label>
                    <div className="cfg-opcoes-add-row">
                      <input
                        type="text"
                        className="cfg-form-input"
                        placeholder="Nova opção"
                        value={novaOpcao}
                        onChange={e => setNovaOpcao(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionarOpcao() } }}
                      />
                      <button
                        type="button"
                        className="cfg-add-btn"
                        onClick={handleAdicionarOpcao}
                        aria-label="Adicionar opção"
                      >
                        <Plus size={13} weight="bold" />
                      </button>
                    </div>
                    {novaColuna.opcoes.length > 0 && (
                      <div className="cfg-opcoes-lista">
                        {novaColuna.opcoes.map(op => (
                          <span key={op} className="cfg-opcao-chip">
                            {op}
                            <button
                              type="button"
                              className="cfg-opcao-chip__remove"
                              onClick={() => handleRemoverOpcao(op)}
                              aria-label={`Remover opção ${op}`}
                            >
                              <X size={10} weight="bold" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Escopo */}
                <div className="cfg-form-group">
                  <label className="cfg-form-label">Escopo</label>
                  <div className="cfg-escopo-row">
                    {(['pedido', 'item', 'ambos'] as EscopoColuna[]).map(esc => (
                      <label key={esc} className="cfg-escopo-option">
                        <input
                          type="radio"
                          name="escopo"
                          value={esc}
                          checked={novaColuna.escopo === esc}
                          onChange={() => setNovaColuna(prev => ({ ...prev, escopo: esc }))}
                        />
                        <span>{esc.charAt(0).toUpperCase() + esc.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="cfg-criar-coluna-btn"
                  onClick={handleCriarColuna}
                  disabled={!novaColuna.nome.trim()}
                >
                  <Plus size={14} weight="bold" />
                  Criar Coluna
                </button>
              </div>

              {/* Lista de colunas criadas */}
              {colunasUsuario.length > 0 && (
                <div className="cfg-colunas-criadas">
                  <p className="cfg-colunas-criadas__titulo">Colunas criadas</p>
                  <div className="cfg-cards-lista">
                    {colunasUsuario.map(col => {
                      const tipoInfo = TIPOS_COLUNA.find(t => t.id === col.tipo)
                      return (
                        <div key={col.id} className="cfg-card-row">
                          <span className="cfg-coluna-tipo-icone">{tipoInfo?.icone}</span>
                          <div className="cfg-card-row__info">
                            <div>
                              <p className="cfg-card-row__nome">{col.nome}</p>
                              <p className="cfg-card-row__desc">
                                {tipoInfo?.label} · {col.escopo}
                                {(col.tipo === 'numerico' || col.tipo === 'valor') && ` · ${col.casas_decimais} casas`}
                                {col.tipo === 'select' && col.opcoes.length > 0 && ` · ${col.opcoes.length} opções`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => handleRemoverColuna(col.id)}
                            aria-label={`Remover coluna ${col.nome}`}
                          >
                            <X size={13} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

          </div>
        )}

      </main>
    </div>
  )
}
