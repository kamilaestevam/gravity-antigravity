/**
 * pedidos.ts — Proxy para processos-core via REST API
 * Respeita isolamento de produto: NUNCA importar diretamente de servicos-global.
 * Comunicação entre serviços APENAS via REST API (agent-policy).
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'

export const pedidosRouter = Router()

const PROCESSOS_CORE_URL = process.env.PROCESSOS_CORE_URL ?? 'http://localhost:8030'

async function proxyToCore(
  req: Request,
  res: Response,
  next: NextFunction,
  path: string,
  method: string = req.method
): Promise<void> {
  try {
    const url = `${PROCESSOS_CORE_URL}/api/v1/pedidos${path}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-internal-key': process.env.INTERNAL_SERVICE_KEY ?? '',
      'x-tenant-id': (req.headers['x-tenant-id'] as string) ?? '',
      'x-user-id': (req.headers['x-user-id'] as string) ?? '',
    }

    if (req.headers['x-correlation-id']) {
      headers['x-correlation-id'] = req.headers['x-correlation-id'] as string
    }

    const fetchOpts: RequestInit = { method, headers }
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      fetchOpts.body = JSON.stringify(req.body)
    }

    const response = await fetch(url, fetchOpts)
    const data = await response.json()

    res.status(response.status).json(data)
  } catch (err) {
    next(err)
  }
}

// GET    /                    Listar pedidos
pedidosRouter.get('/', (req, res, next) => proxyToCore(req, res, next, '/'))

// GET    /:id                 Detalhe do pedido
pedidosRouter.get('/:id', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}`))

// POST   /                    Criar pedido
pedidosRouter.post('/', (req, res, next) => proxyToCore(req, res, next, '/'))

// PUT    /:id                 Atualizar pedido
pedidosRouter.put('/:id', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}`))

// DELETE /:id                 Deletar pedido
pedidosRouter.delete('/:id', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}`))

// PATCH  /:id/status          Transição de status
pedidosRouter.patch('/:id/status', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/status`))

// POST   /:id/duplicar        Duplicar pedido
pedidosRouter.post('/:id/duplicar', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/duplicar`))

// POST   /:id/itens           Adicionar item
pedidosRouter.post('/:id/itens', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/itens`))

// PUT    /:id/itens/:itemId   Atualizar item
pedidosRouter.put('/:id/itens/:itemId', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/itens/${req.params.itemId}`))

// DELETE /:id/itens/:itemId   Remover item
pedidosRouter.delete('/:id/itens/:itemId', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/itens/${req.params.itemId}`))

// PATCH  /:id/itens/:itemId/cancelar  Cancelar quantidade
pedidosRouter.patch('/:id/itens/:itemId/cancelar', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/itens/${req.params.itemId}/cancelar`))

// PATCH  /:id/itens/:itemId/pronta    Atualizar quantidade pronta
pedidosRouter.patch('/:id/itens/:itemId/pronta', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id}/itens/${req.params.itemId}/pronta`))
