/**
 * smartImport.ts — Rotas de importacao inteligente de pedidos
 *
 * Rota base: /api/v1/pedidos/importacoes-inteligentes
 *
 * Endpoints:
 *   POST /api/v1/pedidos/importacoes-inteligentes/analisar                              — upload multipart, parse, mock IA
 *   POST /api/v1/pedidos/importacoes-inteligentes/confirmar                             — aplicar decisoes, criar/atualizar pedidos
 *   GET  /api/v1/pedidos/importacoes-inteligentes/mapeamentos/:hash_mapeamento          — mapeamento salvo por hash
 *   POST /api/v1/pedidos/importacoes-inteligentes/mapeamentos                           — salva mapeamento
 *   POST /api/v1/pedidos/importacoes-inteligentes/reverter                              — rollback de importacao
 *   GET  /api/v1/pedidos/importacoes-inteligentes/template                              — planilha modelo
 *   GET  /api/v1/pedidos/importacoes-inteligentes/campos                                — campos do sistema
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
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { AppError } from '../errors/AppError.js'
import { SmartImportService, criarSmartImportService } from '../services/smartImportService.js'
import { MapeamentoMemoriaService } from '../services/mapeamentoMemoriaService.js'
import { smartImportPreviewSchema } from '../../../shared/smart-import-schemas.js'
import {
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
  FORMATO_EXCEL_POR_TIPO,
  type CampoPedidoDDD,
} from '../../../shared/campos-pedido-ddd.js'

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
// Cobertura 100% dos campos preenchiveis de Pedido + PedidoItem (SSOT em
// `produto/pedido/shared/campos-pedido-ddd.ts`). Layout master-detail:
//   - Linha 1 (super-header): "PEDIDO" mesclado | "ITEM" mesclado
//   - Linha 2 (sub-header):   rotulos canonical PT-BR (REGRA 9 do DDD)
//   - Linha 3 (exemplo Pedido, vazia): negrito, formato pre-aplicado
//   - Linha 4 (exemplo Item, vazia):   regular, formato pre-aplicado
//
// Padrao visual identico ao exportarExcel() do frontend (exportUtils.ts):
//   Header: fundo #1e3256, fonte Calibri 11 bold azul #38bdf8, centralizado.
//
// O usuario preenche linha do Pedido (master, em negrito) e linhas de Item
// (detail) abaixo, espelhando a tabela do app. Para o segundo Pedido, repete
// o mesmo padrao.

/**
 * Handler exportado para registro DIRETO em index.ts ANTES de resolverOrganizacao.
 * O link `<a download>` no frontend nao envia JWT, entao a rota precisa ficar fora
 * do middleware de auth (esta no whitelist do requireInternalKey, e o proxy do Vite
 * injeta x-chave-interna-servico).
 *
 * Em index.ts:
 *   app.get('/api/v1/pedidos/importacoes-inteligentes/template', templateHandler)
 *   // ... DEPOIS:
 *   app.use(resolverOrganizacao(...))
 */
