/// <reference types="vite/client" />
/**
 * api.ts — Funções de chamada da API do BID Frete Internacional
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */

import { z } from 'zod'
import {
  listaPainelDeletarResponseSchema,
  listaPainelItemResponseSchema,
  listaPainelListResponseSchema,
  listaPainelReordenarResponseSchema,
  type ListaPainel,
} from '../../../shared/listaPainelApiSchema.js'
import {
  dashboardPainelDeletarResponseSchema,
  dashboardPainelItemResponseSchema,
  dashboardPainelListResponseSchema,
  dashboardPainelReordenarResponseSchema,
} from '../../../shared/dashboardPainelApiSchema.js'
import { useShellStore, injetarHeaderOverride } from '@gravity/shell'
import {
  visaoFornecedorBidFreteInternacionalCotacoesPendentesResponseSchema,
  visaoFornecedorBidFreteInternacionalDashboardResponseSchema,
  visaoFornecedorBidFreteInternacionalDesempenhoResponseSchema,
  visaoFornecedorBidFreteInternacionalEnviarPropostaResponseSchema,
  visaoFornecedorBidFreteInternacionalPropostasResponseSchema,
  visaoFornecedorBidFreteInternacionalPublicoDisparoResponseSchema,
  visaoFornecedorBidFreteInternacionalPublicoEnviarPropostaResponseSchema,
  visaoFornecedorBidFreteInternacionalTabelasValorResponseSchema,
  visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema,
  mapDesempenhoVisaoFornecedorFromServer,
  mapDashboardMetricasFromServer,
  mapDashboardVisaoFornecedorFromServer,
} from './visao-fornecedor-bid-frete-internacional-schemas'
import {
  mapMapaCotacoesVisaoFornecedorFromServer,
  visaoFornecedorBidFreteInternacionalMapaCotacoesResponseSchema,
} from './mapa-visao-fornecedor-bid-frete-internacional'
import {
  mapMapaCotacoesVisaoGeralFromServer,
  visaoGeralBidFreteInternacionalMapaCotacoesResponseSchema,
} from './mapa-visao-geral-bid-frete-internacional'
import {
  dashboardKpisResponseSchema,
  insightsAlertasResponseSchema,
  insightsGraficosResponseSchema,
  mapDashboardKpisFromServer,
  mapInsightsAlertasFromServer,
  type InsightsGraficosBidFreteInternacionalCliente,
} from './insights-visao-geral-bid-frete-internacional'
import {
  insightsDetalheResponseSchema,
  type ContextoDialogoInsights,
  type CotacaoInsightsDetalheCliente,
} from './insights-detalhe-bid-frete-internacional'
import {
  dashboardInsightsResponseSchema,
  type DashboardInsightsResponseParsed,
} from './dashboard-gabi-schemas'
import type { DadosMapaBidFrete } from './componentes/visao-geral-mapa-bid-frete'
import type {
  AlertaVisaoFornecedorBidFreteInternacional,
  EtapaFunilVisaoFornecedorBidFreteInternacional,
} from './visao-fornecedor-bid-frete-internacional-schemas'
import type {
  CodigoBloqueioRespostaDisparoBidFreteInternacional,
  ModoAcessoRespostaDisparoBidFreteInternacional,
} from './visao-fornecedor-bid-frete-internacional-schemas'
export type {
  CodigoBloqueioRespostaDisparoBidFreteInternacional,
  DesempenhoVisaoFornecedorBidFreteInternacional,
  MetricasVisaoFornecedorBidFreteInternacional,
  ModoAcessoRespostaDisparoBidFreteInternacional,
} from './visao-fornecedor-bid-frete-internacional-schemas'
import type {
  BidFreteInternacional,
  Cotacao,
  CotacoesListResponse,
  Fornecedor,
  FornecedoresListResponse,
  DisparoCotacaoBidFreteInternacional,
  PropostaBidFreteInternacional,
  PropostaRankingBidFreteInternacional,
  StatusBidConfigBidFreteInternacional,
  DashboardKPIs,
  CalendarioAlerta,
  TabelaBidFreteInternacional,
  AvaliacaoBidFreteInternacional,
  Porto,
  Moeda,
  Pais,
  Aeroporto,
  IncotermOption,
  StatusCotacao,
  CanalDisparo,
  ModalFrete,
  ModalidadeCarga,
} from './types'

const API_BASE = '/api/v1'
const LS_ORG_KEY = 'gravity:idOrganizacao'

function clerkSessaoAtiva(): boolean {
  try {
    return !!(window as unknown as { Clerk?: { user?: unknown } }).Clerk?.user
  } catch {
    return false
  }
}

let getDynamicTenantId: () => string | undefined = () => undefined
let getDynamicUserId: () => string | undefined = () => undefined
let getDynamicWorkspaceId: () => string | undefined = () => undefined

/** Fonte canônica: shell store (`idWorkspaceAtivo`); sessionStorage só fallback. Paridade Pedido. */
export function injectWorkspaceGetter(fn: () => string | undefined): void {
  getDynamicWorkspaceId = fn
}

/** Lê Zustand no momento exato do request — evita race com useMeSync (padrão Pedido). */
export function injectTenantGetter(fn: () => string | undefined): void {
  getDynamicTenantId = () => {
    const live = fn()
    if (live) {
      try { localStorage.setItem(LS_ORG_KEY, live) } catch { /* ignore */ }
    }
    return live
  }
}

export function injectUserGetter(fn: () => string | undefined): void {
  getDynamicUserId = fn
}

/** Organização efetiva — shell (/me) > sessionStorage > cache local > fallback dev. */
function resolverIdOrganizacao(): string {
  const state = useShellStore.getState()
  const fromGetter = getDynamicTenantId()
  const live =
    state.organizacaoOverride?.idOrganizacao ??
    fromGetter ??
    state.currentUser.idOrganizacao

  if (live) {
    try { localStorage.setItem(LS_ORG_KEY, live) } catch { /* ignore */ }
    return live
  }

  try {
    const fromSession = sessionStorage.getItem('gravity_id_organizacao')
    if (fromSession) return fromSession
  } catch { /* ignore */ }

  try {
    const cached = localStorage.getItem(LS_ORG_KEY)
    if (cached && cached !== 'org_dev_default') return cached
  } catch { /* ignore */ }

  if (state.meStatus === 'loading' || state.meStatus === 'idle') {
    return clerkSessaoAtiva() ? '' : (import.meta.env.VITE_DEV_TENANT_ID ?? 'org_dev_default')
  }

  if (clerkSessaoAtiva()) return ''

  return (
    import.meta.env.VITE_ID_ORGANIZACAO ||
    import.meta.env.VITE_DEV_TENANT_ID ||
    'org_dev_default'
  )
}

