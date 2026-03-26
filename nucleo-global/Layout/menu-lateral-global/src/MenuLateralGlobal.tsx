import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { CaretLineLeft, CaretLineRight } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './menu-lateral.css'

export interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

export interface MenuLateralGlobalProps {
  tenantName: string
  tenantPlan: string
  navItems: NavItem[]
  moduleName?: string
  moduleColor?: string
  defaultCollapsed?: boolean
}

export function MenuLateralGlobal({
  tenantName,
  tenantPlan,
  navItems,
  moduleName = 'Configurador',
  moduleColor = '#818cf8',
  defaultCollapsed = false
}: MenuLateralGlobalProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const toggleCollapse = () => setIsCollapsed((prev: boolean) => !prev)

  const cssVars = {
    '--mlg-accent': moduleColor,
    '--mlg-accent-dim': `${moduleColor}1f`,
    '--mlg-accent-border': `${moduleColor}33`,
  } as React.CSSProperties

  return (
    <aside 
      className={`mlg-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={cssVars}
    >
      {/* ── Logo + Chip ── */}
      <div className="mlg-logo-area">
        <LogoGlobal iconSize={28} iconColor={moduleColor} hideText={isCollapsed} />
        {!isCollapsed && (
          <div className="mlg-module-chip">
            <span className="mlg-module-chip__dot" style={{ backgroundColor: moduleColor, boxShadow: `0 0 8px ${moduleColor}, 0 0 3px ${moduleColor}cc` }} />
            <span className="mlg-module-chip__label" style={{ color: moduleColor }}>{moduleName}</span>
          </div>
        )}
      </div>

      {/* ── Tenant ── */}
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

      {/* ── Navigation ── */}
      <nav className="mlg-nav">
        {!isCollapsed && <p className="mlg-nav-label">Workspace</p>}
        {isCollapsed && <div className="mlg-nav-spacer" />}
        
        {navItems.map(item => {
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mlg-nav-item${isActive ? ' active' : ''}`}
            >
              <div className="mlg-nav-icon">{item.icon}</div>
              {!isCollapsed && <span className="mlg-nav-text">{item.label}</span>}
            </NavLink>
          )

          if (isCollapsed) {
            return (
              <TooltipGlobal key={item.to} descricao={item.label}>
                {link}
              </TooltipGlobal>
            )
          }

          return link
        })}
      </nav>

      {/* ── Toggle button no rodapé ── */}
      <div className="mlg-footer">
        <TooltipGlobal descricao={isCollapsed ? 'Expandir menu' : 'Recolher menu'}>
          <button 
            className="mlg-toggle-btn" 
            onClick={toggleCollapse}
          >
            {isCollapsed 
              ? <CaretLineRight weight="bold" size={16} /> 
              : <CaretLineLeft weight="bold" size={16} />
            }
          </button>
        </TooltipGlobal>
      </div>
    </aside>
  )
}
