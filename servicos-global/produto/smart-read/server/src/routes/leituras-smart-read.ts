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
  obterArquivoLegado,
  obterLeituraLegado,
  resolverCompanyLegado,
} from '../lib/cliente-legado-smart-read.js'
import { montarListaTransacoesLeituraSmartRead } from '../lib/montar-lista-transacoes-leitura-smart-read.js'
import { mapearOrigemLeitura } from '../lib/normalizar-transacao-leitura-smart-read.js'
import {
  leituraVinculadaAoWorkspaceSmartRead,
  resolverIdWorkspaceLeituraSmartRead,
} from '../lib/escopo-workspace-leitura-smart-read.js'
import { registrarVinculoLeituraUsuarioSmartRead } from '../lib/registrar-vinculo-leitura-usuario-smart-read.js'
import {
  obterLeituraDoProgresso,
  obterLeituraDoSnapshot,
  persistirSnapshotLeituraSmartRead,
} from '../lib/snapshot-leitura-smart-read.js'
import {
  leituraTemConferenciaGravity,
  mesclarLeituraComConferenciaGravity,
} from '../lib/mesclar-leitura-conferencia-gravity-smart-read.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'
import {
  CriarLeituraRespostaSchema,
  LeituraSchema,
  ListarTransacoesRespostaSchema,
  MetricaLeituraRespostaSchema,
  OrigemLeituraEnum,
  normalizarLeitura,
} from '../schemas/leitura-smart-read.js'
import { corrigirEncodingNomeArquivoSmartRead } from '../../../shared/corrigir-encoding-nome-arquivo-smart-read.js'
import { progressoLeituraSmartReadRouter } from './progresso-leitura-smart-read.js'
import { analiseRiscosLeituraSmartReadRouter } from './analise-riscos-leitura-smart-read.js'
import { qaLeituraSmartReadRouter } from './qa-leitura-smart-read.js'
import { tokensUsoLlmLeituraSmartReadRouter } from './tokens-uso-llm-leitura-smart-read.js'
import { exportacoesLeituraSmartReadRouter } from './exportacoes-leitura-smart-read.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

const IdLeituraSchema = z.object({ id_leitura: z.string().min(8) })

const IdArquivoLeituraSchema = z.object({
  id_leitura: z.string().min(8),
  id_arquivo: z.string().min(1),
})

const ListarLeiturasQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(50),
  termo_busca: z.string().optional(),
  origem_leitura: OrigemLeituraEnum.optional(),
})

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

function idUsuarioOpcional(req: Request): string | undefined {
  const idUsuario = req.headers['x-id-usuario']
  return typeof idUsuario === 'string' && idUsuario ? idUsuario : undefined
}

router.get('/', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    idUsuarioDaRequisicao(req)
    const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)
    const query = ListarLeiturasQuerySchema.parse(req.query)
    const companyId = await resolverCompanyLegado(idOrganizacao)

    const { transacoes, total } = await montarListaTransacoesLeituraSmartRead({
      companyId,
      idOrganizacao,
      pagina: query.pagina,
      limite: query.limite,
      termo_busca: query.termo_busca,
      origem_leitura: query.origem_leitura,
      prisma: req.prisma,
      idWorkspace,
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

    const idUsuario = idUsuarioDaRequisicao(req)
    const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)
    const companyId = await resolverCompanyLegado(idOrganizacao)
    const { total } = await montarListaTransacoesLeituraSmartRead({
      companyId,
      idOrganizacao,
      pagina: 1,
      limite: 100,
      prisma: (req as RequisicaoComPrismaSmartRead).prisma,
      idWorkspace,
    })

    res.json(MetricaLeituraRespostaSchema.parse({ valor: total }))
  } catch (err) {
    next(err)
  }
})

router.post('/', upload.single('arquivo'), async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const idUsuario = idUsuarioDaRequisicao(req)
    const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)
    if (!req.file) {
      throw new AppError('Arquivo obrigatorio (campo multipart "arquivo")', 400, 'ARQUIVO_AUSENTE')
    }

    const companyId = await resolverCompanyLegado(idOrganizacao)
    const idLeitura = await criarLeituraLegado(companyId)
    const nomeArquivo = corrigirEncodingNomeArquivoSmartRead(req.file.originalname) ?? req.file.originalname
    const idArquivo = await enviarArquivoLegado(companyId, idLeitura, {
      buffer: req.file.buffer,
      nome: nomeArquivo,
      mimeType: req.file.mimetype,
    })

    if (req.prisma) {
      await registrarVinculoLeituraUsuarioSmartRead({
        prisma: req.prisma,
        idOrganizacao,
        idUsuario,
        idWorkspace,
        idLeitura,
      })
    }

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

