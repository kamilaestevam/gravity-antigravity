// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  SMOKE_SCHEMA_PEDIDO,
  SMOKE_ID_ORGANIZACAO_PADRAO,
  SMOKE_HEADER_SCHEMA_PEDIDO,
  resolverIdOrganizacaoSmoke,
  devePularBootstrapSmoke,
  deveManterSchemaSmoke,
  isIdOrganizacaoSmoke,
  montarHeadersProxySmoke,
} from '../../../scripts/ativamente/smoke-bootstrap-schema-pedido.ts'
import {
  PrismaModeloNaoProvisionadoError,
  assertPrismaDelegateCreate,
} from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/lib/assert-prisma-delegate.ts'

describe('smoke-bootstrap-schema-pedido — constantes', () => {
  it('usa schema organizacao_smoketest', () => {
    expect(SMOKE_SCHEMA_PEDIDO).toBe('organizacao_smoketest')
  })

  it('id padrao e CUID valido (25 chars)', () => {
    expect(SMOKE_ID_ORGANIZACAO_PADRAO).toMatch(/^c[a-z0-9]{24}$/)
  })

  it('resolverIdOrganizacaoSmoke respeita env', () => {
    const prev = process.env.SMOKE_ID_ORGANIZACAO
    process.env.SMOKE_ID_ORGANIZACAO = 'caaaaaaaaaaaaaaaaaaaaaaaa'
    expect(resolverIdOrganizacaoSmoke()).toBe('caaaaaaaaaaaaaaaaaaaaaaaa')
    if (prev === undefined) delete process.env.SMOKE_ID_ORGANIZACAO
    else process.env.SMOKE_ID_ORGANIZACAO = prev
  })

  it('flags SMOKE_SKIP_BOOTSTRAP e SMOKE_KEEP_SCHEMA', () => {
    expect(devePularBootstrapSmoke()).toBe(false)
    expect(deveManterSchemaSmoke()).toBe(false)
  })

  it('identifica org de smoke e monta header de schema', () => {
    expect(isIdOrganizacaoSmoke(SMOKE_ID_ORGANIZACAO_PADRAO)).toBe(true)
    expect(isIdOrganizacaoSmoke('cotherorgaaaaaaaaaaaaaaa')).toBe(false)
    expect(montarHeadersProxySmoke(SMOKE_SCHEMA_PEDIDO)).toEqual({
      [SMOKE_HEADER_SCHEMA_PEDIDO]: SMOKE_SCHEMA_PEDIDO,
    })
  })
})

describe('assert-prisma-delegate', () => {
  it('lanca erro claro quando modelo ausente', () => {
    const prismaFake = {} as Parameters<typeof assertPrismaDelegateCreate>[0]
    expect(() =>
      assertPrismaDelegateCreate(prismaFake, 'apiCredencialOauth', 'teste'),
    ).toThrow(PrismaModeloNaoProvisionadoError)
  })
})
