/**
 * dashboard.ts — Dashboard do BID Frete Internacional
 * GET /              KPIs e metricas gerais
 * GET /calendario    Alertas do calendario
 * GET /funil         Funil de status
 */

import { Router, Request, Response, NextFunction } from 'express'
import { agregarKpisDashboardBidFreteInternacional } from '../lib/agregar-kpis-dashboard-bid-frete-internacional.js'
import {
  intervaloPeriodoAnteriorDashboard,
  intervaloPeriodoAnteriorPorDatas,
} from '../lib/periodo-dashboard-bid-frete-internacional.js'
import {
  generateInsightsBidFreteInternacional,
  normalizeRoleBidFrete,
  toKpiSnapshotBidFrete,
} from '../services/gabi-insights-bid-frete-internacional.js'
import {
  montarMapaCotacoesVisaoGeralBidFreteInternacional,
  STATUS_MAPA_VISAO_GERAL,
} from '../lib/mapa-cotacoes-visao-geral-bid-frete-internacional.js'
import { agregarInsightsGraficosBidFreteInternacional } from '../lib/agregar-insights-graficos-bid-frete-internacional.js'
import {
  mapearCotacaoInsightsDetalhe,
  montarWhereInsightsDetalheBidFreteInternacional,
} from '../lib/montar-insights-detalhe-bid-frete-internacional.js'
import { clausulaFiltroWorkspaceBidFrete, parseIdsWorkspacesQuery } from '../shared/workspace-filtro-bid-frete-internacional.js'
import { assertWorkspacesAutorizadosNoRequest } from '../shared/validar-multi-workspace-bid-frete-internacional.js'
import { AppError } from '../lib/erros.js'
import {
  dashboardKpisQuerySchema,
  insightsAlertasQuerySchema,
  insightsDetalheQuerySchema,
  parseDataReferenciaInsights,
} from '../shared/dashboard-queries-zod-bid-frete-internacional.js'

const router = Router()

function extrairCountGroupBy(row: { _count: number | { _all?: number } }): number {
  const count = row._count
  if (typeof count === 'number') return count
  return count._all ?? 0
}

const STATUS_ANDAMENTO = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'FALTA_INFORMACAO',
] as const

// GET / e GET /kpis — KPIs gerais
async function handleKpis(req: Request, res: Response, next: NextFunction) {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const parsed = dashboardKpisQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Query inválida',
        400,
        'VALIDATION_ERROR',
      )
    }
    const { data_inicio, data_fim, status_slug_kpi_andamento } = parsed.data
    const payload = await agregarKpisDashboardBidFreteInternacional(req, {
      data_inicio,
      data_fim,
      status_slug_kpi_andamento,
    })
    res.json(payload)
  } catch (err) {
    next(err)
  }
}

// GET /insights — GABI Fase 1 (templates determinísticos ranqueados por role)
router.get('/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const period = (req.query.period as string) ?? '30d'
    const rawRole =
      (req.headers['x-user-role'] as string | undefined)
      ?? (req.query.role as string | undefined)
    const role = normalizeRoleBidFrete(rawRole)

    const data_inicio =
      (req.query.from as string | undefined)
      ?? (req.query.data_inicio as string | undefined)
    const data_fim =
      (req.query.to as string | undefined)
      ?? (req.query.data_fim as string | undefined)

    const kpisRaw = await agregarKpisDashboardBidFreteInternacional(req, {
      data_inicio,
      data_fim,
    })
    const kpis = toKpiSnapshotBidFrete(period, kpisRaw)

    const prevRange = data_inicio && data_fim
      ? intervaloPeriodoAnteriorPorDatas(data_inicio, data_fim)
      : intervaloPeriodoAnteriorDashboard(period)

    const prevRaw = await agregarKpisDashboardBidFreteInternacional(req, {
      data_inicio: prevRange.from,
      data_fim: prevRange.to,
    })
    const prevKpis = toKpiSnapshotBidFrete(period, prevRaw)

    const insights = generateInsightsBidFreteInternacional(kpis, role, prevKpis)
    res.json({ period, role, insights })
  } catch (err) {
    next(err)
  }
})

router.get('/', handleKpis)
router.get('/kpis', handleKpis)

