/**
 * Core.tsx — Tela principal do workspace após seleção
 *
 * Menu lateral com:
 *   - Meu Espaço (Dashboard, Atividades, Email, WhatsApp)
 *   - Produtos Gravity (dinamico baseado em produtos ativos)
 *   - Notificações, Histórico, Conector ERP, Configurações
 *
 * O conteúdo muda conforme a rota filha (Outlet).
 * Botão "← Hub" no header para voltar à seleção de workspace.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import {
  House,
  ListChecks,
  Envelope,
  WhatsappLogo,
  ShoppingBagOpen,
  Package,
  Bell,
  ClockCounterClockwise,
  Plug,
  GearSix,
  Folders,
  FileText,
  Sparkle,
  ArrowLeft,
  MagnifyingGlass,
  Info,
} from '@phosphor-icons/react'
import { MenuLateralGlobal, type NavItem } from '@nucleo/menu-lateral-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import { buildTenantProductNodes, HUB_NODE, CONFIGURADOR_NODE, type CompanyProductItem } from '../utils/ecosystemNodes'
import { ToastContainer, useShellStore, useUserPreferences, useSyncClerkToShell } from '@gravity/shell'
import { invalidateRoleCache } from '../hooks/useLoadSystemRole'
import './workspace/workspace.css'
import './workspace/gabi.css'

// Lazy-load componentes pesados — antes eram estáticos e bloqueavam o render do Core
const Notificacoes = React.lazy(() => import('../../../tenant/notificacoes/src/Notificacoes').then(m => ({ default: m.Notificacoes })))
const GabiChat = React.lazy(() => import('@tenant/gabi/src/Gabi'))

interface ProdutoAtivo {
  nome: string
  slug: string
  rota: string
}

export function Core() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, addNotification, currentUser } = useShellStore()

  useSyncClerkToShell()

  const companyId = sessionStorage.getItem('gravity_company_id')
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'

  // ── Localizador ────────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('core')
  useEffect(() => {
    locAddEntry({ productId: 'core', productLabel: 'Core', productColor: '#a78bfa', pageLabel: 'Core', pagePath: '/core' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nós do ecossistema — populados dinamicamente após carregar produtos
  const [coreEcosystemNodes, setCoreEcosystemNodes] = useState<EcosystemNode[]>([HUB_NODE, CONFIGURADOR_NODE])

  const [tipoEmpresa, setTipoEmpresa] = useState('')

  useEffect(() => {
    async function fetchTipoEmpresa() {
      try {
        const token = await getToken()
        const res = await fetch('/api/v1/tenants/me', {
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

  useUserPreferences({
    userId: user?.id,
    tenantId: user?.organizationMemberships?.[0]?.organization?.id ?? 'default',
  })

  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutoAtivo[]>([])

  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  // Carregar produtos ativos do workspace
  useEffect(() => {
    if (!companyId) return
    async function loadProducts() {
      try {
        const token = await getToken()
        const res = await fetch(`/api/v1/companies/${companyId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const allProds: CompanyProductItem[] = data.products
          // Menu lateral — só os produtos ativos
          const ativos = allProds
            .filter(p => p.is_active)
            .map(p => ({
              nome: p.catalog?.name ?? p.product_key,
              slug: p.catalog?.slug ?? p.product_key,
              rota: `/produto/${p.catalog?.slug ?? p.product_key}`,
            }))
          setProdutosAtivos(ativos)
          // Mapa do ecossistema — todos os produtos (ativos=accessible, inativos=locked)
          const productNodes = buildTenantProductNodes(allProds)
          setCoreEcosystemNodes([HUB_NODE, CONFIGURADOR_NODE, ...productNodes])
        }
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('hub.erro_carregar_produtos') })
      }
    }
    loadProducts()
  }, [companyId, getToken])

  // Menu lateral
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = []

    // Meu Espaço
    items.push({
      label: t('shell.menu.meu_espaco'),
      icon: <House weight="duotone" size={18} />,
      children: [
        { to: '/core', label: t('shell.menu.dashboard'), icon: <House weight="duotone" size={18} /> },
        { to: '/core/atividades', label: t('shell.menu.minhas_atividades'), icon: <ListChecks weight="duotone" size={18} /> },
        { to: '/core/email', label: t('shell.menu.email'), icon: <Envelope weight="duotone" size={18} /> },
        { to: '/core/whatsapp', label: t('shell.menu.whatsapp'), icon: <WhatsappLogo weight="duotone" size={18} /> },
      ],
    })

    // Produtos Gravity (dinâmico)
    items.push({
      label: t('shell.menu.produtos_gravity'),
      sectionDivider: true,
      icon: <ShoppingBagOpen weight="duotone" size={18} />,
    })

    if (produtosAtivos.length > 0) {
      produtosAtivos.forEach(prod => {
        items.push({
          to: prod.rota,
          label: prod.nome,
          icon: <Package weight="duotone" size={18} />,
        })
      })
    } else {
      items.push({
        to: '/store',
        label: t('hub.explorar_catalogo'),
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })
    }

    // Divisor
    items.push({ label: '', sectionDivider: true, icon: null })

    // Processo
    items.push({
      to: '/produto/processo',
      label: t('shell.processo_prefixo'),
      icon: <Folders weight="duotone" size={18} />,
    })

    // Notificações
    items.push({
      to: '/core/notificacoes',
      label: t('shell.menu.notificacoes'),
      icon: <Bell weight="duotone" size={18} />,
    })

    // Histórico
    items.push({
      to: '/core/historico',
      label: t('shell.menu.historico'),
      icon: <ClockCounterClockwise weight="duotone" size={18} />,
    })

    // Conector ERP
    items.push({
      to: '/core/conector-erp',
      label: t('shell.menu.conector_erp'),
      icon: <Plug weight="duotone" size={18} />,
    })

    // Configurações
    items.push({
      to: '/core/configuracoes',
      label: t('shell.menu.configuracoes'),
      icon: <GearSix weight="duotone" size={18} />,
    })

    return items
  }, [produtosAtivos])

  // Theme sync — força o tema correto ao montar
  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  useEffect(() => {
    document.body.classList.toggle('tooltips-disabled', tooltipsDisabled)
  }, [tooltipsDisabled])

  // Se não selecionou workspace, volta ao Hub (após todos os hooks)
  if (!companyId) {
    return <Navigate to="/hub" replace />
  }

  return (
    <div className="ws-shell">
      {/* ── Menu Lateral ── */}
      <MenuLateralGlobal
        tenantName={companyName}
        tenantPlan={tipoEmpresa}
        navItems={navItems}
        moduleName="Core"
        moduleColor="#818cf8"
        defaultCollapsed={false}
      />

      {/* ── Área principal ── */}
      <div className="ws-main">
        {/* ── Header ── */}
        <div className="ws-global-actions">
          <TooltipGlobal titulo={t('shell.voltar_hub')} descricao={t('shell.voltar_hub')}>
            <button
              onClick={() => navigate('/hub')}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                border: '1px solid rgba(129,140,248,0.25)',
                background: 'rgba(129,140,248,0.08)',
                color: '#818cf8',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)' }}
            >
              <ArrowLeft size={16} weight="bold" />
              Hub
            </button>
          </TooltipGlobal>

          <LocalizarExpandidoCampoGlobal
            onBuscarNavigate={(term) => {
              const termLower = term.toLowerCase()
              const flat = navItems.flatMap(i => i.children ? i.children : [i])
              const target = flat.find(item => item.label?.toLowerCase().includes(termLower))
              if (target?.to) navigate(target.to)
            }}
          />

          <TooltipGlobal titulo={t('shell.label_habilitar_dicas')} descricao={tooltipsDisabled ? t('shell.habilitar_dicas') : t('shell.desabilitar_dicas')}>
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          {/* Localizador — Onde estou */}
          <LocalizadorGlobal
            workspaceName={companyName}
            currentProductId="core"
            currentProductLabel="Core"
            currentProductColor="#a78bfa"
            currentPageLabel="Core"
            history={locHistory}
            nodes={coreEcosystemNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')          navigate('/hub')
              else if (node.type === 'configurador') navigate('/configurador')
              else if (node.type === 'produto') navigate(`/produto/${node.id}`)
            }}
          />

          <LanguageSwitcherGlobal />

          <React.Suspense fallback={null}>
            <Notificacoes tenantId={user?.organizationMemberships?.[0]?.organization?.id ?? 'default'} userId={user?.id ?? 'user'} />
          </React.Suspense>

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={currentUser.role ?? t('shell.papel_membro')}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/workspace/organizacao')}
            onNavigateAssinaturas={() => navigate('/workspace/assinaturas')}
            onSignOut={() => {
              invalidateRoleCache()
              sessionStorage.removeItem('gravity_company_id')
              sessionStorage.removeItem('gravity_company_name')
              signOut()
            }}
            isAdmin={false}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            onNavigateConfigurador={() => navigate('/workspace/workspaces')}
            compact
          />
        </div>

        {/* ── Conteúdo ── */}
        <div className="ws-content">
          <Outlet />
        </div>
      </div>

      {/* ── Gabi IA ── */}
      {isGabiOpen && (
        <div className="ws-gabi-panel">
          <React.Suspense fallback={null}>
            <GabiChat onClose={() => setIsGabiOpen(false)} />
          </React.Suspense>
        </div>
      )}

      {!isGabiOpen && (
        <TooltipGlobal descricao={t('shell.menu.gabi')}>
          <button className="ws-gabi-trigger" onClick={() => setIsGabiOpen(true)}>
            <Sparkle weight="fill" size={28} />
          </button>
        </TooltipGlobal>
      )}

      <ToastContainer />
    </div>
  )
}

export default Core
