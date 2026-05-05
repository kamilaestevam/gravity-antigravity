/**
 * monitoramento-api.ts — Rotas de ingestao e consulta de metricas de API
 *
 * POST /ingestao                       Recebe batch de metricas dos produtos (S2S)
 * GET  /servicos                       Lista servicos com status (health check)
 * GET  /logs                           Lista logs de requisicoes (paginado)
 * GET  /estatisticas-log-consumo       KPIs agregados (24h uptime, latencia media, etc.)
 *
 * NOMENCLATURA DDD (REGRA 3/4 — FKs canonicas + sufixo de entidade em genericos):
 *   - id_organizacao, id_produto_gravity, id_usuario        FKs canonicas
 *   - endpoint_log_consumo, metodo_http_log_consumo         entidade LogConsumo
 *   - codigo_resposta_http_log_consumo, latencia_ms_log_consumo
 *   - data_criacao_log_consumo                              audit field (REGRA 3)
 *
 * SERVIÇO_PLATAFORMA (runtime — nao persistido):
 *   - nome_servico_plataforma, status_servico_plataforma, latencia_ms_servico_plataforma
 *   - versao_servico_plataforma, data_ultimo_check_servico_plataforma, tipo_servico_plataforma
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey'

const router = Router()

// ─── In-Memory Store (TODO: migrar para Prisma LogConsumo) ───────────────
//
// Status atual: store em memória, perdido em restart, MAX 10k registros.
// Dev/staging usam isto; produção precisa da migração.
//
// Roadmap da migração (requer Coordenador):
//   1. Schema LogConsumo ja existe no fragment.prisma do api-cockpit.
//      Atencao: id_api_token e obrigatorio no schema, mas nao e capturado
//      no ingest atual — ajustar antes da persistencia.
//   2. Reescrever POST /ingest -> prisma.logConsumo.createMany
//   3. Reescrever GET /logs -> prisma.logConsumo.findMany com filtros
//   4. Reescrever GET /stats -> count + groupBy
//   5. Particionar por mes (similar ao HistoricoGlobal) para LGPD 5+ anos

interface LogConsumoEntry {
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string | null
  endpoint_log_consumo: string
  metodo_http_log_consumo: string
  codigo_resposta_http_log_consumo: number
  latencia_ms_log_consumo: number
  id_correlacao: string | null
  data_criacao_log_consumo: string
  // Pré-computados no ingest pra evitar split('T') repetido em GET /logs
  _ts_ms: number
  _data: string
  _hora: string
}

/** Dado cru vindo do cliente (antes do pré-processamento). */
interface LogConsumoInput {
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string | null
  endpoint_log_consumo: string
  metodo_http_log_consumo: string
  codigo_resposta_http_log_consumo: number
  latencia_ms_log_consumo: number
  id_correlacao: string | null
  data_criacao_log_consumo: string
}

type StatusServicoPlataforma = 'ONLINE' | 'DEGRADADO' | 'OFFLINE'
type TipoServicoPlataforma = 'NUCLEO' | 'PRODUTO_GRAVITY' | 'GATEWAY'

interface ServicoPlataforma {
  nome_servico_plataforma: string
  status_servico_plataforma: StatusServicoPlataforma
  latencia_ms_servico_plataforma: number
  versao_servico_plataforma: string
  data_ultimo_check_servico_plataforma: string
  tipo_servico_plataforma: TipoServicoPlataforma
}

// Store em memoria — em producao usar Prisma (LogConsumo) ou Redis TimeSeries
const logConsumoStore: LogConsumoEntry[] = []
const MAX_STORE_SIZE = 10_000
const OVERFLOW_WARNING_THRESHOLD = Math.floor(MAX_STORE_SIZE * 0.9) // 90%
let overflowWarningEmitted = false

