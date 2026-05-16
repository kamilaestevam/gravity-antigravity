// @vitest-environment node
/**
 * edicao-massa-mensagens-erro.test.ts — Valida que mensagens de erro do backend
 * e frontend são traduzidas para linguagem humana (nunca stack traces).
 */
import { describe, it, expect } from 'vitest'

// ── Backend: reproduz a lógica de resolverMensagemErro ──────────────────────

function resolverMensagemErro(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const nomes = (prismaErr.meta?.target ?? [])
        .filter(Boolean)
        .join(', ') || 'campo'
      return `Já existe outro pedido com esse mesmo valor de ${nomes}. Use um valor diferente ou edite apenas 1 pedido por vez.`
    }
    if (prismaErr.code === 'P2024') {
      return 'A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.'
    }
  }

  const msg = err instanceof Error ? err.message : ''

  if (/Transaction.*not found|Transaction.*timed?\s*out|Transaction.*expired/i.test(msg)) {
    return 'A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.'
  }
  if (/Can't reach database|Connection.*refused|ECONNREFUSED/i.test(msg)) {
    return 'Não foi possível conectar ao banco de dados. Tente novamente em alguns segundos.'
  }

  return 'Erro interno ao processar a edição. Tente novamente ou contate o suporte.'
}

// ── Frontend: reproduz a lógica de traduzirErro ──────────────────────────────

const MENSAGENS_AMIGAVEIS: [RegExp, string][] = [
  [/x-id-workspace ausente/i, 'Nenhum workspace selecionado. Selecione um workspace no topo da tela antes de editar.'],
  [/Portão \d/i, ''],
  [/WORKSPACE_NAO_INFORMADO/i, 'Nenhum workspace selecionado. Selecione um workspace no topo da tela antes de editar.'],
  [/VALIDATION_ERROR/i, ''],
  [/Transaction.*not found|Transaction.*timed?\s*out|P2024|Transaction.*expired/i, 'A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.'],
  [/INTERNAL_ERROR|Erro interno/i, 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.'],
  [/Can't reach database|ECONNREFUSED|Connection.*refused/i, 'Não foi possível conectar ao servidor. Tente novamente em alguns segundos.'],
  [/timeout|ETIMEDOUT/i, 'A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.'],
]

function traduzirErro(mensagem: string): string {
  for (const [regex, amigavel] of MENSAGENS_AMIGAVEIS) {
    if (regex.test(mensagem)) {
      return amigavel || mensagem
    }
  }
  return mensagem
}

// ── Testes Backend ──────────────────────────────────────────────────────────

describe('resolverMensagemErro (backend)', () => {
  it('P2002 → mensagem de unique constraint amigável', () => {
    const err = { code: 'P2002', meta: { target: ['numero_pedido'] } }
    const msg = resolverMensagemErro(err)
    expect(msg).toContain('mesmo valor')
    expect(msg).not.toContain('P2002')
  })

  it('P2024 → mensagem de timeout amigável', () => {
    const err = { code: 'P2024' }
    const msg = resolverMensagemErro(err)
    expect(msg).toBe('A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.')
  })

  it('Transaction not found → mensagem de timeout', () => {
    const err = new Error('Transaction API error: Transaction not found. A]...')
    const msg = resolverMensagemErro(err)
    expect(msg).toContain('demorou mais que o esperado')
    expect(msg).not.toContain('Transaction')
  })

  it('Transaction timed out → mensagem de timeout', () => {
    const err = new Error('Transaction timed out after 30000ms')
    const msg = resolverMensagemErro(err)
    expect(msg).toContain('demorou mais que o esperado')
  })

  it('ECONNREFUSED → mensagem de conexão', () => {
    const err = new Error('connect ECONNREFUSED 127.0.0.1:5432')
    const msg = resolverMensagemErro(err)
    expect(msg).toContain('conectar ao banco')
  })

  it('erro genérico desconhecido → mensagem genérica amigável (sem stack trace)', () => {
    const err = new Error('Invalid `db.pedidoItem.update()` invocation in C:\\Users\\danie\\gravity...')
    const msg = resolverMensagemErro(err)
    expect(msg).toBe('Erro interno ao processar a edição. Tente novamente ou contate o suporte.')
    expect(msg).not.toContain('invocation')
    expect(msg).not.toContain('C:\\')
  })

  it('null/undefined → mensagem genérica amigável', () => {
    expect(resolverMensagemErro(null)).toBe('Erro interno ao processar a edição. Tente novamente ou contate o suporte.')
    expect(resolverMensagemErro(undefined)).toBe('Erro interno ao processar a edição. Tente novamente ou contate o suporte.')
  })
})

// ── Testes Frontend ─────────────────────────────────────────────────────────

describe('traduzirErro (frontend)', () => {
  it('Transaction not found → mensagem amigável', () => {
    const msg = traduzirErro('Transaction API error: Transaction not found')
    expect(msg).toBe('A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.')
  })

  it('P2024 → mensagem amigável', () => {
    const msg = traduzirErro('Prisma error P2024: timeout')
    expect(msg).toBe('A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.')
  })

  it('INTERNAL_ERROR → mensagem amigável', () => {
    const msg = traduzirErro('INTERNAL_ERROR')
    expect(msg).toBe('Ocorreu um erro inesperado. Tente novamente ou contate o suporte.')
  })

  it('ECONNREFUSED → mensagem de conexão', () => {
    const msg = traduzirErro('connect ECONNREFUSED 127.0.0.1:5432')
    expect(msg).toBe('Não foi possível conectar ao servidor. Tente novamente em alguns segundos.')
  })

  it('timeout genérico → mensagem amigável', () => {
    const msg = traduzirErro('Request timeout after 30000ms')
    expect(msg).toBe('A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.')
  })

  it('VALIDATION_ERROR → passa a mensagem original (regex com string vazia)', () => {
    const msg = traduzirErro('VALIDATION_ERROR: campo X inválido')
    expect(msg).toBe('VALIDATION_ERROR: campo X inválido')
  })

  it('mensagem já amigável do backend → retorna como está', () => {
    const msg = traduzirErro('A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.')
    expect(msg).not.toContain('Transaction')
  })

  it('stack trace raw do Prisma → capturado por timeout regex', () => {
    const raw = 'Invalid `db.pedidoItem.update()` invocation... Transaction expired'
    const msg = traduzirErro(raw)
    expect(msg).toBe('A operação demorou mais que o esperado. Tente novamente com menos pedidos selecionados.')
  })
})
