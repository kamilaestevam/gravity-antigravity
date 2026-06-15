/**
 * dashboard.ts — Dashboard do BID Frete Internacional
 * GET /              KPIs e metricas gerais
 * GET /calendario    Alertas do calendario
 * GET /funil         Funil de status
 */

import { Router, Request, Response, NextFunction } from 'express'
import { motorGanho } from '../services/motor-ganho-bid-frete-internacional.js'
import {
  montarMapaCotacoesVisaoGeralBidFreteInternacional,
  STATUS_MAPA_VISAO_GERAL,
} from '../lib/mapa-cotacoes-visao-geral-bid-frete-internacional.js'
import { agregarInsightsGraficosBidFreteInternacional } from '../lib/agregar-insights-graficos-bid-frete-internacional.js'
import { clausulaFiltroWorkspaceBidFrete, parseIdsWorkspacesQuery } from '../shared/workspace-filtro-bid-frete-internacional.js'
import { assertWorkspacesAutorizadosNoRequest } from '../shared/validar-multi-workspace-bid-frete-internacional.js'

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
    const { data_inicio, data_fim } = req.query as { data_inicio?: string; data_fim?: string }
    const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)

    // Cotacoes em andamento
    const cotacoesAndamento = await (req.prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'FALTA_INFORMACAO'] },
        ...(filtroWorkspace),
      },
    })

    // Total de cotacoes passadas
    const cotacoesPassadas = await (req.prisma as any).cotacaoBidFreteInternacional.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA'] },
        ...(filtroWorkspace),
      },
    })

    // Valores totais das cotacoes em andamento
    const valoresAndamento = await (req.prisma as any).propostaBidFreteInternacional.aggregate({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        cotacao: {
          status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO'] },
          ...(filtroWorkspace),
        },
      },
      _sum: { valor_total_proposta_bid_frete_internacional: true },
    })

    // Valores totais das cotacoes passadas (aprovadas)
    const valoresPassadas = await (req.prisma as any).propostaBidFreteInternacional.aggregate({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_proposta_bid_frete_internacional: 'APROVADA',
        ...(Object.keys(filtroWorkspace).length > 0 ? { cotacao: filtroWorkspace } : {}),
      },
      _sum: { valor_total_proposta_bid_frete_internacional: true },
    })

    // Cotacoes aprovadas por timing
    const cotacoesAprovadas = await (req.prisma as any).cotacaoBidFreteInternacional.findMany({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: 'APROVADA',
        ...(filtroWorkspace),
      },
      select: { data_aprovacao_cotacao_bid_frete_internacional: true, data_limite_resposta_cotacao_bid_frete_internacional: true },
    })

    type AprovadaRow = { data_aprovacao_cotacao_bid_frete_internacional: Date; data_limite_resposta_cotacao_bid_frete_internacional: Date | null }
    const emTempo = (cotacoesAprovadas as AprovadaRow[]).filter((c) =>
      !c.data_limite_resposta_cotacao_bid_frete_internacional || new Date(c.data_aprovacao_cotacao_bid_frete_internacional) <= new Date(c.data_limite_resposta_cotacao_bid_frete_internacional)
    ).length
    const fora = cotacoesAprovadas.length - emTempo

    const idsWorkspaces = parseIdsWorkspacesQuery(req)
    const idWorkspaceUnico =
      !idsWorkspaces?.length && typeof filtroWorkspace.id_workspace === 'string'
        ? filtroWorkspace.id_workspace
        : undefined

    // Savings
    const savings = await motorGanho.calcularMetricas(req.prisma!, {
      ...(idsWorkspaces?.length ? { ids_workspaces: idsWorkspaces } : {}),
      ...(idWorkspaceUnico ? { id_workspace: idWorkspaceUnico } : {}),
      data_inicio: data_inicio ? new Date(data_inicio) : undefined,
      data_fim: data_fim ? new Date(data_fim) : undefined,
    })

    // Funil de status
    const funil = await (req.prisma as any).cotacaoBidFreteInternacional.groupBy({
      by: ['status_cotacao_bid_frete_internacional'],
      where: { id_produto_gravity: 'bid-frete-internacional', ...filtroWorkspace },
      _count: true,
    })

    const funilMapped = (
      funil as Array<{ status_cotacao_bid_frete_internacional: string; _count: number | { _all?: number } }>
    ).map((f) => ({
      status: f.status_cotacao_bid_frete_internacional,
      count: extrairCountGroupBy(f),
    }))
    const cotacoesAprovadasCount =
      funilMapped.find((f) => f.status === 'APROVADA')?.count ?? cotacoesAprovadas.length

    const disparosComResposta = await (req.prisma as any).disparoCotacaoBidFreteInternacional.findMany({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        data_envio_disparo_cotacao_bid_frete_internacional: { not: null },
        data_resposta_disparo_cotacao_bid_frete_internacional: { not: null },
        ...(Object.keys(filtroWorkspace).length > 0 ? { cotacao: filtroWorkspace } : {}),
      },
      select: {
        data_envio_disparo_cotacao_bid_frete_internacional: true,
        data_resposta_disparo_cotacao_bid_frete_internacional: true,
      },
      take: 500,
    })

    type DisparoRespostaRow = {
      data_envio_disparo_cotacao_bid_frete_internacional: Date
      data_resposta_disparo_cotacao_bid_frete_internacional: Date
    }
    const diasResposta = (disparosComResposta as DisparoRespostaRow[])
      .map((d) => {
        const envio = new Date(d.data_envio_disparo_cotacao_bid_frete_internacional).getTime()
        const resposta = new Date(d.data_resposta_disparo_cotacao_bid_frete_internacional).getTime()
        return (resposta - envio) / (1000 * 60 * 60 * 24)
      })
      .filter((d) => Number.isFinite(d) && d >= 0)

    const tempo_medio_resposta_dias =
      diasResposta.length > 0
        ? Math.round((diasResposta.reduce((a, b) => a + b, 0) / diasResposta.length) * 10) / 10
        : null

    res.json({
      cotacoes_andamento: cotacoesAndamento,
      cotacoes_passadas: cotacoesPassadas,
      cotacoes_aprovadas: cotacoesAprovadasCount,
      valor_andamento_usd: valoresAndamento._sum?.valor_total_proposta_bid_frete_internacional ?? 0,
      valor_aprovado_usd: valoresPassadas._sum?.valor_total_proposta_bid_frete_internacional ?? 0,
      tempo_medio_resposta_dias,
      aprovacao: {
        total: cotacoesAprovadas.length,
        em_tempo: emTempo,
        fora_prazo: fora,
        percentual_em_tempo: cotacoesAprovadas.length > 0 ? (emTempo / cotacoesAprovadas.length * 100).toFixed(1) : '0',
      },
      savings,
      funil: funilMapped,
    })
  } catch (err) {
    next(err)
  }
}

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
    const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)

    const inicioHoje = new Date()
    inicioHoje.setHours(0, 0, 0, 0)
    const fimHoje = new Date()
    fimHoje.setHours(23, 59, 59, 999)
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [venceHoje, respostasPendentes, aguardandoAprovacao, novasSeteDias] = await Promise.all([
      (req.prisma as any).cotacaoBidFreteInternacional.count({
        where: {
          id_produto_gravity: 'bid-frete-internacional',
          status_cotacao_bid_frete_internacional: { in: [...STATUS_ANDAMENTO] },
          data_limite_resposta_cotacao_bid_frete_internacional: { gte: inicioHoje, lte: fimHoje },
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
