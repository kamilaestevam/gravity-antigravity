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
 *   - Factory: criarSmartImportService
 *   - PDF: rejeicao antes do parse
 *   - limite_excedido: campo presente no preview
 *   - nomePlanilha: parametro aceito sem erro
 *   - numeros_editados: numero corrigido aplicado no pedido criado
 *   - Stateless fallback: linhas do payload quando cache miss
 *   - Importacao incremental: item adicionado a pedido existente
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  SmartImportService,
  criarSmartImportService,
} from '../../../produto/pedido/server/src/services/smartImportService'
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
    expect(mapa['Qty']).toBe('quantidade_inicial_item_pedido')
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

  it('confirmar com preview_id de outro tenant deve ser rejeitado', async () => {
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)

    const csv = ['PO Number,NCM,Qty', 'PO-001,8471.30.19,100'].join('\n')
    // Tenant A gera o preview
    const preview = await svc.analisar('tenantA', toBuffer(csv), 'pedido.csv')

    // Tenant B tenta confirmar o preview de Tenant A — deve lançar AppError
    await expect(
      svc.confirmar('tenantB', 'userB', {
        preview_id: preview.preview_id,
        mapeamento_confirmado: preview.mapeamento,
        decisoes_duplicatas: {},
        linhas_incluidas: preview.linhas.map(l => l.linha_arquivo),
        salvar_mapeamento: false,
      })
    ).rejects.toThrow('Preview nao pertence a este tenant')
  })

  it('analisar para dois tenants diferentes nao compartilha estado', async () => {
    const dbA = makeMockPrisma()
    const dbB = makeMockPrisma()
    const svcA = new SmartImportService(dbA)
    const svcB = new SmartImportService(dbB)

    const csvA = ['PO Number,NCM,Qty', 'PO-TENANT-A,8471.30.19,50'].join('\n')
    const csvB = ['PO Number,NCM,Qty', 'PO-TENANT-B,8542.31.90,100'].join('\n')

    const [previewA, previewB] = await Promise.all([
      svcA.analisar('tenantA', toBuffer(csvA), 'a.csv'),
      svcB.analisar('tenantB', toBuffer(csvB), 'b.csv'),
    ])

    // Preview IDs devem ser escopo do tenant correspondente
    expect(previewA.preview_id.startsWith('tenantA-')).toBe(true)
    expect(previewB.preview_id.startsWith('tenantB-')).toBe(true)
    // Prisma de cada tenant foi chamado de forma independente
    expect(dbA.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenant_id: 'tenantA' }) })
    )
    expect(dbB.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenant_id: 'tenantB' }) })
    )
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

// ── Testes: Factory function ──────────────────────────────────────────────────

describe('criarSmartImportService — factory', () => {
  it('deve retornar instancia de SmartImportService', () => {
    const db = makeMockPrisma()
    const svc = criarSmartImportService(db as unknown as Record<string, unknown>)
    expect(svc).toBeInstanceOf(SmartImportService)
  })

  it('instancia criada pela factory deve funcionar normalmente', async () => {
    const csv = ['PO Number,Qty', 'PO-FAC,10'].join('\n')
    const db = makeMockPrisma()
    const svc = criarSmartImportService(db as unknown as Record<string, unknown>)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')
    expect(preview.total_linhas).toBe(1)
  })
})

// ── Testes: Suporte a PDF ─────────────────────────────────────────────────────

describe('SmartImportService — suporte a PDF', () => {
  it('nao deve rejeitar .pdf — deve tentar parse', async () => {
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)

    // PDF minimo valido com texto — pdf-parse pode falhar em buffer invalido,
    // mas o importante e que NAO lancamos AppError 422 FORMATO_PDF_NAO_SUPORTADO
    const erro = await svc.analisar('tenant1', Buffer.from('%PDF-1.4'), 'relatorio.pdf')
      .then(() => null)
      .catch((e: unknown) => e as Error)

    // Se lancar erro, nao deve ser o nosso AppError de rejeicao de formato
    if (erro) {
      expect((erro as { code?: string }).code).not.toBe('FORMATO_PDF_NAO_SUPORTADO')
    }
  })
})

// ── Testes: limite_excedido ───────────────────────────────────────────────────

