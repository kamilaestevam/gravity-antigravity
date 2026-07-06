/**
 * template-pedido.ts — Rotas de Template do Pedido (geração de PDF/documentos)
 *
 * Rota base: /api/v1/pedidos/template-pedido
 *
 * Endpoints:
 *   GET  /api/v1/pedidos/template-pedido                       — Lista templates disponíveis do tenant
 *   POST /api/v1/pedidos/template-pedido/gerar                 — Gera PDF a partir de template e salva como anexo
 *   POST /api/v1/pedidos/template-pedido/documentos/gerar      — Gera documento por idioma/tipo
 *
 * Fluxo do POST /gerar:
 *   1. Buscar pedido + itens com id_organizacao
 *   2. Buscar template com id_organizacao
 *   3. Compilar variáveis (pedido, itens, colunas do usuário)
 *   4. Renderizar Handlebars
 *   5. Gerar PDF (Puppeteer ou fallback HTML)
 *   6. Salvar no storage + criar registro PedidoAnexo
 *   7. Retornar url_download + id_anexo_pedido
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
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
import {
  montarDadosDocumentoComercialPedido,
  montarHtmlDocumentoComercialPedido,
  NOME_ARQUIVO_DOCUMENTO_COMERCIAL,
  type TipoDocumentoComercialPedido,
  type IdiomaDocumentoPedido,
} from '../services/documentos-comerciais-pedido.js'
import { exigirPermissao } from '../permissoes.js'

export const templatePedidoRota = Router()

/** Geração/listagem na Lista — exige lista:editar / lista:ver (não configuracao:editar). */
const exigirListaVer = exigirPermissao('lista', 'ver')
const exigirListaEditar = exigirPermissao('lista', 'editar')

// ── ACL: PedidoItem DDD → shape legado consumido por pdfService ──────────────
// pdfService consome chaves antigas (part_number, descricao_item, ncm, etc.).
// Traduzimos uma única vez aqui para isolar a refatoração de colunas no banco.
interface ItemLegacyParaPdf {
  part_number: string
  descricao_item: string
  ncm: string
  quantidade_atual_pedido: number
  quantidade_inicial_pedido: number
  [key: string]: unknown
}

interface PedidoLegacyParaPdf {
  numero_pedido: string
  tipo_operacao: string
  nome_exportador?: string | null
  nome_fabricante?: string | null
  incoterm?: string | null
  data_emissao_pedido: string
  valor_total_pedido?: number | null
  quantidade_total_pedido?: number | null
  itens: ItemLegacyParaPdf[]
  [key: string]: unknown
}

function mapearPedidoParaPdfService(pedido: Record<string, unknown>): PedidoLegacyParaPdf {
  const itens = (pedido.itens_pedido ?? []) as Array<Record<string, unknown>>
  const itensLegado = itens.map((it) => ({
    part_number:                 String(it.part_number_item ?? ''),
    descricao_item:              String(it.descricao_item ?? ''),
    ncm:                         String(it.ncm_item ?? ''),
    quantidade_atual_pedido:     Number(it.quantidade_atual_item ?? 0),
    quantidade_inicial_pedido:   Number(it.quantidade_inicial_item ?? 0),
    unidade_comercializada_item: it.unidade_comercializada_item,
    moeda_item:                  it.moeda_item,
    valor_por_unidade_item:      it.valor_por_unidade_item != null ? Number(it.valor_por_unidade_item) : null,
    valor_total_item:            it.valor_total_item != null ? Number(it.valor_total_item) : null,
  }))
  const detalhes = (pedido.detalhes_operacionais_pedido ?? pedido.detalhes_operacionais ?? {}) as Record<string, unknown>
  const dataEmissao = pedido.data_emissao_pedido instanceof Date
    ? pedido.data_emissao_pedido.toISOString()
    : String(pedido.data_emissao_pedido ?? '')
  return {
    ...pedido,
    numero_pedido: String(pedido.numero_pedido ?? ''),
    tipo_operacao: String(pedido.tipo_operacao_pedido ?? pedido.tipo_operacao ?? ''),
    nome_exportador: (detalhes.nome_exportador as string | null | undefined) ?? null,
    nome_fabricante: (detalhes.nome_fabricante as string | null | undefined) ?? null,
    incoterm: (pedido.incoterm_pedido as string | null | undefined) ?? null,
    data_emissao_pedido: dataEmissao,
    valor_total_pedido: (pedido.valor_total_pedido as number | null | undefined) ?? null,
    quantidade_total_pedido: (pedido.quantidade_total_pedido as number | null | undefined) ?? null,
    itens: itensLegado,
  }
}

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
  tipo_documento: z.enum([
    'pedido_de_compra',
    'pedido_de_venda',
    'proforma_invoice',
    'invoice',
    'packing_list',
    'certificado_origem',
  ]),
  idioma: z.enum(['pt', 'en', 'es', 'zh', 'ja', 'ar']),
  salvar_como_anexo: z.boolean().default(true),
  /** IDs de itens selecionados na lista — quando presente, o documento sai só com esses itens. */
  item_ids: z.array(z.string().min(1)).min(1).optional(),
})

