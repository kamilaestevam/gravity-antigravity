import React, { cloneElement } from 'react'
import { MenuTopoGlobal, type MenuTopoLocalizadorConfig, type MenuTopoUsuarioConfig } from '@nucleo/menu-topo-global'
import { MenuLateralGlobal, type NavItem, type WorkspaceItem } from '@nucleo/menu-lateral-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import './tela-produto-global.css'

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
  children,
}: TelaProdutoGlobalProps) {
  const meta        = getProdutoMeta(productId)
  const sidebarIcon = cloneElement(meta.icon, { size: 26 })
  const topoIcon    = cloneElement(meta.icon, { size: 18, weight: 'duotone' })

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
          workspaces={workspaces}
          onSwitchWorkspace={onSwitchWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          onManageWorkspace={onManageWorkspace}
          userName={usuario.userName}
          userInitials={usuario.userInitials}
          userRole={usuario.userRole}
          onSignOut={usuario.onSignOut}
          onNavigateHub={onNavigateHub}
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
