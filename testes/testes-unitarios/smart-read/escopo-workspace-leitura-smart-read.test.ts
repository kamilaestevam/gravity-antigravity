import { describe, expect, it } from 'vitest'
import {
  clausulaWorkspaceLeituraSmartRead,
  resolverIdWorkspaceLeituraSmartRead,
} from '../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.ts'

describe('escopo-workspace-leitura-smart-read', () => {
  it('resolverIdWorkspaceLeituraSmartRead usa header ou fallback organizacao', () => {
    const reqComHeader = {
      headers: { 'x-id-workspace': ' ws-filial-1 ' },
    } as Parameters<typeof resolverIdWorkspaceLeituraSmartRead>[0]
    expect(resolverIdWorkspaceLeituraSmartRead(reqComHeader, 'org-abc')).toBe('ws-filial-1')

    const reqSemHeader = { headers: {} } as Parameters<typeof resolverIdWorkspaceLeituraSmartRead>[0]
    expect(resolverIdWorkspaceLeituraSmartRead(reqSemHeader, 'org-abc')).toBe('org-abc')
  })

  it('clausulaWorkspaceLeituraSmartRead inclui workspace ativo e legado null', () => {
    expect(clausulaWorkspaceLeituraSmartRead('ws-1')).toEqual({
      OR: [{ id_workspace: 'ws-1' }, { id_workspace: null }],
    })
  })
})
