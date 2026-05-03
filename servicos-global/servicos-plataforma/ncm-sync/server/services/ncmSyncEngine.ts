/**
 * ncmSyncEngine.ts — Motor de sincronização da tabela NCM
 *
 * Onda 36 — DDD: campos físicos com sufixo _ncm_item / _ncm_log; enums em PT.
 *
 * Responsabilidades:
 *  1. Baixar tabela completa do Portal Único via connector
 *  2. Calcular diff (adicionados / alterados / removidos) contra o cache local
 *  3. Persistir no banco (upsert em lote + marcar inativos os removidos)
 *  4. Registrar NcmLog com resultado detalhado
 */

import type { PrismaClient } from '../../../generated/index.js'
import { baixarTabelaNcm, type NcmItemRaw } from '../connectors/portalUnicoNcm.js'
import { AppError } from '../../../middleware/appError.js'

const BATCH_SIZE = 500  // upserts em lote para não sobrecarregar o banco

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface SyncResult {
  syncId:      string
  total:       number
  adicionados: number
  alterados:   number
  removidos:   number
  duracaoMs:   number
}

// ── Engine ────────────────────────────────────────────────────────────────────

export async function executarSync(
  prisma: PrismaClient,
  tenantId: string,
  opcoes: { origem?: 'JOB' | 'MANUAL'; disparadoPor?: string } = {}
): Promise<SyncResult> {
  const { origem = 'JOB', disparadoPor } = opcoes
  const inicio = Date.now()

  // 1. Criar registro de log com status EXECUTANDO
  const syncLog = await prisma.ncmLog.create({
    data: {
      id_organizacao: tenantId,
      status_ncm_log:         'EXECUTANDO',
      origem_ncm_log:         origem,
      disparado_por_ncm_log:  disparadoPor ?? null,
    },
  })

  try {
    // 2. Baixar tabela do Portal Único
    const itensPortal = await baixarTabelaNcm()

    // 3. Carregar codigos existentes no banco para calcular diff
    const existentes = await prisma.ncmItem.findMany({
      where:  { id_organizacao: tenantId },
      select: {
        codigo_ncm_item: true,
        descricao_ncm_item: true,
        ativo_ncm_item: true,
      },
    })

    const mapaExistentes = new Map(existentes.map(e => [e.codigo_ncm_item, e]))
    const codigosPortal  = new Set(itensPortal.map(i => i.codigo))

    let adicionados = 0
    let alterados   = 0
    let removidos   = 0

    // 4. Upsert em lotes
    for (let i = 0; i < itensPortal.length; i += BATCH_SIZE) {
      const lote = itensPortal.slice(i, i + BATCH_SIZE)

      await Promise.all(lote.map(async (item: NcmItemRaw) => {
        const existente = mapaExistentes.get(item.codigo)

        if (!existente) {
          adicionados++
        } else if (existente.descricao_ncm_item !== item.descricao || !existente.ativo_ncm_item) {
          alterados++
        }
        // se igual e ativo — nenhum contador muda, mas fazemos upsert mesmo assim

        await prisma.ncmItem.upsert({
          where: {
            id_organizacao_codigo_ncm_item: {
              id_organizacao: tenantId,
              codigo_ncm_item: item.codigo,
            },
          },
          create: {
            id_organizacao:   tenantId,
            codigo_ncm_item:           item.codigo,
            descricao_ncm_item:        item.descricao,
            ativo_ncm_item:            true,
            data_inicio_ncm_item:      item.dataInicio ? new Date(item.dataInicio) : null,
            data_fim_ncm_item:         item.dataFim    ? new Date(item.dataFim)    : null,
            id_ncm_log: syncLog.id_ncm_log,
          },
          update: {
            descricao_ncm_item:        item.descricao,
            ativo_ncm_item:            true,
            data_inicio_ncm_item:      item.dataInicio ? new Date(item.dataInicio) : null,
            data_fim_ncm_item:         item.dataFim    ? new Date(item.dataFim)    : null,
            id_ncm_log: syncLog.id_ncm_log,
          },
        })
      }))
    }

    // 5. Marcar como inativos os que existiam e não vieram do Portal
    const codigosRemovidos = existentes
      .filter(e => e.ativo_ncm_item && !codigosPortal.has(e.codigo_ncm_item))
      .map(e => e.codigo_ncm_item)

    if (codigosRemovidos.length > 0) {
      await prisma.ncmItem.updateMany({
        where: {
          id_organizacao: tenantId,
          codigo_ncm_item: { in: codigosRemovidos },
        },
        data: {
          ativo_ncm_item:            false,
          id_ncm_log: syncLog.id_ncm_log,
        },
      })
      removidos = codigosRemovidos.length
    }

    const duracaoMs = Date.now() - inicio

    // 6. Atualizar log com sucesso
    await prisma.ncmLog.update({
      where: { id_ncm_log: syncLog.id_ncm_log },
      data: {
        status_ncm_log:         'SUCESSO',
        data_conclusao_ncm_log: new Date(),
        total_ncm_log:          itensPortal.length,
        adicionados_ncm_log:    adicionados,
        alterados_ncm_log:      alterados,
        removidos_ncm_log:      removidos,
      },
    })

    return {
      syncId:      syncLog.id_ncm_log,
      total:       itensPortal.length,
      adicionados,
      alterados,
      removidos,
      duracaoMs,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'

    await prisma.ncmLog.update({
      where: { id_ncm_log: syncLog.id_ncm_log },
      data: {
        status_ncm_log:         'ERRO',
        data_conclusao_ncm_log: new Date(),
        mensagem_erro_ncm_log:  msg,
      },
    })

    throw err instanceof AppError
      ? err
      : new AppError(`Falha na sincronização NCM: ${msg}`, 500, 'NCM_SYNC_FAILED')
  }
}

/**
 * Busca NCMs no cache local por código ou descrição (case-insensitive).
 * Usado pelo modal de busca no frontend.
 */
export async function buscarNcm(
  prisma: PrismaClient,
  tenantId: string,
  query: string,
  limite = 20
): Promise<Array<{ codigo: string; descricao: string }>> {
  const q = query.trim()
  if (q.length === 0) return []

  const isCodigoParcial = /^\d+$/.test(q)

  const itens = await prisma.ncmItem.findMany({
    where: {
      id_organizacao: tenantId,
      ativo_ncm_item:          true,
      ...(isCodigoParcial
        ? { codigo_ncm_item:    { startsWith: q } }
        : { descricao_ncm_item: { contains: q, mode: 'insensitive' } }),
    },
    select:  { codigo_ncm_item: true, descricao_ncm_item: true },
    orderBy: { codigo_ncm_item: 'asc' },
    take:    limite,
  })

  return itens.map(i => ({
    codigo: i.codigo_ncm_item,
    descricao: i.descricao_ncm_item,
  }))
}

/**
 * Retorna o status da última sincronização para exibição na UI.
 */
export async function obterStatusSync(
  prisma: PrismaClient,
  tenantId: string
) {
  const [ultimo, total] = await Promise.all([
    prisma.ncmLog.findFirst({
      where: {
        id_organizacao: tenantId,
        status_ncm_log: { in: ['SUCESSO', 'ERRO'] },
      },
      orderBy: { data_inicio_ncm_log: 'desc' },
    }),
    prisma.ncmItem.count({
      where: {
        id_organizacao: tenantId,
        ativo_ncm_item: true,
      },
    }),
  ])

  return {
    ultima_sync:        ultimo?.data_conclusao_ncm_log ?? null,
    status:             ultimo?.status_ncm_log ?? null,
    total_ncms_ativos:  total,
    ultima_duracao_ms:  ultimo
      ? (ultimo.data_conclusao_ncm_log
          ? ultimo.data_conclusao_ncm_log.getTime() - ultimo.data_inicio_ncm_log.getTime()
          : null)
      : null,
  }
}
