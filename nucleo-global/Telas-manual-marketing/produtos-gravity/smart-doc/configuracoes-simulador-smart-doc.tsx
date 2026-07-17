/**
 * ConfiguracoesSimuladorSmartDoc — paridade com ConfiguracoesSmartRead (produto real).
 * Estado local; abas Insights/Lista ficam no shell (SmartDocSimulator).
 */

import { useMemo, useRef, useState } from 'react'
import {
  SquaresFour,
  Table,
  Columns,
  FileText,
  CheckCircle,
  ArrowsClockwise,
  Warning,
  Gauge,
  ListBullets,
  Files,
  Plus,
  Eye,
  EyeSlash,
  DotsSixVertical,
  X,
  PencilSimple,
  Trash,
  type Icon,
} from '@phosphor-icons/react'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import {
  ModalNovaColunaConfigSimuladorSmartDoc,
  rotuloTipoColunaSmartDocSimulador,
  type ColunaPersonalizadaSmartDocSimulador,
  type TipoColunaSmartDocSimulador,
  type VisibilidadeColunaSmartDocSimulador,
} from './modal-nova-coluna-config-simulador-smart-doc'
import './configuracoes-simulador-smart-doc.css'

type CategoriaId = 'card' | 'tabelas' | 'colunas'

interface TabelaConfig {
  linhasPagina: string
  densidade: string
}

const TABELA_PADRAO: TabelaConfig = { linhasPagina: '25', densidade: 'confortavel' }

interface CardDef {
  id: string
  nome: string
  icone: Icon
  cor: string
  origem: 'Leitura' | 'Documento'
  agg: 'Contagem' | 'Taxa'
}

const CARDS_CATALOGO: CardDef[] = [
  { id: 'total_leituras', nome: 'Total de Leituras', icone: FileText, cor: '#a78bfa', origem: 'Leitura', agg: 'Contagem' },
  { id: 'concluidas', nome: 'Concluídas', icone: CheckCircle, cor: '#34d399', origem: 'Leitura', agg: 'Contagem' },
  { id: 'processando', nome: 'Em Processamento', icone: ArrowsClockwise, cor: '#60a5fa', origem: 'Leitura', agg: 'Contagem' },
  { id: 'falhas', nome: 'Falhas', icone: Warning, cor: '#f87171', origem: 'Leitura', agg: 'Contagem' },
  { id: 'taxa_sucesso', nome: 'Taxa de Sucesso', icone: Gauge, cor: '#34d399', origem: 'Leitura', agg: 'Taxa' },
  { id: 'campos_extraidos', nome: 'Campos Extraídos', icone: ListBullets, cor: '#fbbf24', origem: 'Leitura', agg: 'Contagem' },
  { id: 'documentos', nome: 'Documentos', icone: Files, cor: '#a78bfa', origem: 'Documento', agg: 'Contagem' },
]

const ATIVOS_PADRAO: CardPref[] = CARDS_CATALOGO.map((c) => ({ id: c.id, visible: true }))

interface CardPref {
  id: string
  visible: boolean
}

const PERIODOS = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '6m', label: '6 meses' },
  { id: '1a', label: '1 ano' },
  { id: 'tudo', label: 'Tudo' },
]

const PERIODO_PADRAO = '30d'

const LINHAS_OPCOES = ['10', '25', '50', '100']
const DENSIDADE_OPCOES = [
  { id: 'compacto', label: 'Compacto' },
  { id: 'confortavel', label: 'Confortável' },
]

const SIDEBAR: { id: CategoriaId; label: string; icone: Icon }[] = [
  { id: 'card', label: 'Card', icone: SquaresFour },
  { id: 'tabelas', label: 'Tabelas', icone: Table },
  { id: 'colunas', label: 'Colunas', icone: Columns },
]

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

