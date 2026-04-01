/**
 * rateio.ts — Geração de planilha de rateio de custos
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/AppError.js'
import { gerarPlanilhaRateio } from '../services/excelGenerator.js'
import type { PrismaClient } from '@prisma/client'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
  }
}

// GET /:processoId/rateio
router.get('/:processoId/rateio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const rateios = await prisma.financeiroRateio.findMany({
      where: { financeiro_id: financeiro.id, tenant_id: tenantId },
      orderBy: { gerado_em: 'desc' },
    })

    res.json({ data: rateios })
  } catch (err) { next(err) }
})

// POST /:processoId/rateio/gerar
router.post('/:processoId/rateio/gerar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
      include: { lancamentos: { include: { categoria: true } } },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    if (financeiro.lancamentos.length === 0) {
      throw new AppError(
        'O processo nao possui lancamentos para ratear.',
        400,
        'SEM_LANCAMENTOS'
      )
    }

    const { buffer, nomeArquivo } = await gerarPlanilhaRateio({
      referencia: financeiro.referencia ?? req.params.processoId,
      tipo_operacao: financeiro.tipo_operacao,
      lancamentos: financeiro.lancamentos.map(l => ({
        categoria_nome: l.categoria_nome,
        grupo_custo: l.grupo_custo,
        moeda: l.moeda,
        taxa_cambio: Number(l.taxa_cambio),
        valor: Number(l.valor),
        valor_brl: Number(l.valor_brl),
        status_pagamento: l.status_pagamento,
        fornecedor_nome: l.fornecedor_nome ?? undefined,
        data_pagamento: l.data_pagamento ?? undefined,
        data_vencimento: l.data_vencimento ?? undefined,
      })),
    })

    // Salvar registro no banco (storage_key = path relativo)
    const storageKey = `rateios/${tenantId}/${financeiro.id}/${Date.now()}_${nomeArquivo}`

    const rateio = await prisma.financeiroRateio.create({
      data: {
        tenant_id: tenantId,
        company_id: financeiro.company_id,
        financeiro_id: financeiro.id,
        storage_key: storageKey,
        nome_arquivo: nomeArquivo,
        gerado_por: userId,
      },
    })

    // Retorna o arquivo diretamente para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`)
    res.setHeader('X-Rateio-Id', rateio.id)
    res.send(buffer)
  } catch (err) { next(err) }
})

// GET /:processoId/rateio/:id/download
router.get('/:processoId/rateio/:id/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const rateio = await prisma.financeiroRateio.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
      include: { financeiro: { include: { lancamentos: { include: { categoria: true } } } } },
    })
    if (!rateio) throw new AppError('Rateio nao encontrado', 404, 'NOT_FOUND')

    const { buffer, nomeArquivo } = await gerarPlanilhaRateio({
      referencia: rateio.financeiro.referencia ?? req.params.processoId,
      tipo_operacao: rateio.financeiro.tipo_operacao,
      lancamentos: rateio.financeiro.lancamentos.map(l => ({
        categoria_nome: l.categoria_nome,
        grupo_custo: l.grupo_custo,
        moeda: l.moeda,
        taxa_cambio: Number(l.taxa_cambio),
        valor: Number(l.valor),
        valor_brl: Number(l.valor_brl),
        status_pagamento: l.status_pagamento,
        fornecedor_nome: l.fornecedor_nome ?? undefined,
        data_pagamento: l.data_pagamento ?? undefined,
        data_vencimento: l.data_vencimento ?? undefined,
      })),
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${rateio.nome_arquivo}"`)
    res.send(buffer)
  } catch (err) { next(err) }
})

export { router as rateioRouter }
