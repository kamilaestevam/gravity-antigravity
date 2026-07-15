import React, { useMemo, useState } from 'react'
import {
  ArrowsDownUp,
  CaretDown,
  Check,
  DownloadSimple,
  Funnel,
  GlobeHemisphereWest,
  UploadSimple,
} from '@phosphor-icons/react'
import { MapaGloboSimuladorPedido } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/mapa-globo-simulador-pedido'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/mapa-globo-simulador-pedido.css'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/insights-simulador-pedido.css'
import { ManualBidFreteGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import {
  FaixaDemoInterativaBidFrete,
  resolverProximoCampoAffordance,
} from './manual-bid-frete-affordance-interativo'
import {
  NC_ESTILOS_AFFORDANCE_INTERATIVO_BID_FRETE,
  NC_ESTILOS_SIMULADOR_WIZARD_SHELL,
} from './manual-bid-frete-estilos-nc-simulador'
import { NC_ESTILOS_SIMULADOR_FILTROS_MAPA_PEDIDO } from './manual-pedido-estilos-simulador-filtros-mapa'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'
import {
  CAMPOS_FILTROS_MAPA_PEDIDO,
  ORDEM_AFFORDANCE_FILTROS_MAPA_PEDIDO,
} from './manual-pedido-guia-filtros-mapa-campos'
import {
  filtrosMapaPedidoIniciais,
  montarMapaFiltradoPedido,
  OPCOES_DESTINO_FILTRO_MAPA,
  OPCOES_EXPORTADOR_FILTRO_MAPA,
  OPCOES_IMPORTADOR_FILTRO_MAPA,
  OPCOES_ORIGEM_FILTRO_MAPA,
  OPCOES_STATUS_FILTRO_MAPA,
  resolverExplicacaoFiltrosMapa,
  resolverSelecoesGuiaFiltrosMapa,
  resumoMapaFiltradoPedido,
  type CampoFiltroMapaPedidoId,
  type EstadoFiltrosMapaPedido,
  type StatusPedidoFiltroMapa,
} from './manual-pedido-mock-filtros-mapa-simulador'

type SecaoAberta = CampoFiltroMapaPedidoId | null

function alternarSet<T>(set: Set<T>, valor: T): Set<T> {
  const proximo = new Set(set)
  if (proximo.has(valor)) proximo.delete(valor)
  else proximo.add(valor)
  return proximo
}

function filtrosEstaoPadrao(filtros: EstadoFiltrosMapaPedido): boolean {
  const inicial = filtrosMapaPedidoIniciais()
  const comparar = (a: Set<string>, b: Set<string>) =>
    a.size === b.size && [...a].every((item) => b.has(item))
  return (
    comparar(filtros.operacoes as Set<string>, inicial.operacoes as Set<string>)
    && comparar(filtros.origens, inicial.origens)
    && comparar(filtros.destinos, inicial.destinos)
    && comparar(filtros.exportadores, inicial.exportadores)
    && comparar(filtros.importadores, inicial.importadores)
    && comparar(filtros.statuses as Set<string>, inicial.statuses as Set<string>)
  )
}

function SecaoAcordeao({
  id,
  rotulo,
  aberta,
  emFoco,
  onToggle,
  children,
}: {
  id: CampoFiltroMapaPedidoId
  rotulo: string
  aberta: boolean
  emFoco: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section
      className={[
        'pds-filtros-secao',
        emFoco ? 'pds-filtros-secao--foco' : '',
        emFoco ? 'pds-filtros-affordance' : '',
      ].filter(Boolean).join(' ')}
      data-secao-filtro={id}
    >
      <button type="button" className="pds-filtros-secao__cabecalho" onClick={onToggle}>
        <span>{rotulo}</span>
        <CaretDown
          size={14}
          weight="bold"
          style={{
            transform: aberta ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            color: '#94a3b8',
          }}
        />
      </button>
      {aberta ? <div className="pds-filtros-secao__corpo">{children}</div> : null}
    </section>
  )
}

/** Manual Pedido § Insights — demo interativa Refinar mapa + Guia ao vivo. */
export function ManualPedidoSimuladorFiltrosMapa() {
  const [filtros, setFiltros] = useState<EstadoFiltrosMapaPedido>(() => filtrosMapaPedidoIniciais())
  const [foco, setFoco] = useState<CampoFiltroMapaPedidoId | null>(null)
  const [secaoAberta, setSecaoAberta] = useState<SecaoAberta>('operacao')
  const [interagiu, setInteragiu] = useState<Partial<Record<CampoFiltroMapaPedidoId, boolean>>>({})

  const mapaFiltrado = useMemo(() => montarMapaFiltradoPedido(filtros), [filtros])
  const selecoesGuia = useMemo(
    () => resolverSelecoesGuiaFiltrosMapa(filtros, interagiu),
    [filtros, interagiu],
  )
  const campoGuiaAtivo = foco
  const explicacao = campoGuiaAtivo
    ? resolverExplicacaoFiltrosMapa(campoGuiaAtivo, filtros, mapaFiltrado.pedidosVisiveis)
    : ''
  const affordanceCampo = resolverProximoCampoAffordance(ORDEM_AFFORDANCE_FILTROS_MAPA_PEDIDO, interagiu)
  const demoConviteAtiva = selecoesGuia.length === 0

  const marcarInteracao = (campo: CampoFiltroMapaPedidoId) => {
    setInteragiu((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
    setSecaoAberta(campo)
  }

  const abrirSecao = (campo: CampoFiltroMapaPedidoId) => {
    setSecaoAberta((prev) => (prev === campo ? null : campo))
    setFoco(campo)
  }

  const limparFiltros = () => {
    setFiltros(filtrosMapaPedidoIniciais())
    setInteragiu({})
    setFoco(null)
    setSecaoAberta('operacao')
  }

  return (
    <div id="sim-pedido-filtros-mapa" style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
      <FaixaDemoInterativaBidFrete
        mensagem="Aplique tudo o que aprendeu neste mapa interativo"
        visivel={demoConviteAtiva || Boolean(affordanceCampo)}
      />
      <style>{NC_ESTILOS_SIMULADOR_WIZARD_SHELL}</style>
      <style>{NC_ESTILOS_AFFORDANCE_INTERATIVO_BID_FRETE}</style>
      <style>{NC_ESTILOS_SIMULADOR_FILTROS_MAPA_PEDIDO}</style>

      <div className="sim-modal-operacao-layout">
        <div className="pds-filtros-mapa-shell sim-wizard-embutido sim-wizard-embutido--vivo">
          <div className="pds-filtros-mapa-shell__header">
            <GlobeHemisphereWest size={22} weight="duotone" color="#fbbf24" />
            <div>
              <p className="pds-filtros-mapa-shell__titulo">Insights · Mapa global</p>
              <p className="pds-filtros-mapa-shell__subtitulo">
                Combine filtros no painel <strong>Refinar mapa</strong> e recalcule pins e rotas em tempo real.
              </p>
            </div>
          </div>

          <div className="pds-filtros-mapa-split">
            <aside className="pds-filtros-mapa-painel" aria-label="Painel Refinar mapa">
              <div className="pds-filtros-mapa-painel__topo">
                <p className="pds-filtros-mapa-painel__titulo">
                  <Funnel size={14} weight="duotone" style={{ marginRight: 6, verticalAlign: -2 }} />
                  Refinar mapa
                </p>
                <p className="pds-filtros-mapa-painel__resumo">
                  {resumoMapaFiltradoPedido(mapaFiltrado.pedidosVisiveis, mapaFiltrado.pins.length)}
                </p>
              </div>

              <div className="pds-filtros-mapa-painel__toolbar">
                <button
                  type="button"
                  className="pds-filtros-mapa-painel__toolbar-btn"
                  onClick={() => setSecaoAberta(secaoAberta ? null : 'operacao')}
                >
                  {secaoAberta ? 'Recolher seções' : 'Expandir seções'}
                </button>
                <button
                  type="button"
                  className="pds-filtros-mapa-painel__limpar"
                  disabled={filtrosEstaoPadrao(filtros)}
                  onClick={limparFiltros}
                >
                  Limpar
                </button>
              </div>

              <div className="pds-filtros-mapa-acordeao">
                <SecaoAcordeao
                  id="operacao"
                  rotulo="01 Operação"
                  aberta={secaoAberta === 'operacao'}
                  emFoco={affordanceCampo === 'operacao'}
                  onToggle={() => abrirSecao('operacao')}
                >
                  <div className="pds-filtros-operacao-grid">
                    {([
                      { id: 'importacao' as const, rotulo: 'Importação', icone: DownloadSimple, cor: '#f59e0b' },
                      { id: 'exportacao' as const, rotulo: 'Exportação', icone: UploadSimple, cor: '#a78bfa' },
                    ]).map((opcao) => {
                      const ativo = filtros.operacoes.has(opcao.id)
                      const Icone = opcao.icone
                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          className={`pds-filtros-operacao-card pds-filtros-operacao-card--${opcao.id}${ativo ? ' is-active' : ''}`}
                          onClick={() => {
                            setFiltros((prev) => ({
                              ...prev,
                              operacoes: alternarSet(prev.operacoes, opcao.id),
                            }))
                            marcarInteracao('operacao')
                          }}
                        >
                          <Icone size={18} weight="duotone" color={opcao.cor} />
                          {opcao.rotulo}
                          {ativo ? <Check size={12} weight="bold" color={opcao.cor} /> : null}
                        </button>
                      )
                    })}
                  </div>
                </SecaoAcordeao>

                <SecaoAcordeao
                  id="origem"
                  rotulo="02 Origem"
                  aberta={secaoAberta === 'origem'}
                  emFoco={affordanceCampo === 'origem'}
                  onToggle={() => abrirSecao('origem')}
                >
                  <div className="pds-filtros-lista">
                    {OPCOES_ORIGEM_FILTRO_MAPA.map((opcao) => {
                      const ativo = filtros.origens.has(opcao.codigo)
                      return (
                        <button
                          key={opcao.codigo}
                          type="button"
                          className={`pds-filtros-item${ativo ? ' is-active' : ''}`}
                          onClick={() => {
                            setFiltros((prev) => ({
                              ...prev,
                              origens: alternarSet(prev.origens, opcao.codigo),
                            }))
                            marcarInteracao('origem')
                          }}
                        >
                          <span className="pds-filtros-item__esquerda">
                            <span>{opcao.flag}</span>
                            <span>{opcao.rotulo}</span>
                          </span>
                          {ativo ? <Check size={12} weight="bold" color="#818cf8" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </SecaoAcordeao>

                <SecaoAcordeao
                  id="destino"
                  rotulo="03 Destino"
                  aberta={secaoAberta === 'destino'}
                  emFoco={affordanceCampo === 'destino'}
                  onToggle={() => abrirSecao('destino')}
                >
                  <div className="pds-filtros-lista">
                    {OPCOES_DESTINO_FILTRO_MAPA.map((opcao) => {
                      const ativo = filtros.destinos.has(opcao.codigo)
                      return (
                        <button
                          key={opcao.codigo}
                          type="button"
                          className={`pds-filtros-item${ativo ? ' is-active' : ''}`}
                          onClick={() => {
                            setFiltros((prev) => ({
                              ...prev,
                              destinos: alternarSet(prev.destinos, opcao.codigo),
                            }))
                            marcarInteracao('destino')
                          }}
                        >
                          <span className="pds-filtros-item__esquerda">
                            <span>{opcao.flag}</span>
                            <span>{opcao.rotulo}</span>
                          </span>
                          {ativo ? <Check size={12} weight="bold" color="#818cf8" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </SecaoAcordeao>

                <SecaoAcordeao
                  id="exportador"
                  rotulo="04 Exportador"
                  aberta={secaoAberta === 'exportador'}
                  emFoco={affordanceCampo === 'exportador'}
                  onToggle={() => abrirSecao('exportador')}
                >
                  <div className="pds-filtros-lista">
                    {OPCOES_EXPORTADOR_FILTRO_MAPA.map((nome) => {
                      const ativo = filtros.exportadores.has(nome)
                      return (
                        <button
                          key={nome}
                          type="button"
                          className={`pds-filtros-item${ativo ? ' is-active' : ''}`}
                          onClick={() => {
                            setFiltros((prev) => ({
                              ...prev,
                              exportadores: alternarSet(prev.exportadores, nome),
                            }))
                            marcarInteracao('exportador')
                          }}
                        >
                          <span className="pds-filtros-item__esquerda">
                            <ArrowsDownUp size={14} weight="duotone" color="#34d399" />
                            <span>{nome}</span>
                          </span>
                          {ativo ? <Check size={12} weight="bold" color="#818cf8" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </SecaoAcordeao>

                <SecaoAcordeao
                  id="importador"
                  rotulo="05 Importador"
                  aberta={secaoAberta === 'importador'}
                  emFoco={affordanceCampo === 'importador'}
                  onToggle={() => abrirSecao('importador')}
                >
                  <div className="pds-filtros-lista">
                    {OPCOES_IMPORTADOR_FILTRO_MAPA.map((nome) => {
                      const ativo = filtros.importadores.has(nome)
                      return (
                        <button
                          key={nome}
                          type="button"
                          className={`pds-filtros-item${ativo ? ' is-active' : ''}`}
                          onClick={() => {
                            setFiltros((prev) => ({
                              ...prev,
                              importadores: alternarSet(prev.importadores, nome),
                            }))
                            marcarInteracao('importador')
                          }}
                        >
                          <span className="pds-filtros-item__esquerda">
                            <span>{nome}</span>
                          </span>
                          {ativo ? <Check size={12} weight="bold" color="#818cf8" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </SecaoAcordeao>

                <SecaoAcordeao
                  id="status"
                  rotulo="06 Status"
                  aberta={secaoAberta === 'status'}
                  emFoco={affordanceCampo === 'status'}
                  onToggle={() => abrirSecao('status')}
                >
                  <div className="pds-filtros-lista">
                    {OPCOES_STATUS_FILTRO_MAPA.map((opcao) => {
                      const ativo = filtros.statuses.has(opcao.id)
                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          className={`pds-filtros-item${ativo ? ' is-active' : ''}`}
                          onClick={() => {
                            setFiltros((prev) => ({
                              ...prev,
                              statuses: alternarSet(prev.statuses, opcao.id as StatusPedidoFiltroMapa),
                            }))
                            marcarInteracao('status')
                          }}
                        >
                          <span className="pds-filtros-item__esquerda">
                            <span
                              className="pds-filtros-status-dot"
                              style={{ backgroundColor: opcao.cor }}
                            />
                            <span>{opcao.rotulo}</span>
                          </span>
                          {ativo ? <Check size={12} weight="bold" color="#818cf8" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </SecaoAcordeao>
              </div>
            </aside>

            <div className="pds-filtros-mapa-canvas">
              <MapaGloboSimuladorPedido
                mapaEscopoOverride={{
                  pins: mapaFiltrado.pins,
                  rotas: mapaFiltrado.rotas,
                }}
              />
            </div>
          </div>
        </div>

        <ManualBidFreteGuiaAoVivo
          campos={CAMPOS_FILTROS_MAPA_PEDIDO}
          selecoes={selecoesGuia}
          campoAtivo={campoGuiaAtivo}
          textoContextual={explicacao}
          onSelecionarCampo={(id) => {
            setFoco((prev) => (prev === id ? null : id))
            setSecaoAberta(id)
          }}
          conviteInterativo={demoConviteAtiva}
        />
      </div>
    </div>
  )
}
