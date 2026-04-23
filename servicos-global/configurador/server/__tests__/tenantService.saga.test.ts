// server/__tests__/tenantService.saga.test.ts
// Testes de integração da saga de onboarding (Fase 3 PASSO 06 DDD).
//
// Simula via mock de `fetch` e `prisma` os 4 cenários que a saga precisa cobrir:
//  (A) Cadastros OK  + TX local OK      → suid gravado, sem compensação
//  (B) Cadastros 4xx                    → zero escrita local, erro propaga
//  (C) Cadastros OK  + TX local falha   → compensação chamada, erro propaga
//  (D) Cadastros OK  + TX falha + comp. falha → dead-letter log + erro propaga
//
// Mock é 100% in-memory: nenhuma rede, nenhum banco real.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Prisma mock — sobrescreve o stub minimalista do setup.ts adicionando
// os modelos usados pelo tenantService (organizacao, usuario, ...).
const prismaMock = {
  organizacao: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  usuario: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  assinaturaProdutoGravity: {
    create: vi.fn(),
  },
  empresa: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}
vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }))

// Logger — capturamos error para verificar dead-letter.
const loggerChild = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
vi.mock('../lib/logger.js', () => ({
  logger: { child: () => loggerChild },
}))

// Global fetch — simulamos as respostas de Cadastros.
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// ─── Helpers ────────────────────────────────────────────────────────────────

const INPUT_BASE = {
  name: 'Empresa Teste',
  slug: 'empresa-teste',
  clerkUserId: 'clerk_user_123',
  owner: { email: 'owner@teste.com', name: 'Owner' },
  cnpj: '12.345.678/0001-99',
  pais: 'BR' as const,
  correlationId: 'corr-test-abc',
}

function empresaResponse(suid: string, idOrganizacao: string) {
  return {
    suid,
    id_organizacao: idOrganizacao,
    nome_empresa: 'Empresa Teste',
    cnpj: '12.345.678/0001-99',
    tin: null,
    pais: 'BR',
    estado: null,
    cidade: null,
    endereco: null,
    zipcode: null,
    email: null,
    telefone: null,
    whatsapp: null,
    pode_ser_importador: true,
    pode_ser_exportador: false,
    pode_ser_fabricante: false,
    pode_ser_agente: false,
    pode_ser_despachante: false,
    pode_ser_armador: false,
    ativo: true,
    criado_em: '2026-04-22T00:00:00.000Z',
    atualizado_em: '2026-04-22T00:00:00.000Z',
  }
}

