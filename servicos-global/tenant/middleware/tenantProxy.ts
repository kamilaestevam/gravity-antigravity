/**
 * tenantProxy.ts
 * AGENTE PROXY — Onda 4 | 1/4
 *
 * Sistema de proxy e agregação de tenant.
 * Roteia chamadas HTTP para o microserviço correto baseado em contracts.json.
 * Suporta ações assíncronas, retry com backoff exponencial e circuit breaker.
 *
 * Exporta apenas funções nomeadas — SEM default export.
 */

import http from 'node:http'
import https from 'node:https'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ServiceContract {
  baseUrl: string
  pathPrefix: string
}

export interface ContractsFile {
  services: Record<string, ServiceContract>
}

export interface ProxyRequest {
  method?: string
  url?: string
  headers?: Record<string, string | string[] | undefined>
  body?: Buffer | string | null
}

export interface QueuedAction {
  serviceKey: string
  payload: Record<string, unknown>
  enqueuedAt: number
}

/** Estado interno do circuit breaker por serviço */
interface CircuitBreakerState {
  failures: number
  isOpen: boolean
  openedAt: number | null
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const RETRY_DELAYS_MS = [1_000, 2_000, 4_000] // 3 tentativas: 1s / 2s / 4s
const CIRCUIT_BREAKER_THRESHOLD = 5          // abre após 5 falhas consecutivas
const CIRCUIT_BREAKER_RESET_MS  = 30_000     // tenta fechar após 30 s

// ---------------------------------------------------------------------------
// Carregamento de contracts.json
// ---------------------------------------------------------------------------

function loadContracts(): ContractsFile {
  const __dir = path.dirname(fileURLToPath(import.meta.url))
  // Sobe dois níveis: middleware/ → tenant/ → servicos-global/
  const contractsPath = path.resolve(__dir, '../../contracts.json')
  const raw = readFileSync(contractsPath, 'utf-8')
  return JSON.parse(raw) as ContractsFile
}

// Cache em memória — carregado uma vez por processo
let _contracts: ContractsFile | null = null

function getContracts(): ContractsFile {
  if (!_contracts) {
    _contracts = loadContracts()
  }
  return _contracts
}

/** Permite injetar contratos em testes sem tocar o sistema de arquivos */
export function _setContractsForTesting(contracts: ContractsFile): void {
  _contracts = contracts
}

export function _resetContracts(): void {
  _contracts = null
}

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------

const circuitBreakers = new Map<string, CircuitBreakerState>()

function getCircuitBreaker(serviceKey: string): CircuitBreakerState {
  if (!circuitBreakers.has(serviceKey)) {
    circuitBreakers.set(serviceKey, { failures: 0, isOpen: false, openedAt: null })
  }
  return circuitBreakers.get(serviceKey)!
}

function recordSuccess(serviceKey: string): void {
  const state = getCircuitBreaker(serviceKey)
  state.failures = 0
  state.isOpen   = false
  state.openedAt = null
}

function recordFailure(serviceKey: string): void {
  const state = getCircuitBreaker(serviceKey)
  state.failures += 1
  if (state.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    state.isOpen   = true
    state.openedAt = Date.now()
  }
}

function isCircuitOpen(serviceKey: string): boolean {
  const state = getCircuitBreaker(serviceKey)
  if (!state.isOpen) return false

  // Tenta half-open após timeout
  if (state.openedAt !== null && Date.now() - state.openedAt >= CIRCUIT_BREAKER_RESET_MS) {
    state.isOpen   = false
    state.failures = 0
    state.openedAt = null
    return false
  }

  return true
}

/** Expõe estado interno para testes */
export function _getCircuitBreakerState(serviceKey: string): CircuitBreakerState {
  return getCircuitBreaker(serviceKey)
}

export function _resetAllCircuitBreakers(): void {
  circuitBreakers.clear()
}

// ---------------------------------------------------------------------------
// Fila in-memory para ações assíncronas
// ---------------------------------------------------------------------------

const actionQueue: QueuedAction[] = []

/** Retorna snapshot da fila (somente leitura para testes) */
export function _getActionQueue(): ReadonlyArray<QueuedAction> {
  return actionQueue
}

export function _clearActionQueue(): void {
  actionQueue.length = 0
}

// ---------------------------------------------------------------------------
// Helpers HTTP
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Faz uma requisição HTTP/HTTPS e retorna { statusCode, headers, body }.
 * Rejeita a promise em caso de erro de rede.
 */
function httpRequest(options: http.RequestOptions, body?: Buffer | string | null): Promise<{
  statusCode: number
  headers: Record<string, string | string[] | undefined>
  body: Buffer
}> {
  return new Promise((resolve, reject) => {
    const transport = options.protocol === 'https:' ? https : http

    const req = transport.request(options, (res: IncomingMessage) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode ?? 500,
          headers   : res.headers as Record<string, string | string[] | undefined>,
          body      : Buffer.concat(chunks),
        })
      })
      res.on('error', reject)
    })

    req.on('error', reject)

    if (body) {
      req.write(body)
    }
    req.end()
  })
}

