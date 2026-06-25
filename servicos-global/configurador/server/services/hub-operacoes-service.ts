/**
 * hub-operacoes-service.ts — KPIs e lista de processos reais para o Hub
 *
 * Agrega dados cross-produto via REST S2S (mesmo padrão de hub-insights-service).
 * Resiliente: falha em um produto não zera os demais.
 */

import { z } from 'zod'
import {
  normalizarChavesProdutosAtivosHub,
  type HubUserRole,
  normalizeHubRole,
} from './hub-insights-service.js'

export const hubOperacaoProcessoSchema = z.object({
  id: z.string(),
  id_processo: z.string(),
  nome: z.string(),
  detalhe: z.string(),
  badge: z.string(),
  badge_variant: z.enum(['embarque', 'desembaraco']),
})

export const hubOperacoesResumoSchema = z.object({
  processos_em_andamento: z.number().int().nonnegative(),
  aguardando_acao: z.number().int().nonnegative(),
  notas_fiscais_pendentes: z.number().int().nonnegative(),
  processos_hoje: z.number().int().nonnegative(),
  processos: z.array(hubOperacaoProcessoSchema),
  fontes_disponiveis: z.array(z.string()),
})

export type HubOperacoesResumo = z.infer<typeof hubOperacoesResumoSchema>

const FETCH_TIMEOUT_MS = 3_000

function getPedidoUrl(): string {
  return process.env.PEDIDO_SERVICE_URL ?? 'http://localhost:8030'
}
function getBidCambioUrl(): string {
  return process.env.BID_CAMBIO_URL ?? 'http://localhost:8025'
}
function getBidFreteUrl(): string {
  if (process.env.RAILWAY_ENVIRONMENT) return 'http://127.0.0.1:8023'
  return process.env.BID_FRETE_SERVICE_URL ?? 'http://127.0.0.1:8023'
}
function getSimulaCustoUrl(): string {
  return process.env.SIMULA_CUSTO_SERVICE_URL ?? 'http://localhost:8020'
}
function getLpcoUrl(): string {
  return process.env.LPCO_SERVICE_URL ?? 'http://localhost:8027'
}
function getNfImportUrl(): string {
  return process.env.NF_IMPORTACAO_SERVICE_URL ?? 'http://localhost:8028'
}
function getProcessoUrl(): string {
  return process.env.PROCESSO_SERVICE_URL ?? 'http://localhost:8026'
}
function getChaveInterna(): string {
  return process.env.CHAVE_INTERNA_SERVICO ?? ''
}

interface FetchCtx {
  id_organizacao: string
  id_usuario: string
  internalKey: string
}

function montarHeaders(ctx: FetchCtx): Record<string, string> {
  return {
    'x-chave-interna-servico': ctx.internalKey,
    'x-internal-key': ctx.internalKey,
    'x-id-organizacao': ctx.id_organizacao,
    'x-id-usuario': ctx.id_usuario,
    'Content-Type': 'application/json',
  }
}