// GET /calendario — Alertas do calendario
router.get('/calendario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agora = new Date()
    const em24h = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const em48h = new Date(Date.now() + 48 * 60 * 60 * 1000)

    // Respostas de fornecedores recentes (ultimas 24h)
    const respostasRecentes = await (req.prisma as any).propostaBidFreteInternacional.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        data_criacao_proposta_bid_frete_internacional: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    // Proximo ao vencimento (1 dia)
    const proximoVencimento = await (req.prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
        data_limite_resposta_cotacao_bid_frete_internacional: { gte: agora, lte: em24h },
      },
    })

    const inicioHoje = new Date()
    inicioHoje.setHours(0, 0, 0, 0)
    const fimHoje = new Date()
    fimHoje.setHours(23, 59, 59, 999)

    // Data limite vence hoje
    const venceHoje = await (req.prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
        data_limite_resposta_cotacao_bid_frete_internacional: {
          gte: inicioHoje,
          lte: fimHoje,
        },
      },
    })

    // Fora do prazo
    const foraPrazo = await (req.prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
        data_limite_resposta_cotacao_bid_frete_internacional: { lt: new Date() },
      },
    })

    res.json({
      alertas: [
        { tipo: 'respostas', label: 'Respostas de fornecedores', count: respostasRecentes, cor: 'green' },
        { tipo: 'vencimento', label: 'Proximo ao vencimento (1 dia)', count: proximoVencimento, cor: 'yellow' },
        { tipo: 'vence_hoje', label: 'Data limite de resposta (vence hoje)', count: venceHoje, cor: 'orange' },
        { tipo: 'fora_prazo', label: 'Fora do prazo de resposta', count: foraPrazo, cor: 'red' },
      ],
    })
  } catch (err) {
    next(err)
  }
})

// GET /insights-alertas — cards da coluna Alertas (Insights cliente)
router.get('/insights-alertas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const parsedQuery = insightsAlertasQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.errors[0]?.message ?? 'Query inválida',
        400,
        'VALIDATION_ERROR',
      )
    }
    const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)
    const referencia = parseDataReferenciaInsights(parsedQuery.data.data_referencia)

    const inicioDia = new Date(referencia)
    inicioDia.setHours(0, 0, 0, 0)
    const fimDia = new Date(referencia)
    fimDia.setHours(23, 59, 59, 999)
    const seteDiasAtras = new Date(referencia.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [venceHoje, respostasPendentes, aguardandoAprovacao, novasSeteDias] = await Promise.all([
      (req.prisma as any).cotacaoBidFreteInternacional.count({
        where: {
          id_produto_gravity: 'bid-frete-internacional',
          status_cotacao_bid_frete_internacional: { in: [...STATUS_ANDAMENTO] },
          data_limite_resposta_cotacao_bid_frete_internacional: { gte: inicioDia, lte: fimDia },
          ...filtroWorkspace,
        },
      }),
      (req.prisma as any).cotacaoBidFreteInternacional.count({
        where: {
          id_produto_gravity: 'bid-frete-internacional',
          status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
          ...filtroWorkspace,
        },
      }),
      (req.prisma as any).cotacaoBidFreteInternacional.count({
        where: {
          id_produto_gravity: 'bid-frete-internacional',
          status_cotacao_bid_frete_internacional: 'AGUARDANDO_APROVACAO',
          ...filtroWorkspace,
        },
      }),
      // Card "Novas cotações (7 dias)": inclui RASCUNHO (alinhado ao funil Insights e à Lista).
      // Exclui apenas CANCELADA — ver agregar-insights-graficos (bucket andamento).
      (req.prisma as any).cotacaoBidFreteInternacional.count({
        where: {
          id_produto_gravity: 'bid-frete-internacional',
          status_cotacao_bid_frete_internacional: { not: 'CANCELADA' },
          data_criacao_cotacao_bid_frete_internacional: { gte: seteDiasAtras },
          ...filtroWorkspace,
        },
      }),
    ])

    res.json({
      data_referencia: inicioDia.toISOString().slice(0, 10),
      alertas: [
        { tipo: 'vence_hoje', label: 'Cotações vencem hoje', count: venceHoje, cor: 'red' },
        { tipo: 'resposta', label: 'Respostas pendentes', count: respostasPendentes, cor: 'orange' },
        { tipo: 'aprovacao', label: 'Aguardando aprovação', count: aguardandoAprovacao, cor: 'yellow' },
        { tipo: 'nova', label: 'Novas cotações (7 dias)', count: novasSeteDias, cor: 'green' },
      ],
    })
  } catch (err) {
    next(err)
  }
})

