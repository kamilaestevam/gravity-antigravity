/**
 * POST /api/v1/smart-read/leituras/qa — Consultor Inteligente (Rafa)
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { QaLeituraRequestSchema } from '../../../shared/qa-leitura-smart-read.js'
import { AppError } from '../lib/app-error.js'
import { executarQaLeituraSmartRead } from '../lib/servico-qa-leitura-smart-read.js'

export const qaLeituraSmartReadRouter = Router()

function organizacaoDaRequisicao(req: Request): string {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (!idOrganizacao || typeof idOrganizacao !== 'string') {
    throw new AppError('Header x-id-organizacao obrigatorio', 400, 'ORGANIZACAO_AUSENTE')
  }
  return idOrganizacao
}

qaLeituraSmartReadRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const entrada = QaLeituraRequestSchema.parse(req.body)
    const resultado = await executarQaLeituraSmartRead(entrada, idOrganizacao)
    res.status(200).json(resultado)
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      next(new AppError(erro.errors.map((e) => e.message).join('; '), 400, 'VALIDACAO'))
      return
    }
    next(erro)
  }
})
