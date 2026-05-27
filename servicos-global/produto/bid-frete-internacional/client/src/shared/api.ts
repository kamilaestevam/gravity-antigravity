/// <reference types="vite/client" />
/**
 * api.ts — Funções de chamada da API do BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */

import type {
  Cotacao,
  CotacoesListResponse,
  Fornecedor,
  FornecedoresListResponse,
  DisparoCotacaoBidFreteInternacional,
  PropostaBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  DashboardKPIs,
  CalendarioAlerta,
  TabelaPreco,
  Avaliacao,
  Porto,
  Moeda,
  Pais,
  Aeroporto,
  ContainerOption,
  IncotermOption,
  StatusCotacao,
} from './types'

const API_BASE = '/api/v1'

const headers = () => {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
  }

  const orgId =
    sessionStorage.getItem('gravity_id_organizacao') ||
    import.meta.env.VITE_ID_ORGANIZACAO ||
    import.meta.env.VITE_DEV_TENANT_ID ||
    'org_dev_default'

  const idWorkspace =
    sessionStorage.getItem('gravity_id_workspace') ||
    sessionStorage.getItem('gravity_company_id') ||
    ''

  const userId =
    sessionStorage.getItem('gravity_id_usuario') ||
    import.meta.env.VITE_USER_ID ||
    'user_dev_default'

  customHeaders['x-id-organizacao'] = orgId
  customHeaders['x-id-usuario'] = userId
  if (idWorkspace) customHeaders['x-id-workspace'] = idWorkspace

  return customHeaders
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status}`)
  }
  return res.json()
}

// ─── Serialização (Date → ISO) ───────────────────────────────────────────────

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(serializeValue)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serializeValue(v)]),
    )
  }
  return value
}

export function mapFornecedorFromServer(rawUnknown: unknown): Fornecedor {
  return serializeValue(rawUnknown) as Fornecedor
}

export function mapPropostaBidFreteInternacionalFromServer(rawUnknown: unknown): PropostaBidFreteInternacional {
  const raw = serializeValue(rawUnknown) as Record<string, unknown>
  const fornecedor = raw.fornecedor ? mapFornecedorFromServer(raw.fornecedor) : undefined
  return {
    id_proposta_bid_frete_internacional: raw.id_proposta_bid_frete_internacional as string,
    id_organizacao: raw.id_organizacao as string,
    id_cotacao_bid_frete_internacional: raw.id_cotacao_bid_frete_internacional as string,
    id_fornecedor_bid_frete_internacional: raw.id_fornecedor_bid_frete_internacional as string,
    id_disparo_cotacao_bid_frete_internacional:
      (raw.id_disparo_cotacao_bid_frete_internacional ??
        raw.id_pedido_cotacao_bid_frete_internacional) as string,
    moeda_proposta_bid_frete_internacional:
      (raw.moeda_proposta_bid_frete_internacional ?? raw.moeda_ganho_bid_frete_internacional ?? 'USD') as string,
    valor_frete_proposta_bid_frete_internacional: Number(raw.valor_frete_proposta_bid_frete_internacional),
    taxas_origem_proposta_bid_frete_internacional: Number(raw.taxas_origem_proposta_bid_frete_internacional),
    taxas_destino_proposta_bid_frete_internacional: Number(raw.taxas_destino_proposta_bid_frete_internacional),
    valor_total_proposta_bid_frete_internacional: Number(raw.valor_total_proposta_bid_frete_internacional),
    dias_transito_proposta_bid_frete_internacional: Number(raw.dias_transito_proposta_bid_frete_internacional),
    dias_free_time_proposta_bid_frete_internacional:
      raw.dias_free_time_proposta_bid_frete_internacional != null
        ? Number(raw.dias_free_time_proposta_bid_frete_internacional)
        : null,
    quantidade_transbordo_proposta_bid_frete_internacional: Number(
      raw.quantidade_transbordo_proposta_bid_frete_internacional ??
        raw.transbordos_proposta_bid_frete_internacional ??
        0,
    ),
    quantidade_escala_proposta_bid_frete_internacional: Number(
      raw.quantidade_escala_proposta_bid_frete_internacional ?? raw.escalas_proposta_bid_frete_internacional ?? 0,
    ),
    validade_proposta_bid_frete_internacional:
      (raw.validade_proposta_bid_frete_internacional ?? raw.validade) as string,
    observacoes_proposta_bid_frete_internacional:
      (raw.observacoes_proposta_bid_frete_internacional as string | null) ?? null,
    status_proposta_bid_frete_internacional: raw.status_proposta_bid_frete_internacional as string,
    classificacao_valor_proposta_bid_frete_internacional:
      raw.classificacao_valor_proposta_bid_frete_internacional as number | null | undefined,
    classificacao_transito_proposta_bid_frete_internacional:
      raw.classificacao_transito_proposta_bid_frete_internacional as number | null | undefined,
    classificacao_avaliacao_proposta_bid_frete_internacional:
      raw.classificacao_avaliacao_proposta_bid_frete_internacional as number | null | undefined,
    data_criacao_proposta_bid_frete_internacional:
      (raw.data_criacao_proposta_bid_frete_internacional ?? raw.created_at) as string,
    data_atualizacao_proposta_bid_frete_internacional:
      (raw.data_atualizacao_proposta_bid_frete_internacional ?? raw.updated_at) as string,
    fornecedor,
    cotacao: raw.cotacao ? mapCotacaoFromServer(raw.cotacao) : undefined,
  }
}

export function mapDisparoCotacaoBidFreteInternacionalFromServer(
  rawUnknown: unknown,
): DisparoCotacaoBidFreteInternacional {
  const raw = serializeValue(rawUnknown) as Record<string, unknown>
  const propostaRaw = raw.proposta ?? raw.response
  return {
    id_disparo_cotacao_bid_frete_internacional:
      (raw.id_disparo_cotacao_bid_frete_internacional ??
        raw.id_pedido_cotacao_bid_frete_internacional) as string,
    id_organizacao: raw.id_organizacao as string,
    id_cotacao_bid_frete_internacional: raw.id_cotacao_bid_frete_internacional as string,
    id_fornecedor_bid_frete_internacional: raw.id_fornecedor_bid_frete_internacional as string,
    canal_disparo_cotacao_bid_frete_internacional:
      (raw.canal_disparo_cotacao_bid_frete_internacional ??
        raw.canal_pedido_cotacao_bid_frete_internacional) as DisparoCotacaoBidFreteInternacional['canal_disparo_cotacao_bid_frete_internacional'],
    status_disparo_cotacao_bid_frete_internacional:
      (raw.status_disparo_cotacao_bid_frete_internacional ??
        raw.status_pedido_cotacao_bid_frete_internacional) as DisparoCotacaoBidFreteInternacional['status_disparo_cotacao_bid_frete_internacional'],
    token_resposta_disparo_cotacao_bid_frete_internacional:
      (raw.token_resposta_disparo_cotacao_bid_frete_internacional ??
        raw.token_resposta_pedido_cotacao_bid_frete_internacional ??
        null) as string | null,
    data_envio_disparo_cotacao_bid_frete_internacional:
      (raw.data_envio_disparo_cotacao_bid_frete_internacional ??
        raw.data_envio_pedido_cotacao_bid_frete_internacional ??
        null) as string | null,
    data_visualizacao_disparo_cotacao_bid_frete_internacional:
      (raw.data_visualizacao_disparo_cotacao_bid_frete_internacional ??
        raw.data_visualizacao_pedido_cotacao_bid_frete_internacional ??
        null) as string | null,
    data_resposta_disparo_cotacao_bid_frete_internacional:
      (raw.data_resposta_disparo_cotacao_bid_frete_internacional ??
        raw.data_resposta_pedido_cotacao_bid_frete_internacional ??
        null) as string | null,
    data_expiracao_token_disparo_cotacao_bid_frete_internacional:
      (raw.data_expiracao_token_disparo_cotacao_bid_frete_internacional ??
        raw.data_expiracao_token_pedido_cotacao_bid_frete_internacional ??
        null) as string | null,
    data_criacao_disparo_cotacao_bid_frete_internacional:
      (raw.data_criacao_disparo_cotacao_bid_frete_internacional ??
        raw.data_criacao_pedido_cotacao_bid_frete_internacional) as string,
    data_atualizacao_disparo_cotacao_bid_frete_internacional:
      (raw.data_atualizacao_disparo_cotacao_bid_frete_internacional ??
        raw.data_atualizacao_pedido_cotacao_bid_frete_internacional) as string,
    fornecedor: raw.fornecedor ? mapFornecedorFromServer(raw.fornecedor) : undefined,
    proposta: propostaRaw ? mapPropostaBidFreteInternacionalFromServer(propostaRaw) : undefined,
    cotacao: raw.cotacao ? mapCotacaoFromServer(raw.cotacao) : undefined,
  }
}

export function mapPropostaRankingBidFreteInternacionalFromServer(
  rawUnknown: unknown,
): PropostaRankingBidFreteInternacional {
  const raw = serializeValue(rawUnknown) as Record<string, unknown>
  const base = mapPropostaBidFreteInternacionalFromServer(raw)
  const nomeFlat = raw.fornecedor_nome as string | undefined
  const tipoFlat = raw.fornecedor_tipo as string | undefined
  const fornecedor =
    nomeFlat && !base.fornecedor
      ? ({
          id_fornecedor_bid_frete_internacional: base.id_fornecedor_bid_frete_internacional,
          id_organizacao: base.id_organizacao,
          nome_fornecedor_bid_frete_internacional: nomeFlat,
          nome_fantasia_fornecedor_bid_frete_internacional: null,
          tipo_fornecedor_bid_frete_internacional: (tipoFlat ?? 'AGENTE_CARGA') as Fornecedor['tipo_fornecedor_bid_frete_internacional'],
          status_fornecedor_bid_frete_internacional: 'ATIVO',
          cnpj_fornecedor_bid_frete_internacional: null,
          email_fornecedor_bid_frete_internacional: '',
          telefone_fornecedor_bid_frete_internacional: null,
          whatsapp_fornecedor_bid_frete_internacional: null,
          website_fornecedor_bid_frete_internacional: null,
          pais_fornecedor_bid_frete_internacional: null,
          cidade_fornecedor_bid_frete_internacional: null,
          aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
          cotacao_automatica_fornecedor_bid_frete_internacional: false,
          data_criacao_fornecedor_bid_frete_internacional: '',
          data_atualizacao_fornecedor_bid_frete_internacional: '',
        } satisfies Fornecedor)
      : base.fornecedor

  return {
    ...base,
    fornecedor,
    moeda_proposta_bid_frete_internacional:
      (raw.moeda_proposta_bid_frete_internacional ??
        raw.moeda_ganho_bid_frete_internacional ??
        base.moeda_proposta_bid_frete_internacional) as string,
    ranking_geral: Number(raw.ranking_geral ?? 0),
    fornecedor_nome: nomeFlat,
    fornecedor_tipo: tipoFlat,
    tags: (raw.tags as string[] | undefined) ?? [],
    nota_global_classificacao_bid_frete_internacional:
      (raw.nota_global_classificacao_bid_frete_internacional as number | null | undefined) ?? null,
    classificacao_valor_proposta_bid_frete_internacional:
      (raw.classificacao_valor_proposta_bid_frete_internacional as number | undefined) ??
      base.classificacao_valor_proposta_bid_frete_internacional,
    classificacao_transito_proposta_bid_frete_internacional:
      (raw.classificacao_transito_proposta_bid_frete_internacional as number | undefined) ??
      base.classificacao_transito_proposta_bid_frete_internacional,
    classificacao_avaliacao_proposta_bid_frete_internacional:
      (raw.classificacao_avaliacao_proposta_bid_frete_internacional as number | undefined) ??
      base.classificacao_avaliacao_proposta_bid_frete_internacional,
  }
}

export function mapCotacaoFromServer(rawUnknown: unknown): Cotacao {
  const raw = serializeValue(rawUnknown) as Record<string, unknown>
  const propostasRaw =
    (raw.propostas_bid_frete_internacional as unknown[] | undefined) ??
    (raw.propostas as unknown[] | undefined) ??
    []
  const disparosRaw =
    (raw.disparo_cotacao_bid_frete_internacional as unknown[] | undefined) ??
    (raw.disparos_cotacao as unknown[] | undefined) ??
    []

  const propostas = propostasRaw.map(mapPropostaBidFreteInternacionalFromServer)
  const aprovada = propostas.find((p) => p.status_proposta_bid_frete_internacional === 'APROVADA')

  return {
    ...(raw as unknown as Cotacao),
    id_cotacao_bid_frete_internacional:
      (raw.id_cotacao_bid_frete_internacional ?? raw.id) as string,
    status_cotacao_bid_frete_internacional:
      (raw.status_cotacao_bid_frete_internacional ?? raw.status) as Cotacao['status_cotacao_bid_frete_internacional'],
    data_criacao_cotacao_bid_frete_internacional:
      (raw.data_criacao_cotacao_bid_frete_internacional ?? raw.created_at) as string,
    data_atualizacao_cotacao_bid_frete_internacional:
      (raw.data_atualizacao_cotacao_bid_frete_internacional ?? raw.updated_at) as string,
    valor_aprovado_ganho_bid_frete_internacional:
      (raw.valor_aprovado_ganho_bid_frete_internacional as number | null | undefined) ??
      (aprovada ? aprovada.valor_total_proposta_bid_frete_internacional : null),
    moeda_aprovada:
      (raw.moeda_aprovada as string | null | undefined) ??
      (aprovada ? aprovada.moeda_proposta_bid_frete_internacional : null),
    disparo_cotacao_bid_frete_internacional: disparosRaw.map(mapDisparoCotacaoBidFreteInternacionalFromServer),
    propostas_bid_frete_internacional: propostas,
  }
}

export function mapCotacaoToServer(input: Partial<Cotacao>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...input }
  delete result.disparo_cotacao_bid_frete_internacional
  delete result.propostas_bid_frete_internacional
  return result
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKPIs> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/kpis`, { headers: headers() })
  return handleResponse(res)
}

