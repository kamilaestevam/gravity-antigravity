/**
 * CRUD de Empresa (cartório de identidades COMEX).
 *
 * - Toda query filtra por `id_organizacao` (Tenant Isolation).
 * - 404 ao buscar SUID alheio (não 403 — não vazamos existência).
 * - Soft delete via `ativo = false`. Hard delete não é permitido.
 * - SUID gerado por `gerarSuid()` no formato `${PAIS}-${SLUG}-${SEQ_5}`.
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  criarEmpresaSchema,
  atualizarEmpresaSchema,
} from '../../../shared/schemas/index.js'
import { gerarSuid } from '../utils/gerar-suid.js'
import { consultarImpacto } from '../services/preview-impacto.js'

const router = Router()
router.use(requireInternalKey)

/**
 * Lê e valida `id_organizacao` da query OU do header `x-organizacao-id`.
 * Header tem precedência (caminho oficial inter-serviço).
 */
function extrairIdOrganizacao(req: import('express').Request): string {
  const header = req.headers['x-organizacao-id']
  const fromHeader = typeof header === 'string' ? header : undefined
  const fromQuery = typeof req.query.id_organizacao === 'string' ? req.query.id_organizacao : undefined
  const escolhido = fromHeader ?? fromQuery
  if (!escolhido || escolhido.length === 0) {
    throw new AppError(
      'id_organizacao é obrigatório (header x-organizacao-id ou query ?id_organizacao=)',
      400,
      'ORGANIZACAO_AUSENTE',
    )
  }
  return escolhido
}

// ---------------------------------------------------------------------------
// POST /empresas — cria
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const dados = criarEmpresaSchema.parse(req.body)
    const suid = dados.suid ?? (await gerarSuid(prisma, {
      id_organizacao: dados.id_organizacao,
      pais: dados.pais,
      nome_empresa: dados.nome_empresa,
    }))

    const criada = await prisma.empresa.create({
      data: {
        suid,
        id_organizacao: dados.id_organizacao,
        nome_empresa: dados.nome_empresa,
        cnpj: dados.cnpj ?? null,
        tin: dados.tin ?? null,
        pais: dados.pais,
        estado: dados.estado ?? null,
        cidade: dados.cidade ?? null,
        endereco: dados.endereco ?? null,
        zipcode: dados.zipcode ?? null,
        email: dados.email ?? null,
        telefone: dados.telefone ?? null,
        whatsapp: dados.whatsapp ?? null,
        pode_ser_importador: dados.pode_ser_importador,
        pode_ser_exportador: dados.pode_ser_exportador,
        pode_ser_fabricante: dados.pode_ser_fabricante,
        pode_ser_agente: dados.pode_ser_agente,
        pode_ser_despachante: dados.pode_ser_despachante,
        pode_ser_armador: dados.pode_ser_armador,
        ativo: dados.ativo,
      },
    })
    res.status(201).json(criada)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Empresa duplicada (SUID, CNPJ ou TIN já existente para este tenant)'))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas — lista paginada
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const pagina = Math.max(1, Number(req.query.pagina ?? 1))
    const porPagina = Math.min(200, Math.max(1, Number(req.query.por_pagina ?? 50)))
    const podeSerImportador = req.query.pode_ser_importador === 'true' ? true : undefined
    const pais = typeof req.query.pais === 'string' ? req.query.pais : undefined
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined

    const where: Prisma.EmpresaWhereInput = {
      id_organizacao: idOrganizacao,
      ...(podeSerImportador !== undefined ? { pode_ser_importador: true } : {}),
      ...(pais ? { pais } : {}),
      ...(busca ? { nome_empresa: { contains: busca, mode: 'insensitive' } } : {}),
    }

    const [itens, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        orderBy: { nome_empresa: 'asc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.empresa.count({ where }),
    ])

    res.status(200).json({ itens, total, pagina, por_pagina: porPagina })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas/:suid — busca uma
// ---------------------------------------------------------------------------
router.get('/:suid', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const empresa = await prisma.empresa.findFirst({
      where: { suid: req.params.suid, id_organizacao: idOrganizacao },
    })
    if (!empresa) throw AppError.naoEncontrado('Empresa')
    res.status(200).json(empresa)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /empresas/:suid/preview-impacto
// ---------------------------------------------------------------------------
router.get('/:suid/preview-impacto', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existe = await prisma.empresa.findFirst({
      where: { suid: req.params.suid, id_organizacao: idOrganizacao },
      select: { suid: true },
    })
    if (!existe) throw AppError.naoEncontrado('Empresa')
    const resultado = await consultarImpacto(req.params.suid, idOrganizacao)
    res.status(200).json(resultado)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PUT /empresas/:suid — atualiza
// ---------------------------------------------------------------------------
router.put('/:suid', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const dados = atualizarEmpresaSchema.parse(req.body)

    // Busca primeiro pra garantir tenant ownership (404 se alheio).
    const existente = await prisma.empresa.findFirst({
      where: { suid: req.params.suid, id_organizacao: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    const atualizada = await prisma.empresa.update({
      where: { suid: existente.suid },
      data: {
        ...(dados.nome_empresa !== undefined ? { nome_empresa: dados.nome_empresa } : {}),
        ...(dados.cnpj !== undefined ? { cnpj: dados.cnpj } : {}),
        ...(dados.tin !== undefined ? { tin: dados.tin } : {}),
        ...(dados.pais !== undefined ? { pais: dados.pais } : {}),
        ...(dados.estado !== undefined ? { estado: dados.estado } : {}),
        ...(dados.cidade !== undefined ? { cidade: dados.cidade } : {}),
        ...(dados.endereco !== undefined ? { endereco: dados.endereco } : {}),
        ...(dados.zipcode !== undefined ? { zipcode: dados.zipcode } : {}),
        ...(dados.email !== undefined ? { email: dados.email } : {}),
        ...(dados.telefone !== undefined ? { telefone: dados.telefone } : {}),
        ...(dados.whatsapp !== undefined ? { whatsapp: dados.whatsapp } : {}),
        ...(dados.pode_ser_importador !== undefined ? { pode_ser_importador: dados.pode_ser_importador } : {}),
        ...(dados.pode_ser_exportador !== undefined ? { pode_ser_exportador: dados.pode_ser_exportador } : {}),
        ...(dados.pode_ser_fabricante !== undefined ? { pode_ser_fabricante: dados.pode_ser_fabricante } : {}),
        ...(dados.pode_ser_agente !== undefined ? { pode_ser_agente: dados.pode_ser_agente } : {}),
        ...(dados.pode_ser_despachante !== undefined ? { pode_ser_despachante: dados.pode_ser_despachante } : {}),
        ...(dados.pode_ser_armador !== undefined ? { pode_ser_armador: dados.pode_ser_armador } : {}),
        ...(dados.ativo !== undefined ? { ativo: dados.ativo } : {}),
      },
    })
    res.status(200).json(atualizada)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Atualização viola unicidade (CNPJ/TIN duplicado neste tenant)'))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /empresas/:suid — soft delete (ativo=false)
// ---------------------------------------------------------------------------
router.delete('/:suid', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.empresa.findFirst({
      where: { suid: req.params.suid, id_organizacao: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    const desativada = await prisma.empresa.update({
      where: { suid: existente.suid },
      data: { ativo: false },
    })
    res.status(200).json(desativada)
  } catch (err) {
    next(err)
  }
})

export { router as empresasRouter }
