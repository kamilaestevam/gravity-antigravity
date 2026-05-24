import React, { cloneElement, useState } from 'react'
import {
  MenuTopoGlobal,
  type MenuTopoLocalizadorConfig,
  type MenuTopoUsuarioConfig,
  TituloPaginaTopoProvider,
  useTituloPaginaTopoOverride,
  mesclarTituloPaginaTopo,
} from '@nucleo/menu-topo-global'
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
  /** Classe extra no container raiz (ex: `layout--override-ativo` admin) */
  layoutClassName?: string
  children:    React.ReactNode
}

function TelaProdutoLayout({
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
  layoutClassName,
  children,
}: TelaProdutoGlobalProps) {
  const meta        = getProdutoMeta(productId)
  const sidebarIcon = cloneElement(meta.icon, { size: 26 })
  const topoIcon    = cloneElement(meta.icon, { size: 18, weight: 'duotone' })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const tituloOverride = useTituloPaginaTopoOverride()

  const tituloMesclado = mesclarTituloPaginaTopo(
    {
      label:     localizador.currentPageLabel,
      icone:     localizador.currentPageIcon,
      subtitulo: localizador.currentPageSubtitle,
    },
    tituloOverride,
  )

  return (
    <div className={layoutClassName ? `tpg-layout ${layoutClassName}` : 'tpg-layout'}>

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

      <div className="tpg-conteudo">

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
              currentPageLabel:    tituloMesclado.label,
              currentPageIcon:     tituloMesclado.icone,
              currentPageSubtitle: tituloMesclado.subtitulo,
            }}
            usuario={usuario}
            onNavigateHub={onNavigateHub}
            onNavigateCore={onNavigateCore}
            headerActions={headerActions}
            onNavigateSettings={onNavigateSettings}
          />
        </div>

        <main className="tpg-main" role="main">
          {children}
        </main>

      </div>

    </div>
  )
}

export function TelaProdutoGlobal(props: TelaProdutoGlobalProps) {
  return (
    <TituloPaginaTopoProvider>
      <TelaProdutoLayout {...props} />
    </TituloPaginaTopoProvider>
  )
}
