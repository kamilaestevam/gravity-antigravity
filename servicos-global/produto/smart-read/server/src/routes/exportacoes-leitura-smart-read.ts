/**
 * exportacoes-leitura-smart-read.ts — Proxy export DATI (download-tasks)
 * POST cria tarefa · GET status · GET arquivo = ZIP idêntico ao legado.
 */

import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/app-error.js'
import {
  criarTarefaDownloadLeituraLegado,
  obterStatusTarefaDownloadLegado,
  baixarArquivoTarefaExportacaoLegado,
  resolverCompanyLegado,
  obterLeituraLegado,
} from '../lib/cliente-legado-smart-read.js'
import { sincronizarConferenciaLeituraNoLegado } from '../lib/sincronizar-conferencia-legado-smart-read.js'
import {
  obterLeituraDoProgresso,
  obterLeituraDoSnapshot,
} from '../lib/snapshot-leitura-smart-read.js'
import { leituraVinculadaAoWorkspaceSmartRead } from '../lib/escopo-workspace-leitura-smart-read.js'
import { mesclarLeituraComConferenciaGravity } from '../lib/mesclar-leitura-conferencia-gravity-smart-read.js'
import { normalizarLeitura, type Leitura } from '../schemas/leitura-smart-read.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'
import {
  CriarExportacaoLeituraCorpoSchema,
  CriarExportacaoLeituraRespostaSchema,
  StatusExportacaoLeituraRespostaSchema,
  normalizarStatusTarefaExportacaoLegado,
} from '../schemas/exportacao-leitura-smart-read.js'

export const exportacoesLeituraSmartReadRouter = Router()

const IdTarefaExportacaoSchema = z.object({ id_tarefa: z.string().min(1) })
const IdLeituraExportacaoSchema = z.object({ id_leitura: z.string().min(8) })

function organizacaoDaRequisicao(req: RequisicaoComPrismaSmartRead): string {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (!idOrganizacao || typeof idOrganizacao !== 'string') {
    throw new AppError('Header x-id-organizacao obrigatorio', 400, 'ORGANIZACAO_AUSENTE')
  }
  return idOrganizacao
}

function idUsuarioDaRequisicao(req: RequisicaoComPrismaSmartRead): string {
  const idUsuario = req.headers['x-id-usuario']
  if (!idUsuario || typeof idUsuario !== 'string') {
    throw new AppError('Header x-id-usuario obrigatorio', 400, 'USUARIO_AUSENTE')
  }
  return idUsuario
}

async function resolverLeituraParaExportacao(
  req: RequisicaoComPrismaSmartRead,
  idLeitura: string,
  idOrganizacao: string,
  idUsuario: string,
  idWorkspace: string,
): Promise<Leitura> {
  if (!req.prisma) {
    throw new AppError(
      'Banco Smart Docs indisponivel — configure SMART_READ_DATABASE_URL',
      503,
      'DATABASE_UNAVAILABLE',
    )
  }

  const vinculada = await leituraVinculadaAoWorkspaceSmartRead(req.prisma, idLeitura, idWorkspace)
  if (!vinculada) {
    throw new AppError('Leitura nao encontrada neste workspace', 404, 'LEITURA_NAO_ENCONTRADA')
  }

  const doProgresso = await obterLeituraDoProgresso(req.prisma, idLeitura, idUsuario, idWorkspace)
  const doSnapshot = await obterLeituraDoSnapshot(req.prisma, idLeitura, idWorkspace)
  const companyId = await resolverCompanyLegado(idOrganizacao)

  if (doProgresso) {
    const temExtracao = doProgresso.arquivos.some(
      (arq) => (arq.resultado_extracao?.length ?? 0) > 0,
    )
    if (temExtracao) return doProgresso
  }

  try {
    const legado = await obterLeituraLegado(companyId, idLeitura)
    const base = normalizarLeitura(legado)
    const mesclada = mesclarLeituraComConferenciaGravity(base, doSnapshot ?? doProgresso)
    if (doProgresso) {
      return mesclarLeituraComConferenciaGravity(mesclada, doProgresso)
    }
    return mesclada
  } catch {
    if (doProgresso) return doProgresso
    if (doSnapshot) return doSnapshot
    throw new AppError('Leitura indisponivel para exportacao', 404, 'LEITURA_NAO_ENCONTRADA')
  }
}

