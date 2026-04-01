import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { SidebarSimple, CaretDown, Lock } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './menu-lateral.css'

export interface NavItem {
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
}

export interface MenuLateralGlobalProps {
  tenantName: string
  tenantPlan: string
  navItems: NavItem[]
  moduleName?: string
  moduleColor?: string
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
  defaultCollapsed = false,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse
}: MenuLateralGlobalProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const location = useLocation()

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

    // Item normal (link)
    const navLink = item.disabled ? (
      <div className={`mlg-nav-item mlg-disabled ${isSubmenu ? 'mlg-submenu-item' : ''}`}>
        <div className="mlg-nav-icon">{item.icon}</div>
        {textContent}
      </div>
    ) : (
      <NavLink
        key={item.to || item.label}
        to={item.to || '#'}
        className={({ isActive }: { isActive: boolean }) => `mlg-nav-item ${isSubmenu ? 'mlg-submenu-item' : ''} ${isActive ? 'active' : ''}`}
      >
        <div className="mlg-nav-icon">{item.icon}</div>
        {textContent}
      </NavLink>
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

      {/* ── Logo + Chip ── */}
      <div className="mlg-logo-area">
        <LogoGlobal iconSize={28} iconColor={moduleColor} hideText={isCollapsed} />
        {isCollapsed ? (
          <TooltipGlobal descricao={moduleName}>
            <div className="mlg-module-chip--dot-only">
              <span className="mlg-module-chip__dot" style={{ backgroundColor: moduleColor, boxShadow: `0 0 8px ${moduleColor}, 0 0 3px ${moduleColor}cc` }} />
            </div>
          </TooltipGlobal>
        ) : (
          <div className="mlg-module-chip">
            <span className="mlg-module-chip__dot" style={{ backgroundColor: moduleColor, boxShadow: `0 0 8px ${moduleColor}, 0 0 3px ${moduleColor}cc` }} />
            <span className="mlg-module-chip__label" style={{ color: moduleColor }}>{moduleName}</span>
          </div>
        )}
      </div>

      {/* ── Tenant ── */}
      <div className="mlg-tenant-wrapper">
        {isCollapsed ? (
          <TooltipGlobal descricao={`${tenantName} · ${tenantPlan}`}>
            <div className="mlg-tenant">
              <div className="mlg-tenant-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
                {tenantName.charAt(0)}
              </div>
            </div>
          </TooltipGlobal>
        ) : (
          <div className="mlg-tenant">
            <div className="mlg-tenant-avatar" style={{ color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }}>
              {tenantName.charAt(0)}
            </div>
            <div className="mlg-tenant-info">
              <span className="mlg-tenant-name">{tenantName}</span>
              <span className="mlg-tenant-plan" style={{ color: moduleColor }}>{tenantPlan}</span>
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

