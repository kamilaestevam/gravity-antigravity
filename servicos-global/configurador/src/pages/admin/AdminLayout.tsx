import React, { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { LogoGlobal } from '@nucleo/logo-global'
import { ToastContainer, useShellStore } from '@gravity/shell'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
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
  Info,
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
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()
  const isLight = currentTheme === 'light'

  const { signOut } = useClerk()

  const userName = user?.fullName ?? user?.firstName ?? 'Gravity Admin'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'admin@gravity.com.br'

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  // Sincroniza desabilitação global de tooltips com o body
  useEffect(() => {
    if (tooltipsDisabled) {
      document.body.classList.add('tooltips-disabled')
    } else {
      document.body.classList.remove('tooltips-disabled')
    }
  }, [tooltipsDisabled])

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
      <MenuLateralGlobal
        tenantName="Gravity HQ"
        tenantPlan="Núcleo Central"
        navItems={navItems}
        moduleName="Admin Panel"
        moduleColor="#10b981"
        defaultCollapsed={false}
      />

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions ── */}
        <div className="ws-global-actions">
          <LocalizarExpandidoCampoGlobal 
            onBuscarNavigate={(term) => {
              const termLower = term.toLowerCase()
              const target = navItems.find(item => item.label.toLowerCase().includes(termLower))
              if (target) {
                navigate(target.to)
              }
            }}
          />

          {/* NOVO: Toggle de tooltips */}
          <button
            className="ws-global-btn"
            onClick={toggleTooltips}
            title={tooltipsDisabled ? 'Habilitar dicas' : 'Desabilitar dicas'}
            style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
            type="button"
          >
            <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
          </button>

          <Notificacoes tenantId="gravity-hq" userId={user?.id ?? 'admin-root'} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole="Admin" 
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