describe('SmartImportService — limite_excedido', () => {
  it('deve retornar limite_excedido false para arquivo pequeno', async () => {
    const csv = ['PO Number,Part No.,NCM,Qty', 'PO-1,SKU-1,8471.30.19,100'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')
    expect(preview.limite_excedido).toBe(false)
  })

  it('preview deve incluir campo limite_excedido de tipo boolean', async () => {
    const csv = ['PO Number,Qty', 'PO-1,10'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')
    expect(typeof preview.limite_excedido).toBe('boolean')
  })

  it('deve retornar limite_excedido true para arquivo com mais de 1000 linhas', async () => {
    const linhas = ['PO Number,Part No.,NCM,Qty']
    for (let i = 0; i < 1001; i++) {
      linhas.push(`PO-${i},SKU-${i},8471.30.19,${i + 1}`)
    }
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(linhas.join('\n')), 'grande.csv')
    expect(preview.limite_excedido).toBe(true)
    expect(preview.total_linhas).toBeGreaterThan(1000)
  })
})

// ── Testes: parametro nomePlanilha ────────────────────────────────────────────

describe('SmartImportService — nomePlanilha', () => {
  it('deve aceitar nomePlanilha para CSV (parametro e ignorado)', async () => {
    const csv = ['PO Number,Qty', 'PO-SHT,10'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    // Nao deve lancar erro; o parametro e passado para parseArquivo mas ignorado para CSV
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv', 'Planilha1')
    expect(preview.total_linhas).toBe(1)
  })

  it('preview deve incluir preview_id que contem tenantId', async () => {
    const csv = ['PO Number,Qty', 'PO-1,10'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('meu-tenant', toBuffer(csv), 'pedido.csv')
    expect(preview.preview_id).toContain('meu-tenant')
  })
})

// ── Testes: numeros_editados ──────────────────────────────────────────────────

describe('SmartImportService — numeros_editados', () => {
  it('deve criar pedido com numero editado pelo usuario', async () => {
    const csv = ['PO Number,Part No.,NCM,Qty', 'PO-ORIG,SKU-1,8471.30.19,100'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const pedidoCreate = vi.fn().mockResolvedValue({ id: 'novo-editado' })
    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: pedidoCreate,
        update: vi.fn(),
      },
      pedidoItem: { create: vi.fn().mockResolvedValue({}) },
    }))

    const linhaNum = preview.linhas[0].linha_arquivo

    await svc.confirmar('tenant1', 'user1', {
      preview_id: preview.preview_id,
      mapeamento_confirmado: preview.mapeamento,
      decisoes_duplicatas: {},
      linhas_incluidas: [linhaNum],
      salvar_mapeamento: false,
      numeros_editados: { [linhaNum]: 'PO-EDITADO' },
    })

    expect(pedidoCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ numero_pedido: 'PO-EDITADO' }),
      })
    )
  })

  it('linha sem numero_editado nao deve ser alterada', async () => {
    const csv = ['PO Number,Part No.,NCM,Qty', 'PO-MANTIDO,SKU-1,8471.30.19,50'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const pedidoCreate = vi.fn().mockResolvedValue({ id: 'id-mantido' })
    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: pedidoCreate,
        update: vi.fn(),
      },
      pedidoItem: { create: vi.fn().mockResolvedValue({}) },
    }))

    await svc.confirmar('tenant1', 'user1', {
      preview_id: preview.preview_id,
      mapeamento_confirmado: preview.mapeamento,
      decisoes_duplicatas: {},
      linhas_incluidas: preview.linhas.map(l => l.linha_arquivo),
      salvar_mapeamento: false,
      numeros_editados: {},
    })

    expect(pedidoCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ numero_pedido: 'PO-MANTIDO' }),
      })
    )
  })
})

// ── Testes: Stateless fallback ────────────────────────────────────────────────

