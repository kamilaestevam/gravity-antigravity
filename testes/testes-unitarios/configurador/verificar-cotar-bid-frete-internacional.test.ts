// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  buildPecaHubBidFreteFornecedor,
  ehRotaEntradaVisaoFornecedorBidFrete,
  resolverPrimeiroWorkspaceComCotarBidFrete,
  ROTA_ENTRADA_BID_FRETE_FORNECEDOR,
  SLUG_PECA_HUB_BID_FRETE_FORNECEDOR,
  usuarioPodeCotarBidFreteEmAlgumWorkspace,
} from '../../../servicos-global/configurador/src/shared/verificar-cotar-bid-frete-internacional.js'

describe('verificar-cotar-bid-frete-internacional (Hub)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('buildPecaHubBidFreteFornecedor monta peça extra do puzzle', () => {
    const peca = buildPecaHubBidFreteFornecedor((_k, fb) => fb ?? '')
    expect(peca.key).toBe(SLUG_PECA_HUB_BID_FRETE_FORNECEDOR)
    expect(peca.slugVisual).toBe('bid-frete')
    expect(peca.rota).toBe(ROTA_ENTRADA_BID_FRETE_FORNECEDOR)
    expect(peca.nome).toContain('Fornecedor')
    expect(peca.nomeExibicao).toBe('BID Fornecedor')
  })

  it('ehRotaEntradaVisaoFornecedorBidFrete reconhece rota da visão fornecedor', () => {
    expect(ehRotaEntradaVisaoFornecedorBidFrete(ROTA_ENTRADA_BID_FRETE_FORNECEDOR)).toBe(true)
    expect(ehRotaEntradaVisaoFornecedorBidFrete('/bid-frete/lista')).toBe(false)
  })

  it('usuarioPodeCotarBidFreteEmAlgumWorkspace para no primeiro workspace permitido', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ permitido: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ permitido: true }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const getToken = async () => 'token-test'
    const permitido = await usuarioPodeCotarBidFreteEmAlgumWorkspace(getToken, ['ws-a', 'ws-b'])

    expect(permitido).toBe(true)
    expect(fetchMock).toHaveBeenCalled()
  })

  it('resolverPrimeiroWorkspaceComCotarBidFrete retorna id do workspace com cotar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ permitido: true }),
    }))

    const id = await resolverPrimeiroWorkspaceComCotarBidFrete(async () => 'token', ['ws-x', 'ws-y'])
    expect(id).toBe('ws-x')
  })
})
