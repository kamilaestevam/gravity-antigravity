/**
 * pdf.ts — Rotas de Geração de PDF do Pedido
 *
 * Rota base: /api/v1/pedidos/pdf
 *
 * Endpoints:
 *   GET  /api/v1/pedidos/pdf/templates   — Lista templates disponíveis do tenant
 *   POST /api/v1/pedidos/pdf/gerar       — Gera PDF e salva como anexo
 *
 * Fluxo do POST /gerar:
 *   1. Buscar pedido + itens com tenant_id
 *   2. Buscar template com tenant_id
 *   3. Compilar variáveis (pedido, itens, colunas do usuário)
 *   4. Renderizar Handlebars
 *   5. Gerar PDF (Puppeteer ou fallback HTML)
 *   6. Salvar no storage + criar registro Anexo
 *   7. Retornar url_download + anexo_id
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import {
  compilarVariaveis,
  renderizarTemplate,
  gerarPdfBuffer,
  gerarNomeArquivoPdf,
} from '../services/pdfService.js'
import {
  resolverStorageKey,
  salvarArquivoLocal,
} from '../services/anexosService.js'

export const pdfRouter = Router()

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

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const GerarPdfSchema = z.object({
  pedido_id: z.string().min(1),
  template_id: z.string().min(1),
  salvar_como_anexo: z.boolean().default(true),
})

// ── GET /pdf/templates ────────────────────────────────────────────────────────

pdfRouter.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = (req as Request & { prisma: unknown }).prisma as {
      pedidoTemplatePdf: { findMany: (args: unknown) => Promise<unknown[]> }
    }
    const tenantId = (req as Request & { tenantId: string }).tenantId

    const templates = await db.pedidoTemplatePdf.findMany({
      where: { tenant_id: tenantId },
      orderBy: { nome: 'asc' },
    } as Parameters<typeof db.pedidoTemplatePdf.findMany>[0])

    res.json(templates)
  } catch (err) {
    next(err)
  }
})

// ── POST /pdf/gerar ───────────────────────────────────────────────────────────

pdfRouter.post('/gerar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = (req as Request & { prisma: unknown }).prisma as {
      pedidoTemplatePdf: { findFirst: (args: unknown) => Promise<unknown> }
      pedidoAnexo: { create: (args: unknown) => Promise<unknown> }
    }

    // Acesso ao Prisma base (sem extensão de tenant) para pedido — usa a extensão já aplicada
    const prismaRaw = (req as Request & { prismaRaw?: unknown }).prismaRaw ?? db

    const tenantId = (req as Request & { tenantId: string }).tenantId
    const userId = (req as Request & { userId: string }).userId ?? 'system'

    const bodyParse = GerarPdfSchema.safeParse(req.body)
    if (!bodyParse.success) {
      throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { pedido_id, template_id, salvar_como_anexo } = bodyParse.data

    // 1. Buscar pedido com itens
    const rawPrisma = prismaRaw as {
      pedido?: { findFirst: (args: unknown) => Promise<unknown> }
      pedidoComercial?: { findFirst: (args: unknown) => Promise<unknown> }
    }
    const pedidoFinder = rawPrisma.pedidoComercial ?? rawPrisma.pedido ?? null

    let pedido: unknown = null
    if (pedidoFinder) {
      pedido = await (pedidoFinder as { findFirst: (args: unknown) => Promise<unknown> }).findFirst({
        where: { id: pedido_id, tenant_id: tenantId },
        include: { itens: true },
      })
    }

    // Fallback se não encontrou via Prisma extendido (tenant isolation já garante o tenant_id)
    if (!pedido) {
      throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
    }

    // 2. Buscar template
    const template = await db.pedidoTemplatePdf.findFirst({
      where: { id: template_id, tenant_id: tenantId },
    } as Parameters<typeof db.pedidoTemplatePdf.findFirst>[0])

    if (!template) {
      throw new AppError('Template não encontrado', 404, 'NOT_FOUND')
    }

    const typedTemplate = template as {
      nome: string
      conteudo_html: string
    }

    // 3. Compilar variáveis
    const pedidoTyped = pedido as {
      numero_pedido: string
      tipo_operacao: string
      exportador_nome?: string | null
      fabricante_nome?: string | null
      incoterm?: string | null
      moeda_pedido: string
      data_emissao_pedido: string
      valor_total_pedido?: number | null
      quantidade_total_pedido?: number | null
      itens: Array<{
        part_number: string
        descricao: string
        ncm: string
        quantidade_atual: number
        quantidade_inicial: number
        unidade_comercializada_item?: string | null
        moeda_item: string
        valor_unitario?: number | null
        valor_item?: number | null
      }>
      [key: string]: unknown
    }

    // Tenant nome — usar variável de ambiente ou padrão
    const tenantNome = process.env.TENANT_NOME ?? tenantId

    const variaveis = compilarVariaveis(pedidoTyped, tenantNome)

    // 4. Renderizar Handlebars
    const htmlFinal = renderizarTemplate(typedTemplate.conteudo_html, variaveis)

    // 5. Gerar PDF (ou HTML fallback)
    const { buffer, isPdf } = await gerarPdfBuffer(htmlFinal)

    // 6. Salvar no storage e criar anexo (conforme spec: salvar_como_anexo sempre true)
    const nomeArquivo = gerarNomeArquivoPdf(typedTemplate.nome, pedidoTyped.numero_pedido)
    const uuid: string = randomUUID()
    const storageKey = resolverStorageKey(tenantId, pedido_id, uuid, nomeArquivo)
    salvarArquivoLocal(buffer, storageKey)

    let anexoId: string = uuid
    if (salvar_como_anexo) {
      const anexo = await db.pedidoAnexo.create({
        data: {
          id: uuid,
          tenant_id: tenantId,
          vinculo: 'pedido',
          vinculo_id: pedido_id,
          nome_arquivo: nomeArquivo,
          tipo_arquivo: isPdf ? 'application/pdf' : 'text/html',
          tamanho_bytes: buffer.length,
          categoria: 'PDF Gerado',
          descricao: `Gerado a partir do template: ${typedTemplate.nome}`,
          storage_key: storageKey,
          uploaded_by: userId,
        },
      } as Parameters<typeof db.pedidoAnexo.create>[0])

      anexoId = (anexo as { id: string }).id
    }

    // 7. Retornar resultado
    res.json({
      url_download: `/api/v1/pedidos/anexos/${anexoId}/download`,
      anexo_id: anexoId,
    })
  } catch (err) {
    next(err)
  }
})
