/**
 * ncm-sync/server/init.ts — Inicialização assíncrona do job de sincronização
 *
 * Chamado pelo super-servidor tenant no bootstrap().
 * Registra o cron diário (meia-noite) para sincronizar a tabela NCM
 * de TODOS os tenants cadastrados.
 *
 * O job é disparado uma vez por tenant para manter o isolamento de dados.
 */

import cron from 'node-cron'
import { prisma } from '../../../tenant/server/lib/prisma.js'
import { executarSync } from './services/ncmSyncEngine.js'

const NCM_SYNC_CRON = process.env.NCM_SYNC_CRON ?? '0 0 * * *'  // meia-noite diário

let jobRegistrado = false

export async function initNcmSync(): Promise<void> {
  if (jobRegistrado) return
  jobRegistrado = true

  cron.schedule(NCM_SYNC_CRON, async () => {
    console.log('[ncm-sync] Iniciando sincronização diária...')

    try {
      // Buscar todos os tenant_ids distintos com NCMs cadastrados
      // (ou todos os tenants ativos via configurador — por ora usamos os existentes)
      const tenants = await prisma.ncmItem.findMany({
        select:  { tenant_id: true },
        distinct: ['tenant_id'],
      })

      // Se ainda não há nenhum tenant com NCMs, fazer sync para o tenant padrão
      // (o primeiro sync é sempre disparado manualmente via Admin)
      if (tenants.length === 0) {
        console.log('[ncm-sync] Nenhum tenant com NCMs — aguardando sync manual.')
        return
      }

      for (const { tenant_id } of tenants) {
        try {
          const result = await executarSync(prisma, tenant_id, { origem: 'JOB' })
          console.log(
            `[ncm-sync] tenant=${tenant_id} ✅ total=${result.total} +${result.adicionados} ~${result.alterados} -${result.removidos} (${result.duracaoMs}ms)`
          )
        } catch (err) {
          console.error(`[ncm-sync] tenant=${tenant_id} ❌`, err instanceof Error ? err.message : err)
        }
      }
    } catch (err) {
      console.error('[ncm-sync] Erro ao listar tenants para sync:', err)
    }
  }, {
    timezone: 'America/Sao_Paulo',
  })

  console.log(`[ncm-sync] Job diário registrado: ${NCM_SYNC_CRON} (America/Sao_Paulo)`)
}
