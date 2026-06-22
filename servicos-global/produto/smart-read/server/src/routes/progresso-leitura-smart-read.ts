/**
 * GET/PATCH /api/v1/smart-read/leituras/:id_leitura/progresso
 * Persiste passo 2–4 + edições da conferência no Postgres Gravity.
 */
import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Prisma } from '../generated/client/index.js'
import { AppError } from '../lib/app-error.js'
import {
  EstadoProgressoLeituraSchema,
  extrairDadosSessaoProgressoLeitura,
  montarRespostaProgressoLeitura,
} from '../schemas/progresso-leitura-smart-read.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'

const router = Router({ mergeParams: true })

const IdLeituraParamSchema = z.object({ id_leitura: z.string().min(8) })

function exigirPrisma(req: RequisicaoComPrismaSmartRead) {
  if (!req.prisma) {
    throw new AppError(
      'Banco Smart Read indisponivel — configure SMART_READ_DATABASE_URL',
      503,
      'DATABASE_UNAVAILABLE',
    )
  }
  return req.prisma
}

function idUsuarioDaRequisicao(req: RequisicaoComPrismaSmartRead): string {
  const idUsuario = req.headers['x-id-usuario']
  if (!idUsuario || typeof idUsuario !== 'string') {
    throw new AppError('Header x-id-usuario obrigatorio', 400, 'USUARIO_AUSENTE')
  }
  return idUsuario
}

function idWorkspaceDaRequisicao(req: RequisicaoComPrismaSmartRead): string | null {
  const idWorkspace = req.headers['x-id-workspace']
  return typeof idWorkspace === 'string' && idWorkspace ? idWorkspace : null
}

router.get('/', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const prisma = exigirPrisma(req)
    const { id_leitura } = IdLeituraParamSchema.parse(req.params)
    const idUsuario = idUsuarioDaRequisicao(req)

    const registro = await prisma.progressoLeituraSmartRead.findFirst({
      where: {
        id_usuario: idUsuario,
        id_leitura_legado_progresso_leitura_smart_read: id_leitura,
      },
    })

    if (!registro) {
      throw new AppError('Progresso nao encontrado', 404, 'PROGRESSO_NAO_ENCONTRADO')
    }

    const dadosSessao = extrairDadosSessaoProgressoLeitura(
      registro.dados_sessao_progresso_leitura_smart_read,
    )
    if (!dadosSessao) {
      throw new AppError('Dados de sessao invalidos', 500, 'SESSAO_INVALIDA')
    }

    res.json(
      montarRespostaProgressoLeitura(registro.passo_atual_progresso_leitura_smart_read, dadosSessao),
    )
  } catch (err) {
    next(err)
  }
})

router.patch('/', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const prisma = exigirPrisma(req)
    const { id_leitura } = IdLeituraParamSchema.parse(req.params)
    const idUsuario = idUsuarioDaRequisicao(req)
    const idWorkspace = idWorkspaceDaRequisicao(req)
    const corpo = EstadoProgressoLeituraSchema.parse(req.body)

    if (corpo.leitura.id_leitura !== id_leitura) {
      throw new AppError('id_leitura do corpo diverge do path', 400, 'ID_LEITURA_DIVERGENTE')
    }

    const dadosSessao = { nome: corpo.nome, leitura: corpo.leitura } satisfies Prisma.InputJsonObject
    const dadosJson = dadosSessao as Prisma.InputJsonValue

    const existente = await prisma.progressoLeituraSmartRead.findFirst({
      where: {
        id_usuario: idUsuario,
        id_leitura_legado_progresso_leitura_smart_read: id_leitura,
      },
    })

    const registro = existente
      ? await prisma.progressoLeituraSmartRead.update({
          where: { id_progresso_leitura_smart_read: existente.id_progresso_leitura_smart_read },
          data: {
            id_workspace: idWorkspace,
            passo_atual_progresso_leitura_smart_read: corpo.passo,
            dados_sessao_progresso_leitura_smart_read: dadosJson,
          },
        })
      : await prisma.progressoLeituraSmartRead.create({
          data: {
            id_usuario: idUsuario,
            id_workspace: idWorkspace,
            id_leitura_legado_progresso_leitura_smart_read: id_leitura,
            passo_atual_progresso_leitura_smart_read: corpo.passo,
            dados_sessao_progresso_leitura_smart_read: dadosJson,
          },
        })

    const dadosSalvos = extrairDadosSessaoProgressoLeitura(registro.dados_sessao_progresso_leitura_smart_read)
    if (!dadosSalvos) {
      throw new AppError('Falha ao persistir sessao', 500, 'SESSAO_INVALIDA')
    }

    res.json(montarRespostaProgressoLeitura(registro.passo_atual_progresso_leitura_smart_read, dadosSalvos))
    console.info('[smart-read][progresso] PATCH ok', {
      id_leitura,
      passo: corpo.passo,
      id_usuario: idUsuario,
    })
  } catch (err) {
    next(err)
  }
})

export { router as progressoLeituraSmartReadRouter }
