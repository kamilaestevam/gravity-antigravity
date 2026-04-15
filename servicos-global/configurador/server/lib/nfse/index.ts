// server/lib/nfse/index.ts
// Factory do NfseProvider.
// Lê a env NFSE_PROVIDER para decidir qual provider usar.
// Providers: 'abrasf_florianopolis' (skeleton), 'nfeio' (TODO), 'enotas' (TODO).

import { logger } from '../logger.js'
import type { NfseProvider } from './types.js'
import { ContaAzulNfseProvider } from './contaAzulNfse.js'
import { AbrasfFlorianopolisProvider } from './abrasfFlorianopolis.js'

export * from './types.js'

const log = logger.child({ module: 'nfse-factory' })

let cachedProvider: NfseProvider | null = null

/**
 * Retorna o provider configurado, ou null se nenhum estiver disponível.
 * Chamadores devem tratar null como "NF-e não configurada — seguir sem emitir".
 *
 * Provider OFICIAL do Gravity: `conta_azul` (emissão integrada ao ERP).
 * Skeleton alternativo: `abrasf_florianopolis` (direto na prefeitura).
 */
export async function getNfseProvider(): Promise<NfseProvider | null> {
  if (cachedProvider) return cachedProvider

  const choice = (process.env.NFSE_PROVIDER ?? '').toLowerCase()

  if (!choice) {
    log.debug('NFSE_PROVIDER não configurada — emissão desabilitada')
    return null
  }

  let provider: NfseProvider
  switch (choice) {
    case 'conta_azul':
      provider = new ContaAzulNfseProvider()
      break
    case 'abrasf_florianopolis':
      provider = new AbrasfFlorianopolisProvider()
      break
    default:
      log.warn('NFSE_PROVIDER desconhecida', { choice })
      return null
  }

  const available = await provider.isAvailable()
  if (!available) {
    log.warn('NFSE provider configurada mas não disponível (env vars faltando)', { provider: provider.name })
    return null
  }

  cachedProvider = provider
  log.info('nfse provider selected', { provider: provider.name })
  return provider
}

export function __resetNfseProviderCache(): void {
  cachedProvider = null
}
