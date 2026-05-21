/**
 * comparativo.ts — Rotas de Ranking e Aprovacao de Propostas (Pilar 2 — Marketplace)
 * Comparativo de respostas, tags automaticas, aprovacao/reprovacao
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration, notificacoesIntegration } from '../services/tenantIntegrations.js'

export const comparativoRouter = Router()

// --- Schemas Zod ---

const aprovarSchema = z.object({
  id_resposta_cotacao_bid_cambio: z.string(),
  observacao: z.string().optional(),
})

const reprovarSchema = z.object({
  motivo: z.string().min(1, 'Motivo e obrigatorio'),
})

// --- Helpers ---

type RespostaCambio = {
  id_resposta_cotacao_bid_cambio: string
  taxa_oferecida_resposta_cotacao_bid_cambio: number
  spread_resposta_cotacao_bid_cambio: number
  corretora?: { rating?: number }
  [key: string]: unknown
}

function calcularTags(respostas: RespostaCambio[]) {
  if (respostas.length === 0) return []

  const sorted = [...respostas]

  const melhorTaxa = sorted.sort((a, b) => a.taxa_oferecida_resposta_cotacao_bid_cambio - b.taxa_oferecida_resposta_cotacao_bid_cambio)[0]
  const melhorSpread = sorted.sort((a, b) => a.spread_resposta_cotacao_bid_cambio - b.spread_resposta_cotacao_bid_cambio)[0]
  const melhorAvaliacao = sorted.sort((a, b) => (b.corretora?.rating ?? 0) - (a.corretora?.rating ?? 0))[0]

  return respostas.map((r) => {
    const tags: string[] = []
    if (r.id_resposta_cotacao_bid_cambio === melhorTaxa.id_resposta_cotacao_bid_cambio) tags.push('MELHOR_TAXA')
    if (r.id_resposta_cotacao_bid_cambio === melhorSpread.id_resposta_cotacao_bid_cambio) tags.push('MELHOR_SPREAD')
    if (melhorAvaliacao && r.id_resposta_cotacao_bid_cambio === melhorAvaliacao.id_resposta_cotacao_bid_cambio) tags.push('MELHOR_AVALIACAO')
    return { ...r, tags }
  })
}

function calcularEconomia(cotacao: { valor_cotacao_bid_cambio?: number }, respostaAprovada: { taxa_oferecida_resposta_cotacao_bid_cambio?: number; spread_resposta_cotacao_bid_cambio?: number }): number {
  // Economia = diferenca entre pior taxa e taxa aprovada * valor
  // Retorna economia em BRL
  const valorBase = cotacao.valor_cotacao_bid_cambio ?? 0
  const taxaAprovada = respostaAprovada.taxa_oferecida_resposta_cotacao_bid_cambio ?? 0
  // Estimativa simples: economia = valor * (spread medio mercado - spread aprovado)
  return valorBase * (respostaAprovada.spread_resposta_cotacao_bid_cambio ?? 0) * 0.01
}

// --- GET /api/v1/bid-cambio/comparativo/:cotacaoId ---
comparativoRouter.get('/:cotacaoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!

    const cotacao = await (prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
      select: { id_cotacao_bid_cambio: true, moeda_cotacao_bid_cambio: true, valor_cotacao_bid_cambio: true, tipo_operacao_cotacao_bid_cambio: true, status_cotacao_bid_cambio: true },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const respostas = await (prisma as any).bidCambioRespostaCotacao.findMany({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
      include: {
        corretora: {
          select: { id_corretora_bid_cambio: true, nome_fantasia_corretora_bid_cambio: true, razao_social_corretora_bid_cambio: true, tipo_corretora_bid_cambio: true },
        },
      },
      orderBy: { taxa_oferecida_resposta_cotacao_bid_cambio: 'asc' },
    })

    const ranking = calcularTags(respostas)

    res.json({
      cotacao,
      ranking,
      total_respostas: respostas.length,
      melhor_taxa: respostas.length > 0 ? respostas[0].taxa_oferecida_resposta_cotacao_bid_cambio : null,
      pior_taxa: respostas.length > 0 ? respostas[respostas.length - 1].taxa_oferecida_resposta_cotacao_bid_cambio : null,
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/comparativo/:cotacaoId/aprovar ---
comparativoRouter.post('/:cotacaoId/aprovar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = aprovarSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const cotacao = await (prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status_cotacao_bid_cambio === 'APROVADA') {
      throw new AppError('Cotacao ja foi aprovada', 400, 'ALREADY_APPROVED')
    }

    const respostaAprovada = await (prisma as any).bidCambioRespostaCotacao.findFirst({
      where: { id_resposta_cotacao_bid_cambio: input.id_resposta_cotacao_bid_cambio, id_cotacao_bid_cambio: req.params.cotacaoId },
      include: { corretora: true },
    })
    if (!respostaAprovada) {
      throw new AppError('Resposta nao encontrada nesta cotacao', 404, 'RESPONSE_NOT_FOUND')
    }

    // Marcar resposta aprovada
    await (prisma as any).bidCambioRespostaCotacao.update({
      where: { id_resposta_cotacao_bid_cambio: input.id_resposta_cotacao_bid_cambio },
      data: { status_resposta_cotacao_bid_cambio: 'APROVADA' },
    })

    // Marcar todas as outras como REPROVADA
    await (prisma as any).bidCambioRespostaCotacao.updateMany({
      where: {
        id_cotacao_bid_cambio: req.params.cotacaoId,
        id_resposta_cotacao_bid_cambio: { not: input.id_resposta_cotacao_bid_cambio },
        status_resposta_cotacao_bid_cambio: { not: 'REPROVADA' },
      },
      data: { status_resposta_cotacao_bid_cambio: 'REPROVADA' },
    })

    // Calcular economia
    const todasRespostas = await (prisma as any).bidCambioRespostaCotacao.findMany({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
      orderBy: { taxa_oferecida_resposta_cotacao_bid_cambio: 'asc' },
    })

    const piorTaxa = todasRespostas.length > 1
      ? todasRespostas[todasRespostas.length - 1].taxa_oferecida_resposta_cotacao_bid_cambio
      : respostaAprovada.taxa_oferecida_resposta_cotacao_bid_cambio

    const economiaBrl = (piorTaxa - respostaAprovada.taxa_oferecida_resposta_cotacao_bid_cambio) * cotacao.valor_cotacao_bid_cambio

    // Atualizar cotacao
    await (prisma as any).bidCambioCotacao.update({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
      data: {
        status_cotacao_bid_cambio: 'APROVADA',
        id_corretora_aprovada_bid_cambio: respostaAprovada.id_corretora_bid_cambio,
        taxa_aprovada_cotacao_bid_cambio: respostaAprovada.taxa_oferecida_resposta_cotacao_bid_cambio,
        economia_brl_cotacao_bid_cambio: economiaBrl > 0 ? economiaBrl : 0,
        aprovado_por_cotacao_bid_cambio: userId,
        aprovado_em_cotacao_bid_cambio: new Date(),
        observacao_aprovacao_cotacao_bid_cambio: input.observacao ?? null,
      },
    })

    // Audit trail + notificacao
    historicoIntegration.registrar(tenantId, userId, {
      acao: 'APROVAR_COTACAO',
      entidade: 'BidCambioCotacao',
      entidade_id: req.params.cotacaoId,
      detalhes: {
        corretora: respostaAprovada.corretora?.nome_fantasia_corretora_bid_cambio,
        taxa: respostaAprovada.taxa_oferecida_resposta_cotacao_bid_cambio,
        economia_brl: economiaBrl,
      },
    })

    notificacoesIntegration.cotacaoAprovada(tenantId, userId, {
      corretora_nome: respostaAprovada.corretora?.nome_fantasia_corretora_bid_cambio ?? 'Corretora',
      economia_brl: economiaBrl.toFixed(2),
    })

    res.json({
      id_cotacao_bid_cambio: req.params.cotacaoId,
      resposta_aprovada: input.id_resposta_cotacao_bid_cambio,
      corretora: respostaAprovada.corretora?.nome_fantasia_corretora_bid_cambio,
      taxa_aprovada: respostaAprovada.taxa_oferecida_resposta_cotacao_bid_cambio,
      economia_brl: economiaBrl > 0 ? economiaBrl : 0,
      total_reprovadas: todasRespostas.length - 1,
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/comparativo/:cotacaoId/reprovar ---
comparativoRouter.post('/:cotacaoId/reprovar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = reprovarSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const cotacao = await (prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status_cotacao_bid_cambio === 'APROVADA') {
      throw new AppError('Cotacao ja aprovada nao pode ser reprovada', 400, 'ALREADY_APPROVED')
    }

    // Reprovar todas as respostas pendentes
    await (prisma as any).bidCambioRespostaCotacao.updateMany({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId, status_resposta_cotacao_bid_cambio: { not: 'REPROVADA' } },
      data: { status_resposta_cotacao_bid_cambio: 'REPROVADA' },
    })

    // Atualizar cotacao
    await (prisma as any).bidCambioCotacao.update({
      where: { id_cotacao_bid_cambio: req.params.cotacaoId },
      data: {
        status_cotacao_bid_cambio: 'REPROVADA',
        observacao_aprovacao_cotacao_bid_cambio: input.motivo,
        aprovado_por_cotacao_bid_cambio: userId,
        aprovado_em_cotacao_bid_cambio: new Date(),
      },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'REPROVAR_COTACAO',
      entidade: 'BidCambioCotacao',
      entidade_id: req.params.cotacaoId,
      detalhes: { motivo: input.motivo },
    })

    res.json({
      id_cotacao_bid_cambio: req.params.cotacaoId,
      status_cotacao_bid_cambio: 'REPROVADA',
      motivo: input.motivo,
    })
  } catch (err) { next(err) }
})
