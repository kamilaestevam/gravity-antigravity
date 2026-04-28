/**
 * armadores.ts — Connector abstrato para APIs de Armadores
 * Interface pronta aguardando APIs do lado dos armadores.
 * Cada armador implementa o mesmo contrato.
 *
 * Armadores suportados (quando API disponivel):
 * - MSC (Mediterranean Shipping Company)
 * - Maersk (Maersk Spot)
 * - CMA CGM
 * - Hapag-Lloyd
 * - ONE (Ocean Network Express)
 * - Evergreen
 * - COSCO
 * - Yang Ming
 */

import axios from 'axios'

export interface CotacaoArmadorRequest {
  origem_codigo: string    // UN/LOCODE
  destino_codigo: string
  modal: 'MARITIMO'
  modalidade: 'FCL' | 'LCL'
  tipo_container?: string  // ex: 20DRY, 40HC
  quantidade: number
  peso_kg?: number
  cubagem_m3?: number
  data_embarque?: string   // ISO date
}

export interface CotacaoArmadorResponse {
  fornecedor_nome: string
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  valor_total: number
  transit_time_dias: number
  free_time_dias?: number
  transbordos: number
  escalas?: string
  validade_cotacao: string  // ISO date
  referencia_externa?: string
  detalhes: Array<{ tipo: string; nome: string; valor: number; moeda: string }>
}

export interface ArmadorConnector {
  nome: string
  ativo: boolean
  cotar(req: CotacaoArmadorRequest, config: ConnectorCredentials): Promise<CotacaoArmadorResponse | null>
  testarConexao(config: ConnectorCredentials): Promise<boolean>
}

interface ConnectorCredentials {
  base_url: string
  api_key: string
  auth_type: 'bearer' | 'basic' | 'api_key'
  headers_extra?: Record<string, string>
}

// --- Implementacoes (prontas para quando APIs estiverem disponiveis) ---

const mscConnector: ArmadorConnector = {
  nome: 'MSC',
  ativo: false, // Ativar quando API MSC estiver disponivel
  async cotar(req, config) {
    // TODO: Implementar quando MSC disponibilizar endpoint
    // POST {config.base_url}/api/v1/quotes
    // Headers: Authorization: Bearer {config.api_key}
    const response = await axios.post(`${config.base_url}/api/v1/quotes`, {
      origin: req.origem_codigo,
      destination: req.destino_codigo,
      containerType: req.tipo_container,
      quantity: req.quantidade,
      weight: req.peso_kg,
    }, {
      headers: {
        Authorization: `Bearer ${config.api_key}`,
        ...config.headers_extra,
      },
      timeout: 30000,
    })

    // Mapear resposta para formato padrao
    return {
      fornecedor_nome: 'MSC',
      moeda: response.data.currency ?? 'USD',
      valor_frete: response.data.freight ?? 0,
      taxas_origem: response.data.originCharges ?? 0,
      taxas_destino: response.data.destinationCharges ?? 0,
      valor_total: response.data.totalAmount ?? 0,
      transit_time_dias: response.data.transitTime ?? 0,
      free_time_dias: response.data.freeTime,
      transbordos: response.data.transshipments ?? 0,
      escalas: response.data.routeDetails,
      validade_cotacao: response.data.validUntil,
      referencia_externa: response.data.quoteId,
      detalhes: response.data.charges ?? [],
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

const maerskConnector: ArmadorConnector = {
  nome: 'Maersk',
  ativo: false,
  async cotar(req, config) {
    // Maersk Spot API
    const response = await axios.post(`${config.base_url}/products/ocean-products`, {
      origin: { unLocode: req.origem_codigo },
      destination: { unLocode: req.destino_codigo },
      containerType: req.tipo_container,
      quantity: req.quantidade,
      weight: { value: req.peso_kg, unit: 'KGS' },
    }, {
      headers: {
        'Consumer-Key': config.api_key,
        ...config.headers_extra,
      },
      timeout: 30000,
    })

    return {
      fornecedor_nome: 'Maersk',
      moeda: response.data.price?.currency ?? 'USD',
      valor_frete: response.data.price?.oceanFreight ?? 0,
      taxas_origem: response.data.price?.originCharges ?? 0,
      taxas_destino: response.data.price?.destinationCharges ?? 0,
      valor_total: response.data.price?.total ?? 0,
      transit_time_dias: response.data.transitTime?.days ?? 0,
      free_time_dias: response.data.demurrage?.freeDays,
      transbordos: response.data.route?.transshipments ?? 0,
      escalas: response.data.route?.via?.join(' > '),
      validade_cotacao: response.data.validTo,
      referencia_externa: response.data.offerId,
      detalhes: [],
    }
  },
  async testarConexao(config) {
    try {
      await axios.get(`${config.base_url}/health`, {
        headers: { 'Consumer-Key': config.api_key },
        timeout: 10000,
      })
      return true
    } catch {
      return false
    }
  },
}

// Registry de todos os connectors
export const armadorConnectors: Record<string, ArmadorConnector> = {
  msc: mscConnector,
  maersk: maerskConnector,
  // Adicionar novos armadores aqui:
  // cma_cgm: cmaCgmConnector,
  // hapag_lloyd: hapagLloydConnector,
  // one: oneConnector,
  // evergreen: evergreenConnector,
  // cosco: coscoConnector,
}

/**
 * Cotar com todos os armadores ativos que tem configuracao
 */
export async function cotarComArmadores(
  req: CotacaoArmadorRequest,
  configs: Array<{ nome: string; credentials: ConnectorCredentials }>
): Promise<CotacaoArmadorResponse[]> {
  const results: CotacaoArmadorResponse[] = []

  for (const config of configs) {
    const connector = armadorConnectors[config.nome.toLowerCase()]
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