export async function getDashboardCalendario(): Promise<CalendarioAlerta[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/calendario`, { headers: headers() })
  return handleResponse(res)
}

// ─── Cotações CRUD ──────────────────────────────────────────────────────────

export interface CotacoesListParams {
  status?: StatusCotacao
  page?: number
  limit?: number
  busca?: string
}

export async function getCotacoes(params: CotacoesListParams = {}): Promise<CotacoesListResponse> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.busca) query.set('busca', params.busca)
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes?${query}`, { headers: headers() })
  const data = await handleResponse<CotacoesListResponse>(res)
  return {
    ...data,
    cotacoes: (data.cotacoes || []).map(mapCotacaoFromServer),
  }
}

export async function getCotacao(id: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, { headers: headers() })
  const data = await handleResponse<{ cotacao: unknown }>(res)
  return mapCotacaoFromServer(data.cotacao)
}

export async function criarCotacao(input: Partial<Cotacao>): Promise<Cotacao> {
  const serverInput = mapCotacaoToServer(input)
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(serverInput),
  })
  const data = await handleResponse<{ cotacao: unknown }>(res)
  return mapCotacaoFromServer(data.cotacao)
}

export async function atualizarCotacao(id: string, input: Partial<Cotacao>): Promise<Cotacao> {
  const serverInput = mapCotacaoToServer(input)
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(serverInput),
  })
  const data = await handleResponse<{ cotacao: unknown }>(res)
  return mapCotacaoFromServer(data.cotacao)
}

