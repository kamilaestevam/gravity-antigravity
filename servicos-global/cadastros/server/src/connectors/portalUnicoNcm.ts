/**
 * portalUnicoNcm.ts — Connector com o Portal Único Siscomex
 *
 * Dois endpoints:
 *
 * 1. Tabela completa (público, sem auth):
 *    GET https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json
 *    Retorna NCMs válidos com código + descrição. Usada pelo sync diário.
 *
 * 2. TTCE — Tratamento Tributário (requer mTLS + JWT):
 *    POST https://portalunico.siscomex.gov.br/ttce/api/ext/tratamentos-tributarios/importacao/
 *    Retorna alíquotas (II, IPI). PIS=2.1% e COFINS=9.65% são fixos por lei.
 *    Auth: certificado digital e-CNPJ → JWT via /portal/api/autenticar.
 */

import https from 'node:https'
import { gunzipSync, inflateSync, brotliDecompressSync } from 'node:zlib'
import axios from 'axios'
import { z } from 'zod'
import { AppError } from '../lib/app-error.js'
import { obterTokensSiscomex, type SiscomexTokens } from '../services/siscomex-auth.js'

// ── Constantes ───────────────────────────────────────────────────────────────

const CLASSIF_URL =
  process.env.PORTAL_UNICO_CLASSIF_URL ??
  'https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json'

const TTCE_URL =
  process.env.SISCOMEX_TTCE_URL ??
  'https://portalunico.siscomex.gov.br/ttce/api/ext'

const DOWNLOAD_TIMEOUT_MS = 60_000
const VALIDATE_TIMEOUT_MS = 15_000
const MAX_REDIRECTS_CLASSIF = 10
const MAX_DOWNLOAD_BYTES = 64 * 1024 * 1024

const CLASSIF_USER_AGENT =
  process.env.PORTAL_UNICO_CLASSIF_USER_AGENT ??
  'Gravity-NCM-Sync/1.0 (+https://usegravity.com.br; integracao-classif-publico)'

// OWASP A08: validação Zod pós-parse — resposta do TTCE (tratamentos tributários)
const ttceTributoSchema = z.object({
  codigo: z.union([z.number(), z.string()]),
}).optional()

const ttceTratamentoSchema = z.object({
  tributo: ttceTributoSchema,
  codigoTributo: z.union([z.number(), z.string()]).optional(),
  aliquotaAd: z.number().optional(),
  aliquota: z.number().optional(),
  percentual: z.number().optional(),
  regime: z.object({ aliquotaAd: z.number().optional() }).optional(),
  atributos: z.array(z.object({
    codigo: z.string().optional(),
    descricaoCodigo: z.string().optional(),
    valor: z.union([z.number(), z.string(), z.null()]).optional(),
  })).optional(),
})

const ttceResponseSchema = z.object({
  tratamentosTributarios: z.array(ttceTratamentoSchema).optional(),
  tratamentos: z.array(ttceTratamentoSchema).optional(),
})

// PIS e COFINS na importação são fixos por lei (Lei 10.865/2004)
const PIS_IMPORTACAO = 2.1
const COFINS_IMPORTACAO = 9.65

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface NcmItemRaw {
  codigo:     string
  descricao:  string
  dataInicio: string | null
  dataFim:    string | null
}

export interface NcmDetalhe {
  codigo:    string
  descricao: string
  ii:        number | null
  ipi:       number | null
  pis:       number | null
  cofins:    number | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizarItem(raw: Record<string, unknown>): NcmItemRaw {
  const codigo    = String(raw['Codigo']    ?? raw['codigo']    ?? '').replace(/\D/g, '')
  const descricao = String(raw['Descricao'] ?? raw['descricao'] ?? '').trim()
  const inicio    = (raw['DataInicio'] ?? raw['dataInicio'] ?? raw['Data_Inicio'] ?? null) as string | null
  const fim       = (raw['DataFim']    ?? raw['dataFim']    ?? raw['Data_Fim']    ?? null) as string | null

  return { codigo, descricao, dataInicio: inicio, dataFim: fim }
}

function parseAliquota(val: unknown): number | null {
  if (val == null) return null
  const n = typeof val === 'number' ? val : parseFloat(String(val))
  return Number.isFinite(n) ? n : null
}

function descomprimirCorpo(raw: Buffer, encoding: string | undefined): Buffer {
  if (!encoding) return raw
  const enc = encoding.toLowerCase()
  if (enc.includes('gzip')) return gunzipSync(raw)
  if (enc.includes('deflate')) return inflateSync(raw)
  if (enc.includes('br')) return brotliDecompressSync(raw)
  return raw
}

function extrairListaNomenclaturas(body: unknown): unknown[] {
  if (Array.isArray(body)) return body
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>
    const lista = obj.Nomenclaturas ?? obj.nomenclaturas
    if (Array.isArray(lista)) return lista
  }
  return []
}