router.use('/analise-riscos', analiseRiscosLeituraSmartReadRouter)
router.use('/qa', qaLeituraSmartReadRouter)
router.use('/tokens', tokensUsoLlmLeituraSmartReadRouter)
router.use(exportacoesLeituraSmartReadRouter)

router.use('/:id_leitura/progresso', progressoLeituraSmartReadRouter)

router.get(
  '/:id_leitura/arquivos/:id_arquivo',
  async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
    try {
      const idOrganizacao = organizacaoDaRequisicao(req)
      idUsuarioDaRequisicao(req)
      const { id_leitura, id_arquivo } = IdArquivoLeituraSchema.parse(req.params)
      const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)

      if (req.prisma) {
        const doSnapshot = await obterLeituraDoSnapshot(req.prisma, id_leitura, idWorkspace)
        if (!doSnapshot) {
          const vinculada = await leituraVinculadaAoWorkspaceSmartRead(req.prisma, id_leitura, idWorkspace)
          if (!vinculada) {
            throw new AppError('Leitura nao encontrada neste workspace', 404, 'LEITURA_NAO_ENCONTRADA')
          }
        }
      }

      const companyId = await resolverCompanyLegado(idOrganizacao)
      const arquivo = await obterArquivoLegado(companyId, id_leitura, id_arquivo)

      res.setHeader('Content-Type', arquivo.contentType)
      if (arquivo.nomeArquivo) {
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${encodeURIComponent(arquivo.nomeArquivo)}"`,
        )
      }
      res.send(arquivo.buffer)
    } catch (err) {
      next(err)
    }
  },
)

router.get('/:id_leitura', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const { id_leitura } = IdLeituraSchema.parse(req.params)
    const idUsuario = idUsuarioDaRequisicao(req)
    const idWorkspace = resolverIdWorkspaceLeituraSmartRead(req, idOrganizacao)

    if (req.prisma) {
      const vinculada = await leituraVinculadaAoWorkspaceSmartRead(req.prisma, id_leitura, idWorkspace)
      if (!vinculada) {
        throw new AppError('Leitura nao encontrada neste workspace', 404, 'LEITURA_NAO_ENCONTRADA')
      }
    }

    const companyId = await resolverCompanyLegado(idOrganizacao)
    try {
      const leituraLegado = await obterLeituraLegado(companyId, id_leitura)
      let leitura = normalizarLeitura(leituraLegado)
      let doSnapshot: Awaited<ReturnType<typeof obterLeituraDoSnapshot>> = null

      if (req.prisma) {
        doSnapshot = await obterLeituraDoSnapshot(req.prisma, id_leitura, idWorkspace)
        if (doSnapshot) {
          leitura = mesclarLeituraComConferenciaGravity(leitura, doSnapshot)
        }
      }

      if (req.prisma && idUsuario && req.idOrganizacao) {
        const preservarConferencia = doSnapshot != null && leituraTemConferenciaGravity(doSnapshot)

        if (!preservarConferencia) {
          void persistirSnapshotLeituraSmartRead({
            prisma: req.prisma,
            idOrganizacao: req.idOrganizacao,
            idUsuario,
            idWorkspace,
            leitura,
            motivo: 'extracao_concluida',
            extras: {
              data_envio: leituraLegado.createdAt ?? null,
              created_at: leituraLegado.createdAt ?? null,
              completed_at: leituraLegado.completedAt ?? null,
              origem_leitura: mapearOrigemLeitura(leituraLegado.source ?? leituraLegado.origin),
            },
          }).catch((erro) => {
            console.warn('[smart-read][snapshot] falha ao persistir no GET leitura', erro)
          })
        }
      }

      res.json(LeituraSchema.parse(leitura))
      return
    } catch (erroLegado) {
      if (req.prisma) {
        const doSnapshot = await obterLeituraDoSnapshot(req.prisma, id_leitura, idWorkspace)
        if (doSnapshot) {
          res.json(LeituraSchema.parse(doSnapshot))
          return
        }
      }
      throw erroLegado
    }
  } catch (err) {
    const idUsuarioCatch = idUsuarioOpcional(req)
    const idOrganizacaoCatch = req.headers['x-id-organizacao']
    const idWorkspaceCatch =
      typeof idOrganizacaoCatch === 'string'
        ? resolverIdWorkspaceLeituraSmartRead(req, idOrganizacaoCatch)
        : ''
    if (req.prisma && idUsuarioCatch && idWorkspaceCatch) {
      const doProgresso = await obterLeituraDoProgresso(
        req.prisma,
        IdLeituraSchema.parse(req.params).id_leitura,
        idUsuarioCatch,
        idWorkspaceCatch,
      )
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