export async function mudarStatusCotacao(id: string, status: StatusCotacao): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  const data = await handleResponse<{ cotacao: unknown }>(res)
  return mapCotacaoFromServer(data.cotacao)
}

export async function excluirCotacao(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Erro ${res.status} ao excluir cotação`)
}

// ─── Solicitação de cotação (disparo) ───────────────────────────────────────

const SOLICITACAO_COTACAO_BASE = `${API_BASE}/bid-frete-internacional/solicitacao-cotacao-bid-frete-internacional`

export async function dispararCotacaoBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
  fornecedor_ids: string[],
  canais: string[],
): Promise<unknown> {
  const res = await fetch(`${SOLICITACAO_COTACAO_BASE}/disparar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id_cotacao_bid_frete_internacional, fornecedor_ids, canais }),
  })
  return handleResponse(res)
}

export async function getDisparoPorCotacaoBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
): Promise<DisparoCotacaoBidFreteInternacional[]> {
  const res = await fetch(`${SOLICITACAO_COTACAO_BASE}/cotacao/${id_cotacao_bid_frete_internacional}`, {
    headers: headers(),
  })
  const data = await handleResponse<{ disparo_cotacao_bid_frete_internacional?: unknown[] }>(res)
  const lista = data.disparo_cotacao_bid_frete_internacional ?? []
  return lista.map(mapDisparoCotacaoBidFreteInternacionalFromServer)
}

