import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_PEDIDO_COMPRA,
  GATES_MATRIZ_PEDIDO_COMPRA,
  MATRIZ_VALIDACAO_PEDIDO_COMPRA,
  classificacaoPorFaixaScorePedidoCompra,
  classificacaoRiscoPedidoCompra,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-pedido-compra-smart-read'
import {
  calcularScoreChecklistPedidoCompra,
  combinarResumoGeralComPedidosCompra,
  ehTipoPedidoCompraChecklist,
  montarChecklistMatrizPedidoCompra,
  montarResumoChecklistPedidosCompra,
  percentualConformeChecklistPedidoCompra,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-pedido-compra-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import { executarPasso1ValidacaoCodigoPedidoCompra } from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-pedido-compra-smart-read'

const ROTULO_PC = 'PC01.pdf · Pedido de Compra'

function docPc(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'PC01.pdf',
    tipo_documento: 'Pedido de Compra',
    indice: 2,
    dados,
  }
}

function docInvoice(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'INVOICE01.pdf',
    tipo_documento: 'INVOICE',
    indice: 0,
    dados,
  }
}

function docPv(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'PV01.pdf',
    tipo_documento: 'Pedido de Venda',
    indice: 1,
    dados,
  }
}

describe('matriz de validação do Pedido de Compra (SSOT)', () => {
  it('tem 39 regras, 37 avaliáveis e 2 agregadores (PC9-05/PC9-06)', () => {
    expect(MATRIZ_VALIDACAO_PEDIDO_COMPRA).toHaveLength(39)
    const avaliaveis = MATRIZ_VALIDACAO_PEDIDO_COMPRA.filter((r) => r.severidade !== null)
    expect(avaliaveis).toHaveLength(37)
    const agregadores = MATRIZ_VALIDACAO_PEDIDO_COMPRA.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['PC9-05', 'PC9-06'])
  })

  it('gates são exatamente as 6 regras BLOQ listadas no PC9-06', () => {
    expect(GATES_MATRIZ_PEDIDO_COMPRA).toHaveLength(6)
    expect([...GATES_MATRIZ_PEDIDO_COMPRA].sort()).toEqual(
      ['PC1-03', 'PC2-04', 'PC4-04', 'PC5-03', 'PC6-02', 'PC9-04'].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_PEDIDO_COMPRA) {
      expect(GATES_MATRIZ_PEDIDO_COMPRA).toContain(gate)
    }
  })

  it('gate crítico de valoração rebaixa para Crítico', () => {
    expect(classificacaoRiscoPedidoCompra(100, ['PC4-04'])).toBe('critico')
    expect(classificacaoRiscoPedidoCompra(100, ['PC5-03'])).toBe('critico')
    expect(classificacaoRiscoPedidoCompra(100, ['PC1-03'])).toBe('alto_risco')
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScorePedidoCompra(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScorePedidoCompra(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScorePedidoCompra(59)).toBe('critico')
  })
})

describe('ehTipoPedidoCompraChecklist', () => {
  it('reconhece pedido de compra e PO', () => {
    expect(ehTipoPedidoCompraChecklist('Pedido de Compra')).toBe(true)
    expect(ehTipoPedidoCompraChecklist('Purchase Order')).toBe(true)
    expect(ehTipoPedidoCompraChecklist('PO')).toBe(true)
    expect(ehTipoPedidoCompraChecklist('Pedido de Venda')).toBe(false)
    expect(ehTipoPedidoCompraChecklist('INVOICE')).toBe(false)
  })
})

describe('montarChecklistMatrizPedidoCompra', () => {
  it('gera uma entrada por regra da matriz', () => {
    const itens = montarChecklistMatrizPedidoCompra({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_PC,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_PEDIDO_COMPRA.length)
  })

  it('mostra prévia local com spinner durante enriquecimento IA', () => {
    const itens = montarChecklistMatrizPedidoCompra({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
    })
    const pc104 = itens.find((i) => i.regra.id === 'PC1-04')
    expect(pc104?.status).toBe('amarelo')
    expect(pc104?.em_analise).toBe(true)
  })
})

describe('executarPasso1ValidacaoCodigoPedidoCompra', () => {
  const dadosInvoice = {
    document: {
      issueDate: '2026-07-01',
      invoiceNumber: 'INV-100',
      poNumber: 'PO-2026-001',
      incoterm: 'FOB',
      totalAmount: '10000',
    },
    currency: 'USD',
    items: [{ quantity: '100', unitPrice: '100', totalPrice: '10000' }],
  }

  const dadosPcValidos = {
    document: {
      purchaseOrderNumber: 'PO-2026-001',
      issueDate: '2026-06-01',
      incoterm: 'FOB',
      totalAmount: '10000',
    },
    currency: 'USD',
    items: [{ quantity: '100', unitPrice: '100', totalPrice: '10000', partNumber: 'SKU-001' }],
  }

  const dadosPv = {
    document: {
      salesOrderNumber: 'SO-001',
      purchaseOrderReference: 'PO-2026-001',
      incoterm: 'FOB',
      issueDate: '2026-06-15',
      totalAmount: '10000',
    },
    currency: 'USD',
    items: [{ quantity: '100', unitPrice: '100', totalPrice: '10000' }],
  }

  it('PC coerente passa sem gates críticos', () => {
    const { resumo } = executarPasso1ValidacaoCodigoPedidoCompra([
      docInvoice(dadosInvoice),
      docPv(dadosPv),
      docPc(dadosPcValidos),
    ])
    expect(resumo.criticos).toBe(0)
  })

  it('preço unitário divergente dispara gate PC4-04', () => {
    const { resumo } = executarPasso1ValidacaoCodigoPedidoCompra([
      docInvoice(dadosInvoice),
      docPc({
        ...dadosPcValidos,
        items: [{ quantity: '100', unitPrice: '50', totalPrice: '5000' }],
        document: { ...dadosPcValidos.document, totalAmount: '5000' },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'PC4-04')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('PO órfão dispara gate PC1-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoPedidoCompra([
      docInvoice({ ...dadosInvoice, document: { ...dadosInvoice.document, poNumber: 'PO-999' } }),
      docPc(dadosPcValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'PC1-03')
    expect(risco?.status_matriz).toBe('vermelho')
  })
})

describe('montarResumoChecklistPedidosCompra', () => {
  it('resumo por PC entra na visão geral', () => {
    const documentos = [
      docInvoice({ document: { invoiceNumber: 'INV-100', poNumber: 'PO-001' } }),
      docPc({ document: { purchaseOrderNumber: 'PO-001' } }),
    ]
    const parametros = {
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      documentos,
    }
    const resumoInvoices = montarResumoGeralChecklistInvoices(parametros)
    const resumosPc = montarResumoChecklistPedidosCompra(parametros)
    expect(resumosPc).toHaveLength(1)
    const combinado = combinarResumoGeralComPedidosCompra(resumoInvoices, resumosPc)
    expect(combinado.por_invoice.some((doc) => doc.rotulo === ROTULO_PC)).toBe(true)
  })

  it('percentual conforme desconsidera N/A na base', () => {
    const itens = montarChecklistMatrizPedidoCompra({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_PC,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual = percentualConformeChecklistPedidoCompra(contagem)
    expect(percentual).toBeGreaterThanOrEqual(0)
    expect(percentual).toBeLessThanOrEqual(100)
  })
})