function resolverIdUsuario(): string {
  const shellState = useShellStore.getState()
  const live = getDynamicUserId() ?? shellState.currentUser.id
  if (live) return live

  try {
    const fromSession = sessionStorage.getItem('gravity_id_usuario')
    if (fromSession) return fromSession
  } catch { /* ignore */ }

  if (shellState.meStatus === 'loading' || shellState.meStatus === 'idle') {
    return clerkSessaoAtiva() ? '' : (import.meta.env.VITE_USER_ID ?? 'user_dev_default')
  }

  if (clerkSessaoAtiva()) return ''

  return import.meta.env.VITE_USER_ID ?? 'user_dev_default'
}

/** True quando org + usuário estão disponíveis para headers de tenant. */
export function identidadeTenantApiPronta(): boolean {
  return Boolean(resolverIdOrganizacao() && resolverIdUsuario())
}

export function getApiContext(): { idOrganizacao: string; userId: string; userName: string } {
  return {
    idOrganizacao: resolverIdOrganizacao(),
    userId: resolverIdUsuario(),
    userName: useShellStore.getState().currentUser.name ?? '',
  }
}

export function setApiContext(ctx: { idOrganizacao: string; userId: string; userName?: string }): void {
  injectTenantGetter(() => ctx.idOrganizacao)
  injectUserGetter(() => ctx.userId)
}

const headers = () => {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
    ...injetarHeaderOverride(),
  }

  const orgId = resolverIdOrganizacao()

  const idWorkspace =
    getDynamicWorkspaceId() ||
    sessionStorage.getItem('gravity_id_workspace') ||
    sessionStorage.getItem('gravity_company_id') ||
    ''

  const userId = resolverIdUsuario()

  customHeaders['x-id-organizacao'] = orgId
  customHeaders['x-id-usuario'] = userId
  if (idWorkspace) customHeaders['x-id-workspace'] = idWorkspace

  return customHeaders
}

export class BidFreteApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message)
    this.name = 'BidFreteApiError'
  }
}

function extrairErroApi(payload: unknown, status: number): BidFreteApiError {
  if (!payload || typeof payload !== 'object') {
    return new BidFreteApiError(`Erro ${status}`, status, 'HTTP_ERROR')
  }
  const body = payload as Record<string, unknown>
  const erro = body.error
  if (typeof erro === 'string' && erro.length > 0) {
    return new BidFreteApiError(erro, status, 'HTTP_ERROR')
  }
  if (erro && typeof erro === 'object') {
    const obj = erro as { message?: string; code?: string }
    const message = typeof obj.message === 'string' && obj.message.length > 0 ? obj.message : `Erro ${status}`
    const code = typeof obj.code === 'string' && obj.code.length > 0 ? obj.code : 'HTTP_ERROR'
    return new BidFreteApiError(message, status, code)
  }
  if (typeof body.message === 'string' && body.message.length > 0) {
    return new BidFreteApiError(body.message, status, 'HTTP_ERROR')
  }
  return new BidFreteApiError(`Erro ${status}`, status, 'HTTP_ERROR')
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw extrairErroApi(err, res.status)
  }
  return res.json()
}

export interface PublicoDisparoRespostaCarregado {
  disparo: DisparoCotacaoBidFreteInternacional
  modo_acesso_resposta_disparo_bid_frete_internacional: ModoAcessoRespostaDisparoBidFreteInternacional
  codigo_bloqueio_resposta_disparo_bid_frete_internacional: CodigoBloqueioRespostaDisparoBidFreteInternacional
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
    id_proposta_bid_frete_internacional: (raw.id_proposta_bid_frete_internacional ?? raw.id) as string,
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
    dias_prazo_pagamento_proposta_bid_frete_internacional:
      raw.dias_prazo_pagamento_proposta_bid_frete_internacional != null
        ? Number(raw.dias_prazo_pagamento_proposta_bid_frete_internacional)
        : null,
    quantidade_transbordo_proposta_bid_frete_internacional: Number(
      raw.quantidade_transbordo_proposta_bid_frete_internacional ??
        raw.transbordos_proposta_bid_frete_internacional ??
        0,
    ),
    quantidade_escala_proposta_bid_frete_internacional: (() => {
      const explicito = raw.quantidade_escala_proposta_bid_frete_internacional
      if (explicito != null && explicito !== '') return Number(explicito)
      const escalasRaw = raw.escalas_proposta_bid_frete_internacional
      if (typeof escalasRaw === 'string' && /^\d+$/.test(escalasRaw.trim())) {
        return Number(escalasRaw.trim())
      }
      return 0
    })(),
    escalas_proposta_bid_frete_internacional:
      typeof raw.escalas_proposta_bid_frete_internacional === 'string'
        && !/^\d+$/.test(raw.escalas_proposta_bid_frete_internacional.trim())
        ? raw.escalas_proposta_bid_frete_internacional
        : null,
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
    ...(Array.isArray(raw.taxas_origem)
      ? { taxas_origem: raw.taxas_origem as PropostaBidFreteInternacional['taxas_origem'] }
      : {}),
    ...(Array.isArray(raw.taxas_destino)
      ? { taxas_destino: raw.taxas_destino as PropostaBidFreteInternacional['taxas_destino'] }
      : {}),
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
    erro_envio_disparo_cotacao_bid_frete_internacional:
      (raw.erro_envio_disparo_cotacao_bid_frete_internacional ??
        raw.erro_envio_pedido_cotacao_bid_frete_internacional ??
        raw.erro_envio ??
        null) as string | null,
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
  if (rawUnknown == null || typeof rawUnknown !== 'object') {
    throw new BidFreteApiError('Payload de cotação inválido', 500, 'INVALID_RESPONSE')
  }
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