// ─── Comparativo ────────────────────────────────────────────────────────────

export async function rankingCotacoesBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
): Promise<PropostaRankingBidFreteInternacional[]> {
  const res = await fetch(
    `${API_BASE}/bid-frete-internacional/comparativo/${id_cotacao_bid_frete_internacional}/classificacao`,
    { headers: headers() },
  )
  const data = await handleResponse<{ ranking?: unknown[] }>(res)
  return (data.ranking ?? []).map(mapPropostaRankingBidFreteInternacionalFromServer)
}

export async function aprovarResposta(cotacaoId: string, responseId: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/aprovar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id_proposta_bid_frete_internacional: responseId }),
  })
  const data = await handleResponse<{ cotacao: unknown }>(res)
  return mapCotacaoFromServer(data.cotacao)
}

export async function reprovarTodas(cotacaoId: string, motivo: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/reprovar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ motivo }),
  })
  const data = await handleResponse<{ cotacao: unknown }>(res)
  return mapCotacaoFromServer(data.cotacao)
}

// ─── Fornecedores ───────────────────────────────────────────────────────────

export interface FornecedoresListParams {
  tipo?: string
  status?: string
  busca?: string
  page?: number
  limit?: number
}

export async function getFornecedores(params: FornecedoresListParams = {}): Promise<FornecedoresListResponse> {
  const query = new URLSearchParams()
  if (params.tipo) query.set('tipo', params.tipo)
  if (params.status) query.set('status', params.status)
  if (params.busca) query.set('busca', params.busca)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores?${query}`, { headers: headers() })
  const data = await handleResponse<FornecedoresListResponse>(res)
  return {
    ...data,
    fornecedores: (data.fornecedores ?? []).map(mapFornecedorFromServer),
  }
}

export async function getFornecedor(id_fornecedor_bid_frete_internacional: string): Promise<Fornecedor> {
  const res = await fetch(
    `${API_BASE}/bid-frete-internacional/fornecedores/${id_fornecedor_bid_frete_internacional}`,
    { headers: headers() },
  )
  const raw = await handleResponse<unknown>(res)
  return mapFornecedorFromServer(raw)
}

export async function getTabelaPrecos(fornecedorId: string): Promise<TabelaPreco[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores/${fornecedorId}/tabelas-valor`, { headers: headers() })
  return handleResponse(res)
}

