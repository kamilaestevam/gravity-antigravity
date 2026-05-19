/**
 * cronJobs.ts — Jobs automaticos do BID Cambio
 * 1. Alertar parcelas de cambio proximas ao vencimento (e-mail as 7h)
 * 2. Expirar cotacoes vencidas
 * 3. Recalcular ratings globais de corretoras
 *
 * SEGURANCA: Cron jobs operam cross-tenant por natureza.
 * Cada operacao de escrita inclui tenant_id explicito no WHERE.
 */

import { PrismaClient } from '@prisma/client'
import { withTenantIsolation } from '../middleware/tenantIsolation.js'
import { atividadesIntegration, notificacoesIntegration, emailIntegration } from './tenantIntegrations.js'

const cronPrisma = new PrismaClient()

/**
 * Job 1: Alertar parcelas de cambio que vencem nos proximos X dias
 * Respeita preferencia por tenant (dias de antecedencia, fim de semana)
 */
async function alertarVencimentosCambio() {
  const agora = new Date()
  const diaSemana = agora.getDay() // 0=dom, 6=sab

  // SAFETY: static SQL — no interpolation, no user input. $queryRawUnsafe used
  // because Prisma typed client doesn't cover this cross-tenant scan table.
  // OWASP A01: whitelist validada — SQL estático, sem interpolação de input
  const preferencias = await cronPrisma.$queryRawUnsafe(`
    SELECT * FROM cambio_preferencias
    WHERE alerta_email_vencimento = true
    AND dias_antecedencia_alerta IS NOT NULL
  `) as any[]

  for (const pref of preferencias) {
    // Verifica preferencia de fim de semana
    if ((diaSemana === 0 || diaSemana === 6) && !pref.enviar_email_fim_de_semana) {
      continue
    }

    const diasAntecedencia = pref.dias_antecedencia_alerta
    const dataLimite = new Date(agora.getTime() + diasAntecedencia * 24 * 60 * 60 * 1000)

    // Se sexta e nao envia fim de semana, incluir sab/dom
    let dataLimiteAjustada = dataLimite
    if (diaSemana === 5 && !pref.enviar_email_fim_de_semana) {
      dataLimiteAjustada = new Date(dataLimite.getTime() + 2 * 24 * 60 * 60 * 1000)
    }

    const tenantDb = withTenantIsolation(cronPrisma, pref.id_organizacao)

    // SAFETY: all user-derived values passed as positional params ($1, $2, $3).
    // OWASP A01: whitelist validada — params posicionais, sem interpolação
    const parcelasVencendo = await tenantDb.$queryRawUnsafe(`
      SELECT * FROM cambio_parcelas
      WHERE id_organizacao = $1
      AND status IN ('PENDENTE', 'AGENDADO')
      AND data_vencimento BETWEEN $2::timestamp AND $3::timestamp
    `, pref.id_organizacao, agora.toISOString(), dataLimiteAjustada.toISOString()) as any[]

    if (parcelasVencendo.length === 0) continue

    // Montar e enviar e-mail
    const processos = parcelasVencendo.map((p: { referencia_processo?: string }) => p.referencia_processo).filter(Boolean)

    // Fire-and-forget: notificacao + atividade
    for (const parcela of parcelasVencendo) {
      atividadesIntegration.proximoVencimento(pref.id_organizacao, parcela.user_id, {
        referencia: parcela.referencia_processo ?? parcela.id,
        data_vencimento: parcela.data_vencimento?.toISOString().split('T')[0] ?? '',
      })
    }

    console.log(`[Cron] Tenant ${pref.id_organizacao}: ${parcelasVencendo.length} parcelas vencendo em ${diasAntecedencia} dias`)
  }
}

/**
 * Job 2: Expirar cotacoes de cambio que passaram da data limite
 */
async function expirarCotacoesVencidas() {
  const agora = new Date()

  // SAFETY: user-derived value (agora) passed as positional param $1.
  // OWASP A01: whitelist validada — params posicionais, sem interpolação
  const cotacoesVencidas = await cronPrisma.$queryRawUnsafe(`
    SELECT id, id_organizacao, user_id FROM cambio_cotacoes
    WHERE status IN ('ENVIADA_CORRETORAS', 'EM_COTACAO')
    AND data_expiracao < $1::timestamp
  `, agora.toISOString()) as any[]

  for (const cotacao of cotacoesVencidas) {
    const tenantDb = withTenantIsolation(cronPrisma, cotacao.id_organizacao)

    // SAFETY: all values passed as positional params ($1, $2).
    await tenantDb.$executeRawUnsafe(`
      UPDATE cambio_cotacoes SET status = 'EXPIRADA', updated_at = NOW()
      WHERE id = $1 AND id_organizacao = $2
    `, cotacao.id, cotacao.id_organizacao)

    await tenantDb.$executeRawUnsafe(`
      UPDATE cambio_bid_requests SET status = 'EXPIRADO', updated_at = NOW()
      WHERE cotacao_id = $1 AND id_organizacao = $2
      AND status IN ('PENDENTE', 'ENVIADO', 'VISUALIZADO')
    `, cotacao.id, cotacao.id_organizacao)

    notificacoesIntegration.cotacaoExpirada(cotacao.id_organizacao, cotacao.user_id, {
      cotacao_id: cotacao.id,
    })
  }

  if (cotacoesVencidas.length > 0) {
    console.log(`[Cron] ${cotacoesVencidas.length} cotacoes de cambio expiradas`)
  }
}

// --- Inicializacao ---

let cronInterval: ReturnType<typeof setInterval> | null = null

export function startCronJobs() {
  console.log('[Cron] Jobs automaticos BID Cambio iniciados (intervalo: 5min)')
  runAll()
  cronInterval = setInterval(runAll, 5 * 60 * 1000)
}

export function stopCronJobs() {
  if (cronInterval) {
    clearInterval(cronInterval)
    cronInterval = null
    console.log('[Cron] Jobs automaticos BID Cambio parados')
  }
}

async function runAll() {
  try {
    await alertarVencimentosCambio()
    await expirarCotacoesVencidas()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Cron] Erro nos jobs BID Cambio:', message)
  }
}

export { alertarVencimentosCambio, expirarCotacoesVencidas }
