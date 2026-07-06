// TST-UNI-BIDFRT-000118 — validação rota cotação vs Cadastros (metadados sem coords)

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchCadastrosJson } = vi.hoisted(() => ({
  fetchCadastrosJson: vi.fn(),
}))

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/cadastros-client.js',
  () => ({
    fetchCadastrosJson,
  }),
)

import {
  resolverLocalCadastrosBidFreteInternacional,
  resolverMetadadosLocalCadastrosBidFreteInternacional,
} from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/resolver-local-cadastros-bid-frete-internacional.js'
import { validarRotaCotacaoContraCadastros } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/validar-rota-cadastros-cotacao-bid-frete-internacional.js'

const PORTO_AEJEA = {
  codigo_unlocode_porto: 'AEJEA',
  nome_porto: 'Jebel Ali',
  codigo_pais_porto: 'AE',
  latitude_porto: null,
  longitude_porto: null,
}

const PORTO_BRAAR = {
  codigo_unlocode_porto: 'BRAAR',
  nome_porto: 'Acará',
  codigo_pais_porto: 'BR',
  latitude_porto: -1.58,
  longitude_porto: -48.47,
}

function mockFetchPortoPorCodigo() {
  fetchCadastrosJson.mockImplementation(async (path: string) => {
    if (path === '/api/v1/cadastros/portos') {
      return { itens: [PORTO_AEJEA, PORTO_BRAAR], total: 2 }
    }
    if (path === '/api/v1/cadastros/aeroportos') {
      return { itens: [], total: 0 }
    }
    if (path.endsWith('/AEJEA')) return PORTO_AEJEA
    if (path.endsWith('/BRAAR')) return PORTO_BRAAR
    throw new Error('Cadastros 404: Porto')
  })
}

describe('TST-UNI-BIDFRT-000118 — resolver-local-cadastros-bid-frete-internacional', () => {
  beforeEach(() => {
    fetchCadastrosJson.mockReset()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('resolve metadados de porto sem latitude/longitude (validação de cotação)', async () => {
    fetchCadastrosJson.mockResolvedValueOnce(PORTO_AEJEA)

    const metadados = await resolverMetadadosLocalCadastrosBidFreteInternacional('AEJEA', {
      modal: 'MARITIMO',
    })

    expect(metadados).toEqual({
      codigo: 'AEJEA',
      nome: 'Jebel Ali',
      pais: 'AE',
    })
  })

  it('não resolve coordenadas quando porto não tem lat/long (mapa)', async () => {
    fetchCadastrosJson.mockResolvedValueOnce(PORTO_AEJEA)

    const coords = await resolverLocalCadastrosBidFreteInternacional('AEJEA', {
      modal: 'MARITIMO',
    })

    expect(coords).toBeNull()
  })

  it('registra warn quando Cadastros retorna erro HTTP diferente de 404', async () => {
    fetchCadastrosJson.mockRejectedValueOnce(new Error('Cadastros 503: unavailable'))

    const metadados = await resolverMetadadosLocalCadastrosBidFreteInternacional('AEJEA', {
      modal: 'MARITIMO',
    })

    expect(metadados).toBeNull()
    expect(console.warn).toHaveBeenCalledWith(
      '[bid-frete/resolver-local-cadastros] falha ao buscar porto no Cadastros',
      expect.objectContaining({ codigo: 'AEJEA' }),
    )
  })
})

describe('TST-UNI-BIDFRT-000118 — validarRotaCotacaoContraCadastros', () => {
  beforeEach(() => {
    fetchCadastrosJson.mockReset()
    mockFetchPortoPorCodigo()
  })

  it('aceita origem AEJEA sem coordenadas no Cadastros', async () => {
    const erros = await validarRotaCotacaoContraCadastros(
      {
        modal_cotacao_bid_frete_internacional: 'MARITIMO',
        porto_origem_cotacao_bid_frete_internacional: 'AEJEA',
        porto_destino_cotacao_bid_frete_internacional: 'BRAAR',
        origem_nome_cotacao_bid_frete_internacional: 'Jebel Ali',
        origem_pais_cotacao_bid_frete_internacional: 'AE',
        destino_nome_cotacao_bid_frete_internacional: 'Acará',
        destino_pais_cotacao_bid_frete_internacional: 'BR',
      },
      'org_test_01',
    )

    expect(erros).toEqual([])
  })

  it('rejeita código inexistente no Cadastros', async () => {
    const erros = await validarRotaCotacaoContraCadastros(
      {
        modal_cotacao_bid_frete_internacional: 'MARITIMO',
        porto_origem_cotacao_bid_frete_internacional: 'ZZZZZ',
        porto_destino_cotacao_bid_frete_internacional: 'BRAAR',
        origem_nome_cotacao_bid_frete_internacional: 'ZZZZZ',
        origem_pais_cotacao_bid_frete_internacional: 'XX',
        destino_nome_cotacao_bid_frete_internacional: 'Acará',
        destino_pais_cotacao_bid_frete_internacional: 'BR',
      },
      'org_test_01',
    )

    expect(erros).toHaveLength(1)
    expect(erros[0]?.path).toBe('origem_codigo_cotacao_bid_frete_internacional')
    expect(erros[0]?.message).toContain('ZZZZZ')
  })
})