// ── GET / — Lista templates do tenant ────────────────────────────────────────

templatePedidoRota.get('/', exigirListaVer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db            = rawDb as any
      const idOrganizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const templates = await db.pedidoTemplate.findMany({
        where:   { id_organizacao: idOrganizacao },
        orderBy: { nome_template_pedido: 'asc' },
      })

      res.json(templates)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /gerar — Gera PDF a partir de template ──────────────────────────────

templatePedidoRota.post('/gerar', exigirListaEditar, async (req: Request, res: Response, next: NextFunction) => {
  const bodyParse = GerarPdfSchema.safeParse(req.body)
  if (!bodyParse.success) {
    return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
  }

  const { pedido_id, template_id, salvar_como_anexo } = bodyParse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db            = rawDb as any
      const ctx           = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario ?? 'system'

      // 1. Buscar pedido com itens
      const pedido = await db.pedido.findFirst({
        where:   { id_pedido: pedido_id, id_organizacao: idOrganizacao },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      if (!pedido) {
        throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
      }

      // 2. Buscar template
      const template = await db.pedidoTemplate.findFirst({
        where: { id_template_pedido: template_id, id_organizacao: idOrganizacao },
      })

      if (!template) {
        throw new AppError('Template não encontrado', 404, 'NOT_FOUND')
      }

      const typedTemplate = template as {
        nome_template_pedido: string
        conteudo_html_template_pedido: string
      }

      // 3. Compilar variáveis — ACL: traduz itens DDD → shape legado consumido por pdfService
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidoTyped = mapearPedidoParaPdfService(pedido as any)

      // Tenant nome — usar variável de ambiente ou padrão
      const tenantNome = process.env.TENANT_NOME ?? idOrganizacao

      const variaveis = compilarVariaveis(pedidoTyped, tenantNome)

      // 4. Renderizar Handlebars
      const htmlFinal = renderizarTemplate(typedTemplate.conteudo_html_template_pedido, variaveis)

      // 5. Gerar PDF (ou HTML fallback)
      const { buffer, isPdf } = await gerarPdfBuffer(htmlFinal)

      // 6. Salvar no storage e criar anexo (conforme spec: salvar_como_anexo sempre true)
      const nomeArquivo = gerarNomeArquivoPdf(typedTemplate.nome_template_pedido, pedidoTyped.numero_pedido)
      const uuid: string = randomUUID()
      const storageKey = resolverStorageKey(idOrganizacao, pedido_id, uuid, nomeArquivo)
      salvarArquivoLocal(buffer, storageKey)

      let anexoId: string = uuid
      if (salvar_como_anexo) {
        const anexo = await db.pedidoAnexo.create({
          data: {
            id_anexo_pedido:             uuid,
            id_organizacao:              idOrganizacao,
            vinculo_anexo_pedido:        'pedido',
            id_vinculo_anexo_pedido:     pedido_id,
            nome_arquivo_anexo_pedido:   nomeArquivo,
            tipo_arquivo_anexo_pedido:   isPdf ? 'application/pdf' : 'text/html',
            tamanho_bytes_anexo_pedido:  buffer.length,
            categoria_anexo_pedido:      'PDF Gerado',
            descricao_anexo_pedido:      `Gerado a partir do template: ${typedTemplate.nome_template_pedido}`,
            chave_storage_anexo_pedido:  storageKey,
            enviado_por_anexo_pedido:    idUsuario,
          },
        })

        anexoId = (anexo as { id_anexo_pedido: string }).id_anexo_pedido
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

// ── POST /documentos/gerar — Gera documento por idioma/tipo ──────────────────

templatePedidoRota.post('/documentos/gerar', exigirListaEditar, async (req: Request, res: Response, next: NextFunction) => {
  const bodyParse = GerarDocumentoSchema.safeParse(req.body)
  if (!bodyParse.success) {
    return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
  }

  const { pedido_id, tipo_documento, idioma, salvar_como_anexo, item_ids } = bodyParse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db            = rawDb as any
      const ctx           = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario ?? 'system'

      // 1. Buscar pedido com itens (filtrados pela seleção quando item_ids veio no payload)
      const pedido = await db.pedido.findFirst({
        where:   { id_pedido: pedido_id, id_organizacao: idOrganizacao },
        include: {
          itens_pedido: {
            ...(item_ids ? { where: { id_item: { in: item_ids } } } : {}),
            orderBy: { sequencia_item_pedido: 'asc' },
          },
        },
      })

      if (!pedido) {
        throw new AppError('Pedido não encontrado', 404, 'NOT_FOUND')
      }

      const itensDoPedido = (pedido as { itens_pedido?: unknown[] }).itens_pedido ?? []
      if (item_ids && itensDoPedido.length === 0) {
        throw new AppError('Nenhum item selecionado pertence a este pedido', 400, 'ITENS_NAO_ENCONTRADOS')
      }

      // 2. Montar HTML do documento comercial (layout real por tipo/idioma)
      const tipoDocumento = tipo_documento as TipoDocumentoComercialPedido
      const idiomaDocumento = idioma as IdiomaDocumentoPedido
      const nomeOrganizacao = process.env.TENANT_NOME ?? idOrganizacao
      const dadosDocumento = montarDadosDocumentoComercialPedido(
        pedido as Record<string, unknown>,
        nomeOrganizacao,
      )
      const htmlFinal = montarHtmlDocumentoComercialPedido(tipoDocumento, idiomaDocumento, dadosDocumento)
      const templateNome = NOME_ARQUIVO_DOCUMENTO_COMERCIAL[tipoDocumento]

      // 3. Gerar PDF (ou HTML fallback)
      const { buffer, isPdf } = await gerarPdfBuffer(htmlFinal)

      // 4. Salvar no storage e criar anexo
      const nomeArquivo = gerarNomeArquivoPdf(`${templateNome}-${idioma}`, dadosDocumento.numero_pedido)
      const uuid: string = randomUUID()
      const storageKey = resolverStorageKey(idOrganizacao, pedido_id, uuid, nomeArquivo)
      salvarArquivoLocal(buffer, storageKey)

      let anexoId: string = uuid
      if (salvar_como_anexo) {
        const anexo = await db.pedidoAnexo.create({
          data: {
            id_anexo_pedido:             uuid,
            id_organizacao:              idOrganizacao,
            vinculo_anexo_pedido:        'pedido',
            id_vinculo_anexo_pedido:     pedido_id,
            nome_arquivo_anexo_pedido:   nomeArquivo,
            tipo_arquivo_anexo_pedido:   isPdf ? 'application/pdf' : 'text/html',
            tamanho_bytes_anexo_pedido:  buffer.length,
            categoria_anexo_pedido:      'Documento Gerado',
            descricao_anexo_pedido:      `${templateNome} — idioma: ${idioma}`,
            chave_storage_anexo_pedido:  storageKey,
            enviado_por_anexo_pedido:    idUsuario,
          },
        })

        anexoId = (anexo as { id_anexo_pedido: string }).id_anexo_pedido
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
