/**
 * analyticsAuth.ts — Autenticação para o endpoint Power BI
 *
 * O Power BI acessa /api/v1/analytics/pedido via Bearer token
 * (API Key gerada no Cockpit do tenant).
 * Não usa x-internal-key pois é acesso externo autenticado.
 */
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/**
 * Extrai tenant_id e valida o Bearer token da requisição Power BI.
 *
 * Headers esperados:
 *   Authorization: Bearer <api_key>
 *   x-tenant-id: <tenant_id>        (obrigatório)
 */
export function analyticsAuth(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.headers['x-tenant-id'] as string | undefined
  if (!tenantId) {
    return res.status(400).json({ error: 'x-tenant-id header obrigatorio' })
  }

  const authHeader = req.headers['authorization'] as string | undefined
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token obrigatorio', code: 'UNAUTHORIZED' })
  }

  const token = authHeader.slice(7)
  const expectedToken = process.env.ANALYTICS_API_KEY

  // Em produção: validar contra tabela api_keys no banco
  // Por hora: variável de ambiente por simplicidade de bootstrap
  if (!expectedToken) {
    console.warn('[Pedido/Analytics] ANALYTICS_API_KEY nao configurada — acesso bloqueado.')
    return res.status(503).json({ error: 'Endpoint de analytics nao configurado' })
  }

  if (!safeCompare(token, expectedToken)) {
    return res.status(401).json({ error: 'Token invalido', code: 'INVALID_TOKEN' })
  }

  ;(req as any).tenantId = tenantId
  next()
}