export async function getAvaliacoes(fornecedorId: string): Promise<Avaliacao[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/avaliacoes/fornecedor/${fornecedorId}`, { headers: headers() })
  return handleResponse(res)
}

// ─── Portal do Fornecedor ───────────────────────────────────────────────────

export async function getPortalDashboard(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/dashboard`, { headers: headers() })
  return handleResponse(res)
}

export async function getCotacoesPendentesBidFreteInternacional(): Promise<DisparoCotacaoBidFreteInternacional[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/cotacoes-pendentes`, { headers: headers() })
  const data = await handleResponse<{ disparo_cotacao_bid_frete_internacional?: unknown[]; requests?: unknown[] }>(res)
  const lista = data.disparo_cotacao_bid_frete_internacional ?? data.requests ?? []
  return lista.map(mapDisparoCotacaoBidFreteInternacionalFromServer)
}

export async function respostaPropostaBidFreteInternacional(
  id_disparo_cotacao_bid_frete_internacional: string,
  data: Partial<PropostaBidFreteInternacional>,
): Promise<PropostaBidFreteInternacional> {
  const res = await fetch(
    `${API_BASE}/bid-frete-internacional/portal/responder/${id_disparo_cotacao_bid_frete_internacional}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    },
  )
  const raw = await handleResponse<unknown>(res)
  return mapPropostaBidFreteInternacionalFromServer(raw)
}

