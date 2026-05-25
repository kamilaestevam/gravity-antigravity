// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const MODULO =
  '../../../../servicos-global/produto/pedido/client/src/components/lista/urlsDeepLinkConfigurador'

const LISTA_PEDIDO_SHELL = 'http://localhost:8000/pedido/pedidos/lista'
const LISTA_PEDIDO_STANDALONE = 'http://localhost:5179/pedido/pedidos/lista'

function definirLocation(url: string) {
  vi.stubGlobal('location', new URL(url))
}

describe('urlsDeepLinkConfigurador', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function importarModulo() {
    return import(MODULO)
  }

  it('no shell (dev :8000) gera caminho relativo /configurador/...', async () => {
    definirLocation(LISTA_PEDIDO_SHELL)

    const { urlVincularExportador } = await importarModulo()
    const url = urlVincularExportador(null, 'ped-123')

    expect(url).toBe(
      '/configurador/empresas-e-parceiros?criar=exportador-quando-importacao&retorno=' +
        encodeURIComponent('http://localhost:8000/pedido/pedidos/lista?expandir=ped-123'),
    )
    expect(url).not.toContain('8005')
  })

  it('no Pedido standalone (dev :5179) gera URL absoluta para o shell :8000', async () => {
    definirLocation(LISTA_PEDIDO_STANDALONE)

    const { urlVincularExportador } = await importarModulo()
    const url = urlVincularExportador('exp-1', 'ped-456')

    expect(url.startsWith('http://localhost:8000/configurador/empresas-e-parceiros?')).toBe(true)
    expect(url).toContain('id=exp-1')
    expect(url).not.toContain(':8005')
  })

  it('menu lateral aponta para /configurador/workspaces (shell e standalone)', async () => {
    definirLocation(LISTA_PEDIDO_SHELL)

    const { urlGerenciarWorkspaces, urlCriarWorkspace } = await importarModulo()

    expect(urlGerenciarWorkspaces()).toBe('/configurador/workspaces')
    expect(urlCriarWorkspace()).toBe('/configurador/workspaces?criar=1')

    definirLocation(LISTA_PEDIDO_STANDALONE)
    vi.resetModules()

    const modStandalone = await importarModulo()
    expect(modStandalone.urlGerenciarWorkspaces()).toBe('http://localhost:8000/configurador/workspaces')
    expect(modStandalone.urlCriarWorkspace()).toBe('http://localhost:8000/configurador/workspaces?criar=1')
  })

  it('nunca aponta deep-link para a API :8005 (regressão INTERNAL_ERROR)', async () => {
    definirLocation(LISTA_PEDIDO_SHELL)

    const {
      urlVincularExportador,
      urlVincularImportador,
      urlEditarCnpjWorkspace,
      urlGerenciarWorkspaces,
      urlCriarWorkspace,
    } = await importarModulo()

    for (const url of [
      urlVincularExportador(null),
      urlVincularExportador('exp-1', 'ped-1'),
      urlVincularImportador(null),
      urlVincularImportador('imp-1', 'ped-2'),
      urlEditarCnpjWorkspace('ws-1', 'ped-3'),
      urlGerenciarWorkspaces(),
      urlCriarWorkspace(),
    ]) {
      expect(url).toMatch(/\/configurador\/(empresas-e-parceiros|workspaces)/)
      expect(url).not.toMatch(/:\/\/[^/]+\/empresas-e-parceiros/)
      expect(url).not.toContain(':8005')
    }
  })
})
