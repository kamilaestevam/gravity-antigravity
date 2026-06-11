/**

 * PedidosVisualizacaoTabs — pills no topo das telas de visualização do Pedido

 * (Insights | Lista | Dashboard | Kanban). Mesmo padrão de TodosProcessosTabs.

 */



import React, { useCallback } from 'react'

import { NavLink } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { useQueryClient } from '@tanstack/react-query'

import { ChartPieSlice, ChartBar, ListBullets, Kanban } from '@phosphor-icons/react'

import { useShellStore } from '@gravity/shell'

import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'

import { BloqueioPermissaoOpaco } from '../shared/permissoes/BloqueioPermissaoOpaco'

import { useEscopoWorkspacesPedido } from '../shared/useEscopoWorkspacesPedido'

import { resolverIdsWorkspacesParaApi } from '../shared/useEscopoWorkspacesPedido'

import { prefetchVisualizacao } from '../shared/pedidos-prefetch'

import type { PedidoVisualizacaoId } from './pedidos-visualizacao-context'
import { testidTabSeletor } from './pedidos-visualizacao-context'

import './PedidosVisualizacaoTabs.css'



interface TabDef {

  id: PedidoVisualizacaoId

  to: string

  labelKey: string

  icone: React.ReactNode

  pode: boolean

}



function TabLink({

  tab,

  label,

  onPrefetch,

}: {

  tab: TabDef

  label: string

  onPrefetch: (id: PedidoVisualizacaoId) => void

}) {

  const link = (

    <NavLink

      to={tab.to}

      data-testid={testidTabSeletor(tab.id)}

      className={({ isActive }) => `pvt-tab ${isActive ? 'pvt-tab--active' : ''}`}

      aria-disabled={!tab.pode ? true : undefined}

      tabIndex={tab.pode ? undefined : -1}

      onMouseEnter={() => onPrefetch(tab.id)}

      onFocus={() => onPrefetch(tab.id)}

      onClick={e => { if (!tab.pode) e.preventDefault() }}

    >

      {tab.icone}

      <span>{label}</span>

    </NavLink>

  )



  return (

    <BloqueioPermissaoOpaco pode={tab.pode} modo="opaco-item" motivo="Sem permissão">

      {link}

    </BloqueioPermissaoOpaco>

  )

}



export function PedidosVisualizacaoTabs() {

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const { podeVer, carregando: permissoesCarregando } = usePermissoesPedido()

  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)

  const idsWorkspacesEscopo = useEscopoWorkspacesPedido(s => s.idsWorkspacesEscopo)

  const escopoHidratado = useEscopoWorkspacesPedido(s => s.hidratado)



  const idsWorkspacesFiltro = resolverIdsWorkspacesParaApi(

    idsWorkspacesEscopo,

    idWorkspaceAtivo ?? '',

  )



  const onPrefetch = useCallback(

    (id: PedidoVisualizacaoId) => {

      prefetchVisualizacao(queryClient, id, idsWorkspacesFiltro, escopoHidratado, idsWorkspacesEscopo.length)

    },

    [queryClient, idsWorkspacesFiltro, escopoHidratado, idsWorkspacesEscopo.length],

  )



  const tabs: TabDef[] = [

    {

      id: 'visao-geral',

      to: '/pedido/pedidos/visao-geral',

      labelKey: 'pedido.nav.insights',

      icone: <ChartPieSlice weight="duotone" size={16} />,

      pode: permissoesCarregando || podeVer('dashboard'),

    },

    {

      id: 'lista',

      to: '/pedido/pedidos/lista',

      labelKey: 'pedido.nav.lista',

      icone: <ListBullets weight="duotone" size={16} />,

      pode: permissoesCarregando || podeVer('lista'),

    },

    {

      id: 'dashboard',

      to: '/pedido/pedidos/dashboard',

      labelKey: 'pedido.nav.dashboard',

      icone: <ChartBar weight="duotone" size={16} />,

      pode: permissoesCarregando || podeVer('dashboard'),

    },

    {

      id: 'kanban',

      to: '/pedido/pedidos/kanban',

      labelKey: 'pedido.nav.kanban',

      icone: <Kanban weight="duotone" size={16} />,

      pode: permissoesCarregando || podeVer('kanban'),

    },

  ]



  return (

    <nav className="pvt-tabs" aria-label="Modo de visualização de pedidos">

      {tabs.map(tab => (

        <TabLink

          key={tab.to}

          tab={tab}

          label={t(tab.labelKey)}

          onPrefetch={onPrefetch}

        />

      ))}

    </nav>

  )

}


