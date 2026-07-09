import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Package,
  Truck,
  CurrencyDollar,
  FileText,
  Sparkle,
  Files,
  MagnifyingGlass,
  Plus,
  ArrowRight,
  CheckCircle,
  X,
  Check,
  Square,
  CheckSquare,
  Gear,
  CaretDown,
  CaretUp,
  Buildings,
  UserCircle,
  EnvelopeSimple,
  WhatsappLogo,
  GlobeHemisphereWest,
  GraduationCap,
  Info,
  ListBullets,
  Kanban,
  ChartPieSlice,
  SquaresFour,
  ClockCounterClockwise,
  SidebarSimple,
} from '@phosphor-icons/react'
import {
  PERFIS_EMPRESA_SIMULADOR,
  resolverRotuloEscopoEmpresasSimulador,
} from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { InsightsSimuladorPedido } from './insights-simulador-pedido'
import { KanbanSimuladorPedido } from './kanban-simulador-pedido'
import { ListaSimuladorPedido } from './lista-simulador-pedido'
import { instalarMockApiNcmSimuladorPedido } from './instalar-mock-api-ncm-simulador-pedido'
import './pedido-simulator.css'

type AbaVisualizacao = 'insights' | 'lista' | 'dashboard' | 'kanban'

const PRODUTOS_DROPDOWN = [
  { name: 'Pedido', icon: <Package size={14} weight="duotone" style={{ color: '#818cf8' }} />, selected: true },
  { name: 'Bid Frete Internacional', icon: <Truck size={14} weight="duotone" style={{ color: '#2563eb' }} /> },
  { name: 'Bid Cambio', icon: <CurrencyDollar size={14} weight="duotone" style={{ color: '#0d9488' }} /> },
  { name: 'NF Import', icon: <FileText size={14} weight="duotone" style={{ color: '#7c3aed' }} /> },
  { name: 'Smart Docs', icon: <Sparkle size={14} weight="fill" style={{ color: '#818cf8' }} /> },
  { name: 'Processos', icon: <Files size={14} weight="duotone" style={{ color: '#eab308' }} />, subtitle: 'Visão unificada dos Prod...' },
]

const EMPRESAS = Object.values(PERFIS_EMPRESA_SIMULADOR)
type IdEmpresa = (typeof EMPRESAS)[number]['id']

const MEU_ESPACO_ITENS = [
  { id: 'atividades', label: 'Minhas Atividades', icon: <CheckCircle size={14} weight="duotone" /> },
  { id: 'email', label: 'Email', icon: <EnvelopeSimple size={14} weight="duotone" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsappLogo size={14} weight="duotone" /> },
] as const

