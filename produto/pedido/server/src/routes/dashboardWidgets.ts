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

export const dashboardWidgetsRouter = Router()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const PositionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
})

const QuerySpecSchema = z.object({
  fields:    z.array(z.string()).min(1),
  operation: z.enum(['COUNT', 'SUM', 'AVG', 'RATIO', 'DIFF', 'CUSTOM']),
  filters:   z.record(z.unknown()).optional(),
})

const WidgetConfigSchema = z.object({
  id:          z.string().min(1),
  title:       z.string().min(1).max(120),
  chart_type:  z.enum(['KPI_CARD', 'LINE', 'BAR', 'DONUT', 'TABLE', 'SCATTER']),
  query_spec:  QuerySpecSchema,
  position:    PositionSchema,
  config:      z.record(z.unknown()).optional(),
})

const SaveWidgetsSchema = z.object({
  widgets: z.array(WidgetConfigSchema).min(0).max(50),
})

// ── GET — busca configuração persistida ──────────────────────────────────────
dashboardWidgetsRouter.get('/', async (req: Request, res: Response) => {
  const tenantId = (req as any).tenantId as string
  const db = (req as any).prisma

  try {
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

  const tenantId = (req as any).tenantId as string
  const db = (req as any).prisma
  const { widgets } = parse.data

  try {
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
  } catch (err) {
    console.error('[DashboardWidgets/PUT]', err)
    res.status(500).json({ error: 'Erro ao salvar configuração' })
  }
})

// ── DELETE — remove widget individual ────────────────────────────────────────
dashboardWidgetsRouter.delete('/:widgetId', async (req: Request, res: Response) => {
  const { widgetId } = req.params
  if (!widgetId) return res.status(400).json({ error: 'widgetId obrigatorio' })

  const db = (req as any).prisma

  try {
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
  } catch (err) {
    console.error('[DashboardWidgets/DELETE]', err)
    res.status(500).json({ error: 'Erro ao remover widget' })
  }
})
