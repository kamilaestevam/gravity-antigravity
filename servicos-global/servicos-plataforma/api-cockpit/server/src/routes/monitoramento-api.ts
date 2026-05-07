/**
 * monitoramento-api.ts — Rotas de ingestao e consulta de metricas de API
 *
 * POST /ingestao                       Recebe batch de metricas dos produtos (S2S)
 * GET  /servicos                       Lista servicos com status (health check)
 * GET  /logs                           Lista logs de requisicoes (paginado)
 * GET  /estatisticas-log-requisicao-api       KPIs agregados (24h uptime, latencia media, etc.)
 *
 * NOMENCLATURA DDD (REGRA 3/4 — FKs canonicas + sufixo de entidade em genericos):
 *   - id_organizacao, id_produto_gravity, id_usuario        FKs canonicas
 *   - endpoint_log_requisicao_api, metodo_http_log_requisicao_api         entidade LogRequisicaoApi
 *   - codigo_resposta_http_log_requisicao_api, latencia_ms_log_requisicao_api
 *   - data_criacao_log_requisicao_api                              audit field (REGRA 3)
 *
 * SERVIÇO_PLATAFORMA (runtime — nao persistido):
 *   - nome_servico_plataforma, status_servico_plataforma, latencia_ms_servico_plataforma
 *   - versao_servico_plataforma, data_ultimo_check_servico_plataforma, tipo_servico_plataforma
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { requireInternalKey } from '../middleware/requireInternalKey'

const router = Router()

// ─── In-Memory Store (TODO: migrar para Prisma LogRequisicaoApi) ───────────────
//
// Status atual: store em memória, perdido em restart, MAX 10k registros.
// Dev/staging usam isto; produção precisa da migração.
//
// Roadmap da migração (requer Coordenador):
//   1. Schema LogRequisicaoApi ja existe no fragment.prisma do api-cockpit.
//      Atencao: id_api_token e obrigatorio no schema, mas nao e capturado
//      no ingest atual — ajustar antes da persistencia.
//   2. Reescrever POST /ingest -> prisma.logRequisicaoApi.createMany
//   3. Reescrever GET /logs -> prisma.logRequisicaoApi.findMany com filtros
//   4. Reescrever GET /stats -> count + groupBy
//   5. Particionar por mes (similar ao HistoricoGlobal) para LGPD 5+ anos

interface LogRequisicaoApiEntry {
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string | null
  endpoint_log_requisicao_api: string
  metodo_http_log_requisicao_api: string
  codigo_resposta_http_log_requisicao_api: number
  latencia_ms_log_requisicao_api: number
  id_correlacao: string | null
  data_criacao_log_requisicao_api: string
  // Pré-computados no ingest pra evitar split('T') repetido em GET /logs
  _ts_ms: number
  _data: string
  _hora: string
}

/** Dado cru vindo do cliente (antes do pré-processamento). */
interface LogRequisicaoApiInput {
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string | null
  endpoint_log_requisicao_api: string
  metodo_http_log_requisicao_api: string
  codigo_resposta_http_log_requisicao_api: number
  latencia_ms_log_requisicao_api: number
  id_correlacao: string | null
  data_criacao_log_requisicao_api: string
}

type StatusServicoPlataforma = 'ONLINE' | 'DEGRADADO' | 'OFFLINE'
// PLATAFORMA substitui NUCLEO (renomeado em 2026-05-06 — alinha com pasta servicos-plataforma/)
type TipoServicoPlataforma = 'PLATAFORMA' | 'PRODUTO_GRAVITY' | 'CONECTOR'

interface ServicoPlataforma {
  nome_servico_plataforma: string
  status_servico_plataforma: StatusServicoPlataforma
  latencia_ms_servico_plataforma: number
  versao_servico_plataforma: string
  data_ultimo_check_servico_plataforma: string
  tipo_servico_plataforma: TipoServicoPlataforma
}

