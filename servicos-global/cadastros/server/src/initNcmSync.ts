/**
 * initNcmSync.ts — Inicialização e re-agendamento do job NCM no Cadastros
 *
 * Catálogo global — sem id_organizacao. Roda 1× para todo o sistema.
 *
 * Chamado pelo bootstrap do servidor cadastros.
 * Registra o cron diário para sincronizar a tabela NCM com o Portal Único.
 */

import cron, { type ScheduledTask } from 'node-cron'
import { getPrisma } from './lib/prisma.js'
import { executarSync } from './services/ncmSyncEngine.js'

// ── Estado do job ─────────────────────────────────────────────────────────────

let tarefaAtual: ScheduledTask | null = null
let cronAtual: string = process.env.NCM_SYNC_CRON ?? '0 2 * * *'

// ── Runner ────────────────────────────────────────────────────────────────────

async function executarJobDiario() {
  console.log('[ncm-sync] Iniciando sincronização diária...')
  try {
    const prisma = getPrisma()
    const result = await executarSync(prisma, { origem: 'JOB' })
    console.log(
      `[ncm-sync] ✅ total=${result.total} +${result.adicionados} ~${result.alterados} -${result.removidos} (${result.duracaoMs}ms)`
    )
  } catch (err) {
    console.error('[ncm-sync] ❌ Erro no job diário:', err instanceof Error ? err.message : err)
  }
}

// ── Re-agendamento dinâmico ───────────────────────────────────────────────────

/**
 * Cancela o job atual e registra um novo com a expressão cron fornecida.
 * Chamado pelo endpoint PUT /admin/ncm-sync/agendamento quando o admin altera a configuração.
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
  const prisma = getPrisma()

  // Recuperar jobs EXECUTANDO órfãos (processo morreu antes de finalizar)
  try {
    const resultado = await prisma.ncmSyncLog.updateMany({
      where: { status_ncm_sync_log: 'EXECUTANDO' },
      data: {
        status_ncm_sync_log:         'ERRO',
        data_conclusao_ncm_sync_log: new Date(),
        mensagem_erro_ncm_sync_log:  'Processo interrompido — servidor reiniciado antes da conclusão.',
      },
    })
    if (resultado.count > 0) {
      console.warn(`[ncm-sync] ${resultado.count} job(s) órfão(s) recuperado(s) → ERRO`)
    }
  } catch {
    // Tabela pode não existir ainda em bootstrap inicial — ignorar
  }

  // Carregar configuração salva no banco (se existir)
  let configDb: { ativo_ncm_sync_agendamento: boolean; cron_expressao_ncm_sync_agendamento: string } | null = null
  try {
    configDb = await prisma.ncmSyncAgendamento.findUnique({
      where: { id_ncm_sync_agendamento: 'default' },
      select: {
        ativo_ncm_sync_agendamento: true,
        cron_expressao_ncm_sync_agendamento: true,
      },
    })
  } catch {
    configDb = null
  }

  const ativo          = configDb?.ativo_ncm_sync_agendamento          ?? false
  const cronExpressao  = configDb?.cron_expressao_ncm_sync_agendamento ?? (process.env.NCM_SYNC_CRON ?? '0 2 * * *')

  reagendarJob(cronExpressao, ativo)

  if (!ativo) {
    console.log('[ncm-sync] Serviço inicializado (agendamento automático desativado).')
  }
}
