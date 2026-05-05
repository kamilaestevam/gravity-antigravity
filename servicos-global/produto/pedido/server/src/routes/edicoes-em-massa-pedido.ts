/**
 * edicaoEmMassa.ts — Rotas de edição em massa de pedidos
 *
 * Rota base: /api/v1/pedidos/edicoes-em-massa
 *
 * Endpoints:
 *   POST /api/v1/pedidos/edicoes-em-massa/preview   — retorna impacto sem alterar o banco
 *   POST /api/v1/pedidos/edicoes-em-massa/confirmar — executa a edição em $transaction
 *
 * Regras de negócio:
 *   - Campos calculados (CAMPOS_BLOQUEADOS_*) são rejeitados server-side
 *   - tenant_id é injetado pelo tenantIsolationMiddleware em todas as queries
 *   - Zod valida entrada antes de qualquer lógica
 *   - Toda edição registra audit trail (não bloqueia se tabela não existir)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { EdicaoEmMassaService, AppError } from '../services/edicaoEmMassaService.js'

export const edicaoEmMassaRouter = Router()

const service = new EdicaoEmMassaService()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const CampoSchema = z.object({
  campo: z.string().min(1),
  tipo: z.enum(['texto', 'numero', 'data', 'select', 'usuario']),
  nivel: z.enum(['pedido', 'item']),
  operacao: z.enum(['substituir', 'somar', 'subtrair', 'percentual', 'avancar_dias', 'recuar_dias']),
  valor: z.union([z.string(), z.number()]),
})

const EdicaoMassaSchema = z.object({
  pedido_ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para editar'),
  campos: z.array(CampoSchema).min(1, 'Selecione ao menos 1 campo para editar'),
  nivel: z.enum(['pedido', 'item', 'combinado']),
})

// ── POST /edicao-em-massa/preview ─────────────────────────────────────────────

edicaoEmMassaRouter.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = EdicaoMassaSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const id_organizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const result = await service.preview(id_organizacao, db, parse.data)
      res.json(result)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /edicao-em-massa/confirmar ──────────────────────────────────────────

edicaoEmMassaRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = EdicaoMassaSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx            = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const id_organizacao = ctx.idOrganizacao
      const id_usuario     = ctx.idUsuario ?? 'system'
      const nome_usuario   = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario ?? id_usuario

      const result = await service.confirmar(id_organizacao, id_usuario, nome_usuario, db, parse.data)
      res.json(result)
    })
  } catch (err) {
    next(err)
  }
})

// ── Error handler local ───────────────────────────────────────────────────────

edicaoEmMassaRouter.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  console.error('[EdicaoEmMassa]', err.message)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
})
