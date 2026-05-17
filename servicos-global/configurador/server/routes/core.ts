// server/routes/core.ts
// Endpoints agregadores do dashboard /core (Hub.tsx pós-login).
//
// GET /api/v1/core/kpis                 — KPIs cross-produto. Hoje só popula
//                                          `pedido`. Outros slots ficam null
//                                          até upstream entregar dados reais.
//                                          (Issues paralelas #1-3 — SimulaCusto,
//                                          NF Importação, Gabi.)
// GET /api/v1/core/processos-recentes   — Últimos N pedidos do workspace.
//                                          Filtra via header x-id-workspace
//                                          propagado ao serviço Pedido.
//
// Padrão de auth — bridge Clerk JWT (in) → x-internal-key (out):
//   - Frontend chama com Bearer JWT do Clerk → requireAuth resolve
//     id_organizacao a partir do banco.
//   - Configurador chama Pedido com x-internal-key + x-id-organizacao
//     (e x-id-workspace se presente) — padrão estabelecido em
//     hub-insights-service.ts.
//
// Resiliência (gate Coordenador #5):
//   Promise.allSettled em todas as chamadas inter-service. Se Pedido cair,
//   `/core/kpis` retorna { pedido: null, ... } com 200 — UI degrada
//   graciosamente em vez de quebrar a tela inteira.

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'

export const coreRouter = Router()

// ─── Constantes de serviço (alinhadas com hub-insights-service.ts) ──────────
const FETCH_TIMEOUT_MS = 3_000

// Lazy getters — evita ESM top-level read antes de dotenv/--env-file (Mand. 08)
function getPedidoUrl(): string {
  return process.env.PEDIDO_SERVICE_URL ?? 'http://localhost:8030'
}
function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) console.warn('[core] CHAVE_INTERNA_SERVICO ausente — chamadas inter-serviço falharão')
  return chave ?? ''
}

