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
  CurrencyDollar,
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

/** Icones por slug de produto */
const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  'simula-custo':            <Calculator weight="duotone" size={18} />,
  'pedidos-de-compra':       <Package weight="duotone" size={18} />,
  'exportador-duimp':        <FileArchive weight="duotone" size={18} />,
  'tracking-de-carga':       <Anchor weight="duotone" size={18} />,
  'smart-read':              <FileText weight="duotone" size={18} />,
  'bid-frete-internacional': <Anchor weight="duotone" size={18} />,
  'bid-cambio':              <CurrencyDollar weight="duotone" size={18} />,
}

/**
 * Sidebar — menu lateral usando MenuLateralGlobal do nucleo.
 *
 * Produtos habilitados → link direto
 * Produtos nao contratados → "Contratar" (leva a Store)
 * Produtos mockados → "Em Breve" (desabilitado)
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

  /** Monta children do grupo "Produtos Gravity" dinamicamente */
  function buildProductChildren(): NavItem[] {
    return products.map((p) => {
      const icon = PRODUCT_ICONS[p.slug] || <Package weight="duotone" size={18} />

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

  const defaultNavItems: NavItem[] = [
    // ── Meu Espaco ──
    {
      label: t('shell.menu.meu_espaco', 'Meu Espaco'),
      icon: <House weight="duotone" size={20} />,
      children: [
        { to: '/meu-espaco',            label: t('shell.menu.dashboard', 'Dashboard'),          icon: <House weight="duotone" size={18} /> },
        { to: '/meu-espaco/atividades', label: t('shell.menu.minhas_atividades', 'Minhas Atividades'), icon: <BookOpen weight="duotone" size={18} /> },
        { to: '/meu-espaco/email',      label: t('shell.menu.emails', 'E-mails'),               icon: <Envelope weight="duotone" size={18} /> },
        { to: '/meu-espaco/whatsapp',   label: t('shell.menu.whatsapp', 'WhatsApp'),            icon: <ChatCircle weight="duotone" size={18} /> },
      ]
    },

    // ── Produtos Gravity ──
    {
      label: 'Produtos Gravity',
      icon: <Star weight="duotone" size={20} />,
      children: buildProductChildren(),
    },

    // ── Geral ──
    { to: '/notificacoes', label: t('shell.menu.notificacoes', 'Notificacoes'), icon: <Bell weight="duotone" size={20} /> },
    { to: '/historico',    label: t('shell.menu.historico', 'Historico'),       icon: <FileText weight="duotone" size={20} /> },
    { to: '/conector-erp', label: t('shell.menu.conector_erp', 'Conector ERP'), icon: <Plugs weight="duotone" size={20} /> },
    { to: '/configurador', label: t('shell.menu.configuracoes', 'Configuracoes'), icon: <Gear weight="duotone" size={20} /> },
  ]

  // Grupo "Produtos Gravity" — sempre presente
  const productGroup: NavItem = {
    label: 'Produtos Gravity',
    icon: <Star weight="duotone" size={20} />,
    children: buildProductChildren(),
  }

  // Se o produto proveu navItems customizados, injeta "Produtos Gravity" apos "Meu Espaco"
  let navItems: NavItem[]
  if (customNavItems) {
    const meuEspacoIdx = customNavItems.findIndex(item => item.label === 'Meu Espaco')
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
