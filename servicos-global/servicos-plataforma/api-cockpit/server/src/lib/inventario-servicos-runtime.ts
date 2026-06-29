/**
 * Inventário runtime de serviços deployados (sidecars / processo principal).
 *
 * Substitui a expansão linha-a-linha do contracts.json na aba Servidores do API Cockpit.
 * Em produção (Railway) cada entrada corresponde a um processo real no monólito;
 * o health-check usa loopback; a UI exibe o endpoint público canônico.
 */

export type TipoServicoInventario = 'PLATAFORMA' | 'PRODUTO_GRAVITY' | 'CONECTOR'

export interface EntradaInventarioServico {
  nome_servico_plataforma: string
  tipo_servico_plataforma: TipoServicoInventario
  /** Env com URL completa para GET /health (prioridade sobre porta_loopback_padrao). */
  env_var_url?: string
  porta_loopback_padrao: number
  /** Caminho público relativo ao domínio canônico; null = sidecar interno (sem URL browser). */
  path_endpoint_publico: string | null
}

export interface ServicoInventarioDescoberto {
  nome_servico_plataforma: string
  base_url_health_servico_plataforma: string
  endpoint_publico_servico_plataforma: string | null
  tipo_servico_plataforma: TipoServicoInventario
}

/** Sidecars e processo principal espelhados em configurador/server/index.ts */
export const INVENTARIO_SERVICOS_RUNTIME: EntradaInventarioServico[] = [
  {
    nome_servico_plataforma: 'configurador',
    tipo_servico_plataforma: 'PLATAFORMA',
    env_var_url: 'CONFIGURADOR_BASE_URL',
    porta_loopback_padrao: 8005,
    path_endpoint_publico: '/',
  },
  {
    nome_servico_plataforma: 'cadastros',
    tipo_servico_plataforma: 'PLATAFORMA',
    env_var_url: 'CADASTROS_SERVICE_URL',
    porta_loopback_padrao: 8031,
    path_endpoint_publico: '/api/v1/cadastros',
  },
  {
    nome_servico_plataforma: 'pedido',
    tipo_servico_plataforma: 'PRODUTO_GRAVITY',
    env_var_url: 'PEDIDO_SERVICE_URL',
    porta_loopback_padrao: 8030,
    path_endpoint_publico: '/api/v1/pedidos',
  },
  {
    nome_servico_plataforma: 'processo',
    tipo_servico_plataforma: 'PRODUTO_GRAVITY',
    env_var_url: 'PROCESSO_SERVICE_URL',
    porta_loopback_padrao: 8026,
    path_endpoint_publico: '/api/v1/processo',
  },
  {
    nome_servico_plataforma: 'bid-frete',
    tipo_servico_plataforma: 'PRODUTO_GRAVITY',
    env_var_url: 'BID_FRETE_SERVICE_URL',
    porta_loopback_padrao: 8023,
    path_endpoint_publico: '/api/v1/bid-frete-internacional',
  },
  {
    nome_servico_plataforma: 'smart-read',
    tipo_servico_plataforma: 'PRODUTO_GRAVITY',
    env_var_url: 'SMART_READ_SERVICE_URL',
    porta_loopback_padrao: 8033,
    path_endpoint_publico: '/smart-read',
  },
  {
    nome_servico_plataforma: 'gabi',
    tipo_servico_plataforma: 'PLATAFORMA',
    env_var_url: 'GABI_SERVICE_URL',
    porta_loopback_padrao: 8009,
    path_endpoint_publico: '/api/v1/gabi',
  },
  {
    nome_servico_plataforma: 'api-cockpit',
    tipo_servico_plataforma: 'PLATAFORMA',
    env_var_url: 'API_COCKPIT_SERVICE_URL',
    porta_loopback_padrao: 8016,
    path_endpoint_publico: null,
  },
  {
    nome_servico_plataforma: 'taxas-moeda',
    tipo_servico_plataforma: 'PLATAFORMA',
    env_var_url: 'TAXAS_MOEDA_URL',
    porta_loopback_padrao: 8032,
    path_endpoint_publico: null,
  },
]

export function dominioCanonico(): string {
  return process.env.CANONICAL_DOMAIN?.trim() || 'usegravity.com.br'
}

export function ehAmbienteProducao(): boolean {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT)
}

function resolverUrlHealth(entrada: EntradaInventarioServico): string {
  if (entrada.env_var_url) {
    const fromEnv = process.env[entrada.env_var_url]?.trim()
    if (fromEnv) return fromEnv.replace(/\/$/, '')
  }
  if (entrada.nome_servico_plataforma === 'configurador') {
    const configuradorUrl =
      process.env.CONFIGURADOR_URL?.trim() ||
      process.env.CONFIGURADOR_BASE_URL?.trim()
    if (configuradorUrl) return configuradorUrl.replace(/\/$/, '')
  }
  return `http://127.0.0.1:${entrada.porta_loopback_padrao}`
}

function resolverEndpointPublico(entrada: EntradaInventarioServico): string | null {
  if (!entrada.path_endpoint_publico) return null
  const dominio = dominioCanonico()
  const base = `https://${dominio}`
  if (entrada.path_endpoint_publico === '/') return base
  return `${base}${entrada.path_endpoint_publico}`
}

/** Lista serviços físicos do deploy atual (um registro por processo/sidecar). */
export function descobrirServicosInventario(): ServicoInventarioDescoberto[] {
  return INVENTARIO_SERVICOS_RUNTIME.map((entrada) => ({
    nome_servico_plataforma:              entrada.nome_servico_plataforma,
    base_url_health_servico_plataforma:   resolverUrlHealth(entrada),
    endpoint_publico_servico_plataforma: resolverEndpointPublico(entrada),
    tipo_servico_plataforma:              entrada.tipo_servico_plataforma,
  }))
}
