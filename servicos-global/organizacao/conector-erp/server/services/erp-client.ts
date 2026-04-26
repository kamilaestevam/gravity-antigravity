// server/services/erp-client.ts
// Orquestrador — busca credenciais, decripta, instancia ODataClient,
// envolve em CircuitBreaker + withRetry e atualiza status no banco.

import { prisma } from '../lib/prisma.js'
import { decrypt } from '../lib/crypto.js'
import { ODataClient, type ODataRequestOptions } from './odata-client.js'
import { getCircuitBreaker, resetCircuitBreaker } from '../lib/circuit-breaker.js'
import { withRetry } from '../lib/retry.js'
import { AppError } from '../lib/app-error.js'

export interface ErpQueryResult<T = unknown> {
  data: T[]
  latencyMs: number
  rowsReturned: number
}

/**
 * Executa uma query OData para um tenant/produto, com:
 *  - Decriptação de credenciais AES-256-GCM
 *  - Circuit breaker (5 falhas → abre)
 *  - Retry com backoff exponencial (1s → 4s → 16s)
 *  - Log persistido em ErpQueryLog
 */
export async function executeODataQuery<T = Record<string, unknown>>(
  tenantId: string,
  productId: string | null,
  query: ODataRequestOptions,
  triggeredBy: string
): Promise<ErpQueryResult<T>> {
  // 1. Buscar credenciais
  const conexao = await prisma.conexaoERP.findFirst({
    where: {
      tenant_id: tenantId,
      product_id: productId ?? undefined,
    },
  })

  if (!conexao) {
    throw new AppError(
      'Conexão ERP não configurada para este tenant/produto',
      404,
      'CONEXAO_NOT_FOUND'
    )
  }

  // 2. Recuperar circuit breaker (mantido em memória, inicializado do banco)
  const cbKey = `${tenantId}:${productId ?? 'global'}`
  const cb = getCircuitBreaker(cbKey, { failureThreshold: 5 })

  // Sincronizar estado do banco → memória
  if (conexao.circuit_breaker_open) {
    // já salvo como open — deixar o CircuitBreaker do cache cuidar
  }

  const start = Date.now()
  let latencyMs = 0
  let queryStatus: 'success' | 'error' = 'success'
  let errorMessage: string | undefined

  try {
    const result = await cb.execute(() =>
      withRetry(
        async () => {
          // Decriptar credenciais a cada tentativa para garantir key mais recente
          const password = decrypt(conexao.credentials_encrypted)
          const client = new ODataClient({
            baseUrl: conexao.base_url,
            username: conexao.username,
            password,
          })
          const data = await client.get<T>(query)
          return data
        },
        {
          maxAttempts: 3,
          baseDelayMs: 1000,
          multiplier: 4,
          onRetry: (attempt, delayMs) => {
            console.warn(
              `[CONECTOR_ERP] Retry ${attempt}/3 para ${cbKey} — aguardando ${delayMs}ms`
            )
          },
        }
      )
    )

    latencyMs = Date.now() - start

    // 3. Atualizar status no banco
    await prisma.conexaoERP.update({
      where: { id: conexao.id },
      data: {
        connection_status: 'ok',
        last_synced_at: new Date(),
        circuit_failures: 0,
        circuit_breaker_open: false,
        circuit_open_at: null,
        error_message: null,
      },
    })

    // 4. Salvar log de query
    await prisma.erpQueryLog.create({
      data: {
        tenant_id: tenantId,
        product_id: productId,
        query_type: 'odata',
        query_text: JSON.stringify(query),
        rows_returned: result.length,
        latency_ms: latencyMs,
        status: 'success',
        triggered_by: triggeredBy,
      },
    })

    return {
      data: result,
      latencyMs,
      rowsReturned: result.length,
    }
  } catch (err) {
    latencyMs = Date.now() - start
    queryStatus = 'error'
    errorMessage = err instanceof Error ? err.message : String(err)

    // 5. Persistir estado do circuit breaker no banco
    const cbState = cb.toJSON()
    await prisma.conexaoERP.update({
      where: { id: conexao.id },
      data: {
        connection_status: 'failed',
        circuit_failures: cbState.failures,
        circuit_breaker_open: cbState.state === 'OPEN',
        circuit_open_at: cbState.openedAt,
        error_message: errorMessage?.slice(0, 500),
      },
    })

    // 6. Salvar log de erro
    await prisma.erpQueryLog.create({
      data: {
        tenant_id: tenantId,
        product_id: productId,
        query_type: 'odata',
        query_text: JSON.stringify(query),
        latency_ms: latencyMs,
        status: 'error',
        error_message: errorMessage?.slice(0, 500),
        triggered_by: triggeredBy,
      },
    })

    throw err
  }
}

/**
 * Testa a conexão de um tenant/produto e persiste o resultado.
 */
export async function testarConexao(
  tenantId: string,
  productId: string | null
): Promise<{ ok: boolean; latencyMs: number; version?: string; error?: string }> {
  const conexao = await prisma.conexaoERP.findFirst({
    where: {
      tenant_id: tenantId,
      product_id: productId ?? undefined,
    },
  })

  if (!conexao) {
    throw new AppError('Conexão ERP não encontrada', 404, 'CONEXAO_NOT_FOUND')
  }

  try {
    const password = decrypt(conexao.credentials_encrypted)
    const client = new ODataClient({
      baseUrl: conexao.base_url,
      username: conexao.username,
      password,
    })

    const result = await client.testConnection()

    await prisma.conexaoERP.update({
      where: { id: conexao.id },
      data: {
        connection_status: result.ok ? 'ok' : 'failed',
        last_tested_at: new Date(),
        error_message: result.ok ? null : 'Teste de conexão falhou',
      },
    })

    // Resetar circuit breaker se conexão OK
    if (result.ok) {
      const cbKey = `${tenantId}:${productId ?? 'global'}`
      resetCircuitBreaker(cbKey)
      await prisma.conexaoERP.update({
        where: { id: conexao.id },
        data: {
          circuit_failures: 0,
          circuit_breaker_open: false,
          circuit_open_at: null,
        },
      })
    }

    return result
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    await prisma.conexaoERP.update({
      where: { id: conexao.id },
      data: {
        connection_status: 'failed',
        last_tested_at: new Date(),
        error_message: errorMessage.slice(0, 500),
      },
    })
    return { ok: false, latencyMs: 0, error: errorMessage }
  }
}
