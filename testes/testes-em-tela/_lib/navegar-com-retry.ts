import type { Page } from 'playwright'
import { ambienteRemotoProducao } from './aplicar-chaves-clerk-ambiente.js'

type OpcoesNavegar = {
  waitUntil?: 'domcontentloaded' | 'load' | 'networkidle'
  tentativas?: number
}

/**
 * `page.goto` com retentativas — Produção (usegravity.com.br) costuma responder em 5–15s
 * e ocasionalmente dispara `net::ERR_CONNECTION_TIMED_OUT` na primeira tentativa.
 */
export async function navegarComRetry(
  page: Page,
  url: string,
  opts?: OpcoesNavegar,
): Promise<void> {
  const remoto = ambienteRemotoProducao()
  const tentativas = opts?.tentativas ?? (remoto ? 3 : 2)
  const timeoutMs = remoto ? 90_000 : 60_000
  const waitUntil = opts?.waitUntil ?? 'domcontentloaded'

  let ultimoErro: Error | null = null

  for (let i = 1; i <= tentativas; i++) {
    try {
      await page.goto(url, { waitUntil, timeout: timeoutMs })
      return
    } catch (err) {
      ultimoErro = err instanceof Error ? err : new Error(String(err))
      if (i < tentativas) {
        await page.waitForTimeout(2500 * i)
      }
    }
  }

  const dica = remoto
    ? ' Produção indisponível ou lenta neste momento — confira https://usegravity.com.br/login no browser ou rode o EMT em **Local** (localhost:8000 com Pedido no ar).'
    : ' Verifique se o Configurador/Pedido está rodando na porta do agente (ex.: localhost:5000).'

  throw new Error(`${ultimoErro?.message ?? 'Falha ao navegar'}${dica}`)
}
