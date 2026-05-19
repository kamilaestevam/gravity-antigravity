// server/routes/diagnostico.ts
// Rotas de diagnostico de erros e gestao de chamados GABI.
// Backends reportam erros via POST /registrar-erro (fire-and-forget).
// Usuarios consultam erros e abrem chamados via as demais rotas.

import { Router } from 'express'
import { z } from 'zod'
import {
  registrarErro,
  consultarErrosRecentes,
  diagnosticarProblema,
  abrirChamado,
  consultarChamados,
} from '../services/servico-diagnostico.js'

export const diagnosticoRouter = Router()

// ── Schemas Zod ────────────────────────────────────────────────────────────

const registrarErroSchema = z.object({
  produto: z.string().min(1).max(64),
  endpoint: z.string().min(1).max(512),
  metodo: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  status_http: z.number().int().min(100).max(599),
  codigo_erro: z.string().max(128).optional(),
  detalhes: z.string().max(5000).optional(),
  payload_resumo: z.record(z.unknown()).optional(),
})

const consultarErrosSchema = z.object({
  limite: z.coerce.number().int().min(1).max(50).optional().default(10),
  periodo_horas: z.coerce.number().int().min(1).max(168).optional().default(24),
})

const abrirChamadoSchema = z.object({
  tipo: z.string().min(1).max(64),
  produto: z.string().min(1).max(64),
  descricao_usuario: z.string().min(10).max(2000),
  diagnostico: z.string().max(5000).optional(),
  id_conversa: z.string().max(255).optional(),
})

const consultarChamadosSchema = z.object({
  limite: z.coerce.number().int().min(1).max(50).optional().default(10),
})

// ── POST /api/v1/gabi/diagnostico/registrar-erro ──────────────────────────
// Fire-and-forget — backends chamam ao capturar erro para alimentar o diagnostico.

diagnosticoRouter.post('/api/v1/gabi/diagnostico/registrar-erro', async (req, res, next) => {
  try {
    const dados = registrarErroSchema.parse(req.body)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    void registrarErro({
      id_organizacao: tenantId,
      id_usuario: userId,
      ...dados,
    })

    res.status(202).json({ registrado: true })
  } catch (error) {
    next(error)
  }
})

// ── GET /api/v1/gabi/diagnostico/erros-recentes ───────────────────────────

diagnosticoRouter.get('/api/v1/gabi/diagnostico/erros-recentes', async (req, res, next) => {
  try {
    const { limite, periodo_horas } = consultarErrosSchema.parse(req.query)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    const erros = await consultarErrosRecentes(tenantId, userId, limite, periodo_horas)

    res.json({ erros, total: erros.length })
  } catch (error) {
    next(error)
  }
})

// ── POST /api/v1/gabi/diagnostico/diagnosticar ────────────────────────────

diagnosticoRouter.post('/api/v1/gabi/diagnostico/diagnosticar', async (req, res, next) => {
  try {
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    const diagnostico = await diagnosticarProblema(tenantId, userId)

    res.json({ diagnostico })
  } catch (error) {
    next(error)
  }
})

// ── POST /api/v1/gabi/diagnostico/chamados ────────────────────────────────

diagnosticoRouter.post('/api/v1/gabi/diagnostico/chamados', async (req, res, next) => {
  try {
    const dados = abrirChamadoSchema.parse(req.body)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    const chamado = await abrirChamado({
      id_organizacao: tenantId,
      id_usuario: userId,
      ...dados,
    })

    res.status(201).json({ chamado })
  } catch (error) {
    next(error)
  }
})

// ── GET /api/v1/gabi/diagnostico/chamados ─────────────────────────────────

diagnosticoRouter.get('/api/v1/gabi/diagnostico/chamados', async (req, res, next) => {
  try {
    const { limite } = consultarChamadosSchema.parse(req.query)
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario

    const chamados = await consultarChamados(tenantId, userId, limite)

    res.json({ chamados, total: chamados.length })
  } catch (error) {
    next(error)
  }
})
