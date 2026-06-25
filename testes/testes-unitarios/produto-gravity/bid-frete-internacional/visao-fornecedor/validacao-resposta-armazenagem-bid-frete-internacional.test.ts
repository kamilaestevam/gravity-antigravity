import { describe, it, expect } from 'vitest'
import {
  camposLogisticaRespostaCotacaoValidos,
  obterErroValidacaoFormularioRespostaCotacao,
  type EstadoFormularioRespostaCotacao,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/formulario-resposta-cotacao-bid-frete-internacional'

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
    transbordos_proposta_bid_frete_internacional: '10',
    escalas_proposta_bid_frete_internacional: '',
    observacoes_proposta_bid_frete_internacional: '',
    linhas_periodo_armazenagem: [{
      id_linha_periodo_armazenagem: 'arm_1',
      dias_periodo_armazenagem: '5',
      tipo_tarifa_periodo_armazenagem: 'REAIS',
      valor_tarifa_periodo_armazenagem: '5',
      minimo_reais_periodo_armazenagem: '',
    }],
    ...overrides,
  }
}

const optsArmazenagem = {
  modal: 'MARITIMO' as const,
  modalidade: 'LCL' as const,
  incluirArmazenagem: true,
  mensagemCamposObrigatorios: 'GENERICO',
  mensagemArmazenagemInvalida: 'ARMAZENAGEM',
}

const optsSemArmazenagem = {
  modal: 'MARITIMO' as const,
  modalidade: 'LCL' as const,
  incluirArmazenagem: false,
  mensagemCamposObrigatorios: 'GENERICO',
  mensagemArmazenagemInvalida: 'ARMAZENAGEM',
}

describe('validacao resposta fornecedor — isolamento armazenagem', () => {
  it('com armazenagem e minimo vazio: validacao passa', () => {
    const form = formularioBase()
    expect(camposLogisticaRespostaCotacaoValidos(form, 'MARITIMO', 'LCL', true)).toBe(true)
    expect(obterErroValidacaoFormularioRespostaCotacao(form, optsArmazenagem)).toBeNull()
  })

  it('sem armazenagem: ignora linhas vazias de periodo', () => {
    const form = formularioBase({
      linhas_periodo_armazenagem: [{
        id_linha_periodo_armazenagem: 'arm_vazio',
        dias_periodo_armazenagem: '',
        tipo_tarifa_periodo_armazenagem: '',
        valor_tarifa_periodo_armazenagem: '',
        minimo_reais_periodo_armazenagem: '',
      }],
    })
    expect(camposLogisticaRespostaCotacaoValidos(form, 'MARITIMO', 'LCL', false)).toBe(true)
    expect(obterErroValidacaoFormularioRespostaCotacao(form, optsSemArmazenagem)).toBeNull()
  })

  it('com armazenagem incompleta: mensagem especifica (nao generica)', () => {
    const form = formularioBase({
      linhas_periodo_armazenagem: [{
        id_linha_periodo_armazenagem: 'arm_1',
        dias_periodo_armazenagem: '5',
        tipo_tarifa_periodo_armazenagem: 'REAIS',
        valor_tarifa_periodo_armazenagem: '',
        minimo_reais_periodo_armazenagem: '',
      }],
    })
    expect(obterErroValidacaoFormularioRespostaCotacao(form, optsArmazenagem)).toBe('ARMAZENAGEM')
  })

  it('campos base preenchidos + armazenagem ok: nao retorna GENERICO', () => {
    const form = formularioBase()
    expect(obterErroValidacaoFormularioRespostaCotacao(form, optsArmazenagem)).not.toBe('GENERICO')
  })
})
