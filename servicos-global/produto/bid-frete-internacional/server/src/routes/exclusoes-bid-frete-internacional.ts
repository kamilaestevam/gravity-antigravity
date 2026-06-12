/**
 * exclusoes-bid-frete-internacional.ts — Exclusão em lote (lista) com preview
 *
 * POST /cotacoes/exclusoes/preview                     O que pode ser excluído e o que está bloqueado
 * POST /cotacoes/exclusoes/confirmar                   Exclui as cotações permitidas
 * POST /bids-frete-internacional/exclusoes/preview     Preview de BIDs (todas as filhas precisam ser excluíveis)
 * POST /bids-frete-internacional/exclusoes/confirmar   Exclui BIDs permitidos + cotações filhas
 *
 * Regra aprovada pelo dono (2026-06-11): exclusão definitiva apenas para cotações em
 * RASCUNHO ou que nunca foram enviadas a fornecedor e não têm propostas recebidas.
 * Demais casos devem ser cancelados (não excluídos) — preview lista os bloqueados.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/erros.js'
import { historicoIntegration } from '../services/integracoes-tenant.js'
import { sincronizarResumoBid } from '../services/agregar-resumo-bid-frete-internacional.js'
import { relancarSeSchemaDrift } from '../lib/prisma-erro-schema.js'

const router = Router()

const ExclusoesBidFreteInternacionalSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
})

export type MotivoBloqueioExclusao = 'COM_PROPOSTAS' | 'ENVIADA_FORNECEDOR'

interface CotacaoParaExclusao {
  id_cotacao_bid_frete_internacional: string
  numero_cotacao_bid_frete_internacional: string
  status_cotacao_bid_frete_internacional: string
  id_bid_bid_frete_internacional: string | null
  _count: { propostas: number; disparos_cotacao: number }
}

/**
 * Cotação excluível: RASCUNHO sempre; fora de RASCUNHO somente se nunca foi
 * enviada (sem disparos) e não recebeu propostas.
 * Exportada para teste unitário.
 */
export function motivoBloqueioExclusaoCotacao(cotacao: {
  status_cotacao_bid_frete_internacional: string
  total_propostas: number
  total_disparos: number
}): MotivoBloqueioExclusao | null {
  if (cotacao.total_propostas > 0) return 'COM_PROPOSTAS'
  if (cotacao.status_cotacao_bid_frete_internacional === 'RASCUNHO') return null
  if (cotacao.total_disparos > 0) return 'ENVIADA_FORNECEDOR'
  return null
}

function resolverIdUsuario(req: Request): string {
  const userId = req.headers['x-id-usuario'] as string | undefined
  if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')
  return userId
}

function resolverTenantId(req: Request): string | undefined {
  return (req as Request & { tenantId?: string }).tenantId
}

function parseIds(req: Request): string[] {
  const parsed = ExclusoesBidFreteInternacionalSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
  }
  return parsed.data.ids
}

async function buscarCotacoesParaExclusao(req: Request, ids: string[]): Promise<CotacaoParaExclusao[]> {
  return (req.prisma as any).cotacaoBidFreteInternacional.findMany({
    where: { id_cotacao_bid_frete_internacional: { in: ids } },
    select: {
      id_cotacao_bid_frete_internacional: true,
      numero_cotacao_bid_frete_internacional: true,
      status_cotacao_bid_frete_internacional: true,
      id_bid_bid_frete_internacional: true,
      _count: { select: { propostas: true, disparos_cotacao: true } },
    },
  })
}

function classificarCotacoes(cotacoes: CotacaoParaExclusao[]): {
  permitidas: CotacaoParaExclusao[]
  bloqueadas: Array<CotacaoParaExclusao & { motivo_bloqueio: MotivoBloqueioExclusao }>
} {
  const permitidas: CotacaoParaExclusao[] = []
  const bloqueadas: Array<CotacaoParaExclusao & { motivo_bloqueio: MotivoBloqueioExclusao }> = []
  for (const cotacao of cotacoes) {
    const motivo = motivoBloqueioExclusaoCotacao({
      status_cotacao_bid_frete_internacional: cotacao.status_cotacao_bid_frete_internacional,
      total_propostas: cotacao._count.propostas,
      total_disparos: cotacao._count.disparos_cotacao,
    })
    if (motivo) bloqueadas.push({ ...cotacao, motivo_bloqueio: motivo })
    else permitidas.push(cotacao)
  }
  return { permitidas, bloqueadas }
}

