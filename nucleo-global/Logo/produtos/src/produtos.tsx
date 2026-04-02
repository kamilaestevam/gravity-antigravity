/**
 * produtos.tsx — Registry central de identidade visual dos produtos Gravity.
 *
 * Cada entrada define: ícone React, cor de destaque e sublabel descritivo.
 * Conforme produtos receberem logos próprios, substituir o ícone Phosphor
 * pelo componente SVG definitivo — sem quebrar nenhum consumidor.
 *
 * Adicionar novo produto: basta incluir uma entrada no PRODUTO_META abaixo.
 */
import React from 'react'
import {
  Calculator,
  Package,
  ArrowsLeftRight,
  Truck,
  Stamp,
  Receipt,
  GitBranch,
  ChartLine,
  Spinner,
} from '@phosphor-icons/react'

export interface ProdutoMeta {
  /** Ícone React do produto — Phosphor por enquanto, SVG customizado no futuro */
  icon: React.ReactElement
  /** Cor de destaque hexadecimal */
  color: string
  /** Descrição curta do domínio do produto */
  sublabel: string
}

export const PRODUTO_META: Record<string, ProdutoMeta> = {
  'simula-custo': {
    icon:     <Calculator     weight="duotone" size={16} />,
    color:    '#34d399',
    sublabel: 'fiscal · NCM',
  },
  'pedido': {
    icon:     <Package        weight="duotone" size={16} />,
    color:    '#f59e0b',
    sublabel: 'pedidos · ERP',
  },
  'bid-cambio': {
    icon:     <ArrowsLeftRight weight="duotone" size={16} />,
    color:    '#06b6d4',
    sublabel: 'câmbio · cotações',
  },
  'bid-frete': {
    icon:     <Truck          weight="duotone" size={16} />,
    color:    '#f97316',
    sublabel: 'frete · transportes',
  },
  'lpco': {
    icon:     <Stamp          weight="duotone" size={16} />,
    color:    '#fb923c',
    sublabel: 'licenças COMEX',
  },
  'nf-importacao': {
    icon:     <Receipt        weight="duotone" size={16} />,
    color:    '#c084fc',
    sublabel: 'nota fiscal · importação',
  },
  'processo': {
    icon:     <GitBranch      weight="duotone" size={16} />,
    color:    '#facc15',
    sublabel: 'processos · consolidado',
  },
  'financeiro-comex': {
    icon:     <ChartLine      weight="duotone" size={16} />,
    color:    '#f472b6',
    sublabel: 'financeiro · COMEX',
  },
}

/**
 * Retorna os metadados de um produto pelo ID.
 * Fallback seguro caso o produto ainda não esteja registrado.
 */
export function getProdutoMeta(productId: string): ProdutoMeta {
  return PRODUTO_META[productId] ?? {
    icon:     <Spinner weight="duotone" size={16} />,
    color:    '#818cf8',
    sublabel: 'produto',
  }
}