export function ConfiguracoesSimuladorSmartDoc() {
  const [categoria, setCategoria] = useState<CategoriaId>('card')
  const [toastSalvo, setToastSalvo] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState(PERIODO_PADRAO)
  const [periodoSalvo, setPeriodoSalvo] = useState(PERIODO_PADRAO)
  const [cards, setCards] = useState<CardPref[]>(ATIVOS_PADRAO)
  const [cardsSalvos, setCardsSalvos] = useState<CardPref[]>(ATIVOS_PADRAO)
  const [arrastandoCard, setArrastandoCard] = useState<string | null>(null)
  const [tabelaConfig, setTabelaConfig] = useState<TabelaConfig>(TABELA_PADRAO)
  const [tabelaConfigSalva, setTabelaConfigSalva] = useState<TabelaConfig>(TABELA_PADRAO)
  const [pendingColunas, setPendingColunas] = useState<ColunaPersonalizadaSmartDocSimulador[]>([])
  const [colunasSalvas, setColunasSalvas] = useState<ColunaPersonalizadaSmartDocSimulador[]>([])
  const [arrastandoColuna, setArrastandoColuna] = useState<string | null>(null)
  const [criandoColuna, setCriandoColuna] = useState(false)
  const [editandoColuna, setEditandoColuna] = useState<ColunaPersonalizadaSmartDocSimulador | null>(null)
  const seqColuna = useRef(1)

  const tabelaDirty = JSON.stringify(tabelaConfig) !== JSON.stringify(tabelaConfigSalva)

  const cardsDirty =
    JSON.stringify(cards) !== JSON.stringify(cardsSalvos) || periodo !== periodoSalvo

  const colunasDirty = useMemo(() => {
    if (pendingColunas.length !== colunasSalvas.length) return true
    return pendingColunas.some((col, i) => {
      const orig = colunasSalvas[i]
      return !orig || orig.id !== col.id || orig.visible !== col.visible || orig.nome !== col.nome || orig.tipo !== col.tipo
    })
  }, [pendingColunas, colunasSalvas])

  function notificarSalvo(mensagem: string) {
    setToastSalvo(mensagem)
    window.setTimeout(() => setToastSalvo(null), 3200)
  }

  function salvarTabelaConfig() {
    setTabelaConfigSalva({ ...tabelaConfig })
    notificarSalvo('Preferências de tabela salvas.')
  }

  function restaurarTabelaConfig() {
    setTabelaConfig({ ...TABELA_PADRAO })
  }

  function salvarCardsConfig() {
    setCardsSalvos([...cards])
    setPeriodoSalvo(periodo)
    notificarSalvo('Preferências de cards salvas.')
  }

  function restaurarCardsPadrao() {
    setCards(ATIVOS_PADRAO.map((c) => ({ ...c })))
    setPeriodo(PERIODO_PADRAO)
  }

  function handleColunaCriadaViaModal(dados: {
    nome: string
    tipo: TipoColunaSmartDocSimulador
    descricao?: string
    visibilidade: VisibilidadeColunaSmartDocSimulador
    obrigatorio: boolean
  }) {
    const id = `custom-${seqColuna.current++}`
    setPendingColunas((prev) => [
      ...prev,
      {
        id,
        nome: dados.nome,
        tipo: dados.tipo,
        visible: true,
        visibilidade: dados.visibilidade,
        obrigatorio: dados.obrigatorio,
        ...(dados.visibilidade === 'privado' ? { id_usuario_criador: 'simulador-demo' } : {}),
        ...(dados.visibilidade === 'roles' ? { roles_permitidas: ['PADRAO'] } : {}),
        ...(dados.descricao ? { descricao: dados.descricao } : {}),
      },
    ])
    setCriandoColuna(false)
  }

  function handleColunaEditadaSalva(dados: {
    nome: string
    tipo: TipoColunaSmartDocSimulador
    descricao?: string
    visibilidade: VisibilidadeColunaSmartDocSimulador
    obrigatorio: boolean
  }) {
    if (!editandoColuna) return
    setPendingColunas((prev) =>
      prev.map((c) =>
        c.id === editandoColuna.id
          ? {
              ...c,
              nome: dados.nome,
              visibilidade: dados.visibilidade,
              obrigatorio: dados.obrigatorio,
              ...(dados.visibilidade === 'privado'
                ? { id_usuario_criador: c.id_usuario_criador ?? 'simulador-demo' }
                : { id_usuario_criador: undefined }),
              ...(dados.visibilidade === 'roles'
                ? { roles_permitidas: c.roles_permitidas ?? ['PADRAO'] }
                : { roles_permitidas: undefined }),
              ...(dados.descricao ? { descricao: dados.descricao } : { descricao: undefined }),
            }
          : c,
      ),
    )
    setEditandoColuna(null)
  }

  function salvarColunas() {
    setColunasSalvas([...pendingColunas])
    notificarSalvo('Colunas personalizadas salvas.')
  }

  function cancelarOrdemColunas() {
    setPendingColunas([...colunasSalvas])
  }

  const periodoLabel = PERIODOS.find((p) => p.id === periodo)?.label ?? periodo

  const cardsDisponiveis = useMemo(
    () => CARDS_CATALOGO.filter((def) => !cards.some((c) => c.id === def.id)),
    [cards],
  )

  return (
    <div className="sds-cfg-simulador-wrap" data-sds-tutorial-alvo="shell-conteudo">
      <div className="cfg-page ws-fade-up">
        <aside className="cfg-sidebar" data-sds-tutorial-alvo="sdoc-config-sidebar">
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
                  <span className="cfg-sidebar__item-icon">
                    <Icone weight="duotone" size={16} />
                  </span>
                  <span className="cfg-sidebar__item-label">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="cfg-conteudo">
          {categoria === 'card' && (
            <div className="cfg-cards-wrapper" data-sds-tutorial-alvo="sdoc-config-cards">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Meus Cards</h2>
                    <p className="cfg-secao__desc">
                      Cards exibidos no topo das leituras · arraste para reordenar · olho para ocultar.
                    </p>
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
                          onDragEnter={() => {
                            if (arrastandoCard) setCards((prev) => reordenar(prev, arrastandoCard, pref.id))
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setArrastandoCard(null)}
                        >
                          <span className="cfg-drag-handle">
                            <DotsSixVertical size={16} weight="bold" />
                          </span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: def.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{def.nome}</p>
                              <p className="cfg-card-row__desc">
                                {def.agg} · {def.origem} · {periodoLabel}
                              </p>
                            </div>
                          </div>
                          <span className={`cfg-origem-badge cfg-origem-badge--${def.origem.toLowerCase()}`}>
                            {def.origem}
                          </span>
                          <button
                            type="button"
                            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
                            onClick={() =>
                              setCards((prev) =>
                                prev.map((c) => (c.id === pref.id ? { ...c, visible: !c.visible } : c)),
                              )
                            }
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

                <ConfiguracaoSecaoGlobal label="Disponíveis" hint="Clique em + para adicionar" style={{ marginTop: '1.5rem' }} />
                {cardsDisponiveis.length === 0 ? (
                  <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                    Todos os cards já foram adicionados.
                  </p>
                ) : (
                  <div className="cfg-cards-lista">
                    {cardsDisponiveis.map((def) => {
                      const Icone = def.icone
                      return (
                        <div key={def.id} className="cfg-card-row cfg-card-row--disponivel">
                          <span className="cfg-drag-handle cfg-drag-handle--ghost">
                            <DotsSixVertical size={16} weight="bold" />
                          </span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: def.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{def.nome}</p>
                              <p className="cfg-card-row__desc">
                                {def.agg} · {def.origem}
                              </p>
                            </div>
                          </div>
                          <span className={`cfg-origem-badge cfg-origem-badge--${def.origem.toLowerCase()}`}>
                            {def.origem}
                          </span>
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

                <div className="cfg-secao__footer">
                  <BotaoCancelar dirty={cardsDirty} rotulo="Restaurar padrão" onClick={restaurarCardsPadrao} />
                  <BotaoSalvar dirty={cardsDirty} rotulo="Salvar" onClick={salvarCardsConfig} />
                </div>
              </section>
            </div>
          )}

          {categoria === 'tabelas' && (
            <div className="cfg-cards-wrapper" data-sds-tutorial-alvo="sdoc-config-tabelas">
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
                        className={`cfg-periodo-pill${tabelaConfig.linhasPagina === n ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setTabelaConfig((prev) => ({ ...prev, linhasPagina: n }))}
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
                        className={`cfg-periodo-pill${tabelaConfig.densidade === d.id ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setTabelaConfig((prev) => ({ ...prev, densidade: d.id }))}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cfg-secao__footer">
                  <BotaoCancelar dirty={tabelaDirty} rotulo="Restaurar padrão" onClick={restaurarTabelaConfig} />
                  <BotaoSalvar dirty={tabelaDirty} rotulo="Salvar" onClick={salvarTabelaConfig} />
                </div>
              </section>
            </div>
          )}

          {categoria === 'colunas' && (
            <div className="cfg-cards-wrapper" data-sds-tutorial-alvo="sdoc-config-colunas">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                    <p className="cfg-secao__desc">Crie colunas extras para a tabela de leituras.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ConfiguracaoSecaoGlobal
                    label="Ativas"
                    count={pendingColunas.length}
                    hint="Arraste para reordenar · lápis para editar · olho para ocultar"
                  />
                  <BotaoGlobal variante="primario" onClick={() => setCriandoColuna(true)}>
                    <Plus size={16} weight="bold" />
                    Criar Coluna
                  </BotaoGlobal>
                </div>

                {criandoColuna && (
                  <ModalNovaColunaConfigSimuladorSmartDoc
                    onFechar={() => setCriandoColuna(false)}
                    onSalvo={handleColunaCriadaViaModal}
                  />
                )}

                {pendingColunas.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1.5rem',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: '1px dashed rgba(255,255,255,0.08)',
                    }}
                  >
                    <Columns size={28} weight="duotone" style={{ color: 'var(--ws-muted, #64748b)' }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                      Nenhuma coluna criada ainda
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                      Use o botão &quot;Criar Coluna&quot; para criar a primeira.
                    </p>
                  </div>
                ) : (
                  <div className="cfg-kanban-campo-lista">
                    {pendingColunas.map((col) => (
                      <div
                        key={col.id}
                        className={`cfg-kanban-campo-row${!col.visible ? ' cfg-kanban-campo-row--oculto' : ''}${arrastandoColuna === col.id ? ' cfg-kanban-campo-row--arrastando' : ''}`}
                        draggable
                        onDragStart={() => setArrastandoColuna(col.id)}
                        onDragEnter={() => {
                          if (arrastandoColuna) setPendingColunas((prev) => reordenar(prev, arrastandoColuna, col.id))
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={() => setArrastandoColuna(null)}
                      >
                        <span className="cfg-drag-handle">
                          <DotsSixVertical size={15} weight="bold" />
                        </span>
                        <div className="cfg-kanban-campo-row__info">
                          <span className="cfg-kanban-campo-row__nome">{col.nome}</span>
                          <span className="cfg-kanban-campo-row__tipo">{rotuloTipoColunaSmartDocSimulador(col.tipo)}</span>
                        </div>
                        <button
                          type="button"
                          className="cfg-kanban-campo-btn"
                          onClick={() => setEditandoColuna(col)}
                          aria-label={`Editar coluna ${col.nome}`}
                        >
                          <PencilSimple size={14} weight="duotone" />
                        </button>
                        <button
                          type="button"
                          className="cfg-kanban-campo-btn"
                          onClick={() =>
                            setPendingColunas((prev) =>
                              prev.map((c) => (c.id === col.id ? { ...c, visible: !c.visible } : c)),
                            )
                          }
                          aria-label={col.visible ? `Ocultar coluna ${col.nome}` : `Exibir coluna ${col.nome}`}
                        >
                          {col.visible ? <Eye size={14} weight="duotone" /> : <EyeSlash size={14} weight="duotone" />}
                        </button>
                        <button
                          type="button"
                          className="cfg-kanban-campo-btn cfg-kanban-campo-btn--remove"
                          onClick={() => setPendingColunas((prev) => prev.filter((c) => c.id !== col.id))}
                          aria-label={`Excluir coluna ${col.nome}`}
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="cfg-secao__footer" style={{ marginTop: pendingColunas.length > 0 ? '0.75rem' : undefined }}>
                  <BotaoCancelar dirty={colunasDirty} rotulo="Descartar" onClick={cancelarOrdemColunas} />
                  <BotaoSalvar dirty={colunasDirty} rotulo="Salvar" onClick={salvarColunas} />
                </div>
              </section>

              {editandoColuna && (
                <ModalNovaColunaConfigSimuladorSmartDoc
                  colunaEdicao={editandoColuna}
                  onFechar={() => setEditandoColuna(null)}
                  onSalvo={handleColunaEditadaSalva}
                />
              )}
            </div>
          )}
        </main>
      </div>
      {toastSalvo && (
        <div className="sds-cfg-toast-salvo" role="status">
          {toastSalvo}
        </div>
      )}
    </div>
  )
}
