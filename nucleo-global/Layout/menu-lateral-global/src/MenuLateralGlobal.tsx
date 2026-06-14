import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarSimple, CaretDown, Check, Plus, Gear, Square, CheckSquare, ArrowRight } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { LogoModoBadgeVisaoFornecedor } from './LogoModoBadgeVisaoFornecedor'
import './menu-lateral.css'

export type ModuleModoVariant = 'visao_fornecedor'

export interface WorkspaceItem {
  id: string
  name: string
  plan: string
}

export interface ProductSwitcherItem {
  slug: string
  name: string
  color: string
  icon: React.ReactNode
  /** 'produto' = troca de contexto (padrão); 'acao' = atalho/visão transversal (não é produto). */
  kind?: 'produto' | 'acao'
  /** Descrição curta exibida abaixo do nome (usada por itens 'acao'). */
  sublabel?: string
}

export interface NavItem {
  id?: string
  to?: string
  label: string
  icon: React.ReactNode
  children?: NavItem[]
  disabled?: boolean
  /** Texto de badge exibido à direita do label (ex: "Contratar", "Em Breve") */
  badge?: string
  /** Cor do badge — padrão: accent para "Contratar", muted para "Em Breve" */
  badgeVariant?: 'accent' | 'muted'
  /** Se presente, este item age como um divisor de seção com título (sem link/clique) */
  sectionDivider?: boolean
  /** Se true, o link abre em nova aba (target="_blank" + rel noopener). Use para links cross-aplicação (ex: produto -> Configurador). */
  external?: boolean
}

