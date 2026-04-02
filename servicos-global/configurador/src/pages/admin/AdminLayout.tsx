import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useLoadSystemRole } from '../../hooks/useLoadSystemRole'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ToastContainer, useShellStore, useUserPreferences, useSyncClerkToShell } from '@gravity/shell'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
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
  ShieldCheck,
  ArrowLeft,
} from '@phosphor-icons/react'
import '../workspace/workspace.css'
import '../workspace/gabi.css'
import './admin.css'

export function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUser()

  // Defesa em profundidade: bloqueia rendering se não for admin Gravity,
  // mesmo que o roteador (AdminRoute) já tenha feito essa verificação.
  // Role lido do banco — não depende de Clerk publicMetadata.
  const { isGravityAdmin, isReady, role: systemRole } = useLoadSystemRole()
  if (isReady && !isGravityAdmin) {
    return <Navigate to="/hub" replace />
  }

  const navItems = [
    { to: '/admin/visao-geral',  label: t('admin.layout.visao_geral'),      icon: <Crown           weight="duotone" size={18} /> },
    { to: '/admin/tenants',      label: t('admin.layout.organizacoes'),     icon: <Buildings       weight="duotone" size={18} /> },
    { to: '/admin/produtos',     label: t('admin.layout.produtos'),         icon: <ShoppingBagOpen weight="duotone" size={18} /> },
    { to: '/admin/usuarios',     label: t('admin.layout.usuarios_globais'), icon: <Users           weight="duotone" size={18} /> },
    { to: '/admin/financeiro',   label: t('admin.layout.financeiro'),       icon: <Receipt         weight="duotone" size={18} /> },
    { to: '/admin/historico',    label: t('admin.layout.historico_global'), icon: <Desktop         weight="duotone" size={18} /> },
    { to: '/admin/deploy',       label: t('admin.layout.deploy_railway'),   icon: <CloudArrowUp    weight="duotone" size={18} /> },
    { to: '/admin/apis',         label: t('admin.layout.api_cockpit'),      icon: <Pulse           weight="duotone" size={18} /> },
    { to: '/admin/seguranca',    label: t('admin.layout.seguranca'),        icon: <ShieldCheck     weight="duotone" size={18} /> },
    { to: '/admin/testes',       label: t('admin.layout.log_testes'),       icon: <Bug             weight="duotone" size={18} /> },
  ]
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()

  // Sincroniza dados do Clerk → Shell store (currentUser com tenantId)
  useSyncClerkToShell()
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
        tenantName={t('admin.layout.tenant_name')}
        tenantPlan={t('admin.layout.tenant_plan')}
        navItems={navItems}
        moduleName={t('admin.layout.module_name')}
        moduleColor="#10b981"
        defaultCollapsed={false}
      />

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions ── */}
        <div className="ws-global-actions">
          <TooltipGlobal titulo={t('admin.layout.voltar_hub_titulo', 'Voltar ao Hub')} descricao={t('admin.layout.voltar_hub_desc', 'Retornar à tela principal do workspace')}>
            <button
              onClick={() => navigate('/hub')}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                border: '1px solid rgba(16,185,129,0.25)',
                background: 'rgba(16,185,129,0.08)',
                color: '#10b981',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)' }}
            >
              <ArrowLeft size={16} weight="bold" />
              Hub
            </button>
          </TooltipGlobal>

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
          <TooltipGlobal
            titulo={t('admin.layout.dicas_titulo')}
            descricao={
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="fill" style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong style={{ color: '#f1f5f9' }}>{t('admin.layout.habilitadas')}</strong> — {t('admin.layout.habilitadas_desc')}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} weight="regular" style={{ color: '#64748b', flexShrink: 0 }} />
                  <span><strong style={{ color: '#f1f5f9' }}>{t('admin.layout.desabilitadas')}</strong> — {t('admin.layout.desabilitadas_desc')}</span>
                </span>
                <span style={{ marginTop: '0.15rem', color: '#64748b', fontSize: '0.7rem' }}>
                  {t('admin.layout.agora')} <strong style={{ color: tooltipsDisabled ? '#f87171' : '#34d399' }}>
                    {tooltipsDisabled ? t('admin.layout.desabilitadas').toLowerCase() : t('admin.layout.habilitadas').toLowerCase()}
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

          <LanguageSwitcherGlobal />

          <Notificacoes tenantId="gravity-hq" userId={user?.id ?? 'admin-root'} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={systemRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/admin/visao-geral')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={true}
            isAdminPanel={true}
            compact
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
