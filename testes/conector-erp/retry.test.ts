// testes/conector-erp/retry.test.ts
// Testes unitários do withRetry e calcDelay.

import { describe, it, expect, vi } from 'vitest'
import { withRetry, calcDelay } from '../../servicos-global/tenant/conector-erp/server/lib/retry.js'
import { AppError } from '../../servicos-global/tenant/conector-erp/server/lib/app-error.js'

// Mock do sleep para não aguardar em testes
vi.mock('../../servicos-global/tenant/conector-erp/server/lib/retry.js', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../servicos-global/tenant/conector-erp/server/lib/retry.js')>()
  return mod
})

describe('calcDelay', () => {
  it('tentativa 0 → 1000ms (1s)', () => {
    expect(calcDelay(0, 1000, 4)).toBe(1000)
  })

  it('tentativa 1 → 4000ms (4s)', () => {
    expect(calcDelay(1, 1000, 4)).toBe(4000)
  })

  it('tentativa 2 → 16000ms (16s)', () => {
    expect(calcDelay(2, 1000, 4)).toBe(16000)
  })
})

describe('withRetry', () => {
  it('retorna sucesso na primeira tentativa', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retenta na falha e retorna sucesso na segunda tentativa', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok')

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('lança após esgotar todas as tentativas', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })
    ).rejects.toThrow('always fails')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('não retenta em AppError com código UNAUTHORIZED', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new AppError('Não autorizado', 401, 'UNAUTHORIZED'))
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })
    ).rejects.toThrow('Não autorizado')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('não retenta em AppError com código NOT_FOUND', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new AppError('Não encontrado', 404, 'NOT_FOUND'))
    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 0 })
    ).rejects.toThrow('Não encontrado')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('chama onRetry callback com tentativa e delay', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok')

    const onRetry = vi.fn()
    await withRetry(fn, { maxAttempts: 3, baseDelayMs: 0, onRetry })
    expect(onRetry).toHaveBeenCalledWith(1, 0, expect.any(Error))
  })
})
