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
import { AppError } from '../lib/erros.js'
import { atividadesIntegration, historicoIntegration } from '../services/integracoes-tenant.js'

const router = Router()

// --- Schemas de validacao ---

const CriarCotacaoSchema = z.object({
  referencia_interna_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal_cotacao_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_cotacao_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  origem_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  origem_nome_cotacao_bid_frete_internacional: z.string().min(1),
  origem_pais_cotacao_bid_frete_internacional: z.string().min(1),
  destino_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  destino_nome_cotacao_bid_frete_internacional: z.string().min(1),
  destino_pais_cotacao_bid_frete_internacional: z.string().min(1),
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string().min(1),
  ncm_cotacao_bid_frete_internacional: z.string().optional(),
  quantidade_cotacao_bid_frete_internacional: z.number().int().positive().default(1),
  tipo_container_cotacao_bid_frete_internacional: z.string().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.number().positive().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().positive().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().min(1),
  zipcode_origem_cotacao_bid_frete_internacional: z.string().optional(),
  zipcode_destino_cotacao_bid_frete_internacional: z.string().optional(),
  valor_meta_cotacao_bid_frete_internacional: z.number().positive().optional(),
  moeda_meta_cotacao_bid_frete_internacional: z.string().default('USD'),
  visibilidade_cotacao_bid_frete_internacional: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
  anonima_cotacao_bid_frete_internacional: z.boolean().default(false),
  data_limite_resposta_cotacao_bid_frete_internacional: z.string().datetime().optional(),
  fornecedor_ids: z.array(z.string()).optional(), // IDs dos fornecedores para cotacao direcionada
})

const FiltrosCotacaoSchema = z.object({
  status: z.string().optional(),
  modal_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  order_by: z.string().default('data_criacao_cotacao_bid_frete_internacional'),
  order_dir: z.enum(['asc', 'desc']).default('desc'),
})

const AtualizarStatusSchema = z.object({
  status: z.enum(['APROVADA', 'REPROVADA', 'CANCELADA']),
  id_fornecedor_vencedor_cotacao_bid_frete_internacional: z.string().optional(),
  motivo_reprovacao_cotacao_bid_frete_internacional: z.string().optional(),
  motivo_cancelamento_cotacao_bid_frete_internacional: z.string().optional(),
})

