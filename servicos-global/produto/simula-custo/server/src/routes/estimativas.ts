/**
 * estimativas.ts — CRUD de Estimativas SimulaCusto
 * Routes: /api/v1/simula-custo/estimativas
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

export const estimativasRouter = Router()

interface TenantRequest extends Request {
  prisma?: PrismaClient
  tenantId?: string
}

const CreateEstimativaSchema = z.object({
  ncm: z.string().min(8).max(10),
  paisOrigem: z.string().length(2),
  dataFatoGerador: z.string(),
  operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']).default('IMPORTACAO'),
  tipo_operacao: z.enum(['DIRETA', 'CONTA_ORDEM', 'ENCOMENDA', 'COMERCIAL_EXPORTADORA']).default('DIRETA'),
  incoterm: z.string().default('FOB'),
  quantidade: z.number().positive().default(1),
  referencia: z.string().max(30).optional(),
  valorProduto: z.number().nonnegative(),
  moedaProduto: z.string().length(3).default('USD'),
  freteInter: z.number().nonnegative().default(0),
  moedaFrete: z.string().length(3).default('USD'),
  seguroInter: z.number().nonnegative().default(0),
  moedaSeguro: z.string().length(3).default('USD'),
  taxasOrigem: z.array(z.any()).default([]),
  taxasDestino: z.array(z.any()).default([]),
  ufDesembaraco: z.string().length(2).default('SP'),
  aliquotaII: z.number().min(0).max(1).default(0),
  aliquotaIPI: z.number().min(0).max(1).default(0),
  aliquotaPIS: z.number().min(0).max(1).default(0),
  aliquotaCOFINS: z.number().min(0).max(1).default(0),
  aliquotaICMS: z.number().min(0).max(1).default(0),
  documentos: z.array(z.any()).default([]),
})

async function gerarNumero(_prisma: unknown, tenantId: string, userId: string, operacao: string): Promise<string> {
  const prisma = _prisma as any
  const ano = new Date().getFullYear()
  const prefixo = operacao === 'IMPORTACAO' ? 'IMP' : 'EXP'
  const seq = await prisma.simulaCustoSequencia.upsert({
    where: { id_organizacao_user_id_ano: { id_organizacao: tenantId, user_id: userId, ano } },
    update: { ultimo_numero: { increment: 1 } },
    create: { id_organizacao: tenantId, user_id: userId, ano, ultimo_numero: 1 },
  })
  return `EST-${prefixo}-${String(seq.ultimo_numero).padStart(5, '0')}/${String(ano).slice(-2)}`
}

function serialize(_e: unknown) {
  const e = _e as any
  return {
    id: e.id,
    numero: e.numero,
    status: e.status,
    ncm: e.ncm,
    operacao: e.operacao,
    referencia: e.referencia,
    landed_cost_brl: e.landed_cost_brl ? Number(e.landed_cost_brl) : null,
    total_tributos: e.total_tributos ? Number(e.total_tributos) : null,
  }
}

// POST /estimativas
estimativasRouter.post('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateEstimativaSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })

    const data = parsed.data
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string
    const numero = await gerarNumero(prisma, tenantId, userId, data.operacao)

    const estimativa = await prisma.simulaCustoEstimativa.create({
      data: {
        user_id: userId, product_id: 'simula-custo', numero,
        referencia: data.referencia ?? null, operacao: data.operacao, tipo_operacao: data.tipo_operacao,
        status: 'EM_CRIACAO', ncm: data.ncm, incoterm: data.incoterm, quantidade: data.quantidade,
        moeda_produto: data.moedaProduto, valor_produto: data.valorProduto,
        moeda_frete: data.moedaFrete, valor_frete: data.freteInter,
        moeda_seguro: data.moedaSeguro, valor_seguro: data.seguroInter,
        uf_desembaraco: data.ufDesembaraco,
        aliquota_ii: data.aliquotaII, aliquota_ipi: data.aliquotaIPI,
        aliquota_pis: data.aliquotaPIS, aliquota_cofins: data.aliquotaCOFINS, aliquota_icms: data.aliquotaICMS,
      },
    })
    res.status(201).json(serialize(estimativa))
  } catch (err) { next(err) }
})

// GET /estimativas
estimativasRouter.get('/', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const { busca, status, page = '1', limit = '20' } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (busca) {
      where.OR = [
        { numero: { contains: busca, mode: 'insensitive' } },
        { referencia: { contains: busca, mode: 'insensitive' } },
        { ncm: { contains: busca } },
      ]
    }
    if (status) where.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [data, total] = await Promise.all([
      prisma.simulaCustoEstimativa.findMany({ where, orderBy: { created_at: 'desc' }, skip, take: Number(limit) }),
      prisma.simulaCustoEstimativa.count({ where }),
    ])

    res.json({
      data: data.map((_e: unknown) => { const e = _e as any; return { ...serialize(e), created_at: e.created_at } }),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    })
  } catch (err) { next(err) }
})

// GET /estimativas/kpis
estimativasRouter.get('/kpis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const [total, em_criacao, criadas, arquivadas, aggLC, aggTrib] = await Promise.all([
      prisma.simulaCustoEstimativa.count(),
      prisma.simulaCustoEstimativa.count({ where: { status: 'EM_CRIACAO' } }),
      prisma.simulaCustoEstimativa.count({ where: { status: 'CRIADA' } }),
      prisma.simulaCustoEstimativa.count({ where: { status: 'ARQUIVADA' } }),
      prisma.simulaCustoEstimativa.aggregate({ _avg: { landed_cost_brl: true } }),
      prisma.simulaCustoEstimativa.aggregate({ _sum: { total_tributos: true } }),
    ])
    res.json({
      total, em_criacao, criadas, arquivadas,
      landed_cost_medio: aggLC._avg.landed_cost_brl ? Number(aggLC._avg.landed_cost_brl) : 0,
      total_tributos_acumulado: aggTrib._sum.total_tributos ? Number(aggTrib._sum.total_tributos) : 0,
    })
  } catch (err) { next(err) }
})

// GET /estimativas/:id
estimativasRouter.get('/:id', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const e = await prisma.simulaCustoEstimativa.findFirst({ where: { id: req.params.id } })
    if (!e) return res.status(404).json({ error: 'Estimativa não encontrada' })
    res.json(serialize(e))
  } catch (err) { next(err) }
})

// POST /estimativas/:id/duplicar
estimativasRouter.post('/:id/duplicar', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string
    const original = await prisma.simulaCustoEstimativa.findFirst({ where: { id: req.params.id } })
    if (!original) return res.status(404).json({ error: 'Estimativa original não encontrada' })

    const numero = await gerarNumero(prisma, tenantId, userId, original.operacao)
    const copia = await prisma.simulaCustoEstimativa.create({
      data: {
        user_id: userId, product_id: 'simula-custo', numero,
        referencia: original.referencia ? `${original.referencia} (cópia)` : null,
        operacao: original.operacao, tipo_operacao: original.tipo_operacao, status: 'EM_CRIACAO',
        ncm: original.ncm, incoterm: original.incoterm, quantidade: original.quantidade,
        moeda_produto: original.moeda_produto, valor_produto: original.valor_produto,
        moeda_frete: original.moeda_frete, valor_frete: original.valor_frete,
        moeda_seguro: original.moeda_seguro, valor_seguro: original.valor_seguro,
        uf_desembaraco: original.uf_desembaraco,
        aliquota_ii: original.aliquota_ii, aliquota_ipi: original.aliquota_ipi,
        aliquota_pis: original.aliquota_pis, aliquota_cofins: original.aliquota_cofins,
        aliquota_icms: original.aliquota_icms,
      },
    })
    res.status(201).json(serialize(copia))
  } catch (err) { next(err) }
})

// PATCH /estimativas/:id/status
estimativasRouter.patch('/:id/status', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const { status } = req.body
    if (!['EM_CRIACAO', 'CRIADA', 'ARQUIVADA'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }
    const e = await prisma.simulaCustoEstimativa.update({ where: { id: req.params.id }, data: { status } })
    res.json(serialize(e))
  } catch (err) { next(err) }
})
