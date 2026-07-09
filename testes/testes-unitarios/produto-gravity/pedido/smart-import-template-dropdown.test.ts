// @vitest-environment node
// TST-UNIT-PEDIDO-TEMPLATE-DROPDOWN — templateHandler dropdowns dinamicos + NCM validation
// Cobre: (1) S2S fetch de Cadastros para popular dropdowns de Moeda/Unidade,
// (2) aba oculta _Listas com Named Ranges, (3) degradacao graciosa quando
// Cadastros offline, (4) data validation NCM 8 digitos.
// Tipo de modulo: rota Express (Tipo 6).
/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ExcelJS from 'exceljs'

function mockFetchCadastrosVazio() {
  const resposta = { ok: true, json: async () => ({ itens: [] as unknown[] }) }
  return vi.fn()
    .mockResolvedValueOnce(resposta)
    .mockResolvedValueOnce(resposta)
    .mockResolvedValueOnce(resposta)
    .mockResolvedValueOnce(resposta)
}

function mockFetchCadastrosMoedaUnidade(
  moedas: unknown[] = [],
  unidades: unknown[] = [],
) {
  const respostaVazia = { ok: true, json: async () => ({ itens: [] as unknown[] }) }
  return vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ itens: moedas }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ itens: unidades }) })
    .mockResolvedValueOnce(respostaVazia)
    .mockResolvedValueOnce(respostaVazia)
}

// ─── Mocks hoisted ──────────────────────────────────────────────────────────

vi.mock('../../../servicos-global/produto/pedido/server/src/errors/AppError.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode: number, code: string) {
      super(message)
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/services/smartImportService.js', () => ({
  criarSmartImportService: vi.fn(),
  SmartImportService: vi.fn(),
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/services/mapeamentoMemoriaService.js', () => ({
  MapeamentoMemoriaService: vi.fn(),
}))

vi.mock('../../../servicos-global/produto/pedido/shared/smart-import-schemas.js', () => ({
  smartImportPreviewSchema: { parse: vi.fn() },
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(),
}))

import { templateHandler } from '../../../../servicos-global/produto/pedido/server/src/routes/importacoes-inteligentes-pedido.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function criarMockRes() {
  const chunks: Buffer[] = []
  const mockRes = {
    set: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    end: vi.fn(),
    send: vi.fn((data?: Buffer | string | ArrayBuffer) => {
      if (data) {
        if (Buffer.isBuffer(data)) chunks.push(data)
        else if (data instanceof ArrayBuffer) chunks.push(Buffer.from(data))
        else chunks.push(Buffer.from(data))
      }
    }),
    json: vi.fn(),
    _chunks: chunks,
    headersSent: false,
  }
  return mockRes
}

function criarMockReq() {
  return {} as import('express').Request
}

