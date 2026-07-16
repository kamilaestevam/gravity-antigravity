/**
 * Mescla progresso remoto (Postgres) e local (localStorage).
 * Passo = maior; leitura = lado com mais extração; cache mesclado dos dois.
 */

import type { AnaliseRiscosCacheProgressoLeitura } from './analise-riscos-cache-progresso-smart-read.js'
import { type LeituraRetomarSmartRead } from './escolher-leitura-efetiva-retomar-smart-read.js'
import { escolherLeituraRetomarComConferenciaSmartRead } from './escolher-leitura-retomar-com-conferencia-smart-read.js'

export type ProgressoSalvoLeituraSmartRead = {
  passo: number
  nome: string
  leitura: { id_leitura: string }
  analise_riscos_cache?: AnaliseRiscosCacheProgressoLeitura
}

function mesclarProgressoSalvo<T extends ProgressoSalvoLeituraSmartRead>(a: T, b: T): T {
  const passo = Math.max(a.passo, b.passo)
  const leitura = escolherLeituraRetomarComConferenciaSmartRead(
    a.leitura as LeituraRetomarSmartRead & T['leitura'],
    b.leitura as LeituraRetomarSmartRead & T['leitura'],
  ) as T['leitura']

  const cacheA = a.analise_riscos_cache ?? {}
  const cacheB = b.analise_riscos_cache ?? {}
  const cacheMesclado =
    Object.keys(cacheA).length > 0 || Object.keys(cacheB).length > 0
      ? { ...cacheB, ...cacheA }
      : undefined

  return {
    ...(a.passo >= b.passo ? a : b),
    passo,
    nome: (a.passo >= b.passo ? a.nome : b.nome) || (a.passo >= b.passo ? b.nome : a.nome),
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
