/**
 * colunas-usuario-injecao.test.ts — Testes do fix 2026-05-13:
 *
 *   1) Schemas `.strict()` em PUT — bloqueia `_colunas_usuario` no payload
 *      (Mand. 09 — contrato bilateral; rota dedicada cuida do save).
 *   2) `injetarValoresColunasUsuario` polimórfico — aceita vínculo
 *      'pedido' (default) e 'item' com idField configurável.
 *      Cobre os 6 cenários acordados com Coordenador+Líder.
 *
 * Bug original (sintoma):
 *   - editar coluna personalizada no PEDIDO → salva mas some no reload
 *   - editar coluna personalizada no ITEM   → não salva nem visualmente
 *
 * Causa: backend gravava certo, mas as rotas de leitura (`GET /:id`,
 * `GET /:id/itens`, `GET /inicializacao`) não chamavam o helper de injeção;
 * e o helper só sabia ler vínculo='pedido'. Fix consolida tudo em 1 commit
 * com testes que evitam regressão.
 */

import { describe, it, expect } from 'vitest'
import {
  atualizarPedidoSchema,
  atualizarItemSchema,
  injetarValoresColunasUsuario,
  injetarColunasPedidoEItens,
} from '../../../../processos-core/src/routes/pedidos.js'

// ── Schemas .strict() ────────────────────────────────────────────────────────

describe('atualizarPedidoSchema — .strict() (Mand. 09)', () => {
  it('aceita payload válido sem campos extras', () => {
    const parse = atualizarPedidoSchema.safeParse({ numero_pedido: 'PO-001' })
    expect(parse.success).toBe(true)
  })

  it('REJEITA payload com `_colunas_usuario` (bug original)', () => {
    const parse = atualizarPedidoSchema.safeParse({
      numero_pedido: 'PO-001',
      _colunas_usuario: { col_id_1: 'abc' },
    })
    expect(parse.success).toBe(false)
    if (!parse.success) {
      const issues = parse.error.issues.map((i) => i.code)
      expect(issues).toContain('unrecognized_keys')
    }
  })

  it('REJEITA payload com qualquer campo desconhecido', () => {
    const parse = atualizarPedidoSchema.safeParse({
      numero_pedido: 'PO-001',
      campo_inventado: 'x',
    })
    expect(parse.success).toBe(false)
  })
})

describe('atualizarItemSchema — .strict() (Mand. 09)', () => {
  it('aceita payload válido sem campos extras', () => {
    const parse = atualizarItemSchema.safeParse({ part_number: 'ABC-123' })
    expect(parse.success).toBe(true)
  })

  it('REJEITA payload com `_colunas_usuario` (bug original)', () => {
    const parse = atualizarItemSchema.safeParse({
      part_number: 'ABC-123',
      _colunas_usuario: { col_id_1: '500' },
    })
    expect(parse.success).toBe(false)
    if (!parse.success) {
      const issues = parse.error.issues.map((i) => i.code)
      expect(issues).toContain('unrecognized_keys')
    }
  })
})

// ── injetarValoresColunasUsuario polimórfico ─────────────────────────────────

