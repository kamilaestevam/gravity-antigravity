/**
 * CRUD fornecedor_organizacao — vínculo prestador ↔ org cliente (SSOT Cadastros).
 *
 * - Toda query filtra por id_organizacao (tenant isolation do contexto cliente).
 * - id_fornecedor → empresa.suid_empresa (cartório; rename empresa→fornecedor futuro).
 * - id_usuario → Configurador.usuario.id_usuario (FK lógica; sem id_fornecedor em usuario).
 * - GET /por-usuario?id_usuario= — troca de crachá (portal FORNECEDOR).
 */
import { Router } from 'express'
import type { FornecedorOrganizacao as PrismaVinculo, Fornecedor as PrismaFornecedor } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  criarFornecedorOrganizacaoSchema,
  atualizarFornecedorOrganizacaoSchema,
} from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

type VinculoComFornecedor = PrismaVinculo & { fornecedor: PrismaFornecedor }

function enrichFornecedor(f: PrismaFornecedor): Record<string, unknown> {
  return {
    nome_fornecedor: f.nome_fornecedor,
    cnpj_fornecedor: f.cnpj_fornecedor,
    tin_fornecedor: f.tin_fornecedor,
    pais_fornecedor: f.pais_fornecedor,
    cidade_fornecedor: f.cidade_fornecedor,
    estado_provincia_fornecedor: f.estado_provincia_fornecedor,
    cep_zipcode_fornecedor: f.cep_zipcode_fornecedor,
    endereco_fornecedor: f.endereco_fornecedor,
    email_principal_fornecedor: f.email_principal_fornecedor,
    telefone_principal_fornecedor: f.telefone_principal_fornecedor,
    whatsapp_principal_fornecedor: f.whatsapp_principal_fornecedor,
    ativo_fornecedor: f.ativo_fornecedor,
  }
}

function toDto(v: VinculoComFornecedor): Record<string, unknown> {
  return {
    id_fornecedor_organizacao: v.id_fornecedor_organizacao,
    id_fornecedor: v.id_fornecedor,
    id_organizacao: v.id_organizacao,
    tipo_fornecedor_organizacao: v.tipo_fornecedor_organizacao,
    status_fornecedor_organizacao: v.status_fornecedor_organizacao,
    id_usuario: v.id_usuario,
    data_criacao_fornecedor_organizacao: v.data_criacao_fornecedor_organizacao.toISOString(),
    data_atualizacao_fornecedor_organizacao: v.data_atualizacao_fornecedor_organizacao.toISOString(),
    fornecedor: enrichFornecedor(v.fornecedor),
  }
}

function extrairIdOrganizacao(req: import('express').Request): string {
  const fromHeader =
    typeof req.headers['x-id-organizacao'] === 'string' ? req.headers['x-id-organizacao']
    : typeof req.headers['x-organizacao-id'] === 'string' ? req.headers['x-organizacao-id']
    : undefined
  const fromQuery = typeof req.query.id_organizacao === 'string' ? req.query.id_organizacao : undefined
  const escolhido = fromHeader ?? fromQuery
  if (!escolhido || escolhido.length === 0) {
    throw new AppError(
      'id_organizacao é obrigatório (header x-id-organizacao ou query ?id_organizacao=)',
      400,
      'ORGANIZACAO_AUSENTE',
    )
  }
  return escolhido
}

async function buscarVinculoComFornecedor(
  idOrganizacao: string,
  idVinculo: string,
): Promise<VinculoComFornecedor> {
  const v = await prisma.fornecedorOrganizacao.findFirst({
    where: { id_fornecedor_organizacao: idVinculo, id_organizacao: idOrganizacao },
    include: { fornecedor: true },
  })
  if (!v) {
    throw new AppError('Vínculo fornecedor-organização não encontrado', 404, 'VINCULO_NAO_ENCONTRADO')
  }
  return v
}

