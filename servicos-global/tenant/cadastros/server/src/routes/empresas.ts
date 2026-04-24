/**
 * CRUD de Empresa (cartório de identidades COMEX).
 *
 * - Toda query filtra por `id_organizacao` (Tenant Isolation).
 * - 404 ao buscar SUID alheio (não 403 — não vazamos existência).
 * - Soft delete via `ativo = false` (DELETE /empresas/:suid_empresa) — uso normal.
 * - Hard delete (DELETE /empresas/:suid_empresa/compensacao) — exclusivo para
 *   compensação de saga inter-serviço quando a criação da Organizacao no
 *   Configurador falha após a Empresa ter sido criada aqui.
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
    const suid_empresa = dados.suid_empresa ?? (await gerarSuid(prisma, {
      id_organizacao: dados.id_organizacao,
      pais_empresa: dados.pais_empresa,
      nome_empresa: dados.nome_empresa,
    }))

    const criada = await prisma.empresa.create({
      data: {
        suid_empresa,
        id_organizacao: dados.id_organizacao,
        nome_empresa: dados.nome_empresa,
        cnpj_empresa: dados.cnpj_empresa ?? null,
        tin_empresa: dados.tin_empresa ?? null,
        pais_empresa: dados.pais_empresa,
        estado_empresa: dados.estado_empresa ?? null,
        cidade_empresa: dados.cidade_empresa ?? null,
        endereco_empresa: dados.endereco_empresa ?? null,
        zipcode_empresa: dados.zipcode_empresa ?? null,
        email_empresa: dados.email_empresa ?? null,
        telefone_empresa: dados.telefone_empresa ?? null,
        whatsapp_empresa: dados.whatsapp_empresa ?? null,
        pode_ser_importador_empresa: dados.pode_ser_importador_empresa,
        pode_ser_exportador_empresa: dados.pode_ser_exportador_empresa,
        pode_ser_fabricante_empresa: dados.pode_ser_fabricante_empresa,
        pode_ser_agente_empresa: dados.pode_ser_agente_empresa,
        pode_ser_despachante_empresa: dados.pode_ser_despachante_empresa,
        pode_ser_armador_empresa: dados.pode_ser_armador_empresa,
        ativo_empresa: dados.ativo_empresa,
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
    const podeSerImportador = req.query.pode_ser_importador_empresa === 'true' ? true : undefined
    const pais_empresa = typeof req.query.pais_empresa === 'string' ? req.query.pais_empresa : undefined
    const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined

    const where: Prisma.EmpresaWhereInput = {
      id_organizacao: idOrganizacao,
      ...(podeSerImportador !== undefined ? { pode_ser_importador_empresa: true } : {}),
      ...(pais_empresa ? { pais_empresa } : {}),
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
      where: { suid_empresa: req.params.suid, id_organizacao: idOrganizacao },
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
      where: { suid_empresa: req.params.suid, id_organizacao: idOrganizacao },
      select: { suid_empresa: true },
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
      where: { suid_empresa: req.params.suid, id_organizacao: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    const atualizada = await prisma.empresa.update({
      where: { suid_empresa: existente.suid_empresa },
      data: {
        ...(dados.nome_empresa !== undefined ? { nome_empresa: dados.nome_empresa } : {}),
        ...(dados.cnpj_empresa !== undefined ? { cnpj_empresa: dados.cnpj_empresa } : {}),
        ...(dados.tin_empresa !== undefined ? { tin_empresa: dados.tin_empresa } : {}),
        ...(dados.pais_empresa !== undefined ? { pais_empresa: dados.pais_empresa } : {}),
        ...(dados.estado_empresa !== undefined ? { estado_empresa: dados.estado_empresa } : {}),
        ...(dados.cidade_empresa !== undefined ? { cidade_empresa: dados.cidade_empresa } : {}),
        ...(dados.endereco_empresa !== undefined ? { endereco_empresa: dados.endereco_empresa } : {}),
        ...(dados.zipcode_empresa !== undefined ? { zipcode_empresa: dados.zipcode_empresa } : {}),
        ...(dados.email_empresa !== undefined ? { email_empresa: dados.email_empresa } : {}),
        ...(dados.telefone_empresa !== undefined ? { telefone_empresa: dados.telefone_empresa } : {}),
        ...(dados.whatsapp_empresa !== undefined ? { whatsapp_empresa: dados.whatsapp_empresa } : {}),
        ...(dados.pode_ser_importador_empresa !== undefined ? { pode_ser_importador_empresa: dados.pode_ser_importador_empresa } : {}),
        ...(dados.pode_ser_exportador_empresa !== undefined ? { pode_ser_exportador_empresa: dados.pode_ser_exportador_empresa } : {}),
        ...(dados.pode_ser_fabricante_empresa !== undefined ? { pode_ser_fabricante_empresa: dados.pode_ser_fabricante_empresa } : {}),
        ...(dados.pode_ser_agente_empresa !== undefined ? { pode_ser_agente_empresa: dados.pode_ser_agente_empresa } : {}),
        ...(dados.pode_ser_despachante_empresa !== undefined ? { pode_ser_despachante_empresa: dados.pode_ser_despachante_empresa } : {}),
        ...(dados.pode_ser_armador_empresa !== undefined ? { pode_ser_armador_empresa: dados.pode_ser_armador_empresa } : {}),
        ...(dados.ativo_empresa !== undefined ? { ativo_empresa: dados.ativo_empresa } : {}),
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
// DELETE /empresas/:suid/compensacao — hard delete para saga
//
// Rota EXCLUSIVA para compensação quando a criação da Organizacao no
// Configurador falha após a Empresa ter sido criada aqui. Remove o registro
// fisicamente para não deixar "empresa fantasma" no cadastro.
//
// NÃO usar para uso normal — a rota canônica de exclusão continua sendo
// DELETE /empresas/:suid (soft delete).
// ---------------------------------------------------------------------------
router.delete('/:suid/compensacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.empresa.findFirst({
      where: { suid_empresa: req.params.suid, id_organizacao: idOrganizacao },
      select: { suid_empresa: true },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    await prisma.empresa.delete({ where: { suid_empresa: existente.suid_empresa } })
    res.status(204).send()
  } catch (err) {
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
      where: { suid_empresa: req.params.suid, id_organizacao: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')

    const desativada = await prisma.empresa.update({
      where: { suid_empresa: existente.suid_empresa },
      data: { ativo_empresa: false },
    })
    res.status(200).json(desativada)
  } catch (err) {
    next(err)
  }
})

export { router as empresasRouter }
