// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  aguardarSidecarEmbutido,
  coletarErrosPreflightApiCockpit,
} from '../../../servicos-global/configurador/server/lib/verificar-health-sidecar.js'

describe('verificar-health-sidecar / sidecar boot', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.ORGANIZACAO_DATABASE_URL
    delete process.env.SERVICOS_PLATAFORMA_DATABASE_URL
    delete process.env.CHAVE_INTERNA_SERVICO
  })

  it('aguardarSidecarEmbutido faz health check após listen', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    await expect(aguardarSidecarEmbutido(8016, Promise.resolve())).resolves.toBeUndefined()
  })

  it('clearTimeout após listen resolver', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    await aguardarSidecarEmbutido(8016, Promise.resolve(), 5_000)
    expect(clearSpy).toHaveBeenCalled()
  })

  it('preflight produção exige ORGANIZACAO_DATABASE_URL e CHAVE', () => {
    const erros = coletarErrosPreflightApiCockpit(true)
    expect(erros).toHaveLength(2)
    expect(erros[0]).toContain('ORGANIZACAO_DATABASE_URL')
  })

  it('preflight dev não bloqueia por CHAVE ausente', () => {
    process.env.ORGANIZACAO_DATABASE_URL = 'postgres://x'
    const erros = coletarErrosPreflightApiCockpit(false)
    expect(erros).toHaveLength(0)
  })

  it('preflight sincroniza ORGANIZACAO a partir de SERVICOS_PLATAFORMA_DATABASE_URL', () => {
    delete process.env.ORGANIZACAO_DATABASE_URL
    process.env.SERVICOS_PLATAFORMA_DATABASE_URL = 'postgres://plataforma'
    process.env.CHAVE_INTERNA_SERVICO = 'chave-teste'
    const erros = coletarErrosPreflightApiCockpit(true)
    expect(erros).toHaveLength(0)
    expect(process.env.ORGANIZACAO_DATABASE_URL).toBe('postgres://plataforma')
  })
})
