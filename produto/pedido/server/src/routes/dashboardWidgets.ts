/**
 * dashboardWidgets.ts — Persistência da configuração de widgets do dashboard
 *
 * Rota base: /api/v1/pedidos/dashboard/widgets
 *
 * Endpoints:
 *   GET    /api/v1/pedidos/dashboard/widgets          — lista widgets do tenant
 *   PUT    /api/v1/pedidos/dashboard/widgets          — salva configuração completa
 *   DELETE /api/v1/pedidos/dashboard/widgets/:id      — remove widget
 *
 * Autenticação: x-internal-key + x-tenant-id (via shell)
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

// ── GET — busca configuração persistida ──────────────────────────────────────
dashboardWidgetsRouter.get('/', async (req: Request, res: Response) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const config = await db.dashboardConfig.findFirst({
        where: { product_id: 'pedido' },
      })

      if (!config) {
        return res.json({ widgets: [], source: 'default' })
      }

      const widgets = config.widgets_json
        ? (JSON.parse(config.widgets_json as string) as unknown[])
        : []

      res.json({
        widgets,
        updated_at: config.updated_at,
        source: 'persisted',
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

      const existing = await db.dashboardConfig.findFirst({
        where: { product_id: 'pedido' },
      })

      if (existing) {
        await db.dashboardConfig.update({
          where: { id: existing.id },
          data: {
            widgets_json: JSON.stringify(widgets),
            updated_at: new Date(),
          },
        })
      } else {
        await db.dashboardConfig.create({
          data: {
            tenant_id:    tenantId,
            product_id:   'pedido',
            widgets_json: JSON.stringify(widgets),
          },
        })
      }

      res.json({ ok: true, count: widgets.length })
    })
  } catch (err) {
    console.error('[DashboardWidgets/PUT]', err)
    res.status(500).json({ error: 'Erro ao salvar configuração' })
  }
})

// ── DELETE — remove widget individual ────────────────────────────────────────
dashboardWidgetsRouter.delete('/:widgetId', async (req: Request, res: Response) => {
  const { widgetId } = req.params
  if (!widgetId) return res.status(400).json({ error: 'widgetId obrigatorio' })

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const config = await db.dashboardConfig.findFirst({
        where: { product_id: 'pedido' },
      })
      if (!config) return res.status(404).json({ error: 'Configuração nao encontrada' })

      const widgets = config.widgets_json
        ? (JSON.parse(config.widgets_json as string) as Array<{ id: string }>)
        : []

      const filtered = widgets.filter((w) => w.id !== widgetId)

      await db.dashboardConfig.update({
        where: { id: config.id },
        data: { widgets_json: JSON.stringify(filtered), updated_at: new Date() },
      })

      res.json({ ok: true, removed: widgetId, remaining: filtered.length })
    })
  } catch (err) {
    console.error('[DashboardWidgets/DELETE]', err)
    res.status(500).json({ error: 'Erro ao remover widget' })
  }
})
