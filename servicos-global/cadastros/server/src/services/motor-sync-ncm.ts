/**
 * motor-sync-ncm.ts — Motor de sincronização do catálogo NCM
 *
 * Reside no Cadastros porque NCM é catálogo global da Receita Federal —
 * fonte da verdade UNIQUE, sem id_organizacao (alíquotas são iguais para
 * todas as organizações).
 *
 * Responsabilidades:
 *  1. Baixar tabela completa do Portal Único via connector
 *  2. Calcular diff (adicionados / alterados / removidos) contra o cache local
 *  3. Persistir no banco (upsert em lote + marcar inativos os removidos)
 *  4. Registrar NcmSyncLog com resultado detalhado
 */

import type { PrismaClient } from '../../../generated/index.js'
import { baixarTabelaNcm, buscarAliquotasEmLote, type NcmItemRaw } from '../connectors/portalUnicoNcm.js'
import { AppError } from '../lib/app-error.js'
import { despacharNotificacoesNcmSync } from './notificador-sync-ncm.js'

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
  opcoes: { origem?: 'JOB' | 'MANUAL'; disparadoPor?: string } = {}
): Promise<SyncResult> {
  const { origem = 'JOB', disparadoPor } = opcoes
  const inicio = Date.now()

  // 1. Criar registro de log com status EXECUTANDO
  const syncLog = await prisma.ncmSyncLog.create({
    data: {
      status_ncm_sync_log:         'EXECUTANDO',
      origem_ncm_sync_log:         origem,
      disparado_por_ncm_sync_log:  disparadoPor ?? null,
    },
  })

  try {
    // 2. Baixar tabela do Portal Único
    const itensPortal = await baixarTabelaNcm()

    // 3. Carregar codigos existentes no banco para calcular diff
    const existentes = await prisma.ncmSync.findMany({
      select: {
        codigo_ncm_sync:    true,
        descricao_ncm_sync: true,
        ativo_ncm_sync:     true,
      },
    })

    const mapaExistentes = new Map(existentes.map(e => [e.codigo_ncm_sync, e]))
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
        } else if (existente.descricao_ncm_sync !== item.descricao || !existente.ativo_ncm_sync) {
          alterados++
        }
        // se igual e ativo — nenhum contador muda, mas fazemos upsert mesmo assim

        await prisma.ncmSync.upsert({
          where: { codigo_ncm_sync: item.codigo },
          create: {
            codigo_ncm_sync:      item.codigo,
            descricao_ncm_sync:   item.descricao,
            ativo_ncm_sync:       true,
            data_inicio_ncm_sync: item.dataInicio ? new Date(item.dataInicio) : null,
            data_fim_ncm_sync:    item.dataFim    ? new Date(item.dataFim)    : null,
            id_ncm_sync_log:      syncLog.id_ncm_sync_log,
          },
          update: {
            descricao_ncm_sync:   item.descricao,
            ativo_ncm_sync:       true,
            data_inicio_ncm_sync: item.dataInicio ? new Date(item.dataInicio) : null,
            data_fim_ncm_sync:    item.dataFim    ? new Date(item.dataFim)    : null,
            id_ncm_sync_log:      syncLog.id_ncm_sync_log,
          },
        })
      }))
    }

    // 5. Marcar como inativos os que existiam e não vieram do Portal
    const codigosRemovidos = existentes
      .filter(e => e.ativo_ncm_sync && !codigosPortal.has(e.codigo_ncm_sync))
      .map(e => e.codigo_ncm_sync)

    if (codigosRemovidos.length > 0) {
      await prisma.ncmSync.updateMany({
        where: {
          codigo_ncm_sync: { in: codigosRemovidos },
        },
        data: {
          ativo_ncm_sync:    false,
          id_ncm_sync_log:   syncLog.id_ncm_sync_log,
        },
      })
      removidos = codigosRemovidos.length
    }

    const duracaoMs = Date.now() - inicio

    // 6. Atualizar log com sucesso
    await prisma.ncmSyncLog.update({
      where: { id_ncm_sync_log: syncLog.id_ncm_sync_log },
      data: {
        status_ncm_sync_log:         'SUCESSO',
        data_conclusao_ncm_sync_log: new Date(),
        total_ncm_sync_log:          itensPortal.length,
        adicionados_ncm_sync_log:    adicionados,
        alterados_ncm_sync_log:      alterados,
        removidos_ncm_sync_log:      removidos,
      },
    })

    const resultado: SyncResult = {
      syncId:      syncLog.id_ncm_sync_log,
      total:       itensPortal.length,
      adicionados,
      alterados,
      removidos,
      duracaoMs,
    }

    // Notificar destinatários cadastrados (fire-and-forget — nunca bloqueia)
    void despacharNotificacoesNcmSync(prisma, 'SUCESSO', resultado)

    // 7. Fase 2 — popular alíquotas via TTCE (fire-and-forget, não bloqueia sync)
    void popularAliquotasAsync(prisma).catch(() => {})

    return resultado
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'

    await prisma.ncmSyncLog.update({
      where: { id_ncm_sync_log: syncLog.id_ncm_sync_log },
      data: {
        status_ncm_sync_log:         'ERRO',
        data_conclusao_ncm_sync_log: new Date(),
        mensagem_erro_ncm_sync_log:  msg,
      },
    })

    // Notificar destinatários cadastrados sobre o erro (fire-and-forget)
    void despacharNotificacoesNcmSync(prisma, 'ERRO', null, msg)

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
  query: string,
  limite = 20
): Promise<Array<{ codigo: string; descricao: string }>> {
  const q = query.trim()
  if (q.length === 0) return []

  const isCodigoParcial = /^\d+$/.test(q)

  const itens = await prisma.ncmSync.findMany({
    where: {
      ativo_ncm_sync: true,
      ...(isCodigoParcial
        ? { codigo_ncm_sync:    { startsWith: q } }
        : { descricao_ncm_sync: { contains: q, mode: 'insensitive' } }),
    },
    select:  { codigo_ncm_sync: true, descricao_ncm_sync: true },
    orderBy: { codigo_ncm_sync: 'asc' },
    take:    limite,
  })

  return itens.map(i => ({
    codigo: i.codigo_ncm_sync,
    descricao: i.descricao_ncm_sync,
  }))
}