function jsonResponse(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('tenantService.createTenant — saga Cadastros-primeiro', () => {
  let tenantService: typeof import('../services/tenantService.js')['tenantService']

  beforeEach(async () => {
    vi.clearAllMocks()
    // Import dinâmico APÓS os mocks — garante que o módulo receba os stubs.
    const mod = await import('../services/tenantService.js')
    tenantService = mod.tenantService

    // Pré-checks default: sem conflito de slug nem de clerk_user_id.
    prismaMock.organizacao.findUnique.mockResolvedValue(null)
    prismaMock.usuario.findFirst.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('(A) Cadastros OK + TX local OK → suid gravado, sem compensação', async () => {
    const suid = 'BR-EMPRESATESTE-00001'
    // fetch #1: POST /empresas → 201
    fetchMock.mockResolvedValueOnce(jsonResponse(empresaResponse(suid, 'will-be-overwritten'))) // suid vem por empresaSchema

    // $transaction executa a callback com um tx = prismaMock (mesmo shape)
    prismaMock.$transaction.mockImplementation(async (cb: (tx: typeof prismaMock) => unknown) => {
      prismaMock.organizacao.create.mockResolvedValueOnce({
        id: 'new-id',
        name: INPUT_BASE.name,
        slug: INPUT_BASE.slug,
        suid_empresa: suid,
      })
      prismaMock.usuario.create.mockResolvedValueOnce({ id: 'user-id' })
      prismaMock.assinaturaProdutoGravity.create.mockResolvedValueOnce({ id: 'sub-id' })
      prismaMock.empresa.create.mockResolvedValueOnce({ id: 'empresa-id' })
      return cb(prismaMock)
    })

    const tenant = await tenantService.createTenant({ ...INPUT_BASE })

    // Fetch chamado apenas uma vez (cria empresa — SEM compensação)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/empresas$/)
    expect(init?.method).toBe('POST')
    const headers = init?.headers as Record<string, string>
    expect(headers['x-internal-key']).toBe('test-internal-key')
    expect(headers['x-correlation-id']).toBe('corr-test-abc')

    // Prisma escreveu localmente
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(prismaMock.organizacao.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.organizacao.create.mock.calls[0][0].data.suid_empresa).toBe(suid)
    expect(prismaMock.usuario.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.assinaturaProdutoGravity.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.empresa.create).toHaveBeenCalledTimes(1)

    expect(tenant.suid_empresa).toBe(suid)
  })

  it('(B) Cadastros 4xx → zero escrita local, erro propaga, sem compensação', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('CNPJ duplicado', { status: 409 }),
    )

    await expect(tenantService.createTenant({ ...INPUT_BASE })).rejects.toThrow(
      /Cadastros rejeitou/,
    )

    // Nenhuma transação local iniciada
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(prismaMock.organizacao.create).not.toHaveBeenCalled()

    // Apenas o POST /empresas → NENHUMA compensação
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('(C) Cadastros OK + TX local falha → compensação chamada + erro propaga', async () => {
    const suid = 'BR-EMPRESATESTE-00042'

    // fetch #1: POST /empresas → 201
    fetchMock.mockResolvedValueOnce(jsonResponse(empresaResponse(suid, 'irrelevant')))
    // fetch #2: DELETE /empresas/:suid/compensacao → 204
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    // Transação local falha (ex: conflito de constraint ao criar Usuario)
    prismaMock.$transaction.mockRejectedValueOnce(new Error('deadlock simulado'))

    await expect(tenantService.createTenant({ ...INPUT_BASE })).rejects.toThrow(
      /deadlock simulado/,
    )

    // POST e DELETE /compensacao chamados
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const compensationCall = fetchMock.mock.calls[1]
    expect(String(compensationCall[0])).toMatch(new RegExp(`/empresas/${suid}/compensacao$`))
    expect(compensationCall[1]?.method).toBe('DELETE')

    // Log de rollback emitido
    expect(loggerChild.error).toHaveBeenCalledWith(
      'saga.onboarding.rollback',
      expect.objectContaining({ suid_empresa: suid }),
    )
  })

  it('(D) TX local falha + compensação também falha → dead-letter log + erro propaga', async () => {
    const suid = 'BR-EMPRESATESTE-00099'

    fetchMock.mockResolvedValueOnce(jsonResponse(empresaResponse(suid, 'irrelevant')))
    // Compensação falha com 500
    fetchMock.mockResolvedValueOnce(
      new Response('Kaboom', { status: 500 }),
    )

    prismaMock.$transaction.mockRejectedValueOnce(new Error('erro local fatal'))

    await expect(tenantService.createTenant({ ...INPUT_BASE })).rejects.toThrow(
      /erro local fatal/,
    )

    // Compensação foi tentada…
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // …e o dead-letter log foi gravado com a causa original e instrução manual.
    const deadLetterCall = loggerChild.error.mock.calls.find(
      ([msg]) => msg === 'cadastros.compensar.dead_letter',
    )
    expect(deadLetterCall).toBeTruthy()
    expect(deadLetterCall?.[1]).toMatchObject({
      suid,
      causa_original: 'erro local fatal',
    })
    expect(deadLetterCall?.[1].acao_manual).toMatch(/Remover fisicamente/)
  })

  it('rejeita cedo quando slug já existe (nenhuma chamada a Cadastros)', async () => {
    prismaMock.organizacao.findUnique.mockResolvedValueOnce({ id: 'existente', slug: INPUT_BASE.slug })

    await expect(tenantService.createTenant({ ...INPUT_BASE })).rejects.toThrow(
      /slug já está em uso/,
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('rejeita cedo quando clerk_user_id já tem tenant (nenhuma chamada a Cadastros)', async () => {
    prismaMock.usuario.findFirst.mockResolvedValueOnce({ id: 'user-x' })

    await expect(tenantService.createTenant({ ...INPUT_BASE })).rejects.toThrow(
      /já possui um tenant/,
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })
})