export interface MenuLateralGlobalProps {
  tenantName: string
  tenantPlan: string
  navItems: NavItem[]
  moduleName?: string
  /** Badge de modo no logo (ex.: visão fornecedor com ícones Eye + Handshake) */
  moduleModoVariant?: ModuleModoVariant
  /** Rótulo curto no badge (ex.: Fornecedor) */
  moduleModoBadgeLabel?: string
  /** Descrição completa para aria (ex.: Visão fornecedor) */
  moduleModoAriaLabel?: string
  /** Tooltip ao passar o mouse no badge */
  moduleModoTooltipTitulo?: string
  moduleModoTooltipDescricao?: string
  moduleColor?: string
  moduleIcon?: React.ReactNode
  /** Lista de workspaces disponíveis para troca */
  workspaces?: WorkspaceItem[]
  /** Callback ao selecionar outro workspace (modo `unico`) */
  onSwitchWorkspace?: (id: string) => void
  /** `multiplo` = checkboxes (escopo do produto); `unico` = troca de contexto com reload */
  modoWorkspace?: 'unico' | 'multiplo'
  /** IDs selecionados no modo multiplo */
  workspacesEscopoIds?: string[]
  /** Toggle de workspace no modo multiplo */
  onAlternarWorkspaceEscopo?: (id: string) => void
  /** Define escopo completo (ex.: selecionar tudo) */
  onDefinirEscopoWorkspaces?: (ids: string[]) => void
  /** Sinal externo para abrir o dropdown de workspaces (ex.: chip na Lista) */
  sinalAbrirMenuWorkspaces?: number
  /** Callback para criar novo workspace */
  onCreateWorkspace?: () => void
  /** Callback para ir às configurações do workspace */
  onManageWorkspace?: () => void
  /** Produtos acessíveis no workspace (seletor no topo, ao lado do logo) */
  produtos?: ProductSwitcherItem[]
  /** Slug do produto atualmente aberto */
  produtoAtualSlug?: string
  /** Troca de produto (navegação full page) */
  onSwitchProduct?: (slug: string) => void
  /** Compara slugs equivalentes (ex.: bid-frete ↔ bid-frete-internacional) */
  produtoSlugEquivalente?: (a: string, b: string) => boolean
  /** Placeholder de busca no dropdown (padrão: "Buscar workspace…") */
  dropdownSearchPlaceholder?: string
  /** Label do botão criar (padrão: "Criar workspace") */
  dropdownCreateLabel?: string
  /** Label do botão gerenciar (padrão: "Gerenciar workspace") */
  dropdownManageLabel?: string
  /** Título da tooltip do nome no dropdown (padrão: "Workspace") */
  dropdownWorkspaceTooltipTitulo?: string
  defaultCollapsed?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

function resolverRotuloTenantSidebar(tenantName: string, tenantPlan: string) {
  const plano = tenantPlan.trim()
  const nome = tenantName.trim()
  const planoRedundante =
    !plano || plano.localeCompare(nome, undefined, { sensitivity: 'accent' }) === 0
  return {
    planoRedundante,
    descricaoTooltip: planoRedundante ? nome : `${nome} · ${plano}`,
  }
}

export function MenuLateralGlobal({
  tenantName,
  tenantPlan,
  navItems,
  moduleName = 'Configurador',
  moduleModoVariant,
  moduleModoBadgeLabel = 'Visão Fornecedor',
  moduleModoAriaLabel,
  moduleModoTooltipTitulo,
  moduleModoTooltipDescricao,
  moduleColor = '#818cf8',
  moduleIcon,
  workspaces = [],
  onSwitchWorkspace,
  modoWorkspace = 'unico',
  workspacesEscopoIds = [],
  onAlternarWorkspaceEscopo,
  onDefinirEscopoWorkspaces,
  sinalAbrirMenuWorkspaces = 0,
  onCreateWorkspace,
  onManageWorkspace,
  produtos = [],
  produtoAtualSlug,
  onSwitchProduct,
  produtoSlugEquivalente = (a, b) => a === b,
  dropdownSearchPlaceholder = 'Buscar workspace…',
  dropdownCreateLabel = 'Criar workspace',
  dropdownManageLabel = 'Gerenciar workspace',
  dropdownWorkspaceTooltipTitulo = 'Workspace',
  defaultCollapsed = false,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}: MenuLateralGlobalProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [wsOpen, setWsOpen] = useState(false)
  const [wsSearch, setWsSearch] = useState('')
  const [prodOpen, setProdOpen] = useState(false)
  const [prodSearch, setProdSearch] = useState('')

  const logoNomeCompacto = Boolean(
    (produtoAtualSlug &&
      (produtoSlugEquivalente(produtoAtualSlug, 'bid-frete') ||
        produtoSlugEquivalente(produtoAtualSlug, 'bid-frete-internacional'))) ||
      /^bid frete internacional$/i.test(moduleName),
  )
  const logoTituloPar = logoNomeCompacto ? 'mlg-logo-titulo-par' : ''
  const logoNameClass = logoNomeCompacto
    ? `mlg-logo-name mlg-logo-name--compact ${logoTituloPar}`.trim()
    : 'mlg-logo-name'
  const modoAria = moduleModoAriaLabel ?? moduleModoBadgeLabel
  const logoTooltip = moduleModoVariant && modoAria ? `${moduleName} — ${modoAria}` : moduleName
  const tenantRotulo = resolverRotuloTenantSidebar(tenantName, tenantPlan)

  const logoModoBadge = moduleModoVariant === 'visao_fornecedor' ? (
    <LogoModoBadgeVisaoFornecedor
      label={moduleModoBadgeLabel}
      ariaLabel={modoAria}
      textoClassName={logoTituloPar || logoNameClass}
      tooltipTitulo={moduleModoTooltipTitulo ?? modoAria}
      tooltipDescricao={
        moduleModoTooltipDescricao
        ?? 'Área para responder cotações, enviar propostas e acompanhar seu desempenho'
      }
    />
  ) : null

  const wsRef = useRef<HTMLDivElement>(null)
  const prodRef = useRef<HTMLDivElement>(null)
  const tenantBtnRef = useRef<HTMLButtonElement>(null)
  const prodBtnRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  const exibirSeletorProduto = produtos.length >= 1 && Boolean(onSwitchProduct)

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (wsRef.current && !wsRef.current.contains(target)) setWsOpen(false)
      if (prodRef.current && !prodRef.current.contains(target)) setProdOpen(false)
    }
    if (wsOpen || prodOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [wsOpen, prodOpen])

