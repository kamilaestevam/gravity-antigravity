import { Request, Response, NextFunction } from 'express'
import { AcaoExecutadaPor } from '../../../generated/index.js'
import { AuditService } from '../services/audit.service.js'

export interface AuditMiddlewareOptions {
  modulo_historico_log: string
  tipo_recurso_historico_log: string
  acao_historico_log: string
  detalhe_acao_historico_log?: string
  /**
   * Barreira 1 — ator OBRIGATÓRIO e explícito.
   * Nunca inferir do contexto HTTP. Declare sempre: 'USUARIO', 'IA', 'JOB', 'API' ou 'INTEGRACAO'.
   */
  tipo_ator_historico_log: AcaoExecutadaPor
  id_ator_historico_log?: string
  nome_ator_historico_log?: string
  /**
   * Ponto B — captura precisa do estado "anterior".
   * Quando fornecida, esta função é chamada ANTES da execução do handler
   * para capturar o estado atual da entidade no banco.
   * Sem ela, `estado_anterior_historico_log` fica `undefined` no log.
   *
   * Exemplo:
   *   fetchBefore: (req) => prisma.order.findUnique({ where: { id: req.params.id } })
   */
  fetchBefore?: (req: Request) => Promise<unknown>
  /**
   * Lista de chaves a redatar no body antes de logar.
   * Default: DEFAULT_SENSITIVE_FIELDS (password, senha, token, secret, api_key, apiKey,
   * authorization, webhook_secret, webhookSecret, chave_api, clerk_secret, clerkSecret).
   * Match case-insensitive, recursivo em objetos aninhados e arrays.
   * Conforme skill `seguranca/seguranca-5-camadas` (camada 5).
   */
  sensitiveFields?: readonly string[]
  /**
   * Se false, omite estado_posterior_historico_log (loga só metadata: ator, IP, status, etc).
   * Default: true (loga body redatado).
   */
  captureBody?: boolean
  /**
   * Quando o middleware é montado num router que cobre múltiplos recursos,
   * derive o tipo_recurso a partir do path (ex: /organizacoes/:id → 'Organizacao').
   * Tem precedência sobre `tipo_recurso_historico_log` estático.
   */
  resourceTypeFromPath?: (req: Request) => string
}

export const DEFAULT_SENSITIVE_FIELDS = [
  'password', 'senha',
  'token', 'apiToken', 'api_token', 'authorization',
  'secret', 'webhookSecret', 'webhook_secret',
  'apiKey', 'api_key', 'chave_api',
  'clerk_secret', 'clerkSecret',
] as const

/**
 * Redação recursiva de campos sensíveis em qualquer estrutura JSON-like.
 * Substitui valores cujas chaves casem (case-insensitive) com `fields` por '***'.
 * Aplica-se a objetos aninhados e arrays. Ignora primitivos e null/undefined.
 */
export function redactSensitive(value: unknown, fields: readonly string[]): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, fields))
  if (typeof value !== 'object') return value
  const lowered = fields.map((f) => f.toLowerCase())
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (lowered.includes(k.toLowerCase())) {
      result[k] = '***'
    } else {
      result[k] = redactSensitive(v, fields)
    }
  }
  return result
}

/**
 * Middleware de auditoria automático.
 * Envolve rotas mutáveis e captura: ator, IP, estado após a operação.
 *
 * Para capturar o estado "anterior" com precisão, os serviços devem
 * chamar AuditService.log() diretamente passando estado_anterior_historico_log /
 * estado_posterior_historico_log explícitos.
 *
 * BARREIRA 1: tipo_ator_historico_log é obrigatório — nunca inferido do contexto HTTP.
 * id_ator_historico_log e nome_ator_historico_log podem vir do req.auth quando não fornecidos.
 */
