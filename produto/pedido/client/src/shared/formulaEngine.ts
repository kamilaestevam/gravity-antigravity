/**
 * formulaEngine.ts — Parser e avaliador de fórmulas para colunas customizadas
 *
 * Suporta:
 *   - Aritmética: +, -, *, /, parênteses
 *   - Referências a campos: identificadores lowercase (ex: quantidade_pedida)
 *   - Funções:
 *       SE(condicao, valor_se_verdadeiro, valor_se_falso)
 *       SOMA_ITENS(campo)
 *   - Condições: >, <, >=, <=, ==, !=
 *
 * Valores são materializados no banco pelo servidor; este módulo é responsável
 * pela lógica de parse, avaliação local e detecção de ciclos.
 */

import type { ColunaUsuario } from './types'

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

    // Espaços
    if (/\s/.test(ch)) { i++; continue }

    // Números
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(expressao[i + 1] ?? ''))) {
      let num = ''
      while (i < expressao.length && /[0-9.]/.test(expressao[i])) {
        num += expressao[i++]
      }
      tokens.push({ tipo: 'numero', valor: parseFloat(num) })
      continue
    }

    // Identificadores e funções
    if (/[a-zA-Z_]/.test(ch)) {
      let id = ''
      while (i < expressao.length && /[a-zA-Z0-9_]/.test(expressao[i])) {
        id += expressao[i++]
      }
      tokens.push({ tipo: 'ident', valor: id })
      continue
    }

    // Operadores de dois caracteres
    const dois = expressao.slice(i, i + 2)
    if (dois === '>=' || dois === '<=' || dois === '==' || dois === '!=') {
      tokens.push({ tipo: 'op', valor: dois })
      i += 2
      continue
    }

    // Operadores de um caractere
    if ('+-*/><'.includes(ch)) {
      tokens.push({ tipo: 'op', valor: ch })
      i++
      continue
    }

    if (ch === '(') { tokens.push({ tipo: 'lparen' }); i++; continue }
    if (ch === ')') { tokens.push({ tipo: 'rparen' }); i++; continue }
    if (ch === ',') { tokens.push({ tipo: 'virgula' }); i++; continue }

    throw new Error(`Caractere inesperado: '${ch}' na posição ${i}`)
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

  private esperarOp(op: string): void {
    const tok = this.consumir()
    if (tok.tipo !== 'op' || tok.valor !== op) {
      throw new Error(`Esperado '${op}', encontrado '${tok.tipo === 'op' ? tok.valor : tok.tipo}'`)
    }
  }

  // expressao → condicao
  parseExpressao(): FormulaAST {
    return this.parseCondicao()
  }

  // condicao → soma (('>' | '<' | '>=' | '<=' | '==' | '!=') soma)?
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

  // soma → produto (('+' | '-') produto)*
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

  // produto → unario (('*' | '/') unario)*
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

  // unario → '-' primario | primario
  private parseUnario(): FormulaAST {
    const tok = this.peek()
    if (tok.tipo === 'op' && tok.valor === '-') {
      this.consumir()
      const operando = this.parsePrimario()
      return { tipo: 'binop', op: '-', esq: { tipo: 'numero', valor: 0 }, dir: operando }
    }
    return this.parsePrimario()
  }

  // primario → numero | '(' expressao ')' | ident | funcao
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

      // Verifica se é uma chamada de função (próximo token é '(')
      if (this.peek().tipo === 'lparen') {
        this.consumir() // consome '('

        if (nome === 'SE') {
          return this.parseFuncaoSE()
        }

        if (nome === 'SOMA_ITENS') {
          return this.parseFuncaoSOMAITENS()
        }

        throw new Error(`Função desconhecida: '${nome}'`)
      }

      // É uma referência a campo
      return { tipo: 'campo', chave: nome }
    }

    if (tok.tipo === 'eof') {
      throw new Error('Expressão incompleta: esperava um número ou campo após o último operador')
    }
    if (tok.tipo === 'rparen') {
      throw new Error("Parêntese ')' inesperado")
    }
    if (tok.tipo === 'virgula') {
      throw new Error("Vírgula fora de função SE() ou SOMA_ITENS()")
    }
    throw new Error(`Token inesperado: '${(tok as { valor?: string }).valor ?? tok.tipo}'`)
  }

  // SE(condicao, valor_se_verdadeiro, valor_se_falso) — '(' já consumido
  private parseFuncaoSE(): FormulaAST {
    const condicao = this.parseExpressao()
    const virgula1 = this.consumir()
    if (virgula1.tipo !== 'virgula') throw new Error("Esperado ',' após condição do SE")
    const verdadeiro = this.parseExpressao()
    const virgula2 = this.consumir()
    if (virgula2.tipo !== 'virgula') throw new Error("Esperado ',' após valor verdadeiro do SE")
    const falso = this.parseExpressao()
    const fech = this.consumir()
    if (fech.tipo !== 'rparen') throw new Error("Esperado ')' para fechar SE")
    return { tipo: 'se', condicao, verdadeiro, falso }
  }

  // SOMA_ITENS(campo) — '(' já consumido
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

  // Verifica que todos os tokens foram consumidos
  const sobrou = parser.peekPublic()
  if (sobrou.tipo !== 'eof') {
    const extra = sobrou.tipo === 'ident' || sobrou.tipo === 'numero'
      ? `'${(sobrou as { valor: string | number }).valor}'`
      : sobrou.tipo
    throw new Error(`Token inesperado após fim da fórmula: ${extra}. Verifique se falta um operador.`)
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
        // cond != 0 significa verdadeiro
        return cond !== 0 ? avaliar(no.verdadeiro) : avaliar(no.falso)
      }

      case 'soma_itens': {
        // O servidor materializa o valor agregado; se estiver no contexto usa-o,
        // caso contrário marca como nulo e retorna 0.
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

/**
 * Detecta ciclo no grafo de dependências das colunas de fórmula.
 *
 * Retorna `true` se adicionar `colunaKey` com `formula_expressao` criaria um ciclo.
 * Usa DFS sobre o grafo de dependências entre colunas de fórmula.
 */
export function detectarCircular(
  colunaKey: string,
  formula_expressao: string,
  todasColunas: ColunaUsuario[],
): boolean {
  // Monta grafo: chave → lista de dependências (apenas colunas de fórmula)
  const grafo: Record<string, string[]> = {}

  for (const col of todasColunas) {
    if (col.tipo === 'formula' && col.formula_expressao) {
      grafo[col.chave] = extrairDependencias(col.formula_expressao)
        .filter(dep => todasColunas.some(c => c.chave === dep && c.tipo === 'formula'))
    }
  }

  // Adiciona (ou substitui) a coluna sendo criada/editada
  const novasDeps = extrairDependencias(formula_expressao)
    .filter(dep => dep !== colunaKey && todasColunas.some(c => c.chave === dep && c.tipo === 'formula'))

  grafo[colunaKey] = novasDeps

  // DFS para detectar ciclo a partir de `colunaKey`
  const visitado = new Set<string>()
  const emStack  = new Set<string>()

  function dfs(no: string): boolean {
    if (emStack.has(no)) return true  // ciclo detectado
    if (visitado.has(no)) return false

    visitado.add(no)
    emStack.add(no)

    for (const viz of grafo[no] ?? []) {
      if (dfs(viz)) return true
    }

    emStack.delete(no)
    return false
  }

  return dfs(colunaKey)
}
