// @vitest-environment node
/// <reference types="vitest/globals" />
// TST-UNIT-CONF-ME-ORG-001 — Schema Zod meOrganizacoesResponseSchema
// Valida: parse aceita payload correto, rejeita payload incompleto/legado.

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {},
}))
vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: vi.fn(),
  invalidarCacheRequireAuth: vi.fn(),
}))
vi.mock('../../../servicos-global/configurador/server/middleware/requireConfiguradorAccess.js', () => ({
  requireConfiguradorMutation: vi.fn(),
}))
vi.mock('../../../servicos-global/configurador/server/lib/appError.js', () => ({
  AppError: class AppError extends Error { statusCode: number; code: string; constructor(m: string, s: number, c: string) { super(m); this.statusCode = s; this.code = c } },
}))
vi.mock('../../../servicos-global/configurador/server/services/organizacao-service.js', () => ({
  organizacaoService: {},
  proximoSubdominioDisponivel: vi.fn(),
  slugifySubdominio: vi.fn(),
}))
vi.mock('../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn() },
}))
vi.mock('@nucleo/montar-detalhe-acao-historico-log', () => ({
  compararEstadosHistoricoLog: vi.fn(),
  montarDetalheAcaoHistoricoLog: vi.fn(),
}))

import { meOrganizacoesResponseSchema } from '../../../servicos-global/configurador/server/routes/me.js'

describe('meOrganizacoesResponseSchema', () => {
  const PAYLOAD_VALIDO = {
    organizacoes: [
      {
        id_organizacao: 'org_001',
        nome_organizacao: 'Gravity Interno',
        subdominio_organizacao: 'gravity-interno',
        status_organizacao: 'ATIVO',
      },
      {
        id_organizacao: 'org_002',
        nome_organizacao: 'Cliente ABC',
        subdominio_organizacao: 'cliente-abc',
        status_organizacao: 'ATIVO',
      },
    ],
  }

  it('aceita payload válido', () => {
    const parsed = meOrganizacoesResponseSchema.safeParse(PAYLOAD_VALIDO)
    expect(parsed.success).toBe(true)
  })

  it('aceita array vazio de organizações', () => {
    const parsed = meOrganizacoesResponseSchema.safeParse({ organizacoes: [] })
    expect(parsed.success).toBe(true)
  })

  it('rejeita organizacao sem id_organizacao', () => {
    const payload = {
      organizacoes: [{
        nome_organizacao: 'Sem ID',
        subdominio_organizacao: 'sem-id',
        status_organizacao: 'ATIVO',
      }],
    }
    const parsed = meOrganizacoesResponseSchema.safeParse(payload)
    expect(parsed.success).toBe(false)
  })

  it('rejeita organizacao sem nome_organizacao', () => {
    const payload = {
      organizacoes: [{
        id_organizacao: 'org_001',
        subdominio_organizacao: 'sem-nome',
        status_organizacao: 'ATIVO',
      }],
    }
    const parsed = meOrganizacoesResponseSchema.safeParse(payload)
    expect(parsed.success).toBe(false)
  })

  it('rejeita payload com campo legado "tenants" (anti-regressão DDD)', () => {
    const payload = { tenants: [{ id: 'ten_001', name: 'Legado' }] }
    const parsed = meOrganizacoesResponseSchema.safeParse(payload)
    expect(parsed.success).toBe(false)
  })

  it('rejeita payload sem propriedade organizacoes', () => {
    const parsed = meOrganizacoesResponseSchema.safeParse({})
    expect(parsed.success).toBe(false)
  })

  it('rejeita organizacoes como string', () => {
    const parsed = meOrganizacoesResponseSchema.safeParse({ organizacoes: 'invalido' })
    expect(parsed.success).toBe(false)
  })
})
