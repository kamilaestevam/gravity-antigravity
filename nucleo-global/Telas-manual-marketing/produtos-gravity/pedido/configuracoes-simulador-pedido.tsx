/**
 * ConfiguracoesSimuladorPedido — paridade com Configuracoes.tsx do produto real.
 * Estado central em estado-config-simulador-pedido.tsx; estilos em configuracoes-simulador-pedido.css.
 */

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import {
  Columns,
  DotsSixVertical,
  Eye,
  EyeSlash,
  FloppyDisk,
  Hash,
  Minus,
  PencilSimple,
  Plus,
  SquaresFour,
  Table,
  Tag,
  Trash,
  X,
} from '@phosphor-icons/react'
import {
  CARDS_CATALOGO_SIMULADOR,
  CAMPOS_CASAS_DECIMAIS,
  FORMATOS_DATA_OPCOES,
  KANBAN_CARD_CAMPOS_DISPONIVEIS,
  KANBAN_MODAL_CAMPOS_DISPONIVEIS,
  TIPOS_COLUNA_PERSONALIZADA,
  type CategoriaConfigSimuladorPedido,
  type TipoColunaPersonalizadaSimulador,
} from './catalogo-config-simulador-pedido'
import {
  useConfigSimuladorPedido,
  type EstadoConfigSimuladorPedido,
} from './estado-config-simulador-pedido'
import type { EstadoTutorialConfigPedido } from './dados-tutorial-opcional-simulador-pedido'
import { ModalNovaColunaConfigSimuladorPedido } from './modal-nova-coluna-config-simulador-pedido'
import './configuracoes-simulador-pedido.css'

const PERIODOS: Array<{ id: EstadoConfigSimuladorPedido['cardsPeriodo']; label: string }> = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '6m', label: '6 meses' },
  { id: '1a', label: '1 ano' },
  { id: 'tudo', label: 'Tudo' },
]

const LINHAS_POR_PAGINA = [25, 50, 100, 200] as const

const COLUNAS_SUB_ITENS: Array<{ id: CategoriaConfigSimuladorPedido; label: string }> = [
  { id: 'colunas-casas-decimais', label: 'Casas Decimais' },
  { id: 'colunas-formato-data', label: 'Formato de Data' },
  { id: 'colunas-personalizadas', label: 'Personalizadas' },
  { id: 'colunas-campos-calculados', label: 'Campos Calculados' },
]

const KANBAN_SUB_ITENS: Array<{ id: CategoriaConfigSimuladorPedido; label: string }> = [
  { id: 'kanban-colunas', label: 'Colunas' },
  { id: 'kanban-card', label: 'Card' },
  { id: 'kanban-modal', label: 'Modal' },
]

type SidebarItem =
  | { tipo: 'grupo'; label: string }
  | { tipo: 'item'; id: CategoriaConfigSimuladorPedido; label: string; icone: ReactElement }
  | { tipo: 'parent'; id: string; label: string; icone: ReactElement; filhos: CategoriaConfigSimuladorPedido[] }

const SIDEBAR_ITEMS: SidebarItem[] = [
  { tipo: 'grupo', label: 'VISUALIZAÇÕES' },
  { tipo: 'item', id: 'cards', label: 'Cards', icone: <SquaresFour size={15} weight="duotone" /> },
  { tipo: 'item', id: 'tabela', label: 'Tabela', icone: <Table size={15} weight="duotone" /> },
  {
    tipo: 'parent',
    id: 'colunas',
    label: 'Colunas',
    icone: <Columns size={15} weight="duotone" />,
    filhos: COLUNAS_SUB_ITENS.map((s) => s.id),
  },
  {
    tipo: 'parent',
    id: 'kanban',
    label: 'Kanban',
    icone: <Columns size={15} weight="duotone" />,
    filhos: KANBAN_SUB_ITENS.map((s) => s.id),
  },
  { tipo: 'grupo', label: 'PEDIDO' },
  { tipo: 'item', id: 'status', label: 'Status', icone: <Tag size={15} weight="duotone" /> },
  { tipo: 'item', id: 'numeracao', label: 'Numeração', icone: <Hash size={15} weight="duotone" /> },
  { tipo: 'item', id: 'templates-pdf', label: 'Templates PDF', icone: <FloppyDisk size={15} weight="duotone" /> },
]

const ALVO_CATEGORIA: Partial<Record<CategoriaConfigSimuladorPedido, string>> = {
  cards: 'pedido-config-cards',
  tabela: 'pedido-config-tabela',
  'colunas-casas-decimais': 'pedido-config-colunas-decimais',
  'colunas-formato-data': 'pedido-config-colunas-data',
  'colunas-personalizadas': 'pedido-config-colunas-personalizadas',
  'colunas-campos-calculados': 'pedido-config-colunas-calculados',
  'kanban-colunas': 'pedido-kanban-config-colunas',
  'kanban-card': 'pedido-kanban-config-campos-card',
  'kanban-modal': 'pedido-config-kanban-modal',
  status: 'pedido-config-status',
  numeracao: 'pedido-config-numeracao',
  'templates-pdf': 'pedido-config-templates-pdf',
}

