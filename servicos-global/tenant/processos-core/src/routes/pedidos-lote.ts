/**
 * pedidos-lote.ts — Operações em lote para pedidos (preview → confirmar)
 *
 * Endpoint base: /api/v1/pedidos/lote
 * Protegido por: requireInternalKey + tenantIsolation
 *
 * Rotas:
 *   POST /lote/status/preview        Preview de mudança de status em lote
 *   POST /lote/status/confirmar      Executar mudança de status em lote
 *   POST /lote/cancelar/preview      Preview de cancelamento em lote
 *   POST /lote/cancelar/confirmar    Executar cancelamento em lote
 *   POST /lote/exportar              Exportar dados (retorna JSON para client)
 */

import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../services/saldoEngine.js'

export const pedidosLoteRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const MAX_IDS_OPERACAO = 500
const MAX_IDS_EXPORTAR = 5000

const loteStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(MAX_IDS_OPERACAO),
  status_novo: z.string().min(1),
})

const loteCancelarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(MAX_IDS_OPERACAO),
})

const loteExportarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(MAX_IDS_EXPORTAR),
  formato: z.enum(['csv', 'xlsx', 'json']),
  colunas: z.array(z.string()).optional(),
})

// ── Tipos internos ────────────────────────────────────────────────────────────

interface PedidoResumo {
  id: string
  numero_pedido: string
  status: string
  tipo_operacao: string
}

interface PedidoBloqueado {
  id: string
  numero: string
  motivo: string
}

interface ErroLote {
  id: string
  motivo: string
}

// ── Transições válidas de status ──────────────────────────────────────────────
// Mapa de status → statuses permitidos como destino
const TRANSICOES_VALIDAS: Record<string, string[]> = {
  draft: ['aberto', 'cancelado'],
  aberto: ['cancelado', 'transferencia', 'consolidado'],
  transferencia: ['cancelado', 'consolidado'],
  consolidado: [],
  cancelado: [],
}

function validarTransicao(statusAtual: string, statusNovo: string): string | null {
  const permitidos = TRANSICOES_VALIDAS[statusAtual] ?? []
  if (!permitidos.includes(statusNovo)) {
    return `Transicao de "${statusAtual}" para "${statusNovo}" nao permitida`
  }
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTenantId(req: Request): string {
  const tenant_id = req.headers['x-tenant-id'] as string | undefined
  if (!tenant_id) throw new AppError(400, 'Header x-tenant-id obrigatorio')
  return tenant_id
}

function getCompanyId(req: Request): string | undefined {
  return req.headers['x-company-id'] as string | undefined
}

// ── POST /lote/status/preview ─────────────────────────────────────────────────

pedidosLoteRouter.post('/status/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loteStatusSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)
    const { ids, status_novo } = result.data

    const where: Record<string, unknown> = { tenant_id, id: { in: ids } }
    if (company_id) where.company_id = company_id

    const pedidos = await req.prisma.pedido.findMany({
      where,
      select: { id: true, numero_pedido: true, status: true, tipo_operacao: true },
    })

    const encontradosMap = new Map(pedidos.map((p) => [p.id, p]))
    const afetados: PedidoResumo[] = []
    const bloqueados: PedidoBloqueado[] = []

    for (const id of ids) {
      const pedido = encontradosMap.get(id)

      if (!pedido) {
        bloqueados.push({ id, numero: '—', motivo: 'Pedido nao encontrado ou nao pertence ao tenant' })
        continue
      }

      const motivoErro = validarTransicao(pedido.status, status_novo)
      if (motivoErro) {
        bloqueados.push({ id, numero: pedido.numero_pedido, motivo: motivoErro })
      } else {
        afetados.push({
          id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          status: pedido.status,
          tipo_operacao: pedido.tipo_operacao,
        })
      }
    }

    res.json({
      total: ids.length,
      afetados,
      bloqueados,
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /lote/status/confirmar ───────────────────────────────────────────────

pedidosLoteRouter.post('/status/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loteStatusSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)
    const { ids, status_novo } = result.data

    const where: Record<string, unknown> = { tenant_id, id: { in: ids } }
    if (company_id) where.company_id = company_id

    const pedidos = await req.prisma.pedido.findMany({
      where,
      select: { id: true, numero_pedido: true, status: true },
    })

    const encontradosMap = new Map(pedidos.map((p) => [p.id, p]))
    const idsValidos: string[] = []
    const erros: ErroLote[] = []

    for (const id of ids) {
      const pedido = encontradosMap.get(id)

      if (!pedido) {
        erros.push({ id, motivo: 'Pedido nao encontrado ou nao pertence ao tenant' })
        continue
      }

      const motivoErro = validarTransicao(pedido.status, status_novo)
      if (motivoErro) {
        erros.push({ id, motivo: motivoErro })
      } else {
        idsValidos.push(id)
      }
    }

    // Executar atualização em transação apenas para os válidos
    let sucesso = 0
    if (idsValidos.length > 0) {
      await req.prisma.$transaction(async (tx) => {
        await tx.pedido.updateMany({
          where: { id: { in: idsValidos }, tenant_id },
          data: { status: status_novo },
        })
      })
      sucesso = idsValidos.length
    }

    res.json({ sucesso, erros })
  } catch (err) {
    next(err)
  }
})

// ── POST /lote/cancelar/preview ───────────────────────────────────────────────

pedidosLoteRouter.post('/cancelar/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loteCancelarSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)
    const { ids } = result.data

    const where: Record<string, unknown> = { tenant_id, id: { in: ids } }
    if (company_id) where.company_id = company_id

    const pedidos = await req.prisma.pedido.findMany({
      where,
      include: { itens: { select: { quantidade_transferida_pedido: true } } },
    })

    const encontradosMap = new Map(pedidos.map((p) => [p.id, p]))
    const afetados: PedidoResumo[] = []
    const bloqueados: PedidoBloqueado[] = []

    for (const id of ids) {
      const pedido = encontradosMap.get(id)

      if (!pedido) {
        bloqueados.push({ id, numero: '—', motivo: 'Pedido nao encontrado ou nao pertence ao tenant' })
        continue
      }

      if (pedido.status === 'cancelado') {
        bloqueados.push({ id, numero: pedido.numero_pedido, motivo: 'Pedido ja esta cancelado' })
        continue
      }

      if (pedido.status === 'consolidado') {
        bloqueados.push({ id, numero: pedido.numero_pedido, motivo: 'Pedidos consolidados nao podem ser cancelados' })
        continue
      }

      // Verificar se algum item tem quantidade transferida > 0
      const temTransferencia = pedido.itens.some(
        (item) => Number(item.quantidade_transferida_pedido) > 0
      )

      if (temTransferencia) {
        bloqueados.push({
          id,
          numero: pedido.numero_pedido,
          motivo: 'Pedido possui itens com quantidade ja transferida para processos de embarque',
        })
        continue
      }

      afetados.push({
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        status: pedido.status,
        tipo_operacao: pedido.tipo_operacao,
      })
    }

    res.json({ total: ids.length, afetados, bloqueados })
  } catch (err) {
    next(err)
  }
})