async function fetchInter<T>(url: string, ctx: FetchCtx): Promise<T> {
  const response = await fetch(url, {
    headers: montarHeaders(ctx),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<T>
}

function urlBidFreteDashboard(path: string): string {
  return `${getBidFreteUrl()}/api/v1/bid-frete-internacional/dashboard${path}`
}

function inferirBadgeVariant(rotulo: string): 'embarque' | 'desembaraco' {
  const norm = rotulo.toLowerCase()
  if (norm.includes('desembar') || norm.includes('liber') || norm.includes('entreg')) {
    return 'desembaraco'
  }
  return 'embarque'
}

function montarNomeProcesso(row: {
  referencia_exportador_processo?: string | null
  referencia_importador_processo?: string | null
  numero_processo?: string | null
}): string {
  return (
    row.referencia_exportador_processo?.trim()
    || row.referencia_importador_processo?.trim()
    || row.numero_processo?.trim()
    || 'Processo'
  )
}

async function buscarProcessosHub(ctx: FetchCtx): Promise<{
  total: number
  hoje: number
  itens: HubOperacoesResumo['processos']
}> {
  const payload = await fetchInter<{
    success?: boolean
    data?: Array<{
      id_processo: string
      numero_processo: string
      referencia_exportador_processo?: string | null
      referencia_importador_processo?: string | null
      tipo_operacao_processo?: string | null
      data_criacao_processo: string
      status_atual?: { rotulo_processo_status?: string | null; nome_processo_status?: string | null } | null
    }>
    pagination?: { total?: number }
  }>(`${getProcessoUrl()}/api/v1/processos?limit=8&page=1`, ctx)

  const rows = payload.data ?? []
  const inicioHoje = new Date()
  inicioHoje.setHours(0, 0, 0, 0)

  const hoje = rows.filter((r) => new Date(r.data_criacao_processo) >= inicioHoje).length

  const itens = rows.map((row) => {
    const badge = row.status_atual?.rotulo_processo_status
      ?? row.status_atual?.nome_processo_status
      ?? 'EM ANDAMENTO'
    const detalheParts = [row.numero_processo, row.tipo_operacao_processo].filter(Boolean)
    return {
      id: row.id_processo,
      id_processo: row.id_processo,
      nome: montarNomeProcesso(row),
      detalhe: detalheParts.join(' · ') || row.numero_processo,
      badge: badge.toUpperCase(),
      badge_variant: inferirBadgeVariant(badge),
    }
  })

  return {
    total: payload.pagination?.total ?? rows.length,
    hoje,
    itens,
  }
}

async function contarPendenciasPedido(ctx: FetchCtx, ativo: boolean): Promise<number> {
  if (!ativo) return 0
  const data = await fetchInter<Record<string, number>>(
    `${getPedidoUrl()}/api/v1/pedidos/dashboard/kpis`,
    ctx,
  )
  return (data.pedidos_atrasados ?? 0) + (data.pedidos_sem_exportador ?? 0)
}

async function contarPendenciasBidFrete(ctx: FetchCtx, ativo: boolean): Promise<number> {
  if (!ativo) return 0
  const payload = await fetchInter<{ alertas?: Array<{ tipo: string; count: number }> }>(
    urlBidFreteDashboard('/insights-alertas'),
    ctx,
  )
  const tiposAcao = new Set(['vence_hoje', 'resposta', 'aprovacao', 'fora_prazo', 'vencimento'])
  return (payload.alertas ?? [])
    .filter((a) => tiposAcao.has(a.tipo) && a.count > 0)
    .reduce((sum, a) => sum + a.count, 0)
}

async function contarPendenciasBidCambio(ctx: FetchCtx, ativo: boolean): Promise<number> {
  if (!ativo) return 0
  const payload = await fetchInter<{ proximos_vencimentos?: { total?: number } }>(
    `${getBidCambioUrl()}/api/v1/bid-cambio/dashboard/vencimentos?dias=30`,
    ctx,
  )
  return payload.proximos_vencimentos?.total ?? 0
}

async function contarPendenciasSimulaCusto(ctx: FetchCtx, ativo: boolean): Promise<number> {
  if (!ativo) return 0
  const data = await fetchInter<{ inviavel?: number; atencao?: number }>(
    `${getSimulaCustoUrl()}/api/v1/simula-custo/dashboard/kpis`,
    ctx,
  )
  return (data.inviavel ?? 0) + (data.atencao ?? 0)
}

async function contarPendenciasLpco(ctx: FetchCtx, ativo: boolean): Promise<number> {
  if (!ativo) return 0
  const data = await fetchInter<Record<string, number>>(
    `${getLpcoUrl()}/api/v1/lpcos/stats`,
    ctx,
  )
  return data.SUSPENSA ?? data.suspensa ?? 0
}

async function contarNotasFiscaisPendentes(ctx: FetchCtx, ativo: boolean): Promise<number> {
  if (!ativo) return 0
  const data = await fetchInter<{ pendentes?: number }>(
    `${getNfImportUrl()}/api/v1/nf-importacao/dashboard/kpis`,
    ctx,
  )
  return data.pendentes ?? 0
}

export async function generateHubOperacoes(
  id_organizacao: string,
  id_usuario: string,
  tipo_usuario: string,
  activeProductKeys: Set<string>,
): Promise<HubOperacoesResumo> {
  const _role: HubUserRole = normalizeHubRole(tipo_usuario)
  void _role

  const ctx: FetchCtx = {
    id_organizacao,
    id_usuario,
    internalKey: getChaveInterna(),
  }

  const chaves = normalizarChavesProdutosAtivosHub(activeProductKeys)
  const fontes: string[] = []

  const [
    processosResult,
    pedidoPend,
    fretePend,
    cambioPend,
    simulaPend,
    lpcoPend,
    nfPend,
  ] = await Promise.allSettled([
    buscarProcessosHub(ctx),
    contarPendenciasPedido(ctx, chaves.has('pedido')),
    contarPendenciasBidFrete(ctx, chaves.has('bid-frete') || chaves.has('bid-frete-internacional')),
    contarPendenciasBidCambio(ctx, chaves.has('bid-cambio')),
    contarPendenciasSimulaCusto(ctx, chaves.has('simula-custo')),
    contarPendenciasLpco(ctx, chaves.has('lpco')),
    contarNotasFiscaisPendentes(ctx, chaves.has('nf-importacao') || chaves.has('nf-import')),
  ])

  let processos_em_andamento = 0
  let processos_hoje = 0
  let processos: HubOperacoesResumo['processos'] = []

  if (processosResult.status === 'fulfilled') {
    processos_em_andamento = processosResult.value.total
    processos_hoje = processosResult.value.hoje
    processos = processosResult.value.itens
    fontes.push('processo')
  }

  const partesPendencia = [
    { nome: 'pedido', result: pedidoPend },
    { nome: 'bid-frete', result: fretePend },
    { nome: 'bid-cambio', result: cambioPend },
    { nome: 'simula-custo', result: simulaPend },
    { nome: 'lpco', result: lpcoPend },
  ]

  let aguardando_acao = 0
  for (const parte of partesPendencia) {
    if (parte.result.status === 'fulfilled' && parte.result.value > 0) {
      aguardando_acao += parte.result.value
      fontes.push(parte.nome)
    }
  }

  let notas_fiscais_pendentes = 0
  if (nfPend.status === 'fulfilled') {
    notas_fiscais_pendentes = nfPend.value
    if (notas_fiscais_pendentes > 0) fontes.push('nf-importacao')
  }

  return hubOperacoesResumoSchema.parse({
    processos_em_andamento,
    aguardando_acao,
    notas_fiscais_pendentes,
    processos_hoje,
    processos,
    fontes_disponiveis: fontes,
  })
}
