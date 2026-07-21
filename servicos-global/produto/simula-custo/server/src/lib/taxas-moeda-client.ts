/**
 * Cliente PTAX — SSOT Configurador GET /api/v1/taxas-moeda (cadastros-snapshot-policy).
 * Sem cache local no banco do Simula Custo; sem fallback silencioso (Mandamento 08).
 */
import { z } from 'zod'
import { AppError } from './erros.js'

const FETCH_TIMEOUT_MS = 12_000

const decimalCoerced = z.union([z.number(), z.string()]).transform((v) => Number(v))

const BoletimCambioSchema = z.object({
  id: z.string(),
  moeda: z.string(),
  compra: decimalCoerced,
  venda: decimalCoerced,
  data_cotacao: z.union([z.string(), z.date()]),
  hora_cotacao: z.string().nullable(),
  boletim: z.string(),
  fonte: z.string(),
  criado_em: z.string().optional(),
})

const TaxasMoedaResponseSchema = z.object({
  data: z.string(),
  por_moeda: z.record(z.string(), z.array(BoletimCambioSchema)),
})

export interface PtaxMoedaSimulaCusto {
  venda: number
  compra: number
  data_cotacao: string
  boletim: string
  fonte: string
}

function obterUrlConfigurador(): string {
  return (
    process.env.CONFIGURADOR_URL
    ?? process.env.CONFIGURATOR_URL
    ?? 'http://localhost:8005'
  ).replace(/\/$/, '')
}

export async function obterPtaxMoedaSimulaCusto(moeda: string): Promise<PtaxMoedaSimulaCusto> {
  const codigo = moeda.trim().toUpperCase()
  if (codigo === 'BRL') {
    return {
      venda: 1,
      compra: 1,
      data_cotacao: new Date().toISOString(),
      boletim: 'N/A',
      fonte: 'BRL',
    }
  }

  const url = `${obterUrlConfigurador()}/api/v1/taxas-moeda`
  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new AppError(
      `Falha ao consultar PTAX (taxas-moeda): ${msg}`,
      503,
      'PTAX_INDISPONIVEL',
    )
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new AppError(
      `taxas-moeda retornou HTTP ${res.status}: ${body.slice(0, 200)}`,
      503,
      'PTAX_INDISPONIVEL',
    )
  }

  const raw: unknown = await res.json()
  const parsed = TaxasMoedaResponseSchema.safeParse(raw)
  if (!parsed.success) {
    throw new AppError(
      'Resposta de taxas-moeda inválida — contrato Zod divergente',
      502,
      'PTAX_CONTRATO_INVALIDO',
    )
  }

  const boletins = parsed.data.por_moeda[codigo]
  if (!boletins?.length) {
    throw new AppError(
      `PTAX não encontrada para moeda ${codigo} em taxas-moeda`,
      404,
      'PTAX_MOEDA_AUSENTE',
    )
  }

  const ultimo = boletins[boletins.length - 1]
  const dataCotacao = ultimo.data_cotacao instanceof Date
    ? ultimo.data_cotacao.toISOString()
    : String(ultimo.data_cotacao)

  return {
    venda: ultimo.venda,
    compra: ultimo.compra,
    data_cotacao: dataCotacao,
    boletim: ultimo.boletim,
    fonte: ultimo.fonte,
  }
}

/** PTAX venda para cálculo de landed cost (produto em moeda estrangeira). */
export async function obterPtaxVendaSimulaCusto(moeda: string): Promise<number> {
  return (await obterPtaxMoedaSimulaCusto(moeda)).venda
}
