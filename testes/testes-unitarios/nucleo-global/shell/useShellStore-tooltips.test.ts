// @vitest-environment jsdom
/// <reference types="vitest/globals" />
import { act } from '@testing-library/react'
import { useShellStore } from '../../../../servicos-global/shell/store/useShellStore.js'

describe('useShellStore — tooltipsDisabled', () => {
  beforeEach(() => {
    document.body.classList.remove('tooltips-disabled')
    act(() => {
      useShellStore.setState({ tooltipsDisabled: false })
    })
  })

  it('toggleTooltips aplica e remove a classe tooltips-disabled no body', () => {
    act(() => {
      useShellStore.getState().toggleTooltips()
    })

    expect(useShellStore.getState().tooltipsDisabled).toBe(true)
    expect(document.body.classList.contains('tooltips-disabled')).toBe(true)

    act(() => {
      useShellStore.getState().toggleTooltips()
    })

    expect(useShellStore.getState().tooltipsDisabled).toBe(false)
    expect(document.body.classList.contains('tooltips-disabled')).toBe(false)
  })

  it('setTooltipsDisabled define o estado e a classe no body', () => {
    act(() => {
      useShellStore.getState().setTooltipsDisabled(true)
    })

    expect(useShellStore.getState().tooltipsDisabled).toBe(true)
    expect(document.body.classList.contains('tooltips-disabled')).toBe(true)

    act(() => {
      useShellStore.getState().setTooltipsDisabled(false)
    })

    expect(useShellStore.getState().tooltipsDisabled).toBe(false)
    expect(document.body.classList.contains('tooltips-disabled')).toBe(false)
  })
})
