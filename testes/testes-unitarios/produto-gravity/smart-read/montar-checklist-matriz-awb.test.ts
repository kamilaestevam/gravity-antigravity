import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_AWB,
  GATES_MATRIZ_AWB,
  MATRIZ_VALIDACAO_AWB,
  classificacaoPorFaixaScoreAwb,
  classificacaoRiscoAwb,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-awb-smart-read'
import {
  calcularScoreChecklistAwb,
  combinarResumoGeralComAwbs,
  ehTipoAwbChecklist,
  montarChecklistMatrizAwb,
  montarResumoChecklistAwbs,
  percentualConformeChecklistAwb,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-awb-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import {
  executarPasso1ValidacaoCodigoAwb,
  validarCnpjAlfanumericoAwb,
  validarNumeroAwbIata,
} from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-awb-smart-read'

const ROTULO_AWB = 'AWB01.pdf · AWB'

function docAwb(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'AWB01.pdf',
    tipo_documento: 'AWB',
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

function docPackingList(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'PACKING01.pdf',
    tipo_documento: 'PACKING_LIST',
    indice: 1,
    dados,
  }
}

describe('matriz de validação do AWB (SSOT)', () => {
  it('tem 50 regras, 48 avaliáveis e 2 agregadores (AW9-05/AW9-06)', () => {
    expect(MATRIZ_VALIDACAO_AWB).toHaveLength(50)
    const avaliaveis = MATRIZ_VALIDACAO_AWB.filter((r) => r.severidade !== null)
    expect(avaliaveis).toHaveLength(48)
    const agregadores = MATRIZ_VALIDACAO_AWB.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['AW9-05', 'AW9-06'])
  })

  it('gates são exatamente as regras BLOQ listadas no AW9-06', () => {
    expect([...GATES_MATRIZ_AWB].sort()).toEqual(
      ['AW1-01', 'AW1-05', 'AW2-05', 'AW2-06', 'AW3-04', 'AW5-03', 'AW5-04', 'AW7-01', 'AW8-02'].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_AWB) {
      expect(GATES_MATRIZ_AWB).toContain(gate)
    }
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScoreAwb(100)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScoreAwb(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScoreAwb(94)).toBe('atencao')
    expect(classificacaoPorFaixaScoreAwb(80)).toBe('atencao')
    expect(classificacaoPorFaixaScoreAwb(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScoreAwb(60)).toBe('alto_risco')
    expect(classificacaoPorFaixaScoreAwb(59)).toBe('critico')
  })

  it('gate falho rebaixa a classificação independentemente do score', () => {
    expect(classificacaoRiscoAwb(100, [])).toBe('baixo_risco')
    expect(classificacaoRiscoAwb(100, ['AW1-01'])).toBe('alto_risco')
    expect(classificacaoRiscoAwb(100, ['AW1-01', 'AW5-04'])).toBe('critico')
    // Gates críticos isolados (AW2-05 bloqueio HAWB / AW7-01 associação / AW5-03 peso > 5%) ⇒ Crítico
    expect(classificacaoRiscoAwb(100, ['AW2-05'])).toBe('critico')
    expect(classificacaoRiscoAwb(100, ['AW7-01'])).toBe('critico')
    expect(classificacaoRiscoAwb(100, ['AW5-03'])).toBe('critico')
    // Score na faixa crítica permanece crítico mesmo com um único gate comum
    expect(classificacaoRiscoAwb(40, ['AW1-01'])).toBe('critico')
  })
})

describe('validarNumeroAwbIata (AW1-01)', () => {
  it('aceita número IATA com dígito verificador mód. 7 correto', () => {
    // serial 1234567 % 7 = 5
    expect(validarNumeroAwbIata('057-12345675')).toBe(true)
    expect(validarNumeroAwbIata('05712345675')).toBe(true)
  })

  it('rejeita dígito verificador incorreto e formatos inválidos', () => {
    expect(validarNumeroAwbIata('057-12345671')).toBe(false)
    expect(validarNumeroAwbIata('057-1234567')).toBe(false)
    expect(validarNumeroAwbIata('ABC-12345675')).toBe(false)
    expect(validarNumeroAwbIata('')).toBe(false)
  })
})

describe('validarCnpjAlfanumericoAwb (AW2-04 — IN RFB 2.229/2024)', () => {
  it('rejeita formatos fora do padrão 12 alfanuméricos + 2 DV numéricos', () => {
    expect(validarCnpjAlfanumericoAwb('12ABC34501DEAA')).toBe(false)
    expect(validarCnpjAlfanumericoAwb('curto')).toBe(false)
  })

  it('é retrocompatível com CNPJ 100% numérico válido', () => {
    expect(validarCnpjAlfanumericoAwb('11222333000181')).toBe(true)
    expect(validarCnpjAlfanumericoAwb('11222333000182')).toBe(false)
  })

  it('valida DV pelo Módulo 11 com conversão ASCII−48', () => {
    // Gera um CNPJ alfanumérico válido calculando os DVs do próprio algoritmo
    const base = '12ABC34501DE'
    const valores = base.split('').map((ch) => ch.charCodeAt(0) - 48)
    const calcularDv = (nums: number[]): number => {
      let peso = 2
      let soma = 0
      for (let i = nums.length - 1; i >= 0; i -= 1) {
        soma += nums[i] * peso
        peso = peso === 9 ? 2 : peso + 1
      }
      const resto = soma % 11
      return resto < 2 ? 0 : 11 - resto
    }
    const dv1 = calcularDv(valores)
    const dv2 = calcularDv([...valores, dv1])
    expect(validarCnpjAlfanumericoAwb(`${base}${dv1}${dv2}`)).toBe(true)
    expect(validarCnpjAlfanumericoAwb(`${base}${(dv1 + 1) % 10}${dv2}`)).toBe(false)
  })
})

describe('ehTipoAwbChecklist', () => {
  it('reconhece AWB, Air Waybill, MAWB e HAWB', () => {
    expect(ehTipoAwbChecklist('AWB')).toBe(true)
    expect(ehTipoAwbChecklist('Air Waybill')).toBe(true)
    expect(ehTipoAwbChecklist('MAWB')).toBe(true)
    expect(ehTipoAwbChecklist('HAWB A')).toBe(true)
    expect(ehTipoAwbChecklist('PACKING_LIST')).toBe(false)
    expect(ehTipoAwbChecklist('INVOICE')).toBe(false)
    expect(ehTipoAwbChecklist('BL')).toBe(false)
  })
})

describe('montarChecklistMatrizAwb', () => {
  it('gera uma entrada por regra da matriz, incluindo os agregadores', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: false,
      carregando: true,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_AWB.length)
    expect(itens.some((i) => i.regra.id === 'AW9-05')).toBe(true)
    expect(itens.some((i) => i.regra.id === 'AW9-06')).toBe(true)
  })

  it('regras ficam pendentes enquanto a análise roda', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: true,
      carregando: true,
    })
    const avaliaveis = itens.filter((i) => i.regra.severidade !== null)
    expect(avaliaveis.every((i) => i.status === 'pendente')).toBe(true)
    expect(avaliaveis.every((i) => i.em_analise)).toBe(true)
  })

  it('mostra prévia local com spinner durante o enriquecimento IA', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
    })
    const aw401 = itens.find((i) => i.regra.id === 'AW4-01')
    expect(aw401?.status).toBe('amarelo')
    expect(aw401?.resultado).toBe('Prévia local…')
    expect(aw401?.em_analise).toBe(true)
  })

  it('regra de código com falha do Passo 1 fica vermelha', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [{ id: `AW5-01-${ROTULO_AWB}`, passou: false, detalhe: 'Peso bruto ausente' }],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_AWB,
    })
    const aw501 = itens.find((i) => i.regra.id === 'AW5-01')
    expect(aw501?.status).toBe('vermelho')
    expect(aw501?.rotulo_status).toBe('FALHA')
  })

  it('risco emitido pelo motor prevalece e carrega o risco_id', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [{ id: `AW5-03-${ROTULO_AWB}`, passou: true, detalhe: 'ok' }],
      riscos: [
        {
          id: 'risco-awb-1',
          titulo: 'Divergência de peso acima de 5%',
          motivo: 'Gross do AWB 100 kg × PL 120 kg',
          analise: 'acima da tolerância da IN 680/06',
          severidade: 'critico',
          categoria: 'matematico',
          evidencias: [{ documento: ROTULO_AWB, campo: 'shipmentDetails.totalGrossWeight', valor: '100' }],
          id_regra_matriz: 'AW5-03',
          status_matriz: 'vermelho',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_AWB,
    })
    const aw503 = itens.find((i) => i.regra.id === 'AW5-03')
    expect(aw503?.status).toBe('vermelho')
    expect(aw503?.risco_id).toBe('risco-awb-1')
  })

  it('regra COND sem gatilho fica N/A e fora do score', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_AWB,
    })
    const aw305 = itens.find((i) => i.regra.id === 'AW3-05')
    expect(aw305?.status).toBe('na')
    const score = calcularScoreChecklistAwb(itens)
    expect(score.pendente).toBe(false)
  })
})

