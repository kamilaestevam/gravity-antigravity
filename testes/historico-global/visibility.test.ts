// testes/historico-global/visibility.test.ts
// Testes unitários de buildVisibilityFilter e extractAuthUser.

import { describe, it, expect } from 'vitest'
import {
  buildVisibilityFilter,
  extractAuthUser,
} from '../../servicos-global/tenant/historico-global/server/lib/visibility.js'

describe('buildVisibilityFilter', () => {
  const base = { id: 'user-1', tenant_id: 'tenant-abc' }

  it('SUPER_ADMIN: sem filtro (vê tudo)', () => {
    const filter = buildVisibilityFilter({ ...base, role: 'SUPER_ADMIN' })
    expect(filter).toEqual({})
  })

  it('ADMIN: sem filtro (vê tudo)', () => {
    const filter = buildVisibilityFilter({ ...base, role: 'ADMIN' })
    expect(filter).toEqual({})
  })

  it('MASTER: filtra apenas por tenant_id', () => {
    const filter = buildVisibilityFilter({ ...base, role: 'MASTER' })
    expect(filter).toEqual({ tenant_id: 'tenant-abc' })
    expect(filter).not.toHaveProperty('user_id')
  })

  it('STANDARD: filtra por tenant_id + user_id', () => {
    const filter = buildVisibilityFilter({ ...base, role: 'STANDARD' })
    expect(filter).toEqual({ tenant_id: 'tenant-abc', user_id: 'user-1' })
  })

  it('SUPPLIER: filtra por tenant_id + user_id', () => {
    const filter = buildVisibilityFilter({ ...base, role: 'SUPPLIER' })
    expect(filter).toEqual({ tenant_id: 'tenant-abc', user_id: 'user-1' })
  })
})

describe('extractAuthUser', () => {
  it('retorna null quando auth não está presente', () => {
    const req = {} as any
    expect(extractAuthUser(req)).toBeNull()
  })

  it('retorna null quando userId está ausente', () => {
    const req = { auth: { tenantId: 'tenant-1' } } as any
    expect(extractAuthUser(req)).toBeNull()
  })

  it('retorna null quando tenantId está ausente', () => {
    const req = { auth: { userId: 'user-1' } } as any
    expect(extractAuthUser(req)).toBeNull()
  })

  it('extrai user com role padrão STANDARD quando role ausente', () => {
    const req = { auth: { userId: 'user-1', tenantId: 'tenant-1' } } as any
    const user = extractAuthUser(req)
    expect(user).not.toBeNull()
    expect(user?.id).toBe('user-1')
    expect(user?.tenant_id).toBe('tenant-1')
    expect(user?.role).toBe('STANDARD')
  })

  it('extrai user com role correto quando presente', () => {
    const req = { auth: { userId: 'admin-1', tenantId: 'tenant-2', role: 'MASTER' } } as any
    const user = extractAuthUser(req)
    expect(user?.role).toBe('MASTER')
  })
})
