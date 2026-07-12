import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_CERTIFICADO_ORIGEM,
  GATES_MATRIZ_CERTIFICADO_ORIGEM,
  MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM,
  classificacaoPorFaixaScoreCertificadoOrigem,
  classificacaoRiscoCertificadoOrigem,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-certificado-origem-smart-read'
import {
  calcularScoreChecklistCertificadoOrigem,
  combinarResumoGeralComCertificadosOrigem,
  ehTipoCertificadoOrigemChecklist,
  montarChecklistMatrizCertificadoOrigem,
  montarResumoChecklistCertificadosOrigem,
  percentualConformeChecklistCertificadoOrigem,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-certificado-origem-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import { executarPasso1ValidacaoCodigoCertificadoOrigem } from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-certificado-origem-smart-read'

const ROTULO_CO = 'CO01.pdf · Certificado de Origem'

function docCo(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'CO01.pdf',
    tipo_documento: 'Certificado de Origem',
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

describe('matriz de validação do Certificado de Origem (SSOT)', () => {
  it('tem 48 regras, 46 avaliáveis e 2 agregadores (CO9-05/CO9-06)', () => {
    expect(MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM).toHaveLength(48)
    const avaliaveis = MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM.filter((r) => r.severidade !== null)
    expect(avaliaveis).toHaveLength(46)
    const agregadores = MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['CO9-05', 'CO9-06'])
  })

  it('gates são exatamente as 15 regras BLOQ listadas no CO9-06', () => {
    expect(GATES_MATRIZ_CERTIFICADO_ORIGEM).toHaveLength(15)
    expect([...GATES_MATRIZ_CERTIFICADO_ORIGEM].sort()).toEqual(
      [
        'CO1-01',
        'CO1-02',
        'CO2-04',
        'CO3-02',
        'CO3-03',
        'CO4-01',
        'CO4-02',
        'CO4-04',
        'CO5-01',
        'CO6-01',
        'CO6-02',
        'CO6-03',
        'CO7-02',
        'CO9-01',
        'CO9-04',
      ].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_CERTIFICADO_ORIGEM) {
      expect(GATES_MATRIZ_CERTIFICADO_ORIGEM).toContain(gate)
    }
  })

  it('gate crítico de formalidade rebaixa para Crítico', () => {
    expect(classificacaoRiscoCertificadoOrigem(100, ['CO6-02'])).toBe('critico')
    expect(classificacaoRiscoCertificadoOrigem(100, ['CO3-03'])).toBe('critico')
    expect(classificacaoRiscoCertificadoOrigem(100, ['CO5-01'])).toBe('critico')
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScoreCertificadoOrigem(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScoreCertificadoOrigem(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScoreCertificadoOrigem(59)).toBe('critico')
  })
})

describe('ehTipoCertificadoOrigemChecklist', () => {
  it('reconhece certificado de origem e COD', () => {
    expect(ehTipoCertificadoOrigemChecklist('Certificado de Origem')).toBe(true)
    expect(ehTipoCertificadoOrigemChecklist('Certificate of Origin')).toBe(true)
    expect(ehTipoCertificadoOrigemChecklist('COD')).toBe(true)
    expect(ehTipoCertificadoOrigemChecklist('INVOICE')).toBe(false)
    expect(ehTipoCertificadoOrigemChecklist('BL')).toBe(false)
  })
})

describe('montarChecklistMatrizCertificadoOrigem', () => {
  it('gera uma entrada por regra da matriz', () => {
    const itens = montarChecklistMatrizCertificadoOrigem({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_CO,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM.length)
  })

  it('mostra prévia local com spinner durante enriquecimento IA', () => {
    const itens = montarChecklistMatrizCertificadoOrigem({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
    })
    const co101 = itens.find((i) => i.regra.id === 'CO1-01')
    expect(co101?.status).toBe('amarelo')
    expect(co101?.em_analise).toBe(true)
  })
})

describe('executarPasso1ValidacaoCodigoCertificadoOrigem', () => {
  const dadosCoValidos = {
    document: {
      certificateNumber: 'CO-2026-001',
      issueDate: '2026-07-05',
      expiryDate: '2026-12-31',
    },
    agreement: 'Mercosul ACE 18',
    producer: { name: 'ACME Manufacturing Ltd' },
    exporter: { name: 'ACME Trading Co Ltd' },
    importer: { name: 'Intelbras S/A' },
    goods: {
      description: 'Network switches and routers',
      ncm: '85176259',
      quantity: '100',
    },
    linkedInvoice: { number: 'INV-100' },
    countryOfOrigin: 'Argentina',
  }

  const dadosInvoice = {
    document: { issueDate: '2026-07-01', invoiceNumber: 'INV-100' },
    exporter: { name: 'ACME Trading Company Limited' },
    importer: { name: 'Intelbras SA Industria' },
    manufacturer: { name: 'ACME Manufacturing Limited' },
    goods: {
      description: 'Network switches routers equipment',
      ncm: '85176259',
      totalQuantity: '100',
      countryOfOrigin: 'Argentina',
    },
  }

  it('CO coerente passa sem gates críticos', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoOrigem([
      docInvoice(dadosInvoice),
      docCo(dadosCoValidos),
    ])
    expect(resumo.criticos).toBe(0)
  })

  it('emissão anterior à fatura dispara gate CO3-02', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoOrigem([
      docInvoice(dadosInvoice),
      docCo({
        ...dadosCoValidos,
        document: { ...dadosCoValidos.document, issueDate: '2026-06-20' },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CO3-02')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('NCM divergente dispara gate CO4-02', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoOrigem([
      docInvoice(dadosInvoice),
      docCo({ ...dadosCoValidos, goods: { ...dadosCoValidos.goods, ncm: '12345678' } }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CO4-02')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('fatura vinculada divergente dispara gate CO4-04', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoOrigem([
      docInvoice(dadosInvoice),
      docCo({ ...dadosCoValidos, linkedInvoice: { number: 'INV-999' } }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CO4-04')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('certificado vencido dispara gate CO3-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoOrigem([
      docCo({
        ...dadosCoValidos,
        document: {
          certificateNumber: 'CO-OLD',
          issueDate: '2025-01-01',
          expiryDate: '2025-06-01',
        },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CO3-03')
    expect(risco?.status_matriz).toBe('vermelho')
  })
})

describe('montarResumoChecklistCertificadosOrigem', () => {
  it('resumo por CO entra na visão geral', () => {
    const documentos = [
      docInvoice({ document: { invoiceNumber: 'INV-100' } }),
      docCo({ document: { certificateNumber: 'CO-001' } }),
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
    const resumosCo = montarResumoChecklistCertificadosOrigem(parametros)
    expect(resumosCo).toHaveLength(1)
    const combinado = combinarResumoGeralComCertificadosOrigem(resumoInvoices, resumosCo)
    expect(combinado.por_invoice.some((doc) => doc.rotulo === ROTULO_CO)).toBe(true)
  })

  it('percentual conforme desconsidera N/A na base', () => {
    const itens = montarChecklistMatrizCertificadoOrigem({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_CO,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual = percentualConformeChecklistCertificadoOrigem(contagem)
    expect(percentual).toBeGreaterThanOrEqual(0)
    expect(percentual).toBeLessThanOrEqual(100)
  })
})
