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
import { ToastContainer, useShellStore, useUserPreferences, useSyncClerkToShell } from '@gravity/shell'
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
  const navigate = useNavigate()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()

  useSyncClerkToShell()

  const companyId = sessionStorage.getItem('gravity_company_id')
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'

  useUserPreferences({
    userId: user?.id,
    tenantId: user?.organizationMemberships?.[0]?.organization?.id ?? 'default',
  })

  const isLight = currentTheme === 'light'
  const [isGabiOpen, setIsGabiOpen] = useState(false)
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutoAtivo[]>([])

  // Se não selecionou workspace, volta ao Hub
  if (!companyId) {
    return <Navigate to="/hub" replace />
  }

  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  // Carregar produtos ativos do workspace
  useEffect(() => {
    async function loadProducts() {
      try {
        const token = await getToken()
        const res = await fetch(`/api/v1/companies/${companyId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const ativos = data.products
            .filter((p: { is_active: boolean }) => p.is_active)
            .map((p: { product_key: string; catalog?: { name: string; slug: string } }) => ({
              nome: p.catalog?.name ?? p.product_key,
              slug: p.catalog?.slug ?? p.product_key,
              rota: `/produto/${p.catalog?.slug ?? p.product_key}`,
            }))
          setProdutosAtivos(ativos)
        }
      } catch {
        // Fallback silencioso
      }
    }
    loadProducts()
  }, [companyId, getToken])

  // Menu lateral
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = []

    // Meu Espaço
    items.push({
      label: 'Meu Espaço',
      icon: <House weight="duotone" size={18} />,
      children: [
        { to: '/core', label: 'Dashboard', icon: <House weight="duotone" size={18} /> },
        { to: '/core/atividades', label: 'Atividades', icon: <ListChecks weight="duotone" size={18} /> },
        { to: '/core/email', label: 'Email', icon: <Envelope weight="duotone" size={18} /> },
        { to: '/core/whatsapp', label: 'WhatsApp', icon: <WhatsappLogo weight="duotone" size={18} /> },
      ],
    })

    // Produtos Gravity (dinâmico)
    items.push({
      label: 'Produtos Gravity',
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
        label: 'Explorar Catálogo',
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })
    }

    // Divisor
    items.push({ label: '', sectionDivider: true, icon: null })

    // Processo
    items.push({
      to: '/produto/processo',
      label: 'Processo',
      icon: <Folders weight="duotone" size={18} />,
    })

    // Notificações
    items.push({
      to: '/core/notificacoes',
      label: 'Notificações',
      icon: <Bell weight="duotone" size={18} />,
    })

    // Histórico
    items.push({
      to: '/core/historico',
      label: 'Histórico',
      icon: <ClockCounterClockwise weight="duotone" size={18} />,
    })

    // Conector ERP
    items.push({
      to: '/core/conector-erp',
      label: 'Conector ERP',
      icon: <Plug weight="duotone" size={18} />,
    })

    // Configurações
    items.push({
      to: '/core/configuracoes',
      label: 'Configurações',
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

  return (
    <div className="ws-shell">
      {/* ── Menu Lateral ── */}
      <MenuLateralGlobal
        tenantName={companyName}
        tenantPlan="Profissional"
        navItems={navItems}
        moduleName="Core"
        moduleColor="#818cf8"
        defaultCollapsed={false}
      />

      {/* ── Área principal ── */}
      <div className="ws-main">
        {/* ── Header ── */}
        <div className="ws-global-actions">
          <TooltipGlobal titulo="Voltar ao Hub" descricao="Retornar à seleção de workspace">
            <button
              className="ws-global-btn ws-voltar-btn"
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

          <TooltipGlobal titulo="Dicas e Explicações" descricao={tooltipsDisabled ? 'Clique para habilitar dicas' : 'Clique para desabilitar dicas'}>
            <button
              className="ws-global-btn"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--ws-muted)' : 'var(--ws-accent)' }}
              type="button"
            >
              <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>
          </TooltipGlobal>

          <LanguageSwitcherGlobal />

          <React.Suspense fallback={null}>
            <Notificacoes tenantId={user?.organizationMemberships?.[0]?.organization?.id ?? 'default'} userId={user?.id ?? 'user'} />
          </React.Suspense>

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole="Membro"
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateOrganizacao={() => navigate('/workspace/organizacao')}
            onNavigateAssinaturas={() => navigate('/workspace/assinaturas')}
            onSignOut={() => signOut()}
            isAdmin={false}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            onNavigateConfigurador={() => navigate('/workspace/workspaces')}
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
        <TooltipGlobal descricao="Falar com a Gabi IA">
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
