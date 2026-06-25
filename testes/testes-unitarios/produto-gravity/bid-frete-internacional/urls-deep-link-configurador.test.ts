// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const MODULO =
  '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/urls-deep-link-configurador'

const FORNECEDORES_SHELL = 'http://localhost:3000/bid-frete/fornecedores'
const FORNECEDORES_STANDALONE = 'http://localhost:5181/bid-frete/fornecedores'

function definirLocation(url: string) {
  vi.stubGlobal('location', new URL(url))
}

describe('urls-deep-link-configurador (bid-frete-internacional)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function importarModulo() {
    return import(MODULO)
  }

  it('no shell gera caminho relativo para fornecedores com criar=fornecedor-frete-internacional', async () => {
    definirLocation(FORNECEDORES_SHELL)

    const { urlCriarFornecedorFreteInternacional } = await importarModulo()
    const url = urlCriarFornecedorFreteInternacional()

    expect(url).toBe(
      '/configurador/fornecedores?criar=fornecedor-frete-internacional&retorno=' +
        encodeURIComponent(FORNECEDORES_SHELL),
    )
  })

  it('no BID standalone (dev :5181) gera URL absoluta para o shell :8000', async () => {
    definirLocation(FORNECEDORES_STANDALONE)

    const { urlCriarFornecedorFreteInternacional } = await importarModulo()
    const url = urlCriarFornecedorFreteInternacional()

    expect(url.startsWith('http://localhost:8000/configurador/fornecedores?')).toBe(true)
    expect(url).toContain('criar=fornecedor-frete-internacional')
  })

  it('editar fornecedor gera deep-link com ?id= e retorno=', async () => {
    definirLocation(FORNECEDORES_SHELL)

    const { urlEditarFornecedorFreteInternacional } = await importarModulo()
    const url = urlEditarFornecedorFreteInternacional('forn-cad-123')

    expect(url).toBe(
      '/configurador/fornecedores?id=forn-cad-123&retorno=' +
        encodeURIComponent(FORNECEDORES_SHELL),
    )
  })
})
