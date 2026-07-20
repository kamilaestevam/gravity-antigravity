import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowsDownUp,
  Buildings,
  CaretDown,
  Check,
  DownloadSimple,
  Factory,
  MapPin,
  MapPinLine,
  SidebarSimple,
  UploadSimple,
  X,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '../../../Feedback/tooltip-global/src/tooltip'
import {
  SECOES_REFINAR_MAPA_SIMULADOR_PEDIDO,
  contarFiltrosRefinarMapaAtivos,
  criarFiltrosRefinarMapaIniciais,
  formatarResumoRefinarMapaSimuladorPedido,
  formatarResumoRefinarMapaTelaCheiaSimuladorPedido,
  calcularContadoresRefinarMapaSimuladorPedido,
  type FiltrosRefinarMapaSimuladorPedido,
  type OpcoesRefinarMapaSimuladorPedido,
  type SecaoRefinarMapaSimuladorPedido,
} from './dados-refinar-mapa-simulador-pedido'
import type { MapaPedidoEmpresaSimulador } from './dados-mapa-globo-simulador-pedido'
import './refinar-mapa-simulador-pedido.css'

type Props = {
  mapaBase: MapaPedidoEmpresaSimulador
  mapaFiltrado: MapaPedidoEmpresaSimulador
  opcoes: OpcoesRefinarMapaSimuladorPedido
  filtros: FiltrosRefinarMapaSimuladorPedido
  onFiltrosChange: (filtros: FiltrosRefinarMapaSimuladorPedido) => void
  variantePainel?: 'card' | 'tela-cheia'
  rotuloExportadores?: string
  rotuloImportadores?: string
}

function clonarFiltros(filtros: FiltrosRefinarMapaSimuladorPedido): FiltrosRefinarMapaSimuladorPedido {
  return {
    operacoes: new Set(filtros.operacoes),
    origens: new Set(filtros.origens),
    destinos: new Set(filtros.destinos),
    exportadores: new Set(filtros.exportadores),
    importadores: new Set(filtros.importadores),
    status: new Set(filtros.status),
  }
}

type SecaoProps = {
  id: SecaoRefinarMapaSimuladorPedido
  titulo: string
  icone: ReactNode
  ativos: number
  total: number
  colapsada: boolean
  onToggle: () => void
  children: ReactNode
}

