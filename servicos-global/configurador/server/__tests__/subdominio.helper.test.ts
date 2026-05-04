// server/__tests__/subdominio.helper.test.ts
// Testes unitários da política central de subdomínio (decisão 2026-05-03):
// sistema gera, usuário não escolhe; unicidade GLOBAL cross-tabela
// (organizacao + workspace); auto-suffix `-2`, `-3`, ... até disponível.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Prisma mock ────────────────────────────────────────────────────────────

const prismaMock = {
  organizacao: { findUnique: vi.fn() },
  workspace: { findUnique: vi.fn() },
}
vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }))

// Logger silencioso
vi.mock('../lib/logger.js', () => ({
  logger: { child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }) },
}))

// Helpers para configurar respostas dos mocks por subdomínio.
function configurarOcupados(opts: { ocupadosOrg?: string[]; ocupadosWs?: string[] }) {
  const setOrg = new Set(opts.ocupadosOrg ?? [])
  const setWs = new Set(opts.ocupadosWs ?? [])
  prismaMock.organizacao.findUnique.mockImplementation(({ where }: { where: { subdominio_organizacao: string } }) => {
    return Promise.resolve(setOrg.has(where.subdominio_organizacao) ? { id_organizacao: 'fake' } : null)
  })
  prismaMock.workspace.findUnique.mockImplementation(({ where }: { where: { subdominio_workspace: string } }) => {
    return Promise.resolve(setWs.has(where.subdominio_workspace) ? { id_workspace: 'fake' } : null)
  })
}

beforeEach(() => {
  prismaMock.organizacao.findUnique.mockReset()
  prismaMock.workspace.findUnique.mockReset()
})

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('slugifySubdominio', () => {
  it('lowercase, troca não-[a-z0-9-] por hífen, colapsa, tira pontas', async () => {
    const { slugifySubdominio } = await import('../services/organizacao-service.js')
    expect(slugifySubdominio('Acme Logística SP')).toBe('acme-logistica-sp')
    expect(slugifySubdominio('Empresa & Cia.')).toBe('empresa-cia')
    expect(slugifySubdominio('---ABC---')).toBe('abc')
    expect(slugifySubdominio('  espaços  ')).toBe('espacos')
  })

  it('trunca em 60 caracteres', async () => {
    const { slugifySubdominio } = await import('../services/organizacao-service.js')
    const longo = 'a'.repeat(80)
    expect(slugifySubdominio(longo).length).toBe(60)
  })

  it('retorna string vazia para input só com símbolos', async () => {
    const { slugifySubdominio } = await import('../services/organizacao-service.js')
    expect(slugifySubdominio('---')).toBe('')
    expect(slugifySubdominio('!@#')).toBe('')
  })
})

describe('proximoSubdominioDisponivel — política cross-tabela com auto-suffix', () => {
  it('(a) base livre → retorna base sem sufixo', async () => {
    configurarOcupados({})
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    const result = await proximoSubdominioDisponivel('Acme Logística SP')
    expect(result).toBe('acme-logistica-sp')
  })

  it('(b) base ocupado em ORGANIZACAO → retorna base-2', async () => {
    configurarOcupados({ ocupadosOrg: ['acme'] })
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    const result = await proximoSubdominioDisponivel('acme')
    expect(result).toBe('acme-2')
  })

  it('(c) base ocupado em WORKSPACE → retorna base-2 (cross-tabela)', async () => {
    configurarOcupados({ ocupadosWs: ['acme'] })
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    const result = await proximoSubdominioDisponivel('acme')
    expect(result).toBe('acme-2')
  })

  it('(d) base e base-2 ocupados em tabelas DIFERENTES → retorna base-3', async () => {
    configurarOcupados({ ocupadosOrg: ['acme'], ocupadosWs: ['acme-2'] })
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    const result = await proximoSubdominioDisponivel('acme')
    expect(result).toBe('acme-3')
  })

  it('(e) input com símbolos vira erro 400 (sem letra válida)', async () => {
    configurarOcupados({})
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    await expect(proximoSubdominioDisponivel('---')).rejects.toThrow('Nome inválido')
  })

  it('(f) teto de 100 esgotado → 409', async () => {
    // Marca todos os 100 candidatos como ocupados em organizacao.
    const ocupados = ['acme', ...Array.from({ length: 99 }, (_, i) => `acme-${i + 2}`)]
    configurarOcupados({ ocupadosOrg: ocupados })
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    await expect(proximoSubdominioDisponivel('acme')).rejects.toThrow('Não foi possível gerar subdomínio')
  })

  it('(g) base já com sufixo numérico do usuário também é re-resolvida', async () => {
    configurarOcupados({})
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    const result = await proximoSubdominioDisponivel('acme-2')
    expect(result).toBe('acme-2')
  })

  it('(h) acentos e maiúsculas normalizados antes do probe', async () => {
    configurarOcupados({})
    const { proximoSubdominioDisponivel } = await import('../services/organizacao-service.js')
    const result = await proximoSubdominioDisponivel('Açaí Importadora')
    expect(result).toBe('acai-importadora')
  })
})
