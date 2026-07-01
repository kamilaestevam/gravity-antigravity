/**
 * Mescla progresso remoto (API) e local (localStorage) — passo maior prevalece.
 */

export type ProgressoSalvoLeituraSmartRead = {
  passo: number
  nome: string
  leitura: { id_leitura: string }
}

export function escolherProgressoSalvoLeituraSmartRead<T extends ProgressoSalvoLeituraSmartRead>(
  remoto: T | null,
  local: T | null,
): T | null {
  if (!remoto && !local) return null
  if (!remoto) return local
  if (!local) return remoto
  if (local.passo > remoto.passo) return local
  if (remoto.passo > local.passo) return remoto
  return remoto
}