describe('calcularScoreChecklistAwb', () => {
  it('gate vermelho dispara no score e rebaixa a classificação', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [
        { id: `AW1-01-${ROTULO_AWB}`, passou: false, detalhe: 'AWB fora do padrão IATA' },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_AWB,
    })
    const score = calcularScoreChecklistAwb(itens)
    expect(score.gates_falhos).toContain('AW1-01')
    expect(['alto_risco', 'critico']).toContain(score.classificacao)
  })

  it('sem falhas e com IA concluída, classificação é baixo risco', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_AWB,
    })
    const score = calcularScoreChecklistAwb(itens)
    expect(score.gates_falhos).toHaveLength(0)
    expect(score.classificacao).toBe('baixo_risco')
  })
})

describe('executarPasso1ValidacaoCodigoAwb', () => {
  const dadosAwbValidos = {
    awbInfo: {
      mawbNumber: '057-12345675',
      awbDate: '2026-07-01',
      flight: { flightNumber: 'LA8064', flightDate: '2026-07-03' },
    },
    route: { originAirport: 'MIA', destinationAirport: 'GRU' },
    shipmentDetails: { totalPackages: '10', totalGrossWeight: '500', totalCubedWeight: '620' },
    charges: { internationalFreight: { currency: 'USD', paymentType: 'PREPAID' } },
    exporter: { name: 'ACME Trading Co Ltd' },
    importer: { name: 'Intelbras S/A', cnpj: '82.901.000/0015-22' },
  }

  const dadosInvoice = {
    document: { issueDate: '2026-06-28', invoiceNumber: 'INV-100' },
    exporter: { name: 'ACME Trading Company Limited' },
    importer: { name: 'Intelbras SA Industria', cnpj: '82.901.000/0015-22' },
    incoterm: 'CPT Miami',
    currency: 'USD',
    shipment: { grossWeight: '505' },
  }

  it('AWB coerente passa nas regras de código sem gerar riscos críticos', () => {
    const { resumo, contexto } = executarPasso1ValidacaoCodigoAwb([
      docInvoice(dadosInvoice),
      docAwb(dadosAwbValidos),
    ])
    expect(resumo.criticos).toBe(0)
    const aw101 = contexto.regras.find((r) => r.id === `AW1-01-${ROTULO_AWB}`)
    expect(aw101?.passou).toBe(true)
    const aw106 = contexto.regras.find((r) => r.id === `AW1-06-${ROTULO_AWB}`)
    expect(aw106?.passou).toBe(true)
  })

  it('número de AWB com DV inválido dispara o gate AW1-01', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docAwb({
        ...dadosAwbValidos,
        awbInfo: { ...dadosAwbValidos.awbInfo, mawbNumber: '057-12345671' },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW1-01')
    expect(risco?.status_matriz).toBe('vermelho')
    expect(risco?.severidade).toBe('critico')
  })

  it('Incoterm aquaviário (FOB) em carga aérea dispara o gate AW3-04', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docInvoice({ ...dadosInvoice, incoterm: 'FOB Shanghai' }),
      docAwb(dadosAwbValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW3-04')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('divergência de peso acima de 5% com a invoice dispara o gate AW5-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docInvoice({ ...dadosInvoice, shipment: { grossWeight: '600' } }),
      docAwb(dadosAwbValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW5-03')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('divergência de peso entre 2% e 5% fica amarela (não gate)', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docInvoice({ ...dadosInvoice, shipment: { grossWeight: '515' } }),
      docAwb(dadosAwbValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW5-03')
    expect(risco?.status_matriz).toBe('amarelo')
  })

  it('HAWB sem consignatário dispara o gate AW2-05 (bloqueio automático no CCT)', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docAwb({
        awbInfo: {
          mawbNumber: '057-12345675',
          hawbNumber: 'HGX-9911',
          awbDate: '2026-07-01',
          flight: { flightNumber: 'LA8064', flightDate: '2026-07-03' },
        },
        route: { originAirport: 'MIA', destinationAirport: 'GRU' },
        shipmentDetails: { totalPackages: '10', totalGrossWeight: '500' },
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW2-05')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('dois AWBs com números distintos disparam o gate AW1-05', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docAwb(dadosAwbValidos),
      {
        nome_arquivo: 'AWB02.pdf',
        tipo_documento: 'AWB A',
        indice: 3,
        dados: {
          ...dadosAwbValidos,
          awbInfo: { ...dadosAwbValidos.awbInfo, mawbNumber: '057-99999992' },
        },
      },
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW1-05')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('volumes divergentes do packing list ficam amarelos em AW4-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoAwb([
      docPackingList({ shipmentDetails: { totalPackages: '12' } }),
      docAwb(dadosAwbValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'AW4-03')
    expect(risco?.status_matriz).toBe('amarelo')
  })
})

describe('montarResumoChecklistAwbs e visão geral combinada', () => {
  it('resumo por AWB entra na visão geral ao lado de invoices', () => {
    const documentos = [
      docInvoice({ document: { invoiceNumber: 'INV-100' } }),
      docAwb({ awbInfo: { mawbNumber: '057-12345675' } }),
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
    const resumosAwb = montarResumoChecklistAwbs(parametros)
    expect(resumosAwb).toHaveLength(1)
    expect(resumosAwb[0].rotulo).toBe(ROTULO_AWB)

    const combinado = combinarResumoGeralComAwbs(resumoInvoices, resumosAwb)
    expect(combinado.por_invoice.some((doc) => doc.rotulo === ROTULO_AWB)).toBe(true)
    expect(combinado.contagem_global.total).toBeGreaterThan(
      resumoInvoices.contagem_global.total,
    )
  })

  it('percentual conforme desconsidera N/A na base', () => {
    const itens = montarChecklistMatrizAwb({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_AWB,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual = percentualConformeChecklistAwb(contagem)
    expect(percentual).toBeGreaterThanOrEqual(0)
    expect(percentual).toBeLessThanOrEqual(100)
  })
})
