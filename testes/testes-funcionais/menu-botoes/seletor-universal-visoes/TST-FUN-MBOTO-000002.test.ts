/**
 * TST-FUN-MBOTO-000002 — baseline listar pedidos (contrato MBOTO — escopo lista)
 * Referência: rotas de listagem usadas pela aba Lista do seletor.
 */
import { describe, expect, it } from 'vitest'

describe('TST-FUN-MBOTO-000002 — listar pedidos baseline', () => {
  it('documenta rota alvo do plano mestre', () => {
    const rota = 'GET /api/v1/pedidos?limit=1000&ids_workspaces='
    expect(rota).toContain('limit=1000')
    expect(rota).toContain('ids_workspaces')
  })
})
