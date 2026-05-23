/**
 * previsao-taxa-futura-moeda.ts — Projecoes BACEN Focus (Expectativas de Mercado)
 *
 * Armazena projecoes mensais de cambio publicadas pelo BACEN no Focus.
 * Fonte: API Olinda do BACEN (https://olinda.bcb.gov.br) — publica, gratuita,
 * sem chave de API.
 *
 * GET  /api/v1/previsoes-taxa-futura-moeda            — listar previsoes (moeda + meses)
 * POST /api/v1/previsoes-taxa-futura-moeda/sync       — sincroniza Focus sob demanda
 *
 * Cron semanal automatico em queue/previsao-taxa-futura-moeda-sync-worker.ts.
 *
 * IMPORTANTE: o dado e PROJECAO/EXPECTATIVA do mercado, NAO cotacao negociada.
 * Erro de previsao de cambio cresce rapido com horizonte — UI obrigatoriamente
 * rotula como "previsao" e cita fonte BACEN/Focus.
 *
 * LIMITACAO da fonte: Focus publica oficialmente apenas a serie USD/BRL
 * (indicador "Cambio"). Demais moedas (EUR/GBP/CHF/CNY/JPY/CAD) ficam sem
 * dados ate decisao futura sobre derivacao via cross-rate.
 */

import { Router, Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireConfiguradorMutation } from '../middleware/requireConfiguradorAccess.js'

export const previsaoTaxaFuturaMoedaRouter = Router()

const BACEN_FOCUS_URL =
  process.env.BACEN_FOCUS_URL ??
  'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata'

export const MOEDAS_FOCUS_SUPORTADAS = ['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'CAD'] as const
type MoedaFocus = typeof MOEDAS_FOCUS_SUPORTADAS[number]

// ----------------------------------------------------------------------------
// Schemas Zod — request E response (Mandamentos 06 + 09)
// ----------------------------------------------------------------------------

export const previsaoTaxaFuturaMoedaListarQuerySchema = z.object({
  moeda: z.enum(MOEDAS_FOCUS_SUPORTADAS).default('USD'),
  meses: z.coerce.number().int().min(1).max(12).default(4),
})

export const previsaoTaxaFuturaMoedaItemSchema = z.object({
  id_previsao_taxa_futura_moeda: z.string(),
  moeda_previsao_taxa_futura_moeda: z.string(),
  mes_previsao_taxa_futura_moeda: z.string(),
  valor_mediano_previsao_taxa_futura_moeda: z.number(),
  valor_medio_previsao_taxa_futura_moeda: z.number(),
  valor_minimo_previsao_taxa_futura_moeda: z.number(),
  valor_maximo_previsao_taxa_futura_moeda: z.number(),
  fonte_previsao_taxa_futura_moeda: z.string(),
  data_previsao_taxa_futura_moeda: z.string(),
  data_criacao_previsao_taxa_futura_moeda: z.string(),
  data_atualizacao_previsao_taxa_futura_moeda: z.string(),
})

export const previsaoTaxaFuturaMoedaResponseSchema = z.object({
  data: z.array(previsaoTaxaFuturaMoedaItemSchema),
  moeda: z.string(),
  meses: z.number(),
  total: z.number(),
})

// ----------------------------------------------------------------------------
// Payload bruto do BACEN Focus (campos como vem da API Olinda)
// ----------------------------------------------------------------------------

export interface PayloadFocusItem {
  Indicador: string
  Data: string                 // 'YYYY-MM-DD' — data em que a projecao foi publicada
  DataReferencia: string       // 'MM/YYYY' — mes-alvo da projecao
  Mediana: number
  Media: number
  Minimo: number
  Maximo: number
  numeroRespondentes: number
}

// ----------------------------------------------------------------------------
// Helper: buscar payload Focus da API Olinda para USD
// ----------------------------------------------------------------------------

export async function buscarFocusUSD(meses: number = 12): Promise<PayloadFocusItem[]> {
  // ATENCAO: endpoint correto e "ExpectativaMercadoMensais" (singular, sem "s").
  // O nome popular do produto BACEN e "Expectativas de Mercado" (plural), mas o
  // EntitySet OData e singular. Confirmado via $metadata em 2026-05-23.
  const url = `${BACEN_FOCUS_URL}/ExpectativaMercadoMensais`
  const params = {
    // Sobreamostragem: cada DataReferencia tem varias projecoes (datas diferentes)
    $top: meses * 10,
    // baseCalculo=0 e a agregacao geral (todas as instituicoes respondentes).
    // baseCalculo=1 e a base "Top 5". Sem o filtro, ambas chegam e o dedup
    // escolhe arbitrariamente — fixamos em 0 para consistencia.
    $filter: `Indicador eq 'Câmbio' and baseCalculo eq 0`,
    $orderby: 'Data desc',
    $format: 'json',
  }

  const { data } = await axios.get(url, { params, timeout: 15_000 })
  const items: PayloadFocusItem[] = data?.value ?? []

  // Deduplicar: pegar so a projecao MAIS RECENTE (maior Data) por DataReferencia
  const porMesAlvo = new Map<string, PayloadFocusItem>()
  for (const item of items) {
    const atual = porMesAlvo.get(item.DataReferencia)
    if (!atual || new Date(item.Data) > new Date(atual.Data)) {
      porMesAlvo.set(item.DataReferencia, item)
    }
  }

  // Ordenar por mes-alvo crescente, limitar ao numero solicitado
  return [...porMesAlvo.values()]
    .sort((a, b) => parseDataReferencia(a.DataReferencia).getTime() - parseDataReferencia(b.DataReferencia).getTime())
    .slice(0, meses)
}

/** Converte 'MM/YYYY' do Focus para Date (primeiro dia do mes em UTC) */
function parseDataReferencia(mmYYYY: string): Date {
  const [mm, yyyy] = mmYYYY.split('/')
  return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, 1))
}

