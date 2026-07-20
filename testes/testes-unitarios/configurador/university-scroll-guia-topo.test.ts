/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  consumirProximaAulaNoTopoGuia,
  marcarProximaAulaNoTopoGuia,
  scrollGuiaTopo,
  soltarFocoGuia,
  travarScrollGuiaTopo,
} from '../../../servicos-global/configurador/src/pages/university/guia-academy-link'

describe('scrollGuiaTopo — Academy Gravity University', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('zera scrollTop do .uni-player-aula__content', () => {
    const content = document.createElement('div')
    content.className = 'uni-player-aula__content'
    Object.defineProperty(content, 'scrollTop', { value: 1200, writable: true, configurable: true })
    const scrollTo = vi.fn()
    content.scrollTo = scrollTo as unknown as typeof content.scrollTo
    document.body.appendChild(content)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    scrollGuiaTopo('auto')

    expect(content.scrollTop).toBe(0)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('também zera window quando o content do player não existe', () => {
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    scrollGuiaTopo('auto')

    expect(spy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('soltarFocoGuia remove foco do botão Concluída', () => {
    const btn = document.createElement('button')
    document.body.appendChild(btn)
    btn.focus()
    expect(document.activeElement).toBe(btn)

    soltarFocoGuia()

    expect(document.activeElement).not.toBe(btn)
  })

  it('travarScrollGuiaTopo reverte scroll se algo empurrar o content', () => {
    vi.useFakeTimers()
    const content = document.createElement('div')
    content.className = 'uni-player-aula__content'
    Object.defineProperty(content, 'scrollTop', { value: 0, writable: true, configurable: true })
    content.scrollTo = vi.fn() as unknown as typeof content.scrollTo
    document.body.appendChild(content)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const liberar = travarScrollGuiaTopo(100)
    content.scrollTop = 900
    content.dispatchEvent(new Event('scroll'))
    expect(content.scrollTop).toBe(0)

    liberar()
    vi.useRealTimers()
  })

  it('marcar/consumirProximaAulaNoTopoGuia usa sessionStorage', () => {
    sessionStorage.clear()
    marcarProximaAulaNoTopoGuia()
    expect(consumirProximaAulaNoTopoGuia()).toBe(true)
    expect(consumirProximaAulaNoTopoGuia()).toBe(false)
  })
})
