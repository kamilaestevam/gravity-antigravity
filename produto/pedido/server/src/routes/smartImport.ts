/**
 * smartImport.ts — Rotas de importacao inteligente de pedidos
 *
 * Rota base: /api/v1/pedidos/smart-import
 *
 * Endpoints:
 *   POST /api/v1/pedidos/smart-import/analisar      — upload multipart, parse, mock IA
 *   POST /api/v1/pedidos/smart-import/confirmar     — aplicar decisoes, criar/atualizar pedidos
 *   GET  /api/v1/pedidos/smart-import/mapeamento/:hash — mapeamento salvo por hash
 *
 * Seguranca:
 *   - Validacao de extensao e tamanho (max 10MB) via multer
 *   - Zod em todas as rotas POST
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - preview_id validado contra tenant (SEC.3)
 */

import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'
import { SmartImportService, criarSmartImportService } from '../services/smartImportService.js'
import { MapeamentoMemoriaService } from '../services/mapeamentoMemoriaService.js'

export const smartImportRouter = Router()

// ── Rate limit: máximo 10 uploads por tenant por minuto ───────────────────────

const uploadRateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(tenantId: string): boolean {
  const now = Date.now()
  const entry = uploadRateLimit.get(tenantId)
  if (!entry || now > entry.resetAt) {
    uploadRateLimit.set(tenantId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

// ── Constantes ────────────────────────────────────────────────────────────────

const EXTENSOES_ACEITAS = new Set(['xlsx', 'xls', 'csv', 'xml', 'txt', 'json', 'pdf'])

// ── Multer config ─────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — valida DURANTE o stream
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? ''
    if (EXTENSOES_ACEITAS.has(ext)) {
      cb(null, true)
    } else {
      cb(new AppError(`Formato .${ext} nao suportado`, 400, 'FORMATO_INVALIDO'))
    }
  },
})

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const ColunaMapeadaSchema = z.object({
  coluna_arquivo: z.string(),
  campo_sistema:  z.string().nullable(),
  confianca:      z.number().min(0).max(100),
  nivel:          z.enum(['auto', 'confirmado', 'manual', 'ignorado']),
  inferido_por:   z.enum(['ia', 'dados', 'memoria', 'usuario']),
})

const LinhaSchema = z.object({
  linha_arquivo: z.number(),
  numero_pedido: z.string().nullable(),
  status:        z.enum(['ok', 'aviso', 'erro']),
  alertas:       z.array(z.unknown()),
  dados:         z.record(z.unknown()),
})

const ConfirmarSchema = z.object({
  preview_id:            z.string().min(1),
  mapeamento_confirmado: z.array(ColunaMapeadaSchema),
  decisoes_duplicatas:   z.record(z.enum(['sobrescrever', 'criar', 'pular'])),
  linhas_incluidas:      z.array(z.number().int()),
  salvar_mapeamento:     z.boolean(),
  numeros_editados:      z.record(z.coerce.number(), z.string()).optional(),
  linhas:                z.array(LinhaSchema).optional(),
})

// ── GET /template — Download de planilha modelo ───────────────────────────────

smartImportRouter.get('/template', (_req: Request, res: Response, next: NextFunction) => {
  try {
    import('xlsx').then(XLSX => {
      const cabecalhos = [
        'PO Number', 'Supplier', 'Manufacturer', 'Incoterms', 'Currency',
        'Order Date', 'Ship Date', 'Part Number', 'NCM', 'Description',
        'Qty', 'Unit', 'Unit Price', 'Total Value',
      ]
      const exemplos = [
        'PO-2026/001', 'Supplier Name Ltd.', 'Manufacturer Co.', 'FOB', 'USD',
        '2026-01-15', '2026-03-01', 'PART-001', '8471.30.19', 'Product description',
        '100', 'UN', '10.50', '1050.00',
      ]
      const ws = XLSX.utils.aoa_to_sheet([cabecalhos, exemplos])
      ws['!cols'] = cabecalhos.map(() => ({ wch: 20 }))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template-importacao-pedidos.xlsx"',
        'Content-Length': String(buf.length),
      })
      res.send(buf)
    }).catch(next)
  } catch (err) {
    next(err)
  }
})

// ── POST /analisar ─────────────────────────────────────────────────────────────

smartImportRouter.post('/analisar', upload.single('arquivo'), async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as Request & { tenantId: string }).tenantId

  if (!checkRateLimit(tenantId)) {
    return res.status(429).json({
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas importacoes em pouco tempo. Aguarde 1 minuto.' },
    })
  }

  try {
    if (!req.file) {
      throw new AppError('Arquivo nao encontrado', 400, 'ARQUIVO_AUSENTE')
    }

    const buffer      = req.file.buffer
    const nomeArquivo = req.file.originalname

    // Validar magic bytes para PDF — rejeitar HTMLs com extensao .pdf
    const ext = nomeArquivo.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      const magic = buffer.slice(0, 5).toString('ascii')
      if (!magic.startsWith('%PDF')) {
        throw new AppError(
          'Este arquivo nao e um PDF valido. Arquivos salvos como pagina web (.html) nao sao aceitos. Use Excel ou CSV.',
          400,
          'PDF_INVALIDO',
        )
      }
    }

    // FEAT.8 — Detectar multiplas planilhas
    const { listarPlanilhas } = await import('../services/importEngine.js')
    const planilhas = await listarPlanilhas(buffer, nomeArquivo)
    const nomePlanilha = (req.query.sheet as string) || undefined

    // Se tem multiplas planilhas e nenhuma foi especificada, retornar lista
    if (planilhas.length > 1 && !nomePlanilha) {
      return res.json({ multiplas_planilhas: true, planilhas, preview: null })
    }

    const db      = (req as Request & { prisma: Record<string, unknown> }).prisma
    const service = criarSmartImportService(db)
    const preview = await service.analisar(tenantId, buffer, nomeArquivo, nomePlanilha)

    res.json(preview)
  } catch (err) {
    next(err)
  }
})

