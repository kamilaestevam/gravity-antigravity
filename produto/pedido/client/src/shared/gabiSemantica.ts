/**
 * gabiSemantica.ts — Análise semântica de fórmulas para o card GABI
 *
 * Separado de Configuracoes.tsx para permitir testes unitários isolados.
 * Importado por Configuracoes.tsx via analisarSemanticaFormula().
 *
 * Regras genéricas baseadas em AST + metadados (SEMANTICA_CAMPOS):
 *   1. Parcela somada ao seu total → sugere subtração
 *   2. Unidades físicas incompatíveis (qtd + fin + peso + vol)
 *   3. Divisão sem proteção SE()
 *   4. Campo somado com ele mesmo → equivale a x*2
 */

import { parsearFormula } from './formulaEngine.js'
import type { FormulaAST } from './formulaEngine.js'

// ── Metadados semânticos ──────────────────────────────────────────────────────

export type UnidadeSemantica = 'qtd' | 'fin' | 'peso' | 'vol'
export type PapelSemantico   = 'total' | 'parcela' | 'calculado'

export interface MetaCampo {
  label:      string
  unidade:    UnidadeSemantica
  papel:      PapelSemantico
  parcelaDe?: string
}

export const SEMANTICA_CAMPOS: Record<string, MetaCampo> = {
  quantidade_total_inicial_pedido:      { label: 'Quantidade Inicial',     unidade: 'qtd',  papel: 'total' },
  quantidade_cancelada_total_pedido:    { label: 'Quantidade Cancelada',   unidade: 'qtd',  papel: 'parcela', parcelaDe: 'quantidade_total_inicial_pedido' },
  quantidade_transferida_total:         { label: 'Quantidade Transferida', unidade: 'qtd',  papel: 'parcela', parcelaDe: 'quantidade_total_inicial_pedido' },
  quantidade_pronta_itens_pedido_total: { label: 'Quantidade Pronta',      unidade: 'qtd',  papel: 'parcela', parcelaDe: 'quantidade_total_inicial_pedido' },
  saldo_itens_do_pedido:               { label: 'Saldo',                  unidade: 'qtd',  papel: 'calculado' },
  valor_total:                         { label: 'Valor Total',            unidade: 'fin',  papel: 'total' },
  peso_liquido_total_pedido:           { label: 'Peso Líquido',           unidade: 'peso', papel: 'total' },
  peso_bruto_total_pedido:             { label: 'Peso Bruto',             unidade: 'peso', papel: 'total' },
  cubagem_total_pedido:                { label: 'Cubagem',                unidade: 'vol',  papel: 'total' },
}

const LABEL_UNIDADE: Record<UnidadeSemantica, string> = {
  qtd:  'quantidade',
  fin:  'valor financeiro',
  peso: 'peso',
  vol:  'volume',
}

// ── Helpers de travessia AST ──────────────────────────────────────────────────

function _coletarAST(
  no: FormulaAST,
  campos: string[],
  divisoes: Array<{ num: FormulaAST; den: FormulaAST }>,
  temSE: { v: boolean },
) {
  switch (no.tipo) {
    case 'campo':
      campos.push(no.chave)
      break
    case 'binop':
      if (no.op === '/') divisoes.push({ num: no.esq, den: no.dir })
      _coletarAST(no.esq, campos, divisoes, temSE)
      _coletarAST(no.dir, campos, divisoes, temSE)
      break
    case 'se':
      temSE.v = true
      _coletarAST(no.condicao, campos, divisoes, temSE)
      _coletarAST(no.verdadeiro, campos, divisoes, temSE)
      _coletarAST(no.falso, campos, divisoes, temSE)
      break
    case 'condicao':
      _coletarAST(no.esq, campos, divisoes, temSE)
      _coletarAST(no.dir, campos, divisoes, temSE)
      break
  }
}

function _coletarSomas(no: FormulaAST): Array<{ op: '+' | '-'; esq: string | null; dir: string | null }> {
  const resultado: Array<{ op: '+' | '-'; esq: string | null; dir: string | null }> = []
  function visitar(n: FormulaAST) {
    if (n.tipo === 'binop') {
      if (n.op === '+' || n.op === '-') {
        resultado.push({
          op:  n.op,
          esq: n.esq.tipo === 'campo' ? n.esq.chave : null,
          dir: n.dir.tipo === 'campo' ? n.dir.chave : null,
        })
      }
      visitar(n.esq)
      visitar(n.dir)
    } else if (n.tipo === 'se') {
      visitar(n.verdadeiro)
      visitar(n.falso)
    } else if (n.tipo === 'condicao') {
      visitar(n.esq)
      visitar(n.dir)
    }
  }
  visitar(no)
  return resultado
}

