/**
 * monitoramento-api.ts — Rotas de ingestao e consulta de metricas de API
 *
 * POST /ingestao                              Recebe batch de metricas dos produtos (S2S)
 * GET  /servicos                              Lista servicos com status (health check)
 * GET  /logs                                  Lista logs de requisicoes (paginado)
 * GET  /estatisticas-log-requisicao-api       KPIs agregados (24h uptime, latencia media, etc.)
 *
 * NOMENCLATURA DDD (REGRA 3/4 — FKs canonicas + sufixo de entidade em genericos):
 *   - id_organizacao, id_produto_gravity, id_usuario, id_api_token        FKs canonicas
 *   - endpoint_log_requisicao_api, metodo_http_log_requisicao_api         entidade LogRequisicaoApi
 *   - codigo_resposta_http_log_requisicao_api, latencia_ms_log_requisicao_api
 *   - data_criacao_log_requisicao_api                                     audit field (REGRA 3)
 *
 * SERVIÇO_PLATAFORMA (runtime — nao persistido):
 *   - nome_servico_plataforma, status_servico_plataforma, latencia_ms_servico_plataforma
 *   - versao_servico_plataforma, data_ultimo_check_servico_plataforma, tipo_servico_plataforma
 *
 * PERSISTENCIA (Fase 1B — ativada em 2026-05-07):
 *   - Ingest grava em prisma.logRequisicaoApi via buffer (flush 100 entries OU 5s)
 *   - Reads (logs/estatisticas) consultam Postgres direto
 *   - Schema permite id_api_token NULL (chamadas internas S2S sem token)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { requireInternalKey } from '../middleware/requireInternalKey'
import { PrismaClient } from '../../../../generated/index.js'

const router = Router()
const prisma = new PrismaClient()

// ─── Buffer de ingest (flush 100 entries OU 5s) ─────────────────────────
//
// Performance: 1 INSERT por requisicao seria prohibitivo (10k req/s -> 10k INSERTs/s).
// Buffer agrupa entradas e dispara createMany periodicamente.
// Fire-and-forget: nao bloqueia a resposta do POST /ingestao.

interface LogRequisicaoApiInput {
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string | null
  id_api_token: string | null
  endpoint_log_requisicao_api: string
  metodo_http_log_requisicao_api: string
  codigo_resposta_http_log_requisicao_api: number
  latencia_ms_log_requisicao_api: number
  id_correlacao: string | null
  data_criacao_log_requisicao_api: string
}

const ingestBuffer: LogRequisicaoApiInput[] = []
const FLUSH_INTERVAL_MS = 5_000
const FLUSH_BATCH_SIZE  = 100

let flushTimer: ReturnType<typeof setInterval> | null = null

async function flushIngestBuffer(): Promise<void> {
  if (ingestBuffer.length === 0) return
  // Drena o buffer atomicamente (splice retorna o que tinha + zera o array)
  const batch = ingestBuffer.splice(0, ingestBuffer.length)
  try {
    await prisma.logRequisicaoApi.createMany({
      data: batch.map((e) => ({
        id_organizacao:                          e.id_organizacao,
        id_produto_gravity:                      e.id_produto_gravity,
        id_usuario:                              e.id_usuario,
        id_api_token:                            e.id_api_token,
        id_correlacao:                           e.id_correlacao,
        endpoint_log_requisicao_api:             e.endpoint_log_requisicao_api,
        metodo_http_log_requisicao_api:          e.metodo_http_log_requisicao_api,
        codigo_resposta_http_log_requisicao_api: e.codigo_resposta_http_log_requisicao_api,
        latencia_ms_log_requisicao_api:          e.latencia_ms_log_requisicao_api,
        data_criacao_log_requisicao_api:         new Date(e.data_criacao_log_requisicao_api),
      })),
    })
  } catch (err) {
    // Nao re-enfilera: se falhou, perdeu (vs ficar acumulando indefinidamente em memoria).
    // Logamos para investigacao mas nao paramos a aplicacao (fire-and-forget).
    console.warn('[monitoramento-api] flush falhou — dropando batch', {
      tamanho: batch.length,
      erro:    err instanceof Error ? err.message : String(err),
    })
  }
}

function ensureFlushTimer(): void {
  if (flushTimer) return
  flushTimer = setInterval(() => { void flushIngestBuffer() }, FLUSH_INTERVAL_MS)
  if (flushTimer && typeof flushTimer === 'object' && 'unref' in flushTimer) {
    flushTimer.unref()
  }
}

// ─── Tipos do snapshot de saude (runtime, nao persistido) ────────────────

type StatusServicoPlataforma = 'ONLINE' | 'DEGRADADO' | 'OFFLINE'
type TipoServicoPlataforma = 'PLATAFORMA' | 'PRODUTO_GRAVITY' | 'CONECTOR'

interface ServicoPlataforma {
  nome_servico_plataforma: string
  status_servico_plataforma: StatusServicoPlataforma
  latencia_ms_servico_plataforma: number
  versao_servico_plataforma: string
  data_ultimo_check_servico_plataforma: string
  tipo_servico_plataforma: TipoServicoPlataforma
}

// ─── Descoberta dinamica de servicos via contracts.json ────────────────

interface ContractsJson {
  products: string[]
  services: Record<string, { baseUrl?: string; pathPrefix?: string }>
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTRACTS_PATH = resolve(__dirname, '../../../../../contracts.json')

let contractsCache: ContractsJson | null = null
function carregarContracts(): ContractsJson {
  if (contractsCache) return contractsCache
  const raw = readFileSync(CONTRACTS_PATH, 'utf-8')
  contractsCache = JSON.parse(raw) as ContractsJson
  return contractsCache
}

function tipoDoServico(nome: string, products: string[]): TipoServicoPlataforma {
  if (products.includes(nome)) return 'PRODUTO_GRAVITY'
  if (nome.startsWith('conector-')) return 'CONECTOR'
  return 'PLATAFORMA'
}

interface ServicoDescoberto {
  nome_servico_plataforma: string
  base_url_servico_plataforma: string
  tipo_servico_plataforma: TipoServicoPlataforma
}

function descobrirServicos(): ServicoDescoberto[] {
  const contracts = carregarContracts()
  return Object.entries(contracts.services)
    .filter(([nome]) => !nome.startsWith('_'))
    .filter(([, cfg]) => typeof cfg.baseUrl === 'string')
    .map(([nome, cfg]) => ({
      nome_servico_plataforma:     nome,
      base_url_servico_plataforma: cfg.baseUrl as string,
      tipo_servico_plataforma:     tipoDoServico(nome, contracts.products),
    }))
}

// ─── Schemas Zod (Mandamento 06 — toda rota com Zod) ─────────────────────

const IngestSchema = z.object({
  entries: z.array(z.object({
    id_organizacao:                          z.string(),
    id_produto_gravity:                      z.string(),
    id_usuario:                              z.string().nullable(),
    id_api_token:                            z.string().nullable(),
    endpoint_log_requisicao_api:             z.string(),
    metodo_http_log_requisicao_api:          z.string(),
    codigo_resposta_http_log_requisicao_api: z.number().int(),
    latencia_ms_log_requisicao_api:          z.number().int(),
    id_correlacao:                           z.string().nullable(),
    data_criacao_log_requisicao_api:         z.string(),
  })).min(1).max(500),
})

const LogsQuerySchema = z.object({
  id_organizacao:                z.string().optional(),
  id_produto_gravity:            z.string().optional(),
  codigo_resposta_http_minimo:   z.coerce.number().int().optional(),
  codigo_resposta_http_maximo:   z.coerce.number().int().optional(),
  pagina:                        z.coerce.number().int().positive().default(1),
  limite:                        z.coerce.number().int().positive().max(100).default(50),
})

// ─── POST /ingestao — Receber batch de metricas (vai para o buffer) ─────

router.post('/ingestao', requireInternalKey, (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = IngestSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Payload invalido', issues: parsed.error.issues })
    }

    ensureFlushTimer()
    ingestBuffer.push(...parsed.data.entries)

    // Flush imediato se passou do tamanho do batch (evita esperar 5s)
    if (ingestBuffer.length >= FLUSH_BATCH_SIZE) {
      void flushIngestBuffer()
    }

    res.json({
      quantidade_ingerida: parsed.data.entries.length,
      tamanho_buffer:      ingestBuffer.length,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /servicos — Health check de todos os servicos ──────────────────

interface HealthCheckResult {
  ok:       boolean
  latencia: number
  versao:   string
}

router.get('/servicos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const servicosDescobertos = descobrirServicos()

    const baseUrlsUnicas = [...new Set(servicosDescobertos.map((s) => s.base_url_servico_plataforma))]
    const healthPorBaseUrl = new Map<string, HealthCheckResult>()

    await Promise.allSettled(baseUrlsUnicas.map(async (baseUrl) => {
      const inicio = Date.now()
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3_000)
        const resp = await fetch(`${baseUrl}/health`, { signal: controller.signal })
        clearTimeout(timeout)
        const latencia = Date.now() - inicio
        const data = await resp.json().catch(() => ({}))
        healthPorBaseUrl.set(baseUrl, {
          ok:       resp.ok,
          latencia,
          versao:   (data as { version?: string }).version || '1.0.0',
        })
      } catch {
        healthPorBaseUrl.set(baseUrl, {
          ok:       false,
          latencia: Date.now() - inicio,
          versao:   '-',
        })
      }
    }))

    const agora = new Date().toISOString()
    const servicos: ServicoPlataforma[] = servicosDescobertos.map((svc) => {
      const health = healthPorBaseUrl.get(svc.base_url_servico_plataforma) ?? {
        ok: false, latencia: 0, versao: '-',
      }
      const status: StatusServicoPlataforma = health.ok
        ? (health.latencia > 1000 ? 'DEGRADADO' : 'ONLINE')
        : 'OFFLINE'
      return {
        nome_servico_plataforma:              svc.nome_servico_plataforma,
        status_servico_plataforma:            status,
        latencia_ms_servico_plataforma:       health.latencia,
        versao_servico_plataforma:            health.versao,
        data_ultimo_check_servico_plataforma: agora,
        tipo_servico_plataforma:              svc.tipo_servico_plataforma,
      }
    })

    const ordem: Record<StatusServicoPlataforma, number> = { ONLINE: 0, DEGRADADO: 1, OFFLINE: 2 }
    servicos.sort((a, b) => ordem[a.status_servico_plataforma] - ordem[b.status_servico_plataforma])

    res.json({ servicos })
  } catch (err) {
    next(err)
  }
})

// ─── GET /logs — Consultar logs de requisicoes (Postgres) ───────────────

router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = LogsQuerySchema.parse(req.query)

    const where: Record<string, unknown> = {}
    if (filtros.id_organizacao)     where.id_organizacao     = filtros.id_organizacao
    if (filtros.id_produto_gravity) where.id_produto_gravity = filtros.id_produto_gravity
    if (filtros.codigo_resposta_http_minimo !== undefined ||
        filtros.codigo_resposta_http_maximo !== undefined) {
      where.codigo_resposta_http_log_requisicao_api = {
        ...(filtros.codigo_resposta_http_minimo !== undefined ? { gte: filtros.codigo_resposta_http_minimo } : {}),
        ...(filtros.codigo_resposta_http_maximo !== undefined ? { lte: filtros.codigo_resposta_http_maximo } : {}),
      }
    }

    const [total, rows] = await Promise.all([
      prisma.logRequisicaoApi.count({ where }),
      prisma.logRequisicaoApi.findMany({
        where,
        orderBy: { data_criacao_log_requisicao_api: 'desc' },
        skip:    (filtros.pagina - 1) * filtros.limite,
        take:    filtros.limite,
      }),
    ])

    const logs = rows.map((e) => {
      const iso = e.data_criacao_log_requisicao_api.toISOString()
      const tIdx = iso.indexOf('T')
      const data = tIdx >= 0 ? iso.slice(0, tIdx) : iso
      const hora = tIdx >= 0 ? iso.slice(tIdx + 1, tIdx + 9) : ''
      const status = e.codigo_resposta_http_log_requisicao_api
      return {
        id_log_requisicao_api:                   e.id_log_requisicao_api,
        id_organizacao:                          e.id_organizacao,
        id_produto_gravity:                      e.id_produto_gravity,
        id_usuario:                              e.id_usuario,
        id_correlacao:                           e.id_correlacao,
        endpoint_log_requisicao_api:             e.endpoint_log_requisicao_api,
        metodo_http_log_requisicao_api:          e.metodo_http_log_requisicao_api,
        codigo_resposta_http_log_requisicao_api: status,
        latencia_ms_log_requisicao_api:          e.latencia_ms_log_requisicao_api,
        data_criacao_log_requisicao_api:         iso,
        // Campos derivados pré-computados (UI consome diretos)
        data_log_requisicao_api:                 data,
        hora_log_requisicao_api:                 hora,
        resultado_log_requisicao_api:
          status < 400
            ? 'SUCESSO'
            : status < 500
              ? 'ERRO_CLIENTE'
              : 'ERRO_SERVIDOR',
      }
    })

    res.json({
      logs,
      paginacao: {
        pagina:  filtros.pagina,
        limite:  filtros.limite,
        total,
        paginas: Math.ceil(total / filtros.limite),
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /estatisticas — KPIs agregados ─────────────────────────────────

/**
 * GET /estatisticas-log-requisicao-api[?id_organizacao=...&serie=diaria&dias=N]
 *
 * Sem filtro: agregado global (uso pelo admin).
 * Com filtro id_organizacao: agregado per-org (uso pelo workspace).
 *
 * Janela 24h: count, sum(latencia), faixas HTTP, produtos distintos.
 * Janela N dias (serie=diaria): % sucesso por dia (HTTP < 500).
 *
 * Implementacao: findMany unica com filtro WHERE data >= max(janela_24h, janela_30d),
 * depois agrega em JS. Para volumes >100k linhas/dia, considerar groupBy SQL puro.
 */

