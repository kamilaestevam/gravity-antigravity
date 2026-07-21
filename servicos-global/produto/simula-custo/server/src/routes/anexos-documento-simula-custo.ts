/**
 * anexos-documento-simula-custo.ts — Upload/listagem/download de anexos de documento
 * Base: /api/v1/simula-custo/anexos-documento
 */
import { Router, Response, NextFunction } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { AppError } from '../lib/erros.js'
import type { TenantRequest } from '../middleware/isolamento-tenant.js'
import {
  LIMITE_ARQUIVOS_DOCUMENTO,
  LIMITE_BYTES_ARQUIVO,
  LIMITE_BYTES_TOTAL_DOCUMENTO,
  lerAnexoDocumentoSimulaCusto,
  removerAnexoDocumentoSimulaCusto,
  resolverChaveStorageAnexoDocumentoSimulaCusto,
  salvarAnexoDocumentoSimulaCusto,
  validarExtensaoAnexoDocumentoSimulaCusto,
  anexoDocumentoSimulaCustoExiste,
} from '../services/anexos-documento-simula-custo.js'
import { serializarAnexoDocumentoSimulaCusto } from '../shared/serializar-anexo-documento-simula-custo.js'

export const anexosDocumentoSimulaCustoRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_BYTES_ARQUIVO },
  fileFilter: (_req, file, cb) => {
    if (!validarExtensaoAnexoDocumentoSimulaCusto(file.originalname)) {
      cb(new AppError('Extensão de arquivo não permitida', 400, 'EXTENSAO_INVALIDA'))
      return
    }
    cb(null, true)
  },
})

const ListarQuerySchema = z.object({
  id_documento_simula_custo: z.string().min(1),
})

const UploadBodySchema = z.object({
  id_documento_simula_custo: z.string().min(1),
  categoria_anexo_documento_simula_custo: z.string().max(100).optional(),
})

const IdParamSchema = z.object({
  id_anexo_documento_simula_custo: z.string().min(1),
})

function exigirContexto(req: TenantRequest) {
  const { prisma, tenantId, idWorkspace, idUsuario } = req
  if (!prisma || !tenantId) throw new AppError('x-id-organizacao obrigatório', 401, 'UNAUTHORIZED')
  if (!idWorkspace) throw new AppError('x-id-workspace obrigatório', 400, 'WORKSPACE_REQUIRED')
  if (!idUsuario) throw new AppError('x-id-usuario obrigatório', 400, 'USUARIO_REQUIRED')
  return { prisma, tenantId, idWorkspace, idUsuario }
}

async function validarDocumentoPertenceOrganizacao(
  prisma: NonNullable<TenantRequest['prisma']>,
  idDocumento: string,
) {
  const doc = await prisma.documentoSimulaCusto.findFirst({
    where: { id_documento_simula_custo: idDocumento },
  })
  if (!doc) throw new AppError('Documento não encontrado', 404, 'NOT_FOUND')
  return doc
}

// POST /anexos-documento — upload multipart
anexosDocumentoSimulaCustoRouter.post(
  '/',
  upload.single('arquivo'),
  async (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('Nenhum arquivo enviado', 400, 'ARQUIVO_AUSENTE'))
    }
    const bodyParse = UploadBodySchema.safeParse(req.body)
    if (!bodyParse.success) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    }
    try {
      const { prisma, tenantId, idWorkspace, idUsuario } = exigirContexto(req)
      const { id_documento_simula_custo, categoria_anexo_documento_simula_custo } = bodyParse.data

      await validarDocumentoPertenceOrganizacao(prisma, id_documento_simula_custo)

      const agregado = await prisma.anexoDocumentoSimulaCusto.aggregate({
        where: { id_documento_simula_custo },
        _sum: { tamanho_bytes_anexo_documento_simula_custo: true },
        _count: { _all: true },
      })
      const totalBytes = (agregado._sum.tamanho_bytes_anexo_documento_simula_custo ?? 0) + req.file.size
      if (totalBytes > LIMITE_BYTES_TOTAL_DOCUMENTO) {
        throw new AppError('Limite de 100MB por documento atingido', 400, 'LIMITE_TOTAL_EXCEDIDO')
      }
      if (agregado._count._all + 1 > LIMITE_ARQUIVOS_DOCUMENTO) {
        throw new AppError('Limite de 20 arquivos por documento atingido', 400, 'LIMITE_ARQUIVOS_EXCEDIDO')
      }

      const idAnexo = randomUUID()
      const chaveStorage = resolverChaveStorageAnexoDocumentoSimulaCusto(
        tenantId,
        id_documento_simula_custo,
        idAnexo,
        req.file.originalname,
      )
      salvarAnexoDocumentoSimulaCusto(req.file.buffer, chaveStorage)

      const anexo = await prisma.anexoDocumentoSimulaCusto.create({
        data: {
          id_anexo_documento_simula_custo: idAnexo,
          id_workspace: idWorkspace,
          id_usuario: idUsuario,
          id_documento_simula_custo,
          nome_arquivo_anexo_documento_simula_custo: pathBasename(chaveStorage),
          nome_original_anexo_documento_simula_custo: req.file.originalname,
          tipo_arquivo_anexo_documento_simula_custo: req.file.mimetype || 'application/octet-stream',
          tamanho_bytes_anexo_documento_simula_custo: req.file.size,
          categoria_anexo_documento_simula_custo: categoria_anexo_documento_simula_custo ?? null,
          chave_storage_anexo_documento_simula_custo: chaveStorage,
          enviado_por_anexo_documento_simula_custo: idUsuario,
        },
      })

      res.status(201).json({
        anexo_documento_simula_custo: serializarAnexoDocumentoSimulaCusto(anexo),
        url_download: `/api/v1/simula-custo/anexos-documento/${anexo.id_anexo_documento_simula_custo}/download`,
      })
    } catch (err) {
      next(err)
    }
  },
)

