import { describe, expect, it } from 'vitest'
import {
  contarChecklistPorStatus,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
  normalizarResultadoChecklist,
  vereditoSecaoChecklist,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import { MATRIZ_VALIDACAO_INVOICE } from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-invoice-smart-read'
import { executarPasso1ValidacaoCodigoInvoice } from '../../../../servicos-global/produto/smart-read/shared/passo-1-validacao-codigo-invoice-smart-read'

describe('montarChecklistMatrizInvoice', () => {
  it('gera uma entrada por regra da matriz SSOT', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: false,
      carregando: true,
    })
    expect(itens).toHaveLength(MATRIZ_VALIDACAO_INVOICE.length)
  })

  it('itens em análise expõem em_analise=true enquanto o motor roda e false ao concluir', () => {
    const rodando = montarChecklistMatrizInvoice({
      regras: [],
      riscos: [],
      pipelineConcluido: false,
      llmHabilitado: true,
      carregando: true,
    })
    expect(rodando.some((i) => i.em_analise)).toBe(true)
    expect(rodando.filter((i) => i.regra.motor === 'llm').every((i) => i.em_analise)).toBe(true)

    const concluido = montarChecklistMatrizInvoice({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
    })
    expect(concluido.every((i) => !i.em_analise)).toBe(true)
  })

  it('falha do servidor degrada regras IA para ATENÇÃO sem spinner eterno', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      analise_servidor_indisponivel: true,
      documentos: [
        {
          nome_arquivo: 'INV.pdf',
          tipo_documento: 'INVOICE',
          indice: 0,
          dados: {
            importer: { name: 'Intelbras S/A' },
          },
        },
      ],
      rotulo_documento: 'INV.pdf · INVOICE',
    })
    const s203 = itens.find((i) => i.regra.id === 'S2-03')
    expect(s203?.status).toBe('amarelo')
    expect(s203?.rotulo_status).toBe('ATENÇÃO')
    expect(s203?.em_analise).toBe(false)
    expect(s203?.detalhe).toContain('Analista IA indisponível')
  })

  it('marca regra de código como vermelha quando Passo 1 falha e gera risco_id', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [{ id: 'S4-04-INVOICE-items-0', passou: false, detalhe: 'NCM ausente' }],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
    })
    const s404 = itens.find((i) => i.regra.id === 'S4-04')
    expect(s404?.status).toBe('vermelho')
    expect(s404?.rotulo_status).toBe('FALHA')
    expect(s404?.resultado).toContain('NCM ausente')
    expect(s404?.risco_id).toBe('risco-matriz-S4-04-INVOICE-items-0')
  })

  it('matriz SSOT tem 35 regras invoice', () => {
    expect(MATRIZ_VALIDACAO_INVOICE).toHaveLength(35)
  })

  it('extrai resultado legível de detalhe com prefixo', () => {
    expect(normalizarResultadoChecklist('Número: ISA-002034', 'verde')).toBe('ISA-002034')
    expect(normalizarResultadoChecklist(null, 'pendente')).toBe('—')
  })

  it('veredito da seção reflete o pior status', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [{ id: 'S1-01-INV', passou: true, detalhe: 'Número: X' }],
      riscos: [
        {
          id: 'r1',
          titulo: 'Data',
          motivo: 'Data futura',
          analise: 'x',
          severidade: 'atencao',
          categoria: 'documental',
          evidencias: [{ documento: 'INV', campo: 'date', valor: '2024-06-19' }],
          id_regra_matriz: 'S1-02',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
    })
    const secao1 = itens.filter((i) => i.regra.secao === 'identificacao')
    expect(vereditoSecaoChecklist(secao1)).toBe('ATENÇÃO')
  })

  it('prioriza risco sobre regra passou quando id_regra_matriz coincide', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [{ id: 'S4-04-INVOICE', passou: true, detalhe: 'ok' }],
      riscos: [
        {
          id: 'r1',
          titulo: 'NCM inválido',
          motivo: 'NCM com 5 dígitos',
          analise: 'Mercosul exige 8 dígitos',
          severidade: 'critico',
          categoria: 'ncm',
          evidencias: [],
          id_regra_matriz: 'S4-04',
          status_matriz: 'vermelho',
        },
      ],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
    })
    const s404 = itens.find((i) => i.regra.id === 'S4-04')
    expect(s404?.status).toBe('vermelho')
    expect(s404?.risco_id).toBe('r1')
  })

  it('regras LLM sem dado extraído ficam N/A após pipeline', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
    })
    const s403 = itens.find((i) => i.regra.id === 'S4-03')
    expect(s403?.status).toBe('na')
    expect(s403?.rotulo_status).toBe('N/A')
  })

  it('S4-02 e S4-03 usam descrição em inglês na linha para classificação', () => {
    const doc = {
      nome_arquivo: 'INVOICE77.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: {
        items: [
          {
            partNumber: '1080936',
            english: 'PCI FN OSP 1L PORTEIRO IPR1010MI 4610135/5',
            itemQuantity: '10000',
          },
        ],
      },
    }
    const itens = montarChecklistMatrizInvoice({
      documentos: [doc],
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: 'INVOICE77.pdf · INVOICE',
    })
    const s402 = itens.find((i) => i.regra.id === 'S4-02')
    const s403 = itens.find((i) => i.regra.id === 'S4-03')
    expect(s402?.status).toBe('verde')
    expect(s402?.rotulo_status).toBe('CONFORME')
    expect(s402?.resultado).toContain('PCI FN OSP')
    expect(s403?.status).toBe('verde')
    expect(s403?.rotulo_status).toBe('CONFORME')
    expect(s403?.resultado).toContain('PCI FN OSP')
    // Regressão: status inválido ('conforme') gerava rotulo_status undefined e quebrava a tela
    for (const item of itens) {
      expect(['CONFORME', 'ATENÇÃO', 'FALHA', 'PENDENTE', 'N/A']).toContain(item.rotulo_status)
    }
  })

  it('regra de código com detalhe N/A não infla veredito como pendente', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [{ id: 'S1-04-INV', passou: true, detalhe: 'N/A — paginação ausente no documento' }],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
    })
    const s104 = itens.find((i) => i.regra.id === 'S1-04')
    expect(s104?.status).toBe('na')
    expect(vereditoSecaoChecklist(itens.filter((i) => i.regra.secao === 'identificacao'))).toBe(
      'CONFORME',
    )
  })

  it('filtra checklist por invoice sem merge de resultados', () => {
    const rotuloA = 'inv-a.pdf · INVOICE'
    const rotuloB = 'inv-b.pdf · INVOICE'
    const itensA = montarChecklistMatrizInvoice({
      regras: [
        { id: `S1-01-${rotuloA}`, passou: true, detalhe: 'Número: AAA' },
        { id: `S1-01-${rotuloB}`, passou: true, detalhe: 'Número: BBB' },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: rotuloA,
    })
    const s101 = itensA.find((i) => i.regra.id === 'S1-01')
    expect(s101?.resultado).toBe('AAA')
    expect(s101?.resultado).not.toContain('BBB')
  })

  it('regras de código validadas no Passo 1 não ficam PENDENTE quando o dado confere', () => {
    const doc = {
      nome_arquivo: 'INVOICE77.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: {
        document: { invoiceNumber: 'ISA-002036', issueDate: '2024-06-19', incoterm: 'EXW' },
        importer: { cnpj: '11.444.777/0001-61' },
        currency: { type: 'USD' },
        values: { totalDocumentValue: '1600.00' },
        weights: { grossWeight: '177.47', netWeight: '153.67' },
        items: [
          {
            partNumber: '1080936',
            english: 'PCI FN OSP 1L PORTEIRO',
            itemQuantity: '10000',
            itemUnitPriceWithCurrency: '0.16',
            itemTotalPriceWithCurrency: '1600.00',
            unit: 'PC',
            itemCurrency: 'USD',
          },
        ],
      },
    }
    const rotulo = 'INVOICE77.pdf · INVOICE'
    const passo1 = executarPasso1ValidacaoCodigoInvoice([doc])
    const itens = montarChecklistMatrizInvoice({
      documentos: [doc],
      regras: passo1.contexto.regras,
      riscos: passo1.resumo.riscos,
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: rotulo,
    })

    const porId = new Map(itens.map((i) => [i.regra.id, i]))
    expect(porId.get('S4-01')?.rotulo_status).toBe('CONFORME')
    expect(porId.get('S4-01')?.resultado).toContain('1/1')
    expect(porId.get('S5-02')?.rotulo_status).toBe('CONFORME')
    expect(porId.get('S5-02')?.resultado).toContain('USD')
    expect(porId.get('S5-03')?.rotulo_status).toBe('CONFORME')
    expect(porId.get('S5-04')?.rotulo_status).toBe('CONFORME')
    expect(porId.get('S5-04')?.resultado).toContain('1600')
    expect(porId.get('S7-01')?.rotulo_status).toBe('CONFORME')
    // Sem dado para a regra → N/A explícito em vez de pendente eterno
    expect(porId.get('S5-06')?.rotulo_status).toBe('N/A')
    expect(porId.get('S6-02')?.rotulo_status).toBe('N/A')
    expect(porId.get('S7-02')?.rotulo_status).toBe('N/A')
  })

  it('moedas divergentes entre linhas e totais geram risco de unicidade cambial (S5-02)', () => {
    const doc = {
      nome_arquivo: 'inv.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: {
        document: { invoiceNumber: 'X1', incoterm: 'FOB' },
        currency: { type: 'USD' },
        items: [{ itemCurrency: 'EUR', itemQuantity: '1', itemTotalPriceWithCurrency: '10' }],
      },
    }
    const passo1 = executarPasso1ValidacaoCodigoInvoice([doc])
    expect(passo1.resumo.riscos.some((r) => r.id_regra_matriz === 'S5-02')).toBe(true)
    const regraS502 = passo1.contexto.regras.find((r) => r.id.startsWith('S5-02-'))
    expect(regraS502?.passou).toBe(false)
  })

  it('mensagens de IA não usam «Aguardando IA» genérico quando o Analista está desligado', () => {
    const doc = {
      nome_arquivo: 'inv.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: { exporter: { name: 'LUEN TAI P.C.B. FACTORY CO., LTD.' } },
    }
    const itens = montarChecklistMatrizInvoice({
      documentos: [doc],
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: 'inv.pdf · INVOICE',
    })
    const s205 = itens.find((i) => i.regra.id === 'S2-05')
    expect(s205?.rotulo_status).toBe('PENDENTE')
    expect(s205?.resultado).toContain('LUEN TAI')
    expect(s205?.detalhe).toContain('Analista IA desligado')
  })

  it('regra de IA com dado extraído e Analista ligado sem apontamento fica CONFORME', () => {
    const doc = {
      nome_arquivo: 'inv.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: {
        exporter: { name: 'LUEN TAI P.C.B. FACTORY CO., LTD.', address: 'Unit 5, Kowloon, HK' },
      },
    }
    const itens = montarChecklistMatrizInvoice({
      documentos: [doc],
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: false,
      rotulo_documento: 'inv.pdf · INVOICE',
    })
    const s205 = itens.find((i) => i.regra.id === 'S2-05')
    expect(s205?.status).toBe('verde')
    expect(s205?.rotulo_status).toBe('CONFORME')
    expect(s205?.resultado).toContain('LUEN TAI')
    const s207 = itens.find((i) => i.regra.id === 'S2-07')
    expect(s207?.rotulo_status).toBe('N/A')
  })

  it('falha nossa na consulta RFB vira ATENÇÃO sem card de risco (Aviso —)', () => {
    const rotulo = 'inv.pdf · INVOICE'
    const itens = montarChecklistMatrizInvoice({
      regras: [
        {
          id: `S2-02-${rotulo}`,
          passou: false,
          detalhe: 'Aviso — não conseguimos consultar a Receita Federal agora. Reprocesse a leitura para tentar de novo — 82901000001522',
        },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
      rotulo_documento: rotulo,
    })
    const s202 = itens.find((i) => i.regra.id === 'S2-02')
    expect(s202?.status).toBe('amarelo')
    expect(s202?.rotulo_status).toBe('ATENÇÃO')
    expect(s202?.risco_id).toBeNull()
    expect(s202?.resultado).toContain('não conseguimos consultar a Receita')
  })

  it('monta resumo geral agregando invoices', () => {
    const docA = {
      nome_arquivo: 'a.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: { document: { invoiceNumber: 'A1' } },
    }
    const docB = {
      nome_arquivo: 'b.pdf',
      tipo_documento: 'INVOICE',
      indice: 0,
      dados: { document: { invoiceNumber: 'B1' } },
    }
    const rotuloA = 'a.pdf · INVOICE'
    const rotuloB = 'b.pdf · INVOICE'
    const resumo = montarResumoGeralChecklistInvoices({
      documentos: [docA, docB],
      regras: [
        { id: `S1-01-${rotuloA}`, passou: true, detalhe: 'Número: A1' },
        { id: `S1-01-${rotuloB}`, passou: false, detalhe: 'Número da invoice ausente' },
      ],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: false,
      carregando: false,
    })
    expect(resumo.total_invoices).toBe(2)
    expect(resumo.contagem_global.total).toBe(MATRIZ_VALIDACAO_INVOICE.length * 2)
    expect(resumo.por_invoice).toHaveLength(2)
  })

  it('modo instantâneo exibe prévia amarela sem spinner em regras IA/API', () => {
    const itens = montarChecklistMatrizInvoice({
      regras: [],
      riscos: [],
      pipelineConcluido: true,
      llmHabilitado: true,
      carregando: true,
      enriquecimento_ia_em_andamento: true,
      documentos: [
        {
          nome_arquivo: 'INV.pdf',
          tipo_documento: 'INVOICE',
          indice: 0,
          dados: {
            importer: { name: 'Intelbras S/A', cnpj: '82.901.000/0001-27' },
          },
        },
      ],
      rotulo_documento: 'INV.pdf · INVOICE',
      cnpj_oficial: {
        cnpj: '82901000000127',
        razao_social: 'Intelbras S.A.',
        nome_fantasia: null,
        situacao_cadastral: 'ATIVA',
        ativo: true,
        logradouro: 'Rua X',
        numero: '100',
        complemento: null,
        bairro: 'Centro',
        municipio: 'São José',
        uf: 'SC',
        cep: '88101000',
        fonte: 'brasilapi_rfb',
      },
    })
    const s203 = itens.find((i) => i.regra.id === 'S2-03')
    const s202 = itens.find((i) => i.regra.id === 'S2-02')
    expect(s203?.status).toBe('verde')
    expect(s203?.em_analise).toBe(false)
    expect(s203?.detalhe).toContain('Prévia local')
    expect(s202?.status).toBe('amarelo')
    expect(s202?.em_analise).toBe(false)
    expect(itens.filter((i) => i.regra.motor === 'llm').every((i) => !i.em_analise)).toBe(true)
  })
})
