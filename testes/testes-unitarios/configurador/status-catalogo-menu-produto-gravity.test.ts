import { describe, expect, it } from 'vitest'
import { statusCatalogoPermiteAbrirMenu } from '../../../servicos-global/configurador/server/lib/status-catalogo-menu-produto-gravity'

describe('statusCatalogoPermiteAbrirMenu', () => {
  it('ATIVO permite abrir no menu', () => {
    expect(statusCatalogoPermiteAbrirMenu('ATIVO')).toBe(true)
  })

  it('EM_BREVE bloqueia menu mesmo com assinatura legada', () => {
    expect(statusCatalogoPermiteAbrirMenu('EM_BREVE')).toBe(false)
  })

  it('SUSPENSO, LEGADO e INATIVO bloqueiam', () => {
    expect(statusCatalogoPermiteAbrirMenu('SUSPENSO')).toBe(false)
    expect(statusCatalogoPermiteAbrirMenu('LEGADO')).toBe(false)
    expect(statusCatalogoPermiteAbrirMenu('INATIVO')).toBe(false)
  })
})
