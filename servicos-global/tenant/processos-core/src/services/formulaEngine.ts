/**
 * formulaEngine.ts — Parser e avaliador de fórmulas (BACKEND)
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  ATENÇÃO — MANTER EM SINCRONIA:                                          │
 * │  produto/pedido/client/src/shared/formulaEngine.ts                       │
 * │                                                                          │
 * │  Este arquivo é um port direto da versão client. Quando alterar um,      │
 * │  replique a mudança no outro. A versão client tem, a mais, a função      │
 * │  `detectarCircular` que depende de `ColunaUsuario` (tipo do front)       │
 * │  e por isso não faz sentido aqui.                                        │
 * │                                                                          │
 * │  Qualquer divergência de comportamento entre os dois é BUG.              │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Suporta:
 *   - Aritmética: +, -, *, /, parênteses
 *   - Referências a campos: identificadores lowercase (ex: quantidade_inicial)
 *   - Funções:
 *       SE(condicao, valor_se_verdadeiro, valor_se_falso)
 *       SOMA_ITENS(campo)
 *   - Condições: >, <, >=, <=, ==, !=
 */

// ── AST ───────────────────────────────────────────────────────────────────────

export type FormulaAST =
  | { tipo: 'numero'; valor: number }
  | { tipo: 'campo'; chave: string }
  | { tipo: 'binop'; op: '+' | '-' | '*' | '/'; esq: FormulaAST; dir: FormulaAST }
  | { tipo: 'condicao'; op: '>' | '<' | '>=' | '<=' | '==' | '!='; esq: FormulaAST; dir: FormulaAST }
  | { tipo: 'se'; condicao: FormulaAST; verdadeiro: FormulaAST; falso: FormulaAST }
  | { tipo: 'soma_itens'; campo: string }

// ── Resultado da avaliação ────────────────────────────────────────────────────

export interface ResultadoFormula {
  valor: number
  temNulo: boolean
}

// ── Tokenizador ───────────────────────────────────────────────────────────────

type Token =
  | { tipo: 'numero'; valor: number }
  | { tipo: 'ident'; valor: string }
  | { tipo: 'op'; valor: string }
  | { tipo: 'lparen' }
  | { tipo: 'rparen' }
  | { tipo: 'virgula' }
  | { tipo: 'eof' }

function tokenizar(expressao: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expressao.length) {
    const ch = expressao[i]

    if (/\s/.test(ch)) { i++; continue }

    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expressao[i + 1] ?? ''))) {
      let num = ''
      while (i < expressao.length && /[0-9.]/.test(expressao[i])) {
        num += expressao[i++]
      }
      tokens.push({ tipo: 'numero', valor: parseFloat(num) })
      continue
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let id = ''
      while (i < expressao.length && /[a-zA-Z0-9_]/.test(expressao[i])) {
        id += expressao[i++]
      }
      tokens.push({ tipo: 'ident', valor: id })
      continue
    }

    const dois = expressao.slice(i, i + 2)
    if (dois === '>=' || dois === '<=' || dois === '==' || dois === '!=') {
      tokens.push({ tipo: 'op', valor: dois })
      i += 2
      continue
    }

    if ('+-*/><'.includes(ch)) {
      tokens.push({ tipo: 'op', valor: ch })
      i++
      continue
    }

    if (ch === '(') { tokens.push({ tipo: 'lparen' }); i++; continue }
    if (ch === ')') { tokens.push({ tipo: 'rparen' }); i++; continue }
    if (ch === ',') { tokens.push({ tipo: 'virgula' }); i++; continue }

    throw new Error(`Caractere inesperado: '${ch}' na posicao ${i}`)
  }

  tokens.push({ tipo: 'eof' })
  return tokens
}

// ── Parser (recursive descent) ────────────────────────────────────────────────

