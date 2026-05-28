import { describe, it, expect } from 'vitest'
import {
  visaoFornecedorBidFreteInternacionalDashboardResponseSchema,
  visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema,
  mapDashboardMetricasFromServer,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/visao-fornecedor-bid-frete-internacional-schemas'

describe('visao-fornecedor-bid-frete-internacional schemas', () => {
  it('valida payload dashboard DDD', () => {
    const raw = {
      visao_fornecedor_bid_frete_internacional: {
        fornecedor_bid_frete_internacional: {
          id_fornecedor_bid_frete_internacional: 'f1',
          nome_fornecedor_bid_frete_internacional: 'Test',
          tipo_fornecedor_bid_frete_internacional: 'ARMADOR',
        },
        metricas_visao_fornecedor_bid_frete_internacional: {
          cotacoes_pendentes_visao_fornecedor_bid_frete_internacional: 1,
          propostas_enviadas_visao_fornecedor_bid_frete_internacional: 2,
          propostas_aprovadas_visao_fornecedor_bid_frete_internacional: 1,
          disparos_recebidos_visao_fornecedor_bid_frete_internacional: 3,
          taxa_resposta_visao_fornecedor_bid_frete_internacional: '66.7',
          taxa_aprovacao_visao_fornecedor_bid_frete_internacional: '50.0',
        },
        classificacao_bid_frete_internacional: {
          nota_global_classificacao_bid_frete_internacional: 4.5,
        },
      },
    }

    const parsed = visaoFornecedorBidFreteInternacionalDashboardResponseSchema.parse(raw)
    const kpis = mapDashboardMetricasFromServer(
      parsed.visao_fornecedor_bid_frete_internacional.metricas_visao_fornecedor_bid_frete_internacional,
      parsed.visao_fornecedor_bid_frete_internacional.classificacao_bid_frete_internacional,
    )

    expect(kpis.pendentes).toBe(1)
    expect(kpis.propostas_enviadas).toBe(2)
    expect(kpis.nota_global_classificacao_bid_frete_internacional).toBe(4.5)
  })

  it('valida payload item tabela_bid_frete_internacional DDD', () => {
    const raw = {
      visao_fornecedor_bid_frete_internacional: {
        tabela_bid_frete_internacional: {
          id_tabela_bid_frete_internacional: 'tab_1',
          origem_codigo_tabela_bid_frete_internacional: 'BRSSZ',
          valor_frete_tabela_bid_frete_internacional: 1200,
        },
      },
    }

    const parsed = visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema.parse(raw)
    expect(parsed.visao_fornecedor_bid_frete_internacional.tabela_bid_frete_internacional.id_tabela_bid_frete_internacional).toBe('tab_1')
  })
})
