/**
 * pedidos.ts — Rotas CRUD de Pedido e PedidoItem
 *
 * Endpoint base: /api/v1/pedidos
 * Protegido por: requireInternalKey + tenantIsolation
 * Validacao: Zod em toda rota
 *
 * Rotas:
 *   GET    /                    Listar pedidos com itens
 *   GET    /:id                 Detalhe do pedido
 *   POST   /                    Criar pedido com itens
 *   PUT    /:id                 Atualizar pedido (Draft/Aberto)
 *   DELETE /:id                 Deletar pedido (Draft)
 *   PATCH  /:id/status          Transicao de status
 *   POST   /:id/duplicar        Duplicar pedido
 *   POST   /:id/itens           Adicionar item
 *   PUT    /:id/itens/:itemId   Atualizar item
 *   DELETE /:id/itens/:itemId   Remover item
 *   PATCH  /:id/itens/:itemId/cancelar  Cancelar quantidade
 *   PATCH  /:id/itens/:itemId/pronta    Atualizar quantidade pronta
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { saldoEngine, AppError } from '../services/saldoEngine.js'

export const pedidosRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const criarPedidoSchema = z.object({
  tipo_operacao: z.enum(['importacao', 'exportacao']),
  numero_pedido: z.string().min(1).max(100),
  importacao_exportador_id: z.string().optional().nullable(),
  exportacao_importador_id: z.string().optional().nullable(),
  incoterm: z.string().optional().nullable(),
  moeda_pedido: z.string().default('USD'),
  valor_total_pedido: z.number().optional().nullable(),
  casas_decimais_total_pedido: z.number().int().default(2),
  quantidade_total_pedido: z.number().optional().nullable(),
  casas_decimais_quantidade_total_pedido: z.number().int().default(2),
  unidade_comercializada_pedido: z.string().optional().nullable(),
  cobertura_cambial: z.string().default('com_cobertura'),
  condicao_pagamento: z.string().optional().nullable(),
  data_emissao_pedido: z.string().datetime().optional(),
  detalhes_operacionais: z.any().optional().nullable(),
  itens: z.array(z.object({
    part_number: z.string().min(1),
    ncm: z.string().min(1),
    descricao: z.string().min(1),
    quantidade_inicial: z.number().positive(),
    unidade_comercializada_item: z.string().optional().nullable(),
    moeda_item: z.string().default('USD'),
    valor_unitario: z.number().optional().nullable(),
    valor_item: z.number().optional().nullable(),
    casas_decimais_quantidade: z.number().int().default(2),
    casas_decimais_total_item: z.number().int().default(2),
    sequencia_item: z.number().int().optional().nullable(),
  })).min(1),
})

const atualizarPedidoSchema = criarPedidoSchema.partial().omit({ itens: true })

const atualizarItemSchema = z.object({
  part_number: z.string().min(1).optional(),
  ncm: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
  unidade_comercializada_item: z.string().optional().nullable(),
  moeda_item: z.string().optional(),
  valor_unitario: z.number().optional().nullable(),
  valor_item: z.number().optional().nullable(),
})

const cancelarQuantidadeSchema = z.object({
  quantidade: z.number().positive(),
})

const atualizarProntaSchema = z.object({
  quantidade_pronta: z.number().min(0),
})

const statusTransicaoSchema = z.object({
  status: z.enum(['draft', 'aberto', 'cancelado']),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
}

// ── GET / — Listar pedidos ────────────────────────────────────────────────────

pedidosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, tipo_operacao, busca, page = '1', limit = '20' } = req.query
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const where: Record<string, unknown> = { tenant_id, company_id }
    if (status) where.status = status
    if (tipo_operacao) where.tipo_operacao = tipo_operacao
    if (busca) {
      where.numero_pedido = { contains: busca as string, mode: 'insensitive' }
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [data, total] = await Promise.all([
      req.prisma.pedido.findMany({
        where,
        include: { itens: true },
        orderBy: { data_emissao_pedido: 'desc' },
        skip,
        take: Number(limit),
      }),
      req.prisma.pedido.count({ where }),
    ])

    res.json({ data, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// ── GET /:id — Detalhe do pedido ──────────────────────────────────────────────

pedidosRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    res.json(pedido)
  } catch (err) {
    next(err)
  }
})

// ── POST / — Criar pedido com itens ───────────────────────────────────────────

pedidosRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = criarPedidoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string
    const { itens, ...pedidoData } = result.data

    const pedido = await req.prisma.$transaction(async (tx) => {
      const pedidoId = gerarId('pedi')

      // Calcular totais automaticamente
      const valorTotal = itens.reduce((acc, item) => {
        const valorItem = item.valor_item ?? (item.valor_unitario ?? 0) * item.quantidade_inicial
        return acc + valorItem
      }, 0)

      const qtdTotal = itens.reduce((acc, item) => acc + item.quantidade_inicial, 0)

      const novoPedido = await tx.pedido.create({
        data: {
          id: pedidoId,
          tenant_id,
          company_id,
          ...pedidoData,
          valor_total_pedido: pedidoData.valor_total_pedido ?? valorTotal,
          quantidade_total_pedido: pedidoData.quantidade_total_pedido ?? qtdTotal,
          status: 'draft',
          itens: {
            create: itens.map((item, index) => ({
              id: gerarId('pite'),
              tenant_id,
              company_id,
              sequencia_item: item.sequencia_item ?? (index + 1) * 10,
              part_number: item.part_number,
              ncm: item.ncm,
              descricao: item.descricao,
              quantidade_inicial: item.quantidade_inicial,
              quantidade_atual: item.quantidade_inicial,
              quantidade_pronta: 0,
              quantidade_transferida: 0,
              quantidade_cancelada: 0,
              casas_decimais_quantidade: item.casas_decimais_quantidade,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_unitario: item.valor_unitario,
              valor_item: item.valor_item ?? (item.valor_unitario ?? 0) * item.quantidade_inicial,
              casas_decimais_total_item: item.casas_decimais_total_item,
            })),
          },
        },
        include: { itens: true },
      })

      return novoPedido
    })

    res.status(201).json(pedido)
  } catch (err) {
    next(err)
  }
})

// ── PUT /:id — Atualizar pedido ───────────────────────────────────────────────

pedidosRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = atualizarPedidoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    if (!['draft', 'aberto'].includes(pedido.status)) {
      throw new AppError(400, 'Pedido so pode ser editado nos status Draft ou Aberto')
    }

    const updated = await req.prisma.pedido.update({
      where: { id: req.params.id },
      data: result.data,
      include: { itens: true },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id — Deletar pedido ──────────────────────────────────────────────

pedidosRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    if (pedido.status !== 'draft') {
      throw new AppError(400, 'Apenas pedidos com status Draft podem ser deletados')
    }

    await req.prisma.pedido.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/status — Transicao de status ───────────────────────────────────

pedidosRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = statusTransicaoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Status invalido', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    // Validar transicoes permitidas
    const transicoesValidas: Record<string, string[]> = {
      draft: ['aberto', 'cancelado'],
      aberto: ['cancelado'],
    }

    const permitidas = transicoesValidas[pedido.status] ?? []
    if (!permitidas.includes(result.data.status)) {
      throw new AppError(400,
        `Transicao de "${pedido.status}" para "${result.data.status}" nao permitida`
      )
    }

    const updated = await req.prisma.pedido.update({
      where: { id: req.params.id },
      data: { status: result.data.status },
      include: { itens: true },
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── POST /:id/duplicar — Duplicar pedido ──────────────────────────────────────

pedidosRouter.post('/:id/duplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const original = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
      include: { itens: true },
    })

    if (!original) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    const novoPedidoId = gerarId('pedi')

    const duplicado = await req.prisma.pedido.create({
      data: {
        id: novoPedidoId,
        tenant_id,
        company_id,
        tipo_operacao: original.tipo_operacao,
        numero_pedido: `${original.numero_pedido}-COPIA`,
        status: 'draft',
        importacao_exportador_id: original.importacao_exportador_id,
        exportacao_importador_id: original.exportacao_importador_id,
        incoterm: original.incoterm,
        moeda_pedido: original.moeda_pedido,
        valor_total_pedido: original.valor_total_pedido,
        casas_decimais_total_pedido: original.casas_decimais_total_pedido,
        quantidade_total_pedido: original.quantidade_total_pedido,
        casas_decimais_quantidade_total_pedido: original.casas_decimais_quantidade_total_pedido,
        unidade_comercializada_pedido: original.unidade_comercializada_pedido,
        cobertura_cambial: original.cobertura_cambial,
        condicao_pagamento: original.condicao_pagamento,
        detalhes_operacionais: original.detalhes_operacionais,
        itens: {
          create: original.itens.map((item) => ({
            id: gerarId('pite'),
            tenant_id,
            company_id,
            sequencia_item: item.sequencia_item,
            part_number: item.part_number,
            ncm: item.ncm,
            descricao: item.descricao,
            quantidade_inicial: item.quantidade_inicial,
            quantidade_atual: item.quantidade_inicial,
            quantidade_pronta: 0,
            quantidade_transferida: 0,
            quantidade_cancelada: 0,
            casas_decimais_quantidade: item.casas_decimais_quantidade,
            unidade_comercializada_item: item.unidade_comercializada_item,
            moeda_item: item.moeda_item,
            valor_unitario: item.valor_unitario,
            valor_item: item.valor_item,
            casas_decimais_total_item: item.casas_decimais_total_item,
          })),
        },
      },
      include: { itens: true },
    })

    res.status(201).json(duplicado)
  } catch (err) {
    next(err)
  }
})

// ── POST /:id/itens — Adicionar item ──────────────────────────────────────────

pedidosRouter.post('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemSchema = criarPedidoSchema.shape.itens.element
    const result = itemSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    if (!['draft', 'aberto'].includes(pedido.status)) {
      throw new AppError(400, 'Itens so podem ser adicionados em pedidos Draft ou Aberto')
    }

    const item = await req.prisma.pedidoItem.create({
      data: {
        id: gerarId('pite'),
        tenant_id,
        company_id,
        pedido_id: req.params.id,
        ...result.data,
        quantidade_atual: result.data.quantidade_inicial,
        quantidade_pronta: 0,
        quantidade_transferida: 0,
        quantidade_cancelada: 0,
        valor_item: result.data.valor_item ?? (result.data.valor_unitario ?? 0) * result.data.quantidade_inicial,
      },
    })

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

// ── PUT /:id/itens/:itemId — Atualizar item ──────────────────────────────────

pedidosRouter.put('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = atualizarItemSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const item = await req.prisma.pedidoItem.findFirst({
      where: { id: req.params.itemId, pedido_id: req.params.id, tenant_id, company_id },
    })

    if (!item) {
      throw new AppError(404, 'Item do pedido nao encontrado')
    }

    const updated = await req.prisma.pedidoItem.update({
      where: { id: req.params.itemId },
      data: result.data,
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id/itens/:itemId — Remover item ──────────────────────────────────

pedidosRouter.delete('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const item = await req.prisma.pedidoItem.findFirst({
      where: { id: req.params.itemId, pedido_id: req.params.id, tenant_id, company_id },
    })

    if (!item) {
      throw new AppError(404, 'Item do pedido nao encontrado')
    }

    if (item.quantidade_transferida > 0) {
      throw new AppError(400, 'Item com quantidade transferida nao pode ser removido')
    }

    await req.prisma.pedidoItem.delete({ where: { id: req.params.itemId } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/cancelar — Cancelar quantidade ───────────────────

pedidosRouter.patch('/:id/itens/:itemId/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = cancelarQuantidadeSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const saldo = await saldoEngine.cancelar(req.prisma, {
      pedido_item_id: req.params.itemId,
      quantidade: result.data.quantidade,
      tenant_id,
      company_id,
    })

    res.json(saldo)
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/itens/:itemId/pronta — Atualizar quantidade pronta ─────────────

pedidosRouter.patch('/:id/itens/:itemId/pronta', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = atualizarProntaSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = req.headers['x-company-id'] as string

    const saldo = await saldoEngine.atualizarPronta(req.prisma, {
      pedido_item_id: req.params.itemId,
      quantidade_pronta: result.data.quantidade_pronta,
      tenant_id,
      company_id,
    })

    res.json(saldo)
  } catch (err) {
    next(err)
  }
})
