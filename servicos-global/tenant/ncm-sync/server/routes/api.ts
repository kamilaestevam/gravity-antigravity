/**
 * ncm-sync/server/routes/api.ts — Rotas REST do serviço NCM
 *
 * Montado em: /api/v1/ncm
 *
 * GET  /buscar?q=...           — Busca local por código ou descrição (autocomplete)
 * GET  /validar/:codigo        — Valida NCM pontual (cache local + Portal Único fallback)
 * GET  /sync/status            — Status da última sincronização
 * GET  /sync/historico         — Histórico de syncs com paginação
 * POST /sync                   — Força sync manual (Admin only)
 * GET  /invalidos              — Lista NCMs do Pedido marcados como inválidos
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../../../tenant/server/lib/prisma.js'
import { AppError } from '../../../middleware/appError.js'
import { executarSync, buscarNcm, obterStatusSync } from '../services/ncmSyncEngine.js'
import { validarNcm } from '../connectors/portalUnicoNcm.js'

export const apiRoutes = Router()

// ── GET /buscar?q=... ─────────────────────────────────────────────────────────

const buscarSchema = z.object({
  q:      z.string().min(1).max(100),
  limite: z.coerce.number().int().min(1).max(50).default(20),
})

apiRoutes.get('/buscar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) throw new AppError('x-tenant-id obrigatório', 400, 'MISSING_TENANT')

    const parsed = buscarSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const { q, limite } = parsed.data
    const itens = await buscarNcm(prisma, tenantId, q, limite)

    // Enriquecer resposta com status da última sync
    const status = await obterStatusSync(prisma, tenantId)

    res.json({
      itens,
      total:      itens.length,
      ultima_sync: status.ultima_sync,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /validar/:codigo ──────────────────────────────────────────────────────

const codigoSchema = z.string().regex(/^\d{8}$/, 'NCM deve ter 8 dígitos numéricos')

apiRoutes.get('/validar/:codigo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) throw new AppError('x-tenant-id obrigatório', 400, 'MISSING_TENANT')

    const codigoParsed = codigoSchema.safeParse(req.params.codigo)
    if (!codigoParsed.success) {
      return res.json({ valido: false, codigo: req.params.codigo, descricao: null,
        motivo: 'Formato inválido — NCM deve ter exatamente 8 dígitos' })
    }

    const codigo = codigoParsed.data

    // 1. Verificar no cache local primeiro (mais rápido)
    const local = await prisma.ncmItem.findUnique({
      where:  { tenant_id_codigo: { tenant_id: tenantId, codigo } },
      select: { codigo: true, descricao: true, ativo: true },
    })

    if (local) {
      const status = await obterStatusSync(prisma, tenantId)
      return res.json({
        valido:      local.ativo,
        codigo:      local.codigo,
        descricao:   local.descricao,
        fonte:       'cache',
        ultima_sync: status.ultima_sync,
        motivo:      local.ativo ? null : 'NCM inativo ou removido da tabela Siscomex',
      })
    }

    // 2. Cache vazio (primeiro uso) — consultar Portal Único diretamente
    const portal = await validarNcm(codigo)
    const status = await obterStatusSync(prisma, tenantId)

    return res.json({
      valido:      portal !== null,
      codigo,
      descricao:   portal?.descricao ?? null,
      fonte:       'portal',
      ultima_sync: status.ultima_sync,
      motivo:      portal ? null : 'NCM não encontrado no Portal Único Siscomex',
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /sync/status ──────────────────────────────────────────────────────────

apiRoutes.get('/sync/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) throw new AppError('x-tenant-id obrigatório', 400, 'MISSING_TENANT')

    const status = await obterStatusSync(prisma, tenantId)
    res.json(status)
  } catch (err) {
    next(err)
  }
})

// ── GET /sync/historico ───────────────────────────────────────────────────────

const historicoSchema = z.object({
  pagina:   z.coerce.number().int().min(1).default(1),
  por_page: z.coerce.number().int().min(1).max(100).default(20),
})

apiRoutes.get('/sync/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) throw new AppError('x-tenant-id obrigatório', 400, 'MISSING_TENANT')

    const parsed = historicoSchema.safeParse(req.query)
    if (!parsed.success) throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')

    const { pagina, por_page } = parsed.data
    const skip = (pagina - 1) * por_page

    const [logs, total] = await Promise.all([
      prisma.ncmSyncLog.findMany({
        where:   { tenant_id: tenantId },
        orderBy: { iniciado_em: 'desc' },
        skip,
        take:    por_page,
      }),
      prisma.ncmSyncLog.count({ where: { tenant_id: tenantId } }),
    ])

    res.json({
      logs,
      paginacao: { pagina, por_page, total, paginas: Math.ceil(total / por_page) },
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /sync — Force sync manual ───────────────────────────────────────────

apiRoutes.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) throw new AppError('x-tenant-id obrigatório', 400, 'MISSING_TENANT')

    const userId = req.headers['x-user-id'] as string | undefined

    // Verificar se já há um sync em andamento para este tenant
    const emAndamento = await prisma.ncmSyncLog.findFirst({
      where:   { tenant_id: tenantId, status: 'RUNNING' },
      orderBy: { iniciado_em: 'desc' },
    })

    if (emAndamento) {
      throw new AppError('Já existe uma sincronização em andamento. Aguarde a conclusão.', 409, 'SYNC_ALREADY_RUNNING')
    }

    const result = await executarSync(prisma, tenantId, {
      origem:       'MANUAL',
      disparadoPor: userId,
    })

    res.json({ sucesso: true, ...result })
  } catch (err) {
    next(err)
  }
})

// ── GET /admin/status — Aggregate status (internal key) ──────────────────────

const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? ''

apiRoutes.get('/admin/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!INTERNAL_KEY || key !== INTERNAL_KEY) {
      throw new AppError('Não autorizado', 403, 'FORBIDDEN')
    }

    // Última sync de qualquer tenant (mais recente)
    const ultimaSync = await prisma.ncmSyncLog.findFirst({
      orderBy: { iniciado_em: 'desc' },
    })

    // Total de NCMs ativos (distintos por código — NCM é global)
    const totalAtivos = await prisma.ncmItem.count({ where: { ativo: true } })

    // Total de tenants com NCMs sincronizados
    const tenantsResult = await prisma.ncmItem.findMany({
      select: { tenant_id: true },
      distinct: ['tenant_id'],
    })

    // Total de syncs com erro nas últimas 48h
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const erros48h = await prisma.ncmSyncLog.count({
      where: { status: 'ERROR', iniciado_em: { gte: limite48h } },
    })

    res.json({
      ultima_sync:     ultimaSync?.concluido_em ?? null,
      status:          ultimaSync?.status ?? null,
      total_ativos:    totalAtivos,
      total_tenants:   tenantsResult.length,
      erros_48h:       erros48h,
      desatualizado:   ultimaSync?.concluido_em
        ? (Date.now() - ultimaSync.concluido_em.getTime()) > 26 * 60 * 60 * 1000
        : true,
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /admin/historico — All syncs across tenants (internal key) ────────────

apiRoutes.get('/admin/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!INTERNAL_KEY || key !== INTERNAL_KEY) {
      throw new AppError('Não autorizado', 403, 'FORBIDDEN')
    }

    const parsed = historicoSchema.safeParse(req.query)
    if (!parsed.success) throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')

    const { pagina, por_page } = parsed.data
    const skip = (pagina - 1) * por_page

    const [logs, total] = await Promise.all([
      prisma.ncmSyncLog.findMany({
        orderBy: { iniciado_em: 'desc' },
        skip,
        take:    por_page,
      }),
      prisma.ncmSyncLog.count(),
    ])

    res.json({
      logs,
      paginacao: { pagina, por_page, total, paginas: Math.ceil(total / por_page) },
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /admin/sync/:tenantId — Force sync for tenant (internal key) ─────────

apiRoutes.post('/admin/sync/:tenantId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!INTERNAL_KEY || key !== INTERNAL_KEY) {
      throw new AppError('Não autorizado', 403, 'FORBIDDEN')
    }

    const tenantId = req.params.tenantId
    if (!tenantId) throw new AppError('tenantId obrigatório', 400, 'MISSING_TENANT')

    const emAndamento = await prisma.ncmSyncLog.findFirst({
      where:   { tenant_id: tenantId, status: 'RUNNING' },
      orderBy: { iniciado_em: 'desc' },
    })

    if (emAndamento) {
      throw new AppError('Já existe uma sincronização em andamento.', 409, 'SYNC_ALREADY_RUNNING')
    }

    const result = await executarSync(prisma, tenantId, {
      origem:       'MANUAL',
      disparadoPor: 'gravity-admin',
    })

    res.json({ sucesso: true, ...result })
  } catch (err) {
    next(err)
  }
})

// ── GET /invalidos — NCMs inválidos no Pedido ─────────────────────────────────

const invalidosSchema = z.object({
  produto_id: z.string().optional(),
  limite:     z.coerce.number().int().min(1).max(200).default(50),
})

apiRoutes.get('/invalidos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) throw new AppError('x-tenant-id obrigatório', 400, 'MISSING_TENANT')

    const parsed = invalidosSchema.safeParse(req.query)
    if (!parsed.success) throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')

    const { produto_id, limite } = parsed.data

    // Buscar NCMs únicos usados no Pedido que NÃO estão na tabela NCM ativa
    // Estratégia: buscar todos NCMs ativos do tenant e retornar
    // os que faltam (join feito no servidor para não expor lógica do Pedido aqui)
    const ncmsAtivos = await prisma.ncmItem.findMany({
      where:  { tenant_id: tenantId, ativo: true },
      select: { codigo: true },
    })

    const codigosAtivos = new Set(ncmsAtivos.map(n => n.codigo))

    // O caller (produto Pedido) deve enviar os NCMs a verificar via query
    // Este endpoint retorna quais dos códigos enviados são inválidos
    const codigosParaVerificar = (
      typeof req.query.codigos === 'string'
        ? req.query.codigos.split(',')
        : (req.query.codigos as string[] | undefined) ?? []
    ).map((c: string) => c.trim()).filter(Boolean).slice(0, limite)

    if (codigosParaVerificar.length === 0) {
      return res.json({ invalidos: [], total_verificados: 0 })
    }

    const invalidos = codigosParaVerificar.filter(c => !codigosAtivos.has(c))

    res.json({
      invalidos,
      total_verificados: codigosParaVerificar.length,
      total_invalidos:   invalidos.length,
      ultima_sync:       (await obterStatusSync(prisma, tenantId)).ultima_sync,
    })
  } catch (err) {
    next(err)
  }
})
