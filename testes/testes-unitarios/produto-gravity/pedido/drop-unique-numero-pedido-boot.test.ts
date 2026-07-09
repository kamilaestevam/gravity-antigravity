/**
 * Contract guard — numero_pedido duplicado é PERMITIDO (decisão de produto 20260525).
 *
 * Produção quebrou (P2002 na conversão Smart Docs → Pedido) porque schemas tenant_*
 * legados ainda tinham o unique (id_organizacao, numero_pedido): a migration
 * 20260525120000_drop_pedido_numero_unique só dropa um nome de índice específico e o
 * migrate-all-tenants é best-effort. Este teste garante que:
 *   1. o fragment.prisma continua SEM @@unique nesse par (só @@index);
 *   2. o boot do Pedido aplica o repair name-agnostic em todos os schemas.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const FRAGMENT = readFileSync(
  join(process.cwd(), 'servicos-global/produto/pedido/prisma/fragment.prisma'),
  'utf-8',
)

const BOOT_SCRIPT = readFileSync(
  join(process.cwd(), 'scripts/ativamente/aplicar-migrations-pedido.ts'),
  'utf-8',
)

const DDL_SCHEMAS_SCRIPT = readFileSync(
  join(process.cwd(), 'scripts/ativamente/aplicar-migration-ddl-schemas-pedido.ts'),
  'utf-8',
)

function extrairModel(modelName: string): string {
  const match = FRAGMENT.match(new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`))
  if (!match?.[1]) throw new Error(`Model ${modelName} não encontrado no fragment.prisma`)
  return match[1]
}

describe('drop unique (id_organizacao, numero_pedido) — contrato de boot', () => {
  it('fragment.prisma NAO declara @@unique em (id_organizacao, numero_pedido)', () => {
    const modelPedido = extrairModel('Pedido')
    expect(modelPedido).not.toMatch(/@@unique\(\[id_organizacao,\s*numero_pedido\]\)/)
  })

  it('fragment.prisma mantem @@index nao-unico em (id_organizacao, numero_pedido)', () => {
    const modelPedido = extrairModel('Pedido')
    expect(modelPedido).toMatch(/@@index\(\[id_organizacao,\s*numero_pedido\]\)/)
  })

  it('boot do Pedido invoca o repair name-agnostic do unique legado', () => {
    expect(BOOT_SCRIPT).toContain('aplicarDropUniqueNumeroPedidoEmSchemasComPedido(pedidoUrl')
  })

  it('repair consulta o catalogo por unicidade + colunas, nao por nome de indice', () => {
    const fn = DDL_SCHEMAS_SCRIPT.match(
      /export async function aplicarDropUniqueNumeroPedidoEmSchemasComPedido[\s\S]*?\n\}/,
    )?.[0]
    expect(fn).toBeDefined()
    expect(fn).toContain('ix.indisunique')
    expect(fn).toContain("ARRAY['id_organizacao', 'numero_pedido']")
    expect(fn).toContain('DROP CONSTRAINT')
    expect(fn).toContain('DROP INDEX')
    expect(fn).toContain('CREATE INDEX IF NOT EXISTS "pedido_id_organizacao_numero_pedido_idx"')
  })
})
