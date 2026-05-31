/**
 * Resolve nome do importador/exportador (workspace) para tela de resposta do fornecedor.
 * Nunca retorna nome quando a cotação está anônima.
 */

import { z } from 'zod'

const workspacesBatchResponseSchema = z.object({
  workspaces: z.array(
    z.object({
      id_workspace: z.string(),
      nome_workspace: z.string(),
    }),
  ),
})

export async function obterMapaNomesWorkspacePorIds(
  ids: string[],
): Promise<Map<string, string>> {
  const idsUnicos = [...new Set(ids.filter((id) => id && id.trim().length > 0))]
  const mapa = new Map<string, string>()
  if (idsUnicos.length === 0) return mapa

  const baseUrl = process.env.CONFIGURATOR_URL?.replace(/\/$/, '')
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO
  if (!baseUrl || !chaveInterna) {
    console.warn(
      '[bid-frete/resposta-fornecedor] CONFIGURATOR_URL ou CHAVE_INTERNA_SERVICO ausente — nome do cliente não resolvido',
    )
    return mapa
  }

  const params = new URLSearchParams({ ids: idsUnicos.join(',') })
  const res = await fetch(`${baseUrl}/api/v1/internal/workspaces?${params.toString()}`, {
    headers: {
      'x-chave-interna-servico': chaveInterna,
      'x-internal-key': chaveInterna,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) {
    console.warn(
      `[bid-frete/resposta-fornecedor] Configurador HTTP ${res.status} ao obter workspaces`,
    )
    return mapa
  }

  const parsed = workspacesBatchResponseSchema.safeParse(await res.json())
  if (!parsed.success) {
    console.warn('[bid-frete/resposta-fornecedor] Resposta inválida do Configurador (workspaces batch)')
    return mapa
  }

  for (const ws of parsed.data.workspaces) {
    mapa.set(ws.id_workspace, ws.nome_workspace)
  }
  return mapa
}

export function resolverNomeClienteOperacaoCotacaoResposta(input: {
  id_workspace?: string | null
  anonima_cotacao_bid_frete_internacional?: boolean | null
  mapaNomesWorkspace: Map<string, string>
}): string | null {
  if (input.anonima_cotacao_bid_frete_internacional) return null
  const idWorkspace = input.id_workspace?.trim()
  if (!idWorkspace) return null
  return input.mapaNomesWorkspace.get(idWorkspace) ?? null
}
