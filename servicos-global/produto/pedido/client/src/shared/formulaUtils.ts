/**
 * formulaUtils.ts — Utilitários compartilhados para o editor de fórmulas (pill-based)
 *
 * Extraído de Configuracoes.tsx para reuso no ModalNovaColunaUsuario.
 * Contém: alias map, conversores alias↔chave, tokens, campos estáticos.
 */

// ── Alias Map — nomes amigáveis ↔ chaves internas ────────────────────────────

export const FORMULA_ALIAS_MAP = [
  { chave: 'quantidade_total_pedido',               alias: 'quantidade_inicial',     label: 'Quantidade Inicial' },
  { chave: 'quantidade_cancelada_total_pedido',      alias: 'quantidade_cancelada',   label: 'Quantidade Cancelada' },
  { chave: 'quantidade_transferida_total',           alias: 'quantidade_transferida', label: 'Quantidade Transferida' },
  { chave: 'quantidade_pronta_itens_pedido_total',   alias: 'quantidade_pronta',      label: 'Quantidade Pronta' },
  { chave: 'saldo_itens_do_pedido',                  alias: 'saldo',                  label: 'Saldo' },
  { chave: 'peso_liquido_total_pedido',              alias: 'peso_liquido',           label: 'Peso Líquido' },
  { chave: 'peso_bruto_total_pedido',                alias: 'peso_bruto',             label: 'Peso Bruto' },
  { chave: 'cubagem_total_pedido',                   alias: 'cubagem',                label: 'Cubagem' },
  // valor_total já é legível — sem alias
] as const

// ── Conversores ──────────────────────────────────────────────────────────────

/** Fórmula com chaves internas → fórmula com aliases legíveis (para exibição) */
export function formulaParaAlias(formula: string): string {
  const sorted = [...FORMULA_ALIAS_MAP].sort((a, b) => b.chave.length - a.chave.length)
  let r = formula
  for (const { chave, alias } of sorted) {
    r = r.replace(new RegExp(`\\b${chave}\\b`, 'g'), alias)
  }
  return r
}

/** Fórmula com aliases → fórmula com chaves internas (para salvar/validar) */
export function formulaParaChave(formula: string): string {
  let r = formula
  for (const { chave, alias } of FORMULA_ALIAS_MAP) {
    r = r.replace(new RegExp(`\\b${alias}\\b`, 'g'), chave)
  }
  return r
}

// ── Token (pill-based editor) ────────────────────────────────────────────────

export type FormulaToken =
  | { tipo: 'campo'; chave: string; label: string }
  | { tipo: 'op';    valor: string }

/** Tokens → string de alias (para validação/exibição) */
export function tokensParaAliasFormula(tokens: FormulaToken[]): string {
  return tokens.map(t => t.tipo === 'campo' ? t.chave : t.valor).join(' ')
}

/** Tokens → string de chave interna (para armazenamento) */
export function tokensParaChaveFormula(tokens: FormulaToken[]): string {
  return formulaParaChave(tokensParaAliasFormula(tokens))
}

/** String de alias → lista de tokens (para hidratar a partir do backend) */
export function aliasFormulaParaTokens(formulaAlias: string): FormulaToken[] {
  if (!formulaAlias.trim()) return []
  const aliasSet = new Map<string, string>(FORMULA_ALIAS_MAP.map(m => [m.alias, m.label]))
  return formulaAlias.trim().split(/\s+/).map(part => {
    const label = aliasSet.get(part)
    if (label) return { tipo: 'campo' as const, chave: part, label }
    return { tipo: 'op' as const, valor: part }
  })
}

// ── Campos estáticos para fórmulas ──────────────────────────────────────────

export interface CampoFormulaGrupo {
  grupo: string
  campos: { chave: string; label: string }[]
}

/** Grupos base de campos (sem colunas do usuário — essas são adicionadas dinamicamente) */
export const CAMPOS_FORMULA_BASE: CampoFormulaGrupo[] = [
  {
    grupo: 'Quantidades',
    campos: [
      { chave: 'quantidade_inicial',     label: 'Quantidade Inicial' },
      { chave: 'quantidade_cancelada',   label: 'Quantidade Cancelada' },
      { chave: 'quantidade_transferida', label: 'Quantidade Transferida' },
      { chave: 'quantidade_pronta',      label: 'Quantidade Pronta' },
      { chave: 'saldo',                  label: 'Saldo' },
    ],
  },
  {
    grupo: 'Financeiro',
    campos: [
      { chave: 'valor_total',  label: 'Valor Total' },
      { chave: 'peso_liquido', label: 'Peso Líquido' },
      { chave: 'peso_bruto',   label: 'Peso Bruto' },
      { chave: 'cubagem',      label: 'Cubagem' },
    ],
  },
]
