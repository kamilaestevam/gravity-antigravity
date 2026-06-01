// verificar-cotar-bid-frete-internacional.ts — Hub/Core: card Bid Frete Internacional - Fornecedor

import { z } from 'zod'

const respostaVerificarSchema = z.object({
  permitido: z.boolean(),
})

const SLUGS_BID_FRETE = ['bid-frete-internacional', 'bid-frete'] as const

export const ROTA_ENTRADA_BID_FRETE_FORNECEDOR =
  '/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/dashboard'

export function ehSlugBidFreteInternacional(slug: string): boolean {
  return slug === 'bid-frete-internacional' || slug === 'bid-frete'
}

async function verificarSlug(
  getToken: () => Promise<string | null>,
  idWorkspace: string,
  slug: string,
): Promise<boolean> {
  const token = await getToken()
  if (!token) return false

  const qs = new URLSearchParams({
    slug_produto: slug,
    secao: 'visao_fornecedor',
    acao: 'cotar',
    id_workspace: idWorkspace,
  })

  const res = await fetch(`/api/v1/me/permissoes/verificar?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    console.warn('[Hub] GET /me/permissoes/verificar falhou', { status: res.status, slug })
    return false
  }

  const raw: unknown = await res.json()
  const parsed = respostaVerificarSchema.safeParse(raw)
  if (!parsed.success) {
    console.warn('[Hub] resposta /me/permissoes/verificar fora do contrato', parsed.error.issues)
    return false
  }

  return parsed.data.permitido
}

export async function usuarioPodeCotarBidFreteInternacional(
  getToken: () => Promise<string | null>,
  idWorkspace: string | null | undefined,
): Promise<boolean> {
  if (!idWorkspace?.trim()) return false

  for (const slug of SLUGS_BID_FRETE) {
    const permitido = await verificarSlug(getToken, idWorkspace.trim(), slug)
    if (permitido) return true
  }

  return false
}
