// server/__tests__/admin-empresas.proxy.test.ts
//
// Testes do proxy admin-empresas no Configurador.
//
// Cobertura:
// - 401 sem auth (mock requireAuth)
// - 403 com tipo_usuario != SUPER_ADMIN/ADMIN (mock requireGravityAdmin)
// - 200 enriquece nome_organizacao via batch IN(...) — UMA query Prisma
// - 200 grava audit log com id_usuario, filtros, qtd_resultados
// - 503 quando fetch ao Cadastros falha
// - Org removida → nome_organizacao = '⟨organização removida⟩' (Mand. 08)

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

const findManyMock = vi.fn()
const auditCreateMock = vi.fn()

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    organizacao: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
    auditLogAdmin: {
      create: (...args: unknown[]) => auditCreateMock(...args),
    },
  },
}))

const defaultAuth = {
  id_usuario: 'admin-001',
  clerkUserId: 'clerk_admin',
  id_organizacao: 'org-admin',
  tipo_usuario: 'SUPER_ADMIN',
  nome_usuario: 'Admin Gravity',
}

let mockRequireAuth = (req: Record<string, unknown>, _res: unknown, next: () => void): void => {
  req.auth = defaultAuth
  next()
}

vi.mock('../middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, res: unknown, next: () => void) =>
    mockRequireAuth(req, res, next),
}))

let mockRequireGravityAdmin = (_req: unknown, _res: unknown, next: () => void): void => next()

vi.mock('../middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (req: unknown, res: unknown, next: () => void) =>
    mockRequireGravityAdmin(req, res, next),
}))

// ─── App setup ──────────────────────────────────────────────────────────────

let app: express.Express
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  process.env.CHAVE_INTERNA_SERVICO = 'test-internal-key'
  process.env.CADASTROS_SERVICE_URL = 'http://cadastros-mock.test'

  const { adminEmpresasRouter } = await import('../routes/admin-empresas.js')
  // B5 — usa errorHandler REAL para validar comportamento de produção.
  // Garante que o formato error.code/error.message/error.correlationId
  // testado aqui é o mesmo que o cliente recebe em produção.
  const { errorHandler } = await import('../middleware/errorHandler.js')

  app = express()
  // Espelha config de produção (X-Forwarded-For → req.ip).
  app.set('trust proxy', true)
  app.use(express.json())
  app.use('/api/v1/admin/empresas', adminEmpresasRouter)
  app.use(errorHandler)

  request = supertest(app)
})

beforeEach(() => {
  fetchMock.mockReset()
  findManyMock.mockReset()
  auditCreateMock.mockReset()
  auditCreateMock.mockResolvedValue({})
  // Restore default auth/admin mocks
  mockRequireAuth = (req: Record<string, unknown>, _res, next) => {
    req.auth = defaultAuth
    next()
  }
  mockRequireGravityAdmin = (_req, _res, next) => next()
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }) as unknown as Response
}

/**
 * B4 — Helper que produz empresa mock TOTALMENTE COMPATÍVEL com
 * `listaEmpresasAdminSchema` (32 campos). Permite override pontual.
 *
 * Por que existe: o proxy agora valida a resposta do Cadastros com
 * safeParse (B1). Mocks parciais retornavam 502 CADASTROS_CONTRATO_QUEBRADO
 * em vez de 200 — todos os testes de path feliz quebravam.
 */
function empresaMockCompleta(
  suid: string,
  idOrg: string,
  override: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    suid_empresa:                                              suid,
    id_organizacao:                                            idOrg,
    nome_empresa:                                              `Empresa ${suid}`,
    cnpj_empresa:                                              '11.111.111/0001-11',
    tin_empresa:                                               null,
    pais_empresa:                                              'BR',
    estado_empresa:                                            null,
    cidade_empresa:                                            null,
    endereco_empresa:                                          null,
    zipcode_empresa:                                           null,
    email_empresa:                                             null,
    telefone_empresa:                                          null,
    whatsapp_empresa:                                          null,
    pode_ser_importador_empresa:                               true,
    pode_ser_exportador_empresa:                               false,
    pode_ser_fabricante_empresa:                               false,
    pode_ser_agente_empresa:                                   false,
    pode_ser_despachante_empresa:                              false,
    pode_ser_armador_empresa:                                  false,
    pode_ser_cia_aerea_empresa:                                false,
    pode_ser_transportadora_rodoviaria_nacional_empresa:       false,
    pode_ser_transportadora_rodoviaria_internacional_empresa:  false,
    pode_ser_armazem_alfandegado_empresa:                      false,
    pode_ser_armazem_nacional_empresa:                         false,
    pode_ser_banco_empresa:                                    false,
    pode_ser_seguradora_internacional_empresa:                 false,
    pode_ser_seguradora_corretora_cambio_empresa:              false,
    ativo_empresa:                                             true,
    nome_organizacao:                                          '', // proxy enriquece
    criado_em_empresa:                                         '2026-05-08T00:00:00.000Z',
    atualizado_em_empresa:                                     '2026-05-08T00:00:00.000Z',
    ...override,
  }
}