export function PedidoSimulator({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  const [abaAtiva, setAbaAtiva] = useState<AbaVisualizacao>('insights')
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [empresaDropdownOpen, setEmpresaDropdownOpen] = useState(false)
  const [empresaSearch, setEmpresaSearch] = useState('')
  const [idsEmpresasEscopo, setIdsEmpresasEscopo] = useState<IdEmpresa[]>(() =>
    EMPRESAS.map((empresa) => empresa.id),
  )
  const [meuEspacoAberto, setMeuEspacoAberto] = useState(false)
  const [meuEspacoItemAtivo, setMeuEspacoItemAtivo] = useState<string | null>(null)
  const [sidebarAtivo, setSidebarAtivo] = useState<'historico' | 'config'>('historico')
  const [menuLateralContraida, setMenuLateralContraida] = useState(false)

  const prodDropdownRef = useRef<HTMLDivElement>(null)
  const empresaDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => instalarMockApiNcmSimuladorPedido(), [])

  const produtosFiltrados = useMemo(
    () =>
      PRODUTOS_DROPDOWN.filter((prod) =>
        prod.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [searchQuery],
  )

  const empresasFiltradas = useMemo(
    () =>
      EMPRESAS.filter((empresa) =>
        empresa.nome.toLowerCase().includes(empresaSearch.trim().toLowerCase()),
      ),
    [empresaSearch],
  )

  const empresasSelecionadas = useMemo(
    () => EMPRESAS.filter((empresa) => idsEmpresasEscopo.includes(empresa.id)),
    [idsEmpresasEscopo],
  )

  const rotuloEmpresaEscopo = useMemo(
    () => resolverRotuloEscopoEmpresasSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )

  const tituloPagina = useMemo(() => {
    if (abaAtiva === 'insights') return 'Insights'
    if (abaAtiva === 'lista') return 'Lista'
    if (abaAtiva === 'dashboard') return 'Dashboard'
    return 'Kanban'
  }, [abaAtiva])

  const subtituloPagina = useMemo(() => {
    if (abaAtiva === 'insights') return 'Panorama dos pedidos — volume, status, valores e prazos'
    if (abaAtiva === 'lista') return 'Pedidos de importação e exportação em tabela virtual'
    if (abaAtiva === 'dashboard') return 'Indicadores operacionais em tempo real'
    return 'Pipeline visual por etapa do pedido'
  }, [abaAtiva])

  const iconePagina = useMemo(() => {
    if (abaAtiva === 'insights') return <ChartPieSlice size={22} weight="duotone" />
    if (abaAtiva === 'lista') return <ListBullets size={22} weight="duotone" />
    if (abaAtiva === 'dashboard') return <SquaresFour size={22} weight="duotone" />
    return <Kanban size={22} weight="duotone" />
  }, [abaAtiva])

  const todosFiltradosSelecionados =
    empresasFiltradas.length > 0 &&
    empresasFiltradas.every((empresa) => idsEmpresasEscopo.includes(empresa.id))

  function alternarMenuLateral() {
    setMenuLateralContraida((v) => !v)
    setProductDropdownOpen(false)
    setEmpresaDropdownOpen(false)
    setMeuEspacoAberto(false)
  }

  function alternarEmpresaEscopo(id: IdEmpresa) {
    setIdsEmpresasEscopo((atual) => {
      if (atual.includes(id)) {
        if (atual.length === 1) return atual
        return atual.filter((item) => item !== id)
      }
      return [...atual, id]
    })
  }

  function definirEscopoEmpresasFiltradas(selecionar: boolean) {
    const idsFiltrados = empresasFiltradas.map((empresa) => empresa.id)
    setIdsEmpresasEscopo((prev) => {
      if (selecionar) return [...new Set([...prev, ...idsFiltrados])]
      return prev.filter((id) => !idsFiltrados.includes(id))
    })
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (prodDropdownRef.current && !prodDropdownRef.current.contains(target)) {
        setProductDropdownOpen(false)
      }
      if (empresaDropdownRef.current && !empresaDropdownRef.current.contains(target)) {
        setEmpresaDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
        <aside className={`sds-sidebar${menuLateralContraida ? ' sds-sidebar--collapsed' : ''}`}>
          <button
            type="button"
            className="pds-sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation()
              alternarMenuLateral()
            }}
            aria-label={menuLateralContraida ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={menuLateralContraida ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            <SidebarSimple size={16} weight={menuLateralContraida ? 'duotone' : 'regular'} />
          </button>

          <div className="sds-brand-wrapper" ref={prodDropdownRef}>
            <div
              className={`sds-brand${productDropdownOpen ? ' sds-brand--open' : ''}${menuLateralContraida ? ' sds-brand--collapsed' : ''}`}
              onClick={() => {
                setEmpresaDropdownOpen(false)
                setProductDropdownOpen((v) => !v)
              }}
              title={menuLateralContraida ? 'Pedido by Gravity' : undefined}
            >
              <div className="pds-sidebar-brand-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={16} weight="duotone" style={{ color: '#818cf8', flexShrink: 0 }} />
                  <span className="pds-sidebar-hide-when-collapsed" style={{ fontWeight: 800, fontSize: 14 }}>Pedido</span>
                </div>
                <span className="pds-sidebar-hide-when-collapsed" style={{ fontSize: 10, color: '#64748b', marginLeft: 24 }}>by Gravity</span>
              </div>
              {!menuLateralContraida && (
                productDropdownOpen ? <CaretUp size={14} /> : <CaretDown size={14} style={{ color: '#64748b' }} />
              )}
            </div>

            {productDropdownOpen && (
              <div className="sds-dropdown" onClick={(e) => e.stopPropagation()}>
                <div style={{ position: 'relative' }}>
                  <MagnifyingGlass size={12} style={{ position: 'absolute', left: 8, top: 9, color: '#475569' }} />
                  <input
                    type="text"
                    className="sds-dropdown__search"
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="sds-dropdown__list">
                  {produtosFiltrados.map((prod) => (
                    <div
                      key={prod.name}
                      className={`sds-dropdown__item${prod.selected ? ' sds-dropdown__item--selected' : ''}`}
                      onClick={() => {
                        if (prod.selected) setProductDropdownOpen(false)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {prod.icon}
                        <div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: prod.selected ? 700 : 600,
                              color: prod.selected ? '#a78bfa' : '#cbd5e1',
                            }}
                          >
                            {prod.name}
                          </span>
                          {prod.subtitle && (
                            <span style={{ display: 'block', fontSize: 9, color: '#64748b' }}>{prod.subtitle}</span>
                          )}
                        </div>
                      </div>
                      {prod.selected && <Check size={12} weight="bold" style={{ color: '#a78bfa', flexShrink: 0 }} />}
                      {!prod.selected && prod.subtitle && (
                        <ArrowRight size={12} style={{ color: '#64748b', flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sds-empresa-wrapper" ref={empresaDropdownRef}>
            <button
              type="button"
              className={`sds-empresa${empresaDropdownOpen ? ' sds-empresa--open' : ''}${menuLateralContraida ? ' sds-empresa--collapsed' : ''}`}
              aria-expanded={empresaDropdownOpen}
              aria-haspopup="listbox"
              title={menuLateralContraida ? rotuloEmpresaEscopo.nome : undefined}
              onClick={() => {
                setEmpresaDropdownOpen((v) => !v)
                setProductDropdownOpen(false)
              }}
            >
              <div className="sds-empresa__avatar">
                {empresasSelecionadas.length === 1 ? (
                  <span>{rotuloEmpresaEscopo.avatarLetra}</span>
                ) : (
                  <Buildings size={14} weight="duotone" />
                )}
              </div>
              <div className="sds-empresa__info pds-sidebar-hide-when-collapsed">
                <span className="sds-empresa__nome">{rotuloEmpresaEscopo.nome}</span>
                <span className="sds-empresa__plano">{rotuloEmpresaEscopo.plano}</span>
              </div>
              {!menuLateralContraida && (
                empresaDropdownOpen ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
              )}
            </button>

            {empresaDropdownOpen && (
              <div className="sds-empresa-dropdown" role="listbox" onClick={(e) => e.stopPropagation()}>
                <div className="sds-empresa-dropdown__search-wrap">
                  <MagnifyingGlass size={12} />
                  <input
                    type="text"
                    className="sds-empresa-dropdown__search"
                    placeholder="Buscar empresa…"
                    value={empresaSearch}
                    onChange={(e) => setEmpresaSearch(e.target.value)}
                  />
                </div>
                {empresasFiltradas.length > 1 && (
                  <div className="sds-empresa-dropdown__toolbar">
                    <button
                      type="button"
                      className="sds-empresa-dropdown__toolbar-btn"
                      onClick={() => definirEscopoEmpresasFiltradas(!todosFiltradosSelecionados)}
                    >
                      {todosFiltradosSelecionados ? 'Desmarcar tudo' : 'Selecionar tudo'}
                    </button>
                  </div>
                )}
                <div className="sds-empresa-dropdown__list">
                  {empresasFiltradas.map((empresa) => {
                    const selecionada = idsEmpresasEscopo.includes(empresa.id)
                    return (
                      <button
                        key={empresa.id}
                        type="button"
                        role="option"
                        aria-selected={selecionada}
                        className={`sds-empresa-item${selecionada ? ' sds-empresa-item--ativa' : ''}`}
                        onClick={() => alternarEmpresaEscopo(empresa.id)}
                      >
                        <span className="sds-empresa-item__check" aria-hidden>
                          {selecionada ? (
                            <CheckSquare size={16} weight="fill" style={{ color: '#818cf8' }} />
                          ) : (
                            <Square size={16} weight="regular" style={{ color: '#64748b' }} />
                          )}
                        </span>
                        <div className="sds-empresa-item__avatar">{empresa.nome.charAt(0)}</div>
                        <div className="sds-empresa-item__info">
                          <span className="sds-empresa-item__nome">{empresa.nome}</span>
                          <span className="sds-empresa-item__plano">{empresa.plano}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="sds-empresa-dropdown__footer">
                  <button type="button" className="sds-empresa-action">
                    <Plus size={12} weight="bold" />
                    Criar empresa
                  </button>
                  <button type="button" className="sds-empresa-action">
                    <Gear size={12} weight="duotone" />
                    Gerenciar empresas
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`sds-nav-group${meuEspacoAberto ? ' sds-nav-group--open' : ''}${menuLateralContraida ? ' sds-nav-group--collapsed' : ''}`}>
            <button
              type="button"
              className={`sds-nav-item sds-nav-parent${meuEspacoAberto ? ' sds-nav-item--active' : ''}`}
              title={menuLateralContraida ? 'Meu Espaço' : undefined}
              onClick={() => {
                if (menuLateralContraida) return
                setMeuEspacoAberto((v) => !v)
              }}
            >
              <UserCircle size={16} weight="duotone" />
              <span className="pds-sidebar-hide-when-collapsed" style={{ flex: 1 }}>Meu Espaço</span>
              {!menuLateralContraida && (
                meuEspacoAberto ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
              )}
            </button>
            {meuEspacoAberto && !menuLateralContraida && (
              <div className="sds-submenu">
                {MEU_ESPACO_ITENS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`sds-nav-item sds-submenu-item${meuEspacoItemAtivo === item.id ? ' sds-nav-item--active' : ''}`}
                    onClick={() => {
                      setMeuEspacoItemAtivo(item.id)
                      setSidebarAtivo('historico')
                    }}
                  >
                    {item.icon}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span className="sds-nav-badge">Em Breve</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pds-sidebar-nav-pedido">
            <span className="pds-sidebar-hide-when-collapsed pds-sidebar-section-label">PEDIDO</span>
            <button
              type="button"
              className={`sds-nav-item${sidebarAtivo === 'historico' ? ' sds-nav-item--active' : ''}`}
              title={menuLateralContraida ? 'Histórico' : undefined}
              onClick={() => {
                setSidebarAtivo('historico')
                setMeuEspacoItemAtivo(null)
              }}
            >
              <ClockCounterClockwise size={14} />
              <span className="pds-sidebar-hide-when-collapsed">Histórico</span>
            </button>
            <button
              type="button"
              className={`sds-nav-item${sidebarAtivo === 'config' ? ' sds-nav-item--active' : ''}`}
              title={menuLateralContraida ? 'Configurações' : undefined}
              onClick={() => {
                setSidebarAtivo('config')
                setMeuEspacoItemAtivo(null)
              }}
            >
              <Gear size={14} />
              <span className="pds-sidebar-hide-when-collapsed">Configurações</span>
            </button>
          </div>
        </aside>

        <div className="sds-main">
          <div className="sds-main-header">
            <header className="sds-mtg-header" role="banner">
              <div className="sds-mtg-left">
                <div className="sds-mtg-page-header">
                  <span className="sds-mtg-page-icon" aria-hidden="true">
                    {iconePagina}
                  </span>
                  <div className="pds-mtg-titulo-grupo">
                    <span className="sds-mtg-page-title">{tituloPagina}</span>
                    <span className="pds-mtg-subtitulo">{subtituloPagina}</span>
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
                <button type="button" className="sds-mtg-icon-btn" aria-label="Dicas" style={{ color: '#818cf8' }}>
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

            {sidebarAtivo === 'historico' && (
              <div className="smart-read-vis-toolbar">
                <nav className="srt-tabs" aria-label="Modo de visualização do Pedido" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === 'insights'}
                    className={`srt-tab${abaAtiva === 'insights' ? ' srt-tab--active' : ''}`}
                    onClick={() => setAbaAtiva('insights')}
                  >
                    <ChartPieSlice weight="duotone" size={14} />
                    <span>Insights</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === 'lista'}
                    className={`srt-tab${abaAtiva === 'lista' ? ' srt-tab--active' : ''}`}
                    onClick={() => setAbaAtiva('lista')}
                  >
                    <ListBullets weight="duotone" size={14} />
                    <span>Lista</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === 'dashboard'}
                    className={`srt-tab${abaAtiva === 'dashboard' ? ' srt-tab--active' : ''}`}
                    onClick={() => setAbaAtiva('dashboard')}
                  >
                    <SquaresFour weight="duotone" size={14} />
                    <span>Dashboard</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === 'kanban'}
                    className={`srt-tab${abaAtiva === 'kanban' ? ' srt-tab--active' : ''}`}
                    onClick={() => setAbaAtiva('kanban')}
                  >
                    <Kanban weight="duotone" size={14} />
                    <span>Kanban</span>
                  </button>
                </nav>
              </div>
            )}
          </div>

          <div className="sds-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {sidebarAtivo === 'config' ? (
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
                  setEmpresaDropdownOpen(true)
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
