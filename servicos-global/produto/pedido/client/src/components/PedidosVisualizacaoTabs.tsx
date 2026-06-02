/**
 * PedidosVisualizacaoTabs — pills no topo das telas de visualização do Pedido
 * (Lista | Kanban | Visão Geral | Dashboard). Mesmo padrão de TodosProcessosTabs.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChartPieSlice, ChartBar, ListBullets, Kanban } from '@phosphor-icons/react'
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
import { BloqueioPermissaoOpaco } from '../shared/permissoes/BloqueioPermissaoOpaco'
import './PedidosVisualizacaoTabs.css'

interface TabDef {
  to: string
  labelKey: string
  icone: React.ReactNode
  pode: boolean
}

function TabLink({ to, label, icone, pode }: { to: string; label: string; icone: React.ReactNode; pode: boolean }) {
  const link = (
    <NavLink
      to={to}
      className={({ isActive }) => `pvt-tab ${isActive ? 'pvt-tab--active' : ''}`}
      aria-disabled={!pode ? true : undefined}
      tabIndex={pode ? undefined : -1}
      onClick={e => { if (!pode) e.preventDefault() }}
    >
      {icone}
      <span>{label}</span>
    </NavLink>
  )

  return (
    <BloqueioPermissaoOpaco pode={pode} modo="opaco-item" motivo="Sem permissão">
      {link}
    </BloqueioPermissaoOpaco>
  )
}

export function PedidosVisualizacaoTabs() {
  const { t } = useTranslation()
  const { podeVer, carregando: permissoesCarregando } = usePermissoesPedido()

  const tabs: TabDef[] = [
    {
      to: '/pedido/pedidos/lista',
      labelKey: 'pedido.nav.lista',
      icone: <ListBullets weight="duotone" size={16} />,
      pode: permissoesCarregando || podeVer('lista'),
    },
    {
      to: '/pedido/pedidos/kanban',
      labelKey: 'pedido.nav.kanban',
      icone: <Kanban weight="duotone" size={16} />,
      pode: permissoesCarregando || podeVer('kanban'),
    },
    {
      to: '/pedido/pedidos/visao-geral',
      labelKey: 'pedido.nav.visao_geral',
      icone: <ChartPieSlice weight="duotone" size={16} />,
      pode: permissoesCarregando || podeVer('dashboard'),
    },
    {
      to: '/pedido/pedidos/dashboard',
      labelKey: 'pedido.nav.dashboard',
      icone: <ChartBar weight="duotone" size={16} />,
      pode: permissoesCarregando || podeVer('dashboard'),
    },
  ]

  return (
    <nav className="pvt-tabs" aria-label="Modo de visualização de pedidos">
      {tabs.map(tab => (
        <TabLink
          key={tab.to}
          to={tab.to}
          label={t(tab.labelKey)}
          icone={tab.icone}
          pode={tab.pode}
        />
      ))}
    </nav>
  )
}