// --- Gerar numero_cotacao_bid_frete_internacional sequencial ---
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

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const { fornecedor_ids, ...cotacaoData } = parsed.data

    const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.create({
      data: {
        ...cotacaoData,
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
        numero_cotacao_bid_frete_internacional: gerarNumeroCotacao(),
        data_limite_resposta_cotacao_bid_frete_internacional: cotacaoData.data_limite_resposta_cotacao_bid_frete_internacional ? new Date(cotacaoData.data_limite_resposta_cotacao_bid_frete_internacional) : null,
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

    const where: Record<string, unknown> = { id_produto_gravity: 'bid-frete-internacional' }
    if (filtros.status) where.status_cotacao_bid_frete_internacional = filtros.status
    if (filtros.modal_cotacao_bid_frete_internacional) where.modal_cotacao_bid_frete_internacional = filtros.modal_cotacao_bid_frete_internacional
    if (filtros.tipo_operacao_cotacao_bid_frete_internacional) where.tipo_operacao_cotacao_bid_frete_internacional = filtros.tipo_operacao_cotacao_bid_frete_internacional
    if (filtros.origem) where.origem_nome_cotacao_bid_frete_internacional = { contains: filtros.origem, mode: 'insensitive' }
    if (filtros.destino) where.destino_nome_cotacao_bid_frete_internacional = { contains: filtros.destino, mode: 'insensitive' }
    if (filtros.data_inicio || filtros.data_fim) {
      const createdAt: Record<string, unknown> = {}
      if (filtros.data_inicio) createdAt.gte = new Date(filtros.data_inicio)
      if (filtros.data_fim) createdAt.lte = new Date(filtros.data_fim)
      where.data_criacao_cotacao_bid_frete_internacional = createdAt
    }

    const skip = (filtros.page - 1) * filtros.limit

    const [cotacoes, total] = await Promise.all([
      (req.prisma as any).bidFreteInternacionalCotacao.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { [filtros.order_by]: filtros.order_dir },
        include: {
          pedidos_cotacao: { select: { id_pedido_cotacao_bid_frete_internacional: true, id_fornecedor_bid_frete_internacional: true, status_pedido_cotacao_bid_frete_internacional: true } },
          propostas: { select: { id_proposta_bid_frete_internacional: true, id_fornecedor_bid_frete_internacional: true, valor_total_proposta_bid_frete_internacional: true, dias_transito_proposta_bid_frete_internacional: true, status_proposta_bid_frete_internacional: true } },
        },
      }),
      (req.prisma as any).bidFreteInternacionalCotacao.count({ where }),
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
    const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.findFirst({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
      include: {
        pedidos_cotacao: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
          },
        },
        propostas: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
            taxas: true,
          },
          orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
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
    const existing = await (req.prisma as any).bidFreteInternacionalCotacao.findFirst({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (existing.status_cotacao_bid_frete_internacional !== 'RASCUNHO' && existing.status_cotacao_bid_frete_internacional !== 'FALTA_INFORMACAO') {
      throw new AppError('So e possivel editar cotacoes em rascunho ou com falta de informacao', 400, 'INVALID_STATUS')
    }

    const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.update({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
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

    const existing = await (req.prisma as any).bidFreteInternacionalCotacao.findFirst({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const data: Record<string, unknown> = { status_cotacao_bid_frete_internacional: parsed.data.status }

    if (parsed.data.status === 'APROVADA') {
      data.data_aprovacao_cotacao_bid_frete_internacional = new Date()
      data.id_fornecedor_vencedor_cotacao_bid_frete_internacional = parsed.data.id_fornecedor_vencedor_cotacao_bid_frete_internacional
    } else if (parsed.data.status === 'REPROVADA') {
      data.motivo_reprovacao_cotacao_bid_frete_internacional = parsed.data.motivo_reprovacao_cotacao_bid_frete_internacional
    } else if (parsed.data.status === 'CANCELADA') {
      data.data_cancelamento_cotacao_bid_frete_internacional = new Date()
      data.motivo_cancelamento_cotacao_bid_frete_internacional = parsed.data.motivo_cancelamento_cotacao_bid_frete_internacional
    }

    const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.update({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
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
    const existing = await (req.prisma as any).bidFreteInternacionalCotacao.findFirst({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    if (!existing) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (existing.status_cotacao_bid_frete_internacional !== 'RASCUNHO') {
      throw new AppError('So e possivel excluir cotacoes em rascunho', 400, 'INVALID_STATUS')
    }

    await (req.prisma as any).bidFreteInternacionalCotacao.delete({ where: { id_cotacao_bid_frete_internacional: req.params.id } })
    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

// ─── IMPORTAÇÃO EM BLOCO ────────────────────────────────────────────────────────

const ItemBlocoSchema = z.object({
  referencia_interna_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modal_cotacao_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_cotacao_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  origem_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  origem_nome_cotacao_bid_frete_internacional: z.string().min(1),
  origem_pais_cotacao_bid_frete_internacional: z.string().min(1),
  destino_codigo_cotacao_bid_frete_internacional: z.string().min(1),
  destino_nome_cotacao_bid_frete_internacional: z.string().min(1),
  destino_pais_cotacao_bid_frete_internacional: z.string().min(1),
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string().min(1),
  ncm_cotacao_bid_frete_internacional: z.string().optional(),
  quantidade_cotacao_bid_frete_internacional: z.number().int().positive().default(1),
  tipo_container_cotacao_bid_frete_internacional: z.string().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.number().positive().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().positive().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().min(1),
  valor_meta_cotacao_bid_frete_internacional: z.number().positive().optional(),
  moeda_meta_cotacao_bid_frete_internacional: z.string().default('USD'),
})

const ImportarBlocoSchema = z.object({
  itens: z.array(ItemBlocoSchema).min(1).max(500),
  data_limite_resposta_cotacao_bid_frete_internacional: z.string().datetime().optional(),
  visibilidade_cotacao_bid_frete_internacional: z.enum(['DIRECIONADA', 'ABERTA']).default('DIRECIONADA'),
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

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const results: Array<{ linha: number; id?: string; numero_cotacao_bid_frete_internacional?: string; status: 'ok' | 'erro'; erro?: string }> = []

    for (let i = 0; i < parsed.data.itens.length; i++) {
      const item = parsed.data.itens[i]
      try {
        const numero_cotacao_bid_frete_internacional = gerarNumeroCotacao()
        const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.create({
          data: {
            ...item,
            id_produto_gravity: 'bid-frete-internacional',
            id_usuario: userId,
            numero_cotacao_bid_frete_internacional,
            visibilidade_cotacao_bid_frete_internacional: parsed.data.visibilidade_cotacao_bid_frete_internacional,
            data_limite_resposta_cotacao_bid_frete_internacional: parsed.data.data_limite_resposta_cotacao_bid_frete_internacional ? new Date(parsed.data.data_limite_resposta_cotacao_bid_frete_internacional) : null,
          },
        })
        results.push({ linha: i + 1, id: cotacao.id_cotacao_bid_frete_internacional, numero_cotacao_bid_frete_internacional, status: 'ok' })
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
        id_usuario: userId,
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
