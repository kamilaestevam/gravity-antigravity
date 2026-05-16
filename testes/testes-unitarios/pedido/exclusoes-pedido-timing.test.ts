// @vitest-environment node
/**
 * exclusoes-pedido-timing.test.ts
 *
 * Testes unitários da lógica de timing res.json vs $transaction.
 *
 * Contexto: o bug double-reload ocorria porque res.json() era chamado DENTRO
 * do callback de withOrganizacao (= dentro da $transaction). Com o fix,
 * res.json() é chamado FORA — somente após o await withOrganizacao resolver.
 *
 * Estes testes verificam o PADRÃO CORRETO de forma isolada, sem HTTP.
 */

import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

// ── Padrão correto (pós-fix): resultado extraído ANTES de enviar ──────────

/**
 * Simula o padrão CORRETO das rotas exclusoes-pedido.ts:
 *
 *   const resultado = await withOrganizacao(req, async (db) => {
 *     return service.metodo(db, ...)
 *   })
 *   res.json(resultado)         // ← FORA: só executa após COMMIT
 *
 * O `resultado` só existe quando o Promise de withOrganizacao resolve,
 * o que só acontece após o COMMIT da $transaction.
 */
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

/**
 * Simula o padrão ERRADO (pré-fix):
 *
 *   await withOrganizacao(req, async (db) => {
 *     const resultado = service.metodo(db, ...)
 *     res.json(resultado)       // ← DENTRO: executa antes do COMMIT
 *   })
 *
 * res.json é chamado enquanto a transaction ainda está aberta.
 */
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

// ── Testes ───────────────────────────────────────────────────────────────────

describe('Padrão correto: res.json após withOrganizacao', () => {
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

  it('res.json é chamado DEPOIS que withOrganizacao resolve', async () => {
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
      'tx:commit',     // COMMIT antes de res.json ← CORRETO
      'res.json',
    ])
  })

  it('se withOrganizacao rejeita, res.json NÃO é chamado', async () => {
    const resJson = vi.fn()
    const fakeWithOrganizacao = async () => { throw new Error('DB timeout') }
    const fakeService = async () => ({})

    await expect(padraoCorreto(fakeWithOrganizacao, fakeService, resJson)).rejects.toThrow('DB timeout')
    expect(resJson).not.toHaveBeenCalled()
  })
})

describe('Padrão errado (pré-fix): res.json dentro do callback', () => {
  it('res.json é chamado ANTES do commit da transaction', async () => {
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

    // BUG: res.json aparece ANTES de tx:commit
    expect(timeline).toEqual([
      'tx:open',
      'service:run',
      'res.json',      // ← ANTES do commit = bug double-reload
      'tx:commit',
    ])
  })
})

describe('Verificação Zod schemas das rotas (isolado)', () => {
  /**
   * Réplica dos schemas Zod de exclusoes-pedido.ts para teste unitário
   * da validação independente da camada HTTP.
   */
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

  it('ExcluirPreviewSchema aceita ids válidos', () => {
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

  it('ExcluirConfirmarSchema aceita ids válidos', () => {
    const result = ExcluirConfirmarSchema.safeParse({ ids: ['x'] })
    expect(result.success).toBe(true)
  })

  it('ExcluirConfirmarSchema rejeita ids vazio', () => {
    const result = ExcluirConfirmarSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
  })

  it('ExcluirItensSchema aceita payload válido', () => {
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
