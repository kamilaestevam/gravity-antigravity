/**
 * CRUD de ExportadorQuandoImportacao — contraparte estrangeira (fornecedor)
 * quando a operacao e de importacao.
 *
 * Entidade per-tenant + per-workspace. Toda query filtra por
 * id_organizacao_exportador (Tenant Isolation) e opcionalmente por
 * id_workspace_exportador.
 *
 * Padrao identico a empresas.ts (Mandamentos 03/06/08/09).
 */
import { Router } from 'express'
import type { ExportadorQuandoImportacao as PrismaExportador } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import {
  criarExportadorQuandoImportacaoSchema,
  atualizarExportadorQuandoImportacaoSchema,
} from '../../../shared/schemas/index.js'

const router = Router()
router.use(requireInternalKey)

// ── ACL: Prisma → DTO publico ────────────────────────────────────────────────

function toDto(e: PrismaExportador): Record<string, unknown> {
  return {
    id_exportador_quando_importacao: e.id_exportador_quando_importacao,
    id_organizacao:                  e.id_organizacao_exportador,
    id_workspace:                    e.id_workspace_exportador,
    nome_exportador:                 e.nome_exportador,
    endereco_exportador:             e.endereco_exportador,
    cidade_exportador:               e.cidade_exportador,
    estado_provincia_exportador:     e.estado_provincia_exportador,
    pais_exportador:                 e.pais_exportador,
    zipcode_exportador:              e.zipcode_exportador,
    criado_em_exportador:            e.criado_em_exportador.toISOString(),
    atualizado_em_exportador:        e.atualizado_em_exportador.toISOString(),
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

    const where: Record<string, unknown> = { id_organizacao_exportador: idOrganizacao }
    if (idWorkspace) where.id_workspace_exportador = idWorkspace
    if (busca) where.nome_exportador = { contains: busca, mode: 'insensitive' }

    const [itens, total] = await Promise.all([
      prisma.exportadorQuandoImportacao.findMany({
        where,
        orderBy: { nome_exportador: 'asc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.exportadorQuandoImportacao.count({ where }),
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
    const registro = await prisma.exportadorQuandoImportacao.findFirst({
      where: {
        id_exportador_quando_importacao: req.params.id,
        id_organizacao_exportador: idOrganizacao,
      },
    })
    if (!registro) throw new AppError('Exportador nao encontrado', 404, 'NAO_ENCONTRADO')
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
    const dados = criarExportadorQuandoImportacaoSchema.parse(bodyComOrg)

    const criado = await prisma.exportadorQuandoImportacao.create({
      data: {
        id_organizacao_exportador:   dados.id_organizacao,
        id_workspace_exportador:     dados.id_workspace,
        nome_exportador:             dados.nome_exportador,
        endereco_exportador:         dados.endereco_exportador ?? null,
        cidade_exportador:           dados.cidade_exportador ?? null,
        estado_provincia_exportador: dados.estado_provincia_exportador ?? null,
        pais_exportador:             dados.pais_exportador,
        zipcode_exportador:          dados.zipcode_exportador ?? null,
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
    const existente = await prisma.exportadorQuandoImportacao.findFirst({
      where: {
        id_exportador_quando_importacao: req.params.id,
        id_organizacao_exportador: idOrganizacao,
      },
    })
    if (!existente) throw new AppError('Exportador nao encontrado', 404, 'NAO_ENCONTRADO')

    const dados = atualizarExportadorQuandoImportacaoSchema.parse(req.body)

    const atualizado = await prisma.exportadorQuandoImportacao.update({
      where: { id_exportador_quando_importacao: req.params.id },
      data: {
        ...(dados.nome_exportador !== undefined && { nome_exportador: dados.nome_exportador }),
        ...(dados.endereco_exportador !== undefined && { endereco_exportador: dados.endereco_exportador }),
        ...(dados.cidade_exportador !== undefined && { cidade_exportador: dados.cidade_exportador }),
        ...(dados.estado_provincia_exportador !== undefined && { estado_provincia_exportador: dados.estado_provincia_exportador }),
        ...(dados.pais_exportador !== undefined && { pais_exportador: dados.pais_exportador }),
        ...(dados.zipcode_exportador !== undefined && { zipcode_exportador: dados.zipcode_exportador }),
      },
    })

    res.json(toDto(atualizado))
  } catch (err) {
    next(err)
  }
})

export { router as exportadoresQuandoImportacaoRouter }
