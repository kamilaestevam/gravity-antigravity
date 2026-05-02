import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CacheTTL } from '../../client/src/cache.js'

describe('CacheTTL', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('retorna valor armazenado dentro do TTL', () => {
    const cache = new CacheTTL<string>({ ttlMs: 1000 })
    cache.set('a', 'foo')
    expect(cache.get('a')).toBe('foo')
  })

  it('retorna null após expiração do TTL', () => {
    const cache = new CacheTTL<string>({ ttlMs: 1000 })
    cache.set('a', 'foo')
    vi.advanceTimersByTime(1500)
    expect(cache.get('a')).toBeNull()
  })

  it('respeita maxEntradas — evicta as mais antigas', () => {
    const cache = new CacheTTL<number>({ ttlMs: 60_000, maxEntradas: 3 })
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4) // deve evictar 'a'
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBe(2)
    expect(cache.get('d')).toBe(4)
    expect(cache.tamanho).toBe(3)
  })

  it('invalidate remove apenas a chave alvo', () => {
    const cache = new CacheTTL<string>()
    cache.set('a', 'x')
    cache.set('b', 'y')
    cache.invalidate('a')
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBe('y')
  })

  it('clear esvazia tudo', () => {
    const cache = new CacheTTL<string>()
    cache.set('a', 'x')
    cache.set('b', 'y')
    cache.clear()
    expect(cache.tamanho).toBe(0)
  })

  it('set sobrescreve valor e renova carimbo', () => {
    const cache = new CacheTTL<string>({ ttlMs: 1000 })
    cache.set('a', 'v1')
    vi.advanceTimersByTime(800)
    cache.set('a', 'v2')
    vi.advanceTimersByTime(500) // ainda dentro do TTL renovado
    expect(cache.get('a')).toBe('v2')
  })
})
