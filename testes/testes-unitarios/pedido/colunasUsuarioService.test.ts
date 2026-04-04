/**
 * colunasUsuarioService.test.ts — Testes unitários do serviço de colunas customizadas
 *
 * Cobertura:
 *   - criar coluna — chave gerada corretamente do nome
 *   - criar coluna — bloqueia se limite 50 atingido
 *   - criar coluna — bloqueia se nome duplicado no tenant
 *   - atualizar coluna — não permite mudar tipo
 *   - excluir coluna — soft delete, valores preservados
 *   - visibilidade roles — oculta para usuário sem role
 *   - salvar valores — upsert correto
 *   - cross-tenant — coluna de outro tenant não retornada
 *   - slugifyNome — trata %, acentos e espaços corretamente
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ColunasUsuarioService, slugifyNome } from '../../../produto/pedido/server/src/services/colunasUsuarioService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarDbMock() {
  const colunas: Record<string, unknown>[] = []
  const valores: Record<string, unknown>[] = []

  return {
    colunaUsuarioPedido: {
      count: vi.fn(({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(colunas.filter(c =>
          c.tenant_id === where.tenant_id &&
          (where.ativo === undefined || c.ativo === where.ativo),
        ).length),
      ),
      findFirst: vi.fn(({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(
          colunas.find(c =>
            Object.entries(where).every(([k, v]) => {
              if (k === 'id' && typeof v === 'object' && v !== null && 'not' in (v as Record<string, unknown>)) {
                return c[k] !== (v as Record<string, unknown>).not
              }
              return c[k] === v
            }),
          ) ?? null,
        ),
      ),
      findMany: vi.fn(({ where, orderBy }: { where: Record<string, unknown>; orderBy?: unknown }) =>
        Promise.resolve(
          colunas
            .filter(c =>
              Object.entries(where).every(([k, v]) => c[k] === v),
            )
            .sort((a, b) => {
              if (orderBy && (orderBy as Record<string, unknown>).ordem === 'asc') {
                return (a.ordem as number) - (b.ordem as number)
              }
              return 0
            }),
        ),
      ),
      create: vi.fn(({ data }: { data: Record<string, unknown> }) => {
        const nova = { ...data, id: `col_${Date.now()}_${Math.random()}` }
        colunas.push(nova)
        return Promise.resolve(nova)
      }),
      update: vi.fn(({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const idx = colunas.findIndex(c => c.id === where.id)
        if (idx >= 0) colunas[idx] = { ...colunas[idx], ...data }
        return Promise.resolve(colunas[idx])
      }),
      updateMany: vi.fn(({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        colunas
          .filter(c => c.id === where.id && c.tenant_id === where.tenant_id)
          .forEach(c => Object.assign(c, data))
        return Promise.resolve({ count: 1 })
      }),
      aggregate: vi.fn(({ where }: { where: Record<string, unknown> }) => {
        const filtered = colunas.filter(c => c.tenant_id === where.tenant_id)
        const maxOrdem = filtered.reduce((max, c) => Math.max(max, (c.ordem as number) ?? 0), 0)
        return Promise.resolve({ _max: { ordem: maxOrdem } })
      }),
    },
    valorColunaUsuarioPedido: {
      upsert: vi.fn(({ where, create, update }: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        const key = where as { tenant_id_coluna_id_vinculo_id: { tenant_id: string; coluna_id: string; vinculo_id: string } }
        const { tenant_id, coluna_id, vinculo_id } = key.tenant_id_coluna_id_vinculo_id
        const idx = valores.findIndex(
          v => v.tenant_id === tenant_id && v.coluna_id === coluna_id && v.vinculo_id === vinculo_id,
        )
        if (idx >= 0) {
          Object.assign(valores[idx], update)
          return Promise.resolve(valores[idx])
        }
        const novo = { ...create, id: `val_${Date.now()}` }
        valores.push(novo)
        return Promise.resolve(novo)
      }),
      findMany: vi.fn(({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(
          valores.filter(v =>
            Object.entries(where).every(([k, vv]) => v[k] === vv),
          ),
        ),
      ),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    _colunas: colunas,
    _valores: valores,
  }
}

// ── Testes: slugifyNome ───────────────────────────────────────────────────────

describe('slugifyNome', () => {
  it('converte "Margem %" em "margem_percentual"', () => {
    expect(slugifyNome('Margem %')).toBe('margem_percentual')
  })

  it('remove acentos', () => {
    expect(slugifyNome('Referência')).toBe('referencia')
  })

  it('converte espaços em _', () => {
    expect(slugifyNome('Ref Interna')).toBe('ref_interna')
  })

  it('colapsa múltiplos separadores', () => {
    expect(slugifyNome('Campo  Extra  ')).toBe('campo_extra')
  })

  it('preserva underscores existentes', () => {
    expect(slugifyNome('tipo_doc')).toBe('tipo_doc')
  })
})

// ── Testes: ColunasUsuarioService ─────────────────────────────────────────────

describe('ColunasUsuarioService', () => {
  let service: ColunasUsuarioService
  let db: ReturnType<typeof criarDbMock>

  beforeEach(() => {
    service = new ColunasUsuarioService()
    db = criarDbMock()
  })

  // ── criar coluna ─────────────────────────────────────────────────────────────

  it('cria coluna e gera chave corretamente', async () => {
    const coluna = await service.criar(
      'tenant-1',
      { nome: 'Margem %', tipo: 'percentual', escopo: 'pedido', visibilidade: 'todos', created_by: 'u1' },
      db as unknown as Record<string, unknown>,
    )

    expect(coluna.chave).toBe('margem_percentual')
    expect(coluna.nome).toBe('Margem %')
    expect(coluna.tenant_id).toBe('tenant-1')
  })

  it('bloqueia criação se limite de 50 colunas atingido', async () => {
    // Adiciona 50 colunas ao store
    for (let i = 0; i < 50; i++) {
      ;(db._colunas as Record<string, unknown>[]).push({
        id: `col_${i}`, tenant_id: 'tenant-1', ativo: true, ordem: i, nome: `Col ${i}`, chave: `col_${i}`,
      })
    }

    await expect(
      service.criar(
        'tenant-1',
        { nome: 'Nova', tipo: 'texto', escopo: 'pedido', visibilidade: 'todos', created_by: 'u1' },
        db as unknown as Record<string, unknown>,
      ),
    ).rejects.toMatchObject({ code: 'LIMITE_COLUNAS' })
  })

  it('bloqueia criação se nome já existe no tenant', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col_x', tenant_id: 'tenant-1', nome: 'Prioridade', ativo: true, ordem: 1, chave: 'prioridade',
    })

    await expect(
      service.criar(
        'tenant-1',
        { nome: 'Prioridade', tipo: 'select', escopo: 'pedido', visibilidade: 'todos', created_by: 'u1' },
        db as unknown as Record<string, unknown>,
      ),
    ).rejects.toMatchObject({ code: 'NOME_DUPLICADO' })
  })

  it('permite criar coluna com mesmo nome em tenant diferente', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col_x', tenant_id: 'tenant-OUTRO', nome: 'Prioridade', ativo: true, ordem: 1, chave: 'prioridade',
    })

    const coluna = await service.criar(
      'tenant-1',
      { nome: 'Prioridade', tipo: 'select', escopo: 'pedido', visibilidade: 'todos', created_by: 'u1' },
      db as unknown as Record<string, unknown>,
    )
    expect(coluna.tenant_id).toBe('tenant-1')
  })

  // ── atualizar coluna ─────────────────────────────────────────────────────────

  it('atualiza coluna sem mudar tipo', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col-1', tenant_id: 'tenant-1', nome: 'Margem', tipo: 'percentual', ativo: true, ordem: 1, chave: 'margem',
    })

    const atualizada = await service.atualizar(
      'tenant-1',
      'col-1',
      { nome: 'Margem Ajustada', escopo: 'ambos' },
      db as unknown as Record<string, unknown>,
    )
    expect(atualizada.nome).toBe('Margem Ajustada')
    expect(atualizada.tipo).toBe('percentual') // tipo inalterado
  })

  it('lança NOT_FOUND ao tentar atualizar coluna de outro tenant', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col-1', tenant_id: 'tenant-OUTRO', nome: 'Margem', tipo: 'percentual', ativo: true, ordem: 1, chave: 'margem',
    })

    await expect(
      service.atualizar(
        'tenant-1',
        'col-1',
        { nome: 'Hack' },
        db as unknown as Record<string, unknown>,
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  // ── excluir coluna ───────────────────────────────────────────────────────────

  it('soft delete — ativo = false, valores preservados', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col-1', tenant_id: 'tenant-1', nome: 'Margem', ativo: true, ordem: 1, chave: 'margem',
    })
    ;(db._valores as Record<string, unknown>[]).push({
      id: 'val-1', tenant_id: 'tenant-1', coluna_id: 'col-1', vinculo: 'pedido', vinculo_id: 'ped-1', valor: '15',
    })

    await service.excluir('tenant-1', 'col-1', db as unknown as Record<string, unknown>)

    const coluna = (db._colunas as Record<string, unknown>[]).find(c => c.id === 'col-1')
    expect(coluna?.ativo).toBe(false)
    // Valores devem estar preservados
    expect(db._valores.length).toBe(1)
  })

  // ── visibilidade ─────────────────────────────────────────────────────────────

  it('filtra colunas com visibilidade roles — oculta para usuário sem role', async () => {
    ;(db._colunas as Record<string, unknown>[]).push(
      { id: 'c1', tenant_id: 'tenant-1', visibilidade: 'todos', roles_permitidas: [], created_by: 'u1', ativo: true, ordem: 1 },
      { id: 'c2', tenant_id: 'tenant-1', visibilidade: 'roles', roles_permitidas: ['admin'], created_by: 'u1', ativo: true, ordem: 2 },
      { id: 'c3', tenant_id: 'tenant-1', visibilidade: 'privado', roles_permitidas: [], created_by: 'u99', ativo: true, ordem: 3 },
    )

    const resultado = await service.listar(
      'tenant-1',
      'user-comum',
      ['operador'],  // não tem 'admin'
      db as unknown as Record<string, unknown>,
    )

    const ids = resultado.map((c: Record<string, unknown>) => c.id)
    expect(ids).toContain('c1')      // todos — visível
    expect(ids).not.toContain('c2')  // roles: admin — não visível
    expect(ids).not.toContain('c3')  // privado de outro usuário — não visível
  })

  it('exibe coluna privada para o próprio criador', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'c4', tenant_id: 'tenant-1', visibilidade: 'privado', roles_permitidas: [], created_by: 'user-dono', ativo: true, ordem: 1,
    })

    const resultado = await service.listar(
      'tenant-1',
      'user-dono',
      [],
      db as unknown as Record<string, unknown>,
    )

    expect(resultado.map((c: Record<string, unknown>) => c.id)).toContain('c4')
  })

  // ── salvar valores ───────────────────────────────────────────────────────────

  it('salvar valores — upsert cria novo valor', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col-1', tenant_id: 'tenant-1', ativo: true, ordem: 1,
    })

    await service.salvarValores(
      'tenant-1',
      { vinculo: 'pedido', vinculo_id: 'ped-1', valores: { 'col-1': '25' } },
      db as unknown as Record<string, unknown>,
    )

    expect(db._valores.length).toBe(1)
    expect((db._valores[0] as Record<string, unknown>).valor).toBe('25')
  })

  it('salvar valores — upsert atualiza valor existente', async () => {
    ;(db._valores as Record<string, unknown>[]).push({
      id: 'val-x', tenant_id: 'tenant-1', coluna_id: 'col-1', vinculo: 'pedido', vinculo_id: 'ped-1', valor: '10',
    })

    await service.salvarValores(
      'tenant-1',
      { vinculo: 'pedido', vinculo_id: 'ped-1', valores: { 'col-1': '99' } },
      db as unknown as Record<string, unknown>,
    )

    expect(db._valores.length).toBe(1)
    expect((db._valores[0] as Record<string, unknown>).valor).toBe('99')
  })

  // ── cross-tenant ─────────────────────────────────────────────────────────────

  it('cross-tenant — não retorna coluna de outro tenant', async () => {
    ;(db._colunas as Record<string, unknown>[]).push(
      { id: 'c-a', tenant_id: 'tenant-A', visibilidade: 'todos', roles_permitidas: [], created_by: 'u', ativo: true, ordem: 1 },
      { id: 'c-b', tenant_id: 'tenant-B', visibilidade: 'todos', roles_permitidas: [], created_by: 'u', ativo: true, ordem: 1 },
    )

    const resultado = await service.listar('tenant-A', 'u1', [], db as unknown as Record<string, unknown>)
    const ids = resultado.map((c: Record<string, unknown>) => c.id)
    expect(ids).toContain('c-a')
    expect(ids).not.toContain('c-b')
  })

  it('cross-tenant — não exclui coluna de outro tenant', async () => {
    ;(db._colunas as Record<string, unknown>[]).push({
      id: 'col-alien', tenant_id: 'tenant-B', ativo: true, ordem: 1,
    })

    await expect(
      service.excluir('tenant-A', 'col-alien', db as unknown as Record<string, unknown>),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
