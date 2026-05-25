/**
 * Cliente HTTP compartilhado para autocomplete admin de organizações.
 * GET /api/v1/admin/organizacoes — contrato real: { organizacoes, pagination }.
 */

import { z } from 'zod'

const adminOrganizacoesResponseSchema = z.object({
  organizacoes: z.array(
    z.object({
      id_organizacao:     z.string(),
      nome_organizacao:   z.string(),
      status_organizacao: z.string().optional(),
    }),
  ),
})

export interface OrganizacaoAdminOpcao {
  id_organizacao: string
  nome_organizacao: string
}

export interface BuscarOrganizacoesAdminOpts {
  busca?: string
  /** Default true — alinhado com middleware de override (org inativa → 403). */
  somenteAtivas?: boolean
  /** Default 500 — cobre a maioria das instalações sem paginar. */
  limit?: number
  baseUrl?: string
}

export async function buscarOrganizacoesAdmin(
  getToken: () => Promise<string | null>,
  opts: BuscarOrganizacoesAdminOpts = {},
): Promise<OrganizacaoAdminOpcao[]> {
  const {
    busca,
    somenteAtivas = true,
    limit = 500,
    baseUrl = import.meta.env.VITE_CONFIGURADOR_URL ?? '',
  } = opts

  try {
    const token = await getToken()
    if (!token) {
      console.warn('[buscarOrganizacoesAdmin] token ausente')
      return []
    }

    const qs = new URLSearchParams()
    qs.set('limit', String(limit))
    if (busca?.trim()) qs.set('search', busca.trim())

    const res = await fetch(
      `${baseUrl}/api/v1/admin/organizacoes?${qs.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    if (!res.ok) {
      console.warn('[buscarOrganizacoesAdmin] /admin/organizacoes retornou', res.status)
      return []
    }

    const raw: unknown = await res.json()
    const parsed = adminOrganizacoesResponseSchema.safeParse(raw)
    if (!parsed.success) {
      console.warn('[buscarOrganizacoesAdmin] resposta inválida', parsed.error.flatten())
      return []
    }

    return parsed.data.organizacoes
      .filter(org => !somenteAtivas || org.status_organizacao === 'ATIVO')
      .map(org => ({
        id_organizacao:   org.id_organizacao,
        nome_organizacao: org.nome_organizacao,
      }))
  } catch (err) {
    console.warn('[buscarOrganizacoesAdmin] erro ao buscar organizações', err)
    return []
  }
}
