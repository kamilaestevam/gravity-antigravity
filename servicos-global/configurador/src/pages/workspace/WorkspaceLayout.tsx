import React, { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { ToastContainer, useShellStore, useUserPreferences, useMeSync } from '@gravity/shell'
import { useLoadSystemRole } from '../../hooks/useLoadSystemRole'
import { Notificacoes } from '../../../../tenant/notificacoes/src/Notificacoes'
import {
  Crown,
  Buildings,
  Users,
  CreditCard,
  Receipt,
  PlugsConnected,
  CurrencyCircleDollar,
  ClockCounterClockwise,
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
import { HubButton } from '../../components/HubButton'
import GabiChat from '@tenant/gabi/src/Gabi'
import './workspace.css'
import './gabi.css'

export function WorkspaceLayout() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/workspace/organizacao',  label: t('workspace.layout.organizacao'),    icon: <Crown       weight="duotone" size={18} /> },
    { to: '/workspace/workspaces',     label: t('workspace.layout.workspaces'), icon: <Buildings   weight="duotone" size={18} /> },
    { to: '/workspace/usuarios',     label: t('workspace.layout.usuarios'),        icon: <Users       weight="duotone" size={18} /> },
    { to: '/workspace/assinaturas',  label: t('workspace.layout.assinaturas'),     icon: <CreditCard  weight="duotone" size={18} /> },
    { to: '/workspace/financeiro',   label: t('workspace.layout.financeiro'),      icon: <Receipt     weight="duotone" size={18} /> },
    { to: '/workspace/api-cockpit',  label: t('workspace.layout.api-cockpit'),     icon: <PlugsConnected weight="duotone" size={18} /> },
    { to: '/workspace/taxa-cambio',  label: t('workspace.layout.taxa-cambio'),       icon: <CurrencyCircleDollar weight="duotone" size={18} /> },
    { to: '/workspace/historico-organizacao', label: t('workspace.layout.historico-organizacao'), icon: <ClockCounterClockwise weight="duotone" size={18} /> },
  ]

  const navigate = useNavigate()
  const { user } = useUser()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, currentUser } = useShellStore()

  // Popula ShellStore via GET /api/v1/me (Clerk = porteiro, backend = fonte de verdade)
  useMeSync()
  // Sincroniza preferências de UI com o backend (cross-device)
  useUserPreferences({ userId: currentUser.id || user?.id, tenantId: currentUser.tenantId })
  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)

  const tenantName = currentUser?.tenantName ?? 'Organização'
  const userName = currentUser.name ?? user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email ?? user?.primaryEmailAddress?.emailAddress ?? 'usuario@gravity.com.br'

  const { role: dbRole, isGravityAdmin } = useLoadSystemRole()
  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN:       'Admin',
    MASTER:      'Master',
    STANDARD:    'Standard',
    SUPPLIER:    'Fornecedor',
  }
  const userRole = ROLE_LABELS[dbRole ?? ''] ?? 'Standard'

  const { signOut } = useClerk()
  const { getToken } = useAuth()

  // ── Localizador ────────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('configurador')
  const [wsEcosystemNodes] = useState<EcosystemNode[]>(
    buildEcosystemNodes({ currentProductId: 'configurador' })
  )

  useEffect(() => {
    locAddEntry({ productId: 'configurador', productLabel: 'Configurador', productColor: '#f59e0b', pageLabel: 'Configurador', pagePath: '/workspace' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [tipoEmpresa, setTipoEmpresa] = useState('')

  useEffect(() => {
    async function fetchTipoEmpresa() {
      try {
        const token = await getToken()
        const res = await fetch('/api/v1/organizacao/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const { tenant } = await res.json()
          setTipoEmpresa(tenant.tipo_empresa ?? '')
        }
      } catch { /* silencioso */ }
    }
    fetchTipoEmpresa()
  }, [])

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
        tenantPlan={tipoEmpresa}
        navItems={navItems}
        moduleName={t('workspace.layout.modulo_nome')}
        moduleColor="#f59e0b"
        defaultCollapsed={false}
      />

      {/* ── Main area ── */}
      <div className="ws-main">
        {/* ── Global Actions (Floating over content, no bar) ── */}
        <div className="ws-global-actions">
          <HubButton onClick={() => navigate('/hub')} />

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

          <Notificacoes />

          <LocalizadorGlobal
            workspaceName={tenantName}
            currentProductId="configurador"
            currentProductLabel="Configurador"
            currentProductColor="#f59e0b"
            currentPageLabel="Configurador"
            history={locHistory}
            nodes={wsEcosystemNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub')
              else if (node.type === 'configurador') navigate('/workspace/workspaces')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
            iconOnly
          />

          <LanguageSwitcherGlobal />

          {/* Divisor visual */}
          <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRole}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/workspace/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            compact
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
