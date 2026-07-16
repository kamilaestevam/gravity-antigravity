// server/routes/guia-gravity-jornada.ts
// Guia Gravity — jornada, conclusões de aula e certificados (University).

import { Router, type Request, type Response, type NextFunction } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { guiaGravityJornadaServico } from '../services/guia-gravity-jornada-servico.js'
import {
  concluirAulaGuiaGravityBodySchema,
  concluirAulaGuiaGravityResponseSchema,
  guiaGravityJornadaResponseSchema,
  guiaGravityRankingResponseSchema,
  verificarCertificadoGuiaGravityResponseSchema,
} from '../../shared/guia-gravity/guia-gravity-jornada-schema.js'
import { AppError } from '../lib/appError.js'

export const guiaGravityJornadaRouter = Router()

/**
 * GET /api/v1/guia-gravity/certificados/verificar/:codigo_verificacao_certificado_guia_gravity
 * Rota pública — validação de certificado (QR / rodapé).
 */
guiaGravityJornadaRouter.get(
  '/certificados/verificar/:codigo_verificacao_certificado_guia_gravity',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = await guiaGravityJornadaServico.verificarCertificado(
        req.params.codigo_verificacao_certificado_guia_gravity,
      )
      const payload = verificarCertificadoGuiaGravityResponseSchema.parse(resultado)
      res.json(payload)
    } catch (err) {
      next(err)
    }
  },
)

guiaGravityJornadaRouter.use(requireAuth)

/**
 * GET /api/v1/guia-gravity/jornada
 */
guiaGravityJornadaRouter.get('/jornada', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao, id_usuario } = req.auth!
    const payload = await guiaGravityJornadaServico.obterJornada(id_organizacao, id_usuario)
    res.json(guiaGravityJornadaResponseSchema.parse(payload))
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/guia-gravity/ranking
 */
guiaGravityJornadaRouter.get('/ranking', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao, id_usuario } = req.auth!
    const limiteRaw = req.query.limite
    const limite =
      typeof limiteRaw === 'string' && limiteRaw.trim() !== '' ? Number.parseInt(limiteRaw, 10) : undefined

    const payload = await guiaGravityJornadaServico.obterRankingOrganizacao({
      idOrganizacao: id_organizacao,
      idUsuario: id_usuario,
      limite: Number.isFinite(limite) ? limite : undefined,
    })
    res.json(guiaGravityRankingResponseSchema.parse(payload))
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/guia-gravity/manuais/:slug_manual_guia_gravity/marcar-lido
 */
guiaGravityJornadaRouter.post(
  '/manuais/:slug_manual_guia_gravity/marcar-lido',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_organizacao, id_usuario } = req.auth!

      const payload = await guiaGravityJornadaServico.marcarManualLido({
        idOrganizacao: id_organizacao,
        idUsuario: id_usuario,
        slugManual: req.params.slug_manual_guia_gravity,
      })
      res.json(guiaGravityJornadaResponseSchema.parse(payload))
    } catch (err) {
      next(err)
    }
  },
)

/**
 * POST /api/v1/guia-gravity/aulas/:slug_aula_guia_gravity/concluir
 */
guiaGravityJornadaRouter.post(
  '/aulas/:slug_aula_guia_gravity/concluir',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = concluirAulaGuiaGravityBodySchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError('Corpo inválido', 400, 'VALIDATION_ERROR')
      }

      const { id_organizacao, id_usuario } = req.auth!

      const payload = await guiaGravityJornadaServico.concluirAula({
        idOrganizacao: id_organizacao,
        idUsuario: id_usuario,
        slugAula: req.params.slug_aula_guia_gravity,
        slugProduto: parsed.data.slug_produto_guia_gravity,
      })
      res.json(concluirAulaGuiaGravityResponseSchema.parse(payload))
    } catch (err) {
      next(err)
    }
  },
)