class Parser {
  private tokens: Token[]
  private pos: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }

  private consumir(): Token {
    return this.tokens[this.pos++]
  }

  parseExpressao(): FormulaAST {
    return this.parseCondicao()
  }

  private parseCondicao(): FormulaAST {
    const esq = this.parseSoma()
    const tok = this.peek()
    if (tok.tipo === 'op' && ['>', '<', '>=', '<=', '==', '!='].includes(tok.valor)) {
      this.consumir()
      const dir = this.parseSoma()
      return {
        tipo: 'condicao',
        op: tok.valor as '>' | '<' | '>=' | '<=' | '==' | '!=',
        esq,
        dir,
      }
    }
    return esq
  }

  private parseSoma(): FormulaAST {
    let esq = this.parseProduto()
    while (true) {
      const tok = this.peek()
      if (tok.tipo === 'op' && (tok.valor === '+' || tok.valor === '-')) {
        this.consumir()
        const dir = this.parseProduto()
        esq = { tipo: 'binop', op: tok.valor as '+' | '-', esq, dir }
      } else {
        break
      }
    }
    return esq
  }

  private parseProduto(): FormulaAST {
    let esq = this.parseUnario()
    while (true) {
      const tok = this.peek()
      if (tok.tipo === 'op' && (tok.valor === '*' || tok.valor === '/')) {
        this.consumir()
        const dir = this.parseUnario()
        esq = { tipo: 'binop', op: tok.valor as '*' | '/', esq, dir }
      } else {
        break
      }
    }
    return esq
  }

  peekPublic(): Token { return this.tokens[this.pos] }

  private parseUnario(): FormulaAST {
    const tok = this.peek()
    if (tok.tipo === 'op' && tok.valor === '-') {
      this.consumir()
      const operando = this.parsePrimario()
      return { tipo: 'binop', op: '-', esq: { tipo: 'numero', valor: 0 }, dir: operando }
    }
    return this.parsePrimario()
  }

  private parsePrimario(): FormulaAST {
    const tok = this.peek()

    if (tok.tipo === 'numero') {
      this.consumir()
      return { tipo: 'numero', valor: tok.valor }
    }

    if (tok.tipo === 'lparen') {
      this.consumir()
      const expr = this.parseExpressao()
      const fech = this.consumir()
      if (fech.tipo !== 'rparen') throw new Error("Esperado ')'")
      return expr
    }

    if (tok.tipo === 'ident') {
      this.consumir()
      const nome = tok.valor

      if (this.peek().tipo === 'lparen') {
        this.consumir()

        if (nome === 'SE') {
          return this.parseFuncaoSE()
        }

        if (nome === 'SOMA_ITENS') {
          return this.parseFuncaoSOMAITENS()
        }

        throw new Error(`Funcao desconhecida: '${nome}'`)
      }

      return { tipo: 'campo', chave: nome }
    }

    if (tok.tipo === 'eof') {
      throw new Error('Expressao incompleta: esperava um numero ou campo apos o ultimo operador')
    }
    if (tok.tipo === 'rparen') {
      throw new Error("Parentese ')' inesperado")
    }
    if (tok.tipo === 'virgula') {
      throw new Error("Virgula fora de funcao SE() ou SOMA_ITENS()")
    }
    throw new Error(`Token inesperado: '${(tok as { valor?: string }).valor ?? tok.tipo}'`)
  }

  private parseFuncaoSE(): FormulaAST {
    const condicao = this.parseExpressao()
    const virgula1 = this.consumir()
    if (virgula1.tipo !== 'virgula') throw new Error("Esperado ',' apos condicao do SE")
    const verdadeiro = this.parseExpressao()
    const virgula2 = this.consumir()
    if (virgula2.tipo !== 'virgula') throw new Error("Esperado ',' apos valor verdadeiro do SE")
    const falso = this.parseExpressao()
    const fech = this.consumir()
    if (fech.tipo !== 'rparen') throw new Error("Esperado ')' para fechar SE")
    return { tipo: 'se', condicao, verdadeiro, falso }
  }

  private parseFuncaoSOMAITENS(): FormulaAST {
    const tok = this.consumir()
    if (tok.tipo !== 'ident') throw new Error("SOMA_ITENS espera um nome de campo")
    const fech = this.consumir()
    if (fech.tipo !== 'rparen') throw new Error("Esperado ')' para fechar SOMA_ITENS")
    return { tipo: 'soma_itens', campo: tok.valor }
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Converte uma expressão em AST.
 * Lança erro com mensagem descritiva se a sintaxe for inválida.
 */
export function parsearFormula(expressao: string): FormulaAST {
  const tokens = tokenizar(expressao.trim())
  const parser = new Parser(tokens)
  const ast = parser.parseExpressao()

  const sobrou = parser.peekPublic()
  if (sobrou.tipo !== 'eof') {
    const extra = sobrou.tipo === 'ident' || sobrou.tipo === 'numero'
      ? `'${(sobrou as { valor: string | number }).valor}'`
      : sobrou.tipo
    throw new Error(`Token inesperado apos fim da formula: ${extra}. Verifique se falta um operador.`)
  }

  return ast
}

/**
 * Avalia um AST com os valores dos campos fornecidos.
 * Campos ausentes ou null são tratados como 0 e marcam temNulo = true.
 */
export function avaliarFormula(
  ast: FormulaAST,
  contexto: Record<string, number | null>,
): ResultadoFormula {
  let temNulo = false

  function avaliar(no: FormulaAST): number {
    switch (no.tipo) {
      case 'numero':
        return no.valor

      case 'campo': {
        const val = contexto[no.chave]
        if (val === null || val === undefined) {
          temNulo = true
          return 0
        }
        return val
      }

      case 'binop': {
        const esq = avaliar(no.esq)
        const dir = avaliar(no.dir)
        switch (no.op) {
          case '+': return esq + dir
          case '-': return esq - dir
          case '*': return esq * dir
          case '/':
            if (dir === 0) { temNulo = true; return 0 }
            return esq / dir
        }
      }

      case 'condicao': {
        const esq = avaliar(no.esq)
        const dir = avaliar(no.dir)
        switch (no.op) {
          case '>':  return esq >  dir ? 1 : 0
          case '<':  return esq <  dir ? 1 : 0
          case '>=': return esq >= dir ? 1 : 0
          case '<=': return esq <= dir ? 1 : 0
          case '==': return esq === dir ? 1 : 0
          case '!=': return esq !== dir ? 1 : 0
        }
      }

      case 'se': {
        const cond = avaliar(no.condicao)
        return cond !== 0 ? avaliar(no.verdadeiro) : avaliar(no.falso)
      }

      case 'soma_itens': {
        const val = contexto[no.campo]
        if (val === null || val === undefined) {
          temNulo = true
          return 0
        }
        return val
      }
    }
  }

  const valor = avaliar(ast)
  return { valor, temNulo }
}

/**
 * Extrai as chaves de campos referenciados na expressão.
 * Retorna lista sem duplicatas.
 */
export function extrairDependencias(expressao: string): string[] {
  let ast: FormulaAST
  try {
    ast = parsearFormula(expressao)
  } catch {
    return []
  }

  const deps = new Set<string>()

  function visitar(no: FormulaAST): void {
    switch (no.tipo) {
      case 'numero': break
      case 'campo': deps.add(no.chave); break
      case 'binop': visitar(no.esq); visitar(no.dir); break
      case 'condicao': visitar(no.esq); visitar(no.dir); break
      case 'se': visitar(no.condicao); visitar(no.verdadeiro); visitar(no.falso); break
      case 'soma_itens': deps.add(no.campo); break
    }
  }

  visitar(ast)
  return Array.from(deps)
}

// ── Default de Saldo do Pedido (mesma string usada pelo default do Prisma) ───

export const SALDO_FORMULA_PADRAO =
  'quantidade_total_inicial_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido'

// ── Mapeamento token pedido-level → campo item-level ─────────────────────────
// A fórmula é escrita em termos de campos do PEDIDO agregado
// (ex: quantidade_total_inicial_pedido). Quando avaliamos para um ITEM
// individual, mapeamos cada token para o campo equivalente do PedidoItem.
// Tokens que não mapeiam (ex: valor_total) são resolvidos como null → temNulo.
export const TOKEN_PEDIDO_PARA_ITEM: Record<string, string> = {
  quantidade_total_inicial_pedido:      'quantidade_inicial_pedido',
  quantidade_pronta_itens_pedido_total: 'quantidade_pronta_pedido',
  quantidade_cancelada_total_pedido:    'quantidade_cancelada_pedido',
  quantidade_transferida_total:         'quantidade_transferida_pedido',
  saldo_itens_do_pedido:                'quantidade_atual_pedido',
}

/**
 * Constrói o contexto de avaliação para um item individual a partir de
 * sua row do banco. Usa TOKEN_PEDIDO_PARA_ITEM para converter tokens pedido-level
 * nos campos equivalentes do PedidoItem.
 *
 * Valores numéricos são convertidos via Number(); valores nulos viram null.
 */
export function buildContextoItem(item: Record<string, unknown>): Record<string, number | null> {
  const n = (v: unknown): number | null => {
    if (v == null) return null
    const parsed = Number(v)
    return Number.isFinite(parsed) ? parsed : null
  }
  const ctx: Record<string, number | null> = {}
  for (const [tokenPedido, campoItem] of Object.entries(TOKEN_PEDIDO_PARA_ITEM)) {
    ctx[tokenPedido] = n(item[campoItem])
  }
  return ctx
}
