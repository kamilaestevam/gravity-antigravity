import { describe, it, expect } from 'vitest'
import {
  montarAssuntoEmailAprovacaoProposta,
  montarHtmlEmailAprovacaoProposta,
  montarTextoPlanoEmailAprovacaoProposta,
  type ParametrosEmailAprovacaoPropostaBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-email-aprovacao-proposta-bid-frete-internacional'
import type { PropostaColocacaoEmailBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/shared/colocacao-eixos-aprovacao-bid-frete-internacional'

const propostaGanhador: PropostaColocacaoEmailBidFreteInternacional = {
  id_proposta_bid_frete_internacional: 'p1',
  fornecedor_nome: 'DHL Agente',
  valor_total_proposta_bid_frete_internacional: 4850,
  valor_frete_proposta_bid_frete_internacional: 4500,
  taxas_origem_proposta_bid_frete_internacional: 200,
  taxas_destino_proposta_bid_frete_internacional: 150,
  moeda_proposta_bid_frete_internacional: 'BRL',
  dias_transito_proposta_bid_frete_internacional: 18,
  dias_prazo_pagamento_proposta_bid_frete_internacional: 30,
  quantidade_escala_proposta_bid_frete_internacional: 0,
  quantidade_transbordo_proposta_bid_frete_internacional: 0,
  ranking_geral: 1,
}

const propostaPerdedor: PropostaColocacaoEmailBidFreteInternacional = {
  ...propostaGanhador,
  id_proposta_bid_frete_internacional: 'p2',
  fornecedor_nome: 'ABC Logística',
  valor_total_proposta_bid_frete_internacional: 5200,
  ranking_geral: 2,
}

const baseParams = {
  numeroCotacao: 'COT07001',
  nomeCliente: 'Acme Importadora',
  nomeAprovador: 'Daniel',
  dataAprovacao: '2026-07-06T12:00:00.000Z',
  modal: 'MARITIMO',
  modalidade: 'FCL',
  origemNome: 'Shanghai',
  origemPais: 'CN',
  destinoNome: 'Santos',
  destinoPais: 'BR',
  mercadoria: 'Peças automotivas',
  incoterm: 'FOB',
  propostasTodas: [propostaGanhador, propostaPerdedor],
  nomeFornecedorGanhador: 'DHL Agente',
  valorTotalGanhador: 4850,
  moedaGanhador: 'BRL',
}

describe('formatar-email-aprovacao-proposta-bid-frete-internacional', () => {
  const paramsGanhador: ParametrosEmailAprovacaoPropostaBidFreteInternacional = {
    ...baseParams,
    ehGanhador: true,
    nomeFornecedor: 'DHL Agente',
    proposta: propostaGanhador,
    linkAceite: 'http://localhost:8023/bid-frete/aceite-aprovacao-proposta-bid-frete-internacional/publico/tok-abc',
  }

  const paramsPerdedor: ParametrosEmailAprovacaoPropostaBidFreteInternacional = {
    ...baseParams,
    ehGanhador: false,
    nomeFornecedor: 'ABC Logística',
    proposta: propostaPerdedor,
  }

  it('assunto ganhador parabeniza', () => {
    expect(montarAssuntoEmailAprovacaoProposta(paramsGanhador)).toContain('Parabéns')
    expect(montarAssuntoEmailAprovacaoProposta(paramsGanhador)).toContain('COT07001')
  })

  it('assunto perdedor inclui colocação', () => {
    expect(montarAssuntoEmailAprovacaoProposta(paramsPerdedor)).toContain('2º lugar')
  })

  it('texto plano ganhador inclui cliente, aprovador e botão de aceite', () => {
    const texto = montarTextoPlanoEmailAprovacaoProposta(paramsGanhador)
    expect(texto).toContain('Acme Importadora')
    expect(texto).toContain('Aprovada por: Daniel')
    expect(texto).toContain('Ir para confirmação')
    expect(texto).toContain('tok-abc')
    expect(texto).not.toContain('Ver minhas propostas')
  })

  it('texto plano perdedor inclui ranking e não inclui link de aceite', () => {
    const texto = montarTextoPlanoEmailAprovacaoProposta(paramsPerdedor)
    expect(texto).toContain('2º lugar')
    expect(texto).toContain('Acme Importadora')
    expect(texto).toContain('Aprovada por: Daniel')
    expect(texto).toContain('COLOCAÇÃO POR EIXO')
    expect(texto).not.toContain('Ir para confirmação')
  })

  it('html ganhador usa card HTML (sem SVG inline — Gmail bloqueia data URI)', () => {
    const html = montarHtmlEmailAprovacaoProposta(paramsGanhador)
    expect(html).not.toContain('data:image/svg+xml;base64,')
    expect(html).toContain('Seu resultado')
    expect(html).toContain('1º lugar geral')
    expect(html).toContain('Ir para confirmação')
    expect(html).toContain('Acme Importadora')
    expect(html).not.toContain('Ver minhas propostas')
  })

  it('html perdedor não inclui botão de aceite', () => {
    const html = montarHtmlEmailAprovacaoProposta(paramsPerdedor)
    expect(html).toContain('2º lugar')
    expect(html).not.toContain('Ir para confirmação')
  })

  it('comentários do comprador aparecem só no e-mail do ganhador', () => {
    const comentario = 'Favor confirmar free time de 14 dias.'
    const ganhadorComComentario = {
      ...paramsGanhador,
      comentariosAprovacaoCotacao: comentario,
    }
    const perdedorComComentario = {
      ...paramsPerdedor,
      comentariosAprovacaoCotacao: comentario,
    }
    const htmlGanhador = montarHtmlEmailAprovacaoProposta(ganhadorComComentario)
    const htmlPerdedor = montarHtmlEmailAprovacaoProposta(perdedorComComentario)
    const textoGanhador = montarTextoPlanoEmailAprovacaoProposta(ganhadorComComentario)
    const textoPerdedor = montarTextoPlanoEmailAprovacaoProposta(perdedorComComentario)

    expect(htmlGanhador).toContain('Observações')
    expect(htmlGanhador).toContain(comentario)
    expect(htmlGanhador.indexOf('Observações')).toBeGreaterThan(htmlGanhador.indexOf('Rota'))
    expect(textoGanhador).toContain(comentario)
    expect(htmlPerdedor).not.toContain('Observações')
    expect(textoPerdedor).not.toContain(comentario)
  })
})
