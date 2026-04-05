import { describe, it, expect } from 'vitest'
import { buildVisibilityFilter } from '../visibility.js'
import type { AuthUser } from '../visibility.js'

const makeUser = (role: AuthUser['role'], tenant_id = 'tenant-abc'): AuthUser => ({
  id: 'user-1',
  role,
  tenant_id,
})

describe('buildVisibilityFilter', () => {
  it('SUPER_ADMIN — retorna filtro vazio (vê tudo)', () => {
    const filter = buildVisibilityFilter(makeUser('SUPER_ADMIN'))
    expect(filter).toEqual({})
  })

  it('ADMIN — retorna filtro vazio (vê tudo)', () => {
    const filter = buildVisibilityFilter(makeUser('ADMIN'))
    expect(filter).toEqual({})
  })

  it('MASTER — filtra apenas pelo tenant_id', () => {
    const filter = buildVisibilityFilter(makeUser('MASTER', 'tenant-xyz'))
    expect(filter).toEqual({ tenant_id: 'tenant-xyz' })
    expect(filter).not.toHaveProperty('user_id')
  })

  it('STANDARD — filtra por tenant_id E user_id', () => {
    const user = makeUser('STANDARD', 'tenant-xyz')
    const filter = buildVisibilityFilter(user)
    expect(filter).toEqual({ tenant_id: 'tenant-xyz', user_id: 'user-1' })
  })

  it('SUPPLIER — filtra por tenant_id E user_id (mesmo que STANDARD)', () => {
    const user = makeUser('SUPPLIER', 'tenant-xyz')
    const filter = buildVisibilityFilter(user)
    expect(filter).toEqual({ tenant_id: 'tenant-xyz', user_id: 'user-1' })
  })

  it('MASTER de tenant A não vê dados do tenant B', () => {
    const filter = buildVisibilityFilter(makeUser('MASTER', 'tenant-A'))
    expect(filter).toHaveProperty('tenant_id', 'tenant-A')
    // não deve existir lógica que permita outro tenant
    expect(JSON.stringify(filter)).not.toContain('tenant-B')
  })

  it('STANDARD — isolamento garante que user_id é o do próprio usuário', () => {
    const user: AuthUser = { id: 'user-999', role: 'STANDARD', tenant_id: 'tenant-abc' }
    const filter = buildVisibilityFilter(user)
    expect(filter).toHaveProperty('user_id', 'user-999')
  })
})