  const bidRaw = raw.bid_bid_frete_internacional as Record<string, unknown> | null | undefined
  const bidMapeado = bidRaw
    ? {
        id_bid_bid_frete_internacional: bidRaw.id_bid_bid_frete_internacional as string,
        numero_bid_bid_frete_internacional: bidRaw.numero_bid_bid_frete_internacional as string,
        referencia_interna_bid_bid_frete_internacional:
          (bidRaw.referencia_interna_bid_bid_frete_internacional as string | null) ?? null,
        status_bid_bid_frete_internacional: bidRaw.status_bid_bid_frete_internacional as BidFreteInternacional['status_bid_bid_frete_internacional'],
        quantidade_cotacoes_bid_frete_internacional:
          (bidRaw._count as { cotacoes?: number } | undefined)?.cotacoes,
      }
    : null

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
    bid_bid_frete_internacional: bidMapeado,
    historico_aprovado: raw.historico_aprovado as Cotacao['historico_aprovado'],
    id_usuario_aprovacao_ganho_bid_frete_internacional:
      (raw.id_usuario_aprovacao_ganho_bid_frete_internacional as string | null | undefined) ?? null,
    nome_usuario_aprovacao_ganho_bid_frete_internacional:
      (raw.nome_usuario_aprovacao_ganho_bid_frete_internacional as string | null | undefined) ?? null,
  }
}

/** Campos só da UI / agregados — nunca enviar no PATCH (não existem no Prisma). */
const CAMPOS_COTACAO_APENAS_CLIENTE = [
  'id_cotacao_bid_frete_internacional',
  'id_organizacao',
  'numero_cotacao_bid_frete_internacional',
  'data_atualizacao_cotacao_bid_frete_internacional',
  'valor_aprovado_ganho_bid_frete_internacional',
  'moeda_aprovada',
  'id_usuario_aprovacao_ganho_bid_frete_internacional',
  'nome_usuario_aprovacao_ganho_bid_frete_internacional',
  'disparo_cotacao_bid_frete_internacional',
  'propostas_bid_frete_internacional',
  'bid_bid_frete_internacional',
  'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino_cotacao_bid_frete_internacional',
  'estado_provincia_origem_cotacao_bid_frete_internacional',
  'estado_provincia_destino_cotacao_bid_frete_internacional',
  'hs_code_cotacao_bid_frete_internacional',
  'peso_ton_cotacao_bid_frete_internacional',
] as const

export function mapCotacaoToServer(input: Partial<Cotacao>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...input }
  for (const campo of CAMPOS_COTACAO_APENAS_CLIENTE) {
    delete result[campo]
  }
  return result
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface BidFreteEscopoWorkspacesPreferencia {
  ids_workspaces_escopo?: string[]
}

const escopoWorkspacesPreferenciaResponseSchema = z.object({
  data: z
    .object({
      ids_workspaces_escopo: z.array(z.string()).optional(),
    })
    .nullable(),
})

const escopoWorkspacesPreferenciaPutResponseSchema = z.object({
  data: z.object({
    ids_workspaces_escopo: z.array(z.string()),
  }),
})

export const bidFreteConfigApi = {
  obterEscopoWorkspaces: (): Promise<{ data: BidFreteEscopoWorkspacesPreferencia | null }> =>
    fetch(`${API_BASE}/bid-frete-internacional/config/escopo-workspaces`, { headers: headers() })
      .then(res => handleResponse<unknown>(res))
      .then(raw => escopoWorkspacesPreferenciaResponseSchema.parse(raw)),

  salvarEscopoWorkspaces: (payload: BidFreteEscopoWorkspacesPreferencia): Promise<{ data: BidFreteEscopoWorkspacesPreferencia }> =>
    fetch(`${API_BASE}/bid-frete-internacional/config/escopo-workspaces`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(payload),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => escopoWorkspacesPreferenciaPutResponseSchema.parse(raw)),
}

