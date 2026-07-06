import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  excluirLeituraLegado,
  falhaExclusaoLegadoPermiteEspelhoGravity,
} from '../../../../servicos-global/produto/smart-read/server/src/lib/cliente-legado-smart-read.js'
import { AppError } from '../../../../servicos-global/produto/smart-read/server/src/lib/app-error.js'

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

  it('prioriza DELETE em external-readings/delete-multiple-readings', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await excluirLeituraLegado(COMPANY, ID_LEITURA)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(
      `https://legado.example/import-control-center/external-readings/delete-multiple-readings?ids=${encodeURIComponent(ID_LEITURA)}`,
    )
    expect(init.method).toBe('DELETE')
    expect(init.headers).toMatchObject({
      'x-gravity-api-key': 'chave-teste',
      'x-company-id': COMPANY,
      'x-smart-read-project-id': 'gravity',
    })
  })

  it('tenta proxima URL quando a anterior responde 404 de rota', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => '{"message":"Cannot DELETE /external-readings/delete-multiple-readings"}',
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await excluirLeituraLegado(COMPANY, ID_LEITURA)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [urlFallback] = fetchMock.mock.calls[1] as [string]
    expect(urlFallback).toBe(`https://legado.example/import-control-center/external-readings/${ID_LEITURA}`)
  })

  it('tenta proxima URL quando DATI responde 401 na rota de delete', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () =>
          '{"message":"Gravity API Key não autorizada para esta rota","error":"Unauthorized","statusCode":401}',
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await excluirLeituraLegado(COMPANY, ID_LEITURA)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falhaExclusaoLegadoPermiteEspelhoGravity aceita 401 mas rejeita rede', () => {
    expect(
      falhaExclusaoLegadoPermiteEspelhoGravity(
        new AppError('Smart Docs legado respondeu 401: unauthorized', 502, 'LEGADO_ERRO'),
      ),
    ).toBe(true)
    expect(
      falhaExclusaoLegadoPermiteEspelhoGravity(
        new AppError('Smart Docs legado inacessivel', 502, 'LEGADO_INDISPONIVEL'),
      ),
    ).toBe(false)
  })

  it('propaga 404 quando todas as URLs falham com reading not found', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () =>
        '{"message":"Reading with ID 674a1b2c3d4e5f6789012345 not found","error":"Not Found","statusCode":404}',
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(excluirLeituraLegado(COMPANY, ID_LEITURA)).rejects.toThrow(/respondeu 404/)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
