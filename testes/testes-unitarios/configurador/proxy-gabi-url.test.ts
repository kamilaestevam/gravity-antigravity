import { afterEach, describe, expect, it } from 'vitest'
import { resolverUrlProxyGabi } from '../../../servicos-global/configurador/server/proxy/proxy-gabi.js'

describe('resolverUrlProxyGabi', () => {
  const envOriginal = { ...process.env }

  afterEach(() => {
    process.env = { ...envOriginal }
  })

  it('usa loopback 8009 em Railway', () => {
    process.env.RAILWAY_ENVIRONMENT = 'production'
    delete process.env.GABI_SERVICE_URL
    expect(resolverUrlProxyGabi()).toBe('http://127.0.0.1:8009')
  })

  it('respeita GABI_SERVICE_URL fora de Railway', () => {
    delete process.env.RAILWAY_ENVIRONMENT
    process.env.GABI_SERVICE_URL = 'http://localhost:3001'
    expect(resolverUrlProxyGabi()).toBe('http://localhost:3001')
  })

  it('default 8009 fora de Railway sem env', () => {
    delete process.env.RAILWAY_ENVIRONMENT
    delete process.env.GABI_SERVICE_URL
    expect(resolverUrlProxyGabi()).toBe('http://127.0.0.1:8009')
  })
})
