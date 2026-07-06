import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockBuscarNcm = vi.hoisted(() => vi.fn())
const mockBuscarMoeda = vi.hoisted(() => vi.fn())
const mockBuscarUnidade = vi.hoisted(() => vi.fn())
const mockMontarNcm = vi.hoisted(() => vi.fn())
const mockMontarMoeda = vi.hoisted(() => vi.fn())
const mockMontarUnidade = vi.hoisted(() => vi.fn())

vi.mock('../../../../servicos-global/produto/processos-core/src/services/cadastrosClient.js', () => ({
  buscarNcmPorCodigo: mockBuscarNcm,
  buscarMoedaPorCodigo: mockBuscarMoeda,
  buscarUnidadePorCodigo: mockBuscarUnidade,
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/pedidoSnapshots.js', () => ({
  montarSnapshotNcm: mockMontarNcm,
  montarSnapshotMoeda: mockMontarMoeda,
  montarSnapshotUnidade: mockMontarUnidade,
}))

import { buscarSnapshotsCadastrosIniciaisPedido } from '../../../../servicos-global/produto/pedido/server/src/lib/buscar-snapshots-cadastros-iniciais-pedido.ts'

describe('buscarSnapshotsCadastrosIniciaisPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBuscarNcm.mockResolvedValue({ codigo_ncm: '84713012', descricao_ncm: 'Notebook' })
    mockBuscarMoeda.mockResolvedValue({ codigo_moeda: 'USD', nome_moeda: 'Dolar' })
    mockMontarNcm.mockReturnValue({ codigo_ncm: '84713012', descricao_ncm: 'Notebook' })
    mockMontarMoeda.mockReturnValue({ codigo_moeda: 'USD', nome_moeda: 'Dolar' })
  })

  it('busca NCM e Moeda distintos best-effort', async () => {
    const resultado = await buscarSnapshotsCadastrosIniciaisPedido({
      idOrganizacao: 'org-1',
      idWorkspace: 'ws-1',
      entrada: {
        moedaPedido: 'USD',
        itens: [{ ncm_item: '84713012', moeda_item: 'USD' }],
      },
    })

    expect(mockBuscarNcm).toHaveBeenCalledWith('84713012', expect.objectContaining({ id_organizacao: 'org-1' }))
    expect(mockBuscarMoeda).toHaveBeenCalledWith('USD', expect.objectContaining({ id_organizacao: 'org-1' }))
    expect(resultado.snapshotsNcm).toHaveLength(1)
    expect(resultado.snapshotsMoeda).toHaveLength(1)
  })

  it('continua sem snapshot quando Cadastros falha', async () => {
    mockBuscarNcm.mockRejectedValue(new Error('timeout'))
    const resultado = await buscarSnapshotsCadastrosIniciaisPedido({
      idOrganizacao: 'org-1',
      idWorkspace: 'ws-1',
      entrada: { itens: [{ ncm_item: '99999999' }] },
    })
    expect(resultado.snapshotsNcm).toHaveLength(0)
  })
})
