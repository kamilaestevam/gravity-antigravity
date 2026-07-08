import { describe, expect, it } from 'vitest'
import {
  contarChecklistPorStatus,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
  normalizarResultadoChecklist,
  vereditoSecaoChecklist,
} from '../../../../servicos-global/produto/smart-read/shared/montar-checklist-matriz-invoice-smart-read'
import { MATRIZ_VALIDACAO_INVOICE } from '../../../../servicos-global/produto/smart-read/shared/matriz-validacao-invoice-smart-read'

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
    expect(s402?.status).toBe('conforme')
    expect(s402?.resultado).toContain('PCI FN OSP')
    expect(s403?.status).toBe('conforme')
    expect(s403?.resultado).toContain('PCI FN OSP')
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
})
