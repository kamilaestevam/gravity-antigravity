import React, { cloneElement } from 'react'
import { MenuTopoGlobal, type MenuTopoLocalizadorConfig, type MenuTopoUsuarioConfig } from '@nucleo/menu-topo-global'
import { MenuLateralGlobal, type NavItem, type WorkspaceItem } from '@nucleo/menu-lateral-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import './tela-produto-global.css'

export type { NavItem, WorkspaceItem }

/**
 * Config do localizador sem os campos de produto — TelaProdutoGlobal injeta automaticamente
 * currentProductId, currentProductLabel e currentProductColor a partir do productId.
 */
export type TelaProdutoLocalizadorConfig = Omit<
  MenuTopoLocalizadorConfig,
  'currentProductId' | 'currentProductLabel' | 'currentProductColor'
>

export interface TelaProdutoGlobalProps {
  /** ID do produto — resolve cor, ícone e sublabel via registry PRODUTO_META */
  productId: string
  /** Nome legível do produto — exibido no chip do topo e na sidebar */
  productName: string
  /** Dados do tenant */
  tenantName: string
  tenantPlan: string
  /** Itens de navegação — único campo que varia por produto */
  navItems: NavItem[]
  /** Workspaces disponíveis para troca */
  workspaces?: WorkspaceItem[]
  onSwitchWorkspace?: (id: string) => void
  onCreateWorkspace?: () => void
  onManageWorkspace?: () => void
  /** Toggle de dicas */
  tooltipsDisabled: boolean
  onToggleTooltips: () => void
  /** Config do localizador — productId/Label/Color são injetados automaticamente */
  localizador: TelaProdutoLocalizadorConfig
  /** Config do usuário */
  usuario: MenuTopoUsuarioConfig
  /** Atalhos de navegação — omitir oculta o botão */
  onNavigateHub?: () => void
  onNavigateCore?: () => void
  /** Conteúdo da área principal — telas específicas de cada produto */
  children: React.ReactNode
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
  const meta = getProdutoMeta(productId)
  const sidebarIcon = cloneElement(meta.icon, { size: 26 })

  return (
    <div className="tpg-layout">

      {/* Topo fixo */}
      <div className="tpg-topo">
        <MenuTopoGlobal
          productName={productName}
          productColor={meta.color}
          productIcon={meta.icon}
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

      {/* Lateral esquerda */}
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
        />
      </div>

      {/* Área de conteúdo */}
      <main className="tpg-conteudo" role="main">
        {children}
      </main>

    </div>
  )
}
