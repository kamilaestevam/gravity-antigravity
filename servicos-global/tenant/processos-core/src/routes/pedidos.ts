/**
 * pedidos.ts — Rotas CRUD de Pedido e PedidoItem
 *
 * Endpoint base: /api/v1/pedidos
 * Protegido por: requireInternalKey + tenantIsolation
 * Validacao: Zod em toda rota
 *
 * Rotas:
 *   GET    /                    Listar pedidos (offset ou cursor pagination)
 *   GET    /localizar           Contar total de matches find-in-page (pedidos + itens)
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

const criarItemSchema = z.object({
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
})

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
  itens: z.array(criarItemSchema).optional().default([]),
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
  // Alias do frontend para a quantidade inicial do item
  // Mapeado para Prisma field 'quantidade_inicial_pedido' no handler
  quantidade_inicial_item_pedido: z.number().min(0).optional(),
  // Dados físicos unitários
  peso_liquido_unitario: z.number().optional().nullable(),
  peso_bruto_unitario:   z.number().optional().nullable(),
  cubagem_unitaria:      z.number().optional().nullable(),
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
  return `${prefixo}_id_${seq}-${ano}`
}

/**
 * mapItem — Converte campos Decimal do Prisma para number e cria aliases esperados pelo frontend.
 * Os nomes dos campos já correspondem ao schema (nomes longos via @map no fragment.prisma).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapItem(item: any): any {
  return {
    ...item,
    // Campos Decimal do Prisma serializados como string no JSON → converter para number
    quantidade_inicial_pedido:        Number(item.quantidade_inicial_pedido ?? 0),
    quantidade_saldo_pedido:          Number(item.quantidade_saldo_pedido ?? 0),
    quantidade_pronta_pedido:         Number(item.quantidade_pronta_pedido ?? 0),
    quantidade_transferida_pedido:    Number(item.quantidade_transferida_pedido ?? 0),
    quantidade_cancelada_pedido:      Number(item.quantidade_cancelada_pedido ?? 0),
    valor_total_item:                 item.valor_total_item != null ? Number(item.valor_total_item) : null,
    valor_por_unidade_item:           item.valor_por_unidade_item != null ? Number(item.valor_por_unidade_item) : null,
    // Aliases adicionais esperados pelo frontend (types.ts PedidoItem)
    quantidade_inicial_item_pedido:   Number(item.quantidade_inicial_pedido ?? 0),
    quantidade_pronta_total:          Number(item.quantidade_pronta_pedido ?? 0),
    quantidade_transferida_item:      Number(item.quantidade_transferida_pedido ?? 0),
    quantidade_cancelada_item_pedido: Number(item.quantidade_cancelada_pedido ?? 0),
    // Dados físicos unitários (Decimal → number)
    peso_liquido_unitario: item.peso_liquido_unitario != null ? Number(item.peso_liquido_unitario) : null,
    peso_bruto_unitario:   item.peso_bruto_unitario   != null ? Number(item.peso_bruto_unitario)   : null,
    cubagem_unitaria:      item.cubagem_unitaria       != null ? Number(item.cubagem_unitaria)       : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPedido(pedido: any): any {
  if (!pedido) return pedido
  const itens = Array.isArray(pedido.itens) ? pedido.itens.map(mapItem) : pedido.itens
  const det = (pedido.detalhes_operacionais as Record<string, unknown> | null) ?? {}
  return {
    ...pedido,
    itens,
    // Campos armazenados em detalhes_operacionais → surfaçados como top-level
    exportador_nome: (det.exportador_nome as string | null | undefined) ?? null,
    importador_nome: (det.importador_nome as string | null | undefined) ?? null,
    fabricante_nome: (det.fabricante_nome as string | null | undefined) ?? null,
    // Alias: Prisma usa quantidade_total_pedido; frontend espera quantidade_total_inicial_pedido
    quantidade_total_inicial_pedido: pedido.quantidade_total_pedido ?? null,
    // Virtual: somatório de quantidade_pronta dos itens (não persistido no Pedido)
    quantidade_pronta_itens_pedido_total: Array.isArray(itens)
      ? itens.reduce((s: number, i: any) => s + Number(i.quantidade_pronta_total ?? 0), 0)
      : (pedido.quantidade_pronta_itens_pedido_total ?? null),
  }
}

// ── Cursor pagination helpers ─────────────────────────────────────────────────

// Campos suportados como sort key no cursor pagination
export const CURSOR_SORT_FIELDS = ['data_emissao_pedido', 'numero_pedido', 'valor_total_pedido', 'created_at', 'updated_at'] as const
export type CursorSortField = typeof CURSOR_SORT_FIELDS[number]

export interface CursorPayload {
  sort_field: CursorSortField
  sort_value: unknown
  sort_dir: 'asc' | 'desc'
  id: string
}

export function encodeCursor(payload: CursorPayload): string {
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

    const where: Record<string, unknown> = { tenant_id, company_id, deleted_at: null }
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
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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

// ── GET /localizar — Contar total de matches find-in-page (pedidos + itens) ───
// Deve ficar ANTES de /:id para que Express não interprete "localizar" como param.

pedidosRouter.get('/localizar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const localizarSchema = z.object({
      termo:         z.string().min(1).max(200),
      status:        z.string().optional(),
      tipo_operacao: z.string().optional(),
      busca:         z.string().optional(),
    })
    const result = localizarSchema.safeParse(req.query)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Parametros invalidos', details: result.error.flatten() } })
    }

    const { termo, status, tipo_operacao, busca } = result.data
    const tenant_id  = req.headers['x-tenant-id']  as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const where: Record<string, unknown> = { tenant_id, company_id, deleted_at: null }
    if (status) {
      const statusList = status.split(',').map(s => s.trim()).filter(Boolean)
      where.status = statusList.length > 1 ? { in: statusList } : statusList[0]
    }
    if (tipo_operacao) where.tipo_operacao = tipo_operacao
    if (busca) where.numero_pedido = { contains: busca, mode: 'insensitive' }

    const t = termo.toLowerCase()

    const pedidos = await req.prisma.pedido.findMany({
      where,
      select: {
        numero_pedido:         true,
        status:                true,
        incoterm:              true,
        moeda_pedido:          true,
        numero_proforma:       true,
        numero_invoice:        true,
        referencia_importador: true,
        referencia_exportador: true,
        referencia_fabricante: true,
        detalhes_operacionais: true,
        itens: {
          select: {
            part_number:                 true,
            ncm:                         true,
            descricao_item:              true,
            unidade_comercializada_item: true,
            moeda_item:                  true,
          },
        },
      },
    })

    let total = 0
    for (const p of pedidos) {
      const camposPedido = [
        p.numero_pedido, p.status, p.incoterm, p.moeda_pedido,
        p.numero_proforma, p.numero_invoice,
        p.referencia_importador, p.referencia_exportador, p.referencia_fabricante,
      ]
      for (const v of camposPedido) {
        if (v && v.toLowerCase().includes(t)) total++
      }
      // detalhes_operacionais: exportador_nome, importador_nome, fabricante_nome
      const det = (p.detalhes_operacionais as Record<string, unknown> | null) ?? {}
      for (const k of ['exportador_nome', 'importador_nome', 'fabricante_nome']) {
        const v = det[k]
        if (v && typeof v === 'string' && v.toLowerCase().includes(t)) total++
      }
      // Itens do pedido
      for (const item of p.itens) {
        const camposItem = [
          item.part_number, item.ncm, item.descricao_item,
          item.unidade_comercializada_item, item.moeda_item,
        ]
        for (const v of camposItem) {
          if (v && v.toLowerCase().includes(t)) total++
        }
      }
    }

    res.json({ total })
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
              sequencia_item: item.sequencia_item ?? (index + 1),
              part_number: item.part_number ?? '',
              ncm: item.ncm ?? '',
              descricao_item: item.descricao_item ?? '',
              quantidade_inicial_pedido: item.quantidade_inicial_pedido ?? 0,
              quantidade_saldo_pedido: item.quantidade_inicial_pedido ?? 0,
              casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_por_unidade_item: item.valor_por_unidade_item,
              valor_total_item: item.valor_total_item ?? (item.valor_por_unidade_item ?? 0) * (item.quantidade_inicial_pedido ?? 0),
              casas_decimais_total_item: item.casas_decimais_total_item,
            })),
          },
        },
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    res.json(mapPedido(updated))
  } catch (err) {
    next(err)
  }
})

// ── PATCH /:id/campo — Editar campo inline (cell editing) ────────────────────

// Campos editados diretamente no banco via PATCH /:id/campo
const CAMPOS_EDITAVEIS = new Set([
  'numero_pedido',
  'numero_proforma',
  'numero_invoice',
  'referencia_importador',
  'referencia_exportador',
  'referencia_fabricante',
  // exportador_nome e importador_nome: validação condicional por tipo_operacao feita no handler
  'exportador_nome',
  'importador_nome',
  'fabricante_nome',
  'incoterm',
  'moeda_pedido',
  'cobertura_cambial',
  'condicao_pagamento',
  'importacao_exportador_id',
  'exportacao_importador_id',
  'data_emissao_pedido',
  'campos_custom',
  'unidade_comercializada_pedido',
  // Aliases do frontend — mapeados para campos Prisma no handler
  'quantidade_total_inicial_pedido',
  // Editável diretamente — divergência sinalizada pelo sistema de alertas
  'valor_total_pedido',
])

// Campos virtuais calculados a partir dos itens (não persistidos — ignorar valor do cliente)
const CAMPOS_RECALCULAVEIS = new Set([
  'quantidade_pronta_itens_pedido_total',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
])

const editarCampoSchema = z.object({
  campo: z.string().min(1),
  valor: z.unknown(),
})

pedidosRouter.patch('/:id/campo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = editarCampoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const { campo, valor } = result.data

    if (!CAMPOS_EDITAVEIS.has(campo) && !CAMPOS_RECALCULAVEIS.has(campo)) {
      throw new AppError(400, `Campo "${campo}" nao pode ser editado inline. Campos permitidos: ${[...CAMPOS_EDITAVEIS, ...CAMPOS_RECALCULAVEIS].join(', ')}`)
    }

    const tenant_id = req.headers['x-tenant-id'] as string
    const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id

    const pedido = await req.prisma.pedido.findFirst({
      where: { id: req.params.id, tenant_id, company_id },
    })

    if (!pedido) {
      throw new AppError(404, 'Pedido nao encontrado')
    }

    // Validação por tipo_operacao para campos de parceiros
    if (campo === 'exportador_nome' && pedido.tipo_operacao === 'exportacao') {
      throw new AppError(400, 'exportador_nome nao pode ser editado em pedidos de exportacao — vem do Configurador')
    }
    if (campo === 'importador_nome' && pedido.tipo_operacao === 'importacao') {
      throw new AppError(400, 'importador_nome nao pode ser editado em pedidos de importacao — vem do Configurador')
    }

    // ── Campos recalculados a partir dos itens (valor do cliente ignorado) ──────
    if (CAMPOS_RECALCULAVEIS.has(campo)) {
      const itens = await req.prisma.pedidoItem.findMany({
        where: { pedido_id: req.params.id, tenant_id, company_id },
      })

      const dadosRecalc: Record<string, unknown> = {}

      if (campo === 'peso_liquido_total_pedido') {
        const soma = itens.reduce((acc, i) => acc + Number(i.peso_liquido_unitario ?? 0) * Number(i.quantidade_inicial_pedido ?? 0), 0)
        const casas = (pedido as any).casas_decimais_peso_pedido ?? 3
        dadosRecalc.peso_liquido_total_pedido = parseFloat(soma.toFixed(casas))
      } else if (campo === 'peso_bruto_total_pedido') {
        const soma = itens.reduce((acc, i) => acc + Number(i.peso_bruto_unitario ?? 0) * Number(i.quantidade_inicial_pedido ?? 0), 0)
        const casas = (pedido as any).casas_decimais_peso_pedido ?? 3
        dadosRecalc.peso_bruto_total_pedido = parseFloat(soma.toFixed(casas))
      } else if (campo === 'cubagem_total_pedido') {
        const soma = itens.reduce((acc, i) => acc + Number(i.cubagem_unitaria ?? 0) * Number(i.quantidade_inicial_pedido ?? 0), 0)
        const casas = (pedido as any).casas_decimais_cubagem_pedido ?? 4
        dadosRecalc.cubagem_total_pedido = parseFloat(soma.toFixed(casas))
      }
      // quantidade_pronta_itens_pedido_total → virtual, sem coluna Prisma, computado em mapPedido

      if (Object.keys(dadosRecalc).length > 0) {
        await req.prisma.pedido.update({
          where: { id: req.params.id },
          data: dadosRecalc,
        })
      }

      const updatedRecalc = await req.prisma.pedido.findFirst({
        where: { id: req.params.id, tenant_id, company_id },
        include: { itens: { orderBy: { sequencia_item: 'asc' } } },
      })
      return res.json(mapPedido(updatedRecalc))
    }

    // ── Campos editados diretamente no banco ────────────────────────────────────
    let dadosUpdate: Record<string, unknown>
    if (campo === 'campos_custom') {
      if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
        throw new AppError(400, 'campos_custom deve ser um objeto')
      }
      const customAtual = (typeof pedido.campos_custom === 'object' && pedido.campos_custom !== null)
        ? pedido.campos_custom as Record<string, unknown>
        : {}
      dadosUpdate = { campos_custom: { ...customAtual, ...(valor as Record<string, unknown>) } }
    } else if (campo === 'exportador_nome' || campo === 'importador_nome' || campo === 'fabricante_nome') {
      // Armazenados em detalhes_operacionais — merge para não perder outros campos
      const detAtual = (typeof pedido.detalhes_operacionais === 'object' && pedido.detalhes_operacionais !== null)
        ? pedido.detalhes_operacionais as Record<string, unknown>
        : {}
      dadosUpdate = { detalhes_operacionais: { ...detAtual, [campo]: valor } }
    } else if (campo === 'quantidade_total_inicial_pedido') {
      // Alias do frontend → campo Prisma real
      dadosUpdate = { quantidade_total_pedido: typeof valor === 'number' ? valor : Number(valor) || 0 }
    } else if (campo === 'valor_total_pedido') {
      dadosUpdate = { valor_total_pedido: typeof valor === 'number' ? valor : Number(valor) || 0 }
    } else {
      dadosUpdate = { [campo]: valor }
    }

    const updated = await req.prisma.pedido.update({
      where: { id: req.params.id },
      data: dadosUpdate,
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
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
            quantidade_saldo_pedido: item.quantidade_inicial_pedido,
            casas_decimais_quantidade_item: item.casas_decimais_quantidade_item,
            unidade_comercializada_item: item.unidade_comercializada_item,
            moeda_item: item.moeda_item,
            valor_por_unidade_item: item.valor_por_unidade_item,
            valor_total_item: item.valor_total_item,
            casas_decimais_total_item: item.casas_decimais_total_item,
          })),
        },
      },
      include: { itens: { orderBy: { sequencia_item: 'asc' } } },
    })

    res.status(201).json(mapPedido(duplicado))
  } catch (err) {
    next(err)
  }
})

// ── POST /:id/itens — Adicionar item ──────────────────────────────────────────

pedidosRouter.post('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemSchema = criarItemSchema
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

    const itemCount = await req.prisma.pedidoItem.count({
      where: { pedido_id: req.params.id, tenant_id, company_id },
    })

    const item = await req.prisma.pedidoItem.create({
      data: {
        id: gerarId('pite'),
        tenant_id,
        company_id,
        pedido_id: req.params.id,
        ...result.data,
        sequencia_item: result.data.sequencia_item ?? (itemCount + 1),
        quantidade_saldo_pedido: result.data.quantidade_inicial_pedido,
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

    // Traduzir aliases do frontend para campos Prisma
    const { quantidade_inicial_item_pedido, ...camposDiretos } = result.data
    const prismaData: Record<string, unknown> = { ...camposDiretos }

    if (quantidade_inicial_item_pedido !== undefined) {
      prismaData.quantidade_inicial_pedido = quantidade_inicial_item_pedido
      // Recalcular saldo: inicial - transferida - cancelada (nunca negativo)
      const novoAtual = quantidade_inicial_item_pedido
        - Number(item.quantidade_transferida_pedido)
        - Number(item.quantidade_cancelada_pedido)
      prismaData.quantidade_saldo_pedido = Math.max(0, novoAtual)
    }

    const updated = await req.prisma.pedidoItem.update({
      where: { id: req.params.itemId },
      data: prismaData,
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
      quantidade_pronta: result.data.quantidade_pronta_pedido,
      tenant_id,
      company_id,
    })

    res.json(mapItem(saldo))
  } catch (err) {
    next(err)
  }
})
