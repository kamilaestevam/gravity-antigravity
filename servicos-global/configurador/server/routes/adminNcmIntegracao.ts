// server/routes/adminNcmIntegracao.ts
// Rotas de NCM Integração — chama ncm-sync engine diretamente (sem HTTP)
// Montado em /api/v1/admin/integracao-ncm pelo index.ts
//
// GET    /                              — status geral
// GET    /historico                     — logs de sincronização com paginação
// POST   /sincronizar/:id_organizacao   — dispara sync manual para uma organização
// GET    /agendamento                   — configuração do agendamento
// PUT    /agendamento                   — atualizar agendamento (cron, notificadores)
// POST   /agendamento/executar          — executar para todas as organizações (ou uma específica)

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma as configuradorPrisma } from '../lib/prisma.js'
import { prisma as plataformaPrisma } from '../../../servicos-plataforma/server/lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { executarSync } from '../../../servicos-plataforma/ncm-sync/server/services/ncmSyncEngine.js'
import { reagendarJob } from '../../../servicos-plataforma/ncm-sync/server/init.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

export const adminNcmIntegracaoRouter = Router()

adminNcmIntegracaoRouter.use(requireAuth, requireGravityAdmin)

// ─── GET / — Status geral ────────────────────────────────────────────────────

adminNcmIntegracaoRouter.get('/', async (_req, res, next) => {
  try {
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const [ultimaSyncCompleta, emAndamento, totalAtivos, organizacoesComNcm, erros48h, totalOrganizacoes] = await Promise.all([
      plataformaPrisma.ncmLog.findFirst({
        where:   { status_ncm_log: { in: ['SUCESSO', 'ERRO'] } },
        orderBy: { data_inicio_ncm_log: 'desc' },
      }),
      plataformaPrisma.ncmLog.findFirst({ where: { status_ncm_log: 'EXECUTANDO' }, orderBy: { data_inicio_ncm_log: 'desc' } }),
      plataformaPrisma.ncmItem.count({ where: { ativo_ncm_item: true } }),
      plataformaPrisma.ncmItem.findMany({ select: { id_organizacao: true }, distinct: ['id_organizacao'] }),
      plataformaPrisma.ncmLog.count({ where: { status_ncm_log: 'ERRO', data_inicio_ncm_log: { gte: limite48h } } }),
      configuradorPrisma.organizacao.count().catch(() => 0),
    ])

    const statusAtual = emAndamento ? 'EXECUTANDO' : (ultimaSyncCompleta?.status_ncm_log ?? null)
    const desatualizado = emAndamento ? false : (ultimaSyncCompleta?.data_conclusao_ncm_log
      ? (Date.now() - ultimaSyncCompleta.data_conclusao_ncm_log.getTime()) > 26 * 60 * 60 * 1000
      : true)

    res.json({
      ultima_sync:           ultimaSyncCompleta?.data_conclusao_ncm_log ?? null,
      status:                statusAtual,
      total_ativos:          totalAtivos,
      total_organizacoes:    totalOrganizacoes,
      organizacoes_com_ncm:  organizacoesComNcm.length,
      erros_48h:             erros48h,
      desatualizado,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /historico — Logs de sincronização ──────────────────────────────────

const HistoricoQuerySchema = z.object({
  pagina:   z.coerce.number().int().min(1).default(1),
  por_page: z.coerce.number().int().min(1).max(100).default(20),
})

adminNcmIntegracaoRouter.get('/historico', async (req, res, next) => {
  try {
    const parsed = HistoricoQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Query inválida', 400, 'VALIDATION_ERROR')
    }

    const { pagina, por_page } = parsed.data
    const skip = (pagina - 1) * por_page

    const [logs, total] = await Promise.all([
      plataformaPrisma.ncmLog.findMany({ orderBy: { data_inicio_ncm_log: 'desc' }, skip, take: por_page }),
      plataformaPrisma.ncmLog.count(),
    ])

    res.json({
      logs,
      paginacao: { pagina, por_page, total, paginas: Math.ceil(total / por_page) },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /sincronizar/:id_organizacao — Sync manual de uma organização ─────

adminNcmIntegracaoRouter.post('/sincronizar/:id_organizacao', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode disparar sync', 403, 'FORBIDDEN')
    }

    const { id_organizacao } = req.params
    const startMs = Date.now()

    const DOIS_HORAS_ATRAS = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await plataformaPrisma.ncmLog.updateMany({
      where: { id_organizacao, status_ncm_log: 'EXECUTANDO', data_inicio_ncm_log: { lt: DOIS_HORAS_ATRAS } },
      data: { status_ncm_log: 'ERRO', data_conclusao_ncm_log: new Date(), mensagem_erro_ncm_log: 'Tempo limite excedido (2h) — processo presumido morto.' },
    })

    const emAndamento = await plataformaPrisma.ncmLog.findFirst({
      where: { id_organizacao, status_ncm_log: 'EXECUTANDO' },
    })
    if (emAndamento) {
      throw new AppError('Já existe uma sincronização em andamento para esta organização.', 409, 'SYNC_ALREADY_RUNNING')
    }

    const result = await executarSync(plataformaPrisma, id_organizacao, {
      origem:       'MANUAL',
      disparadoPor: req.auth.id_usuario,
    })

    AuditService.log({
      id_organizacao:     req.auth.id_organizacao,
      tipo_ator_historico_log:    'USUARIO',
      id_ator_historico_log:      req.auth.id_usuario,
      nome_ator_historico_log:    req.auth.id_usuario,
      ip_ator_historico_log:      req.ip,
      modulo_historico_log:        'admin',
      tipo_recurso_historico_log: 'NcmSync',
      acao_historico_log:        'NCM_SYNC_MANUAL',
      detalhe_acao_historico_log: `Sync OK para organização ${id_organizacao} — ${result.total} NCMs (${Date.now() - startMs}ms)`,
      estado_posterior_historico_log:         { id_organizacao, ...result },
      status_historico_log:        'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ sucesso: true, ...result, duracaoMs: Date.now() - startMs })
  } catch (err) {
    next(err)
  }
})

// ─── GET /agendamento — Configuração do agendamento ─────────────────────────

adminNcmIntegracaoRouter.get('/agendamento', async (_req, res, next) => {
  try {
    const config = await plataformaPrisma.nCMAgendamento.findUnique({ where: { id_ncm_agendamento: 'default' } })

    res.json({
      ativo:           config?.ativo_ncm_agendamento          ?? false,
      cron_expressao:  config?.cron_expressao_ncm_agendamento ?? '0 2 * * *',
      notificadores:   config?.notificadores_ncm_agendamento  ?? [],
      proxima_execucao: config?.ativo_ncm_agendamento ? config.cron_expressao_ncm_agendamento : null,
      atualizado_em:   config?.data_atualizacao_ncm_agendamento ?? null,
    })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /agendamento — Atualizar agendamento ───────────────────────────────

const NotificadorSchema = z.object({
  id:       z.string(),
  nome:     z.string().min(1).max(200),
  contato:  z.string().min(1).max(200),
  condicao: z.enum(['Apenas Erros', 'Sempre']),
  canal:    z.enum(['E-mail', 'WhatsApp', 'Ambos']),
})

const SaveScheduleSchema = z.object({
  ativo:          z.boolean(),
  cron_expressao: z.string().min(9).max(100),
  notificadores:  z.array(NotificadorSchema).max(20),
})

adminNcmIntegracaoRouter.put('/agendamento', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode editar agendamento', 403, 'FORBIDDEN')
    }

    const parsed = SaveScheduleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { ativo, cron_expressao, notificadores } = parsed.data

    const config = await plataformaPrisma.nCMAgendamento.upsert({
      where:  { id_ncm_agendamento: 'default' },
      create: { id_ncm_agendamento: 'default', ativo_ncm_agendamento: ativo, cron_expressao_ncm_agendamento: cron_expressao, notificadores_ncm_agendamento: notificadores as object[] },
      update: { ativo_ncm_agendamento: ativo, cron_expressao_ncm_agendamento: cron_expressao, notificadores_ncm_agendamento: notificadores as object[] },
    })

    reagendarJob(cron_expressao, ativo)

    AuditService.log({
      id_organizacao:     req.auth.id_organizacao,
      tipo_ator_historico_log:    'USUARIO',
      id_ator_historico_log:      req.auth.id_usuario,
      nome_ator_historico_log:    req.auth.id_usuario,
      ip_ator_historico_log:      req.ip,
      modulo_historico_log:        'admin',
      tipo_recurso_historico_log: 'NcmSchedule',
      acao_historico_log:        'NCM_SCHEDULE_UPDATED',
      detalhe_acao_historico_log: `Agendamento ${ativo ? 'ativado' : 'desativado'} — cron: ${cron_expressao}`,
      estado_posterior_historico_log:         config,
      status_historico_log:        'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

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

// ─── POST /agendamento/executar — Executar para todas as organizações ──────

const ExecuteSchema = z.object({
  id_organizacao: z.string().optional(),
})

adminNcmIntegracaoRouter.post('/agendamento/executar', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode executar sync', 403, 'FORBIDDEN')
    }

    const parsed = ExecuteSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { id_organizacao } = parsed.data

    if (id_organizacao) {
      const emAndamento = await plataformaPrisma.ncmLog.findFirst({
        where: { id_organizacao, status_ncm_log: 'EXECUTANDO' },
      })
      if (emAndamento) {
        throw new AppError('Já existe uma sincronização em andamento para esta organização.', 409, 'SYNC_ALREADY_RUNNING')
      }
      const result = await executarSync(plataformaPrisma, id_organizacao, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })
      return res.json({ sucesso: true, organizacoes_executadas: 1, resultados: [{ id_organizacao, sucesso: true, ...result }] })
    }

    // Todas as organizações ativas
    const organizacoes = await configuradorPrisma.organizacao.findMany({
      select: { id_organizacao: true },
      where:  { status_organizacao: 'ATIVO' },
    })

    if (organizacoes.length === 0) {
      return res.json({ sucesso: true, organizacoes_executadas: 0, resultados: [], aviso: 'Nenhuma organização ativa.' })
    }

    const resultados: Array<Record<string, unknown>> = []
    for (const { id_organizacao: idOrg } of organizacoes) {
      try {
        const r = await executarSync(plataformaPrisma, idOrg, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })
        resultados.push({ id_organizacao: idOrg, sucesso: true, ...r })
      } catch (err) {
        resultados.push({ id_organizacao: idOrg, sucesso: false, erro: err instanceof Error ? err.message : String(err) })
      }
    }

    res.json({
      sucesso:                 true,
      organizacoes_executadas: resultados.length,
      resultados,
    })
  } catch (err) {
    next(err)
  }
})
