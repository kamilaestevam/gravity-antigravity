import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ToastContainer } from '@gravity/shell'
import {
  Hexagon,
  Crown,
  Buildings,
  Users,
  CreditCard,
  Receipt,
  PlugsConnected,
  Sun,
  Moon,
} from '@phosphor-icons/react'
import './workspace.css'

const navItems = [
  { to: '/workspace/organizacao',  label: 'Organização',    icon: <Crown       weight="duotone" size={18} /> },
  { to: '/workspace/espacos-de-trabalho',     label: 'Espaços de Trabalho', icon: <Buildings   weight="duotone" size={18} /> },
  { to: '/workspace/usuarios',     label: 'Usuários',        icon: <Users       weight="duotone" size={18} /> },
  { to: '/workspace/assinaturas',  label: 'Assinaturas',     icon: <CreditCard  weight="duotone" size={18} /> },
  { to: '/workspace/financeiro',   label: 'Financeiro',      icon: <Receipt     weight="duotone" size={18} /> },
  { to: '/workspace/api-cockpit',  label: 'API Cockpit',     icon: <PlugsConnected weight="duotone" size={18} /> },
]

export function WorkspaceLayout() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [isLight, setIsLight] = useState<boolean>(() => {
    return localStorage.getItem('ws-theme') === 'light'
  })

  // Mock tenant data — replace with real tenant context when available
  const tenantName = 'Importes SA'
  const tenantPlan = 'Profissional'
  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userRole = 'Master'

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
      localStorage.setItem('ws-theme', 'light')
    } else {
      document.body.classList.remove('light-theme')
      localStorage.setItem('ws-theme', 'dark')
    }
  }, [isLight])

  return (
    <div className="ws-shell">
      {/* ── Sidebar ── */}
      <aside className="ws-sidebar">
        {/* Logo + chip inline */}
        <div className="ws-sidebar__logo">
          <Hexagon weight="duotone" size={28} color="#818cf8" />
          <span className="ws-sidebar__logo-name">Gravity</span>
          <div className="ws-global-chip">
            <span className="ws-global-chip__dot" />
            <span className="ws-global-chip__label">Configurador</span>
          </div>
        </div>

        {/* Tenant info block */}
        <div className="ws-sidebar__tenant">
          <div className="ws-sidebar__tenant-avatar">{tenantName.charAt(0)}</div>
          <div className="ws-sidebar__tenant-info">
            <span className="ws-sidebar__tenant-name">{tenantName}</span>
            <span className="ws-sidebar__tenant-plan">{tenantPlan}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ws-sidebar__nav">
          <p className="ws-sidebar__nav-label">Workspace</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `ws-nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user info + theme toggle */}
        <div className="ws-sidebar__footer">
          <div className="ws-sidebar-user">
            <div className="ws-sidebar-user__avatar">{userInitials}</div>
            <div className="ws-sidebar-user__info">
              <span className="ws-sidebar-user__name">{userName}</span>
              <span className="ws-sidebar-user__role">{userRole}</span>
            </div>
            <button
              className="ws-theme-toggle"
              onClick={() => setIsLight(v => !v)}
              title={isLight ? 'Alternar para tema escuro' : 'Alternar para tema claro'}
              type="button"
              style={{ marginLeft: 'auto', flexShrink: 0 }}
            >
              {isLight
                ? <Moon weight="duotone" size={16} />
                : <Sun weight="duotone" size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* Page content rendered by child routes — sem header global */}
        <div className="ws-content">
          <Outlet />
        </div>
      </div>

      {/* ── Notificações Globais ── */}
      <ToastContainer />
    </div>
  )
}
