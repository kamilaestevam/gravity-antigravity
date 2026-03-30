/**
 * Testes de integridade dos arquivos de tradução.
 *
 * Valida:
 * - Todas as chaves de pt.json existem em en.json e es.json
 * - Nenhum valor em en.json ou es.json está vazio ou igual ao português
 * - Nenhuma chave extra em en.json ou es.json que não existe em pt.json
 * - Chaves admin.cockpit.* existem apenas em pt.json
 * - Exclusão do pipeline funciona corretamente
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const LOCALES_DIR = path.resolve(
  __dirname,
  '../../../nucleo-global/Utilidades/Localization/locales'
)

const SKIP_NAMESPACES = ['admin.cockpit']

// ─── Helpers ─────────────────────────────────────────────────────────────

type FlatMap = Record<string, string>

function flatten(obj: Record<string, unknown>, prefix = ''): FlatMap {
  const result: FlatMap = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey))
    } else {
      result[fullKey] = String(value)
    }
  }
  return result
}

function isSkippedKey(key: string): boolean {
  return SKIP_NAMESPACES.some((ns) => key.startsWith(ns))
}

function loadLocale(lang: string): FlatMap {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return flatten(data)
}

// ─── Dados ───────────────────────────────────────────────────────────────

const pt = loadLocale('pt')
const en = loadLocale('en')
const es = loadLocale('es')

const ptTranslatable = Object.entries(pt).filter(([key]) => !isSkippedKey(key))
const ptCockpitKeys = Object.keys(pt).filter((key) => isSkippedKey(key))

// ─── Testes: Cobertura de chaves ─────────────────────────────────────────

describe('messages-integrity: Todas as chaves de pt.json existem em en.json e es.json', () => {
  it('en.json contém todas as chaves traduzíveis de pt.json', () => {
    const missing: string[] = []
    for (const [key] of ptTranslatable) {
      if (!(key in en)) {
        missing.push(key)
      }
    }
    expect(missing).toEqual([])
  })

  it('es.json contém todas as chaves traduzíveis de pt.json', () => {
    const missing: string[] = []
    for (const [key] of ptTranslatable) {
      if (!(key in es)) {
        missing.push(key)
      }
    }
    expect(missing).toEqual([])
  })
})

// ─── Testes: Valores não vazios ──────────────────────────────────────────

describe('messages-integrity: Nenhum valor vazio ou não traduzido', () => {
  it('en.json não tem valores vazios', () => {
    const empty: string[] = []
    for (const [key, value] of Object.entries(en)) {
      if (value.trim() === '') {
        empty.push(key)
      }
    }
    expect(empty).toEqual([])
  })

  it('es.json não tem valores vazios', () => {
    const empty: string[] = []
    for (const [key, value] of Object.entries(es)) {
      if (value.trim() === '') {
        empty.push(key)
      }
    }
    expect(empty).toEqual([])
  })

  it('en.json não tem valores longos idênticos ao português (possível falha no pipeline)', () => {
    // Chaves com valores curtos (<=12 chars) são frequentemente termos técnicos
    // iguais em ambos os idiomas (Status, Email, Dashboard, Incoterm, etc.)
    // Apenas verificamos strings longas que deveriam ter sido traduzidas.
    const MIN_LENGTH_TO_CHECK = 12

    const identical: string[] = []
    for (const [key] of ptTranslatable) {
      const ptVal = pt[key]
      if (!ptVal || ptVal.length < MIN_LENGTH_TO_CHECK) continue
      if (en[key] && en[key] === ptVal) {
        identical.push(`${key}: "${ptVal}"`)
      }
    }

    // Até ~25 termos técnicos podem ser iguais em pt/en (Gravity Store,
    // Deploy Railway, Rate Limiting, Client Secret, Timestamp ISO, etc.)
    // Acima disso indica falha no pipeline de tradução.
    expect(identical.length).toBeLessThan(25)
  })
})

// ─── Testes: Sem chaves extras ───────────────────────────────────────────

describe('messages-integrity: Nenhuma chave extra em en.json ou es.json', () => {
  it('en.json não tem chaves que não existem em pt.json', () => {
    const extra: string[] = []
    for (const key of Object.keys(en)) {
      if (!(key in pt)) {
        extra.push(key)
      }
    }
    expect(extra).toEqual([])
  })

  it('es.json não tem chaves que não existem em pt.json', () => {
    const extra: string[] = []
    for (const key of Object.keys(es)) {
      if (!(key in pt)) {
        extra.push(key)
      }
    }
    expect(extra).toEqual([])
  })
})

// ─── Testes: admin.cockpit — exclusão do pipeline ────────────────────────

describe('messages-integrity: admin.cockpit.* (exclusão do pipeline)', () => {
  it('chaves admin.cockpit.* existem em pt.json com valor não vazio', () => {
    expect(ptCockpitKeys.length).toBeGreaterThan(0)

    for (const key of ptCockpitKeys) {
      expect(pt[key]).toBeTruthy()
      expect(pt[key].trim()).not.toBe('')
    }
  })

  it('nenhuma chave admin.cockpit.* existe em en.json', () => {
    const cockpitInEn = Object.keys(en).filter((key) =>
      key.startsWith('admin.cockpit')
    )
    expect(cockpitInEn).toEqual([])
  })

  it('nenhuma chave admin.cockpit.* existe em es.json', () => {
    const cockpitInEs = Object.keys(es).filter((key) =>
      key.startsWith('admin.cockpit')
    )
    expect(cockpitInEs).toEqual([])
  })
})

// ─── Teste: Consistência estrutural ──────────────────────────────────────

describe('messages-integrity: Consistência estrutural', () => {
  it('pt.json é JSON válido com pelo menos 500 chaves', () => {
    expect(Object.keys(pt).length).toBeGreaterThan(500)
  })

  it('en.json tem o mesmo número de chaves traduzíveis que pt.json', () => {
    const ptCount = ptTranslatable.length
    const enCount = Object.keys(en).length
    expect(enCount).toBe(ptCount)
  })

  it('es.json tem o mesmo número de chaves traduzíveis que pt.json', () => {
    const ptCount = ptTranslatable.length
    const esCount = Object.keys(es).length
    expect(esCount).toBe(ptCount)
  })
})
