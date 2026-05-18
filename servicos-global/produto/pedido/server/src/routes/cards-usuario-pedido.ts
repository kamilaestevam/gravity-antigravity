/**
 * cards-usuario-pedido.ts — Rotas de cards KPI customizados do usuário
 *
 * Rota base: /api/v1/pedidos/cards-usuario
 *
 * Endpoints:
 *   GET    /              — listar cards do tenant
 *   POST   /              — criar card
 *   PUT    /:id           — atualizar card
 *   DELETE /:id           — excluir card
 *   POST   /reordenar    — reordenar cards em batch
 *
 * Segurança:
 *   - Zod valida toda entrada antes de tocar o banco
 *   - id_organizacao injetado pelo withOrganizacao
 *   - Erros via AppError, handler global trata
 */

import { Router, Request, Response, NextFunction } from 'express'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import {
  criarCardUsuarioSchema,
  atualizarCardUsuarioSchema,
  reordenarCardsSchema,
} from './cards-usuario-pedido-schemas.js'

export const cardsUsuarioRouter = Router()

// ── Helpers de mapeamento DDD ↔ API ─────────────────────────────────────────

type CardRow = {
  id_card_usuario_pedido: string
  id_organizacao: string
  nome_card_usuario_pedido: string
  icone_card_usuario_pedido: string
  cor_card_usuario_pedido: string
  formula_expressao_card_usuario_pedido: string
  formula_dependencias_card_usuario_pedido: string[]
  ordem_card_usuario_pedido: number
  ativo_card_usuario_pedido: boolean
  criado_por_card_usuario_pedido: string
  data_criacao_card_usuario_pedido: Date | string
}

function toApi(row: CardRow) {
  return {
    id:                    row.id_card_usuario_pedido,
    tenant_id:             row.id_organizacao,
    nome:                  row.nome_card_usuario_pedido,
    icone:                 row.icone_card_usuario_pedido,
    cor:                   row.cor_card_usuario_pedido,
    formula_expressao:     row.formula_expressao_card_usuario_pedido,
    formula_dependencias:  row.formula_dependencias_card_usuario_pedido,
    ordem:                 row.ordem_card_usuario_pedido,
    ativo:                 row.ativo_card_usuario_pedido,
    created_by:            row.criado_por_card_usuario_pedido,
    created_at:            row.data_criacao_card_usuario_pedido,
  }
}

// ── GET / — listar cards ─────────────────────────────────────────────────────

cardsUsuarioRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao

      const cards = await db.cardUsuarioPedido.findMany({
        where: { id_organizacao: tenantId },
        orderBy: { ordem_card_usuario_pedido: 'asc' },
      })
      res.json(cards.map(toApi))
    })
  } catch (err) {
    next(err)
  }
})

// ── POST / — criar card ──────────────────────────────────────────────────────

cardsUsuarioRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const parse = criarCardUsuarioSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao
      const userId   = ctx.idUsuario

      const card = await db.cardUsuarioPedido.create({
        data: {
          id_organizacao:                           tenantId,
          nome_card_usuario_pedido:                 parse.data.nome,
          icone_card_usuario_pedido:                parse.data.icone,
          cor_card_usuario_pedido:                  parse.data.cor,
          formula_expressao_card_usuario_pedido:    parse.data.formula_expressao,
          formula_dependencias_card_usuario_pedido: parse.data.formula_dependencias ?? [],
          ordem_card_usuario_pedido:                parse.data.ordem,
          ativo_card_usuario_pedido:                parse.data.ativo,
          criado_por_card_usuario_pedido:           userId,
        },
      })
      res.status(201).json(toApi(card))
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /:id — atualizar card ────────────────────────────────────────────────

cardsUsuarioRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const parse = atualizarCardUsuarioSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao

      const existe = await db.cardUsuarioPedido.findFirst({
        where: { id_card_usuario_pedido: req.params.id, id_organizacao: tenantId },
      })
      if (!existe) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Card não encontrado' } })

      const data: Record<string, unknown> = {}
      if (parse.data.nome !== undefined)                 data.nome_card_usuario_pedido                 = parse.data.nome
      if (parse.data.icone !== undefined)                data.icone_card_usuario_pedido                = parse.data.icone
      if (parse.data.cor !== undefined)                  data.cor_card_usuario_pedido                  = parse.data.cor
      if (parse.data.formula_expressao !== undefined)    data.formula_expressao_card_usuario_pedido    = parse.data.formula_expressao
      if (parse.data.formula_dependencias !== undefined) data.formula_dependencias_card_usuario_pedido = parse.data.formula_dependencias
      if (parse.data.ordem !== undefined)                data.ordem_card_usuario_pedido                = parse.data.ordem
      if (parse.data.ativo !== undefined)                data.ativo_card_usuario_pedido                = parse.data.ativo

      const card = await db.cardUsuarioPedido.update({
        where: { id_card_usuario_pedido: req.params.id },
        data,
      })
      res.json(toApi(card))
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id — excluir card ───────────────────────────────────────────────

cardsUsuarioRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao

      const existe = await db.cardUsuarioPedido.findFirst({
        where: { id_card_usuario_pedido: req.params.id, id_organizacao: tenantId },
      })
      if (!existe) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Card não encontrado' } })

      await db.cardUsuarioPedido.delete({
        where: { id_card_usuario_pedido: req.params.id },
      })
      res.status(204).end()
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /reordenar — reordenar batch ────────────────────────────────────────

cardsUsuarioRouter.post('/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = reordenarCardsSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao

      await db.$transaction(
        parse.data.ids.map((id, idx) =>
          db.cardUsuarioPedido.updateMany({
            where: { id_card_usuario_pedido: id, id_organizacao: tenantId },
            data: { ordem_card_usuario_pedido: idx },
          }),
        ),
      )
      res.json({ ok: true })
    })
  } catch (err) {
    next(err)
  }
})
