/**
 * Testa todos os caminhos do `consultarImpacto`:
 * - todos OK
 * - todos indisponíveis (sem env)
 * - parcial: 1 OK, 1 indisponível, 1 erro
 *
 * Mockamos `globalThis.fetch` direto pra controlar respostas dos produtos.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { consultarImpacto } from '../../server/src/services/preview-impacto.js'

const ENVS = ['PEDIDO_BASE_URL', 'LPCO_BASE_URL', 'NF_IMPORTACAO_BASE_URL', 'CHAVE_INTERNA_SERVICO'] as const
const backup: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const k of ENVS) backup[k] = process.env[k]
  process.env.CHAVE_INTERNA_SERVICO = 'fake-key'
})
afterEach(() => {
  for (const k of ENVS) {
    if (backup[k] === undefined) delete process.env[k]
    else process.env[k] = backup[k]
  }
  vi.restoreAllMocks()
})

describe('consultarImpacto', () => {
  it('retorna indisponivel pra todos quando nenhuma URL está configurada', async () => {
    delete process.env.PEDIDO_BASE_URL
    delete process.env.LPCO_BASE_URL
    delete process.env.NF_IMPORTACAO_BASE_URL

    const r = await consultarImpacto('SUID-1', 'org-1')
    expect(r.total).toBe(0)
    expect(r.por_produto).toHaveLength(3)
    expect(r.por_produto.every((p) => p.status === 'indisponivel')).toBe(true)
  })

  it('soma ativos quando todos os produtos respondem ok', async () => {
    process.env.PEDIDO_BASE_URL = 'http://pedido.local'
    process.env.LPCO_BASE_URL = 'http://lpco.local'
    process.env.NF_IMPORTACAO_BASE_URL = 'http://nf.local'

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ativos: 7 }), { status: 200 })))
    const r = await consultarImpacto('SUID-1', 'org-1')
    expect(r.total).toBe(21)
    expect(r.por_produto.every((p) => p.status === 'ok' && p.ativos === 7)).toBe(true)
  })

  it('lida com mix: 1 OK, 1 indisponível, 1 erro 500', async () => {
    process.env.PEDIDO_BASE_URL = 'http://pedido.local'
    delete process.env.LPCO_BASE_URL
    process.env.NF_IMPORTACAO_BASE_URL = 'http://nf.local'

    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('pedido.local')) return new Response(JSON.stringify({ ativos: 4 }), { status: 200 })
      if (url.includes('nf.local')) return new Response('boom', { status: 500 })
      throw new Error('inesperado')
    }))

    const r = await consultarImpacto('SUID-9', 'org-1')
    expect(r.total).toBe(4) // só 'ok' soma
    const porProduto = Object.fromEntries(r.por_produto.map((p) => [p.produto, p.status]))
    expect(porProduto.pedido).toBe('ok')
    expect(porProduto.lpco).toBe('indisponivel')
    expect(porProduto.nf_importacao).toBe('erro')
  })

  it('captura timeout/exceção como status=erro sem derrubar', async () => {
    process.env.PEDIDO_BASE_URL = 'http://pedido.local'
    delete process.env.LPCO_BASE_URL
    delete process.env.NF_IMPORTACAO_BASE_URL

    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED') }))
    const r = await consultarImpacto('SUID-X', 'org-1')
    const pedido = r.por_produto.find((p) => p.produto === 'pedido')!
    expect(pedido.status).toBe('erro')
    expect(pedido.mensagem).toMatch(/ECONNREFUSED/)
  })

  it('falha alto se CHAVE_INTERNA_SERVICO ausente e há URL configurada', async () => {
    process.env.PEDIDO_BASE_URL = 'http://pedido.local'
    delete process.env.CHAVE_INTERNA_SERVICO
    await expect(consultarImpacto('SUID-1', 'org-1')).rejects.toThrow(/CHAVE_INTERNA_SERVICO/)
  })
})
