/**
 * duplicacoes-bid-frete-internacional.ts — Duplicação em lote (lista)
 *
 * POST /cotacoes/duplicacoes                       Duplicar cotações (avulsas ou filhas de BID)
 * POST /bids-frete-internacional/duplicacoes       Duplicar BIDs + cotações filhas
 *
 * Padrão DDD: sub-recurso substantivado em lote (precedente duplicacoes-pedido.ts).
 * A cópia nasce em RASCUNHO, com número novo e sem propostas/disparos/aprovações.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/erros.js'
import { historicoIntegration } from '../services/integracoes-tenant.js'
import {
  gerarNumeroBidFreteInternacional,
  sincronizarResumoBid,
} from '../services/agregar-resumo-bid-frete-internacional.js'
import { relancarSeSchemaDrift } from '../lib/prisma-erro-schema.js'
import { gerarNumeroCotacao } from './cotacoes.js'

const router = Router()

const DuplicacoesBidFreteInternacionalSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
})

function resolverIdUsuario(req: Request): string {
  const userId = req.headers['x-id-usuario'] as string | undefined
  if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')
  return userId
}

function resolverTenantId(req: Request): string | undefined {
  return (req as Request & { tenantId?: string }).tenantId
}

/**
 * Monta o payload de criação da cópia a partir da cotação original.
 * Campos resetados: PK, número (regen), status (RASCUNHO), datas de ciclo de vida,
 * vencedor/ganho e prazo de resposta (a rodada anterior não vale para a cópia).
 * `id_organizacao` é removido — a Prisma Extension de isolamento injeta.
 */
function montarDadosCopiaCotacao(
  original: Record<string, unknown>,
  idUsuario: string,
  idBidDestino: string | null,
): Record<string, unknown> {
  const {
    id_cotacao_bid_frete_internacional: _id,
    id_organizacao: _org,
    id_bid_bid_frete_internacional: _bid,
    numero_cotacao_bid_frete_internacional: _numero,
    status_cotacao_bid_frete_internacional: _status,
    data_criacao_cotacao_bid_frete_internacional: _criacao,
    data_atualizacao_cotacao_bid_frete_internacional: _atualizacao,
    data_limite_resposta_cotacao_bid_frete_internacional: _limite,
    data_aprovacao_cotacao_bid_frete_internacional: _aprovacao,
    data_cancelamento_cotacao_bid_frete_internacional: _cancelamento,
    motivo_reprovacao_cotacao_bid_frete_internacional: _motivoReprovacao,
    motivo_cancelamento_cotacao_bid_frete_internacional: _motivoCancelamento,
    id_fornecedor_vencedor_cotacao_bid_frete_internacional: _vencedor,
    ganho_valor_cotacao_bid_frete_internacional: _ganhoValor,
    ganho_percentual_cotacao_bid_frete_internacional: _ganhoPct,
    bid_bid_frete_internacional: _relBid,
    disparos_cotacao: _relDisparos,
    propostas: _relPropostas,
    ...copiaveis
  } = original

  return {
    ...copiaveis,
    id_usuario: idUsuario,
    id_bid_bid_frete_internacional: idBidDestino,
    numero_cotacao_bid_frete_internacional: gerarNumeroCotacao(),
    status_cotacao_bid_frete_internacional: 'RASCUNHO',
    data_limite_resposta_cotacao_bid_frete_internacional: null,
    data_aprovacao_cotacao_bid_frete_internacional: null,
    data_cancelamento_cotacao_bid_frete_internacional: null,
    motivo_reprovacao_cotacao_bid_frete_internacional: null,
    motivo_cancelamento_cotacao_bid_frete_internacional: null,
    id_fornecedor_vencedor_cotacao_bid_frete_internacional: null,
    ganho_valor_cotacao_bid_frete_internacional: null,
    ganho_percentual_cotacao_bid_frete_internacional: null,
  }
}

