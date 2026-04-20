// TST-FUNC-INFRA-001 — migrate-tenants/_shared: funções com efeitos externos (pg)
//
// Cobre: ensureMigrationStatusTable, getTenants
// pg.PoolClient mockado via vi.fn() — sem banco real.
/// <reference types="vitest/globals" />

import type { PoolClient, QueryResult } from 'pg'
import {
  ensureMigrationStatusTable,
  getTenants,
  type MigrationStatus,
  type TenantRow,
} from '../../../../scripts/migrate-tenants/_shared.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeClient(rows: TenantRow[] = []): PoolClient {
  return {
    query: vi.fn().mockResolvedValue({ rows, rowCount: rows.length } as QueryResult),
  } as unknown as PoolClient
}

// ── ensureMigrationStatusTable ────────────────────────────────────────────────

describe('ensureMigrationStatusTable', () => {
  it('emite exatamente uma query CREATE TABLE IF NOT EXISTS', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    expect(client.query).toHaveBeenCalledTimes(1)
  })

  it('a query contém CREATE TABLE IF NOT EXISTS _schema_migration_status', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS _schema_migration_status/i)
  })

  it('a DDL inclui a coluna tenant_id como PRIMARY KEY', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/tenant_id\s+TEXT.*PRIMARY KEY/is)
  })

  it('a DDL inclui a coluna schema_name', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/schema_name/i)
  })

  it('a DDL inclui status com default PROVISIONED', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/status.*DEFAULT\s+'PROVISIONED'/is)
  })

  it('a DDL inclui parity_pct como NUMERIC(5,2) nullable', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/parity_pct\s+NUMERIC\(5,2\)/i)
  })

  it('a DDL inclui cutover_at como TIMESTAMPTZ', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/cutover_at\s+TIMESTAMPTZ/i)
  })

  it('a DDL inclui rows_copied como BIGINT', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/rows_copied\s+BIGINT/i)
  })

  it('a DDL inclui updated_at com DEFAULT NOW()', async () => {
    const client = makeClient()
    await ensureMigrationStatusTable(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/updated_at.*DEFAULT NOW\(\)/is)
  })

  it('propaga rejeição do client.query', async () => {
    const client = {
      query: vi.fn().mockRejectedValue(new Error('conexão recusada')),
    } as unknown as PoolClient
    await expect(ensureMigrationStatusTable(client)).rejects.toThrow('conexão recusada')
  })
})

// ── getTenants ────────────────────────────────────────────────────────────────

describe('getTenants', () => {
  it('sem filtro → query sem WHERE', async () => {
    const client = makeClient()
    await getTenants(client)
    const [sql, params] = vi.mocked(client.query).mock.calls[0] as [string, unknown[]]
    expect(sql).not.toMatch(/WHERE/i)
    expect(params).toEqual([])
  })

  it('sem filtro → query com ORDER BY created_at', async () => {
    const client = makeClient()
    await getTenants(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    expect(sql).toMatch(/ORDER BY created_at/i)
  })

  it('filtro vazio ([]) → query sem WHERE', async () => {
    const client = makeClient()
    await getTenants(client, [])
    const [sql, params] = vi.mocked(client.query).mock.calls[0] as [string, unknown[]]
    expect(sql).not.toMatch(/WHERE/i)
    expect(params).toEqual([])
  })

  it('filtro com um status → query com WHERE status = ANY($1)', async () => {
    const client = makeClient()
    await getTenants(client, ['PROVISIONED'])
    const [sql, params] = vi.mocked(client.query).mock.calls[0] as [string, unknown[]]
    expect(sql).toMatch(/WHERE status = ANY\(\$1::text\[\]\)/i)
    expect(params).toEqual([['PROVISIONED']])
  })

  it('filtro com múltiplos status → todos passados como array no $1', async () => {
    const filtro: MigrationStatus[] = ['BACKFILLED', 'CUTOVER']
    const client = makeClient()
    await getTenants(client, filtro)
    const [, params] = vi.mocked(client.query).mock.calls[0] as [string, unknown[]]
    expect(params).toEqual([filtro])
  })

  it('retorna as linhas devolvidas pelo banco', async () => {
    const fixture: TenantRow[] = [
      {
        tenant_id:          'ctest000000000000000000001',
        schema_name:        'tenant_ctest000000000000000000001',
        status:             'BACKFILLED',
        tables_provisioned: 63,
        rows_copied:        BigInt(1000),
        rows_public:        BigInt(1000),
        parity_pct:         '100.00',
      },
    ]
    const client = makeClient(fixture)
    const result = await getTenants(client)
    expect(result).toEqual(fixture)
  })

  it('retorna array vazio quando banco devolve zero linhas', async () => {
    const client = makeClient([])
    const result = await getTenants(client)
    expect(result).toEqual([])
  })

  it('a query seleciona exatamente as colunas do TenantRow', async () => {
    const client = makeClient()
    await getTenants(client)
    const sql = vi.mocked(client.query).mock.calls[0][0] as string
    const expected = [
      'tenant_id',
      'schema_name',
      'status',
      'tables_provisioned',
      'rows_copied',
      'rows_public',
      'parity_pct',
    ]
    for (const col of expected) {
      expect(sql).toContain(col)
    }
  })

  it('propaga rejeição do client.query', async () => {
    const client = {
      query: vi.fn().mockRejectedValue(new Error('timeout')),
    } as unknown as PoolClient
    await expect(getTenants(client)).rejects.toThrow('timeout')
  })
})
