/**
 * transferir.ts — Rotas de transferência de pedidos
 *
 * Rota base: /api/v1/pedidos/transferir
 *
 * Endpoints:
 *   POST /api/v1/pedidos/transferir/preview         — pré-visualiza impacto sem alterar banco
 *   POST /api/v1/pedidos/transferir/confirmar       — executa a transferência em $transaction
 *   GET  /api/v1/pedidos/:id/transferencias         — histórico de transferências do pedido
 *   POST /api/v1/pedidos/transferir/:id/reverter    — reverte uma transferência anterior
 *
 * Regras de segurança:
 *   - tenant_id injetado pelo tenantIsolationMiddleware em todas as queries
 *   - Zod valida todo req.body antes de qualquer lógica
 *   - Erros via AppError — nunca res.status() direto
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { TransferirService, AppError } from '../services/transferirService.js'

export const transferirRouter = Router()
export const transferirHistoricoRouter = Router({ mergeParams: true })

const service = new TransferirService()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const DestinoSchema = z.object({
  tipo: z.enum(['novo', 'existente', 'mesmo']),
  pedido_id: z.string().min(1).optional(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero'),
  part_number: z.string().min(1).optional(),
  data_embarque: z.string().optional(),
  porto_destino: z.string().optional(),
  company_id: z.string().optional(),
})

const CenarioSchema = z.enum([
  'reducao_simples',
  'split_novo_pedido',
  'split_pedido_existente',
  'multi_split',
  'substituicao_pura',
  'split_substituicao',
  'split_data',
  'split_destino_logistico',
  'transfer_intercompany',
  'reversao',
  'agrupamento_inverso',
])

const PreviewSchema = z.object({
  cenario: CenarioSchema,
  pedido_id: z.string().min(1),
  item_id: z.string().min(1),
  quantidade_origem: z.number().positive('Quantidade de origem deve ser maior que zero'),
  destinos: z.array(DestinoSchema).default([]),
})

const ConfirmarSchema = PreviewSchema.extend({
  numero_pedido_novo: z.string().min(1).optional(),
  reverter_transfer_id: z.string().optional(),
})

// ── POST /transferir/preview ─────────────────────────────────────────────────

transferirRouter.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = PreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const db = (req as any).prisma
  const tenantId = (req as any).tenantId as string

  try {
    const preview = await service.preview(tenantId, parse.data, db)
    res.json(preview)
  } catch (err) {
    next(err)
  }
})

// ── POST /transferir/confirmar ───────────────────────────────────────────────

transferirRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const db = (req as any).prisma
  const tenantId = (req as any).tenantId as string
  const userId = (req as any).userId as string ?? 'system'

  try {
    const resultado = await service.confirmar(tenantId, userId, parse.data, db)
    res.status(201).json(resultado)
  } catch (err) {
    next(err)
  }
})

// ── POST /transferir/:transfer_id/reverter ───────────────────────────────────

transferirRouter.post('/:transfer_id/reverter', async (req: Request, res: Response, next: NextFunction) => {
  const { transfer_id } = req.params
  if (!transfer_id || transfer_id.trim().length === 0) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'transfer_id é obrigatório' },
    })
  }

  const db = (req as any).prisma
  const tenantId = (req as any).tenantId as string
  const userId = (req as any).userId as string ?? 'system'

  try {
    const resultado = await service.reverter(tenantId, userId, transfer_id, db)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// ── GET /pedidos/:id/transferencias — registrado no router separado ──────────

transferirHistoricoRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const pedidoId = req.params.id
  if (!pedidoId) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'pedido_id é obrigatório' } })
  }

  const db = (req as any).prisma
  const tenantId = (req as any).tenantId as string

  try {
    const historico = await service.historico(tenantId, pedidoId, db)
    res.json(historico)
  } catch (err) {
    next(err)
  }
})

// ── Error handler local ───────────────────────────────────────────────────────

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  console.error('[Transferir]', err.message)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
}

transferirRouter.use(errorHandler)
transferirHistoricoRouter.use(errorHandler)
