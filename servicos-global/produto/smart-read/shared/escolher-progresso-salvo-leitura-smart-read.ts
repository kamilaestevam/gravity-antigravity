/**
 * Progresso remoto (Postgres) é SSOT para o corpo da leitura.
 * localStorage só entra se a API falhar; passo/cache podem ser elevados pelo local.
 */

import type { AnaliseRiscosCacheProgressoLeitura } from './analise-riscos-cache-progresso-smart-read.js'

export type ProgressoSalvoLeituraSmartRead = {
  passo: number
  nome: string
  leitura: { id_leitura: string }
  analise_riscos_cache?: AnaliseRiscosCacheProgressoLeitura
}

function mesclarCacheProgresso<T extends ProgressoSalvoLeituraSmartRead>(a: T, b: T): T {
  const cacheA = a.analise_riscos_cache ?? {}
  const cacheB = b.analise_riscos_cache ?? {}
  const cacheMesclado =
    Object.keys(cacheA).length > 0 || Object.keys(cacheB).length > 0
      ? { ...cacheB, ...cacheA }
      : undefined

  return {
    ...a,
    passo: Math.max(a.passo, b.passo),
    nome: a.nome || b.nome,
    ...(cacheMesclado ? { analise_riscos_cache: cacheMesclado } : {}),
  } as T
}

export function escolherProgressoSalvoLeituraSmartRead<T extends ProgressoSalvoLeituraSmartRead>(
  remoto: T | null,
  local: T | null,
): T | null {
  if (!remoto && !local) return null
  if (!remoto) return local
  if (!local) return remoto
  return mesclarCacheProgresso(remoto, local)
}
