/**
 * pedidos.ts — Rotas CRUD de Pedido e PedidoItem
 *
 * Endpoint base: /api/v1/pedidos
 * Protegido por: requireInternalKey + tenantIsolation
 * Validacao: Zod em toda rota
 *
 * Rotas:
 *   GET    /                    Listar pedidos (offset ou cursor pagination)
 *   GET    /:id                 Detalhe do pedido
 *   POST   /                    Criar pedido com itens
 *   PUT    /:id                 Atualizar pedido (Draft/Aberto)
 *   DELETE /:id                 Deletar pedido (Draft)
 *   PATCH  /:id/status          Transicao de status
 *   PATCH  /:id/campo           Editar campo inline (cell editing)
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
  fabricante_id:            z.string().optional().nullable(),
  numero_proforma:          z.string().optional().nullable(),
  numero_invoice:           z.string().optional().nullable(),
  referencia_importador:    z.string().optional().nullable(),
  referencia_exportador:    z.string().optional().nullable(),
  referencia_fabricante:    z.string().optional().nullable(),
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
    part_number: z.string().optional().nullable().default(''),
    ncm: z.string().optional().nullable().default(''),
    descricao_item: z.string().optional().nullable().default(''),
    quantidade_inicial_pedido: z.number().min(0).optional().default(0),
    unidade_comercializada_item: z.string().optional().nullable(),
    moeda_item: z.string().default('USD'),
    valor_por_unidade_item: z.number().optional().nullable(),
    valor_total_item: z.number().optional().nullable(),
    casas_decimais_quantidade_item: z.number().int().default(2),
    casas_decimais_total_item: z.number().int().default(2),
    sequencia_item: z.number().int().optional().nullable(),
  })).optional().default([]),
})

const atualizarPedidoSchema = criarPedidoSchema.partial().omit({ itens: true })

const atualizarItemSchema = z.object({
  part_number: z.string().min(1).optional(),
  ncm: z.string().min(1).optional(),
  descricao_item: z.string().min(1).optional(),
  unidade_comercializada_item: z.string().optional().nullable(),
  moeda_item: z.string().optional(),
  valor_por_unidade_item: z.number().optional().nullable(),
  valor_total_item: z.number().optional().nullable(),
})

const cancelarQuantidadeSchema = z.object({
  quantidade: z.number().positive(),
})

const atualizarProntaSchema = z.object({
  quantidade_pronta_pedido: z.number().min(0),
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

/**
 * mapItem — Renomeia campos do Prisma para os aliases esperados pelo frontend.
 * Prisma usa nomes curtos (quantidade_inicial_pedido, quantidade_atual_pedido, …),
 * o frontend (types.ts / mockData) usa aliases descritivos.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(item: any): any {
  return {
    ...item,
    quantidade_inicial_item_pedido:   item.quantidade_inicial_pedido,
    saldo_item_pedido:                item.quantidade_atual_pedido,
    quantidade_pronta_total:          item.quantidade_pronta_pedido,
    quantidade_transferida_item:      item.quantidade_transferida_pedido,
    quantidade_cancelada_item_pedido: item.quantidade_cancelada_pedido,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPedido(pedido: any): any {
  if (!pedido) return pedido
  return {
    ...pedido,
    itens: Array.isArray(pedido.itens) ? pedido.itens.map(mapItem) : pedido.itens,
  }
}

// ── Cursor pagination helpers ─────────────────────────────────────────────────

// Campos suportados como sort key no cursor pagination
const CURSOR_SORT_FIELDS = ['data_emissao_pedido', 'numero_pedido', 'valor_total_pedido', 'created_at', 'updated_at'] as const
type CursorSortField = typeof CURSOR_SORT_FIELDS[number]

interface CursorPayload {
  sort_field: CursorSortField
  sort_value: unknown
  sort_dir: 'asc' | 'desc'
  id: string
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodeCursor(encoded: string): CursorPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as unknown
    if (
      typeof decoded !== 'object' || decoded === null ||
      !('sort_field' in decoded) || !('sort_value' in decoded) ||
      !('sort_dir' in decoded) || !('id' in decoded)
    ) {
      return null
    }
    const payload = decoded as CursorPayload
    if (!CURSOR_SORT_FIELDS.includes(payload.sort_field)) return null
    if (!['asc', 'desc'].includes(payload.sort_dir)) return null
    return payload
  } catch {
    return null
  }
}

// ── GET / — Listar pedidos ────────────────────────────────────────────────────
// Suporta dois modos de paginação:
//   - Cursor: ?cursor=<base64>&sort=data_emissao_pedido&dir=desc&limit=50
//   - Offset: ?page=1&limit=20 (backward compat)

pedidosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, tipo_operacao, busca, cursor, page, limit, sort, dir } = req.query
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const where: Record<string, unknown> = { tenant_id, company_id }
    if (status) {
      const statusList = (status as string).split(',').map(s => s.trim()).filter(Boolean)
      where.status = statusList.length > 1 ? { in: statusList } : statusList[0]
    }
    if (tipo_operacao) where.tipo_operacao = tipo_operacao
    if (busca) {
      where.numero_pedido = { contains: busca as string, mode: 'insensitive' }
    }

    // ── Cursor pagination ──
    if (cursor !== undefined) {
      const sortField = (CURSOR_SORT_FIELDS.includes(sort as CursorSortField) ? sort : 'data_emissao_pedido') as CursorSortField
      const sortDir = dir === 'asc' ? 'asc' : 'desc'
      const limitNum = Math.min(Math.max(Number(limit ?? 50), 1), 200)

      // Montar condição de keyset se cursor presente
      if (typeof cursor === 'string' && cursor.length > 0) {
        const payload = decodeCursor(cursor)
        if (!payload) {
          return res.status(400).json({ error: { message: 'Cursor invalido' } })
        }

        // WHERE (sort_field < last_val) OR (sort_field = last_val AND id < last_id)
        // Para sortDir=asc, usa-se > e para desc, usa-se <
        const op = payload.sort_dir === 'desc' ? 'lt' : 'gt'

        where.OR = [
          { [payload.sort_field]: { [op]: payload.sort_value } },
          {
            [payload.sort_field]: payload.sort_value,
            id: { [op]: payload.id },
          },
        ]
      }

      const data = await req.prisma.pedido.findMany({
        where,
        include: { itens: true },
        orderBy: [
          { [sortField]: sortDir },
          { id: sortDir },
        ],
        take: limitNum + 1, // busca +1 para saber se tem mais
      })

      const tem_mais = data.length > limitNum
      const registros = tem_mais ? data.slice(0, limitNum) : data

      let cursor_proximo: string | null = null
      if (tem_mais && registros.length > 0) {
        const ultimo = registros[registros.length - 1]
        cursor_proximo = encodeCursor({
          sort_field: sortField,
          sort_value: (ultimo as Record<string, unknown>)[sortField],
          sort_dir: sortDir,
          id: ultimo.id,
        })
      }

      return res.json({ data: registros.map(mapPedido), nextCursor: cursor_proximo, hasMore: tem_mais })
    }

    // ── Offset pagination (backward compat) ──
    const pageNum = Number(page ?? 1)
    const limitNum = Number(limit ?? 20)
    const skip = (pageNum - 1) * limitNum

    const [data, total] = await Promise.all([
      req.prisma.pedido.findMany({
        where,
        include: { itens: true },
        orderBy: { data_emissao_pedido: 'desc' },
        skip,
        take: limitNum,
      }),
      req.prisma.pedido.count({ where }),
    ])

    res.json({ data: data.map(mapPedido), total, page: pageNum, limit: limitNum })
  } catch (err) {
    next(err)
  }
})

// ── GET /:id — Detalhe do pedido ──────────────────────────────────────────────

pedidosRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    res.json(mapPedido(pedido))
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

    const tenant_id  = req.headers['x-tenant-id']  as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id
    const { itens, ...pedidoData } = result.data

    const pedido = await req.prisma.$transaction(async (tx) => {
      const pedidoId = gerarId('pedi')

      // Calcular totais automaticamente
      const valorTotal = itens.reduce((acc, item) => {
        const qty = item.quantidade_inicial_pedido ?? 0
        const valorItem = item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * qty
        return acc + valorItem
      }, 0)

      const qtdTotal = itens.reduce((acc, item) => acc + (item.quantidade_inicial_pedido ?? 0), 0)

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
              part_number: item.part_number ?? '',
              ncm: item.ncm ?? '',
              descricao_item: item.descricao_item ?? '',
              quantidade_inicial_pedido: item.quantidade_inicial_pedido ?? 0,
              quantidade_atual_pedido: item.quantidade_inicial_pedido ?? 0,
              quantidade_pronta_pedido: 0,
              quantidade_transferida_pedido: 0,
              quantidade_cancelada_pedido: 0,
              casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_por_unidade_item: item.valor_por_unidade_item,
              valor_total_item: item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * (item.quantidade_inicial_pedido ?? 0),
              casas_decimais_total_item: item.casas_decimais_total_item,
            })),
          },
        },
        include: { itens: true },
      })

      return novoPedido
    })

    res.status(201).json(mapPedido(pedido))
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
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

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

    res.json(mapPedido(updated))
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id — Deletar pedido ──────────────────────────────────────────────

pedidosRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

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
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

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

    res.json(mapPedido(updated))
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/campo — Editar campo inline (cell editing) ────────────────────

// Campos permitidos para edição inline
const CAMPOS_EDITAVEIS = new Set([
  'numero_pedido',
  'numero_proforma',
  'numero_invoice',
  'referencia_importador',
  'referencia_exportador',
  'referencia_fabricante',
  'incoterm',
  'moeda_pedido',
  'cobertura_cambial',
  'condicao_pagamento',
  'importacao_exportador_id',
  'exportacao_importador_id',
  'data_emissao_pedido',
  'campos_custom',
])

const editarCampoSchema = z.object({
  campo: z.string().min(1),
  valor: z.unknown(),
  updated_at: z.string().datetime(),
})

pedidosRouter.patch('/:id/campo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = editarCampoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const { campo, valor, updated_at } = result.data

    if (!CAMPOS_EDITAVEIS.has(campo)) {
      throw new AppError(400, `Campo "${campo}" nao pode ser editado inline. Campos permitidos: ${[...CAMPOS_EDITAVEIS].join(', ')}`)
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    // Verificar conflito otimista de atualização
    const updatedAtBanco = pedido.updated_at.toISOString()
    const updatedAtCliente = new Date(updated_at).toISOString()
    if (updatedAtBanco !== updatedAtCliente) {
      return res.status(409).json({
        error: {
          message: 'Conflito: pedido foi modificado por outro usuario',
          valor_atual: (pedido as Record<string, unknown>)[campo],
          updated_at_atual: updatedAtBanco,
        },
      })
    }

    // Para campos_custom: merge com existente
    let dadosUpdate: Record<string, unknown>
    if (campo === 'campos_custom') {
      if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
        throw new AppError(400, 'campos_custom deve ser um objeto')
      }
      const customAtual = (typeof pedido.campos_custom === 'object' && pedido.campos_custom !== null)
        ? pedido.campos_custom as Record<string, unknown>
        : {}
      dadosUpdate = { campos_custom: { ...customAtual, ...(valor as Record<string, unknown>) } }
    } else {
      dadosUpdate = { [campo]: valor }
    }

    const updated = await req.prisma.pedido.update({
      where: { id: req.params.id },
      data: dadosUpdate,
      include: { itens: true },
    })

    res.json(mapPedido(updated))
  } catch (err) {
    next(err)
  }
})

// ── POST /:id/duplicar — Duplicar pedido ──────────────────────────────────────

pedidosRouter.post('/:id/duplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

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
            descricao_item: item.descricao_item,
            quantidade_inicial_pedido: item.quantidade_inicial_pedido,
            quantidade_atual_pedido: item.quantidade_inicial_pedido,
            quantidade_pronta_pedido: 0,
            quantidade_transferida_pedido: 0,
            quantidade_cancelada_pedido: 0,
            casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
            unidade_comercializada_item: item.unidade_comercializada_item,
            moeda_item: item.moeda_item,
            valor_por_unidade_item: item.valor_por_unidade_item,
            valor_total_item: item.valor_total_item,
            casas_decimais_total_item: item.casas_decimais_total_item,
          })),
        },
      },
      include: { itens: true },
    })

    res.status(201).json(mapPedido(duplicado))
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
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

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
        quantidade_atual_pedido: result.data.quantidade_inicial_pedido,
        quantidade_pronta_pedido: 0,
        quantidade_transferida_pedido: 0,
        quantidade_cancelada_pedido: 0,
        valor_total_item: result.data.valor_total_item ?? (result.data.valor_por_unidade_item ?? 0) * result.data.quantidade_inicial_pedido,
      },
    })

    res.status(201).json(mapItem(item))
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
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

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

    res.json(mapItem(updated))
  } catch (err) {
    next(err)
  }
})

// ── DELETE /:id/itens/:itemId — Remover item ──────────────────────────────────

pedidosRouter.delete('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const item = await req.prisma.pedidoItem.findFirst({
      where: { id: req.params.itemId, pedido_id: req.params.id, tenant_id, company_id },
    })

    if (!item) {
      throw new AppError(404, 'Item do pedido nao encontrado')
    }

    if (item.quantidade_transferida_pedido > 0) {
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
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const saldo = await saldoEngine.cancelar(req.prisma, {
      pedido_item_id: req.params.itemId,
      quantidade: result.data.quantidade,
      tenant_id,
      company_id,
    })

    res.json(mapItem(saldo))
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
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const saldo = await saldoEngine.atualizarPronta(req.prisma, {
      pedido_item_id: req.params.itemId,
      quantidade_pronta_pedido: result.data.quantidade_pronta_pedido,
      tenant_id,
      company_id,
    })

    res.json(mapItem(saldo))
  } catch (err) {
    next(err)
  }
})
