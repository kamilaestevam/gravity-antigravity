/**
 * preferencias.ts — Rotas de Preferencias do Tenant e Usuario
 * Configuracoes de tenant (PreferenciaCambio) e grid do usuario (PreferenciaGridCambio)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration } from '../services/tenantIntegrations.js'

export const preferenciasRouter = Router()

// --- Schemas Zod ---

const preferenciaTenantSchema = z.object({
  mostrar_no_financeiro: z.boolean().optional(),
  alerta_email_vencimento: z.boolean().optional(),
  dias_antecedencia_alerta: z.number().int().min(1).max(90).optional().nullable(),
  enviar_email_exportador: z.boolean().optional(),
  enviar_email_fim_de_semana: z.boolean().optional(),
})

const preferenciaGridSchema = z.object({
  grid_id: z.string().min(1, 'grid_id obrigatorio'),
  colunas_visiveis: z.array(z.string()).optional(),
  larguras_colunas: z.record(z.string(), z.number()).optional(),
  ordenacao: z.object({
    campo: z.string(),
    direcao: z.enum(['asc', 'desc']),
  }).optional(),
  filtros_salvos: z.record(z.string(), z.unknown()).optional(),
  itens_por_pagina: z.number().int().min(5).max(200).optional(),
})

// --- GET /api/v1/bid-cambio/preferencias ---
preferenciasRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!

    let preferencia = await (prisma as any).preferenciaCambio.findFirst({
      where: {},
    })

    // Se nao existe, retornar defaults
    if (!preferencia) {
      preferencia = {
        moeda_padrao: 'USD',
        liquidacao_padrao: 'D2',
        dias_alerta_vencimento: 7,
        auto_disparar_corretoras: false,
        min_corretoras_bid: 3,
        validade_token_dias: 7,
        notificar_novas_respostas: true,
        notificar_vencimentos: true,
        email_copia: null,
        observacoes: null,
      }
    }

    res.json(preferencia)
  } catch (err) { next(err) }
})

// --- PUT /api/v1/bid-cambio/preferencias ---
preferenciasRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = preferenciaTenantSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-user-id'] as string

    const existente = await (prisma as any).preferenciaCambio.findFirst({
      where: {},
    })

    let preferencia
    if (existente) {
      preferencia = await (prisma as any).preferenciaCambio.update({
        where: { id: existente.id },
        data: input,
      })
    } else {
      preferencia = await (prisma as any).preferenciaCambio.create({
        data: input,
      })
    }

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'ATUALIZAR_PREFERENCIAS',
      entidade: 'PreferenciaCambio',
      entidade_id: preferencia.id,
      detalhes: { campos_alterados: Object.keys(input) },
    })

    res.json(preferencia)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/preferencias/grid ---
preferenciasRouter.get('/grid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const userId = req.headers['x-user-id'] as string
    const gridId = req.query.grid_id as string

    if (!gridId) {
      throw new AppError('Query param grid_id e obrigatorio', 400, 'MISSING_GRID_ID')
    }

    const preferencia = await (prisma as any).preferenciaGridCambio.findFirst({
      where: { user_id: userId, grid_id: gridId },
    })

    if (!preferencia) {
      res.json({
        grid_id: gridId,
        user_id: userId,
        colunas_visiveis: null,
        larguras_colunas: null,
        ordenacao: null,
        filtros_salvos: null,
        itens_por_pagina: 20,
      })
      return
    }

    res.json(preferencia)
  } catch (err) { next(err) }
})

// --- PUT /api/v1/bid-cambio/preferencias/grid ---
preferenciasRouter.put('/grid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = preferenciaGridSchema.parse(req.body)
    const prisma = req.prisma!
    const userId = req.headers['x-user-id'] as string

    const existente = await (prisma as any).preferenciaGridCambio.findFirst({
      where: { user_id: userId, grid_id: input.grid_id },
    })

    let preferencia
    if (existente) {
      preferencia = await (prisma as any).preferenciaGridCambio.update({
        where: { id: existente.id },
        data: {
          colunas_visiveis: input.colunas_visiveis ?? undefined,
          larguras_colunas: input.larguras_colunas ?? undefined,
          ordenacao: input.ordenacao ?? undefined,
          filtros_salvos: input.filtros_salvos ?? undefined,
          itens_por_pagina: input.itens_por_pagina ?? undefined,
        },
      })
    } else {
      preferencia = await (prisma as any).preferenciaGridCambio.create({
        data: {
          user_id: userId,
          grid_id: input.grid_id,
          colunas_visiveis: input.colunas_visiveis ?? [],
          larguras_colunas: input.larguras_colunas ?? {},
          ordenacao: input.ordenacao ?? null,
          filtros_salvos: input.filtros_salvos ?? {},
          itens_por_pagina: input.itens_por_pagina ?? 20,
        },
      })
    }

    res.json(preferencia)
  } catch (err) { next(err) }
})
