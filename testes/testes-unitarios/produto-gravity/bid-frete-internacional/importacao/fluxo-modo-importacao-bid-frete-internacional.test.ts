/// <reference types="vitest/globals" />

import {
  podePularMapeamentoImportacaoBid,
} from '../../../../../servicos-global/produto/bid-frete-internacional/shared/mapear-colunas-importacao-bid-frete-internacional'
import { aplicarMapeamentoImportacaoBid } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/parsear-planilha-importacao-bid-frete-internacional'
import type { ColunaMapeadaBidFreteInternacional } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/tipos-importacao-bid-frete-internacional'

describe('fluxo-modo-importacao-bid-frete-internacional', () => {
  it('pula mapeamento só no modo gravity com essenciais completos', () => {
    const mapeamentoCompleto = [
      { coluna_arquivo: 'Operacao', campo_sistema: 'tipo_operacao_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto' as const, inferido_por: 'rotulo' as const, valor_exemplo: 'Importação' },
      { coluna_arquivo: 'Modal', campo_sistema: 'modal_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto' as const, inferido_por: 'rotulo' as const, valor_exemplo: 'Marítimo' },
      { coluna_arquivo: 'Mercadoria', campo_sistema: 'descricao_mercadoria_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto' as const, inferido_por: 'rotulo' as const, valor_exemplo: 'Carga' },
      { coluna_arquivo: 'Incoterm', campo_sistema: 'incoterm_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto' as const, inferido_por: 'rotulo' as const, valor_exemplo: 'FOB' },
      { coluna_arquivo: 'Qtd', campo_sistema: 'quantidade_volume_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto' as const, inferido_por: 'rotulo' as const, valor_exemplo: '1' },
    ] satisfies ColunaMapeadaBidFreteInternacional[]

    expect(podePularMapeamentoImportacaoBid('gravity', mapeamentoCompleto, 1)).toBe(true)
    expect(podePularMapeamentoImportacaoBid('usuario', mapeamentoCompleto, 1)).toBe(false)
  })

  it('normaliza enums acentuados ao aplicar mapeamento', () => {
    const mapeamento: ColunaMapeadaBidFreteInternacional[] = [
      { coluna_arquivo: 'Operacao', campo_sistema: 'tipo_operacao_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Importação' },
      { coluna_arquivo: 'Modal', campo_sistema: 'modal_cotacao_bid_frete_internacional', confianca: 99, nivel: 'auto', inferido_por: 'rotulo', valor_exemplo: 'Marítimo' },
    ]

    const [linha] = aplicarMapeamentoImportacaoBid(
      [{ Operacao: 'Importação', Modal: 'Marítimo' }],
      mapeamento,
    )

    expect(linha.tipo_operacao_cotacao_bid_frete_internacional).toBe('IMPORTACAO')
    expect(linha.modal_cotacao_bid_frete_internacional).toBe('MARITIMO')
  })
})
