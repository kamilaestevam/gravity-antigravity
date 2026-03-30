import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  FileText,
  ChatCircle,
  CurrencyCircleDollar,
  Briefcase
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import { MenuLateralGlobal, NavItem } from '@nucleo/menu-lateral-global'

interface ContextualSidebarProps {
  tenantName: string
  tenantPlan: string
}

/**
 * ContextualSidebar — Menu focado inteiramente no Processo/Deep Work.
 * Suprime os itens corporativos e injeta um controle de retorno "<- Voltar".
 */
export function ContextualSidebar({ 
  tenantName,
  tenantPlan 
}: ContextualSidebarProps) {
  const { sidebarOpen, toggleSidebar } = useShellStore()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  // Extrai o ID do processo da URL (ex: /processo/1234 -> 1234)
  const processId = location.pathname.split('/')[2] || t('shell.desconhecido')

  const customNavItems: NavItem[] = [
    {
       // O item de 'Voltar' funciona como um escape hatch do Deep Work.
       label: t('shell.sair_processo'),
       icon: <ArrowLeft weight="bold" size={20} color="#f87171" />,
       to: '/dashboard',
       // Nós usamos 'to' para a Rota via Link, mas poderíamos interceptar o clique se necessário.
    },
    {
      label: `${t('shell.processo_prefixo')} #${processId.substring(0, 6)}...`,
      icon: <Briefcase weight="duotone" size={20} />,
      children: [
        { to: `/processo/${processId}/resumo`, label: t('shell.resumo_di'), icon: <FileText weight="duotone" size={18} /> },
        { to: `/processo/${processId}/faturas`, label: t('shell.financeiro'), icon: <CurrencyCircleDollar weight="duotone" size={18} /> },
        { to: `/processo/${processId}/chat`, label: t('shell.mensageria'), icon: <ChatCircle weight="duotone" size={18} /> },
      ]
    }
  ]

  return (
    <MenuLateralGlobal
      tenantName={tenantName}
      tenantPlan={tenantPlan}
      navItems={customNavItems}
      moduleName={t('shell.deep_work')}
      moduleColor="#10b981" // Um verde ou cor destacada para simbolizar "foco interno"
      isCollapsed={!sidebarOpen}
      onToggleCollapse={toggleSidebar}
      defaultCollapsed={false}
    />
  )
}