// ── Analisador público ────────────────────────────────────────────────────────

export interface GabiAviso {
  titulo:    string
  texto:     string
  sugestao?: string
}

/**
 * Analisa a semântica da fórmula e retorna um aviso, ou null se OK.
 * Retorna null também se a expressão for inválida sintaticamente
 * (o parser já trata isso separadamente).
 */
export function analisarSemanticaFormula(expressao: string): GabiAviso | null {
  let ast: FormulaAST
  try { ast = parsearFormula(expressao) } catch { return null }

  const campos:   string[] = []
  const divisoes: Array<{ num: FormulaAST; den: FormulaAST }> = []
  const temSE = { v: false }
  _coletarAST(ast, campos, divisoes, temSE)
  const somas = _coletarSomas(ast)

  // ── Regra 1: parcela somada ao seu total ──────────────────────────────────
  for (const op of somas) {
    if (op.op !== '+') continue
    const metaEsq = op.esq ? SEMANTICA_CAMPOS[op.esq] : null
    const metaDir = op.dir ? SEMANTICA_CAMPOS[op.dir] : null
    if (!metaEsq || !metaDir) continue

    let labelParcela: string | null = null
    let labelTotal:   string | null = null
    let sugestao:     string | undefined

    if (metaEsq.papel === 'parcela' && metaEsq.parcelaDe === op.dir) {
      labelParcela = metaEsq.label; labelTotal = metaDir.label
      sugestao = `${op.dir} - ${op.esq}`
    } else if (metaDir.papel === 'parcela' && metaDir.parcelaDe === op.esq) {
      labelParcela = metaDir.label; labelTotal = metaEsq.label
      sugestao = `${op.esq} - ${op.dir}`
    }

    if (labelParcela && labelTotal) {
      return {
        titulo: 'Parcela somada ao seu total',
        texto:  `"${labelParcela}" já está contida em "${labelTotal}" — somá-las dobra o valor. Se quer o que ainda está ativo, use subtração.`,
        sugestao,
      }
    }
  }

  // ── Regra 4: mesmo campo somado a si mesmo ────────────────────────────────
  for (const op of somas) {
    if (op.op === '+' && op.esq && op.dir && op.esq === op.dir) {
      const label = SEMANTICA_CAMPOS[op.esq]?.label ?? op.esq
      return {
        titulo:   'Campo somado com ele mesmo',
        texto:    `"${label}" está sendo somado com ele próprio — equivale a multiplicar por 2. Se é isso que quer, use ${op.esq} * 2.`,
        sugestao: `${op.esq} * 2`,
      }
    }
  }

  // ── Regra 3: divisão sem SE (antes de Regra 2 — tem prioridade) ─────────
  if (divisoes.length > 0 && !temSE.v) {
    const den = divisoes[0].den
    const nomeDen = den.tipo === 'campo' ? (SEMANTICA_CAMPOS[den.chave]?.label ?? den.chave)
                  : den.tipo === 'numero' ? String(den.valor)
                  : null
    return {
      titulo:   'Divisão sem proteção',
      texto:    `Se ${nomeDen ? `"${nomeDen}"` : 'o denominador'} for zero em algum pedido, a fórmula gerará erro. Proteja com SE(denominador == 0, 0, numerador / denominador).`,
      sugestao: expressao.replace(/(.+)\/(.+)/, 'SE($2 == 0, 0, $1 / $2)'),
    }
  }

  // ── Regra 2: unidades incompatíveis em adição/subtração ──────────────────
  // Divisão e multiplicação entre unidades diferentes são válidas (ex: valor / qtd = preço unitário)
  // Só faz sentido alertar quando o usuário SOMA ou SUBTRAI grandezas incompatíveis.
  const unidadesEmSoma = somas.flatMap(op => {
    const list: UnidadeSemantica[] = []
    if (op.esq) { const u = SEMANTICA_CAMPOS[op.esq]?.unidade; if (u) list.push(u) }
    if (op.dir) { const u = SEMANTICA_CAMPOS[op.dir]?.unidade; if (u) list.push(u) }
    return list
  })
  const unidadesDistintas = [...new Set(unidadesEmSoma)]

  if (unidadesDistintas.length > 1) {
    return {
      titulo: 'Unidades incompatíveis',
      texto:  `A fórmula soma ou subtrai ${unidadesDistintas.map(u => LABEL_UNIDADE[u]).join(' com ')}. Operações aritméticas entre grandezas diferentes raramente fazem sentido de negócio.`,
    }
  }

  return null
}
