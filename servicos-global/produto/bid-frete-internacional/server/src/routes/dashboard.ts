/**
 * dashboard.ts — Dashboard do BID Frete
 * GET /              KPIs e metricas gerais
 * GET /calendario    Alertas do calendario
 * GET /funil         Funil de status
 */

import { Router, Request, Response, NextFunction } from 'express'
import { motorGanho } from '../services/motor-ganho-bid-frete-internacional.js'

const router = Router()

// GET / e GET /kpis — KPIs gerais
async function handleKpis(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_workspace, data_inicio, data_fim } = req.query as { id_workspace?: string; data_inicio?: string; data_fim?: string }

    // Cotacoes em andamento
    const cotacoesAndamento = await (req.prisma as any).bidFreteInternacionalCotacao.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'FALTA_INFORMACAO'] },
        ...(id_workspace ? { id_workspace } : {}),
      },
    })

    // Total de cotacoes passadas
    const cotacoesPassadas = await (req.prisma as any).bidFreteInternacionalCotacao.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA'] },
        ...(id_workspace ? { id_workspace } : {}),
      },
    })

    // Valores totais das cotacoes em andamento
    const valoresAndamento = await (req.prisma as any).bidFreteInternacionalProposta.aggregate({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        cotacao: {
          status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO'] },
          ...(id_workspace ? { id_workspace } : {}),
        },
      },
      _sum: { valor_total_proposta_bid_frete_internacional: true },
    })

    // Valores totais das cotacoes passadas (aprovadas)
    const valoresPassadas = await (req.prisma as any).bidFreteInternacionalProposta.aggregate({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_proposta_bid_frete_internacional: 'APROVADA',
        ...(id_workspace ? { cotacao: { id_workspace } } : {}),
      },
      _sum: { valor_total_proposta_bid_frete_internacional: true },
    })

    // Cotacoes aprovadas por timing
    const cotacoesAprovadas = await (req.prisma as any).bidFreteInternacionalCotacao.findMany({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: 'APROVADA',
        ...(id_workspace ? { id_workspace } : {}),
      },
      select: { data_aprovacao_cotacao_bid_frete_internacional: true, data_limite_resposta_cotacao_bid_frete_internacional: true },
    })

    type AprovadaRow = { data_aprovacao_cotacao_bid_frete_internacional: Date; data_limite_resposta_cotacao_bid_frete_internacional: Date | null }
    const emTempo = (cotacoesAprovadas as AprovadaRow[]).filter((c) =>
      !c.data_limite_resposta_cotacao_bid_frete_internacional || new Date(c.data_aprovacao_cotacao_bid_frete_internacional) <= new Date(c.data_limite_resposta_cotacao_bid_frete_internacional)
    ).length
    const fora = cotacoesAprovadas.length - emTempo

    // Savings
    const savings = await motorGanho.calcularMetricas(req.prisma!, {
      id_workspace,
      data_inicio: data_inicio ? new Date(data_inicio) : undefined,
      data_fim: data_fim ? new Date(data_fim) : undefined,
    })

    // Funil de status
    const funil = await (req.prisma as any).bidFreteInternacionalCotacao.groupBy({
      by: ['status_cotacao_bid_frete_internacional'],
      where: { id_produto_gravity: 'bid-frete-internacional', ...(id_workspace ? { id_workspace } : {}) },
      _count: true,
    })

    res.json({
      cotacoes_andamento: cotacoesAndamento,
      cotacoes_passadas: cotacoesPassadas,
      valor_andamento_usd: valoresAndamento._sum?.valor_total_proposta_bid_frete_internacional ?? 0,
      valor_aprovado_usd: valoresPassadas._sum?.valor_total_proposta_bid_frete_internacional ?? 0,
      aprovacao: {
        total: cotacoesAprovadas.length,
        em_tempo: emTempo,
        fora_prazo: fora,
        percentual_em_tempo: cotacoesAprovadas.length > 0 ? (emTempo / cotacoesAprovadas.length * 100).toFixed(1) : '0',
      },
      savings,
      funil: (funil as Array<{ status_cotacao_bid_frete_internacional: string; _count: number }>).map((f) => ({ status: f.status_cotacao_bid_frete_internacional, count: f._count })),
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
    const respostasRecentes = await (req.prisma as any).bidFreteInternacionalProposta.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        data_criacao_proposta_bid_frete_internacional: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    // Proximo ao vencimento (1 dia)
    const proximoVencimento = await (req.prisma as any).bidFreteInternacionalCotacao.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
        data_limite_resposta_cotacao_bid_frete_internacional: { gte: agora, lte: em24h },
      },
    })

    // Data limite vence hoje
    const venceHoje = await (req.prisma as any).bidFreteInternacionalCotacao.count({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'] },
        data_limite_resposta_cotacao_bid_frete_internacional: {
          gte: new Date(agora.setHours(0, 0, 0, 0)),
          lte: new Date(agora.setHours(23, 59, 59, 999)),
        },
      },
    })

    // Fora do prazo
    const foraPrazo = await (req.prisma as any).bidFreteInternacionalCotacao.count({
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

export { router as dashboardRouter }
