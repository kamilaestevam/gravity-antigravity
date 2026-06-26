/**
 * lista-paineis-smart-read.ts — Painéis salvos da Lista do Smart Read
 * CRUD + reordenação de painéis (colunas, filtros, ordem, largura) por usuário/produto.
 *
 * Isolamento por organização é injetado pelo isolamentoOrganizacaoSmartReadMiddleware
 * (req.prisma já filtra/preenche id_organizacao). Identidade do usuário vem do header
 * x-id-usuario (S2S), nunca do body.
 */
import { Router, Response, NextFunction } from 'express'
import { Prisma } from '../generated/client/index.js'
import { z } from 'zod'
import { AppError } from '../lib/app-error.js'
import type { RequisicaoComPrismaSmartRead } from '../middleware/isolamento-organizacao-smart-read.js'
import {
  configListaPainelPadraoV1,
  ID_PRODUTO_GRAVITY_SMART_READ,
  listaPainelConfigV1Schema,
  serializarConfigListaPainel,
} from '../../../shared/listaPainelConfigSchema.js'

const router = Router()

const CriarPainelSchema = z.object({
  nome: z.string().min(1).max(60),
  config_json: z.string().optional(),
})

const AtualizarPainelSchema = z.object({
  nome: z.string().min(1).max(60).optional(),
  is_visivel: z.boolean().optional(),
  config_json: z.string().optional(),
})

const ReordenarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

interface PainelDB {
  id_lista_painel_usuario_global: string
  id_organizacao: string
  id_usuario: string
  id_produto_gravity: string
  nome_lista_painel_usuario_global: string
  ordem_lista_painel_usuario_global: number
  visivel_lista_painel_usuario_global: boolean
  config_json_lista_painel_usuario_global: string
  data_criacao_lista_painel_usuario_global: Date | string
  data_atualizacao_lista_painel_usuario_global: Date | string
}

function exigirPrisma(req: RequisicaoComPrismaSmartRead) {
  if (!req.prisma) {
    throw new AppError(
      'Banco Smart Read indisponivel — configure SMART_READ_DATABASE_URL',
      503,
      'DATABASE_UNAVAILABLE',
    )
  }
  return req.prisma
}

function idUsuarioDaRequisicao(req: RequisicaoComPrismaSmartRead): string {
  const idUsuario = req.headers['x-id-usuario']
  if (!idUsuario || typeof idUsuario !== 'string') {
    throw new AppError('Header x-id-usuario obrigatorio', 400, 'USUARIO_AUSENTE')
  }
  return idUsuario
}

function whereUsuarioProduto(idUsuario: string) {
  return {
    id_usuario: idUsuario,
    id_produto_gravity: ID_PRODUTO_GRAVITY_SMART_READ,
  }
}

function mapPainel(p: PainelDB): Record<string, unknown> {
  return {
    id: p.id_lista_painel_usuario_global,
    tenant_id: p.id_organizacao,
    user_id: p.id_usuario,
    id_produto_gravity: p.id_produto_gravity,
    nome: p.nome_lista_painel_usuario_global,
    ordem: p.ordem_lista_painel_usuario_global,
    is_visivel: p.visivel_lista_painel_usuario_global,
    config_json: p.config_json_lista_painel_usuario_global,
    created_at: p.data_criacao_lista_painel_usuario_global,
    updated_at: p.data_atualizacao_lista_painel_usuario_global,
  }
}

function mapPatch(patch: {
  nome?: string
  is_visivel?: boolean
  config_json?: string
}): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  if (patch.nome !== undefined) data.nome_lista_painel_usuario_global = patch.nome
  if (patch.is_visivel !== undefined) data.visivel_lista_painel_usuario_global = patch.is_visivel
  if (patch.config_json !== undefined) {
    listaPainelConfigV1Schema.parse(JSON.parse(patch.config_json))
    data.config_json_lista_painel_usuario_global = patch.config_json
  }
  return data
}

function normalizarErroPrismaPainel(err: unknown): AppError | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021' || err.code === 'P1014') {
      return new AppError(
        'Tabela de painéis da lista não existe — rode a migration Smart Read (lista_painel_usuario_global)',
        503,
        'DATABASE_SCHEMA_DRIFT',
      )
    }
  }
  return null
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

