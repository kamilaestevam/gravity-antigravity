/**
 * ncm-sync/server/init.ts — Inicialização e re-agendamento do job NCM
 *
 * Chamado pelo super-servidor tenant no bootstrap().
 * Registra o cron diário para sincronizar a tabela NCM de TODOS os tenants.
 *
 * Exporta `reagendarJob(cron, ativo)` para re-agendamento dinâmico em runtime
 * quando o admin altera a configuração via PUT /api/admin/ncm-integracao/schedule.
 */

import cron, { type ScheduledTask } from 'node-cron'
import { prisma } from '../../../tenant/server/lib/prisma.js'
import { executarSync } from './services/ncmSyncEngine.js'

// ── Estado do job ─────────────────────────────────────────────────────────────

let tarefaAtual: ScheduledTask | null = null
let cronAtual: string = process.env.NCM_SYNC_CRON ?? '0 2 * * *'

// ── Runner ────────────────────────────────────────────────────────────────────

async function executarJobDiario() {
  console.log('[ncm-sync] Iniciando sincronização diária...')
  try {
    const tenants = await prisma.ncmItem.findMany({
      select:   { tenant_id: true },
      distinct: ['tenant_id'],
    })

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
}

// ── Re-agendamento dinâmico ───────────────────────────────────────────────────

/**
 * Cancela o job atual e registra um novo com a expressão cron fornecida.
 * Chamado pelo endpoint PUT /admin/schedule quando o admin altera a configuração.
 * Se `ativo = false`, apenas cancela o job sem criar um novo.
 */
export function reagendarJob(novoCron: string, ativo: boolean): void {
  // Cancelar job existente
  if (tarefaAtual) {
    tarefaAtual.stop()
    tarefaAtual = null
    console.log(`[ncm-sync] Job anterior cancelado (era: ${cronAtual})`)
  }

  cronAtual = novoCron

  if (!ativo) {
    console.log('[ncm-sync] Job desativado pelo admin.')
    return
  }

  if (!cron.validate(novoCron)) {
    console.error(`[ncm-sync] Expressão cron inválida: "${novoCron}" — job não registrado.`)
    return
  }

  tarefaAtual = cron.schedule(novoCron, executarJobDiario, {
    timezone: 'America/Sao_Paulo',
  })

  console.log(`[ncm-sync] Job re-agendado: ${novoCron} (America/Sao_Paulo)`)
}

// ── Inicialização ─────────────────────────────────────────────────────────────

export async function initNcmSync(): Promise<void> {
  // Carregar configuração salva no banco (se existir)
  let configDb: { ativo: boolean; cron_expressao: string } | null = null
  try {
    configDb = await prisma.ncmScheduleConfig.findUnique({ where: { id: 'default' } })
  } catch {
    // Tabela pode não existir ainda em bootstrap inicial — ignorar
    configDb = null
  }

  const ativo          = configDb?.ativo          ?? false
  const cronExpressao  = configDb?.cron_expressao ?? (process.env.NCM_SYNC_CRON ?? '0 2 * * *')

  reagendarJob(cronExpressao, ativo)

  if (!ativo) {
    console.log('[ncm-sync] Serviço inicializado (agendamento automático desativado).')
  }
}
