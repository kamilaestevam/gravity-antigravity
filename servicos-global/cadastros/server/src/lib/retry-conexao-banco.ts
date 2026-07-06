const PADROES_ERRO_TRANSITORIO = [
  "Can't reach database server",
  'Connection terminated',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'P1001',
  'P1017',
] as const

export function isErroConexaoBancoTransitorio(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return PADROES_ERRO_TRANSITORIO.some((p) => msg.includes(p))
}

export async function comRetryConexaoBanco<T>(
  operacao: () => Promise<T>,
  tentativas = 3,
): Promise<T> {
  let ultimo: unknown
  for (let i = 0; i < tentativas; i++) {
    try {
      return await operacao()
    } catch (err) {
      ultimo = err
      if (!isErroConexaoBancoTransitorio(err) || i === tentativas - 1) throw err
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
    }
  }
  throw ultimo
}
