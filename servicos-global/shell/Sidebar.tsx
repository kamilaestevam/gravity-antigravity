import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  House,
  ChartBar,
  Envelope,
  ChatCircle,
  Clock,
  Bell,
  FileText,
  BookOpen,
  Headset,
  Plugs,
  Star,
  Gear,
  CaretDoubleLeft,
  CaretDoubleRight,
  Calculator,
  Truck,
  Package,
  Anchor,
  FileArchive,
  CaretDown,
  ShoppingBagOpen,
  Lock,
  Hourglass,
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import { MenuLateralGlobal, NavItem } from '@nucleo/menu-lateral-global'
import { useProductMenu, ProductMenuItem } from './hooks/useProductMenu'

interface SidebarProps {
  navItems?: NavItem[]
  moduleName?: string
  moduleColor?: string
  tenantName: string
  tenantPlan: string
}

/** Ícones por slug de produto (expandir conforme novos produtos surgirem) */
const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  'simula-custo':            <Calculator weight="duotone" size={18} />,
  'pedidos-de-compra':       <Package weight="duotone" size={18} />,
  'exportador-duimp':        <FileArchive weight="duotone" size={18} />,
  'tracking-de-carga':       <Anchor weight="duotone" size={18} />,
  'smart-read':              <FileText weight="duotone" size={18} />,
  'bid-frete-internacional': <Anchor weight="duotone" size={18} />,
  'bid-cambio':              <ChartBar weight="duotone" size={18} />,
}

/**
 * Sidebar — menu lateral modernizado usando MenuLateralGlobal do núcleo.
 *
 * Regra do menu "Produtos Gravity":
 * - Produtos habilitados na organização/workspace/usuário → link direto
 * - Produtos do catálogo não contratados → "Contratar" (leva à Gravity Store)
 * - Produtos mockados na Gravity Store → "Em Breve" (desabilitado)
 */
export function Sidebar({
  navItems: customNavItems,
  moduleName = 'SimulaCusto',
  moduleColor = '#818cf8',
  tenantName,
  tenantPlan
}: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useShellStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { products } = useProductMenu()

<<<<<<< Updated upstream
  const { isProductAllowed } = useShellStore()

  // Mock de Permissões: Numa etapa futura, leremos "company_products" do contexto global.
  const hasPedidos = false;
  const hasDuimp = false;
  const hasTracking = false;
=======
  /** Monta children do grupo "Produtos Gravity" dinamicamente */
  function buildProductChildren(): NavItem[] {
    return products.map((p) => {
      const icon = PRODUCT_ICONS[p.slug] || <Package weight="duotone" size={18} />
>>>>>>> Stashed changes

      switch (p.status) {
        case 'active':
          return {
            to: `/produto/${p.slug}`,
            label: p.name,
            icon,
          }
        case 'contract':
          return {
            to: '/store',
            label: p.name,
            icon,
            badge: 'Contratar',
            badgeVariant: 'accent' as const,
          }
        case 'coming_soon':
          return {
            to: undefined as any,
            label: p.name,
            icon,
            disabled: true,
            badge: 'Em Breve',
            badgeVariant: 'muted' as const,
          }
      }
    })
  }

  // Se o produto proveu itens customizados, usamos eles
  // Caso contrário, usamos o padrão da plataforma
  const defaultNavItems: NavItem[] = [
<<<<<<< Updated upstream
    // -- Produtos Gravity (primeiro) --
    {
      label: 'Produtos Gravity',
      icon: <Star weight="duotone" size={20} />,
      children: [
        { to: '/simulacusto', label: 'SimulaCusto', icon: <Calculator weight="duotone" size={18} /> },
        { to: '/pedidos', label: 'Pedidos de Compra', icon: <Package weight="duotone" size={18} />, disabled: !hasPedidos },
        { to: '/duimp', label: 'Exportador DUIMP', icon: <FileArchive weight="duotone" size={18} />, disabled: !hasDuimp },
        { to: '/tracking', label: 'Tracking de Carga', icon: <Anchor weight="duotone" size={18} />, disabled: !hasTracking }
      ]
    },

    // ── Meu Espaço (grupo expansível) ───────────────────────────────────
=======
    // ── Meu Espaço (primeiro) ──────────────────────────────────────────
>>>>>>> Stashed changes
    {
      label: 'Meu Espaço',
      icon: <House weight="duotone" size={20} />,
      children: [
        { to: '/meu-espaco',            label: t('shell.menu.dashboard', 'Dashboard'),          icon: <House weight="duotone" size={18} /> },
        { to: '/meu-espaco/atividades', label: t('shell.menu.atividades', 'Minhas Atividades'), icon: <BookOpen weight="duotone" size={18} /> },
        { to: '/meu-espaco/email',      label: t('shell.menu.email', 'E-mails'),                icon: <Envelope weight="duotone" size={18} /> },
        { to: '/meu-espaco/whatsapp',   label: t('shell.menu.whatsapp', 'WhatsApp'),            icon: <ChatCircle weight="duotone" size={18} /> },
      ]
    },

<<<<<<< Updated upstream
    // ── Geral ───────────────────────────────────────────────────────────
=======
    // ── Produtos Gravity (abaixo de Meu Espaço) ───────────────────────
    {
      label: 'Produtos Gravity',
      icon: <Star weight="duotone" size={20} />,
      children: buildProductChildren(),
    },

    // ── Geral ──────────────────────────────────────────────────────────
>>>>>>> Stashed changes
    { to: '/notificacoes', label: t('shell.menu.notificacoes', 'Notificações'), icon: <Bell weight="duotone" size={20} /> },
    { to: '/historico',    label: t('shell.menu.historico', 'Histórico'),       icon: <FileText weight="duotone" size={20} /> },
    { to: '/conector-erp', label: t('shell.menu.conector_erp', 'Conector ERP'), icon: <Plugs weight="duotone" size={20} /> },
    { to: '/configurador', label: t('shell.menu.configuracoes', 'Configurações'), icon: <Gear weight="duotone" size={20} /> },
  ]

  // Grupo "Produtos Gravity" — sempre presente, injetado automaticamente
  const productGroup: NavItem = {
    label: 'Produtos Gravity',
    icon: <Star weight="duotone" size={20} />,
    children: buildProductChildren(),
  }

  // Se o produto proveu navItems customizados, injeta "Produtos Gravity" logo após "Meu Espaço"
  // Se não, usa o defaultNavItems que já inclui o grupo
  let navItems: NavItem[]
  if (customNavItems) {
    const meuEspacoIdx = customNavItems.findIndex(item => item.label === 'Meu Espaço')
    const insertAt = meuEspacoIdx >= 0 ? meuEspacoIdx + 1 : 0
    navItems = [
      ...customNavItems.slice(0, insertAt),
      productGroup,
      ...customNavItems.slice(insertAt),
    ]
  } else {
    navItems = defaultNavItems
  }

  return (
    <MenuLateralGlobal
      tenantName={tenantName}
      tenantPlan={tenantPlan}
      navItems={navItems}
      moduleName={moduleName}
      moduleColor={moduleColor}
      isCollapsed={!sidebarOpen}
      onToggleCollapse={toggleSidebar}
    />
  )
}
