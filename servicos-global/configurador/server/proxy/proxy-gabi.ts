// proxy-gabi.ts — Proxy reverso browser/S2S → sidecar GABI (:8009)
// Onda 0 PLANO-PLENITUDE-GABI-v2 — injeta chave interna + identidade do requireAuth

import type { Request, Response } from 'express'
import { request as httpRequest } from 'node:http'

export const GABI_UNAVAILABLE_CODE = 'GABI_UNAVAILABLE'

/** Timeout da resposta LLM (não confundir com indisponibilidade do sidecar — erro de conexão → 503). */
const GABI_PROXY_RESPONSE_TIMEOUT_MS = 120_000

/**
 * URL do sidecar GABI. Em Railway o sidecar sobe no mesmo container (loopback).
 * Dev com PM2 super-servidor: defina GABI_SERVICE_URL=http://localhost:3001 no .env.
 */
export function resolverUrlProxyGabi(): string {
  if (process.env.RAILWAY_ENVIRONMENT) {
    return 'http://127.0.0.1:8009'
  }
  return process.env.GABI_SERVICE_URL ?? 'http://127.0.0.1:8009'
}

export interface OpcoesProxyGabi {
  /** Rotas /admin do GABI validam só chave S2S no sidecar. */
  apenasChaveInterna?: boolean
}

export function proxyGabi(req: Request, res: Response, opcoes?: OpcoesProxyGabi): void {
  if (process.env.GABI_PROXY_ENABLED === 'false') {
    res.status(503).json({
      error: {
        code: GABI_UNAVAILABLE_CODE,
        message: 'GABI temporariamente indisponível.',
      },
    })
    return
  }

  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO
  if (!chaveInterna) {
    console.error('[proxy-gabi] CHAVE_INTERNA_SERVICO ausente')
    res.status(503).json({
      error: {
        code: GABI_UNAVAILABLE_CODE,
        message: 'GABI não configurada no Configurador.',
      },
    })
    return
  }

  const serviceUrl = resolverUrlProxyGabi()
  const targetUrl = `${serviceUrl}${req.originalUrl}`
  const host = serviceUrl.replace(/^https?:\/\//, '')

  const headers: Record<string, string | string[] | undefined> = { ...req.headers, host }
  headers['x-chave-interna-servico'] = chaveInterna
  delete headers['x-internal-key']

  if (!opcoes?.apenasChaveInterna && req.auth) {
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

  proxyReq.setTimeout(GABI_PROXY_RESPONSE_TIMEOUT_MS, () => {
    proxyReq.destroy()
    if (!res.headersSent) {
      res.status(504).json({
        error: {
          code: 'GABI_TIMEOUT',
          message: 'Tempo limite excedido aguardando resposta da GABI.',
        },
      })
    }
  })

  proxyReq.on('error', (err) => {
    const errno = (err as NodeJS.ErrnoException).code
    console.error('[proxy-gabi] erro ao conectar com sidecar', {
      code: errno,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
      id_organizacao: req.auth?.id_organizacao,
      upstream: serviceUrl,
    })
    if (!res.headersSent) {
      res.status(503).json({
        error: {
          code: GABI_UNAVAILABLE_CODE,
          message: 'Serviço GABI indisponível.',
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
