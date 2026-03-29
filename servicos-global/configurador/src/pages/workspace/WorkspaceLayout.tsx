import React, { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { ToastContainer, useShellStore, useUserPreferences, useSyncClerkToShell } from '@gravity/shell'
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
  Truck,
  Info,
} from '@phosphor-icons/react'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import GabiChat from '@tenant/gabi/src/Gabi'
import './workspace.css'
import './gabi.css'

const navItems = [
  { to: '/workspace/organizacao',  label: 'Organização',    icon: <Crown       weight="duotone" size={18} /> },
  { to: '/workspace/workspaces',     label: 'Workspaces', icon: <Buildings   weight="duotone" size={18} /> },
  { to: '/workspace/usuarios',     label: 'Usuários',        icon: <Users       weight="duotone" size={18} /> },
  { to: '/workspace/assinaturas',  label: 'Assinaturas',     icon: <CreditCard  weight="duotone" size={18} /> },
  { to: '/workspace/financeiro',   label: 'Financeiro',      icon: <Receipt     weight="duotone" size={18} /> },
  { to: '/workspace/api-cockpit',  label: 'API Cockpit',     icon: <PlugsConnected weight="duotone" size={18} /> },
]

export function WorkspaceLayout() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()

  // Sincroniza dados do Clerk → Shell store (currentUser com tenantId)
  useSyncClerkToShell()
  // Sincroniza preferências de UI com o backend (cross-device)
  useUserPreferences({ userId: user?.id, tenantId: user?.organizationMemberships?.[0]?.organization?.id ?? 'importes-sa' })
  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)

  // Mock tenant data — replace with real tenant context when available
  const tenantName = 'Importes SA'
  const tenantPlan = 'Profissional'
  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'usuario@gravity.com.br'

  const { signOut } = useClerk()

  // Handle frontend search filtering e estado foi movido para o componente LocalizarExpandidoCampoGlobal
  
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

  return (
    <div className="ws-shell">
      {/* ── Sidebar ── */}
      <MenuLateralGlobal 
        tenantName={tenantName}
        tenantPlan={tenantPlan}
        navItems={navItems}
        moduleName="Configurador"
        moduleColor="#818cf8"
        defaultCollapsed={false}
      />

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions (Floating over content, no bar) ── */}
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

          {/* Theme button estava duplicado. Removido da barra, agora vive apenas no UX Dropdown */}

          {/* NOVO: Toggle de tooltips */}
          <TooltipGlobal
            titulo="Dicas e Explicações"
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
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
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          <Notificacoes tenantId="importes-sa" userId={user?.id ?? 'mock-user'} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole="Master"
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateOrganizacao={() => navigate('/workspace/organizacao')}
            onNavigateAssinaturas={() => navigate('/workspace/assinaturas')}
            onSignOut={() => signOut()}
            isAdmin={false} // UsuarioGlobal resolverá privilégios de Super Admin via e-mail
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
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
        <TooltipGlobal descricao="Falar com a Gabi IA">
          <button 
            className="ws-gabi-trigger" 
            onClick={() => setIsGabiOpen(true)}
          >
            <Sparkle weight="fill" size={28} />
          </button>
        </TooltipGlobal>
      )}

      {/* ── Notificações Globais ── */}
      <ToastContainer />
    </div>
  )
}
