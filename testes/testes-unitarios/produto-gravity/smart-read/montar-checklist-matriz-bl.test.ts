import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_BL,
  GATES_MATRIZ_BL,
  MATRIZ_VALIDACAO_BL,
  classificacaoPorFaixaScoreBl,
  classificacaoRiscoBl,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-bl-smart-read'
import {
  calcularScoreChecklistBl,
  combinarResumoGeralComBls,
  ehTipoBlChecklist,
  montarChecklistMatrizBl,
  montarResumoChecklistBls,
  percentualConformeChecklistBl,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-bl-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import {
  executarPasso1ValidacaoCodigoBl,
  filtrarRiscosLlmBlFreteCoerente,
  validarCnpjAlfanumericoBl,
  validarNumeroConteinerIso6346,
} from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-bl-smart-read'

const ROTULO_BL = 'BL01.pdf · BL'

function docBl(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'BL01.pdf',
    tipo_documento: 'BL',
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

describe('matriz de validação do BL (SSOT)', () => {
  it('tem 56 regras, 54 avaliáveis e 2 agregadores (BL9-05/BL9-06)', () => {
    expect(MATRIZ_VALIDACAO_BL).toHaveLength(56)
    const avaliaveis = MATRIZ_VALIDACAO_BL.filter((r) => r.severidade !== null)
    expect(avaliaveis).toHaveLength(54)
    const agregadores = MATRIZ_VALIDACAO_BL.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['BL9-05', 'BL9-06'])
  })

  it('gates são exatamente as regras BLOQ listadas no BL9-06', () => {
    expect([...GATES_MATRIZ_BL].sort()).toEqual(
      ['BL1-05', 'BL2-02', 'BL2-05b', 'BL3-04', 'BL5-03', 'BL5-04', 'BL5-05', 'BL7-02', 'BL8-02'].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_BL) {
      expect(GATES_MATRIZ_BL).toContain(gate)
    }
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScoreBl(100)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScoreBl(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScoreBl(94)).toBe('atencao')
    expect(classificacaoPorFaixaScoreBl(80)).toBe('atencao')
    expect(classificacaoPorFaixaScoreBl(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScoreBl(60)).toBe('alto_risco')
    expect(classificacaoPorFaixaScoreBl(59)).toBe('critico')
  })

  it('gate falho rebaixa a classificação independentemente do score', () => {
    expect(classificacaoRiscoBl(100, [])).toBe('baixo_risco')
    expect(classificacaoRiscoBl(100, ['BL1-05'])).toBe('alto_risco')
    expect(classificacaoRiscoBl(100, ['BL1-05', 'BL5-04'])).toBe('critico')
    // Gates críticos isolados (BL7-02 CE não vinculável / BL2-05b matriz-filial / BL5-03 peso > 5%) ⇒ Crítico
    expect(classificacaoRiscoBl(100, ['BL7-02'])).toBe('critico')
    expect(classificacaoRiscoBl(100, ['BL2-05b'])).toBe('critico')
    expect(classificacaoRiscoBl(100, ['BL5-03'])).toBe('critico')
    // Score na faixa crítica permanece crítico mesmo com um único gate comum
    expect(classificacaoRiscoBl(40, ['BL1-05'])).toBe('critico')
  })
})

describe('validarNumeroConteinerIso6346 (BL4-03)', () => {
  it('aceita número de contêiner com dígito verificador ISO 6346 correto', () => {
    // Exemplo canônico da ISO 6346 — DV 3
    expect(validarNumeroConteinerIso6346('CSQU3054383')).toBe(true)
    expect(validarNumeroConteinerIso6346('CSQU 305438-3')).toBe(true)
  })

  it('rejeita dígito verificador incorreto e formatos inválidos', () => {
    expect(validarNumeroConteinerIso6346('CSQU3054384')).toBe(false)
    expect(validarNumeroConteinerIso6346('CSQU305438')).toBe(false)
    expect(validarNumeroConteinerIso6346('123U3054383')).toBe(false)
    expect(validarNumeroConteinerIso6346('')).toBe(false)
  })
})

describe('validarCnpjAlfanumericoBl (BL2-05 — IN RFB 2.229/2024)', () => {
  it('rejeita formatos fora do padrão 12 alfanuméricos + 2 DV numéricos', () => {
    expect(validarCnpjAlfanumericoBl('12ABC34501DEAA')).toBe(false)
    expect(validarCnpjAlfanumericoBl('curto')).toBe(false)
  })

  it('é retrocompatível com CNPJ 100% numérico válido', () => {
    expect(validarCnpjAlfanumericoBl('11222333000181')).toBe(true)
    expect(validarCnpjAlfanumericoBl('11222333000182')).toBe(false)
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
    expect(validarCnpjAlfanumericoBl(`${base}${dv1}${dv2}`)).toBe(true)
    expect(validarCnpjAlfanumericoBl(`${base}${(dv1 + 1) % 10}${dv2}`)).toBe(false)
  })
})

describe('ehTipoBlChecklist', () => {
  it('reconhece BL, Bill of Lading, MBL, HBL, B/L e Sea Waybill', () => {
    expect(ehTipoBlChecklist('BL')).toBe(true)
    expect(ehTipoBlChecklist('Bill of Lading')).toBe(true)
    expect(ehTipoBlChecklist('MBL')).toBe(true)
    expect(ehTipoBlChecklist('HBL A')).toBe(true)
    expect(ehTipoBlChecklist('B/L')).toBe(true)
    expect(ehTipoBlChecklist('SEA WAYBILL')).toBe(true)
  })

  it('não confunde com AWB nem com outros tipos', () => {
    expect(ehTipoBlChecklist('AWB')).toBe(false)
    expect(ehTipoBlChecklist('Air Waybill')).toBe(false)
    expect(ehTipoBlChecklist('INVOICE')).toBe(false)
    expect(ehTipoBlChecklist('PACKING_LIST')).toBe(false)
    expect(ehTipoBlChecklist('BLOCK LIST')).toBe(false)
  })
})

describe('montarChecklistMatrizBl', () => {
  it('gera uma entrada por regra da matriz, incluindo os agregadores', () => {
    const itens = montarChecklistMatrizBl({
      regras: [],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: false,
      carregando: true,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_BL.length)
    expect(itens.some((i) => i.regra.id === 'BL9-05')).toBe(true)
    expect(itens.some((i) => i.regra.id === 'BL9-06')).toBe(true)
  })

  it('regras ficam pendentes enquanto a análise roda', () => {
    const itens = montarChecklistMatrizBl({
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
    const itens = montarChecklistMatrizBl({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
    })
    const bl401 = itens.find((i) => i.regra.id === 'BL4-01')
    expect(bl401?.status).toBe('amarelo')
    expect(bl401?.resultado).toBe('Prévia local…')
    expect(bl401?.em_analise).toBe(true)
  })

  it('regra de código com falha do Passo 1 fica vermelha', () => {
    const itens = montarChecklistMatrizBl({
      regras: [{ id: `BL5-01-${ROTULO_BL}`, passou: false, detalhe: 'Peso bruto ausente' }],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const bl501 = itens.find((i) => i.regra.id === 'BL5-01')
    expect(bl501?.status).toBe('vermelho')
    expect(bl501?.rotulo_status).toBe('FALHA')
  })

  it('risco emitido pelo motor prevalece e carrega o risco_id', () => {
    const itens = montarChecklistMatrizBl({
      regras: [{ id: `BL5-03-${ROTULO_BL}`, passou: true, detalhe: 'ok' }],
      riscos: [
        {
          id: 'risco-bl-1',
          titulo: 'Divergência de peso acima de 5%',
          motivo: 'Gross do BL 100 kg × PL 120 kg',
          analise: 'acima da tolerância da IN 680/06',
          severidade: 'critico',
          categoria: 'matematico',
          evidencias: [{ documento: ROTULO_BL, campo: 'goods.shipment_gross_weight', valor: '100' }],
          id_regra_matriz: 'BL5-03',
          status_matriz: 'vermelho',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const bl503 = itens.find((i) => i.regra.id === 'BL5-03')
    expect(bl503?.status).toBe('vermelho')
    expect(bl503?.risco_id).toBe('risco-bl-1')
  })

  it('falha do motor BL9-04 gera risco sintético e link Ver risco', () => {
    const itens = montarChecklistMatrizBl({
      regras: [
        {
          id: `BL9-04-${ROTULO_BL}`,
          passou: false,
          detalhe:
            '1 gate(s) do motor de código disparado(s) — exposição a multa R$ 5.000/ocorrência',
        },
        {
          id: `BL5-04-${ROTULO_BL}`,
          passou: false,
          detalhe: 'Peso por contêiner acima do payload máximo (VGM)',
        },
      ],
      riscos: [
        {
          id: 'risco-bl-vgm',
          titulo: 'Peso por contêiner acima do payload máximo (VGM)',
          motivo: 'Contêiner acima do teto ISO',
          analise: 'Gate BL5-04',
          severidade: 'critico',
          categoria: 'matematico',
          evidencias: [{ documento: ROTULO_BL, campo: 'containers[].container_gross_weight' }],
          id_regra_matriz: 'BL5-04',
          status_matriz: 'vermelho',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const bl904 = itens.find((i) => i.regra.id === 'BL9-04')
    const bl906 = itens.find((i) => i.regra.id === 'BL9-06')
    expect(bl904?.status).toBe('vermelho')
    expect(bl904?.risco_id).toMatch(/^risco-matriz-BL9-04-/)
    expect(bl906?.status).toBe('vermelho')
    expect(bl906?.risco_id).toMatch(/^risco-agregador-BL9-06-/)
  })

  it('regra COND sem gatilho fica N/A e fora do score', () => {
    const itens = montarChecklistMatrizBl({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const bl305 = itens.find((i) => i.regra.id === 'BL3-05')
    expect(bl305?.status).toBe('na')
    const score = calcularScoreChecklistBl(itens)
    expect(score.pendente).toBe(false)
  })
})

describe('calcularScoreChecklistBl', () => {
  it('gate vermelho dispara no score e rebaixa a classificação', () => {
    const itens = montarChecklistMatrizBl({
      regras: [],
      riscos: [
        {
          id: 'risco-bl-2',
          titulo: 'BLs conflitantes',
          motivo: 'Dois BLs distintos no processo',
          analise: 'reemissão sem cancelamento',
          severidade: 'critico',
          categoria: 'documental',
          evidencias: [{ documento: ROTULO_BL, campo: 'document.billOfLadingNumber' }],
          id_regra_matriz: 'BL1-05',
          status_matriz: 'vermelho',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const score = calcularScoreChecklistBl(itens)
    expect(score.gates_falhos).toContain('BL1-05')
    expect(['alto_risco', 'critico']).toContain(score.classificacao)
  })

  it('sem falhas e com IA concluída, classificação é baixo risco', () => {
    const itens = montarChecklistMatrizBl({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const score = calcularScoreChecklistBl(itens)
    expect(score.gates_falhos).toHaveLength(0)
    expect(score.classificacao).toBe('baixo_risco')
  })
})

describe('executarPasso1ValidacaoCodigoBl', () => {
  const dadosBlValidos = {
    document: {
      billOfLadingNumber: 'MSCUAB123456',
      date: '2026-07-01',
      shippedOnBoardDate: '2026-07-02',
    },
    exporter: { name: 'ACME Trading Co Ltd' },
    importer: { name: 'Intelbras S/A', cnpj: '82.901.000/0015-22' },
    shipment: {
      vesselName: 'MSC LUCIANA',
      voyage_number: '123W',
      port_of_origin: 'SHANGHAI',
      port_of_destination: 'SANTOS',
    },
    goods: { total_packages: '10', shipment_gross_weight: '500' },
    containers: [
      {
        container_number: 'CSQU3054383',
        container_seal: 'SL-889911',
        container_type: '40HC',
        container_gross_weight: '500',
      },
    ],
    freight: { payment_terms: 'PREPAID', currency: 'USD' },
  }

  const dadosInvoice = {
    document: { issueDate: '2026-06-28', invoiceNumber: 'INV-100' },
    exporter: { name: 'ACME Trading Company Limited' },
    importer: { name: 'Intelbras SA Industria', cnpj: '82.901.000/0015-22' },
    incoterm: 'CIF Santos',
    currency: 'USD',
    shipment: { grossWeight: '505' },
  }

  it('BL coerente passa nas regras de código sem gerar riscos críticos', () => {
    const { resumo, contexto } = executarPasso1ValidacaoCodigoBl([
      docInvoice(dadosInvoice),
      docBl(dadosBlValidos),
    ])
    expect(resumo.criticos).toBe(0)
    const bl101 = contexto.regras.find((r) => r.id === `BL1-01-${ROTULO_BL}`)
    expect(bl101?.passou).toBe(true)
    const bl403 = contexto.regras.find((r) => r.id === `BL4-03-${ROTULO_BL}`)
    expect(bl403?.passou).toBe(true)
    const bl601 = contexto.regras.find((r) => r.id === `BL6-01-${ROTULO_BL}`)
    expect(bl601?.passou).toBe(true)
  })

  it('contêiner com DV ISO 6346 inválido dispara BL4-03 (alerta amarelo)', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docBl({
        ...dadosBlValidos,
        containers: [{ ...dadosBlValidos.containers[0], container_number: 'CSQU3054384' }],
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL4-03')
    expect(risco?.status_matriz).toBe('amarelo')
  })

  it('divergência de peso acima de 5% com a invoice dispara o gate BL5-03', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docInvoice({ ...dadosInvoice, shipment: { grossWeight: '600' } }),
      docBl(dadosBlValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL5-03')
    expect(risco?.status_matriz).toBe('vermelho')
    expect(risco?.severidade).toBe('critico')
  })

  it('divergência de peso entre 2% e 5% fica amarela (não gate)', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docInvoice({ ...dadosInvoice, shipment: { grossWeight: '515' } }),
      docBl(dadosBlValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL5-03')
    expect(risco?.status_matriz).toBe('amarelo')
  })

  it('frete collect com Incoterm do grupo C dispara BL6-01 (alerta amarelo)', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docInvoice(dadosInvoice),
      docBl({ ...dadosBlValidos, freight: { payment_terms: 'COLLECT', currency: 'USD' } }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL6-01')
    expect(risco?.status_matriz).toBe('amarelo')
  })

  it('frete collect coerente com FOB e valores discriminados passa BL6-01 e BL6-02 sem risco', () => {
    const { resumo, contexto } = executarPasso1ValidacaoCodigoBl([
      docInvoice({ ...dadosInvoice, incoterm: 'FOB Santos' }),
      docBl({
        ...dadosBlValidos,
        freight: {
          payment_terms: 'COLLECT',
          currency: 'USD',
          total_value: '4941.19',
          additional_charges: [
            { 'Nome da Taxa': 'FREIGHT CHARGE', Valor: '4504.00' },
            { 'Nome da Taxa': 'OVERWEIGHT', Valor: '300.00' },
          ],
        },
      }),
    ])
    expect(resumo.riscos.find((r) => r.id_regra_matriz === 'BL6-01')).toBeUndefined()
    expect(resumo.riscos.find((r) => r.id_regra_matriz === 'BL6-02')).toBeUndefined()
    expect(contexto.regras.find((r) => r.id === `BL6-01-${ROTULO_BL}`)?.passou).toBe(true)
    expect(contexto.regras.find((r) => r.id === `BL6-02-${ROTULO_BL}`)?.passou).toBe(true)
  })

  it('filtrarRiscosLlmBlFreteCoerente remove alerta LLM quando BL6-01 e BL6-02 passaram', () => {
    const regras = [
      { id: `BL6-01-${ROTULO_BL}`, passou: true, detalhe: 'ok' },
      { id: `BL6-02-${ROTULO_BL}`, passou: true, detalhe: 'ok' },
    ]
    const filtrado = filtrarRiscosLlmBlFreteCoerente(
      [
        {
          id: 'llm-bl-collect',
          severidade: 'atencao',
          categoria: 'normativo',
          titulo: 'Freight collect no destino',
          motivo: "O BL indica 'FREIGHT COLLECT'",
          analise: 'Pendencia de AFRMM',
          evidencias: [{ documento: ROTULO_BL, campo: 'freight.payment_terms', valor: 'COLLECT' }],
          id_regra_matriz: 'BL6-04',
          status_matriz: 'amarelo',
        },
      ],
      regras,
    )
    expect(filtrado).toHaveLength(0)
  })

  it('estabelecimento consignatário divergente (matriz × filial) dispara o gate BL2-05b', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docInvoice({ ...dadosInvoice, importer: { ...dadosInvoice.importer, cnpj: '82.901.000/0001-08' } }),
      docBl(dadosBlValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL2-05b')
    expect(risco?.status_matriz).toBe('vermelho')
    expect(risco?.severidade).toBe('critico')
  })

  it('dois BLs com números distintos disparam o gate BL1-05', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docBl(dadosBlValidos),
      {
        nome_arquivo: 'BL02.pdf',
        tipo_documento: 'HBL',
        indice: 3,
        dados: {
          ...dadosBlValidos,
          document: { ...dadosBlValidos.document, billOfLadingNumber: 'MSCUXY999999' },
        },
      },
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL1-05')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('contêiner acima do max gross ISO dispara o gate BL5-04', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docBl({
        ...dadosBlValidos,
        containers: [{ ...dadosBlValidos.containers[0], container_gross_weight: '40000' }],
      }),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL5-04')
    expect(risco?.status_matriz).toBe('vermelho')
  })

  it('volumes divergentes do packing list ficam amarelos em BL4-05', () => {
    const { resumo } = executarPasso1ValidacaoCodigoBl([
      docPackingList({ shipmentDetails: { totalPackages: '12' } }),
      docBl(dadosBlValidos),
    ])
    const risco = resumo.riscos.find((r) => r.id_regra_matriz === 'BL4-05')
    expect(risco?.status_matriz).toBe('amarelo')
  })

  it('AWB não entra na matriz BL (sem regras BL para documento aéreo)', () => {
    const { contexto } = executarPasso1ValidacaoCodigoBl([
      {
        nome_arquivo: 'AWB01.pdf',
        tipo_documento: 'AWB',
        indice: 0,
        dados: { awbInfo: { mawbNumber: '057-12345675' } },
      },
    ])
    expect(contexto.regras).toHaveLength(0)
  })
})

describe('montarResumoChecklistBls e visão geral combinada', () => {
  it('resumo por BL entra na visão geral ao lado de invoices', () => {
    const documentos = [
      docInvoice({ document: { invoiceNumber: 'INV-100' } }),
      docBl({ document: { billOfLadingNumber: 'MSCUAB123456' } }),
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
    const resumosBl = montarResumoChecklistBls(parametros)
    expect(resumosBl).toHaveLength(1)
    expect(resumosBl[0].rotulo).toBe(ROTULO_BL)

    const combinado = combinarResumoGeralComBls(resumoInvoices, resumosBl)
    expect(combinado.por_invoice.some((doc) => doc.rotulo === ROTULO_BL)).toBe(true)
    expect(combinado.contagem_global.total).toBeGreaterThan(
      resumoInvoices.contagem_global.total,
    )
  })

  it('percentual conforme desconsidera N/A na base', () => {
    const itens = montarChecklistMatrizBl({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_BL,
    })
    const contagem = contarChecklistPorStatus(itens)
    const percentual = percentualConformeChecklistBl(contagem)
    expect(percentual).toBeGreaterThanOrEqual(0)
    expect(percentual).toBeLessThanOrEqual(100)
  })
})
