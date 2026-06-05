/**
 * Alinha CLERK_SECRET_KEY / CLERK_PUBLISHABLE_KEY ao ambiente de execução.
 * Admin → Produção deve usar sk_live_/pk_live_ — senão @clerk/testing busca o e-mail no Clerk dev.
 */
export function ambienteRemotoProducao(): boolean {
  const flag = (process.env.GRAVITY_TEST_AMBIENTE ?? '').toLowerCase()
  if (flag === 'producao' || flag === 'production') return true
  const base = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL ?? ''
  return /usegravity\.com\.br/i.test(base) && !/localhost|127\.0\.0\.1/i.test(base)
}

export function aplicarChavesClerkParaAmbiente(): { ambiente: string; clerkSecretPrefix: string } {
  const isProd = ambienteRemotoProducao()

  if (isProd) {
    const prodSecret = process.env.CLERK_PROD_SECRET_KEY?.trim()
    const prodPk =
      process.env.CLERK_PROD_PUBLISHABLE_KEY?.trim()
      ?? process.env.VITE_CLERK_PROD_PUBLISHABLE_KEY?.trim()

    if (prodSecret) process.env.CLERK_SECRET_KEY = prodSecret
    if (prodPk) {
      process.env.CLERK_PUBLISHABLE_KEY = prodPk
      process.env.VITE_CLERK_PUBLISHABLE_KEY = prodPk
    }
  }

  if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
  }

  const secret = process.env.CLERK_SECRET_KEY ?? ''
  const prefix = secret.startsWith('sk_live_') ? 'sk_live' : secret.startsWith('sk_test_') ? 'sk_test' : '(ausente)'
  const ambiente = isProd ? 'producao' : (process.env.GRAVITY_TEST_AMBIENTE ?? 'local')

  return { ambiente, clerkSecretPrefix: prefix }
}