function labelTipoColuna(tipo: string): string {
  return TIPOS_COLUNA_PERSONALIZADA.find((t) => t.id === tipo)?.label ?? tipo
}

function previewNumeracao(estado: EstadoConfigSimuladorPedido): string {
  const { prefixo, incluirAno, digitosSequencia } = estado.numeracao
  const seq = '0'.repeat(Math.max(1, digitosSequencia - 1)) + '1'
  return incluirAno ? `${prefixo}2026/${seq}` : `${prefixo}${seq}`
}

function formatarDataPreview(fmt: string): string {
  const hoje = new Date(2026, 6, 15)
  const d = String(hoje.getDate()).padStart(2, '0')
  const m = String(hoje.getMonth() + 1).padStart(2, '0')
  const y = String(hoje.getFullYear())
  const yy = y.slice(-2)
  switch (fmt) {
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`
    case 'YYYY-MM-DD':
      return `${y}-${m}-${d}`
    case 'DD.MM.YYYY':
      return `${d}.${m}.${y}`
    case 'DD/MM/YY':
      return `${d}/${m}/${yy}`
    default:
      return `${d}/${m}/${y}`
  }
}

export function ConfiguracoesSimuladorPedido({
  onEstadoTutorialChange,
  onIrParaColunaLista,
}: {
  onEstadoTutorialChange?: (estado: EstadoTutorialConfigPedido) => void
  onIrParaColunaLista?: (colunaId: string) => void
}) {
  const ctx = useConfigSimuladorPedido()
  const {
    rascunho,
    setCategoriaAtiva,
    isDirtyCategoria,
    salvarCategoria,
    salvandoCategoria,
  } = ctx
  const [toastSalvo, setToastSalvo] = useState<string | null>(null)
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({ colunas: true, kanban: true })
  const [modalNovaColuna, setModalNovaColuna] = useState(false)
  const [modalNovoStatus, setModalNovoStatus] = useState(false)
  const [modalNovoTemplate, setModalNovoTemplate] = useState(false)
  const [nomeNovoStatus, setNomeNovoStatus] = useState('')
  const [corNovoStatus, setCorNovoStatus] = useState('#818cf8')
  const [nomeNovoTemplate, setNomeNovoTemplate] = useState('')
  const [abaModalKanban, setAbaModalKanban] = useState<'pedido' | 'quantidades' | 'datas'>('pedido')

  const emitirEstadoTutorial = useCallback(() => {
    onEstadoTutorialChange?.({
      categoriaAtiva: rascunho.categoriaAtiva,
      modalNovaColunaAberto: modalNovaColuna,
      modalNovoStatusAberto: modalNovoStatus,
      modalNovoTemplateAberto: modalNovoTemplate,
      abaModalKanbanConfig: abaModalKanban,
    })
  }, [
    onEstadoTutorialChange,
    rascunho.categoriaAtiva,
    modalNovaColuna,
    modalNovoStatus,
    modalNovoTemplate,
    abaModalKanban,
  ])

  useEffect(() => {
    emitirEstadoTutorial()
  }, [emitirEstadoTutorial])

  const statusVisiveisKanbanUi = useMemo(
    () =>
      [...rascunho.status]
        .sort((a, b) => a.ordem - b.ordem)
        .filter((s) => !rascunho.kanbanColunasOcultas.includes(s.nome)),
    [rascunho.status, rascunho.kanbanColunasOcultas],
  )

  const cardsAtivosVisiveis = useMemo(
    () =>
      [...rascunho.cardsAtivos]
        .filter((c) => c.visivel)
        .sort((a, b) => a.ordem - b.ordem),
    [rascunho.cardsAtivos],
  )

  const cardsDisponiveis = useMemo(
    () => CARDS_CATALOGO_SIMULADOR.filter((c) => !rascunho.cardsAtivos.some((a) => a.id === c.id)),
    [rascunho.cardsAtivos],
  )

  const camposCardAtivos = rascunho.kanbanPrefs.card.campos.filter((c) => c.visivel)
  const camposCardDisponiveis = KANBAN_CARD_CAMPOS_DISPONIVEIS.filter(
    (c) => !rascunho.kanbanPrefs.card.campos.some((a) => a.campo === c.campo),
  )

  const abaModalAtual = rascunho.kanbanPrefs.abas.find((a) => a.aba === abaModalKanban)
  const camposModalAtivos = abaModalAtual?.campos.filter((c) => c.visivel) ?? []
  const camposModalDisponiveis = KANBAN_MODAL_CAMPOS_DISPONIVEIS.filter(
    (c) => c.aba === abaModalKanban && !abaModalAtual?.campos.some((a) => a.campo === c.campo),
  )

  const statusOrdenados = [...rascunho.status].sort((a, b) => a.ordem - b.ordem)
  const kanbanOcultos = statusOrdenados.filter((s) => rascunho.kanbanColunasOcultas.includes(s.nome))

  function toggleExpandido(id: string) {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function salvarNovaColuna(nome: string, tipo: TipoColunaPersonalizadaSimulador) {
    const colunaIdLista = ctx.adicionarColunaPersonalizada(nome, tipo)
    setModalNovaColuna(false)
    onIrParaColunaLista?.(colunaIdLista)
  }

  function salvarNovoStatus() {
    if (!nomeNovoStatus.trim()) return
    ctx.adicionarStatus(nomeNovoStatus.trim(), corNovoStatus)
    setNomeNovoStatus('')
    setModalNovoStatus(false)
  }

  function salvarNovoTemplate() {
    if (!nomeNovoTemplate.trim()) return
    ctx.adicionarTemplatePdf(nomeNovoTemplate.trim())
    setNomeNovoTemplate('')
    setModalNovoTemplate(false)
  }

  function renderSidebar() {
    return (
      <aside className="cfg-sidebar" data-sds-tutorial-alvo="pedido-config-sidebar">
        <nav className="cfg-sidebar__nav">
          {SIDEBAR_ITEMS.map((item, idx) => {
            if (item.tipo === 'grupo') {
              return (
                <span key={`grupo-${idx}`} className="cfg-sidebar__titulo cfg-sidebar__titulo--grupo">
                  {item.label}
                </span>
              )
            }
            if (item.tipo === 'parent') {
              const isExpanded = expandidos[item.id] ?? false
              const filhoAtivo = item.filhos.includes(rascunho.categoriaAtiva)
              return (
                <div key={`parent-${item.id}`} className="cfg-sidebar__group">
                  <button
                    type="button"
                    className={['cfg-sidebar__item', filhoAtivo ? 'cfg-sidebar__item--ativo' : ''].filter(Boolean).join(' ')}
                    onClick={() => toggleExpandido(item.id)}
                  >
                    <span className="cfg-sidebar__item-icon">{item.icone}</span>
                    <span className="cfg-sidebar__item-label">{item.label}</span>
                    <span className={`cfg-sidebar__chevron${isExpanded ? ' cfg-sidebar__chevron--open' : ''}`}>▾</span>
                  </button>
                  <div className={`cfg-sidebar__submenu${isExpanded ? ' cfg-sidebar__submenu--open' : ''}`}>
                    {(item.id === 'colunas' ? COLUNAS_SUB_ITENS : KANBAN_SUB_ITENS).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        className={[
                          'cfg-sidebar__subitem',
                          rascunho.categoriaAtiva === sub.id ? 'cfg-sidebar__subitem--ativo' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => setCategoriaAtiva(sub.id)}
                      >
                        <span className="cfg-sidebar__item-label">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            }
            const isAtivo = rascunho.categoriaAtiva === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={['cfg-sidebar__item', isAtivo ? 'cfg-sidebar__item--ativo' : ''].filter(Boolean).join(' ')}
                onClick={() => setCategoriaAtiva(item.id)}
              >
                <span className="cfg-sidebar__item-icon">{item.icone}</span>
                <span className="cfg-sidebar__item-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    )
  }

  function renderRodapeSalvar(categoria: CategoriaConfigSimuladorPedido) {
    const dirty = isDirtyCategoria(categoria)
    const salvando = salvandoCategoria === categoria

    async function handleSalvar() {
      if (!dirty || salvando) return
      await salvarCategoria(categoria)
      setToastSalvo('Preferências salvas — já refletem na Lista, Dashboard e Kanban.')
      window.setTimeout(() => setToastSalvo(null), 3200)
    }

    return (
      <div className="cfg-rodape-acoes">
        <button
          type="button"
          className="cfg-btn-texto"
          onClick={() => ctx.restaurarPadrao(categoria)}
        >
          <X size={14} />
          Restaurar padrão
        </button>
        <button
          type="button"
          className={`cfg-btn-salvar${!dirty ? ' cfg-btn-salvar--inativo' : ''}`}
          data-sds-tutorial-alvo="pedido-config-salvar"
          disabled={!dirty || salvando}
          onClick={() => void handleSalvar()}
        >
          <FloppyDisk size={16} weight="duotone" />
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    )
  }

  function renderConteudo() {
    const alvo = ALVO_CATEGORIA[rascunho.categoriaAtiva]
    const wrap = (children: React.ReactNode) => (
      <div data-sds-tutorial-alvo={alvo}>{children}</div>
    )

    switch (rascunho.categoriaAtiva) {
      case 'cards':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Meus Cards</h2>
                <p className="cfg-secao__desc">Escolha quais indicadores aparecem no topo da Lista e Insights.</p>
              </div>
              <button type="button" className="cfg-add-row-btn" data-sds-tutorial-alvo="pedido-config-cards-adicionar">
                <Plus size={13} weight="bold" />
                Adicionar card KPI
              </button>
            </div>
            <p className="cfg-secao-label">Período de comparação</p>
            <div className="cfg-periodo-pills">
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`cfg-periodo-pill${rascunho.cardsPeriodo === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                  onClick={() => ctx.setCardsPeriodo(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {cardsAtivosVisiveis.length > 0 && (
              <div className="cfg-cards-preview-wrap" data-sds-tutorial-alvo="pedido-config-cards-preview">
                <p className="cfg-cards-preview-label">
                  <SquaresFour size={12} weight="fill" />
                  PREVIEW — COMO FICARÁ NA TELA
                </p>
                <div className="cfg-cards-preview-grid">
                  {cardsAtivosVisiveis.map((pref, i) => {
                    const def = CARDS_CATALOGO_SIMULADOR.find((c) => c.id === pref.id)
                    return (
                      <div key={pref.id} className="cfg-card-preview" style={{ borderColor: def?.cor }}>
                        <span className="cfg-card-preview__nome">{def?.nome ?? pref.id}</span>
                        <span className="cfg-card-preview__valor">{i + 1}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <p className="cfg-secao-label">Ativos</p>
            <div className="cfg-lista-ativos">
              {rascunho.cardsAtivos.map((pref) => {
                const def = CARDS_CATALOGO_SIMULADOR.find((c) => c.id === pref.id)
                if (!def) return null
                return (
                  <div key={pref.id} className="cfg-lista-ativos__row">
                    <span className="cfg-drag-handle">⠿</span>
                    <span className="cfg-lista-ativos__nome">{def.nome}</span>
                    <span className="cfg-lista-ativos__meta">{def.tipoAgg} · {def.origem} · 30 dias</span>
                    <button type="button" className="cfg-icon-btn" aria-label="Visibilidade" onClick={() => ctx.toggleCardAtivo(pref.id)}>
                      {pref.visivel ? <Eye size={16} /> : <EyeSlash size={16} />}
                    </button>
                    <button type="button" className="cfg-icon-btn" aria-label="Remover" onClick={() => ctx.removerCard(pref.id)}>
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="cfg-secao-label">Disponíveis para adicionar</p>
            <div className="cfg-tabela-catalogo">
              <div className="cfg-tabela-head">
                <span className="cfg-tabela-head__col cfg-tabela-head__col--nome">Coluna</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--origem">Origem</span>
                <span className="cfg-tabela-head__col cfg-tabela-head__col--agg">Agregação</span>
              </div>
              {cardsDisponiveis.map((card) => (
                <div key={card.id} className="cfg-tabela-row">
                  <div className="cfg-tabela-row__nome">
                    <strong>{card.nome}</strong>
                    <span>{card.descricao}</span>
                  </div>
                  <span>{card.origem}</span>
                  <span>{card.tipoAgg}</span>
                  <button type="button" className="cfg-btn-add-mini" onClick={() => ctx.adicionarCard(card.id)}>
                    <Plus size={14} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
            {renderRodapeSalvar('cards')}
          </section>,
        )

      case 'tabela':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Tabela</h2>
                <p className="cfg-secao__desc">Preferências de exibição da lista de pedidos.</p>
              </div>
            </div>
            <p className="cfg-secao-label">Linhas por página padrão</p>
            <div className="cfg-periodo-pills" data-sds-tutorial-alvo="pedido-config-tabela-linhas">
              {LINHAS_POR_PAGINA.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`cfg-periodo-pill${rascunho.tabela.linhasPorPagina === n ? ' cfg-periodo-pill--ativo' : ''}`}
                  onClick={() => ctx.setTabela({ linhasPorPagina: n })}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="cfg-secao-label">Preferências de exibição</p>
            <div className="cfg-toggle-row" data-sds-tutorial-alvo="pedido-config-tabela-atrasados">
              <span>Destacar pedidos atrasados em vermelho</span>
              <button
                type="button"
                className={`cfg-toggle${rascunho.tabela.destacarAtrasados ? ' cfg-toggle--on' : ''}`}
                onClick={() => ctx.setTabela({ destacarAtrasados: !rascunho.tabela.destacarAtrasados })}
                aria-pressed={rascunho.tabela.destacarAtrasados}
              />
            </div>
            {renderRodapeSalvar('tabela')}
          </section>,
        )

      case 'colunas-casas-decimais':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Casas Decimais por Coluna</h2>
                <p className="cfg-secao__desc">Define quantas casas decimais são exibidas em colunas numéricas. Padrão: 2</p>
              </div>
            </div>
            {(['PEDIDO', 'PERSONALIZADAS'] as const).map((grupo) => (
              <div key={grupo}>
                <p className="cfg-secao-label">{grupo}</p>
                {CAMPOS_CASAS_DECIMAIS.filter((c) => c.grupo === grupo).map((campo) => (
                  <div key={campo.chave} className="cfg-decimal-row">
                    <span>{campo.label}</span>
                    <div className="cfg-stepper">
                      <button type="button" onClick={() => ctx.setCasaDecimal(campo.chave, (rascunho.casasDecimais[campo.chave] ?? 2) - 1)}>
                        <Minus size={12} />
                      </button>
                      <span>{rascunho.casasDecimais[campo.chave] ?? 2}</span>
                      <button type="button" onClick={() => ctx.setCasaDecimal(campo.chave, (rascunho.casasDecimais[campo.chave] ?? 2) + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {renderRodapeSalvar('colunas-casas-decimais')}
          </section>,
        )

      case 'colunas-formato-data':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Formato de Data</h2>
                <p className="cfg-secao__desc">
                  Define como as datas são exibidas em todas as colunas de tabela, nos inputs de edição e nas exportações.
                </p>
              </div>
            </div>
            <div className="cfg-formato-grid" data-sds-tutorial-alvo="pedido-config-formato-data-opcoes">
              {FORMATOS_DATA_OPCOES.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  className={`cfg-formato-card${rascunho.formatoData === fmt.id ? ' cfg-formato-card--ativo' : ''}`}
                  onClick={() => ctx.setFormatoData(fmt.id)}
                >
                  <strong>{fmt.label}</strong>
                  <span>ex: {fmt.exemplo}</span>
                  <small>{fmt.regiao}</small>
                </button>
              ))}
            </div>
            <p className="cfg-preview-data">
              Preview com data de hoje: <strong>{formatarDataPreview(rascunho.formatoData)}</strong>
            </p>
            {renderRodapeSalvar('colunas-formato-data')}
          </section>,
        )

      case 'colunas-personalizadas':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                <p className="cfg-secao__desc">
                  Adicione campos extras à tabela de pedidos. Tipos: texto, número, data, checkbox, fórmula e mais.
                </p>
              </div>
            </div>
            <div className="pds-cfg-secao-toolbar">
              <p className="cfg-secao-label pds-cfg-secao-toolbar__label">
                Ativas
                <span className="pds-cfg-secao-toolbar__count">{rascunho.colunasPersonalizadas.length}</span>
              </p>
              <button
                type="button"
                className="cfg-add-row-btn cfg-add-row-btn--primary"
                data-sds-tutorial-alvo="pedido-kanban-config-nova-coluna"
                onClick={() => setModalNovaColuna(true)}
              >
                <Plus size={13} weight="bold" />
                Criar Coluna
              </button>
            </div>
            <div
              className="cfg-kanban-campos-lista"
              data-sds-tutorial-alvo="pedido-config-colunas-lista"
            >
              {rascunho.colunasPersonalizadas.map((col) => (
                <div
                  key={col.id}
                  className={`cfg-kanban-campo-row${!col.visivel ? ' cfg-kanban-campo-row--oculto' : ''}`}
                >
                  <button type="button" className="cfg-drag-handle" aria-label="Arrastar coluna">
                    <DotsSixVertical size={15} weight="bold" />
                  </button>
                  <div className="cfg-kanban-campo-row__info">
                    <span className="cfg-kanban-campo-row__nome">{col.nome}</span>
                    <span className="cfg-kanban-campo-row__tipo">{labelTipoColuna(col.tipo)}</span>
                  </div>
                  <button
                    type="button"
                    className="cfg-kanban-campo-btn"
                    aria-label={`Editar coluna ${col.nome}`}
                    data-sds-tutorial-alvo="pedido-kanban-config-editar-coluna"
                  >
                    <PencilSimple size={14} weight="duotone" />
                  </button>
                  <button
                    type="button"
                    className="cfg-kanban-campo-btn"
                    aria-label={col.visivel ? 'Ocultar coluna' : 'Exibir coluna'}
                    onClick={() => ctx.toggleVisibilidadeColunaPersonalizada(col.id)}
                  >
                    {col.visivel ? <Eye size={14} weight="duotone" /> : <EyeSlash size={14} weight="duotone" />}
                  </button>
                  <button
                    type="button"
                    className="cfg-kanban-campo-btn cfg-kanban-campo-btn--remove"
                    aria-label={`Excluir coluna ${col.nome}`}
                    onClick={() => ctx.removerColunaPersonalizada(col.id)}
                  >
                    <Trash size={14} weight="duotone" />
                  </button>
                </div>
              ))}
            </div>
            {renderRodapeSalvar('colunas-personalizadas')}
          </section>,
        )

      case 'colunas-campos-calculados':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Campos Calculados</h2>
                <p className="cfg-secao__desc">Campos cujo valor é gerado por fórmula. A fórmula pode ser ajustada por workspace.</p>
              </div>
            </div>
            <div className="cfg-formula-box" data-sds-tutorial-alvo="pedido-config-saldo-formula">
              <div className="cfg-formula-header">
                <span>Saldo do Pedido</span>
                <span className="cfg-badge-sistema">CAMPO NATIVO</span>
              </div>
              <div className="cfg-formula-expressao">{rascunho.saldoFormula}</div>
              <div className="cfg-formula-campos">
                {['Quantidade Inicial', 'Quantidade Transferida', 'Quantidade Cancelada', 'Quantidade Pronta'].map((c) => (
                  <button key={c} type="button" className="cfg-formula-pill">{c}</button>
                ))}
                <button type="button" className="cfg-formula-pill cfg-formula-pill--add">+ colunas personalizadas</button>
              </div>
              <p className="cfg-formula-valida">GABI — FÓRMULA VÁLIDA ✓</p>
            </div>
            {renderRodapeSalvar('colunas-campos-calculados')}
          </section>,
        )

      case 'kanban-colunas':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Colunas do Kanban</h2>
                <p className="cfg-secao__desc">Escolha quais status aparecem como colunas no board.</p>
              </div>
            </div>
            <div className="cfg-cards-preview-wrap">
              <p className="cfg-cards-preview-label">
                <SquaresFour size={12} weight="fill" />
                PREVIEW — COLUNAS VISÍVEIS NO KANBAN
              </p>
              <div className="cfg-kanban-colunas-preview" data-sds-tutorial-alvo="pedido-config-kanban-preview">
                {statusVisiveisKanbanUi.map((s) => (
                  <span key={s.id} className="cfg-kanban-pill" style={{ borderColor: s.cor, color: s.cor }}>
                    {s.rotulo}
                  </span>
                ))}
              </div>
            </div>
            <p className="cfg-secao-label">Ativos</p>
            <div className="cfg-lista-ativos" data-sds-tutorial-alvo="pedido-kanban-config-ordem-colunas">
              {statusVisiveisKanbanUi.map((s) => (
                <div key={s.id} className="cfg-lista-ativos__row">
                  <span className="cfg-drag-handle">⠿</span>
                  <span className="cfg-status-dot" style={{ background: s.cor }} />
                  <span className="cfg-lista-ativos__nome">{s.rotulo}</span>
                  {s.is_sistema && <span className="cfg-badge-sistema">SISTEMA</span>}
                  <button type="button" className="cfg-icon-btn" onClick={() => ctx.toggleKanbanColuna(s.nome)}>
                    <EyeSlash size={16} />
                  </button>
                  {!s.is_sistema && (
                    <button type="button" className="cfg-icon-btn" onClick={() => ctx.removerStatus(s.id)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="cfg-secao-label">Disponível para adicionar</p>
            {kanbanOcultos.length === 0 ? (
              <p className="cfg-hint">Todas as colunas estão visíveis</p>
            ) : (
              kanbanOcultos.map((s) => (
                <div key={s.id} className="cfg-lista-ativos__row">
                  <span className="cfg-status-dot" style={{ background: s.cor }} />
                  <span>{s.rotulo}</span>
                  <button type="button" className="cfg-btn-add-mini" onClick={() => ctx.toggleKanbanColuna(s.nome)}>
                    <Plus size={14} />
                  </button>
                </div>
              ))
            )}
            <p className="cfg-hint cfg-hint--footer">
              Para criar novos status, acesse a seção <strong>Status</strong> no menu lateral.
            </p>
            {renderRodapeSalvar('kanban-colunas')}
          </section>,
        )

      case 'kanban-card':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Conteúdo do card</h2>
                <p className="cfg-secao__desc">Escolha quais campos aparecem em cada card do Kanban.</p>
              </div>
            </div>
            <div className="cfg-kanban-card-preview" data-sds-tutorial-alvo="pedido-config-kanban-card-preview">
              <div className="cfg-kanban-card-mock">
                <div className="cfg-kanban-card-mock__header">PO-EX-11970 · Novo</div>
                {camposCardAtivos.map((c) => (
                  <div key={c.campo} className="cfg-kanban-card-mock__field">{c.label}</div>
                ))}
                {rascunho.kanbanPrefs.card.dataCritica && (
                  <div className="cfg-kanban-card-mock__barra">SALDO (BARRA)</div>
                )}
              </div>
            </div>
            <p className="cfg-secao-label">Ativos</p>
            <div className="cfg-lista-ativos">
              {rascunho.kanbanPrefs.card.campos.map((c) => (
                <div key={c.campo} className="cfg-lista-ativos__row">
                  <span className="cfg-lista-ativos__nome">{c.label}</span>
                  <button type="button" className="cfg-icon-btn" onClick={() => ctx.toggleKanbanCardCampo(c.campo)}>
                    {c.visivel ? <Eye size={16} /> : <EyeSlash size={16} />}
                  </button>
                </div>
              ))}
            </div>
            <p className="cfg-secao-label">Disponíveis para adicionar</p>
            <div className="cfg-tabela-catalogo">
              {camposCardDisponiveis.map((c) => (
                <div key={c.campo} className="cfg-tabela-row">
                  <span>{c.label}</span>
                  <span>{c.grupo}</span>
                  <button type="button" className="cfg-btn-add-mini" onClick={() => ctx.adicionarKanbanCardCampo(c.campo, c.label)}>
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="cfg-secao-label">Data crítica</p>
            <select
              className="cfg-select"
              value={rascunho.kanbanPrefs.card.dataCritica ?? ''}
              onChange={(e) => ctx.setKanbanDataCritica(e.target.value || null)}
            >
              <option value="data_prevista_coleta_pedido">Prev. Coleta</option>
              <option value="data_prevista_pedido_pronto">Prev. Pronto</option>
            </select>
            {renderRodapeSalvar('kanban-card')}
          </section>,
        )

      case 'kanban-modal':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Campos do modal</h2>
                <p className="cfg-secao__desc">Configure os campos exibidos em cada aba do painel rápido.</p>
              </div>
            </div>
            <div className="cfg-modal-tabs" data-sds-tutorial-alvo="pedido-config-kanban-modal-abas">
              {(['pedido', 'quantidades', 'datas'] as const).map((aba) => {
                const abaCfg = rascunho.kanbanPrefs.abas.find((a) => a.aba === aba)
                const total = abaCfg?.campos.length ?? 0
                const visiveis = abaCfg?.campos.filter((c) => c.visivel).length ?? 0
                return (
                  <button
                    key={aba}
                    type="button"
                    className={`cfg-modal-tab${abaModalKanban === aba ? ' cfg-modal-tab--ativo' : ''}`}
                    onClick={() => setAbaModalKanban(aba)}
                  >
                    {aba.charAt(0).toUpperCase() + aba.slice(1)} {visiveis}/{total}
                  </button>
                )
              })}
            </div>
            <p className="cfg-secao-label">Ativos ({camposModalAtivos.length} campos)</p>
            <div className="cfg-lista-ativos">
              {abaModalAtual?.campos.map((c) => (
                <div key={c.campo} className="cfg-lista-ativos__row">
                  <span className="cfg-drag-handle">⠿</span>
                  <span>{c.label}</span>
                  <button type="button" className="cfg-icon-btn" onClick={() => ctx.toggleKanbanModalCampo(abaModalKanban, c.campo)}>
                    {c.visivel ? <Eye size={16} /> : <EyeSlash size={16} />}
                  </button>
                  <button type="button" className="cfg-icon-btn" onClick={() => ctx.toggleKanbanModalCampo(abaModalKanban, c.campo)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <p className="cfg-secao-label">Disponíveis para adicionar</p>
            {camposModalDisponiveis.map((c) => (
              <div key={c.campo} className="cfg-lista-ativos__row">
                <span>{c.label}</span>
                <button type="button" className="cfg-btn-add-mini" onClick={() => ctx.adicionarKanbanModalCampo(abaModalKanban, c.campo, c.label)}>
                  <Plus size={14} />
                </button>
              </div>
            ))}
            <p className="cfg-hint">Aba Lembrete (fixa) — comportamento nativo, não configurável.</p>
            {renderRodapeSalvar('kanban-modal')}
          </section>,
        )

      case 'status':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Status do Pedido</h2>
                <p className="cfg-secao__desc">Arraste para reordenar — status de sistema são fixos (sem editar ou excluir).</p>
              </div>
              <button
                type="button"
                className="cfg-add-row-btn cfg-add-row-btn--primary"
                data-sds-tutorial-alvo="pedido-config-novo-status"
                onClick={() => setModalNovoStatus(true)}
              >
                <Plus size={13} weight="bold" />
                Novo Status
              </button>
            </div>
            <div className="cfg-lista-ativos" data-sds-tutorial-alvo="pedido-config-status-lista">
              {statusOrdenados.map((s) => (
                <div key={s.id} className="cfg-lista-ativos__row">
                  <span className="cfg-drag-handle">⠿</span>
                  <span className="cfg-status-dot" style={{ background: s.cor }} />
                  <span className="cfg-lista-ativos__nome">{s.rotulo}</span>
                  {s.is_sistema ? (
                    <span className="cfg-badge-sistema">sistema</span>
                  ) : (
                    <>
                      <button type="button" className="cfg-icon-btn"><PencilSimple size={16} /></button>
                      <button type="button" className="cfg-icon-btn" onClick={() => ctx.removerStatus(s.id)}>
                        <Trash size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            {renderRodapeSalvar('status')}
          </section>,
        )

      case 'numeracao':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Numeração automática</h2>
                <p className="cfg-secao__desc">Define o formato e as regras do número de pedido gerado automaticamente.</p>
              </div>
            </div>
            <div className="cfg-numeracao-grid">
              <label className="cfg-field">
                <span>Prefixo</span>
                <input
                  type="text"
                  value={rascunho.numeracao.prefixo}
                  onChange={(e) => ctx.setNumeracao({ prefixo: e.target.value })}
                />
              </label>
              <div className="cfg-field">
                <span>Dígitos de sequência</span>
                <div className="cfg-periodo-pills">
                  {[3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`cfg-periodo-pill${rascunho.numeracao.digitosSequencia === n ? ' cfg-periodo-pill--ativo' : ''}`}
                      onClick={() => ctx.setNumeracao({ digitosSequencia: n })}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cfg-preview-num">{previewNumeracao(rascunho)}</div>
            </div>
            <div className="cfg-toggle-row">
              <span>Incluir ano no número</span>
              <button
                type="button"
                className={`cfg-toggle${rascunho.numeracao.incluirAno ? ' cfg-toggle--on' : ''}`}
                onClick={() => ctx.setNumeracao({ incluirAno: !rascunho.numeracao.incluirAno })}
              />
            </div>
            <p className="cfg-secao-label">Reiniciar numeração</p>
            <div className="cfg-periodo-pills">
              {(['nunca', 'ano', 'mes'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`cfg-periodo-pill${rascunho.numeracao.reiniciar === r ? ' cfg-periodo-pill--ativo' : ''}`}
                  onClick={() => ctx.setNumeracao({ reiniciar: r })}
                >
                  {r === 'nunca' ? 'Nunca' : r === 'ano' ? 'Todo ano' : 'Todo mês'}
                </button>
              ))}
            </div>
            {(['automaticoCriar', 'automaticoDuplicar', 'automaticoConsolidar'] as const).map((key) => (
              <div key={key} className="cfg-toggle-row">
                <span>
                  {key === 'automaticoCriar' && 'Número automático ao criar pedido'}
                  {key === 'automaticoDuplicar' && 'Número automático ao duplicar pedido'}
                  {key === 'automaticoConsolidar' && 'Número automático ao consolidar pedido'}
                </span>
                <button
                  type="button"
                  className={`cfg-toggle${rascunho.numeracao[key] ? ' cfg-toggle--on' : ''}`}
                  onClick={() => ctx.setNumeracao({ [key]: !rascunho.numeracao[key] })}
                />
              </div>
            ))}
            {renderRodapeSalvar('numeracao')}
          </section>,
        )

      case 'templates-pdf':
        return wrap(
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Templates PDF</h2>
                <p className="cfg-secao__desc">
                  Gerencie templates Handlebars. Variáveis: {'{{numero_pedido}}'} {'{{exportador}}'} {'{{itens}}'}
                </p>
              </div>
              <button
                type="button"
                className="cfg-add-row-btn cfg-add-row-btn--primary"
                data-sds-tutorial-alvo="pedido-config-novo-template"
                onClick={() => setModalNovoTemplate(true)}
              >
                <Plus size={13} weight="bold" />
                Novo template
              </button>
            </div>
            {rascunho.templatesPdf.length === 0 ? (
              <div className="cfg-empty-templates" data-sds-tutorial-alvo="pedido-config-templates-vazio">
                <p>Nenhum template cadastrado</p>
              </div>
            ) : (
              rascunho.templatesPdf.map((tpl) => (
                <div key={tpl.id} className="cfg-lista-ativos__row">
                  <span>{tpl.nome}</span>
                  <button type="button" className="cfg-icon-btn" onClick={() => ctx.removerTemplatePdf(tpl.id)}>
                    <Trash size={16} />
                  </button>
                </div>
              ))
            )}
            {renderRodapeSalvar('templates-pdf')}
          </section>,
        )

      default:
        return null
    }
  }

  return (
    <div className="cfg-page pds-cfg-page" data-sds-tutorial-alvo="pedido-shell-banner-config">
      {renderSidebar()}
      <main className="cfg-conteudo">{renderConteudo()}</main>

      <ModalNovaColunaConfigSimuladorPedido
        aberto={modalNovaColuna}
        onFechar={() => setModalNovaColuna(false)}
        onSalvar={salvarNovaColuna}
      />

      {modalNovoStatus && (
        <div className="pds-cfg-modal-overlay" role="dialog" aria-modal="true">
          <div className="pds-cfg-modal">
            <h3>Novo status</h3>
            <label className="cfg-field">
              <span>Nome</span>
              <input value={nomeNovoStatus} onChange={(e) => setNomeNovoStatus(e.target.value)} />
            </label>
            <label className="cfg-field">
              <span>Cor</span>
              <input type="color" value={corNovoStatus} onChange={(e) => setCorNovoStatus(e.target.value)} />
            </label>
            <div className="pds-cfg-modal__acoes">
              <button type="button" className="cfg-btn-texto" onClick={() => setModalNovoStatus(false)}>Cancelar</button>
              <button type="button" className="cfg-btn-salvar" onClick={salvarNovoStatus}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {modalNovoTemplate && (
        <div className="pds-cfg-modal-overlay" role="dialog" aria-modal="true">
          <div className="pds-cfg-modal">
            <h3>Novo template PDF</h3>
            <label className="cfg-field">
              <span>Nome</span>
              <input value={nomeNovoTemplate} onChange={(e) => setNomeNovoTemplate(e.target.value)} />
            </label>
            <div className="pds-cfg-modal__acoes">
              <button type="button" className="cfg-btn-texto" onClick={() => setModalNovoTemplate(false)}>Cancelar</button>
              <button type="button" className="cfg-btn-salvar" onClick={salvarNovoTemplate}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {toastSalvo && (
        <div className="pds-cfg-toast" role="status">
          {toastSalvo}
        </div>
      )}
    </div>
  )
}
