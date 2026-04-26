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
import { requireAuth } from '../middleware/requireAuth.js'

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
  const existing = await prisma.cambio.findFirst({
    where: { moeda_cambio: moeda, data_cotacao_cambio: dataCotacao, boletim_cambio: boletim },
  })

  if (existing) {
    await prisma.cambio.update({
      where: { id_cambio: existing.id_cambio },
      data: {
        compra_cambio: compra,
        venda_cambio: venda,
        hora_cotacao_cambio: horaCotacao,
        fonte_cambio: fonte,
      },
    })
  } else {
    await prisma.cambio.create({
      data: {
        moeda_cambio: moeda,
        compra_cambio: compra,
        venda_cambio: venda,
        data_cotacao_cambio: dataCotacao,
        hora_cotacao_cambio: horaCotacao,
        boletim_cambio: boletim,
        fonte_cambio: fonte,
      },
    })
  }
}

// DTO: Cambio Prisma rename → contrato legado da UI/API
function toCambioDto(row: {
  id_cambio: string
  moeda_cambio: string
  compra_cambio: unknown
  venda_cambio: unknown
  data_cotacao_cambio: Date
  hora_cotacao_cambio: string | null
  boletim_cambio: string
  fonte_cambio: string
  data_criacao_cambio: Date
}) {
  return {
    id: row.id_cambio,
    moeda: row.moeda_cambio,
    compra: row.compra_cambio,
    venda: row.venda_cambio,
    data_cotacao: row.data_cotacao_cambio,
    hora_cotacao: row.hora_cotacao_cambio,
    boletim: row.boletim_cambio,
    fonte: row.fonte_cambio,
    criado_em: row.data_criacao_cambio,
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

    const taxas = await prisma.cambio.findMany({
      where: { data_cotacao_cambio: { gte: hoje } },
      orderBy: [{ moeda_cambio: 'asc' }, { data_criacao_cambio: 'asc' }],
    })

    // DTO: rename Prisma → contrato legado
    const taxasDto = taxas.map(toCambioDto)

    // Agrupar por moeda
    const porMoeda: Record<string, ReturnType<typeof toCambioDto>[]> = {}
    for (const t of taxasDto) {
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
    const registros = await prisma.cambio.findMany({
      where: { moeda_cambio: moeda, data_cotacao_cambio: { gte: desde } },
      orderBy: [{ data_cotacao_cambio: 'desc' }, { boletim_cambio: 'asc' }],
      select: {
        id_cambio: true,
        moeda_cambio: true,
        compra_cambio: true,
        venda_cambio: true,
        data_cotacao_cambio: true,
        hora_cotacao_cambio: true,
        boletim_cambio: true,
        fonte_cambio: true,
        data_criacao_cambio: true,
      },
    })

    // DTO: rename Prisma → contrato legado
    const historico = registros.map(toCambioDto)

    res.json({ moeda, periodo_dias: dias, total: historico.length, historico })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/taxa-cambio/sync
// Busca cotação atual do BCB (via bid-cambio) e persiste no banco.
// Requer auth: sem proteção, qualquer cliente anônimo pode disparar o sync
// e sobrecarregar o bid-cambio/BCB (abuso de origem externa).
// ---------------------------------------------------------------------------

taxaCambioRouter.post('/sync', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
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
