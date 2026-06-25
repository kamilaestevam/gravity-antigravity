import { describe, it, expect } from 'vitest'
import { montarPartesCabecalhoRespostaCotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/cabecalho-resposta-cotacao-bid-frete-internacional'
import {
  resolverNomeClienteOperacaoCotacaoResposta,
} from '../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/resolver-nome-cliente-cotacao-resposta-bid-frete-internacional'

const t = (key: string, fallback?: string) => fallback ?? key

describe('montarPartesCabecalhoRespostaCotacao', () => {
  it('sempre inclui agente e importador em importação visível', () => {
    const partes = montarPartesCabecalhoRespostaCotacao(
      {
        nomeAgente: 'AGENTE ACD',
        tipoOperacao: 'IMPORTACAO',
        anonima: false,
        nomeCliente: 'ACME Brasil',
      },
      t,
    )

    expect(partes).toHaveLength(2)
    expect(partes[0]).toMatchObject({ id: 'agente', valor: 'AGENTE ACD', oculto: false })
    expect(partes[1]).toMatchObject({ id: 'importador', valor: 'ACME Brasil', oculto: false })
  })

  it('mostra exportador em exportação', () => {
    const partes = montarPartesCabecalhoRespostaCotacao(
      {
        nomeAgente: 'AGENTE ACD',
        tipoOperacao: 'EXPORTACAO',
        anonima: false,
        nomeCliente: 'Export Co',
      },
      t,
    )

    expect(partes[1]).toMatchObject({ id: 'exportador', valor: 'Export Co' })
  })

  it('substitui cliente por texto de oculto quando cotação anônima', () => {
    const partes = montarPartesCabecalhoRespostaCotacao(
      {
        nomeAgente: 'AGENTE ACD',
        tipoOperacao: 'IMPORTACAO',
        anonima: true,
        nomeCliente: null,
      },
      t,
    )

    expect(partes[0]?.valor).toBe('AGENTE ACD')
    expect(partes[1]).toMatchObject({
      id: 'importador',
      valor: 'Cliente optou por oculto',
      oculto: true,
    })
  })
})

describe('resolverNomeClienteOperacaoCotacaoResposta', () => {
  it('não retorna nome quando cotação anônima', () => {
    const mapa = new Map([['ws-1', 'ACME']])
    expect(
      resolverNomeClienteOperacaoCotacaoResposta({
        id_workspace: 'ws-1',
        anonima_cotacao_bid_frete_internacional: true,
        mapaNomesWorkspace: mapa,
      }),
    ).toBeNull()
  })

  it('retorna nome do workspace quando visível', () => {
    const mapa = new Map([['ws-1', 'ACME Brasil']])
    expect(
      resolverNomeClienteOperacaoCotacaoResposta({
        id_workspace: 'ws-1',
        anonima_cotacao_bid_frete_internacional: false,
        mapaNomesWorkspace: mapa,
      }),
    ).toBe('ACME Brasil')
  })
})