  const filteredProdutos = produtos.filter(p =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()),
  )

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(wsSearch.toLowerCase())
  )

  const idsFiltrados = filteredWorkspaces.map(w => w.id)
  const todosFiltradosSelecionados =
    idsFiltrados.length > 0 && idsFiltrados.every(id => workspacesEscopoIds.includes(id))

  const descricaoTooltipWorkspace = (ws: WorkspaceItem) =>
    ws.plan ? `${ws.name} · ${ws.plan}` : ws.name

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed

  const logoIconNode = (
    <div className="mlg-logo-icon" style={{ color: moduleColor }}>
      {moduleIcon ?? <LogoGlobal iconSize={26} iconColor={moduleColor} iconOnly />}
    </div>
  )

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse()
    } else {
      setInternalCollapsed((prev: boolean) => !prev)
    }
  }

  const toggleSubmenu = (label: string, currentExpandedState: boolean) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !currentExpandedState
    }))
  }

  // Abre dropdown quando outro componente pede (chip Workspaces na Lista).
  useEffect(() => {
    if (sinalAbrirMenuWorkspaces <= 0) return
    const abrir = () => {
      setWsOpen(true)
      setWsSearch('')
      requestAnimationFrame(() => {
        tenantBtnRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        tenantBtnRef.current?.focus()
      })
    }
    if (isCollapsed) {
      toggleCollapse()
      window.setTimeout(abrir, 180)
      return
    }
    abrir()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao sinal
  }, [sinalAbrirMenuWorkspaces])

  const cssVars = {
    '--mlg-accent': moduleColor,
    '--mlg-accent-dim': `${moduleColor}1f`,
    '--mlg-accent-border': `${moduleColor}33`,
  } as React.CSSProperties

  const renderNavItem = (item: NavItem, isSubmenu = false) => {
    // ── Divisor de seção ──
    if (item.sectionDivider) {
      if (isCollapsed) return <div key={item.label} className="mlg-nav-spacer" />
      return <p key={item.label} className="mlg-nav-label mlg-nav-section-label">{item.label}</p>
    }

    const hasChildren = item.children && item.children.length > 0
    const initiallyExpanded = hasChildren && item.children?.some(child => location.pathname === child.to)
    const isExpanded = expandedItems[item.label] !== undefined ? expandedItems[item.label] : initiallyExpanded
    
    // Se for um item com submenus
    if (hasChildren) {
      return (
        <div key={item.label} className={`mlg-nav-group ${isExpanded ? 'active' : ''}`}>
          <button 
            className={`mlg-nav-item mlg-nav-parent ${isExpanded ? 'expanded' : ''}`}
            onClick={() => toggleSubmenu(item.label, isExpanded as boolean)}
          >
            <div className="mlg-nav-icon">{item.icon}</div>
            {!isCollapsed && (
              <>
                <span className="mlg-nav-text">{item.label}</span>
                <CaretDown className={`mlg-nav-chevron ${isExpanded ? 'open' : ''}`} size={14} weight="bold" />
              </>
            )}
          </button>
          
          {!isCollapsed && (
            <div className={`mlg-submenu ${isExpanded ? 'open' : ''}`}>
              {item.children?.map(child => (
                <React.Fragment key={child.to ?? child.label}>
                  {renderNavItem(child, true)}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Conteúdo de texto (nome + badge opcional em coluna)
    const textContent = !isCollapsed ? (
      item.badge ? (
        <div className="mlg-nav-content">
          <span className="mlg-nav-text">{item.label}</span>
          <span className={`mlg-nav-badge ${item.badgeVariant === 'accent' ? 'mlg-nav-badge--accent' : 'mlg-nav-badge--muted'}`}>
            {item.badge}
          </span>
        </div>
      ) : (
        <span className="mlg-nav-text">{item.label}</span>
      )
    ) : null

    // Item normal (link) — navegação nativa via <a href> força reload completo (F5).
    // Evita race conditions de SPA entre Clerk/Zustand/API ao trocar de tela.
    const checkActive = (to: string) => {
      if (!to) return false
      if (to.includes('?')) {
        const [toPath, toQuery] = to.split('?')
        if (location.pathname !== toPath) return false
        const toParams = new URLSearchParams(toQuery)
        const currentParams = new URLSearchParams(location.search)
        for (const [key, val] of toParams.entries()) {
          if (currentParams.get(key) !== val) return false
        }
        return true
      }
      return location.pathname === to
    }
    const isActive = checkActive(item.to || '')
    const navLink = item.disabled ? (
      <div className={`mlg-nav-item mlg-disabled ${isSubmenu ? 'mlg-submenu-item' : ''}`}>
        <div className="mlg-nav-icon">{item.icon}</div>
        {textContent}
      </div>
    ) : (
      <a
        key={item.to || item.label}
        href={item.to || '#'}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className={`mlg-nav-item ${isSubmenu ? 'mlg-submenu-item' : ''} ${isActive ? 'active' : ''}`}
      >
        <div className="mlg-nav-icon">{item.icon}</div>
        {textContent}
      </a>
    )

    if (isCollapsed && !isSubmenu) {
      return (
        <TooltipGlobal key={item.label} descricao={item.label}>
          {navLink}
        </TooltipGlobal>
      )
    }

    return navLink
  }

  return (
    <aside 
      className={`mlg-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={cssVars}
    >
      {/* ── Toggle — flutua na borda direita ── */}
      <TooltipGlobal descricao={isCollapsed ? 'Expandir menu' : 'Recolher menu'}>
        <button 
          className="mlg-toggle-btn" 
          onClick={toggleCollapse}
        >
          <SidebarSimple weight={isCollapsed ? 'duotone' : 'regular'} size={16} />
        </button>
      </TooltipGlobal>

      {/* ── Logo + seletor de produto ── */}
      <div className="mlg-logo-wrapper" ref={prodRef}>
        {isCollapsed ? (
          <TooltipGlobal descricao={logoTooltip}>
            <div className="mlg-logo-area mlg-logo-area--collapsed">
              {logoIconNode}
            </div>
          </TooltipGlobal>
        ) : exibirSeletorProduto ? (
          <button
            ref={prodBtnRef}
            type="button"
            className={`mlg-logo-area mlg-logo-area--btn ${prodOpen ? 'mlg-logo-area--open' : ''}`}
            onClick={() => setProdOpen(o => !o)}
            aria-expanded={prodOpen}
            aria-haspopup="listbox"
            aria-label={`Produto: ${moduleName}. Trocar produto`}
          >
            {logoIconNode}
            <div className="mlg-logo-info">
              <span className={logoNameClass} style={{ color: moduleColor }} title={moduleName}>
                {moduleName}
              </span>
              <span className="mlg-logo-gravity">by Gravity</span>
            </div>
            <CaretDown className={`mlg-logo-chevron ${prodOpen ? 'open' : ''}`} size={13} weight="bold" />
          </button>
        ) : (
          <div className="mlg-logo-area">
            {logoIconNode}
            <div className="mlg-logo-info">
              <span className={logoNameClass} style={{ color: moduleColor }} title={moduleName}>
                {moduleName}
              </span>
              <span className="mlg-logo-gravity">by Gravity</span>
            </div>
          </div>
        )}

        {logoModoBadge && !isCollapsed ? (
          <div className="mlg-logo-modo-row">{logoModoBadge}</div>
        ) : null}

        {prodOpen && !isCollapsed && exibirSeletorProduto && (
          <div className="mlg-ws-dropdown mlg-prod-dropdown" role="listbox">
            {produtos.length > 4 && (
              <div className="mlg-ws-search">
                <input
                  className="mlg-ws-search__input"
                  type="text"
                  placeholder="Buscar produto…"
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            <div className="mlg-ws-dropdown__list">
              {filteredProdutos.map((prod, index) => {
                const isAcao = prod.kind === 'acao'
                const isCurrent = produtoAtualSlug
                  ? produtoSlugEquivalente(prod.slug, produtoAtualSlug)
                  : !isAcao && prod.name === moduleName
                // Divisor antes do primeiro item 'acao' — separa produtos de visões transversais.
                const mostrarDivisor =
                  isAcao && filteredProdutos[index - 1]?.kind !== 'acao'
                return (
                  <React.Fragment key={prod.slug}>
                    {mostrarDivisor && <div className="mlg-prod-divider" role="separator" />}
                    <button
                      type="button"
                      className={`mlg-ws-item ${isCurrent ? 'mlg-ws-item--current' : ''} ${isAcao ? 'mlg-ws-item--acao' : ''}`}
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => {
                        if (!isCurrent) onSwitchProduct?.(prod.slug)
                        setProdOpen(false)
                      }}
                    >
                      <div
                        className="mlg-prod-item-icon"
                        style={{ color: prod.color }}
                        aria-hidden
                      >
                        {prod.icon}
                      </div>
                      <div className="mlg-ws-item-info">
                        <span className="mlg-ws-item-name">{prod.name}</span>
                        {prod.sublabel && (
                          <TooltipGlobal descricao={prod.sublabel}>
                            <span className="mlg-ws-item-sub">{prod.sublabel}</span>
                          </TooltipGlobal>
                        )}
                      </div>
                      {isCurrent ? (
                        <Check size={13} weight="bold" style={{ color: prod.color, flexShrink: 0 }} />
                      ) : isAcao ? (
                        <ArrowRight size={13} weight="bold" className="mlg-ws-item-arrow" style={{ flexShrink: 0 }} />
                      ) : null}
                    </button>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Workspace switcher ── */}
      <div className="mlg-tenant-wrapper" ref={wsRef}>
        {isCollapsed ? (
          <TooltipGlobal descricao={tenantRotulo.descricaoTooltip}>
            <div className="mlg-tenant">
              <div className="mlg-tenant-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
                {tenantName.charAt(0)}
              </div>
            </div>
          </TooltipGlobal>
        ) : (
          <button
            ref={tenantBtnRef}
            type="button"
            className={`mlg-tenant mlg-tenant--btn ${wsOpen ? 'mlg-tenant--open' : ''}`}
            onClick={() => setWsOpen(o => !o)}
            aria-expanded={wsOpen}
            aria-haspopup="listbox"
          >
            <div className="mlg-tenant-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
              {tenantName.charAt(0)}
            </div>
            <div className="mlg-tenant-info">
              <TooltipGlobal
                titulo={dropdownWorkspaceTooltipTitulo}
                descricao={tenantRotulo.descricaoTooltip}
              >
                <span className="mlg-tenant-name">{tenantName}</span>
              </TooltipGlobal>
              {!tenantRotulo.planoRedundante && (
                <span className="mlg-tenant-plan">{tenantPlan}</span>
              )}
            </div>
            <CaretDown className={`mlg-tenant-chevron ${wsOpen ? 'open' : ''}`} size={13} weight="bold" />
          </button>
        )}

        {/* Dropdown */}
        {wsOpen && !isCollapsed && (
          <div className="mlg-ws-dropdown" role="listbox">
            {workspaces.length > 4 && (
              <div className="mlg-ws-search">
                <input
                  className="mlg-ws-search__input"
                  type="text"
                  placeholder={dropdownSearchPlaceholder}
                  value={wsSearch}
                  onChange={e => setWsSearch(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            {modoWorkspace === 'multiplo' && filteredWorkspaces.length > 1 && (
              <div className="mlg-ws-toolbar">
                <button
                  type="button"
                  className="mlg-ws-toolbar__btn"
                  onClick={() => {
                    if (todosFiltradosSelecionados) {
                      onDefinirEscopoWorkspaces?.([])
                    } else {
                      onDefinirEscopoWorkspaces?.(idsFiltrados)
                    }
                  }}
                >
                  {todosFiltradosSelecionados ? 'Desmarcar tudo' : 'Selecionar tudo'}
                </button>
              </div>
            )}
            <div className="mlg-ws-dropdown__list">
            {filteredWorkspaces.map(ws => {
              const isMulti = modoWorkspace === 'multiplo'
              const isSelected = isMulti
                ? workspacesEscopoIds.includes(ws.id)
                : ws.name === tenantName
              return (
                <button
                  key={ws.id}
                  className={`mlg-ws-item ${isSelected ? 'mlg-ws-item--current' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    if (isMulti) {
                      onAlternarWorkspaceEscopo?.(ws.id)
                      return
                    }
                    if (!isSelected) onSwitchWorkspace?.(ws.id)
                    setWsOpen(false)
                  }}
                >
                  {isMulti && (
                    <span className="mlg-ws-item-check" style={{ color: moduleColor }}>
                      {isSelected
                        ? <CheckSquare size={16} weight="fill" />
                        : <Square size={16} weight="regular" />}
                    </span>
                  )}
                  <div className="mlg-ws-item-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
                    {ws.name.charAt(0)}
                  </div>
                  <div className="mlg-ws-item-info">
                    <TooltipGlobal
                      titulo={dropdownWorkspaceTooltipTitulo}
                      descricao={descricaoTooltipWorkspace(ws)}
                    >
                      <span className="mlg-ws-item-name">{ws.name}</span>
                    </TooltipGlobal>
                    {ws.plan ? (
                      <span className="mlg-ws-item-plan">{ws.plan}</span>
                    ) : null}
                  </div>
                  {!isMulti && isSelected && (
                    <Check size={13} weight="bold" style={{ color: moduleColor, flexShrink: 0 }} />
                  )}
                </button>
              )
            })}
            </div>

            <div className="mlg-ws-dropdown__footer">
            <div className="mlg-ws-divider" />

            {onCreateWorkspace && (
              <button className="mlg-ws-action" onClick={() => { onCreateWorkspace(); setWsOpen(false) }}>
                <Plus size={14} weight="bold" />
                {dropdownCreateLabel}
              </button>
            )}
            {onManageWorkspace && (
              <button className="mlg-ws-action" onClick={() => { onManageWorkspace(); setWsOpen(false) }}>
                <Gear size={14} weight="duotone" />
                {dropdownManageLabel}
              </button>
            )}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="mlg-nav">
        {isCollapsed && <div className="mlg-nav-spacer" />}
        {navItems.map(item => renderNavItem(item))}
      </nav>

    </aside>
  )
}

