/**
 * cotacoes.ts — CRUD de Cotacoes
 * POST   /                 Criar cotacao (manual ou bloco)
 * GET    /                 Listar cotacoes (com filtros)
 * GET    /:id              Detalhe da cotacao
 * PATCH  /:id              Atualizar cotacao
 * PATCH  /:id/status       Mudar status (aprovar/reprovar/cancelar)
 * DELETE /:id              Excluir cotacao (rascunho)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { atividadesIntegration, historicoIntegration } from '../services/tenantIntegrations.js'

const router = Router()

// --- Schemas de validacao ---

const CriarCotacaoSchema = z.object({
  referencia_interna: z.string().optional(),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  origem_codigo: z.string().min(1),
  origem_nome: z.string().min(1),
  origem_pais: z.string().min(1),
  destino_codigo: z.string().min(1),
  destino_nome: z.string().min(1),
  destino_pais: z.string().min(1),
  descricao_mercadoria: z.string().min(1),
  ncm: z.string().optional(),
  quantidade: z.number().int().positive().default(1),
  tipo_container: z.string().optional(),
  peso_kg: z.number().positive().optional(),
  cubagem_m3: z.number().positive().optional(),
  incoterm: z.string().min(1),
  zip_code_origem: z.string().optional(),
  zip_code_destino: z.string().optional(),
  valor_target: z.number().positive().optional(),
  moeda_target: z.string().default('USD'),
  visibilidade: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
  ocultar_nome_empresa: z.boolean().default(false),
  data_limite_resposta: z.string().datetime().optional(),
  fornecedor_ids: z.array(z.string()).optional(), // IDs dos fornecedores para cotacao direcionada
})

const FiltrosCotacaoSchema = z.object({
  status: z.string().optional(),
  modal: z.string().optional(),
  tipo_operacao: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  order_by: z.string().default('created_at'),
  order_dir: z.enum(['asc', 'desc']).default('desc'),
})

const AtualizarStatusSchema = z.object({
  status: z.enum(['APROVADA', 'REPROVADA', 'CANCELADA']),
  fornecedor_vencedor_id: z.string().optional(),
  motivo_reprovacao: z.string().optional(),
  motivo_cancelamento: z.string().optional(),
})

// --- Gerar numero sequencial ---
function gerarNumeroCotacao(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `BID-${date}-${seq}`
}

// --- POST / — Criar cotacao ---
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarCotacaoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401, 'UNAUTHORIZED')

    const { fornecedor_ids, ...cotacaoData } = parsed.data

    const cotacao = await (req.prisma as any).freteIntBidCotacoes.create({
      data: {
        ...cotacaoData,
        product_id: 'bid-frete',
        user_id: userId,
        numero: gerarNumeroCotacao(),
        data_limite_resposta: cotacaoData.data_limite_resposta ? new Date(cotacaoData.data_limite_resposta) : null,
      },
    })

    // Integrações S2S (fire-and-forget)
    const tenantId = (req as any).tenantId
    if (tenantId) {
      atividadesIntegration.cotacaoCriada(tenantId, userId, cotacao)
      historicoIntegration.cotacaoCriada(tenantId, userId, cotacao)
    }

    res.status(201).json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// --- GET / — Listar cotacoes ---
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = FiltrosCotacaoSchema.parse(req.query)

    const where: Record<string, unknown> = { product_id: 'bid-frete' }
    if (filtros.status) where.status = filtros.status
    if (filtros.modal) where.modal = filtros.modal
    if (filtros.tipo_operacao) where.tipo_operacao = filtros.tipo_operacao
    if (filtros.origem) where.origem_nome = { contains: filtros.origem, mode: 'insensitive' }
    if (filtros.destino) where.destino_nome = { contains: filtros.destino, mode: 'insensitive' }
    if (filtros.data_inicio || filtros.data_fim) {
      const createdAt: Record<string, unknown> = {}
      if (filtros.data_inicio) createdAt.gte = new Date(filtros.data_inicio)
      if (filtros.data_fim) createdAt.lte = new Date(filtros.data_fim)
      where.created_at = createdAt
    }

    const skip = (filtros.page - 1) * filtros.limit

    const [cotacoes, total] = await Promise.all([
      (req.prisma as any).freteIntBidCotacoes.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { [filtros.order_by]: filtros.order_dir },
        include: {
          bid_requests: { select: { id: true, fornecedor_id: true, status: true } },
          bid_responses: { select: { id: true, fornecedor_id: true, valor_total: true, transit_time_dias: true, status: true } },
        },
      }),
      (req.prisma as any).freteIntBidCotacoes.count({ where }),
    ])

    res.json({
      cotacoes,
      pagination: {
        page: filtros.page,
        limit: filtros.limit,
        total,
        pages: Math.ceil(total / filtros.limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

// --- GET /:id — Detalhe da cotacao ---
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cotacao = await (req.prisma as any).freteIntBidCotacoes.findFirst({
      where: { id: req.params.id },
      include: {
        bid_requests: {
          include: {
            fornecedor: { select: { id: true, nome: true, tipo: true, email: true } },
          },
        },
        bid_responses: {
          include: {
            fornecedor: { select: { id: true, nome: true, tipo: true, email: true } },
            detalhes_taxas: true,
          },
          orderBy: { valor_total: 'asc' },
        },
      },
    })

    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    res.json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// --- PATCH /:id — Atualizar cotacao ---
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await (req.prisma as any).freteIntBidCotacoes.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (existing.status !== 'RASCUNHO' && existing.status !== 'FALTA_INFORMACAO') {
      throw new AppError('So e possivel editar cotacoes em rascunho ou com falta de informacao', 400, 'INVALID_STATUS')
    }

    const cotacao = await (req.prisma as any).freteIntBidCotacoes.update({
      where: { id: req.params.id },
      data: req.body,
    })

    res.json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// --- PATCH /:id/status — Aprovar/Reprovar/Cancelar ---
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarStatusSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const existing = await (req.prisma as any).freteIntBidCotacoes.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const data: Record<string, unknown> = { status: parsed.data.status }

    if (parsed.data.status === 'APROVADA') {
      data.data_aprovacao = new Date()
      data.fornecedor_vencedor_id = parsed.data.fornecedor_vencedor_id
    } else if (parsed.data.status === 'REPROVADA') {
      data.motivo_reprovacao = parsed.data.motivo_reprovacao
    } else if (parsed.data.status === 'CANCELADA') {
      data.data_cancelamento = new Date()
      data.motivo_cancelamento = parsed.data.motivo_cancelamento
    }

    const cotacao = await (req.prisma as any).freteIntBidCotacoes.update({
      where: { id: req.params.id },
      data,
    })

    res.json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /:id — Excluir rascunho ---
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await (req.prisma as any).freteIntBidCotacoes.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (existing.status !== 'RASCUNHO') {
      throw new AppError('So e possivel excluir cotacoes em rascunho', 400, 'INVALID_STATUS')
    }

    await (req.prisma as any).freteIntBidCotacoes.delete({ where: { id: req.params.id } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

// ─── IMPORTAÇÃO EM BLOCO ────────────────────────────────────────────────────────

const ItemBlocoSchema = z.object({
  referencia_interna: z.string().optional(),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  origem_codigo: z.string().min(1),
  origem_nome: z.string().min(1),
  origem_pais: z.string().min(1),
  destino_codigo: z.string().min(1),
  destino_nome: z.string().min(1),
  destino_pais: z.string().min(1),
  descricao_mercadoria: z.string().min(1),
  ncm: z.string().optional(),
  quantidade: z.number().int().positive().default(1),
  tipo_container: z.string().optional(),
  peso_kg: z.number().positive().optional(),
  cubagem_m3: z.number().positive().optional(),
  incoterm: z.string().min(1),
  valor_target: z.number().positive().optional(),
  moeda_target: z.string().default('USD'),
})

const ImportarBlocoSchema = z.object({
  itens: z.array(ItemBlocoSchema).min(1).max(500),
  data_limite_resposta: z.string().datetime().optional(),
  visibilidade: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
  fornecedor_ids: z.array(z.string()).optional(),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).optional(),
})

// --- POST /bloco — Importar cotações em bloco ---
router.post('/bloco', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ImportarBlocoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => `[${i.path}] ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }

    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401, 'UNAUTHORIZED')

    const results: Array<{ linha: number; id?: string; numero?: string; status: 'ok' | 'erro'; erro?: string }> = []

    for (let i = 0; i < parsed.data.itens.length; i++) {
      const item = parsed.data.itens[i]
      try {
        const numero = gerarNumeroCotacao()
        const cotacao = await (req.prisma as any).freteIntBidCotacoes.create({
          data: {
            ...item,
            product_id: 'bid-frete',
            user_id: userId,
            numero,
            visibilidade: parsed.data.visibilidade,
            data_limite_resposta: parsed.data.data_limite_resposta ? new Date(parsed.data.data_limite_resposta) : null,
          },
        })
        results.push({ linha: i + 1, id: cotacao.id, numero, status: 'ok' })
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        results.push({ linha: i + 1, status: 'erro', erro: errorMessage })
      }
    }

    const ok = results.filter(r => r.status === 'ok').length
    const erros = results.filter(r => r.status === 'erro').length

    // Integracoes
    const tenantId = (req as any).tenantId
    if (tenantId && ok > 0) {
      historicoIntegration.registrar(tenantId, {
        user_id: userId,
        acao: 'IMPORTAR_BLOCO',
        entidade: 'cotacao',
        entidade_id: 'batch',
        detalhes: `Importação em bloco: ${ok} cotações criadas, ${erros} erros`,
      })
    }

    res.status(201).json({
      total: parsed.data.itens.length,
      criadas: ok,
      erros,
      results,
    })
  } catch (err) {
    next(err)
  }
})

export { router as cotacoesRouter }
