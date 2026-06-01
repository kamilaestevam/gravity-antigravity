import React, { cloneElement, useState } from 'react'
import {
  MenuTopoGlobal,
  type MenuTopoLocalizadorConfig,
  type MenuTopoUsuarioConfig,
  TituloPaginaTopoProvider,
  useTituloPaginaTopoOverride,
  mesclarTituloPaginaTopo,
} from '@nucleo/menu-topo-global'
import {
  MenuLateralGlobal,
  type ModuleModoVariant,
  type NavItem,
  type WorkspaceItem,
  type ProductSwitcherItem,
} from '@nucleo/menu-lateral-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import './tela-produto-global.css'
import './placeholder-global.css'

export type { NavItem, WorkspaceItem, ProductSwitcherItem }
export type { MenuTopoUsuarioConfig as TelaProdutoUsuarioConfig }

export type TelaProdutoLocalizadorConfig = Omit<
  MenuTopoLocalizadorConfig,
  'currentProductId' | 'currentProductLabel' | 'currentProductColor'
>

export interface TelaProdutoGlobalProps {
  productId:   string
  productName: string
  /** Badge de modo no logo da sidebar (ex.: visao_fornecedor) */
  productModoVariant?: ModuleModoVariant
  /** Rótulo curto no badge (ex.: Fornecedor) */
  productModoBadgeLabel?: string
  /** Descrição para aria no badge (ex.: Visão fornecedor) */
  productModoAriaLabel?: string
  productModoTooltipTitulo?: string
  productModoTooltipDescricao?: string
  tenantName:  string
  tenantPlan:  string
  navItems:    NavItem[]
  workspaces?:        WorkspaceItem[]
  onSwitchWorkspace?: (id: string) => void
  modoWorkspace?: 'unico' | 'multiplo'
  workspacesEscopoIds?: string[]
  onAlternarWorkspaceEscopo?: (id: string) => void
  onDefinirEscopoWorkspaces?: (ids: string[]) => void
  sinalAbrirMenuWorkspaces?: number
  onCreateWorkspace?: () => void
  onManageWorkspace?: () => void
  produtos?:              ProductSwitcherItem[]
  produtoAtualSlug?:      string
  onSwitchProduct?:       (slug: string) => void
  produtoSlugEquivalente?: (a: string, b: string) => boolean
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
  productModoVariant,
  productModoBadgeLabel,
  productModoAriaLabel,
  productModoTooltipTitulo,
  productModoTooltipDescricao,
  tenantName,
  tenantPlan,
  navItems,
  workspaces,
  onSwitchWorkspace,
  modoWorkspace,
  workspacesEscopoIds,
  onAlternarWorkspaceEscopo,
  onDefinirEscopoWorkspaces,
  sinalAbrirMenuWorkspaces,
  onCreateWorkspace,
  onManageWorkspace,
  produtos,
  produtoAtualSlug,
  onSwitchProduct,
  produtoSlugEquivalente,
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
          moduleModoVariant={productModoVariant}
          moduleModoBadgeLabel={productModoBadgeLabel}
          moduleModoAriaLabel={productModoAriaLabel}
          moduleModoTooltipTitulo={productModoTooltipTitulo}
          moduleModoTooltipDescricao={productModoTooltipDescricao}
          moduleColor={meta.color}
          moduleIcon={sidebarIcon}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(p => !p)}
          workspaces={workspaces}
          onSwitchWorkspace={onSwitchWorkspace}
          modoWorkspace={modoWorkspace}
          workspacesEscopoIds={workspacesEscopoIds}
          onAlternarWorkspaceEscopo={onAlternarWorkspaceEscopo}
          onDefinirEscopoWorkspaces={onDefinirEscopoWorkspaces}
          sinalAbrirMenuWorkspaces={sinalAbrirMenuWorkspaces}
          onCreateWorkspace={onCreateWorkspace}
          onManageWorkspace={onManageWorkspace}
          produtos={produtos}
          produtoAtualSlug={produtoAtualSlug}
          onSwitchProduct={onSwitchProduct}
          produtoSlugEquivalente={produtoSlugEquivalente}
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