function serializarCotacaoPreview(c: CotacaoParaExclusao, motivo?: MotivoBloqueioExclusao) {
  return {
    id_cotacao_bid_frete_internacional: c.id_cotacao_bid_frete_internacional,
    numero_cotacao_bid_frete_internacional: c.numero_cotacao_bid_frete_internacional,
    status_cotacao_bid_frete_internacional: c.status_cotacao_bid_frete_internacional,
    total_propostas: c._count.propostas,
    ...(motivo ? { motivo_bloqueio: motivo } : {}),
  }
}

// --- POST /cotacoes/exclusoes/preview ---
router.post('/cotacoes/exclusoes/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ids = parseIds(req)
    const cotacoes = await buscarCotacoesParaExclusao(req, ids)
    const { permitidas, bloqueadas } = classificarCotacoes(cotacoes)

    res.json({
      permitidas: permitidas.map(c => serializarCotacaoPreview(c)),
      bloqueadas: bloqueadas.map(c => serializarCotacaoPreview(c, c.motivo_bloqueio)),
    })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

// --- POST /cotacoes/exclusoes/confirmar ---
router.post('/cotacoes/exclusoes/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ids = parseIds(req)
    const idUsuario = resolverIdUsuario(req)

    // Revalida no confirmar — o estado pode ter mudado desde o preview.
    const cotacoes = await buscarCotacoesParaExclusao(req, ids)
    const { permitidas, bloqueadas } = classificarCotacoes(cotacoes)

    const idsPermitidos = permitidas.map(c => c.id_cotacao_bid_frete_internacional)
    if (idsPermitidos.length > 0) {
      // Disparos caem por cascade (onDelete: Cascade); propostas inexistem nas permitidas.
      await (req.prisma as any).cotacaoBidFreteInternacional.deleteMany({
        where: { id_cotacao_bid_frete_internacional: { in: idsPermitidos } },
      })
    }

    const idsBidsAfetados = [...new Set(
      permitidas
        .map(c => c.id_bid_bid_frete_internacional)
        .filter((id): id is string => id != null),
    )]
    for (const idBid of idsBidsAfetados) {
      await sincronizarResumoBid(req.prisma, idBid)
    }

    const tenantId = resolverTenantId(req)
    if (tenantId && idsPermitidos.length > 0) {
      historicoIntegration.registrar(tenantId, {
        id_usuario: idUsuario,
        acao: 'EXCLUIR',
        entidade: 'cotacao',
        entidade_id: 'batch',
        detalhes: `Exclusão em lote: ${idsPermitidos.length} cotações excluídas, ${bloqueadas.length} bloqueadas`,
      })
    }

    res.json({
      total_excluidas: idsPermitidos.length,
      ids_excluidos: idsPermitidos,
      bloqueadas: bloqueadas.map(c => serializarCotacaoPreview(c, c.motivo_bloqueio)),
    })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

interface BidParaExclusao {
  id_bid_bid_frete_internacional: string
  numero_bid_bid_frete_internacional: string
  cotacoes: CotacaoParaExclusao[]
}

async function buscarBidsParaExclusao(req: Request, ids: string[]): Promise<BidParaExclusao[]> {
  return (req.prisma as any).bidFreteInternacional.findMany({
    where: { id_bid_bid_frete_internacional: { in: ids } },
    select: {
      id_bid_bid_frete_internacional: true,
      numero_bid_bid_frete_internacional: true,
      cotacoes: {
        select: {
          id_cotacao_bid_frete_internacional: true,
          numero_cotacao_bid_frete_internacional: true,
          status_cotacao_bid_frete_internacional: true,
          id_bid_bid_frete_internacional: true,
          _count: { select: { propostas: true, disparos_cotacao: true } },
        },
      },
    },
  })
}

function classificarBids(bids: BidParaExclusao[]): {
  permitidos: BidParaExclusao[]
  bloqueados: Array<{ bid: BidParaExclusao; cotacoes_bloqueadas: Array<CotacaoParaExclusao & { motivo_bloqueio: MotivoBloqueioExclusao }> }>
} {
  const permitidos: BidParaExclusao[] = []
  const bloqueados: Array<{ bid: BidParaExclusao; cotacoes_bloqueadas: Array<CotacaoParaExclusao & { motivo_bloqueio: MotivoBloqueioExclusao }> }> = []
  for (const bid of bids) {
    const { bloqueadas } = classificarCotacoes(bid.cotacoes)
    if (bloqueadas.length > 0) bloqueados.push({ bid, cotacoes_bloqueadas: bloqueadas })
    else permitidos.push(bid)
  }
  return { permitidos, bloqueados }
}

// --- POST /bids-frete-internacional/exclusoes/preview ---
router.post('/bids-frete-internacional/exclusoes/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ids = parseIds(req)
    const bids = await buscarBidsParaExclusao(req, ids)
    const { permitidos, bloqueados } = classificarBids(bids)

    res.json({
      permitidos: permitidos.map(b => ({
        id_bid_bid_frete_internacional: b.id_bid_bid_frete_internacional,
        numero_bid_bid_frete_internacional: b.numero_bid_bid_frete_internacional,
        total_cotacoes: b.cotacoes.length,
      })),
      bloqueados: bloqueados.map(({ bid, cotacoes_bloqueadas }) => ({
        id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional,
        numero_bid_bid_frete_internacional: bid.numero_bid_bid_frete_internacional,
        total_cotacoes: bid.cotacoes.length,
        cotacoes_bloqueadas: cotacoes_bloqueadas.map(c => serializarCotacaoPreview(c, c.motivo_bloqueio)),
      })),
    })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

// --- POST /bids-frete-internacional/exclusoes/confirmar ---
router.post('/bids-frete-internacional/exclusoes/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ids = parseIds(req)
    const idUsuario = resolverIdUsuario(req)

    const bids = await buscarBidsParaExclusao(req, ids)
    const { permitidos, bloqueados } = classificarBids(bids)

    const idsExcluidos: string[] = []
    for (const bid of permitidos) {
      // Cotação→BID é onDelete: SetNull — excluir as filhas explicitamente
      // antes do BID para não deixar cotações órfãs.
      await (req.prisma as any).$transaction([
        (req.prisma as any).cotacaoBidFreteInternacional.deleteMany({
          where: { id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional },
        }),
        (req.prisma as any).bidFreteInternacional.delete({
          where: { id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional },
        }),
      ])
      idsExcluidos.push(bid.id_bid_bid_frete_internacional)
    }

    const tenantId = resolverTenantId(req)
    if (tenantId && idsExcluidos.length > 0) {
      historicoIntegration.registrar(tenantId, {
        id_usuario: idUsuario,
        acao: 'EXCLUIR',
        entidade: 'bid',
        entidade_id: 'batch',
        detalhes: `Exclusão em lote: ${idsExcluidos.length} BIDs excluídos (com cotações filhas), ${bloqueados.length} bloqueados`,
      })
    }

    res.json({
      total_excluidos: idsExcluidos.length,
      ids_excluidos: idsExcluidos,
      bloqueados: bloqueados.map(({ bid, cotacoes_bloqueadas }) => ({
        id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional,
        numero_bid_bid_frete_internacional: bid.numero_bid_bid_frete_internacional,
        total_cotacoes: bid.cotacoes.length,
        cotacoes_bloqueadas: cotacoes_bloqueadas.map(c => serializarCotacaoPreview(c, c.motivo_bloqueio)),
      })),
    })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

export { router as exclusoesBidFreteInternacionalRouter }
