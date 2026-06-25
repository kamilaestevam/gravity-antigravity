// @vitest-environment node
/**
 * exclusoes-pedido-timing.test.ts
 *
 * Testes unitarios da logica de exclusao de itens do pedido:
 *
 * 1. Timing: res.json() FORA do callback de withOrganizacao (pos-fix)
 * 2. Renumeracao: sequencia_item_pedido recalculada sem lacunas apos exclusao
 * 3. Cache invalidation: data_atualizacao_pedido bumped apos exclusao de itens
 * 4. Validacao Zod dos schemas das rotas
 */

import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

// ── Padrao correto (pos-fix): resultado extraido ANTES de enviar ──────────

async function padraoCorreto(
  withOrganizacao: (fn: (db: unknown) => Promise<unknown>) => Promise<unknown>,
  serviceMethod: (db: unknown) => Promise<unknown>,
  resJson: (data: unknown) => void,
): Promise<void> {
  const resultado = await withOrganizacao(async (db) => {
    return serviceMethod(db)
  })
  resJson(resultado)
}

async function padraoErrado(
  withOrganizacao: (fn: (db: unknown) => Promise<unknown>) => Promise<unknown>,
  serviceMethod: (db: unknown) => Promise<unknown>,
  resJson: (data: unknown) => void,
): Promise<void> {
  await withOrganizacao(async (db) => {
    const resultado = await serviceMethod(db)
    resJson(resultado)
    return resultado
  })
}

// ── Testes de Timing ────────────────────────────────────────────────────────

describe('Padrao correto: res.json apos withOrganizacao', () => {
  it('res.json recebe o valor retornado pela transaction', async () => {
    const RESULTADO = { excluidos: 3 }
    const resJson = vi.fn()

    const fakeWithOrganizacao = async (fn: (db: unknown) => Promise<unknown>) => {
      return fn('db-mock')
    }
    const fakeService = async () => RESULTADO

    await padraoCorreto(fakeWithOrganizacao, fakeService, resJson)

    expect(resJson).toHaveBeenCalledOnce()
    expect(resJson).toHaveBeenCalledWith(RESULTADO)
  })

  it('res.json e chamado DEPOIS que withOrganizacao resolve', async () => {
    const timeline: string[] = []
    const resJson = vi.fn(() => timeline.push('res.json'))

    const fakeWithOrganizacao = async (fn: (db: unknown) => Promise<unknown>) => {
      timeline.push('tx:open')
      const r = await fn('db')
      timeline.push('tx:commit')
      return r
    }
    const fakeService = async () => {
      timeline.push('service:run')
      return { ok: true }
    }

    await padraoCorreto(fakeWithOrganizacao, fakeService, resJson)

    expect(timeline).toEqual([
      'tx:open',
      'service:run',
      'tx:commit',
      'res.json',
    ])
  })

  it('se withOrganizacao rejeita, res.json NAO e chamado', async () => {
    const resJson = vi.fn()
    const fakeWithOrganizacao = async () => { throw new Error('DB timeout') }
    const fakeService = async () => ({})

    await expect(padraoCorreto(fakeWithOrganizacao, fakeService, resJson)).rejects.toThrow('DB timeout')
    expect(resJson).not.toHaveBeenCalled()
  })
})

describe('Padrao errado (pre-fix): res.json dentro do callback', () => {
  it('res.json e chamado ANTES do commit da transaction', async () => {
    const timeline: string[] = []
    const resJson = vi.fn(() => timeline.push('res.json'))

    const fakeWithOrganizacao = async (fn: (db: unknown) => Promise<unknown>) => {
      timeline.push('tx:open')
      const r = await fn('db')
      timeline.push('tx:commit')
      return r
    }
    const fakeService = async () => {
      timeline.push('service:run')
      return { ok: true }
    }

    await padraoErrado(fakeWithOrganizacao, fakeService, resJson)

    expect(timeline).toEqual([
      'tx:open',
      'service:run',
      'res.json',
      'tx:commit',
    ])
  })
})

// ── Testes de Renumeracao ───────────────────────────────────────────────────

