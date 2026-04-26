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
 *
 * Onda 36 — DDD: campos físicos seguem sufixo _ncm_item / _ncm_log /
 * _ncm_agendamento. Camada DTO/ACL preserva contrato público histórico
 * (codigo, descricao, status, etc.).
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../../../../tenant/server/lib/prisma.js'
import { AppError } from '../../../middleware/appError.js'
import { executarSync, buscarNcm, obterStatusSync } from '../services/ncmSyncEngine.js'
import { validarNcm } from '../connectors/portalUnicoNcm.js'
import { reagendarJob } from '../init.js'

export const apiRoutes = Router()

// ── DTOs / ACL ────────────────────────────────────────────────────────────────

function toLogDto(l: {
  id_ncm_log: string
  id_organizacao_ncm_log: string
  data_inicio_ncm_log: Date
  data_conclusao_ncm_log: Date | null
  status_ncm_log: 'EXECUTANDO' | 'SUCESSO' | 'ERRO'
  total_ncm_log: number
  adicionados_ncm_log: number
  alterados_ncm_log: number
  removidos_ncm_log: number
  origem_ncm_log: 'JOB' | 'MANUAL'
  disparado_por_ncm_log: string | null
  mensagem_erro_ncm_log: string | null
}) {
  return {
    id: l.id_ncm_log,
    tenant_id: l.id_organizacao_ncm_log,
    iniciado_em: l.data_inicio_ncm_log,
    concluido_em: l.data_conclusao_ncm_log,
    status: l.status_ncm_log,
    total: l.total_ncm_log,
    adicionados: l.adicionados_ncm_log,
    alterados: l.alterados_ncm_log,
    removidos: l.removidos_ncm_log,
    origem: l.origem_ncm_log,
    disparado_por: l.disparado_por_ncm_log,
    erro_msg: l.mensagem_erro_ncm_log,
  }
}

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
      where: {
        id_organizacao_ncm_item_codigo_ncm_item: {
          id_organizacao_ncm_item: tenantId,
          codigo_ncm_item: codigo,
        },
      },
      select: {
        codigo_ncm_item: true,
        descricao_ncm_item: true,
        ativo_ncm_item: true,
      },
    })

    if (local) {
      const status = await obterStatusSync(prisma, tenantId)
      return res.json({
        valido:      local.ativo_ncm_item,
        codigo:      local.codigo_ncm_item,
        descricao:   local.descricao_ncm_item,
        fonte:       'cache',
        ultima_sync: status.ultima_sync,
        motivo:      local.ativo_ncm_item ? null : 'NCM inativo ou removido da tabela Siscomex',
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
      prisma.ncmLog.findMany({
        where:   { id_organizacao_ncm_log: tenantId },
        orderBy: { data_inicio_ncm_log: 'desc' },
        skip,
        take:    por_page,
      }),
      prisma.ncmLog.count({ where: { id_organizacao_ncm_log: tenantId } }),
    ])

    res.json({
      logs: logs.map(toLogDto),
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

    // Recuperar job EXECUTANDO órfão com mais de 2h (processo morreu sem reiniciar)
    const DOIS_HORAS_ATRAS = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await prisma.ncmLog.updateMany({
      where: {
        id_organizacao_ncm_log: tenantId,
        status_ncm_log: 'EXECUTANDO',
        data_inicio_ncm_log: { lt: DOIS_HORAS_ATRAS },
      },
      data: {
        status_ncm_log:        'ERRO',
        data_conclusao_ncm_log: new Date(),
        mensagem_erro_ncm_log: 'Tempo limite excedido (2h) — processo presumido morto.',
      },
    })

    // Verificar se ainda há um sync recente em andamento para este tenant
    const emAndamento = await prisma.ncmLog.findFirst({
      where:   {
        id_organizacao_ncm_log: tenantId,
        status_ncm_log: 'EXECUTANDO',
      },
      orderBy: { data_inicio_ncm_log: 'desc' },
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
    const ultimaSync = await prisma.ncmLog.findFirst({
      orderBy: { data_inicio_ncm_log: 'desc' },
    })

    // Total de NCMs ativos (distintos por código — NCM é global)
    const totalAtivos = await prisma.ncmItem.count({
      where: { ativo_ncm_item: true },
    })

    // Total de tenants com NCMs sincronizados
    const tenantsResult = await prisma.ncmItem.findMany({
      select: { id_organizacao_ncm_item: true },
      distinct: ['id_organizacao_ncm_item'],
    })

    // Total de syncs com erro nas últimas 48h
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const erros48h = await prisma.ncmLog.count({
      where: {
        status_ncm_log: 'ERRO',
        data_inicio_ncm_log: { gte: limite48h },
      },
    })

    res.json({
      ultima_sync:     ultimaSync?.data_conclusao_ncm_log ?? null,
      status:          ultimaSync?.status_ncm_log ?? null,
      total_ativos:    totalAtivos,
      total_tenants:   tenantsResult.length,
      erros_48h:       erros48h,
      desatualizado:   ultimaSync?.data_conclusao_ncm_log
        ? (Date.now() - ultimaSync.data_conclusao_ncm_log.getTime()) > 26 * 60 * 60 * 1000
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
      prisma.ncmLog.findMany({
        orderBy: { data_inicio_ncm_log: 'desc' },
        skip,
        take:    por_page,
      }),
      prisma.ncmLog.count(),
    ])

    res.json({
      logs: logs.map(toLogDto),
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

    const emAndamento = await prisma.ncmLog.findFirst({
      where:   {
        id_organizacao_ncm_log: tenantId,
        status_ncm_log: 'EXECUTANDO',
      },
      orderBy: { data_inicio_ncm_log: 'desc' },
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

// ── GET /admin/schedule — Ler configuração do agendamento ────────────────────

apiRoutes.get('/admin/schedule', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!INTERNAL_KEY || key !== INTERNAL_KEY) {
      throw new AppError('Não autorizado', 403, 'FORBIDDEN')
    }

    const config = await prisma.ncmAgendamento.findUnique({
      where: { id_ncm_agendamento: 'default' },
    })

    // Calcular próxima execução se ativo (estimamos baseado na expressão)
    let proxima_execucao: string | null = null
    if (config?.ativo_ncm_agendamento && config.cron_expressao_ncm_agendamento) {
      proxima_execucao = config.cron_expressao_ncm_agendamento
    }

    res.json({
      ativo:           config?.ativo_ncm_agendamento          ?? false,
      cron_expressao:  config?.cron_expressao_ncm_agendamento ?? '0 2 * * *',
      notificadores:   config?.notificadores_ncm_agendamento  ?? [],
      proxima_execucao,
      atualizado_em:   config?.data_atualizacao_ncm_agendamento ?? null,
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /admin/schedule — Salvar configuração e re-agendar job ────────────────

const scheduleBodySchema = z.object({
  ativo:          z.boolean(),
  cron_expressao: z.string().min(9).max(100),
  notificadores:  z.array(z.object({
    id:       z.string(),
    nome:     z.string(),
    contato:  z.string(),
    condicao: z.enum(['Apenas Erros', 'Sempre']),
    canal:    z.enum(['E-mail', 'WhatsApp', 'Ambos']),
  })).default([]),
})

apiRoutes.put('/admin/schedule', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!INTERNAL_KEY || key !== INTERNAL_KEY) {
      throw new AppError('Não autorizado', 403, 'FORBIDDEN')
    }

    const parsed = scheduleBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        `Dados inválidos: ${parsed.error.errors.map(e => e.message).join(', ')}`,
        400, 'VALIDATION_ERROR'
      )
    }

    const { ativo, cron_expressao, notificadores } = parsed.data

    const config = await prisma.ncmAgendamento.upsert({
      where:  { id_ncm_agendamento: 'default' },
      create: {
        id_ncm_agendamento: 'default',
        ativo_ncm_agendamento: ativo,
        cron_expressao_ncm_agendamento: cron_expressao,
        notificadores_ncm_agendamento: notificadores as object[],
      },
      update: {
        ativo_ncm_agendamento: ativo,
        cron_expressao_ncm_agendamento: cron_expressao,
        notificadores_ncm_agendamento: notificadores as object[],
      },
    })

    // Re-agendar job em runtime sem restart do servidor
    reagendarJob(cron_expressao, ativo)

    res.json({
      sucesso:        true,
      ativo:          config.ativo_ncm_agendamento,
      cron_expressao: config.cron_expressao_ncm_agendamento,
      notificadores:  config.notificadores_ncm_agendamento,
      atualizado_em:  config.data_atualizacao_ncm_agendamento,
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /admin/schedule/execute — Execução manual imediata ──────────────────

const executeBodySchema = z.object({
  tenant_id: z.string().optional(), // se omitido: executa para todos os tenants
})

apiRoutes.post('/admin/schedule/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!INTERNAL_KEY || key !== INTERNAL_KEY) {
      throw new AppError('Não autorizado', 403, 'FORBIDDEN')
    }

    const parsed = executeBodySchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR')

    const { tenant_id } = parsed.data

    if (tenant_id) {
      // Executar para tenant específico
      const emAndamento = await prisma.ncmLog.findFirst({
        where: {
          id_organizacao_ncm_log: tenant_id,
          status_ncm_log: 'EXECUTANDO',
        },
        orderBy: { data_inicio_ncm_log: 'desc' },
      })
      if (emAndamento) {
        throw new AppError('Já existe uma sincronização em andamento para este tenant.', 409, 'SYNC_ALREADY_RUNNING')
      }

      const result = await executarSync(prisma, tenant_id, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })
      return res.json({ sucesso: true, tenants_executados: 1, resultados: [{ tenant_id, ...result }] })
    }

    // Executar para TODOS os tenants com NCMs (mesmo comportamento do job diário)
    const tenants = await prisma.ncmItem.findMany({
      select: { id_organizacao_ncm_item: true },
      distinct: ['id_organizacao_ncm_item'],
    })

    if (tenants.length === 0) {
      return res.json({ sucesso: true, tenants_executados: 0, resultados: [], aviso: 'Nenhum tenant com NCMs cadastrados.' })
    }

    const resultados: Array<{ tenant_id: string; sucesso: boolean; total?: number; adicionados?: number; alterados?: number; removidos?: number; duracaoMs?: number; erro?: string }> = []

    for (const t of tenants) {
      const tid = t.id_organizacao_ncm_item
      try {
        const r = await executarSync(prisma, tid, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })
        resultados.push({ tenant_id: tid, sucesso: true, ...r })
      } catch (err) {
        resultados.push({ tenant_id: tid, sucesso: false, erro: err instanceof Error ? err.message : String(err) })
      }
    }

    res.json({
      sucesso: true,
      tenants_executados: resultados.length,
      resultados,
    })
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

    const { limite } = parsed.data

    // Buscar NCMs únicos usados no Pedido que NÃO estão na tabela NCM ativa
    const ncmsAtivos = await prisma.ncmItem.findMany({
      where:  {
        id_organizacao_ncm_item: tenantId,
        ativo_ncm_item: true,
      },
      select: { codigo_ncm_item: true },
    })

    const codigosAtivos = new Set(ncmsAtivos.map(n => n.codigo_ncm_item))

    // O caller (produto Pedido) deve enviar os NCMs a verificar via query
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
