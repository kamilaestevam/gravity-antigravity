/**
 * QA automatizado — rebrand Smart Read → Smart Docs (camadas B+C+D, sem slug técnico).
 */
import { describe, expect, it } from 'vitest'
import { PRODUTO_META } from '../../../nucleo-global/Logo/produtos/src/LogoProdutoGlobal'
import { nomeExibicaoProdutoGravity } from '../../../servicos-global/configurador/src/data/product-meta'
import pt from '../../../nucleo-global/Utilidades/Localization/locales/pt.json'
import en from '../../../nucleo-global/Utilidades/Localization/locales/en.json'

const tPt = (key: string, defaultValue?: string) => {
  const partes = key.split('.')
  let atual: unknown = pt
  for (const p of partes) {
    if (atual && typeof atual === 'object' && p in (atual as object)) {
      atual = (atual as Record<string, unknown>)[p]
    } else {
      return defaultValue ?? key
    }
  }
  return typeof atual === 'string' ? atual : (defaultValue ?? key)
}

describe('Rebrand Smart Docs — exibição front', () => {
  it('PRODUTO_META smart-read usa sublabel documental (não OCR legado)', () => {
    expect(PRODUTO_META['smart-read']?.sublabel).toBe('documentos COMEX')
  })

  it('nomeExibicaoProdutoGravity prioriza catálogo Admin (Smart Docs)', () => {
    expect(nomeExibicaoProdutoGravity('smart-read', 'Smart Docs', tPt)).toBe('Smart Docs')
  })

  it('fallback i18n store quando Admin vazio', () => {
    expect(nomeExibicaoProdutoGravity('smart-read', '', tPt)).toBe('Smart Docs')
  })

  it('locales pt/en sem "Smart Read" em chaves de produto', () => {
    const textoPt = JSON.stringify(pt)
    const textoEn = JSON.stringify(en)
    expect(textoPt).not.toContain('Smart Read')
    expect(textoEn).not.toContain('Smart Read')
    expect(textoPt).toContain('Smart Docs')
    expect(textoEn).toContain('Smart Docs')
  })

  it('hub pt descreve produto como documentos COMEX', () => {
    const hub = pt as { hub?: { produto_visual_smart_read?: string } }
    expect(hub.hub?.produto_visual_smart_read).toMatch(/COMEX/i)
    expect(hub.hub?.produto_visual_smart_read).not.toMatch(/leitura inteligente/i)
  })
})
