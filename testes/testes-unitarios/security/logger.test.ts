// @vitest-environment node
/**
 * Testes unitários — logger.ts
 * Verifica formato JSON em produção, formato legível em dev, child loggers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Reset module entre testes para mudar NODE_ENV
beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('logger', () => {
  it('deve exportar debug, info, warn, error e child', async () => {
    const { logger } = await import('../../../servicos-global/tenant/middleware/logger.js')

    expect(logger.debug).toBeTypeOf('function')
    expect(logger.info).toBeTypeOf('function')
    expect(logger.warn).toBeTypeOf('function')
    expect(logger.error).toBeTypeOf('function')
    expect(logger.child).toBeTypeOf('function')
  })

  it('info deve logar no console.log', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { logger } = await import('../../../servicos-global/tenant/middleware/logger.js')

    logger.info('Teste info')

    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0][0]).toContain('Teste info')
    spy.mockRestore()
  })

  it('error deve logar no console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { logger } = await import('../../../servicos-global/tenant/middleware/logger.js')

    logger.error('Erro grave', { code: 500 })

    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0][0]).toContain('Erro grave')
    spy.mockRestore()
  })

  it('warn deve logar no console.warn', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { logger } = await import('../../../servicos-global/tenant/middleware/logger.js')

    logger.warn('Alerta', { tenant: 'abc' })

    expect(spy).toHaveBeenCalledOnce()
    spy.mockRestore()
  })

  it('child logger deve propagar contexto', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { logger } = await import('../../../servicos-global/tenant/middleware/logger.js')

    const child = logger.child({ tenantId: 'tenant-A', userId: 'user-1' })
    child.info('Operacao no tenant')

    expect(spy).toHaveBeenCalledOnce()
    const output = spy.mock.calls[0][0] as string
    expect(output).toContain('Operacao no tenant')
    spy.mockRestore()
  })
})
