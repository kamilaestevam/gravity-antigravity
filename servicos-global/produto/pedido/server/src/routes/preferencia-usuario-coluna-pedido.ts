/**
 * preferenciaUsuarioColunaPedido.ts — Preferencia de colunas (visiveis + larguras) por usuario
 *
 * GET  /api/v1/pedidos/config/preferencia-usuario-coluna-pedido    — retorna preferencia do usuario (ou null)
 * PUT  /api/v1/pedidos/config/preferencia-usuario-coluna-pedido    — upsert parcial da preferencia
 *
 * Escopo multi-workspace: embutido em colunas_largura via chave reservada (sem migration).
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
import {
  colunasLarguraParaCliente,
  extrairEscopoWorkspacesDeColunasLargura,
  mesclarEscopoEmColunasLargura,
  mesclarLargurasNumericas,
  type ColunasLarguraGravacao,
} from '../../../shared/preferenciasUsuarioColunaPedido.js'

export const preferenciaUsuarioColunaPedidoRouter = Router()

// ── Zod Schema (contrato JSON do frontend) ────────────────────────────────────

const PreferenciaPutSchema = z.object({
  colunas_visiveis:      z.array(z.string()).optional(),
  colunas_largura:       z.record(z.number()).optional(),
  ids_workspaces_escopo: z.array(z.string()).optional(),
}).refine(
  data =>
    data.colunas_visiveis !== undefined
    || data.colunas_largura !== undefined
    || data.ids_workspaces_escopo !== undefined,
  { message: 'Informe ao menos um campo para atualizar' },
)

export interface PreferenciaResponse {
  colunas_visiveis: string[]
  colunas_largura?: Record<string, number>
  ids_workspaces_escopo?: string[]
}

type PreferenciaPutPayload = z.infer<typeof PreferenciaPutSchema>

// ── ACL: contrato JSON ↔ colunas Prisma DDD ───────────────────────────────────

interface PreferenciaPrismaRow {
  id_preferencia_usuario_coluna_pedido:               string
  id_organizacao:                                     string
  id_workspace:                                       string | null
  id_usuario:                                         string
  colunas_visiveis_preferencia_usuario_coluna_pedido: string[]
  colunas_largura_preferencia_usuario_coluna_pedido:  ColunasLarguraGravacao | null
  data_atualizacao_preferencia_usuario_coluna_pedido: Date | string
}

function mapPrismaParaJson(row: PreferenciaPrismaRow | null): PreferenciaResponse | null {
  if (!row) return null
  const larguraBruta = row.colunas_largura_preferencia_usuario_coluna_pedido
  const idsEscopo = extrairEscopoWorkspacesDeColunasLargura(larguraBruta)
  return {
    colunas_visiveis: row.colunas_visiveis_preferencia_usuario_coluna_pedido,
    colunas_largura:  colunasLarguraParaCliente(larguraBruta),
    ...(idsEscopo !== undefined ? { ids_workspaces_escopo: idsEscopo } : {}),
  }
}

function mesclarPreferenciaGravacao(
  existente: PreferenciaPrismaRow | null,
  body: PreferenciaPutPayload,
): {
  colunas_visiveis_preferencia_usuario_coluna_pedido: string[]
  colunas_largura_preferencia_usuario_coluna_pedido: ColunasLarguraGravacao | null
} {
  let colunasVisiveis = existente?.colunas_visiveis_preferencia_usuario_coluna_pedido ?? []
  let colunasLargura = existente?.colunas_largura_preferencia_usuario_coluna_pedido ?? null

  if (body.colunas_visiveis !== undefined) {
    colunasVisiveis = body.colunas_visiveis
  }
  if (body.colunas_largura !== undefined) {
    colunasLargura = mesclarLargurasNumericas(colunasLargura, body.colunas_largura)
  }
  if (body.ids_workspaces_escopo !== undefined) {
    colunasLargura = mesclarEscopoEmColunasLargura(colunasLargura, body.ids_workspaces_escopo)
  }

  return {
    colunas_visiveis_preferencia_usuario_coluna_pedido: colunasVisiveis,
    colunas_largura_preferencia_usuario_coluna_pedido:  colunasLargura,
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
  const parsed = PreferenciaPutSchema.safeParse(req.body)
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

      const existente = await db.preferenciaUsuarioColunaPedido.findUnique({
        where: { id_organizacao_id_usuario: { id_organizacao: idOrganizacao, id_usuario: idUsuario } },
      }) as PreferenciaPrismaRow | null

      const dadosPrisma = mesclarPreferenciaGravacao(existente, parsed.data)

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