// ----------------------------------------------------------------------------
// Helper: persistir uma previsao (upsert idempotente via @@unique)
// ----------------------------------------------------------------------------

export async function persistirPrevisao(moeda: string, payload: PayloadFocusItem): Promise<void> {
  const mesAlvo = parseDataReferencia(payload.DataReferencia)
  const dataPrevisao = new Date(payload.Data + 'T00:00:00Z')

  // findFirst (não findUnique) espelha o padrão do Cambio (taxas-moeda.ts) —
  // a constraint @@unique tem só `map:` (nome SQL), nao `name:` (nome TS),
  // entao o Prisma Client nao expoe a chave composta tipada.
  const existing = await prisma.previsaoTaxaFuturaMoeda.findFirst({
    where: {
      moeda_previsao_taxa_futura_moeda: moeda,
      mes_previsao_taxa_futura_moeda: mesAlvo,
    },
  })

  if (existing) {
    await prisma.previsaoTaxaFuturaMoeda.update({
      where: { id_previsao_taxa_futura_moeda: existing.id_previsao_taxa_futura_moeda },
      data: {
        valor_mediano_previsao_taxa_futura_moeda: payload.Mediana,
        valor_medio_previsao_taxa_futura_moeda: payload.Media,
        valor_minimo_previsao_taxa_futura_moeda: payload.Minimo,
        valor_maximo_previsao_taxa_futura_moeda: payload.Maximo,
        data_previsao_taxa_futura_moeda: dataPrevisao,
      },
    })
  } else {
    await prisma.previsaoTaxaFuturaMoeda.create({
      data: {
        moeda_previsao_taxa_futura_moeda: moeda,
        mes_previsao_taxa_futura_moeda: mesAlvo,
        valor_mediano_previsao_taxa_futura_moeda: payload.Mediana,
        valor_medio_previsao_taxa_futura_moeda: payload.Media,
        valor_minimo_previsao_taxa_futura_moeda: payload.Minimo,
        valor_maximo_previsao_taxa_futura_moeda: payload.Maximo,
        fonte_previsao_taxa_futura_moeda: 'BACEN/Focus',
        data_previsao_taxa_futura_moeda: dataPrevisao,
      },
    })
  }
}

// ----------------------------------------------------------------------------
// DTO: Prisma row → response payload (snake_case DDD direto, sem alias)
// ----------------------------------------------------------------------------

interface PrevisaoPrismaRow {
  id_previsao_taxa_futura_moeda: string
  moeda_previsao_taxa_futura_moeda: string
  mes_previsao_taxa_futura_moeda: Date
  valor_mediano_previsao_taxa_futura_moeda: unknown
  valor_medio_previsao_taxa_futura_moeda: unknown
  valor_minimo_previsao_taxa_futura_moeda: unknown
  valor_maximo_previsao_taxa_futura_moeda: unknown
  fonte_previsao_taxa_futura_moeda: string
  data_previsao_taxa_futura_moeda: Date
  data_criacao_previsao_taxa_futura_moeda: Date
  data_atualizacao_previsao_taxa_futura_moeda: Date
}