export function auditMiddleware(opts: AuditMiddlewareOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req.auth ?? {}) as { id_usuario?: string; nome_usuario?: string; id_organizacao?: string }

    const tipo_ator_historico_log: AcaoExecutadaPor = opts.tipo_ator_historico_log
    const id_ator_historico_log: string = opts.id_ator_historico_log ?? auth.id_usuario ?? 'anonymous'
    const nome_ator_historico_log: string = opts.nome_ator_historico_log ?? auth.nome_usuario ?? auth.id_usuario ?? 'Unknown'

    // Ponto B: captura estado "anterior" se fetchBefore fornecido
    let beforeState: unknown = undefined
    if (opts.fetchBefore) {
      try {
        beforeState = await opts.fetchBefore(req)
      } catch (err) {
        console.error('[auditMiddleware] Falha no fetchBefore (log continuará sem estado_anterior_historico_log):', err)
      }
    }

    const originalJson = res.json.bind(res)

    res.json = function (body: unknown): Response {
      setImmediate(() => {
        const statusCode = res.statusCode
        const isSuccess = statusCode >= 200 && statusCode < 300
        const isFailure = statusCode >= 400

        const sensitiveFields = opts.sensitiveFields ?? DEFAULT_SENSITIVE_FIELDS
        const captureBody = opts.captureBody !== false
        const safeBody = captureBody && isSuccess ? redactSensitive(body, sensitiveFields) : undefined
        const safeError = isFailure ? redactSensitive(body, sensitiveFields) : undefined

        const tipoRecurso = opts.resourceTypeFromPath
          ? opts.resourceTypeFromPath(req)
          : opts.tipo_recurso_historico_log

        AuditService.log({
          id_organizacao: auth.id_organizacao ?? (req.headers['x-id-organizacao'] as string) ?? 'unknown',
          tipo_ator_historico_log,
          id_ator_historico_log,
          nome_ator_historico_log,
          ip_ator_historico_log: req.ip,
          metadata_ator_historico_log: {
            user_agent: req.headers['user-agent'],
            correlation_id: req.headers['x-correlation-id'],
            method: req.method,
            endpoint: req.originalUrl ?? req.url,
          },
          modulo_historico_log: opts.modulo_historico_log,
          tipo_recurso_historico_log: tipoRecurso,
          id_recurso_historico_log: (body as any)?.id ?? req.params?.id,
          acao_historico_log: opts.acao_historico_log,
          detalhe_acao_historico_log: opts.detalhe_acao_historico_log ?? `${opts.acao_historico_log} em ${tipoRecurso}`,
          estado_anterior_historico_log: beforeState,
          estado_posterior_historico_log: safeBody,
          status_historico_log: isFailure ? 'FALHA' : isSuccess ? 'SUCESSO' : 'PARCIAL',
          mensagem_erro_historico_log: isFailure ? (safeError as any)?.message : undefined,
          id_produto_historico_log: (auth as any).id_produto_historico_log,
          id_usuario: tipo_ator_historico_log === AcaoExecutadaPor.USUARIO ? id_ator_historico_log : undefined,
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
  id_organizacao: string,
  fn: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now()

  try {
    const result = await fn()

    await AuditService.log({
      id_organizacao,
      tipo_ator_historico_log: AcaoExecutadaPor.JOB,
      id_ator_historico_log: jobName,
      nome_ator_historico_log: jobName,
      modulo_historico_log: 'jobs',
      tipo_recurso_historico_log: 'job',
      acao_historico_log: 'CONCLUIR_JOB',
      detalhe_acao_historico_log: `Job "${jobName}" concluído em ${Date.now() - startedAt}ms`,
      status_historico_log: 'SUCESSO',
    })

    return result
  } catch (error) {
    await AuditService.log({
      id_organizacao,
      tipo_ator_historico_log: AcaoExecutadaPor.JOB,
      id_ator_historico_log: jobName,
      nome_ator_historico_log: jobName,
      modulo_historico_log: 'jobs',
      tipo_recurso_historico_log: 'job',
      acao_historico_log: 'FALHAR_JOB',
      detalhe_acao_historico_log: `Job "${jobName}" falhou após ${Date.now() - startedAt}ms`,
      status_historico_log: 'FALHA',
      mensagem_erro_historico_log: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}
