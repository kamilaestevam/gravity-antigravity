/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const mockFetch = vi.fn()

vi.stubGlobal('fetch', mockFetch)

import { templateImportacaoBidHandler } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/importacao-template-bid-frete-internacional'

function criarApp() {
  const app = express()
  app.get(
    '/api/v1/bid-frete-internacional/importacao/template',
    templateImportacaoBidHandler,
  )
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: { message: err.message } })
  })
  return app
}

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response
}

describe('GET /api/v1/bid-frete-internacional/importacao/template', () => {
  const app = criarApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CHAVE_INTERNA_SERVICO = 'chave-teste'
    process.env.CADASTROS_URL = 'http://cadastros.test'

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/paises')) {
        return Promise.resolve(jsonResponse({
          itens: [{ codigo_pais_iso_alpha2: 'BR', nome_pais_portugues: 'Brasil' }],
        }))
      }
      if (url.includes('/portos')) {
        return Promise.resolve(jsonResponse({
          itens: [{ codigo_unlocode_porto: 'BRSSZ', nome_porto: 'Santos' }],
        }))
      }
      if (url.includes('/aeroportos')) {
        return Promise.resolve(jsonResponse({
          itens: [{ codigo_iata_aeroporto: 'GRU', codigo_unlocode_aeroporto: 'BRGRU', nome_aeroporto: 'Guarulhos' }],
        }))
      }
      if (url.includes('/containers')) {
        return Promise.resolve(jsonResponse({
          itens: [{
            codigo_iso_container: '45G1',
            tipo_container: 'DRY',
            tamanho_container: "40'",
            armador_dono_container: null,
          }],
        }))
      }
      return Promise.resolve(jsonResponse({ itens: [] }))
    })
  })

  it('retorna XLSX com content-type e attachment', async () => {
    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/importacao/template')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    expect(res.headers['content-disposition']).toContain('template-importacao-bid-frete.xlsx')
    expect(Number(res.headers['content-length'])).toBeGreaterThan(100)
  })

  it('usa fallback padrão quando cadastros retorna payload inválido', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse({ dados: [] })))

    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/importacao/template')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('spreadsheetml.sheet')
  })
})
