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
import {
  EnviarPropostaSchema,
  formatarErroValidacaoPropostaEnviarProposta,
} from '../schemas/enviar-proposta-bid-frete-internacional-schema.js'
import {
  COTACAO_SELECT_RESPOSTA_FORNECEDOR,
  enriquecerDisparosRespostaFornecedor,
} from '../lib/enriquecer-disparo-resposta-fornecedor-bid-frete-internacional.js'
import { resolverFornecedorLogado } from '../lib/resolver-fornecedor-logado-bid-frete-internacional.js'

const router = Router()

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

function mapFornecedorResumo(fornecedor: Record<string, unknown>) {
  return {
    id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
    nome_fornecedor_bid_frete_internacional: fornecedor.nome_fornecedor_bid_frete_internacional,
    tipo_fornecedor_bid_frete_internacional: fornecedor.tipo_fornecedor_bid_frete_internacional,
  }
}

const STATUS_PROPOSTA_EM_ANALISE = [
  'RECEBIDA',
  'EM_ANALISE',
  'MELHOR_PRECO',
  'MELHOR_TRANSIT',
  'MELHOR_AVALIACAO',
] as const

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await resolverFornecedorLogado(req)
    const id_fornecedor = fornecedor.id_fornecedor_bid_frete_internacional

    const [
      pendentes,
      propostasEnviadas,
      propostasAprovadas,
      propostasEmAnalise,
      propostasReprovadas,
      totalDisparos,
    ] = await Promise.all([
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
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: {
          id_fornecedor_bid_frete_internacional: id_fornecedor,
          status_proposta_bid_frete_internacional: { in: [...STATUS_PROPOSTA_EM_ANALISE] },
        },
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: {
          id_fornecedor_bid_frete_internacional: id_fornecedor,
          status_proposta_bid_frete_internacional: 'REPROVADA',
        },
      }),
      (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: id_fornecedor },
      }),
    ])

    const taxaResposta =
      totalDisparos > 0 ? (propostasEnviadas / totalDisparos * 100).toFixed(1) : '0'
    const taxaAprovacao =
      propostasEnviadas > 0 ? (propostasAprovadas / propostasEnviadas * 100).toFixed(1) : '0'

    const funil_visao_fornecedor_bid_frete_internacional = [
      {
        rotulo_funil_visao_fornecedor_bid_frete_internacional: 'aguardando_resposta',
        quantidade_funil_visao_fornecedor_bid_frete_internacional: pendentes,
        cor_funil_visao_fornecedor_bid_frete_internacional: '#fbbf24',
      },
      {
        rotulo_funil_visao_fornecedor_bid_frete_internacional: 'em_analise',
        quantidade_funil_visao_fornecedor_bid_frete_internacional: propostasEmAnalise,
        cor_funil_visao_fornecedor_bid_frete_internacional: '#818cf8',
      },
      {
        rotulo_funil_visao_fornecedor_bid_frete_internacional: 'aprovadas',
        quantidade_funil_visao_fornecedor_bid_frete_internacional: propostasAprovadas,
        cor_funil_visao_fornecedor_bid_frete_internacional: '#34d399',
      },
      {
        rotulo_funil_visao_fornecedor_bid_frete_internacional: 'reprovadas',
        quantidade_funil_visao_fornecedor_bid_frete_internacional: propostasReprovadas,
        cor_funil_visao_fornecedor_bid_frete_internacional: '#f87171',
      },
    ]

    const alertas_visao_fornecedor_bid_frete_internacional = [
      {
        rotulo_alerta_visao_fornecedor_bid_frete_internacional: 'cotacoes_pendentes',
        quantidade_alerta_visao_fornecedor_bid_frete_internacional: pendentes,
        tom_alerta_visao_fornecedor_bid_frete_internacional: 'amber',
        rota_alerta_visao_fornecedor_bid_frete_internacional:
          '/bid-frete/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes',
      },
      {
        rotulo_alerta_visao_fornecedor_bid_frete_internacional: 'propostas_em_analise',
        quantidade_alerta_visao_fornecedor_bid_frete_internacional: propostasEmAnalise,
        tom_alerta_visao_fornecedor_bid_frete_internacional: 'blue',
        rota_alerta_visao_fornecedor_bid_frete_internacional:
          '/bid-frete/visao-fornecedor-bid-frete-internacional/propostas',
      },
      {
        rotulo_alerta_visao_fornecedor_bid_frete_internacional: 'propostas_reprovadas',
        quantidade_alerta_visao_fornecedor_bid_frete_internacional: propostasReprovadas,
        tom_alerta_visao_fornecedor_bid_frete_internacional: 'rose',
        rota_alerta_visao_fornecedor_bid_frete_internacional:
          '/bid-frete/visao-fornecedor-bid-frete-internacional/propostas',
      },
      {
        rotulo_alerta_visao_fornecedor_bid_frete_internacional: 'propostas_aprovadas',
        quantidade_alerta_visao_fornecedor_bid_frete_internacional: propostasAprovadas,
        tom_alerta_visao_fornecedor_bid_frete_internacional: 'emerald',
        rota_alerta_visao_fornecedor_bid_frete_internacional:
          '/bid-frete/visao-fornecedor-bid-frete-internacional/propostas',
      },
    ].filter((a) => a.quantidade_alerta_visao_fornecedor_bid_frete_internacional > 0)

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
          propostas_em_analise_visao_fornecedor_bid_frete_internacional: propostasEmAnalise,
          propostas_reprovadas_visao_fornecedor_bid_frete_internacional: propostasReprovadas,
          disparos_recebidos_visao_fornecedor_bid_frete_internacional: totalDisparos,
          taxa_resposta_visao_fornecedor_bid_frete_internacional: taxaResposta,
          taxa_aprovacao_visao_fornecedor_bid_frete_internacional: taxaAprovacao,
        },
        funil_visao_fornecedor_bid_frete_internacional,
        alertas_visao_fornecedor_bid_frete_internacional,
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
        status_disparo_cotacao_bid_frete_internacional: {
          in: ['ENVIADO', 'VISUALIZADO', 'PENDENTE', 'RESPONDIDO', 'EXPIRADO'],
        },
      },
      include: {
        proposta: {
          include: {
            taxas_origem: true,
            taxas_destino: true,
          },
        },
        cotacao: {
          select: {
            ...COTACAO_SELECT_RESPOSTA_FORNECEDOR,
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

    const disparosEnriquecidos = await enriquecerDisparosRespostaFornecedor(disparos as never[])

    res.json({
      visao_fornecedor_bid_frete_internacional: {
        disparos_cotacao_bid_frete_internacional: disparosEnriquecidos,
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
    if (!parsed.success) throw new AppError(formatarErroValidacaoPropostaEnviarProposta(parsed.error), 400, 'VALIDATION_ERROR')

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
      const e = err as Error & { statusCode: number; code?: string }
      next(new AppError(e.message, e.statusCode, e.code ?? 'BAD_REQUEST'))
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

export { router as visaoFornecedorBidFreteInternacionalRouter, TabelaBidFreteInternacionalSchema }
export { EnviarPropostaSchema, formatarErroValidacaoPropostaEnviarProposta } from '../schemas/enviar-proposta-bid-frete-internacional-schema.js'