/**
 * Fase 2 — Popular alíquotas via TTCE para NCMs que não possuem.
 * Executa em background (fire-and-forget) após sync de descritivos.
 * Só roda se houver certificado digital ativo configurado.
 */
async function popularAliquotasAsync(prisma: PrismaClient): Promise<void> {
  const certAtivo = await prisma.certificadoDigitalSiscomex.findFirst({
    where: { ativo_certificado_digital_siscomex: true },
    select: { id_certificado_digital_siscomex: true },
  })

  if (!certAtivo) return

  const semAliquota = await prisma.ncmSync.findMany({
    where: {
      ativo_ncm_sync: true,
      ii_ncm_sync: null,
      ipi_ncm_sync: null,
    },
    select: { codigo_ncm_sync: true },
    take: 200,
  })

  if (semAliquota.length === 0) return

  const codigos = semAliquota.map(n => n.codigo_ncm_sync)
  const aliquotas = await buscarAliquotasEmLote(codigos)

  for (const [codigo, vals] of aliquotas) {
    await prisma.ncmSync.update({
      where: { codigo_ncm_sync: codigo },
      data: {
        ii_ncm_sync:     vals.ii,
        ipi_ncm_sync:    vals.ipi,
        pis_ncm_sync:    vals.pis,
        cofins_ncm_sync: vals.cofins,
      },
    }).catch(() => {})
  }
}

/**
 * Retorna o status da última sincronização para exibição na UI.
 */
export async function obterStatusSync(prisma: PrismaClient) {
  const [ultimo, total] = await Promise.all([
    prisma.ncmSyncLog.findFirst({
      where: { status_ncm_sync_log: { in: ['SUCESSO', 'ERRO'] } },
      orderBy: { data_inicio_ncm_sync_log: 'desc' },
    }),
    prisma.ncmSync.count({ where: { ativo_ncm_sync: true } }),
  ])

  return {
    ultima_sync:        ultimo?.data_conclusao_ncm_sync_log ?? null,
    status:             ultimo?.status_ncm_sync_log ?? null,
    total_ncms_ativos:  total,
    ultima_duracao_ms:  ultimo?.data_conclusao_ncm_sync_log
      ? ultimo.data_conclusao_ncm_sync_log.getTime() - ultimo.data_inicio_ncm_sync_log.getTime()
      : null,
  }
}
