/**
 * portalUnicoNcm.test.ts — Testes unitários do connector Portal Único NCM
 *
 * Cobre:
 *  - baixarTabelaNcm retorna itens normalizados (PascalCase e camelCase)
 *  - filtra itens com código != 8 dígitos
 *  - lança AppError em timeout e resposta vazia
 *  - validarNcm retorna null para 404 e detalhe para sucesso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

// Forçar modo mock para não depender de NODE_ENV
vi.stubEnv('NCM_MOCK', 'false')

import { baixarTabelaNcm, validarNcm } from '../../../servicos-global/tenant/ncm-sync/server/connectors/portalUnicoNcm.js'

const ITENS_PORTAL = {
  Nomenclaturas: [
    { Codigo: '84713019', Descricao: 'Processador A', DataInicio: '2022-01-01', DataFim: null },
    { Codigo: '85171210', Descricao: 'Celular B',     DataInicio: '2022-01-01', DataFim: null },
    { Codigo: '8471',     Descricao: 'Código curto — deve ser ignorado',       DataInicio: null, DataFim: null },
    { Codigo: '',         Descricao: 'Sem código — deve ser ignorado',          DataInicio: null, DataFim: null },
  ],
}

describe('portalUnicoNcm — baixarTabelaNcm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve normalizar e filtrar apenas NCMs com 8 dígitos', async () => {
    ;(axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: ITENS_PORTAL })

    const itens = await baixarTabelaNcm()

    expect(itens).toHaveLength(2)
    expect(itens[0].codigo).toBe('84713019')
    expect(itens[1].codigo).toBe('85171210')
  })

  it('deve aceitar resposta em camelCase', async () => {
    ;(axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [
        { codigo: '30049099', descricao: 'Medicamento', dataInicio: null, dataFim: null },
      ],
    })

    const itens = await baixarTabelaNcm()
    expect(itens).toHaveLength(1)
    expect(itens[0].codigo).toBe('30049099')
  })

  it('deve lançar AppError quando resposta está vazia', async () => {
    ;(axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { Nomenclaturas: [] } })

    await expect(baixarTabelaNcm()).rejects.toMatchObject({
      code: 'NCM_EMPTY_RESPONSE',
    })
  })

  it('deve lançar AppError em timeout', async () => {
    const timeoutErr = Object.assign(new Error('timeout'), { isAxiosError: true, code: 'ECONNABORTED' })
    ;(axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(timeoutErr)
    ;(axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true)

    await expect(baixarTabelaNcm()).rejects.toMatchObject({
      code: 'NCM_DOWNLOAD_TIMEOUT',
    })
  })
})

describe('portalUnicoNcm — validarNcm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve retornar null para código com formato inválido', async () => {
    const result = await validarNcm('1234')
    expect(result).toBeNull()
  })

  it('deve retornar detalhe quando NCM existe', async () => {
    ;(axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { codigo: '84713019', descricao: 'Processador' },
    })

    const result = await validarNcm('84713019')
    expect(result).toEqual({ codigo: '84713019', descricao: 'Processador' })
  })

  it('deve retornar null quando Portal retorna 404', async () => {
    const err404 = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 },
    })
    ;(axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(err404)
    ;(axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true)

    const result = await validarNcm('99999999')
    expect(result).toBeNull()
  })
})
