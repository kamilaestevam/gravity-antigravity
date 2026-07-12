import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_CERTIFICADO_FITOSSANITARIO,
  GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO,
  MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO,
  classificacaoPorFaixaScoreCertificadoFitossanitario,
  classificacaoRiscoCertificadoFitossanitario,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-certificado-fitossanitario-smart-read'
import {
  calcularScoreChecklistCertificadoFitossanitario,
  combinarResumoGeralComCertificadosFitossanitario,
  ehTipoCertificadoFitossanitarioChecklist,
  montarChecklistMatrizCertificadoFitossanitario,
  montarResumoChecklistCertificadosFitossanitario,
  percentualConformeChecklistCertificadoFitossanitario,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-certificado-fitossanitario-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import { executarPasso1ValidacaoCodigoCertificadoFitossanitario } from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-certificado-fitossanitario-smart-read'

const ROTULO_CF = 'CF01.pdf · Phytosanitary Certificate'

function docCf(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'CF01.pdf',
    tipo_documento: 'Phytosanitary Certificate',
    indice: 3,
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

describe('matriz de validação do Certificado Fitossanitário (SSOT)', () => {
  it('tem 48 regras, 46 avaliáveis e 2 agregadores (CF9-05/CF9-06)', () => {
    expect(MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO).toHaveLength(48)
    const avaliaveis = MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO.filter((r) => r.severidade !== null)
    expect(avaliaveis).toHaveLength(46)
    const agregadores = MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['CF9-05', 'CF9-06'])
  })

  it('gates são exatamente as 16 regras BLOQ listadas no CF9-06', () => {
    expect(GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO).toHaveLength(16)
    expect([...GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO].sort()).toEqual(
      [
        'CF1-01',
        'CF1-02',
        'CF1-03',
        'CF2-01',
        'CF2-02',
        'CF2-03',
        'CF2-04',
        'CF2-05',
        'CF3-03',
        'CF4-01',
        'CF4-02',
        'CF5-02',
        'CF7-02',
        'CF7-04',
        'CF9-03',
        'CF9-04',
      ].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_CERTIFICADO_FITOSSANITARIO) {
      expect(GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO).toContain(gate)
    }
  })

  it('gate crítico de ONPF/RFI rebaixa para Crítico', () => {
    expect(classificacaoRiscoCertificadoFitossanitario(100, ['CF2-01'])).toBe('critico')
    expect(classificacaoRiscoCertificadoFitossanitario(100, ['CF1-03'])).toBe('critico')
    expect(classificacaoRiscoCertificadoFitossanitario(100, ['CF5-02'])).toBe('critico')
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScoreCertificadoFitossanitario(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScoreCertificadoFitossanitario(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScoreCertificadoFitossanitario(59)).toBe('critico')
  })
})

describe('ehTipoCertificadoFitossanitarioChecklist', () => {
  it('reconhece certificado fitossanitário e exclui CO', () => {
    expect(ehTipoCertificadoFitossanitarioChecklist('Phytosanitary Certificate')).toBe(true)
    expect(ehTipoCertificadoFitossanitarioChecklist('Certificado Fitossanitário')).toBe(true)
    expect(ehTipoCertificadoFitossanitarioChecklist('CFI')).toBe(true)
    expect(ehTipoCertificadoFitossanitarioChecklist('Certificate of Origin')).toBe(false)
    expect(ehTipoCertificadoFitossanitarioChecklist('INVOICE')).toBe(false)
  })
})

describe('montarChecklistMatrizCertificadoFitossanitario', () => {
  it('gera uma entrada por regra da matriz', () => {
    const itens = montarChecklistMatrizCertificadoFitossanitario({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_CF,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO.length)
  })

  it('mostra prévia local com spinner durante enriquecimento IA (RAG)', () => {
    const itens = montarChecklistMatrizCertificadoFitossanitario({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
    })
    const cf102 = itens.find((i) => i.regra.id === 'CF1-02')
    expect(cf102?.status).toBe('amarelo')
    expect(cf102?.em_analise).toBe(true)
  })
})

describe('executarPasso1ValidacaoCodigoCertificadoFitossanitario', () => {
  const dadosCfValidos = {
    document: {
      phytosanitaryCertificateNumber: 'CF-2026-001',
      issueDate: '2026-07-05',
    },
    countryOfOrigin: 'Argentina',
    botanicalName: 'Glycine max',
    issuingAuthority: 'SENASA Argentina',
    goods: {
      description: 'Soybeans for crushing',
      ncm: '12010010',
      quantity: '500',
    },
    packages: { count: '10' },
  }

  const dadosInvoice = {
    document: { issueDate: '2026-07-01', invoiceNumber: 'INV-100' },
    goods: {
      description: 'Soybeans crushing grade',
      ncm: '12010010',
      totalQuantity: '500',
      countryOfOrigin: 'Argentina',
    },
  }

  const dadosPl = {
    goods: { description: 'Soybeans', quantity: '500' },
    shipmentDetails: { totalPackages: '10' },
  }

  it('CF coerente passa sem gates críticos de cross-doc', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoFitossanitario([
      docInvoice(dadosInvoice),
      { nome_arquivo: 'PL01.pdf', tipo_documento: 'PACKING LIST', indice: 1, dados: dadosPl },
      docCf(dadosCfValidos),
    ])
    const gates = resumo.riscos.filter((r) => r.status_matriz === 'vermelho')
    expect(gates.map((g) => g.id_regra_matriz)).not.toContain('CF4-02')
    expect(gates.map((g) => g.id_regra_matriz)).not.toContain('CF3-03')
  })

  it('descrição divergente dispara gate CF4-02', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoFitossanitario([
      docInvoice(dadosInvoice),
      docCf({ ...dadosCfValidos, goods: { ...dadosCfValidos.goods, description: 'Wheat grain' } }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CF4-02')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('país de origem divergente dispara gate CF3-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoFitossanitario([
      docInvoice(dadosInvoice),
      docCf({ ...dadosCfValidos, countryOfOrigin: 'Paraguay' }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CF3-03')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('NCM divergente dispara gate CF7-02', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoFitossanitario([
      docInvoice(dadosInvoice),
      docCf({ ...dadosCfValidos, goods: { ...dadosCfValidos.goods, ncm: '99999999' } }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CF7-02')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('campos obrigatórios ausentes disparam gate CF9-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoCertificadoFitossanitario([
      docCf({ document: { phytosanitaryCertificateNumber: 'CF-MIN' } }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'CF9-03')
    expect(risco?.status_matriz).toBe('vermelho')
  })
})

describe('montarResumoChecklistCertificadosFitossanitario', () => {
  it('resumo por CF entra na visão geral', () => {
    const documentos = [
      docInvoice({ document: { invoiceNumber: 'INV-100' } }),
      docCf({ document: { phytosanitaryCertificateNumber: 'CF-001' } }),
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
    const resumosCf = montarResumoChecklistCertificadosFitossanitario(parametros)
    expect(resumosCf).toHaveLength(1)
    const combinado = combinarResumoGeralComCertificadosFitossanitario(resumoInvoices, resumosCf)
    expect(combinado.por_invoice.some((doc) => doc.rotulo === ROTULO_CF)).toBe(true)
  })

  it('percentual conforme desconsidera N/A na base', () => {
    const itens = montarChecklistMatrizCertificadoFitossanitario({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_CF,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual = percentualConformeChecklistCertificadoFitossanitario(contagem)
    expect(percentual).toBeGreaterThanOrEqual(0)
    expect(percentual).toBeLessThanOrEqual(100)
  })
})