// Mock mínimo do PrismaClient — apenas a parte que o helper toca.
function criarPrismaMock(rows: Array<{
  id_organizacao: string
  vinculo_valor_coluna_usuario_pedido: string
  id_vinculo_valor_coluna_usuario_pedido: string
  id_coluna_usuario_pedido: string
  valor_coluna_usuario_pedido: string
}>) {
  // Captura também os argumentos passados para findMany — usado pra assertar
  // que o filtro de `vinculo` está discriminando corretamente.
  const calls: Array<{ where: Record<string, unknown> }> = []
  const findMany = (args: { where: Record<string, unknown>; select?: unknown }) => {
    calls.push({ where: args.where })
    const w = args.where
    return Promise.resolve(rows.filter((r) => {
      if (r.id_organizacao !== w.id_organizacao) return false
      if (w.vinculo_valor_coluna_usuario_pedido && r.vinculo_valor_coluna_usuario_pedido !== w.vinculo_valor_coluna_usuario_pedido) return false
      const ids = (w.id_vinculo_valor_coluna_usuario_pedido as { in?: string[] } | undefined)?.in
      if (ids && !ids.includes(r.id_vinculo_valor_coluna_usuario_pedido)) return false
      return true
    }))
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { prisma: { pedidoListaColunaUsuarioValor: { findMany } } as any, calls }
}

const ORG = 'org_test_001'
const ROWS = [
  // vínculos 'pedido'
  { id_organizacao: ORG, vinculo_valor_coluna_usuario_pedido: 'pedido', id_vinculo_valor_coluna_usuario_pedido: 'ped_1', id_coluna_usuario_pedido: 'col_margem', valor_coluna_usuario_pedido: '15%' },
  { id_organizacao: ORG, vinculo_valor_coluna_usuario_pedido: 'pedido', id_vinculo_valor_coluna_usuario_pedido: 'ped_2', id_coluna_usuario_pedido: 'col_margem', valor_coluna_usuario_pedido: '20%' },
  // vínculos 'item'
  { id_organizacao: ORG, vinculo_valor_coluna_usuario_pedido: 'item', id_vinculo_valor_coluna_usuario_pedido: 'item_a', id_coluna_usuario_pedido: 'col_obs', valor_coluna_usuario_pedido: 'obs A' },
  { id_organizacao: ORG, vinculo_valor_coluna_usuario_pedido: 'item', id_vinculo_valor_coluna_usuario_pedido: 'item_b', id_coluna_usuario_pedido: 'col_obs', valor_coluna_usuario_pedido: 'obs B' },
  // vínculo de outra organização — não deve vazar
  { id_organizacao: 'org_other', vinculo_valor_coluna_usuario_pedido: 'pedido', id_vinculo_valor_coluna_usuario_pedido: 'ped_1', id_coluna_usuario_pedido: 'col_margem', valor_coluna_usuario_pedido: 'LEAK' },
]

describe('injetarValoresColunasUsuario — polimórfico (vínculo pedido + item)', () => {
  it('cenário 1 — vínculo=pedido (default): injeta colunas no pedido pai', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const pedidos = [{ id_pedido: 'ped_1', numero_pedido: 'PO-1' }, { id_pedido: 'ped_2', numero_pedido: 'PO-2' }]
    const out = await injetarValoresColunasUsuario(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario).toEqual({ col_margem: '15%' })
    expect(out[1]._colunas_usuario).toEqual({ col_margem: '20%' })
    // filtro de vínculo está sendo aplicado
    expect(calls[0].where.vinculo_valor_coluna_usuario_pedido).toBe('pedido')
  })

  it('cenário 2 — vínculo=item: injeta colunas só dos itens', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const itens = [{ id_item: 'item_a', part_number_item: 'X' }, { id_item: 'item_b', part_number_item: 'Y' }]
    const out = await injetarValoresColunasUsuario(prisma, itens, ORG, { vinculo: 'item', idField: 'id_item' })
    expect(out[0]._colunas_usuario).toEqual({ col_obs: 'obs A' })
    expect(out[1]._colunas_usuario).toEqual({ col_obs: 'obs B' })
    expect(calls[0].where.vinculo_valor_coluna_usuario_pedido).toBe('item')
  })

  it('cenário 3 — itens diferentes recebem valores diferentes (não contamina)', async () => {
    const { prisma } = criarPrismaMock(ROWS)
    const itens = [{ id_item: 'item_a' }, { id_item: 'item_b' }, { id_item: 'item_c_inexistente' }]
    const out = await injetarValoresColunasUsuario(prisma, itens, ORG, { vinculo: 'item', idField: 'id_item' })
    expect(out[0]._colunas_usuario.col_obs).toBe('obs A')
    expect(out[1]._colunas_usuario.col_obs).toBe('obs B')
    // item sem valores cadastrados — recebe {} (não erra, não confunde com outro item)
    expect(out[2]._colunas_usuario).toEqual({})
  })

  it('cenário 4 — cross-org: org A não vê valores de org B', async () => {
    const { prisma } = criarPrismaMock(ROWS)
    const pedidos = [{ id_pedido: 'ped_1' }]
    const out = await injetarValoresColunasUsuario(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario.col_margem).toBe('15%')
    expect(JSON.stringify(out)).not.toContain('LEAK')
  })

  it('cenário 5 — array vazio: retorna [] sem fazer query', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const out = await injetarValoresColunasUsuario(prisma, [] as Array<{ id_pedido: string }>, ORG)
    expect(out).toEqual([])
    expect(calls.length).toBe(0)
  })

  it('cenário 6 — pedido sem valores cadastrados: recebe {} (não null/undefined)', async () => {
    const { prisma } = criarPrismaMock(ROWS)
    const pedidos = [{ id_pedido: 'ped_inexistente' }]
    const out = await injetarValoresColunasUsuario(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario).toEqual({})
  })

  it('cenário 7 — registros sem idField válido: recebem {} (defensivo)', async () => {
    const { prisma } = criarPrismaMock(ROWS)
    const pedidos = [{ id_pedido: '' }, { id_pedido: null as unknown as string }, { id_pedido: 'ped_1' }]
    const out = await injetarValoresColunasUsuario(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario).toEqual({})
    expect(out[1]._colunas_usuario).toEqual({})
    expect(out[2]._colunas_usuario).toEqual({ col_margem: '15%' })
  })
})