export async function getPortalRespostas(): Promise<PropostaBidFreteInternacional[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/propostas`, { headers: headers() })
  const data = await handleResponse<{ propostas_bid_frete_internacional?: unknown[]; respostas?: unknown[] }>(res)
  const lista = data.propostas_bid_frete_internacional ?? data.respostas ?? []
  return lista.map(mapPropostaBidFreteInternacionalFromServer)
}

export async function getPortalDesempenho(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/desempenho`, { headers: headers() })
  return handleResponse(res)
}

// ─── Portal Público (sem login) ─────────────────────────────────────────────

export async function getPublicCotacao(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/publico/${token}`)
  return handleResponse(res)
}

export async function responderPublico(
  token: string,
  data: Partial<PropostaBidFreteInternacional>,
): Promise<PropostaBidFreteInternacional> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/publico/${token}/responder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const raw = await handleResponse<unknown>(res)
  return mapPropostaBidFreteInternacionalFromServer(raw)
}

// ─── Master Data ────────────────────────────────────────────────────────────

export async function getPortos(q?: string, pais?: string): Promise<Porto[]> {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (pais) params.set('pais', pais)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/portos${query}`)
  const data = await handleResponse<{ portos: Porto[] }>(res)
  return data.portos
}

export async function getMoedas(): Promise<Moeda[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/moedas`)
  return handleResponse(res)
}

export async function getPaises(q?: string): Promise<Pais[]> {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/paises${query}`)
  const data = await handleResponse<{ paises: Pais[] }>(res)
  return data.paises
}

export async function getAeroportos(q?: string, pais?: string): Promise<Aeroporto[]> {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (pais) params.set('pais', pais)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/aeroportos${query}`)
  const data = await handleResponse<{ aeroportos: Aeroporto[] }>(res)
  return data.aeroportos
}

export async function getContainers(): Promise<ContainerOption[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/containers`)
  const data = await handleResponse<{ containers: ContainerOption[] }>(res)
  return data.containers
}

export async function getIncoterms(): Promise<IncotermOption[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/incoterms`)
  const data = await handleResponse<{ incoterms: IncotermOption[] }>(res)
  return data.incoterms
}

// ─── Dashboard Painéis ─────────────────────────────────────────────────────────

export interface DashboardPainel {
  id:           string
  tenant_id:    string
  user_id:      string
  nome:         string
  ordem:        number
  is_visivel:   boolean
  widgets_json: string
  created_at:   string
  updated_at:   string
}

export const paineisDashboardApi = {
  listar: (): Promise<{ data: DashboardPainel[] }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, { headers: headers() })
      .then(res => handleResponse<{ data: DashboardPainel[] }>(res))
      .catch(() => ({ data: [] })),

  criar: (nome: string): Promise<{ data: DashboardPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nome }),
    }).then(res => handleResponse<{ data: DashboardPainel }>(res)),

  atualizar: (id: string, patch: Partial<Pick<DashboardPainel, 'nome' | 'is_visivel' | 'widgets_json'>>): Promise<{ data: DashboardPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(patch),
    }).then(res => handleResponse<{ data: DashboardPainel }>(res)),

  reordenar: (ids: string[]): Promise<{ data: { reordenado: boolean } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/reordenar`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ ids }),
    }).then(res => handleResponse<{ data: { reordenado: boolean } }>(res)),

  deletar: (id: string): Promise<{ data: { deletado: boolean } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(res => handleResponse<{ data: { deletado: boolean } }>(res)),
}

