/** Número legível da cotação individual (avulsa ou filha de BID). */
export function gerarNumeroCotacaoFreteInternacional(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `COT-${date}-${seq}`
}

/** Número legível do agrupador BID (conjunto de cotações). */
export function gerarNumeroBidFreteInternacional(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `BID-${y}${m}${d}-${seq}`
}
