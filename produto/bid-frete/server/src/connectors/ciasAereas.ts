/**
 * ciasAereas.ts — Connector abstrato para APIs de Companhias Aereas
 * Interface pronta aguardando APIs.
 *
 * Cias aereas suportadas (quando API disponivel):
 * - LATAM Cargo
 * - Lufthansa Cargo
 * - Emirates SkyCargo
 * - Turkish Cargo
 * - Qatar Airways Cargo
 */

import axios from 'axios'

export interface CotacaoAereaRequest {
  origem_codigo: string    // IATA code (ex: GRU)
  destino_codigo: string   // IATA code (ex: PVG)
  peso_kg: number
  cubagem_m3?: number
  descricao: string
  data_embarque?: string
}

export interface CotacaoAereaResponse {
  fornecedor_nome: string
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  valor_total: number
  transit_time_dias: number
  escalas?: string
  validade_cotacao: string
  referencia_externa?: string
  tarifa_kg?: number
  peso_cubado_kg?: number
}

export interface CiaAereaConnector {
  nome: string
  ativo: boolean
  cotar(req: CotacaoAereaRequest, config: { base_url: string; api_key: string; auth_type: string }): Promise<CotacaoAereaResponse | null>
  testarConexao(config: { base_url: string; api_key: string }): Promise<boolean>
}

const latamCargoConnector: CiaAereaConnector = {
  nome: 'LATAM Cargo',
  ativo: false,
  async cotar(req, config) {
    const response = await axios.post(`${config.base_url}/api/v1/rates`, {
      origin: req.origem_codigo,
      destination: req.destino_codigo,
      weight: req.peso_kg,
      volume: req.cubagem_m3,
      commodity: req.descricao,
    }, {
      headers: { Authorization: `Bearer ${config.api_key}` },
      timeout: 30000,
    })

    return {
      fornecedor_nome: 'LATAM Cargo',
      moeda: response.data.currency ?? 'USD',
      valor_frete: response.data.airFreight ?? 0,
      taxas_origem: response.data.originCharges ?? 0,
      taxas_destino: response.data.destinationCharges ?? 0,
      valor_total: response.data.total ?? 0,
      transit_time_dias: response.data.transitDays ?? 0,
      escalas: response.data.routing,
      validade_cotacao: response.data.validUntil,
      referencia_externa: response.data.rateId,
      tarifa_kg: response.data.ratePerKg,
      peso_cubado_kg: response.data.chargeableWeight,
    }
  },
  async testarConexao(config) {
    try {
      await axios.get(`${config.base_url}/api/v1/health`, {
        headers: { Authorization: `Bearer ${config.api_key}` },
        timeout: 10000,
      })
      return true
    } catch {
      return false
    }
  },
}

export const ciaAereaConnectors: Record<string, CiaAereaConnector> = {
  latam_cargo: latamCargoConnector,
  // lufthansa_cargo: lufthansaConnector,
  // emirates_skycargo: emiratesConnector,
  // turkish_cargo: turkishConnector,
}

export async function cotarComCiasAereas(
  req: CotacaoAereaRequest,
  configs: Array<{ nome: string; credentials: { base_url: string; api_key: string; auth_type: string } }>
): Promise<CotacaoAereaResponse[]> {
  const results: CotacaoAereaResponse[] = []

  for (const config of configs) {
    const connector = ciaAereaConnectors[config.nome.toLowerCase().replace(/\s/g, '_')]
    if (!connector || !connector.ativo) continue

    try {
      const response = await connector.cotar(req, config.credentials)
      if (response) results.push(response)
    } catch (err: any) {
      console.warn(`[Connector:${config.nome}] Erro ao cotar:`, err.message)
    }
  }

  return results
}
