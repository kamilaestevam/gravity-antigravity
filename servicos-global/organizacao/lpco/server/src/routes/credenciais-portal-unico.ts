/**
 * credenciais.ts — CRUD de credenciais do Portal Unico Siscomex
 *
 * GET    /api/v1/credenciais-portal-unico                                          — Listar credenciais do tenant/company
 * POST   /api/v1/credenciais-portal-unico                                          — Criar credencial (certificado ou OAuth2)
 * PUT    /api/v1/credenciais-portal-unico/:id_credencial_portal_unico              — Atualizar credencial
 * DELETE /api/v1/credenciais-portal-unico/:id_credencial_portal_unico              — Revogar credencial
 * POST   /api/v1/credenciais-portal-unico/:id_credencial_portal_unico/testar       — Testar autenticacao
 *
 * Certificados .pfx e senhas sao criptografados com AES-256-GCM.
 * JWT do Portal NUNCA persiste no banco — so cache em memoria.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { encrypt } from '../lib/encryption.js'
import { AppError } from '../services/lpcoStatusEngine.js'
import { PortalUnicoAuth } from '../connectors/portalUnicoAuth.js'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    userId: (req as Record<string, unknown>).userId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

// ── Validators ───────────────────────────────────────────────────────────────

const CertificadoCreateSchema = z.object({
  company_id: z.string().min(1),
  tipo_auth: z.literal('CERTIFICADO_DIGITAL'),
  certificado_base64: z.string().min(1),
  certificado_senha: z.string().min(1),
  certificado_cn: z.string().optional(),
  certificado_validade: z.string().datetime().optional(),
})

const OAuth2CreateSchema = z.object({
  company_id: z.string().min(1),
  tipo_auth: z.literal('TOKEN_OAUTH2'),
  oauth_client_id: z.string().min(1),
  oauth_client_secret: z.string().min(1),
  oauth_scope: z.string().optional(),
})

const CredencialCreateSchema = z.discriminatedUnion('tipo_auth', [
  CertificadoCreateSchema,
  OAuth2CreateSchema,
])

// ── GET / — Listar credenciais ───────────────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const companyId = req.query.company_id as string

    const where: Record<string, unknown> = { id_organizacao: tenantId }
    if (companyId) where.company_id = companyId

    const credenciais = await prisma.portalCredencial.findMany({
      where,
      select: {
        id: true,
        id_organizacao: true,
        company_id: true,
        tipo_auth: true,
        certificado_cn: true,
        certificado_validade: true,
        oauth_client_id: true,
        oauth_scope: true,
        ultimo_uso: true,
        status: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        // NUNCA retornar campos criptografados
      },
      orderBy: { created_at: 'desc' },
    })

    res.json({ data: credenciais })
  } catch (err) { next(err) }
})

// ── POST / — Criar credencial ────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = CredencialCreateSchema.parse(req.body)

    // Verificar se ja existe credencial do mesmo tipo para essa empresa
    const existente = await prisma.portalCredencial.findFirst({
      where: {
        id_organizacao: tenantId,
        company_id: body.company_id,
        tipo_auth: body.tipo_auth,
        status: 'ativo',
      },
    })

    if (existente) {
      throw new AppError(
        `Ja existe credencial ${body.tipo_auth} ativa para esta empresa. Revogue a existente antes.`,
        409,
        'CREDENCIAL_DUPLICADA'
      )
    }

    let data: Record<string, unknown> = {
      id_organizacao: tenantId,
      company_id: body.company_id,
      tipo_auth: body.tipo_auth,
      status: 'ativo',
      created_by: userId,
    }

    if (body.tipo_auth === 'CERTIFICADO_DIGITAL') {
      data = {
        ...data,
        certificado_encrypted: encrypt(body.certificado_base64),
        certificado_senha_encrypted: encrypt(body.certificado_senha),
        certificado_cn: body.certificado_cn ?? null,
        certificado_validade: body.certificado_validade
          ? new Date(body.certificado_validade)
          : null,
      }
    } else {
      data = {
        ...data,
        oauth_client_id: body.oauth_client_id,
        oauth_client_secret_encrypted: encrypt(body.oauth_client_secret),
        oauth_scope: body.oauth_scope ?? null,
      }
    }

    const credencial = await prisma.portalCredencial.create({ data })

    res.status(201).json({
      id: credencial.id,
      id_organizacao: credencial.id_organizacao,
      company_id: credencial.company_id,
      tipo_auth: credencial.tipo_auth,
      status: credencial.status,
      created_at: credencial.created_at,
    })
  } catch (err) { next(err) }
})

// ── PUT /:id — Atualizar credencial ──────────────────────────────────────────

router.put('/:id_credencial_portal_unico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)

    const existing = await prisma.portalCredencial.findFirst({
      where: { id: req.params.id_credencial_portal_unico, id_organizacao: tenantId },
    })

    if (!existing) throw new AppError('Credencial nao encontrada', 404, 'NOT_FOUND')

    const updateData: Record<string, unknown> = {}

    if (existing.tipo_auth === 'CERTIFICADO_DIGITAL') {
      if (req.body.certificado_base64) {
        updateData.certificado_encrypted = encrypt(req.body.certificado_base64)
      }
      if (req.body.certificado_senha) {
        updateData.certificado_senha_encrypted = encrypt(req.body.certificado_senha)
      }
      if (req.body.certificado_cn !== undefined) {
        updateData.certificado_cn = req.body.certificado_cn
      }
      if (req.body.certificado_validade) {
        updateData.certificado_validade = new Date(req.body.certificado_validade)
      }
    } else {
      if (req.body.oauth_client_id) {
        updateData.oauth_client_id = req.body.oauth_client_id
      }
      if (req.body.oauth_client_secret) {
        updateData.oauth_client_secret_encrypted = encrypt(req.body.oauth_client_secret)
      }
      if (req.body.oauth_scope !== undefined) {
        updateData.oauth_scope = req.body.oauth_scope
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError('Nenhum campo para atualizar', 400, 'NO_FIELDS')
    }

    await prisma.portalCredencial.update({
      where: { id: req.params.id_credencial_portal_unico },
      data: updateData,
    })

    // Invalidar cache de auth
    const auth = new PortalUnicoAuth(prisma)
    auth.invalidateCache(tenantId, existing.company_id)

    res.json({ sucesso: true, id: req.params.id_credencial_portal_unico })
  } catch (err) { next(err) }
})

// ── DELETE /:id — Revogar credencial ─────────────────────────────────────────

router.delete('/:id_credencial_portal_unico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.portalCredencial.findFirst({
      where: { id: req.params.id_credencial_portal_unico, id_organizacao: tenantId },
    })

    if (!existing) throw new AppError('Credencial nao encontrada', 404, 'NOT_FOUND')

    await prisma.portalCredencial.update({
      where: { id: req.params.id_credencial_portal_unico },
      data: { status: 'revogado' },
    })

    // Invalidar cache
    const auth = new PortalUnicoAuth(prisma)
    auth.invalidateCache(tenantId, existing.company_id)

    res.json({ sucesso: true, status: 'revogado' })
  } catch (err) { next(err) }
})

// ── POST /:id/testar — Testar autenticacao ───────────────────────────────────

router.post('/:id_credencial_portal_unico/testar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.portalCredencial.findFirst({
      where: { id: req.params.id_credencial_portal_unico, id_organizacao: tenantId },
    })

    if (!existing) throw new AppError('Credencial nao encontrada', 404, 'NOT_FOUND')

    const auth = new PortalUnicoAuth(prisma)

    try {
      const result = await auth.authenticate(tenantId, existing.company_id)
      res.json({
        sucesso: true,
        metodo: result.method,
        pode_escrita: result.canWrite,
        expira_em: result.expiresAt,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      res.json({
        sucesso: false,
        erro: msg,
      })
    }
  } catch (err) { next(err) }
})

export { router as credenciaisRouter }
