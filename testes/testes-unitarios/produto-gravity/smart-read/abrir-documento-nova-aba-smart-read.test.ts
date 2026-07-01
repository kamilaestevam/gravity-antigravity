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
import { montarUrlApiArquivoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/client/src/shared/url-api-arquivo-leitura-smart-read'

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

  it('montarUrlApiArquivoLeituraSmartRead monta rota do BFF', () => {
    expect(montarUrlApiArquivoLeituraSmartRead('leit-1', 'arq-2')).toBe(
      '/api/v1/smart-read/leituras/leit-1/arquivos/arq-2',
    )
  })
})
