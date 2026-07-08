import { buscarNcmSimuladorPedido, validarNcmSimuladorPedido } from './motor-ncm-simulador-pedido'

const PREFIXOS_NCM = [
  '/api/v1/cadastros/ncm',
  '/api/v1/ncm',
] as const

let fetchOriginal: typeof window.fetch | null = null
let instalado = false

function resolverPathname(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname
  } catch {
    return url
  }
}

function prefixoNcm(pathname: string): string | null {
  for (const prefixo of PREFIXOS_NCM) {
    if (pathname === prefixo || pathname.startsWith(`${prefixo}/`)) {
      return prefixo
    }
  }
  return null
}

function responderJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function tratarRequisicaoNcm(pathname: string, search: string): Response | null {
  const prefixo = prefixoNcm(pathname)
  if (!prefixo) return null

  const restante = pathname.slice(prefixo.length)

  if (restante === '/buscar') {
    const params = new URLSearchParams(search)
    const q = params.get('q') ?? ''
    const limite = Number.parseInt(params.get('limite') ?? '20', 10)
    return responderJson(buscarNcmSimuladorPedido(q, limite))
  }

  const matchValidar = restante.match(/^\/(\d{8})\/validar$/)
  if (matchValidar) {
    return responderJson(validarNcmSimuladorPedido(matchValidar[1]))
  }

  return null
}

/**
 * Intercepta fetch para rotas NCM do Cadastros — paridade com proxy do produto Pedido.
 * Necessário no marketplace (SPA estática sem backend Cadastros).
 */
export function instalarMockApiNcmSimuladorPedido(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (instalado) return () => {}

  fetchOriginal = window.fetch.bind(window)
  instalado = true

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url

    const parsed = new URL(url, window.location.origin)
    const mock = tratarRequisicaoNcm(parsed.pathname, parsed.search)
    if (mock) return mock

    return fetchOriginal!(input, init)
  }

  return () => {
    if (fetchOriginal) window.fetch = fetchOriginal
    fetchOriginal = null
    instalado = false
  }
}
