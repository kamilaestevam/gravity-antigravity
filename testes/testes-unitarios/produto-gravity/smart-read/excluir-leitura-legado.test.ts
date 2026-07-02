import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { excluirLeituraLegado } from '../../../../servicos-global/produto/smart-read/server/src/lib/cliente-legado-smart-read.js'

describe('excluirLeituraLegado', () => {
  const envOriginal = { ...process.env }
  const COMPANY = 'company-1'
  const ID_LEITURA = '674a1b2c3d4e5f6789012345'

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.SMART_READ_MOCK_LEGADO = '0'
    process.env.SMART_READ_LEGADO_URL = 'https://legado.example'
    process.env.SMART_READ_LEGADO_CHAVE_GRAVITY = 'chave-teste'
  })

  afterEach(() => {
    process.env = { ...envOriginal }
    vi.restoreAllMocks()
  })

  it('chama DELETE em external-readings com headers Gravity', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await excluirLeituraLegado(COMPANY, ID_LEITURA)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`https://legado.example/import-control-center/external-readings/${ID_LEITURA}`)
    expect(init.method).toBe('DELETE')
    expect(init.headers).toMatchObject({
      'x-gravity-api-key': 'chave-teste',
      'x-company-id': COMPANY,
      'x-smart-read-project-id': 'gravity',
    })
  })

  it('faz fallback para delete-multiple-readings quando external-readings responde 404', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '{"message":"Cannot DELETE /external-readings/..."}',
      })
      .mockResolvedValueOnce({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    await excluirLeituraLegado(COMPANY, ID_LEITURA)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [urlFallback] = fetchMock.mock.calls[1] as [string]
    expect(urlFallback).toBe(
      `https://legado.example/import-control-center/readings/delete-multiple-readings?ids=${encodeURIComponent(ID_LEITURA)}`,
    )
  })
})
