import { Request, Response, NextFunction } from 'express'
import { AcaoExecutadaPor } from '../../../generated/index.js'
import { AuditService } from '../services/audit.service.js'

export interface AuditMiddlewareOptions {
  module: string
  resource_type: string
  action: string
  action_detail?: string
  /**
   * Barreira 1 — ator OBRIGATÓRIO e explícito.
   * Nunca inferir do contexto HTTP. Declare sempre: 'USER', 'AI', 'JOB', 'API' ou 'INTEGRATION'.
   */
  actor_type: AcaoExecutadaPor
  actor_id?: string
  actor_name?: string
  /**
   * Ponto B — captura precisa do estado "antes".
   * Quando fornecida, esta função é chamada ANTES da execução do handler
   * para capturar o estado atual da entidade no banco.
   * Sem ela, `before` fica `undefined` no log.
   *
   * Exemplo:
   *   fetchBefore: (req) => prisma.order.findUnique({ where: { id: req.params.id } })
   */
  fetchBefore?: (req: Request) => Promise<unknown>
}

/**
 * Middleware de auditoria automático.
 * Envolve rotas mutáveis e captura: ator, IP, estado após a operação.
 *
 * Para capturar o estado "before" com precisão, os serviços devem
 * chamar AuditService.log() diretamente passando before/after explícitos.
 *
 * BARREIRA 1: actor_type é obrigatório — nunca inferido do contexto HTTP.
 * actor_id e actor_name podem vir do req.auth quando não fornecidos.
 */
export function auditMiddleware(opts: AuditMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.auth ?? {}

    const actor_type: AcaoExecutadaPor = opts.actor_type
    const actor_id: string = opts.actor_id ?? auth.userId ?? 'anonymous'
    const actor_name: string = opts.actor_name ?? auth.name ?? auth.userId ?? 'Unknown'

    // Ponto B: captura estado "antes" se fetchBefore fornecido
    let beforeState: unknown = undefined
    if (opts.fetchBefore) {
      try {
        beforeState = await opts.fetchBefore(req)
      } catch (err) {
        console.error('[auditMiddleware] Falha no fetchBefore (log continuará sem before):', err)
      }
    }

    const originalJson = res.json.bind(res)

    res.json = function (body: unknown): Response {
      setImmediate(() => {
        const statusCode = res.statusCode
        const isSuccess = statusCode >= 200 && statusCode < 300
        const isFailure = statusCode >= 400

        AuditService.log({
          tenant_id: auth.tenantId ?? (req.headers['x-tenant-id'] as string) ?? 'unknown',
          actor_type,
          actor_id,
          actor_name,
          actor_ip: req.ip,
          actor_metadata: {
            user_agent: req.headers['user-agent'],
            correlation_id: req.headers['x-correlation-id'],
          },
          module: opts.module,
          resource_type: opts.resource_type,
          resource_id: (body as any)?.id ?? req.params?.id,
          action: opts.action,
          action_detail: opts.action_detail ?? `${opts.action} em ${opts.resource_type}`,
          before: beforeState,
          after: isSuccess ? body : undefined,
          status: isFailure ? 'FAILURE' : isSuccess ? 'SUCCESS' : 'PARTIAL',
          error_message: isFailure ? (body as any)?.message : undefined,
          product_id: auth.productId,
          user_id: actor_type === AcaoExecutadaPor.USUARIO ? actor_id : undefined,
        }).catch((err) => console.error('[auditMiddleware]', err))
      })

      return originalJson(body)
    }

    next()
  }
}

/**
 * Wrapper para jobs internos (PG Boss workers).
 * Registra início, fim, sucesso e falha do job.
 */
export async function auditedJob<T>(
  jobName: string,
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now()

  try {
    const result = await fn()

    await AuditService.log({
      tenant_id: tenantId,
      actor_type: AcaoExecutadaPor.JOB,
      actor_id: jobName,
      actor_name: jobName,
      module: 'jobs',
      resource_type: 'job',
      action: 'JOB_SUCCESS',
      action_detail: `Job "${jobName}" concluído em ${Date.now() - startedAt}ms`,
      status: 'SUCCESS',
    })

    return result
  } catch (error) {
    await AuditService.log({
      tenant_id: tenantId,
      actor_type: AcaoExecutadaPor.JOB,
      actor_id: jobName,
      actor_name: jobName,
      module: 'jobs',
      resource_type: 'job',
      action: 'JOB_FAILURE',
      action_detail: `Job "${jobName}" falhou após ${Date.now() - startedAt}ms`,
      status: 'FAILURE',
      error_message: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}