function parsearItensNcm(body: unknown): NcmItemRaw[] {
  return extrairListaNomenclaturas(body)
    .map((item) => normalizarItem(item as Record<string, unknown>))
    .filter((i) => /^\d{8}$/.test(i.codigo) && i.descricao.length > 0)
}

/**
 * GET via native https — evita loop de redirects do axios no Railway e preserva URL/query.
 */
function getHttpsJson(url: URL, redirectsLeft = MAX_REDIRECTS_CLASSIF): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate, br',
          'User-Agent': CLASSIF_USER_AGENT,
        },
        timeout: DOWNLOAD_TIMEOUT_MS,
      },
      (res) => {
        const status = res.statusCode ?? 0
        const location = res.headers.location

        if (status >= 300 && status < 400 && location) {
          if (redirectsLeft <= 0) {
            reject(new AppError(
              'Erro ao acessar Portal Único: limite de redirects excedido.',
              502,
              'NCM_DOWNLOAD_REDIRECTS',
            ))
            res.resume()
            return
          }
          const next = new URL(location, url)
          res.resume()
          getHttpsJson(next, redirectsLeft - 1).then(resolve).catch(reject)
          return
        }

        const chunks: Buffer[] = []
        let total = 0
        res.on('data', (chunk: Buffer) => {
          total += chunk.length
          if (total > MAX_DOWNLOAD_BYTES) {
            req.destroy()
            reject(new AppError('Resposta NCM excede tamanho máximo permitido.', 502, 'NCM_DOWNLOAD_TOO_LARGE'))
            return
          }
          chunks.push(chunk)
        })
        res.on('end', () => {
          if (status < 200 || status >= 300) {
            const preview = Buffer.concat(chunks).toString('utf8', 0, 200)
            reject(new AppError(
              `Portal Único HTTP ${status}: ${preview}`,
              502,
              'NCM_DOWNLOAD_HTTP',
            ))
            return
          }

          try {
            const raw = Buffer.concat(chunks)
            const decoded = descomprimirCorpo(raw, res.headers['content-encoding'])
            const text = decoded.toString('utf8').trim()
            if (text.startsWith('<')) {
              reject(new AppError(
                'Portal Único retornou HTML em vez de JSON — possível bloqueio de rede ou URL incorreta.',
                502,
                'NCM_DOWNLOAD_HTML',
              ))
              return
            }
            resolve(JSON.parse(text) as unknown)
          } catch {
            reject(new AppError('Portal Único retornou JSON inválido.', 502, 'NCM_DOWNLOAD_PARSE'))
          }
        })
      },
    )
    req.on('error', (err) => reject(new AppError(
      `Erro ao acessar Portal Único: ${err.message}`,
      502,
      'NCM_DOWNLOAD_ERROR',
    )))
    req.on('timeout', () => {
      req.destroy()
      reject(new AppError('Timeout ao baixar tabela NCM do Portal Único.', 504, 'NCM_DOWNLOAD_TIMEOUT'))
    })
    req.end()
  })
}

function montarUrlClassif(): URL {
  const base = new URL(CLASSIF_URL)
  if (!base.searchParams.has('perfil')) {
    base.searchParams.set('perfil', 'PUBLICO')
  }
  return base
}

/**
 * POST via native https — necessário porque axios corrompe headers com chars base64
 * (o CSRF token contém +, /, = que o axios modifica silenciosamente).
 */