// GET /insights-graficos — gráficos inferiores da visão Insights (cliente)
router.get('/insights-graficos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)
    const agora = new Date()
    const seisMesesAtras = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - 5, 1))

    const cotacoes = await (req.prisma as any).cotacaoBidFreteInternacional.findMany({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        data_criacao_cotacao_bid_frete_internacional: { gte: seisMesesAtras },
        ...filtroWorkspace,
      },
      select: {
        status_cotacao_bid_frete_internacional: true,
        modal_cotacao_bid_frete_internacional: true,
        incoterm_cotacao_bid_frete_internacional: true,
        data_criacao_cotacao_bid_frete_internacional: true,
        data_aprovacao_cotacao_bid_frete_internacional: true,
        numero_cotacao_bid_frete_internacional: true,
        origem_nome_cotacao_bid_frete_internacional: true,
        origem_codigo_cotacao_bid_frete_internacional: true,
        destino_nome_cotacao_bid_frete_internacional: true,
        destino_codigo_cotacao_bid_frete_internacional: true,
        ganho_valor_cotacao_bid_frete_internacional: true,
        ganho_percentual_cotacao_bid_frete_internacional: true,
        propostas: {
          where: { status_proposta_bid_frete_internacional: 'APROVADA' },
          orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
          take: 1,
          select: {
            valor_total_proposta_bid_frete_internacional: true,
            dias_transito_proposta_bid_frete_internacional: true,
            fornecedor: {
              select: { nome_fornecedor_bid_frete_internacional: true },
            },
          },
        },
      },
    })

    type Row = (typeof cotacoes)[number]
    const normalizadas = (cotacoes as Row[]).map(c => ({
      status_cotacao_bid_frete_internacional: c.status_cotacao_bid_frete_internacional,
      modal_cotacao_bid_frete_internacional: c.modal_cotacao_bid_frete_internacional,
      incoterm_cotacao_bid_frete_internacional: c.incoterm_cotacao_bid_frete_internacional,
      data_criacao_cotacao_bid_frete_internacional: c.data_criacao_cotacao_bid_frete_internacional,
      data_aprovacao_cotacao_bid_frete_internacional: c.data_aprovacao_cotacao_bid_frete_internacional,
      numero_cotacao_bid_frete_internacional: c.numero_cotacao_bid_frete_internacional,
      origem_nome_cotacao_bid_frete_internacional: c.origem_nome_cotacao_bid_frete_internacional,
      origem_codigo_cotacao_bid_frete_internacional: c.origem_codigo_cotacao_bid_frete_internacional,
      destino_nome_cotacao_bid_frete_internacional: c.destino_nome_cotacao_bid_frete_internacional,
      destino_codigo_cotacao_bid_frete_internacional: c.destino_codigo_cotacao_bid_frete_internacional,
      ganho_valor_cotacao_bid_frete_internacional: c.ganho_valor_cotacao_bid_frete_internacional,
      ganho_percentual_cotacao_bid_frete_internacional: c.ganho_percentual_cotacao_bid_frete_internacional,
      fornecedor_vencedor: null,
      proposta_aprovada: c.propostas[0] ?? null,
    }))

    res.json(agregarInsightsGraficosBidFreteInternacional(normalizadas, agora))
  } catch (err) {
    next(err)
  }
})