/** Envelope completo `listaEmpresasAdminSchema` para mocks de fetch. */
function payloadCadastros(orgs: string[]) {
  return {
    itens: orgs.map((id, i) => empresaMockCompleta(`BR-${i}`, id)),
    total: orgs.length,
    pagina: 1,
    por_pagina: 50,
    alerta_volume: false,
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

describe('GET /api/v1/admin/empresas — auth', () => {
  it('401 sem requireAuth (token ausente)', async () => {
    mockRequireAuth = (_req, res: unknown, _next) => {
      ;(res as Response).status(401).json({ error: { code: 'UNAUTHORIZED' } })
    }
    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(401)
  })

  it('403 quando tipo_usuario != SUPER_ADMIN/ADMIN', async () => {
    mockRequireGravityAdmin = (_req, res: unknown, _next) => {
      ;(res as Response).status(403).json({ error: { code: 'FORBIDDEN' } })
    }
    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(403)
  })
})

// ─── Enrichment ──────────────────────────────────────────────────────────────

describe('GET /api/v1/admin/empresas — enrichment batch', () => {
  it('faz UMA query findMany com IN(...) — proibido N+1', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A', 'org-B', 'org-A'])))
    findManyMock.mockResolvedValueOnce([
      { id_organizacao: 'org-A', nome_organizacao: 'Acme' },
      { id_organizacao: 'org-B', nome_organizacao: 'Beta' },
    ])

    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(200)

    // EXATAMENTE 1 chamada — não N
    expect(findManyMock).toHaveBeenCalledTimes(1)
    const arg = findManyMock.mock.calls[0][0]
    expect(arg.where.id_organizacao.in).toEqual(['org-A', 'org-B']) // dedup
  })

  it('enriquece nome_organizacao em cada item', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A'])))
    findManyMock.mockResolvedValueOnce([
      { id_organizacao: 'org-A', nome_organizacao: 'Acme Corp' },
    ])

    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(200)
    expect(res.body.itens[0].nome_organizacao).toBe('Acme Corp')
  })

  it('org removida do Configurador → "⟨organização removida⟩"', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-fantasma'])))
    findManyMock.mockResolvedValueOnce([]) // não existe no Configurador

    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(200)
    expect(res.body.itens[0].nome_organizacao).toBe('⟨organização removida⟩')
  })
})

// ─── Audit log ───────────────────────────────────────────────────────────────

describe('GET /api/v1/admin/empresas — audit log', () => {
  it('grava audit log com id_usuario + filtros + qtd', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A', 'org-B'])))
    findManyMock.mockResolvedValueOnce([])

    const res = await request.get('/api/v1/admin/empresas?tipo_parceiro=importador&pais=BR')
    expect(res.status).toBe(200)

    // Aguarda microtask do fire-and-forget
    await new Promise((r) => setImmediate(r))

    expect(auditCreateMock).toHaveBeenCalledTimes(1)
    const data = auditCreateMock.mock.calls[0][0].data
    expect(data.id_usuario_audit_log_admin).toBe('admin-001')
    expect(data.tipo_usuario_audit_log_admin).toBe('SUPER_ADMIN')
    expect(data.acao_audit_log_admin).toBe('admin.empresas.list')
    expect(data.recurso_audit_log_admin).toBe('empresa')
    expect(data.qtd_resultados_audit_log_admin).toBe(2)
    expect(data.filtros_audit_log_admin).toMatchObject({
      tipo_parceiro: 'importador',
      pais: 'BR',
    })
  })

  it('grava primeiro IP de X-Forwarded-For no audit log (não req.ip)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A'])))
    findManyMock.mockResolvedValueOnce([])

    await request
      .get('/api/v1/admin/empresas')
      .set('X-Forwarded-For', '203.0.113.42, 10.0.0.1, 172.16.0.5')

    await new Promise((r) => setImmediate(r))

    expect(auditCreateMock).toHaveBeenCalledTimes(1)
    expect(auditCreateMock.mock.calls[0][0].data.ip_origem_audit_log_admin).toBe('203.0.113.42')
  })

  it('fallback para req.ip quando X-Forwarded-For ausente', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A'])))
    findManyMock.mockResolvedValueOnce([])

    await request.get('/api/v1/admin/empresas')

    await new Promise((r) => setImmediate(r))

    expect(auditCreateMock).toHaveBeenCalledTimes(1)
    const ip = auditCreateMock.mock.calls[0][0].data.ip_origem_audit_log_admin
    // Em testes locais o IP vem como ::ffff:127.0.0.1, ::1 ou 127.0.0.1.
    // Garantimos apenas que NÃO é 'unknown' e NÃO veio de XFF que não foi setado.
    expect(typeof ip).toBe('string')
    expect(ip.length).toBeGreaterThan(0)
    expect(ip).not.toBe('unknown')
  })

  it('falha do audit log NÃO derruba a resposta (fire-and-forget)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A'])))
    findManyMock.mockResolvedValueOnce([{ id_organizacao: 'org-A', nome_organizacao: 'Acme' }])
    auditCreateMock.mockRejectedValueOnce(new Error('DB down'))

    const res = await request.get('/api/v1/admin/empresas')
    // resposta vai mesmo com audit falhando
    expect(res.status).toBe(200)
  })
})

