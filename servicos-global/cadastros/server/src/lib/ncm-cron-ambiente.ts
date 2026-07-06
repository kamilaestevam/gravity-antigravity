/**
 * Guarda de ambiente — cron NCM só roda onde NCM_CRON_ENABLED=1 (Railway produção).
 */
export function cronNcmHabilitadoNoAmbiente(): boolean {
  return process.env.NCM_CRON_ENABLED === '1'
}
