/**
 * @vitest-environment jsdom
 */
/**
 * Unit tests — abrir documento em nova aba (paridade DATI).
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  abrirDocumentoNovaAba,
  navegarAbaDocumento,
  reservarAbaDocumento,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/abrir-documento-nova-aba-smart-read'
import { rotaVisualizarArquivoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/client/src/shared/rotas-smart-read'

describe('abrir-documento-nova-aba-smart-read', () => {
  let openSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('abrirDocumentoNovaAba chama window.open com _blank', () => {
    const fakeWindow = {} as Window
    openSpy.mockReturnValue(fakeWindow)

    const retorno = abrirDocumentoNovaAba('blob:https://example/abc')

    expect(openSpy).toHaveBeenCalledWith('blob:https://example/abc', '_blank', 'noopener,noreferrer')
    expect(retorno).toBe(fakeWindow)
  })

  it('reservarAbaDocumento abre about:blank', () => {
    reservarAbaDocumento()
    expect(openSpy).toHaveBeenCalledWith('about:blank', '_blank', 'noopener,noreferrer')
  })

  it('navegarAbaDocumento usa location.replace na aba reservada', () => {
    const aba = { location: { replace: vi.fn() }, close: vi.fn() } as unknown as Window
    navegarAbaDocumento(aba, 'blob:https://example/doc')
    expect(aba.location.replace).toHaveBeenCalledWith('blob:https://example/doc')
  })

  it('rotaVisualizarArquivoLeituraSmartRead monta rota da SPA com nome opcional', () => {
    expect(rotaVisualizarArquivoLeituraSmartRead('leit-1', 'arq-2')).toBe(
      '/smart-read/visualizar-arquivo/leit-1/arq-2',
    )
    expect(rotaVisualizarArquivoLeituraSmartRead('leit-1', 'arq-2', 'INVOICE.pdf')).toBe(
      '/smart-read/visualizar-arquivo/leit-1/arq-2?nome=INVOICE.pdf',
    )
  })
})
