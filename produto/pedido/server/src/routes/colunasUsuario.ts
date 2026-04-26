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
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { AppError } from '../errors/AppError.js'
import { ColunasUsuarioService } from '../services/colunasUsuarioService.js'
import { analisarFormulaComGemini } from '../services/geminiFormulaAdvisor.js'
import {
  CriarColunaSchema,
  AtualizarColunaSchema,
  ReordenarSchema,
  SalvarValoresSchema,
  ListarValoresQuerySchema,
  GabiAnaliseSchema,
} from './colunasUsuarioSchemas.js'

export {
  CriarColunaSchema,
  AtualizarColunaSchema,
  ReordenarSchema,
  SalvarValoresSchema,
  ListarValoresQuerySchema,
  GabiAnaliseSchema,
}

export const colunasUsuarioRouter = Router()

const service = new ColunasUsuarioService()

// ── GET / — listar colunas ────────────────────────────────────────────────────

colunasUsuarioRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId  = ctx.idOrganizacao
      const userId    = ctx.idUsuario
      const userRoles = ctx.tiposUsuario

      const colunas = await service.listar(tenantId, userId, userRoles, db)
      res.json(colunas)
    })
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
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao
      const userId   = ctx.idUsuario

      const coluna = await service.criar(tenantId, { ...parse.data, created_by: userId }, db)
      res.status(201).json(coluna)
    })
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
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      await service.reordenar(tenantId, parse.data.ids, db)
      res.status(204).send()
    })
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
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      await service.salvarValores(tenantId, parse.data, db)
      res.status(204).send()
    })
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
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const valores = await service.listarValores(
        tenantId,
        parse.data.vinculo,
        parse.data.vinculo_id,
        db,
      )
      res.json(valores)
    })
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
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const coluna = await service.atualizar(tenantId, req.params.id, parse.data, db)
      res.json(coluna)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /gabi-analise — análise semântica via Gemini (GEMINI_GABI_ENABLED) ───
//
// Quando GEMINI_GABI_ENABLED=false (padrão), retorna { gemini: false } e o
// frontend usa a análise determinística local como fallback transparente.

colunasUsuarioRouter.post('/gabi-analise', async (req: Request, res: Response, next: NextFunction) => {
  const parse = GabiAnaliseSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ message: 'Dados inválidos', details: parse.error.flatten() })
  }

  try {
    const resultado = await analisarFormulaComGemini(parse.data.expressao, parse.data.campos)

    if (resultado === null) {
      // Gemini desabilitado ou fórmula ok — frontend usa fallback
      return res.json({ gemini: false })
    }

    return res.json({ gemini: true, ...resultado })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id — soft delete ─────────────────────────────────────────────────

colunasUsuarioRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      await service.excluir(tenantId, req.params.id, db)
      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})
