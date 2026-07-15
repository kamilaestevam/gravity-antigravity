import { useEffect, useMemo, useState } from 'react'
import {
  ChartPieSlice,
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
import { instalarMockApiNcmSimuladorPedido } from './instalar-mock-api-ncm-simulador-pedido'
import { resolverEscopoWorkspacesPedidoSimulador } from './pedido-escopo-workspaces-simulador'
import { NAV_ITENS_SIMULADOR_PEDIDO } from './pedido-nav-simulador-marketing'
import './pedido-simulator.css'

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

function PedidoSimulatorInner({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  const [rotaSimulada, setRotaSimulada] = useState('/pedido/pedidos/lista')
  const [idsEmpresasEscopo, setIdsEmpresasEscopo] = useState<IdEmpresa[]>(() =>
    EMPRESAS.map((empresa) => empresa.id),
  )
  const [menuLateralContraida, setMenuLateralContraida] = useState(true)
  const [sinalAbrirMenuWorkspaces, setSinalAbrirMenuWorkspaces] = useState(0)

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
  const isPedidosView = rotaSimulada.startsWith('/pedido/pedidos')

  const tituloPagina = useMemo(() => {
    if (isConfiguracoes) return 'Configurações'
    if (abaAtiva === 'insights') return 'Insights'
    if (abaAtiva === 'lista') return 'Lista'
    if (abaAtiva === 'dashboard') return 'Dashboard'
    return 'Kanban'
  }, [abaAtiva, isConfiguracoes])

  const iconePagina = useMemo(() => {
    if (isConfiguracoes) return <Gear size={22} weight="duotone" />
    if (abaAtiva === 'insights') return <ChartPieSlice size={22} weight="duotone" />
    if (abaAtiva === 'lista') return <ListBullets size={22} weight="duotone" />
    if (abaAtiva === 'dashboard') return <SquaresFour size={22} weight="duotone" />
    return <Kanban size={22} weight="duotone" />
  }, [abaAtiva, isConfiguracoes])

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
    if (to.includes('historico-organizacao')) return
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
          onClick={(e) => {
            e.stopPropagation()
            onFecharSimulador()
          }}
        >
          <X size={20} weight="bold" />
        </button>
      )}

      <div className="sds-root pds-root" onClick={(e) => e.stopPropagation()}>
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
        />

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
                  </div>
                </div>
              </div>
              <div className="sds-mtg-right">
                <button type="button" className="sds-mtg-nav-btn" aria-label="Voltar ao Hub">
                  <GlobeHemisphereWest size={12} weight="duotone" />
                  Hub
                </button>
                <button type="button" className="sds-mtg-icon-btn" aria-label="Buscar na tela">
                  <MagnifyingGlass size={15} />
                </button>
                <button type="button" className="sds-mtg-icon-btn" aria-label="Gravity University">
                  <GraduationCap size={15} weight="duotone" />
                </button>
                <button type="button" className="sds-mtg-icon-btn" aria-label="Dicas" style={{ color: PEDIDO_META.color }}>
                  <Info size={15} weight="fill" />
                </button>
                <button type="button" className="sds-mtg-lang-btn" aria-label="Idioma">
                  BR
                </button>
                <button type="button" className="sds-mtg-icon-btn" aria-label="Configurações">
                  <Gear size={15} weight="duotone" />
                </button>
                <div className="sds-mtg-sep" aria-hidden="true" />
                <div className="sds-mtg-avatar" aria-hidden="true">
                  D
                </div>
              </div>
            </header>

            {isPedidosView && (
              <div className="smart-read-vis-toolbar">
                <nav className="srt-tabs" aria-label="Modo de visualização do Pedido" role="tablist">
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
                      aria-selected={abaAtiva === aba}
                      className={`srt-tab${abaAtiva === aba ? ' srt-tab--active' : ''}`}
                      onClick={() => setRotaSimulada(pathFromAba(aba))}
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
            {isConfiguracoes ? (
              <div className="pds-banner-config">
                Configurações — etapas do pipeline e colunas da lista (simulação).
              </div>
            ) : abaAtiva === 'insights' ? (
              <InsightsSimuladorPedido empresasSelecionadas={empresasSelecionadas} />
            ) : abaAtiva === 'lista' ? (
              <ListaSimuladorPedido
                empresasSelecionadas={empresasSelecionadas}
                onAbrirMenuWorkspaces={() => {
                  setMenuLateralContraida(false)
                  setSinalAbrirMenuWorkspaces((n) => n + 1)
                }}
              />
            ) : abaAtiva === 'dashboard' ? (
              <div className="pds-banner-config">
                Dashboard operacional — visão em tempo real (simulação).
              </div>
            ) : (
              <KanbanSimuladorPedido />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PedidoSimulator({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  return <PedidoSimulatorInner onFecharSimulador={onFecharSimulador} />
}
