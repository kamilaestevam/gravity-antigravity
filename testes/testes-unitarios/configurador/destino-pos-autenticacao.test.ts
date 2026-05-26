// @vitest-environment node
// TST-UNIT-CONF-PORTEIRO-001 — Porteiro SSOT pós-autenticação (/me → trial | hub)
import { describe, it, expect } from 'vitest'
import {
  resolverDestinoPosAutenticacao,
  meDestinoPorteiroSchema,
} from '../../../servicos-global/configurador/src/routing/destino-pos-autenticacao.js'

describe('meDestinoPorteiroSchema', () => {
  it('aceita organizacao presente', () => {
    const parsed = meDestinoPorteiroSchema.parse({
      organizacao: { id_organizacao: 'org_abc' },
    })
    expect(parsed.organizacao?.id_organizacao).toBe('org_abc')
  })

  it('aceita organizacao null', () => {
    const parsed = meDestinoPorteiroSchema.parse({ organizacao: null })
    expect(parsed.organizacao).toBeNull()
  })
})

describe('resolverDestinoPosAutenticacao', () => {
  it('401 → trial (Clerk sem usuario no Prisma)', () => {
    expect(resolverDestinoPosAutenticacao(401, null)).toBe('trial')
  })

  it('404 → trial', () => {
    expect(resolverDestinoPosAutenticacao(404, null)).toBe('trial')
  })

  it('200 com organizacao → hub', () => {
    expect(
      resolverDestinoPosAutenticacao(200, {
        organizacao: { id_organizacao: 'org_xyz' },
      }),
    ).toBe('hub')
  })

  it('200 sem organizacao → trial', () => {
    expect(
      resolverDestinoPosAutenticacao(200, {
        organizacao: null,
      }),
    ).toBe('trial')
  })

  it('500 → trial (fail-safe signup)', () => {
    expect(resolverDestinoPosAutenticacao(500, null)).toBe('trial')
  })

  it('200 com payload invalido → trial', () => {
    expect(resolverDestinoPosAutenticacao(200, { foo: 'bar' })).toBe('trial')
  })
})