// ── POST /confirmar ────────────────────────────────────────────────────────────

smartImportRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dados invalidos',
        details: parse.error.flatten(),
      },
    })
  }

  const tenantId  = (req as Request & { tenantId: string }).tenantId
  const companyId = (req.headers['x-company-id'] as string | undefined) ?? tenantId

  // SEC.3 — Validar que o preview_id pertence ao tenant da requisicao
  if (!parse.data.preview_id.startsWith(tenantId + '-')) {
    return res.status(403).json({
      error: { code: 'UNAUTHORIZED_PREVIEW', message: 'Preview nao pertence a este tenant' },
    })
  }

  const userId = (req as Request & { userId: string }).userId ?? 'system'
  const db     = (req as Request & { prisma: Record<string, unknown> }).prisma

  try {
    const service   = criarSmartImportService(db)
    const resultado = await service.confirmar(tenantId, userId, parse.data, companyId)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// ── GET /mapeamento/:hash ──────────────────────────────────────────────────────

smartImportRouter.get('/mapeamento/:hash', async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as Request & { tenantId: string }).tenantId
  const hash     = req.params.hash

  if (!hash || hash.length < 4) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Hash de colunas invalido' },
    })
  }

  const db = (req as Request & { prisma: Record<string, unknown> }).prisma

  try {
    const service    = new MapeamentoMemoriaService(db)
    const mapeamento = await service.buscar(tenantId, hash)
    res.json(mapeamento ?? null)
  } catch (err) {
    next(err)
  }
})

// ── GET /campos ────────────────────────────────────────────────────────────────

smartImportRouter.get('/campos', async (req: Request, res: Response, next: NextFunction) => {
  const camposPadrao = [
    { valor: 'numero_pedido',        rotulo: 'Numero do Pedido'     },
    { valor: 'tipo_operacao',        rotulo: 'Tipo de Operacao'     },
    { valor: 'exportador',           rotulo: 'Exportador (Shipper)' },
    { valor: 'fabricante',           rotulo: 'Fabricante'           },
    { valor: 'incoterm',             rotulo: 'Incoterm'             },
    { valor: 'moeda_pedido',         rotulo: 'Moeda'                },
    { valor: 'data_emissao_pedido',  rotulo: 'Data Emissão do Pedido' },
    { valor: 'data_embarque',        rotulo: 'Data de Embarque'     },
    { valor: 'part_number',          rotulo: 'Part Number'          },
    { valor: 'ncm',                  rotulo: 'NCM'                  },
    { valor: 'descricao_item',        rotulo: 'Descricao do Item'    },
    { valor: 'quantidade_inicial_item_pedido', rotulo: 'Quantidade'           },
    { valor: 'unidade',              rotulo: 'Unidade'              },
    { valor: 'valor_por_unidade_item', rotulo: 'Valor Unitario'       },
    { valor: 'valor_total_item',     rotulo: 'Valor Total Item'     },
  ]

  const tenantId = (req as Request & { tenantId: string }).tenantId
  const db = (req as Request & { prisma: Record<string, unknown> }).prisma

  try {
    // P1.7 — Incluir colunas customizadas do tenant
    const colunasCustom = await (db as Record<string, any>)['colunaUsuarioPedido'].findMany({
      where: { tenant_id: tenantId, ativo: true },
      select: { chave: true, nome: true },
      orderBy: { ordem: 'asc' },
    }).catch(() => [] as { chave: string; nome: string }[])

    const camposCustom = (colunasCustom as { chave: string; nome: string }[]).map(c => ({
      valor: `custom_${c.chave}`,
      rotulo: `${c.nome} (personalizado)`,
    }))

    res.json([...camposPadrao, ...camposCustom])
  } catch (err) {
    next(err)
  }
})

// ── POST /mapeamento/salvar ────────────────────────────────────────────────────

const SalvarMapeamentoSchema = z.object({
  hash_colunas: z.string().min(4),
  mapeamento:   z.array(ColunaMapeadaSchema),
})

smartImportRouter.post('/mapeamento/salvar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = SalvarMapeamentoSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: parse.error.flatten() },
    })
  }
  const tenantId = (req as Request & { tenantId: string }).tenantId
  const db       = (req as Request & { prisma: Record<string, unknown> }).prisma
  try {
    const service = new MapeamentoMemoriaService(db)
    await service.salvar(tenantId, parse.data.hash_colunas, parse.data.mapeamento)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ── POST /reverter — Rollback de importacao (FEAT.3) ─────────────────────────

const ReverterSchema = z.object({
  ids_criados: z.array(z.string().min(1)).min(1).max(500),
})

smartImportRouter.post('/reverter', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ReverterSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: parse.error.flatten() },
    })
  }
  const tenantId = (req as Request & { tenantId: string }).tenantId
  const db = (req as Request & { prisma: Record<string, unknown> }).prisma
  try {
    // Cancelar pedidos (soft delete via status) garantindo tenant isolation
    const resultado = await (db as Record<string, any>)['pedido'].updateMany({
      where: {
        id: { in: parse.data.ids_criados },
        tenant_id: tenantId,
        status: 'draft', // Só reverter rascunhos — pedidos abertos nao podem ser revertidos
      },
      data: { status: 'cancelado' },
    })
    res.json({ revertidos: resultado.count, ids: parse.data.ids_criados })
  } catch (err) {
    next(err)
  }
})

// ── Error handler local ───────────────────────────────────────────────────────

smartImportRouter.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  console.error('[SmartImport]', err.message)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
})
