/**
 * cias-aereas.ts — Connector abstrato para APIs de Companhias Aereas
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
  origem_codigo_cotacao_bid_frete_internacional: string    // IATA code (ex: GRU)
  destino_codigo_cotacao_bid_frete_internacional: string   // IATA code (ex: PVG)
  peso_kg_cotacao_bid_frete_internacional: number
  cubagem_m3_cotacao_bid_frete_internacional?: number
  descricao: string
  data_embarque?: string
}

export interface CotacaoAereaResponse {
  fornecedor_nome: string
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  valor_total_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  escalas_proposta_bid_frete_internacional?: string
  validade_proposta_bid_frete_internacional: string
  referencia_externa?: string
  tarifa_kg?: number
  peso_cubado_kg?: number
}

export interface CiaAereaConnector {
  nome: string
  ativo: boolean
  cotar(req: CotacaoAereaRequest, config: { base_url_integracao_bid_frete_internacional: string; api_key: string; tipo_autenticacao_integracao_bid_frete_internacional: string }): Promise<CotacaoAereaResponse | null>
  testarConexao(config: { base_url_integracao_bid_frete_internacional: string; api_key: string }): Promise<boolean>
}

const latamCargoConnector: CiaAereaConnector = {
  nome: 'LATAM Cargo',
  ativo: false,
  async cotar(req, config) {
    const response = await axios.post(`${config.base_url_integracao_bid_frete_internacional}/api/v1/rates`, {
      origin: req.origem_codigo_cotacao_bid_frete_internacional,
      destination: req.destino_codigo_cotacao_bid_frete_internacional,
      weight: req.peso_kg_cotacao_bid_frete_internacional,
      volume: req.cubagem_m3_cotacao_bid_frete_internacional,
      commodity: req.descricao,
    }, {
      headers: { Authorization: `Bearer ${config.api_key}` },
      timeout: 30000,
    })

    return {
      fornecedor_nome: 'LATAM Cargo',
      moeda_proposta_bid_frete_internacional: response.data.currency ?? 'USD',
      valor_frete_proposta_bid_frete_internacional: response.data.airFreight ?? 0,
      taxas_origem_proposta_bid_frete_internacional: response.data.originCharges ?? 0,
      taxas_destino_proposta_bid_frete_internacional: response.data.destinationCharges ?? 0,
      valor_total_proposta_bid_frete_internacional: response.data.total ?? 0,
      dias_transito_proposta_bid_frete_internacional: response.data.transitDays ?? 0,
      escalas_proposta_bid_frete_internacional: response.data.routing,
      validade_proposta_bid_frete_internacional: response.data.validUntil,
      referencia_externa: response.data.rateId,
      tarifa_kg: response.data.ratePerKg,
      peso_cubado_kg: response.data.chargeableWeight,
    }
  },
  async testarConexao(config) {
    try {
      await axios.get(`${config.base_url_integracao_bid_frete_internacional}/api/v1/health`, {
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
}

export async function cotarComCiasAereas(
  req: CotacaoAereaRequest,
  configs: Array<{ nome: string; credentials: { base_url_integracao_bid_frete_internacional: string; api_key: string; tipo_autenticacao_integracao_bid_frete_internacional: string } }>
): Promise<CotacaoAereaResponse[]> {
  const results: CotacaoAereaResponse[] = []

  for (const config of configs) {
    const connector = ciaAereaConnectors[config.nome.toLowerCase().replace(/\s/g, '_')]
    if (!connector || !connector.ativo) continue

    try {
      const response = await connector.cotar(req, config.credentials)
      if (response) results.push(response)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`[Connector:${config.nome}] Erro ao cotar:`, msg)
    }
  }

  return results
}
