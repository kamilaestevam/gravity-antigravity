// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Regressão 2026-05-26 — IDs legados com '/' quebravam rotas de transferência
 * quando o client montava URL sem encodeURIComponent.
 *
 * Réplica de pid() de pedido/client/src/shared/api.ts (não exportada).
 */

function pid(id: string): string {
  return encodeURIComponent(id)
}

function montarUrlTransferenciaPreview(pedidoId: string): string {
  return `/api/v1/pedidos/${pid(pedidoId)}/transferencias/preview`
}

function montarUrlTransferenciaReverter(pedidoId: string, transferId: string): string {
  return `/api/v1/pedidos/${pid(pedidoId)}/transferencias/${pid(transferId)}/reverter`
}

describe('pid() — encodeURIComponent para IDs com caracteres especiais', () => {
  it('U-PID-01: ID com barra vira segmento único na URL', () => {
    const id = 'pedi_id_1234567/26'
    const url = montarUrlTransferenciaPreview(id)

    expect(url).toBe('/api/v1/pedidos/pedi_id_1234567%2F26/transferencias/preview')
    expect(url).toContain('%2F')
    expect(url).not.toContain('/26/transferencias')
  })

  it('U-PID-02: ID CUID simples permanece igual', () => {
    const id = 'cm3abc123def'
    expect(pid(id)).toBe('cm3abc123def')
  })

  it('U-PID-03: reverter codifica pedido_id e transfer_id', () => {
    const url = montarUrlTransferenciaReverter('ped/a', 'trans/b')
    expect(url).toBe('/api/v1/pedidos/ped%2Fa/transferencias/trans%2Fb/reverter')
  })

  it('U-PID-04: decodeURIComponent recupera ID original', () => {
    const original = 'pedi_id_0000123/26'
    expect(decodeURIComponent(pid(original))).toBe(original)
  })
})
