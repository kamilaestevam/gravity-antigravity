/**
 * lista-pedido-paineis.ts — Painéis da lista por usuário (Pedido)
 *
 * GET    /api/v1/pedidos/lista/paineis
 * POST   /api/v1/pedidos/lista/paineis
 * PUT    /api/v1/pedidos/lista/paineis/reordenar
 * PUT    /api/v1/pedidos/lista/paineis/:id_lista_painel_usuario_global
 * DELETE /api/v1/pedidos/lista/paineis/:id_lista_painel_usuario_global
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { AppError } from '../errors/AppError.js'
import {
  colunasLarguraParaCliente,
  type ColunasLarguraGravacao,
} from '../../../shared/preferenciasUsuarioColunaPedido.js'
import {
  configListaPainelPadraoV1,
  ID_PRODUTO_GRAVITY_PEDIDO,
  listaPainelConfigV1Schema,
  parsearConfigListaPainelSeguro,
  serializarConfigListaPainel,
  type ListaPainelConfigV1,
} from '../../../shared/listaPainelConfigSchema.js'

export const listaPaineisRouter = Router()

const CriarPainelSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(60, 'Máximo 60 caracteres'),
})

const AtualizarPainelSchema = z.object({
  nome:        z.string().min(1).max(60).optional(),
  is_visivel:  z.boolean().optional(),
  config_json: z.string().optional(),
})

const ReordenarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Informe ao menos um id'),
})

interface PainelDB {
  id_lista_painel_usuario_global:               string
  id_organizacao:                                string
  id_usuario:                                    string
  id_produto_gravity:                            string
  nome_lista_painel_usuario_global:              string
  ordem_lista_painel_usuario_global:             number
  visivel_lista_painel_usuario_global:           boolean
  config_json_lista_painel_usuario_global:       string
  data_criacao_lista_painel_usuario_global:      Date | string
  data_atualizacao_lista_painel_usuario_global:  Date | string
}

function mapPainel(p: PainelDB): Record<string, unknown> {
  return {
    id:           p.id_lista_painel_usuario_global,
    tenant_id:    p.id_organizacao,
    user_id:      p.id_usuario,
    id_produto_gravity: p.id_produto_gravity,
    nome:         p.nome_lista_painel_usuario_global,
    ordem:        p.ordem_lista_painel_usuario_global,
    is_visivel:   p.visivel_lista_painel_usuario_global,
    config_json:  p.config_json_lista_painel_usuario_global,
    created_at:   p.data_criacao_lista_painel_usuario_global,
    updated_at:   p.data_atualizacao_lista_painel_usuario_global,
  }
}

function mapPatch(patch: {
  nome?: string
  is_visivel?: boolean
  config_json?: string
}): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  if (patch.nome !== undefined)        data.nome_lista_painel_usuario_global = patch.nome
  if (patch.is_visivel !== undefined)  data.visivel_lista_painel_usuario_global = patch.is_visivel
  if (patch.config_json !== undefined) {
    listaPainelConfigV1Schema.parse(JSON.parse(patch.config_json))
    data.config_json_lista_painel_usuario_global = patch.config_json
  }
  return data
}

async function configInicialDePreferenciaLegada(
  db: {
    preferenciaUsuarioColunaPedido: {
      findUnique: (args: unknown) => Promise<{
        colunas_visiveis_preferencia_usuario_coluna_pedido: string[]
        colunas_largura_preferencia_usuario_coluna_pedido: ColunasLarguraGravacao | null
      } | null>
    }
  },
  idOrganizacao: string,
  idUsuario: string,
): Promise<ListaPainelConfigV1> {
  const pref = await db.preferenciaUsuarioColunaPedido.findUnique({
    where: {
      id_organizacao_id_usuario: {
        id_organizacao: idOrganizacao,
        id_usuario:     idUsuario,
      },
    },
  })

  const colunasVisiveis = pref?.colunas_visiveis_preferencia_usuario_coluna_pedido ?? []
  const colunasLargura = colunasLarguraParaCliente(
    pref?.colunas_largura_preferencia_usuario_coluna_pedido ?? null,
  )

  return configListaPainelPadraoV1({
    colunas_visiveis: colunasVisiveis.length > 0 ? colunasVisiveis : [],
    ...(Object.keys(colunasLargura).length > 0 ? { colunas_largura: colunasLargura } : {}),
  })
}

function whereUsuarioProduto(idOrganizacao: string, idUsuario: string) {
  return {
    id_organizacao:     idOrganizacao,
    id_usuario:         idUsuario,
    id_produto_gravity: ID_PRODUTO_GRAVITY_PEDIDO,
  }
}

// ── GET /paineis ──────────────────────────────────────────────────────────────

listaPaineisRouter.get('/paineis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const { idOrganizacao, idUsuario } = ctx

      let paineis = await db.listaPainelUsuarioGlobal.findMany({
        where:   whereUsuarioProduto(idOrganizacao, idUsuario),
        orderBy: { ordem_lista_painel_usuario_global: 'asc' },
      })

      if (paineis.length === 0) {
        const configInicial = await configInicialDePreferenciaLegada(db, idOrganizacao, idUsuario)
        const padrao = await db.listaPainelUsuarioGlobal.create({
          data: {
            ...whereUsuarioProduto(idOrganizacao, idUsuario),
            nome_lista_painel_usuario_global: 'Principal',
            ordem_lista_painel_usuario_global: 0,
            config_json_lista_painel_usuario_global: serializarConfigListaPainel(configInicial),
          },
        })
        paineis = [padrao]
      }

      res.json({ data: (paineis as PainelDB[]).map(mapPainel) })
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /paineis ─────────────────────────────────────────────────────────────

listaPaineisRouter.post('/paineis', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = CriarPainelSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const { idOrganizacao, idUsuario } = ctx

      const ultimo = await db.listaPainelUsuarioGlobal.findFirst({
        where:   whereUsuarioProduto(idOrganizacao, idUsuario),
        orderBy: { ordem_lista_painel_usuario_global: 'desc' },
        select:  { ordem_lista_painel_usuario_global: true },
      })

      const painel = await db.listaPainelUsuarioGlobal.create({
        data: {
          ...whereUsuarioProduto(idOrganizacao, idUsuario),
          nome_lista_painel_usuario_global:  parsed.data.nome,
          ordem_lista_painel_usuario_global: (ultimo?.ordem_lista_painel_usuario_global ?? -1) + 1,
          config_json_lista_painel_usuario_global: serializarConfigListaPainel(
            configListaPainelPadraoV1(),
          ),
        },
      })

      res.status(201).json({ data: mapPainel(painel as PainelDB) })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /paineis/reordenar ────────────────────────────────────────────────────

listaPaineisRouter.put('/paineis/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = ReordenarSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const { idOrganizacao, idUsuario } = ctx

      await Promise.all(
        parsed.data.ids.map((id, index) =>
          db.listaPainelUsuarioGlobal.updateMany({
            where: {
              id_lista_painel_usuario_global: id,
              ...whereUsuarioProduto(idOrganizacao, idUsuario),
            },
            data: { ordem_lista_painel_usuario_global: index },
          }),
        ),
      )

      res.json({ data: { reordenado: true } })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /paineis/:id ──────────────────────────────────────────────────────────

listaPaineisRouter.put('/paineis/:id_lista_painel_usuario_global', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = AtualizarPainelSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  if (parsed.data.config_json !== undefined) {
    try {
      listaPainelConfigV1Schema.parse(JSON.parse(parsed.data.config_json))
    } catch {
      return next(new AppError('config_json inválido', 400, 'VALIDATION_ERROR'))
    }
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const { idOrganizacao, idUsuario } = ctx
      const { id_lista_painel_usuario_global: id } = req.params

      const painel = await db.listaPainelUsuarioGlobal.findFirst({
        where: {
          id_lista_painel_usuario_global: id,
          ...whereUsuarioProduto(idOrganizacao, idUsuario),
        },
      })
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

      const atualizado = await db.listaPainelUsuarioGlobal.update({
        where: { id_lista_painel_usuario_global: id },
        data:  mapPatch(parsed.data),
      })

      res.json({ data: mapPainel(atualizado as PainelDB) })
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /paineis/:id ─────────────────────────────────────────────────────

listaPaineisRouter.delete('/paineis/:id_lista_painel_usuario_global', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const ctx = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const { idOrganizacao, idUsuario } = ctx
      const { id_lista_painel_usuario_global: id } = req.params

      const total = await db.listaPainelUsuarioGlobal.count({
        where: whereUsuarioProduto(idOrganizacao, idUsuario),
      })
      if (total <= 1) {
        throw new AppError('Não é possível deletar o único painel', 400, 'VALIDATION_ERROR')
      }

      const painel = await db.listaPainelUsuarioGlobal.findFirst({
        where: {
          id_lista_painel_usuario_global: id,
          ...whereUsuarioProduto(idOrganizacao, idUsuario),
        },
      })
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

      await db.listaPainelUsuarioGlobal.delete({ where: { id_lista_painel_usuario_global: id } })

      res.json({ data: { deletado: true } })
    })
  } catch (err) {
    next(err)
  }
})
