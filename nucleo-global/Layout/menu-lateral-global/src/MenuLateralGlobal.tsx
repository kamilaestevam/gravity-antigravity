import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarSimple, CaretDown, Lock, Check, Plus, Gear } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './menu-lateral.css'

export interface WorkspaceItem {
  id: string
  name: string
  plan: string
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
  moduleColor?: string
  moduleIcon?: React.ReactNode
  /** Lista de workspaces disponíveis para troca */
  workspaces?: WorkspaceItem[]
  /** Callback ao selecionar outro workspace */
  onSwitchWorkspace?: (id: string) => void
  /** Callback para criar novo workspace */
  onCreateWorkspace?: () => void
  /** Callback para ir às configurações do workspace */
  onManageWorkspace?: () => void
  /** Placeholder de busca no dropdown (padrão: "Buscar workspace…") */
  dropdownSearchPlaceholder?: string
  /** Label do botão criar (padrão: "Criar workspace") */
  dropdownCreateLabel?: string
  /** Label do botão gerenciar (padrão: "Gerenciar workspace") */
  dropdownManageLabel?: string
  defaultCollapsed?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function MenuLateralGlobal({
  tenantName,
  tenantPlan,
  navItems,
  moduleName = 'Configurador',
  moduleColor = '#818cf8',
  moduleIcon,
  workspaces = [],
  onSwitchWorkspace,
  onCreateWorkspace,
  onManageWorkspace,
  dropdownSearchPlaceholder = 'Buscar workspace…',
  dropdownCreateLabel = 'Criar workspace',
  dropdownManageLabel = 'Gerenciar workspace',
  defaultCollapsed = false,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}: MenuLateralGlobalProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [wsOpen, setWsOpen] = useState(false)
  const [wsSearch, setWsSearch] = useState('')
  const wsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWsOpen(false)
      }
    }
    if (wsOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [wsOpen])

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(wsSearch.toLowerCase())
  )

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed
  
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
              {item.children?.map(child => renderNavItem(child, true))}
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
    const isActive = !!item.to && location.pathname === item.to
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

      {/* ── Logo + Nome do produto ── */}
      {isCollapsed ? (
        <TooltipGlobal descricao={moduleName}>
          <div className="mlg-logo-area mlg-logo-area--collapsed">
            <div className="mlg-logo-icon" style={{ color: moduleColor }}>
              {moduleIcon ?? <LogoGlobal iconSize={26} iconColor={moduleColor} iconOnly />}
            </div>
          </div>
        </TooltipGlobal>
      ) : (
        <div className="mlg-logo-area">
          <div className="mlg-logo-icon" style={{ color: moduleColor }}>
            {moduleIcon ?? <LogoGlobal iconSize={26} iconColor={moduleColor} iconOnly />}
          </div>
          <div className="mlg-logo-info">
            <span className="mlg-logo-name" style={{ color: moduleColor }}>{moduleName}</span>
            <span className="mlg-logo-gravity">by Gravity</span>
          </div>
        </div>
      )}

      {/* ── Workspace switcher ── */}
      <div className="mlg-tenant-wrapper" ref={wsRef}>
        {isCollapsed ? (
          <TooltipGlobal descricao={`${tenantName} · ${tenantPlan}`}>
            <div className="mlg-tenant">
              <div className="mlg-tenant-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
                {tenantName.charAt(0)}
              </div>
            </div>
          </TooltipGlobal>
        ) : (
          <button
            className={`mlg-tenant mlg-tenant--btn ${wsOpen ? 'mlg-tenant--open' : ''}`}
            onClick={() => setWsOpen(o => !o)}
            aria-expanded={wsOpen}
            aria-haspopup="listbox"
          >
            <div className="mlg-tenant-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
              {tenantName.charAt(0)}
            </div>
            <div className="mlg-tenant-info">
              <span className="mlg-tenant-name">{tenantName}</span>
              <span className="mlg-tenant-plan">{tenantPlan}</span>
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
            {filteredWorkspaces.map(ws => {
              const isCurrent = ws.name === tenantName
              return (
                <button
                  key={ws.id}
                  className={`mlg-ws-item ${isCurrent ? 'mlg-ws-item--current' : ''}`}
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => {
                    if (!isCurrent) onSwitchWorkspace?.(ws.id)
                    setWsOpen(false)
                  }}
                >
                  <div className="mlg-ws-item-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
                    {ws.name.charAt(0)}
                  </div>
                  <div className="mlg-ws-item-info">
                    <span className="mlg-ws-item-name">{ws.name}</span>
                    <span className="mlg-ws-item-plan">{ws.plan}</span>
                  </div>
                  {isCurrent && <Check size={13} weight="bold" style={{ color: moduleColor, flexShrink: 0 }} />}
                </button>
              )
            })}

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

