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
  razao_social: z.string().min(1, 'Razao social e obrigatoria'),
  nome_fantasia: z.string().optional(),
  cnpj: z.string().min(14).max(18).optional(),
  tipo: z.enum(['CORRETORA_CAMBIO', 'BANCO_COMERCIAL', 'BANCO_CAMBIO', 'FINTECH']).default('CORRETORA_CAMBIO'),
  email: z.string().email('Email invalido'),
  telefone: z.string().optional(),
  contato_nome: z.string().optional(),
  contato_cargo: z.string().optional(),
  portal_habilitado: z.boolean().default(false),
  moedas_operadas: z.string().optional(),
})

const atualizarCorretoraSchema = criarCorretoraSchema.partial()

const statusSchema = z.object({
  status: z.enum(['ATIVA', 'INATIVA', 'BLOQUEADA']),
  motivo: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/corretoras ---
corretorasRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = criarCorretoraSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-user-id'] as string

    // Verificar CNPJ duplicado
    const existente = await (prisma as any).corretora.findFirst({
      where: { cnpj: input.cnpj },
    })
    if (existente) {
      throw new AppError('Ja existe corretora com este CNPJ', 409, 'DUPLICATE_CNPJ')
    }

    const corretora = await (prisma as any).corretora.create({
      data: {
        ...input,
        user_id: userId,
        status: 'ATIVA',
      },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'CRIAR_CORRETORA',
      entidade: 'CorretoraCambio',
      entidade_id: corretora.id,
      detalhes: { nome_fantasia: input.nome_fantasia, cnpj: input.cnpj },
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
    if (status) where.status = status
    if (busca) {
      where.OR = [
        { nome_fantasia: { contains: busca, mode: 'insensitive' } },
        { razao_social: { contains: busca, mode: 'insensitive' } },
        { cnpj: { contains: busca } },
      ]
    }

    const [corretoras, total] = await Promise.all([
      (prisma as any).corretora.findMany({
        where,
        orderBy: { nome_fantasia: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).corretora.count({ where }),
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
    const corretora = await (req.prisma as any).corretora.findFirst({
      where: { id: req.params.id },
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
    const userId = req.headers['x-user-id'] as string

    const existente = await (prisma as any).corretora.findFirst({
      where: { id: req.params.id },
    })
    if (!existente) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    // Se mudou CNPJ, verificar duplicata
    if (input.cnpj && input.cnpj !== existente.cnpj) {
      const duplicata = await (prisma as any).corretora.findFirst({
        where: { cnpj: input.cnpj, id: { not: req.params.id } },
      })
      if (duplicata) {
        throw new AppError('Ja existe outra corretora com este CNPJ', 409, 'DUPLICATE_CNPJ')
      }
    }

    const corretora = await (prisma as any).corretora.update({
      where: { id: req.params.id },
      data: input,
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'ATUALIZAR_CORRETORA',
      entidade: 'CorretoraCambio',
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
    const userId = req.headers['x-user-id'] as string

    const existente = await (prisma as any).corretora.findFirst({
      where: { id: req.params.id },
    })
    if (!existente) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    const corretora = await (prisma as any).corretora.update({
      where: { id: req.params.id },
      data: { status: input.status },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'ALTERAR_STATUS_CORRETORA',
      entidade: 'CorretoraCambio',
      entidade_id: req.params.id,
      detalhes: {
        status_anterior: existente.status,
        status_novo: input.status,
        motivo: input.motivo,
      },
    })

    res.json(corretora)
  } catch (err) { next(err) }
})