async function executarTemplateHandler(): Promise<{ res: ReturnType<typeof criarMockRes>; wb: ExcelJS.Workbook }> {
  const req = criarMockReq()
  const res = criarMockRes()
  let next = vi.fn()

  await new Promise<void>((resolve, reject) => {
    res.send = vi.fn((data?: Buffer | string | ArrayBuffer) => {
      if (data) {
        if (Buffer.isBuffer(data)) res._chunks.push(data)
        else if (data instanceof ArrayBuffer) res._chunks.push(Buffer.from(data))
        else res._chunks.push(Buffer.from(String(data)))
      }
      resolve()
    }) as ReturnType<typeof vi.fn>
    next = vi.fn((err?: unknown) => {
      if (err) reject(err instanceof Error ? err : new Error(String(err)))
    })
    templateHandler(req as import('express').Request, res as unknown as import('express').Response, next)
  })

  const wb = new ExcelJS.Workbook()
  const buffer = Buffer.concat(res._chunks)
  await wb.xlsx.load(buffer)
  return { res, wb }
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
  process.env.CADASTROS_URL = 'http://localhost:8031'
  process.env.CHAVE_INTERNA_SERVICO = 'test-key'
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.CADASTROS_URL
  delete process.env.CHAVE_INTERNA_SERVICO
})

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('templateHandler — dropdowns dinamicos S2S Cadastros', () => {
  it('faz fetch S2S para /moedas e /unidades com header x-internal-key correto', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ itens: [{ codigo_moeda: 'USD', nome_moeda: 'Dólar dos Estados Unidos' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ itens: [{ codigo_unidade: 'KG', nome_unidade: 'Quilograma' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ itens: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ itens: [] }) })
    vi.stubGlobal('fetch', mockFetch)

    await executarTemplateHandler()

    expect(mockFetch).toHaveBeenCalledTimes(4)
    const [urlMoedas, optsMoedas] = mockFetch.mock.calls[0]
    expect(urlMoedas).toBe('http://localhost:8031/api/v1/cadastros/moedas?apenas_ativas=true')
    expect(optsMoedas.headers['x-internal-key']).toBe('test-key')

    const [urlUnidades, optsUnidades] = mockFetch.mock.calls[1]
    expect(urlUnidades).toBe('http://localhost:8031/api/v1/cadastros/unidades?apenas_ativas=true')
    expect(optsUnidades.headers['x-internal-key']).toBe('test-key')
  })

  it('cria aba oculta _Listas com "CODIGO — Nome" quando Cadastros retorna moedas', async () => {
    const moedas = [
      { codigo_moeda: 'USD', nome_moeda: 'Dólar dos Estados Unidos' },
      { codigo_moeda: 'EUR', nome_moeda: 'Euro' },
      { codigo_moeda: 'BRL', nome_moeda: 'Real Brasileiro' },
    ]
    vi.stubGlobal('fetch', mockFetchCadastrosMoedaUnidade(moedas))

    const { wb } = await executarTemplateHandler()

    const wsListas = wb.getWorksheet('_Listas')
    expect(wsListas).toBeDefined()
    expect(wsListas!.state).toBe('veryHidden')

    const valoresCol1 = []
    for (let i = 1; i <= 3; i++) {
      valoresCol1.push(wsListas!.getCell(i, 1).value)
    }
    expect(valoresCol1).toEqual([
      'USD — Dólar dos Estados Unidos',
      'EUR — Euro',
      'BRL — Real Brasileiro',
    ])
  })

  it('cria aba _Listas com "CODIGO — Nome" de unidade na coluna seguinte a moeda', async () => {
    const moedas   = [{ codigo_moeda: 'USD', nome_moeda: 'Dólar dos Estados Unidos' }, { codigo_moeda: 'EUR', nome_moeda: 'Euro' }]
    const unidades = [{ codigo_unidade: 'KG', nome_unidade: 'Quilograma' }, { codigo_unidade: 'UN', nome_unidade: 'Unidade' }, { codigo_unidade: 'TON', nome_unidade: 'Tonelada' }]
    vi.stubGlobal('fetch', mockFetchCadastrosMoedaUnidade(moedas, unidades))

    const { wb } = await executarTemplateHandler()

    const wsListas = wb.getWorksheet('_Listas')
    expect(wsListas).toBeDefined()

    const valoresCol2 = []
    for (let i = 1; i <= 3; i++) {
      valoresCol2.push(wsListas!.getCell(i, 2).value)
    }
    expect(valoresCol2).toEqual(['KG — Quilograma', 'UN — Unidade', 'TON — Tonelada'])
  })

  it('aplica data validation tipo list nas colunas de moeda do template', async () => {
    const moedas = [{ codigo_moeda: 'USD', nome_moeda: 'Dólar dos Estados Unidos' }, { codigo_moeda: 'EUR', nome_moeda: 'Euro' }]
    vi.stubGlobal('fetch', mockFetchCadastrosMoedaUnidade(moedas))

    const { wb } = await executarTemplateHandler()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!

    // moeda_item vem antes na zona ESSENCIAL e agora tem bloqueio PEDIDO (custom) — usar Moeda do Pedido
    let colMoeda = -1
    ws.getRow(2).eachCell((cell, colNumber) => {
      const val = typeof cell.value === 'string' ? cell.value.replace(/^\* /, '') : ''
      if (val === 'Moeda do Pedido' && colMoeda === -1) colMoeda = colNumber
    })

    if (colMoeda > 0) {
      const cellValidation = ws.getCell(3, colMoeda).dataValidation
      expect(cellValidation).toBeDefined()
      expect(cellValidation!.type).toBe('list')
      expect(cellValidation!.formulae![0]).toContain('_Listas')
    }
  })
})

describe('templateHandler — degradacao graciosa (Cadastros offline)', () => {
  it('gera template sem dropdowns quando Cadastros retorna erro HTTP', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 }))

    const { wb } = await executarTemplateHandler()

    const wsListas = wb.getWorksheet('_Listas')
    expect(wsListas).toBeUndefined()
    expect(warnSpy).toHaveBeenCalled()
    const warnings = warnSpy.mock.calls.map(c => String(c[0]))
    expect(warnings.some(w => w.includes('dropdown de moeda omitido'))).toBe(true)

    warnSpy.mockRestore()
  })

  it('gera template sem dropdowns quando fetch lanca excecao (rede)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))

    const { wb } = await executarTemplateHandler()

    const wsListas = wb.getWorksheet('_Listas')
    expect(wsListas).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Cadastros offline'),
      expect.any(String),
    )

    warnSpy.mockRestore()
  })

  it('gera template valido (xlsx parseavel) mesmo sem Cadastros', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { wb } = await executarTemplateHandler()

    expect(wb.worksheets.length).toBeGreaterThanOrEqual(1)
    const ws = wb.worksheets[0]
    expect(ws.rowCount).toBeGreaterThanOrEqual(2)

    vi.restoreAllMocks()
  })
})

