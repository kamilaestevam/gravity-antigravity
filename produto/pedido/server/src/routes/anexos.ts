/**
 * anexos.ts — Rotas de Anexos do Pedido
 *
 * Rota base: /api/v1/pedidos/anexos
 *
 * Endpoints:
 *   POST   /api/v1/pedidos/anexos               — Upload de arquivo (multipart)
 *   GET    /api/v1/pedidos/anexos                — Listar por vínculo + vinculo_id
 *   GET    /api/v1/pedidos/anexos/:id/download   — Download do arquivo
 *   DELETE /api/v1/pedidos/anexos/:id            — Excluir anexo
 *
 * Regras de negócio:
 *   - Máximo 25MB por arquivo
 *   - Máximo 200MB total por pedido
 *   - Máximo 50 arquivos por pedido
 *   - Apenas extensões permitidas
 *   - Excluir: só quem fez upload ou admin do tenant
 */

import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import {
  validarExtensao,
  LIMITE_BYTES_ARQUIVO,
  LIMITE_BYTES_TOTAL_PEDIDO,
  LIMITE_ARQUIVOS_PEDIDO,
  resolverStorageKey,
  salvarArquivoLocal,
  removerArquivoLocal,
  lerArquivoLocal,
  arquivoExiste,
} from '../services/anexosService.js'

export const anexosRouter = Router()

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ── Multer — armazenamento em memória para validação antes de salvar ──────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_BYTES_ARQUIVO },
  fileFilter: (_req, file, cb) => {
    if (!validarExtensao(file.originalname)) {
      cb(new AppError('Extensão de arquivo não permitida', 400, 'EXTENSAO_INVALIDA'))
      return
    }
    cb(null, true)
  },
})

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const ListarQuerySchema = z.object({
  vinculo: z.enum(['pedido', 'item']),
  vinculo_id: z.string().min(1),
})

const UploadBodySchema = z.object({
  vinculo: z.enum(['pedido', 'item']),
  vinculo_id: z.string().min(1),
  descricao: z.string().max(500).optional(),
  categoria: z.string().max(100).optional(),
})

const IdParamSchema = z.object({
  id: z.string().min(1),
})

// ── POST /anexos — Upload ─────────────────────────────────────────────────────