// Store em memoria — em producao usar Prisma (LogRequisicaoApi) ou Redis TimeSeries
const logRequisicaoApiStore: LogRequisicaoApiEntry[] = []
const MAX_STORE_SIZE = 10_000
const OVERFLOW_WARNING_THRESHOLD = Math.floor(MAX_STORE_SIZE * 0.9) // 90%
let overflowWarningEmitted = false

// ─── Descoberta dinamica de servicos via contracts.json ────────────────
//
// Substitui a lista hard-coded de portas. Fonte unica de verdade e
// `servicos-global/contracts.json`. Servico novo no contracts aparece
// no inventario sem alteracao de codigo.
//
// Tipo derivado:
//   - Em products[]            → PRODUTO_GRAVITY
//   - Comeca com "conector-"   → CONECTOR
//   - Senao                    → PLATAFORMA

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
    .filter(([nome]) => !nome.startsWith('_'))             // pula _nota e similares
    .filter(([, cfg]) => typeof cfg.baseUrl === 'string')  // somente entries com baseUrl
    .map(([nome, cfg]) => ({
      nome_servico_plataforma:     nome,
      base_url_servico_plataforma: cfg.baseUrl as string,
      tipo_servico_plataforma:     tipoDoServico(nome, contracts.products),
    }))
}

// ─── Schemas Zod (Mandamento 06 — toda rota com Zod) ─────────────────────

