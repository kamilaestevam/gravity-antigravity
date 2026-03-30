import React from 'react'
import { useLocation } from 'react-router-dom'
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
  CurrencyDollar,
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import { MenuLateralGlobal, NavItem } from '@nucleo/menu-lateral-global'

interface SidebarProps {
  navItems?: NavItem[]
  moduleName?: string
  moduleColor?: string
  tenantName: string
  tenantPlan: string
}

/**
 * Sidebar — menu lateral modernizado usando MenuLateralGlobal do núcleo.
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

  const { isProductAllowed } = useShellStore()

  // Permissoes de produtos — usar isProductAllowed quando backend estiver conectado
  const hasBidCambio = isProductAllowed('bid-cambio') || true // habilitado por padrao para demo
  const hasPedidos = false
  const hasDuimp = false
  const hasTracking = false

  // Se o produto não proveu itens customizados, usamos o padrão da plataforma
  const defaultNavItems: NavItem[] = [
    // -- Produtos Gravity (primeiro) --
    {
      label: t('shell.menu.produtos_gravity'),
      icon: <Star weight="duotone" size={20} />,
      children: [
        { to: '/simulacusto', label: t('shell.menu.simula_custo'), icon: <Calculator weight="duotone" size={18} /> },
        { to: '/bid-cambio', label: t('shell.menu.bid_cambio'), icon: <CurrencyDollar weight="duotone" size={18} />, disabled: !hasBidCambio },
        { to: '/pedidos', label: t('shell.menu.pedidos_compra'), icon: <Package weight="duotone" size={18} />, disabled: !hasPedidos },
        { to: '/duimp', label: t('shell.menu.exportador_duimp'), icon: <FileArchive weight="duotone" size={18} />, disabled: !hasDuimp },
        { to: '/tracking', label: t('shell.menu.tracking_carga'), icon: <Anchor weight="duotone" size={18} />, disabled: !hasTracking }
      ]
    },

    // ── Meu Espaço (grupo expansível) ───────────────────────────────────
    {
      label: t('shell.menu.meu_espaco'),
      icon: <House weight="duotone" size={20} />,
      children: [
        { to: '/meu-espaco',          label: t('shell.menu.dashboard', 'Dashboard'),         icon: <House weight="duotone" size={18} /> },
        { to: '/meu-espaco/atividades', label: t('shell.menu.minhas_atividades', 'Minhas Atividades'), icon: <BookOpen weight="duotone" size={18} /> },
        { to: '/meu-espaco/email',      label: t('shell.menu.emails', 'E-mails'),               icon: <Envelope weight="duotone" size={18} /> },
        { to: '/meu-espaco/whatsapp',   label: t('shell.menu.whatsapp', 'WhatsApp'),            icon: <ChatCircle weight="duotone" size={18} /> },
      ]
    },

    // ── Geral ───────────────────────────────────────────────────────────
    { to: '/notificacoes', label: t('shell.menu.notificacoes', 'Notificações'), icon: <Bell weight="duotone" size={20} /> },
    { to: '/historico',    label: t('shell.menu.historico', 'Histórico'),       icon: <FileText weight="duotone" size={20} /> },
    { to: '/conector-erp', label: t('shell.menu.conector_erp', 'Conector ERP'), icon: <Plugs weight="duotone" size={20} /> },
    { to: '/configurador', label: t('shell.menu.configuracoes', 'Configurações'), icon: <Gear weight="duotone" size={20} /> },
  ]

  const navItems = customNavItems || defaultNavItems

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
