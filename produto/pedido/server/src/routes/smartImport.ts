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
 *   - Validacao de extensao e tamanho (max 10MB)
 *   - Zod em todas as rotas POST
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'
import { SmartImportService } from '../services/smartImportService.js'
import { MapeamentoMemoriaService } from '../services/mapeamentoMemoriaService.js'

export const smartImportRouter = Router()

// ── Constantes ────────────────────────────────────────────────────────────────

const EXTENSOES_ACEITAS = new Set(['xlsx', 'xls', 'csv', 'xml', 'txt', 'json'])
const TAMANHO_MAX_BYTES = 10 * 1024 * 1024 // 10MB

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const ColunaMapeadaSchema = z.object({
  coluna_arquivo: z.string(),
  campo_sistema:  z.string().nullable(),
  confianca:      z.number().min(0).max(100),
  nivel:          z.enum(['auto', 'confirmado', 'manual', 'ignorado']),
  inferido_por:   z.enum(['ia', 'dados', 'memoria', 'usuario']),
})

const ConfirmarSchema = z.object({
  preview_id:           z.string().min(1),
  mapeamento_confirmado: z.array(ColunaMapeadaSchema),
  decisoes_duplicatas:  z.record(z.enum(['sobrescrever', 'criar', 'pular'])),
  linhas_incluidas:     z.array(z.number().int()),
  salvar_mapeamento:    z.boolean(),
})

// ── POST /analisar ─────────────────────────────────────────────────────────────

smartImportRouter.post('/analisar', async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as Request & { tenantId: string }).tenantId

  try {
    // Ler corpo bruto do multipart (buffer)
    // A aplicacao usa express.json() globalmente; para multipart precisamos ler o raw body.
    // Como nao temos multer instalado, lemos o body como buffer via stream.
    const contentType = req.headers['content-type'] ?? ''

    if (!contentType.includes('multipart/form-data')) {
      throw new AppError('Content-Type deve ser multipart/form-data', 400, 'INVALID_CONTENT_TYPE')
    }

    const { buffer, nomeArquivo } = await lerArquivoMultipart(req)

    // Validar extensao
    const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
    if (!EXTENSOES_ACEITAS.has(ext)) {
      throw new AppError(
        `Formato .${ext} nao suportado. Use: xlsx, xls, csv, xml, txt ou json`,
        400,
        'FORMATO_INVALIDO',
      )
    }

    // Validar tamanho
    if (buffer.length > TAMANHO_MAX_BYTES) {
      throw new AppError(
        `Arquivo muito grande. Tamanho maximo: 10MB`,
        400,
        'ARQUIVO_MUITO_GRANDE',
      )
    }

    const db = (req as Request & { prisma: Record<string, unknown> }).prisma
    const service = new SmartImportService(db)
    const preview = await service.analisar(tenantId, buffer, nomeArquivo)

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
        code: 'VALIDATION_ERROR',
        message: 'Dados invalidos',
        details: parse.error.flatten(),
      },
    })
  }

  const tenantId = (req as Request & { tenantId: string }).tenantId
  const userId   = (req as Request & { userId: string }).userId ?? 'system'
  const db       = (req as Request & { prisma: Record<string, unknown> }).prisma

  try {
    const service   = new SmartImportService(db)
    const resultado = await service.confirmar(tenantId, userId, parse.data)
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

// ── Helper: ler arquivo de request multipart sem multer ──────────────────────

async function lerArquivoMultipart(
  req: Request,
): Promise<{ buffer: Buffer; nomeArquivo: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const boundary = extrairBoundary(req.headers['content-type'] ?? '')
    if (!boundary) {
      reject(new AppError('Boundary multipart nao encontrado', 400, 'INVALID_MULTIPART'))
      return
    }

    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('error', reject)
    req.on('end', () => {
      try {
        const raw    = Buffer.concat(chunks)
        const parsed = parseMultipartBody(raw, boundary)
        if (!parsed) {
          reject(new AppError('Arquivo nao encontrado no corpo da requisicao', 400, 'ARQUIVO_AUSENTE'))
          return
        }
        resolve(parsed)
      } catch (e) {
        reject(e)
      }
    })
  })
}

function extrairBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=([^;]+)/i)
  return match ? match[1].trim() : null
}

function parseMultipartBody(
  body: Buffer,
  boundary: string,
): { buffer: Buffer; nomeArquivo: string } | null {
  const delim  = Buffer.from(`\r\n--${boundary}`)
  const parts  = splitBuffer(body, delim)

  for (const part of parts) {
    const separador = Buffer.from('\r\n\r\n')
    const sepIdx    = part.indexOf(separador)
    if (sepIdx === -1) continue

    const headers    = part.slice(0, sepIdx).toString('utf-8')
    const conteudo   = part.slice(sepIdx + separador.length)

    // Remover \r\n final (delimitador multipart)
    const dadosSemFinal = conteudo.slice(
      0,
      conteudo.lastIndexOf('\r\n') === conteudo.length - 2 ? conteudo.length - 2 : conteudo.length,
    )

    const fileNameMatch = headers.match(/filename="([^"]+)"/i)
    if (!fileNameMatch) continue

    return { buffer: dadosSemFinal, nomeArquivo: fileNameMatch[1] }
  }

  return null
}

function splitBuffer(buf: Buffer, delim: Buffer): Buffer[] {
  const parts: Buffer[] = []
  let start = 0
  let idx   = buf.indexOf(delim, start)

  while (idx !== -1) {
    parts.push(buf.slice(start, idx))
    start = idx + delim.length
    idx   = buf.indexOf(delim, start)
  }

  parts.push(buf.slice(start))
  return parts.filter(p => p.length > 0)
}
