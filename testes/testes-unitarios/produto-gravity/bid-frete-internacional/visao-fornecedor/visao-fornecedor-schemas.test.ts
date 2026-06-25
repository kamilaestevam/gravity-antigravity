import { describe, it, expect } from 'vitest'
import {
  visaoFornecedorBidFreteInternacionalDashboardResponseSchema,
  visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema,
  mapDashboardMetricasFromServer,
  mapDashboardVisaoFornecedorFromServer,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/visao-fornecedor-bid-frete-internacional-schemas'

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
          propostas_em_analise_visao_fornecedor_bid_frete_internacional: 1,
          propostas_reprovadas_visao_fornecedor_bid_frete_internacional: 0,
          disparos_recebidos_visao_fornecedor_bid_frete_internacional: 3,
          taxa_resposta_visao_fornecedor_bid_frete_internacional: '66.7',
          taxa_aprovacao_visao_fornecedor_bid_frete_internacional: '50.0',
        },
        funil_visao_fornecedor_bid_frete_internacional: [
          {
            rotulo_funil_visao_fornecedor_bid_frete_internacional: 'aguardando_resposta',
            quantidade_funil_visao_fornecedor_bid_frete_internacional: 1,
            cor_funil_visao_fornecedor_bid_frete_internacional: '#fbbf24',
          },
        ],
        alertas_visao_fornecedor_bid_frete_internacional: [
          {
            rotulo_alerta_visao_fornecedor_bid_frete_internacional: 'cotacoes_pendentes',
            quantidade_alerta_visao_fornecedor_bid_frete_internacional: 1,
            tom_alerta_visao_fornecedor_bid_frete_internacional: 'amber',
            rota_alerta_visao_fornecedor_bid_frete_internacional:
              '/bid-frete/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes',
          },
        ],
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
    expect(kpis.taxa_aprovacao).toBe(50)
    expect(kpis.nota_global_classificacao_bid_frete_internacional).toBe(4.5)

    const mapped = mapDashboardVisaoFornecedorFromServer(
      parsed.visao_fornecedor_bid_frete_internacional,
      parsed.visao_fornecedor_bid_frete_internacional.fornecedor_bid_frete_internacional,
    )
    expect(mapped.funil).toHaveLength(1)
    expect(mapped.alertas[0]?.rota).toContain('cotacoes-pendentes')
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
