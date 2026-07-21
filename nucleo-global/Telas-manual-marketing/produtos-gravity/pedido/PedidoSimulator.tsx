import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ChartPieSlice,
  ClockCounterClockwise,
  Gear,
  GlobeHemisphereWest,
  GraduationCap,
  Info,
  Kanban,
  ListBullets,
  MagnifyingGlass,
  SquaresFour,
  X,
} from '@phosphor-icons/react'
import { getProdutoMeta } from '../../../Logo/produtos/src/LogoProdutoGlobal'
import { LogoPedido } from '../../../Logo/produtos/src/logos/LogoPedido'
import { MenuLateralGlobal } from '../../../Layout/menu-lateral-global/src/MenuLateralGlobal'
import { PERFIS_EMPRESA_SIMULADOR } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { InsightsSimuladorPedido } from './insights-simulador-pedido'
import { KanbanSimuladorPedido } from './kanban-simulador-pedido'
import { ListaSimuladorPedido } from './lista-simulador-pedido'
import { DashboardSimuladorPedido } from './dashboard-simulador-pedido'
import { instalarMockApiNcmSimuladorPedido } from './instalar-mock-api-ncm-simulador-pedido'
import { resolverEscopoWorkspacesPedidoSimulador } from './pedido-escopo-workspaces-simulador'
import { NAV_ITENS_SIMULADOR_PEDIDO } from './pedido-nav-simulador-marketing'
import { TutorialOpcionalSimuladorSmartDoc } from '../smart-doc/tutorial-opcional-simulador-smart-doc'
import { useEfeitoDestaqueTutorialSimulador } from '../smart-doc/efeito-destaque-tutorial-simulador-smart-doc'
import {
  ESTADO_TUTORIAL_DASHBOARD_PEDIDO_INICIAL,
  ESTADO_TUTORIAL_KANBAN_PEDIDO_INICIAL,
  ESTADO_TUTORIAL_LISTA_PEDIDO_INICIAL,
  ESTADO_TUTORIAL_CONFIG_PEDIDO_INICIAL,
  TELAS_TUTORIAL_OPCIONAL_PEDIDO,
  resolverIdTelaShellSimuladorPedido,
  resolverPosicaoPreferencialTutorialPedido,
  type EstadoTutorialConfigPedido,
  type EstadoTutorialDashboardPedido,
  type EstadoTutorialKanbanPedido,
  type EstadoTutorialListaPedido,
} from './dados-tutorial-opcional-simulador-pedido'
import './pedido-simulator.css'
import { ConfiguracoesSimuladorPedido } from './configuracoes-simulador-pedido'
import { ConfigSimuladorPedidoProvider } from './estado-config-simulador-pedido'
import { HistoricoSimuladorPedido } from './historico-simulador-pedido'
import { TooltipGlobal } from '@nucleo/tooltip-global'

type BotaoTopoDemoDesativadoProps = {
  tituloTooltip: string
  descricaoTooltip: string
  className: string
  ariaLabel: string
  dataTutorialAlvo?: string
  children: ReactNode
}

function BotaoTopoDemoDesativado({
  tituloTooltip,
  descricaoTooltip,
  className,
  ariaLabel,
  dataTutorialAlvo,
  children,
}: BotaoTopoDemoDesativadoProps) {
  return (
    <TooltipGlobal titulo={tituloTooltip} descricao={descricaoTooltip} posicaoPreferida="bottom">
      <span className="pds-shell-acao-demo-wrap">
        <button
          type="button"
          className={`${className} pds-shell-acao-demo-desativada`}
          aria-label={ariaLabel}
          disabled
          {...(dataTutorialAlvo ? { 'data-sds-tutorial-alvo': dataTutorialAlvo } : {})}
        >
          {children}
        </button>
      </span>
    </TooltipGlobal>
  )
}

type AbaVisualizacao = 'insights' | 'lista' | 'dashboard' | 'kanban'

const EMPRESAS = Object.values(PERFIS_EMPRESA_SIMULADOR)
type IdEmpresa = (typeof EMPRESAS)[number]['id']

const PEDIDO_META = getProdutoMeta('pedido')

function abaFromPath(pathname: string): AbaVisualizacao {
  if (pathname.includes('/lista')) return 'lista'
  if (pathname.includes('/dashboard')) return 'dashboard'
  if (pathname.includes('/kanban')) return 'kanban'
  return 'insights'
}

function pathFromAba(aba: AbaVisualizacao): string {
  switch (aba) {
    case 'lista':
      return '/pedido/pedidos/lista'
    case 'dashboard':
      return '/pedido/pedidos/dashboard'
    case 'kanban':
      return '/pedido/pedidos/kanban'
    default:
      return '/pedido/pedidos/visao-geral'
  }
}

