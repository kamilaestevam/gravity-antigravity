// TST-UNI-LOGIN-000001 — resolverDestinoPosAutenticacao + meDestinoPorteiroSchema
// Plano: testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.json
/// <reference types="vitest/globals" />
import {
  resolverDestinoPosAutenticacao,
  meDestinoPorteiroSchema,
  limparCacheDestinoPosAutenticacao,
  gravarDestinoCache,
  obterDestinoCacheado,
  invalidarCacheDestinoPosAutenticacao,
} from '../../../servicos-global/configurador/src/routing/destino-pos-autenticacao.js'

describe('TST-UNI-LOGIN-000001 — meDestinoPorteiroSchema', () => {
  it('UNI-001: aceita organizacao presente', () => {
    const parsed = meDestinoPorteiroSchema.parse({
      organizacao: { id_organizacao: 'org_abc' },
    })
    expect(parsed.organizacao?.id_organizacao).toBe('org_abc')
  })

  it('UNI-002: aceita organizacao null', () => {
    expect(meDestinoPorteiroSchema.parse({ organizacao: null }).organizacao).toBeNull()
  })

  it('UNI-003: rejeita organizacao sem id_organizacao', () => {
    expect(meDestinoPorteiroSchema.safeParse({ organizacao: {} }).success).toBe(false)
  })
})

describe('TST-UNI-LOGIN-000001 — resolverDestinoPosAutenticacao', () => {
  it('UNI-010: 401 → trial', () => {
    expect(resolverDestinoPosAutenticacao(401, null)).toBe('trial')
  })

  it('UNI-011: 404 → trial', () => {
    expect(resolverDestinoPosAutenticacao(404, null)).toBe('trial')
  })

  it('UNI-012: 200 com organizacao → hub', () => {
    expect(
      resolverDestinoPosAutenticacao(200, { organizacao: { id_organizacao: 'org_xyz' } }),
    ).toBe('hub')
  })

  it('UNI-013: 200 sem organizacao → trial', () => {
    expect(resolverDestinoPosAutenticacao(200, { organizacao: null })).toBe('trial')
  })

  it('UNI-014: 500 → trial (fail-safe signup)', () => {
    expect(resolverDestinoPosAutenticacao(500, null)).toBe('trial')
  })

  it('UNI-015: 200 payload invalido → trial', () => {
    expect(resolverDestinoPosAutenticacao(200, { foo: 'bar' })).toBe('trial')
  })

  it('UNI-016: status 0 (rede) → trial', () => {
    expect(resolverDestinoPosAutenticacao(0, null)).toBe('trial')
  })
})

describe('TST-UNI-LOGIN-000002 — cache destino porteiro', () => {
  beforeEach(() => limparCacheDestinoPosAutenticacao())

  it('UNI-020: gravar e obter destino cacheado', () => {
    gravarDestinoCache('clerk_user_1', 'hub')
    expect(obterDestinoCacheado('clerk_user_1')).toBe('hub')
  })

  it('UNI-021: limparCacheDestinoPosAutenticacao esvazia cache', () => {
    gravarDestinoCache('clerk_user_1', 'trial')
    limparCacheDestinoPosAutenticacao()
    expect(obterDestinoCacheado('clerk_user_1')).toBeUndefined()
  })

  it('UNI-022: invalidarCacheDestinoPosAutenticacao remove uma entrada', () => {
    gravarDestinoCache('a', 'hub')
    gravarDestinoCache('b', 'trial')
    invalidarCacheDestinoPosAutenticacao('a')
    expect(obterDestinoCacheado('a')).toBeUndefined()
    expect(obterDestinoCacheado('b')).toBe('trial')
  })
})
