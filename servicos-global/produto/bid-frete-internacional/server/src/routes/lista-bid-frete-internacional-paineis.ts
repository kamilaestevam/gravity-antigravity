/**

 * Painéis da lista — BID Frete Internacional

 * Usa req.prisma do tenantIsolationMiddleware (paridade cotacoes.ts).

 */

import { Router, Request, Response, NextFunction } from 'express'

import { z } from 'zod'

import type { PrismaClient } from '../generated/client/index.js'

import { AppError } from '../lib/erros.js'

import {

  configListaPainelPadraoV1,

  ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL,

  listaPainelConfigV1Schema,

  serializarConfigListaPainel,

} from '../../../shared/listaPainelConfigSchema.js'

import { NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE } from '../../../shared/preferenciasEscopoWorkspacesBidFreteInternacional.js'



export const listaPaineisBidFreteRouter = Router()



const CriarPainelSchema = z.object({

  nome: z.string().min(1).max(60),

  config_json: z.string().optional(),

})



const AtualizarPainelSchema = z.object({

  nome:        z.string().min(1).max(60).optional(),

  is_visivel:  z.boolean().optional(),

  config_json: z.string().optional(),

})



const ReordenarSchema = z.object({

  ids: z.array(z.string().min(1)).min(1),

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



type ReqComTenant = Request & { prisma?: PrismaClient; tenantId?: string }



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



function whereUsuarioProduto(idOrganizacao: string, idUsuario: string) {

  return {

    id_organizacao:     idOrganizacao,

    id_usuario:         idUsuario,

    id_produto_gravity: ID_PRODUTO_GRAVITY_BID_FRETE_INTERNACIONAL,

  }

}



function resolverCtxListaPainel(req: ReqComTenant): {

  db: PrismaClient

  idOrganizacao: string

  idUsuario: string

} {

  if (!req.prisma) {

    throw new AppError('Prisma tenant não disponível', 500, 'INTERNAL_ERROR')

  }

  const idOrganizacao = req.tenantId ?? (req.headers['x-id-organizacao'] as string | undefined)

  const idUsuario = req.headers['x-id-usuario'] as string | undefined

  if (!idOrganizacao) {

    throw new AppError('x-id-organizacao obrigatório', 401, 'UNAUTHORIZED')

  }

  if (!idUsuario) {

    throw new AppError('x-id-usuario obrigatório', 401, 'UNAUTHORIZED')

  }

  return { db: req.prisma, idOrganizacao, idUsuario }

}



function validarPermutacaoReordenacao(idsRecebidos: string[], idsExistentes: string[]): void {

  if (idsRecebidos.length !== idsExistentes.length) {

    throw new AppError(

      'A lista de ids deve conter exatamente todos os painéis do usuário',

      400,

      'VALIDATION_ERROR',

    )

  }

  if (new Set(idsRecebidos).size !== idsRecebidos.length) {

    throw new AppError('Ids duplicados na reordenação', 400, 'VALIDATION_ERROR')

  }

  const existentes = new Set(idsExistentes)

  for (const id of idsRecebidos) {

    if (!existentes.has(id)) {

      throw new AppError('Painel não encontrado na reordenação', 404, 'NOT_FOUND')

    }

  }

}



listaPaineisBidFreteRouter.get('/paineis', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)



    let paineis = await db.listaPainelUsuarioGlobal.findMany({

      where:   whereUsuarioProduto(idOrganizacao, idUsuario),

      orderBy: { ordem_lista_painel_usuario_global: 'asc' },

    })



    paineis = (paineis as PainelDB[]).filter(

      p => p.nome_lista_painel_usuario_global !== NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE,

    )



    if (paineis.length === 0) {

      const padrao = await db.listaPainelUsuarioGlobal.create({

        data: {

          ...whereUsuarioProduto(idOrganizacao, idUsuario),

          nome_lista_painel_usuario_global: 'Principal',

          ordem_lista_painel_usuario_global: 0,

          config_json_lista_painel_usuario_global: serializarConfigListaPainel(

            configListaPainelPadraoV1(),

          ),

        },

      })

      paineis = [padrao]

    }



    res.json({ data: (paineis as PainelDB[]).map(mapPainel) })

  } catch (err) {

    next(err)

  }

})