function toPrevisaoDto(row: PrevisaoPrismaRow) {
  return {
    id_previsao_taxa_futura_moeda: row.id_previsao_taxa_futura_moeda,
    moeda_previsao_taxa_futura_moeda: row.moeda_previsao_taxa_futura_moeda,
    mes_previsao_taxa_futura_moeda: row.mes_previsao_taxa_futura_moeda.toISOString(),
    valor_mediano_previsao_taxa_futura_moeda: Number(row.valor_mediano_previsao_taxa_futura_moeda),
    valor_medio_previsao_taxa_futura_moeda: Number(row.valor_medio_previsao_taxa_futura_moeda),
    valor_minimo_previsao_taxa_futura_moeda: Number(row.valor_minimo_previsao_taxa_futura_moeda),
    valor_maximo_previsao_taxa_futura_moeda: Number(row.valor_maximo_previsao_taxa_futura_moeda),
    fonte_previsao_taxa_futura_moeda: row.fonte_previsao_taxa_futura_moeda,
    data_previsao_taxa_futura_moeda: row.data_previsao_taxa_futura_moeda.toISOString(),
    data_criacao_previsao_taxa_futura_moeda: row.data_criacao_previsao_taxa_futura_moeda.toISOString(),
    data_atualizacao_previsao_taxa_futura_moeda: row.data_atualizacao_previsao_taxa_futura_moeda.toISOString(),
  }
}

// ----------------------------------------------------------------------------
// GET /api/v1/previsoes-taxa-futura-moeda?moeda=USD&meses=4
// Lista previsoes a partir do mes corrente, ordenadas por mes-alvo crescente.
// Publica (sem auth) — dado do BACEN e publico.
// ----------------------------------------------------------------------------

previsaoTaxaFuturaMoedaRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return next(new AppError('Parametros invalidos', 400, 'VALIDATION_ERROR'))
  }

  const { moeda, meses } = parsed.data

  // Cursor: primeiro dia do mes corrente em UTC
  const inicioMesCorrente = new Date()
  inicioMesCorrente.setUTCDate(1)
  inicioMesCorrente.setUTCHours(0, 0, 0, 0)

  try {
    const registros = await prisma.previsaoTaxaFuturaMoeda.findMany({
      where: {
        moeda_previsao_taxa_futura_moeda: moeda,
        mes_previsao_taxa_futura_moeda: { gte: inicioMesCorrente },
      },
      orderBy: { mes_previsao_taxa_futura_moeda: 'asc' },
      take: meses,
    })

    const dados = registros.map(toPrevisaoDto)

    res.json({
      data: dados,
      moeda,
      meses,
      total: dados.length,
    })
  } catch (err) {
    next(err)
  }
})

// ----------------------------------------------------------------------------
// POST /api/v1/previsoes-taxa-futura-moeda/sync
// Busca projecoes do Focus (Olinda BACEN) e persiste no banco via upsert.
// Requer auth — sem protecao, qualquer cliente anonimo poderia disparar e
// sobrecarregar a API publica do BACEN (abuso de origem externa).
// ----------------------------------------------------------------------------

previsaoTaxaFuturaMoedaRouter.post(
  '/sync',
  requireAuth,
  requireConfiguradorMutation,
  async (_req: Request, res: Response, _next: NextFunction) => {
    const resultados: Array<{
      moeda: string
      status: 'ok' | 'erro' | 'sem_dados'
      total?: number
      detalhe?: string
    }> = []

    // Focus oficial: apenas serie USD/BRL
    try {
      const items = await buscarFocusUSD(12)

      if (items.length === 0) {
        resultados.push({ moeda: 'USD', status: 'sem_dados', detalhe: 'Focus retornou lista vazia' })
      } else {
        for (const item of items) {
          await persistirPrevisao('USD', item)
        }
        resultados.push({ moeda: 'USD', status: 'ok', total: items.length })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      resultados.push({ moeda: 'USD', status: 'erro', detalhe: msg })
    }

    // Demais moedas: Focus nao tem serie dedicada — sinalizar explicitamente
    for (const m of MOEDAS_FOCUS_SUPORTADAS) {
      if (m === 'USD') continue
      resultados.push({
        moeda: m,
        status: 'sem_dados',
        detalhe: 'Focus do BACEN publica oficialmente apenas a serie USD/BRL',
      })
    }

    res.json({
      sincronizado_em: new Date().toISOString(),
      total_ok: resultados.filter(r => r.status === 'ok').length,
      total_erro: resultados.filter(r => r.status === 'erro').length,
      total_sem_dados: resultados.filter(r => r.status === 'sem_dados').length,
      resultados,
    })
  },
)
