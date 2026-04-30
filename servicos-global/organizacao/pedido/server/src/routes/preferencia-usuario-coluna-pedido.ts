/**
 * preferenciaUsuarioColunaPedido.ts — Preferencia de colunas (visiveis + larguras) por usuario
 *
 * GET  /api/v1/pedidos/config/preferencia-usuario-coluna-pedido    — retorna preferencia do usuario (ou null)
 * PUT  /api/v1/pedidos/config/preferencia-usuario-coluna-pedido    — upsert da preferencia
 *
 * Autenticacao: x-internal-key + x-id-organizacao + x-id-usuario (via shell)
 *
 * ACL: o frontend continua usando o contrato legacy { colunas_visiveis, colunas_largura }
 * — esta camada absorve a traducao para os nomes DDD do Prisma.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { AppError } from '../errors/AppError.js'

export const preferenciaUsuarioColunaPedidoRouter = Router()

// ── Zod Schema (contrato JSON do frontend) ────────────────────────────────────

const PreferenciaSchema = z.object({
  colunas_visiveis: z.array(z.string()).min(0),
  colunas_largura:  z.record(z.number()).optional(),
})

type PreferenciaPayload = z.infer<typeof PreferenciaSchema>

// ── ACL: contrato JSON ↔ colunas Prisma DDD ───────────────────────────────────

interface PreferenciaPrismaRow {
  id_preferencia_usuario_coluna_pedido:               string
  id_organizacao:                                     string
  id_workspace:                                       string | null
  id_usuario:                                         string
  colunas_visiveis_preferencia_usuario_coluna_pedido: string[]
  colunas_largura_preferencia_usuario_coluna_pedido:  Record<string, number> | null
  data_atualizacao_preferencia_usuario_coluna_pedido: Date | string
}

function mapPrismaParaJson(row: PreferenciaPrismaRow | null): PreferenciaPayload | null {
  if (!row) return null
  return {
    colunas_visiveis: row.colunas_visiveis_preferencia_usuario_coluna_pedido,
    colunas_largura:  row.colunas_largura_preferencia_usuario_coluna_pedido ?? undefined,
  }
}

// ── GET /preferencia-usuario-coluna-pedido ────────────────────────────────────

preferenciaUsuarioColunaPedidoRouter.get('/preferencia-usuario-coluna-pedido', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db            = rawDb as any
      const ctx           = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario

      const registro = await db.preferenciaUsuarioColunaPedido.findUnique({
        where: { id_organizacao_id_usuario: { id_organizacao: idOrganizacao, id_usuario: idUsuario } },
      })

      res.json({ data: mapPrismaParaJson(registro as PreferenciaPrismaRow | null) })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /preferencia-usuario-coluna-pedido ────────────────────────────────────

preferenciaUsuarioColunaPedidoRouter.put('/preferencia-usuario-coluna-pedido', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = PreferenciaSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db            = rawDb as any
      const ctx           = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario
      const idWorkspace   = ctx.idWorkspace ?? null

      const dadosPrisma = {
        colunas_visiveis_preferencia_usuario_coluna_pedido: parsed.data.colunas_visiveis,
        colunas_largura_preferencia_usuario_coluna_pedido:  parsed.data.colunas_largura ?? null,
      }

      const registro = await db.preferenciaUsuarioColunaPedido.upsert({
        where:  { id_organizacao_id_usuario: { id_organizacao: idOrganizacao, id_usuario: idUsuario } },
        create: { id_organizacao: idOrganizacao, id_usuario: idUsuario, id_workspace: idWorkspace, ...dadosPrisma },
        update: { ...dadosPrisma },
      })

      res.json({ data: mapPrismaParaJson(registro as PreferenciaPrismaRow) })
    })
  } catch (err) {
    next(err)
  }
})