function urlComEscopoWorkspaces(basePath: string, idsWorkspacesFiltro?: string[]): string {
  const params = new URLSearchParams()
  if (idsWorkspacesFiltro?.length) {
    params.set('ids_workspaces', idsWorkspacesFiltro.join(','))
  }
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export async function getDashboardKpis(
  idsWorkspacesFiltro?: string[],
  opcoes?: { status_slug_kpi_andamento?: string },
): Promise<
  DashboardKPIs & {
    tempo_medio_resposta_dias: number | null
    cotacoes_aprovadas: number
    distribuicao_modal_andamento: Array<{ modal_cotacao_bid_frete_internacional: string; count: number }>
    total_cotacoes_com_saving: number
    total_saving_vs_media: number
  }
> {
  const params = new URLSearchParams()
  if (opcoes?.status_slug_kpi_andamento) {
    params.set('status_slug_kpi_andamento', opcoes.status_slug_kpi_andamento)
  }
  const base = urlComEscopoWorkspaces(
    `${API_BASE}/bid-frete-internacional/dashboard/kpis`,
    idsWorkspacesFiltro,
  )
  const separador = base.includes('?') ? '&' : '?'
  const qs = params.toString()
  const url = qs ? `${base}${separador}${qs}` : base
  const res = await fetch(url, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  return mapDashboardKpisFromServer(dashboardKpisResponseSchema.parse(raw))
}

export async function getDashboardInsightsAlertas(
  idsWorkspacesFiltro?: string[],
  dataReferencia?: string,
): Promise<CalendarioAlerta[]> {
  const params = new URLSearchParams()
  if (dataReferencia) params.set('data_referencia', dataReferencia)
  const base = urlComEscopoWorkspaces(
    `${API_BASE}/bid-frete-internacional/dashboard/insights-alertas`,
    idsWorkspacesFiltro,
  )
  const separador = base.includes('?') ? '&' : '?'
  const qs = params.toString()
  const url = qs ? `${base}${separador}${qs}` : base
  const res = await fetch(url, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  return mapInsightsAlertasFromServer(insightsAlertasResponseSchema.parse(raw))
}

export async function getDashboardMapaCotacoesVisaoGeral(idsWorkspacesFiltro?: string[]): Promise<DadosMapaBidFrete> {
  const res = await fetch(
    urlComEscopoWorkspaces(`${API_BASE}/bid-frete-internacional/dashboard/mapa-cotacoes`, idsWorkspacesFiltro),
    { headers: headers() },
  )
  const raw = await handleResponse<unknown>(res)
  return mapMapaCotacoesVisaoGeralFromServer(
    visaoGeralBidFreteInternacionalMapaCotacoesResponseSchema.parse(raw),
  )
}

export async function getDashboardInsightsGraficos(
  idsWorkspacesFiltro?: string[],
): Promise<InsightsGraficosBidFreteInternacionalCliente> {
  const res = await fetch(
    urlComEscopoWorkspaces(`${API_BASE}/bid-frete-internacional/dashboard/insights-graficos`, idsWorkspacesFiltro),
    { headers: headers() },
  )
  const raw = await handleResponse<unknown>(res)
  return insightsGraficosResponseSchema.parse(raw)
}

export async function getDashboardInsightsDetalhe(
  contexto: ContextoDialogoInsights,
  idsWorkspacesFiltro?: string[],
  dataReferencia?: string,
): Promise<{ total: number; cotacoes: CotacaoInsightsDetalheCliente[] }> {
  const params = new URLSearchParams()
  if (contexto.tipo === 'rota') {
    params.set('contexto', 'rota')
    if (contexto.codigo_origem) params.set('codigo_origem', contexto.codigo_origem)
    if (contexto.codigo_destino) params.set('codigo_destino', contexto.codigo_destino)
    if (contexto.modal_cotacao_bid_frete_internacional) {
      params.set('modal_cotacao_bid_frete_internacional', contexto.modal_cotacao_bid_frete_internacional)
    }
  } else {
    params.set('contexto', contexto.tipo)
  }
  if (dataReferencia) params.set('data_referencia', dataReferencia)

  const base = urlComEscopoWorkspaces(
    `${API_BASE}/bid-frete-internacional/dashboard/insights-detalhe`,
    idsWorkspacesFiltro,
  )
  const separador = base.includes('?') ? '&' : '?'
  const res = await fetch(`${base}${separador}${params}`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = insightsDetalheResponseSchema.parse(raw)
  return { total: parsed.total, cotacoes: parsed.cotacoes }
}

export async function getDashboardCalendario(): Promise<CalendarioAlerta[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/calendario`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = raw as { alertas?: CalendarioAlerta[] }
  if (Array.isArray(parsed?.alertas)) return parsed.alertas
  if (Array.isArray(raw)) return raw as CalendarioAlerta[]
  return []
}

// ─── Cotações CRUD ──────────────────────────────────────────────────────────

export interface CotacoesListParams {
  status?: StatusCotacao
  page?: number
  limit?: number
  busca?: string
  apenas_avulsas?: boolean
  idsWorkspacesFiltro?: string[]
}

export async function getCotacoes(params: CotacoesListParams = {}): Promise<CotacoesListResponse> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.busca) query.set('busca', params.busca)
  if (params.apenas_avulsas) query.set('apenas_avulsas', 'true')
  if (params.idsWorkspacesFiltro?.length) {
    query.set('ids_workspaces', params.idsWorkspacesFiltro.join(','))
  }
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

function mapBidFreteInternacionalFromServer(rawUnknown: unknown): BidFreteInternacional {
  const raw = serializeValue(rawUnknown) as Record<string, unknown>
  const cotacoesRaw = (raw.cotacoes as unknown[] | undefined) ?? []
  return {
    ...(raw as unknown as BidFreteInternacional),
    id_bid_bid_frete_internacional: (raw.id_bid_bid_frete_internacional ?? raw.id) as string,
    cotacoes: cotacoesRaw.map(mapCotacaoFromServer),
  }
}

export async function getBidsFreteInternacional(idsWorkspacesFiltro?: string[]): Promise<BidFreteInternacional[]> {
  const res = await fetch(
    urlComEscopoWorkspaces(`${API_BASE}/bid-frete-internacional/bids-frete-internacional`, idsWorkspacesFiltro),
    { headers: headers() },
  )
  const data = await handleResponse<{ bids_frete_internacional?: unknown[]; bids?: unknown[] }>(res)
  const lista = data.bids_frete_internacional ?? data.bids ?? []
  return lista.map(mapBidFreteInternacionalFromServer)
}

export interface CriarBidFreteInternacionalPayload {
  referencia_interna_bid_bid_frete_internacional?: string
  ids_cotacao_bid_frete_internacional?: string[]
}

export async function criarBidFreteInternacional(
  payload: CriarBidFreteInternacionalPayload,
): Promise<BidFreteInternacional> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/bids-frete-internacional`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await handleResponse<{ bid_frete_internacional: unknown }>(res)
  return mapBidFreteInternacionalFromServer(data.bid_frete_internacional)
}

export async function getStatusBidConfigFreteInternacional(): Promise<StatusBidConfigBidFreteInternacional[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/config/status-bid-frete-internacional`, { headers: headers() })
  const data = await handleResponse<{ status_bid_frete_internacional?: unknown[]; status?: unknown[] }>(res)
  const lista = data.status_bid_frete_internacional ?? data.status ?? []
  return lista as StatusBidConfigBidFreteInternacional[]
}

export interface CriarCotacaoPayload extends Partial<Cotacao> {
  fornecedor_ids?: string[]
  disparar_ao_criar?: boolean
  canais_disparo?: CanalDisparo[]
  emails_por_fornecedor?: Record<string, string[]>
}

export interface ResultadoDisparoCriacaoCotacao {
  disparos: number
  enviados?: boolean
  enviados_ok?: number
  erros_envio?: number
  message?: string
  results?: Array<{
    id_fornecedor_bid_frete_internacional: string
    nome_fornecedor_bid_frete_internacional?: string
    canal_disparo_cotacao_bid_frete_internacional: string
    id_disparo_cotacao_bid_frete_internacional: string
    status_disparo_cotacao_bid_frete_internacional?: 'ENVIADO' | 'ERRO_ENVIO' | string
    erro_envio_disparo_cotacao_bid_frete_internacional?: string | null
  }>
}

export async function criarCotacao(input: CriarCotacaoPayload): Promise<Cotacao> {
  const { cotacao } = await criarCotacaoComDisparo(input)
  return cotacao
}

/** Variante que expõe o resultado do disparo automático (REGRA 08 — falha de disparo não pode ser silenciosa). */
export async function criarCotacaoComDisparo(input: CriarCotacaoPayload): Promise<{
  cotacao: Cotacao
  disparo: ResultadoDisparoCriacaoCotacao | null
  disparo_erro: string | null
}> {
  const serverInput = mapCotacaoToServer(input)
  if (input.fornecedor_ids) serverInput.fornecedor_ids = input.fornecedor_ids
  if (input.disparar_ao_criar !== undefined) serverInput.disparar_ao_criar = input.disparar_ao_criar
  if (input.canais_disparo) serverInput.canais_disparo = input.canais_disparo
  if (input.emails_por_fornecedor) serverInput.emails_por_fornecedor = input.emails_por_fornecedor
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(serverInput),
  })
  const data = await handleResponse<{
    cotacao: unknown
    disparo?: ResultadoDisparoCriacaoCotacao | null
    disparo_erro?: string
  }>(res)
  return {
    cotacao: mapCotacaoFromServer(data.cotacao),
    disparo: data.disparo ?? null,
    disparo_erro: data.disparo_erro ?? null,
  }
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

// ─── Duplicações e Exclusões em lote (lista) ────────────────────────────────

const cotacaoPreviewExclusaoSchema = z.object({
  id_cotacao_bid_frete_internacional: z.string(),
  numero_cotacao_bid_frete_internacional: z.string(),
  status_cotacao_bid_frete_internacional: z.string(),
  total_propostas: z.number(),
  motivo_bloqueio: z.enum(['COM_PROPOSTAS', 'ENVIADA_FORNECEDOR']).optional(),
})

const bidPreviewExclusaoSchema = z.object({
  id_bid_bid_frete_internacional: z.string(),
  numero_bid_bid_frete_internacional: z.string(),
  total_cotacoes: z.number(),
  cotacoes_bloqueadas: z.array(cotacaoPreviewExclusaoSchema).optional(),
})

const exclusoesCotacoesPreviewResponseSchema = z.object({
  permitidas: z.array(cotacaoPreviewExclusaoSchema),
  bloqueadas: z.array(cotacaoPreviewExclusaoSchema),
})

const exclusoesCotacoesConfirmarResponseSchema = z.object({
  total_excluidas: z.number(),
  ids_excluidos: z.array(z.string()),
  bloqueadas: z.array(cotacaoPreviewExclusaoSchema),
})

const exclusoesBidsPreviewResponseSchema = z.object({
  permitidos: z.array(bidPreviewExclusaoSchema),
  bloqueados: z.array(bidPreviewExclusaoSchema),
})

const exclusoesBidsConfirmarResponseSchema = z.object({
  total_excluidos: z.number(),
  ids_excluidos: z.array(z.string()),
  bloqueados: z.array(bidPreviewExclusaoSchema),
})

const duplicacoesCotacoesResponseSchema = z.object({
  total_duplicadas: z.number(),
  cotacoes: z.array(z.unknown()),
})

const duplicacoesBidsResponseSchema = z.object({
  total_duplicadas: z.number(),
  bids_frete_internacional: z.array(z.unknown()),
})

export type CotacaoPreviewExclusaoBidFrete = z.infer<typeof cotacaoPreviewExclusaoSchema>
export type BidPreviewExclusaoBidFrete = z.infer<typeof bidPreviewExclusaoSchema>
export type ExclusoesCotacoesPreviewBidFrete = z.infer<typeof exclusoesCotacoesPreviewResponseSchema>
export type ExclusoesBidsPreviewBidFrete = z.infer<typeof exclusoesBidsPreviewResponseSchema>

export const duplicacoesBidFreteApi = {
  /** Duplica cotações (avulsas ou filhas de BID) — cópia nasce em RASCUNHO */
  duplicarCotacoes: async (ids: string[]): Promise<{ total_duplicadas: number; cotacoes: Cotacao[] }> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/duplicacoes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
    const raw = await handleResponse<unknown>(res)
    const parsed = duplicacoesCotacoesResponseSchema.parse(raw)
    return {
      total_duplicadas: parsed.total_duplicadas,
      cotacoes: parsed.cotacoes.map(mapCotacaoFromServer),
    }
  },

  /** Duplica BIDs + cotações filhas — tudo em RASCUNHO com números novos */
  duplicarBids: async (ids: string[]): Promise<{ total_duplicadas: number; bids_frete_internacional: BidFreteInternacional[] }> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/bids-frete-internacional/duplicacoes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
    const raw = await handleResponse<unknown>(res)
    const parsed = duplicacoesBidsResponseSchema.parse(raw)
    return {
      total_duplicadas: parsed.total_duplicadas,
      bids_frete_internacional: parsed.bids_frete_internacional.map(mapBidFreteInternacionalFromServer),
    }
  },
}

export const exclusoesBidFreteApi = {
  previewCotacoes: async (ids: string[]): Promise<ExclusoesCotacoesPreviewBidFrete> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/exclusoes/preview`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
    return exclusoesCotacoesPreviewResponseSchema.parse(await handleResponse<unknown>(res))
  },

  confirmarCotacoes: async (ids: string[]): Promise<z.infer<typeof exclusoesCotacoesConfirmarResponseSchema>> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/exclusoes/confirmar`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
    return exclusoesCotacoesConfirmarResponseSchema.parse(await handleResponse<unknown>(res))
  },

  previewBids: async (ids: string[]): Promise<ExclusoesBidsPreviewBidFrete> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/bids-frete-internacional/exclusoes/preview`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
    return exclusoesBidsPreviewResponseSchema.parse(await handleResponse<unknown>(res))
  },

  confirmarBids: async (ids: string[]): Promise<z.infer<typeof exclusoesBidsConfirmarResponseSchema>> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/bids-frete-internacional/exclusoes/confirmar`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
    return exclusoesBidsConfirmarResponseSchema.parse(await handleResponse<unknown>(res))
  },
}

// ─── Solicitação de cotação (disparo) ───────────────────────────────────────

const SOLICITACAO_COTACAO_BASE = `${API_BASE}/bid-frete-internacional/solicitacao-cotacao-bid-frete-internacional`

const disparoResultadoSchema = z.object({
  disparos: z.number(),
  enviados: z.boolean().optional(),
  enviados_ok: z.number().optional(),
  erros_envio: z.number().optional(),
  message: z.string().optional(),
  results: z.array(z.object({
    id_fornecedor_bid_frete_internacional: z.string(),
    nome_fornecedor_bid_frete_internacional: z.string().optional(),
    canal_disparo_cotacao_bid_frete_internacional: z.string(),
    id_disparo_cotacao_bid_frete_internacional: z.string(),
    status_disparo_cotacao_bid_frete_internacional: z.string().optional(),
    erro_envio_disparo_cotacao_bid_frete_internacional: z.string().nullable().optional(),
  })).optional(),
})

export type DisparoResultadoBidFreteInternacional = z.infer<typeof disparoResultadoSchema>

export async function dispararCotacaoBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
  fornecedor_ids: string[],
  canais: CanalDisparo[],
  emails_por_fornecedor?: Record<string, string[]>,
): Promise<DisparoResultadoBidFreteInternacional> {
  const res = await fetch(`${SOLICITACAO_COTACAO_BASE}/disparar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      id_cotacao_bid_frete_internacional,
      fornecedor_ids,
      canais,
      ...(emails_por_fornecedor && Object.keys(emails_por_fornecedor).length > 0
        ? { emails_por_fornecedor }
        : {}),
    }),
    signal: AbortSignal.timeout(120_000),
  })
  const raw = await handleResponse<unknown>(res)
  return disparoResultadoSchema.parse(raw)
}

export async function dispararCotacaoAbertaBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
  canais: CanalDisparo[],
): Promise<DisparoResultadoBidFreteInternacional> {
  const res = await fetch(`${SOLICITACAO_COTACAO_BASE}/cotacao-aberta`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id_cotacao_bid_frete_internacional, canais }),
    signal: AbortSignal.timeout(120_000),
  })
  const raw = await handleResponse<unknown>(res)
  return disparoResultadoSchema.parse(raw)
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
  if (data.cotacao == null) {
    throw new BidFreteApiError('Resposta da API sem cotação atualizada', 500, 'INVALID_RESPONSE')
  }
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
  const parsed = z.object({ fornecedor: z.unknown() }).parse(raw)
  return mapFornecedorFromServer(parsed.fornecedor)
}

export function mapTabelaBidFreteInternacionalFromServer(rawUnknown: unknown): TabelaBidFreteInternacional {
  const raw = serializeValue(rawUnknown) as Record<string, unknown>
  return raw as TabelaBidFreteInternacional
}

export async function getTabelaPrecos(fornecedorId: string): Promise<TabelaBidFreteInternacional[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores/${fornecedorId}/tabelas-valor`, { headers: headers() })
  const data = await handleResponse<{ tabelas?: unknown[] }>(res)
  return (data.tabelas ?? []).map(mapTabelaBidFreteInternacionalFromServer)
}

export async function getAvaliacoes(fornecedorId: string): Promise<AvaliacaoBidFreteInternacional[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/avaliacoes/fornecedor/${fornecedorId}`, { headers: headers() })
  const data = await handleResponse<{ avaliacoes?: unknown[] }>(res)
  return (data.avaliacoes ?? []).map((a) => serializeValue(a) as AvaliacaoBidFreteInternacional)
}

