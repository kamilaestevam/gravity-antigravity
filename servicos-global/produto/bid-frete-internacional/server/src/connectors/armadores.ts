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
  origem_codigo_cotacao_bid_frete_internacional: string    // UN/LOCODE
  destino_codigo_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: 'MARITIMO'
  modalidade_cotacao_bid_frete_internacional: 'FCL' | 'LCL'
  tipo_container_cotacao_bid_frete_internacional?: string  // ex: 20DRY, 40HC
  quantidade_cotacao_bid_frete_internacional: number
  peso_kg_cotacao_bid_frete_internacional?: number
  cubagem_m3_cotacao_bid_frete_internacional?: number
  data_embarque?: string   // ISO date
}

export interface CotacaoArmadorResponse {
  fornecedor_nome: string
  moeda_ganho_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  valor_total_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional?: number
  transbordos_proposta_bid_frete_internacional: number
  escalas_proposta_bid_frete_internacional?: string
  validade_proposta_bid_frete_internacional: string  // ISO date
  referencia_externa?: string
  detalhes: Array<{ tipo: string; nome: string; valor: number; moeda_ganho_bid_frete_internacional: string }>
}

export interface ArmadorConnector {
  nome: string
  ativo: boolean
  cotar(req: CotacaoArmadorRequest, config: ConnectorCredentials): Promise<CotacaoArmadorResponse | null>
  testarConexao(config: ConnectorCredentials): Promise<boolean>
}

interface ConnectorCredentials {
  base_url_integracao_bid_frete_internacional: string
  api_key: string
  tipo_autenticacao_integracao_bid_frete_internacional: 'bearer' | 'basic' | 'api_key'
  headers_extra_integracao_bid_frete_internacional?: Record<string, string>
}

// --- Implementacoes (prontas para quando APIs estiverem disponiveis) ---

const mscConnector: ArmadorConnector = {
  nome: 'MSC',
  ativo: false, // Ativar quando API MSC estiver disponivel
  async cotar(req, config) {
    // TODO: Implementar quando MSC disponibilizar endpoint
    // POST {config.base_url_integracao_bid_frete_internacional}/api/v1/quotes
    // Headers: Authorization: Bearer {config.api_key}
    const response = await axios.post(`${config.base_url_integracao_bid_frete_internacional}/api/v1/quotes`, {
      origin: req.origem_codigo_cotacao_bid_frete_internacional,
      destination: req.destino_codigo_cotacao_bid_frete_internacional,
      containerType: req.tipo_container_cotacao_bid_frete_internacional,
      quantity: req.quantidade_cotacao_bid_frete_internacional,
      weight: req.peso_kg_cotacao_bid_frete_internacional,
    }, {
      headers: {
        Authorization: `Bearer ${config.api_key}`,
        ...config.headers_extra_integracao_bid_frete_internacional,
      },
      timeout: 30000,
    })

    // Mapear resposta para formato padrao
    return {
      fornecedor_nome: 'MSC',
      moeda_ganho_bid_frete_internacional: response.data.currency ?? 'USD',
      valor_frete_proposta_bid_frete_internacional: response.data.freight ?? 0,
      taxas_origem_proposta_bid_frete_internacional: response.data.originCharges ?? 0,
      taxas_destino_proposta_bid_frete_internacional: response.data.destinationCharges ?? 0,
      valor_total_proposta_bid_frete_internacional: response.data.totalAmount ?? 0,
      dias_transito_proposta_bid_frete_internacional: response.data.transitTime ?? 0,
      dias_free_time_proposta_bid_frete_internacional: response.data.freeTime,
      transbordos_proposta_bid_frete_internacional: response.data.transshipments ?? 0,
      escalas_proposta_bid_frete_internacional: response.data.routeDetails,
      validade_proposta_bid_frete_internacional: response.data.validUntil,
      referencia_externa: response.data.quoteId,
      detalhes: response.data.charges ?? [],
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

const maerskConnector: ArmadorConnector = {
  nome: 'Maersk',
  ativo: false,
  async cotar(req, config) {
    // Maersk Spot API
    const response = await axios.post(`${config.base_url_integracao_bid_frete_internacional}/products/ocean-products`, {
      origin: { unLocode: req.origem_codigo_cotacao_bid_frete_internacional },
      destination: { unLocode: req.destino_codigo_cotacao_bid_frete_internacional },
      containerType: req.tipo_container_cotacao_bid_frete_internacional,
      quantity: req.quantidade_cotacao_bid_frete_internacional,
      weight: { value: req.peso_kg_cotacao_bid_frete_internacional, unit: 'KGS' },
    }, {
      headers: {
        'Consumer-Key': config.api_key,
        ...config.headers_extra_integracao_bid_frete_internacional,
      },
      timeout: 30000,
    })

    return {
      fornecedor_nome: 'Maersk',
      moeda_ganho_bid_frete_internacional: response.data.price?.currency ?? 'USD',
      valor_frete_proposta_bid_frete_internacional: response.data.price?.oceanFreight ?? 0,
      taxas_origem_proposta_bid_frete_internacional: response.data.price?.originCharges ?? 0,
      taxas_destino_proposta_bid_frete_internacional: response.data.price?.destinationCharges ?? 0,
      valor_total_proposta_bid_frete_internacional: response.data.price?.total ?? 0,
      dias_transito_proposta_bid_frete_internacional: response.data.transitTime?.days ?? 0,
      dias_free_time_proposta_bid_frete_internacional: response.data.demurrage?.freeDays,
      transbordos_proposta_bid_frete_internacional: response.data.route?.transshipments ?? 0,
      escalas_proposta_bid_frete_internacional: response.data.route?.via?.join(' > '),
      validade_proposta_bid_frete_internacional: response.data.validTo,
      referencia_externa: response.data.offerId,
      detalhes: [],
    }
  },
  async testarConexao(config) {
    try {
      await axios.get(`${config.base_url_integracao_bid_frete_internacional}/health`, {
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
