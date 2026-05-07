/**
 * configurador-client.ts — Cliente S2S para o serviço Configurador
 *
 * Configurador é a fonte de verdade do conceito "Organização" no sistema.
 * Quando GABI precisa atravessar todas as orgs autorizadas (visão admin
 * global), busca a lista aqui e itera com `withOrganizacaoContext` do SDK.
 *
 * Não confundir com o cliente do SDK `@gravity/resolver-organizacao` — aquele
 * resolve UMA org por chamada (per-request). Este lista N orgs (admin/worker).
 *
 * Endpoints consumidos:
 *   GET /api/v1/internal/organizacoes      — lista orgs ativas
 *
 * Auth S2S: header `x-chave-interna-servico` com a CHAVE_INTERNA_SERVICO.
 */

const CONFIGURADOR_URL       = process.env.CONFIGURADOR_URL       ?? 'http://localhost:8000'
const CHAVE_INTERNA_SERVICO  = process.env.CHAVE_INTERNA_SERVICO  ?? process.env.CHAVE_SERVICO_INTERNO ?? ''

export interface OrganizacaoMinimal {
  id_organizacao:     string
  status_organizacao: 'ATIVO' | 'SUSPENSO' | 'CANCELADO' | 'CONFIGURACAO_PENDENTE'
}

interface ListaOrganizacoesResponse {
  organizacoes: OrganizacaoMinimal[]
}

/**
 * Lista organizações para iteração cross-org (admin/worker).
 *
 * @param opcoes.incluirInativas — quando true, retorna SUSPENSO/CANCELADO/PENDENTE também.
 *                                  Default false: apenas ATIVO (uso operacional).
 */
export async function listarOrganizacoes(
  opcoes: { incluirInativas?: boolean } = {},
): Promise<OrganizacaoMinimal[]> {
  if (!CHAVE_INTERNA_SERVICO) {
    throw new Error('[gabi/configurador-client] CHAVE_INTERNA_SERVICO ausente — chamada S2S impossivel')
  }

  const url = new URL(`${CONFIGURADOR_URL}/api/v1/internal/organizacoes`)
  if (opcoes.incluirInativas) url.searchParams.set('incluirInativas', 'true')

  const response = await fetch(url.toString(), {
    headers: {
      'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
      'Content-Type':            'application/json',
    },
    signal: AbortSignal.timeout(5_000),
  })

  if (!response.ok) {
    throw new Error(`[gabi/configurador-client] listarOrganizacoes falhou: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as ListaOrganizacoesResponse
  return data.organizacoes
}
