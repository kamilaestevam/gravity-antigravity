/**
 * CRUD de ImportadorQuandoExportacao — contraparte estrangeira (comprador)
 * quando a operacao e de exportacao.
 *
 * Entidade per-tenant + per-workspace. Toda query filtra por
 * id_organizacao_importador (Tenant Isolation) e opcionalmente por
 * id_workspace_importador.
 *
 * Padrao identico a empresas.ts (Mandamentos 03/06/08/09).
 */
import { Router } from 'express'
import type { ImportadorQuandoExportacao as PrismaImportador } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  criarImportadorQuandoExportacaoSchema,
  atualizarImportadorQuandoExportacaoSchema,
} from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

// ── ACL: Prisma → DTO publico ────────────────────────────────────────────────

function toDto(e: PrismaImportador): Record<string, unknown> {
  return {
    id_importador_quando_exportacao: e.id_importador_quando_exportacao,
    id_organizacao:                  e.id_organizacao_importador,
    id_workspace:                    e.id_workspace_importador,
    nome_importador:                 e.nome_importador,
    endereco_importador:             e.endereco_importador,
    cidade_importador:               e.cidade_importador,
    estado_provincia_importador:     e.estado_provincia_importador,
    pais_importador:                 e.pais_importador,
    zipcode_importador:              e.zipcode_importador,
    criado_em_importador:            e.criado_em_importador.toISOString(),
    atualizado_em_importador:        e.atualizado_em_importador.toISOString(),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extrairIdOrganizacao(req: import('express').Request): string {
  const fromHeader =
    typeof req.headers['x-id-organizacao'] === 'string' ? req.headers['x-id-organizacao']
    : typeof req.headers['x-organizacao-id'] === 'string' ? req.headers['x-organizacao-id']
    : undefined
  const fromQuery = typeof req.query.id_organizacao === 'string' ? req.query.id_organizacao : undefined
  const escolhido = fromHeader ?? fromQuery
  if (!escolhido || escolhido.length === 0) {
    throw new AppError('id_organizacao e obrigatorio (header x-id-organizacao ou query)', 400, 'ORGANIZACAO_AUSENTE')
  }
  return escolhido
}

// ---------------------------------------------------------------------------
// GET / — lista por organizacao (+ workspace opcional + busca)
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const idWorkspace = typeof req.query.id_workspace === 'string' ? req.query.id_workspace : undefined
    const busca = typeof req.query.busca === 'string' ? req.query.busca.trim() : undefined
    const pagina = Math.max(1, Number(req.query.pagina) || 1)
    const porPagina = Math.min(200, Math.max(1, Number(req.query.por_pagina) || 50))

    const where: Record<string, unknown> = { id_organizacao_importador: idOrganizacao }
    if (idWorkspace) where.id_workspace_importador = idWorkspace
    if (busca) where.nome_importador = { contains: busca, mode: 'insensitive' }

    const [itens, total] = await Promise.all([
      prisma.importadorQuandoExportacao.findMany({
        where,
        orderBy: { nome_importador: 'asc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.importadorQuandoExportacao.count({ where }),
    ])

    res.json({ itens: itens.map(toDto), total, pagina, por_pagina: porPagina })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /:id — busca por ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const registro = await prisma.importadorQuandoExportacao.findFirst({
      where: {
        id_importador_quando_exportacao: req.params.id,
        id_organizacao_importador: idOrganizacao,
      },
    })
    if (!registro) throw new AppError('Importador nao encontrado', 404, 'NAO_ENCONTRADO')
    res.json(toDto(registro))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST / — cria
// ---------------------------------------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const bodyComOrg = { ...req.body, id_organizacao: idOrganizacao }
    const dados = criarImportadorQuandoExportacaoSchema.parse(bodyComOrg)

    const criado = await prisma.importadorQuandoExportacao.create({
      data: {
        id_organizacao_importador:   dados.id_organizacao,
        id_workspace_importador:     dados.id_workspace,
        nome_importador:             dados.nome_importador,
        endereco_importador:         dados.endereco_importador ?? null,
        cidade_importador:           dados.cidade_importador ?? null,
        estado_provincia_importador: dados.estado_provincia_importador ?? null,
        pais_importador:             dados.pais_importador,
        zipcode_importador:          dados.zipcode_importador ?? null,
      },
    })

    res.status(201).json(toDto(criado))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PUT /:id — atualiza
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)

    // Verifica existencia + pertencimento a org
    const existente = await prisma.importadorQuandoExportacao.findFirst({
      where: {
        id_importador_quando_exportacao: req.params.id,
        id_organizacao_importador: idOrganizacao,
      },
    })
    if (!existente) throw new AppError('Importador nao encontrado', 404, 'NAO_ENCONTRADO')

    const dados = atualizarImportadorQuandoExportacaoSchema.parse(req.body)

    const atualizado = await prisma.importadorQuandoExportacao.update({
      where: { id_importador_quando_exportacao: req.params.id },
      data: {
        ...(dados.nome_importador !== undefined && { nome_importador: dados.nome_importador }),
        ...(dados.endereco_importador !== undefined && { endereco_importador: dados.endereco_importador }),
        ...(dados.cidade_importador !== undefined && { cidade_importador: dados.cidade_importador }),
        ...(dados.estado_provincia_importador !== undefined && { estado_provincia_importador: dados.estado_provincia_importador }),
        ...(dados.pais_importador !== undefined && { pais_importador: dados.pais_importador }),
        ...(dados.zipcode_importador !== undefined && { zipcode_importador: dados.zipcode_importador }),
      },
    })

    res.json(toDto(atualizado))
  } catch (err) {
    next(err)
  }
})

export { router as importadoresQuandoExportacaoRouter }
