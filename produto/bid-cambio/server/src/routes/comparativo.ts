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
  bid_response_id: z.string(),
  observacao: z.string().optional(),
})

const reprovarSchema = z.object({
  motivo: z.string().min(1, 'Motivo e obrigatorio'),
})

// --- Helpers ---

function calcularTags(respostas: any[]) {
  if (respostas.length === 0) return []

  const sorted = [...respostas]

  const melhorTaxa = sorted.sort((a, b) => a.taxa_oferecida - b.taxa_oferecida)[0]
  const melhorSpread = sorted.sort((a, b) => a.spread - b.spread)[0]
  const melhorAvaliacao = sorted.sort((a, b) => (b.corretora?.rating ?? 0) - (a.corretora?.rating ?? 0))[0]

  return respostas.map((r: any) => {
    const tags: string[] = []
    if (r.id === melhorTaxa.id) tags.push('MELHOR_TAXA')
    if (r.id === melhorSpread.id) tags.push('MELHOR_SPREAD')
    if (melhorAvaliacao && r.id === melhorAvaliacao.id) tags.push('MELHOR_AVALIACAO')
    return { ...r, tags }
  })
}

function calcularEconomia(cotacao: any, respostaAprovada: any): number {
  // Economia = diferenca entre pior taxa e taxa aprovada * valor
  // Retorna economia em BRL
  const valorBase = cotacao.valor ?? 0
  const taxaAprovada = respostaAprovada.taxa_oferecida ?? 0
  // Estimativa simples: economia = valor * (spread medio mercado - spread aprovado)
  return valorBase * (respostaAprovada.spread ?? 0) * 0.01
}

// --- GET /api/v1/bid-cambio/comparativo/:cotacaoId ---
comparativoRouter.get('/:cotacaoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!

    const cotacao = await (prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.cotacaoId },
      select: { id: true, moeda: true, valor: true, tipo_operacao: true, status: true },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    const respostas = await (prisma as any).bidResponseCambio.findMany({
      where: { cotacao_id: req.params.cotacaoId },
      include: {
        corretora: {
          select: { id: true, nome_fantasia: true, razao_social: true, tipo: true },
        },
      },
      orderBy: { taxa_oferecida: 'asc' },
    })

    const ranking = calcularTags(respostas)

    res.json({
      cotacao,
      ranking,
      total_respostas: respostas.length,
      melhor_taxa: respostas.length > 0 ? respostas[0].taxa_oferecida : null,
      pior_taxa: respostas.length > 0 ? respostas[respostas.length - 1].taxa_oferecida : null,
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/comparativo/:cotacaoId/aprovar ---
comparativoRouter.post('/:cotacaoId/aprovar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = aprovarSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-user-id'] as string

    const cotacao = await (prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.cotacaoId },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status === 'APROVADA') {
      throw new AppError('Cotacao ja foi aprovada', 400, 'ALREADY_APPROVED')
    }

    const respostaAprovada = await (prisma as any).bidResponseCambio.findFirst({
      where: { id: input.bid_response_id, cotacao_id: req.params.cotacaoId },
      include: { corretora: true },
    })
    if (!respostaAprovada) {
      throw new AppError('Resposta nao encontrada nesta cotacao', 404, 'RESPONSE_NOT_FOUND')
    }

    // Marcar resposta aprovada
    await (prisma as any).bidResponseCambio.update({
      where: { id: input.bid_response_id },
      data: { status: 'APROVADA' },
    })

    // Marcar todas as outras como REPROVADA
    await (prisma as any).bidResponseCambio.updateMany({
      where: {
        cotacao_id: req.params.cotacaoId,
        id: { not: input.bid_response_id },
        status: { not: 'REPROVADA' },
      },
      data: { status: 'REPROVADA' },
    })

    // Calcular economia
    const todasRespostas = await (prisma as any).bidResponseCambio.findMany({
      where: { cotacao_id: req.params.cotacaoId },
      orderBy: { taxa_oferecida: 'asc' },
    })

    const piorTaxa = todasRespostas.length > 1
      ? todasRespostas[todasRespostas.length - 1].taxa_oferecida
      : respostaAprovada.taxa_oferecida

    const economiaBrl = (piorTaxa - respostaAprovada.taxa_oferecida) * cotacao.valor

    // Atualizar cotacao
    await (prisma as any).cotacaoCambio.update({
      where: { id: req.params.cotacaoId },
      data: {
        status: 'APROVADA',
        corretora_aprovada_id: respostaAprovada.corretora_id,
        taxa_aprovada: respostaAprovada.taxa_oferecida,
        economia_brl: economiaBrl > 0 ? economiaBrl : 0,
        aprovado_por: userId,
        aprovado_em: new Date(),
        observacao_aprovacao: input.observacao ?? null,
      },
    })

    // Audit trail + notificacao
    historicoIntegration.registrar(tenantId, userId, {
      acao: 'APROVAR_COTACAO',
      entidade: 'CotacaoCambio',
      entidade_id: req.params.cotacaoId,
      detalhes: {
        corretora: respostaAprovada.corretora?.nome_fantasia,
        taxa: respostaAprovada.taxa_oferecida,
        economia_brl: economiaBrl,
      },
    })

    notificacoesIntegration.cotacaoAprovada(tenantId, userId, {
      corretora_nome: respostaAprovada.corretora?.nome_fantasia ?? 'Corretora',
      economia_brl: economiaBrl.toFixed(2),
    })

    res.json({
      cotacao_id: req.params.cotacaoId,
      resposta_aprovada: input.bid_response_id,
      corretora: respostaAprovada.corretora?.nome_fantasia,
      taxa_aprovada: respostaAprovada.taxa_oferecida,
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
    const userId = req.headers['x-user-id'] as string

    const cotacao = await (prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.cotacaoId },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status === 'APROVADA') {
      throw new AppError('Cotacao ja aprovada nao pode ser reprovada', 400, 'ALREADY_APPROVED')
    }

    // Reprovar todas as respostas pendentes
    await (prisma as any).bidResponseCambio.updateMany({
      where: { cotacao_id: req.params.cotacaoId, status: { not: 'REPROVADA' } },
      data: { status: 'REPROVADA' },
    })

    // Atualizar cotacao
    await (prisma as any).cotacaoCambio.update({
      where: { id: req.params.cotacaoId },
      data: {
        status: 'REPROVADA',
        observacao_aprovacao: input.motivo,
        aprovado_por: userId,
        aprovado_em: new Date(),
      },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'REPROVAR_COTACAO',
      entidade: 'CotacaoCambio',
      entidade_id: req.params.cotacaoId,
      detalhes: { motivo: input.motivo },
    })

    res.json({
      cotacao_id: req.params.cotacaoId,
      status: 'REPROVADA',
      motivo: input.motivo,
    })
  } catch (err) { next(err) }
})
