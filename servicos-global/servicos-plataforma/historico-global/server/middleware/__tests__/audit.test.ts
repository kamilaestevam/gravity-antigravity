import { describe, it, expect } from 'vitest'
import { redactSensitive, DEFAULT_SENSITIVE_FIELDS } from '../audit.js'

describe('redactSensitive', () => {
  it('redata campo top-level (case-insensitive)', () => {
    const out = redactSensitive(
      { id: '1', Token: 'abc', PASSWORD: 'p', name: 'ok' },
      DEFAULT_SENSITIVE_FIELDS,
    )
    expect(out).toEqual({ id: '1', Token: '***', PASSWORD: '***', name: 'ok' })
  })

  it('redata campo aninhado em objeto', () => {
    const out = redactSensitive(
      { user: { id: 'u1', api_key: 'sk_live_xyz' }, public: 'visible' },
      DEFAULT_SENSITIVE_FIELDS,
    )
    expect(out).toEqual({ user: { id: 'u1', api_key: '***' }, public: 'visible' })
  })

  it('redata dentro de array de objetos', () => {
    const out = redactSensitive(
      [{ id: 1, secret: 'a' }, { id: 2, secret: 'b' }],
      DEFAULT_SENSITIVE_FIELDS,
    )
    expect(out).toEqual([{ id: 1, secret: '***' }, { id: 2, secret: '***' }])
  })

  it('preserva null/undefined/primitivos', () => {
    expect(redactSensitive(null, DEFAULT_SENSITIVE_FIELDS)).toBeNull()
    expect(redactSensitive(undefined, DEFAULT_SENSITIVE_FIELDS)).toBeUndefined()
    expect(redactSensitive('foo', DEFAULT_SENSITIVE_FIELDS)).toBe('foo')
    expect(redactSensitive(42, DEFAULT_SENSITIVE_FIELDS)).toBe(42)
    expect(redactSensitive(true, DEFAULT_SENSITIVE_FIELDS)).toBe(true)
  })

  it('respeita lista customizada (campos extras passam)', () => {
    const out = redactSensitive(
      { token: 'a', cpf: '123.456.789-00' },
      ['cpf'],
    )
    // 'cpf' redatado, 'token' passa porque a lista customizada substitui o default
    expect(out).toEqual({ token: 'a', cpf: '***' })
  })
})
