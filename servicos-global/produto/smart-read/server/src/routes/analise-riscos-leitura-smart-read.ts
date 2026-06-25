/**
 * POST /api/v1/smart-read/leituras/analise-riscos — V1 + LLM + Cadastros (piloto completo)
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { AnaliseRiscosLeituraRequestSchema } from '../../../shared/analise-riscos-leitura-smart-read.js'
import { AppError } from '../lib/app-error.js'
import { executarAnaliseRiscosLeituraSmartRead } from '../lib/servico-analise-riscos-leitura-smart-read.js'

export const analiseRiscosLeituraSmartReadRouter = Router()

function organizacaoDaRequisicao(req: Request): string {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (!idOrganizacao || typeof idOrganizacao !== 'string') {
    throw new AppError('Header x-id-organizacao obrigatorio', 400, 'ORGANIZACAO_AUSENTE')
  }
  return idOrganizacao
}

analiseRiscosLeituraSmartReadRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const entrada = AnaliseRiscosLeituraRequestSchema.parse(req.body)
    const resultado = await executarAnaliseRiscosLeituraSmartRead(entrada, idOrganizacao)
    res.status(200).json(resultado)
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      next(new AppError(erro.errors.map((e) => e.message).join('; '), 400, 'VALIDACAO'))
      return
    }
    next(erro)
  }
})