// GET /por-usuario — contextos do portal FORNECEDOR (troca de crachá)
router.get('/por-usuario', async (req, res, next) => {
  try {
    const idUsuario = typeof req.query.id_usuario === 'string' ? req.query.id_usuario.trim() : ''
    if (!idUsuario) {
      throw new AppError('id_usuario é obrigatório na query', 400, 'USUARIO_AUSENTE')
    }
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const itens = await prisma.fornecedorOrganizacao.findMany({
      where: {
        id_usuario: idUsuario,
        ...(status ? { status_fornecedor_organizacao: status as 'ATIVO' | 'INATIVO' | 'PENDENTE_APROVACAO' } : {}),
      },
      include: { fornecedor: true },
      orderBy: { id_organizacao: 'asc' },
    })
    res.json({ itens: itens.map(toDto), total: itens.length })
  } catch (err) {
    next(err)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const idFornecedor = typeof req.query.id_fornecedor === 'string' ? req.query.id_fornecedor : undefined
    const tipo = typeof req.query.tipo_fornecedor_organizacao === 'string'
      ? req.query.tipo_fornecedor_organizacao
      : undefined
    const pagina = Math.max(1, Number(req.query.pagina ?? 1))
    const porPagina = Math.min(200, Math.max(1, Number(req.query.por_pagina ?? 50)))

    const where = {
      id_organizacao: idOrganizacao,
      ...(idFornecedor ? { id_fornecedor: idFornecedor } : {}),
      ...(tipo ? { tipo_fornecedor_organizacao: tipo as VinculoComFornecedor['tipo_fornecedor_organizacao'] } : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.fornecedorOrganizacao.findMany({
        where,
        include: { fornecedor: true },
        orderBy: { data_criacao_fornecedor_organizacao: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.fornecedorOrganizacao.count({ where }),
    ])

    res.json({ itens: itens.map(toDto), total, pagina, por_pagina: porPagina })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const v = await buscarVinculoComFornecedor(idOrganizacao, req.params.id)
    res.json(toDto(v))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const bodyComOrg =
      req.body && typeof req.body === 'object'
        ? { ...req.body, id_organizacao: (req.body as { id_organizacao?: string }).id_organizacao ?? idOrganizacao }
        : req.body
    const dados = criarFornecedorOrganizacaoSchema.parse(bodyComOrg)

    const fornecedorMaster = await prisma.fornecedor.findFirst({
      where: { id_fornecedor: dados.id_fornecedor },
    })
    if (!fornecedorMaster) {
      throw new AppError('Fornecedor não encontrado no cartório', 404, 'FORNECEDOR_NAO_ENCONTRADO')
    }

    const criado = await prisma.fornecedorOrganizacao.create({
      data: {
        id_fornecedor: dados.id_fornecedor,
        id_organizacao: dados.id_organizacao,
        tipo_fornecedor_organizacao: dados.tipo_fornecedor_organizacao,
        status_fornecedor_organizacao: dados.status_fornecedor_organizacao,
        id_usuario: dados.id_usuario ?? null,
      },
      include: { fornecedor: true },
    })
    res.status(201).json(toDto(criado))
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'P2002') {
      return next(AppError.conflito('Vínculo duplicado (fornecedor + org + tipo já existente)'))
    }
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    await buscarVinculoComFornecedor(idOrganizacao, req.params.id)
    const dados = atualizarFornecedorOrganizacaoSchema.parse(req.body)

    const atualizado = await prisma.fornecedorOrganizacao.update({
      where: { id_fornecedor_organizacao: req.params.id },
      data: {
        ...(dados.tipo_fornecedor_organizacao !== undefined
          ? { tipo_fornecedor_organizacao: dados.tipo_fornecedor_organizacao }
          : {}),
        ...(dados.status_fornecedor_organizacao !== undefined
          ? { status_fornecedor_organizacao: dados.status_fornecedor_organizacao }
          : {}),
        ...(dados.id_usuario !== undefined ? { id_usuario: dados.id_usuario } : {}),
      },
      include: { fornecedor: true },
    })
    res.json(toDto(atualizado))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    await buscarVinculoComFornecedor(idOrganizacao, req.params.id)
    await prisma.fornecedorOrganizacao.delete({
      where: { id_fornecedor_organizacao: req.params.id },
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as fornecedorOrganizacaoRouter }
