import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { queryEngine } from '../lib/query-engine.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

type ChartType =
  | 'KPI_CARD'
  | 'LINE'
  | 'BAR'
  | 'BAR_HORIZONTAL'
  | 'DONUT'
  | 'HISTOGRAM'
  | 'FUNNEL'
  | 'GAUGE'
  | 'MAP'
  | 'TABLE'
  | 'AREA'

const ChartTypes: [ChartType, ...ChartType[]] = [
  'KPI_CARD',
  'LINE',
  'BAR',
  'BAR_HORIZONTAL',
  'DONUT',
  'HISTOGRAM',
  'FUNNEL',
  'GAUGE',
  'MAP',
  'TABLE',
  'AREA',
]

const widgetRouter = Router()

const querySpecSchema = z.object({
  fields: z.array(z.string()).min(1).max(10),
  operation: z.enum(['sum', 'avg', 'count', 'min', 'max', 'diff_days', 'distribution', 'trend']),
  filters: z.object({
    period: z.enum(['7d', '30d', '90d', '12m', 'mtd', 'ytd']).default('30d'),
    workspace_id: z.string().optional(),
  }),
  chartType: z.enum(ChartTypes).optional(),
})

const queryBodySchema = z.object({
  spec: querySpecSchema,
})

const createWidgetSchema = z.object({
  dashboard_id: z.string().min(1),
  widget_key: z.string().min(1),
  widget_type: z.enum(['CATALOG', 'CUSTOM', 'GABI']).default('CATALOG'),
  chart_type: z.enum(ChartTypes),
  title: z.string().min(1).max(200),
  query_spec: querySpecSchema,
  position: z
    .object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      w: z.number().int().min(1),
      h: z.number().int().min(1),
    })
    .optional(),
})

const updateWidgetSchema = z.object({
  position: z
    .object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      w: z.number().int().min(1),
      h: z.number().int().min(1),
    })
    .optional(),
  title: z.string().min(1).max(200).optional(),
  chart_type: z.enum(ChartTypes).optional(),
  config: z.unknown().optional(),
})

// POST /query — executa query de widget via DashboardQueryEngine
widgetRouter.post('/query', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { spec } = queryBodySchema.parse(req.body)

    const result = await queryEngine.execute({
      tenantId,
      userId,
      spec,
      prisma: req.prisma!,
    })

    res.json({ data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Spec de query inválida', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// POST / — salva widget no config (adiciona a DashboardWidget)
widgetRouter.post('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const body = createWidgetSchema.parse(req.body)

    // Valida que o dashboard pertence ao tenant+user
    const dashboard = await req.prisma!.dashboardConfig.findFirst({
      where: { id: body.dashboard_id, user_id: userId },
    })

    if (!dashboard) {
      throw new AppError('Dashboard não encontrado', 404, 'NOT_FOUND')
    }

    const widget = await req.prisma!.dashboardWidget.create({
      data: {
        dashboard_id: body.dashboard_id,
        widget_key: body.widget_key,
        widget_type: body.widget_type,
        chart_type: body.chart_type,
        title: body.title,
        query_spec: body.query_spec as object,
        position: (body.position as object) ?? { x: 0, y: 0, w: 4, h: 3 },
      },
    })

    res.status(201).json({ data: widget })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// PUT /:id — atualiza config do widget (position, title, chart_type, config)
widgetRouter.put('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params
    const body = updateWidgetSchema.parse(req.body)

    // Valida que o widget pertence ao tenant via dashboard
    const widget = await req.prisma!.dashboardWidget.findFirst({
      where: { id },
      include: { dashboard: true },
    })

    if (!widget) {
      throw new AppError('Widget não encontrado', 404, 'NOT_FOUND')
    }

    const dashboard = widget.dashboard as Record<string, unknown>
    if (dashboard.user_id !== userId) {
      throw new AppError('Acesso negado', 403, 'FORBIDDEN')
    }

    const updated = await req.prisma!.dashboardWidget.update({
      where: { id },
      data: {
        ...(body.position !== undefined && { position: body.position as object }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.chart_type !== undefined && { chart_type: body.chart_type }),
        ...(body.config !== undefined && { config: body.config as object }),
        updated_at: new Date(),
      },
    })

    res.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// DELETE /:id — remove widget do dashboard
widgetRouter.delete('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params

    const widget = await req.prisma!.dashboardWidget.findFirst({
      where: { id },
      include: { dashboard: true },
    })

    if (!widget) {
      throw new AppError('Widget não encontrado', 404, 'NOT_FOUND')
    }

    const dashboard = widget.dashboard as Record<string, unknown>
    if (dashboard.user_id !== userId) {
      throw new AppError('Acesso negado', 403, 'FORBIDDEN')
    }

    await req.prisma!.dashboardWidget.delete({ where: { id } })

    res.json({ message: 'Widget removido com sucesso' })
  } catch (error) {
    next(error)
  }
})

export { widgetRouter }
