/**
 * visao-fornecedor-bid-frete-internacional.ts — Visão do fornecedor (autenticado)
 *
 * GET  /dashboard
 * GET  /cotacoes-pendentes
 * GET  /propostas
 * POST /responder/:id_disparo_cotacao_bid_frete_internacional
 * GET  /desempenho
 * GET  /cobranca
 * GET  /tabelas-valor
 * POST /tabelas-valor
 * PUT  /tabelas-valor/:id_tabela_bid_frete_internacional
 * DELETE /tabelas-valor/:id_tabela_bid_frete_internacional
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { motorClassificacao } from '../services/motor-classificacao-bid-frete-internacional.js'
import { AppError } from '../lib/erros.js'
import { monetizacao } from '../services/monetizacao.js'
import { enviarPropostaDisparoBidFreteInternacional } from '../services/enviar-proposta-disparo-bid-frete-internacional.js'

const router = Router()

const EnviarPropostaSchema = z.object({
  moeda_proposta_bid_frete_internacional: z.string().default('USD'),
  valor_frete_proposta_bid_frete_internacional: z.number().positive(),
  taxas_origem_proposta_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_proposta_bid_frete_internacional: z.number().min(0).default(0),
  dias_transito_proposta_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_proposta_bid_frete_internacional: z.number().int().optional(),
  transbordos_proposta_bid_frete_internacional: z.number().int().min(0).default(0),
  escalas_proposta_bid_frete_internacional: z.string().optional(),
  observacoes_proposta_bid_frete_internacional: z.string().optional(),
  validade_proposta_bid_frete_internacional: z.string().datetime(),
  taxas: z.array(z.object({
    tipo_taxa_bid_frete_internacional: z.enum(['origem', 'destino', 'frete']),
    nome_taxa_bid_frete_internacional: z.string(),
    valor_taxa_bid_frete_internacional: z.number(),
    moeda_taxa_bid_frete_internacional: z.string().default('USD'),
    id_taxa_origem_destino: z.string().nullable().optional(),
  })).optional(),
})

const TabelaBidFreteInternacionalSchema = z.object({
  origem_codigo_tabela_bid_frete_internacional: z.string().min(1),
  origem_nome_tabela_bid_frete_internacional: z.string().min(1),
  destino_codigo_tabela_bid_frete_internacional: z.string().min(1),
  destino_nome_tabela_bid_frete_internacional: z.string().min(1),
  modal_tabela_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  modalidade_tabela_bid_frete_internacional: z.enum(['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']),
  moeda_tabela_bid_frete_internacional: z.string().default('USD'),
  valor_frete_tabela_bid_frete_internacional: z.number().positive(),
  taxas_origem_tabela_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_tabela_bid_frete_internacional: z.number().min(0).default(0),
  valor_total_tabela_bid_frete_internacional: z.number().positive(),
  dias_transito_tabela_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_tabela_bid_frete_internacional: z.number().int().optional(),
  validade_inicio_tabela_bid_frete_internacional: z.string().datetime(),
  validade_fim_tabela_bid_frete_internacional: z.string().datetime(),
})

async function resolverFornecedorLogado(req: Request) {
  const userId = req.headers['x-id-usuario'] as string
  if (!userId) throw new AppError('x-id-usuario obrigatorio', 401)

  const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({
    where: { id_clerk_usuario: userId },
  })

  if (!fornecedor) throw new AppError('Fornecedor nao encontrado para este usuario', 404)
  return fornecedor
}

function mapFornecedorResumo(fornecedor: Record<string, unknown>) {
  return {
    id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
    nome_fornecedor_bid_frete_internacional: fornecedor.nome_fornecedor_bid_frete_internacional,
    tipo_fornecedor_bid_frete_internacional: fornecedor.tipo_fornecedor_bid_frete_internacional,
  }
}

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const id_fornecedor = fornecedor.id_fornecedor_bid_frete_internacional

    const [pendentes, propostasEnviadas, propostasAprovadas, totalDisparos] = await Promise.all([
      (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
        where: {
          id_fornecedor_bid_frete_internacional: id_fornecedor,
          status_disparo_cotacao_bid_frete_internacional: { in: ['ENVIADO', 'VISUALIZADO'] },
        },
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: id_fornecedor },
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: {
          id_fornecedor_bid_frete_internacional: id_fornecedor,
          status_proposta_bid_frete_internacional: 'APROVADA',
        },
      }),
      (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: id_fornecedor },
      }),
    ])

    let classificacao_bid_frete_internacional = null
    try {
      classificacao_bid_frete_internacional = await (req.prisma as any).classificacaoBidFreteInternacional.findUnique({
        where: { email_fornecedor_classificacao_bid_frete_internacional: fornecedor.email_fornecedor_bid_frete_internacional },
      })
    } catch { /* pode nao existir */ }

    res.json({
      visao_fornecedor_bid_frete_internacional: {
        fornecedor_bid_frete_internacional: mapFornecedorResumo(fornecedor),
        metricas_visao_fornecedor_bid_frete_internacional: {
          cotacoes_pendentes_visao_fornecedor_bid_frete_internacional: pendentes,
          propostas_enviadas_visao_fornecedor_bid_frete_internacional: propostasEnviadas,
          propostas_aprovadas_visao_fornecedor_bid_frete_internacional: propostasAprovadas,
          disparos_recebidos_visao_fornecedor_bid_frete_internacional: totalDisparos,
          taxa_resposta_visao_fornecedor_bid_frete_internacional:
            totalDisparos > 0 ? (propostasEnviadas / totalDisparos * 100).toFixed(1) : '0',
          taxa_aprovacao_visao_fornecedor_bid_frete_internacional:
            propostasEnviadas > 0 ? (propostasAprovadas / propostasEnviadas * 100).toFixed(1) : '0',
        },
        classificacao_bid_frete_internacional,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/cotacoes-pendentes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)

    const disparos = await (req.prisma as any).disparoCotacaoBidFreteInternacional.findMany({
      where: {
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        status_disparo_cotacao_bid_frete_internacional: { in: ['ENVIADO', 'VISUALIZADO', 'PENDENTE'] },
      },
      include: {
        cotacao: {
          select: {
            id_cotacao_bid_frete_internacional: true,
            numero_cotacao_bid_frete_internacional: true,
            modal_cotacao_bid_frete_internacional: true,
            modalidade_cotacao_bid_frete_internacional: true,
            origem_nome_cotacao_bid_frete_internacional: true,
            origem_pais_cotacao_bid_frete_internacional: true,
            destino_nome_cotacao_bid_frete_internacional: true,
            destino_pais_cotacao_bid_frete_internacional: true,
            descricao_mercadoria_cotacao_bid_frete_internacional: true,
            ncm_cotacao_bid_frete_internacional: true,
            incoterm_cotacao_bid_frete_internacional: true,
            quantidade_cotacao_bid_frete_internacional: true,
            tipo_container_cotacao_bid_frete_internacional: true,
            peso_kg_cotacao_bid_frete_internacional: true,
            data_limite_resposta_cotacao_bid_frete_internacional: true,
            anonima_cotacao_bid_frete_internacional: true,
            valor_meta_cotacao_bid_frete_internacional: true,
          },
        },
      },
      orderBy: { data_criacao_disparo_cotacao_bid_frete_internacional: 'desc' },
    })

    const pendentesIds = (disparos as any[])
      .filter((r) => r.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO' || r.status_disparo_cotacao_bid_frete_internacional === 'PENDENTE')
      .map((r) => r.id_disparo_cotacao_bid_frete_internacional)

    if (pendentesIds.length > 0) {
      await (req.prisma as any).disparoCotacaoBidFreteInternacional.updateMany({
        where: { id_disparo_cotacao_bid_frete_internacional: { in: pendentesIds } },
        data: {
          status_disparo_cotacao_bid_frete_internacional: 'VISUALIZADO',
          data_visualizacao_disparo_cotacao_bid_frete_internacional: new Date(),
        },
      })
    }

    res.json({
      visao_fornecedor_bid_frete_internacional: {
        disparos_cotacao_bid_frete_internacional: disparos,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/propostas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string }
    const skip = (Number(page) - 1) * Number(limit)

    const [propostas, total] = await Promise.all([
      (req.prisma as any).propostaBidFreteInternacional.findMany({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
        include: {
          cotacao: {
            select: {
              id_cotacao_bid_frete_internacional: true,
              numero_cotacao_bid_frete_internacional: true,
              origem_nome_cotacao_bid_frete_internacional: true,
              destino_nome_cotacao_bid_frete_internacional: true,
              modal_cotacao_bid_frete_internacional: true,
              status_cotacao_bid_frete_internacional: true,
            },
          },
          taxas: true,
        },
        orderBy: { data_criacao_proposta_bid_frete_internacional: 'desc' },
        skip,
        take: Number(limit),
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
      }),
    ])

    res.json({
      visao_fornecedor_bid_frete_internacional: {
        propostas_bid_frete_internacional: propostas,
        paginacao_visao_fornecedor_bid_frete_internacional: {
          pagina: Number(page),
          limite: Number(limit),
          total,
          paginas: Math.ceil(total / Number(limit)),
        },
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post('/responder/:id_disparo_cotacao_bid_frete_internacional', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = EnviarPropostaSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string
    await resolverFornecedorLogado(req)

    const proposta = await enviarPropostaDisparoBidFreteInternacional(
      req.prisma!,
      req.params.id_disparo_cotacao_bid_frete_internacional,
      parsed.data,
      {
        id_usuario: userId,
        via_portal_proposta_bid_frete_internacional: true,
        tenantId: (req as any).tenantId,
      },
    )

    res.status(201).json({
      visao_fornecedor_bid_frete_internacional: {
        proposta_bid_frete_internacional: proposta,
      },
    })
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err) {
      next(new AppError(err.message, (err as Error & { statusCode: number }).statusCode))
      return
    }
    next(err)
  }
})

router.get('/desempenho', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)

    const classificacao_bid_frete_internacional = await motorClassificacao.recalcular(
      req.prisma!,
      fornecedor.email_fornecedor_bid_frete_internacional,
    )

    const avaliacoes_bid_frete_internacional = await (req.prisma as any).avaliacaoBidFreteInternacional.findMany({
      where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
      orderBy: { data_criacao_avaliacao_bid_frete_internacional: 'desc' },
      take: 20,
    })

    res.json({
      visao_fornecedor_bid_frete_internacional: {
        classificacao_bid_frete_internacional,
        avaliacoes_bid_frete_internacional,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/cobranca', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const resumo = await monetizacao.resumoFornecedor(req.prisma!, fornecedor.id_fornecedor_bid_frete_internacional)
    res.json({
      visao_fornecedor_bid_frete_internacional: {
        cobranca_visao_fornecedor_bid_frete_internacional: resumo,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/tabelas-valor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const tabelas = await (req.prisma as any).tabelaBidFreteInternacional.findMany({
      where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
      orderBy: { origem_nome_tabela_bid_frete_internacional: 'asc' },
    })
    res.json({
      visao_fornecedor_bid_frete_internacional: {
        tabelas_bid_frete_internacional: tabelas,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post('/tabelas-valor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = TabelaBidFreteInternacionalSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const fornecedor = await resolverFornecedorLogado(req)
    const userId = req.headers['x-id-usuario'] as string

    const tabela = await (req.prisma as any).tabelaBidFreteInternacional.create({
      data: {
        ...parsed.data,
        id_organizacao: fornecedor.id_organizacao,
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        validade_inicio_tabela_bid_frete_internacional: new Date(parsed.data.validade_inicio_tabela_bid_frete_internacional),
        validade_fim_tabela_bid_frete_internacional: new Date(parsed.data.validade_fim_tabela_bid_frete_internacional),
      },
    })

    res.status(201).json({
      visao_fornecedor_bid_frete_internacional: {
        tabela_bid_frete_internacional: tabela,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.put('/tabelas-valor/:id_tabela_bid_frete_internacional', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const parsed = TabelaBidFreteInternacionalSchema.partial().safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.validade_inicio_tabela_bid_frete_internacional) {
      data.validade_inicio_tabela_bid_frete_internacional = new Date(parsed.data.validade_inicio_tabela_bid_frete_internacional)
    }
    if (parsed.data.validade_fim_tabela_bid_frete_internacional) {
      data.validade_fim_tabela_bid_frete_internacional = new Date(parsed.data.validade_fim_tabela_bid_frete_internacional)
    }

    const existente = await (req.prisma as any).tabelaBidFreteInternacional.findFirst({
      where: {
        id_tabela_bid_frete_internacional: req.params.id_tabela_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
      },
    })
    if (!existente) throw new AppError('Tabela nao encontrada', 404)

    const tabela = await (req.prisma as any).tabelaBidFreteInternacional.update({
      where: { id_tabela_bid_frete_internacional: req.params.id_tabela_bid_frete_internacional },
      data,
    })

    res.json({
      visao_fornecedor_bid_frete_internacional: {
        tabela_bid_frete_internacional: tabela,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.delete('/tabelas-valor/:id_tabela_bid_frete_internacional', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const existente = await (req.prisma as any).tabelaBidFreteInternacional.findFirst({
      where: {
        id_tabela_bid_frete_internacional: req.params.id_tabela_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
      },
    })
    if (!existente) throw new AppError('Tabela nao encontrada', 404)

    await (req.prisma as any).tabelaBidFreteInternacional.delete({
      where: { id_tabela_bid_frete_internacional: req.params.id_tabela_bid_frete_internacional },
    })
    res.json({
      visao_fornecedor_bid_frete_internacional: {
        excluido_visao_fornecedor_bid_frete_internacional: true,
      },
    })
  } catch (err) {
    next(err)
  }
})

export { router as visaoFornecedorBidFreteInternacionalRouter, EnviarPropostaSchema, TabelaBidFreteInternacionalSchema }
