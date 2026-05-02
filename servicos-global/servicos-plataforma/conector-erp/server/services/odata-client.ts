// server/services/odata-client.ts
// Cliente OData reutilizável — suporta SAP S/4HANA, ECC e qualquer sistema OData V2/V4.
// Funciona em conjunto com o CircuitBreaker e withRetry.

import { AppError } from '../lib/app-error.js'

export interface ODataCredentials {
  baseUrl: string
  username: string
  password: string  // DECRIPTADO — nunca persistir
}

export interface ODataRequestOptions {
  entity: string
  filter?: string
  select?: string[]
  orderby?: string
  top?: number
  skip?: number
  format?: 'json' | 'xml'
  headers?: Record<string, string>
}

export interface ODataResponse<T = unknown> {
  value?: T[]
  'd'?: { results: T[] }
  '@odata.nextLink'?: string
}

export class ODataClient {
  private readonly baseUrl: string
  private readonly authHeader: string

  constructor(creds: ODataCredentials) {
    this.baseUrl = creds.baseUrl.replace(/\/$/, '')
    this.authHeader =
      'Basic ' +
      Buffer.from(`${creds.username}:${creds.password}`).toString('base64')
  }

  /**
   * Constrói a URL com parâmetros OData.
   */
  private buildUrl(options: ODataRequestOptions): string {
    const params = new URLSearchParams()

    if (options.filter) params.set('$filter', options.filter)
    if (options.select?.length) params.set('$select', options.select.join(','))
    if (options.orderby) params.set('$orderby', options.orderby)
    if (options.top !== undefined) params.set('$top', String(options.top))
    if (options.skip !== undefined) params.set('$skip', String(options.skip))
    params.set('$format', options.format ?? 'json')

    const qs = params.toString()
    return `${this.baseUrl}/${options.entity}${qs ? `?${qs}` : ''}`
  }

  /**
   * Executa um GET OData retornando os resultados como array.
   */
  async get<T = Record<string, unknown>>(
    options: ODataRequestOptions,
    extraHeaders?: Record<string, string>
  ): Promise<T[]> {
    const url = this.buildUrl(options)

    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...extraHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      throw new AppError(
        `OData GET falhou: HTTP ${response.status} — ${body.slice(0, 200)}`,
        response.status >= 500 ? 502 : response.status,
        'ODATA_REQUEST_FAILED'
      )
    }

    const data = (await response.json()) as ODataResponse<T>

    // OData V4 → { value: [...] }
    if (Array.isArray(data.value)) return data.value

    // OData V2 (SAP) → { d: { results: [...] } }
    if (data.d?.results) return data.d.results

    // Fallback: retorno como array de um item
    return [data as T]
  }

  /**
   * Testa a conexão fazendo uma chamada ao $metadata.
   * Retorna latência em ms.
   */
  async testConnection(): Promise<{ ok: boolean; latencyMs: number; version?: string }> {
    const start = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/$metadata`, {
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/xml',
        },
      })

      const latencyMs = Date.now() - start

      if (!response.ok) {
        return { ok: false, latencyMs }
      }

      const text = await response.text()
      const version = text.match(/DataServiceVersion="([^"]+)"/)?.[1]

      return { ok: true, latencyMs, version }
    } catch {
      return { ok: false, latencyMs: Date.now() - start }
    }
  }
}
