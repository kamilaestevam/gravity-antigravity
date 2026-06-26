/**
 * GET /api/v1/smart-read/leituras/tokens/:id_leitura — resumo de tokens LLM da leitura
 * GET /api/v1/smart-read/leituras/tokens/resumo?escopo=leitura|usuario_mes|organizacao_mes
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { ResumoUsoLlmLeituraSmartReadSchema } from '../../../shared/uso-llm-leitura-smart-read.js'
import { AppError } from '../lib/app-error.js'
import { leituraVinculadaAoWorkspaceSmartRead } from '../lib/escopo-workspace-leitura-smart-read.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'
import { resolverIdWorkspaceLeituraSmartRead } from '../lib/escopo-workspace-leitura-smart-read.js'
import {
  consultarResumoTokensLeituraSmartRead,
  consultarResumoTokensOrganizacaoMesSmartRead,
  consultarResumoTokensUsuarioMesSmartRead,
} from '../lib/servico-uso-llm-leitura-smart-read.js'

export const tokensUsoLlmLeituraSmartReadRouter = Router()

const EscopoResumoTokensSchema = z.enum(['leitura', 'usuario_mes', 'organizacao_mes'])

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

function exigirPrisma(req: RequisicaoComPrismaSmartRead) {
  if (!req.prisma) {
    throw new AppError('Banco Smart Docs indisponivel', 503, 'BANCO_INDISPONIVEL')
  }
  return req.prisma
}

async function exigirLeituraNoWorkspace(
  req: RequisicaoComPrismaSmartRead,
  idLeitura: string,
): Promise<void> {
  const idOrganizacao = organizacaoDaRequisicao(req)
  const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)
  const prisma = exigirPrisma(req)
  const vinculada = await leituraVinculadaAoWorkspaceSmartRead(prisma, idLeitura, idWorkspace)
  if (!vinculada) {
    throw new AppError('Leitura nao encontrada neste workspace', 404, 'LEITURA_NAO_ENCONTRADA')
  }
}

tokensUsoLlmLeituraSmartReadRouter.get(
  '/resumo',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      organizacaoDaRequisicao(req)
      const idUsuario = idUsuarioDaRequisicao(req)
      const prisma = exigirPrisma(req)
      const { escopo, id_leitura } = z
        .object({
          escopo: EscopoResumoTokensSchema.default('usuario_mes'),
          id_leitura: z.string().min(8).optional(),
        })
        .parse(req.query)

      let resumo
      if (escopo === 'leitura') {
        if (!id_leitura) {
          throw new AppError('id_leitura obrigatorio para escopo leitura', 400, 'VALIDACAO')
        }
        await exigirLeituraNoWorkspace(req, id_leitura)
        resumo = await consultarResumoTokensLeituraSmartRead(prisma, id_leitura)
      } else if (escopo === 'organizacao_mes') {
        resumo = await consultarResumoTokensOrganizacaoMesSmartRead(prisma)
      } else {
        resumo = await consultarResumoTokensUsuarioMesSmartRead(prisma, idUsuario)
      }

      res.json(ResumoUsoLlmLeituraSmartReadSchema.parse(resumo))
    } catch (erro) {
      if (erro instanceof z.ZodError) {
        next(new AppError(erro.errors.map((e) => e.message).join('; '), 400, 'VALIDACAO'))
        return
      }
      next(erro)
    }
  },
)

tokensUsoLlmLeituraSmartReadRouter.get(
  '/:id_leitura',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      organizacaoDaRequisicao(req)
      idUsuarioDaRequisicao(req)
      const prisma = exigirPrisma(req)
      const { id_leitura } = z.object({ id_leitura: z.string().min(8) }).parse(req.params)
      await exigirLeituraNoWorkspace(req, id_leitura)
      const resumo = await consultarResumoTokensLeituraSmartRead(prisma, id_leitura)
      res.json(ResumoUsoLlmLeituraSmartReadSchema.parse(resumo))
    } catch (erro) {
      if (erro instanceof z.ZodError) {
        next(new AppError(erro.errors.map((e) => e.message).join('; '), 400, 'VALIDACAO'))
        return
      }
      next(erro)
    }
  },
)
