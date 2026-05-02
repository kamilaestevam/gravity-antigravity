/**
 * erp.ts — Connector ERP/SAP
 * Puxa pedidos de importacao/exportacao do ERP do cliente
 * e gera cotacoes automaticas quando dados estiverem completos.
 *
 * Suporta:
 * - SAP OData (S/4HANA)
 * - SAP RFC via HANA direto
 * - REST APIs genericas de ERPs
 */

import axios from 'axios'

export interface PedidoERP {
  referencia: string        // PO number
  tipo_operacao: 'IMPORTACAO' | 'EXPORTACAO'
  origem_codigo?: string
  origem_nome?: string
  origem_pais?: string
  destino_codigo?: string
  destino_nome?: string
  destino_pais?: string
  ncm?: string
  descricao_mercadoria?: string
  incoterm?: string
  peso_kg?: number
  cubagem_m3?: number
  quantidade?: number
  tipo_container?: string
  data_carga_pronta?: string // ISO date
  valor_mercadoria?: number
  moeda?: string
}

export interface ErpConnectorConfig {
  tipo: 'odata' | 'hana' | 'rest'
  base_url: string
  api_key?: string
  username?: string
  password?: string
  auth_type: 'bearer' | 'basic' | 'oauth2'
  entity_set?: string  // ex: "PurchaseOrders" para SAP OData
  field_mapping: {
    referencia: string
    tipo_operacao?: string
    origem?: string
    destino?: string
    ncm?: string
    descricao?: string
    incoterm?: string
    peso?: string
    data_carga_pronta?: string
  }
  filtros_extra?: string  // OData $filter ou query params
}

/**
 * Busca pedidos do ERP que estao prontos para cotacao
 */
export async function buscarPedidosERP(config: ErpConnectorConfig): Promise<PedidoERP[]> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (config.auth_type === 'bearer' && config.api_key) {
      headers['Authorization'] = `Bearer ${config.api_key}`
    } else if (config.auth_type === 'basic' && config.username && config.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
    }

    let url = config.base_url

    if (config.tipo === 'odata') {
      // SAP OData endpoint
      url = `${config.base_url}/${config.entity_set ?? 'PurchaseOrders'}`
      if (config.filtros_extra) url += `?$filter=${config.filtros_extra}`
    }

    const response = await axios.get(url, { headers, timeout: 30000 })

    const items = config.tipo === 'odata'
      ? (response.data.d?.results ?? response.data.value ?? [])
      : (Array.isArray(response.data) ? response.data : response.data.items ?? [])

    const fm = config.field_mapping

    return items.map((item: Record<string, unknown>) => ({
      referencia: item[fm.referencia] ?? '',
      tipo_operacao: item[fm.tipo_operacao ?? 'tipo_operacao'] ?? 'IMPORTACAO',
      origem_codigo: item[fm.origem ?? 'origem_codigo'],
      origem_nome: item[fm.origem ?? 'origem_nome'],
      destino_codigo: item[fm.destino ?? 'destino_codigo'],
      destino_nome: item[fm.destino ?? 'destino_nome'],
      ncm: item[fm.ncm ?? 'ncm'],
      descricao_mercadoria: item[fm.descricao ?? 'descricao'],
      incoterm: item[fm.incoterm ?? 'incoterm'],
      peso_kg: item[fm.peso ?? 'peso_kg'],
      data_carga_pronta: item[fm.data_carga_pronta ?? 'data_carga_pronta'],
    }))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[Connector:ERP] Erro ao buscar pedidos:`, msg)
    return []
  }
}

/**
 * Verifica se um pedido tem dados suficientes para gerar cotacao automatica
 */
export function pedidoProntoParaCotacao(pedido: PedidoERP): {
  pronto: boolean
  campos_faltantes: string[]
} {
  const obrigatorios = [
    { campo: 'origem_codigo', valor: pedido.origem_codigo },
    { campo: 'destino_codigo', valor: pedido.destino_codigo },
    { campo: 'descricao_mercadoria', valor: pedido.descricao_mercadoria },
    { campo: 'incoterm', valor: pedido.incoterm },
  ]

  const faltantes = obrigatorios.filter(c => !c.valor).map(c => c.campo)

  return {
    pronto: faltantes.length === 0,
    campos_faltantes: faltantes,
  }
}

/**
 * Testa conexao com o ERP
 */
export async function testarConexaoERP(config: ErpConnectorConfig): Promise<{
  ok: boolean
  latency_ms: number
  error?: string
  records_count?: number
}> {
  const start = Date.now()
  try {
    const headers: Record<string, string> = {}
    if (config.auth_type === 'bearer' && config.api_key) {
      headers['Authorization'] = `Bearer ${config.api_key}`
    } else if (config.auth_type === 'basic' && config.username && config.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
    }

    const url = config.tipo === 'odata'
      ? `${config.base_url}/${config.entity_set ?? 'PurchaseOrders'}?$top=1`
      : `${config.base_url}/health`

    const response = await axios.get(url, { headers, timeout: 15000 })
    return { ok: true, latency_ms: Date.now() - start, records_count: response.data?.d?.results?.length ?? 0 }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, latency_ms: Date.now() - start, error: msg }
  }
}