export const templateHandler = (_req: Request, res: Response, next: NextFunction) => {
  import('exceljs').then(async ({ default: ExcelJS }) => {
    // Lista combinada na ordem: Pedido primeiro, Item depois.
    const camposOrdenados: CampoPedidoDDD[] = [...CAMPOS_PEDIDO_DDD, ...CAMPOS_ITEM_DDD]
    const totalPedido = CAMPOS_PEDIDO_DDD.length
    const totalItem   = CAMPOS_ITEM_DDD.length

    const wb = new ExcelJS.Workbook()
    wb.creator = 'Gravity Platform'
    wb.created = new Date()

    const ws = wb.addWorksheet('Pedidos', { views: [{ showGridLines: true, state: 'frozen', ySplit: 2 }] })

    // Largura por coluna — minimo 18, max length(rotulo) + 4
    ws.columns = camposOrdenados.map(c => ({
      key:   c.campo,
      width: Math.max(c.rotulo.length + 4, 18),
    }))

    // ── Linha 1 — Super-header: PEDIDO | ITEM ─────────────────────────────────
    ws.addRow([])
    ws.getRow(1).height = 24
    // Mesclar colunas 1..totalPedido como "PEDIDO"
    ws.mergeCells(1, 1, 1, totalPedido)
    const cellPedido = ws.getCell(1, 1)
    cellPedido.value = 'PEDIDO'
    cellPedido.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f172a' } }
    cellPedido.font  = { name: 'Calibri', bold: true, size: 13, color: { argb: 'FF38bdf8' } }
    cellPedido.alignment = { horizontal: 'center', vertical: 'middle' }
    // Mesclar colunas (totalPedido+1)..(totalPedido+totalItem) como "ITEM"
    ws.mergeCells(1, totalPedido + 1, 1, totalPedido + totalItem)
    const cellItem = ws.getCell(1, totalPedido + 1)
    cellItem.value = 'ITEM'
    cellItem.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f172a' } }
    cellItem.font  = { name: 'Calibri', bold: true, size: 13, color: { argb: 'FFa78bfa' } }
    cellItem.alignment = { horizontal: 'center', vertical: 'middle' }

    // ── Linha 2 — Sub-header: rotulos PT-BR canonical ─────────────────────────
    const subHeader = ws.addRow(camposOrdenados.map(c => c.rotulo))
    subHeader.height = 22
    subHeader.eachCell(cell => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3256' } }
      cell.font      = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FF38bdf8' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border    = { bottom: { style: 'medium', color: { argb: 'FF38bdf8' } } }
    })

    // ── Aplicar numFmt por coluna conforme tipo do campo (data, numero) ───────
    camposOrdenados.forEach((c, idx) => {
      const numFmt = FORMATO_EXCEL_POR_TIPO[c.tipo]
      if (numFmt) {
        ws.getColumn(idx + 1).numFmt = numFmt
      }
    })

    // ── Data validation (dropdowns) para campos tipo 'select' ─────────────────
    // Aplica do row 3 ate 1000 (margem para o usuario adicionar linhas).
    camposOrdenados.forEach((c, idx) => {
      if (c.tipo === 'select' && c.opcoesSelect && c.opcoesSelect.length > 0) {
        const colLetter = ws.getColumn(idx + 1).letter
        const opcoes = c.opcoesSelect.map(o => `"${o}"`).join(',')
        // Aplica em cada celula da faixa 3:1000 — eachCell + dataValidation
        for (let row = 3; row <= 1000; row++) {
          ws.getCell(`${colLetter}${row}`).dataValidation = {
            type:           'list',
            allowBlank:     false,
            formulae:       [`"${c.opcoesSelect.join(',')}"`],
            showErrorMessage: true,
            errorStyle:     'error',
            errorTitle:     'Valor invalido',
            error:          `Valores aceitos: ${c.opcoesSelect.join(', ')}`,
          }
        }
      }
    })

    // ── Linha 3 — Exemplo de Pedido (vazia, em negrito) ───────────────────────
    const linhaPedidoExemplo = ws.addRow([])
    linhaPedidoExemplo.height = 20
    linhaPedidoExemplo.font   = { name: 'Calibri', bold: true, size: 11 }

    // ── Linha 4 — Exemplo de Item (vazia, regular) ────────────────────────────
    const linhaItemExemplo = ws.addRow([])
    linhaItemExemplo.height = 18
    linhaItemExemplo.font   = { name: 'Calibri', bold: false, size: 11 }

    const buf = await wb.xlsx.writeBuffer()
    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-importacao-pedidos.xlsx"',
      'Content-Length':      String((buf as unknown as Buffer).length),
    })
    res.send(buf)
  }).catch(next)
}

// Mantem a rota tambem dentro do smartImportRouter para compatibilidade S2S (chamadas
// internas com JWT). O handler standalone acima e o que serve o navegador.
smartImportRouter.get('/template', templateHandler)

// ── POST /analisar ─────────────────────────────────────────────────────────────

