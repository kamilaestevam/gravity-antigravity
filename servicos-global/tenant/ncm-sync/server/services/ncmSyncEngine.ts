/**
 * ncmSyncEngine.ts — Motor de sincronização da tabela NCM
 *
 * Responsabilidades:
 *  1. Baixar tabela completa do Portal Único via connector
 *  2. Calcular diff (adicionados / alterados / removidos) contra o cache local
 *  3. Persistir no banco (upsert em lote + marcar inativos os removidos)
 *  4. Registrar NcmSyncLog com resultado detalhado
 *
 * Chamado pelo job diário (ncmSyncJob) e pela rota de sync manual.
 */

import { PrismaClient } from '@prisma/client'
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

  // 1. Criar registro de log com status RUNNING
  const syncLog = await prisma.ncmSyncLog.create({
    data: {
      tenant_id:     tenantId,
      status:        'RUNNING',
      origem,
      disparado_por: disparadoPor ?? null,
    },
  })

  try {
    // 2. Baixar tabela do Portal Único
    const itensPortal = await baixarTabelaNcm()

    // 3. Carregar codigos existentes no banco para calcular diff
    const existentes = await prisma.ncmItem.findMany({
      where:  { tenant_id: tenantId },
      select: { codigo: true, descricao: true, ativo: true },
    })

    const mapaExistentes = new Map(existentes.map(e => [e.codigo, e]))
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
        } else if (existente.descricao !== item.descricao || !existente.ativo) {
          alterados++
        }
        // se igual e ativo — nenhum contador muda, mas fazemos upsert mesmo assim

        await prisma.ncmItem.upsert({
          where:  { tenant_id_codigo: { tenant_id: tenantId, codigo: item.codigo } },
          create: {
            tenant_id:   tenantId,
            codigo:      item.codigo,
            descricao:   item.descricao,
            ativo:       true,
            data_inicio: item.dataInicio ? new Date(item.dataInicio) : null,
            data_fim:    item.dataFim    ? new Date(item.dataFim)    : null,
            sync_id:     syncLog.id,
          },
          update: {
            descricao:   item.descricao,
            ativo:       true,
            data_inicio: item.dataInicio ? new Date(item.dataInicio) : null,
            data_fim:    item.dataFim    ? new Date(item.dataFim)    : null,
            sync_id:     syncLog.id,
          },
        })
      }))
    }

    // 5. Marcar como inativos os que existiam e não vieram do Portal
    const codigosRemovidos = existentes
      .filter(e => e.ativo && !codigosPortal.has(e.codigo))
      .map(e => e.codigo)

    if (codigosRemovidos.length > 0) {
      await prisma.ncmItem.updateMany({
        where:  { tenant_id: tenantId, codigo: { in: codigosRemovidos } },
        data:   { ativo: false, sync_id: syncLog.id },
      })
      removidos = codigosRemovidos.length
    }

    const duracaoMs = Date.now() - inicio

    // 6. Atualizar log com sucesso
    await prisma.ncmSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status:        'SUCCESS',
        concluido_em:  new Date(),
        total:         itensPortal.length,
        adicionados,
        alterados,
        removidos,
      },
    })

    return {
      syncId:      syncLog.id,
      total:       itensPortal.length,
      adicionados,
      alterados,
      removidos,
      duracaoMs,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'

    await prisma.ncmSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status:       'ERROR',
        concluido_em: new Date(),
        erro_msg:     msg,
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
      tenant_id: tenantId,
      ativo:     true,
      ...(isCodigoParcial
        ? { codigo: { startsWith: q } }
        : { descricao: { contains: q, mode: 'insensitive' } }),
    },
    select:  { codigo: true, descricao: true },
    orderBy: { codigo: 'asc' },
    take:    limite,
  })

  return itens
}

/**
 * Retorna o status da última sincronização para exibição na UI.
 */
export async function obterStatusSync(
  prisma: PrismaClient,
  tenantId: string
) {
  const [ultimo, total] = await Promise.all([
    prisma.ncmSyncLog.findFirst({
      where:   { tenant_id: tenantId, status: { in: ['SUCCESS', 'ERROR'] } },
      orderBy: { iniciado_em: 'desc' },
    }),
    prisma.ncmItem.count({
      where: { tenant_id: tenantId, ativo: true },
    }),
  ])

  return {
    ultima_sync:        ultimo?.concluido_em ?? null,
    status:             ultimo?.status       ?? null,
    total_ncms_ativos:  total,
    ultima_duracao_ms:  ultimo
      ? (ultimo.concluido_em
          ? ultimo.concluido_em.getTime() - ultimo.iniciado_em.getTime()
          : null)
      : null,
  }
}
