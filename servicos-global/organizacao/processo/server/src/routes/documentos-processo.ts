/**
 * documentos.ts — Routes for Documento (attachments)
 * GET /processo/:processoId  — List documents
 * POST /                     — Upload document metadata
 * DELETE /:id                — Remove document
 *
 * Skill: antigravity-criar-produto (Passo 7)
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'

export const documentosRouter = Router()

const CreateDocumentoSchema = z.object({
  processo_id: z.string().min(1),
  nome: z.string().min(1),
  tipo_arquivo: z.enum(['pdf', 'xlsx', 'xml', 'img']),
  tamanho_bytes: z.number().int().nonnegative().optional(),
  url: z.string().url(),
  categoria: z.enum(['bl', 'po', 'di', 'li', 'nfe', 'outro']).optional(),
  product_id: z.string().optional(),
})

/**
 * GET /api/v1/processos/:id_processo/documentos
 * Lista documentos de um processo.
 */
documentosRouter.get('/processos/:id_processo/documentos', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma
    const { id_processo } = req.params
    const categoria = req.query.categoria as string | undefined

    const where: Record<string, unknown> = { processo_id: id_processo }
    if (categoria) where.categoria = categoria

    const data = await prisma.processoAnexos.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar documentos'
    res.status(500).json({ error: message })
  }
})

/**
 * POST /api/v1/documentos-processo
 * Registra metadados de um documento.
 */
documentosRouter.post('/documentos-processo', async (req: Request, res: Response) => {
  const parsed = CreateDocumentoSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = (req as any).prisma
    const userId = req.headers['x-user-id'] as string | undefined

    const documento = await prisma.processoAnexos.create({
      data: {
        ...parsed.data,
        user_id: userId,
      },
    })

    res.status(201).json({ success: true, data: documento })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar documento'
    res.status(500).json({ error: message })
  }
})

/**
 * DELETE /api/v1/documentos-processo/:id_documento_processo
 * Remove documento.
 */
documentosRouter.delete('/documentos-processo/:id_documento_processo', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma
    const { id_documento_processo } = req.params

    // Verifica se existe (tenant isolado)
    const existing = await prisma.processoAnexos.findFirst({ where: { id: id_documento_processo } })
    if (!existing) {
      return res.status(404).json({ error: 'Documento nao encontrado' })
    }

    await prisma.processoAnexos.delete({ where: { id: id_documento_processo } })

    res.json({ success: true, message: 'Documento removido' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao remover documento'
    res.status(500).json({ error: message })
  }
})