function SecaoRefinarMapa({
  id,
  titulo,
  icone,
  ativos,
  total,
  colapsada,
  onToggle,
  children,
}: SecaoProps) {
  const semRestricao = ativos === total || total === 0
  const pct = semRestricao ? 100 : total > 0 ? Math.round((ativos / total) * 100) : 0

  return (
    <section
      id={`pds-map-refinar-secao-${id}`}
      data-sds-tutorial-alvo={`pedido-insights-refinar-${id}`}
      className={`pds-map-refinar-secao${colapsada ? ' pds-map-refinar-secao--colapsada' : ''}${semRestricao ? '' : ' pds-map-refinar-secao--restrita'}`}
    >
      <button
        type="button"
        className="pds-map-refinar-secao__header"
        onClick={onToggle}
        aria-expanded={!colapsada}
        aria-controls={`pds-map-refinar-secao-${id}-corpo`}
      >
        <div className="pds-map-refinar-secao__title">
          <CaretDown
            weight="bold"
            size={12}
            className={`pds-map-refinar-secao__caret${colapsada ? ' pds-map-refinar-secao__caret--colapsado' : ''}`}
          />
          <span className="pds-map-refinar-secao__icon">{icone}</span>
          <h3>{titulo}</h3>
        </div>
        <div className="pds-map-refinar-secao__meta">
          <div className="pds-map-refinar-secao__progress" aria-hidden>
            <div
              className={`pds-map-refinar-secao__progress-fill${semRestricao ? ' pds-map-refinar-secao__progress-fill--todos' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`pds-map-refinar-secao__pill${semRestricao ? ' pds-map-refinar-secao__pill--todos' : ''}`}>
            {semRestricao ? 'Todos' : `${ativos}/${total}`}
          </span>
        </div>
      </button>
      {!colapsada ? (
        <div id={`pds-map-refinar-secao-${id}-corpo`} className="pds-map-refinar-secao__corpo">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export function RefinarMapaSimuladorPedido({
  mapaBase,
  mapaFiltrado,
  opcoes,
  filtros,
  onFiltrosChange,
  variantePainel = 'card',
  rotuloExportadores = 'Exportadores',
  rotuloImportadores = 'Importadores',
}: Props) {
  const [expandido, setExpandido] = useState(true)
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<SecaoRefinarMapaSimuladorPedido>>(
    () => new Set(SECOES_REFINAR_MAPA_SIMULADOR_PEDIDO),
  )

  const totalFiltrosAtivos = useMemo(
    () => contarFiltrosRefinarMapaAtivos(filtros, opcoes),
    [filtros, opcoes],
  )
  const resumo = useMemo(
    () =>
      variantePainel === 'tela-cheia'
        ? formatarResumoRefinarMapaTelaCheiaSimuladorPedido(mapaBase, mapaFiltrado, totalFiltrosAtivos)
        : formatarResumoRefinarMapaSimuladorPedido(mapaBase, mapaFiltrado, totalFiltrosAtivos),
    [mapaBase, mapaFiltrado, totalFiltrosAtivos, variantePainel],
  )
  const contadores = useMemo(
    () => calcularContadoresRefinarMapaSimuladorPedido(mapaBase, mapaFiltrado, totalFiltrosAtivos),
    [mapaBase, mapaFiltrado, totalFiltrosAtivos],
  )

  const todasSecoesColapsadas = secoesColapsadas.size === SECOES_REFINAR_MAPA_SIMULADOR_PEDIDO.length

  function alternarSecao(id: SecaoRefinarMapaSimuladorPedido) {
    setSecoesColapsadas((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  function alternarTodasSecoes() {
    setSecoesColapsadas(
      todasSecoesColapsadas ? new Set() : new Set(SECOES_REFINAR_MAPA_SIMULADOR_PEDIDO),
    )
  }

  function limparFiltros() {
    onFiltrosChange(criarFiltrosRefinarMapaIniciais(opcoes))
  }

  function expandirComSecao(id: SecaoRefinarMapaSimuladorPedido) {
    setExpandido(true)
    setSecoesColapsadas((atual) => {
      const proximo = new Set(atual)
      proximo.delete(id)
      return proximo
    })
  }

  function alternarOperacao(id: 'importacao' | 'exportacao') {
    const proximo = clonarFiltros(filtros)
    if (proximo.operacoes.has(id)) proximo.operacoes.delete(id)
    else proximo.operacoes.add(id)
    onFiltrosChange(proximo)
  }

  function alternarPais(dimensao: 'origens' | 'destinos', codigo: string) {
    const proximo = clonarFiltros(filtros)
    const conjunto = proximo[dimensao]
    if (conjunto.has(codigo)) conjunto.delete(codigo)
    else conjunto.add(codigo)
    onFiltrosChange(proximo)
  }

  function alternarTexto(dimensao: 'exportadores' | 'importadores', valor: string) {
    const proximo = clonarFiltros(filtros)
    const conjunto = proximo[dimensao]
    if (conjunto.has(valor)) conjunto.delete(valor)
    else conjunto.add(valor)
    onFiltrosChange(proximo)
  }

  function alternarStatus(id: (typeof opcoes.status)[number]['id']) {
    const proximo = clonarFiltros(filtros)
    if (proximo.status.has(id)) proximo.status.delete(id)
    else proximo.status.add(id)
    onFiltrosChange(proximo)
  }

  const operacaoAtivos = opcoes.operacoes.filter((item) => filtros.operacoes.has(item.id)).length
  const origemAtivos = filtros.origens.size
  const destinoAtivos = filtros.destinos.size
  const exportadorAtivos = filtros.exportadores.size
  const importadorAtivos = filtros.importadores.size
  const statusAtivos = filtros.status.size

  function renderPainelRecolhido() {
    return (
      <aside
        className="pds-map-refinar-rail"
        aria-label="Filtros do mapa (compacto)"
        data-sds-tutorial-alvo="pedido-insights-refinar-rail"
      >
        <div className="pds-map-refinar-rail__grupo">
          {opcoes.operacoes.map((item) => {
            const ativo = filtros.operacoes.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`pds-map-refinar-rail__btn${ativo ? ' is-active' : ''}`}
                aria-pressed={ativo}
                title={item.rotulo}
                onClick={() => {
                  setExpandido(true)
                  alternarOperacao(item.id)
                }}
              >
                {item.id === 'importacao' ? (
                  <DownloadSimple size={18} weight="duotone" />
                ) : (
                  <UploadSimple size={18} weight="duotone" />
                )}
              </button>
            )
          })}
        </div>

        <div className="pds-map-refinar-rail__separador" aria-hidden />

        <div className="pds-map-refinar-rail__grupo">
          <button
            type="button"
            className={`pds-map-refinar-rail__btn${origemAtivos < opcoes.origens.length ? ' is-active' : ''}`}
            title="Origem"
            onClick={() => expandirComSecao('origem')}
          >
            <MapPin size={18} weight="duotone" />
          </button>
          <button
            type="button"
            className={`pds-map-refinar-rail__btn${destinoAtivos < opcoes.destinos.length ? ' is-active' : ''}`}
            title="Destino"
            onClick={() => expandirComSecao('destino')}
          >
            <MapPinLine size={18} weight="duotone" />
          </button>
        </div>

        <div className="pds-map-refinar-rail__separador" aria-hidden />

        <div className="pds-map-refinar-rail__grupo">
          <button
            type="button"
            className={`pds-map-refinar-rail__btn${exportadorAtivos < opcoes.exportadores.length ? ' is-active' : ''}`}
            title={rotuloExportadores}
            onClick={() => expandirComSecao('exportadores')}
          >
            <Factory size={18} weight="duotone" />
          </button>
          <button
            type="button"
            className={`pds-map-refinar-rail__btn${importadorAtivos < opcoes.importadores.length ? ' is-active' : ''}`}
            title={rotuloImportadores}
            onClick={() => expandirComSecao('importadores')}
          >
            <Buildings size={18} weight="duotone" />
          </button>
        </div>

        <div className="pds-map-refinar-rail__separador" aria-hidden />

        <div className="pds-map-refinar-rail__grupo pds-map-refinar-rail__grupo--status">
          {opcoes.status.map((item) => {
            const ativo = filtros.status.has(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`pds-map-refinar-rail__btn pds-map-refinar-rail__btn--status${ativo ? ' is-active' : ''}`}
                aria-pressed={ativo}
                title={item.rotulo}
                onClick={() => {
                  setExpandido(true)
                  alternarStatus(item.id)
                }}
              >
                <span
                  className="pds-map-refinar-rail__status-dot"
                  style={{ backgroundColor: item.cor, color: item.cor }}
                />
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="pds-map-refinar-rail__limpar"
          title="Limpar filtros"
          aria-label="Limpar filtros"
          disabled={totalFiltrosAtivos === 0}
          onClick={() => {
            setExpandido(true)
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
      className={`pds-map-refinar-shell${expandido ? '' : ' pds-map-refinar-shell--recolhido'}`}
      data-sds-tutorial-alvo="pedido-insights-refinar-mapa"
    >
      <TooltipGlobal
        descricao={expandido ? 'Recolher Refinar mapa' : 'Expandir Refinar mapa'}
      >
        <button
          type="button"
          className="mlg-toggle-btn pds-map-refinar-shell__toggle"
          data-sds-tutorial-alvo="pedido-insights-refinar-toggle"
          onClick={() => setExpandido((prev) => !prev)}
          aria-expanded={expandido}
          aria-controls="pds-map-refinar-panel"
        >
          <SidebarSimple weight={expandido ? 'regular' : 'duotone'} size={16} />
        </button>
      </TooltipGlobal>

      {expandido ? (
        <aside
          id="pds-map-refinar-panel"
          className="pds-map-refinar-panel"
          aria-label="Filtros do mapa"
        >
          <div className="pds-map-refinar-panel__topo">
            <p className="pds-map-refinar-panel__titulo">Refinar mapa</p>
            {variantePainel === 'tela-cheia' ? (
              <p
                className="pds-map-refinar-panel__resumo"
                data-sds-tutorial-alvo="pedido-insights-refinar-contadores"
                aria-label={resumo}
              >
                {resumo}
              </p>
            ) : (
              <div
                className="pds-map-refinar-panel__contadores"
                data-sds-tutorial-alvo="pedido-insights-refinar-contadores"
                aria-label={resumo}
              >
                {contadores.modo === 'todos' ? (
                  <>
                    <span className="pds-map-refinar-panel__contadores-prefixo">Exibindo todos</span>
                    <span className="pds-map-refinar-panel__contador-chip">
                      <strong>{contadores.terminais}</strong> terminais
                    </span>
                    <span className="pds-map-refinar-panel__contador-chip">
                      <strong>{contadores.rotas}</strong> rotas
                    </span>
                  </>
                ) : (
                  <>
                    <span className="pds-map-refinar-panel__contador-chip">
                      <strong>{contadores.terminais}</strong>
                      <span className="pds-map-refinar-panel__contador-chip-base">/{contadores.terminaisBase}</span>{' '}
                      terminais
                    </span>
                    <span className="pds-map-refinar-panel__contador-chip">
                      <strong>{contadores.rotas}</strong>
                      <span className="pds-map-refinar-panel__contador-chip-base">/{contadores.rotasBase}</span>{' '}
                      rotas
                    </span>
                    <span className="pds-map-refinar-panel__contador-chip pds-map-refinar-panel__contador-chip--filtro">
                      <strong>{contadores.filtrosAtivos}</strong> filtro{contadores.filtrosAtivos !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pds-map-refinar-panel__toolbar" data-sds-tutorial-alvo="pedido-insights-refinar-toolbar">
            <button type="button" className="pds-map-refinar-panel__toolbar-btn" onClick={alternarTodasSecoes}>
              <CaretDown
                weight="bold"
                size={12}
                className={`pds-map-refinar-secao__caret${todasSecoesColapsadas ? ' pds-map-refinar-secao__caret--colapsado' : ''}`}
              />
              {todasSecoesColapsadas ? 'Expandir todas' : 'Recolher todas'}
            </button>
            <button
              type="button"
              className="pds-map-refinar-panel__limpar"
              onClick={limparFiltros}
              disabled={totalFiltrosAtivos === 0}
            >
              <X size={12} weight="bold" />
              Limpar filtros
            </button>
          </div>

          <div className="pds-map-refinar-acordeao">
            <SecaoRefinarMapa
              id="operacao"
              titulo="Operação"
              icone={<ArrowsDownUp size={16} weight="duotone" />}
              ativos={operacaoAtivos}
              total={opcoes.operacoes.length}
              colapsada={secoesColapsadas.has('operacao')}
              onToggle={() => alternarSecao('operacao')}
            >
              <div className="pds-map-refinar-operacao-grid">
                {opcoes.operacoes.map((item) => {
                  const ativo = filtros.operacoes.has(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`pds-map-refinar-operacao-card${ativo ? ' is-active' : ''}`}
                      aria-pressed={ativo}
                      onClick={() => alternarOperacao(item.id)}
                    >
                      <span className="pds-map-refinar-operacao-card__icone">
                        {item.id === 'importacao' ? (
                          <DownloadSimple size={18} weight="duotone" />
                        ) : (
                          <UploadSimple size={18} weight="duotone" />
                        )}
                      </span>
                      <span className="pds-map-refinar-operacao-card__label">{item.rotulo}</span>
                    </button>
                  )
                })}
              </div>
            </SecaoRefinarMapa>

            <SecaoRefinarMapa
              id="origem"
              titulo="Origem"
              icone={<MapPin size={16} weight="duotone" />}
              ativos={origemAtivos}
              total={opcoes.origens.length}
              colapsada={secoesColapsadas.has('origem')}
              onToggle={() => alternarSecao('origem')}
            >
              <ul className="pds-map-refinar-lista">
                {opcoes.origens.map((pais) => {
                  const ativo = filtros.origens.has(pais.codigo)
                  return (
                    <li key={pais.codigo}>
                      <button
                        type="button"
                        className={`pds-map-refinar-lista__item${ativo ? ' is-active' : ''}`}
                        onClick={() => alternarPais('origens', pais.codigo)}
                      >
                        <span className="pds-map-refinar-lista__flag">{pais.flag}</span>
                        <span className="pds-map-refinar-lista__texto">{pais.nome}</span>
                        {ativo ? <Check size={14} weight="bold" className="pds-map-refinar-lista__check" /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SecaoRefinarMapa>

            <SecaoRefinarMapa
              id="destino"
              titulo="Destino"
              icone={<MapPinLine size={16} weight="duotone" />}
              ativos={destinoAtivos}
              total={opcoes.destinos.length}
              colapsada={secoesColapsadas.has('destino')}
              onToggle={() => alternarSecao('destino')}
            >
              <ul className="pds-map-refinar-lista">
                {opcoes.destinos.map((pais) => {
                  const ativo = filtros.destinos.has(pais.codigo)
                  return (
                    <li key={pais.codigo}>
                      <button
                        type="button"
                        className={`pds-map-refinar-lista__item${ativo ? ' is-active' : ''}`}
                        onClick={() => alternarPais('destinos', pais.codigo)}
                      >
                        <span className="pds-map-refinar-lista__flag">{pais.flag}</span>
                        <span className="pds-map-refinar-lista__texto">{pais.nome}</span>
                        {ativo ? <Check size={14} weight="bold" className="pds-map-refinar-lista__check" /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SecaoRefinarMapa>

            <SecaoRefinarMapa
              id="exportadores"
              titulo={rotuloExportadores}
              icone={<Factory size={16} weight="duotone" />}
              ativos={exportadorAtivos}
              total={opcoes.exportadores.length}
              colapsada={secoesColapsadas.has('exportadores')}
              onToggle={() => alternarSecao('exportadores')}
            >
              <ul className="pds-map-refinar-lista">
                {opcoes.exportadores.map((nome) => {
                  const ativo = filtros.exportadores.has(nome)
                  return (
                    <li key={nome}>
                      <button
                        type="button"
                        className={`pds-map-refinar-lista__item${ativo ? ' is-active' : ''}`}
                        onClick={() => alternarTexto('exportadores', nome)}
                      >
                        <span className="pds-map-refinar-lista__texto">{nome}</span>
                        {ativo ? <Check size={14} weight="bold" className="pds-map-refinar-lista__check" /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SecaoRefinarMapa>

            <SecaoRefinarMapa
              id="importadores"
              titulo={rotuloImportadores}
              icone={<Buildings size={16} weight="duotone" />}
              ativos={importadorAtivos}
              total={opcoes.importadores.length}
              colapsada={secoesColapsadas.has('importadores')}
              onToggle={() => alternarSecao('importadores')}
            >
              <ul className="pds-map-refinar-lista">
                {opcoes.importadores.map((nome) => {
                  const ativo = filtros.importadores.has(nome)
                  return (
                    <li key={nome}>
                      <button
                        type="button"
                        className={`pds-map-refinar-lista__item${ativo ? ' is-active' : ''}`}
                        onClick={() => alternarTexto('importadores', nome)}
                      >
                        <span className="pds-map-refinar-lista__texto">{nome}</span>
                        {ativo ? <Check size={14} weight="bold" className="pds-map-refinar-lista__check" /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SecaoRefinarMapa>

            <SecaoRefinarMapa
              id="status"
              titulo="Status"
              icone={<Check size={16} weight="duotone" />}
              ativos={statusAtivos}
              total={opcoes.status.length}
              colapsada={secoesColapsadas.has('status')}
              onToggle={() => alternarSecao('status')}
            >
              <ul className="pds-map-refinar-status-lista">
                {opcoes.status.map((item) => {
                  const ativo = filtros.status.has(item.id)
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`pds-map-refinar-status-item${ativo ? ' is-active' : ''}`}
                        onClick={() => alternarStatus(item.id)}
                      >
                        <span
                          className="pds-map-refinar-status-item__dot"
                          style={{ background: item.cor }}
                        />
                        <span className="pds-map-refinar-status-item__label">{item.rotulo}</span>
                        {ativo ? <Check size={14} weight="bold" className="pds-map-refinar-lista__check" /> : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SecaoRefinarMapa>
          </div>
        </aside>
      ) : (
        renderPainelRecolhido()
      )}
    </div>
  )
}
