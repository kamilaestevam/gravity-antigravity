/**
 * corretoras.ts — CRUD de Corretoras de Cambio (Pilar 2 — Marketplace)
 * Cadastro, listagem, edicao, ativacao/inativacao de corretoras
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration } from '../services/tenantIntegrations.js'

export const corretorasRouter = Router()

// --- Schemas Zod ---

const criarCorretoraSchema = z.object({
  razao_social_corretora_bid_cambio: z.string().min(1, 'Razao social e obrigatoria'),
  nome_fantasia_corretora_bid_cambio: z.string().optional(),
  cnpj_corretora_bid_cambio: z.string().min(14).max(18).optional(),
  tipo_corretora_bid_cambio: z.enum(['CORRETORA_CAMBIO', 'BANCO_COMERCIAL', 'BANCO_CAMBIO', 'FINTECH']).default('CORRETORA_CAMBIO'),
  email_corretora_bid_cambio: z.string().email('Email invalido'),
  telefone_corretora_bid_cambio: z.string().optional(),
  contato_nome_corretora_bid_cambio: z.string().optional(),
  contato_cargo_corretora_bid_cambio: z.string().optional(),
  portal_habilitado_corretora_bid_cambio: z.boolean().default(false),
  moedas_operadas_corretora_bid_cambio: z.string().optional(),
})

const atualizarCorretoraSchema = criarCorretoraSchema.partial()

const statusSchema = z.object({
  status_corretora_bid_cambio: z.enum(['ATIVA', 'INATIVA', 'BLOQUEADA']),
  motivo: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/corretoras ---
corretorasRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = criarCorretoraSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    // Verificar CNPJ duplicado
    const existente = await (prisma as any).bidCambioCorretora.findFirst({
      where: { cnpj_corretora_bid_cambio: input.cnpj_corretora_bid_cambio },
    })
    if (existente) {
      throw new AppError('Ja existe corretora com este CNPJ', 409, 'DUPLICATE_CNPJ')
    }

    const corretora = await (prisma as any).bidCambioCorretora.create({
      data: {
        ...input,
        id_usuario: userId,
        status_corretora_bid_cambio: 'ATIVA',
      },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'CRIAR_CORRETORA',
      entidade: 'BidCambioCorretora',
      entidade_id: corretora.id_corretora_bid_cambio,
      detalhes: { nome_fantasia_corretora_bid_cambio: input.nome_fantasia_corretora_bid_cambio, cnpj_corretora_bid_cambio: input.cnpj_corretora_bid_cambio },
    })

    res.status(201).json(corretora)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/corretoras ---
corretorasRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const status = req.query.status as string | undefined
    const busca = req.query.busca as string | undefined

    const where: Record<string, unknown> = {}
    if (status) where.status_corretora_bid_cambio = status
    if (busca) {
      where.OR = [
        { nome_fantasia_corretora_bid_cambio: { contains: busca, mode: 'insensitive' } },
        { razao_social_corretora_bid_cambio: { contains: busca, mode: 'insensitive' } },
        { cnpj_corretora_bid_cambio: { contains: busca } },
      ]
    }

    const [corretoras, total] = await Promise.all([
      (prisma as any).bidCambioCorretora.findMany({
        where,
        orderBy: { nome_fantasia_corretora_bid_cambio: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).bidCambioCorretora.count({ where }),
    ])

    res.json({
      data: corretoras,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/corretoras/:id ---
corretorasRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const corretora = await (req.prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: req.params.id },
    })
    if (!corretora) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')
    res.json(corretora)
  } catch (err) { next(err) }
})

// --- PUT /api/v1/bid-cambio/corretoras/:id ---
corretorasRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = atualizarCorretoraSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const existente = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: req.params.id },
    })
    if (!existente) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    // Se mudou CNPJ, verificar duplicata
    if (input.cnpj_corretora_bid_cambio && input.cnpj_corretora_bid_cambio !== existente.cnpj_corretora_bid_cambio) {
      const duplicata = await (prisma as any).bidCambioCorretora.findFirst({
        where: { cnpj_corretora_bid_cambio: input.cnpj_corretora_bid_cambio, id_corretora_bid_cambio: { not: req.params.id } },
      })
      if (duplicata) {
        throw new AppError('Ja existe outra corretora com este CNPJ', 409, 'DUPLICATE_CNPJ')
      }
    }

    const corretora = await (prisma as any).bidCambioCorretora.update({
      where: { id_corretora_bid_cambio: req.params.id },
      data: input,
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'ATUALIZAR_CORRETORA',
      entidade: 'BidCambioCorretora',
      entidade_id: req.params.id,
      detalhes: { campos_alterados: Object.keys(input) },
    })

    res.json(corretora)
  } catch (err) { next(err) }
})

// --- PATCH /api/v1/bid-cambio/corretoras/:id/status ---
corretorasRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = statusSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const existente = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: req.params.id },
    })
    if (!existente) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    const corretora = await (prisma as any).bidCambioCorretora.update({
      where: { id_corretora_bid_cambio: req.params.id },
      data: { status_corretora_bid_cambio: input.status_corretora_bid_cambio },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'ALTERAR_STATUS_CORRETORA',
      entidade: 'BidCambioCorretora',
      entidade_id: req.params.id,
      detalhes: {
        status_anterior: existente.status_corretora_bid_cambio,
        status_novo: input.status_corretora_bid_cambio,
        motivo: input.motivo,
      },
    })

    res.json(corretora)
  } catch (err) { next(err) }
})
