/**
 * Testes unitarios — Pedido / smartImportService.ts
 *
 * Cobre:
 *   - Mapeamento IA: colunas em ingles e com alias
 *   - Inferencia por dados: incoterm, NCM, moeda, data
 *   - Agrupamento: N linhas mesmo PO → 1 pedido
 *   - Validacao: quantidade negativa → erro, duplicata → aviso
 *   - Decisoes: sobrescrever, pular
 *   - Memoria: salva e recupera mapeamento por hash
 *   - Cross-tenant: mapeamento de outro tenant nao retornado
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SmartImportService } from '../../../produto/pedido/server/src/services/smartImportService'
import { MapeamentoMemoriaService } from '../../../produto/pedido/server/src/services/mapeamentoMemoriaService'
import { calcularHashColunas } from '../../../produto/pedido/server/src/services/importEngine'

// ── Mock do Prisma ────────────────────────────────────────────────────────────

function makeMockPrisma(pedidosExistentes: string[] = []) {
  return {
    pedido: {
      findMany: vi.fn().mockResolvedValue(
        pedidosExistentes.map(n => ({ numero_pedido: n, id: `id-${n}` }))
      ),
      create: vi.fn().mockImplementation((args: { data: Record<string,unknown> }) =>
        Promise.resolve({ id: `new-${Date.now()}`, ...args.data })
      ),
      findFirst: vi.fn().mockImplementation(
        (args: { where: { numero_pedido?: string } }) => {
          const num = args.where.numero_pedido
          if (num && pedidosExistentes.includes(num)) {
            return Promise.resolve({ id: `id-${num}`, numero_pedido: num })
          }
          return Promise.resolve(null)
        }
      ),
      update: vi.fn().mockResolvedValue({ id: 'updated' }),
    },
    mapeamentoImport: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert:     vi.fn().mockResolvedValue({}),
      delete:     vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => fn({
        pedido: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: `new-${Date.now()}` }),
          update: vi.fn().mockResolvedValue({ id: 'updated' }),
        },
      })
    ),
  }
}

function toBuffer(content: string): Buffer {
  return Buffer.from(content, 'utf-8')
}

// ── Testes: Mapeamento IA ─────────────────────────────────────────────────────

describe('SmartImportService — mapeamento IA', () => {
  it('deve mapear colunas em ingles para campos do sistema', async () => {
    const csv = [
      'PO Number,Supplier,NCM,Qty,Unit Price,Currency',
      'PO-001,Shanghai Co.,8471.30.19,100,25.50,USD',
    ].join('\n')

    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const mapa = Object.fromEntries(
      preview.mapeamento
        .filter(m => m.campo_sistema)
        .map(m => [m.coluna_arquivo, m.campo_sistema])
    )

    expect(mapa['PO Number']).toBe('numero_pedido')
    expect(mapa['NCM']).toBe('ncm')
    expect(mapa['Currency']).toBe('moeda_pedido')
    expect(mapa['Qty']).toBe('quantidade_inicial')
  })

  it('deve mapear coluna com alias parcial "po no" → numero_pedido', async () => {
    const csv = ['PO No,Qty', 'PO-005,50'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const col = preview.mapeamento.find(m => m.coluna_arquivo === 'PO No')
    expect(col?.campo_sistema).toBe('numero_pedido')
    expect(col?.confianca).toBeGreaterThanOrEqual(70)
  })
})

// ── Testes: Inferencia por dados ──────────────────────────────────────────────

describe('SmartImportService — inferencia por dados', () => {
  it('deve inferir incoterm quando coluna tem apenas FOB/CIF/EXW', async () => {
    const csv = [
      'PO,Trade Terms,Qty',
      'PO-010,FOB,100',
      'PO-011,CIF,200',
      'PO-012,EXW,50',
    ].join('\n')

    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const col = preview.mapeamento.find(m => m.coluna_arquivo === 'Trade Terms')
    expect(col?.campo_sistema).toBe('incoterm')
    expect(col?.confianca).toBeGreaterThanOrEqual(85)
  })

  it('deve inferir NCM quando coluna tem 8 digitos', async () => {
    const csv = [
      'PO,HS Code,Qty',
      'PO-020,8471.30.19,100',
      'PO-021,8544.42.90,50',
    ].join('\n')

    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const col = preview.mapeamento.find(m => m.coluna_arquivo === 'HS Code')
    expect(col?.campo_sistema).toBe('ncm')
  })
})

// ── Testes: Agrupamento ───────────────────────────────────────────────────────

describe('SmartImportService — agrupamento', () => {
  it('deve contar 1 pedido para 3 linhas com mesmo PO number', async () => {
    const csv = [
      'PO Number,Part No.,NCM,Qty',
      'PO-X,SKU-1,8471.30.19,100',
      'PO-X,SKU-2,8544.42.90,200',
      'PO-X,SKU-3,3926.90.90,50',
    ].join('\n')

    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    expect(preview.total_linhas).toBe(3)
    expect(preview.total_pedidos).toBe(1)
  })
})

// ── Testes: Validacao ─────────────────────────────────────────────────────────

describe('SmartImportService — validacao', () => {
  it('deve marcar linha como erro quando quantidade e negativa', async () => {
    const csv = [
      'PO Number,Part No.,NCM,Qty,Unit Price',
      'PO-ERR,SKU-ERR,8471.30.19,-5,10',
    ].join('\n')

    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const linha = preview.linhas.find(l => l.numero_pedido === 'PO-ERR')
    expect(linha?.status).toBe('erro')
    expect(linha?.alertas.some(a => a.tipo === 'valor_negativo')).toBe(true)
  })

  it('deve marcar aviso de duplicata quando numero_pedido existe no sistema', async () => {
    const csv = [
      'PO Number,Part No.,NCM,Qty',
      'PO-DUP,SKU-1,8471.30.19,100',
    ].join('\n')

    const db = makeMockPrisma(['PO-DUP'])
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const linha = preview.linhas.find(l => l.numero_pedido === 'PO-DUP')
    expect(linha?.status).toBe('aviso')
    expect(linha?.alertas.some(a => a.tipo === 'duplicado_sistema')).toBe(true)
  })
})

// ── Testes: Decisoes de duplicata ─────────────────────────────────────────────

describe('SmartImportService — decisoes de duplicata', () => {
  it('decisao pular — linha nao e importada', async () => {
    const csv = [
      'PO Number,Qty',
      'PO-PULAR,100',
    ].join('\n')

    const db = makeMockPrisma(['PO-PULAR'])
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const resultado = await svc.confirmar('tenant1', 'user1', {
      preview_id: preview.preview_id,
      mapeamento_confirmado: preview.mapeamento,
      decisoes_duplicatas: { 'PO-PULAR': 'pular' },
      linhas_incluidas: preview.linhas.map(l => l.linha_arquivo),
      salvar_mapeamento: false,
    })

    expect(resultado.pulados).toBe(1)
    expect(resultado.criados).toBe(0)
  })
})

// ── Testes: Memoria de mapeamento ─────────────────────────────────────────────

describe('MapeamentoMemoriaService', () => {
  it('deve salvar e recuperar mapeamento por hash', async () => {
    const mockPrisma = makeMockPrisma()
    const mapeamentoSalvo = [
      { coluna_arquivo: 'PO', campo_sistema: 'numero_pedido', confianca: 97, nivel: 'auto' as const, inferido_por: 'ia' as const },
    ]

    mockPrisma.mapeamentoImport.upsert.mockResolvedValue({})
    mockPrisma.mapeamentoImport.findUnique.mockResolvedValue({
      mapeamento: JSON.stringify(mapeamentoSalvo),
    })

    const svc = new MapeamentoMemoriaService(mockPrisma)
    await svc.salvar('tenant1', 'hash123', mapeamentoSalvo)
    const recuperado = await svc.buscar('tenant1', 'hash123')

    expect(recuperado).not.toBeNull()
    expect(recuperado?.[0].campo_sistema).toBe('numero_pedido')
  })

  it('deve retornar null quando nao ha mapeamento salvo', async () => {
    const mockPrisma = makeMockPrisma()
    mockPrisma.mapeamentoImport.findUnique.mockResolvedValue(null)

    const svc = new MapeamentoMemoriaService(mockPrisma)
    const resultado = await svc.buscar('tenant1', 'hash-inexistente')

    expect(resultado).toBeNull()
  })
})

// ── Testes: Cross-tenant ──────────────────────────────────────────────────────

describe('SmartImportService — cross-tenant', () => {
  it('mapeamento de outro tenant nao deve ser retornado', async () => {
    const mockPrisma = makeMockPrisma()

    // Tenant A salva mapeamento
    mockPrisma.mapeamentoImport.findUnique.mockImplementation(
      (args: { where: { tenant_id_hash_colunas: { tenant_id: string; hash_colunas: string } } }) => {
        const { tenant_id, hash_colunas } = args.where.tenant_id_hash_colunas
        if (tenant_id === 'tenantA' && hash_colunas === 'hash-abc') {
          return Promise.resolve({ mapeamento: JSON.stringify([{ campo_sistema: 'numero_pedido' }]) })
        }
        return Promise.resolve(null)
      }
    )

    const svc = new MapeamentoMemoriaService(mockPrisma)
    const resultadoA = await svc.buscar('tenantA', 'hash-abc')
    const resultadoB = await svc.buscar('tenantB', 'hash-abc')

    expect(resultadoA).not.toBeNull()
    expect(resultadoB).toBeNull()
  })
})

// ── Testes: Hash de colunas ───────────────────────────────────────────────────

describe('importEngine — calcularHashColunas', () => {
  it('deve gerar hash deterministico para mesmos cabecalhos', () => {
    const h1 = calcularHashColunas(['PO Number', 'Supplier', 'NCM'])
    const h2 = calcularHashColunas(['PO Number', 'Supplier', 'NCM'])
    expect(h1).toBe(h2)
  })

  it('hash deve ser diferente para cabecalhos distintos', () => {
    const h1 = calcularHashColunas(['PO', 'Qty'])
    const h2 = calcularHashColunas(['PO', 'NCM'])
    expect(h1).not.toBe(h2)
  })

  it('hash deve ser independente da ordem dos cabecalhos', () => {
    const h1 = calcularHashColunas(['A', 'B', 'C'])
    const h2 = calcularHashColunas(['C', 'A', 'B'])
    expect(h1).toBe(h2)
  })
})