describe('templateHandler — data validation NCM', () => {
  it('aplica data validation custom em colunas de NCM com validacao 8 digitos (sem bloqueio PEDIDO)', async () => {
    vi.stubGlobal('fetch', mockFetchCadastrosVazio())

    const { wb } = await executarTemplateHandler()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!

    let colNcm = -1
    ws.getRow(2).eachCell((cell, colNumber) => {
      const val = typeof cell.value === 'string' ? cell.value : ''
      if (val.replace(/^\* /, '') === 'NCM' && colNcm === -1) {
        colNcm = colNumber
      }
    })

    expect(colNcm).toBeGreaterThan(0)
    const cellValidation = ws.getCell(3, colNcm).dataValidation
    expect(cellValidation).toBeDefined()
    expect(cellValidation!.type).toBe('custom')
    expect(cellValidation!.errorStyle).toBe('stop')
    expect(cellValidation!.errorTitle).toBe('Formato NCM invalido')
    expect(cellValidation!.formulae![0]).toContain('SUBSTITUTE')
    expect(cellValidation!.formulae![0]).not.toContain('PEDIDO')
  })
})

describe('templateHandler — bloqueio de celulas por tipo de linha (P15)', () => {
  async function gerarTemplate() {
    vi.stubGlobal('fetch', mockFetchCadastrosVazio())
    return executarTemplateHandler()
  }

  function encontrarColuna(ws: ExcelJS.Worksheet, campo: string): number {
    let col = -1
    ws.getRow(2).eachCell((cell, colNumber) => {
      const val = typeof cell.value === 'string' ? cell.value : ''
      const campoMap: Record<string, string> = {
        'numero_pedido': 'Numero do Pedido',
        'valor_total_pedido': 'Valor Total do Pedido',
        'part_number_item': 'Part Number',
        'descricao_item': 'Descricao do Item',
        'quantidade_inicial_item': 'Qtd. Inicial',
        'incoterm_item': 'Incoterm (Item)',
        'moeda_item': 'Moeda do Item',
        'valor_total_item': 'Valor Total do Item',
        'unidade_comercializada_item': 'Unidade Comercializada do Item',
        'unidade_comercializada_pedido': 'Unidade Comercializada do Pedido',
        'tipo_volume_pedido': 'Tipo Volume Pedido',
        'moeda_pedido': 'Moeda do Pedido',
        'incoterm_pedido': 'Incoterm',
        'referencia_importador_pedido': 'Referencia Importador',
        'referencia_exportador_pedido': 'Referencia Exportador',
        'tipo_operacao_pedido': 'Tipo de Operacao',
        'ncm_item': 'NCM',
      }
      const rotulo = campoMap[campo]
      if (rotulo && val.replace(/^\* /, '') === rotulo && col === -1) {
        col = colNumber
      }
    })
    return col
  }

  it('bloqueia numero_pedido em linhas ITEM (formula contem <>ITEM)', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    const col = encontrarColuna(ws, 'numero_pedido')
    expect(col).toBeGreaterThan(0)
    const v = ws.getCell(3, col).dataValidation
    expect(v).toBeDefined()
    expect(v!.type).toBe('custom')
    expect(v!.errorStyle).toBe('stop')
    expect(v!.formulae![0]).toContain('"ITEM"')
    expect(v!.errorTitle).toBe('Campo exclusivo de PEDIDO')
  })

  it('bloqueia valor_total_pedido em linhas ITEM', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    const col = encontrarColuna(ws, 'valor_total_pedido')
    expect(col).toBeGreaterThan(0)
    const v = ws.getCell(3, col).dataValidation
    expect(v).toBeDefined()
    expect(v!.formulae![0]).toContain('"ITEM"')
  })

  it('bloqueia part_number_item em linhas PEDIDO (formula contem <>PEDIDO)', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    const col = encontrarColuna(ws, 'part_number_item')
    expect(col).toBeGreaterThan(0)
    const v = ws.getCell(3, col).dataValidation
    expect(v).toBeDefined()
    expect(v!.type).toBe('custom')
    expect(v!.errorStyle).toBe('stop')
    expect(v!.formulae![0]).toContain('"PEDIDO"')
    expect(v!.errorTitle).toBe('Campo exclusivo de ITEM')
  })

  it('bloqueia descricao_item e quantidade_inicial_item em linhas PEDIDO', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    for (const campo of ['descricao_item', 'quantidade_inicial_item']) {
      const col = encontrarColuna(ws, campo)
      expect(col).toBeGreaterThan(0)
      const v = ws.getCell(3, col).dataValidation
      expect(v).toBeDefined()
      expect(v!.formulae![0]).toContain('"PEDIDO"')
    }
  })

  it('bloqueia campos item essenciais em linhas PEDIDO (P15.1)', async () => {
    vi.stubGlobal('fetch', mockFetchCadastrosMoedaUnidade(
      [{ codigo_moeda: 'USD', nome_moeda: 'Dolar' }],
      [{ codigo_unidade: 'KG', nome_unidade: 'Quilograma' }],
    ))
    const { wb } = await executarTemplateHandler()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    for (const campo of ['incoterm_item', 'valor_total_item']) {
      const col = encontrarColuna(ws, campo)
      expect(col).toBeGreaterThan(0)
      const v = ws.getCell(3, col).dataValidation
      expect(v).toBeDefined()
      expect(v!.type).toBe('custom')
      expect(v!.formulae![0]).toContain('"PEDIDO"')
      expect(v!.errorTitle).toBe('Campo exclusivo de ITEM')
    }
    const colMoeda = encontrarColuna(ws, 'moeda_item')
    expect(colMoeda).toBeGreaterThan(0)
    expect(ws.getCell(3, colMoeda).dataValidation?.type).toBe('list')
    const colUnidade = encontrarColuna(ws, 'unidade_comercializada_item')
    expect(colUnidade).toBeGreaterThan(0)
    expect(ws.getCell(3, colUnidade).dataValidation?.type).toBe('list')
  })

  it('bloqueia pares propagaveis *_pedido em linhas ITEM (P15.2)', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    for (const campo of ['incoterm_pedido', 'tipo_operacao_pedido']) {
      const col = encontrarColuna(ws, campo)
      expect(col).toBeGreaterThan(0)
      const v = ws.getCell(4, col).dataValidation
      if (campo === 'tipo_operacao_pedido') {
        expect(v?.type).toBe('list')
      } else {
        expect(v).toBeDefined()
        expect(v!.type).toBe('custom')
        expect(v!.formulae![0]).toContain('"ITEM"')
        expect(v!.errorTitle).toBe('Campo exclusivo de PEDIDO')
      }
    }
  })

  it('P15.3: NCM liberado na linha PEDIDO e refs pedido livres na ITEM', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    const colNcm = encontrarColuna(ws, 'ncm_item')
    expect(colNcm).toBeGreaterThan(0)
    const vNcmPedido = ws.getCell(3, colNcm).dataValidation
    expect(vNcmPedido?.formulae?.[0]).not.toContain('"PEDIDO"')

    for (const campo of ['referencia_importador_pedido', 'referencia_exportador_pedido']) {
      const col = encontrarColuna(ws, campo)
      expect(col).toBeGreaterThan(0)
      const vItem = ws.getCell(4, col).dataValidation
      expect(vItem?.errorTitle).not.toBe('Campo exclusivo de PEDIDO')
    }
  })

  it('P15.3: preserva select tipo_operacao_pedido e dropdown unidade_comercializada_item na linha PEDIDO', async () => {
    vi.stubGlobal('fetch', mockFetchCadastrosMoedaUnidade(
      [{ codigo_moeda: 'USD', nome_moeda: 'Dolar' }],
      [{ codigo_unidade: 'KG', nome_unidade: 'Quilograma' }],
    ))
    const { wb } = await executarTemplateHandler()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    const colTipo = encontrarColuna(ws, 'tipo_operacao_pedido')
    const colUnidade = encontrarColuna(ws, 'unidade_comercializada_item')
    expect(colTipo).toBeGreaterThan(0)
    expect(colUnidade).toBeGreaterThan(0)
    expect(ws.getCell(3, colTipo).dataValidation?.type).toBe('list')
    expect(ws.getCell(3, colUnidade).dataValidation?.type).toBe('list')
  })

  it('aplica bloqueio em todas as linhas de dados (row 3 a 1002)', async () => {
    const { wb } = await gerarTemplate()
    const ws = wb.worksheets.find(s => s.name !== '_Listas')!
    const col = encontrarColuna(ws, 'part_number_item')
    expect(col).toBeGreaterThan(0)
    const v3    = ws.getCell(3, col).dataValidation
    const v500  = ws.getCell(500, col).dataValidation
    const v1002 = ws.getCell(1002, col).dataValidation
    expect(v3).toBeDefined()
    expect(v500).toBeDefined()
    expect(v1002).toBeDefined()
    expect(v3!.formulae![0]).toContain('"PEDIDO"')
    expect(v500!.formulae![0]).toContain('"PEDIDO"')
    expect(v1002!.formulae![0]).toContain('"PEDIDO"')
  })
})
