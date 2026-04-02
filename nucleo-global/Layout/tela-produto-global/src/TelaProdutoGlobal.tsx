import React from 'react'
import { MenuTopoGlobal, type MenuTopoGlobalProps } from '@nucleo/menu-topo-global'
import { MenuLateralGlobal, type MenuLateralGlobalProps } from '@nucleo/menu-lateral-global'
import './tela-produto-global.css'

export interface TelaProdutoGlobalProps {
  /** Props completas do menu superior */
  menuTopo: MenuTopoGlobalProps
  /** Props completas do menu lateral */
  menuLateral: MenuLateralGlobalProps
  /** Conteúdo da área principal — telas específicas de cada produto */
  children: React.ReactNode
}

/**
 * TelaProdutoGlobal — armadura de layout para todos os produtos Gravity.
 *
 * Monta o grid: MenuTopo (topo fixo) + MenuLateral (lateral) + área de conteúdo.
 * Cada produto passa suas configs via props e renderiza o conteúdo em children.
 *
 * Uso:
 * ```tsx
 * <TelaProdutoGlobal menuTopo={topoConfig} menuLateral={lateralConfig}>
 *   <MinhaTelaEspecifica />
 * </TelaProdutoGlobal>
 * ```
 */
export function TelaProdutoGlobal({
  menuTopo,
  menuLateral,
  children,
}: TelaProdutoGlobalProps) {
  return (
    <div className="tpg-layout">

      {/* Topo fixo — span nas 2 colunas */}
      <div className="tpg-topo">
        <MenuTopoGlobal {...menuTopo} />
      </div>

      {/* Lateral esquerda */}
      <div className="tpg-lateral">
        <MenuLateralGlobal {...menuLateral} />
      </div>

      {/* Área de conteúdo — rolagem independente */}
      <main className="tpg-conteudo" role="main">
        {children}
      </main>

    </div>
  )
}