// ---------------------------------------------------------------------------
// createTenantProxy
// ---------------------------------------------------------------------------

/**
 * Roteia uma requisição Express/Node para o microserviço indicado por `serviceKey`.
 * Implementa retry com backoff exponencial (1 s / 2 s / 4 s) e circuit breaker.
 *
 * @param serviceKey  Chave do serviço em contracts.json (ex.: 'dashboard')
 * @param req         Objeto IncomingMessage do Node (ou compatible)
 * @param res         Objeto ServerResponse do Node (ou compatible)
 */
export async function createTenantProxy(
  serviceKey: string,
  req: IncomingMessage & ProxyRequest,
  res: ServerResponse,
): Promise<void> {
  const contracts = getContracts()
  const service   = contracts.services[serviceKey]

  if (!service) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `Serviço '${serviceKey}' não encontrado em contracts.json` }))
    return
  }

  if (isCircuitOpen(serviceKey)) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `Circuit breaker aberto para o serviço '${serviceKey}'` }))
    return
  }

  // Lê body da request, se houver
  const bodyBuffer = await new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    // Se o body já foi consumido (req não é um stream real), resolve vazio
    if (req.readableEnded) resolve(Buffer.alloc(0))
  })

  const targetUrl = new URL(service.baseUrl)
  const reqPath   = (req.url ?? '/').replace(/^\/api\/v1\/[^/]+/, service.pathPrefix)

  const options: http.RequestOptions = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port    : targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path    : reqPath,
    method  : req.method ?? 'GET',
    headers : {
      ...(req.headers as Record<string, string | string[]>),
      host: targetUrl.host,
    },
  }

  // Retry com backoff exponencial
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const upstream = await httpRequest(options, bodyBuffer.length > 0 ? bodyBuffer : null)
      recordSuccess(serviceKey)

      res.writeHead(upstream.statusCode, upstream.headers as http.OutgoingHttpHeaders)
      res.end(upstream.body)
      return
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      recordFailure(serviceKey)

      if (isCircuitOpen(serviceKey)) {
        res.writeHead(503, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          error: `Circuit breaker aberto para o serviço '${serviceKey}' após ${CIRCUIT_BREAKER_THRESHOLD} falhas`,
        }))
        return
      }

      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt])
      }
    }
  }

  // Todas as tentativas esgotadas
  res.writeHead(502, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    error  : `Falha ao conectar ao serviço '${serviceKey}' após ${RETRY_DELAYS_MS.length + 1} tentativas`,
    details: lastError?.message,
  }))
}

// ---------------------------------------------------------------------------
// enqueueTenantAction
// ---------------------------------------------------------------------------

/**
 * Enfileira uma ação assíncrona para o serviço indicado.
 * A ação é processada em background com retry e circuit breaker.
 *
 * @param serviceKey  Chave do serviço em contracts.json
 * @param payload     Dados da ação a ser executada
 */
export function enqueueTenantAction(
  serviceKey: string,
  payload: Record<string, unknown>,
): void {
  const contracts = getContracts()

  if (!contracts.services[serviceKey]) {
    throw new Error(`[enqueueTenantAction] Serviço '${serviceKey}' não encontrado em contracts.json`)
  }

  const action: QueuedAction = {
    serviceKey,
    payload,
    enqueuedAt: Date.now(),
  }

  actionQueue.push(action)

  // Processa em background sem bloquear o chamador
  void _processAction(action)
}

/**
 * Processa uma ação da fila com retry e circuit breaker.
 * Uso interno — exportado apenas para facilitar testes.
 */
export async function _processAction(action: QueuedAction): Promise<void> {
  const contracts = getContracts()
  const service   = contracts.services[action.serviceKey]
  if (!service) return

  if (isCircuitOpen(action.serviceKey)) return

  const targetUrl = new URL(service.baseUrl)
  const bodyStr   = JSON.stringify(action.payload)

  const options: http.RequestOptions = {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port    : targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path    : `${service.pathPrefix}/async`,
    method  : 'POST',
    headers : {
      'Content-Type'  : 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr).toString(),
    },
  }

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      await httpRequest(options, bodyStr)
      recordSuccess(action.serviceKey)
      return
    } catch {
      recordFailure(action.serviceKey)

      if (isCircuitOpen(action.serviceKey)) return
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt])
      }
    }
  }
}
