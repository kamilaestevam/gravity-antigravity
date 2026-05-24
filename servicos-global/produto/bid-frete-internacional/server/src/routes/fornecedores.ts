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
import { AppError } from '../lib/erros.js'

const router = Router()

// --- Schemas ---

const CriarFornecedorSchema = z.object({
  nome_fornecedor_bid_frete_internacional: z.string().min(1),
  nome_fantasia_fornecedor_bid_frete_internacional: z.string().optional(),
  tipo_fornecedor_bid_frete_internacional: z.enum(['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA']),
  cnpj_fornecedor_bid_frete_internacional: z.string().optional(),
  email_fornecedor_bid_frete_internacional: z.string().email(),
  telefone_fornecedor_bid_frete_internacional: z.string().optional(),
  whatsapp_fornecedor_bid_frete_internacional: z.string().optional(),
  website_fornecedor_bid_frete_internacional: z.string().optional(),
  pais_fornecedor_bid_frete_internacional: z.string().optional(),
  cidade_fornecedor_bid_frete_internacional: z.string().optional(),
  id_clerk_usuario: z.string().optional(),
  aceita_cotacao_aberta_fornecedor_bid_frete_internacional: z.boolean().default(true),
  cotacao_automatica_fornecedor_bid_frete_internacional: z.boolean().default(false),
})

const TabelaPrecoSchema = z.object({
  origem_codigo_tabela_valor_bid_frete_internacional: z.string().min(1),
  origem_nome_tabela_valor_bid_frete_internacional: z.string().min(1),
  destino_codigo_tabela_valor_bid_frete_internacional: z.string().min(1),
  destino_nome_tabela_valor_bid_frete_internacional: z.string().min(1),
  modal_tabela_valor_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_tabela_valor_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  moeda_tabela_valor_bid_frete_internacional: z.string().default('USD'),
  valor_frete_tabela_valor_bid_frete_internacional: z.number().positive(),
  taxas_origem_tabela_valor_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_tabela_valor_bid_frete_internacional: z.number().min(0).default(0),
  valor_total_tabela_valor_bid_frete_internacional: z.number().positive(),
  dias_transito_tabela_valor_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_tabela_valor_bid_frete_internacional: z.number().int().optional(),
  validade_inicio_tabela_valor_bid_frete_internacional: z.string().datetime(),
  validade_fim_tabela_valor_bid_frete_internacional: z.string().datetime(),
})

// --- POST / — Cadastrar fornecedor ---
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarFornecedorSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string

    const fornecedor = await (req.prisma as any).bidFreteInternacionalFornecedor.create({
      data: {
        ...parsed.data,
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
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
    const where: Record<string, unknown> = { id_produto_gravity: 'bid-frete-internacional' }

    if (tipo) where.tipo_fornecedor_bid_frete_internacional = tipo
    if (status) where.status_fornecedor_bid_frete_internacional = status
    if (busca) {
      where.OR = [
        { nome_fornecedor_bid_frete_internacional: { contains: busca, mode: 'insensitive' } },
        { nome_fantasia_fornecedor_bid_frete_internacional: { contains: busca, mode: 'insensitive' } },
        { email_fornecedor_bid_frete_internacional: { contains: busca, mode: 'insensitive' } },
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [fornecedores, total] = await Promise.all([
      (req.prisma as any).bidFreteInternacionalFornecedor.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { nome_fornecedor_bid_frete_internacional: 'asc' },
        include: {
          _count: { select: { pedidos_cotacao: true, propostas: true, avaliacoes: true } },
        },
      }),
      (req.prisma as any).bidFreteInternacionalFornecedor.count({ where }),
    ])

    res.json({ fornecedores, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } })
  } catch (err) {
    next(err)
  }
})

// --- GET /:id — Detalhe ---
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await (req.prisma as any).bidFreteInternacionalFornecedor.findFirst({
      where: { id_fornecedor_bid_frete_internacional: req.params.id },
      include: {
        tabelas_valor: { where: { ativa_tabela_valor_bid_frete_internacional: true }, orderBy: { origem_nome_tabela_valor_bid_frete_internacional: 'asc' } },
        avaliacoes: { orderBy: { data_criacao_avaliacao_bid_frete_internacional: 'desc' }, take: 10 },
        _count: { select: { pedidos_cotacao: true, propostas: true, avaliacoes: true } },
      },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404, 'NOT_FOUND')

    // Buscar rating global
    let nota_global_classificacao_bid_frete_internacional = null
    try {
      nota_global_classificacao_bid_frete_internacional = await (req.prisma as any).bidFreteInternacionalClassificacao.findUnique({
        where: { email_fornecedor_classificacao_bid_frete_internacional: fornecedor.email_fornecedor_bid_frete_internacional },
      })
    } catch { /* tabela pode nao existir ainda */ }

    res.json({ fornecedor, nota_global_classificacao_bid_frete_internacional })
  } catch (err) {
    next(err)
  }
})

// --- PUT /:id — Atualizar ---
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await (req.prisma as any).bidFreteInternacionalFornecedor.update({
      where: { id_fornecedor_bid_frete_internacional: req.params.id },
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
    const fornecedor = await (req.prisma as any).bidFreteInternacionalFornecedor.update({
      where: { id_fornecedor_bid_frete_internacional: req.params.id },
      data: { status_fornecedor_bid_frete_internacional: status },
    })
    res.json({ fornecedor })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /:id ---
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await (req.prisma as any).bidFreteInternacionalFornecedor.delete({ where: { id_fornecedor_bid_frete_internacional: req.params.id } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

// ─── TABELA DE VALOR ──────────────────────────────────────────────────────────

// POST /:id_fornecedor/tabelas-valor
router.post('/:id_fornecedor/tabelas-valor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = TabelaPrecoSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string

    const tabela = await (req.prisma as any).bidFreteInternacionalTabelaValor.create({
      data: {
        ...parsed.data,
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
        id_fornecedor_bid_frete_internacional: req.params.id_fornecedor,
        validade_inicio_tabela_valor_bid_frete_internacional: new Date(parsed.data.validade_inicio_tabela_valor_bid_frete_internacional),
        validade_fim_tabela_valor_bid_frete_internacional: new Date(parsed.data.validade_fim_tabela_valor_bid_frete_internacional),
      },
    })

    res.status(201).json({ tabela })
  } catch (err) {
    next(err)
  }
})

// GET /:id_fornecedor/tabelas-valor
router.get('/:id_fornecedor/tabelas-valor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tabelas = await (req.prisma as any).bidFreteInternacionalTabelaValor.findMany({
      where: { id_fornecedor_bid_frete_internacional: req.params.id_fornecedor },
      orderBy: { origem_nome_tabela_valor_bid_frete_internacional: 'asc' },
    })
    res.json({ tabelas })
  } catch (err) {
    next(err)
  }
})

// PUT /:id_fornecedor/tabelas-valor/:id_tabela_valor
router.put('/:id_fornecedor/tabelas-valor/:id_tabela_valor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tabela = await (req.prisma as any).bidFreteInternacionalTabelaValor.update({
      where: { id_tabela_valor_bid_frete_internacional: req.params.id_tabela_valor },
      data: req.body,
    })
    res.json({ tabela })
  } catch (err) {
    next(err)
  }
})

// DELETE /:id_fornecedor/tabelas-valor/:id_tabela_valor
router.delete('/:id_fornecedor/tabelas-valor/:id_tabela_valor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await (req.prisma as any).bidFreteInternacionalTabelaValor.delete({ where: { id_tabela_valor_bid_frete_internacional: req.params.id_tabela_valor } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

export { router as fornecedoresRouter }
