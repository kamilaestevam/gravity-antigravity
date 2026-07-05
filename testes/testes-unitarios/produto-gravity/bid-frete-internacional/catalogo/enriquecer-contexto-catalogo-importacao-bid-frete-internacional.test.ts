// Enriquecimento do catálogo da importação por planilha (TASK-000415).
// O contexto base carrega só uma página do Cadastros (500 portos de ~17k ativos);
// locais citados na planilha fora da página eram marcados como inválidos no
// preview (ponto cego). Valores não resolvidos devem ser buscados remotamente
// (?q=) e anexados ao contexto — sem repetir busca de valores irresolvíveis.
/// <reference types="vitest/globals" />

const { mockListarPortos, mockListarAeroportos } = vi.hoisted(() => ({
  mockListarPortos: vi.fn(),
  mockListarAeroportos: vi.fn(),
}))

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/cadastrosApi',
  () => ({
    cadastrosApi: {
      listarPortos: mockListarPortos,
      listarAeroportos: mockListarAeroportos,
    },
  }),
)

import { enriquecerContextoCatalogoLocaisImportacaoBid } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/carregar-contexto-catalogo-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/rota-cotacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/tipos-importacao-bid-frete-internacional'

const SANTOS = { codigo_unlocode_porto: 'BRSSZ', nome_porto: 'Santos', codigo_pais_porto: 'BR' }
const JEBEL_ALI = { codigo_unlocode_porto: 'AEJEA', nome_porto: 'Jebel Ali', codigo_pais_porto: 'AE' }
const FRANKFURT = {
  codigo_unlocode_aeroporto: 'DEFRA',
  codigo_iata_aeroporto: 'FRA',
  nome_aeroporto: 'Frankfurt',
  codigo_pais_aeroporto: 'DE',
}

function linhaMaritima(origem: string, destino: string): LinhaImportacaoBidFreteInternacional {
  return {
    modal_cotacao_bid_frete_internacional: 'MARITIMO',
    porto_origem_cotacao_bid_frete_internacional: origem,
    porto_destino_cotacao_bid_frete_internacional: destino,
  } as LinhaImportacaoBidFreteInternacional
}

function linhaAerea(origem: string, destino: string): LinhaImportacaoBidFreteInternacional {
  return {
    modal_cotacao_bid_frete_internacional: 'AEREO',
    aeroporto_origem_cotacao_bid_frete_internacional: origem,
    aeroporto_destino_cotacao_bid_frete_internacional: destino,
  } as LinhaImportacaoBidFreteInternacional
}

describe('enriquecerContextoCatalogoLocaisImportacaoBid', () => {
  beforeEach(() => {
    mockListarPortos.mockReset()
    mockListarAeroportos.mockReset()
    mockListarAeroportos.mockResolvedValue({ itens: [], total: 0 })
  })

  it('busca remotamente porto citado por nome fora da página carregada e anexa ao contexto', async () => {
    mockListarPortos.mockImplementation(async (params?: { q?: string }) => {
      if (params?.q === 'Santos') return { itens: [SANTOS], total: 1 }
      return { itens: [], total: 0 }
    })
    const ctx: ContextoCatalogoRota = { portos: [JEBEL_ALI], aeroportos: [] }

    const enriquecido = await enriquecerContextoCatalogoLocaisImportacaoBid(
      ctx,
      [linhaMaritima('Santos', 'AEJEA')],
      new Set(),
    )

    expect(enriquecido).not.toBeNull()
    expect(enriquecido?.portos?.map(p => p.codigo_unlocode_porto)).toEqual(['AEJEA', 'BRSSZ'])
    // AEJEA já resolvia localmente — só o valor pendente vai à busca remota.
    expect(mockListarPortos).toHaveBeenCalledTimes(1)
    expect(mockListarPortos).toHaveBeenCalledWith(expect.objectContaining({ q: 'Santos' }))
  })

  it('resolve aeroporto por IATA fora do contexto', async () => {
    mockListarAeroportos.mockImplementation(async (params?: { q?: string }) => {
      if (params?.q === 'FRA') return { itens: [FRANKFURT], total: 1 }
      return { itens: [], total: 0 }
    })
    const ctx: ContextoCatalogoRota = { portos: [], aeroportos: [] }

    const enriquecido = await enriquecerContextoCatalogoLocaisImportacaoBid(
      ctx,
      [linhaAerea('FRA', 'FRA')],
      new Set(),
    )

    expect(enriquecido?.aeroportos?.map(a => a.codigo_iata_aeroporto)).toEqual(['FRA'])
    // Origem e destino iguais — valor deduplicado antes da busca.
    expect(mockListarAeroportos).toHaveBeenCalledTimes(1)
  })

  it('retorna null e não repete busca de valores irresolvíveis', async () => {
    mockListarPortos.mockResolvedValue({ itens: [], total: 0 })
    const jaBuscados = new Set<string>()
    const linhas = [linhaMaritima('Porto Inexistente', 'AEJEA')]
    const ctx: ContextoCatalogoRota = { portos: [JEBEL_ALI], aeroportos: [] }

    const primeira = await enriquecerContextoCatalogoLocaisImportacaoBid(ctx, linhas, jaBuscados)
    const segunda = await enriquecerContextoCatalogoLocaisImportacaoBid(ctx, linhas, jaBuscados)

    expect(primeira).toBeNull()
    expect(segunda).toBeNull()
    expect(mockListarPortos).toHaveBeenCalledTimes(1)
  })

  it('retorna null quando todos os locais já resolvem no contexto carregado', async () => {
    const ctx: ContextoCatalogoRota = { portos: [JEBEL_ALI, SANTOS], aeroportos: [] }

    const enriquecido = await enriquecerContextoCatalogoLocaisImportacaoBid(
      ctx,
      [linhaMaritima('BRSSZ', 'Jebel Ali')],
      new Set(),
    )

    expect(enriquecido).toBeNull()
    expect(mockListarPortos).not.toHaveBeenCalled()
  })

  it('falha de rede na busca não derruba o enriquecimento dos demais valores', async () => {
    mockListarPortos.mockImplementation(async (params?: { q?: string }) => {
      if (params?.q === 'Santos') return { itens: [SANTOS], total: 1 }
      throw new Error('rede indisponivel')
    })
    const ctx: ContextoCatalogoRota = { portos: [], aeroportos: [] }

    const enriquecido = await enriquecerContextoCatalogoLocaisImportacaoBid(
      ctx,
      [linhaMaritima('Santos', 'Rotterdam')],
      new Set(),
    )

    expect(enriquecido?.portos?.map(p => p.codigo_unlocode_porto)).toEqual(['BRSSZ'])
  })
})
