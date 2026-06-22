/**
 * ConfiguracoesSmartRead — Configurações do produto Smart Read
 *
 * Paridade de layout 1:1 com a Configurações do Pedido (modelo oficial):
 *  ├── Tabs de visualização (Insights | Lista) no topo
 *  ├── Sidebar com grupo VISUALIZAÇÕES (Card, Visão Geral, Tabelas, Colunas)
 *  └── Conteúdo exibe SOMENTE a categoria ativa, com:
 *       • Card        → período de comparação + preview + ATIVOS + DISPONÍVEIS
 *       • Visão Geral → gráficos exibidos (toggle)
 *       • Tabelas     → linhas por página, densidade, status visíveis
 *       • Colunas     → colunas exibidas + ordem (drag)
 *
 * Estado é local (Smart Read ainda não tem backend de preferências) — sem
 * persistência falsa (Mandamentos 05/08). Reorder via drag-and-drop nativo.
 */

import React, { useMemo, useRef, useState } from 'react'
import {
  SquaresFour, ChartPieSlice, Table, Columns,
  FileText, CheckCircle, ArrowsClockwise, Warning, Gauge, ListBullets, Files,
  ChartLine, Ranking, Plus, Eye, EyeSlash, DotsSixVertical, X, PencilSimple, Trash,
  type Icon,
} from '@phosphor-icons/react'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SmartReadVisualizacaoTabs } from '../../components/SmartReadVisualizacaoTabs'
import '../../components/SmartReadVisualizacaoTabs.css'
import './configuracoes-smart-read.css'

type CategoriaId = 'card' | 'visao-geral' | 'tabelas' | 'colunas'

// ─── Catálogo de cards de leitura ─────────────────────────────────────────────
interface CardDef {
  id: string
  nome: string
  icone: Icon
  cor: string
  origem: 'Leitura' | 'Documento'
  agg: 'Contagem' | 'Taxa'
}

const CARDS_CATALOGO: CardDef[] = [
  { id: 'total_leituras',   nome: 'Total de Leituras',   icone: FileText,        cor: '#818cf8', origem: 'Leitura',   agg: 'Contagem' },
  { id: 'concluidas',       nome: 'Concluídas',          icone: CheckCircle,     cor: '#34d399', origem: 'Leitura',   agg: 'Contagem' },
  { id: 'processando',      nome: 'Em Processamento',    icone: ArrowsClockwise, cor: '#60a5fa', origem: 'Leitura',   agg: 'Contagem' },
  { id: 'falhas',           nome: 'Falhas',              icone: Warning,         cor: '#f87171', origem: 'Leitura',   agg: 'Contagem' },
  { id: 'taxa_sucesso',     nome: 'Taxa de Sucesso',     icone: Gauge,           cor: '#34d399', origem: 'Leitura',   agg: 'Taxa' },
  { id: 'campos_extraidos', nome: 'Campos Extraídos',    icone: ListBullets,     cor: '#fbbf24', origem: 'Leitura',   agg: 'Contagem' },
  { id: 'documentos',       nome: 'Documentos',          icone: Files,           cor: '#a78bfa', origem: 'Documento', agg: 'Contagem' },
]

const ATIVOS_PADRAO: CardPref[] = [
  { id: 'total_leituras', visible: true },
  { id: 'concluidas',     visible: true },
  { id: 'processando',    visible: true },
  { id: 'falhas',         visible: false },
  { id: 'taxa_sucesso',   visible: true },
]

interface CardPref { id: string; visible: boolean }

// ─── Colunas (nome + subtítulo + ações: editar / ocultar / excluir) ───────────
interface ColunaPref { id: string; nome: string; tipo: string; visible: boolean }

const PERIODOS = [
  { id: '7d',   label: '7 dias' },
  { id: '30d',  label: '30 dias' },
  { id: '6m',   label: '6 meses' },
  { id: '1a',   label: '1 ano' },
  { id: 'tudo', label: 'Tudo' },
]

