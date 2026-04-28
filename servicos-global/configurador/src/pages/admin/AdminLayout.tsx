import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { useLoadSystemRole } from '../../hooks/useLoadSystemRole'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ToastContainer, useShellStore, useUserPreferences, useMeSync } from '@gravity/shell'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
import { HubButton } from '../../components/HubButton'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { buildAdminProductNodes, type AdminProductItem } from '../../utils/ecosystemNodes'
import { Notificacoes } from '../../../../tenant/notificacoes/src/Notificacoes'
import { setAuthTokenProvider } from '../../services/apiClient'
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
  ArrowsClockwise,
  Database,
} from '@phosphor-icons/react'
import '../workspace/workspace.css'
import '../workspace/gabi.css'
import './admin.css'

export function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()

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
    { to: '/admin/produtos-gravity', label: t('admin.layout.produtos'),         icon: <ShoppingBagOpen weight="duotone" size={18} /> },
    { to: '/admin/usuarios-globais', label: t('admin.layout.usuarios_globais'), icon: <Users        weight="duotone" size={18} /> },
    { to: '/admin/financeiro-admin', label: t('admin.layout.financeiro'),       icon: <Receipt      weight="duotone" size={18} /> },
    { to: '/admin/historico-global', label: t('admin.layout.historico_global'), icon: <Desktop       weight="duotone" size={18} /> },
    { to: '/admin/deploy',       label: t('admin.layout.deploy_railway'),   icon: <CloudArrowUp    weight="duotone" size={18} /> },
    { to: '/admin/api-cockpit',  label: t('admin.layout.api-cockpit'),      icon: <Pulse           weight="duotone" size={18} /> },
    { to: '/admin/seguranca-admin', label: t('admin.layout.seguranca'),     icon: <ShieldCheck     weight="duotone" size={18} /> },
    { to: '/admin/ncm-integracao', label: t('admin.layout.ncm_sync', 'NCM Siscomex'), icon: <ArrowsClockwise weight="duotone" size={18} /> },
    { to: '/admin/cadastros-globais', label: t('admin.layout.cadastros_globais', 'Cadastros Globais'), icon: <Database weight="duotone" size={18} /> },
    { to: '/admin/testes-gerais', label: t('admin.layout.log_testes'),      icon: <Bug             weight="duotone" size={18} /> },
  ]
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()

  // Popula ShellStore via GET /api/v1/me (Clerk = porteiro, backend = fonte de verdade)
  useMeSync()
  // Sincroniza preferências de UI com o backend (cross-device)
  useUserPreferences({ id_usuario: user?.id, id_organizacao: 'gravity-hq' })

  // Registra provider de token Clerk para o apiClient.
  // Precisa rodar no layout (e não nas páginas individuais) senão qualquer
  // página admin acessada diretamente sem passar por /admin/produtos fica
  // sem token e recebe 401 em todas as chamadas — inclusive o runner de
  // testes (POST /admin/testes-gerais/run, GET /admin/testes-gerais/run/status).
  useEffect(() => {
    setAuthTokenProvider(() => getToken())
  }, [getToken])

  const isLight = currentTheme === 'light'

  const { signOut } = useClerk()

  // ── Localizador ────────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('admin')
  const [adminEcosystemNodes, setAdminEcosystemNodes] = useState<EcosystemNode[]>(
    buildEcosystemNodes({ currentProductId: 'admin', includeAdmin: true })
  )

  useEffect(() => {
    locAddEntry({ productId: 'admin', productLabel: 'Admin', productColor: '#10b981', pageLabel: 'Admin Panel', pagePath: '/admin' })
    async function loadAdminProducts() {
      try {
        const token = await getToken()
        const res = await fetch('/api/v1/admin/produtos-gravity', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const allProds: AdminProductItem[] = data.products ?? data
          const productNodes = buildAdminProductNodes(allProds)
          setAdminEcosystemNodes(buildEcosystemNodes({
            currentProductId: 'admin',
            produtoNodes: productNodes,
            includeAdmin: true,
          }))
        }
      } catch { /* silencioso */ }
    }
    loadAdminProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <HubButton onClick={() => navigate('/hub')} tooltip={t('admin.layout.voltar_hub_titulo', 'Voltar ao Hub')} />

          <CampoLocalizarExpandidoGlobal
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

          <Notificacoes />

          <LocalizadorGlobal
            workspaceName="Gravity HQ"
            currentProductId="admin"
            currentProductLabel="Admin Panel"
            currentProductColor="#10b981"
            currentPageLabel="Admin Panel"
            history={locHistory}
            nodes={adminEcosystemNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub')
              else if (node.type === 'configurador') navigate('/workspace/workspaces')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
            iconOnly
          />

          <SeletorIdiomaGlobal />

          {/* Divisor visual */}
          <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

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
