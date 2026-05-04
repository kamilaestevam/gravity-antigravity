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
  produtoGravityAssinatura: {
    create: vi.fn(),
  },
  workspace: {
    findUnique: vi.fn().mockResolvedValue(null), // Helper proximoSubdominioDisponivel consulta cross-tabela
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
  nome_organizacao: 'Empresa Teste',
  subdominio_organizacao: 'empresa-teste',
  clerkUserId: 'clerk_user_123',
  owner: { email: 'owner@teste.com', name: 'Owner' },
  cnpj_organizacao: '12.345.678/0001-99',
  pais: 'BR' as const,
  correlationId: 'corr-test-abc',
}

function empresaResponse(suid: string, idOrganizacao: string) {
  return {
    suid_empresa: suid,
    id_organizacao: idOrganizacao,
    nome_empresa: 'Empresa Teste',
    cnpj_empresa: '12.345.678/0001-99',
    tin_empresa: null,
    pais_empresa: 'BR',
    estado_empresa: null,
    cidade_empresa: null,
    endereco_empresa: null,
    zipcode_empresa: null,
    email_empresa: null,
    telefone_empresa: null,
    whatsapp_empresa: null,
    pode_ser_importador_empresa: true,
    pode_ser_exportador_empresa: false,
    pode_ser_fabricante_empresa: false,
    pode_ser_agente_empresa: false,
    pode_ser_despachante_empresa: false,
    pode_ser_armador_empresa: false,
    ativo_empresa: true,
    criado_em_empresa: '2026-04-22T00:00:00.000Z',
    atualizado_em_empresa: '2026-04-22T00:00:00.000Z',
  }
}

function jsonResponse(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('organizacaoService.createOrganizacao — saga Cadastros-primeiro', () => {
  let organizacaoService: typeof import('../services/organizacaoService.js')['organizacaoService']

  beforeEach(async () => {
    vi.clearAllMocks()
    // Import dinâmico APÓS os mocks — garante que o módulo receba os stubs.
    const mod = await import('../services/organizacaoService.js')
    organizacaoService = mod.organizacaoService

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
        nome_organizacao: INPUT_BASE.nome_organizacao,
        subdominio_organizacao: INPUT_BASE.subdominio_organizacao,
        suid_empresa_organizacao: suid,
      })
      prismaMock.usuario.create.mockResolvedValueOnce({ id: 'user-id' })
      prismaMock.produtoGravityAssinatura.create.mockResolvedValueOnce({ id: 'sub-id' })
      prismaMock.workspace.create.mockResolvedValueOnce({ id: 'empresa-id' })
      return cb(prismaMock)
    })

    const tenant = await organizacaoService.createOrganizacao({ ...INPUT_BASE })

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
    expect(prismaMock.organizacao.create.mock.calls[0][0].data.suid_empresa_organizacao).toBe(suid)
    expect(prismaMock.usuario.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.produtoGravityAssinatura.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.workspace.create).toHaveBeenCalledTimes(1)

    expect((tenant as { suid_empresa_organizacao: string }).suid_empresa_organizacao).toBe(suid)
  })

  it('(B) Cadastros 4xx → zero escrita local, erro propaga, sem compensação', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('CNPJ duplicado', { status: 409 }),
    )

    await expect(organizacaoService.createOrganizacao({ ...INPUT_BASE })).rejects.toThrow(
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

    await expect(organizacaoService.createOrganizacao({ ...INPUT_BASE })).rejects.toThrow(
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
      expect.objectContaining({ suid_empresa_organizacao: suid }),
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

    await expect(organizacaoService.createOrganizacao({ ...INPUT_BASE })).rejects.toThrow(
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

  it('quando slug já existe, sistema auto-ajusta com sufixo numérico (cross-tabela)', async () => {
    // Política 2026-05-03: sistema gera subdomínio, usuário não escolhe.
    // Em colisão, helper proximoSubdominioDisponivel retorna `<base>-2`, etc.
    // Primeiro probe (base) → ocupado em organizacao.
    // Segundo probe (base-2) → livre.
    prismaMock.organizacao.findUnique
      .mockResolvedValueOnce({ id_organizacao: 'existente' }) // base ocupado
      .mockResolvedValueOnce(null) // base-2 livre em org
      .mockResolvedValueOnce(null) // workspace inicial: probe livre em org
    prismaMock.workspace.findUnique
      .mockResolvedValue(null) // todos livres em workspace

    // Configura saga feliz para verificar que o ajuste passa
    fetchMock.mockResolvedValueOnce(jsonResponse(empresaResponse('suid-ok', 'novo')))
    prismaMock.$transaction.mockImplementationOnce(async (cb: (tx: typeof prismaMock) => unknown) => {
      prismaMock.organizacao.create.mockResolvedValueOnce({
        id_organizacao: 'novo',
        subdominio_organizacao: `${INPUT_BASE.subdominio_organizacao}-2`,
      })
      prismaMock.usuario.create.mockResolvedValueOnce({})
      prismaMock.produtoGravityAssinatura.create.mockResolvedValueOnce({})
      prismaMock.workspace.create.mockResolvedValueOnce({})
      return cb(prismaMock)
    })

    const result = await organizacaoService.createOrganizacao({ ...INPUT_BASE })

    // Saga prossegue normalmente — Cadastros foi chamado, transação executou.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({ subdominio_ajustado: true })
  })

  it('rejeita cedo quando clerk_user_id já tem organização (nenhuma chamada a Cadastros)', async () => {
    prismaMock.usuario.findFirst.mockResolvedValueOnce({ id: 'user-x' })

    await expect(organizacaoService.createOrganizacao({ ...INPUT_BASE })).rejects.toThrow(
      /já possui uma organização/,
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })
})
