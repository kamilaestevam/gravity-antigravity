// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('getUserBehaviorScores — observabilidade Onda 3', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loga motivo tabela_ausente quando Prisma falha por tabela inexistente', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { getUserBehaviorScores } = await import(
      '../../../servicos-global/produto/pedido/server/src/services/behaviorTrackingService.js'
    )

    const db = {
      userBehaviorEvent: {
        findMany: vi.fn().mockRejectedValue(new Error('relation "user_behavior_events" does not exist')),
      },
    }

    const scores = await getUserBehaviorScores(db, 'org-1', 'user-1')

    expect(scores).toEqual({})
    expect(warnSpy).toHaveBeenCalledWith(
      '[BehaviorTracking] getUserBehaviorScores indisponivel',
      expect.objectContaining({
        tenantId: 'org-1',
        userId: 'user-1',
        motivo: 'tabela_ausente',
      }),
    )
  })
})