function pathBasename(chave: string): string {
  const parts = chave.split('/')
  return parts[parts.length - 1] ?? chave
}

// GET /anexos-documento?id_documento_simula_custo=...
anexosDocumentoSimulaCustoRouter.get('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  const queryParse = ListarQuerySchema.safeParse(req.query)
  if (!queryParse.success) {
    return next(new AppError('id_documento_simula_custo é obrigatório', 400, 'VALIDATION_ERROR'))
  }
  try {
    const { prisma } = exigirContexto(req)
    const { id_documento_simula_custo } = queryParse.data
    await validarDocumentoPertenceOrganizacao(prisma, id_documento_simula_custo)

    const anexos = await prisma.anexoDocumentoSimulaCusto.findMany({
      where: { id_documento_simula_custo },
      orderBy: { data_criacao_anexo_documento_simula_custo: 'desc' },
    })
    res.json({
      anexos_documento_simula_custo: anexos.map(serializarAnexoDocumentoSimulaCusto),
    })
  } catch (err) {
    next(err)
  }
})

// GET /anexos-documento/:id_anexo_documento_simula_custo/download
anexosDocumentoSimulaCustoRouter.get(
  '/:id_anexo_documento_simula_custo/download',
  async (req: TenantRequest, res: Response, next: NextFunction) => {
    const paramParse = IdParamSchema.safeParse(req.params)
    if (!paramParse.success) {
      return next(new AppError('ID inválido', 400, 'VALIDATION_ERROR'))
    }
    try {
      const { prisma } = exigirContexto(req)
      const anexo = await prisma.anexoDocumentoSimulaCusto.findFirst({
        where: { id_anexo_documento_simula_custo: paramParse.data.id_anexo_documento_simula_custo },
      })
      if (!anexo) throw new AppError('Anexo não encontrado', 404, 'NOT_FOUND')
      if (!anexoDocumentoSimulaCustoExiste(anexo.chave_storage_anexo_documento_simula_custo)) {
        throw new AppError('Arquivo não encontrado no storage', 404, 'ARQUIVO_AUSENTE')
      }
      const buffer = lerAnexoDocumentoSimulaCusto(anexo.chave_storage_anexo_documento_simula_custo)
      res.setHeader('Content-Type', anexo.tipo_arquivo_anexo_documento_simula_custo)
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(anexo.nome_original_anexo_documento_simula_custo)}"`,
      )
      res.send(buffer)
    } catch (err) {
      next(err)
    }
  },
)

// DELETE /anexos-documento/:id_anexo_documento_simula_custo
anexosDocumentoSimulaCustoRouter.delete(
  '/:id_anexo_documento_simula_custo',
  async (req: TenantRequest, res: Response, next: NextFunction) => {
    const paramParse = IdParamSchema.safeParse(req.params)
    if (!paramParse.success) {
      return next(new AppError('ID inválido', 400, 'VALIDATION_ERROR'))
    }
    try {
      const { prisma } = exigirContexto(req)
      const anexo = await prisma.anexoDocumentoSimulaCusto.findFirst({
        where: { id_anexo_documento_simula_custo: paramParse.data.id_anexo_documento_simula_custo },
      })
      if (!anexo) throw new AppError('Anexo não encontrado', 404, 'NOT_FOUND')

      removerAnexoDocumentoSimulaCusto(anexo.chave_storage_anexo_documento_simula_custo)
      await prisma.anexoDocumentoSimulaCusto.delete({
        where: { id_anexo_documento_simula_custo: anexo.id_anexo_documento_simula_custo },
      })
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
)
