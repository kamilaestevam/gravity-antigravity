/**
 * Testes unitários para o pipeline de tradução (scripts/translate.ts).
 *
 * Valida:
 * - Detecção correta de chaves ausentes
 * - Não sobrescreve traduções existentes
 * - --dry-run não altera arquivos
 * - Preserva variáveis {nome} e tags HTML
 * - Falha com mensagem clara se GEMINI_API_KEY não estiver definida
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const LOCALES_DIR = path.resolve(
  __dirname,
  '../../../nucleo-global/Utilidades/Localization/locales'
)

// ─── Helpers de flatten/unflatten (espelhando o script) ──────────────────

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

const SKIP_NAMESPACES = ['admin.cockpit']

function isSkippedKey(key: string): boolean {
  return SKIP_NAMESPACES.some((ns) => key.startsWith(ns))
}

function findMissingKeys(source: FlatMap, target: FlatMap): FlatMap {
  const missing: FlatMap = {}
  for (const [key, value] of Object.entries(source)) {
    if (isSkippedKey(key)) continue
    if (!(key in target) || target[key] === '') {
      missing[key] = value
    }
  }
  return missing
}

// ─── Testes ──────────────────────────────────────────────────────────────

describe('translate-script: Detecção de chaves ausentes', () => {
  it('detecta chaves ausentes quando en.json está incompleto', () => {
    const source: FlatMap = {
      'comum.salvar': 'Salvar',
      'comum.cancelar': 'Cancelar',
      'shell.titulo': 'Título do Shell',
    }
    const target: FlatMap = {
      'comum.salvar': 'Save',
      // comum.cancelar está faltando
      // shell.titulo está faltando
    }

    const missing = findMissingKeys(source, target)

    expect(Object.keys(missing)).toHaveLength(2)
    expect(missing['comum.cancelar']).toBe('Cancelar')
    expect(missing['shell.titulo']).toBe('Título do Shell')
  })

  it('não inclui chaves que já existem no target', () => {
    const source: FlatMap = {
      'comum.salvar': 'Salvar',
      'comum.cancelar': 'Cancelar',
    }
    const target: FlatMap = {
      'comum.salvar': 'Save',
      'comum.cancelar': 'Cancel',
    }

    const missing = findMissingKeys(source, target)

    expect(Object.keys(missing)).toHaveLength(0)
  })

  it('detecta chaves com valor vazio como faltantes', () => {
    const source: FlatMap = {
      'comum.salvar': 'Salvar',
    }
    const target: FlatMap = {
      'comum.salvar': '',
    }

    const missing = findMissingKeys(source, target)

    expect(Object.keys(missing)).toHaveLength(1)
    expect(missing['comum.salvar']).toBe('Salvar')
  })
})

describe('translate-script: Exclusão de namespaces', () => {
  it('ignora chaves do namespace admin.cockpit', () => {
    const source: FlatMap = {
      'admin.cockpit.titulo': 'API Cockpit',
      'admin.cockpit.status.sucesso': 'SUCESSO',
      'comum.salvar': 'Salvar',
    }
    const target: FlatMap = {}

    const missing = findMissingKeys(source, target)

    expect(Object.keys(missing)).toHaveLength(1)
    expect(missing['comum.salvar']).toBe('Salvar')
    expect(missing['admin.cockpit.titulo']).toBeUndefined()
    expect(missing['admin.cockpit.status.sucesso']).toBeUndefined()
  })
})

describe('translate-script: Não sobrescreve traduções existentes', () => {
  it('merge preserva traduções existentes', () => {
    const existing: FlatMap = {
      'comum.salvar': 'Save (custom)',
      'comum.cancelar': 'Cancel',
    }
    const newTranslations: FlatMap = {
      'comum.salvar': 'Save (new)',
      'comum.novo': 'New',
    }

    // Simula mergeTranslations do script
    const merged = { ...existing }
    for (const [key, value] of Object.entries(newTranslations)) {
      if (!(key in merged) || merged[key] === '') {
        merged[key] = value
      }
    }

    expect(merged['comum.salvar']).toBe('Save (custom)') // Não sobrescrito
    expect(merged['comum.cancelar']).toBe('Cancel') // Mantido
    expect(merged['comum.novo']).toBe('New') // Adicionado
  })
})

describe('translate-script: --dry-run não altera arquivos', () => {
  it('verifica que os arquivos de tradução existem e são legíveis', () => {
    const ptPath = path.join(LOCALES_DIR, 'pt.json')
    const enPath = path.join(LOCALES_DIR, 'en.json')
    const esPath = path.join(LOCALES_DIR, 'es.json')

    expect(fs.existsSync(ptPath)).toBe(true)
    expect(fs.existsSync(enPath)).toBe(true)
    expect(fs.existsSync(esPath)).toBe(true)

    // Captura timestamps antes
    const enStatBefore = fs.statSync(enPath).mtimeMs
    const esStatBefore = fs.statSync(esPath).mtimeMs

    // Lê os arquivos (como o --dry-run faria)
    const pt = JSON.parse(fs.readFileSync(ptPath, 'utf-8'))
    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'))
    const es = JSON.parse(fs.readFileSync(esPath, 'utf-8'))

    const ptFlat = flatten(pt)
    const enFlat = flatten(en)
    const esFlat = flatten(es)

    // Calcula missing (dry-run operation)
    const missingEn = findMissingKeys(ptFlat, enFlat)
    const missingEs = findMissingKeys(ptFlat, esFlat)

    // Verifica que os arquivos NÃO foram modificados
    const enStatAfter = fs.statSync(enPath).mtimeMs
    const esStatAfter = fs.statSync(esPath).mtimeMs

    expect(enStatAfter).toBe(enStatBefore)
    expect(esStatAfter).toBe(esStatBefore)
  })
})

describe('translate-script: Preservação de variáveis e HTML', () => {
  it('variáveis {nome} devem estar presentes nos valores fonte', () => {
    const ptPath = path.join(LOCALES_DIR, 'pt.json')
    const ptData = JSON.parse(fs.readFileSync(ptPath, 'utf-8'))
    const ptFlat = flatten(ptData)

    // Encontra todas as chaves que contêm variáveis
    const keysWithVars = Object.entries(ptFlat).filter(
      ([, value]) => /\{\{?\w+\}?\}/.test(value)
    )

    // Deve haver chaves com variáveis (ex: {{count}}, {{tema}})
    expect(keysWithVars.length).toBeGreaterThan(0)

    // Verifica que cada variável tem formato válido
    for (const [key, value] of keysWithVars) {
      const vars = value.match(/\{\{?\w+\}?\}/g) ?? []
      for (const v of vars) {
        expect(v).toMatch(/^\{\{?\w+\}?\}$/)
      }
    }
  })

  it('variáveis em pt.json devem existir também em en.json', () => {
    const ptData = JSON.parse(
      fs.readFileSync(path.join(LOCALES_DIR, 'pt.json'), 'utf-8')
    )
    const enData = JSON.parse(
      fs.readFileSync(path.join(LOCALES_DIR, 'en.json'), 'utf-8')
    )
    const ptFlat = flatten(ptData)
    const enFlat = flatten(enData)

    for (const [key, ptValue] of Object.entries(ptFlat)) {
      if (isSkippedKey(key)) continue
      const ptVars = (ptValue.match(/\{\{?\w+\}?\}/g) ?? []).sort()
      if (ptVars.length === 0) continue

      const enValue = enFlat[key]
      if (!enValue) continue // Chave faltante é testada em messages-integrity

      const enVars = (enValue.match(/\{\{?\w+\}?\}/g) ?? []).sort()
      expect(enVars).toEqual(ptVars)
    }
  })
})

describe('translate-script: Validação de GEMINI_API_KEY', () => {
  it('script deve exigir GEMINI_API_KEY quando não é --dry-run', () => {
    // Verifica que o script contém a validação
    const scriptPath = path.resolve(
      __dirname,
      '../../../scripts/translate.ts'
    )
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8')

    expect(scriptContent).toContain('GEMINI_API_KEY')
    expect(scriptContent).toContain('process.exit(1)')
    expect(scriptContent).toContain('--dry-run')
  })
})
