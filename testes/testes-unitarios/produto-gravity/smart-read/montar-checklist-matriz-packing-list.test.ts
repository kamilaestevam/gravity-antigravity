import { describe, expect, it } from 'vitest'
import {
  GATES_CRITICOS_MATRIZ_PACKING_LIST,
  GATES_MATRIZ_PACKING_LIST,
  MATRIZ_VALIDACAO_PACKING_LIST,
  classificacaoPorFaixaScorePackingList,
  classificacaoRiscoPackingList,
} from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-packing-list-smart-read'
import {
  calcularScoreChecklistPackingList,
  combinarResumoGeralComPackingLists,
  montarChecklistMatrizPackingList,
  montarResumoChecklistPackingLists,
  percentualConformeChecklistPackingList,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-packing-list-smart-read'
import {
  contarChecklistPorStatus,
  montarResumoGeralChecklistInvoices,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import {
  executarPasso1ValidacaoCodigoPackingList,
  validarContainerIso6346,
} from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-packing-list-smart-read'

const ROTULO_PL = 'PACKING01.pdf · PACKING_LIST'

function docPackingList(dados: Record<string, unknown>) {
  return {
    nome_arquivo: 'PACKING01.pdf',
    tipo_documento: 'PACKING_LIST',
    indice: 1,
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

describe('matriz de validação do packing list (SSOT)', () => {
  it('tem 74 regras, 72 avaliáveis e 2 agregadores (P9-05/P9-06)', () => {
    expect(MATRIZ_VALIDACAO_PACKING_LIST).toHaveLength(74)
    const agregadores = MATRIZ_VALIDACAO_PACKING_LIST.filter((r) => r.severidade === null)
    expect(agregadores.map((r) => r.id)).toEqual(['P9-05', 'P9-06'])
  })

  it('gates são exatamente as regras BLOQ listadas no P9-06', () => {
    expect([...GATES_MATRIZ_PACKING_LIST].sort()).toEqual(
      ['P1-06', 'P3-03', 'P3-08', 'P3-09', 'P4-08', 'P5-03', 'P5-06', 'P6-03', 'P6-04', 'P7-06', 'P7-08', 'P8-02', 'P8-12'].sort(),
    )
    for (const gate of GATES_CRITICOS_MATRIZ_PACKING_LIST) {
      expect(GATES_MATRIZ_PACKING_LIST).toContain(gate)
    }
  })

  it('classificação por faixa de score segue os cortes 95/80/60', () => {
    expect(classificacaoPorFaixaScorePackingList(100)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScorePackingList(95)).toBe('baixo_risco')
    expect(classificacaoPorFaixaScorePackingList(94)).toBe('atencao')
    expect(classificacaoPorFaixaScorePackingList(80)).toBe('atencao')
    expect(classificacaoPorFaixaScorePackingList(79)).toBe('alto_risco')
    expect(classificacaoPorFaixaScorePackingList(60)).toBe('alto_risco')
    expect(classificacaoPorFaixaScorePackingList(59)).toBe('critico')
  })

  it('gate falho rebaixa a classificação independentemente do score', () => {
    expect(classificacaoRiscoPackingList(100, [])).toBe('baixo_risco')
    expect(classificacaoRiscoPackingList(100, ['P3-08'])).toBe('alto_risco')
    expect(classificacaoRiscoPackingList(100, ['P3-08', 'P4-08'])).toBe('critico')
    // Gates críticos isolados (P6-04 itens ausentes / P5-06 divergência com o BL) ⇒ Crítico
    expect(classificacaoRiscoPackingList(100, ['P6-04'])).toBe('critico')
    expect(classificacaoRiscoPackingList(100, ['P5-06'])).toBe('critico')
    // Score na faixa crítica permanece crítico mesmo com um único gate comum
    expect(classificacaoRiscoPackingList(40, ['P3-08'])).toBe('critico')
  })
})

describe('montarChecklistMatrizPackingList', () => {
  it('gera uma entrada por regra da matriz, incluindo os agregadores', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: false,
      carregando: true,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_PACKING_LIST.length)
    expect(itens.some((i) => i.regra.id === 'P9-05')).toBe(true)
    expect(itens.some((i) => i.regra.id === 'P9-06')).toBe(true)
  })

  it('regras ficam pendentes enquanto a análise roda', () => {
    const itens = montarChecklistMatrizPackingList({
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

  it('regra de código com falha do Passo 1 fica vermelha', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [{ id: `P5-01-${ROTULO_PL}`, passou: false, detalhe: 'Peso líquido não declarado no romaneio' }],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const p501 = itens.find((i) => i.regra.id === 'P5-01')
    expect(p501?.status).toBe('vermelho')
    expect(p501?.rotulo_status).toBe('FALHA')
  })

  it('risco emitido pelo motor prevalece e carrega o risco_id', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [{ id: `P5-03-${ROTULO_PL}`, passou: true, detalhe: 'ok' }],
      riscos: [
        {
          id: 'risco-pl-1',
          titulo: 'Peso bruto menor que o líquido',
          motivo: 'Gross 100 kg < Net 150 kg',
          analise: 'fisicamente impossível',
          severidade: 'critico',
          categoria: 'matematico',
          evidencias: [{ documento: ROTULO_PL, campo: 'packageSummary.totalGrossWeight', valor: '100' }],
          id_regra_matriz: 'P5-03',
          status_matriz: 'vermelho',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const p503 = itens.find((i) => i.regra.id === 'P5-03')
    expect(p503?.status).toBe('vermelho')
    expect(p503?.risco_id).toBe('risco-pl-1')
  })

  it('detalhe N/A do motor vira status N/A (não conta como conforme)', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [{ id: `P5-06-${ROTULO_PL}`, passou: true, detalhe: 'N/A — conhecimento (BL/AWB) não presente na leitura para cruzar' }],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const p506 = itens.find((i) => i.regra.id === 'P5-06')
    expect(p506?.status).toBe('na')
    expect(p506?.rotulo_status).toBe('N/A')
  })

  it('regra COND sem gatilho fica N/A após o pipeline', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const p607 = itens.find((i) => i.regra.id === 'P6-07')
    expect(p607?.regra.severidade).toBe('cond')
    expect(p607?.status).toBe('na')
  })

  it('regra de IA fica pendente com o Analista desligado', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const p201 = itens.find((i) => i.regra.id === 'P2-01')
    expect(p201?.regra.motor).toBe('llm')
    expect(p201?.status).toBe('pendente')
    expect(p201?.detalhe).toContain('Analista IA desligado')
  })

  it('filtra regras do motor por documento (dois packing lists na leitura)', () => {
    const rotuloB = 'PACKING02.pdf · PACKING_LIST'
    const itens = montarChecklistMatrizPackingList({
      regras: [
        { id: `P4-01-${ROTULO_PL}`, passou: true, detalhe: '10 volume(s) declarados' },
        { id: `P4-01-${rotuloB}`, passou: false, detalhe: 'Total de volumes não declarado no romaneio' },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const p401 = itens.find((i) => i.regra.id === 'P4-01')
    expect(p401?.status).toBe('verde')
    expect(p401?.detalhe).toContain('10 volume(s)')
  })
})

describe('calcularScoreChecklistPackingList (P9-05) e classificação (P9-06)', () => {
  it('score usa só regras ALERTA aplicáveis: verde=1, amarelo=0,5, vermelho=0', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [
        { id: `P4-01-${ROTULO_PL}`, passou: true, detalhe: '10 volume(s) declarados' },
        { id: `P5-01-${ROTULO_PL}`, passou: false, detalhe: 'Aviso — peso líquido só no total, sem abertura por item' },
        { id: `P5-02-${ROTULO_PL}`, passou: false, detalhe: 'Peso bruto não declarado no romaneio' },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const score = calcularScoreChecklistPackingList(itens, true)
    // Base = 3 (demais ALERTA ficaram N/A ou pendente e saem da base)
    expect(score.base_alerta).toBe(3)
    expect(score.score).toBe(50) // (1 + 0,5 + 0) / 3
    expect(score.pendente).toBe(true) // regras LLM seguem pendentes (IA desligada)
  })

  it('gate vermelho entra em gates_falhos e rebaixa a classificação', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [
        { id: `P4-01-${ROTULO_PL}`, passou: true, detalhe: '10 volume(s) declarados' },
        { id: `P6-04-${ROTULO_PL}`, passou: false, detalhe: '2 item(ns) da invoice ausentes no romaneio' },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const score = calcularScoreChecklistPackingList(itens, true)
    expect(score.gates_falhos).toContain('P6-04')
    expect(score.classificacao).toBe('critico')
  })

  it('sem base ALERTA o score é 100 e sem gates a classificação é baixo risco', () => {
    const score = calcularScoreChecklistPackingList([], true)
    expect(score.score).toBe(100)
    expect(score.base_alerta).toBe(0)
    expect(score.classificacao).toBe('baixo_risco')
  })

  it('agregadores P9-05/P9-06 refletem o score no próprio checklist', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [{ id: `P4-01-${ROTULO_PL}`, passou: true, detalhe: '10 volume(s) declarados' }],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: false,
      carregando: true,
      rotulo_documento: ROTULO_PL,
    })
    const p905 = itens.find((i) => i.regra.id === 'P9-05')
    const p906 = itens.find((i) => i.regra.id === 'P9-06')
    expect(p905?.status).toBe('pendente')
    expect(p905?.resultado).toBe('Calculando…')
    expect(p906?.status).toBe('pendente')
  })
})

describe('percentual conforme e resumo agregado', () => {
  it('N/A fica fora da base do percentual (não infla o "100% conforme")', () => {
    const contagem = { verde: 2, amarelo: 0, vermelho: 0, pendente: 0, na: 8, total: 10 }
    expect(percentualConformeChecklistPackingList(contagem)).toBe(100)
    const soNa = { verde: 0, amarelo: 0, vermelho: 0, pendente: 0, na: 10, total: 10 }
    expect(percentualConformeChecklistPackingList(soNa)).toBe(0)
  })

  it('combinarResumoGeralComPackingLists soma PLs à visão "Todas"', () => {
    const invoice = docInvoice({ document: { invoiceNumber: 'INV-1' } })
    const packing = docPackingList({ document: { invoiceNumber: 'INV-1' } })
    const params = {
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      documentos: [invoice, packing],
    }
    const resumoInvoices = montarResumoGeralChecklistInvoices(params)
    const resumosPl = montarResumoChecklistPackingLists(params)
    expect(resumosPl).toHaveLength(1)

    const combinado = combinarResumoGeralComPackingLists(resumoInvoices, resumosPl)
    expect(combinado.total_invoices).toBe(2)
    expect(combinado.por_invoice).toHaveLength(2)
    expect(combinado.contagem_global.total).toBe(
      resumoInvoices.contagem_global.total + resumosPl[0].contagem.total,
    )
    // Sem PLs, retorna o resumo original intacto
    expect(combinarResumoGeralComPackingLists(resumoInvoices, [])).toBe(resumoInvoices)
  })
})

describe('executarPasso1ValidacaoCodigoPackingList (motor Código + Cross-Doc)', () => {
  it('valida contêiner ISO 6346 com dígito verificador', () => {
    expect(validarContainerIso6346('MSKU9070323')).toBe(true) // dígito 3 correto
    expect(validarContainerIso6346('MSKU9070324')).toBe(false)
    expect(validarContainerIso6346('ABC1234567')).toBe(false)
  })

  it('romaneio consistente com a invoice passa nas regras determinísticas', () => {
    const invoice = docInvoice({
      document: { invoiceNumber: 'INV-100', issueDate: '2024-06-01' },
      importer: { name: 'IMPORTADORA GRAVITY LTDA', cnpj: '11.444.777/0001-61' },
      weights: { grossWeight: '1000', netWeight: '900' },
      packageSummary: { totalPackages: '10' },
      items: [{ partNumber: 'PN-1', description: 'WIDGET X', itemQuantity: '100' }],
    })
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100', date: '2024-06-02' },
      importer: { name: 'IMPORTADORA GRAVITY LTDA' },
      packageSummary: {
        totalPackages: '10',
        totalNetWeight: '900',
        totalGrossWeight: '1000',
        totalCubicMeasurement: '12',
      },
      items: [
        {
          partNumber: 'PN-1',
          productDescription: 'WIDGET X',
          totalProductQuantity: '100',
          package: { unitQuantity: '10', unitNetWeight: '90', unitGrossWeight: '100', type: 'CARTON' },
        },
      ],
    })
    const { resumo, contexto } = executarPasso1ValidacaoCodigoPackingList([invoice, packing])

    const porId = new Map(contexto.regras.map((r) => [r.id, r]))
    expect(porId.get(`P1-03-${ROTULO_PL}`)?.passou).toBe(true)
    expect(porId.get(`P2-02-${ROTULO_PL}`)?.passou).toBe(true)
    expect(porId.get(`P4-01-${ROTULO_PL}`)?.passou).toBe(true)
    expect(porId.get(`P4-06-${ROTULO_PL}`)?.passou).toBe(true)
    expect(porId.get(`P5-03-${ROTULO_PL}`)?.passou).toBe(true)
    expect(porId.get(`P5-05-${ROTULO_PL}`)?.passou).toBe(true)
    expect(porId.get(`P6-04-${ROTULO_PL}`)?.passou).toBe(true)
    expect(resumo.riscos.filter((r) => r.status_matriz === 'vermelho')).toHaveLength(0)
  })

  it('detecta gross < net (P5-03) e volumes divergentes da invoice (P4-06)', () => {
    const invoice = docInvoice({
      document: { invoiceNumber: 'INV-100' },
      packageSummary: { totalPackages: '12' },
    })
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      packageSummary: { totalPackages: '10', totalNetWeight: '1500', totalGrossWeight: '1000' },
    })
    const { resumo } = executarPasso1ValidacaoCodigoPackingList([invoice, packing])
    const ids = resumo.riscos.map((r) => r.id_regra_matriz)
    expect(ids).toContain('P5-03')
    expect(ids).toContain('P4-06')
    const p503 = resumo.riscos.find((r) => r.id_regra_matriz === 'P5-03')
    expect(p503?.status_matriz).toBe('vermelho') // BLOQ ⇒ gate
    expect(p503?.severidade).toBe('critico')
  })

  it('detecta item da invoice ausente no romaneio (P6-04, gate crítico)', () => {
    const invoice = docInvoice({
      document: { invoiceNumber: 'INV-100' },
      items: [
        { partNumber: 'PN-1', itemQuantity: '10' },
        { partNumber: 'PN-2', itemQuantity: '5' },
      ],
    })
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      items: [{ partNumber: 'PN-1', totalProductQuantity: '10' }],
    })
    const { resumo } = executarPasso1ValidacaoCodigoPackingList([invoice, packing])
    const p604 = resumo.riscos.find((r) => r.id_regra_matriz === 'P6-04')
    expect(p604?.status_matriz).toBe('vermelho')
    expect(p604?.motivo).toContain('PN 2')
  })

  it('quantidade por item divergente da invoice dispara P6-03', () => {
    const invoice = docInvoice({
      document: { invoiceNumber: 'INV-100' },
      items: [{ partNumber: 'PN-1', itemQuantity: '100' }],
    })
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      items: [{ partNumber: 'PN-1', totalProductQuantity: '90' }],
    })
    const { resumo } = executarPasso1ValidacaoCodigoPackingList([invoice, packing])
    const p603 = resumo.riscos.find((r) => r.id_regra_matriz === 'P6-03')
    expect(p603?.status_matriz).toBe('vermelho')
  })

  it('peso bruto acima do payload do contêiner dispara P3-09', () => {
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      containerNumbers: ['MSKU9070323'],
      packageSummary: { totalGrossWeight: '30000', totalNetWeight: '29000' },
    })
    const { resumo } = executarPasso1ValidacaoCodigoPackingList([packing])
    const p309 = resumo.riscos.find((r) => r.id_regra_matriz === 'P3-09')
    expect(p309?.status_matriz).toBe('vermelho')
  })

  it('divergência acima de 5% com o conhecimento dispara o gate P5-06', () => {
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      packageSummary: { totalGrossWeight: '1100', totalNetWeight: '1000' },
    })
    const bl = {
      nome_arquivo: 'BL01.pdf',
      tipo_documento: 'BL',
      indice: 2,
      dados: { weights: { grossWeight: '1000' } },
    }
    const { resumo } = executarPasso1ValidacaoCodigoPackingList([packing, bl])
    const p506 = resumo.riscos.find((r) => r.id_regra_matriz === 'P5-06')
    expect(p506?.status_matriz).toBe('vermelho') // 10% > teto de 5%
  })

  it('sem invoice e sem referência, P1-03 vira N/A em vez de falhar', () => {
    const packing = docPackingList({ packageSummary: { totalPackages: '5' } })
    const { contexto } = executarPasso1ValidacaoCodigoPackingList([packing])
    const p103 = contexto.regras.find((r) => r.id === `P1-03-${ROTULO_PL}`)
    expect(p103?.passou).toBe(true)
    expect(p103?.detalhe).toContain('N/A')
  })

  it('NCM sujeito a anuência gera Aviso (amarelo) sem card de risco', () => {
    const invoice = docInvoice({
      document: { invoiceNumber: 'INV-100' },
      items: [{ partNumber: 'PN-1', ncm: '85171231', itemQuantity: '10' }],
    })
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      items: [{ partNumber: 'PN-1', totalProductQuantity: '10' }],
    })
    const { resumo, contexto } = executarPasso1ValidacaoCodigoPackingList([invoice, packing])
    const p806 = contexto.regras.find((r) => r.id === `P8-06-${ROTULO_PL}`)
    expect(p806?.passou).toBe(false)
    expect(p806?.detalhe).toContain('Aviso —')
    expect(p806?.detalhe).toContain('ANATEL')
    expect(resumo.riscos.some((r) => r.id_regra_matriz === 'P8-06')).toBe(false)

    // No checklist, o Aviso vira ATENÇÃO (amarelo), não FALHA
    const itens = montarChecklistMatrizPackingList({
      regras: contexto.regras,
      riscos: resumo.riscos,
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const item806 = itens.find((i) => i.regra.id === 'P8-06')
    expect(item806?.status).toBe('amarelo')
  })

  it('dois romaneios com a mesma referência e pesos divergentes disparam P1-06', () => {
    const plA = docPackingList({
      document: { invoiceNumber: 'INV-100' },
      packageSummary: { totalGrossWeight: '1000' },
    })
    const plB = {
      nome_arquivo: 'PACKING02.pdf',
      tipo_documento: 'PACKING_LIST',
      indice: 2,
      dados: {
        document: { invoiceNumber: 'INV-100' },
        packageSummary: { totalGrossWeight: '1200' },
      },
    }
    const { resumo } = executarPasso1ValidacaoCodigoPackingList([plA, plB])
    const p106 = resumo.riscos.filter((r) => r.id_regra_matriz === 'P1-06')
    expect(p106.length).toBeGreaterThan(0)
    expect(p106[0].status_matriz).toBe('vermelho')
  })

  it('contagem do checklist alimentado pelo Passo 1 não fica 100% N/A', () => {
    const invoice = docInvoice({
      document: { invoiceNumber: 'INV-100' },
      packageSummary: { totalPackages: '10' },
    })
    const packing = docPackingList({
      document: { invoiceNumber: 'INV-100', date: '2024-06-02' },
      packageSummary: { totalPackages: '10', totalNetWeight: '900', totalGrossWeight: '1000' },
    })
    const { resumo, contexto } = executarPasso1ValidacaoCodigoPackingList([invoice, packing])
    const itens = montarChecklistMatrizPackingList({
      regras: contexto.regras,
      riscos: resumo.riscos,
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: ROTULO_PL,
    })
    const contagem = contarChecklistPorStatus(itens)
    expect(contagem.verde).toBeGreaterThan(0)
    expect(contagem.na).toBeLessThan(contagem.total)
  })

  it('modo instantâneo exibe prévia amarela sem spinner (P3-04)', () => {
    const itens = montarChecklistMatrizPackingList({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      fase_enriquecimento_analise: 'llm',
      rotulo_documento: ROTULO_PL,
    })
    const p304 = itens.find((i) => i.regra.id === 'P3-04')
    expect(p304?.status).toBe('amarelo')
    expect(p304?.em_analise).toBe(false)
    expect(p304?.detalhe).toContain('Prévia local')
    expect(p304?.resultado).toContain('Prévia local')
  })
})
