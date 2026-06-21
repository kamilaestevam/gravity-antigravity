/**
 * SmartReadVisualizacaoTabs — pills Insights | Lista | Dashboard | Kanban
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ChartPieSlice, ListBullets } from '@phosphor-icons/react'
import { rotaSmartRead, type SmartReadVisualizacaoId } from '../shared/rotas-smart-read'
import { testidTabSeletorSmartRead } from './smart-read-visualizacao-context'
import './SmartReadVisualizacaoTabs.css'

const TABS: { id: SmartReadVisualizacaoId; label: string; icone: React.ReactNode }[] = [
  { id: 'insights', label: 'Insights', icone: <ChartPieSlice weight="duotone" size={16} /> },
  { id: 'lista', label: 'Lista', icone: <ListBullets weight="duotone" size={16} /> },
]

export function SmartReadVisualizacaoTabs() {
  return (
    <nav className="srt-tabs" aria-label="Modo de visualização do Smart Read">
      {TABS.map((tab) => (
        <NavLink
          key={tab.id}
          to={rotaSmartRead(tab.id)}
          data-testid={testidTabSeletorSmartRead(tab.id)}
          className={({ isActive }) => `srt-tab ${isActive ? 'srt-tab--active' : ''}`}
        >
          {tab.icone}
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
