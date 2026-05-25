/**
 * preferenciasUsuarioColunaPedido.ts — SSOT para meta de escopo de workspaces
 * embutida em `colunas_largura_preferencia_usuario_coluna_pedido` (JSON).
 *
 * Sem migration: chave reservada convive com larguras numéricas por coluna.
 */

import { z } from 'zod'

export const ESCOPO_WORKSPACES_META_KEY = '__workspaces_escopo_v1__'
export const AVISO_ESCOPO_HUB_META_KEY = '__hub_aviso_escopo_pedido_v1__'

const META_KEYS_RESERVADAS = new Set([
  ESCOPO_WORKSPACES_META_KEY,
  AVISO_ESCOPO_HUB_META_KEY,
])

function ehMetaKeyColunasLargura(key: string): boolean {
  return META_KEYS_RESERVADAS.has(key)
}

export const escopoWorkspacesPersistidosSchema = z.object({
  _v: z.literal(1),
  ids_workspaces: z.array(z.string()),
})

export const avisoEscopoHubPersistidoSchema = z.object({
  _v: z.literal(1),
  suprimir: z.boolean(),
})

export type EscopoWorkspacesPersistidos = z.infer<typeof escopoWorkspacesPersistidosSchema>
export type AvisoEscopoHubPersistido = z.infer<typeof avisoEscopoHubPersistidoSchema>

export type ColunasLarguraGravacao = Record<string, unknown>

function ehObjetoRecord(valor: unknown): valor is Record<string, unknown> {
  return valor != null && typeof valor === 'object' && !Array.isArray(valor)
}

export function extrairEscopoWorkspacesDeColunasLargura(colunasLargura: unknown): string[] | undefined {
  if (!ehObjetoRecord(colunasLargura)) return undefined
  const parsed = escopoWorkspacesPersistidosSchema.safeParse(colunasLargura[ESCOPO_WORKSPACES_META_KEY])
  if (!parsed.success) return undefined
  return parsed.data.ids_workspaces
}

export function extrairSuprimirAvisoEscopoHubDeColunasLargura(colunasLargura: unknown): boolean | undefined {
  if (!ehObjetoRecord(colunasLargura)) return undefined
  const parsed = avisoEscopoHubPersistidoSchema.safeParse(colunasLargura[AVISO_ESCOPO_HUB_META_KEY])
  if (!parsed.success) return undefined
  return parsed.data.suprimir
}

/** Remove meta key — só larguras numéricas para o contrato público. */
export function colunasLarguraParaCliente(colunasLargura: unknown): Record<string, number> | undefined {
  if (!ehObjetoRecord(colunasLargura)) return undefined
  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(colunasLargura)) {
    if (ehMetaKeyColunasLargura(key)) continue
    if (typeof value === 'number' && Number.isFinite(value)) {
      result[key] = value
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function mesclarLargurasNumericas(
  existente: unknown,
  novas: Record<string, number> | undefined,
): ColunasLarguraGravacao | null {
  const base: ColunasLarguraGravacao = ehObjetoRecord(existente) ? { ...existente } : {}

  for (const key of Object.keys(base)) {
    if (ehMetaKeyColunasLargura(key)) continue
    const valor = base[key]
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      delete base[key]
    }
  }

  if (novas) {
    for (const [key, value] of Object.entries(novas)) {
      if (ehMetaKeyColunasLargura(key)) continue
      if (typeof value === 'number' && Number.isFinite(value)) {
        base[key] = value
      }
    }
  }

  const temMeta = Object.keys(base).some(ehMetaKeyColunasLargura)
  const temNumerico = Object.keys(base).some(k => !ehMetaKeyColunasLargura(k))
  if (!temMeta && !temNumerico) return null
  return base
}

/** `idsWorkspaces === undefined` preserva escopo existente; array vazio remove meta. */
export function mesclarEscopoEmColunasLargura(
  existente: unknown,
  idsWorkspaces: string[] | undefined,
): ColunasLarguraGravacao | null {
  const base = mesclarLargurasNumericas(existente, undefined) ?? {}

  if (idsWorkspaces !== undefined) {
    if (idsWorkspaces.length === 0) {
      delete base[ESCOPO_WORKSPACES_META_KEY]
    } else {
      const payload: EscopoWorkspacesPersistidos = { _v: 1, ids_workspaces: idsWorkspaces }
      base[ESCOPO_WORKSPACES_META_KEY] = payload
    }
  }

  return Object.keys(base).length > 0 ? base : null
}

/** `suprimir === undefined` preserva valor existente; `false` remove meta. */
export function mesclarSuprimirAvisoEscopoHubEmColunasLargura(
  existente: unknown,
  suprimir: boolean | undefined,
): ColunasLarguraGravacao | null {
  const base = mesclarLargurasNumericas(existente, undefined) ?? {}

  if (suprimir !== undefined) {
    if (!suprimir) {
      delete base[AVISO_ESCOPO_HUB_META_KEY]
    } else {
      const payload: AvisoEscopoHubPersistido = { _v: 1, suprimir: true }
      base[AVISO_ESCOPO_HUB_META_KEY] = payload
    }
  }

  return Object.keys(base).length > 0 ? base : null
}
