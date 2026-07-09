/**
 * Utilitários do editor de fórmulas — colunas personalizadas BID Frete (paridade Pedido).
 */
export type FormulaToken =
  | { tipo: 'campo'; chave: string; label: string }
  | { tipo: 'op'; valor: string }

export interface CampoFormulaGrupo {
  grupo: string
  campos: { chave: string; label: string }[]
}

export const FORMULA_ALIAS_MAP_BID_FRETE_INTERNACIONAL = [
  { chave: 'ganho_valor_cotacao_bid_frete_internacional', alias: 'ganho_valor', label: 'Ganho (valor)' },
  { chave: 'ganho_percentual_cotacao_bid_frete_internacional', alias: 'ganho_pct', label: 'Ganho (%)' },
] as const

export function formulaParaAlias(formula: string): string {
  const sorted = [...FORMULA_ALIAS_MAP_BID_FRETE_INTERNACIONAL].sort((a, b) => b.chave.length - a.chave.length)
  let r = formula
  for (const { chave, alias } of sorted) {
    r = r.replace(new RegExp(`\\b${chave}\\b`, 'g'), alias)
  }
  return r
}

export function formulaParaChave(formula: string): string {
  let r = formula
  for (const { chave, alias } of FORMULA_ALIAS_MAP_BID_FRETE_INTERNACIONAL) {
    r = r.replace(new RegExp(`\\b${alias}\\b`, 'g'), chave)
  }
  return r
}

export function tokensParaAliasFormula(tokens: FormulaToken[]): string {
  return tokens.map(t => (t.tipo === 'campo' ? t.chave : t.valor)).join(' ')
}

export function tokensParaChaveFormula(tokens: FormulaToken[]): string {
  return formulaParaChave(tokensParaAliasFormula(tokens))
}

export function aliasFormulaParaTokens(formulaAlias: string): FormulaToken[] {
  if (!formulaAlias.trim()) return []
  const aliasSet = new Map<string, string>(
    FORMULA_ALIAS_MAP_BID_FRETE_INTERNACIONAL.map(m => [m.alias, m.label]),
  )
  return formulaAlias.trim().split(/\s+/).map(part => {
    const label = aliasSet.get(part)
    if (label) return { tipo: 'campo' as const, chave: part, label }
    return { tipo: 'op' as const, valor: part }
  })
}

export const CAMPOS_FORMULA_BASE_BID_FRETE_INTERNACIONAL: CampoFormulaGrupo[] = [
  {
    grupo: 'Cotação',
    campos: [
      { chave: 'ganho_valor', label: 'Ganho (valor)' },
      { chave: 'ganho_pct', label: 'Ganho (%)' },
      { chave: 'valor_total_proposta_bid_frete_internacional', label: 'Valor total proposta' },
      { chave: 'dias_transito_proposta_bid_frete_internacional', label: 'Dias de trânsito' },
    ],
  },
  {
    grupo: 'Frete',
    campos: [
      { chave: 'valor_frete_proposta_bid_frete_internacional', label: 'Valor do frete' },
      { chave: 'taxas_origem_proposta_bid_frete_internacional', label: 'Taxas origem' },
      { chave: 'taxas_destino_proposta_bid_frete_internacional', label: 'Taxas destino' },
    ],
  },
]

/** Aliases para imports legados do modal (paridade Pedido). */
export const FORMULA_ALIAS_MAP = FORMULA_ALIAS_MAP_BID_FRETE_INTERNACIONAL
export const CAMPOS_FORMULA_BASE = CAMPOS_FORMULA_BASE_BID_FRETE_INTERNACIONAL
