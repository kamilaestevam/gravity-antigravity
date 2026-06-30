// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const MODULO =
  '../../../servicos-global/shell/utils/urls-deep-link-configurador-workspace.ts'

describe('urls-deep-link-configurador-workspace (shell)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function importarModulo() {
    vi.stubEnv('DEV', true)
    return import(MODULO)
  }

  it('menu lateral aponta para /configurador/workspaces no shell', async () => {
    vi.stubGlobal('location', new URL('http://localhost:8000/bid-frete/insights'))

    const { urlGerenciarWorkspaces, urlCriarWorkspace } = await importarModulo()
    expect(urlGerenciarWorkspaces()).toBe('/configurador/workspaces')
    expect(urlCriarWorkspace()).toBe('/configurador/workspaces?criar=1')
  })

  it('standalone BID Frete (:5181) usa shell :8000', async () => {
    vi.stubGlobal('location', new URL('http://localhost:5181/bid-frete/insights'))

    const { urlGerenciarWorkspaces, urlCriarWorkspace } = await importarModulo()
    expect(urlGerenciarWorkspaces('5181')).toBe('http://localhost:8000/configurador/workspaces')
    expect(urlCriarWorkspace('5181')).toBe('http://localhost:8000/configurador/workspaces?criar=1')
  })
})