exportacoesLeituraSmartReadRouter.post(
  '/:id_leitura/exportacoes',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      const idOrganizacao = organizacaoDaRequisicao(req)
      const idUsuario = idUsuarioDaRequisicao(req)
      const { id_leitura } = IdLeituraExportacaoSchema.parse(req.params)
      const idWorkspace =
        typeof req.headers['x-id-workspace'] === 'string' && req.headers['x-id-workspace']
          ? req.headers['x-id-workspace']
          : idOrganizacao
      const corpo = CriarExportacaoLeituraCorpoSchema.parse(req.body)

      const leitura = await resolverLeituraParaExportacao(
        req,
        id_leitura,
        idOrganizacao,
        idUsuario,
        idWorkspace,
      )

      const idsValidos = new Set(leitura.arquivos.map((a) => a.id_arquivo))
      for (const id of corpo.ids_arquivo) {
        if (!idsValidos.has(id)) {
          throw new AppError(`Arquivo ${id} nao pertence a esta leitura`, 400, 'ARQUIVO_INVALIDO')
        }
      }

      const companyId = await resolverCompanyLegado(idOrganizacao)

      await sincronizarConferenciaLeituraNoLegado({
        companyId,
        idLeitura: id_leitura,
        leitura,
        idsArquivo: corpo.ids_arquivo,
      })

      const tarefa = await criarTarefaDownloadLeituraLegado(
        companyId,
        id_leitura,
        corpo.ids_arquivo,
      )

      const status_tarefa = normalizarStatusTarefaExportacaoLegado(tarefa.status)
      res.status(202).json(
        CriarExportacaoLeituraRespostaSchema.parse({
          id_tarefa: tarefa.id_tarefa,
          status_tarefa,
        }),
      )
    } catch (err) {
      next(err)
    }
  },
)

exportacoesLeituraSmartReadRouter.get(
  '/exportacoes/tarefas/:id_tarefa',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      const idOrganizacao = organizacaoDaRequisicao(req)
      idUsuarioDaRequisicao(req)
      const { id_tarefa } = IdTarefaExportacaoSchema.parse(req.params)
      const companyId = await resolverCompanyLegado(idOrganizacao)

      const status = await obterStatusTarefaDownloadLegado(companyId, id_tarefa)
      const status_tarefa = normalizarStatusTarefaExportacaoLegado(status.status)

      res.json(
        StatusExportacaoLeituraRespostaSchema.parse({
          id_tarefa: status.taskId,
          status_tarefa,
          pronto: status_tarefa === 'completed' && Boolean(status.downloadUrl),
          mensagem_erro: status.status === 'failed' ? (status.message ?? 'Falha no legado') : null,
        }),
      )
    } catch (err) {
      next(err)
    }
  },
)

exportacoesLeituraSmartReadRouter.get(
  '/exportacoes/tarefas/:id_tarefa/arquivo',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      const idOrganizacao = organizacaoDaRequisicao(req)
      idUsuarioDaRequisicao(req)
      const { id_tarefa } = IdTarefaExportacaoSchema.parse(req.params)
      const companyId = await resolverCompanyLegado(idOrganizacao)

      const arquivo = await baixarArquivoTarefaExportacaoLegado(companyId, id_tarefa)

      res.setHeader('Content-Type', arquivo.contentType)
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(arquivo.nomeArquivo)}"`,
      )
      res.send(arquivo.buffer)
    } catch (err) {
      next(err)
    }
  },
)
