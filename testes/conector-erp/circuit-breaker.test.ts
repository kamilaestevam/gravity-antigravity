// testes/conector-erp/circuit-breaker.test.ts
// Testes unitários do CircuitBreaker.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CircuitBreaker, getCircuitBreaker, resetCircuitBreaker } from '../../servicos-global/tenant/conector-erp/server/lib/circuit-breaker.js'

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker

  beforeEach(() => {
    cb = new CircuitBreaker({ failureThreshold: 5, recoveryTimeoutMs: 60_000, name: 'test' })
  })

  it('inicia no estado CLOSED', () => {
    expect(cb.currentState).toBe('CLOSED')
    expect(cb.failureCount).toBe(0)
  })

  it('permite requisição quando CLOSED', () => {
    expect(cb.allowRequest()).toBe(true)
  })

  it('abre após 5 falhas consecutivas', () => {
    for (let i = 0; i < 5; i++) {
      cb.onFailure()
    }
    expect(cb.currentState).toBe('OPEN')
  })

  it('não abre com 4 falhas', () => {
    for (let i = 0; i < 4; i++) {
      cb.onFailure()
    }
    expect(cb.currentState).toBe('CLOSED')
  })

  it('lança AppError quando OPEN (dentro do timeout)', () => {
    for (let i = 0; i < 5; i++) cb.onFailure()
    expect(() => cb.allowRequest()).toThrow('Circuit breaker aberto')
  })

  it('reseta para CLOSED após sucesso', () => {
    for (let i = 0; i < 3; i++) cb.onFailure()
    cb.onSuccess()
    expect(cb.currentState).toBe('CLOSED')
    expect(cb.failureCount).toBe(0)
  })

  it('transiciona OPEN → HALF_OPEN após timeout', () => {
    for (let i = 0; i < 5; i++) cb.onFailure()
    // Simular que o tempo passou
    ;(cb as unknown as { openedAt: number }).openedAt = Date.now() - 61_000
    expect(cb.allowRequest()).toBe(true)
    expect(cb.currentState).toBe('HALF_OPEN')
  })

  it('volta para OPEN se falhar em HALF_OPEN', () => {
    for (let i = 0; i < 5; i++) cb.onFailure()
    ;(cb as unknown as { openedAt: number }).openedAt = Date.now() - 61_000
    ;(cb as unknown as { state: string }).state = 'HALF_OPEN'
    cb.onFailure()
    expect(cb.currentState).toBe('OPEN')
  })

  it('execute() propaga sucesso e chama onSuccess', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await cb.execute(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(cb.currentState).toBe('CLOSED')
  })

  it('execute() propaga erro e chama onFailure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('ERP error'))
    await expect(cb.execute(fn)).rejects.toThrow('ERP error')
    expect(cb.failureCount).toBe(1)
  })

  describe('cache: getCircuitBreaker / resetCircuitBreaker', () => {
    it('retorna a mesma instância para a mesma chave', () => {
      const a = getCircuitBreaker('key-a')
      const b = getCircuitBreaker('key-a')
      expect(a).toBe(b)
    })

    it('resetCircuitBreaker cria nova instância', () => {
      const a = getCircuitBreaker('key-b')
      resetCircuitBreaker('key-b')
      const b = getCircuitBreaker('key-b')
      expect(a).not.toBe(b)
    })
  })

  describe('CircuitBreaker.fromPersisted', () => {
    it('cria CB CLOSED se circuit_breaker_open = false', () => {
      const cb2 = CircuitBreaker.fromPersisted({
        circuit_failures: 2,
        circuit_open_at: null,
        circuit_breaker_open: false,
      })
      expect(cb2.currentState).toBe('CLOSED')
      expect(cb2.failureCount).toBe(2)
    })

    it('cria CB OPEN se circuit_breaker_open = true e timeout não passou', () => {
      const cb2 = CircuitBreaker.fromPersisted({
        circuit_failures: 5,
        circuit_open_at: new Date(),
        circuit_breaker_open: true,
      })
      expect(cb2.currentState).toBe('OPEN')
    })

    it('cria CB HALF_OPEN se timeout passou', () => {
      const past = new Date(Date.now() - 70_000)
      const cb2 = CircuitBreaker.fromPersisted({
        circuit_failures: 5,
        circuit_open_at: past,
        circuit_breaker_open: true,
      })
      expect(cb2.currentState).toBe('HALF_OPEN')
    })
  })
})
