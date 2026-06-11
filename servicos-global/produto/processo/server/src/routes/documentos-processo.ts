/**
 * documentos-processo.ts — Metadados de documentos anexos
 */
import { Router, Request, Response } from 'express'
import type { PrismaClient } from '../../../generated/index.js'
import { createDocumentoBodySchema } from '../contracts/processo-schemas.js'

export const documentosRouter = Router()

const PRODUTO_ID = 'processo'

type ReqComPrisma = Request & { prisma?: PrismaClient }

documentosRouter.get('/processos/:id_processo/documentos', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const { id_processo } = req.params
    const categoria = req.query.categoria_documento_processo as string | undefined

    const where: Record<string, unknown> = { id_processo }
    if (categoria) where.categoria_documento_processo = categoria

    const data = await prisma.documentoProcesso.findMany({
      where,
      orderBy: { data_criacao_documento_processo: 'desc' },
    })

    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar documentos'
    res.status(500).json({ error: message })
  }
})

documentosRouter.post('/documentos-processo', async (req: ReqComPrisma, res: Response) => {
  const parsed = createDocumentoBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = req.prisma!
    const idUsuario = req.headers['x-id-usuario'] as string | undefined

    const documento = await prisma.documentoProcesso.create({
      data: {
        ...parsed.data,
        id_organizacao: req.headers['x-id-organizacao'] as string,
        id_produto_gravity: PRODUTO_ID,
        id_usuario: idUsuario ?? null,
      },
    })

    res.status(201).json({ success: true, data: documento })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar documento'
    res.status(500).json({ error: message })
  }
})

documentosRouter.delete('/documentos-processo/:id_documento_processo', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const { id_documento_processo } = req.params

    const existing = await prisma.documentoProcesso.findFirst({
      where: { id_documento_processo },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Documento nao encontrado' })
    }

    await prisma.documentoProcesso.delete({ where: { id_documento_processo } })

    res.json({ success: true, message: 'Documento removido' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao remover documento'
    res.status(500).json({ error: message })
  }
})
