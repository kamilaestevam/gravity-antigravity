/**
 * proxy-produtos.ts — Proxy de rotas externas (API pública → produtos)
 *
 * Fluxo:
 *   1. Cliente externo envia Bearer token (API token ou OAuth access_token)
 *   2. Este proxy valida o token via SHA-256 hash no banco ou sessao OAuth
 *   3. Extrai id_organizacao e escopo do token validado
 *   4. Idempotencia (POST) via Idempotency-Key / x-chave-idempotencia
 *   5. Repassa a chamada ao produto-alvo com headers S2S
 *
 * Aliases CPI: /api/v1/cockpit/v1/orders → pedidos
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../../generated/index.js'
import { hashToken } from '../crypto'
import { resolverSessaoOAuthPorToken } from '../lib/sessao-oauth-api'
import {
  consultarIdempotencia,
  extrairChaveIdempotencia,
  gravarIdempotencia,
  hashCorpoRequisicao,
} from '../lib/idempotencia-api'

export const proxyProdutosRouter = Router()
const prisma = new PrismaClient()

const CHAVE_INTERNA = process.env.CHAVE_INTERNA_SERVICO || ''

interface ProdutoConfig {
  baseUrl: string
  pathPrefix: string
}

const PRODUTOS: Record<string, ProdutoConfig> = {
  pedidos: {
    baseUrl: process.env.PEDIDO_SERVICE_URL || 'http://localhost:8030',
    pathPrefix: '/api/v1/pedidos',
  },
}

interface TokenValidado {
  id_organizacao: string
  escopo_api_token: string
}

async function validarBearerToken(authHeader: string | undefined): Promise<TokenValidado | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const tokenValor = authHeader.slice(7)
  if (!tokenValor) return null

  const sessaoOAuth = resolverSessaoOAuthPorToken(tokenValor)
  if (sessaoOAuth) {
    return {
      id_organizacao: sessaoOAuth.id_organizacao,
      escopo_api_token: sessaoOAuth.escopo_api_token,
    }
  }

  const hash = hashToken(tokenValor)

  const token = await prisma.apiToken.findFirst({
    where: { hash_api_token: hash },
    select: {
      id_organizacao: true,
      escopo_api_token: true,
      revogado_api_token: true,
      data_expiracao_api_token: true,
    },
  })

  if (!token) return null
  if (token.revogado_api_token) return null
  if (token.data_expiracao_api_token && token.data_expiracao_api_token < new Date()) return null

  return {
    id_organizacao: token.id_organizacao,
    escopo_api_token: token.escopo_api_token,
  }
}

function verificarEscopo(metodo: string, escopo: string): boolean {
  switch (escopo) {
    case 'LEITURA':
      return metodo === 'GET' || metodo === 'HEAD'
    case 'ESCRITA':
      return metodo !== 'DELETE'
    case 'EXCLUSAO':
      return true
    default:
      return false
  }
}

async function montarQueryStringProxy(req: Request, aliasOrders = false): string {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(req.query)) {
    if (typeof valor === 'string') params.set(chave, valor)
    else if (Array.isArray(valor)) valor.forEach((v) => params.append(chave, String(v)))
  }
  if (aliasOrders && params.has('updatedSince') && !params.has('data_atualizacao_desde')) {
    params.set('data_atualizacao_desde', params.get('updatedSince') ?? '')
    params.delete('updatedSince')
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function proxyParaProduto(
  req: Request,
  res: Response,
  next: NextFunction,
  produto: ProdutoConfig,
  tokenValidado: TokenValidado,
  subPath: string,
  aliasOrders = false,
): Promise<void> {
  try {
    const queryString = montarQueryStringProxy(req, aliasOrders)
    const url = `${produto.baseUrl}${produto.pathPrefix}${subPath}${queryString}`

    const headers: Record<string, string> = {
      'x-chave-interna-servico': CHAVE_INTERNA,
      'x-id-organizacao': tokenValidado.id_organizacao,
      'x-api-token-escopo': tokenValidado.escopo_api_token,
      'Content-Type': 'application/json',
    }

    const idWorkspace = req.headers['x-id-workspace']
    if (typeof idWorkspace === 'string' && idWorkspace.trim()) {
      headers['x-id-workspace'] = idWorkspace.trim()
    }

    const smokeSchemaPedido = req.headers['x-gravity-smoke-schema-pedido']
    if (typeof smokeSchemaPedido === 'string' && smokeSchemaPedido.trim()) {
      headers['x-gravity-smoke-schema-pedido'] = smokeSchemaPedido.trim()
    }

    const chaveIdempotencia = extrairChaveIdempotencia(req.headers)
    const hashCorpo =
      req.method !== 'GET' && req.method !== 'HEAD'
        ? hashCorpoRequisicao(req.body)
        : ''

    if (chaveIdempotencia && req.method === 'POST') {
      const cache = await consultarIdempotencia(
        prisma,
        tokenValidado.id_organizacao,
        chaveIdempotencia,
        hashCorpo,
      )
      if (cache && 'conflito' in cache) {
        res.status(409).json({
          error: 'Idempotency-Key reutilizada com corpo diferente',
          code: 'IDEMPOTENCY_CONFLICT',
        })
        return
      }
      if (cache && 'status' in cache) {
        res.status(cache.status).json(cache.body)
        return
      }
    }

    const init: RequestInit = {
      method: req.method,
      headers,
      signal: AbortSignal.timeout(30_000),
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body = JSON.stringify(req.body)
    }

    const response = await fetch(url, init)

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data: unknown = await response.json()

      if (chaveIdempotencia && req.method === 'POST' && response.status >= 200 && response.status < 300) {
        await gravarIdempotencia(prisma, {
          id_organizacao: tokenValidado.id_organizacao,
          chave: chaveIdempotencia,
          hashCorpo,
          status: response.status,
          body: data,
        })
      }

      res.status(response.status).json(data)
    } else {
      const text = await response.text()
      res.status(response.status).send(text)
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      res.status(504).json({ error: 'Produto nao respondeu a tempo', code: 'GATEWAY_TIMEOUT' })
      return
    }
    next(err)
  }
}

function subPathAposPrefixo(originalUrl: string, prefixo: string): string {
  const pathOnly = originalUrl.split('?')[0]
  const idx = pathOnly.indexOf(prefixo)
  if (idx === -1) return ''
  return pathOnly.slice(idx + prefixo.length) || ''
}

async function handlerPedidos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tokenValidado = await validarBearerToken(req.headers['authorization'])
    if (!tokenValidado) {
      res.status(401).json({ error: 'Token API invalido ou ausente', code: 'UNAUTHORIZED' })
      return
    }

    if (!verificarEscopo(req.method, tokenValidado.escopo_api_token)) {
      res.status(403).json({
        error: `Token com escopo ${tokenValidado.escopo_api_token} nao permite ${req.method}`,
        code: 'FORBIDDEN',
      })
      return
    }

    const produto = PRODUTOS['pedidos']
    const subPath = subPathAposPrefixo(req.originalUrl, '/pedidos')

    await proxyParaProduto(req, res, next, produto, tokenValidado, subPath)
  } catch (err) {
    next(err)
  }
}

async function handlerOrdersAlias(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tokenValidado = await validarBearerToken(req.headers['authorization'])
    if (!tokenValidado) {
      res.status(401).json({ error: 'Token API invalido ou ausente', code: 'UNAUTHORIZED' })
      return
    }

    if (!verificarEscopo(req.method, tokenValidado.escopo_api_token)) {
      res.status(403).json({
        error: `Token com escopo ${tokenValidado.escopo_api_token} nao permite ${req.method}`,
        code: 'FORBIDDEN',
      })
      return
    }

    const produto = PRODUTOS['pedidos']
    const subPath = subPathAposPrefixo(req.originalUrl, '/v1/orders')

    await proxyParaProduto(req, res, next, produto, tokenValidado, subPath, true)
  } catch (err) {
    next(err)
  }
}

proxyProdutosRouter.all('/pedidos', handlerPedidos)
proxyProdutosRouter.all('/pedidos/*', handlerPedidos)

proxyProdutosRouter.all('/v1/orders', handlerOrdersAlias)
proxyProdutosRouter.all('/v1/orders/*', handlerOrdersAlias)
