import { describe, it, expect } from 'vitest'
import { computeDiff, computeIntegrityHash } from '../audit.service.js'
import type { AuditLogInput } from '../audit.service.js'

// ── computeDiff ───────────────────────────────────────────────────────────────

describe('computeDiff', () => {
  it('retorna changed=false quando objetos são idênticos', () => {
    const obj = { name: 'Acme', status: 'ATIVO', value: 100 }
    const result = computeDiff(obj, { ...obj })
    expect(result.changed).toBe(false)
    expect(result.before).toEqual({})
    expect(result.after).toEqual({})
  })

  it('retorna apenas os campos alterados', () => {
    const before = { name: 'Acme', status: 'ATIVO', value: 100 }
    const after  = { name: 'Acme', status: 'INATIVO', value: 100 }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
    expect(result.before).toEqual({ status: 'ATIVO' })
    expect(result.after).toEqual({ status: 'INATIVO' })
    expect(result.before).not.toHaveProperty('name')
  })

  it('detecta campo adicionado', () => {
    const before = { name: 'Acme' } as Record<string, unknown>
    const after  = { name: 'Acme', email: 'novo@acme.com' }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
    expect(result.before.email).toBeUndefined()
    expect(result.after.email).toBe('novo@acme.com')
  })

  it('detecta campo removido', () => {
    const before = { name: 'Acme', obs: 'antiga' }
    const after  = { name: 'Acme', obs: undefined } as Record<string, unknown>
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
    expect(result.before.obs).toBe('antiga')
  })

  it('compara objetos aninhados via JSON.stringify', () => {
    const before = { meta: { pais: 'BR', cidade: 'SP' } }
    const after  = { meta: { pais: 'BR', cidade: 'RJ' } }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
  })

  it('trata arrays como valores escalares', () => {
    const before = { tags: ['a', 'b'] }
    const after  = { tags: ['a', 'b', 'c'] }
    const result = computeDiff(before, after)
    expect(result.changed).toBe(true)
  })
})

// ── computeIntegrityHash ──────────────────────────────────────────────────────

const BASE_INPUT: AuditLogInput = {
  tenant_id: 'tenant-123',
  actor_type: 'USER',
  actor_id: 'user-456',
  actor_name: 'Daniel',
  module: 'pedido',
  resource_type: 'Pedido',
  action: 'CREATE',
  action_detail: 'Criou pedido #001',
}

describe('computeIntegrityHash', () => {
  it('retorna string hexadecimal de 64 caracteres (SHA256)', () => {
    const hash = computeIntegrityHash(BASE_INPUT, new Date('2026-01-01T00:00:00Z'))
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('é determinístico — mesmo input → mesmo hash', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash(BASE_INPUT, date)
    expect(h1).toBe(h2)
  })

  it('muda ao alterar tenant_id', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, tenant_id: 'outro-tenant' }, date)
    expect(h1).not.toBe(h2)
  })

  it('muda ao alterar actor_id', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, actor_id: 'outro-user' }, date)
    expect(h1).not.toBe(h2)
  })

  it('muda ao alterar action', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, action: 'DELETE' }, date)
    expect(h1).not.toBe(h2)
  })

  it('muda ao alterar created_at', () => {
    const h1 = computeIntegrityHash(BASE_INPUT, new Date('2026-01-01T00:00:00Z'))
    const h2 = computeIntegrityHash(BASE_INPUT, new Date('2026-01-02T00:00:00Z'))
    expect(h1).not.toBe(h2)
  })

  it('NÃO inclui actor_name no hash (campo de PII — pode ser anonimizado sem invalidar)', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, actor_name: '[Anonimizado LGPD]' }, date)
    // actor_name não faz parte do hash — anonimização LGPD não quebra integridade
    expect(h1).toBe(h2)
  })

  it('before/after null é equivalente a omitido', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, before: null as unknown, after: null as unknown }, date)
    expect(h1).toBe(h2)
  })

  it('status padrão SUCCESS é equivalente a omitido', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    const h1 = computeIntegrityHash(BASE_INPUT, date)
    const h2 = computeIntegrityHash({ ...BASE_INPUT, status: 'SUCCESS' }, date)
    expect(h1).toBe(h2)
  })
})
