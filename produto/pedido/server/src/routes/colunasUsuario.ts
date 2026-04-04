/**
 * colunasUsuario.ts — Rotas de colunas customizadas do usuário
 *
 * Rota base: /api/v1/pedidos/colunas-usuario
 *
 * Endpoints:
 *   GET    /                   — listar colunas (filtra por visibilidade)
 *   POST   /                   — criar coluna
 *   PUT    /:id                — atualizar coluna (não muda tipo)
 *   DELETE /:id                — soft delete
 *   POST   /reordenar          — reordenar colunas em $transaction
 *   POST   /valores            — upsert de valores
 *   GET    /valores            — listar valores de um pedido/item
 *
 * Segurança:
 *   - Zod valida toda entrada antes de tocar o banco
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - Erros via AppError, handler global trata
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'
import { ColunasUsuarioService } from '../services/colunasUsuarioService.js'

export const colunasUsuarioRouter = Router()

const service = new ColunasUsuarioService()

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTenant(req: Request): string {
  const tenantId = (req as unknown as Record<string, string>).tenantId
  if (!tenantId) throw new AppError('tenant_id ausente', 401, 'UNAUTHORIZED')
  return tenantId
}

function getUserId(req: Request): string {
  return (req as unknown as Record<string, string>).userId ?? 'unknown'
}

function getUserRoles(req: Request): string[] {
  const roles = (req as unknown as Record<string, unknown>).userRoles
  return Array.isArray(roles) ? (roles as string[]) : []
}

function getDb(req: Request): Record<string, unknown> {
  return (req as unknown as Record<string, unknown>).prisma as Record<string, unknown>
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const CriarColunaSchema = z.object({
  nome:             z.string().min(1).max(60),
  tipo:             z.enum(['texto', 'numero', 'data', 'select', 'checkbox', 'percentual', 'tipo_documento']),
  escopo:           z.enum(['pedido', 'item', 'ambos']),
  visibilidade:     z.enum(['todos', 'roles', 'privado']),
  roles_permitidas: z.array(z.string()).optional(),
  obrigatorio:      z.boolean().default(false),
  opcoes:           z.array(z.string()).optional(),
  descricao:        z.string().max(200).optional(),
  valor_padrao:     z.string().optional(),
})

const AtualizarColunaSchema = z.object({
  nome:             z.string().min(1).max(60).optional(),
  // tipo é propositalmente ausente — não pode ser alterado
  escopo:           z.enum(['pedido', 'item', 'ambos']).optional(),
  visibilidade:     z.enum(['todos', 'roles', 'privado']).optional(),
  roles_permitidas: z.array(z.string()).optional(),
  obrigatorio:      z.boolean().optional(),
  opcoes:           z.array(z.string()).optional(),
  descricao:        z.string().max(200).optional(),
  valor_padrao:     z.string().optional(),
}).refine(
  data => !('tipo' in data),
  { message: 'O tipo de uma coluna não pode ser alterado após a criação.', path: ['tipo'] },
)

const ReordenarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

const SalvarValoresSchema = z.object({
  vinculo:    z.enum(['pedido', 'item']),
  vinculo_id: z.string().min(1),
  valores:    z.record(z.string()),
})

const ListarValoresQuerySchema = z.object({
  vinculo:    z.enum(['pedido', 'item']),
  vinculo_id: z.string().min(1),
})

// ── GET / — listar colunas ────────────────────────────────────────────────────

colunasUsuarioRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId  = getTenant(req)
    const userId    = getUserId(req)
    const userRoles = getUserRoles(req)
    const db        = getDb(req)

    const colunas = await service.listar(tenantId, userId, userRoles, db)
    res.json(colunas)
  } catch (err) {
    next(err)
  }
})

// ── POST / — criar coluna ─────────────────────────────────────────────────────

colunasUsuarioRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const parse = CriarColunaSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parse.error.flatten(),
      },
    })
  }

  try {
    const tenantId = getTenant(req)
    const userId   = getUserId(req)
    const db       = getDb(req)

    const coluna = await service.criar(tenantId, { ...parse.data, created_by: userId }, db)
    res.status(201).json(coluna)
  } catch (err) {
    next(err)
  }
})

// ── POST /reordenar — reordenar colunas ───────────────────────────────────────
// Fica ANTES de /:id para evitar conflito com rota paramétrica

colunasUsuarioRouter.post('/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ReordenarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parse.error.flatten(),
      },
    })
  }

  try {
    const tenantId = getTenant(req)
    const db       = getDb(req)

    await service.reordenar(tenantId, parse.data.ids, db)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ── POST /valores — salvar valores ────────────────────────────────────────────

colunasUsuarioRouter.post('/valores', async (req: Request, res: Response, next: NextFunction) => {
  const parse = SalvarValoresSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parse.error.flatten(),
      },
    })
  }

  try {
    const tenantId = getTenant(req)
    const db       = getDb(req)

    await service.salvarValores(tenantId, parse.data, db)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ── GET /valores — listar valores ─────────────────────────────────────────────

colunasUsuarioRouter.get('/valores', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ListarValoresQuerySchema.safeParse(req.query)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Parâmetros inválidos',
        details: parse.error.flatten(),
      },
    })
  }

  try {
    const tenantId = getTenant(req)
    const db       = getDb(req)

    const valores = await service.listarValores(
      tenantId,
      parse.data.vinculo,
      parse.data.vinculo_id,
      db,
    )
    res.json(valores)
  } catch (err) {
    next(err)
  }
})

// ── PUT /:id — atualizar coluna ───────────────────────────────────────────────

colunasUsuarioRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  // Bloqueia tentativa de mudar tipo via corpo
  if ('tipo' in req.body) {
    return res.status(400).json({
      error: {
        code:    'TIPO_IMUTAVEL',
        message: 'O tipo de uma coluna não pode ser alterado após a criação.',
      },
    })
  }

  const parse = AtualizarColunaSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: parse.error.flatten(),
      },
    })
  }

  try {
    const tenantId = getTenant(req)
    const db       = getDb(req)

    const coluna = await service.atualizar(tenantId, req.params.id, parse.data, db)
    res.json(coluna)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id — soft delete ─────────────────────────────────────────────────

colunasUsuarioRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenant(req)
    const db       = getDb(req)

    await service.excluir(tenantId, req.params.id, db)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
