/**
 * adminNcmSync.ts — Endpoints administrativos de sincronização NCM.
 *
 * Catálogo global da Receita Federal — sem id_organizacao.
 * Acessado pelo configurador (porta 8005) via REST com x-internal-key
 * (Caminho A — autenticação S2S, ver skill `autenticacao-s2s/SKILL.md`).
 *
 * Montado em: /api/v1/cadastros/admin/ncm-sync
 *
 *   GET    /                              — status geral
 *   GET    /historico                     — logs de sincronização (paginado)
 *   POST   /sincronizar                   — dispara sync manual (origem MANUAL)
 *   GET    /agendamento                   — configuração singleton do cron
 *   PUT    /agendamento                   — atualizar agendamento
 *   POST   /agendamento/executar          — executar manualmente (alias de /sincronizar)
 */

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { executarSync } from '../services/motor-sync-ncm.js'
import { reagendarJob } from '../initNcmSync.js'

export const adminNcmSyncRouter = Router()
adminNcmSyncRouter.use(requireInternalKey)

// ─── GET / — Status geral ────────────────────────────────────────────────────

adminNcmSyncRouter.get('/', async (_req, res, next) => {
  try {
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const [ultimaSyncCompleta, emAndamento, totalAtivos, erros48h] = await Promise.all([
      prisma.ncmSyncLog.findFirst({
        where:   { status_ncm_sync_log: { in: ['SUCESSO', 'ERRO'] } },
        orderBy: { data_inicio_ncm_sync_log: 'desc' },
      }),
      prisma.ncmSyncLog.findFirst({
        where: { status_ncm_sync_log: 'EXECUTANDO' },
        orderBy: { data_inicio_ncm_sync_log: 'desc' },
      }),
      prisma.ncmSync.count({ where: { ativo_ncm_sync: true } }),
      prisma.ncmSyncLog.count({
        where: { status_ncm_sync_log: 'ERRO', data_inicio_ncm_sync_log: { gte: limite48h } },
      }),
    ])

    const statusAtual = emAndamento ? 'EXECUTANDO' : (ultimaSyncCompleta?.status_ncm_sync_log ?? null)
    const desatualizado = emAndamento ? false : (ultimaSyncCompleta?.data_conclusao_ncm_sync_log
      ? (Date.now() - ultimaSyncCompleta.data_conclusao_ncm_sync_log.getTime()) > 26 * 60 * 60 * 1000
      : true)

    res.json({
      ultima_sync:  ultimaSyncCompleta?.data_conclusao_ncm_sync_log ?? null,
      status:       statusAtual,
      total_ativos: totalAtivos,
      erros_48h:    erros48h,
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

adminNcmSyncRouter.get('/historico', async (req, res, next) => {
  try {
    const parsed = HistoricoQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Query inválida', 400, 'VALIDATION_ERROR')
    }

    const { pagina, por_page } = parsed.data
    const skip = (pagina - 1) * por_page

    const [logs, total] = await Promise.all([
      prisma.ncmSyncLog.findMany({ orderBy: { data_inicio_ncm_sync_log: 'desc' }, skip, take: por_page }),
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

// ─── POST /sincronizar — Sync manual ─────────────────────────────────────────
// O caller (configurador) propaga id_usuario do JWT no body.

const SincronizarBodySchema = z.object({
  id_usuario: z.string().min(1).optional(),
})

adminNcmSyncRouter.post('/sincronizar', async (req, res, next) => {
  try {
    const parsed = SincronizarBodySchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    const startMs = Date.now()

    // Recovery de jobs órfãos antigos (> 2h em EXECUTANDO)
    const DOIS_HORAS_ATRAS = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await prisma.ncmSyncLog.updateMany({
      where: {
        status_ncm_sync_log:      'EXECUTANDO',
        data_inicio_ncm_sync_log: { lt: DOIS_HORAS_ATRAS },
      },
      data: {
        status_ncm_sync_log:         'ERRO',
        data_conclusao_ncm_sync_log: new Date(),
        mensagem_erro_ncm_sync_log:  'Tempo limite excedido (2h) — processo presumido morto.',
      },
    })

    const emAndamento = await prisma.ncmSyncLog.findFirst({
      where: { status_ncm_sync_log: 'EXECUTANDO' },
    })
    if (emAndamento) {
      throw new AppError('Já existe uma sincronização em andamento.', 409, 'SYNC_ALREADY_RUNNING')
    }

    const result = await executarSync(prisma, {
      origem:       'MANUAL',
      disparadoPor: parsed.data.id_usuario ?? null,
    })

    res.json({ sucesso: true, ...result, duracaoMs: Date.now() - startMs })
  } catch (err) {
    next(err)
  }
})

// ─── GET /agendamento — Configuração do cron ─────────────────────────────────

adminNcmSyncRouter.get('/agendamento', async (_req, res, next) => {
  try {
    const config = await prisma.ncmSyncAgendamento.findUnique({
      where: { id_ncm_sync_agendamento: 'default' },
    })

    res.json({
      ativo:           config?.ativo_ncm_sync_agendamento          ?? false,
      cron_expressao:  config?.cron_expressao_ncm_sync_agendamento ?? '0 2 * * *',
      notificadores:   config?.notificadores_ncm_sync_agendamento  ?? [],
      proxima_execucao: config?.ativo_ncm_sync_agendamento ? config.cron_expressao_ncm_sync_agendamento : null,
      atualizado_em:   config?.data_atualizacao_ncm_sync_agendamento ?? null,
    })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /agendamento — Atualizar agendamento ────────────────────────────────

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

adminNcmSyncRouter.put('/agendamento', async (req, res, next) => {
  try {
    const parsed = SaveScheduleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { ativo, cron_expressao, notificadores } = parsed.data

    const config = await prisma.ncmSyncAgendamento.upsert({
      where:  { id_ncm_sync_agendamento: 'default' },
      create: {
        id_ncm_sync_agendamento:             'default',
        ativo_ncm_sync_agendamento:          ativo,
        cron_expressao_ncm_sync_agendamento: cron_expressao,
        notificadores_ncm_sync_agendamento:  notificadores as object[],
      },
      update: {
        ativo_ncm_sync_agendamento:          ativo,
        cron_expressao_ncm_sync_agendamento: cron_expressao,
        notificadores_ncm_sync_agendamento:  notificadores as object[],
      },
    })

    reagendarJob(cron_expressao, ativo)

    res.json({
      sucesso:        true,
      ativo:          config.ativo_ncm_sync_agendamento,
      cron_expressao: config.cron_expressao_ncm_sync_agendamento,
      notificadores:  config.notificadores_ncm_sync_agendamento,
      atualizado_em:  config.data_atualizacao_ncm_sync_agendamento,
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /agendamento/executar — Alias de /sincronizar ──────────────────────

adminNcmSyncRouter.post('/agendamento/executar', async (req, res, next) => {
  try {
    const parsed = SincronizarBodySchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    const emAndamento = await prisma.ncmSyncLog.findFirst({
      where: { status_ncm_sync_log: 'EXECUTANDO' },
    })
    if (emAndamento) {
      throw new AppError('Já existe uma sincronização em andamento.', 409, 'SYNC_ALREADY_RUNNING')
    }

    const result = await executarSync(prisma, {
      origem:       'MANUAL',
      disparadoPor: parsed.data.id_usuario ?? 'gravity-admin',
    })

    res.json({ sucesso: true, sincronizacoes_executadas: 1, resultado: result })
  } catch (err) {
    next(err)
  }
})
