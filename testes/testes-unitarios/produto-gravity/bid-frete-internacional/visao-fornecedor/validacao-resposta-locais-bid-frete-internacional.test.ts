import { describe, it, expect } from 'vitest'
import {
  obterErroValidacaoFormularioRespostaCotacao,
  type EstadoFormularioRespostaCotacao,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/formulario-resposta-cotacao-bid-frete-internacional'
import type { ContextoLocaisOpcionaisCotacaoBidFrete } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional'

function formularioBase(overrides: Partial<EstadoFormularioRespostaCotacao> = {}): EstadoFormularioRespostaCotacao {
  return {
    moeda_proposta_bid_frete_internacional: 'USD',
    valor_frete_proposta_bid_frete_internacional: '10000',
    linhas_taxa_origem: [],
    linhas_taxa_destino: [],
    dias_transito_proposta_bid_frete_internacional: '10',
    dias_free_time_proposta_bid_frete_internacional: '10',
    dias_prazo_pagamento_proposta_bid_frete_internacional: '10',
    validade_proposta_bid_frete_internacional: '2026-06-30',
    transbordos_proposta_bid_frete_internacional: '0',
    escalas_proposta_bid_frete_internacional: '',
    observacoes_proposta_bid_frete_internacional: '',
    codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: '',
    codigo_porto_aeroporto_destino_proposta_bid_frete_internacional: '',
    linhas_periodo_armazenagem: [],
    ...overrides,
  }
}

const cotacaoComOpcionais: ContextoLocaisOpcionaisCotacaoBidFrete = {
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  porto_origem_cotacao_bid_frete_internacional: 'BRSSZ',
  porto_destino_cotacao_bid_frete_internacional: 'NLRTM',
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: true,
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: ['BRPNG'],
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: false,
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: [],
}

describe('validacao resposta fornecedor — locais opcionais', () => {
  it('retorna mensagem de local obrigatório quando origem não selecionada', () => {
    const erro = obterErroValidacaoFormularioRespostaCotacao(formularioBase(), {
      modal: 'MARITIMO',
      modalidade: 'FCL',
      incluirArmazenagem: false,
      cotacao: cotacaoComOpcionais,
      mensagemCamposObrigatorios: 'CAMPOS',
      mensagemArmazenagemInvalida: 'ARMAZ',
      mensagemLocalObrigatorio: 'LOCAL_OBRIGATORIO',
    })
    expect(erro).toBe('LOCAL_OBRIGATORIO')
  })

  it('passa quando origem elegível informada', () => {
    const erro = obterErroValidacaoFormularioRespostaCotacao(
      formularioBase({ codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'BRPNG' }),
      {
        modal: 'MARITIMO',
        modalidade: 'FCL',
        incluirArmazenagem: false,
        cotacao: cotacaoComOpcionais,
        mensagemCamposObrigatorios: 'CAMPOS',
        mensagemArmazenagemInvalida: 'ARMAZ',
        mensagemLocalObrigatorio: 'LOCAL_OBRIGATORIO',
      },
    )
    expect(erro).toBeNull()
  })
})