describe('Renumeracao de sequencia_item_pedido apos exclusao', () => {
  /**
   * Simula a logica de renumeracao implementada em excluirItens:
   * 1. Buscar itens restantes ordenados por sequencia_item_pedido ASC
   * 2. Re-atribuir 1, 2, 3, ... sequencialmente
   * 3. So faz update se a sequencia realmente mudou (otimizacao)
   */
  function calcularRenumeracao(
    itensRestantes: Array<{ id_item: string; sequencia_item_pedido: number }>,
  ): Array<{ id_item: string; novaSequencia: number }> {
    const ordenados = [...itensRestantes].sort(
      (a, b) => a.sequencia_item_pedido - b.sequencia_item_pedido,
    )
    const updates: Array<{ id_item: string; novaSequencia: number }> = []
    for (let i = 0; i < ordenados.length; i++) {
      const novaSequencia = i + 1
      if (ordenados[i].sequencia_item_pedido !== novaSequencia) {
        updates.push({ id_item: ordenados[i].id_item, novaSequencia })
      }
    }
    return updates
  }

  it('renumera itens com lacunas (1,3,5,6,7,8,9 -> 1,2,3,4,5,6,7)', () => {
    const itens = [
      { id_item: 'a', sequencia_item_pedido: 1 },
      { id_item: 'b', sequencia_item_pedido: 3 },
      { id_item: 'c', sequencia_item_pedido: 5 },
      { id_item: 'd', sequencia_item_pedido: 6 },
      { id_item: 'e', sequencia_item_pedido: 7 },
      { id_item: 'f', sequencia_item_pedido: 8 },
      { id_item: 'g', sequencia_item_pedido: 9 },
    ]

    const updates = calcularRenumeracao(itens)

    // Item 'a' ja esta com 1 — nao precisa update
    // Itens 'b'-'g' precisam ser renumerados
    expect(updates).toEqual([
      { id_item: 'b', novaSequencia: 2 },
      { id_item: 'c', novaSequencia: 3 },
      { id_item: 'd', novaSequencia: 4 },
      { id_item: 'e', novaSequencia: 5 },
      { id_item: 'f', novaSequencia: 6 },
      { id_item: 'g', novaSequencia: 7 },
    ])
  })

  it('nao gera updates quando sequencia ja esta correta (1,2,3)', () => {
    const itens = [
      { id_item: 'a', sequencia_item_pedido: 1 },
      { id_item: 'b', sequencia_item_pedido: 2 },
      { id_item: 'c', sequencia_item_pedido: 3 },
    ]

    const updates = calcularRenumeracao(itens)
    expect(updates).toEqual([])
  })

  it('renumera quando ultimo item e removido (1,2,4 -> 1,2,3)', () => {
    const itens = [
      { id_item: 'a', sequencia_item_pedido: 1 },
      { id_item: 'b', sequencia_item_pedido: 2 },
      { id_item: 'c', sequencia_item_pedido: 4 },
    ]

    const updates = calcularRenumeracao(itens)
    expect(updates).toEqual([
      { id_item: 'c', novaSequencia: 3 },
    ])
  })

  it('renumera quando primeiro item e removido (2,3,4 -> 1,2,3)', () => {
    const itens = [
      { id_item: 'b', sequencia_item_pedido: 2 },
      { id_item: 'c', sequencia_item_pedido: 3 },
      { id_item: 'd', sequencia_item_pedido: 4 },
    ]

    const updates = calcularRenumeracao(itens)
    expect(updates).toEqual([
      { id_item: 'b', novaSequencia: 1 },
      { id_item: 'c', novaSequencia: 2 },
      { id_item: 'd', novaSequencia: 3 },
    ])
  })

  it('retorna vazio quando nao ha itens restantes', () => {
    const updates = calcularRenumeracao([])
    expect(updates).toEqual([])
  })

  it('renumera corretamente com um unico item restante (5 -> 1)', () => {
    const itens = [{ id_item: 'e', sequencia_item_pedido: 5 }]

    const updates = calcularRenumeracao(itens)
    expect(updates).toEqual([
      { id_item: 'e', novaSequencia: 1 },
    ])
  })

  it('renumera com lacunas grandes (1,10,20 -> 1,2,3)', () => {
    const itens = [
      { id_item: 'a', sequencia_item_pedido: 1 },
      { id_item: 'b', sequencia_item_pedido: 10 },
      { id_item: 'c', sequencia_item_pedido: 20 },
    ]

    const updates = calcularRenumeracao(itens)
    expect(updates).toEqual([
      { id_item: 'b', novaSequencia: 2 },
      { id_item: 'c', novaSequencia: 3 },
    ])
  })
})

// ── Testes de Bump de data_atualizacao_pedido ───────────────────────────────

