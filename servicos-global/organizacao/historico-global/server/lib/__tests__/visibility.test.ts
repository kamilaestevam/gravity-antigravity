import { describe, it, expect } from 'vitest'
import { buildVisibilityFilter } from '../visibility.js'
import type { AuthUser } from '../visibility.js'

const makeUser = (role: AuthUser['role'], id_organizacao = 'org-abc'): AuthUser => ({
  id: 'user-1',
  role,
  id_organizacao,
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

  it('MASTER — filtra apenas pelo id_organizacao', () => {
    const filter = buildVisibilityFilter(makeUser('MASTER', 'org-xyz'))
    expect(filter).toEqual({ id_organizacao: 'org-xyz' })
    expect(filter).not.toHaveProperty('id_usuario')
  })

  it('STANDARD — filtra por id_organizacao E id_usuario', () => {
    const user = makeUser('STANDARD', 'org-xyz')
    const filter = buildVisibilityFilter(user)
    expect(filter).toEqual({ id_organizacao: 'org-xyz', id_usuario: 'user-1' })
  })

  it('SUPPLIER — filtra por id_organizacao E id_usuario (mesmo que STANDARD)', () => {
    const user = makeUser('SUPPLIER', 'org-xyz')
    const filter = buildVisibilityFilter(user)
    expect(filter).toEqual({ id_organizacao: 'org-xyz', id_usuario: 'user-1' })
  })

  it('MASTER da organização A não vê dados da organização B', () => {
    const filter = buildVisibilityFilter(makeUser('MASTER', 'org-A'))
    expect(filter).toHaveProperty('id_organizacao', 'org-A')
    // não deve existir lógica que permita outra organização
    expect(JSON.stringify(filter)).not.toContain('org-B')
  })

  it('STANDARD — isolamento garante que id_usuario é o do próprio usuário', () => {
    const user: AuthUser = { id: 'user-999', role: 'STANDARD', id_organizacao: 'org-abc' }
    const filter = buildVisibilityFilter(user)
    expect(filter).toHaveProperty('id_usuario', 'user-999')
  })
})
