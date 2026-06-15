import { describe, expect, it } from 'vitest'
import {
  codigoOrigemParaEdicao,
  patchOrigemPorCodigoCadastro,
  resolverPatchEdicaoLocalizacao,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/lista-bid-frete-edicao-logistica'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function cotacaoBase(partial: Partial<Cotacao> = {}): Cotacao {
  return {
    id_cotacao_bid_frete_internacional: 'cot-1',
    id_organizacao: 'org-1',
    id_usuario: 'user-1',
    numero_cotacao_bid_frete_internacional: 'BID-001',
    referencia_interna_cotacao_bid_frete_internacional: null,
    tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
    modal_cotacao_bid_frete_internacional: 'MARITIMO',
    modalidade_cotacao_bid_frete_internacional: 'FCL',
    status_cotacao_bid_frete_internacional: 'RASCUNHO',
    origem_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
    origem_nome_cotacao_bid_frete_internacional: 'Santos',
    origem_pais_cotacao_bid_frete_internacional: 'BR',
    destino_codigo_cotacao_bid_frete_internacional: 'CNSHA',
    destino_nome_cotacao_bid_frete_internacional: 'Shanghai',
    destino_pais_cotacao_bid_frete_internacional: 'CN',
    descricao_mercadoria_cotacao_bid_frete_internacional: 'Carga',
    ncm_cotacao_bid_frete_internacional: null,
    quantidade_volume_cotacao_bid_frete_internacional: 1,
    tipo_container_cotacao_bid_frete_internacional: null,
    peso_kg_cotacao_bid_frete_internacional: null,
    cubagem_m3_cotacao_bid_frete_internacional: null,
    incoterm_cotacao_bid_frete_internacional: 'FOB',
    zipcode_destino_cotacao_bid_frete_internacional: null,
    visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
    anonima_cotacao_bid_frete_internacional: false,
    valor_meta_cotacao_bid_frete_internacional: null,
    moeda_meta_cotacao_bid_frete_internacional: 'USD',
    data_limite_resposta_cotacao_bid_frete_internacional: null,
    ganho_valor_cotacao_bid_frete_internacional: null,
    ganho_percentual_cotacao_bid_frete_internacional: null,
    data_criacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    data_atualizacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    ...partial,
  }
}

describe('lista-bid-frete-edicao-logistica', () => {
  it('codigoOrigemParaEdicao usa origem_codigo persistido no banco', () => {
    const c = cotacaoBase({
      modal_cotacao_bid_frete_internacional: 'AEREO',
      origem_codigo_cotacao_bid_frete_internacional: 'EZE',
    })
    expect(codigoOrigemParaEdicao(c)).toBe('EZE')
  })

  it('patchOrigemPorCodigoCadastro em AEREO grava IATA e snapshot de origem', () => {
    const patch = patchOrigemPorCodigoCadastro(
      cotacaoBase({ modal_cotacao_bid_frete_internacional: 'AEREO' }),
      'EZE',
      [],
      [{
        codigo_iata_aeroporto: 'EZE',
        codigo_unlocode_aeroporto: 'AREZEIZE',
        nome_aeroporto: 'Buenos Aires Ezeiza',
        codigo_pais_aeroporto: 'AR',
        ativo_aeroporto: true,
      }],
    )
    expect(patch.aeroporto_origem_cotacao_bid_frete_internacional).toBe('EZE')
    expect(patch.origem_codigo_cotacao_bid_frete_internacional).toBe('EZE')
    expect(patch.origem_nome_cotacao_bid_frete_internacional).toContain('Ezeiza')
  })

  it('patchOrigemPorCodigoCadastro atualiza codigo e nome do porto', () => {
    const patch = patchOrigemPorCodigoCadastro(
      cotacaoBase(),
      'ARBUE',
      [{ codigo_unlocode_porto: 'ARBUE', nome_porto: 'Buenos Aires', codigo_pais_porto: 'AR', ativo_porto: true }],
      [],
    )
    expect(patch.origem_codigo_cotacao_bid_frete_internacional).toBe('ARBUE')
    expect(patch.origem_nome_cotacao_bid_frete_internacional).toBe('ARBUE — Buenos Aires')
    expect(patch.origem_pais_cotacao_bid_frete_internacional).toBe('AR')
  })

  it('resolverPatchEdicaoLocalizacao retorna patch para porto_origem', () => {
    const patch = resolverPatchEdicaoLocalizacao(
      cotacaoBase(),
      'porto_origem_cotacao_bid_frete_internacional',
      'ARBUE',
      [{ codigo_unlocode_porto: 'ARBUE', nome_porto: 'Buenos Aires', codigo_pais_porto: 'AR', ativo_porto: true }],
      [],
    )
    expect(patch?.origem_codigo_cotacao_bid_frete_internacional).toBe('ARBUE')
  })
})
