import React, { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { ToastContainer, useShellStore } from '@gravity/shell'
import { Notificacoes } from '../../../../tenant/notificacoes/src/Notificacoes'
import {
  Crown,
  Buildings,
  Users,
  CreditCard,
  Receipt,
  PlugsConnected,
  Sun,
  Moon,
  MagnifyingGlass,
  Bell,
  CaretDown,
  XCircle,
  User,
  ShieldCheck,
  Gear,
  Lifebuoy,
  Sparkle,
  SignOut,
  Robot,
} from '@phosphor-icons/react'
import { LocalizarCampoGlobal } from '@nucleo/localizar-campo-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import GabiChat from '@tenant/gabi/src/Gabi'
import './workspace.css'
import './gabi.css'

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
  const { currentTheme, toggleTheme } = useShellStore()
  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)

  // Mock tenant data — replace with real tenant context when available
  const tenantName = 'Importes SA'
  const tenantPlan = 'Profissional'
  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userRole = 'Master'
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'usuario@gravity.com.br'

  const { signOut } = useClerk()

  // Handle frontend search filtering e estado foi movido para o componente LocalizarCampoGlobal
  
  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  return (
    <div className="ws-shell">
      {/* ── Sidebar ── */}
      <aside className="ws-sidebar">
        {/* Logo + chip inline */}
        <div className="ws-sidebar__logo">
          <LogoGlobal iconSize={28} iconColor="#818cf8" />
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

      </aside>

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions (Floating over content, no bar) ── */}
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

          {/* Theme button estava duplicado. Removido da barra, agora vive apenas no UX Dropdown */}

          <Notificacoes tenantId="importes-sa" userId={user?.id ?? 'mock-user'} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRole}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateOrganizacao={() => navigate('/workspace/organizacao')}
            onNavigateAssinaturas={() => navigate('/workspace/assinaturas')}
            onSignOut={() => signOut()}
          />
        </div>

        {/* Page content rendered by child routes */}
        <div className="ws-content">
          <Outlet />
        </div>
      </div>

      {/* ── Gabi IA Floating Panel ── */}
      {isGabiOpen && (
        <div className="ws-gabi-panel">
          <GabiChat onClose={() => setIsGabiOpen(false)} />
        </div>
      )}
      
      {!isGabiOpen && (
        <button 
          className="ws-gabi-trigger" 
          onClick={() => setIsGabiOpen(true)}
          title="Falar com a Gabi IA"
        >
          <Sparkle weight="fill" size={28} />
        </button>
      )}

      {/* ── Notificações Globais ── */}
      <ToastContainer />
    </div>
  )
}