// --- POST /cotacoes/duplicacoes — Duplicar cotações em lote ---
router.post('/cotacoes/duplicacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = DuplicacoesBidFreteInternacionalSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }
    const idUsuario = resolverIdUsuario(req)

    const originais = await (req.prisma as any).cotacaoBidFreteInternacional.findMany({
      where: { id_cotacao_bid_frete_internacional: { in: parsed.data.ids } },
    })
    if (originais.length === 0) {
      throw new AppError('Nenhuma cotacao encontrada para duplicar', 404, 'NOT_FOUND')
    }

    const duplicadas: unknown[] = []
    for (const original of originais) {
      // Cotação filha de BID duplica dentro do mesmo BID; avulsa continua avulsa.
      const idBidDestino = (original.id_bid_bid_frete_internacional as string | null) ?? null
      const copia = await (req.prisma as any).cotacaoBidFreteInternacional.create({
        data: montarDadosCopiaCotacao(original, idUsuario, idBidDestino),
      })
      duplicadas.push(copia)
    }

    const idsBidsAfetados: string[] = [...new Set<string>(
      (originais as Array<Record<string, unknown>>)
        .map(c => c.id_bid_bid_frete_internacional)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    )]
    for (const idBid of idsBidsAfetados) {
      await sincronizarResumoBid(req.prisma, idBid)
    }

    const tenantId = resolverTenantId(req)
    if (tenantId) {
      historicoIntegration.registrar(tenantId, {
        id_usuario: idUsuario,
        acao: 'DUPLICAR',
        entidade: 'cotacao',
        entidade_id: 'batch',
        detalhes: `Duplicação em lote: ${duplicadas.length} cotações duplicadas`,
      })
    }

    res.status(201).json({ total_duplicadas: duplicadas.length, cotacoes: duplicadas })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

// --- POST /bids-frete-internacional/duplicacoes — Duplicar BIDs + cotações filhas ---
router.post('/bids-frete-internacional/duplicacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = DuplicacoesBidFreteInternacionalSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }
    const idUsuario = resolverIdUsuario(req)

    const originais = await (req.prisma as any).bidFreteInternacional.findMany({
      where: { id_bid_bid_frete_internacional: { in: parsed.data.ids } },
      include: { cotacoes: true },
    })
    if (originais.length === 0) {
      throw new AppError('Nenhum BID encontrado para duplicar', 404, 'NOT_FOUND')
    }

    const duplicados: unknown[] = []
    for (const original of originais) {
      const novoBid = await (req.prisma as any).bidFreteInternacional.create({
        data: {
          id_produto_gravity: 'bid-frete-internacional',
          id_usuario: idUsuario,
          ...(original.id_workspace ? { id_workspace: original.id_workspace } : {}),
          numero_bid_bid_frete_internacional: gerarNumeroBidFreteInternacional(),
          referencia_interna_bid_bid_frete_internacional: original.referencia_interna_bid_bid_frete_internacional ?? null,
          status_bid_bid_frete_internacional: 'RASCUNHO',
          tipo_operacao_bid_bid_frete_internacional: original.tipo_operacao_bid_bid_frete_internacional ?? null,
          modais_bid_bid_frete_internacional: original.modais_bid_bid_frete_internacional ?? undefined,
          modalidade_bid_bid_frete_internacional: original.modalidade_bid_bid_frete_internacional ?? null,
          origens_bid_bid_frete_internacional: original.origens_bid_bid_frete_internacional ?? undefined,
          destinos_bid_bid_frete_internacional: original.destinos_bid_bid_frete_internacional ?? undefined,
        },
      })

      for (const cotacao of original.cotacoes as Record<string, unknown>[]) {
        await (req.prisma as any).cotacaoBidFreteInternacional.create({
          data: montarDadosCopiaCotacao(cotacao, idUsuario, novoBid.id_bid_bid_frete_internacional),
        })
      }

      await sincronizarResumoBid(req.prisma, novoBid.id_bid_bid_frete_internacional)

      const completo = await (req.prisma as any).bidFreteInternacional.findFirst({
        where: { id_bid_bid_frete_internacional: novoBid.id_bid_bid_frete_internacional },
        include: { cotacoes: true },
      })
      duplicados.push(completo)
    }

    const tenantId = resolverTenantId(req)
    if (tenantId) {
      historicoIntegration.registrar(tenantId, {
        id_usuario: idUsuario,
        acao: 'DUPLICAR',
        entidade: 'bid',
        entidade_id: 'batch',
        detalhes: `Duplicação em lote: ${duplicados.length} BIDs duplicados (com cotações filhas)`,
      })
    }

    res.status(201).json({ total_duplicadas: duplicados.length, bids_frete_internacional: duplicados })
  } catch (err) {
    try {
      relancarSeSchemaDrift(err)
    } catch (e) {
      next(e)
    }
  }
})

export { router as duplicacoesBidFreteInternacionalRouter }
