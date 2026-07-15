import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CaretDown,
  Check,
  DownloadSimple,
  Export,
  Flag,
  MagnifyingGlass,
  MapPin,
  SelectionAll,
  SidebarSimple,
  TrafficSign,
  UploadSimple,
  UserCircle,
  X,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { corOficialProdutoGravity } from '@nucleo/logo-produtos'
import type { Pedido } from '../types'
import {
  contarFiltrosMapaPedidoAtivos,
  FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO,
  filtrarItensListaMapaPedidoPorBusca,
  filtrosMapaInsightsPedidoIniciais,
  itemFiltroMapaPedidoSelecionado,
  listarExportadoresPedidoMapa,
  listarImportadoresPedidoMapa,
  listarPaisesDestinoPedidoMapa,
  listarPaisesOrigemPedidoMapa,
  listarStatusPedidoMapa,
  montarFlagsPorPaisMapaPedido,
  SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO,
  type FiltroOperacaoMapaInsightsPedido,
  type FiltrosMapaInsightsPedido,
  type ItemListaFiltroMapaPedido,
  type SecaoFiltroMapaInsightsPedidoId,
} from '../filtrar-dados-mapa-insights-pedido'
import {
  traduzirLabelFiltroOperacaoMapaPedido,
  traduzirResumoMapaFiltradoPedido,
  traduzirTituloSecaoFiltroMapaPedido,
  traduzirTooltipFiltroOperacaoMapaPedido,
} from '../traduzir-mapa-insights-pedido'
import type { FornecedorMapaGeo, VisaoGeralMapaData } from '../visaoGeralMapaPedido'

const COR_ACCENT_TOGGLE_MAPA_PEDIDO = corOficialProdutoGravity('pedido')
const ESTILO_VARS_TOGGLE_MAPA_PEDIDO: CSSProperties = {
  ['--mlg-accent' as string]: COR_ACCENT_TOGGLE_MAPA_PEDIDO,
  ['--mlg-accent-border' as string]: `${COR_ACCENT_TOGGLE_MAPA_PEDIDO}33`,
  ['--ws-accent-border' as string]: `${COR_ACCENT_TOGGLE_MAPA_PEDIDO}33`,
}

const ICONE_FILTRO_OPERACAO_PEDIDO: Record<FiltroOperacaoMapaInsightsPedido, ReactNode> = {
  importacao: <DownloadSimple size={15} weight="duotone" />,
  exportacao: <UploadSimple size={15} weight="duotone" />,
}

interface SecaoFiltroMapaPedidoProps {
  id: SecaoFiltroMapaInsightsPedidoId
  titulo: string
  icone: ReactNode
  ativos: number
  total: number
  colapsada: boolean
  onToggle: () => void
  children: ReactNode
  semanticaOptOut?: boolean
}

