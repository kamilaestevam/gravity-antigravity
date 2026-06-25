// TST-CRO-SMTRD-NOVA-LEITURA-PASSO-DOIS-000153
// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import {
  clausulaWorkspaceLeituraSmartRead,
  leituraVinculadaAoWorkspaceSmartRead,
  resolverIdWorkspaceLeituraSmartRead,
} from '../../../../../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.js'

const WS_ORG_A = 'ws-org-a'
const WS_ORG_B = 'ws-org-b'
const LEITURA_ID = 'leitura-passo-dois-cro-000153'

describe('TST-CRO-SMTRD-NOVA-LEITURA-PASSO-DOIS-000153', () => {
  describe('ETAPA 1 — Isolamento workspace no polling passo 2', () => {
    it('CRO-01: clausulaWorkspace filtra pelo workspace ativo', () => {
      const clausula = clausulaWorkspaceLeituraSmartRead(WS_ORG_A)
      expect(clausula.OR).toEqual(
        expect.arrayContaining([
          { id_workspace: WS_ORG_A },
          { id_workspace: null },
        ]),
      )
    })

    it('CRO-02: org B não vê leitura vinculada só ao workspace A durante análise', async () => {
      const prisma = {
        snapshotLeituraSmartRead: {
          findFirst: vi.fn().mockImplementation(({ where }: { where: { OR?: Array<{ id_workspace: string | null }> } }) => {
            const ids = where.OR?.map((o) => o.id_workspace) ?? []
            if (ids.includes(WS_ORG_A)) {
              return Promise.resolve({ id_snapshot_leitura_smart_read: 'snap-a' })
            }
            return Promise.resolve(null)
          }),
        },
        progressoLeituraSmartRead: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      }

      const vinculadaA = await leituraVinculadaAoWorkspaceSmartRead(prisma as never, LEITURA_ID, WS_ORG_A)
      const vinculadaB = await leituraVinculadaAoWorkspaceSmartRead(prisma as never, LEITURA_ID, WS_ORG_B)

      expect(vinculadaA).toBe(true)
      expect(vinculadaB).toBe(false)
    })

    it('CRO-03: resolverIdWorkspace usa header x-id-workspace', () => {
      const req = { headers: { 'x-id-workspace': WS_ORG_B } } as never
      expect(resolverIdWorkspaceLeituraSmartRead(req, 'org-fallback')).toBe(WS_ORG_B)
    })

    it('CRO-04: sem header workspace faz fallback para id_organizacao', () => {
      const req = { headers: {} } as never
      expect(resolverIdWorkspaceLeituraSmartRead(req, 'org-fallback')).toBe('org-fallback')
    })
  })
})