function postHttps(url: URL, body: string, tokens: SiscomexTokens): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      agent: tokens.httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json',
        Authorization: tokens.jwt,
        'X-CSRF-Token': tokens.csrfToken,
        'Role-Type': process.env.SISCOMEX_AUTH_ROLE ?? 'IMPEXP',
      },
      timeout: VALIDATE_TIMEOUT_MS,
    }, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => { data += chunk.toString() })
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          // OWASP A08: validação Zod pós-parse
          try {
            const parsed: unknown = JSON.parse(data)
            const validated = ttceResponseSchema.safeParse(parsed)
            resolve(validated.success ? validated.data : parsed)
          } catch { resolve(null) }
        } else if (res.statusCode === 404) {
          reject(new AppError('NCM não encontrado no TTCE', 404, 'TTCE_NOT_FOUND'))
        } else if (res.statusCode === 401) {
          reject(new AppError(`Token TTCE expirado: ${data.substring(0, 200)}`, 502, 'TTCE_AUTH_EXPIRED'))
        } else {
          reject(new AppError(`TTCE HTTP ${res.statusCode}: ${data.substring(0, 200)}`, 502, 'TTCE_HTTP_ERROR'))
        }
      })
    })
    req.on('error', (err) => reject(new AppError(`TTCE conexão falhou: ${err.message}`, 503, 'TTCE_CONNECT_ERROR')))
    req.on('timeout', () => { req.destroy(); reject(new AppError('TTCE timeout', 504, 'TTCE_TIMEOUT')) })
    req.write(body)
    req.end()
  })
}

// ── Funções públicas ─────────────────────────────────────────────────────────

/**
 * Baixa a tabela completa de NCMs do Portal Único (endpoint público).
 * Retorna apenas itens com código de 8 dígitos (NCM folha).
 */
export async function baixarTabelaNcm(): Promise<NcmItemRaw[]> {
  if (process.env.NCM_MOCK === 'true') {
    return gerarMockTabela()
  }

  try {
    const body = await getHttpsJson(montarUrlClassif())
    const itens = parsearItensNcm(body)

    if (itens.length === 0) {
      throw new AppError(
        'Portal Único retornou tabela NCM vazia — verifique a URL ou tente novamente.',
        502,
        'NCM_EMPTY_RESPONSE',
      )
    }

    return itens
  } catch (err: unknown) {
    if (err instanceof AppError) throw err
    throw new AppError('Erro inesperado ao baixar tabela NCM.', 500, 'NCM_UNEXPECTED')
  }
}

/**
 * Busca alíquotas de um NCM via TTCE (requer certificado ativo).
 * Retorna detalhes se válido, null se não encontrado ou sem certificado.
 */