anexosRouter.post(
  '/',
  upload.single('arquivo'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = (req as Request & { prisma: unknown }).prisma as {
        pedidoAnexo: {
          aggregate: (args: unknown) => Promise<{ _sum: { tamanho_bytes: number | null }; _count: { _all: number } }>
          create: (args: unknown) => Promise<unknown>
        }
      }
      const tenantId = (req as Request & { tenantId: string }).tenantId
      const userId = (req as Request & { userId: string }).userId ?? 'system'

      if (!req.file) {
        throw new AppError('Nenhum arquivo enviado', 400, 'ARQUIVO_AUSENTE')
      }

      const bodyParse = UploadBodySchema.safeParse(req.body)
      if (!bodyParse.success) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR')
      }

      const { vinculo, vinculo_id, descricao, categoria } = bodyParse.data

      // Verificar limites do pedido (vinculo_id usado como referência de pedido)
      const pedidoId = vinculo === 'pedido' ? vinculo_id : vinculo_id
      const agregado = await db.pedidoAnexo.aggregate({
        where: { tenant_id: tenantId, vinculo_id: pedidoId },
        _sum: { tamanho_bytes: true },
        _count: { _all: true },
      } as unknown as Parameters<typeof db.pedidoAnexo.aggregate>[0])

      const totalBytes = (agregado._sum.tamanho_bytes ?? 0) + req.file.size
      const totalArquivos = agregado._count._all + 1

      if (totalBytes > LIMITE_BYTES_TOTAL_PEDIDO) {
        throw new AppError('Limite de 200MB por pedido atingido', 400, 'LIMITE_TOTAL_EXCEDIDO')
      }
      if (totalArquivos > LIMITE_ARQUIVOS_PEDIDO) {
        throw new AppError('Limite de 50 arquivos por pedido atingido', 400, 'LIMITE_ARQUIVOS_EXCEDIDO')
      }

      const uuid: string = randomUUID()
      const storageKey = resolverStorageKey(tenantId, vinculo_id, uuid, req.file.originalname)

      salvarArquivoLocal(req.file.buffer, storageKey)

      const anexo = await db.pedidoAnexo.create({
        data: {
          id: uuid,
          tenant_id: tenantId,
          vinculo,
          vinculo_id,
          nome_arquivo: req.file.originalname,
          tipo_arquivo: req.file.mimetype || 'application/octet-stream',
          tamanho_bytes: req.file.size,
          descricao,
          categoria,
          storage_key: storageKey,
          uploaded_by: userId,
        },
      } as Parameters<typeof db.pedidoAnexo.create>[0])

      res.status(201).json({
        id: (anexo as { id: string }).id,
        nome_arquivo: req.file.originalname,
        tamanho_bytes: req.file.size,
        url_download: `/api/v1/pedidos/anexos/${uuid}/download`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ── GET /anexos — Listar ──────────────────────────────────────────────────────

anexosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = (req as Request & { prisma: unknown }).prisma as {
      pedidoAnexo: { findMany: (args: unknown) => Promise<unknown[]> }
    }
    const tenantId = (req as Request & { tenantId: string }).tenantId

    const queryParse = ListarQuerySchema.safeParse(req.query)
    if (!queryParse.success) {
      throw new AppError('Parâmetros inválidos: vinculo e vinculo_id são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    const { vinculo, vinculo_id } = queryParse.data

    const anexos = await db.pedidoAnexo.findMany({
      where: { tenant_id: tenantId, vinculo, vinculo_id },
      orderBy: { created_at: 'desc' },
    } as Parameters<typeof db.pedidoAnexo.findMany>[0])

    res.json(
      (anexos as Array<{
        id: string
        tenant_id: string
        vinculo: string
        vinculo_id: string
        nome_arquivo: string
        tipo_arquivo: string
        tamanho_bytes: number
        descricao: string | null
        categoria: string | null
        storage_key: string
        uploaded_by: string
        created_at: Date
      }>).map(a => ({
        id: a.id,
        tenant_id: a.tenant_id,
        vinculo: a.vinculo,
        vinculo_id: a.vinculo_id,
        nome_arquivo: a.nome_arquivo,
        tipo_arquivo: a.tipo_arquivo,
        tamanho_bytes: a.tamanho_bytes,
        descricao: a.descricao ?? undefined,
        categoria: a.categoria ?? undefined,
        storage_key: a.storage_key,
        uploaded_by: a.uploaded_by,
        uploaded_at: a.created_at.toISOString(),
      }))
    )
  } catch (err) {
    next(err)
  }
})

// ── GET /anexos/:id/download — Download ──────────────────────────────────────

anexosRouter.get('/:id/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = (req as Request & { prisma: unknown }).prisma as {
      pedidoAnexo: { findFirst: (args: unknown) => Promise<unknown> }
    }
    const tenantId = (req as Request & { tenantId: string }).tenantId

    const paramParse = IdParamSchema.safeParse(req.params)
    if (!paramParse.success) {
      throw new AppError('ID inválido', 400, 'VALIDATION_ERROR')
    }

    const { id } = paramParse.data

    const anexo = await db.pedidoAnexo.findFirst({
      where: { id, tenant_id: tenantId },
    } as Parameters<typeof db.pedidoAnexo.findFirst>[0])

    if (!anexo) {
      throw new AppError('Anexo não encontrado', 404, 'NOT_FOUND')
    }

    const typedAnexo = anexo as { storage_key: string; nome_arquivo: string; tipo_arquivo: string }

    if (!arquivoExiste(typedAnexo.storage_key)) {
      throw new AppError('Arquivo não encontrado no storage', 404, 'FILE_NOT_FOUND')
    }

    const buffer = lerArquivoLocal(typedAnexo.storage_key)

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(typedAnexo.nome_arquivo)}"`)
    res.setHeader('Content-Type', typedAnexo.tipo_arquivo)
    res.setHeader('Content-Length', buffer.length)
    res.send(buffer)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /anexos/:id — Excluir ──────────────────────────────────────────────

anexosRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = (req as Request & { prisma: unknown }).prisma as {
      pedidoAnexo: {
        findFirst: (args: unknown) => Promise<unknown>
        delete: (args: unknown) => Promise<void>
      }
    }
    const tenantId = (req as Request & { tenantId: string }).tenantId
    const userId = (req as Request & { userId: string }).userId ?? ''
    const userRole = (req as Request & { userRole?: string }).userRole ?? ''

    const paramParse = IdParamSchema.safeParse(req.params)
    if (!paramParse.success) {
      throw new AppError('ID inválido', 400, 'VALIDATION_ERROR')
    }

    const { id } = paramParse.data

    const anexo = await db.pedidoAnexo.findFirst({
      where: { id, tenant_id: tenantId },
    } as Parameters<typeof db.pedidoAnexo.findFirst>[0])

    if (!anexo) {
      throw new AppError('Anexo não encontrado', 404, 'NOT_FOUND')
    }

    const typedAnexo = anexo as { storage_key: string; uploaded_by: string }

    const isAdmin = userRole === 'admin' || userRole === 'ADMIN'
    const isOwner = typedAnexo.uploaded_by === userId

    if (!isOwner && !isAdmin) {
      throw new AppError('Sem permissão para excluir este anexo', 403, 'FORBIDDEN')
    }

    removerArquivoLocal(typedAnexo.storage_key)

    await db.pedidoAnexo.delete({
      where: { id },
    } as Parameters<typeof db.pedidoAnexo.delete>[0])

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
