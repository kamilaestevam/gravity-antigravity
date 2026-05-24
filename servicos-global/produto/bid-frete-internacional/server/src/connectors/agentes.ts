/**
 * agentes.ts — Connector abstrato para APIs de Agentes de Carga
 * Agentes de carga que ja possuem API propria.
 * Interface generica para qualquer agente com API REST.
 */

import axios from 'axios'

export interface CotacaoAgenteRequest {
  origem_codigo_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  modalidade_cotacao_bid_frete_internacional: string
  tipo_container_cotacao_bid_frete_internacional?: string
  quantidade_cotacao_bid_frete_internacional: number
  peso_kg_cotacao_bid_frete_internacional?: number
  cubagem_m3_cotacao_bid_frete_internacional?: number
  ncm_cotacao_bid_frete_internacional?: string
  incoterm_cotacao_bid_frete_internacional: string
  descricao: string
}

export interface CotacaoAgenteResponse {
  fornecedor_nome: string
  moeda_ganho_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  valor_total_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional?: number
  transbordos_proposta_bid_frete_internacional?: number
  escalas_proposta_bid_frete_internacional?: string
  validade_proposta_bid_frete_internacional: string
  referencia_externa?: string
  detalhes?: Array<{ tipo: string; nome: string; valor: number; moeda_ganho_bid_frete_internacional: string }>
}

interface AgenteConnectorConfig {
  base_url_integracao_bid_frete_internacional: string
  api_key: string
  tipo_autenticacao_integracao_bid_frete_internacional: 'bearer' | 'basic' | 'api_key' | 'oauth2'
  headers_extra_integracao_bid_frete_internacional?: Record<string, string>
  // Mapeamento de campos (cada agente pode ter schema diferente)
  field_mapping?: {
    origin?: string       // nome do campo de origem na API do agente
    destination?: string
    freight?: string
    total?: string
    transit_time?: string
  }
}

/**
 * Connector generico que funciona com qualquer agente que tenha API REST
 * O mapeamento de campos e configuravel por agente via ConnectorConfig no banco
 */
export async function cotarComAgente(
  req: CotacaoAgenteRequest,
  config: AgenteConnectorConfig
): Promise<CotacaoAgenteResponse | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers_extra_integracao_bid_frete_internacional,
    }

    if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'bearer') {
      headers['Authorization'] = `Bearer ${config.api_key}`
    } else if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'api_key') {
      headers['X-API-Key'] = config.api_key
    }

    // Payload padrao (pode ser customizado via field_mapping)
    const payload: Record<string, any> = {
      [config.field_mapping?.origin ?? 'origin']: req.origem_codigo_cotacao_bid_frete_internacional,
      [config.field_mapping?.destination ?? 'destination']: req.destino_codigo_cotacao_bid_frete_internacional,
      modal_cotacao_bid_frete_internacional: req.modal_cotacao_bid_frete_internacional,
      modalidade_cotacao_bid_frete_internacional: req.modalidade_cotacao_bid_frete_internacional,
      containerType: req.tipo_container_cotacao_bid_frete_internacional,
      quantity: req.quantidade_cotacao_bid_frete_internacional,
      weight: req.peso_kg_cotacao_bid_frete_internacional,
      volume: req.cubagem_m3_cotacao_bid_frete_internacional,
      ncm_cotacao_bid_frete_internacional: req.ncm_cotacao_bid_frete_internacional,
      incoterm_cotacao_bid_frete_internacional: req.incoterm_cotacao_bid_frete_internacional,
      description: req.descricao,
    }

    const response = await axios.post(`${config.base_url_integracao_bid_frete_internacional}/api/quotes`, payload, {
      headers,
      timeout: 30000,
    })

    const data = response.data

    return {
      fornecedor_nome: data.provider ?? data.agent ?? 'Agente API',
      moeda_ganho_bid_frete_internacional: data.currency ?? 'USD',
      valor_frete_proposta_bid_frete_internacional: data[config.field_mapping?.freight ?? 'freight'] ?? data.valor_frete_proposta_bid_frete_internacional ?? 0,
      taxas_origem_proposta_bid_frete_internacional: data.originCharges ?? data.taxas_origem_proposta_bid_frete_internacional ?? 0,
      taxas_destino_proposta_bid_frete_internacional: data.destinationCharges ?? data.taxas_destino_proposta_bid_frete_internacional ?? 0,
      valor_total_proposta_bid_frete_internacional: data[config.field_mapping?.total ?? 'total'] ?? data.valor_total_proposta_bid_frete_internacional ?? 0,
      dias_transito_proposta_bid_frete_internacional: data[config.field_mapping?.transit_time ?? 'transitTime'] ?? data.transit_time ?? 0,
      dias_free_time_proposta_bid_frete_internacional: data.freeTime ?? data.free_time,
      transbordos_proposta_bid_frete_internacional: data.transshipments ?? 0,
      escalas_proposta_bid_frete_internacional: data.routing ?? data.escalas_proposta_bid_frete_internacional,
      validade_proposta_bid_frete_internacional: data.validUntil ?? data.validade,
      referencia_externa: data.quoteId ?? data.reference,
      detalhes: data.charges ?? data.detalhes ?? [],
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[Connector:Agente] Erro ao cotar via ${config.base_url_integracao_bid_frete_internacional}:`, msg)
    return null
  }
}

/**
 * Testa conexao com a API do agente
 */
export async function testarConexaoAgente(config: AgenteConnectorConfig): Promise<{
  ok: boolean
  latency_ms: number
  error?: string
}> {
  const start = Date.now()
  try {
    const headers: Record<string, string> = { ...config.headers_extra_integracao_bid_frete_internacional }
    if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'bearer') headers['Authorization'] = `Bearer ${config.api_key}`
    else if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'api_key') headers['X-API-Key'] = config.api_key

    await axios.get(`${config.base_url_integracao_bid_frete_internacional}/health`, { headers, timeout: 10000 })
    return { ok: true, latency_ms: Date.now() - start }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, latency_ms: Date.now() - start, error: msg }
  }
}