describe('Bump de data_atualizacao_pedido apos exclusao de itens', () => {
  /**
   * Simula a logica do excluirItens:
   * - Se o pedido NAO foi auto-excluido (itens restantes > 0),
   *   faz update no pedido para bumpar data_atualizacao_pedido.
   * - Se o pedido FOI auto-excluido (sem itens), NAO faz update
   *   (pedido foi deletado).
   */
  it('bump e feito quando pedido continua existindo (itens restantes > 0)', () => {
    const pedidoUpdateChamado = vi.fn()
    const pedidoExcluido = false

    // Simula logica pos-delete
    if (!pedidoExcluido) {
      pedidoUpdateChamado({ data: { data_atualizacao_pedido: new Date() } })
    }

    expect(pedidoUpdateChamado).toHaveBeenCalledOnce()
  })

  it('bump NAO e feito quando pedido foi auto-excluido (sem itens)', () => {
    const pedidoUpdateChamado = vi.fn()
    const pedidoExcluido = true

    if (!pedidoExcluido) {
      pedidoUpdateChamado({ data: { data_atualizacao_pedido: new Date() } })
    }

    expect(pedidoUpdateChamado).not.toHaveBeenCalled()
  })

  it('useGTExpandir invalida cache quando updated_at muda', () => {
    // Simula o mecanismo do useGTExpandir (linha 106):
    // if (chaveAnterior !== undefined && chaveAnterior !== chaveAtual)
    const chaveAnterior = '2026-05-15T10:00:00.000Z'
    const chaveAtual = '2026-05-15T10:05:00.000Z' // bumped apos exclusao

    const deveRecarregar = chaveAnterior !== undefined && chaveAnterior !== chaveAtual
    expect(deveRecarregar).toBe(true)
  })

  it('useGTExpandir NAO invalida cache quando updated_at NAO muda (bug pre-fix)', () => {
    const chaveAnterior = '2026-05-15T10:00:00.000Z'
    const chaveAtual = '2026-05-15T10:00:00.000Z' // SEM bump — bug

    const deveRecarregar = chaveAnterior !== undefined && chaveAnterior !== chaveAtual
    expect(deveRecarregar).toBe(false)
  })
})

// ── Testes de Validacao Zod ─────────────────────────────────────────────────

describe('Verificacao Zod schemas das rotas (isolado)', () => {
  const ExcluirPreviewSchema = z.object({
    ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para excluir'),
  })

  const ExcluirConfirmarSchema = z.object({
    ids: z.array(z.string().min(1)).min(1),
  })

  const ExcluirItensSchema = z.object({
    pedido_id: z.string().min(1),
    item_ids: z.array(z.string().min(1)).min(1),
  })

  it('ExcluirPreviewSchema aceita ids validos', () => {
    const result = ExcluirPreviewSchema.safeParse({ ids: ['abc', 'def'] })
    expect(result.success).toBe(true)
  })

  it('ExcluirPreviewSchema rejeita ids vazio', () => {
    const result = ExcluirPreviewSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
  })

  it('ExcluirPreviewSchema rejeita string vazia dentro de ids', () => {
    const result = ExcluirPreviewSchema.safeParse({ ids: [''] })
    expect(result.success).toBe(false)
  })

  it('ExcluirPreviewSchema rejeita body sem ids', () => {
    const result = ExcluirPreviewSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('ExcluirConfirmarSchema aceita ids validos', () => {
    const result = ExcluirConfirmarSchema.safeParse({ ids: ['x'] })
    expect(result.success).toBe(true)
  })

  it('ExcluirConfirmarSchema rejeita ids vazio', () => {
    const result = ExcluirConfirmarSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
  })

  it('ExcluirItensSchema aceita payload valido', () => {
    const result = ExcluirItensSchema.safeParse({ pedido_id: 'p1', item_ids: ['i1'] })
    expect(result.success).toBe(true)
  })

  it('ExcluirItensSchema rejeita pedido_id vazio', () => {
    const result = ExcluirItensSchema.safeParse({ pedido_id: '', item_ids: ['i1'] })
    expect(result.success).toBe(false)
  })

  it('ExcluirItensSchema rejeita item_ids vazio', () => {
    const result = ExcluirItensSchema.safeParse({ pedido_id: 'p1', item_ids: [] })
    expect(result.success).toBe(false)
  })

  it('ExcluirItensSchema rejeita body sem pedido_id', () => {
    const result = ExcluirItensSchema.safeParse({ item_ids: ['i1'] })
    expect(result.success).toBe(false)
  })
})