const VISAO_FORNECEDOR_BASE = `${API_BASE}/bid-frete-internacional/visao-fornecedor-bid-frete-internacional`

export interface DashboardVisaoFornecedorBidFreteInternacional {
  metricas: MetricasVisaoFornecedorBidFreteInternacional
  kpis: ReturnType<typeof mapDashboardMetricasFromServer>
  funil: EtapaFunilVisaoFornecedorBidFreteInternacional[]
  alertas: AlertaVisaoFornecedorBidFreteInternacional[]
  fornecedor: Fornecedor
}

export async function getVisaoFornecedorBidFreteInternacionalDashboard(): Promise<DashboardVisaoFornecedorBidFreteInternacional> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/dashboard`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalDashboardResponseSchema.parse(raw)
  const visao = parsed.visao_fornecedor_bid_frete_internacional
  const mapped = mapDashboardVisaoFornecedorFromServer(visao, visao.fornecedor_bid_frete_internacional)
  return {
    metricas: mapped.metricas,
    kpis: mapped.kpis,
    funil: mapped.funil,
    alertas: mapped.alertas,
    fornecedor: mapFornecedorFromServer(visao.fornecedor_bid_frete_internacional),
  }
}

export async function getVisaoFornecedorBidFreteInternacionalMapaCotacoes(
  nomeFornecedor: string,
): Promise<DadosMapaBidFrete> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/mapa-cotacoes`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalMapaCotacoesResponseSchema.parse(raw)
  return mapMapaCotacoesVisaoFornecedorFromServer(parsed, nomeFornecedor)
}

export async function getVisaoFornecedorBidFreteInternacionalCotacoesPendentes(): Promise<DisparoCotacaoBidFreteInternacional[]> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/cotacoes-pendentes`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalCotacoesPendentesResponseSchema.parse(raw)
  return parsed.visao_fornecedor_bid_frete_internacional.disparos_cotacao_bid_frete_internacional.map(
    mapDisparoCotacaoBidFreteInternacionalFromServer,
  )
}

export async function enviarVisaoFornecedorBidFreteInternacionalProposta(
  id_disparo_cotacao_bid_frete_internacional: string,
  data: Partial<PropostaBidFreteInternacional>,
): Promise<PropostaBidFreteInternacional> {
  const res = await fetch(
    `${VISAO_FORNECEDOR_BASE}/responder/${id_disparo_cotacao_bid_frete_internacional}`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    },
  )
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalEnviarPropostaResponseSchema.parse(raw)
  return mapPropostaBidFreteInternacionalFromServer(
    parsed.visao_fornecedor_bid_frete_internacional.proposta_bid_frete_internacional,
  )
}

export async function getVisaoFornecedorBidFreteInternacionalPropostas(): Promise<PropostaBidFreteInternacional[]> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/propostas`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalPropostasResponseSchema.parse(raw)
  return parsed.visao_fornecedor_bid_frete_internacional.propostas_bid_frete_internacional.map(
    mapPropostaBidFreteInternacionalFromServer,
  )
}