// Servicos conhecidos para health check
const SERVICOS_CONHECIDOS: Array<{
  nome_servico_plataforma: string
  porta_servico_plataforma: number
  tipo_servico_plataforma: TipoServicoPlataforma
}> = [
  { nome_servico_plataforma: 'configurador',     porta_servico_plataforma: 8005, tipo_servico_plataforma: 'NUCLEO' },
  { nome_servico_plataforma: 'api-cockpit',      porta_servico_plataforma: 8016, tipo_servico_plataforma: 'NUCLEO' },
  { nome_servico_plataforma: 'dashboard',        porta_servico_plataforma: 8010, tipo_servico_plataforma: 'NUCLEO' },
  { nome_servico_plataforma: 'simula-custo',     porta_servico_plataforma: 8020, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'bid-frete',        porta_servico_plataforma: 8023, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'bid-cambio',       porta_servico_plataforma: 8025, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'processo',         porta_servico_plataforma: 8026, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'pedido',           porta_servico_plataforma: 8030, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'lpco',             porta_servico_plataforma: 8027, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'nf-importacao',    porta_servico_plataforma: 8028, tipo_servico_plataforma: 'PRODUTO_GRAVITY' },
  { nome_servico_plataforma: 'email',            porta_servico_plataforma: 8022, tipo_servico_plataforma: 'NUCLEO' },
  { nome_servico_plataforma: 'historico',        porta_servico_plataforma: 8014, tipo_servico_plataforma: 'NUCLEO' },
  { nome_servico_plataforma: 'notificacoes',     porta_servico_plataforma: 8013, tipo_servico_plataforma: 'NUCLEO' },
  { nome_servico_plataforma: 'gabi',             porta_servico_plataforma: 8015, tipo_servico_plataforma: 'NUCLEO' },
]

// ─── Schemas Zod (Mandamento 06 — toda rota com Zod) ─────────────────────

