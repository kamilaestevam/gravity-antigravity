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

  it('no shell gera caminho relativo para empresas-e-parceiros com criar=parceiro-frete-internacional', async () => {
    definirLocation(FORNECEDORES_SHELL)

    const { urlCriarParceiroFreteInternacional } = await importarModulo()
    const url = urlCriarParceiroFreteInternacional()

    expect(url).toBe(
      '/configurador/empresas-e-parceiros?criar=parceiro-frete-internacional&retorno=' +
        encodeURIComponent(FORNECEDORES_SHELL),
    )
  })

  it('no BID standalone (dev :5181) gera URL absoluta para o shell :8000', async () => {
    definirLocation(FORNECEDORES_STANDALONE)

    const { urlCriarParceiroFreteInternacional } = await importarModulo()
    const url = urlCriarParceiroFreteInternacional()

    expect(url.startsWith('http://localhost:8000/configurador/empresas-e-parceiros?')).toBe(true)
    expect(url).toContain('criar=parceiro-frete-internacional')
  })
})