export async function getVisaoFornecedorBidFreteInternacionalDesempenho(): Promise<DesempenhoVisaoFornecedorBidFreteInternacional> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/desempenho`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalDesempenhoResponseSchema.parse(raw)
  return mapDesempenhoVisaoFornecedorFromServer(parsed)
}

export async function getVisaoFornecedorBidFreteInternacionalTabelasValor(): Promise<TabelaBidFreteInternacional[]> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/tabelas-valor`, { headers: headers() })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalTabelasValorResponseSchema.parse(raw)
  return parsed.visao_fornecedor_bid_frete_internacional.tabelas_bid_frete_internacional.map(
    mapTabelaBidFreteInternacionalFromServer,
  )
}

export interface InputTabelaBidFreteInternacionalVisaoFornecedor {
  origem_codigo_tabela_bid_frete_internacional: string
  origem_nome_tabela_bid_frete_internacional: string
  destino_codigo_tabela_bid_frete_internacional: string
  destino_nome_tabela_bid_frete_internacional: string
  modal_tabela_bid_frete_internacional: ModalFrete
  modalidade_tabela_bid_frete_internacional: ModalidadeCarga
  moeda_tabela_bid_frete_internacional: string
  valor_frete_tabela_bid_frete_internacional: number
  taxas_origem_tabela_bid_frete_internacional: number
  taxas_destino_tabela_bid_frete_internacional: number
  valor_total_tabela_bid_frete_internacional: number
  dias_transito_tabela_bid_frete_internacional: number
  dias_free_time_tabela_bid_frete_internacional?: number
  validade_inicio_tabela_bid_frete_internacional: string
  validade_fim_tabela_bid_frete_internacional: string
}