// GET /insights-detalhe — cotações para drill-down de alertas/rotas (Insights cliente)
router.get('/insights-detalhe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const parsedQuery = insightsDetalheQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.errors[0]?.message ?? 'Query inválida',
        400,
        'VALIDATION_ERROR',
      )
    }
    const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)
    const {
      contexto,
      codigo_origem,
      codigo_destino,
      modal_cotacao_bid_frete_internacional,
      limit,
      data_referencia,
    } = parsedQuery.data

    const limite = limit ?? 20
    const where = montarWhereInsightsDetalheBidFreteInternacional(
      contexto,
      filtroWorkspace,
      {
        codigo_origem,
        codigo_destino,
        modal_cotacao_bid_frete_internacional,
        data_referencia,
      },
    )

    const [total, cotacoes] = await Promise.all([
      (req.prisma as any).cotacaoBidFreteInternacional.count({ where }),
      (req.prisma as any).cotacaoBidFreteInternacional.findMany({
        where,
        orderBy: { data_criacao_cotacao_bid_frete_internacional: 'desc' },
        take: limite,
        select: {
          id_cotacao_bid_frete_internacional: true,
          numero_cotacao_bid_frete_internacional: true,
          status_cotacao_bid_frete_internacional: true,
          origem_nome_cotacao_bid_frete_internacional: true,
          origem_codigo_cotacao_bid_frete_internacional: true,
          destino_nome_cotacao_bid_frete_internacional: true,
          destino_codigo_cotacao_bid_frete_internacional: true,
          descricao_mercadoria_cotacao_bid_frete_internacional: true,
          ncm_cotacao_bid_frete_internacional: true,
          quantidade_volume_cotacao_bid_frete_internacional: true,
          peso_kg_cotacao_bid_frete_internacional: true,
          cubagem_m3_cotacao_bid_frete_internacional: true,
          incoterm_cotacao_bid_frete_internacional: true,
          modal_cotacao_bid_frete_internacional: true,
          modalidade_cotacao_bid_frete_internacional: true,
          valor_meta_cotacao_bid_frete_internacional: true,
          moeda_meta_cotacao_bid_frete_internacional: true,
          data_criacao_cotacao_bid_frete_internacional: true,
          data_limite_resposta_cotacao_bid_frete_internacional: true,
          data_aprovacao_cotacao_bid_frete_internacional: true,
          propostas: {
            orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
            select: {
              valor_total_proposta_bid_frete_internacional: true,
              moeda_proposta_bid_frete_internacional: true,
              dias_transito_proposta_bid_frete_internacional: true,
              status_proposta_bid_frete_internacional: true,
              data_criacao_proposta_bid_frete_internacional: true,
              fornecedor: {
                select: { nome_fornecedor_bid_frete_internacional: true },
              },
            },
          },
          disparos_cotacao: {
            select: {
              data_envio_disparo_cotacao_bid_frete_internacional: true,
              data_resposta_disparo_cotacao_bid_frete_internacional: true,
              fornecedor: {
                select: { nome_fornecedor_bid_frete_internacional: true },
              },
            },
          },
        },
      }),
    ])

    res.json({
      contexto,
      total,
      cotacoes: cotacoes.map((c) => {
        const row = c as Omit<Parameters<typeof mapearCotacaoInsightsDetalhe>[0], 'disparo_cotacao_bid_frete_internacional'> & {
          disparos_cotacao: Parameters<typeof mapearCotacaoInsightsDetalhe>[0]['disparo_cotacao_bid_frete_internacional']
        }
        const { disparos_cotacao, ...rest } = row
        return mapearCotacaoInsightsDetalhe({
          ...rest,
          disparo_cotacao_bid_frete_internacional: disparos_cotacao ?? [],
        })
      }),
    })
  } catch (err) {
    next(err)
  }
})

// GET /mapa-cotacoes — globo/mapa da visão operacional (Insights cliente)
router.get('/mapa-cotacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await assertWorkspacesAutorizadosNoRequest(req)
    const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)
    const idOrganizacao =
      typeof req.headers['x-id-organizacao'] === 'string' ? req.headers['x-id-organizacao'] : undefined

    const cotacoes = await (req.prisma as any).cotacaoBidFreteInternacional.findMany({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: [...STATUS_MAPA_VISAO_GERAL] },
        ...(filtroWorkspace),
      },
      select: {
        id_cotacao_bid_frete_internacional: true,
        numero_cotacao_bid_frete_internacional: true,
        id_bid_bid_frete_internacional: true,
        bid_bid_frete_internacional: {
          select: {
            numero_bid_bid_frete_internacional: true,
          },
        },
        origem_codigo_cotacao_bid_frete_internacional: true,
        origem_nome_cotacao_bid_frete_internacional: true,
        origem_pais_cotacao_bid_frete_internacional: true,
        destino_codigo_cotacao_bid_frete_internacional: true,
        destino_nome_cotacao_bid_frete_internacional: true,
        destino_pais_cotacao_bid_frete_internacional: true,
        modal_cotacao_bid_frete_internacional: true,
        tipo_operacao_cotacao_bid_frete_internacional: true,
        propostas: {
          select: {
            valor_total_proposta_bid_frete_internacional: true,
            dias_transito_proposta_bid_frete_internacional: true,
          },
        },
      },
      take: 2000,
    })

    const mapa = await montarMapaCotacoesVisaoGeralBidFreteInternacional(cotacoes, {
      id_organizacao: idOrganizacao,
    })

    res.json({
      visao_geral_bid_frete_internacional: {
        mapa_cotacoes_visao_geral_bid_frete_internacional: mapa,
      },
    })
  } catch (err) {
    next(err)
  }
})

export { router as dashboardRouter }
