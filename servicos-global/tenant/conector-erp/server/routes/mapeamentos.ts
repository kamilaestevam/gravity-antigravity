// server/routes/mapeamentos.ts
// CRUD de mapeamentos de campos ERP → campos internos Gravity.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'

export const mapeamentosRouter = Router()

const mapeamentoSchema = z.object({
  tenant_id: z.string().min(1),
  product_id: z.string().optional(),
  conexao_id: z.string().min(1),
  entidade: z.string().min(1, 'Entidade SAP/ERP é obrigatória'),
  campo_erp: z.string().min(1, 'Campo ERP de origem é obrigatório'),
  campo_interno: z.string().min(1, 'Campo interno Gravity é obrigatório'),
  tipo_dados: z
    .enum(['string', 'number', 'date', 'boolean', 'json'])
    .default('string'),
  transformacao: z.string().optional(),
  obrigatorio: z.boolean().default(false),
  valor_padrao: z.string().optional(),
})

const atualizarSchema = mapeamentoSchema.partial().omit({ tenant_id: true })

// ---------------------------------------------------------------------------
// POST /api/v1/erp/mapeamentos
// ---------------------------------------------------------------------------
mapeamentosRouter.post('/api/v1/erp/mapeamentos', async (req, res, next) => {
  try {
    const body = mapeamentoSchema.parse(req.body)

    const mapeamento = await prisma.mapeamentoCampo.create({
      data: {
        tenant_id: body.tenant_id,
        product_id: body.product_id ?? null,
        conexao_id: body.conexao_id,
        entidade: body.entidade,
        campo_erp: body.campo_erp,
        campo_interno: body.campo_interno,
        tipo_dados: body.tipo_dados,
        transformacao: body.transformacao ?? null,
        obrigatorio: body.obrigatorio,
        valor_padrao: body.valor_padrao ?? null,
      },
    })

    res.status(201).json({ ok: true, data: mapeamento })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR', err.errors))
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/erp/mapeamentos — listar por tenant/produto/conexão
// ---------------------------------------------------------------------------
mapeamentosRouter.get('/api/v1/erp/mapeamentos', async (req, res, next) => {
  try {
    const { tenant_id, product_id, conexao_id, entidade } =
      req.query as Record<string, string>

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const mapeamentos = await prisma.mapeamentoCampo.findMany({
      where: {
        tenant_id,
        ...(product_id ? { product_id } : {}),
        ...(conexao_id ? { conexao_id } : {}),
        ...(entidade ? { entidade } : {}),
      },
      orderBy: [{ entidade: 'asc' }, { campo_erp: 'asc' }],
    })

    res.json({ ok: true, data: mapeamentos })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/erp/mapeamentos/:id
// ---------------------------------------------------------------------------
mapeamentosRouter.patch('/api/v1/erp/mapeamentos/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenant_id } = req.query as { tenant_id: string }

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const existente = await prisma.mapeamentoCampo.findFirst({
      where: { id, tenant_id },
    })
    if (!existente) {
      throw new AppError('Mapeamento não encontrado', 404, 'NOT_FOUND')
    }

    const body = atualizarSchema.parse(req.body)

    const atualizado = await prisma.mapeamentoCampo.update({
      where: { id },
      data: body,
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
// DELETE /api/v1/erp/mapeamentos/:id
// ---------------------------------------------------------------------------
mapeamentosRouter.delete('/api/v1/erp/mapeamentos/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenant_id } = req.query as { tenant_id: string }

    if (!tenant_id) {
      throw new AppError('tenant_id é obrigatório', 400, 'MISSING_TENANT_ID')
    }

    const existente = await prisma.mapeamentoCampo.findFirst({
      where: { id, tenant_id },
    })
    if (!existente) {
      throw new AppError('Mapeamento não encontrado', 404, 'NOT_FOUND')
    }

    await prisma.mapeamentoCampo.delete({ where: { id } })

    res.json({ ok: true, message: 'Mapeamento removido com sucesso' })
  } catch (err) {
    next(err)
  }
})
