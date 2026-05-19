// server/routes/memoria.ts
// CRUD de memorias persistentes do usuario na GABI.
// GET  /api/v1/gabi/memoria           — listar memorias
// POST /api/v1/gabi/memoria           — salvar/atualizar memoria
// DELETE /api/v1/gabi/memoria          — desativar memoria

import { Router } from 'express'
import { z } from 'zod'
import {
  carregarMemorias,
  salvarMemoria,
  desativarMemoria,
  type TipoMemoria,
} from '../services/servico-memoria.js'

export const memoriaRouter = Router()

// ── Schemas Zod ────────────────────────────────────────────────────────────

const TIPOS_MEMORIA = ['preferencia', 'contexto', 'onboarding', 'padrao', 'feedback'] as const

const listarSchema = z.object({
  tipo: z.enum(TIPOS_MEMORIA).optional(),
  limite: z.coerce.number().int().min(1).max(100).optional().default(50),
})

const salvarSchema = z.object({
  tipo: z.enum(TIPOS_MEMORIA),
  chave: z.string().min(1).max(128),
  valor: z.string().min(1).max(500),
  origem: z.enum(['explicito', 'inferido']).optional().default('explicito'),
})

const desativarSchema = z.object({
  tipo: z.enum(TIPOS_MEMORIA),
  chave: z.string().min(1).max(128),
})

// ── GET /api/v1/gabi/memoria ──────────────────────────────────────────────

memoriaRouter.get('/api/v1/gabi/memoria', async (req, res, next) => {
  try {
    const { tipo, limite } = listarSchema.parse(req.query)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    const memorias = await carregarMemorias(
      { id_organizacao: tenantId, id_usuario: userId },
      tipo as TipoMemoria | undefined,
      limite,
    )

    res.json({ memorias, total: memorias.length })
  } catch (error) {
    next(error)
  }
})

// ── POST /api/v1/gabi/memoria ─────────────────────────────────────────────

memoriaRouter.post('/api/v1/gabi/memoria', async (req, res, next) => {
  try {
    const { tipo, chave, valor, origem } = salvarSchema.parse(req.body)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    await salvarMemoria(
      { id_organizacao: tenantId, id_usuario: userId },
      tipo,
      chave,
      valor,
      origem,
    )

    res.json({ salvo: true })
  } catch (error) {
    next(error)
  }
})

// ── DELETE /api/v1/gabi/memoria ───────────────────────────────────────────

memoriaRouter.delete('/api/v1/gabi/memoria', async (req, res, next) => {
  try {
    const { tipo, chave } = desativarSchema.parse(req.body)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    await desativarMemoria(
      { id_organizacao: tenantId, id_usuario: userId },
      tipo,
      chave,
    )

    res.json({ desativado: true })
  } catch (error) {
    next(error)
  }
})
