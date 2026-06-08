/**
 * TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000076 — produtosWorkspaceResponseSchema (contrato Zod)
 */
import { describe, expect, it } from 'vitest'
import { produtosWorkspaceResponseSchema } from '../../../../servicos-global/shell/schemas/produtos-workspace-response.schema.js'

describe('TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000076 — produtosWorkspaceResponseSchema', () => {
  it('aceita payload válido da rota Configurador', () => {
    const parsed = produtosWorkspaceResponseSchema.safeParse({
      products: [
        {
          id: 'pgw_1',
          product_key: 'pedido',
          is_active: true,
          activated_at: '2026-06-08T12:00:00.000Z',
          catalog: {
            id: 'pg_1',
            name: 'Pedido',
            slug: 'pedido',
            description: 'Pedidos de importação',
            status: 'active',
          },
        },
      ],
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita products ausente ou product_key vazio', () => {
    expect(produtosWorkspaceResponseSchema.safeParse({}).success).toBe(false)
    expect(
      produtosWorkspaceResponseSchema.safeParse({
        products: [{ id: 'x', product_key: '', is_active: true, activated_at: '2026-01-01', catalog: null }],
      }).success,
    ).toBe(false)
  })
})
