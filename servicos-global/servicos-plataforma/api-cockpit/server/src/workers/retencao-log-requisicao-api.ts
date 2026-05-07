/**
 * retencao-log-requisicao-api.ts — Worker de retencao de logs de requisicao
 *
 * Apaga linhas de `log_requisicao_api` com mais de 90 dias e roda VACUUM
 * para recuperar espaco em disco. Executa 1x ao dia (3h UTC, horario
 * de baixo trafego).
 *
 * Politica de retencao aprovada pelo Coordenador + Lider Tecnico
 * em 2026-05-07. Justificativa: logs de acesso a API nao sao dados
 * fiscais (LGPD) — 90 dias e o sweet spot da industria (AWS CloudTrail,
 * GitHub audit log, etc.).
 *
 * Quando escalar (>50M rows totais ou DELETE > 5min):
 *   Considerar migrar para particionamento mensal (pg_partman extension
 *   ou nativo Postgres). Drop de particao e instantaneo vs DELETE+VACUUM
 *   que e proporcional ao volume.
 */

import { PrismaClient } from '../../../../generated/index.js'

const RETENCAO_DIAS              = 90
const HORA_EXECUCAO_UTC          = 3                   // 3h UTC (baixo trafego)

const prisma = new PrismaClient()

/** Calcula o atraso em ms ate a proxima execucao (3h UTC do proximo dia, ou hoje se ainda nao passou). */
function calcularProximaExecucaoMs(): number {
  const agora = new Date()
  const proxima = new Date(agora)
  proxima.setUTCHours(HORA_EXECUCAO_UTC, 0, 0, 0)
  if (proxima.getTime() <= agora.getTime()) {
    proxima.setUTCDate(proxima.getUTCDate() + 1)
  }
  return proxima.getTime() - agora.getTime()
}

/**
 * Apaga registros antigos e roda VACUUM ANALYZE.
 * Retorna o numero de registros apagados e se VACUUM foi bem sucedido.
 */
export async function executarRetencao(): Promise<{ apagados: number; vacuumOk: boolean }> {
  const limite = new Date(Date.now() - RETENCAO_DIAS * 24 * 60 * 60 * 1000)
  const inicio = Date.now()

  try {
    const resultado = await prisma.logRequisicaoApi.deleteMany({
      where: {
        data_criacao_log_requisicao_api: { lt: limite },
      },
    })

    const duracaoDelete = Date.now() - inicio

    // VACUUM ANALYZE recupera espaco e atualiza estatisticas do planner.
    // Nao pode rodar dentro de transacao — usa $executeRawUnsafe.
    let vacuumOk = false
    try {
      await prisma.$executeRawUnsafe('VACUUM ANALYZE log_requisicao_api')
      vacuumOk = true
    } catch (err) {
      console.warn('[retencao-log-requisicao-api] VACUUM falhou (nao critico):', err instanceof Error ? err.message : err)
    }

    console.log('[retencao-log-requisicao-api] retencao executada', {
      apagados:        resultado.count,
      duracaoDeleteMs: duracaoDelete,
      vacuumOk,
      limite_iso:      limite.toISOString(),
    })

    return { apagados: resultado.count, vacuumOk }
  } catch (err) {
    console.error('[retencao-log-requisicao-api] retencao falhou:', err instanceof Error ? err.message : err)
    return { apagados: 0, vacuumOk: false }
  }
}

let timerHandle: ReturnType<typeof setTimeout> | null = null

/**
 * Inicia o agendamento periodico. Idempotente: chamadas extras nao criam timers duplicados.
 *
 * Estrategia: setTimeout para a proxima execucao em hora fixa (3h UTC), depois reagenda
 * apos cada execucao. Mais simples que setInterval e respeita horario fixo.
 */
export function iniciarWorkerRetencao(): void {
  if (timerHandle) return

  const agendarProxima = () => {
    const atrasoMs = calcularProximaExecucaoMs()
    timerHandle = setTimeout(async () => {
      await executarRetencao()
      agendarProxima()
    }, atrasoMs)
    if (timerHandle && typeof timerHandle === 'object' && 'unref' in timerHandle) {
      timerHandle.unref()
    }
  }

  console.log(`[retencao-log-requisicao-api] worker iniciado — proxima execucao em ${Math.round(calcularProximaExecucaoMs() / 60_000)}min (3h UTC)`)
  agendarProxima()
}

/** Para o agendamento (uso em testes ou shutdown). */
export function pararWorkerRetencao(): void {
  if (timerHandle) {
    clearTimeout(timerHandle)
    timerHandle = null
  }
}
