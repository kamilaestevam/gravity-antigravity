import React, { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { LogoGlobal } from '@nucleo/logo-global'
import { ToastContainer, useShellStore } from '@gravity/shell'
import { LocalizarCampoGlobal } from '@nucleo/campo-localizar-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { Notificacoes } from '../../../../tenant/notificacoes/src/Notificacoes'
import {
  Buildings,
  Users,
  Receipt,
  Desktop,
  CloudArrowUp,
  Pulse,
  ShoppingBagOpen,
  Crown,
  CalendarBlank,
  RocketLaunch,
  Bug,
} from '@phosphor-icons/react'
import '../workspace/workspace.css'
import '../workspace/gabi.css'
import './admin.css'

const navItems = [
  { to: '/admin/visao-geral',  label: 'Visão Geral',      icon: <Crown           weight="duotone" size={18} /> },
  { to: '/admin/tenants',      label: 'Organizações',     icon: <Buildings       weight="duotone" size={18} /> },
  { to: '/admin/produtos',     label: 'Produtos',         icon: <ShoppingBagOpen weight="duotone" size={18} /> },
  { to: '/admin/usuarios',     label: 'Usuários Globais', icon: <Users           weight="duotone" size={18} /> },
  { to: '/admin/financeiro',   label: 'Financeiro',       icon: <Receipt         weight="duotone" size={18} /> },
  { to: '/admin/historico',    label: 'Histórico Global', icon: <Desktop         weight="duotone" size={18} /> },
  { to: '/admin/deploy',       label: 'Deploy Railway',   icon: <CloudArrowUp    weight="duotone" size={18} /> },
  { to: '/admin/apis',         label: 'Monitor de APIs',  icon: <Pulse           weight="duotone" size={18} /> },
  { to: '/admin/testes',       label: 'Log de Testes',    icon: <Bug             weight="duotone" size={18} /> },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { currentTheme, toggleTheme } = useShellStore()
  const isLight = currentTheme === 'light'

  const { signOut } = useClerk()

  const userName = user?.fullName ?? user?.firstName ?? 'Gravity Admin'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userRole = 'Super Admin'
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'admin@gravity.com.br'

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  // Aplica o tema admin (verde) globalmente enquanto o AdminLayout estiver montado
  useEffect(() => {
    document.body.classList.add('admin-theme')
    return () => {
      document.body.classList.remove('admin-theme')
    }
  }, [])

  return (
    <div className="ws-shell">
      {/* ── Sidebar ── */}
      <aside className="ws-sidebar">
        {/* Logo + chip inline */}
        <div className="ws-sidebar__logo">
          <LogoGlobal iconSize={28} iconColor="#10b981" />
          <div className="ws-global-chip" style={{ background: '#10b981', borderColor: '#059669', color: '#ffffff', boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)' }}>
            <span className="ws-global-chip__dot" style={{ background: '#ffffff', boxShadow: 'none' }} />
            <span className="ws-global-chip__label" style={{ color: '#ffffff' }}>Admin Panel</span>
          </div>
        </div>

        {/* Tenant info block */}
        <div className="ws-sidebar__tenant">
          <div className="ws-sidebar__tenant-avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>G</div>
          <div className="ws-sidebar__tenant-info">
            <span className="ws-sidebar__tenant-name">Gravity HQ</span>
            <span className="ws-sidebar__tenant-plan" style={{ color: '#10b981' }}>Núcleo Central</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ws-sidebar__nav">
          <p className="ws-sidebar__nav-label">Plataforma</p>
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

      </aside>

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions ── */}
        <div className="ws-global-actions">
          <LocalizarCampoGlobal 
            onBuscarNavigate={(term) => {
              const termLower = term.toLowerCase()
              const target = navItems.find(item => item.label.toLowerCase().includes(termLower))
              if (target) {
                navigate(target.to)
              }
            }}
          />

          <Notificacoes tenantId="gravity-hq" userId={user?.id ?? 'admin-root'} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRole}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateOrganizacao={() => navigate('/admin/visao-geral')}
            onNavigateAssinaturas={() => {}}
            onSignOut={() => signOut()}
            isAdmin={true}
            isAdminPanel={true}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            onNavigateConfigurador={() => navigate('/workspace/workspaces')}
          />
        </div>

        {/* Page content rendered by child routes */}
        <div className="ws-content">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
