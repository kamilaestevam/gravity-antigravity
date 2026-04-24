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
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'
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

const GerarDocumentoSchema = z.object({
  pedido_id: z.string().min(1),
  tipo_documento: z.enum(['pedido_de_venda', 'proforma_invoice', 'invoice']),
  idioma: z.enum(['pt', 'en', 'es', 'zh', 'ja', 'ar']),
  salvar_como_anexo: z.boolean().default(true),
})

// ── GET /pdf/templates ────────────────────────────────────────────────────────

pdfRouter.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const templates = await db.pedidoTemplatePdf.findMany({
        where: { id_organizacao: tenantId },
        orderBy: { nome_template_pedido_pdf: 'asc' },
      })

      res.json(templates)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /pdf/gerar ───────────────────────────────────────────────────────────

pdfRouter.post('/gerar', async (req: Request, res: Response, next: NextFunction) => {
  const bodyParse = GerarPdfSchema.safeParse(req.body)
  if (!bodyParse.success) {
    return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
  }

  const { pedido_id, template_id, salvar_como_anexo } = bodyParse.data

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { tenant: TenantContext }).tenant
      const tenantId = ctx.tenantId
      const userId   = ctx.userId ?? 'system'

      // 1. Buscar pedido com itens
      const pedido = await db.pedido.findFirst({
        where: { id: pedido_id, tenant_id: tenantId },
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
      })

      if (!pedido) {
        throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
      }

      // 2. Buscar template
      const template = await db.pedidoTemplatePdf.findFirst({
        where: { id_template_pedido_pdf: template_id, id_organizacao: tenantId },
      })

      if (!template) {
        throw new AppError('Template não encontrado', 404, 'NOT_FOUND')
      }

      const typedTemplate = template as {
        nome_template_pedido_pdf: string
        conteudo_html_template_pedido_pdf: string
      }

      // 3. Compilar variáveis
      const pedidoTyped = pedido as {
        numero_pedido: string
        tipo_operacao: string
        nome_exportador?: string | null
        nome_fabricante?: string | null
        incoterm?: string | null
        moeda_pedido: string
        data_emissao_pedido: string
        valor_total_pedido?: number | null
        quantidade_total_pedido?: number | null
        itens: Array<{
          part_number: string
          descricao_item: string
          ncm: string
          quantidade_atual_pedido: number
          quantidade_inicial_pedido: number
          unidade_comercializada_item?: string | null
          moeda_item: string
          valor_por_unidade_item?: number | null
          valor_total_item?: number | null
        }>
        [key: string]: unknown
      }

      // Tenant nome — usar variável de ambiente ou padrão
      const tenantNome = process.env.TENANT_NOME ?? tenantId

      const variaveis = compilarVariaveis(pedidoTyped, tenantNome)

      // 4. Renderizar Handlebars
      const htmlFinal = renderizarTemplate(typedTemplate.conteudo_html_template_pedido_pdf, variaveis)

      // 5. Gerar PDF (ou HTML fallback)
      const { buffer, isPdf } = await gerarPdfBuffer(htmlFinal)

      // 6. Salvar no storage e criar anexo (conforme spec: salvar_como_anexo sempre true)
      const nomeArquivo = gerarNomeArquivoPdf(typedTemplate.nome_template_pedido_pdf, pedidoTyped.numero_pedido)
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
            descricao: `Gerado a partir do template: ${typedTemplate.nome_template_pedido_pdf}`,
            storage_key: storageKey,
            uploaded_by: userId,
          },
        })

        anexoId = (anexo as { id: string }).id
      }

      // 7. Retornar resultado
      res.json({
        url_download: `/api/v1/pedidos/anexos/${anexoId}/download`,
        anexo_id: anexoId,
        is_pdf: isPdf,
      })
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /documentos/gerar ────────────────────────────────────────────────────
// Rota base registrada em /api/v1/pedidos — acesso via /api/v1/pedidos/documentos/gerar

pdfRouter.post('/documentos/gerar', async (req: Request, res: Response, next: NextFunction) => {
  const bodyParse = GerarDocumentoSchema.safeParse(req.body)
  if (!bodyParse.success) {
    return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
  }

  const { pedido_id, tipo_documento, idioma, salvar_como_anexo } = bodyParse.data

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { tenant: TenantContext }).tenant
      const tenantId = ctx.tenantId
      const userId   = ctx.userId ?? 'system'

      // 1. Buscar pedido com itens
      const pedido = await db.pedido.findFirst({
        where: { id: pedido_id, tenant_id: tenantId },
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
      })

      if (!pedido) {
        throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
      }

      const pedidoTyped = pedido as {
        numero_pedido: string
        tipo_operacao: string
        nome_exportador?: string | null
        nome_fabricante?: string | null
        incoterm?: string | null
        moeda_pedido: string
        data_emissao_pedido: string
        valor_total_pedido?: number | null
        quantidade_total_pedido?: number | null
        itens: Array<{
          part_number: string
          descricao_item: string
          ncm: string
          quantidade_atual_pedido: number
          quantidade_inicial_pedido: number
          unidade_comercializada_item?: string | null
          moeda_item: string
          valor_por_unidade_item?: number | null
          valor_total_item?: number | null
        }>
      }

      // 2. Selecionar template Handlebars baseado no tipo_documento
      const templateMap: Record<string, string> = {
        pedido_de_venda:  'purchase-order',
        proforma_invoice: 'proforma-invoice',
        invoice:          'commercial-invoice',
      }
      const templateNome = templateMap[tipo_documento]

      // 3. Compilar variáveis passando o idioma ao contexto
      const tenantNome = process.env.TENANT_NOME ?? tenantId
      const variaveis = compilarVariaveis(pedidoTyped, tenantNome)
      const variaveisComIdioma = { ...variaveis as Record<string, unknown>, idioma, tipo_documento }

      // 4. Renderizar template (fallback: HTML inline mínimo se template não existir)
      const htmlFallback = `<h1>${templateNome}</h1><p>${pedidoTyped.numero_pedido}</p><p>Lang: ${idioma}</p>`
      const htmlFinal = renderizarTemplate(htmlFallback, variaveisComIdioma)

      // 5. Gerar PDF (ou HTML fallback)
      const { buffer, isPdf } = await gerarPdfBuffer(htmlFinal)

      // 6. Salvar no storage e criar anexo
      const nomeArquivo = gerarNomeArquivoPdf(templateNome, pedidoTyped.numero_pedido)
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
            categoria: 'Documento Gerado',
            descricao: `${templateNome} — idioma: ${idioma}`,
            storage_key: storageKey,
            uploaded_by: userId,
          },
        })

        anexoId = (anexo as { id: string }).id
      }

      res.json({
        url_download: `/api/v1/pedidos/anexos/${anexoId}/download`,
        anexo_id: anexoId,
        is_pdf: isPdf,
      })
    })
  } catch (err) {
    next(err)
  }
})