export async function criarVisaoFornecedorBidFreteInternacionalTabelaValor(
  data: InputTabelaBidFreteInternacionalVisaoFornecedor,
): Promise<TabelaBidFreteInternacional> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/tabelas-valor`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema.parse(raw)
  return mapTabelaBidFreteInternacionalFromServer(
    parsed.visao_fornecedor_bid_frete_internacional.tabela_bid_frete_internacional,
  )
}

export async function atualizarVisaoFornecedorBidFreteInternacionalTabelaValor(
  id_tabela_bid_frete_internacional: string,
  data: Partial<InputTabelaBidFreteInternacionalVisaoFornecedor>,
): Promise<TabelaBidFreteInternacional> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/tabelas-valor/${id_tabela_bid_frete_internacional}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalTabelaValorItemResponseSchema.parse(raw)
  return mapTabelaBidFreteInternacionalFromServer(
    parsed.visao_fornecedor_bid_frete_internacional.tabela_bid_frete_internacional,
  )
}

export async function excluirVisaoFornecedorBidFreteInternacionalTabelaValor(
  id_tabela_bid_frete_internacional: string,
): Promise<void> {
  const res = await fetch(`${VISAO_FORNECEDOR_BASE}/tabelas-valor/${id_tabela_bid_frete_internacional}`, {
    method: 'DELETE',
    headers: headers(),
  })
  await handleResponse(res)
}

// ─── Visão Fornecedor Público (sem login) ───────────────────────────────────

export async function getVisaoFornecedorBidFreteInternacionalPublicoDisparo(
  token_resposta_disparo_cotacao_bid_frete_internacional: string,
): Promise<PublicoDisparoRespostaCarregado> {
  const res = await fetch(
    `${VISAO_FORNECEDOR_BASE}/publico/${token_resposta_disparo_cotacao_bid_frete_internacional}`,
  )
  const raw = await handleResponse<unknown>(res)
  const parsed = visaoFornecedorBidFreteInternacionalPublicoDisparoResponseSchema.parse(raw)
  const payload = parsed.visao_fornecedor_bid_frete_internacional_publico
  return {
    disparo: mapDisparoCotacaoBidFreteInternacionalFromServer(payload.disparo_cotacao_bid_frete_internacional),
    modo_acesso_resposta_disparo_bid_frete_internacional:
      payload.modo_acesso_resposta_disparo_bid_frete_internacional,
    codigo_bloqueio_resposta_disparo_bid_frete_internacional:
      payload.codigo_bloqueio_resposta_disparo_bid_frete_internacional,
  }
}

export async function enviarVisaoFornecedorBidFreteInternacionalPropostaPublico(
  token_resposta_disparo_cotacao_bid_frete_internacional: string,
  data: Partial<PropostaBidFreteInternacional>,
): Promise<void> {
  const res = await fetch(
    `${VISAO_FORNECEDOR_BASE}/publico/${token_resposta_disparo_cotacao_bid_frete_internacional}/responder`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  const raw = await handleResponse<unknown>(res)
  visaoFornecedorBidFreteInternacionalPublicoEnviarPropostaResponseSchema.parse(raw)
}

/** @deprecated use getVisaoFornecedorBidFreteInternacionalDashboard */
export const getPortalDashboard = getVisaoFornecedorBidFreteInternacionalDashboard
/** @deprecated use getVisaoFornecedorBidFreteInternacionalCotacoesPendentes */
export const getCotacoesPendentesBidFreteInternacional = getVisaoFornecedorBidFreteInternacionalCotacoesPendentes
/** @deprecated use enviarVisaoFornecedorBidFreteInternacionalProposta */
export const respostaPropostaBidFreteInternacional = enviarVisaoFornecedorBidFreteInternacionalProposta
/** @deprecated use getVisaoFornecedorBidFreteInternacionalPropostas */
export const getPortalRespostas = getVisaoFornecedorBidFreteInternacionalPropostas
/** @deprecated use getVisaoFornecedorBidFreteInternacionalDesempenho */
export const getPortalDesempenho = getVisaoFornecedorBidFreteInternacionalDesempenho
/** @deprecated use getVisaoFornecedorBidFreteInternacionalPublicoDisparo */
export const getPublicCotacao = getVisaoFornecedorBidFreteInternacionalPublicoDisparo
/** @deprecated use enviarVisaoFornecedorBidFreteInternacionalPropostaPublico */
export const responderPublico = enviarVisaoFornecedorBidFreteInternacionalPropostaPublico

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

export type { ListaPainel }

export const paineisListaBidFreteApi = {
  listar: (): Promise<{ data: ListaPainel[] }> =>
    fetch(`${API_BASE}/bid-frete-internacional/lista/paineis`, { headers: headers() })
      .then(res => handleResponse<unknown>(res))
      .then(raw => {
        const parsed = listaPainelListResponseSchema.safeParse(raw)
        if (!parsed.success) {
          console.warn(
            '[paineisListaBidFreteApi.listar] resposta fora do contrato Zod',
            parsed.error.flatten(),
            raw,
          )
          throw new Error('Resposta inválida ao listar painéis da lista')
        }
        return parsed.data
      }),

  criar: (nome: string, configJson?: string): Promise<{ data: ListaPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/lista/paineis`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        nome,
        ...(configJson ? { config_json: configJson } : {}),
      }),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => listaPainelItemResponseSchema.parse(raw)),

  atualizar: (id: string, patch: Partial<Pick<ListaPainel, 'nome' | 'is_visivel' | 'config_json'>>): Promise<{ data: ListaPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/lista/paineis/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(patch),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => listaPainelItemResponseSchema.parse(raw)),

  reordenar: (ids: string[]): Promise<{ data: { reordenado: true } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/lista/paineis/reordenar`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => listaPainelReordenarResponseSchema.parse(raw)),

  deletar: (id: string): Promise<{ data: { deletado: true } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/lista/paineis/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => listaPainelDeletarResponseSchema.parse(raw)),
}

export const paineisDashboardApi = {
  listar: (): Promise<{ data: DashboardPainel[] }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, { headers: headers() })
      .then(res => handleResponse<unknown>(res))
      .then(raw => {
        const parsed = dashboardPainelListResponseSchema.safeParse(raw)
        if (!parsed.success) {
          console.warn(
            '[paineisDashboardApi.listar] resposta fora do contrato Zod',
            parsed.error.flatten(),
            raw,
          )
          throw new Error('Resposta inválida ao listar painéis do dashboard')
        }
        return parsed.data
      }),

  criar: (nome: string): Promise<{ data: DashboardPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nome }),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => dashboardPainelItemResponseSchema.parse(raw)),

  atualizar: (id: string, patch: Partial<Pick<DashboardPainel, 'nome' | 'is_visivel' | 'widgets_json'>>): Promise<{ data: DashboardPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(patch),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => dashboardPainelItemResponseSchema.parse(raw)),

  reordenar: (ids: string[]): Promise<{ data: { reordenado: boolean } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/reordenar`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ ids }),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => dashboardPainelReordenarResponseSchema.parse(raw)),

  deletar: (id: string): Promise<{ data: { deletado: boolean } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })
      .then(res => handleResponse<unknown>(res))
      .then(raw => dashboardPainelDeletarResponseSchema.parse(raw)),
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
  kpis: async (
    period: string,
    range?: { from: string; to: string },
    idsWorkspacesFiltro?: string[],
  ): Promise<DashboardKpis> => {
    const params = new URLSearchParams()
    if (range) {
      params.set('data_inicio', range.from)
      params.set('data_fim', range.to)
    }
    if (idsWorkspacesFiltro?.length) {
      params.set('ids_workspaces', idsWorkspacesFiltro.join(','))
    }
    const qs = params.toString()
    const url = qs
      ? `${API_BASE}/bid-frete-internacional/dashboard/kpis?${qs}`
      : `${API_BASE}/bid-frete-internacional/dashboard/kpis`
    const res = await fetch(url, { headers: headers() })
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

  trend: async (
    period: string,
    granularity = 'month',
    idsWorkspacesFiltro?: string[],
  ): Promise<{ period: string; granularity: string; value: DashboardTrendBucket[] }> => {
    const url = urlComEscopoWorkspaces(
      `${API_BASE}/bid-frete-internacional/dashboard/widgets`,
      idsWorkspacesFiltro,
    )
    const res = await fetch(url, {
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

  insights: async (
    period: string,
    range?: { from: string; to: string },
    idsWorkspacesFiltro?: string[],
  ): Promise<DashboardInsightsResponseParsed> => {
    const params = new URLSearchParams({ period })
    if (range) {
      params.set('data_inicio', range.from)
      params.set('data_fim', range.to)
    }
    if (idsWorkspacesFiltro?.length) {
      params.set('ids_workspaces', idsWorkspacesFiltro.join(','))
    }
    const qs = params.toString()
    const url = qs
      ? `${API_BASE}/bid-frete-internacional/dashboard/insights?${qs}`
      : `${API_BASE}/bid-frete-internacional/dashboard/insights`
    const res = await fetch(url, { headers: headers() })
    const raw = await handleResponse<unknown>(res)
    return dashboardInsightsResponseSchema.parse(raw)
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

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''

function urlUsuariosOrganizacaoConfigurador(): string {
  if (CONFIGURADOR_URL) return `${CONFIGURADOR_URL}/api/v1/usuarios`
  return '/api/v1/usuarios'
}

const listarUsuariosOrganizacaoResponseSchema = z.object({
  usuarios: z.array(z.object({
    id_usuario: z.string(),
    nome_usuario: z.string(),
  })),
})

/** Lista usuários da organização (Configurador) para resolver nomes na tabela. */
export async function listarUsuariosOrganizacao(
  getToken: () => Promise<string | null>,
): Promise<Array<{ id_usuario: string; nome_usuario: string }>> {
  const token = await getToken()
  if (!token) return []

  const res = await fetch(urlUsuariosOrganizacaoConfigurador(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    console.warn('[listarUsuariosOrganizacao] /api/v1/usuarios retornou', res.status)
    return []
  }

  const raw = await res.json()
  const parsed = listarUsuariosOrganizacaoResponseSchema.parse(raw)
  return parsed.usuarios
}

