/**
 * Mescla progresso remoto (API) e local (localStorage).
 * Passo = maior dos dois; leitura = lado com mais extração (evita passo 3 + arquivos vazios).
 * analise_riscos_cache é sempre mesclado dos dois lados para não perder cache ao retomar.
 */

import type { AnaliseRiscosCacheProgressoLeitura } from './analise-riscos-cache-progresso-smart-read.js'
import {
  mesclarLeiturasRetomarSmartRead,
  type LeituraRetomarSmartRead,
} from './escolher-leitura-efetiva-retomar-smart-read.js'

export type ProgressoSalvoLeituraSmartRead = {
  passo: number
  nome: string
  leitura: { id_leitura: string }
  analise_riscos_cache?: AnaliseRiscosCacheProgressoLeitura
}

function mesclarProgressoSalvo<T extends ProgressoSalvoLeituraSmartRead>(a: T, b: T): T {
  const passo = Math.max(a.passo, b.passo)
  const preferidoPasso = a.passo >= b.passo ? a : b
  const complementoPasso = a.passo >= b.passo ? b : a
  const leitura = mesclarLeiturasRetomarSmartRead(
    preferidoPasso.leitura as LeituraRetomarSmartRead & T['leitura'],
    complementoPasso.leitura as LeituraRetomarSmartRead & T['leitura'],
  ) as T['leitura']

  const cacheA = a.analise_riscos_cache ?? {}
  const cacheB = b.analise_riscos_cache ?? {}
  const cacheMesclado =
    Object.keys(cacheA).length > 0 || Object.keys(cacheB).length > 0
      ? { ...cacheB, ...cacheA }
      : undefined

  return {
    ...preferidoPasso,
    passo,
    nome: preferidoPasso.nome || complementoPasso.nome,
    leitura,
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
  return mesclarProgressoSalvo(remoto, local)
}
