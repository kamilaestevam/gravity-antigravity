/**
 * fornecedores.ts — CRUD de Fornecedores + Tabela de Precos
 * POST   /                     Cadastrar fornecedor
 * GET    /                     Listar fornecedores
 * GET    /:id                  Detalhe do fornecedor
 * PUT    /:id                  Atualizar fornecedor
 * PATCH  /:id/status           Ativar/Inativar/Bloquear
 * DELETE /:id                  Excluir fornecedor
 * POST   /:id/tabela           Adicionar rota na tabela de precos
 * GET    /:id/tabela           Listar tabela de precos
 * PUT    /:id/tabela/:tp       Atualizar item da tabela
 * DELETE /:id/tabela/:tp       Excluir item da tabela
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'

const router = Router()

// --- Schemas ---

const CriarFornecedorSchema = z.object({
  nome: z.string().min(1),
  nome_fantasia: z.string().optional(),
  tipo: z.enum(['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA']),
  cnpj: z.string().optional(),
  email: z.string().email(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  pais: z.string().optional(),
  cidade: z.string().optional(),
  clerk_user_id: z.string().optional(),
  aceita_cotacao_aberta: z.boolean().default(true),
  cotacao_automatica: z.boolean().default(false),
})

const TabelaPrecoSchema = z.object({
  origem_codigo: z.string().min(1),
  origem_nome: z.string().min(1),
  destino_codigo: z.string().min(1),
  destino_nome: z.string().min(1),
  modal: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  moeda: z.string().default('USD'),
  valor_frete: z.number().positive(),
  taxas_origem: z.number().min(0).default(0),
  taxas_destino: z.number().min(0).default(0),
  valor_total: z.number().positive(),
  transit_time_dias: z.number().int().positive(),
  free_time_dias: z.number().int().optional(),
  validade_inicio: z.string().datetime(),
  validade_fim: z.string().datetime(),
})

// --- POST / — Cadastrar fornecedor ---
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarFornecedorSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string

    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.create({
      data: {
        ...parsed.data,
        product_id: 'bid-frete',
        user_id: userId,
      },
    })

    res.status(201).json({ fornecedor })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2002') {
      return next(new AppError('Fornecedor com este email ja cadastrado neste tenant', 409, 'DUPLICATE'))
    }
    next(err)
  }
})

// --- GET / — Listar fornecedores ---
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, status, busca, page = '1', limit = '20' } = req.query as { tipo?: string; status?: string; busca?: string; page?: string; limit?: string }
    const where: Record<string, unknown> = { product_id: 'bid-frete' }

    if (tipo) where.tipo = tipo
    if (status) where.status = status
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { nome_fantasia: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [fornecedores, total] = await Promise.all([
      (req.prisma as any).freteIntBidFornecedores.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { nome: 'asc' },
        include: {
          _count: { select: { bid_requests: true, bid_responses: true, avaliacoes: true } },
        },
      }),
      (req.prisma as any).freteIntBidFornecedores.count({ where }),
    ])

    res.json({ fornecedores, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } })
  } catch (err) {
    next(err)
  }
})

// --- GET /:id — Detalhe ---
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { id: req.params.id },
      include: {
        tabelas_preco: { where: { ativa: true }, orderBy: { origem_nome: 'asc' } },
        avaliacoes: { orderBy: { created_at: 'desc' }, take: 10 },
        _count: { select: { bid_requests: true, bid_responses: true, avaliacoes: true } },
      },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404, 'NOT_FOUND')

    // Buscar rating global
    let rating_global = null
    try {
      rating_global = await (req.prisma as any).freteIntBidClassificacaoFornecedores.findUnique({
        where: { fornecedor_email: fornecedor.email },
      })
    } catch { /* tabela pode nao existir ainda */ }

    res.json({ fornecedor, rating_global })
  } catch (err) {
    next(err)
  }
})

// --- PUT /:id — Atualizar ---
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json({ fornecedor })
  } catch (err) {
    next(err)
  }
})

// --- PATCH /:id/status ---
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body
    if (!['ATIVO', 'INATIVO', 'BLOQUEADO'].includes(status)) {
      throw new AppError('Status invalido', 400, 'VALIDATION_ERROR')
    }
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.update({
      where: { id: req.params.id },
      data: { status },
    })
    res.json({ fornecedor })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /:id ---
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await (req.prisma as any).freteIntBidFornecedores.delete({ where: { id: req.params.id } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

// ─── TABELA DE PRECOS ──────────────────────────────────────────────────────────

// POST /:id/tabela
router.post('/:id/tabela', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = TabelaPrecoSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string

    const tabela = await (req.prisma as any).freteIntBidTabelasProntas.create({
      data: {
        ...parsed.data,
        product_id: 'bid-frete',
        user_id: userId,
        fornecedor_id: req.params.id,
        validade_inicio: new Date(parsed.data.validade_inicio),
        validade_fim: new Date(parsed.data.validade_fim),
      },
    })

    res.status(201).json({ tabela })
  } catch (err) {
    next(err)
  }
})

// GET /:id/tabela
router.get('/:id/tabela', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tabelas = await (req.prisma as any).freteIntBidTabelasProntas.findMany({
      where: { fornecedor_id: req.params.id },
      orderBy: { origem_nome: 'asc' },
    })
    res.json({ tabelas })
  } catch (err) {
    next(err)
  }
})

// PUT /:id/tabela/:tpId
router.put('/:id/tabela/:tpId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tabela = await (req.prisma as any).freteIntBidTabelasProntas.update({
      where: { id: req.params.tpId },
      data: req.body,
    })
    res.json({ tabela })
  } catch (err) {
    next(err)
  }
})

// DELETE /:id/tabela/:tpId
router.delete('/:id/tabela/:tpId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await (req.prisma as any).freteIntBidTabelasProntas.delete({ where: { id: req.params.tpId } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

export { router as fornecedoresRouter }
