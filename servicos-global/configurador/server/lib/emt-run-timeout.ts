/** Timeout máximo de run EMT/E2E (Admin + runner filho + agendamento). Override: GRAVITY_TEST_RUN_TIMEOUT_MS */
const DEFAULT_RUN_TESTES_TIMEOUT_MS = 90 * 60 * 1000

export function resolverTimeoutRunTestesMs(): number {
  const raw = process.env.GRAVITY_TEST_RUN_TIMEOUT_MS?.trim()
  if (!raw) return DEFAULT_RUN_TESTES_TIMEOUT_MS
  const ms = Number(raw)
  if (!Number.isFinite(ms) || ms < 60_000) return DEFAULT_RUN_TESTES_TIMEOUT_MS
  return ms
}

export const RUN_TESTES_TIMEOUT_MS = resolverTimeoutRunTestesMs()
