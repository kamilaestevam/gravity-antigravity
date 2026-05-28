/**
 * prestadores-fornecedor.ts — Auto-registro prestador (modo 02).
 *
 * POST /api/v1/prestadores-fornecedor/registrar
 *   Usuário FORNECEDOR já autenticado vincula-se à org Gravity (cartório + crachá).
 *   Se depois for convidado por orgs A/B/C, cada convite adiciona vínculo extra.
 *
 * GET /api/v1/prestadores-fornecedor/vinculos
 *   Lista contextos (troca de crachá) via Cadastros fornecedor_organizacao.
 */

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { tipoFornecedorOrganizacaoEnum } from '../../shared/tipo-fornecedor-organizacao.js'
import {
  provisionarPrestadorFornecedor,
} from '../services/prestador-fornecedor-vinculo-service.js'
import { listarVinculosFornecedorPorUsuario } from '../services/cadastros-client.js'
import { fornecedorOrganizacaoSchema } from '../../../cadastros/shared/schemas/fornecedor-organizacao.schema.js'

export const prestadoresFornecedorRouter = Router()

prestadoresFornecedorRouter.use(requireAuth)

const RegistrarPrestadorSchema = z.object({
  tipo_fornecedor_organizacao: tipoFornecedorOrganizacaoEnum,
  nome_fornecedor: z.string().min(2).max(200).optional(),
}).strict()

prestadoresFornecedorRouter.post('/registrar', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'FORNECEDOR') {
      throw new AppError(
        'Apenas usuários Fornecedor podem auto-registrar como prestador',
        403,
        'FORBIDDEN',
      )
    }

    const parsed = RegistrarPrestadorSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario: req.auth.id_usuario },
      select: { email_usuario: true, nome_usuario: true, id_clerk_usuario: true },
    })
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const resultado = await provisionarPrestadorFornecedor({
      id_usuario: req.auth.id_usuario,
      email_usuario: usuario.email_usuario,
      nome_usuario: parsed.data.nome_fornecedor ?? usuario.nome_usuario,
      tipo_fornecedor_organizacao: parsed.data.tipo_fornecedor_organizacao,
      id_clerk_usuario: usuario.id_clerk_usuario,
      correlation_id: req.headers['x-correlation-id'] as string | undefined,
    })

    res.status(201).json({ prestador_fornecedor: resultado })
  } catch (err) {
    next(err)
  }
})

prestadoresFornecedorRouter.get('/vinculos', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'FORNECEDOR') {
      throw new AppError('Apenas Fornecedor acessa vínculos de prestador', 403, 'FORBIDDEN')
    }

    const itens = await listarVinculosFornecedorPorUsuario(req.auth.id_usuario, {
      id_organizacao: req.auth.id_organizacao,
      correlation_id: typeof req.headers['x-correlation-id'] === 'string'
        ? req.headers['x-correlation-id']
        : crypto.randomUUID(),
    })

    res.json({
      vinculos_fornecedor_organizacao: itens.map((item) => fornecedorOrganizacaoSchema.parse(item)),
      total: itens.length,
    })
  } catch (err) {
    next(err)
  }
})