listaPaineisBidFreteRouter.post('/paineis', async (req: Request, res: Response, next: NextFunction) => {

  const parsed = CriarPainelSchema.safeParse(req.body)

  if (!parsed.success) {

    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))

  }

  try {

    const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)

    const ultimo = await db.listaPainelUsuarioGlobal.findFirst({

      where:   whereUsuarioProduto(idOrganizacao, idUsuario),

      orderBy: { ordem_lista_painel_usuario_global: 'desc' },

      select:  { ordem_lista_painel_usuario_global: true },

    })

    let configInicial = configListaPainelPadraoV1()

    if (parsed.data.config_json) {

      configInicial = listaPainelConfigV1Schema.parse(JSON.parse(parsed.data.config_json))

    }

    const painel = await db.listaPainelUsuarioGlobal.create({

      data: {

        ...whereUsuarioProduto(idOrganizacao, idUsuario),

        nome_lista_painel_usuario_global:  parsed.data.nome,

        ordem_lista_painel_usuario_global: (ultimo?.ordem_lista_painel_usuario_global ?? -1) + 1,

        config_json_lista_painel_usuario_global: serializarConfigListaPainel(configInicial),

      },

    })

    res.status(201).json({ data: mapPainel(painel as PainelDB) })

  } catch (err) {

    next(err)

  }

})



listaPaineisBidFreteRouter.put('/paineis/reordenar', async (req: Request, res: Response, next: NextFunction) => {

  const parsed = ReordenarSchema.safeParse(req.body)

  if (!parsed.success) {

    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))

  }

  try {

    const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)



    const existentes = await db.listaPainelUsuarioGlobal.findMany({

      where:   whereUsuarioProduto(idOrganizacao, idUsuario),

      select:  { id_lista_painel_usuario_global: true },

      orderBy: { ordem_lista_painel_usuario_global: 'asc' },

    })

    const idsExistentes = (existentes as { id_lista_painel_usuario_global: string }[]).map(

      p => p.id_lista_painel_usuario_global,

    )

    validarPermutacaoReordenacao(parsed.data.ids, idsExistentes)



    await Promise.all(

      parsed.data.ids.map((id, index) =>

        db.listaPainelUsuarioGlobal.updateMany({

          where: { id_lista_painel_usuario_global: id, ...whereUsuarioProduto(idOrganizacao, idUsuario) },

          data: { ordem_lista_painel_usuario_global: index },

        }),

      ),

    )

    res.json({ data: { reordenado: true } })

  } catch (err) {

    next(err)

  }

})



listaPaineisBidFreteRouter.put('/paineis/:id_lista_painel_usuario_global', async (req: Request, res: Response, next: NextFunction) => {

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

    const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)

    const { id_lista_painel_usuario_global: id } = req.params

    const painel = await db.listaPainelUsuarioGlobal.findFirst({

      where: { id_lista_painel_usuario_global: id, ...whereUsuarioProduto(idOrganizacao, idUsuario) },

    })

    if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

    const atualizado = await db.listaPainelUsuarioGlobal.update({

      where: { id_lista_painel_usuario_global: id },

      data:  mapPatch(parsed.data),

    })

    res.json({ data: mapPainel(atualizado as PainelDB) })

  } catch (err) {

    next(err)

  }

})



listaPaineisBidFreteRouter.delete('/paineis/:id_lista_painel_usuario_global', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { db, idOrganizacao, idUsuario } = resolverCtxListaPainel(req as ReqComTenant)

    const { id_lista_painel_usuario_global: id } = req.params

    const total = await db.listaPainelUsuarioGlobal.count({

      where: {

        ...whereUsuarioProduto(idOrganizacao, idUsuario),

        nome_lista_painel_usuario_global: { not: NOME_PAINEL_META_ESCOPO_WORKSPACES_BID_FRETE },

      },

    })

    if (total <= 1) throw new AppError('Não é possível deletar o único painel', 400, 'VALIDATION_ERROR')

    const painel = await db.listaPainelUsuarioGlobal.findFirst({

      where: { id_lista_painel_usuario_global: id, ...whereUsuarioProduto(idOrganizacao, idUsuario) },

    })

    if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

    await db.listaPainelUsuarioGlobal.delete({ where: { id_lista_painel_usuario_global: id } })

    res.json({ data: { deletado: true } })

  } catch (err) {

    next(err)

  }

})

