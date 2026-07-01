// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bancoSmartReadConfigurado,
  resolverUrlBancoSmartRead,
} from '../../../../servicos-global/produto/smart-read/server/src/lib/url-banco-smart-read.js'

describe('url-banco-smart-read', () => {
  const envOriginal = { ...process.env }

  afterEach(() => {
    process.env = { ...envOriginal }
  })

  it('bancoSmartReadConfigurado retorna false sem SMART_READ_DATABASE_URL', () => {
    delete process.env.SMART_READ_DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://configurador/local'
    expect(bancoSmartReadConfigurado()).toBe(false)
  })

  it('bancoSmartReadConfigurado retorna true somente com SMART_READ_DATABASE_URL explícita', () => {
    process.env.SMART_READ_DATABASE_URL = 'postgresql://smart-read/railway'
    expect(bancoSmartReadConfigurado()).toBe(true)
  })

  it('resolverUrlBancoSmartRead não faz fallback para DATABASE_URL do Configurador', () => {
    delete process.env.SMART_READ_DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://configurador/local'
    expect(() => resolverUrlBancoSmartRead()).toThrow(/SMART_READ_DATABASE_URL ausente/)
  })

  it('resolverUrlBancoSmartRead adiciona connect_timeout quando ausente', () => {
    process.env.SMART_READ_DATABASE_URL = 'postgresql://smart-read/railway'
    const url = resolverUrlBancoSmartRead()
    expect(url).toContain('connect_timeout=30')
  })
})
