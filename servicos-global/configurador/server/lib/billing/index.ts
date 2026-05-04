// server/lib/billing/index.ts
// Factory do BillingProvider.
// Lê a env BILLING_PROVIDER para decidir qual provider usar.
// Provider OFICIAL: 'conta_azul'. Skeletons: 'itau', 'santander'.

import { logger } from '../logger.js'
import type { BillingProvider } from './types.js'
import { ContaAzulProvider } from './contaAzulProvider.js'
import { ItauProvider } from './itauProvider.js'
import { ProvedorFaturaProdutoGravity } from './provedorFaturaProdutoGravity.js'
import { SantanderProvider } from './santanderProvider.js'

export * from './types.js'

const log = logger.child({ module: 'billing-factory' })

let cachedProvider: BillingProvider | null = null

/**
 * Retorna o provider de billing configurado via env `BILLING_PROVIDER`.
 * Provider OFICIAL do Gravity: `conta_azul` (cobrança + NFS-e integrado).
 * Skeletons alternativos: `itau`, `santander` (ver BILLING.md).
 */
export function getBillingProvider(): BillingProvider {
  if (cachedProvider) return cachedProvider

  const choice = (process.env.BILLING_PROVIDER ?? 'gravity').toLowerCase()

  switch (choice) {
    case 'gravity':
      cachedProvider = new ProvedorFaturaProdutoGravity()
      break
    case 'conta_azul':
      cachedProvider = new ContaAzulProvider()
      break
    case 'itau':
      cachedProvider = new ItauProvider()
      break
    case 'santander':
      cachedProvider = new SantanderProvider()
      break
    default:
      log.warn('BILLING_PROVIDER desconhecido — usando Gravity como fallback', { choice })
      cachedProvider = new ProvedorFaturaProdutoGravity()
      break
  }

  log.info('billing provider selected', { provider: cachedProvider.name, env_choice: choice })
  return cachedProvider
}

/** Reseta o cache — usar apenas em testes */
export function __resetBillingProviderCache(): void {
  cachedProvider = null
}
