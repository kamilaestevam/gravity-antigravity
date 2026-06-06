/**
 * Meta de escopo multi-workspace — BID Frete Internacional.
 * Persistida em lista_painel_usuario_global (painel reservado, invisível na UI).
 */
import { z } from 'zod'

export const NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE =
  '__meta_escopo_workspaces_v1__' as const

export const escopoWorkspacesBidFretePersistidosSchema = z.object({
  _v: z.literal(1),
  ids_workspaces: z.array(z.string()),
})

export type EscopoWorkspacesBidFretePersistidos = z.infer<
  typeof escopoWorkspacesBidFretePersistidosSchema
>

export function serializarEscopoWorkspacesBidFrete(ids: string[]): string {
  const payload: EscopoWorkspacesBidFretePersistidos = { _v: 1, ids_workspaces: ids }
  return JSON.stringify(escopoWorkspacesBidFretePersistidosSchema.parse(payload))
}

export function parsearEscopoWorkspacesBidFrete(raw: string): string[] | undefined {
  try {
    const json: unknown = JSON.parse(raw)
    const parsed = escopoWorkspacesBidFretePersistidosSchema.safeParse(json)
    if (!parsed.success) return undefined
    return parsed.data.ids_workspaces
  } catch {
    return undefined
  }
}
