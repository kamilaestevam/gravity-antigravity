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

/** Verifica `visao_fornecedor:cotar` em qualquer workspace da lista (ordem preservada). */
export async function usuarioPodeCotarBidFreteEmAlgumWorkspace(
  getToken: () => Promise<string | null>,
  idsWorkspaces: readonly string[],
): Promise<boolean> {
  for (const id of idsWorkspaces) {
    if (!id?.trim()) continue
    if (await usuarioPodeCotarBidFreteInternacional(getToken, id)) return true
  }
  return false
}

/** Primeiro workspace da lista em que o usuário pode cotar (para hidratar sessão ao abrir). */
export async function resolverPrimeiroWorkspaceComCotarBidFrete(
  getToken: () => Promise<string | null>,
  idsWorkspaces: readonly string[],
): Promise<string | null> {
  for (const id of idsWorkspaces) {
    if (!id?.trim()) continue
    if (await usuarioPodeCotarBidFreteInternacional(getToken, id)) return id.trim()
  }
  return null
}

export const SLUG_PECA_HUB_BID_FRETE_FORNECEDOR = 'bid-frete-fornecedor'

export function buildPecaHubBidFreteFornecedor(
  t: (key: string, defaultValue?: string) => string,
): {
  key: string
  slugVisual: string
  nome: string
  nomeExibicao: string
  rota: string
} {
  return {
    key: SLUG_PECA_HUB_BID_FRETE_FORNECEDOR,
    slugVisual: 'bid-frete',
    nome: t(
      'hub.produto_bid_frete_internacional_fornecedor',
      'Bid Frete Internacional - Fornecedor',
    ),
    nomeExibicao: t('hub.produto_bid_frete_fornecedor_curto', 'BID Fornecedor'),
    rota: ROTA_ENTRADA_BID_FRETE_FORNECEDOR,
  }
}

export function ehRotaEntradaVisaoFornecedorBidFrete(rota: string): boolean {
  return rota.includes('visao-fornecedor-bid-frete-internacional')
}