// ── Helper composto: pedidos + itens em uma passada ──────────────────────────

describe('injetarColunasPedidoEItens — 2 níveis em uma chamada', () => {
  it('injeta tanto no pedido quanto nos itens embarcados', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const pedidos = [
      {
        id_pedido: 'ped_1',
        numero_pedido: 'PO-1',
        itens_pedido: [
          { id_item: 'item_a', part_number_item: 'X' },
          { id_item: 'item_b', part_number_item: 'Y' },
        ],
      },
    ]
    const out = await injetarColunasPedidoEItens(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario).toEqual({ col_margem: '15%' })
    expect(out[0].itens_pedido?.[0]).toMatchObject({
      id_item: 'item_a',
      _colunas_usuario: { col_obs: 'obs A' },
    })
    expect(out[0].itens_pedido?.[1]).toMatchObject({
      id_item: 'item_b',
      _colunas_usuario: { col_obs: 'obs B' },
    })
    // 2 queries total — 1 para pedidos, 1 para itens (batch) — sem N+1
    expect(calls.length).toBe(2)
    expect(calls[0].where.vinculo_valor_coluna_usuario_pedido).toBe('pedido')
    expect(calls[1].where.vinculo_valor_coluna_usuario_pedido).toBe('item')
  })

  it('pedidos sem itens — só faz 1 query', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const pedidos = [{ id_pedido: 'ped_1', numero_pedido: 'PO-1', itens_pedido: [] }]
    const out = await injetarColunasPedidoEItens(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario).toEqual({ col_margem: '15%' })
    expect(out[0].itens_pedido).toEqual([])
    expect(calls.length).toBe(1)
  })

  it('múltiplos pedidos com múltiplos itens — 2 queries totais (batch)', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const pedidos = [
      { id_pedido: 'ped_1', itens_pedido: [{ id_item: 'item_a' }] },
      { id_pedido: 'ped_2', itens_pedido: [{ id_item: 'item_b' }] },
    ]
    const out = await injetarColunasPedidoEItens(prisma, pedidos, ORG)
    expect(out[0]._colunas_usuario.col_margem).toBe('15%')
    expect(out[1]._colunas_usuario.col_margem).toBe('20%')
    expect(out[0].itens_pedido?.[0]).toMatchObject({ _colunas_usuario: { col_obs: 'obs A' } })
    expect(out[1].itens_pedido?.[0]).toMatchObject({ _colunas_usuario: { col_obs: 'obs B' } })
    expect(calls.length).toBe(2) // 1 batch pedido + 1 batch item — não cresce com N
  })

  it('array vazio — retorna []', async () => {
    const { prisma, calls } = criarPrismaMock(ROWS)
    const out = await injetarColunasPedidoEItens(prisma, [] as Array<{ id_pedido: string }>, ORG)
    expect(out).toEqual([])
    expect(calls.length).toBe(0)
  })
})
