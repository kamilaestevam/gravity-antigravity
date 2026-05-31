/**
 * Marketplace Gravity — vitrine pública (sem login).
 * Dev: localhost:8001 · Prod: marketplace.gravity.com.br
 */

const URL_MARKETPLACE_GRAVITY_DEV = 'http://localhost:8001'
const URL_MARKETPLACE_GRAVITY_PROD = 'https://marketplace.gravity.com.br'

function urlBaseMarketplaceGravity(): string {
  const configurada = import.meta.env.VITE_MARKETPLACE_URL?.trim()
  if (configurada) {
    return configurada.replace(/\/$/, '')
  }
  return import.meta.env.DEV ? URL_MARKETPLACE_GRAVITY_DEV : URL_MARKETPLACE_GRAVITY_PROD
}

/** Landing pública do BID Frete no Marketplace. */
export function urlMarketplaceBidFreteInternacional(): string {
  return `${urlBaseMarketplaceGravity()}/produtos/bid-frete`
}
