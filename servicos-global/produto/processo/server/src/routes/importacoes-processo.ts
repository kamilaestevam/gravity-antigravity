/**
 * importacao.ts — Proxy para processos-core importação via REST API
 * Respeita isolamento de produto: NUNCA importar diretamente de servicos-global.
 * Comunicação entre serviços APENAS via REST API (agent-policy).
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'

export const importacaoRouter = Router()

const PROCESSOS_CORE_URL = process.env.PROCESSOS_CORE_URL ?? 'http://localhost:8030'

async function proxyToCore(
  req: Request,
  res: Response,
  next: NextFunction,
  path: string
): Promise<void> {
  try {
    const url = `${PROCESSOS_CORE_URL}/api/v1/pedidos${path}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-internal-key': process.env.CHAVE_INTERNA_SERVICO ?? '',
      'x-id-organizacao': (req.headers['x-id-organizacao'] as string) ?? '',
      'x-id-usuario': (req.headers['x-id-usuario'] as string) ?? '',
    }

    if (req.headers['x-correlation-id']) {
      headers['x-correlation-id'] = req.headers['x-correlation-id'] as string
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: JSON.stringify(req.body),
    })
    const data = await response.json()

    res.status(response.status).json(data)
  } catch (err) {
    next(err)
  }
}

// POST /importar          Upload + parse + preview
importacaoRouter.post('/importar', (req, res, next) => proxyToCore(req, res, next, '/importar'))

// POST /importar/confirmar  Confirmar e criar pedidos em batch
importacaoRouter.post('/importar/confirmar', (req, res, next) => proxyToCore(req, res, next, '/importar/confirmar'))

// POST /exportar           Exportar pedidos filtrados
importacaoRouter.post('/exportar', (req, res, next) => proxyToCore(req, res, next, '/exportar'))
