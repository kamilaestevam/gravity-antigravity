/**
 * ncm-sync/server/init.ts — Inicialização e re-agendamento do job NCM
 *
 * Onda 36 — DDD: campos físicos com sufixo _ncm_log / _ncm_item / _ncm_agendamento;
 * enums em PT (EXECUTANDO/SUCESSO/ERRO).
 *
 * Chamado pelo super-servidor tenant no bootstrap().
 * Registra o cron diário para sincronizar a tabela NCM de TODOS os tenants.
 */

import cron, { type ScheduledTask } from 'node-cron'
import { prisma } from '../../server/lib/prisma.js'
import { executarSync } from './services/ncmSyncEngine.js'

// ── Estado do job ─────────────────────────────────────────────────────────────

let tarefaAtual: ScheduledTask | null = null
let cronAtual: string = process.env.NCM_SYNC_CRON ?? '0 2 * * *'

// ── Runner ────────────────────────────────────────────────────────────────────

async function executarJobDiario() {
  console.log('[ncm-sync] Iniciando sincronização diária...')
  try {
    const tenants = await prisma.ncmItem.findMany({
      select:   { id_organizacao: true },
      distinct: ['id_organizacao'],
    })

    if (tenants.length === 0) {
      console.log('[ncm-sync] Nenhum tenant com NCMs — aguardando sync manual.')
      return
    }

    for (const t of tenants) {
      const tid = t.id_organizacao
      try {
        const result = await executarSync(prisma, tid, { origem: 'JOB' })
        console.log(
          `[ncm-sync] tenant=${tid} ✅ total=${result.total} +${result.adicionados} ~${result.alterados} -${result.removidos} (${result.duracaoMs}ms)`
        )
      } catch (err) {
        console.error(`[ncm-sync] tenant=${tid} ❌`, err instanceof Error ? err.message : err)
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
  // Recuperar jobs EXECUTANDO órfãos (processo morreu antes de finalizar)
  try {
    const resultado = await prisma.ncmLog.updateMany({
      where: { status_ncm_log: 'EXECUTANDO' },
      data: {
        status_ncm_log:         'ERRO',
        data_conclusao_ncm_log: new Date(),
        mensagem_erro_ncm_log:  'Processo interrompido — servidor reiniciado antes da conclusão.',
      },
    })
    if (resultado.count > 0) {
      console.warn(`[ncm-sync] ${resultado.count} job(s) órfão(s) recuperado(s) → ERRO`)
    }
  } catch {
    // Tabela pode não existir ainda em bootstrap inicial — ignorar
  }

  // Carregar configuração salva no banco (se existir)
  let configDb: { ativo_ncm_agendamento: boolean; cron_expressao_ncm_agendamento: string } | null = null
  try {
    configDb = await prisma.nCMAgendamento.findUnique({
      where: { id_ncm_agendamento: 'default' },
      select: {
        ativo_ncm_agendamento: true,
        cron_expressao_ncm_agendamento: true,
      },
    })
  } catch {
    configDb = null
  }

  const ativo          = configDb?.ativo_ncm_agendamento          ?? false
  const cronExpressao  = configDb?.cron_expressao_ncm_agendamento ?? (process.env.NCM_SYNC_CRON ?? '0 2 * * *')

  reagendarJob(cronExpressao, ativo)

  if (!ativo) {
    console.log('[ncm-sync] Serviço inicializado (agendamento automático desativado).')
  }
}
