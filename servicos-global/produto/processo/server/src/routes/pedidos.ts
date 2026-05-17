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
      'x-internal-key': process.env.CHAVE_INTERNA_SERVICO ?? '',
      'x-id-organizacao': (req.headers['x-id-organizacao'] as string) ?? '',
      'x-id-usuario': (req.headers['x-id-usuario'] as string) ?? '',
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

// GET    /                    Listar processos
pedidosRouter.get('/', (req, res, next) => proxyToCore(req, res, next, '/'))

// GET    /:id_processo                 Detalhe do processo
pedidosRouter.get('/:id_processo', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}`))

// POST   /                    Criar processo
pedidosRouter.post('/', (req, res, next) => proxyToCore(req, res, next, '/'))

// PUT    /:id_processo                 Atualizar processo
pedidosRouter.put('/:id_processo', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}`))

// DELETE /:id_processo                 Deletar processo
pedidosRouter.delete('/:id_processo', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}`))

// PATCH  /:id_processo/status          Transição de status
pedidosRouter.patch('/:id_processo/status', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/status`))

// POST   /:id_processo/duplicar        Duplicar processo
pedidosRouter.post('/:id_processo/duplicar', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/duplicar`))

// POST   /:id_processo/itens           Adicionar item
pedidosRouter.post('/:id_processo/itens', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/itens`))

// PUT    /:id_processo/itens/:id_item_processo   Atualizar item
pedidosRouter.put('/:id_processo/itens/:id_item_processo', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/itens/${req.params.id_item_processo}`))

// DELETE /:id_processo/itens/:id_item_processo   Remover item
pedidosRouter.delete('/:id_processo/itens/:id_item_processo', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/itens/${req.params.id_item_processo}`))

// PATCH  /:id_processo/itens/:id_item_processo/cancelar  Cancelar quantidade
pedidosRouter.patch('/:id_processo/itens/:id_item_processo/cancelar', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/itens/${req.params.id_item_processo}/cancelar`))

// PATCH  /:id_processo/itens/:id_item_processo/marcar-pronta    Atualizar quantidade pronta
pedidosRouter.patch('/:id_processo/itens/:id_item_processo/marcar-pronta', (req, res, next) => proxyToCore(req, res, next, `/${req.params.id_processo}/itens/${req.params.id_item_processo}/pronta`))
