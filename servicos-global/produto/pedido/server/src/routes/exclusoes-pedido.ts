/**
 * exclusoes-pedido.ts — Rotas de exclusão de pedidos
 *
 * Rota base: /api/v1/pedidos
 *
 * Endpoints:
 *   POST /exclusoes/preview     — separa pedidos permitidos e bloqueados por status
 *   POST /exclusoes/confirmar   — hard delete com audit trail ANTES
 *   POST /exclusoes/itens       — exclui itens e aplica regra pedido-sem-item
 *
 * Regras:
 *   - Zod valida entrada em todas as rotas
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - Erros via AppError, handler global trata
 *
 * Originado do split de duplicarExcluir.ts (Gamma-3, leva 3 — DDD: responsabilidade única).
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { ExcluirService, AppError } from '../services/duplicarExcluirService.js'
import { exigirPermissao } from '../permissoes.js'

export const exclusoesPedidoRouter = Router()

// Cadeia 2 granular: todas as rotas são POST/DELETE (excluir pedido / item).
// Exigem `pedido:lista:editar`. Decisão Líder Técnico 2026-05-13 — gating no
// router (não no index.ts) evita bug de middleware chain do Express.
exclusoesPedidoRouter.use(exigirPermissao('lista', 'editar'))

const excluirService = new ExcluirService()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const ExcluirPreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para excluir'),
})

const ExcluirConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

const ExcluirItensSchema = z.object({
  pedido_id: z.string().min(1),
  item_ids: z.array(z.string().min(1)).min(1),
})

// ── POST /exclusoes/preview ───────────────────────────────────────────────────

exclusoesPedidoRouter.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirPreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    const id_organizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

    // res.json FORA do withOrganizacao — garante que a resposta só é enviada
    // APÓS o commit da $transaction (evita race condition no client).
    const resultado = await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      return excluirService.preview(db, id_organizacao, parse.data.ids)
    })
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// ── POST /exclusoes/confirmar ─────────────────────────────────────────────────

exclusoesPedidoRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    const ctx            = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
    const id_organizacao = ctx.idOrganizacao
    const id_usuario     = ctx.idUsuario ?? ''
    const nome_usuario   = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario ?? id_usuario

    // res.json FORA do withOrganizacao — garante que a resposta só é enviada
    // APÓS o commit da $transaction. Sem isso, o frontend recebe "OK" antes do
    // COMMIT e o reload imediato vê dados antigos (bug double-reload).
    const resultado = await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      return excluirService.confirmar(db, id_organizacao, id_usuario, nome_usuario, parse.data.ids)
    })
    res.json(resultado)
  } catch (err) {
    // Traduzir erros de FK para linguagem do usuário
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return next(new AppError(
        'Não foi possível excluir. Este pedido possui registros vinculados (transferências, histórico, etc.) que impedem a exclusão. Contacte o administrador.',
        409,
        'FK_CONSTRAINT',
      ))
    }
    next(err)
  }
})

// ── POST /exclusoes/itens ─────────────────────────────────────────────────────

exclusoesPedidoRouter.post('/itens', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirItensSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    const ctx            = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
    const id_organizacao = ctx.idOrganizacao
    const id_usuario     = ctx.idUsuario ?? ''
    const nome_usuario   = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario ?? id_usuario

    // res.json FORA do withOrganizacao — mesmo fix do /confirmar (double-reload).
    const resultado = await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      return excluirService.excluirItens(
        db,
        id_organizacao,
        id_usuario,
        nome_usuario,
        parse.data.pedido_id,
        parse.data.item_ids,
      )
    })
    res.json(resultado)
  } catch (err) {
    // Traduzir erros de FK para linguagem do usuário
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return next(new AppError(
        'Não foi possível excluir. Este item possui registros vinculados que impedem a exclusão. Contacte o administrador.',
        409,
        'FK_CONSTRAINT',
      ))
    }
    next(err)
  }
})

// Re-exportar AppError para que o error handler do index.ts possa identificá-lo
export { AppError }
