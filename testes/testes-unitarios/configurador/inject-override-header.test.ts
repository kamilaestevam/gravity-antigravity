// @vitest-environment jsdom
// TST-UNIT-CONF-OVERRIDE-HEADER-001 — injetarHeaderOverride (Pendência #4)
//
// Cobre os 4 ramos do utilitário:
//   1. Sem override e sem tipoUsuario → {}
//   2. Com override + tipoUsuario não-admin → {}
//   3. Com override + tipoUsuario admin → { 'x-organizacao-override': <id> }
//   4. Sem override + tipoUsuario admin → {}
//
// Não toca em rede nem em React — função pura sobre o snapshot do ShellStore.

/// <reference types="vitest/globals" />

import { injetarHeaderOverride } from '../../../servicos-global/shell/utils/inject-override-header.js'
import { useShellStore } from '../../../servicos-global/shell/store/useShellStore.js'
import type { CurrentUser, OrganizacaoOverride } from '../../../servicos-global/shell/store/types.js'

const ORG_ALVO: OrganizacaoOverride = {
  idOrganizacao:   'c1234567890abcdefghijklmn',
  nomeOrganizacao: 'Cliente XYZ',
}

const USER_BASE: CurrentUser = {
  id:                       'usr_test',
  name:                     'Tester',
  email:                    't@usegravity.com.br',
  avatarUrl:                undefined,
  idOrganizacao:            'cgravityorigem0000000000',
  nomeOrganizacao:          'Gravity',
  idWorkspacePreferido:     undefined,
  nomeWorkspacePreferido:   undefined,
}

beforeEach(() => {
  // Reset fields que mexemos — não toca em sidebarOpen, tema etc.
  useShellStore.setState({
    organizacaoOverride: null,
    currentUser:         { ...USER_BASE },
  })
})

describe('injetarHeaderOverride', () => {
  it('retorna {} quando não há override ativo (independente do tipoUsuario)', () => {
    useShellStore.setState({
      organizacaoOverride: null,
      currentUser: { ...USER_BASE, tipoUsuario: 'SUPER_ADMIN' },
    })
    expect(injetarHeaderOverride()).toEqual({})
  })

  it('retorna {} quando override existe mas tipoUsuario não é admin', () => {
    useShellStore.setState({
      organizacaoOverride: ORG_ALVO,
      currentUser: { ...USER_BASE, tipoUsuario: 'PADRAO' },
    })
    expect(injetarHeaderOverride()).toEqual({})
  })

  it('retorna {} quando override existe mas tipoUsuario está ausente', () => {
    useShellStore.setState({
      organizacaoOverride: ORG_ALVO,
      currentUser: { ...USER_BASE, tipoUsuario: undefined },
    })
    expect(injetarHeaderOverride()).toEqual({})
  })

  it('retorna header para SUPER_ADMIN com override ativo', () => {
    useShellStore.setState({
      organizacaoOverride: ORG_ALVO,
      currentUser: { ...USER_BASE, tipoUsuario: 'SUPER_ADMIN' },
    })
    expect(injetarHeaderOverride()).toEqual({
      'x-organizacao-override': ORG_ALVO.idOrganizacao,
    })
  })

  it('retorna header para ADMIN com override ativo', () => {
    useShellStore.setState({
      organizacaoOverride: ORG_ALVO,
      currentUser: { ...USER_BASE, tipoUsuario: 'ADMIN' },
    })
    expect(injetarHeaderOverride()).toEqual({
      'x-organizacao-override': ORG_ALVO.idOrganizacao,
    })
  })

  it('retorna {} para MASTER mesmo com override (admin Gravity é gatekeeping rígido)', () => {
    useShellStore.setState({
      organizacaoOverride: ORG_ALVO,
      currentUser: { ...USER_BASE, tipoUsuario: 'MASTER' },
    })
    expect(injetarHeaderOverride()).toEqual({})
  })
})