function SecaoFiltroMapaPedido({
  id,
  titulo,
  icone,
  ativos,
  total,
  colapsada,
  onToggle,
  children,
  semanticaOptOut = false,
}: SecaoFiltroMapaPedidoProps) {
  const { t } = useTranslation()
  const semRestricao = semanticaOptOut
    ? ativos === total
    : ativos === 0 || ativos === total
  const pct = semRestricao ? 100 : total > 0 ? Math.round((ativos / total) * 100) : 0
  const rotuloMeta = semRestricao
    ? t('pedido.visao_geral.mapa.refinar.todos', { defaultValue: 'Todos' })
    : `${ativos}/${total}`

  return (
    <section
      id={`ped-map-filtro-secao-${id}`}
      className={`bfd-map-filtro-secao ${colapsada ? 'bfd-map-filtro-secao--colapsada' : ''}${semRestricao ? '' : ' bfd-map-filtro-secao--restrita'}`}
    >
      <button
        type="button"
        className="bfd-map-filtro-secao__header"
        onClick={onToggle}
        aria-expanded={!colapsada}
        aria-controls={`ped-map-filtro-secao-${id}-corpo`}
      >
        <div className="bfd-map-filtro-secao__title">
          <CaretDown
            weight="bold"
            size={12}
            className={`bfd-map-filtro-secao__caret ${colapsada ? 'bfd-map-filtro-secao__caret--colapsado' : ''}`}
          />
          <span className="bfd-map-filtro-secao__icon">{icone}</span>
          <h3>{titulo}</h3>
        </div>
        <div className="bfd-map-filtro-secao__meta">
          <div className="bfd-map-filtro-secao__progress" aria-hidden>
            <div
              className={`bfd-map-filtro-secao__progress-fill${semRestricao ? ' bfd-map-filtro-secao__progress-fill--todos' : ''}`}
              style={{
                width: `${pct}%`,
                background: semRestricao ? undefined : '#f59e0b',
              }}
            />
          </div>
          <span
            className={`bfd-map-filtro-secao__pill${semRestricao ? ' bfd-map-filtro-secao__pill--todos' : ''}`}
          >
            {rotuloMeta}
          </span>
        </div>
      </button>
      {!colapsada ? (
        <div id={`ped-map-filtro-secao-${id}-corpo`} className="bfd-map-filtro-secao__corpo">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export interface PainelRefinarMapaPedidoProps {
  filtros: FiltrosMapaInsightsPedido
  onFiltrosChange: (filtros: FiltrosMapaInsightsPedido) => void
  pedidos: readonly Pedido[]
  fornecedoresPorId: ReadonlyMap<string, FornecedorMapaGeo>
  mapaBase: VisaoGeralMapaData
  mapaFiltrado: VisaoGeralMapaData
  totalPedidosFiltrados: number
  rotulosStatus: ReadonlyMap<string, string>
  coresStatus: ReadonlyMap<string, string>
  onPainelExpandidoChange?: (expandido: boolean) => void
}

export function PainelRefinarMapaPedido({
  filtros,
  onFiltrosChange,
  pedidos,
  fornecedoresPorId,
  mapaBase,
  mapaFiltrado,
  totalPedidosFiltrados,
  rotulosStatus,
  coresStatus,
  onPainelExpandidoChange,
}: PainelRefinarMapaPedidoProps) {
  const { t } = useTranslation()
  const [painelExpandido, setPainelExpandido] = useState(true)
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<SecaoFiltroMapaInsightsPedidoId>>(
    () => new Set(SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO),
  )
  const [buscaOrigem, setBuscaOrigem] = useState('')
  const [buscaDestino, setBuscaDestino] = useState('')
  const [buscaExportador, setBuscaExportador] = useState('')
  const [buscaImportador, setBuscaImportador] = useState('')

  const flagsPorPais = useMemo(() => montarFlagsPorPaisMapaPedido(mapaBase), [mapaBase])

  const paisesOrigem = useMemo(
    () => listarPaisesOrigemPedidoMapa(pedidos, fornecedoresPorId, flagsPorPais),
    [pedidos, fornecedoresPorId, flagsPorPais],
  )
  const paisesDestino = useMemo(
    () => listarPaisesDestinoPedidoMapa(pedidos, fornecedoresPorId, flagsPorPais),
    [pedidos, fornecedoresPorId, flagsPorPais],
  )
  const exportadores = useMemo(() => listarExportadoresPedidoMapa(pedidos), [pedidos])
  const importadores = useMemo(() => listarImportadoresPedidoMapa(pedidos), [pedidos])
  const statusOpcoes = useMemo(
    () => listarStatusPedidoMapa(pedidos, rotulosStatus, coresStatus),
    [pedidos, rotulosStatus, coresStatus],
  )

  const totalFiltrosAtivos = contarFiltrosMapaPedidoAtivos(filtros, {
    total_paises_origem: paisesOrigem.length,
    total_paises_destino: paisesDestino.length,
    total_exportadores: exportadores.length,
    total_importadores: importadores.length,
    total_status: statusOpcoes.length,
  })

  const resumoMapa = traduzirResumoMapaFiltradoPedido(t, {
    totalFiltrosAtivos,
    totalPedidos: totalPedidosFiltrados,
    totalPedidosBase: pedidos.length,
    pinsAtivos: mapaFiltrado.pins.length,
    pinsBase: mapaBase.pins.length,
    rotasAtivas: mapaFiltrado.globeRoutes.length,
    rotasBase: mapaBase.globeRoutes.length,
  })

  const operacaoAtivos = FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO.filter((f) => filtros.operacao.has(f.id)).length
  const origemAtivos = filtros.paises_origem.size
  const destinoAtivos = filtros.paises_destino.size
  const exportadorAtivos = filtros.exportadores.size
  const importadorAtivos = filtros.importadores.size
  const statusAtivos = filtros.status.size
  const todasSecoesColapsadas = secoesColapsadas.size === SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO.length

  const limparFiltros = () => onFiltrosChange(filtrosMapaInsightsPedidoIniciais())

  const alternarOperacao = (id: FiltroOperacaoMapaInsightsPedido) => {
    onFiltrosChange({
      ...filtros,
      operacao: (() => {
        const next = new Set(filtros.operacao)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })(),
    })
  }

  const alternarItemSet = (
    campo: 'paises_origem' | 'paises_destino' | 'exportadores' | 'importadores' | 'status',
    id: string,
    todosItens: readonly ItemListaFiltroMapaPedido[],
  ) => {
    const total = todosItens.length
    const atual = filtros[campo]

    if (atual.size === 0 || atual.size >= total) {
      const next = new Set(todosItens.map((item) => item.id))
      next.delete(id)
      onFiltrosChange({ ...filtros, [campo]: next })
      return
    }

    if (atual.has(id)) {
      onFiltrosChange({
        ...filtros,
        [campo]: (() => {
          const next = new Set(atual)
          next.delete(id)
          return next
        })(),
      })
      return
    }

    const next = new Set(atual)
    next.add(id)
    onFiltrosChange({
      ...filtros,
      [campo]: next.size >= total ? new Set() : next,
    })
  }

  const selecionarTodosSet = (
    campo: 'paises_origem' | 'paises_destino' | 'exportadores' | 'importadores' | 'status',
  ) => {
    onFiltrosChange({
      ...filtros,
      [campo]: new Set(),
    })
  }

  const limparSet = (
    campo: 'paises_origem' | 'paises_destino' | 'exportadores' | 'importadores' | 'status',
  ) => {
    onFiltrosChange({
      ...filtros,
      [campo]: new Set(),
    })
  }

  const alternarSecao = (id: SecaoFiltroMapaInsightsPedidoId) => {
    setSecoesColapsadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const alternarTodasSecoes = () => {
    setSecoesColapsadas((prev) =>
      prev.size === SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO.length
        ? new Set()
        : new Set(SECOES_FILTRO_MAPA_INSIGHTS_PEDIDO),
    )
  }

  const alternarPainelExpandido = () => {
    setPainelExpandido((prev) => {
      const next = !prev
      onPainelExpandidoChange?.(next)
      return next
    })
  }

  const expandirPainel = () => {
    setPainelExpandido(true)
    onPainelExpandidoChange?.(true)
  }

  function renderToolbarSelecao(total: number, ativos: number, onTodos: () => void, onLimpar: () => void) {
    if (total === 0) return null
    const semRestricao = ativos === 0 || ativos === total
    return (
      <div className="bfd-map-filtros-panel__secao-toolbar">
        <button type="button" className="bfd-map-filtros-panel__toolbar-btn" onClick={onTodos}>
          <SelectionAll size={12} weight="bold" />
          {t('tabela.selecionar_tudo', { defaultValue: 'Selecionar tudo' })}
        </button>
        {!semRestricao ? (
          <button type="button" className="bfd-map-filtros-panel__toolbar-btn" onClick={onLimpar}>
            {t('pedido.visao_geral.mapa.refinar.limpar_selecao', { defaultValue: 'Limpar seleção' })}
          </button>
        ) : null}
      </div>
    )
  }

  function renderListaItens(
    itens: readonly ItemListaFiltroMapaPedido[],
    selecionados: ReadonlySet<string>,
    onAlternar: (id: string) => void,
    mensagemVazia: string,
    busca: string,
    onBuscaChange: (valor: string) => void,
    idCampoBusca: string,
    exibirFlag = true,
  ) {
    if (itens.length === 0) {
      return <p className="bfd-map-filtros-panel__lista-vazia">{mensagemVazia}</p>
    }

    const itensFiltrados = filtrarItensListaMapaPedidoPorBusca(itens, busca)
    const buscaAtiva = busca.trim().length > 0

    return (
      <div className="bfd-map-filtros-panel__locais">
        <div className="bfd-map-filtros-panel__local-busca">
          <MagnifyingGlass weight="duotone" size={12} className="bfd-map-filtros-panel__local-busca-icone" aria-hidden />
          <input
            id={idCampoBusca}
            type="search"
            className="bfd-map-filtros-panel__local-busca-input"
            placeholder={t('pedido.visao_geral.mapa.refinar.localizar', { defaultValue: 'Localizar' })}
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            aria-label={t('pedido.visao_geral.mapa.refinar.localizar_aria', { defaultValue: 'Localizar item na lista' })}
            autoComplete="off"
          />
          {buscaAtiva ? (
            <button
              type="button"
              className="bfd-map-filtros-panel__local-busca-limpar"
              onClick={() => onBuscaChange('')}
              title={t('pedido.visao_geral.mapa.refinar.limpar_busca', { defaultValue: 'Limpar busca' })}
              aria-label={t('pedido.visao_geral.mapa.refinar.limpar_busca', { defaultValue: 'Limpar busca' })}
            >
              <X size={11} weight="bold" />
            </button>
          ) : null}
        </div>
        {buscaAtiva ? (
          <p className="bfd-map-filtros-panel__local-busca-resumo" aria-live="polite">
            {itensFiltrados.length} de {itens.length}
          </p>
        ) : null}
        {itensFiltrados.length === 0 ? (
          <p className="bfd-map-filtros-panel__lista-vazia">
            {t('pedido.visao_geral.mapa.refinar.busca_sem_resultado', {
              defaultValue: 'Nenhum item corresponde à busca.',
            })}
          </p>
        ) : (
          <div className="bfd-map-filtros-panel__local-lista">
            {itensFiltrados.map((item) => {
              const ativo = itemFiltroMapaPedidoSelecionado(selecionados, itens.length, item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`bfd-map-filtros-panel__local-item ${ativo ? 'is-active' : ''}`}
                  aria-pressed={ativo}
                  title={item.label}
                  onClick={() => onAlternar(item.id)}
                >
                  {exibirFlag ? (
                    <span className="bfd-map-filtros-panel__local-flag" aria-hidden>
                      {item.flag ?? '🌍'}
                    </span>
                  ) : (
                    <span className="bfd-map-filtros-panel__local-flag" aria-hidden>
                      <UserCircle size={14} weight="duotone" />
                    </span>
                  )}
                  <span className="bfd-map-filtros-panel__local-texto">
                    <span className="bfd-map-filtros-panel__local-nome">{item.label}</span>
                  </span>
                  {ativo ? <Check size={14} weight="bold" className="bfd-map-filtros-panel__check" /> : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  function renderPainelRecolhido() {
    return (
      <aside
        className="bfd-map-filtros-rail"
        aria-label={t('pedido.visao_geral.mapa.refinar.aria_filtros_compacto', { defaultValue: 'Filtros do mapa (compacto)' })}
      >
        <div className="bfd-map-filtros-rail__grupo">
          {FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO.map((filtro) => {
            const ativo = filtros.operacao.has(filtro.id)
            return (
              <button
                key={filtro.id}
                type="button"
                className={`bfd-map-filtros-rail__btn ${ativo ? 'is-active' : ''}`}
                aria-pressed={ativo}
                title={traduzirTooltipFiltroOperacaoMapaPedido(t, filtro.id)}
                onClick={() => {
                  expandirPainel()
                  alternarOperacao(filtro.id)
                }}
              >
                {ICONE_FILTRO_OPERACAO_PEDIDO[filtro.id]}
              </button>
            )
          })}
        </div>
        <div className="bfd-map-filtros-rail__separador" aria-hidden />
        <div className="bfd-map-filtros-rail__grupo bfd-map-filtros-rail__grupo--status">
          {statusOpcoes.slice(0, 6).map((filtro) => {
            const ativo = itemFiltroMapaPedidoSelecionado(filtros.status, statusOpcoes.length, filtro.id)
            return (
              <button
                key={filtro.id}
                type="button"
                className={`bfd-map-filtros-rail__btn bfd-map-filtros-rail__btn--status ${ativo ? 'is-active' : ''}`}
                aria-pressed={ativo}
                title={filtro.label}
                onClick={() => {
                  expandirPainel()
                  alternarItemSet('status', filtro.id, statusOpcoes)
                }}
              >
                <span className="bfd-map-filtros-rail__status-dot" style={{ backgroundColor: filtro.cor, color: filtro.cor }} />
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="bfd-map-filtros-rail__limpar"
          title={t('pedido.visao_geral.mapa.refinar.limpar_filtros', { defaultValue: 'Limpar filtros' })}
          aria-label={t('pedido.visao_geral.mapa.refinar.limpar_filtros', { defaultValue: 'Limpar filtros' })}
          disabled={totalFiltrosAtivos === 0}
          onClick={() => {
            expandirPainel()
            limparFiltros()
          }}
        >
          <X size={13} weight="bold" />
        </button>
      </aside>
    )
  }

  return (
    <div
      className={`bfd-map-filtros-shell${painelExpandido ? '' : ' bfd-map-filtros-shell--recolhido'}`}
      style={ESTILO_VARS_TOGGLE_MAPA_PEDIDO}
    >
      <TooltipGlobal
        descricao={
          painelExpandido
            ? t('pedido.visao_geral.mapa.refinar.recolher', { defaultValue: 'Recolher Refinar mapa' })
            : t('pedido.visao_geral.mapa.refinar.expandir', { defaultValue: 'Expandir Refinar mapa' })
        }
      >
        <button
          type="button"
          className="mlg-toggle-btn"
          onClick={alternarPainelExpandido}
          aria-expanded={painelExpandido}
          aria-controls="ped-map-filtros-panel-conteudo"
        >
          <SidebarSimple weight={painelExpandido ? 'regular' : 'duotone'} size={16} />
        </button>
      </TooltipGlobal>

      {painelExpandido ? (
        <aside
          id="ped-map-filtros-panel-conteudo"
          className="bfd-map-filtros-panel bfd-map-filtros-panel--acordeao"
          aria-label={t('pedido.visao_geral.mapa.refinar.aria_filtros', { defaultValue: 'Filtros do mapa' })}
        >
          <div className="bfd-map-filtros-panel__topo">
            <div>
              <p className="bfd-map-filtros-panel__titulo">
                {t('pedido.visao_geral.mapa.refinar.titulo', { defaultValue: 'Refinar mapa' })}
              </p>
              <p className="bfd-map-filtros-panel__resumo">{resumoMapa}</p>
            </div>
          </div>

          <div className="bfd-map-filtros-panel__toolbar">
            <button
              type="button"
              className="bfd-map-filtros-panel__toolbar-btn"
              onClick={alternarTodasSecoes}
              title={
                todasSecoesColapsadas
                  ? t('pedido.visao_geral.mapa.refinar.expandir_todas_secoes', { defaultValue: 'Expandir todas as seções' })
                  : t('pedido.visao_geral.mapa.refinar.recolher_todas_secoes', { defaultValue: 'Recolher todas as seções' })
              }
            >
              <CaretDown
                weight="bold"
                size={12}
                className={`bfd-map-filtro-secao__caret ${todasSecoesColapsadas ? 'bfd-map-filtro-secao__caret--colapsado' : ''}`}
              />
              {todasSecoesColapsadas
                ? t('pedido.visao_geral.mapa.refinar.expandir_todas', { defaultValue: 'Expandir todas' })
                : t('pedido.visao_geral.mapa.refinar.recolher_todas', { defaultValue: 'Recolher todas' })}
            </button>
            <button
              type="button"
              className="bfd-map-filtros-panel__limpar"
              onClick={limparFiltros}
              disabled={totalFiltrosAtivos === 0}
              title={t('pedido.visao_geral.mapa.refinar.limpar_filtros', { defaultValue: 'Limpar filtros' })}
              aria-label={t('pedido.visao_geral.mapa.refinar.limpar_filtros', { defaultValue: 'Limpar filtros' })}
            >
              <X size={12} weight="bold" />
              {t('pedido.visao_geral.mapa.refinar.limpar_filtros', { defaultValue: 'Limpar filtros' })}
            </button>
          </div>

          <div className="bfd-map-filtros-acordeao">
            <SecaoFiltroMapaPedido
              id="operacao"
              titulo={traduzirTituloSecaoFiltroMapaPedido(t, 'operacao')}
              icone={<Export size={16} weight="duotone" />}
              ativos={operacaoAtivos}
              total={FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO.length}
              colapsada={secoesColapsadas.has('operacao')}
              onToggle={() => alternarSecao('operacao')}
              semanticaOptOut
            >
              <div className="bfd-map-filtros-panel__operacao-grid">
                {FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO.map((filtro) => {
                  const ativo = filtros.operacao.has(filtro.id)
                  return (
                    <button
                      key={filtro.id}
                      type="button"
                      className={`bfd-map-filtros-panel__operacao-card ${ativo ? 'is-active' : ''}`}
                      aria-pressed={ativo}
                      onClick={() => alternarOperacao(filtro.id)}
                    >
                      <span className="bfd-map-filtros-panel__operacao-icone">
                        {ICONE_FILTRO_OPERACAO_PEDIDO[filtro.id]}
                      </span>
                      <span className="bfd-map-filtros-panel__operacao-label">
                        {traduzirLabelFiltroOperacaoMapaPedido(t, filtro.id)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </SecaoFiltroMapaPedido>

            <SecaoFiltroMapaPedido
              id="origem"
              titulo={traduzirTituloSecaoFiltroMapaPedido(t, 'origem')}
              icone={<MapPin size={16} weight="duotone" />}
              ativos={origemAtivos}
              total={paisesOrigem.length}
              colapsada={secoesColapsadas.has('origem')}
              onToggle={() => alternarSecao('origem')}
            >
              {renderToolbarSelecao(
                paisesOrigem.length,
                origemAtivos,
                () => selecionarTodosSet('paises_origem'),
                () => limparSet('paises_origem'),
              )}
              {renderListaItens(
                paisesOrigem,
                filtros.paises_origem,
                (id) => alternarItemSet('paises_origem', id, paisesOrigem),
                t('pedido.visao_geral.mapa.refinar.vazio_origem', { defaultValue: 'Nenhum país de origem nos pedidos atuais.' }),
                buscaOrigem,
                setBuscaOrigem,
                'ped-map-filtro-busca-origem',
              )}
            </SecaoFiltroMapaPedido>

            <SecaoFiltroMapaPedido
              id="destino"
              titulo={traduzirTituloSecaoFiltroMapaPedido(t, 'destino')}
              icone={<Flag size={16} weight="duotone" />}
              ativos={destinoAtivos}
              total={paisesDestino.length}
              colapsada={secoesColapsadas.has('destino')}
              onToggle={() => alternarSecao('destino')}
            >
              {renderToolbarSelecao(
                paisesDestino.length,
                destinoAtivos,
                () => selecionarTodosSet('paises_destino'),
                () => limparSet('paises_destino'),
              )}
              {renderListaItens(
                paisesDestino,
                filtros.paises_destino,
                (id) => alternarItemSet('paises_destino', id, paisesDestino),
                t('pedido.visao_geral.mapa.refinar.vazio_destino', { defaultValue: 'Nenhum país de destino nos pedidos atuais.' }),
                buscaDestino,
                setBuscaDestino,
                'ped-map-filtro-busca-destino',
              )}
            </SecaoFiltroMapaPedido>

            <SecaoFiltroMapaPedido
              id="exportador"
              titulo={traduzirTituloSecaoFiltroMapaPedido(t, 'exportador')}
              icone={<UploadSimple size={16} weight="duotone" />}
              ativos={exportadorAtivos}
              total={exportadores.length}
              colapsada={secoesColapsadas.has('exportador')}
              onToggle={() => alternarSecao('exportador')}
            >
              {renderToolbarSelecao(
                exportadores.length,
                exportadorAtivos,
                () => selecionarTodosSet('exportadores'),
                () => limparSet('exportadores'),
              )}
              {renderListaItens(
                exportadores,
                filtros.exportadores,
                (id) => alternarItemSet('exportadores', id, exportadores),
                t('pedido.visao_geral.mapa.refinar.vazio_exportador', { defaultValue: 'Nenhum exportador nos pedidos atuais.' }),
                buscaExportador,
                setBuscaExportador,
                'ped-map-filtro-busca-exportador',
                false,
              )}
            </SecaoFiltroMapaPedido>

            <SecaoFiltroMapaPedido
              id="importador"
              titulo={traduzirTituloSecaoFiltroMapaPedido(t, 'importador')}
              icone={<DownloadSimple size={16} weight="duotone" />}
              ativos={importadorAtivos}
              total={importadores.length}
              colapsada={secoesColapsadas.has('importador')}
              onToggle={() => alternarSecao('importador')}
            >
              {renderToolbarSelecao(
                importadores.length,
                importadorAtivos,
                () => selecionarTodosSet('importadores'),
                () => limparSet('importadores'),
              )}
              {renderListaItens(
                importadores,
                filtros.importadores,
                (id) => alternarItemSet('importadores', id, importadores),
                t('pedido.visao_geral.mapa.refinar.vazio_importador', { defaultValue: 'Nenhum importador nos pedidos atuais.' }),
                buscaImportador,
                setBuscaImportador,
                'ped-map-filtro-busca-importador',
                false,
              )}
            </SecaoFiltroMapaPedido>

            <SecaoFiltroMapaPedido
              id="status"
              titulo={traduzirTituloSecaoFiltroMapaPedido(t, 'status')}
              icone={<TrafficSign size={16} weight="duotone" />}
              ativos={statusAtivos}
              total={statusOpcoes.length}
              colapsada={secoesColapsadas.has('status')}
              onToggle={() => alternarSecao('status')}
            >
              {renderToolbarSelecao(
                statusOpcoes.length,
                statusAtivos,
                () => selecionarTodosSet('status'),
                () => limparSet('status'),
              )}
              <div className="bfd-map-filtros-panel__status-lista">
                {statusOpcoes.map((filtro) => {
                  const ativo = itemFiltroMapaPedidoSelecionado(filtros.status, statusOpcoes.length, filtro.id)
                  return (
                    <button
                      key={filtro.id}
                      type="button"
                      className={`bfd-map-filtros-panel__status-item ${ativo ? 'is-active' : ''}`}
                      aria-pressed={ativo}
                      onClick={() => alternarItemSet('status', filtro.id, statusOpcoes)}
                    >
                      <span className="bfd-map-filtros-panel__status-dot" style={{ backgroundColor: filtro.cor, color: filtro.cor }} />
                      <span className="bfd-map-filtros-panel__status-label">{filtro.label}</span>
                      {ativo ? <Check size={14} weight="bold" className="bfd-map-filtros-panel__check" /> : null}
                    </button>
                  )
                })}
              </div>
            </SecaoFiltroMapaPedido>
          </div>
        </aside>
      ) : (
        renderPainelRecolhido()
      )}
    </div>
  )
}
