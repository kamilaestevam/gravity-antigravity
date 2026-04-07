/**
 * taxaCambio.ts — Taxas de câmbio PTAX centralizadas
 *
 * Armazena até 4 boletins por dia por moeda (10h / 11h / 12h / 13h).
 * Fonte: BCB/PTAX via bid-cambio. Cron automático em taxaCambioSyncWorker.ts.
 *
 * GET  /api/v1/taxa-cambio           — taxas do dia (todos os boletins)
 * GET  /api/v1/taxa-cambio/historico — histórico (filtro: moeda, dias)
 * POST /api/v1/taxa-cambio/sync      — sincroniza boletim atual do BCB
 */

import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const taxaCambioRouter = Router()

const BID_CAMBIO_URL = process.env.BID_CAMBIO_URL ?? 'http://localhost:8025'

export const MOEDAS_SUPORTADAS = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CHF', 'CAD'] as const
type Moeda = typeof MOEDAS_SUPORTADAS[number]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Classifica o boletim pelo horário retornado pelo BCB */
export function classificarBoletim(hora: string | null | undefined): string {
  if (!hora) return 'Fechamento'
  const h = parseInt(hora.split(':')[0], 10)
  if (h <= 10) return '1º Boletim'
  if (h <= 11) return '2º Boletim'
  if (h <= 12) return '3º Boletim'
  return 'Fechamento'
}

/** Persiste (upsert) uma cotação no banco */
export async function persistirCotacao(
  moeda: string,
  compra: number,
  venda: number,
  dataCotacao: Date,
  horaCotacao: string | null,
  boletim: string,
  fonte: string = 'BCB/PTAX',
) {
  const existing = await prisma.taxaCambio.findFirst({
    where: { moeda, data_cotacao: dataCotacao, boletim },
  })

  if (existing) {
    await prisma.taxaCambio.update({
      where: { id: existing.id },
      data: { compra, venda, hora_cotacao: horaCotacao, fonte },
    })
  } else {
    await prisma.taxaCambio.create({
      data: { moeda, compra, venda, data_cotacao: dataCotacao, hora_cotacao: horaCotacao, boletim, fonte },
    })
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/taxa-cambio
// Taxas do dia agrupadas por moeda — todos os boletins disponíveis hoje
// ---------------------------------------------------------------------------

taxaCambioRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hoje = new Date()
    hoje.setUTCHours(0, 0, 0, 0)

    const taxas = await prisma.taxaCambio.findMany({
      where: { data_cotacao: { gte: hoje } },
      orderBy: [{ moeda: 'asc' }, { criado_em: 'asc' }],
    })

    // Agrupar por moeda
    const porMoeda: Record<string, typeof taxas> = {}
    for (const t of taxas) {
      if (!porMoeda[t.moeda]) porMoeda[t.moeda] = []
      porMoeda[t.moeda].push(t)
    }

    res.json({ data: new Date().toISOString(), por_moeda: porMoeda })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/taxa-cambio/historico?moeda=USD&dias=30
// ---------------------------------------------------------------------------

const historicoQuerySchema = z.object({
  moeda: z.enum(MOEDAS_SUPORTADAS).default('USD'),
  dias: z.coerce.number().int().min(1).max(365).default(30),
})

taxaCambioRouter.get('/historico', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = historicoQuerySchema.safeParse(req.query)
  if (!parsed.success) return next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))

  const { moeda, dias } = parsed.data
  const desde = new Date()
  desde.setDate(desde.getDate() - dias)
  desde.setUTCHours(0, 0, 0, 0)

  try {
    const registros = await prisma.taxaCambio.findMany({
      where: { moeda, data_cotacao: { gte: desde } },
      orderBy: [{ data_cotacao: 'desc' }, { boletim: 'asc' }],
      select: { id: true, moeda: true, compra: true, venda: true, data_cotacao: true, hora_cotacao: true, boletim: true, fonte: true, criado_em: true },
    })

    res.json({ moeda, periodo_dias: dias, total: registros.length, historico: registros })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/taxa-cambio/sync
// Busca cotação atual do BCB (via bid-cambio) e persiste no banco
// ---------------------------------------------------------------------------

taxaCambioRouter.post('/sync', async (_req: Request, res: Response, next: NextFunction) => {
  const resultados: Array<{ moeda: Moeda; boletim: string; status: 'ok' | 'erro'; detalhe?: string }> = []

  for (const moeda of MOEDAS_SUPORTADAS) {
    try {
      const { data } = await axios.get(`${BID_CAMBIO_URL}/api/v1/master-data/ptax`, {
        params: { moeda },
        timeout: 12000,
      })

      if (!data.compra || !data.venda || !data.data) {
        resultados.push({ moeda, boletim: '—', status: 'erro', detalhe: 'PTAX indisponível no BCB' })
        continue
      }

      const dataCotacao = new Date(data.data + 'T00:00:00Z')
      const boletim = classificarBoletim(data.hora)

      await persistirCotacao(moeda, data.compra, data.venda, dataCotacao, data.hora ?? null, boletim, data.fonte ?? 'BCB/PTAX')

      resultados.push({ moeda, boletim, status: 'ok' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      resultados.push({ moeda, boletim: '—', status: 'erro', detalhe: msg })
    }
  }

  res.json({
    sincronizado_em: new Date().toISOString(),
    total_ok: resultados.filter(r => r.status === 'ok').length,
    total_erro: resultados.filter(r => r.status === 'erro').length,
    resultados,
  })
})
