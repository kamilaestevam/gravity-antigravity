/**
 * lpcoSaldoEngine.test.ts — Testes unitarios para o controle de saldo LPCO
 *
 * Como calcularSaldo e validarVinculo dependem do Prisma, testamos
 * com mocks para validar a logica de negocio e mensagens de erro.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do AppError importado pelo saldoEngine
vi.mock('../lpcoStatusEngine.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

// Importar apos mock
const { calcularSaldo, validarVinculo } = await import('../lpcoSaldoEngine.js')
const { AppError } = await import('../lpcoStatusEngine.js')

// ── Helpers de mock ─────────────────────────────────────────────────────────

function mockPrisma(overrides: Record<string, unknown> = {}) {
  return {
    lpco: {
      findFirst: vi.fn(),
    },
    lpcoVinculo: {
      findFirst: vi.fn(),
    },
    ...overrides,
  } as unknown as import('@prisma/client').PrismaClient
}

function criarLpcoMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 'lpco_id_0000001/26',
    id_organizacao: 'tenant-1',
    company_id: 'comp-1',
    tipo_lpco: 'FLEX',
    status: 'deferida',
    quantidade_deferida: 100,
    data_vigencia_fim: null,
    vinculos: [],
    ...overrides,
  }
}

describe('calcularSaldo', () => {
  it('deve calcular saldo quando nao ha vinculos', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({ quantidade_deferida: 500, vinculos: [] })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    const saldo = await calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')

    expect(saldo.deferida).toBe(500)
    expect(saldo.vinculada).toBe(0)
    expect(saldo.disponivel).toBe(500)
    expect(saldo.expirada).toBe(false)
  })

  it('deve subtrair vinculos ativos do saldo', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      quantidade_deferida: 1000,
      vinculos: [
        { quantidade_vinculada: 300, status: 'ativo' },
        { quantidade_vinculada: 200, status: 'ativo' },
      ],
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    const saldo = await calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')

    expect(saldo.deferida).toBe(1000)
    expect(saldo.vinculada).toBe(500)
    expect(saldo.disponivel).toBe(500)
  })

  it('deve detectar vigencia expirada', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      data_vigencia_fim: '2020-01-01T00:00:00Z',
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    const saldo = await calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')

    expect(saldo.expirada).toBe(true)
  })

  it('deve detectar vigencia nao expirada', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      data_vigencia_fim: '2099-12-31T00:00:00Z',
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    const saldo = await calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')

    expect(saldo.expirada).toBe(false)
  })

  it('deve lancar erro se LPCO nao encontrado', async () => {
    const prisma = mockPrisma()
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(null)

    await expect(
      calcularSaldo(prisma, 'inexistente', 'tenant-1', 'comp-1')
    ).rejects.toThrow('LPCO nao encontrado')
  })

  it('deve lancar erro se LPCO nao e FLEX', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({ tipo_lpco: 'POR_OPERACAO' })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    await expect(
      calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')
    ).rejects.toThrow('Controle de saldo so se aplica a LPCO Flex')
  })

  it('deve tratar quantidade_deferida nula como zero', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({ quantidade_deferida: null, vinculos: [] })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    const saldo = await calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')

    expect(saldo.deferida).toBe(0)
    expect(saldo.disponivel).toBe(0)
  })

  it('deve tratar quantidade_vinculada nula no vinculo como zero', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      quantidade_deferida: 100,
      vinculos: [
        { quantidade_vinculada: null, status: 'ativo' },
        { quantidade_vinculada: 30, status: 'ativo' },
      ],
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    const saldo = await calcularSaldo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1')

    expect(saldo.vinculada).toBe(30)
    expect(saldo.disponivel).toBe(70)
  })
})

describe('validarVinculo', () => {
  it('deve lancar erro se LPCO nao encontrado', async () => {
    const prisma = mockPrisma()
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(null)

    await expect(
      validarVinculo(prisma, 'inexistente', 'tenant-1', 'comp-1', 10)
    ).rejects.toThrow('LPCO nao encontrado')
  })

  it('deve lancar erro se LPCO nao esta deferida', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({ status: 'em_analise' })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', 10)
    ).rejects.toThrow('Vinculo so pode ser criado em LPCO deferida')
  })

  it('deve lancar erro se vigencia expirada', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      status: 'deferida',
      data_vigencia_fim: '2020-01-01T00:00:00Z',
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', 10)
    ).rejects.toThrow('LPCO com vigencia expirada')
  })

  it('deve lancar erro se saldo insuficiente em LPCO FLEX', async () => {
    const prisma = mockPrisma()

    // Mock para validarVinculo (findFirst sem include)
    vi.mocked(prisma.lpco.findFirst)
      .mockResolvedValueOnce(criarLpcoMock({
        status: 'deferida',
        tipo_lpco: 'FLEX',
        quantidade_deferida: 100,
        data_vigencia_fim: '2099-12-31T00:00:00Z',
      }) as never)
      // Mock para calcularSaldo (findFirst com include vinculos)
      .mockResolvedValueOnce(criarLpcoMock({
        status: 'deferida',
        tipo_lpco: 'FLEX',
        quantidade_deferida: 100,
        data_vigencia_fim: '2099-12-31T00:00:00Z',
        vinculos: [{ quantidade_vinculada: 95, status: 'ativo' }],
      }) as never)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', 50)
    ).rejects.toThrow('Saldo insuficiente')
  })

  it('deve lancar erro se LPCO POR_OPERACAO ja tem vinculo ativo', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      status: 'deferida',
      tipo_lpco: 'POR_OPERACAO',
      data_vigencia_fim: null,
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)
    vi.mocked(prisma.lpcoVinculo.findFirst).mockResolvedValue({ id: 'vinc-1' } as never)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', null)
    ).rejects.toThrow('LPCO por operacao ja possui vinculo ativo')
  })

  it('deve aceitar vinculo em LPCO POR_OPERACAO sem vinculo existente', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      status: 'deferida',
      tipo_lpco: 'POR_OPERACAO',
      data_vigencia_fim: null,
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)
    vi.mocked(prisma.lpcoVinculo.findFirst).mockResolvedValue(null)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', null)
    ).resolves.toBeUndefined()
  })

  it('deve aceitar vinculo em LPCO FLEX com saldo suficiente', async () => {
    const prisma = mockPrisma()

    vi.mocked(prisma.lpco.findFirst)
      .mockResolvedValueOnce(criarLpcoMock({
        status: 'deferida',
        tipo_lpco: 'FLEX',
        quantidade_deferida: 100,
        data_vigencia_fim: '2099-12-31T00:00:00Z',
      }) as never)
      .mockResolvedValueOnce(criarLpcoMock({
        status: 'deferida',
        tipo_lpco: 'FLEX',
        quantidade_deferida: 100,
        data_vigencia_fim: '2099-12-31T00:00:00Z',
        vinculos: [{ quantidade_vinculada: 20, status: 'ativo' }],
      }) as never)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', 50)
    ).resolves.toBeUndefined()
  })

  it('deve aceitar vinculo em LPCO TAXA sem verificar saldo', async () => {
    const prisma = mockPrisma()
    const lpcoMock = criarLpcoMock({
      status: 'deferida',
      tipo_lpco: 'TAXA',
      data_vigencia_fim: null,
    })
    vi.mocked(prisma.lpco.findFirst).mockResolvedValue(lpcoMock as never)

    await expect(
      validarVinculo(prisma, 'lpco_id_0000001/26', 'tenant-1', 'comp-1', null)
    ).resolves.toBeUndefined()
  })
})
