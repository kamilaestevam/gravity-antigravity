// TST-UNI-STORE-000004 — faixas de carrossel e ids de seção
import { describe, expect, it } from 'vitest'
import {
  LINHAS_STORE,
  idSecaoStoreLinha,
} from '../../../servicos-global/configurador/src/components/store-cards-rows'

describe('TST-UNI-STORE-000004 — LINHAS_STORE e scroll', () => {
  it('ordem fixa das faixas: assinar → ativo → em_breve → todos', () => {
    expect(LINHAS_STORE.map((l) => l.key)).toEqual(['assinar', 'ativo', 'em_breve', 'todos'])
  })

  it('idSecaoStoreLinha gera âncora para IntersectionObserver', () => {
    expect(idSecaoStoreLinha('assinar')).toBe('store-linha-assinar')
    expect(idSecaoStoreLinha('todos')).toBe('store-linha-todos')
  })

  it('cada faixa tem tituloKey i18n', () => {
    for (const linha of LINHAS_STORE) {
      expect(linha.tituloKey).toMatch(/^store\.secao_/)
    }
  })
})