const IngestSchema = z.object({
  entries: z.array(z.object({
    id_organizacao:                   z.string(),
    id_produto_gravity:               z.string(),
    id_usuario:                       z.string().nullable(),
    endpoint_log_requisicao_api:             z.string(),
    metodo_http_log_requisicao_api:          z.string(),
    codigo_resposta_http_log_requisicao_api: z.number().int(),
    latencia_ms_log_requisicao_api:          z.number().int(),
    id_correlacao:                    z.string().nullable(),
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

// ─── POST /ingest — Receber batch de metricas ───────────────────────────

/** Pré-computa campos derivados para evitar string.split() repetido em GET /logs. */
function enrichEntry(input: LogRequisicaoApiInput): LogRequisicaoApiEntry {
  const ts = input.data_criacao_log_requisicao_api
  const tIdx = ts.indexOf('T')
  const data = tIdx >= 0 ? ts.slice(0, tIdx) : ts
  const hora = tIdx >= 0 ? ts.slice(tIdx + 1, tIdx + 9) : ''
  return {
    ...input,
    _ts_ms: Date.parse(ts),
    _data: data,
    _hora: hora,
  }
}

router.post('/ingestao', requireInternalKey, (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = IngestSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ erro: 'Payload invalido', issues: parsed.error.issues })
    }

    // Enriquece no ingest (1x por entry) em vez de no GET (N leituras depois)
    const enriched = parsed.data.entries.map(enrichEntry)
    logRequisicaoApiStore.push(...enriched)

    // FIFO: remove os mais antigos se exceder limite.
    // Usa splice em vez de shift() em loop — O(1) vs O(n) por iteração.
    if (logRequisicaoApiStore.length > MAX_STORE_SIZE) {
      logRequisicaoApiStore.splice(0, logRequisicaoApiStore.length - MAX_STORE_SIZE)
    }

    // Warning uma vez quando store se aproxima do limite — sinal pra migrar para Prisma
    if (logRequisicaoApiStore.length >= OVERFLOW_WARNING_THRESHOLD && !overflowWarningEmitted) {
      overflowWarningEmitted = true
      console.warn(
        `[monitoramento-api] Store em memória atingiu ${logRequisicaoApiStore.length}/${MAX_STORE_SIZE} ` +
        `registros. Dados antigos começam a ser descartados. Migrar para Prisma LogRequisicaoApi.`
      )
    }

    res.json({
      quantidade_ingerida: parsed.data.entries.length,
      total_log_requisicao_api:   logRequisicaoApiStore.length,
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

    // Multiplos servicos compartilham processo (ex: tudo em localhost:3001 e
    // localhost:8005). Deduplica por baseUrl para fazer 1 fetch /health por
    // processo, depois replica o resultado para todos os servicos do mesmo URL.
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

    // Ordenar: ONLINE primeiro, depois DEGRADADO, depois OFFLINE
    const ordem: Record<StatusServicoPlataforma, number> = { ONLINE: 0, DEGRADADO: 1, OFFLINE: 2 }
    servicos.sort((a, b) => ordem[a.status_servico_plataforma] - ordem[b.status_servico_plataforma])

    res.json({ servicos })
  } catch (err) {
    next(err)
  }
})

// ─── GET /logs — Consultar logs de requisicoes ──────────────────────────

router.get('/logs', (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = LogsQuerySchema.parse(req.query)

    // Filtro único — O(n) em vez de O(n×4) com 4 filters sequenciais
    const {
      id_organizacao,
      id_produto_gravity,
      codigo_resposta_http_minimo,
      codigo_resposta_http_maximo,
    } = filtros
    const filtrados = logRequisicaoApiStore.filter((e) => {
      if (id_organizacao && e.id_organizacao !== id_organizacao) return false
      if (id_produto_gravity && e.id_produto_gravity !== id_produto_gravity) return false
      if (codigo_resposta_http_minimo !== undefined && e.codigo_resposta_http_log_requisicao_api < codigo_resposta_http_minimo) return false
      if (codigo_resposta_http_maximo !== undefined && e.codigo_resposta_http_log_requisicao_api > codigo_resposta_http_maximo) return false
      return true
    })

    // Ordena por timestamp desc usando _ts_ms pré-computado (sem parse a cada compare)
    filtrados.sort((a, b) => b._ts_ms - a._ts_ms)

    const total = filtrados.length
    const skip = (filtros.pagina - 1) * filtros.limite
    const logs = filtrados.slice(skip, skip + filtros.limite).map((e) => ({
      id_log_requisicao_api:                   `${e.data_criacao_log_requisicao_api}-${e.endpoint_log_requisicao_api}-${e.metodo_http_log_requisicao_api}`,
      id_organizacao:                   e.id_organizacao,
      id_produto_gravity:               e.id_produto_gravity,
      id_usuario:                       e.id_usuario,
      id_correlacao:                    e.id_correlacao,
      endpoint_log_requisicao_api:             e.endpoint_log_requisicao_api,
      metodo_http_log_requisicao_api:          e.metodo_http_log_requisicao_api,
      codigo_resposta_http_log_requisicao_api: e.codigo_resposta_http_log_requisicao_api,
      latencia_ms_log_requisicao_api:          e.latencia_ms_log_requisicao_api,
      data_criacao_log_requisicao_api:         e.data_criacao_log_requisicao_api,
      // Campos derivados pré-computados (UI consome diretos)
      data_log_requisicao_api:                 e._data,
      hora_log_requisicao_api:                 e._hora,
      resultado_log_requisicao_api:
        e.codigo_resposta_http_log_requisicao_api < 400
          ? 'SUCESSO'
          : e.codigo_resposta_http_log_requisicao_api < 500
            ? 'ERRO_CLIENTE'
            : 'ERRO_SERVIDOR',
    }))

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

// ─── GET /stats — KPIs agregados ────────────────────────────────────────

/**
 * GET /estatisticas-log-requisicao-api[?id_organizacao=...]
 *
 * Sem filtro: agregado global (uso pelo admin).
 * Com filtro id_organizacao: agregado per-org (uso pelo workspace).
 *
 * Campos calculados sao identicos nos dois casos. Adicional:
 *   quantidade_produtos_distintos_log_requisicao_api — count distinct id_produto_gravity
 */
const EstatisticasQuerySchema = z.object({
  id_organizacao: z.string().optional(),
  // Quando 'serie=diaria', retorna tambem a chave serie_diaria_log_requisicao_api
  // com agregacao por dia (UTC) dos ultimos N dias (parametro 'dias', max 30).
  serie:          z.enum(['diaria']).optional(),
  dias:           z.coerce.number().int().positive().max(30).optional(),
})

/** YYYY-MM-DD em UTC a partir de timestamp em ms */
function diaUtc(tsMs: number): string {
  return new Date(tsMs).toISOString().slice(0, 10)
}

router.get('/estatisticas-log-requisicao-api', (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      id_organizacao: filtroIdOrganizacao,
      serie,
      dias,
    } = EstatisticasQuerySchema.parse(req.query)
    const agora = Date.now()
    const h24   = agora - 24 * 60 * 60 * 1000

    // Single pass — filter, count, sum, groupBy em 1 loop só (era 4 iterações antes)
    let quantidadeRequisicoes = 0
    let quantidadeErros = 0
    let somaLatencia = 0
    const porIdProdutoGravity: Record<string, number> = {}
    const porFaixaCodigoRespostaHttp: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }

    // Serie diaria: agrega por dia UTC quando serie=diaria
    const diasJanela     = serie === 'diaria' ? (dias ?? 30) : 0
    const inicioJanelaMs = diasJanela > 0 ? agora - diasJanela * 24 * 60 * 60 * 1000 : 0
    // Map dia -> { total, sucesso }; sucesso = HTTP < 500 (falhas de cliente nao contam contra disponibilidade)
    const porDia: Record<string, { total: number; sucesso: number }> = {}

    for (const e of logRequisicaoApiStore) {
      if (filtroIdOrganizacao && e.id_organizacao !== filtroIdOrganizacao) continue

      // Acumular serie diaria primeiro (janela de N dias) — independente da janela 24h
      if (diasJanela > 0 && e._ts_ms >= inicioJanelaMs) {
        const dia = diaUtc(e._ts_ms)
        const slot = porDia[dia] ?? (porDia[dia] = { total: 0, sucesso: 0 })
        slot.total++
        if (e.codigo_resposta_http_log_requisicao_api < 500) slot.sucesso++
      }

      // Acumulados 24h (mantem comportamento original)
      if (e._ts_ms < h24) continue
      quantidadeRequisicoes++
      somaLatencia += e.latencia_ms_log_requisicao_api
      if (e.codigo_resposta_http_log_requisicao_api >= 500) quantidadeErros++
      porIdProdutoGravity[e.id_produto_gravity] = (porIdProdutoGravity[e.id_produto_gravity] || 0) + 1
      const grupo = `${Math.floor(e.codigo_resposta_http_log_requisicao_api / 100)}xx`
      if (grupo in porFaixaCodigoRespostaHttp) porFaixaCodigoRespostaHttp[grupo]++
    }

    const latenciaMedia = quantidadeRequisicoes > 0 ? Math.round(somaLatencia / quantidadeRequisicoes) : 0
    const percentualUptime = quantidadeRequisicoes > 0
      ? Number(((1 - quantidadeErros / quantidadeRequisicoes) * 100).toFixed(1))
      : 100
    const quantidadeProdutosDistintos = Object.keys(porIdProdutoGravity).length

    // Monta serie diaria com TODOS os dias da janela (incluindo dias sem trafego — total=0)
    let serieDiariaLogRequisicaoApi: { data: string; total: number; sucesso: number; percentual: number }[] | undefined
    if (diasJanela > 0) {
      serieDiariaLogRequisicaoApi = []
      for (let i = diasJanela - 1; i >= 0; i--) {
        const dia = diaUtc(agora - i * 24 * 60 * 60 * 1000)
        const slot = porDia[dia] ?? { total: 0, sucesso: 0 }
        const percentual = slot.total > 0
          ? Number(((slot.sucesso / slot.total) * 100).toFixed(1))
          : 100
        serieDiariaLogRequisicaoApi.push({
          data:       dia,
          total:      slot.total,
          sucesso:    slot.sucesso,
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
      por_id_produto_gravity:                    porIdProdutoGravity,
      por_faixa_codigo_resposta_http:            porFaixaCodigoRespostaHttp,
      ...(serieDiariaLogRequisicaoApi ? { serie_diaria_log_requisicao_api: serieDiariaLogRequisicaoApi } : {}),
    })
  } catch (err) {
    next(err)
  }
})

export { router as monitoramentoApiRouter }
