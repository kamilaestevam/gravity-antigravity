/**
 * Health-check e boot de sidecars embutidos (loopback).
 */

export async function verificarHealthSidecarLoopback(
  porta: number,
  timeoutMs = 3_000,
): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${porta}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Aguarda listen() do sidecar (se exportar sidecarListenReady) e confirma /health em loopback.
 * clearTimeout garantido após Promise.race.
 */
export async function aguardarSidecarEmbutido(
  porta: number,
  sidecarListenReady?: Promise<void>,
  timeoutMs = 5_000,
): Promise<void> {
  if (sidecarListenReady) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        sidecarListenReady,
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(`Timeout aguardando listen sidecar na porta ${porta} (${timeoutMs}ms)`)),
            timeoutMs,
          )
        }),
      ])
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
    }
  }

  const healthOk = await verificarHealthSidecarLoopback(porta)
  if (!healthOk) {
    throw new Error(`Health check http://127.0.0.1:${porta}/health falhou após import do sidecar`)
  }
}

/**
 * Preflight api-cockpit: produção exige ORGANIZACAO_DATABASE_URL e CHAVE_INTERNA_SERVICO.
 * Dev: ORGANIZACAO opcional (fallback DATABASE_URL configurador); CHAVE ausente só warn.
 */
export function coletarErrosPreflightApiCockpit(emProducao: boolean): string[] {
  const erros: string[] = []
  if (!process.env.ORGANIZACAO_DATABASE_URL?.trim()) {
    if (emProducao) {
      erros.push(
        'ORGANIZACAO_DATABASE_URL ausente — tabelas api_token/log_requisicao_api indisponíveis',
      )
    } else {
      console.warn(
        '[configurador] ORGANIZACAO_DATABASE_URL ausente — dev: sidecar API Cockpit usará DATABASE_URL do configurador (tabelas api-cockpit podem faltar)',
      )
    }
  }
  if (!process.env.CHAVE_INTERNA_SERVICO?.trim()) {
    if (emProducao) {
      erros.push(
        'CHAVE_INTERNA_SERVICO ausente — rotas S2S (tokens/webhooks) retornam 403/500',
      )
    } else {
      console.warn(
        '[configurador] CHAVE_INTERNA_SERVICO ausente — dev: sidecar sobe mas tokens/webhooks falham em S2S',
      )
    }
  }
  return erros
}