// ─── Catálogo de gráficos (Visão Geral) ───────────────────────────────────────
interface ItemSimples { id: string; nome: string; desc: string; icone: Icon; cor: string }

const GRAFICOS: ItemSimples[] = [
  { id: 'serie_campos',      nome: 'Campos por dia',                    desc: 'Série temporal de campos extraídos',   icone: ChartLine,     cor: '#818cf8' },
  { id: 'ranking',           nome: 'Ranking de participantes',          desc: 'Top participantes por volume',         icone: Ranking,       cor: '#34d399' },
  { id: 'distribuicao_doc',  nome: 'Distribuição por tipo de documento', desc: 'Proporção por tipo de documento',     icone: ChartPieSlice, cor: '#fbbf24' },
  { id: 'taxa_conferencia',  nome: 'Taxa de conferência',               desc: 'Percentual de leituras conferidas',    icone: Gauge,         cor: '#a78bfa' },
]

const LINHAS_OPCOES = ['10', '25', '50', '100']
const DENSIDADE_OPCOES = [{ id: 'compacto', label: 'Compacto' }, { id: 'confortavel', label: 'Confortável' }]

const SIDEBAR: { id: CategoriaId; label: string; icone: Icon }[] = [
  { id: 'card',        label: 'Card',        icone: SquaresFour },
  { id: 'visao-geral', label: 'Visão Geral', icone: ChartPieSlice },
  { id: 'tabelas',     label: 'Tabelas',     icone: Table },
  { id: 'colunas',     label: 'Colunas',     icone: Columns },
]