const IngestSchema = z.object({
  entries: z.array(z.object({
    id_organizacao:                   z.string(),
    id_produto_gravity:               z.string(),
    id_usuario:                       z.string().nullable(),
    endpoint_log_consumo:             z.string(),
    metodo_http_log_consumo:          z.string(),
    codigo_resposta_http_log_consumo: z.number().int(),
    latencia_ms_log_consumo:          z.number().int(),
    id_correlacao:                    z.string().nullable(),
    data_criacao_log_consumo:         z.string(),
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
function enrichEntry(input: LogConsumoInput): LogConsumoEntry {
  const ts = input.data_criacao_log_consumo
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
    logConsumoStore.push(...enriched)

    // FIFO: remove os mais antigos se exceder limite.
    // Usa splice em vez de shift() em loop — O(1) vs O(n) por iteração.
    if (logConsumoStore.length > MAX_STORE_SIZE) {
      logConsumoStore.splice(0, logConsumoStore.length - MAX_STORE_SIZE)
    }

    // Warning uma vez quando store se aproxima do limite — sinal pra migrar para Prisma
    if (logConsumoStore.length >= OVERFLOW_WARNING_THRESHOLD && !overflowWarningEmitted) {
      overflowWarningEmitted = true
      console.warn(
        `[monitoramento-api] Store em memória atingiu ${logConsumoStore.length}/${MAX_STORE_SIZE} ` +
        `registros. Dados antigos começam a ser descartados. Migrar para Prisma LogConsumo.`
      )
    }

    res.json({
      quantidade_ingerida: parsed.data.entries.length,
      total_log_consumo:   logConsumoStore.length,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /servicos — Health check de todos os servicos ──────────────────

router.get('/servicos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const servicos: ServicoPlataforma[] = []

    const checks = SERVICOS_CONHECIDOS.map(async (svc) => {
      const inicio = Date.now()
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3_000)

        const resp = await fetch(`http://localhost:${svc.porta_servico_plataforma}/health`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)

        const latencia = Date.now() - inicio
        const data = await resp.json().catch(() => ({}))

        servicos.push({
          nome_servico_plataforma:              svc.nome_servico_plataforma,
          status_servico_plataforma:            resp.ok ? (latencia > 1000 ? 'DEGRADADO' : 'ONLINE') : 'DEGRADADO',
          latencia_ms_servico_plataforma:       latencia,
          versao_servico_plataforma:            (data as { version?: string }).version || '1.0.0',
          data_ultimo_check_servico_plataforma: new Date().toISOString(),
          tipo_servico_plataforma:              svc.tipo_servico_plataforma,
        })
      } catch {
        servicos.push({
          nome_servico_plataforma:              svc.nome_servico_plataforma,
          status_servico_plataforma:            'OFFLINE',
          latencia_ms_servico_plataforma:       Date.now() - inicio,
          versao_servico_plataforma:            '-',
          data_ultimo_check_servico_plataforma: new Date().toISOString(),
          tipo_servico_plataforma:              svc.tipo_servico_plataforma,
        })
      }
    })

    await Promise.allSettled(checks)

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
    const filtrados = logConsumoStore.filter((e) => {
      if (id_organizacao && e.id_organizacao !== id_organizacao) return false
      if (id_produto_gravity && e.id_produto_gravity !== id_produto_gravity) return false
      if (codigo_resposta_http_minimo !== undefined && e.codigo_resposta_http_log_consumo < codigo_resposta_http_minimo) return false
      if (codigo_resposta_http_maximo !== undefined && e.codigo_resposta_http_log_consumo > codigo_resposta_http_maximo) return false
      return true
    })

    // Ordena por timestamp desc usando _ts_ms pré-computado (sem parse a cada compare)
    filtrados.sort((a, b) => b._ts_ms - a._ts_ms)

    const total = filtrados.length
    const skip = (filtros.pagina - 1) * filtros.limite
    const logs = filtrados.slice(skip, skip + filtros.limite).map((e) => ({
      id_log_consumo:                   `${e.data_criacao_log_consumo}-${e.endpoint_log_consumo}-${e.metodo_http_log_consumo}`,
      id_organizacao:                   e.id_organizacao,
      id_produto_gravity:               e.id_produto_gravity,
      id_usuario:                       e.id_usuario,
      id_correlacao:                    e.id_correlacao,
      endpoint_log_consumo:             e.endpoint_log_consumo,
      metodo_http_log_consumo:          e.metodo_http_log_consumo,
      codigo_resposta_http_log_consumo: e.codigo_resposta_http_log_consumo,
      latencia_ms_log_consumo:          e.latencia_ms_log_consumo,
      data_criacao_log_consumo:         e.data_criacao_log_consumo,
      // Campos derivados pré-computados (UI consome diretos)
      data_log_consumo:                 e._data,
      hora_log_consumo:                 e._hora,
      resultado_log_consumo:
        e.codigo_resposta_http_log_consumo < 400
          ? 'SUCESSO'
          : e.codigo_resposta_http_log_consumo < 500
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
 * GET /estatisticas-log-consumo[?id_organizacao=...]
 *
 * Sem filtro: agregado global (uso pelo admin).
 * Com filtro id_organizacao: agregado per-org (uso pelo workspace).
 *
 * Campos calculados sao identicos nos dois casos. Adicional:
 *   quantidade_produtos_distintos_log_consumo — count distinct id_produto_gravity
 */
const EstatisticasQuerySchema = z.object({
  id_organizacao: z.string().optional(),
})

router.get('/estatisticas-log-consumo', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: filtroIdOrganizacao } = EstatisticasQuerySchema.parse(req.query)
    const h24 = Date.now() - 24 * 60 * 60 * 1000

    // Single pass — filter, count, sum, groupBy em 1 loop só (era 4 iterações antes)
    let quantidadeRequisicoes = 0
    let quantidadeErros = 0
    let somaLatencia = 0
    const porIdProdutoGravity: Record<string, number> = {}
    const porFaixaCodigoRespostaHttp: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }

    for (const e of logConsumoStore) {
      if (e._ts_ms < h24) continue
      if (filtroIdOrganizacao && e.id_organizacao !== filtroIdOrganizacao) continue
      quantidadeRequisicoes++
      somaLatencia += e.latencia_ms_log_consumo
      if (e.codigo_resposta_http_log_consumo >= 500) quantidadeErros++
      porIdProdutoGravity[e.id_produto_gravity] = (porIdProdutoGravity[e.id_produto_gravity] || 0) + 1
      const grupo = `${Math.floor(e.codigo_resposta_http_log_consumo / 100)}xx`
      if (grupo in porFaixaCodigoRespostaHttp) porFaixaCodigoRespostaHttp[grupo]++
    }

    const latenciaMedia = quantidadeRequisicoes > 0 ? Math.round(somaLatencia / quantidadeRequisicoes) : 0
    const percentualUptime = quantidadeRequisicoes > 0
      ? Number(((1 - quantidadeErros / quantidadeRequisicoes) * 100).toFixed(1))
      : 100
    const quantidadeProdutosDistintos = Object.keys(porIdProdutoGravity).length

    res.json({
      quantidade_requisicoes_log_consumo:        quantidadeRequisicoes,
      quantidade_erros_log_consumo:              quantidadeErros,
      latencia_media_log_consumo:                latenciaMedia,
      percentual_uptime_log_consumo:             percentualUptime,
      quantidade_produtos_distintos_log_consumo: quantidadeProdutosDistintos,
      por_id_produto_gravity:                    porIdProdutoGravity,
      por_faixa_codigo_resposta_http:            porFaixaCodigoRespostaHttp,
    })
  } catch (err) {
    next(err)
  }
})

export { router as monitoramentoApiRouter }
