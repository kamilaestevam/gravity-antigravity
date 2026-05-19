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
 *   GET /api/v1/internal/organizacoes          — lista orgs ativas
 *   GET /api/v1/internal/gabi/limites-globais  — limites monetarios cross-org
 *
 * Auth S2S: header `x-chave-interna-servico` com a CHAVE_INTERNA_SERVICO.
 */

const CONFIGURADOR_URL       = process.env.CONFIGURADOR_URL       ?? 'http://localhost:8005'
const CHAVE_INTERNA_SERVICO  = process.env.CHAVE_INTERNA_SERVICO ?? ''

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

// ---------------------------------------------------------------------------
// Limites monetarios GLOBAIS — F2 do Monitor LLM
// ---------------------------------------------------------------------------

/**
 * Limite GLOBAL (cross-org) na fronteira de rede.
 * Decimal serializado como string (precisao mantida); converter com Number()
 * no consumidor — JS nao tem Decimal nativo.
 */
export interface LimiteGlobalRedePayload {
  id_gabi_limite_monetario_global:                  string
  modelo_gabi_limite_monetario_global:              string | null
  limite_aviso_usd_gabi_limite_monetario_global:    string
  limite_bloqueio_usd_gabi_limite_monetario_global: string
  destinatarios_email_gabi_limite_monetario_global: string[]
  ativo_gabi_limite_monetario_global:               boolean
  data_criacao_gabi_limite_monetario_global:        string
  data_atualizacao_gabi_limite_monetario_global:    string
}

interface ListaLimitesGlobaisResponse {
  limites: LimiteGlobalRedePayload[]
}

/**
 * Lista limites monetarios GLOBAIS configurados no Configurador.
 * Usado pelo limiteMonetarioService para avaliar bloqueio cross-org e pelo
 * worker horario para disparar avisos por e-mail.
 *
 * Filtros opcionais (server-side):
 *   - modelo: filtra exato; se omitido, retorna todos os limites (incluindo o
 *     "todos os modelos" com modelo NULL)
 *   - somenteAtivos: default true (limites desativados nao bloqueiam)
 */
export async function listarLimitesGlobais(
  opcoes: { modelo?: string; somenteAtivos?: boolean } = {},
): Promise<LimiteGlobalRedePayload[]> {
  if (!CHAVE_INTERNA_SERVICO) {
    throw new Error('[gabi/configurador-client] CHAVE_INTERNA_SERVICO ausente — chamada S2S impossivel')
  }

  const url = new URL(`${CONFIGURADOR_URL}/api/v1/internal/gabi/limites-globais`)
  if (opcoes.modelo)                        url.searchParams.set('modelo', opcoes.modelo)
  if (opcoes.somenteAtivos !== false)       url.searchParams.set('ativo', 'true')

  const response = await fetch(url.toString(), {
    headers: {
      'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
      'Content-Type':            'application/json',
    },
    signal: AbortSignal.timeout(5_000),
  })

  if (!response.ok) {
    throw new Error(`[gabi/configurador-client] listarLimitesGlobais falhou: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as ListaLimitesGlobaisResponse
  return data.limites
}