// ─── Helper: fetch inter-service com headers padronizados ───────────────────
async function fetchProdutoInterno(
  url: string,
  ctx: { id_organizacao: string; id_workspace?: string | null },
): Promise<unknown> {
  const headers: Record<string, string> = {
    'x-internal-key': getChaveInterna(),
    'x-id-organizacao': ctx.id_organizacao,
    'Content-Type': 'application/json',
  }
  if (ctx.id_workspace) {
    headers['x-id-workspace'] = ctx.id_workspace
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`)
  }
  return response.json()
}

// ─── Helper: extrai x-id-workspace do request ───────────────────────────────
function getIdWorkspaceFromRequest(req: { headers: Record<string, unknown> }): string | null {
  const raw = req.headers['x-id-workspace']
  if (typeof raw === 'string' && raw.length > 0) return raw
  return null
}

// ─── GET /api/v1/core/kpis ──────────────────────────────────────────────────

// Schema da resposta upstream do Pedido — só os campos que consumimos.
// Mandamento 09: contrato bilateral; Pedido pode adicionar campos sem
// quebrar o agregador (passthrough), mas se renomear `pedidos_em_andamento`
// o `safeParse` falha e logamos warn.
const PedidoKpisUpstreamSchema = z.object({
  pedidos_em_andamento: z.number().optional(),
}).passthrough()

coreRouter.get('/kpis', requireAuth, async (req, res, next) => {
  try {
    const id_organizacao = req.auth.id_organizacao
    const id_workspace = getIdWorkspaceFromRequest(req)

    const [pedidoResult] = await Promise.allSettled([
      fetchProdutoInterno(
        `${getPedidoUrl()}/api/v1/pedidos/dashboard/kpis`,
        { id_organizacao, id_workspace },
      ),
    ])

    let pedido: { em_andamento: number } | null = null
    if (pedidoResult.status === 'fulfilled') {
      const parsed = PedidoKpisUpstreamSchema.safeParse(pedidoResult.value)
      if (parsed.success && typeof parsed.data.pedidos_em_andamento === 'number') {
        pedido = { em_andamento: parsed.data.pedidos_em_andamento }
      } else if (!parsed.success) {
        console.warn(
          '[core/kpis] resposta de Pedido /dashboard/kpis fora do schema',
          parsed.error.flatten(),
        )
      }
    } else {
      console.error('[core/kpis] falha ao chamar Pedido /dashboard/kpis', pedidoResult.reason)
    }

    // Shape final — slots dos outros produtos vivem como null até existirem
    // dados reais. Frontend usa presença/ausência para decidir renderização.
    res.json({
      pedido,
      simula_custo: null,
      nf_importacao: null,
      gabi: null,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/v1/core/processos-recentes ────────────────────────────────────

// Schema da listagem upstream do Pedido. Campos que NÃO existem hoje (modal,
// valor_total_usd) ficam de fora; a UI exibe só o que é real.
const PedidoListItemUpstreamSchema = z.object({
  id: z.string(),
  numero_pedido: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  incoterm: z.string().nullable().optional(),
  valor_total_pedido: z.union([z.number(), z.string()]).nullable().optional(),
  moeda_pedido: z.string().nullable().optional(),
  peso_bruto_total_pedido: z.union([z.number(), z.string()]).nullable().optional(),
  nome_exportador: z.string().nullable().optional(),
  nome_importador: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough()

const PedidoListUpstreamSchema = z.object({
  data: z.array(PedidoListItemUpstreamSchema),
}).passthrough()

coreRouter.get('/processos-recentes', requireAuth, async (req, res, next) => {
  try {
    const id_organizacao = req.auth.id_organizacao
    const id_workspace = getIdWorkspaceFromRequest(req)
    const limiteParam = Number(req.query.limite)
    const limite = Number.isFinite(limiteParam) ? Math.max(1, Math.min(10, limiteParam)) : 3

    const url = new URL(`${getPedidoUrl()}/api/v1/pedidos`)
    url.searchParams.set('sort', 'updated_at')
    url.searchParams.set('dir', 'desc')
    url.searchParams.set('limit', String(limite))
    url.searchParams.set('page', '1')

    const [listResult] = await Promise.allSettled([
      fetchProdutoInterno(url.toString(), { id_organizacao, id_workspace }),
    ])

    let processos: Array<{
      id: string
      numero: string | null
      status: string | null
      incoterm: string | null
      valor: number | null
      moeda: string | null
      peso_bruto: number | null
      nome_exportador: string | null
      nome_importador: string | null
      atualizado_em: string | null
    }> = []

    if (listResult.status === 'fulfilled') {
      const parsed = PedidoListUpstreamSchema.safeParse(listResult.value)
      if (parsed.success) {
        processos = parsed.data.data.map((p) => ({
          id: p.id,
          numero: p.numero_pedido ?? null,
          status: p.status ?? null,
          incoterm: p.incoterm ?? null,
          valor: typeof p.valor_total_pedido === 'string'
            ? Number.parseFloat(p.valor_total_pedido) || null
            : (p.valor_total_pedido ?? null),
          moeda: p.moeda_pedido ?? null,
          peso_bruto: typeof p.peso_bruto_total_pedido === 'string'
            ? Number.parseFloat(p.peso_bruto_total_pedido) || null
            : (p.peso_bruto_total_pedido ?? null),
          nome_exportador: p.nome_exportador ?? null,
          nome_importador: p.nome_importador ?? null,
          atualizado_em: p.updated_at ?? null,
        }))
      } else {
        console.warn(
          '[core/processos-recentes] resposta de Pedido /pedidos fora do schema',
          parsed.error.flatten(),
        )
      }
    } else {
      console.error('[core/processos-recentes] falha ao chamar Pedido /pedidos', listResult.reason)
    }

    res.json({ processos })
  } catch (err) {
    next(err)
  }
})