const ALVO_ABA_TUTORIAL: Record<AbaVisualizacao, string> = {
  insights: 'pedido-shell-aba-insights',
  lista: 'pedido-shell-aba-lista',
  dashboard: 'pedido-shell-aba-dashboard',
  kanban: 'pedido-shell-aba-kanban',
}

function PedidoSimulatorInner({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  const [rotaSimulada, setRotaSimulada] = useState('/pedido/pedidos/lista')
  const [idsEmpresasEscopo, setIdsEmpresasEscopo] = useState<IdEmpresa[]>(() =>
    EMPRESAS.map((empresa) => empresa.id),
  )
  const [menuLateralContraida, setMenuLateralContraida] = useState(true)
  const [sinalAbrirMenuWorkspaces, setSinalAbrirMenuWorkspaces] = useState(0)
  const [pedidoFocoLista, setPedidoFocoLista] = useState<string | null>(null)
  const [colunaFocoLista, setColunaFocoLista] = useState<string | null>(null)
  const [estadoTutorialLista, setEstadoTutorialLista] = useState<EstadoTutorialListaPedido>(
    () => ({ ...ESTADO_TUTORIAL_LISTA_PEDIDO_INICIAL }),
  )
  const [estadoTutorialDashboard, setEstadoTutorialDashboard] = useState<EstadoTutorialDashboardPedido>(
    () => ({ ...ESTADO_TUTORIAL_DASHBOARD_PEDIDO_INICIAL }),
  )
  const [estadoTutorialKanban, setEstadoTutorialKanban] = useState<EstadoTutorialKanbanPedido>(
    () => ({ ...ESTADO_TUTORIAL_KANBAN_PEDIDO_INICIAL }),
  )
  const [estadoTutorialConfig, setEstadoTutorialConfig] = useState<EstadoTutorialConfigPedido>(
    () => ({ ...ESTADO_TUTORIAL_CONFIG_PEDIDO_INICIAL }),
  )
  const [configAcessoDeKanban, setConfigAcessoDeKanban] = useState(false)
  const [alvoTutorialDestacado, setAlvoTutorialDestacado] = useState<string | null>(null)
  const refRaizTutorial = useRef<HTMLDivElement>(null)

  useEfeitoDestaqueTutorialSimulador(alvoTutorialDestacado, refRaizTutorial)

  useEffect(() => instalarMockApiNcmSimuladorPedido(), [])

  const empresasSelecionadas = useMemo(
    () => EMPRESAS.filter((empresa) => idsEmpresasEscopo.includes(empresa.id)),
    [idsEmpresasEscopo],
  )

  const escopoWorkspaces = useMemo(
    () => resolverEscopoWorkspacesPedidoSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )

  const workspaces = useMemo(
    () => EMPRESAS.map((empresa) => ({ id: empresa.id, name: empresa.nome, plan: empresa.plano })),
    [],
  )

  const abaAtiva = abaFromPath(rotaSimulada)
  const isConfiguracoes = rotaSimulada === '/pedido/configuracoes'
  const isHistorico = rotaSimulada === '/pedido/historico'
  const isPedidosView = rotaSimulada.startsWith('/pedido/pedidos')

  const idTelaTutorial = resolverIdTelaShellSimuladorPedido({
    abaAtiva,
    isConfiguracoes,
    isHistorico,
    configAcessoDeKanban,
    ...estadoTutorialLista,
    ...estadoTutorialDashboard,
    ...estadoTutorialKanban,
    ...estadoTutorialConfig,
  })
  const posicaoTutorial = resolverPosicaoPreferencialTutorialPedido(idTelaTutorial)

  const tituloPagina = useMemo(() => {
    if (isHistorico) return 'Histórico'
    if (isConfiguracoes) return 'Configurações'
    if (abaAtiva === 'insights') return 'Insights'
    if (abaAtiva === 'lista') return 'Lista'
    if (abaAtiva === 'dashboard') return 'Dashboard'
    return 'Kanban'
  }, [abaAtiva, isConfiguracoes, isHistorico])

  const iconePagina = useMemo(() => {
    if (isHistorico) return <ClockCounterClockwise size={22} weight="duotone" />
    if (isConfiguracoes) return <Gear size={22} weight="duotone" />
    if (abaAtiva === 'insights') return <ChartPieSlice size={22} weight="duotone" />
    if (abaAtiva === 'lista') return <ListBullets size={22} weight="duotone" />
    if (abaAtiva === 'dashboard') return <SquaresFour size={22} weight="duotone" />
    return <Kanban size={22} weight="duotone" />
  }, [abaAtiva, isConfiguracoes, isHistorico])

  function alternarEmpresaEscopo(id: IdEmpresa) {
    setIdsEmpresasEscopo((atual) => {
      if (atual.includes(id)) {
        if (atual.length === 1) return atual
        return atual.filter((item) => item !== id)
      }
      return [...atual, id]
    })
  }

  function onNavegarDemonstracao(to: string) {
    if (to.includes('/pedido/configuracoes')) {
      setConfigAcessoDeKanban(abaAtiva === 'kanban')
    } else if (!to.includes('/pedido/configuracoes')) {
      setConfigAcessoDeKanban(false)
    }
    setRotaSimulada(to)
  }

  return (
    <div className="pds-shell-wrap">
      {onFecharSimulador && (
        <button
          type="button"
          className="interactive-simulator-close"
          aria-label="Fechar demonstração"
          title="Fechar"
          data-sds-tutorial-alvo="pedido-shell-fechar-demo"
          onClick={(e) => {
            e.stopPropagation()
            onFecharSimulador()
          }}
        >
          <X size={20} weight="bold" />
        </button>
      )}

      <div className="sds-root pds-root" ref={refRaizTutorial} onClick={(e) => e.stopPropagation()}>
        <div data-sds-tutorial-alvo="pedido-shell-nav-lateral">
        <MenuLateralGlobal
          moduleName="Pedido"
          moduleColor={PEDIDO_META.color}
          moduleIcon={<LogoPedido size={26} />}
          tenantName={escopoWorkspaces.tenantName}
          tenantPlan={escopoWorkspaces.tenantPlan}
          navItems={NAV_ITENS_SIMULADOR_PEDIDO}
          workspaces={workspaces}
          modoWorkspace="multiplo"
          workspacesEscopoIds={idsEmpresasEscopo}
          onAlternarWorkspaceEscopo={(id) => alternarEmpresaEscopo(id as IdEmpresa)}
          onDefinirEscopoWorkspaces={(ids) => setIdsEmpresasEscopo(ids as IdEmpresa[])}
          sinalAbrirMenuWorkspaces={sinalAbrirMenuWorkspaces}
          dropdownSearchPlaceholder="Buscar workspace…"
          dropdownCreateLabel="Criar workspace"
          dropdownManageLabel="Gerenciar workspace"
          isCollapsed={menuLateralContraida}
          onToggleCollapse={() => setMenuLateralContraida((v) => !v)}
          modoDemonstracao
          rotaAtivaDemonstracao={rotaSimulada}
          onNavegarDemonstracao={onNavegarDemonstracao}
          dataTutorialAlvoWorkspace="pedido-insights-seletor-workspace"
        />
        </div>

        <div className="sds-main">
          <div className="sds-main-header">
            <header className="sds-mtg-header" role="banner">
              <div className="sds-mtg-left">
                <div className="sds-mtg-page-header">
                  <span className="sds-mtg-page-icon" aria-hidden="true">
                    {iconePagina}
                  </span>
                  <div className="pds-mtg-titulo-grupo">
                    <span className="sds-mtg-page-title pds-mtg-page-title--solo">{tituloPagina}</span>
                    {isHistorico ? (
                      <span className="pds-mtg-page-subtitulo">
                        Registro de alterações na organização e workspaces
                      </span>
                    ) : abaAtiva === 'dashboard' ? (
                      <span className="pds-mtg-page-subtitulo">KPIs e widgets configuráveis</span>
                    ) : abaAtiva === 'kanban' ? (
                      <span className="pds-mtg-page-subtitulo">Pedidos organizados por status</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="sds-mtg-right">
                <BotaoTopoDemoDesativado
                  className="sds-mtg-nav-btn"
                  ariaLabel="Hub (preview — indisponível na demonstração)"
                  tituloTooltip="Hub"
                  descricaoTooltip="Volta ao hub central de módulos e workspaces — recurso do tenant completo"
                  dataTutorialAlvo="pedido-shell-hub-demo"
                >
                  <GlobeHemisphereWest size={12} weight="duotone" />
                  Hub
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Buscar na tela (preview — indisponível na demonstração)"
                  tituloTooltip="Buscar na tela"
                  descricaoTooltip="Localiza pedidos, campos e ações na visualização atual do produto"
                >
                  <MagnifyingGlass size={15} />
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Gravity University (preview — indisponível na demonstração)"
                  tituloTooltip="Gravity University"
                  descricaoTooltip="Tutoriais e manuais do Pedido no contexto da tela em que você está"
                >
                  <GraduationCap size={15} weight="duotone" />
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Dicas (preview — indisponível na demonstração)"
                  tituloTooltip="Dicas do produto"
                  descricaoTooltip="Orientações contextuais da Gabi e atalhos do módulo no tenant completo"
                >
                  <Info size={15} weight="fill" style={{ color: PEDIDO_META.color }} />
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-lang-btn"
                  ariaLabel="Idioma (preview — indisponível na demonstração)"
                  tituloTooltip="Idioma"
                  descricaoTooltip="Alterna português, inglês e espanhol em toda a interface do Gravity"
                >
                  BR
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Configurações do topo (preview — indisponível na demonstração)"
                  tituloTooltip="Configurações rápidas"
                  descricaoTooltip="Atalho às preferências do Pedido — nesta demo use o menu lateral"
                  dataTutorialAlvo="pedido-kanban-config-topo"
                >
                  <Gear size={15} weight="duotone" />
                </BotaoTopoDemoDesativado>
                <div className="sds-mtg-sep" aria-hidden="true" />
                <div className="sds-mtg-avatar" aria-hidden="true">
                  D
                </div>
              </div>
            </header>

            {(isPedidosView || isConfiguracoes || isHistorico) && (
              <div className="smart-read-vis-toolbar">
                <nav
                  className="srt-tabs"
                  aria-label="Modo de visualização do Pedido"
                  role="tablist"
                  data-sds-tutorial-alvo="pedido-shell-abas"
                >
                  {(
                    [
                      { aba: 'insights' as const, label: 'Insights', icon: ChartPieSlice },
                      { aba: 'lista' as const, label: 'Lista', icon: ListBullets },
                      { aba: 'dashboard' as const, label: 'Dashboard', icon: SquaresFour },
                      { aba: 'kanban' as const, label: 'Kanban', icon: Kanban },
                    ] as const
                  ).map(({ aba, label, icon: Icone }) => (
                    <button
                      key={aba}
                      type="button"
                      role="tab"
                      aria-selected={!isHistorico && abaAtiva === aba}
                      className={`srt-tab${!isHistorico && abaAtiva === aba ? ' srt-tab--active' : ''}`}
                      data-sds-tutorial-alvo={ALVO_ABA_TUTORIAL[aba]}
                      onClick={() => {
                        if (isConfiguracoes) {
                          setConfigAcessoDeKanban(false)
                        }
                        setRotaSimulada(pathFromAba(aba))
                      }}
                    >
                      <Icone weight="duotone" size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>

          <div className="sds-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {isHistorico ? (
              <HistoricoSimuladorPedido />
            ) : isConfiguracoes ? (
              <ConfiguracoesSimuladorPedido
                onEstadoTutorialChange={setEstadoTutorialConfig}
                onIrParaColunaLista={(colunaId) => {
                  setColunaFocoLista(colunaId)
                  setConfigAcessoDeKanban(false)
                  setRotaSimulada('/pedido/pedidos/lista')
                }}
              />
            ) : abaAtiva === 'insights' ? (
              <InsightsSimuladorPedido empresasSelecionadas={empresasSelecionadas} />
            ) : abaAtiva === 'lista' ? (
              <ListaSimuladorPedido
                empresasSelecionadas={empresasSelecionadas}
                numeroPedidoFoco={pedidoFocoLista}
                colunaIdFoco={colunaFocoLista}
                onConsumirFocoLista={() => setPedidoFocoLista(null)}
                onConsumirFocoColuna={() => setColunaFocoLista(null)}
                onAbrirMenuWorkspaces={() => {
                  setMenuLateralContraida(false)
                  setSinalAbrirMenuWorkspaces((n) => n + 1)
                }}
                onEstadoTutorialChange={setEstadoTutorialLista}
              />
            ) : abaAtiva === 'dashboard' ? (
              <DashboardSimuladorPedido
                empresasSelecionadas={empresasSelecionadas}
                onEstadoTutorialChange={setEstadoTutorialDashboard}
              />
            ) : (
              <KanbanSimuladorPedido
                empresasSelecionadas={empresasSelecionadas}
                onAbrirPedidoCompleto={(numeroPedido) => {
                  setPedidoFocoLista(numeroPedido)
                  setRotaSimulada('/pedido/pedidos/lista')
                }}
                onEstadoTutorialChange={setEstadoTutorialKanban}
              />
            )}
          </div>
        </div>

        {idTelaTutorial && (
          <TutorialOpcionalSimuladorSmartDoc
            idTela={idTelaTutorial}
            telas={TELAS_TUTORIAL_OPCIONAL_PEDIDO}
            habilitado
            posicaoFixa
            classeHost="pds-tutorial-guia-pedido"
            refAncoraSimulador={refRaizTutorial}
            posicaoPreferencial={posicaoTutorial}
            onAlvoDestacadoChange={setAlvoTutorialDestacado}
          />
        )}
      </div>
    </div>
  )
}

export function PedidoSimulator({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  return (
    <ConfigSimuladorPedidoProvider>
      <PedidoSimulatorInner onFecharSimulador={onFecharSimulador} />
    </ConfigSimuladorPedidoProvider>
  )
}
