/**
 * anexos.ts — Rotas de Anexos do Pedido
 *
 * Rota base: /api/v1/pedidos/anexos
 *
 * Endpoints:
 *   POST   /api/v1/pedidos/anexos                              — Upload de arquivo (multipart)
 *   GET    /api/v1/pedidos/anexos                              — Listar por vínculo + vinculo_id
 *   GET    /api/v1/pedidos/anexos/:id_anexo_pedido/download    — Download do arquivo
 *   DELETE /api/v1/pedidos/anexos/:id_anexo_pedido             — Excluir anexo
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
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
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
  id_anexo_pedido: z.string().min(1),
})

// ── POST /anexos — Upload ─────────────────────────────────────────────────────

anexosRouter.post(
  '/',
  upload.single('arquivo'),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('Nenhum arquivo enviado', 400, 'ARQUIVO_AUSENTE'))
    }

    const bodyParse = UploadBodySchema.safeParse(req.body)
    if (!bodyParse.success) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    }

    try {
      await withOrganizacao(req, async (rawDb) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db       = rawDb as any
        const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
        const tenantId = ctx.idOrganizacao
        const userId   = ctx.idUsuario ?? 'system'

        const { vinculo, vinculo_id, descricao, categoria } = bodyParse.data

        // Verificar limites do pedido (vinculo_id usado como referência de pedido)
        const pedidoId = vinculo === 'pedido' ? vinculo_id : vinculo_id
        const agregado = await db.pedidoAnexo.aggregate({
          where: { id_organizacao: tenantId, id_vinculo_anexo_pedido: pedidoId },
          _sum: { tamanho_bytes_anexo_pedido: true },
          _count: { _all: true },
        })

        const totalBytes   = (agregado._sum.tamanho_bytes_anexo_pedido ?? 0) + req.file!.size
        const totalArquivos = agregado._count._all + 1

        if (totalBytes > LIMITE_BYTES_TOTAL_PEDIDO) {
          throw new AppError('Limite de 200MB por pedido atingido', 400, 'LIMITE_TOTAL_EXCEDIDO')
        }
        if (totalArquivos > LIMITE_ARQUIVOS_PEDIDO) {
          throw new AppError('Limite de 50 arquivos por pedido atingido', 400, 'LIMITE_ARQUIVOS_EXCEDIDO')
        }

        const uuid: string    = randomUUID()
        const storageKey      = resolverStorageKey(tenantId, vinculo_id, uuid, req.file!.originalname)

        salvarArquivoLocal(req.file!.buffer, storageKey)

        const anexo = await db.pedidoAnexo.create({
          data: {
            id_anexo_pedido:            uuid,
            id_organizacao:             tenantId,
            vinculo_anexo_pedido:       vinculo,
            id_vinculo_anexo_pedido:    vinculo_id,
            nome_arquivo_anexo_pedido:  req.file!.originalname,
            tipo_arquivo_anexo_pedido:  req.file!.mimetype || 'application/octet-stream',
            tamanho_bytes_anexo_pedido: req.file!.size,
            descricao_anexo_pedido:     descricao,
            categoria_anexo_pedido:     categoria,
            chave_storage_anexo_pedido: storageKey,
            enviado_por_anexo_pedido:   userId,
          },
        })

        res.status(201).json({
          id: (anexo as { id_anexo_pedido: string }).id_anexo_pedido,
          nome_arquivo: req.file!.originalname,
          tamanho_bytes: req.file!.size,
          url_download: `/api/v1/pedidos/anexos/${uuid}/download`,
        })
      })
    } catch (err) {
      next(err)
    }
  }
)

// ── GET /anexos — Listar ──────────────────────────────────────────────────────

anexosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const queryParse = ListarQuerySchema.safeParse(req.query)
  if (!queryParse.success) {
    return next(new AppError('Parâmetros inválidos: vinculo e vinculo_id são obrigatórios', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const { vinculo, vinculo_id } = queryParse.data

      const anexos = await db.pedidoAnexo.findMany({
        where:   { id_organizacao: tenantId, vinculo_anexo_pedido: vinculo, id_vinculo_anexo_pedido: vinculo_id },
        orderBy: { data_criacao_anexo_pedido: 'desc' },
      })

      res.json(
        (anexos as Array<{
          id_anexo_pedido:            string
          id_organizacao:             string
          vinculo_anexo_pedido:       string
          id_vinculo_anexo_pedido:    string
          nome_arquivo_anexo_pedido:  string
          tipo_arquivo_anexo_pedido:  string
          tamanho_bytes_anexo_pedido: number
          descricao_anexo_pedido:     string | null
          categoria_anexo_pedido:     string | null
          chave_storage_anexo_pedido: string
          enviado_por_anexo_pedido:   string
          data_criacao_anexo_pedido:  Date
        }>).map(a => ({
          id:            a.id_anexo_pedido,
          tenant_id:     a.id_organizacao,
          vinculo:       a.vinculo_anexo_pedido,
          vinculo_id:    a.id_vinculo_anexo_pedido,
          nome_arquivo:  a.nome_arquivo_anexo_pedido,
          tipo_arquivo:  a.tipo_arquivo_anexo_pedido,
          tamanho_bytes: a.tamanho_bytes_anexo_pedido,
          descricao:     a.descricao_anexo_pedido ?? undefined,
          categoria:     a.categoria_anexo_pedido ?? undefined,
          storage_key:   a.chave_storage_anexo_pedido,
          uploaded_by:   a.enviado_por_anexo_pedido,
          uploaded_at:   a.data_criacao_anexo_pedido.toISOString(),
        }))
      )
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /anexos/:id_anexo_pedido/download — Download ────────────────────────

anexosRouter.get('/:id_anexo_pedido/download', async (req: Request, res: Response, next: NextFunction) => {
  const paramParse = IdParamSchema.safeParse(req.params)
  if (!paramParse.success) {
    return next(new AppError('ID inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const { id_anexo_pedido: id } = paramParse.data

      const anexo = await db.pedidoAnexo.findFirst({
        where: { id_anexo_pedido: id, id_organizacao: tenantId },
      })

      if (!anexo) {
        throw new AppError('Anexo não encontrado', 404, 'NOT_FOUND')
      }

      const typedAnexo = anexo as { chave_storage_anexo_pedido: string; nome_arquivo_anexo_pedido: string; tipo_arquivo_anexo_pedido: string }

      if (!arquivoExiste(typedAnexo.chave_storage_anexo_pedido)) {
        throw new AppError('Arquivo não encontrado no storage', 404, 'FILE_NOT_FOUND')
      }

      const buffer = lerArquivoLocal(typedAnexo.chave_storage_anexo_pedido)

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(typedAnexo.nome_arquivo_anexo_pedido)}"`)
      res.setHeader('Content-Type', typedAnexo.tipo_arquivo_anexo_pedido)
      res.setHeader('Content-Length', buffer.length)
      res.send(buffer)
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /anexos/:id_anexo_pedido — Excluir ────────────────────────────────

anexosRouter.delete('/:id_anexo_pedido', async (req: Request, res: Response, next: NextFunction) => {
  const paramParse = IdParamSchema.safeParse(req.params)
  if (!paramParse.success) {
    return next(new AppError('ID inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao
      const userId   = ctx.idUsuario ?? ''
      const userRoles = ctx.tiposUsuario ?? []

      const { id_anexo_pedido: id } = paramParse.data

      const anexo = await db.pedidoAnexo.findFirst({
        where: { id_anexo_pedido: id, id_organizacao: tenantId },
      })

      if (!anexo) {
        throw new AppError('Anexo não encontrado', 404, 'NOT_FOUND')
      }

      const typedAnexo = anexo as { chave_storage_anexo_pedido: string; enviado_por_anexo_pedido: string }

      const isAdmin = userRoles.includes('admin') || userRoles.includes('ADMIN')
      const isOwner = typedAnexo.enviado_por_anexo_pedido === userId

      if (!isOwner && !isAdmin) {
        throw new AppError('Sem permissão para excluir este anexo', 403, 'FORBIDDEN')
      }

      removerArquivoLocal(typedAnexo.chave_storage_anexo_pedido)

      await db.pedidoAnexo.delete({
        where: { id_anexo_pedido: id },
      })

      res.status(204).send()
    })
  } catch (err) {
    next(err)
  }
})
