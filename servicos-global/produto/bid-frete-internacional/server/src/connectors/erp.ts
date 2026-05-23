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
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO' | 'EXPORTACAO'
  origem_codigo_cotacao_bid_frete_internacional?: string
  origem_nome_cotacao_bid_frete_internacional?: string
  origem_pais_cotacao_bid_frete_internacional?: string
  destino_codigo_cotacao_bid_frete_internacional?: string
  destino_nome_cotacao_bid_frete_internacional?: string
  destino_pais_cotacao_bid_frete_internacional?: string
  ncm_cotacao_bid_frete_internacional?: string
  descricao_mercadoria_cotacao_bid_frete_internacional?: string
  incoterm_cotacao_bid_frete_internacional?: string
  peso_kg_cotacao_bid_frete_internacional?: number
  cubagem_m3_cotacao_bid_frete_internacional?: number
  quantidade_cotacao_bid_frete_internacional?: number
  tipo_container_cotacao_bid_frete_internacional?: string
  data_carga_pronta?: string // ISO date
  valor_mercadoria?: number
  moeda_ganho_bid_frete_internacional?: string
}

export interface ErpConnectorConfig {
  tipo: 'odata' | 'hana' | 'rest'
  base_url_integracao_bid_frete_internacional: string
  api_key?: string
  username?: string
  password?: string
  tipo_autenticacao_integracao_bid_frete_internacional: 'bearer' | 'basic' | 'oauth2'
  entity_set?: string  // ex: "PurchaseOrders" para SAP OData
  field_mapping: {
    referencia: string
    tipo_operacao_cotacao_bid_frete_internacional?: string
    origem?: string
    destino?: string
    ncm_cotacao_bid_frete_internacional?: string
    descricao?: string
    incoterm_cotacao_bid_frete_internacional?: string
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

    if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'bearer' && config.api_key) {
      headers['Authorization'] = `Bearer ${config.api_key}`
    } else if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'basic' && config.username && config.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
    }

    let url = config.base_url_integracao_bid_frete_internacional

    if (config.tipo === 'odata') {
      // SAP OData endpoint
      url = `${config.base_url_integracao_bid_frete_internacional}/${config.entity_set ?? 'PurchaseOrders'}`
      if (config.filtros_extra) url += `?$filter=${config.filtros_extra}`
    }

    const response = await axios.get(url, { headers, timeout: 30000 })

    const items = config.tipo === 'odata'
      ? (response.data.d?.results ?? response.data.value ?? [])
      : (Array.isArray(response.data) ? response.data : response.data.items ?? [])

    const fm = config.field_mapping

    return items.map((item: Record<string, unknown>) => ({
      referencia: item[fm.referencia] ?? '',
      tipo_operacao_cotacao_bid_frete_internacional: item[fm.tipo_operacao_cotacao_bid_frete_internacional ?? 'tipo_operacao_cotacao_bid_frete_internacional'] ?? 'IMPORTACAO',
      origem_codigo_cotacao_bid_frete_internacional: item[fm.origem ?? 'origem_codigo_cotacao_bid_frete_internacional'],
      origem_nome_cotacao_bid_frete_internacional: item[fm.origem ?? 'origem_nome_cotacao_bid_frete_internacional'],
      destino_codigo_cotacao_bid_frete_internacional: item[fm.destino ?? 'destino_codigo_cotacao_bid_frete_internacional'],
      destino_nome_cotacao_bid_frete_internacional: item[fm.destino ?? 'destino_nome_cotacao_bid_frete_internacional'],
      ncm_cotacao_bid_frete_internacional: item[fm.ncm_cotacao_bid_frete_internacional ?? 'ncm_cotacao_bid_frete_internacional'],
      descricao_mercadoria_cotacao_bid_frete_internacional: item[fm.descricao ?? 'descricao'],
      incoterm_cotacao_bid_frete_internacional: item[fm.incoterm_cotacao_bid_frete_internacional ?? 'incoterm_cotacao_bid_frete_internacional'],
      peso_kg_cotacao_bid_frete_internacional: item[fm.peso ?? 'peso_kg_cotacao_bid_frete_internacional'],
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
    { campo: 'origem_codigo_cotacao_bid_frete_internacional', valor: pedido.origem_codigo_cotacao_bid_frete_internacional },
    { campo: 'destino_codigo_cotacao_bid_frete_internacional', valor: pedido.destino_codigo_cotacao_bid_frete_internacional },
    { campo: 'descricao_mercadoria_cotacao_bid_frete_internacional', valor: pedido.descricao_mercadoria_cotacao_bid_frete_internacional },
    { campo: 'incoterm_cotacao_bid_frete_internacional', valor: pedido.incoterm_cotacao_bid_frete_internacional },
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
    if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'bearer' && config.api_key) {
      headers['Authorization'] = `Bearer ${config.api_key}`
    } else if (config.tipo_autenticacao_integracao_bid_frete_internacional === 'basic' && config.username && config.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
    }

    const url = config.tipo === 'odata'
      ? `${config.base_url_integracao_bid_frete_internacional}/${config.entity_set ?? 'PurchaseOrders'}?$top=1`
      : `${config.base_url_integracao_bid_frete_internacional}/health`

    const response = await axios.get(url, { headers, timeout: 15000 })
    return { ok: true, latency_ms: Date.now() - start, records_count: response.data?.d?.results?.length ?? 0 }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, latency_ms: Date.now() - start, error: msg }
  }
}
