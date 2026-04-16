/**
 * Cron daemon do serviço de notificações.
 *
 * STATUS: DESLIGADO (Onda 3 do Detetive de Tela, item #10).
 *
 * As funções abaixo (scanReminders, scanNextSteps, scanRecordings) foram criadas
 * como stubs com `console.log` e nunca foram implementadas. O daemon disparava
 * a cada 5 minutos sem fazer nada e, em deploy escalado horizontalmente (Railway),
 * dispararia N vezes em paralelo sem lock — risco de duplicação quando o corpo
 * for implementado.
 *
 * Plano para reativar:
 *   1. Implementar cada scan lendo de prisma.activity (ou model equivalente) com
 *      filtros do tipo `where: { reminder_at: { lte: now }, reminder_sent: false }`.
 *   2. Substituir node-cron por pg-boss schedule, que tem lock distribuído nativo
 *      (já temos pg-boss inicializado em initPgBoss). Isso elimina o problema de
 *      múltiplas instâncias rodarem o mesmo job.
 *   3. Cada scan deve enfileirar um job no pg-boss e marcar `*_sent = true` na
 *      mesma transação para evitar reentrância.
 *   4. Reativar chamando `initCron()` em init.ts.
 */

export function initCron(): void {
  // eslint-disable-next-line no-console
  console.log('[Notificacoes] Cron daemon DESLIGADO até implementação real (ver cron.ts)')
}
