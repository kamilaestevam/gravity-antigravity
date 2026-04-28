/**
 * agentes.ts — Connector abstrato para APIs de Agentes de Carga
 * Agentes de carga que ja possuem API propria.
 * Interface generica para qualquer agente com API REST.
 */

import axios from 'axios'

export interface CotacaoAgenteRequest {
  origem_codigo: string
  destino_codigo: string
  modal: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  modalidade: string
  tipo_container?: string
  quantidade: number
  peso_kg?: number
  cubagem_m3?: number
  ncm?: string
  incoterm: string
  descricao: string
}

export interface CotacaoAgenteResponse {
  fornecedor_nome: string
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  valor_total: number
  transit_time_dias: number
  free_time_dias?: number
  transbordos?: number
  escalas?: string
  validade_cotacao: string
  referencia_externa?: string
  detalhes?: Array<{ tipo: string; nome: string; valor: number; moeda: string }>
}

interface AgenteConnectorConfig {
  base_url: string
  api_key: string
  auth_type: 'bearer' | 'basic' | 'api_key' | 'oauth2'
  headers_extra?: Record<string, string>
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
      ...config.headers_extra,
    }

    if (config.auth_type === 'bearer') {
      headers['Authorization'] = `Bearer ${config.api_key}`
    } else if (config.auth_type === 'api_key') {
      headers['X-API-Key'] = config.api_key
    }

    // Payload padrao (pode ser customizado via field_mapping)
    const payload: Record<string, any> = {
      [config.field_mapping?.origin ?? 'origin']: req.origem_codigo,
      [config.field_mapping?.destination ?? 'destination']: req.destino_codigo,
      modal: req.modal,
      modalidade: req.modalidade,
      containerType: req.tipo_container,
      quantity: req.quantidade,
      weight: req.peso_kg,
      volume: req.cubagem_m3,
      ncm: req.ncm,
      incoterm: req.incoterm,
      description: req.descricao,
    }

    const response = await axios.post(`${config.base_url}/api/quotes`, payload, {
      headers,
      timeout: 30000,
    })

    const data = response.data

    return {
      fornecedor_nome: data.provider ?? data.agent ?? 'Agente API',
      moeda: data.currency ?? 'USD',
      valor_frete: data[config.field_mapping?.freight ?? 'freight'] ?? data.valor_frete ?? 0,
      taxas_origem: data.originCharges ?? data.taxas_origem ?? 0,
      taxas_destino: data.destinationCharges ?? data.taxas_destino ?? 0,
      valor_total: data[config.field_mapping?.total ?? 'total'] ?? data.valor_total ?? 0,
      transit_time_dias: data[config.field_mapping?.transit_time ?? 'transitTime'] ?? data.transit_time ?? 0,
      free_time_dias: data.freeTime ?? data.free_time,
      transbordos: data.transshipments ?? 0,
      escalas: data.routing ?? data.escalas,
      validade_cotacao: data.validUntil ?? data.validade,
      referencia_externa: data.quoteId ?? data.reference,
      detalhes: data.charges ?? data.detalhes ?? [],
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[Connector:Agente] Erro ao cotar via ${config.base_url}:`, msg)
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
    const headers: Record<string, string> = { ...config.headers_extra }
    if (config.auth_type === 'bearer') headers['Authorization'] = `Bearer ${config.api_key}`
    else if (config.auth_type === 'api_key') headers['X-API-Key'] = config.api_key

    await axios.get(`${config.base_url}/health`, { headers, timeout: 10000 })
    return { ok: true, latency_ms: Date.now() - start }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, latency_ms: Date.now() - start, error: msg }
  }
}
