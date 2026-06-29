// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import {
  resolverUrlOrganizacao,
  sincronizarEnvOrganizacao,
  urlsOrganizacaoECconfiguradorCoincidem,
} from '../../../servicos-global/configurador/server/lib/resolver-url-organizacao.js'

describe('resolver-url-organizacao', () => {
  afterEach(() => {
    delete process.env.ORGANIZACAO_DATABASE_URL
    delete process.env.SERVICOS_PLATAFORMA_DATABASE_URL
    delete process.env.TENANT_DATABASE_URL
    delete process.env.CONFIGURADOR_DATABASE_URL
    delete process.env.DATABASE_URL
  })

  it('prioriza ORGANIZACAO_DATABASE_URL', () => {
    process.env.ORGANIZACAO_DATABASE_URL = 'postgres://org'
    process.env.SERVICOS_PLATAFORMA_DATABASE_URL = 'postgres://alias'
    expect(resolverUrlOrganizacao()).toBe('postgres://org')
  })

  it('usa SERVICOS_PLATAFORMA_DATABASE_URL como alias', () => {
    process.env.SERVICOS_PLATAFORMA_DATABASE_URL = 'postgres://plataforma'
    expect(resolverUrlOrganizacao()).toBe('postgres://plataforma')
  })

  it('produção não faz fallback para DATABASE_URL do configurador', () => {
    process.env.DATABASE_URL = 'postgres://configurador'
    expect(resolverUrlOrganizacao({ permitirFallbackConfigurador: false })).toBeUndefined()
  })

  it('dev permite fallback configurador', () => {
    process.env.DATABASE_URL = 'postgres://configurador'
    expect(resolverUrlOrganizacao({ permitirFallbackConfigurador: true })).toBe(
      'postgres://configurador',
    )
  })

  it('sincronizarEnvOrganizacao grava process.env', () => {
    process.env.SERVICOS_PLATAFORMA_DATABASE_URL = 'postgres://sync'
    expect(sincronizarEnvOrganizacao(true)).toBe('postgres://sync')
    expect(process.env.ORGANIZACAO_DATABASE_URL).toBe('postgres://sync')
  })

  it('detecta URL organizacao igual ao configurador', () => {
    process.env.ORGANIZACAO_DATABASE_URL = 'postgres://x'
    process.env.CONFIGURADOR_DATABASE_URL = 'postgres://x'
    expect(urlsOrganizacaoECconfiguradorCoincidem()).toBe(true)
  })
})