// ── POST /lote/cancelar/confirmar ─────────────────────────────────────────────

pedidosLoteRouter.post('/cancelar/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loteCancelarSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)
    const { ids } = result.data

    const where: Record<string, unknown> = { tenant_id, id: { in: ids } }
    if (company_id) where.company_id = company_id

    const pedidos = await req.prisma.pedido.findMany({
      where,
      include: { itens: { select: { quantidade_transferida_pedido: true } } },
    })

    const encontradosMap = new Map(pedidos.map((p) => [p.id, p]))
    const idsValidos: string[] = []
    const erros: ErroLote[] = []

    for (const id of ids) {
      const pedido = encontradosMap.get(id)

      if (!pedido) {
        erros.push({ id, motivo: 'Pedido nao encontrado ou nao pertence ao tenant' })
        continue
      }

      if (pedido.status === 'cancelado') {
        erros.push({ id, motivo: 'Pedido ja esta cancelado' })
        continue
      }

      if (pedido.status === 'consolidado') {
        erros.push({ id, motivo: 'Pedidos consolidados nao podem ser cancelados' })
        continue
      }

      const temTransferencia = pedido.itens.some(
        (item) => Number(item.quantidade_transferida_pedido) > 0
      )

      if (temTransferencia) {
        erros.push({ id, motivo: 'Pedido possui itens com quantidade ja transferida' })
        continue
      }

      idsValidos.push(id)
    }

    let cancelados = 0
    if (idsValidos.length > 0) {
      await req.prisma.$transaction(async (tx) => {
        await tx.pedido.updateMany({
          where: { id: { in: idsValidos }, tenant_id },
          data: { status: 'cancelado' },
        })
      })
      cancelados = idsValidos.length
    }

    res.json({ cancelados, erros })
  } catch (err) {
    next(err)
  }
})

// ── POST /lote/exportar ───────────────────────────────────────────────────────

pedidosLoteRouter.post('/exportar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loteExportarSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Dados invalidos', details: result.error.flatten() } })
    }

    const tenant_id = getTenantId(req)
    const company_id = getCompanyId(req)
    const { ids, formato, colunas } = result.data

    const where: Record<string, unknown> = { tenant_id, id: { in: ids } }
    if (company_id) where.company_id = company_id

    const pedidos = await req.prisma.pedido.findMany({
      where,
      include: { itens: true },
      orderBy: { data_emissao_pedido: 'desc' },
    })

    // Filtrar colunas se especificado
    let dados: unknown[]
    if (colunas && colunas.length > 0) {
      dados = pedidos.map((pedido) => {
        const filtrado: Record<string, unknown> = {}
        for (const col of colunas) {
          filtrado[col] = (pedido as Record<string, unknown>)[col]
        }
        // Sempre incluir id para referência
        if (!('id' in filtrado)) filtrado.id = pedido.id
        return filtrado
      })
    } else {
      dados = pedidos
    }

    res.json({
      formato,
      total: dados.length,
      data: dados,
    })
  } catch (err) {
    next(err)
  }
})
