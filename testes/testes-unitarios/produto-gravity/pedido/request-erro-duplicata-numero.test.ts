// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'

const lsStore: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn((k: string) => lsStore[k] ?? null),
  setItem: vi.fn((k: string, v: string) => { lsStore[k] = v }),
  removeItem: vi.fn((k: string) => { delete lsStore[k] }),
})

import {
  request,
  setApiContext,
} from '../../../../servicos-global/produto/pedido/client/src/shared/api.js'
import { CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED } from '../../../../servicos-global/produto/pedido/client/src/shared/modal-novo-pedido-duplicata-helpers.js'

beforeEach(() => {
  vi.clearAllMocks()
  setApiContext({ idOrganizacao: 'org_test', userId: 'usr_test', userName: 'Test' })
})

describe('request() — erro 409 duplicata numero pedido', () => {
  it('preserva codeBackend e pedidosExistentesDuplicata no Error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({
        error: {
          message: 'Ja existem pedidos com este numero na organizacao',
          code: CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED,
          pedidos_existentes: [
            { id_pedido: 'ped-1', numero_pedido: '123' },
          ],
        },
      }),
    }))

    try {
      await request('/api/v1/pedidos')
      expect.fail('deveria lançar')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      const erroApi = err as Error & {
        codeBackend?: string
        pedidosExistentesDuplicata?: Array<{ id_pedido: string; numero_pedido: string }>
      }
      expect(erroApi.message).toContain('Ja existem pedidos')
      expect(erroApi.codeBackend).toBe(CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED)
      expect(erroApi.pedidosExistentesDuplicata).toEqual([
        { id_pedido: 'ped-1', numero_pedido: '123' },
      ])
    }
  })
})
