import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { useShellStore } from './store'
import { MenuLateralGlobal, NavItem } from '@nucleo/menu-lateral-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'

interface ProductSidebarProps {
  tenantName: string
  tenantPlan: string
  navItems?: NavItem[]
  moduleName?: string
  moduleColor?: string
}

/**
 * ProductSidebar — Menu focado exclusivamente no produto ativo.
 *
 * Suprime os itens globais (Meu Espaço, Produtos Gravity, etc.)
 * e exibe apenas os itens do produto + atalho "Voltar ao Hub".
 * Mesmo padrão do ContextualSidebar para /processo/*.
 */
export function ProductSidebar({
  tenantName,
  tenantPlan,
  navItems = [],
  moduleName = 'Produto',
  moduleColor,
}: ProductSidebarProps) {
  const { sidebarOpen, toggleSidebar } = useShellStore()
  const navigate = useNavigate()
  const location = useLocation()

  const resolvedColor = moduleColor ?? (() => {
    const match = location.pathname.match(/^\/produto\/([^/]+)/)
    return match ? getProdutoMeta(match[1]).color : '#818cf8'
  })()

  const items: NavItem[] = [
    {
      label: 'Voltar ao Hub',
      icon: <ArrowLeft weight="bold" size={18} color="#94a3b8" />,
      to: '/hub?select=1',
    },
    ...navItems,
  ]

  return (
    <MenuLateralGlobal
      tenantName={tenantName}
      tenantPlan={tenantPlan}
      navItems={items}
      moduleName={moduleName}
      moduleColor={resolvedColor}
      isCollapsed={!sidebarOpen}
      onToggleCollapse={toggleSidebar}
    />
  )
}
