/**
 * URL do Postgres BID com connect_timeout para reduzir falhas transitórias no Railway dev.
 */
export function resolverUrlBancoBidFreteInternacional(): string {
  const url = process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error('[BidFrete] BID_FRETE_INTERNATIONAL_DATABASE_URL ou DATABASE_URL ausente')
  }
  if (/connect_timeout=/i.test(url)) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}connect_timeout=30`
}
