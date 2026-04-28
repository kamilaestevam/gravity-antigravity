/**
 * importar.ts — Importação multi-canal de lançamentos
 * Canais: XML DUIMP, Portal Único, Smart Read, Planilha Excel
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/AppError.js'
import { parseXmlDuimp } from '../services/xmlParser.js'
import { buscarImpostosPortalUnico } from '../services/portalUnicoConnector.js'
import { calcularValorBRL } from '../lib/currencyConverter.js'
import { recalcularTotais } from './lancamentos.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: (req.headers['x-company-id'] as string) || '',
  }
}

const XmlImportSchema = z.object({
  xml_content: z.string().min(1),
})

const PortalUnicoSchema = z.object({
  duimp_numero: z.string().min(1),
})

const LancamentoImportadoSchema = z.array(z.object({
  categoria_codigo: z.string(),
  descricao: z.string(),
  moeda: z.enum(['BRL', 'USD', 'EUR', 'GBP', 'CHF', 'CNY', 'ARS', 'UYU']),
  taxa_cambio: z.number().positive(),
  valor: z.number().positive(),
  icms_origem_portal: z.boolean().default(false),
}))

// POST /:processoId/importar/xml
router.post('/:processoId/importar/xml', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = XmlImportSchema.parse(req.body)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const impostos = await parseXmlDuimp(body.xml_content)

    res.json({ data: impostos, preview: true })
  } catch (err) { next(err) }
})

// POST /:processoId/importar/xml/confirmar
router.post('/:processoId/importar/xml/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const lancamentosData = LancamentoImportadoSchema.parse(req.body.lancamentos)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const criados = await criarLancamentosImportados(
      prisma, lancamentosData, financeiro, tenantId, companyId, userId, 'XML_DUIMP'
    )

    await recalcularTotais(prisma, financeiro.id, tenantId)

    res.status(201).json({ data: criados, count: criados.length })
  } catch (err) { next(err) }
})

// POST /:processoId/importar/portal-unico
router.post('/:processoId/importar/portal-unico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = PortalUnicoSchema.parse(req.body)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const impostos = await buscarImpostosPortalUnico(body.duimp_numero)

    res.json({ data: impostos, preview: true })
  } catch (err) { next(err) }
})

// POST /:processoId/importar/portal-unico/confirmar
router.post('/:processoId/importar/portal-unico/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const lancamentosData = LancamentoImportadoSchema.parse(req.body.lancamentos)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const criados = await criarLancamentosImportados(
      prisma, lancamentosData, financeiro, tenantId, companyId, userId, 'PORTAL_UNICO'
    )

    await recalcularTotais(prisma, financeiro.id, tenantId)

    res.status(201).json({ data: criados, count: criados.length })
  } catch (err) { next(err) }
})

// POST /:processoId/importar/smart-read
router.post('/:processoId/importar/smart-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Placeholder — reuso do Smart Read service do NF Importação via S2S
    res.json({
      data: [],
      preview: true,
      message: 'Smart Read: envie o arquivo via multipart/form-data com campo "arquivo"',
    })
  } catch (err) { next(err) }
})

// POST /:processoId/importar/planilha
router.post('/:processoId/importar/planilha', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: [],
      preview: true,
      message: 'Planilha: envie o arquivo Excel preenchido via multipart/form-data com campo "arquivo"',
    })
  } catch (err) { next(err) }
})

// ── Helper ──────────────────────────────────────────────────────────────────

type LancamentoImportado = z.infer<typeof LancamentoImportadoSchema>[number]

async function criarLancamentosImportados(
  prisma: PrismaClient,
  lancamentos: LancamentoImportado[],
  financeiro: { id: string; company_id: string },
  tenantId: string,
  companyId: string,
  userId: string,
  canal: 'XML_DUIMP' | 'PORTAL_UNICO' | 'SMART_READ' | 'PLANILHA'
) {
  const criados = []

  for (const l of lancamentos) {
    const categoria = await prisma.financeiroCategorias.findFirst({
      where: { codigo: l.categoria_codigo, tenant_id: tenantId },
    })

    if (!categoria) continue

    const valor_brl = calcularValorBRL(l.valor, l.taxa_cambio)

    const lancamento = await prisma.financeiroLancamento.create({
      data: {
        tenant_id: tenantId,
        company_id: companyId || financeiro.company_id,
        financeiro_id: financeiro.id,
        categoria_id: categoria.id,
        categoria_nome: categoria.nome,
        grupo_custo: categoria.grupo_custo,
        moeda: l.moeda,
        taxa_cambio: l.taxa_cambio,
        valor: l.valor,
        valor_brl,
        status_pagamento: 'PENDENTE',
        canal_entrada: canal,
        icms_origem_portal: l.icms_origem_portal ?? false,
        created_by: userId,
      },
    })

    criados.push(lancamento)
  }

  return criados
}

export { router as importarRouter }
