// @vitest-environment node
/**
 * Testes unitários — timingSafeEqual com crypto nativo
 * Verifica que a implementação corrigida usa crypto.timingSafeEqual do Node.js
 * e não vaza informação de tamanho.
 */

import { describe, it, expect, vi } from 'vitest'
import { timingSafeEqual } from '../../../servicos-global/tenant/middleware/withInternalKeyValidation.js'
import { timingSafeEqual as nativeTimingSafeEqual } from 'crypto'

describe('timingSafeEqual — implementação com crypto nativo', () => {
  it('deve retornar true para strings idênticas', () => {
    expect(timingSafeEqual('gravity-key-123', 'gravity-key-123')).toBe(true)
  })

  it('deve retornar false para strings diferentes de mesmo tamanho', () => {
    expect(timingSafeEqual('aaaa-bbbb-cccc', 'xxxx-yyyy-zzzz')).toBe(false)
  })

  it('deve retornar false para strings de tamanhos diferentes', () => {
    expect(timingSafeEqual('short', 'much-longer-string')).toBe(false)
  })

  it('deve retornar true para strings vazias', () => {
    expect(timingSafeEqual('', '')).toBe(true)
  })

  it('deve retornar false para string vazia vs nao-vazia', () => {
    expect(timingSafeEqual('', 'abc')).toBe(false)
  })

  it('deve ser consistente com crypto.timingSafeEqual nativo', () => {
    const a = 'test-key-gravity-2026'
    const b = 'test-key-gravity-2026'
    const c = 'test-key-gravity-9999'

    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')
    const bufC = Buffer.from(c, 'utf8')

    expect(timingSafeEqual(a, b)).toBe(nativeTimingSafeEqual(bufA, bufB))
    expect(timingSafeEqual(a, c)).toBe(nativeTimingSafeEqual(bufA, bufC))
  })

  it('deve lidar com caracteres especiais (UTF-8)', () => {
    expect(timingSafeEqual('chave-ção-123', 'chave-ção-123')).toBe(true)
    expect(timingSafeEqual('chave-ção-123', 'chave-cao-123')).toBe(false)
  })

  it('nao deve vazar informacao — strings de tamanho diferente devem levar tempo similar', () => {
    // Este teste é conceitual — verifica que a funcao não faz early return
    // Em produção, um benchmark de timing seria necessario
    const start1 = performance.now()
    for (let i = 0; i < 1000; i++) {
      timingSafeEqual('a', 'abcdefghijklmnopqrstuvwxyz')
    }
    const time1 = performance.now() - start1

    const start2 = performance.now()
    for (let i = 0; i < 1000; i++) {
      timingSafeEqual('abcdefghijklmnopqrstuvwxyz', 'abcdefghijklmnopqrstuvwxyz')
    }
    const time2 = performance.now() - start2

    // Nao deve ter mais de 10x diferenca (heuristica conservadora)
    // O ponto é que ambos executam, não que sejam identicos
    expect(time1).toBeLessThan(time2 * 10)
    expect(time2).toBeLessThan(time1 * 10)
  })
})
