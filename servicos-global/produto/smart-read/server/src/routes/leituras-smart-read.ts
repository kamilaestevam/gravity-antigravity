/**
 * leituras-smart-read.ts — Rotas do BFF Smart Read
 * POST /          → cria leitura no legado + envia arquivo (202, processamento assincrono)
 * GET  /:id       → status/resultado normalizado (consumidor faz polling)
 * Identidade da organizacao vem do header x-id-organizacao (S2S), nunca do body.
 */

import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { AppError } from '../lib/app-error.js'
import {
  criarLeituraLegado,
  enviarArquivoLegado,
  obterLeituraLegado,
  resolverCompanyLegado,
} from '../lib/cliente-legado-smart-read.js'
import { montarListaTransacoesLeituraSmartRead } from '../lib/montar-lista-transacoes-leitura-smart-read.js'
import {
  obterLeituraDoProgresso,
  obterLeituraDoSnapshot,
  persistirSnapshotLeituraSmartRead,
} from '../lib/snapshot-leitura-smart-read.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'
import {
  CriarLeituraRespostaSchema,
  LeituraSchema,
  ListarTransacoesRespostaSchema,
  MetricaLeituraRespostaSchema,
  normalizarLeitura,
} from '../schemas/leitura-smart-read.js'
import { progressoLeituraSmartReadRouter } from './progresso-leitura-smart-read.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

const IdLeituraSchema = z.object({ id_leitura: z.string().min(8) })

const ListarLeiturasQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(50),
  termo_busca: z.string().optional(),
})

function organizacaoDaRequisicao(req: Request): string {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (!idOrganizacao || typeof idOrganizacao !== 'string') {
    throw new AppError('Header x-id-organizacao obrigatorio', 400, 'ORGANIZACAO_AUSENTE')
  }
  return idOrganizacao
}

function idUsuarioOpcional(req: Request): string | undefined {
  const idUsuario = req.headers['x-id-usuario']
  return typeof idUsuario === 'string' && idUsuario ? idUsuario : undefined
}

function idWorkspaceOpcional(req: Request): string | null {
  const idWorkspace = req.headers['x-id-workspace']
  return typeof idWorkspace === 'string' && idWorkspace ? idWorkspace : null
}

router.get('/', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const query = ListarLeiturasQuerySchema.parse(req.query)
    const companyId = await resolverCompanyLegado(idOrganizacao)

    const { transacoes, total } = await montarListaTransacoesLeituraSmartRead({
      companyId,
      idOrganizacao,
      pagina: query.pagina,
      limite: query.limite,
      termo_busca: query.termo_busca,
      prisma: req.prisma,
      idUsuario: idUsuarioOpcional(req),
      idWorkspace: idWorkspaceOpcional(req),
    })

    res.json(
      ListarTransacoesRespostaSchema.parse({
        transacoes,
        paginacao: {
          pagina: query.pagina,
          limite: query.limite,
          total,
        },
      }),
    )
  } catch (err) {
    next(err)
  }
})

router.get('/metricas/:tipo_metrica', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const { tipo_metrica } = z.object({ tipo_metrica: z.enum(['readings']) }).parse(req.params)
    if (tipo_metrica !== 'readings') {
      throw new AppError('Metrica nao suportada', 400, 'METRICA_INVALIDA')
    }

    const companyId = await resolverCompanyLegado(idOrganizacao)
    const { total } = await montarListaTransacoesLeituraSmartRead({
      companyId,
      idOrganizacao,
      pagina: 1,
      limite: 100,
      prisma: (req as RequisicaoComPrismaSmartRead).prisma,
      idUsuario: idUsuarioOpcional(req),
      idWorkspace: idWorkspaceOpcional(req),
    })

    res.json(MetricaLeituraRespostaSchema.parse({ valor: total }))
  } catch (err) {
    next(err)
  }
})

router.post('/', upload.single('arquivo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    if (!req.file) {
      throw new AppError('Arquivo obrigatorio (campo multipart "arquivo")', 400, 'ARQUIVO_AUSENTE')
    }

    const companyId = await resolverCompanyLegado(idOrganizacao)
    const idLeitura = await criarLeituraLegado(companyId)
    const idArquivo = await enviarArquivoLegado(companyId, idLeitura, {
      buffer: req.file.buffer,
      nome: req.file.originalname,
      mimeType: req.file.mimetype,
    })

    const resposta = CriarLeituraRespostaSchema.parse({
      id_leitura: idLeitura,
      id_arquivo: idArquivo,
      status_leitura: 'PROCESSING',
    })
    res.status(202).json(resposta)
  } catch (err) {
    next(err)
  }
})

router.use('/:id_leitura/progresso', progressoLeituraSmartReadRouter)

router.get('/:id_leitura', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const { id_leitura } = IdLeituraSchema.parse(req.params)
    const idUsuario = idUsuarioOpcional(req)

    if (req.prisma) {
      const doSnapshot = await obterLeituraDoSnapshot(req.prisma, id_leitura)
      if (doSnapshot) {
        res.json(LeituraSchema.parse(doSnapshot))
        return
      }

      const doProgresso = await obterLeituraDoProgresso(req.prisma, id_leitura, idUsuario)
      if (doProgresso) {
        res.json(LeituraSchema.parse(doProgresso))
        return
      }
    }

    const companyId = await resolverCompanyLegado(idOrganizacao)
    const leituraLegado = await obterLeituraLegado(companyId, id_leitura)
    const leitura = normalizarLeitura(leituraLegado)

    if (req.prisma && idUsuario && req.idOrganizacao) {
      void persistirSnapshotLeituraSmartRead({
        prisma: req.prisma,
        idOrganizacao: req.idOrganizacao,
        idUsuario,
        idWorkspace: idWorkspaceOpcional(req),
        leitura,
        motivo: 'extracao_concluida',
        extras: {
          data_envio: leituraLegado.createdAt ?? null,
          created_at: leituraLegado.createdAt ?? null,
          completed_at: leituraLegado.completedAt ?? null,
        },
      }).catch((erro) => {
        console.warn('[smart-read][snapshot] falha ao persistir no GET leitura', erro)
      })
    }

    res.json(LeituraSchema.parse(leitura))
  } catch (err) {
    if (req.prisma) {
      const idUsuario = idUsuarioOpcional(req)
      const doProgresso = await obterLeituraDoProgresso(req.prisma, IdLeituraSchema.parse(req.params).id_leitura, idUsuario)
      if (doProgresso) {
        res.json(LeituraSchema.parse(doProgresso))
        return
      }
    }
    next(err)
  }
})

router.delete('/:id_leitura', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    throw new AppError('Exclusao de leitura ainda nao disponivel no legado', 501, 'NAO_IMPLEMENTADO')
  } catch (err) {
    next(err)
  }
})

export { router as leiturasSmartReadRouter }
