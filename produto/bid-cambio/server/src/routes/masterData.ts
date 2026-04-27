/**
 * masterData.ts — Dados publicos (sem autenticacao)
 * Moedas, PTAX (BCB OLINDA API), metodos de vencimento
 */

import { Router, Request, Response } from 'express'
import axios from 'axios'

export const masterDataRouter = Router()

// --- Constantes ---

const MOEDAS = [
  { codigo: 'USD', nome: 'Dolar Americano', simbolo: 'US$', codigoBcb: 61 },
  { codigo: 'EUR', nome: 'Euro', simbolo: '€', codigoBcb: 222 },
  { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£', codigoBcb: 178 },
  { codigo: 'CHF', nome: 'Franco Suico', simbolo: 'CHF', codigoBcb: 425 },
  { codigo: 'CNY', nome: 'Yuan Chines', simbolo: '¥', codigoBcb: 4 },
  { codigo: 'JPY', nome: 'Iene Japones', simbolo: '¥', codigoBcb: 470 },
  { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$', codigoBcb: null },
]

const LIQUIDACOES = [
  { codigo: 'D0', label: 'D+0 (mesmo dia)' },
  { codigo: 'D1', label: 'D+1 (1 dia util)' },
  { codigo: 'D2', label: 'D+2 (2 dias uteis)' },
]

const METODOS_VENCIMENTO = [
  { codigo: 'DATA_EMBARQUE', label: 'Data de Embarque' },
  { codigo: 'DATA_CHEGADA', label: 'Data de Chegada' },
  { codigo: 'DATA_REGISTRO_DI', label: 'Data de Registro da DI' },
  { codigo: 'DATA_DESEMBARACO', label: 'Data de Desembaraco' },
  { codigo: 'DATA_ENTREGA', label: 'Data de Entrega' },
  { codigo: 'PRONTIDAO_CARGA', label: 'Prontidao de Carga' },
  { codigo: 'DATA_FIXA', label: 'Data Fixa' },
]

// --- PTAX Cache (in-memory, TTL 5 min) ---

interface PtaxCacheEntry {
  data: PtaxResponse
  expiresAt: number
}

interface PtaxResponse {
  moeda: string
  data: string
  compra: number
  venda: number
  hora: string
  fonte: string
}

const ptaxCache = new Map<string, PtaxCacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

const BCB_BASE_URL = process.env.BCB_PTAX_URL ?? 'https://olinda.bcb.gov.br/olinda/servico/PTAX'

function formatDateBcb(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}-${dd}-${date.getFullYear()}`
}

async function fetchPtaxFromBcb(moeda: string, data: Date): Promise<PtaxResponse | null> {
  const dataBcb = formatDateBcb(data)

  const url = `${BCB_BASE_URL}/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?` +
    `@moeda='${moeda}'&@dataCotacao='${dataBcb}'&$top=1&$orderby=dataHoraCotacao%20desc&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`

  const response = await axios.get(url, { timeout: 10000 })
  const items = response.data?.value

  if (!items || items.length === 0) return null

  const item = items[0]
  const hora = item.dataHoraCotacao
    ? new Date(item.dataHoraCotacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''

  return {
    moeda,
    data: data.toISOString().split('T')[0],
    compra: Number(item.cotacaoCompra),
    venda: Number(item.cotacaoVenda),
    hora,
    fonte: 'BCB/PTAX',
  }
}

async function getPtaxComCache(moeda: string): Promise<PtaxResponse | null> {
  const cacheKey = moeda
  const cached = ptaxCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  // Tentar hoje, se nao tiver (fim de semana/feriado), tentar D-1, D-2, D-3
  const hoje = new Date()
  for (let i = 0; i < 4; i++) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - i)

    const result = await fetchPtaxFromBcb(moeda, data)
    if (result) {
      ptaxCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })
      return result
    }
  }

  return null
}

// --- Rotas ---

masterDataRouter.get('/moedas', (_req: Request, res: Response) => {
  res.json(MOEDAS)
})

masterDataRouter.get('/tipos-liquidacao', (_req: Request, res: Response) => {
  res.json(LIQUIDACOES)
})

masterDataRouter.get('/metodos-vencimento', (_req: Request, res: Response) => {
  res.json(METODOS_VENCIMENTO)
})

/**
 * GET /api/v1/cotacoes-ptax?moeda=USD
 * Retorna PTAX do dia (ou ultimo dia util) com cache de 5 min
 */
masterDataRouter.get('/cotacoes-ptax', async (req: Request, res: Response) => {
  const moeda = (req.query.moeda as string) || 'USD'

  try {
    const ptax = await getPtaxComCache(moeda)

    if (!ptax) {
      res.json({
        moeda,
        data: new Date().toISOString().split('T')[0],
        compra: null,
        venda: null,
        hora: null,
        fonte: 'BCB/PTAX',
        aviso: 'PTAX indisponivel — BCB pode estar fora do ar ou feriado',
      })
      return
    }

    res.json(ptax)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.warn(`[PTAX] Falha ao consultar BCB para ${moeda}:`, message)
    res.json({
      moeda,
      data: new Date().toISOString().split('T')[0],
      compra: null,
      venda: null,
      hora: null,
      fonte: 'BCB/PTAX',
      aviso: `Falha na consulta BCB: ${message}`,
    })
  }
})

/**
 * GET /api/v1/cotacoes-ptax/historico?moeda=USD&dias=30
 * Retorna historico de PTAX dos ultimos N dias
 */
masterDataRouter.get('/cotacoes-ptax/historico', async (req: Request, res: Response) => {
  const moeda = (req.query.moeda as string) || 'USD'
  const dias = Math.min(parseInt(req.query.dias as string) || 30, 90)

  const dataFim = new Date()
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - dias)

  const dataInicioBcb = formatDateBcb(dataInicio)
  const dataFimBcb = formatDateBcb(dataFim)

  try {
    const url = `${BCB_BASE_URL}/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?` +
      `@moeda='${moeda}'&@dataInicial='${dataInicioBcb}'&@dataFinalCotacao='${dataFimBcb}'` +
      `&$orderby=dataHoraCotacao%20asc&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`

    const response = await axios.get(url, { timeout: 15000 })
    const items = response.data?.value ?? []

    const dados = items.map((item: { cotacaoCompra: number; cotacaoVenda: number; dataHoraCotacao: string }) => ({
      data: new Date(item.dataHoraCotacao).toISOString().split('T')[0],
      compra: Number(item.cotacaoCompra),
      venda: Number(item.cotacaoVenda),
    }))

    res.json({
      moeda,
      periodo: `${dataInicio.toISOString().split('T')[0]} a ${dataFim.toISOString().split('T')[0]}`,
      total: dados.length,
      dados,
      fonte: 'BCB/PTAX',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.warn(`[PTAX] Falha historico BCB para ${moeda}:`, message)
    res.json({
      moeda,
      periodo: `ultimos ${dias} dias`,
      total: 0,
      dados: [],
      fonte: 'BCB/PTAX',
      aviso: `Falha na consulta BCB: ${message}`,
    })
  }
})
