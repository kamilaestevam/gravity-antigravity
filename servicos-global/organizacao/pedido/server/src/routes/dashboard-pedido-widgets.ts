/**
 * dashboardWidgets.ts — Persistência da configuração de widgets do dashboard
 *
 * Rota base: /api/v1/pedidos/dashboard/widgets
 *
 * Endpoints:
 *   GET    /api/v1/pedidos/dashboard/widgets                                — lista widgets do tenant
 *   PUT    /api/v1/pedidos/dashboard/widgets                                — salva configuração completa
 *   DELETE /api/v1/pedidos/dashboard/widgets/:id_widget_dashboard_pedido    — remove widget
 *
 * Autenticação: x-internal-key + x-id-organizacao (via shell)
 * Skill: skills/servicos/dashboard/SKILL.md
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'

export const dashboardWidgetsRouter = Router()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const PositionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
})

// FieldQuerySpec: { key: string, operation: string } — formato atual do frontend
const FieldQuerySpecSchema = z.object({
  key:       z.string().min(1),
  operation: z.string().min(1),
})

const QuerySpecSchema = z.object({
  // Aceita tanto o formato novo (FieldQuerySpec[]) quanto o legado (string[]) para retrocompatibilidade
  fields:  z.union([
    z.array(FieldQuerySpecSchema).min(1),
    z.array(z.string()).min(1),
  ]),
  filters: z.record(z.unknown()).optional(),
})

const CHART_TYPES = [
  'KPI_CARD', 'LINE', 'AREA', 'BAR', 'BAR_HORIZONTAL',
  'DONUT', 'DISTRIBUTION', 'TABLE', 'SCATTER', 'HISTOGRAM',
  'FUNNEL', 'GAUGE',
] as const

const WidgetConfigSchema = z.object({
  id:          z.string().min(1),
  title:       z.string().min(1).max(120),
  chart_type:  z.enum(CHART_TYPES),
  query_spec:  QuerySpecSchema,
  position:    PositionSchema,
  config:      z.record(z.unknown()).optional(),
})

const SaveWidgetsSchema = z.object({
  widgets: z.array(WidgetConfigSchema).min(0).max(50),
})

// Identificador do produto que esta tabela serve (DashboardModeloProduto eh poliforme).
const ID_PRODUTO_PEDIDO = 'pedido'

// ── GET — busca configuração persistida ──────────────────────────────────────
dashboardWidgetsRouter.get('/', async (req: Request, res: Response) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const config = await db.dashboardModeloGlobal.findUnique({
        where: {
          id_organizacao_id_produto_gravity: {
            id_organizacao:     tenantId,
            id_produto_gravity: ID_PRODUTO_PEDIDO,
          },
        },
      })

      if (!config) {
        return res.json({ widgets: [], source: 'default' })
      }

      const raw = config.widgets_json_dashboard_modelo_global as string | null
      const widgets = raw ? (JSON.parse(raw) as unknown[]) : []

      res.json({
        widgets,
        updated_at: config.data_atualizacao_dashboard_modelo_global,
        source:     'persisted',
      })
    })
  } catch (err) {
    console.error('[DashboardWidgets/GET]', err)
    res.status(500).json({ error: 'Erro ao buscar configuração' })
  }
})

// ── PUT — salva configuração completa ─────────────────────────────────────────
dashboardWidgetsRouter.put('/', async (req: Request, res: Response) => {
  const parse = SaveWidgetsSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() })
  }

  const { widgets } = parse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      await db.dashboardModeloGlobal.upsert({
        where: {
          id_organizacao_id_produto_gravity: {
            id_organizacao:     tenantId,
            id_produto_gravity: ID_PRODUTO_PEDIDO,
          },
        },
        create: {
          id_organizacao:                       tenantId,
          id_produto_gravity:                   ID_PRODUTO_PEDIDO,
          widgets_json_dashboard_modelo_global: JSON.stringify(widgets),
        },
        update: {
          widgets_json_dashboard_modelo_global: JSON.stringify(widgets),
        },
      })

      res.json({ ok: true, count: widgets.length })
    })
  } catch (err) {
    console.error('[DashboardWidgets/PUT]', err)
    res.status(500).json({ error: 'Erro ao salvar configuração' })
  }
})

// ── DELETE — remove widget individual ────────────────────────────────────────
dashboardWidgetsRouter.delete('/:id_widget_dashboard_pedido', async (req: Request, res: Response) => {
  const { id_widget_dashboard_pedido: widgetId } = req.params
  if (!widgetId) return res.status(400).json({ error: 'id_widget_dashboard_pedido obrigatorio' })

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const config = await db.dashboardModeloGlobal.findUnique({
        where: {
          id_organizacao_id_produto_gravity: {
            id_organizacao:     tenantId,
            id_produto_gravity: ID_PRODUTO_PEDIDO,
          },
        },
      })
      if (!config) return res.status(404).json({ error: 'Configuração nao encontrada' })

      const raw = config.widgets_json_dashboard_modelo_global as string | null
      const widgets = raw ? (JSON.parse(raw) as Array<{ id: string }>) : []

      const filtered = widgets.filter((w) => w.id !== widgetId)

      await db.dashboardModeloGlobal.update({
        where: { id_dashboard_modelo_global: config.id_dashboard_modelo_global },
        data:  { widgets_json_dashboard_modelo_global: JSON.stringify(filtered) },
      })

      res.json({ ok: true, removed: widgetId, remaining: filtered.length })
    })
  } catch (err) {
    console.error('[DashboardWidgets/DELETE]', err)
    res.status(500).json({ error: 'Erro ao remover widget' })
  }
})