export interface DashboardKpis {
  period: string
  saving_total: number
  valor_medio_ganho_bid_frete_internacional: number
  ganho_percentual_ganho_bid_frete_internacional: number
  transit_time: number
  volume_mensal: number
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  cotacoes_status: Record<string, number>
  [key: string]: number | string | Record<string, number> | string[]
}

export interface DashboardTrendBucket {
  month: string
  volume_mensal: number
  saving_total: number
  valor_medio_ganho_bid_frete_internacional: number
  ganho_percentual_ganho_bid_frete_internacional: number
  transit_time: number
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  [key: string]: string | number
}

export interface GabiInsightItem {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string
}

export const dashboardApi = {
  kpis: async (period: string, range?: { from: string; to: string }): Promise<DashboardKpis> => {
    const params = new URLSearchParams()
    if (range) {
      params.set('data_inicio', range.from)
      params.set('data_fim', range.to)
    }
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard?${params}`, { headers: headers() })
    const raw = await handleResponse<any>(res)
    
    const mapped: Record<string, any> = {
      period,
      saving_total: raw.savings?.total_saving_vs_target ?? 0,
      valor_medio_ganho_bid_frete_internacional: raw.savings?.total_valor_aprovado ? (raw.savings?.total_valor_aprovado / (raw.savings?.total_cotacoes_aprovadas_classificacao_bid_frete_internacional || 1)) : 0,
      ganho_percentual_ganho_bid_frete_internacional: raw.savings?.media_saving_percentual ?? 0,
      transit_time: 0,
      volume_mensal: 0,
      cotacoes_andamento: raw.cotacoes_andamento ?? 0,
      cotacoes_passadas: raw.cotacoes_passadas ?? 0,
      valor_andamento_usd: raw.valor_andamento_usd ?? 0,
      valor_aprovado_usd: raw.valor_aprovado_usd ?? 0,
      
      cotacoes_status: Object.fromEntries(
        (raw.funil ?? []).map((f: { status: string; count: number }) => [f.status, f.count])
      ),
    }

    return mapped as unknown as DashboardKpis
  },

  trend: async (period: string, granularity = 'month'): Promise<{ period: string; granularity: string; value: DashboardTrendBucket[] }> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/widgets`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        metrics: ['volume_mensal'],
        filters: { period },
      }),
    })
    const raw = await handleResponse<any>(res)
    const value = (raw.volume_mensal ?? []).map((item: { month: string; value: number }) => ({
      month: item.month,
      volume_mensal: item.value,
      saving_total: 0,
      valor_medio_ganho_bid_frete_internacional: 0,
      ganho_percentual_ganho_bid_frete_internacional: 0,
      transit_time: 0,
      cotacoes_andamento: 0,
      cotacoes_passadas: 0,
      valor_andamento_usd: 0,
      valor_aprovado_usd: 0,
    }))
    return { period, granularity, value }
  },

  insights: async (period: string, range?: { from: string; to: string }): Promise<{ period: string; role: string; insights: GabiInsightItem[] }> => {
    return { period, role: '', insights: [] }
  },

  ncmStatus: async () => {
    return {
      total_invalidos: 0,
      itens_invalidos: 0,
      sem_sync: true,
      ultima_sync: null,
    }
  }
}

