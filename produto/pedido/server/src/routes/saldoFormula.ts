/**
 * saldoFormula.ts — Configuração da fórmula do Saldo do Pedido por workspace
 *
 * GET  /api/v1/pedidos/configuracoes/saldo-formula
 *   → Retorna a fórmula atual do tenant (ou default se ainda não configurado)
 *
 * PUT  /api/v1/pedidos/configuracoes/saldo-formula
 *   → Valida a expressão (parser) e salva
 *
 * A fórmula é armazenada em forma de "chave" (nomes dos campos do pedido-level,
 * nunca aliases legíveis). Ex.:
 *   "quantidade_total_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido"
 *
 * O parser aceita aritmética, parênteses, SE() e SOMA_ITENS().
 * Referência: produto/pedido/server/src/services/formulaEngine.ts
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'
import { parsearFormula, SALDO_FORMULA_PADRAO } from '../../../../../servicos-global/tenant/processos-core/src/services/formulaEngine.js'

export const saldoFormulaRouter = Router()

// ── Schema Zod ────────────────────────────────────────────────────────────────

const SaldoFormulaSchema = z.object({
  formula_expressao: z.string().trim().min(1).max(2000),
})

// ── GET /configuracoes/saldo-formula ─────────────────────────────────────────

saldoFormulaRouter.get('/saldo-formula', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const registro = await db.pedidoSaldoFormulaConfig.findUnique({
        where: { id_organizacao: tenant_id },
      })
      res.json({
        data: {
          formula_expressao: registro?.formula_expressao_pedido_saldo_formula ?? SALDO_FORMULA_PADRAO,
          is_default: !registro,
        },
      })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /configuracoes/saldo-formula ─────────────────────────────────────────

saldoFormulaRouter.put('/saldo-formula', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SaldoFormulaSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload invalido', 400, 'VALIDATION_ERROR')
    }

    // Valida sintaxe antes de persistir — se não parsear, rejeita com 400
    try {
      parsearFormula(parsed.data.formula_expressao)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Expressao invalida'
      throw new AppError(`Formula invalida: ${msg}`, 400, 'VALIDATION_ERROR')
    }

    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      const registro = await db.pedidoSaldoFormulaConfig.upsert({
        where:  { id_organizacao: tenant_id },
        create: { id_organizacao: tenant_id, formula_expressao_pedido_saldo_formula: parsed.data.formula_expressao },
        update: { formula_expressao_pedido_saldo_formula: parsed.data.formula_expressao },
      })
      res.json({
        data: {
          formula_expressao: registro.formula_expressao_pedido_saldo_formula,
          is_default: false,
        },
      })
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /configuracoes/saldo-formula — volta ao default ──────────────────

saldoFormulaRouter.delete('/saldo-formula', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const tenant_id = (req as unknown as { tenant: TenantContext }).tenant.tenantId
      await db.pedidoSaldoFormulaConfig.deleteMany({ where: { id_organizacao: tenant_id } })
      res.json({
        data: {
          formula_expressao: SALDO_FORMULA_PADRAO,
          is_default: true,
        },
      })
    })
  } catch (err) {
    next(err)
  }
})
