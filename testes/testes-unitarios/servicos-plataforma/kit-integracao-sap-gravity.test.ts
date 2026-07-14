// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  aplicarEnvelopeIntegracaoPedido,
  normalizarBodyIntegracaoPedido,
} from '../../../servicos-global/produto/pedido/shared/envelope-integracao-pedido.ts'
import {
  hashCorpoRequisicao,
  extrairChaveIdempotencia,
} from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/lib/idempotencia-api.ts'
import { generateHMACSignature } from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/crypto.ts'

describe('envelope-integracao-pedido', () => {
  it('mapeia externalRef para referencia_externa_erp_pedido no body', () => {
    const out = normalizarBodyIntegracaoPedido({ externalRef: 'EBELN-1', numero_pedido: 'P1' })
    expect(out.referencia_externa_erp_pedido).toBe('EBELN-1')
  })

  it('aplica aliases gravityOrderId e externalRef na resposta', () => {
    const env = aplicarEnvelopeIntegracaoPedido({
      id_pedido: 'clx123',
      referencia_externa_erp_pedido: '4500',
      status_pedido: 'aberto',
    })
    expect(env.gravityOrderId).toBe('clx123')
    expect(env.externalRef).toBe('4500')
  })
})

describe('idempotencia-api', () => {
  it('extrai Idempotency-Key do header', () => {
    expect(extrairChaveIdempotencia({ 'idempotency-key': 'abc' })).toBe('abc')
    expect(extrairChaveIdempotencia({ 'x-chave-idempotencia': 'xyz' })).toBe('xyz')
  })

  it('hash do corpo e deterministico', () => {
    const a = hashCorpoRequisicao({ a: 1 })
    const b = hashCorpoRequisicao({ a: 1 })
    expect(a).toBe(b)
  })
})

describe('webhook HMAC', () => {
  it('gera assinatura sha256 hex', () => {
    const payload = JSON.stringify({ event: 'pedido.criado' })
    const sig = generateHMACSignature(payload, 'segredo-teste')
    expect(sig).toMatch(/^[a-f0-9]{64}$/)
  })
})