// ─── Resiliência ─────────────────────────────────────────────────────────────

describe('GET /api/v1/admin/empresas — resiliência', () => {
  it('503 quando fetch ao Cadastros lança (rede/timeout)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(503)
    expect(res.body.error.code).toBe('CADASTROS_UNAVAILABLE')
  })

  it('repassa status do Cadastros quando !response.ok', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ erro: 'kaboom' }, 500))
    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(500)
  })
})

// ─── Mand. 06 + 09 — Validação de contrato bilateral ───────────────────────

describe('GET /api/v1/admin/empresas — validação Zod', () => {
  it('502 CADASTROS_CONTRATO_QUEBRADO quando resposta foge do schema', async () => {
    // Cadastros devolveu algo fora do contrato (ex: itens não é array)
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ itens: 'isso deveria ser array', total: 0, pagina: 1, por_pagina: 50 }),
    )

    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(502)
    expect(res.body.error.code).toBe('CADASTROS_CONTRATO_QUEBRADO')
  })

  it('clampa por_pagina > 200 silenciosamente para 200', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A'])))
    findManyMock.mockResolvedValueOnce([{ id_organizacao: 'org-A', nome_organizacao: 'Acme' }])

    const res = await request.get('/api/v1/admin/empresas?por_pagina=999')
    // Decisão arquitetural: clamp silencioso para preservar UX (não 422).
    // Cadastros TAMBÉM clampa — defesa em profundidade.
    expect(res.status).toBe(200)
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/por_pagina=200/)
  })

  it('rejeita tipo_parceiro inválido com 400 QUERY_INVALIDA', async () => {
    const res = await request.get('/api/v1/admin/empresas?tipo_parceiro=fantasma')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('QUERY_INVALIDA')
    expect(res.body.error.message).toMatch(/tipo_parceiro/)
  })

  it('rejeita pais com mais de 2 chars com 400 QUERY_INVALIDA', async () => {
    const res = await request.get('/api/v1/admin/empresas?pais=BRA')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('QUERY_INVALIDA')
    expect(res.body.error.message).toMatch(/pais/)
  })

  it('aceita filtros válidos e normaliza pais para uppercase', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(payloadCadastros(['org-A'])))
    findManyMock.mockResolvedValueOnce([{ id_organizacao: 'org-A', nome_organizacao: 'Acme' }])

    const res = await request.get('/api/v1/admin/empresas?pais=br&tipo_parceiro=importador')
    expect(res.status).toBe(200)
    // Verifica que pais foi normalizado para BR antes de chamar Cadastros
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/pais=BR/)
  })
})

// ─── alerta_volume ───────────────────────────────────────────────────────────

describe('GET /api/v1/admin/empresas — alerta_volume', () => {
  it('repassa alerta_volume=true do Cadastros', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...payloadCadastros(['org-A']), total: 642, alerta_volume: true }),
    )
    findManyMock.mockResolvedValueOnce([])

    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(200)
    expect(res.body.alerta_volume).toBe(true)
  })

  it('alerta_volume=false (default) quando ausente do payload', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...payloadCadastros(['org-A']), alerta_volume: undefined }),
    )
    findManyMock.mockResolvedValueOnce([])

    const res = await request.get('/api/v1/admin/empresas')
    expect(res.status).toBe(200)
    expect(res.body.alerta_volume).toBe(false)
  })
})