const EstatisticasQuerySchema = z.object({
  id_organizacao: z.string().optional(),
  serie:          z.enum(['diaria']).optional(),
  dias:           z.coerce.number().int().positive().max(30).optional(),
})

function diaUtc(d: Date): string {
  return d.toISOString().slice(0, 10)
}

router.get('/estatisticas-log-requisicao-api', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      id_organizacao: filtroIdOrganizacao,
      serie,
      dias,
    } = EstatisticasQuerySchema.parse(req.query)
    const agora        = Date.now()
    const h24          = new Date(agora - 24 * 60 * 60 * 1000)
    const diasJanela   = serie === 'diaria' ? (dias ?? 30) : 0
    const inicioJanela = diasJanela > 0
      ? new Date(agora - diasJanela * 24 * 60 * 60 * 1000)
      : h24

    // Buscar a janela mais larga (para cobrir 24h e/ou serie diaria de N dias).
    // Se serie=diaria, janela = N dias; senao janela = 24h.
    const where: Record<string, unknown> = {
      data_criacao_log_requisicao_api: { gte: inicioJanela },
    }
    if (filtroIdOrganizacao) where.id_organizacao = filtroIdOrganizacao

    const rows = await prisma.logRequisicaoApi.findMany({
      where,
      select: {
        id_produto_gravity:                      true,
        codigo_resposta_http_log_requisicao_api: true,
        latencia_ms_log_requisicao_api:          true,
        data_criacao_log_requisicao_api:         true,
      },
    })

    // Agrega em JS (single pass)
    let quantidadeRequisicoes = 0
    let quantidadeErros = 0
    let somaLatencia = 0
    const porIdProdutoGravity: Record<string, number> = {}
    const porFaixaCodigoRespostaHttp: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
    const porDia: Record<string, { total: number; sucesso: number }> = {}

    for (const e of rows) {
      const ts = e.data_criacao_log_requisicao_api.getTime()

      // Serie diaria (janela ampla)
      if (diasJanela > 0) {
        const dia = diaUtc(e.data_criacao_log_requisicao_api)
        const slot = porDia[dia] ?? (porDia[dia] = { total: 0, sucesso: 0 })
        slot.total++
        if (e.codigo_resposta_http_log_requisicao_api < 500) slot.sucesso++
      }

      // Janela 24h (acumulados padrao)
      if (ts < h24.getTime()) continue
      quantidadeRequisicoes++
      somaLatencia += e.latencia_ms_log_requisicao_api
      if (e.codigo_resposta_http_log_requisicao_api >= 500) quantidadeErros++
      if (e.id_produto_gravity) {
        porIdProdutoGravity[e.id_produto_gravity] = (porIdProdutoGravity[e.id_produto_gravity] || 0) + 1
      }
      const grupo = `${Math.floor(e.codigo_resposta_http_log_requisicao_api / 100)}xx`
      if (grupo in porFaixaCodigoRespostaHttp) porFaixaCodigoRespostaHttp[grupo]++
    }

    const latenciaMedia = quantidadeRequisicoes > 0 ? Math.round(somaLatencia / quantidadeRequisicoes) : 0
    const percentualUptime = quantidadeRequisicoes > 0
      ? Number(((1 - quantidadeErros / quantidadeRequisicoes) * 100).toFixed(1))
      : 100
    const quantidadeProdutosDistintos = Object.keys(porIdProdutoGravity).length

    let serieDiariaLogRequisicaoApi: { data: string; total: number; sucesso: number; percentual: number }[] | undefined
    if (diasJanela > 0) {
      serieDiariaLogRequisicaoApi = []
      for (let i = diasJanela - 1; i >= 0; i--) {
        const dia = diaUtc(new Date(agora - i * 24 * 60 * 60 * 1000))
        const slot = porDia[dia] ?? { total: 0, sucesso: 0 }
        const percentual = slot.total > 0
          ? Number(((slot.sucesso / slot.total) * 100).toFixed(1))
          : 100
        serieDiariaLogRequisicaoApi.push({
          data:    dia,
          total:   slot.total,
          sucesso: slot.sucesso,
          percentual,
        })
      }
    }

    res.json({
      quantidade_requisicoes_log_requisicao_api:        quantidadeRequisicoes,
      quantidade_erros_log_requisicao_api:              quantidadeErros,
      latencia_media_log_requisicao_api:                latenciaMedia,
      percentual_uptime_log_requisicao_api:             percentualUptime,
      quantidade_produtos_distintos_log_requisicao_api: quantidadeProdutosDistintos,
      por_id_produto_gravity:                           porIdProdutoGravity,
      por_faixa_codigo_resposta_http:                   porFaixaCodigoRespostaHttp,
      ...(serieDiariaLogRequisicaoApi ? { serie_diaria_log_requisicao_api: serieDiariaLogRequisicaoApi } : {}),
    })
  } catch (err) {
    next(err)
  }
})

export { router as monitoramentoApiRouter }
