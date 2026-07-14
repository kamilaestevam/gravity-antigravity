// proxy-smart-read.ts — Proxy reverso browser → sidecar Smart Read (:8033)
// Injeta chave interna + identidade do requireAuth (paridade GABI).

import type { Request, Response } from 'express'
import { request as httpRequest } from 'node:http'

export const SMART_READ_UNAVAILABLE_CODE = 'SMART_READ_UNAVAILABLE'

const SMART_READ_PROXY_RESPONSE_TIMEOUT_MS = 660_000

export function resolverUrlProxySmartRead(): string {
  if (process.env.RAILWAY_ENVIRONMENT) {
    return 'http://127.0.0.1:8033'
  }
  return process.env.SMART_READ_SERVICE_URL ?? 'http://127.0.0.1:8033'
}

export function proxySmartRead(
  req: Request,
  res: Response,
  sidecarStatus?: Record<string, { ok: boolean; error?: string }>,
): void {
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO
  if (!chaveInterna) {
    console.error('[proxy-smart-read] CHAVE_INTERNA_SERVICO ausente')
    res.status(503).json({
      error: {
        code: SMART_READ_UNAVAILABLE_CODE,
        message: 'Smart Docs não configurado no Configurador.',
      },
    })
    return
  }

  const serviceUrl = resolverUrlProxySmartRead()
  const targetUrl = `${serviceUrl}${req.originalUrl}`
  const host = serviceUrl.replace(/^https?:\/\//, '')

  const headers: Record<string, string | string[] | undefined> = { ...req.headers, host }
  headers['x-chave-interna-servico'] = chaveInterna
  headers['x-internal-key'] = chaveInterna

  if (req.auth) {
    headers['x-id-organizacao'] = req.auth.id_organizacao
    headers['x-id-usuario'] = req.auth.id_usuario
    headers['x-tipo-usuario'] = req.auth.tipo_usuario
  }

  let bodyBuf: Buffer | undefined
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    bodyBuf = Buffer.from(JSON.stringify(req.body))
    headers['content-length'] = String(bodyBuf.length)
  }

  const proxyReq = httpRequest(targetUrl, { method: req.method, headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
    proxyRes.pipe(res)
  })

  proxyReq.setTimeout(SMART_READ_PROXY_RESPONSE_TIMEOUT_MS, () => {
    proxyReq.destroy()
    if (!res.headersSent) {
      res.status(408).json({
        error: {
          code: 'SMART_READ_TIMEOUT',
          message: 'Tempo limite excedido ao processar documento. Tente novamente.',
        },
      })
    }
  })

  proxyReq.on('error', (err) => {
    const errno = (err as NodeJS.ErrnoException).code
    console.error('[proxy-smart-read] erro ao conectar com sidecar', {
      code: errno,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
      id_organizacao: req.auth?.id_organizacao,
      upstream: serviceUrl,
    })
    if (!res.headersSent) {
      res.status(502).json({
        error: {
          code: SMART_READ_UNAVAILABLE_CODE,
          message: 'Smart Docs service unavailable',
          sidecar: sidecarStatus?.['smart-read'],
        },
      })
    }
  })

  if (bodyBuf) {
    proxyReq.end(bodyBuf)
  } else {
    req.pipe(proxyReq)
  }
}
