import React, { cloneElement, useState } from 'react'
import { MenuTopoGlobal, type MenuTopoLocalizadorConfig, type MenuTopoUsuarioConfig } from '@nucleo/menu-topo-global'
import { MenuLateralGlobal, type NavItem, type WorkspaceItem } from '@nucleo/menu-lateral-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import './tela-produto-global.css'
import './placeholder-global.css'

export type { NavItem, WorkspaceItem }
export type { MenuTopoUsuarioConfig as TelaProdutoUsuarioConfig }

export type TelaProdutoLocalizadorConfig = Omit<
  MenuTopoLocalizadorConfig,
  'currentProductId' | 'currentProductLabel' | 'currentProductColor'
>

export interface TelaProdutoGlobalProps {
  productId:   string
  productName: string
  tenantName:  string
  tenantPlan:  string
  navItems:    NavItem[]
  workspaces?:        WorkspaceItem[]
  onSwitchWorkspace?: (id: string) => void
  onCreateWorkspace?: () => void
  onManageWorkspace?: () => void
  tooltipsDisabled:   boolean
  onToggleTooltips:   () => void
  localizador: TelaProdutoLocalizadorConfig
  usuario:     MenuTopoUsuarioConfig
  onNavigateHub?:  () => void
  onNavigateCore?: () => void
  /** Slot para ações extras no header (ex: sininho de notificações) */
  headerActions?: React.ReactNode
  /** Navegar para Configurações do produto — omitir oculta o botão */
  onNavigateSettings?: () => void
  children:    React.ReactNode
}

export function TelaProdutoGlobal({
  productId,
  productName,
  tenantName,
  tenantPlan,
  navItems,
  workspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  onManageWorkspace,
  tooltipsDisabled,
  onToggleTooltips,
  localizador,
  usuario,
  onNavigateHub,
  onNavigateCore,
  headerActions,
  onNavigateSettings,
  children,
}: TelaProdutoGlobalProps) {
  const meta        = getProdutoMeta(productId)
  const sidebarIcon = cloneElement(meta.icon, { size: 26 })
  const topoIcon    = cloneElement(meta.icon, { size: 18, weight: 'duotone' })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="tpg-layout">

      {/* Lateral — ocupa toda a altura da grid */}
      <div className="tpg-lateral">
        <MenuLateralGlobal
          tenantName={tenantName}
          tenantPlan={tenantPlan}
          navItems={navItems}
          moduleName={productName}
          moduleColor={meta.color}
          moduleIcon={sidebarIcon}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(p => !p)}
          workspaces={workspaces}
          onSwitchWorkspace={onSwitchWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          onManageWorkspace={onManageWorkspace}
        />
      </div>

      {/* Coluna de conteúdo — flex-column: topo fixo + área rolável */}
      <div className="tpg-conteudo">

        {/* Menu topo ancorado ao topo da coluna de conteúdo */}
        <div className="tpg-topo">
          <MenuTopoGlobal
            productName={productName}
            productColor={meta.color}
            productIcon={topoIcon}
            sidebarCollapsed={sidebarCollapsed}
            tooltipsDisabled={tooltipsDisabled}
            onToggleTooltips={onToggleTooltips}
            localizador={{
              ...localizador,
              currentProductId:    productId,
              currentProductLabel: productName,
              currentProductColor: meta.color,
            }}
            usuario={usuario}
            onNavigateHub={onNavigateHub}
            onNavigateCore={onNavigateCore}
            headerActions={headerActions}
            onNavigateSettings={onNavigateSettings}
          />
        </div>

        {/* Área de conteúdo rolável */}
        <main className="tpg-main" role="main">
          {children}
        </main>

      </div>

    </div>
  )
}
