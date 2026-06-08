/**
 * Após a primeira gravação no registry, campos de rótulo/contagem pertencem ao dono.
 * Automação (agente, scripts) só pode atualizar métricas de execução.
 */
export const CAMPOS_REGISTRY_PROTEGIDOS_DONO = [
  'modulo',
  'tela',
  'casosTotal',
  'passosTotal',
] as const

export type CampoRegistryProtegidoDono = (typeof CAMPOS_REGISTRY_PROTEGIDOS_DONO)[number]

export function entradaRegistryProtegidaDono(entry: Record<string, unknown>): boolean {
  return entry.propriedade_dono === true
}

/** Mescla proposta da automação sem sobrescrever o que o dono fixou no registry. */
export function mesclarEntradaRegistryAutomacao(
  existente: Record<string, unknown>,
  proposta: Record<string, unknown>,
): Record<string, unknown> {
  if (!entradaRegistryProtegidaDono(existente)) {
    return { ...proposta, propriedade_dono: true }
  }

  const merged: Record<string, unknown> = { ...proposta }
  for (const campo of CAMPOS_REGISTRY_PROTEGIDOS_DONO) {
    if (existente[campo] !== undefined && existente[campo] !== null) {
      merged[campo] = existente[campo]
    }
  }
  merged.id = existente.id
  merged.propriedade_dono = true
  if (existente.editado_pelo_dono_em) {
    merged.editado_pelo_dono_em = existente.editado_pelo_dono_em
  }
  return merged
}

/** Nova entrada criada pela automação já nasce bloqueada para o dono. */
export function novaEntradaRegistryComPropriedadeDono(
  proposta: Record<string, unknown>,
): Record<string, unknown> {
  return { ...proposta, propriedade_dono: true }
}
