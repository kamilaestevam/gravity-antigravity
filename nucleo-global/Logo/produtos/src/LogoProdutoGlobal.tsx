/**
 * produtos.tsx — Registry central de identidade visual dos produtos Gravity.
 *
 * Cada entrada define: ícone React (logo SVG próprio), cor de destaque e sublabel.
 * Os logos estão em ./logos/ — componentes SVG escaláveis via prop `size`.
 */
import React from 'react'
import { LogoSimulaCusto }    from './logos/LogoSimulaCusto'
import { LogoPedido }         from './logos/LogoPedido'
import { LogoBidCambio }      from './logos/LogoBidCambio'
import { LogoBidFrete }       from './logos/LogoBidFrete'
import { LogoLpco }           from './logos/LogoLpco'
import { LogoNfImportacao }   from './logos/LogoNfImportacao'
import { LogoProcesso }       from './logos/LogoProcesso'
import { LogoFinanceiroComex } from './logos/LogoFinanceiroComex'
import { LogoGravity }        from './logos/LogoGravity'
import { LogoAdmin }          from './logos/LogoAdmin'
import { LogoConfigurador }   from './logos/LogoConfigurador'

export interface ProdutoMeta {
  /** Ícone React do produto — componente SVG próprio */
  icon: React.ReactElement
  /** Cor de destaque hexadecimal */
  color: string
  /** Descrição curta do domínio do produto */
  sublabel: string
}

export const PRODUTO_META: Record<string, ProdutoMeta> = {
  'simula-custo': {
    icon:     <LogoSimulaCusto size={16} />,
    color:    '#34d399',
    sublabel: 'fiscal · NCM',
  },
  'pedido': {
    icon:     <LogoPedido size={16} />,
    color:    '#f59e0b',
    sublabel: 'pedidos · ERP',
  },
  'bid-cambio': {
    icon:     <LogoBidCambio size={16} />,
    color:    '#06b6d4',
    sublabel: 'câmbio · cotações',
  },
  'bid-frete': {
    icon:     <LogoBidFrete size={16} />,
    color:    '#60a5fa',
    sublabel: 'frete · transportes',
  },
  'lpco': {
    icon:     <LogoLpco size={16} />,
    color:    '#f43f5e',
    sublabel: 'licenças COMEX',
  },
  'nf-importacao': {
    icon:     <LogoNfImportacao size={16} />,
    color:    '#c084fc',
    sublabel: 'nota fiscal · importação',
  },
  'processo': {
    icon:     <LogoProcesso size={16} />,
    color:    '#facc15',
    sublabel: 'processos · consolidado',
  },
  'financeiro-comex': {
    icon:     <LogoFinanceiroComex size={16} />,
    color:    '#f472b6',
    sublabel: 'financeiro · COMEX',
  },
  'admin': {
    icon:     <LogoAdmin size={16} />,
    color:    '#818cf8',
    sublabel: 'painel interno',
  },
  'configurador': {
    icon:     <LogoConfigurador size={16} />,
    color:    '#7dd3fc',
    sublabel: 'gestão · organizações',
  },
}

/**
 * Retorna os metadados de um produto pelo ID.
 * Fallback seguro caso o produto ainda não esteja registrado.
 */
export function getProdutoMeta(productId: string): ProdutoMeta {
  return PRODUTO_META[productId] ?? {
    icon:     <LogoGravity size={16} />,
    color:    '#818cf8',
    sublabel: 'produto',
  }
}
