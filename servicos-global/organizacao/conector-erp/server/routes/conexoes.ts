// server/routes/conexoes.ts
// CRUD de conexões ERP — POST /conexoes, GET /conexoes, PATCH /conexoes/:id,
// DELETE /conexoes/:id, POST /conexoes/testar.
//
// SEGURANÇA: credenciais NUNCA retornadas em GET — só confirmação de existência.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { encrypt } from '../lib/crypto.js'
import { testarConexao } from '../services/erp-client.js'
import { AppError } from '../lib/app-error.js'

export const conexoesRouter = Router()

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------
const criarConexaoSchema = z.object({
  tenant_id: z.string().min(1),
  product_id: z.string().optional(),
  system_type: z.enum(['SAP', 'TOTVS', 'Oracle', 'custom']),
  protocol: z.enum(['odata', 'hana', 'rest', 'jdbc']),
  base_url: z.string().url('URL base inválida'),
  username: z.string().min(1),
  password: z.string().min(1, 'Senha é obrigatória'),
  sync_frequency: z
    .enum(['manual', 'hourly', 'every6h', 'daily'])
    .default('manual'),
})

const atualizarConexaoSchema = z.object({
  system_type: z.enum(['SAP', 'TOTVS', 'Oracle', 'custom']).optional(),
  protocol: z.enum(['odata', 'hana', 'rest', 'jdbc']).optional(),
  base_url: z.string().url().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  sync_frequency: z.enum(['manual', 'hourly', 'every6h', 'daily']).optional(),
})

// ---------------------------------------------------------------------------
// POST /api/v1/erp/conexoes — criar nova conexão
// ---------------------------------------------------------------------------
conexoesRouter.post('/api/v1/erp/conexoes', async (req, res, next) => {
  try {
    const body = criarConexaoSchema.parse(req.body)

    const credentials_encrypted = encrypt(body.password)

    const conexao = await prisma.conexaoERP.create({
      data: {
        tenant_id: body.tenant_id,
        product_id: body.product_id ?? null,
        system_type: body.system_type,
        protocol: body.protocol,
        base_url: body.base_url,
        username: body.username,
        credentials_encrypted,
        sync_frequency: body.sync_frequency,
      },
      select: {
        id: true,
        tenant_id: true,
        product_id: true,
        system_type: true,
        protocol: true,
        base_url: true,
        username: true,
        sync_frequency: true,
        connection_status: true,
        created_at: true,
        // credentials_encrypted NUNCA retornado
      },
    })

    res.status(201).json({ ok: true, data: conexao })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/erp/conexoes — listar conexões do tenant
// ---------------------------------------------------------------------------
conexoesRouter.get('/api/v1/erp/conexoes', async (req, res, next) => {
  try {
    const { tenant_id, product_id } = req.query as Record<string, string>

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const conexoes = await prisma.conexaoERP.findMany({
      where: {
        tenant_id,
        ...(product_id ? { product_id } : {}),
      },
      select: {
        id: true,
        tenant_id: true,
        product_id: true,
        system_type: true,
        protocol: true,
        base_url: true,
        username: true,
        sync_frequency: true,
        connection_status: true,
        last_synced_at: true,
        last_tested_at: true,
        error_message: true,
        circuit_breaker_open: true,
        circuit_failures: true,
        created_at: true,
        updated_at: true,
        // credentials_encrypted NUNCA retornado
      },
      orderBy: { created_at: 'desc' },
    })

    res.json({ ok: true, data: conexoes })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/erp/conexoes/:id — atualizar conexão
// ---------------------------------------------------------------------------
conexoesRouter.patch('/api/v1/erp/conexoes/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenant_id } = req.query as { tenant_id: string }

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const body = atualizarConexaoSchema.parse(req.body)

    // Verificar que pertence ao tenant
    const existente = await prisma.conexaoERP.findFirst({
      where: { id, tenant_id },
    })
    if (!existente) {
      throw new AppError('Conexão não encontrada', 404, 'NOT_FOUND')
    }

    const updateData: Record<string, unknown> = {
      system_type: body.system_type,
      protocol: body.protocol,
      base_url: body.base_url,
      username: body.username,
      sync_frequency: body.sync_frequency,
    }

    if (body.password) {
      updateData.credentials_encrypted = encrypt(body.password)
    }

    // Remover undefined
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    )

    const atualizado = await prisma.conexaoERP.update({
      where: { id },
      data: cleanData,
      select: {
        id: true,
        system_type: true,
        protocol: true,
        base_url: true,
        username: true,
        sync_frequency: true,
        connection_status: true,
        updated_at: true,
      },
    })

    res.json({ ok: true, data: atualizado })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/erp/conexoes/:id — remover conexão
// ---------------------------------------------------------------------------
conexoesRouter.delete('/api/v1/erp/conexoes/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenant_id } = req.query as { tenant_id: string }

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const existente = await prisma.conexaoERP.findFirst({
      where: { id, tenant_id },
    })
    if (!existente) {
      throw new AppError('Conexão não encontrada', 404, 'NOT_FOUND')
    }

    await prisma.conexaoERP.delete({ where: { id } })

    res.json({ ok: true, message: 'Conexão removida com sucesso' })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/erp/conexoes/testar — testar conectividade
// ---------------------------------------------------------------------------
conexoesRouter.post('/api/v1/erp/conexoes/testar', async (req, res, next) => {
  try {
    const schema = z.object({
      tenant_id: z.string().min(1),
      product_id: z.string().optional(),
    })

    const { tenant_id, product_id } = schema.parse(req.body)

    const result = await testarConexao(tenant_id, product_id ?? null)

    res.json({ ok: result.ok, data: result })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
    }
    next(err)
  }
})