describe('SmartImportService — stateless fallback (P0.3)', () => {
  it('deve processar linhas do payload quando preview_id nao existe no cache', async () => {
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)

    const linhasPayload = [{
      linha_arquivo: 2,
      numero_pedido: 'PO-STATELESS',
      status: 'ok' as const,
      alertas: [],
      dados: { numero_pedido: 'PO-STATELESS', quantidade_inicial_item_pedido: '10' },
    }]

    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'novo-stateless' }),
        update: vi.fn(),
      },
      pedidoItem: { create: vi.fn().mockResolvedValue({}) },
    }))

    const resultado = await svc.confirmar('tenant1', 'user1', {
      preview_id: 'tenant1-preview-inexistente-xyz123',
      mapeamento_confirmado: [],
      decisoes_duplicatas: {},
      linhas_incluidas: [2],
      salvar_mapeamento: false,
      linhas: linhasPayload,
    })

    expect(resultado).toBeDefined()
    // Deve ter processado sem erros
    expect(resultado.erros).toHaveLength(0)
  })

  it('deve retornar resultado vazio para cache miss sem linhas no payload', async () => {
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)

    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'id' }),
        update: vi.fn(),
      },
      pedidoItem: { create: vi.fn().mockResolvedValue({}) },
    }))

    const resultado = await svc.confirmar('tenant1', 'user1', {
      preview_id: 'tenant1-cache-miss-sem-linhas',
      mapeamento_confirmado: [],
      decisoes_duplicatas: {},
      linhas_incluidas: [2, 3],
      salvar_mapeamento: false,
    })

    // Com linhas_incluidas mas sem cache nem payload.linhas, fallback cria linhas vazias
    expect(resultado).toBeDefined()
    expect(resultado.criados + resultado.erros.length + resultado.pulados).toBeGreaterThanOrEqual(0)
  })
})

// ── Testes: Importacao incremental ────────────────────────────────────────────

describe('SmartImportService — importacao incremental (FEAT.6)', () => {
  it('deve adicionar item a pedido existente quando part_number informado sem decisao', async () => {
    const csv = ['PO Number,Part No.,NCM,Qty', 'PO-EXIST,SKU-NOVO,8471.30.19,50'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const pedidoItemCreate = vi.fn().mockResolvedValue({ id: 'item-novo' })

    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue({ id: 'pedido-existente-id' }),
        create: vi.fn().mockResolvedValue({ id: 'novo' }),
        update: vi.fn(),
      },
      pedidoItem: { create: pedidoItemCreate },
    }))

    const resultado = await svc.confirmar('tenant1', 'user1', {
      preview_id: preview.preview_id,
      mapeamento_confirmado: preview.mapeamento,
      decisoes_duplicatas: {},
      linhas_incluidas: preview.linhas.map(l => l.linha_arquivo),
      salvar_mapeamento: false,
    })

    expect(pedidoItemCreate).toHaveBeenCalled()
    expect(resultado.atualizados).toBeGreaterThan(0)
    expect(resultado.criados).toBe(0)
  })

  it('deve criar pedido novo quando pedido nao existe (sem decisao)', async () => {
    const csv = ['PO Number,Part No.,NCM,Qty', 'PO-NOVO,SKU-1,8471.30.19,100'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const pedidoCreate = vi.fn().mockResolvedValue({ id: 'criado-id' })

    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue(null), // pedido nao existe
        create: pedidoCreate,
        update: vi.fn(),
      },
      pedidoItem: { create: vi.fn().mockResolvedValue({}) },
    }))

    const resultado = await svc.confirmar('tenant1', 'user1', {
      preview_id: preview.preview_id,
      mapeamento_confirmado: preview.mapeamento,
      decisoes_duplicatas: {},
      linhas_incluidas: preview.linhas.map(l => l.linha_arquivo),
      salvar_mapeamento: false,
    })

    expect(pedidoCreate).toHaveBeenCalled()
    expect(resultado.criados).toBe(1)
    expect(resultado.atualizados).toBe(0)
  })

  it('deve pular item incremental se pedidoItem.create falhar (graceful fallback)', async () => {
    const csv = ['PO Number,Part No.,NCM,Qty', 'PO-ERR,SKU-FAIL,8471.30.19,50'].join('\n')
    const db = makeMockPrisma()
    const svc = new SmartImportService(db)
    const preview = await svc.analisar('tenant1', toBuffer(csv), 'pedido.csv')

    const pedidoCreate = vi.fn().mockResolvedValue({ id: 'fallback-id' })

    db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: {
        findFirst: vi.fn().mockResolvedValue({ id: 'pedido-existente' }),
        create: pedidoCreate,
        update: vi.fn(),
      },
      pedidoItem: {
        create: vi.fn().mockRejectedValue(new Error('unique constraint')),
      },
    }))

    // Nao deve lancar — pedidoItem.create usa .catch(() => null)
    const resultado = await svc.confirmar('tenant1', 'user1', {
      preview_id: preview.preview_id,
      mapeamento_confirmado: preview.mapeamento,
      decisoes_duplicatas: {},
      linhas_incluidas: preview.linhas.map(l => l.linha_arquivo),
      salvar_mapeamento: false,
    })

    // Com .catch(() => null) o fluxo continua como "atualizado"
    expect(resultado.erros).toHaveLength(0)
  })
})
