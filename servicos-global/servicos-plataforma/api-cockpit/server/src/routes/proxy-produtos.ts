/**
 * proxy-produtos.ts — Proxy de rotas externas (API pública → produtos)
 *
 * Fluxo:
 *   1. Cliente externo envia Bearer token (gravity_token_api_producao_*)
 *   2. Este proxy valida o token via SHA-256 hash no banco
 *   3. Extrai id_organizacao e escopo do token validado
 *   4. Repassa a chamada ao produto-alvo com headers S2S:
 *      - x-chave-interna-servico (auth entre serviços)
 *      - x-id-organizacao (tenant do token)
 *      - x-api-token-escopo (LEITURA/ESCRITA/EXCLUSAO)
 *
 * NÃO usa requireInternalKey — chamada vem do cliente externo, não de outro serviço.
 *
 * Skill: antigravity-api-cockpit
 */

import { Router, Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../../generated/index.js'
import { hashToken } from '../crypto'

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

async function proxyParaProduto(
  req: Request,
  res: Response,
  next: NextFunction,
  produto: ProdutoConfig,
  tokenValidado: TokenValidado,
  subPath: string,
): Promise<void> {
  try {
    const url = `${produto.baseUrl}${produto.pathPrefix}${subPath}`

    const headers: Record<string, string> = {
      'x-chave-interna-servico': CHAVE_INTERNA,
      'x-id-organizacao': tokenValidado.id_organizacao,
      'x-api-token-escopo': tokenValidado.escopo_api_token,
      'Content-Type': 'application/json',
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

// ─── Proxy: /api/v1/cockpit/pedidos/* ────────────────────────────────────
proxyProdutosRouter.all('/pedidos', handler)
proxyProdutosRouter.all('/pedidos/*', handler)

async function handler(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    const subPath = req.path.replace(/^\/pedidos/, '') || ''

    await proxyParaProduto(req, res, next, produto, tokenValidado, subPath)
  } catch (err) {
    next(err)
  }
}
