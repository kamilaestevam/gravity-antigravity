import { describe, expect, it } from 'vitest'
import {
  calcularFaixaAereoTermometro,
  calcularFaixaRodoviarioTermometro,
  cotacaoCompativelTermometro,
  extrairValorComponenteProposta,
  filtrarHistoricoTermometro,
  melhorValorComponentePropostas,
  valorHistoricoCotacaoTermometro,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/filtro-historico-termometro-bid-frete-internacional'

const referenciaBase = {
  id_cotacao_bid_frete_internacional: 'cot-atual',
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
  destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  tipo_container_cotacao_bid_frete_internacional: '40HC',
  incoterm_cotacao_bid_frete_internacional: 'FOB',
}

describe('filtro-historico-termometro — faixas e matching', () => {
  it('faixa aéreo usa max(peso, m³×167)', () => {
    expect(
      calcularFaixaAereoTermometro({
        ...referenciaBase,
        modal_cotacao_bid_frete_internacional: 'AEREO',
        peso_kg_cotacao_bid_frete_internacional: 30,
        cubagem_m3_cotacao_bid_frete_internacional: 0.2,
      }),
    ).toBe('MIN_45')

    expect(
      calcularFaixaAereoTermometro({
        ...referenciaBase,
        modal_cotacao_bid_frete_internacional: 'AEREO',
        peso_kg_cotacao_bid_frete_internacional: 120,
        cubagem_m3_cotacao_bid_frete_internacional: 0.2,
      }),
    ).toBe('P100')
  })

  it('faixa rodoviário usa max(ton, m³)', () => {
    expect(
      calcularFaixaRodoviarioTermometro({
        ...referenciaBase,
        modal_cotacao_bid_frete_internacional: 'RODOVIARIO',
        peso_ton_cotacao_bid_frete_internacional: 18,
        cubagem_m3_cotacao_bid_frete_internacional: 10,
      }),
    ).toBe('15_24')
  })

  it('FCL exige mesmo tipo de container', () => {
    const compativel = {
      ...referenciaBase,
      id_cotacao_bid_frete_internacional: 'cot-2',
    }
    const incompativel = {
      ...compativel,
      id_cotacao_bid_frete_internacional: 'cot-3',
      tipo_container_cotacao_bid_frete_internacional: '20GP',
    }

    expect(cotacaoCompativelTermometro(referenciaBase, compativel)).toBe(true)
    expect(cotacaoCompativelTermometro(referenciaBase, incompativel)).toBe(false)
  })

  it('LCL marítimo não filtra peso/cubagem', () => {
    const refLcl = {
      ...referenciaBase,
      modalidade_cotacao_bid_frete_internacional: 'LCL',
      tipo_container_cotacao_bid_frete_internacional: null,
      peso_kg_cotacao_bid_frete_internacional: 500,
      cubagem_m3_cotacao_bid_frete_internacional: 8,
    }
    const candLcl = {
      ...refLcl,
      id_cotacao_bid_frete_internacional: 'cot-lcl',
      peso_kg_cotacao_bid_frete_internacional: 50,
      cubagem_m3_cotacao_bid_frete_internacional: 1,
    }

    expect(cotacaoCompativelTermometro(refLcl, candLcl)).toBe(true)
  })

  it('incoterm só filtra quando toggle ativo', () => {
    const cand = {
      ...referenciaBase,
      id_cotacao_bid_frete_internacional: 'cot-inc',
      incoterm_cotacao_bid_frete_internacional: 'CIF',
    }

    expect(cotacaoCompativelTermometro(referenciaBase, cand)).toBe(true)
    expect(
      cotacaoCompativelTermometro(referenciaBase, cand, { filtrar_incoterm: true }),
    ).toBe(false)
  })

  it('extrai componente e melhor valor em propostas recebidas', () => {
    const propostas = [
      {
        valor_frete_proposta_bid_frete_internacional: 500,
        taxas_origem_proposta_bid_frete_internacional: 80,
        valor_total_proposta_bid_frete_internacional: 700,
      },
      {
        valor_frete_proposta_bid_frete_internacional: 420,
        taxas_origem_proposta_bid_frete_internacional: 90,
        valor_total_proposta_bid_frete_internacional: 650,
      },
    ]

    expect(extrairValorComponenteProposta(propostas[0], 'FRETE_BASE')).toBe(500)
    expect(melhorValorComponentePropostas(propostas, 'FRETE_BASE', 'PROPOSTAS_RECEBIDAS')).toBe(420)
    expect(melhorValorComponentePropostas(propostas, 'TOTAL', 'PROPOSTAS_RECEBIDAS')).toBe(650)
  })

  it('filtrarHistoricoTermometro exclui cotação atual', () => {
    const lista = filtrarHistoricoTermometro(referenciaBase, [
      referenciaBase,
      { ...referenciaBase, id_cotacao_bid_frete_internacional: 'cot-outra' },
    ])
    expect(lista).toHaveLength(1)
    expect(lista[0].id_cotacao_bid_frete_internacional).toBe('cot-outra')
  })

  it('multi-seleção de componentes soma os valores da proposta', () => {
    const proposta = {
      valor_frete_proposta_bid_frete_internacional: 500,
      taxas_origem_proposta_bid_frete_internacional: 80,
      taxas_destino_proposta_bid_frete_internacional: 60,
      valor_total_proposta_bid_frete_internacional: 700,
    }

    expect(extrairValorComponenteProposta(proposta, ['FRETE_BASE', 'TAXAS_ORIGEM'])).toBe(580)
    expect(
      extrairValorComponenteProposta(proposta, ['FRETE_BASE', 'TAXAS_ORIGEM', 'TAXAS_DESTINO']),
    ).toBe(640)
    // TOTAL na seleção prevalece — nunca soma em dobro
    expect(extrairValorComponenteProposta(proposta, ['FRETE_BASE', 'TOTAL'])).toBe(700)
    // Seleção vazia = sem valor
    expect(extrairValorComponenteProposta(proposta, [])).toBeNull()
  })

  it('multi-seleção ignora componentes sem valor e retorna null se nenhum tem', () => {
    const proposta = {
      valor_frete_proposta_bid_frete_internacional: 500,
      taxas_origem_proposta_bid_frete_internacional: null,
    }

    expect(extrairValorComponenteProposta(proposta, ['FRETE_BASE', 'TAXAS_ORIGEM'])).toBe(500)
    expect(
      extrairValorComponenteProposta(proposta, ['TAXAS_ORIGEM', 'TAXAS_DESTINO']),
    ).toBeNull()
  })

  it('melhor valor em propostas recebidas com multi-componente usa a menor soma', () => {
    const propostas = [
      {
        valor_frete_proposta_bid_frete_internacional: 500,
        taxas_origem_proposta_bid_frete_internacional: 200,
      },
      {
        valor_frete_proposta_bid_frete_internacional: 550,
        taxas_origem_proposta_bid_frete_internacional: 90,
      },
    ]

    // Somas: 700 vs 640 — vence a segunda
    expect(
      melhorValorComponentePropostas(propostas, ['FRETE_BASE', 'TAXAS_ORIGEM'], 'PROPOSTAS_RECEBIDAS'),
    ).toBe(640)
  })

  it('filtro por lista de incoterms aceita só os selecionados; lista vazia = todos', () => {
    const candCif = {
      ...referenciaBase,
      id_cotacao_bid_frete_internacional: 'cot-cif',
      incoterm_cotacao_bid_frete_internacional: 'CIF',
    }
    const candFob = {
      ...referenciaBase,
      id_cotacao_bid_frete_internacional: 'cot-fob',
      incoterm_cotacao_bid_frete_internacional: 'FOB',
    }
    const candSemIncoterm = {
      ...referenciaBase,
      id_cotacao_bid_frete_internacional: 'cot-vazio',
      incoterm_cotacao_bid_frete_internacional: null,
    }

    expect(cotacaoCompativelTermometro(referenciaBase, candCif, { incoterms: ['CIF'] })).toBe(true)
    expect(cotacaoCompativelTermometro(referenciaBase, candFob, { incoterms: ['CIF'] })).toBe(false)
    expect(
      cotacaoCompativelTermometro(referenciaBase, candFob, { incoterms: ['CIF', 'FOB'] }),
    ).toBe(true)
    expect(
      cotacaoCompativelTermometro(referenciaBase, candSemIncoterm, { incoterms: ['CIF'] }),
    ).toBe(false)
    // Lista vazia = sem filtro
    expect(cotacaoCompativelTermometro(referenciaBase, candFob, { incoterms: [] })).toBe(true)
    expect(cotacaoCompativelTermometro(referenciaBase, candSemIncoterm, {})).toBe(true)
  })

  it('filtrarHistoricoTermometro aplica lista de incoterms na lista completa', () => {
    const lista = filtrarHistoricoTermometro(
      referenciaBase,
      [
        {
          ...referenciaBase,
          id_cotacao_bid_frete_internacional: 'h1',
          incoterm_cotacao_bid_frete_internacional: 'CIF',
        },
        {
          ...referenciaBase,
          id_cotacao_bid_frete_internacional: 'h2',
          incoterm_cotacao_bid_frete_internacional: 'EXW',
        },
        {
          ...referenciaBase,
          id_cotacao_bid_frete_internacional: 'h3',
          incoterm_cotacao_bid_frete_internacional: 'CIF',
        },
      ],
      { incoterms: ['CIF'] },
    )

    expect(lista.map((i) => i.id_cotacao_bid_frete_internacional)).toEqual(['h1', 'h3'])
  })

  it('valorHistoricoCotacaoTermometro usa proposta aprovada em contratado', () => {
    const item = {
      ...referenciaBase,
      id_cotacao_bid_frete_internacional: 'cot-apr',
      propostas: [
        {
          status_proposta_bid_frete_internacional: 'PENDENTE',
          valor_frete_proposta_bid_frete_internacional: 900,
        },
        {
          status_proposta_bid_frete_internacional: 'APROVADA',
          valor_frete_proposta_bid_frete_internacional: 750,
        },
      ],
    }

    expect(valorHistoricoCotacaoTermometro(item, 'CONTRATADO', 'FRETE_BASE')).toBe(750)
  })
})