smartImportRouter.post('/analisar', upload.single('arquivo'), async (req: Request, res: Response, next: NextFunction) => {
  // Extrair tenantId antes de withOrganizacao — necessário para o rate limit
  const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

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

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db      = rawDb as any
      const service = criarSmartImportService(db)
      const preview = await service.analisar(tenantId, buffer, nomeArquivo, nomePlanilha)
      // REGRA 06/09 — valida contrato bilateral antes de devolver (defensive
      // serialization). Se o backend acrescentar campo novo, .parse() avisa
      // imediatamente em vez de bug silencioso no client.
      const validated = smartImportPreviewSchema.parse(preview)
      res.json(validated)
    })
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

  // SEC.3 — Validar que o preview_id pertence ao tenant da requisicao
  const tenantId  = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao
  const companyId = (req.headers['x-id-workspace'] as string | undefined) ?? tenantId

  if (!parse.data.preview_id.startsWith(tenantId + '-')) {
    return res.status(403).json({
      error: { code: 'UNAUTHORIZED_PREVIEW', message: 'Preview nao pertence a este tenant' },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db     = rawDb as any
      const userId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idUsuario ?? 'system'

      const service   = criarSmartImportService(db)
      const resultado = await service.confirmar(tenantId, userId, parse.data, companyId)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /mapeamentos/:hash_mapeamento ─────────────────────────────────────────

smartImportRouter.get('/mapeamentos/:hash_mapeamento', async (req: Request, res: Response, next: NextFunction) => {
  const hash = req.params.hash_mapeamento

  if (!hash || hash.length < 4) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Hash de colunas invalido' },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const service    = new MapeamentoMemoriaService(db)
      const mapeamento = await service.buscar(tenantId, hash)
      res.json(mapeamento ?? null)
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /campos ────────────────────────────────────────────────────────────────

smartImportRouter.get('/campos', async (req: Request, res: Response, next: NextFunction) => {
  const camposPadrao = [
    { valor: 'numero_pedido',                    rotulo: 'Numero do Pedido'       },
    { valor: 'tipo_operacao',                    rotulo: 'Tipo de Operacao'       },
    { valor: 'exportador',                       rotulo: 'Exportador (Shipper)'   },
    { valor: 'fabricante',                       rotulo: 'Fabricante'             },
    { valor: 'incoterm',                         rotulo: 'Incoterm'               },
    { valor: 'moeda_pedido',                     rotulo: 'Moeda'                  },
    { valor: 'data_emissao_pedido',              rotulo: 'Data de Emissao'        },
    { valor: 'data_embarque',                    rotulo: 'Data de Embarque'       },
    { valor: 'part_number',                      rotulo: 'Part Number'            },
    { valor: 'ncm',                              rotulo: 'NCM'                    },
    { valor: 'descricao_item',                   rotulo: 'Descricao do Item'      },
    { valor: 'quantidade_inicial_pedido',   rotulo: 'Quantidade'             },
    { valor: 'unidade_comercializada_item',      rotulo: 'Unidade'                },
    { valor: 'valor_por_unidade_item',              rotulo: 'Valor do Item'          },
    { valor: 'valor_total_item',                rotulo: 'Valor Total Item'       },
  ]

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      // P1.7 — Incluir colunas customizadas do tenant
      const colunasCustom = await db.pedidoListaColunaUsuario.findMany({
        where: { id_organizacao: tenantId, ativo_coluna_usuario_pedido: true },
        select: { chave_coluna_usuario_pedido: true, nome_coluna_usuario_pedido: true },
        orderBy: { ordem_coluna_usuario_pedido: 'asc' },
      }).catch(() => [] as { chave_coluna_usuario_pedido: string; nome_coluna_usuario_pedido: string }[])

      const camposCustom = (colunasCustom as { chave_coluna_usuario_pedido: string; nome_coluna_usuario_pedido: string }[]).map((c) => ({
        valor: `custom_${c.chave_coluna_usuario_pedido}`,
        rotulo: `${c.nome_coluna_usuario_pedido} (personalizado)`,
      }))

      res.json([...camposPadrao, ...camposCustom])
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /mapeamentos ──────────────────────────────────────────────────────────

const SalvarMapeamentoSchema = z.object({
  hash_colunas: z.string().min(4),
  mapeamento:   z.array(ColunaMapeadaSchema),
})

smartImportRouter.post('/mapeamentos', async (req: Request, res: Response, next: NextFunction) => {
  const parse = SalvarMapeamentoSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const service = new MapeamentoMemoriaService(db)
      await service.salvar(tenantId, parse.data.hash_colunas, parse.data.mapeamento)
      res.json({ ok: true })
    })
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

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      // Cancelar pedidos (soft delete via status) garantindo tenant isolation
      const resultado = await db.pedido.updateMany({
        where: {
          id: { in: parse.data.ids_criados },
          tenant_id: tenantId,
          status: 'rascunho', // Só reverter rascunhos — pedidos abertos nao podem ser revertidos
        },
        data: { status: 'cancelado' },
      })
      res.json({ revertidos: resultado.count, ids: parse.data.ids_criados })
    })
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
