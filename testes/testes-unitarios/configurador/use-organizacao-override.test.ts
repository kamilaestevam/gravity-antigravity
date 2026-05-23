// @vitest-environment jsdom
// TST-UNIT-CONF-USE-ORG-OVERRIDE-001 — useOrganizacaoOverride (Pendência #4)
//
// Cobre:
//   - podeAtivarOverride conforme tipoUsuario (5 valores)
//   - overrideAtivo refletindo organizacaoOverride !== null
//   - definirOverride bloqueia chamadas de não-admin (defesa cliente)
//   - definirOverride aceita para SUPER_ADMIN/ADMIN
//   - limparOverride sempre zera
//   - clearCurrentUser (logout) limpa override automaticamente

/// <reference types="vitest/globals" />

import { renderHook, act } from '@testing-library/react'
import { useOrganizacaoOverride } from '../../../servicos-global/shell/hooks/useOrganizacaoOverride.js'
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
  useShellStore.setState({
    organizacaoOverride: null,
    currentUser:         { ...USER_BASE },
  })
})

describe('useOrganizacaoOverride', () => {
  describe('podeAtivarOverride', () => {
    it.each([
      ['SUPER_ADMIN', true],
      ['ADMIN',       true],
      ['MASTER',      false],
      ['PADRAO',      false],
      ['FORNECEDOR',  false],
    ])('tipoUsuario=%s → podeAtivarOverride=%s', (tipo, esperado) => {
      useShellStore.setState({ currentUser: { ...USER_BASE, tipoUsuario: tipo } })
      const { result } = renderHook(() => useOrganizacaoOverride())
      expect(result.current.podeAtivarOverride).toBe(esperado)
    })

    it('tipoUsuario ausente → podeAtivarOverride=false (Mand. 08, sem fallback admin)', () => {
      useShellStore.setState({ currentUser: { ...USER_BASE, tipoUsuario: undefined } })
      const { result } = renderHook(() => useOrganizacaoOverride())
      expect(result.current.podeAtivarOverride).toBe(false)
    })
  })

  describe('overrideAtivo', () => {
    it('false quando organizacaoOverride é null', () => {
      const { result } = renderHook(() => useOrganizacaoOverride())
      expect(result.current.overrideAtivo).toBe(false)
      expect(result.current.override).toBeNull()
    })

    it('true quando organizacaoOverride é objeto', () => {
      useShellStore.setState({ organizacaoOverride: ORG_ALVO })
      const { result } = renderHook(() => useOrganizacaoOverride())
      expect(result.current.overrideAtivo).toBe(true)
      expect(result.current.override).toEqual(ORG_ALVO)
    })
  })

  describe('definirOverride', () => {
    it('bloqueia chamada de não-admin e não altera state', () => {
      useShellStore.setState({ currentUser: { ...USER_BASE, tipoUsuario: 'PADRAO' } })
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { result } = renderHook(() => useOrganizacaoOverride())
      act(() => result.current.definirOverride(ORG_ALVO))

      expect(useShellStore.getState().organizacaoOverride).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tentativa de ativar override'),
        expect.objectContaining({ tipoUsuario: 'PADRAO' }),
      )
      warnSpy.mockRestore()
    })

    it('aceita para SUPER_ADMIN e persiste no store', () => {
      useShellStore.setState({ currentUser: { ...USER_BASE, tipoUsuario: 'SUPER_ADMIN' } })
      const { result } = renderHook(() => useOrganizacaoOverride())
      act(() => result.current.definirOverride(ORG_ALVO))
      expect(useShellStore.getState().organizacaoOverride).toEqual(ORG_ALVO)
    })

    it('aceita para ADMIN e persiste no store', () => {
      useShellStore.setState({ currentUser: { ...USER_BASE, tipoUsuario: 'ADMIN' } })
      const { result } = renderHook(() => useOrganizacaoOverride())
      act(() => result.current.definirOverride(ORG_ALVO))
      expect(useShellStore.getState().organizacaoOverride).toEqual(ORG_ALVO)
    })
  })

  describe('limparOverride', () => {
    it('zera o override independente de quem chama', () => {
      useShellStore.setState({
        organizacaoOverride: ORG_ALVO,
        currentUser: { ...USER_BASE, tipoUsuario: 'PADRAO' },
      })
      const { result } = renderHook(() => useOrganizacaoOverride())
      act(() => result.current.limparOverride())
      expect(useShellStore.getState().organizacaoOverride).toBeNull()
    })
  })

  describe('logout zera override', () => {
    it('clearCurrentUser limpa organizacaoOverride junto', () => {
      useShellStore.setState({
        organizacaoOverride: ORG_ALVO,
        currentUser: { ...USER_BASE, tipoUsuario: 'SUPER_ADMIN' },
      })
      act(() => useShellStore.getState().clearCurrentUser())
      expect(useShellStore.getState().organizacaoOverride).toBeNull()
    })
  })
})