router.get('/', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const db = exigirPrisma(req)
    const idUsuario = idUsuarioDaRequisicao(req)

    let paineis = (await db.listaPainelUsuarioGlobal.findMany({
      where: whereUsuarioProduto(idUsuario),
      orderBy: { ordem_lista_painel_usuario_global: 'asc' },
    })) as PainelDB[]

    if (paineis.length === 0) {
      const padrao = (await db.listaPainelUsuarioGlobal.create({
        data: {
          ...whereUsuarioProduto(idUsuario),
          nome_lista_painel_usuario_global: 'Principal',
          ordem_lista_painel_usuario_global: 0,
          config_json_lista_painel_usuario_global: serializarConfigListaPainel(
            configListaPainelPadraoV1(),
          ),
        },
      })) as PainelDB
      paineis = [padrao]
    }

    res.json({ data: paineis.map(mapPainel) })
  } catch (err) {
    const prismaErr = normalizarErroPrismaPainel(err)
    next(prismaErr ?? err)
  }
})

router.post('/', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  const parsed = CriarPainelSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }
  try {
    const db = exigirPrisma(req)
    const idUsuario = idUsuarioDaRequisicao(req)

    const ultimo = (await db.listaPainelUsuarioGlobal.findFirst({
      where: whereUsuarioProduto(idUsuario),
      orderBy: { ordem_lista_painel_usuario_global: 'desc' },
      select: { ordem_lista_painel_usuario_global: true },
    })) as { ordem_lista_painel_usuario_global: number } | null

    let configInicial = configListaPainelPadraoV1()
    if (parsed.data.config_json) {
      configInicial = listaPainelConfigV1Schema.parse(JSON.parse(parsed.data.config_json))
    }

    const painel = (await db.listaPainelUsuarioGlobal.create({
      data: {
        ...whereUsuarioProduto(idUsuario),
        nome_lista_painel_usuario_global: parsed.data.nome,
        ordem_lista_painel_usuario_global: (ultimo?.ordem_lista_painel_usuario_global ?? -1) + 1,
        config_json_lista_painel_usuario_global: serializarConfigListaPainel(configInicial),
      },
    })) as PainelDB
    res.status(201).json({ data: mapPainel(painel) })
  } catch (err) {
    next(err)
  }
})

router.put('/reordenar', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  const parsed = ReordenarSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }
  try {
    const db = exigirPrisma(req)
    const idUsuario = idUsuarioDaRequisicao(req)

    const existentes = (await db.listaPainelUsuarioGlobal.findMany({
      where: whereUsuarioProduto(idUsuario),
      select: { id_lista_painel_usuario_global: true },
      orderBy: { ordem_lista_painel_usuario_global: 'asc' },
    })) as { id_lista_painel_usuario_global: string }[]
    const idsExistentes = existentes.map(p => p.id_lista_painel_usuario_global)
    validarPermutacaoReordenacao(parsed.data.ids, idsExistentes)

    await Promise.all(
      parsed.data.ids.map((id, index) =>
        db.listaPainelUsuarioGlobal.updateMany({
          where: { id_lista_painel_usuario_global: id, ...whereUsuarioProduto(idUsuario) },
          data: { ordem_lista_painel_usuario_global: index },
        }),
      ),
    )
    res.json({ data: { reordenado: true } })
  } catch (err) {
    next(err)
  }
})

router.put('/:id_lista_painel_usuario_global', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
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
    const db = exigirPrisma(req)
    const idUsuario = idUsuarioDaRequisicao(req)
    const { id_lista_painel_usuario_global: id } = req.params

    const painel = await db.listaPainelUsuarioGlobal.findFirst({
      where: { id_lista_painel_usuario_global: id, ...whereUsuarioProduto(idUsuario) },
    })
    if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

    const atualizado = (await db.listaPainelUsuarioGlobal.update({
      where: { id_lista_painel_usuario_global: id },
      data: mapPatch(parsed.data),
    })) as PainelDB
    res.json({ data: mapPainel(atualizado) })
  } catch (err) {
    const prismaErr = normalizarErroPrismaPainel(err)
    next(prismaErr ?? err)
  }
})

router.delete('/:id_lista_painel_usuario_global', async (req: RequisicaoComPrismaSmartRead, res: Response, next: NextFunction) => {
  try {
    const db = exigirPrisma(req)
    const idUsuario = idUsuarioDaRequisicao(req)
    const { id_lista_painel_usuario_global: id } = req.params

    const total = await db.listaPainelUsuarioGlobal.count({
      where: whereUsuarioProduto(idUsuario),
    })
    if (total <= 1) throw new AppError('Não é possível deletar o único painel', 400, 'VALIDATION_ERROR')

    const painel = await db.listaPainelUsuarioGlobal.findFirst({
      where: { id_lista_painel_usuario_global: id, ...whereUsuarioProduto(idUsuario) },
    })
    if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

    await db.listaPainelUsuarioGlobal.delete({ where: { id_lista_painel_usuario_global: id } })
    res.json({ data: { deletado: true } })
  } catch (err) {
    next(err)
  }
})

export { router as listaPaineisSmartReadRouter }
