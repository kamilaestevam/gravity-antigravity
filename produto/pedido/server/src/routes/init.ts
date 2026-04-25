/**
 * init.ts — Endpoint de inicialização da Lista de Pedidos
 *
 * GET /api/v1/pedidos/init
 *
 * Agrega em 1 request as 4 queries que a tela ListaPedidos precisa ao montar:
 *   1. Primeira página de pedidos (cursor keyset, limit 100)
 *   2. Status configurados pelo tenant
 *   3. Preferências de colunas do usuário (com fallback para padrão do workspace)
 *   4. Colunas customizadas do usuário
 *
 * Todas as queries rodam em Promise.all — 1 round-trip do cliente, ~80ms de DB.
 *
 * Query params aceitos (mesmos do GET /pedidos):
 *   sort    — campo de ordenação (default: data_emissao_pedido)
 *   dir     — asc | desc (default: desc)
 *   limit   — 1–200 (default: 100)
 *   status  — filtrar por status
 *   busca   — busca por numero_pedido
 */

import { Router, Request, Response, NextFunction } from 'express'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'

import { ColunasUsuarioService } from '../services/colunasUsuarioService.js'
import {
  mapPedido,
  encodeCursor,
  CURSOR_SORT_FIELDS,
  type CursorSortField,
} from '../pedidos-utils.js'

export const initRouter = Router()

const colunasService = new ColunasUsuarioService()

// GET /init
initRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const { tenantId, userId, roles } = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id  = tenantId
      const user_id    = userId
      const company_id = (req.headers['x-company-id'] as string | undefined) ?? tenant_id
      const user_roles = roles

      const { sort, dir, limit, status, busca } = req.query

      const sortField  = (CURSOR_SORT_FIELDS.includes(sort as CursorSortField) ? sort : 'data_emissao_pedido') as CursorSortField
      const sortDir    = dir === 'asc' ? 'asc' : 'desc'
      const limitNum   = Math.min(Math.max(Number(limit ?? 100), 1), 200)

      const where: Record<string, unknown> = { tenant_id, company_id, deleted_at: null }
      if (status) {
        const statusList = (status as string).split(',').map(s => s.trim()).filter(Boolean)
        where.status = statusList.length > 1 ? { in: statusList } : statusList[0]
      }
      if (busca) {
        where.numero_pedido = { contains: busca as string, mode: 'insensitive' }
      }

      // Todas as queries em paralelo — nenhuma bloqueia a outra
      const [pedidosRaw, statusList, preferencia, padrao, colunas] = await Promise.all([
        db.pedido.findMany({
          where,
          include: { itens: { orderBy: { sequencia_item_pedido: 'asc' } } },
          orderBy: [{ [sortField]: sortDir }, { id: sortDir }],
          take: limitNum + 1,
        }),
        db.pedidoStatus.findMany({
          where: { tenant_id },
          orderBy: { ordem: 'asc' },
        }),
        db.pedidoPreferenciaUsuario.findFirst({ where: { id_organizacao: tenant_id, id_usuario: user_id } }),
        db.pedidoPreferenciaPadrao.findFirst({ where: { tenant_id } }),
        colunasService.listar(tenant_id, user_id, user_roles, db as unknown as Record<string, unknown>),
      ])

      // Cursor pagination
      const temMais = pedidosRaw.length > limitNum
      const registros = temMais ? pedidosRaw.slice(0, limitNum) : pedidosRaw

      let nextCursor: string | null = null
      if (temMais && registros.length > 0) {
        const ultimo = registros[registros.length - 1]
        nextCursor = encodeCursor({
          sort_field: sortField,
          sort_value: (ultimo as Record<string, unknown>)[sortField],
          sort_dir: sortDir,
          id: ultimo.id,
        })
      }

      res.json({
        pedidos: {
          data:       registros.map(mapPedido),
          hasMore:    temMais,
          nextCursor,
          total:      registros.length,
        },
        status:       { data: statusList },
        preferencias: preferencia ? {
          ...preferencia,
          colunas_visiveis: (preferencia as { colunas_visiveis_pedido_preferencia_usuario: string[] }).colunas_visiveis_pedido_preferencia_usuario,
          colunas_largura:  (preferencia as { colunas_largura_pedido_preferencia_usuario: Record<string, number> | null }).colunas_largura_pedido_preferencia_usuario,
        } : (padrao ?? null),
        colunas,
      })
    })
  } catch (err) {
    next(err)
  }
})