export default function ConfiguracoesSmartRead() {
  const [categoria, setCategoria] = useState<CategoriaId>('card')

  // Card
  const [periodo, setPeriodo] = useState('30d')
  const [cards, setCards] = useState<CardPref[]>(ATIVOS_PADRAO)
  const [arrastandoCard, setArrastandoCard] = useState<string | null>(null)

  // Visão Geral
  const [graficosOcultos, setGraficosOcultos] = useState<Set<string>>(new Set())

  // Tabelas
  const [linhasPagina, setLinhasPagina] = useState('25')
  const [densidade, setDensidade] = useState('confortavel')

  // Colunas Personalizadas — começa vazia (paridade com Pedido › Personalizadas)
  const [colunas, setColunas] = useState<ColunaPref[]>([])
  const [arrastandoColuna, setArrastandoColuna] = useState<string | null>(null)
  const [editandoColunaId, setEditandoColunaId] = useState<string | null>(null)
  const seqColuna = useRef(1)

  function criarColuna() {
    const id = `custom-${seqColuna.current++}`
    setColunas((prev) => [...prev, { id, nome: 'Nova coluna', tipo: 'Personalizada', visible: true }])
    setEditandoColunaId(id)
  }

  const periodoLabel = PERIODOS.find((p) => p.id === periodo)?.label ?? periodo

  const cardsDisponiveis = useMemo(
    () => CARDS_CATALOGO.filter((def) => !cards.some((c) => c.id === def.id)),
    [cards],
  )

  function reordenar<T extends { id: string }>(lista: T[], arrastandoId: string, alvoId: string): T[] {
    if (arrastandoId === alvoId) return lista
    const from = lista.findIndex((c) => c.id === arrastandoId)
    const to = lista.findIndex((c) => c.id === alvoId)
    if (from < 0 || to < 0) return lista
    const next = [...lista]
    const [movido] = next.splice(from, 1)
    next.splice(to, 0, movido)
    return next
  }

  return (
    <div className="srcfg-root">
      <div className="smart-read-vis-toolbar">
        <SmartReadVisualizacaoTabs />
      </div>

      <div className="cfg-page ws-fade-up">
        {/* ── Sidebar ── */}
        <aside className="cfg-sidebar">
          <nav className="cfg-sidebar__nav">
            <span className="cfg-sidebar__titulo--grupo">Visualizações</span>
            {SIDEBAR.map((item) => {
              const Icone = item.icone
              const ativo = categoria === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cfg-sidebar__item${ativo ? ' cfg-sidebar__item--ativo' : ''}`}
                  onClick={() => setCategoria(item.id)}
                >
                  <span className="cfg-sidebar__item-icon"><Icone weight="duotone" size={16} /></span>
                  <span className="cfg-sidebar__item-label">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ── Conteúdo ── */}
        <main className="cfg-conteudo">

          {/* ════════════ CARD ════════════ */}
          {categoria === 'card' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Meus Cards</h2>
                    <p className="cfg-secao__desc">Cards exibidos no topo das leituras · arraste para reordenar · olho para ocultar.</p>
                  </div>
                  <div className="cfg-secao__header-actions">
                    <button
                      type="button"
                      className="cfg-add-row-btn"
                      disabled={cardsDisponiveis.length === 0}
                      onClick={() => {
                        const proximo = cardsDisponiveis[0]
                        if (proximo) setCards((prev) => [...prev, { id: proximo.id, visible: true }])
                      }}
                    >
                      <Plus size={13} weight="bold" />
                      Adicionar card
                    </button>
                  </div>
                </div>

                {/* Período de comparação */}
                <ConfiguracaoSecaoGlobal label="Período de comparação" />
                <div className="cfg-periodo-row">
                  <div className="cfg-periodo-pills">
                    {PERIODOS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`cfg-periodo-pill${periodo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setPeriodo(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {cards.length > 0 && (
                  <div className="cfg-cards-preview-wrap">
                    <p className="cfg-cards-preview-label">
                      <SquaresFour size={12} weight="fill" /> Preview — como ficará na tela
                    </p>
                    <div className="cfg-cards-preview-grid">
                      {cards.map((pref, i) => {
                        const def = CARDS_CATALOGO.find((c) => c.id === pref.id)
                        if (!def) return null
                        const Icone = def.icone
                        return (
                          <div
                            key={pref.id}
                            className={`cfg-kpi-preview-card${!pref.visible ? ' cfg-kpi-preview-card--oculto' : ''}`}
                            style={{ borderTopColor: def.cor }}
                          >
                            <span className="cfg-kpi-preview-card__pos">{i + 1}</span>
                            <span className="cfg-kpi-preview-card__icon" style={{ color: def.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div className="cfg-kpi-preview-card__line" style={{ background: def.cor }} />
                            <p className="cfg-kpi-preview-card__label">{def.nome}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Ativos */}
                <ConfiguracaoSecaoGlobal label="Ativos" count={`${cards.length} cards`} />
                {cards.length === 0 ? (
                  <p className="cfg-empty">Nenhum card ativo. Adicione um card abaixo.</p>
                ) : (
                  <div className="cfg-cards-lista">
                    {cards.map((pref) => {
                      const def = CARDS_CATALOGO.find((c) => c.id === pref.id)
                      if (!def) return null
                      const Icone = def.icone
                      return (
                        <div
                          key={pref.id}
                          className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}${arrastandoCard === pref.id ? ' cfg-card-row--arrastando' : ''}`}
                          draggable
                          onDragStart={() => setArrastandoCard(pref.id)}
                          onDragEnter={() => { if (arrastandoCard) setCards((prev) => reordenar(prev, arrastandoCard, pref.id)) }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setArrastandoCard(null)}
                        >
                          <span className="cfg-drag-handle"><DotsSixVertical size={16} weight="bold" /></span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: def.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{def.nome}</p>
                              <p className="cfg-card-row__desc">{def.agg} · {def.origem} · {periodoLabel}</p>
                            </div>
                          </div>
                          <span className={`cfg-origem-badge cfg-origem-badge--${def.origem.toLowerCase()}`}>{def.origem}</span>
                          <button
                            type="button"
                            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
                            onClick={() => setCards((prev) => prev.map((c) => (c.id === pref.id ? { ...c, visible: !c.visible } : c)))}
                            aria-label={pref.visible ? 'Ocultar card' : 'Exibir card'}
                          >
                            {pref.visible ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
                          </button>
                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => setCards((prev) => prev.filter((c) => c.id !== pref.id))}
                            aria-label="Remover card"
                          >
                            <X size={13} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Disponíveis */}
                <ConfiguracaoSecaoGlobal label="Disponíveis" hint="Clique em + para adicionar" style={{ marginTop: '1.5rem' }} />
                {cardsDisponiveis.length === 0 ? (
                  <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>Todos os cards já foram adicionados.</p>
                ) : (
                  <div className="cfg-cards-lista">
                    {cardsDisponiveis.map((def) => {
                      const Icone = def.icone
                      return (
                        <div key={def.id} className="cfg-card-row cfg-card-row--disponivel">
                          <span className="cfg-drag-handle cfg-drag-handle--ghost"><DotsSixVertical size={16} weight="bold" /></span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: def.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{def.nome}</p>
                              <p className="cfg-card-row__desc">{def.agg} · {def.origem}</p>
                            </div>
                          </div>
                          <span className={`cfg-origem-badge cfg-origem-badge--${def.origem.toLowerCase()}`}>{def.origem}</span>
                          <span className="cfg-agg-badge">{def.agg}</span>
                          <button
                            type="button"
                            className="cfg-add-btn"
                            onClick={() => setCards((prev) => [...prev, { id: def.id, visible: true }])}
                            aria-label="Adicionar card"
                          >
                            <Plus size={15} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ════════════ VISÃO GERAL ════════════ */}
          {categoria === 'visao-geral' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Visão Geral</h2>
                    <p className="cfg-secao__desc">Gráficos exibidos no painel de Insights · olho para ocultar.</p>
                  </div>
                </div>

                <ConfiguracaoSecaoGlobal label="Gráficos" count={`${GRAFICOS.length - graficosOcultos.size} de ${GRAFICOS.length}`} />
                <div className="cfg-cards-lista">
                  {GRAFICOS.map((g) => {
                    const Icone = g.icone
                    const visivel = !graficosOcultos.has(g.id)
                    return (
                      <div key={g.id} className={`cfg-card-row${!visivel ? ' cfg-card-row--oculto' : ''}`}>
                        <div className="cfg-card-row__info">
                          <span className="cfg-card-row__icone" style={{ color: g.cor }}>
                            <Icone weight="duotone" size={18} />
                          </span>
                          <div>
                            <p className="cfg-card-row__nome">{g.nome}</p>
                            <p className="cfg-card-row__desc">{g.desc}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`cfg-eye-btn${visivel ? ' cfg-eye-btn--on' : ''}`}
                          onClick={() => setGraficosOcultos((prev) => {
                            const next = new Set(prev)
                            if (next.has(g.id)) next.delete(g.id); else next.add(g.id)
                            return next
                          })}
                          aria-label={visivel ? 'Ocultar gráfico' : 'Exibir gráfico'}
                        >
                          {visivel ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ════════════ TABELAS ════════════ */}
          {categoria === 'tabelas' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Tabelas</h2>
                    <p className="cfg-secao__desc">Exibição da tabela de leituras.</p>
                  </div>
                </div>

                <ConfiguracaoSecaoGlobal label="Linhas por página" />
                <div className="cfg-periodo-row">
                  <div className="cfg-periodo-pills">
                    {LINHAS_OPCOES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`cfg-periodo-pill${linhasPagina === n ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setLinhasPagina(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <ConfiguracaoSecaoGlobal label="Densidade" style={{ marginTop: '1.5rem' }} />
                <div className="cfg-periodo-row">
                  <div className="cfg-periodo-pills">
                    {DENSIDADE_OPCOES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={`cfg-periodo-pill${densidade === d.id ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setDensidade(d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ════════════ COLUNAS ════════════ */}
          {categoria === 'colunas' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                    <p className="cfg-secao__desc">Crie colunas extras para a tabela de leituras.</p>
                  </div>
                </div>

                {/* Ativas + Criar Coluna */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ConfiguracaoSecaoGlobal
                    label="Ativas"
                    count={colunas.length}
                    hint="Arraste para reordenar · lápis para editar · olho para ocultar"
                  />
                  <BotaoGlobal variante="primario" onClick={criarColuna}>
                    <Plus size={16} weight="bold" />
                    Criar Coluna
                  </BotaoGlobal>
                </div>

                {colunas.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '1.5rem', textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                    border: '1px dashed rgba(255,255,255,0.08)',
                  }}>
                    <Columns size={28} weight="duotone" style={{ color: 'var(--ws-muted, #64748b)' }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                      Nenhuma coluna criada ainda
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                      Use o botão "Criar Coluna" para criar a primeira.
                    </p>
                  </div>
                ) : (
                  <div className="cfg-kanban-campo-lista">
                    {colunas.map((col) => {
                      const editando = editandoColunaId === col.id
                      return (
                        <div
                          key={col.id}
                          className={`cfg-kanban-campo-row${!col.visible ? ' cfg-kanban-campo-row--oculto' : ''}${editando ? ' cfg-kanban-campo-row--editando' : ''}${arrastandoColuna === col.id ? ' cfg-kanban-campo-row--arrastando' : ''}`}
                          draggable={!editando}
                          onDragStart={() => setArrastandoColuna(col.id)}
                          onDragEnter={() => { if (arrastandoColuna) setColunas((prev) => reordenar(prev, arrastandoColuna, col.id)) }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setArrastandoColuna(null)}
                        >
                          <span className="cfg-drag-handle"><DotsSixVertical size={15} weight="bold" /></span>
                          <div className="cfg-kanban-campo-row__info">
                            {editando ? (
                              <input
                                type="text"
                                className="cfg-coluna-nome-input"
                                value={col.nome}
                                autoFocus
                                maxLength={50}
                                onChange={(e) => setColunas((prev) => prev.map((c) => (c.id === col.id ? { ...c, nome: e.target.value } : c)))}
                                onBlur={() => setEditandoColunaId(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditandoColunaId(null) }}
                              />
                            ) : (
                              <span className="cfg-kanban-campo-row__nome">{col.nome}</span>
                            )}
                            <span className="cfg-kanban-campo-row__tipo">{col.tipo}</span>
                          </div>
                          <button
                            type="button"
                            className={`cfg-kanban-campo-btn${editando ? ' cfg-kanban-campo-btn--ativo' : ''}`}
                            onClick={() => setEditandoColunaId(editando ? null : col.id)}
                            aria-label={`Renomear coluna ${col.nome}`}
                          >
                            <PencilSimple size={14} weight="duotone" />
                          </button>
                          <button
                            type="button"
                            className="cfg-kanban-campo-btn"
                            onClick={() => setColunas((prev) => prev.map((c) => (c.id === col.id ? { ...c, visible: !c.visible } : c)))}
                            aria-label={col.visible ? `Ocultar coluna ${col.nome}` : `Exibir coluna ${col.nome}`}
                          >
                            {col.visible ? <Eye size={14} weight="duotone" /> : <EyeSlash size={14} weight="duotone" />}
                          </button>
                          <button
                            type="button"
                            className="cfg-kanban-campo-btn cfg-kanban-campo-btn--remove"
                            onClick={() => setColunas((prev) => prev.filter((c) => c.id !== col.id))}
                            aria-label={`Excluir coluna ${col.nome}`}
                          >
                            <Trash size={14} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
