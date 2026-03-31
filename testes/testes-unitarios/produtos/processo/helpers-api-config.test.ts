/**
 * helpers-api-config.test.ts — Testes para helpers inline, API functions e PRODUCT_CONFIG
 *
 * Cobre:
 *  1. Funções auxiliares de formatação (re-implementadas, pois são inline nos componentes)
 *  2. Funções de API do módulo shared/api.ts (com fetch mockado)
 *  3. PRODUCT_CONFIG do módulo shared/config.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getProcessos,
  getProcesso,
  createProcesso,
  updateProcesso,
  getFollowUps,
  createFollowUp,
  getDocumentos,
  uploadDocumento,
  deleteDocumento,
} from '../../../../produto/processo/client/src/shared/api'
import { PRODUCT_CONFIG } from '../../../../produto/processo/client/src/shared/config'

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Helper Functions (re-implemented — they are inline in page components)
// ═══════════════════════════════════════════════════════════════════════════════

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const usd = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(val)

const fmtPeso = (val: number) =>
  val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

const formatDateWorkflow = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getInitials = (nome: string) =>
  nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const formatDateEmail = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (isToday) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const formatFullDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Helper Tests ──────────────────────────────────────────────────────────────

describe('Helper: brl()', () => {
  it('formats a typical BRL value', () => {
    const result = brl(1234.56)
    expect(result).toContain('1.234,56')
    expect(result).toContain('R$')
  })

  it('formats zero', () => {
    const result = brl(0)
    expect(result).toContain('0,00')
  })

  it('formats negative values', () => {
    const result = brl(-500)
    expect(result).toContain('500,00')
  })

  it('formats very large numbers', () => {
    const result = brl(1_000_000_000.99)
    expect(result).toContain('1.000.000.000,99')
  })

  it('rounds fractional cents', () => {
    const result = brl(10.999)
    expect(result).toContain('11,00')
  })
})

describe('Helper: usd()', () => {
  it('formats a typical USD value in pt-BR locale', () => {
    const result = usd(1234.56)
    expect(result).toContain('1.234,56')
    expect(result).toContain('US$')
  })

  it('formats zero', () => {
    const result = usd(0)
    expect(result).toContain('0,00')
  })

  it('formats negative values', () => {
    const result = usd(-250.5)
    expect(result).toContain('250,50')
  })

  it('formats very small fractional values', () => {
    const result = usd(0.01)
    expect(result).toContain('0,01')
  })
})

describe('Helper: fmtPeso()', () => {
  it('formats weight with pt-BR locale', () => {
    expect(fmtPeso(1500.75)).toBe('1.500,75')
  })

  it('formats zero', () => {
    expect(fmtPeso(0)).toBe('0')
  })

  it('truncates beyond 2 decimals', () => {
    const result = fmtPeso(10.456)
    expect(result).toBe('10,46')
  })

  it('formats integer weights without decimals', () => {
    expect(fmtPeso(500)).toBe('500')
  })

  it('formats very large weights', () => {
    expect(fmtPeso(999999.99)).toBe('999.999,99')
  })
})

describe('Helper: fmtDate()', () => {
  it('formats ISO date to dd/mm/yy', () => {
    const result = fmtDate('2026-03-15T10:00:00Z')
    expect(result).toMatch(/15\/03\/26/)
  })

  it('handles beginning of year', () => {
    // Use midday to avoid timezone offset shifting to previous day
    const result = fmtDate('2026-01-01T12:00:00Z')
    expect(result).toMatch(/01\/01\/26/)
  })

  it('handles end of year', () => {
    const result = fmtDate('2025-12-31T23:59:59Z')
    // Depending on timezone offset, could be 31/12 or 01/01
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{2}/)
  })
})

describe('Helper: formatDateWorkflow() (WorkflowPage variant)', () => {
  it('produces same format as fmtDate', () => {
    const iso = '2026-06-20T14:30:00Z'
    expect(formatDateWorkflow(iso)).toBe(fmtDate(iso))
  })

  it('formats correctly for a known date', () => {
    const result = formatDateWorkflow('2026-03-30T12:00:00Z')
    expect(result).toMatch(/30\/03\/26/)
  })
})

describe('Helper: formatDateTime()', () => {
  it('includes day, month, hour and minute', () => {
    const result = formatDateTime('2026-03-15T14:30:00Z')
    expect(result).toMatch(/15\/03/)
    // Should contain time portion
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('handles midnight', () => {
    const result = formatDateTime('2026-01-01T00:00:00Z')
    expect(result).toMatch(/\d{2}\/\d{2}/)
  })
})

describe('Helper: getInitials()', () => {
  it('returns first two initials uppercase', () => {
    expect(getInitials('Maria Silva')).toBe('MS')
  })

  it('returns single initial for single name', () => {
    expect(getInitials('João')).toBe('J')
  })

  it('takes only first two parts for long names', () => {
    expect(getInitials('Ana Maria de Souza')).toBe('AM')
  })

  it('handles lowercase names', () => {
    expect(getInitials('carlos eduardo')).toBe('CE')
  })

  it('handles accented characters', () => {
    expect(getInitials('Ângela Érica')).toBe('ÂÉ')
  })
})

describe('Helper: formatDateEmail()', () => {
  it('returns time string for today dates', () => {
    const now = new Date()
    now.setHours(10, 30, 0, 0)
    const result = formatDateEmail(now.toISOString())
    expect(result).toMatch(/10:30/)
  })

  it('returns date string for non-today dates', () => {
    const result = formatDateEmail('2020-06-15T10:00:00Z')
    expect(result).toMatch(/15\/06\/20/)
  })

  it('returns dd/mm/yy for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const result = formatDateEmail(yesterday.toISOString())
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{2}/)
  })
})

describe('Helper: formatFullDate()', () => {
  it('includes month name, day, year, hour and minute', () => {
    const result = formatFullDate('2026-03-15T14:30:00Z')
    // pt-BR long month should include "março" (or timezone-adjusted)
    expect(result).toMatch(/\d{2}/)
    expect(result).toMatch(/\d{4}/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('uses long month name in pt-BR', () => {
    const result = formatFullDate('2026-01-10T08:00:00Z')
    // Should contain "janeiro" for January in pt-BR
    expect(result.toLowerCase()).toMatch(/janeiro/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. API Functions (shared/api.ts)
// ═══════════════════════════════════════════════════════════════════════════════

const TENANT_ID = 'tenant-abc'

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

function mockFetchError(status: number, body?: Record<string, unknown>) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(body ?? {}),
  })
}

function mockFetchErrorJsonFails(status: number) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.reject(new Error('parse error')),
  })
}

describe('API: getProcessos()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns array of processos on success', async () => {
    const data = [{ id: '1', numero: 'P-001' }]
    globalThis.fetch = mockFetchOk(data)
    const result = await getProcessos(TENANT_ID)
    expect(result).toEqual(data)
  })

  it('calls correct URL and headers', async () => {
    globalThis.fetch = mockFetchOk([])
    await getProcessos(TENANT_ID)
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/processos', {
      headers: expect.objectContaining({
        'x-tenant-id': TENANT_ID,
        'Content-Type': 'application/json',
      }),
    })
  })

  it('returns empty array on HTTP error', async () => {
    globalThis.fetch = mockFetchError(500)
    const result = await getProcessos(TENANT_ID)
    expect(result).toEqual([])
  })
})

describe('API: getProcesso()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns ProcessoDetail on success', async () => {
    const detail = { id: '1', numero: 'P-001', etapas: [] }
    globalThis.fetch = mockFetchOk(detail)
    const result = await getProcesso(TENANT_ID, '1')
    expect(result).toEqual(detail)
  })

  it('includes query param include=etapas,...', async () => {
    globalThis.fetch = mockFetchOk({})
    await getProcesso(TENANT_ID, 'abc')
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('/api/v1/processos/abc')
    expect(url).toContain('include=')
    expect(url).toContain('etapas')
    expect(url).toContain('documentos')
  })

  it('throws with server error message', async () => {
    globalThis.fetch = mockFetchError(404, { error: 'Processo not found' })
    await expect(getProcesso(TENANT_ID, 'bad')).rejects.toThrow('Processo not found')
  })

  it('throws with fallback message when json parse fails', async () => {
    globalThis.fetch = mockFetchErrorJsonFails(500)
    await expect(getProcesso(TENANT_ID, 'x')).rejects.toThrow('Erro 500 ao buscar processo')
  })
})

describe('API: createProcesso()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const input = {
    numero: 'P-100',
    importador_nome: 'ACME',
    importador_cnpj: '12345678000100',
    exportador_nome: 'ExportCo',
    exportador_pais: 'CN',
    valor_fob_total: 50000,
    moeda_fob: 'USD',
    peso_bruto_total: 1000,
  }

  it('sends POST with correct body and returns processo', async () => {
    const created = { id: '99', ...input }
    globalThis.fetch = mockFetchOk(created)
    const result = await createProcesso(TENANT_ID, input)
    expect(result).toEqual(created)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/processos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  })

  it('throws on error with server message', async () => {
    globalThis.fetch = mockFetchError(400, { error: 'Número duplicado' })
    await expect(createProcesso(TENANT_ID, input)).rejects.toThrow('Número duplicado')
  })

  it('throws fallback message when json parse fails', async () => {
    globalThis.fetch = mockFetchErrorJsonFails(422)
    await expect(createProcesso(TENANT_ID, input)).rejects.toThrow('Erro 422 ao criar processo')
  })
})

describe('API: updateProcesso()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends PATCH and returns updated processo', async () => {
    const updated = { id: '1', status: 'em_andamento' }
    globalThis.fetch = mockFetchOk(updated)
    const result = await updateProcesso(TENANT_ID, '1', { observacoes: 'test' })
    expect(result).toEqual(updated)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/processos/1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('throws on error', async () => {
    globalThis.fetch = mockFetchError(403, { error: 'Forbidden' })
    await expect(updateProcesso(TENANT_ID, '1', {})).rejects.toThrow('Forbidden')
  })

  it('throws fallback on json parse failure', async () => {
    globalThis.fetch = mockFetchErrorJsonFails(500)
    await expect(updateProcesso(TENANT_ID, '1', {})).rejects.toThrow(
      'Erro 500 ao atualizar processo',
    )
  })
})

describe('API: getFollowUps()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns follow-ups on success without filters', async () => {
    const data = [{ id: 'f1' }]
    globalThis.fetch = mockFetchOk(data)
    const result = await getFollowUps(TENANT_ID, 'p1')
    expect(result).toEqual(data)
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toBe('/api/v1/processos/p1/follow-ups')
  })

  it('appends tipo filter as query param', async () => {
    globalThis.fetch = mockFetchOk([])
    await getFollowUps(TENANT_ID, 'p1', { tipo: 'comentario' })
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('tipo=comentario')
  })

  it('appends categoria filter as query param', async () => {
    globalThis.fetch = mockFetchOk([])
    await getFollowUps(TENANT_ID, 'p1', { categoria: 'financeiro' })
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('categoria=financeiro')
  })

  it('appends both filters', async () => {
    globalThis.fetch = mockFetchOk([])
    await getFollowUps(TENANT_ID, 'p1', { tipo: 'email', categoria: 'geral' })
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('tipo=email')
    expect(url).toContain('categoria=geral')
  })

  it('returns empty array on error', async () => {
    globalThis.fetch = mockFetchError(500)
    const result = await getFollowUps(TENANT_ID, 'p1')
    expect(result).toEqual([])
  })
})

describe('API: createFollowUp()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const input = {
    tipo: 'comentario' as const,
    categoria: 'geral' as const,
    titulo: 'Nota importante',
    descricao: 'Detalhe aqui',
  }

  it('sends POST and returns follow-up', async () => {
    const created = { id: 'f99', ...input }
    globalThis.fetch = mockFetchOk(created)
    const result = await createFollowUp(TENANT_ID, 'p1', input)
    expect(result).toEqual(created)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/processos/p1/follow-ups',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    )
  })

  it('throws on error with server message', async () => {
    globalThis.fetch = mockFetchError(400, { error: 'Título obrigatório' })
    await expect(createFollowUp(TENANT_ID, 'p1', input)).rejects.toThrow('Título obrigatório')
  })

  it('throws fallback when json parse fails', async () => {
    globalThis.fetch = mockFetchErrorJsonFails(500)
    await expect(createFollowUp(TENANT_ID, 'p1', input)).rejects.toThrow(
      'Erro 500 ao criar follow-up',
    )
  })
})

describe('API: getDocumentos()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns documents on success', async () => {
    const data = [{ id: 'd1', nome: 'Invoice.pdf' }]
    globalThis.fetch = mockFetchOk(data)
    const result = await getDocumentos(TENANT_ID, 'p1')
    expect(result).toEqual(data)
  })

  it('calls correct URL', async () => {
    globalThis.fetch = mockFetchOk([])
    await getDocumentos(TENANT_ID, 'p1')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/processos/p1/documentos',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-tenant-id': TENANT_ID }),
      }),
    )
  })

  it('returns empty array on error', async () => {
    globalThis.fetch = mockFetchError(500)
    const result = await getDocumentos(TENANT_ID, 'p1')
    expect(result).toEqual([])
  })
})

describe('API: uploadDocumento()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends POST with FormData and returns document', async () => {
    const doc = { id: 'd99', nome: 'BL.pdf' }
    globalThis.fetch = mockFetchOk(doc)

    const file = new File(['content'], 'BL.pdf', { type: 'application/pdf' })
    const input = { tipo: 'bl' as const, nome: 'BL.pdf', arquivo: file }
    const result = await uploadDocumento(TENANT_ID, 'p1', input)

    expect(result).toEqual(doc)
    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(callArgs[0]).toBe('/api/v1/processos/p1/documentos')
    expect(callArgs[1].method).toBe('POST')
    expect(callArgs[1].body).toBeInstanceOf(FormData)
    // Should NOT have Content-Type (browser sets multipart boundary)
    expect(callArgs[1].headers['Content-Type']).toBeUndefined()
  })

  it('appends observacoes when provided', async () => {
    globalThis.fetch = mockFetchOk({ id: 'd1' })
    const file = new File(['x'], 'test.pdf')
    const input = {
      tipo: 'invoice' as const,
      nome: 'Invoice.pdf',
      arquivo: file,
      observacoes: 'Nota fiscal',
    }
    await uploadDocumento(TENANT_ID, 'p1', input)
    const body = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
      .body as FormData
    expect(body.get('observacoes')).toBe('Nota fiscal')
  })

  it('throws on error with server message', async () => {
    globalThis.fetch = mockFetchError(413, { error: 'Arquivo muito grande' })
    const file = new File(['x'], 'big.pdf')
    await expect(
      uploadDocumento(TENANT_ID, 'p1', { tipo: 'outros' as const, nome: 'big.pdf', arquivo: file }),
    ).rejects.toThrow('Arquivo muito grande')
  })

  it('throws fallback when json parse fails', async () => {
    globalThis.fetch = mockFetchErrorJsonFails(500)
    const file = new File(['x'], 'f.pdf')
    await expect(
      uploadDocumento(TENANT_ID, 'p1', { tipo: 'outros' as const, nome: 'f.pdf', arquivo: file }),
    ).rejects.toThrow('Erro 500 ao enviar documento')
  })
})

describe('API: deleteDocumento()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends DELETE and resolves on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
    await expect(deleteDocumento(TENANT_ID, 'd1')).resolves.toBeUndefined()
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/v1/documentos/d1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('throws on error with server message', async () => {
    globalThis.fetch = mockFetchError(404, { error: 'Documento não encontrado' })
    await expect(deleteDocumento(TENANT_ID, 'd1')).rejects.toThrow('Documento não encontrado')
  })

  it('throws fallback when json parse fails', async () => {
    globalThis.fetch = mockFetchErrorJsonFails(403)
    await expect(deleteDocumento(TENANT_ID, 'd1')).rejects.toThrow(
      'Erro 403 ao excluir documento',
    )
  })
})

describe('API: headers include x-internal-key', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends x-internal-key from env or fallback', async () => {
    globalThis.fetch = mockFetchOk([])
    await getProcessos(TENANT_ID)
    const headers = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
      .headers as Record<string, string>
    // Should be either the env value or 'dev-key' fallback
    expect(headers['x-internal-key']).toBeDefined()
    expect(typeof headers['x-internal-key']).toBe('string')
    expect(headers['x-internal-key'].length).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PRODUCT_CONFIG (shared/config.ts)
// ═══════════════════════════════════════════════════════════════════════════════

describe('PRODUCT_CONFIG: identity', () => {
  it('has id "processo"', () => {
    expect(PRODUCT_CONFIG.id).toBe('processo')
  })

  it('has productId "processo"', () => {
    expect(PRODUCT_CONFIG.productId).toBe('processo')
  })

  it('has name "Processo"', () => {
    expect(PRODUCT_CONFIG.name).toBe('Processo')
  })

  it('has port 8025', () => {
    expect(PRODUCT_CONFIG.port).toBe(8025)
  })
})

describe('PRODUCT_CONFIG: tenantServices', () => {
  it('has exactly 9 tenant services', () => {
    expect(PRODUCT_CONFIG.tenantServices).toHaveLength(9)
  })

  it.each([
    'atividades',
    'dashboard',
    'relatorios',
    'historico',
    'notificacoes',
    'gabi',
    'email',
    'whatsapp',
  ])('includes tenant service "%s"', (svc) => {
    expect(PRODUCT_CONFIG.tenantServices).toContain(svc)
  })
})

describe('PRODUCT_CONFIG: productServices', () => {
  it('has exactly 4 product services', () => {
    expect(PRODUCT_CONFIG.productServices).toHaveLength(4)
  })

  it.each([
    'workflow-engine',
    'follow-up-tracker',
    'documento-manager',
    'custo-estimator',
  ])('includes product service "%s"', (svc) => {
    expect(PRODUCT_CONFIG.productServices).toContain(svc)
  })
})

describe('PRODUCT_CONFIG: navigation', () => {
  it('has exactly 13 navigation items', () => {
    expect(PRODUCT_CONFIG.navigation).toHaveLength(13)
  })

  it('every item has id, label, icon, and source', () => {
    for (const item of PRODUCT_CONFIG.navigation) {
      expect(item.id).toBeDefined()
      expect(typeof item.id).toBe('string')
      expect(item.label).toBeDefined()
      expect(typeof item.label).toBe('string')
      expect(item.icon).toBeDefined()
      expect(typeof item.icon).toBe('string')
      expect(['product', 'tenant']).toContain(item.source)
    }
  })

  it('has 11 product-source items', () => {
    const productItems = PRODUCT_CONFIG.navigation.filter((n) => n.source === 'product')
    expect(productItems).toHaveLength(11)
  })

  it('has 2 tenant-source items', () => {
    const tenantItems = PRODUCT_CONFIG.navigation.filter((n) => n.source === 'tenant')
    expect(tenantItems).toHaveLength(2)
  })

  it('first item is workflow', () => {
    expect(PRODUCT_CONFIG.navigation[0].id).toBe('workflow')
    expect(PRODUCT_CONFIG.navigation[0].source).toBe('product')
  })

  it('last two items are tenant services (email, todo)', () => {
    const nav = PRODUCT_CONFIG.navigation
    expect(nav[nav.length - 2].id).toBe('email')
    expect(nav[nav.length - 2].source).toBe('tenant')
    expect(nav[nav.length - 1].id).toBe('todo')
    expect(nav[nav.length - 1].source).toBe('tenant')
  })

  it('all navigation ids are unique', () => {
    const ids = PRODUCT_CONFIG.navigation.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each([
    ['workflow', 'Workflow', 'flow-arrow', 'product'],
    ['pedidos', 'Pedidos', 'package', 'product'],
    ['li', 'LI', 'file-text', 'product'],
    ['di', 'DI', 'file-dashed', 'product'],
    ['duimp', 'DUIMP', 'cloud-arrow-up', 'product'],
    ['retificacao', 'Retificação', 'pencil-line', 'product'],
    ['financeiro', 'Financeiro', 'currency-dollar', 'product'],
    ['containers', 'Containers', 'cube', 'product'],
    ['dados-tecnicos', 'Dados Técnicos', 'gear-six', 'product'],
    ['dados-processo', 'Dados do Processo', 'clipboard-text', 'product'],
    ['taxas', 'Taxas', 'receipt', 'product'],
    ['email', 'Email', 'envelope', 'tenant'],
    ['todo', 'To Do', 'check-square', 'tenant'],
  ] as const)('nav item "%s" has label="%s", icon="%s", source="%s"', (id, label, icon, source) => {
    const item = PRODUCT_CONFIG.navigation.find((n) => n.id === id)
    expect(item).toBeDefined()
    expect(item!.label).toBe(label)
    expect(item!.icon).toBe(icon)
    expect(item!.source).toBe(source)
  })
})

describe('PRODUCT_CONFIG: features', () => {
  it('has workflow_automation set to active', () => {
    expect(PRODUCT_CONFIG.features.workflow_automation).toBe('active')
  })

  it('has followup_tracking enabled', () => {
    expect(PRODUCT_CONFIG.features.followup_tracking).toBe(true)
  })

  it('has documento_upload enabled', () => {
    expect(PRODUCT_CONFIG.features.documento_upload).toBe(true)
  })

  it('has custo_estimativa enabled', () => {
    expect(PRODUCT_CONFIG.features.custo_estimativa).toBe(true)
  })

  it('has email_integration enabled', () => {
    expect(PRODUCT_CONFIG.features.email_integration).toBe(true)
  })

  it('has all 5 feature flags', () => {
    const keys = Object.keys(PRODUCT_CONFIG.features)
    expect(keys).toHaveLength(5)
  })
})
