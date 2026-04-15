// server/lib/billing/index.ts
// Factory do BillingProvider.
// Lê a env BILLING_PROVIDER para decidir qual provider usar.
// Providers disponíveis hoje: 'stripe'. Skeletons: 'itau', 'santander'.

import { logger } from '../logger.js'
import type { BillingProvider } from './types.js'
import { StripeProvider } from './stripeProvider.js'
import { ContaAzulProvider } from './contaAzulProvider.js'
import { ItauProvider } from './itauProvider.js'
import { SantanderProvider } from './santanderProvider.js'

export * from './types.js'

const log = logger.child({ module: 'billing-factory' })

let cachedProvider: BillingProvider | null = null

/**
 * Retorna o provider de billing configurado via env `BILLING_PROVIDER`.
 * Provider OFICIAL do Gravity: `conta_azul` (cobrança + NFS-e integrado).
 * Fallback de desenvolvimento: `stripe`.
 * Skeletons alternativos: `itau`, `santander` (ver BILLING.md).
 */
export function getBillingProvider(): BillingProvider {
  if (cachedProvider) return cachedProvider

  const choice = (process.env.BILLING_PROVIDER ?? 'stripe').toLowerCase()

  switch (choice) {
    case 'conta_azul':
      cachedProvider = new ContaAzulProvider()
      break
    case 'stripe':
      cachedProvider = new StripeProvider()
      break
    case 'itau':
      cachedProvider = new ItauProvider()
      break
    case 'santander':
      cachedProvider = new SantanderProvider()
      break
    default:
      log.warn('BILLING_PROVIDER desconhecido — usando Stripe como fallback de dev', { choice })
      cachedProvider = new StripeProvider()
      break
  }

  log.info('billing provider selected', { provider: cachedProvider.name, env_choice: choice })
  return cachedProvider
}

/** Reseta o cache — usar apenas em testes */
export function __resetBillingProviderCache(): void {
  cachedProvider = null
}
