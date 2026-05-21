/**
 * preferencias.ts — Rotas de Preferencias do Tenant e Usuario
 * Configuracoes de tenant (BidCambioPreferenciaUsuario) e grid do usuario (BidCambioPreferenciaGrid)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration } from '../services/tenantIntegrations.js'

export const preferenciasRouter = Router()

// --- Schemas Zod ---

const preferenciaTenantSchema = z.object({
  mostrar_no_financeiro_preferencia_bid_cambio: z.boolean().optional(),
  alerta_email_vencimento_preferencia_bid_cambio: z.boolean().optional(),
  dias_antecedencia_alerta_preferencia_bid_cambio: z.number().int().min(1).max(90).optional().nullable(),
  enviar_email_exportador_preferencia_bid_cambio: z.boolean().optional(),
  enviar_email_fim_de_semana_preferencia_bid_cambio: z.boolean().optional(),
})

const preferenciaGridSchema = z.object({
  id_preferencia_grid_bid_cambio: z.string().min(1, 'id_preferencia_grid_bid_cambio obrigatorio'),
  colunas_visiveis_preferencia_grid_bid_cambio: z.array(z.string()).optional(),
  larguras_colunas: z.record(z.string(), z.number()).optional(),
  ordenacao_preferencia_grid_bid_cambio: z.object({
    campo: z.string(),
    direcao: z.enum(['asc', 'desc']),
  }).optional(),
  filtros_salvos_preferencia_grid_bid_cambio: z.record(z.string(), z.unknown()).optional(),
  itens_por_pagina: z.number().int().min(5).max(200).optional(),
})

// --- GET /api/v1/bid-cambio/preferencias ---
preferenciasRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!

    let preferencia = await (prisma as any).bidCambioPreferenciaUsuario.findFirst({
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
    const userId = req.headers['x-id-usuario'] as string

    const existente = await (prisma as any).bidCambioPreferenciaUsuario.findFirst({
      where: {},
    })

    let preferencia
    if (existente) {
      preferencia = await (prisma as any).bidCambioPreferenciaUsuario.update({
        where: { id_preferencia_usuario_bid_cambio: existente.id_preferencia_usuario_bid_cambio },
        data: input,
      })
    } else {
      preferencia = await (prisma as any).bidCambioPreferenciaUsuario.create({
        data: input,
      })
    }

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'ATUALIZAR_PREFERENCIAS',
      entidade: 'BidCambioPreferenciaUsuario',
      entidade_id: preferencia.id_preferencia_usuario_bid_cambio,
      detalhes: { campos_alterados: Object.keys(input) },
    })

    res.json(preferencia)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/preferencias/grid ---
preferenciasRouter.get('/grid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const userId = req.headers['x-id-usuario'] as string
    const gridId = req.query.id_preferencia_grid_bid_cambio as string

    if (!gridId) {
      throw new AppError('Query param id_preferencia_grid_bid_cambio e obrigatorio', 400, 'MISSING_GRID_ID')
    }

    const preferencia = await (prisma as any).bidCambioPreferenciaGrid.findFirst({
      where: { id_usuario: userId, id_preferencia_grid_bid_cambio: gridId },
    })

    if (!preferencia) {
      res.json({
        id_preferencia_grid_bid_cambio: gridId,
        id_usuario: userId,
        colunas_visiveis_preferencia_grid_bid_cambio: null,
        larguras_colunas: null,
        ordenacao_preferencia_grid_bid_cambio: null,
        filtros_salvos_preferencia_grid_bid_cambio: null,
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
    const userId = req.headers['x-id-usuario'] as string

    const existente = await (prisma as any).bidCambioPreferenciaGrid.findFirst({
      where: { id_usuario: userId, id_preferencia_grid_bid_cambio: input.id_preferencia_grid_bid_cambio },
    })

    let preferencia
    if (existente) {
      preferencia = await (prisma as any).bidCambioPreferenciaGrid.update({
        where: { id_preferencia_grid_bid_cambio: existente.id_preferencia_grid_bid_cambio },
        data: {
          colunas_visiveis_preferencia_grid_bid_cambio: input.colunas_visiveis_preferencia_grid_bid_cambio ?? undefined,
          larguras_colunas: input.larguras_colunas ?? undefined,
          ordenacao_preferencia_grid_bid_cambio: input.ordenacao_preferencia_grid_bid_cambio ?? undefined,
          filtros_salvos_preferencia_grid_bid_cambio: input.filtros_salvos_preferencia_grid_bid_cambio ?? undefined,
          itens_por_pagina: input.itens_por_pagina ?? undefined,
        },
      })
    } else {
      preferencia = await (prisma as any).bidCambioPreferenciaGrid.create({
        data: {
          id_usuario: userId,
          id_preferencia_grid_bid_cambio: input.id_preferencia_grid_bid_cambio,
          colunas_visiveis_preferencia_grid_bid_cambio: input.colunas_visiveis_preferencia_grid_bid_cambio ?? [],
          larguras_colunas: input.larguras_colunas ?? {},
          ordenacao_preferencia_grid_bid_cambio: input.ordenacao_preferencia_grid_bid_cambio ?? null,
          filtros_salvos_preferencia_grid_bid_cambio: input.filtros_salvos_preferencia_grid_bid_cambio ?? {},
          itens_por_pagina: input.itens_por_pagina ?? 20,
        },
      })
    }

    res.json(preferencia)
  } catch (err) { next(err) }
})
