/** Recalcula streak (ofensiva) após atividade em `agora`. */

function inicioDoDia(data: Date): Date {
  const d = new Date(data)
  d.setHours(0, 0, 0, 0)
  return d
}

function diasEntre(inicio: Date, fim: Date): number {
  const ms = inicioDoDia(fim).getTime() - inicioDoDia(inicio).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export function calcularDiasOfensivaGuiaGravity(opts: {
  diasOfensivaAtual: number
  dataUltimaAtividade: Date | null
  agora?: Date
}): number {
  const { diasOfensivaAtual, dataUltimaAtividade, agora = new Date() } = opts
  if (!dataUltimaAtividade) return 1

  const diff = diasEntre(dataUltimaAtividade, agora)
  if (diff === 0) return Math.max(1, diasOfensivaAtual)
  if (diff === 1) return Math.max(1, diasOfensivaAtual) + 1
  return 1
}
