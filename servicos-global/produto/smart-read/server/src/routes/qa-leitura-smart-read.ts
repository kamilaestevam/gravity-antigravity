/**
 * POST /api/v1/smart-read/leituras/qa — Consultor Inteligente (Rafa) + tokens LLM
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { QaLeituraRequestSchema } from '../../../shared/qa-leitura-smart-read.js'
import { AppError } from '../lib/app-error.js'
import { resolverIdWorkspaceLeituraSmartRead } from '../lib/escopo-workspace-leitura-smart-read.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'
import { executarQaLeituraSmartRead } from '../lib/servico-qa-leitura-smart-read.js'

export const qaLeituraSmartReadRouter = Router()

function organizacaoDaRequisicao(req: Request): string {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (!idOrganizacao || typeof idOrganizacao !== 'string') {
    throw new AppError('Header x-id-organizacao obrigatorio', 400, 'ORGANIZACAO_AUSENTE')
  }
  return idOrganizacao
}

function idUsuarioDaRequisicao(req: Request): string {
  const idUsuario = req.headers['x-id-usuario']
  if (!idUsuario || typeof idUsuario !== 'string') {
    throw new AppError('Header x-id-usuario obrigatorio', 400, 'USUARIO_AUSENTE')
  }
  return idUsuario
}

qaLeituraSmartReadRouter.post(
  '/',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      const idOrganizacao = organizacaoDaRequisicao(req)
      const idUsuario = idUsuarioDaRequisicao(req)
      const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)
      const entrada = QaLeituraRequestSchema.parse(req.body)
      const resultado = await executarQaLeituraSmartRead(entrada, idOrganizacao, {
        prisma: req.prisma,
        id_organizacao: idOrganizacao,
        id_usuario: idUsuario,
        id_workspace: idWorkspace,
        id_leitura_legado: entrada.id_leitura_legado,
      })
      res.status(200).json(resultado)
    } catch (erro) {
      if (erro instanceof z.ZodError) {
        next(new AppError(erro.errors.map((e) => e.message).join('; '), 400, 'VALIDACAO'))
        return
      }
      next(erro)
    }
  },
)
