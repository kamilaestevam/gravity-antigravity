/**
 * Mescla progresso remoto (API) e local (localStorage) — passo maior prevalece.
 * analise_riscos_cache é sempre mesclado dos dois lados para não perder cache ao retomar.
 */

import type { AnaliseRiscosCacheProgressoLeitura } from './analise-riscos-cache-progresso-smart-read.js'

export type ProgressoSalvoLeituraSmartRead = {
  passo: number
  nome: string
  leitura: { id_leitura: string }
  analise_riscos_cache?: AnaliseRiscosCacheProgressoLeitura
}

function mesclarProgressoSalvo<T extends ProgressoSalvoLeituraSmartRead>(
  preferido: T,
  complemento: T,
): T {
  const cachePreferido = preferido.analise_riscos_cache ?? {}
  const cacheComplemento = complemento.analise_riscos_cache ?? {}
  const cacheMesclado =
    Object.keys(cachePreferido).length > 0 || Object.keys(cacheComplemento).length > 0
      ? { ...cacheComplemento, ...cachePreferido }
      : undefined

  return {
    ...preferido,
    ...(cacheMesclado ? { analise_riscos_cache: cacheMesclado } : {}),
  }
}

export function escolherProgressoSalvoLeituraSmartRead<T extends ProgressoSalvoLeituraSmartRead>(
  remoto: T | null,
  local: T | null,
): T | null {
  if (!remoto && !local) return null
  if (!remoto) return local
  if (!local) return remoto
  if (local.passo > remoto.passo) return mesclarProgressoSalvo(local, remoto)
  if (remoto.passo > local.passo) return mesclarProgressoSalvo(remoto, local)
  return mesclarProgressoSalvo(remoto, local)
}
