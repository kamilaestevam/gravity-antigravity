import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_PEDIDO_VENDA,
  GATES_MATRIZ_PEDIDO_VENDA,
  MATRIZ_VALIDACAO_PEDIDO_VENDA,
  classificacaoPorFaixaScorePedidoVenda,
  classificacaoRiscoPedidoVenda,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-pedido-venda-smart-read'
import {
  calcularScoreChecklistPedidoVenda,
  combinarResumoGeralComPedidosVenda,
  ehTipoPedidoVendaChecklist,
  montarChecklistMatrizPedidoVenda,
  montarResumoChecklistPedidosVenda,
  percentualConformeChecklistPedidoVenda,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-pedido-venda-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import { executarPasso1ValidacaoCodigoPedidoVenda } from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-pedido-venda-smart-read'

const ROTULO_PV = 'PV01.pdf · Pedido de Venda'

function docPv(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'PV01.pdf',
    tipo_documento: 'Pedido de Venda',
    indice: 1,
    dados,
  }
}

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

describe('matriz de validação do Pedido de Venda (SSOT)', () => {
  it('tem 40 regras, 38 avaliáveis e 2 agregadores (PV9-05/PV9-06)', () => {
    expect(MATRIZ_VALIDACAO_PEDIDO_VENDA).toHaveLength(40)
    const avaliaveis = MATRIZ_VALIDACAO_PEDIDO_VENDA.filter((r) => r.severidade !== null)
    expect(avaliaveis).toHaveLength(38)
    const agregadores = MATRIZ_VALIDACAO_PEDIDO_VENDA.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['PV9-05', 'PV9-06'])
  })

  it('gates são exatamente as 9 regras BLOQ listadas no PV9-06', () => {
    expect(GATES_MATRIZ_PEDIDO_VENDA).toHaveLength(9)
    expect([...GATES_MATRIZ_PEDIDO_VENDA].sort()).toEqual(
      [
        'PV1-03',
        'PV3-01',
        'PV4-03',
        'PV4-04',
        'PV5-03',
        'PV6-03',
        'PV7-02',
        'PV9-02',
        'PV9-04',
      ].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_PEDIDO_VENDA) {
      expect(GATES_MATRIZ_PEDIDO_VENDA).toContain(gate)
    }
  })

  it('gate crítico de valoração rebaixa para Crítico', () => {
    expect(classificacaoRiscoPedidoVenda(100, ['PV4-04'])).toBe('critico')
    expect(classificacaoRiscoPedidoVenda(100, ['PV7-02'])).toBe('critico')
    expect(classificacaoRiscoPedidoVenda(100, ['PV1-03'])).toBe('alto_risco')
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScorePedidoVenda(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScorePedidoVenda(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScorePedidoVenda(59)).toBe('critico')
  })
})

describe('ehTipoPedidoVendaChecklist', () => {
  it('reconhece pedido de venda e sales order', () => {
    expect(ehTipoPedidoVendaChecklist('Pedido de Venda')).toBe(true)
    expect(ehTipoPedidoVendaChecklist('Sales Order')).toBe(true)
    expect(ehTipoPedidoVendaChecklist('Order Confirmation')).toBe(true)
    expect(ehTipoPedidoVendaChecklist('Pedido de Compra')).toBe(false)
    expect(ehTipoPedidoVendaChecklist('INVOICE')).toBe(false)
  })
})

describe('montarChecklistMatrizPedidoVenda', () => {
  it('gera uma entrada por regra da matriz', () => {
    const itens = montarChecklistMatrizPedidoVenda({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_PV,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_PEDIDO_VENDA.length)
  })

  it('mostra prévia local com spinner durante enriquecimento IA', () => {
    const itens = montarChecklistMatrizPedidoVenda({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
    })
    const pv102 = itens.find((i) => i.regra.id === 'PV1-02')
    expect(pv102?.status).toBe('amarelo')
    expect(pv102?.em_analise).toBe(true)
  })
})

describe('executarPasso1ValidacaoCodigoPedidoVenda', () => {
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

  const dadosPc = {
    document: {
      purchaseOrderNumber: 'PO-2026-001',
      issueDate: '2026-06-01',
      incoterm: 'FOB',
      totalAmount: '10000',
    },
    currency: 'USD',
    items: [{ quantity: '100', unitPrice: '100', totalPrice: '10000' }],
  }

  const dadosPvValidos = {
    document: {
      salesOrderNumber: 'SO-001',
      purchaseOrderReference: 'PO-2026-001',
      issueDate: '2026-06-15',
      incoterm: 'FOB',
      totalAmount: '10000',
    },
    currency: 'USD',
    items: [{ quantity: '100', unitPrice: '100', totalPrice: '10000' }],
  }

  it('PV coerente passa sem gates críticos', () => {
    const { resumo } = executarPasso1ValidacaoCodigoPedidoVenda([
      docInvoice(dadosInvoice),
      docPv(dadosPvValidos),
      docPc(dadosPc),
    ])
    expect(resumo.criticos).toBe(0)
  })

  it('preço unitário divergente dispara gate PV4-04', () => {
    const { resumo } = executarPasso1ValidacaoCodigoPedidoVenda([
      docInvoice(dadosInvoice),
      docPc(dadosPc),
      docPv({
        ...dadosPvValidos,
        items: [{ quantity: '100', unitPrice: '50', totalPrice: '5000' }],
        document: { ...dadosPvValidos.document, totalAmount: '5000' },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'PV4-04')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('PV sem referência ao PO dispara gate PV1-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoPedidoVenda([
      docPv({
        ...dadosPvValidos,
        document: { ...dadosPvValidos.document, purchaseOrderReference: undefined },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'PV1-03')
    expect(risco?.status_matriz).toBe('vermelho')
  })
})

describe('montarResumoChecklistPedidosVenda', () => {
  it('resumo por PV entra na visão geral', () => {
    const documentos = [
      docInvoice({ document: { invoiceNumber: 'INV-100', poNumber: 'PO-001' } }),
      docPv({ document: { salesOrderNumber: 'SO-001', purchaseOrderReference: 'PO-001' } }),
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
    const resumosPv = montarResumoChecklistPedidosVenda(parametros)
    expect(resumosPv).toHaveLength(1)
    const combinado = combinarResumoGeralComPedidosVenda(resumoInvoices, resumosPv)
    expect(combinado.por_invoice.some((doc) => doc.rotulo === ROTULO_PV)).toBe(true)
  })

  it('percentual conforme desconsidera N/A na base', () => {
    const itens = montarChecklistMatrizPedidoVenda({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_PV,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual = percentualConformeChecklistPedidoVenda(contagem)
    expect(percentual).toBeGreaterThanOrEqual(0)
    expect(percentual).toBeLessThanOrEqual(100)
  })
})
