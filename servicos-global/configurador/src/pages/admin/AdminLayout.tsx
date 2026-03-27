import React, { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ToastContainer, useShellStore, useUserPreferences } from '@gravity/shell'
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
  { to: '/admin/apis',         label: 'API Cockpit',      icon: <Pulse           weight="duotone" size={18} /> },
  { to: '/admin/testes',       label: 'Log de Testes',    icon: <Bug             weight="duotone" size={18} /> },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()

  // Sincroniza preferências de UI com o backend (cross-device)
  useUserPreferences({ userId: user?.id, tenantId: 'gravity-hq' })
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
          <TooltipGlobal descricao="Pesquisar por páginas, ferramentas ou configurações no painel administrativo">
            <LocalizarExpandidoCampoGlobal 
              onBuscarNavigate={(term) => {
                const termLower = term.toLowerCase()
                const target = navItems.find(item => item.label.toLowerCase().includes(termLower))
                if (target) {
                  navigate(target.to)
                }
              }}
            />
          </TooltipGlobal>

          {/* NOVO: Toggle de tooltips */}
          <TooltipGlobal
            titulo="Dicas e Explicações"
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong style={{ color: '#f1f5f9' }}>Habilitadas</strong> — dicas aparecem ao passar o mouse</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                  <span><strong style={{ color: '#f1f5f9' }}>Desabilitadas</strong> — nenhuma dica é exibida</span>
                </span>
                <span style={{ marginTop: '0.15rem', color: '#64748b', fontSize: '0.7rem' }}>
                  Agora: <strong style={{ color: tooltipsDisabled ? '#f87171' : '#34d399' }}>
                    {tooltipsDisabled ? 'desabilitadas' : 'habilitadas'}
                  </strong>
                </span>
              </span>
            }
          >
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : '#10b981' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

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