export async function validarNcm(codigo: string): Promise<NcmDetalhe | null> {
  if (!/^\d{8}$/.test(codigo)) return null

  if (process.env.NCM_MOCK === 'true') {
    return codigo === '84713019'
      ? { codigo, descricao: 'Unidades digitais de processamento de pequena capacidade', ii: 14, ipi: 0, pis: PIS_IMPORTACAO, cofins: COFINS_IMPORTACAO }
      : null
  }

  try {
    const resultado = await buscarAliquotasTtce(codigo)
    return resultado
  } catch (err) {
    console.error(`[TTCE] validarNcm ERRO para ${codigo}:`, err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Busca alíquotas via TTCE com autenticação por certificado.
 * POST /tratamentos-tributarios/importacao/ com NCM + país + data.
 * codigoPais 249 = EUA (taxa MFN geral, sem preferência tarifária).
 */
export async function buscarAliquotasTtce(codigo: string): Promise<NcmDetalhe | null> {
  const tokens = await obterTokensSiscomex()

  const urlObj = new URL(`${TTCE_URL}/tratamentos-tributarios/importacao/`)
  const hoje = new Date().toISOString().split('T')[0]

  const body = JSON.stringify({
    ncm: codigo,
    codigoPais: 249,
    dataFatoGerador: hoje,
    tipoOperacao: 'I',
  })

  try {
    const data = await postHttps(urlObj, body, tokens)
    return extrairAliquotasDaResposta(codigo, data)
  } catch (err: unknown) {
    if (err instanceof AppError && err.statusCode === 404) return null
    if (err instanceof AppError && err.code === 'TTCE_AUTH_EXPIRED') throw err
    return null
  }
}

function extrairAliquotasDaResposta(codigo: string, data: unknown): NcmDetalhe | null {
  if (!data || typeof data !== 'object') return null

  let ii: number | null = null
  let ipi: number | null = null

  const tratamentos = (data as Record<string, unknown>).tratamentosTributarios
    ?? (data as Record<string, unknown>).tratamentos
    ?? (data as Record<string, unknown>)

  const lista = Array.isArray(tratamentos) ? tratamentos : [tratamentos]

  for (const trat of lista) {
    if (!trat || typeof trat !== 'object') continue
    const t = trat as Record<string, unknown>

    const tributo = t.tributo as Record<string, unknown> | undefined
    const codigoTributo = tributo?.codigo ?? t.codigoTributo
    const aliq = parseAliquota(t.aliquotaAd ?? t.aliquota ?? t.percentual
      ?? (t.regime as Record<string, unknown>)?.aliquotaAd)

    if (codigoTributo === 1 || codigoTributo === '1') { ii = aliq ?? ii }
    if (codigoTributo === 2 || codigoTributo === '2') { ipi = aliq ?? ipi }

    const atributos = t.atributos as Array<Record<string, unknown>> | undefined
    if (atributos) {
      for (const attr of atributos) {
        if (String(attr.codigo ?? '').includes('ALIQ') || String(attr.descricaoCodigo ?? '').includes('alíquota')) {
          const val = parseAliquota(attr.valor)
          if (val != null) {
            if (codigoTributo === 1 || codigoTributo === '1') ii = val
            if (codigoTributo === 2 || codigoTributo === '2') ipi = val
          }
        }
      }
    }
  }

  return {
    codigo,
    descricao: '',
    ii,
    ipi,
    pis: PIS_IMPORTACAO,
    cofins: COFINS_IMPORTACAO,
  }
}

/**
 * Busca alíquotas em lote para popular ncm_sync durante sync.
 * Respeita rate limiting (50ms entre requests).
 */
export async function buscarAliquotasEmLote(
  codigos: string[],
  onProgresso?: (processados: number, total: number) => void,
): Promise<Map<string, { ii: number | null; ipi: number | null; pis: number; cofins: number }>> {
  const resultado = new Map<string, { ii: number | null; ipi: number | null; pis: number; cofins: number }>()

  let tokens: SiscomexTokens
  try {
    tokens = await obterTokensSiscomex()
  } catch {
    return resultado
  }

  const hoje = new Date().toISOString().split('T')[0]
  const urlObj = new URL(`${TTCE_URL}/tratamentos-tributarios/importacao/`)

  for (let i = 0; i < codigos.length; i++) {
    const codigo = codigos[i]

    try {
      const body = JSON.stringify({
        ncm: codigo,
        codigoPais: 249,
        dataFatoGerador: hoje,
        tipoOperacao: 'I',
      })

      const data = await postHttps(urlObj, body, tokens)
      const detalhe = extrairAliquotasDaResposta(codigo, data)
      if (detalhe) {
        resultado.set(codigo, {
          ii: detalhe.ii,
          ipi: detalhe.ipi,
          pis: PIS_IMPORTACAO,
          cofins: COFINS_IMPORTACAO,
        })
      }
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'TTCE_AUTH_EXPIRED') {
        try {
          const { invalidarCacheToken } = await import('../services/siscomex-auth.js')
          invalidarCacheToken()
          tokens = await obterTokensSiscomex()
          i--
          continue
        } catch {
          break
        }
      }
    }

    if (onProgresso) onProgresso(i + 1, codigos.length)

    // Rate limiting: 50ms entre requests
    if (i < codigos.length - 1) {
      await new Promise(r => setTimeout(r, 50))
    }
  }

  return resultado
}

// ── Mock para testes ──────────────────────────────────────────────────────────

function gerarMockTabela(): NcmItemRaw[] {
  return [
    { codigo: '84713019', descricao: 'Unidades digitais de processamento', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '84715010', descricao: 'Unidades de processamento, exceto as das subposições 8471.41 e 8471.49', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '30049099', descricao: 'Outros medicamentos', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '72142000', descricao: 'Barras de ferro ou aço', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '85171210', descricao: 'Telefones para redes celulares', dataInicio: '2022-01-01', dataFim: null },
  ]
}
