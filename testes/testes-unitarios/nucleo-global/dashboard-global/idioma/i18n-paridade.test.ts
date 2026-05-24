/**
 * i18n-paridade.test.ts — Paridade i18n do componente compartilhado
 *   `@nucleo/dashboard-global`. Roda no CI a cada PR e bloqueia regressao
 *   se algum produto que consome dashboard-global ficar com chave faltando.
 *
 * Cobre:
 *   - Toda key t('nucleo.dashboard.*') chamada nos componentes do
 *     dashboard-global tem entry em pt.json
 *   - pt.json -> en.json: nenhuma key nucleo.dashboard.* faltante
 *   - pt.json -> es.json: idem
 *   - en.json: nenhuma key nucleo.dashboard.* orfa (sem source em pt)
 *   - es.json: idem
 *   - Zero valores vazios em nucleo.dashboard.*
 *   - Variaveis {{var}} preservadas entre pt/en/es
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT_REPO = path.resolve(__dirname, '../../../../..')
const PT_PATH = path.join(ROOT_REPO, 'nucleo-global/Utilidades/Localization/locales/pt.json')
const EN_PATH = path.join(ROOT_REPO, 'nucleo-global/Utilidades/Localization/locales/en.json')
const ES_PATH = path.join(ROOT_REPO, 'nucleo-global/Utilidades/Localization/locales/es.json')
const SRC_DIR = path.join(ROOT_REPO, 'nucleo-global/Dashboard/dashboard-global/src')

type FlatLocale = Record<string, string>

function flatten(obj: unknown, prefix = '', acc: FlatLocale = {}): FlatLocale {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const nk = prefix ? `${prefix}.${k}` : k
      if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, nk, acc)
      else acc[nk] = String(v)
    }
  }
  return acc
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if ((p.endsWith('.tsx') || p.endsWith('.ts')) && !p.endsWith('.d.ts')) out.push(p)
  }
  return out
}

function extractInterpolations(s: string): string[] {
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
  const out: string[] = []
  let m
  while ((m = re.exec(s))) out.push(m[1])
  return out.sort()
}

let pt: FlatLocale
let en: FlatLocale
let es: FlatLocale
let usedKeys: Set<string>

beforeAll(() => {
  pt = flatten(JSON.parse(readFileSync(PT_PATH, 'utf8')))
  en = flatten(JSON.parse(readFileSync(EN_PATH, 'utf8')))
  es = flatten(JSON.parse(readFileSync(ES_PATH, 'utf8')))
  usedKeys = new Set()
  const re = /t\(\s*['"`](nucleo\.dashboard\.[a-zA-Z0-9_.]+)['"`]/g
  for (const file of walk(SRC_DIR)) {
    const txt = readFileSync(file, 'utf8')
    let m
    while ((m = re.exec(txt))) usedKeys.add(m[1])
  }
})

const ptKeys = () => Object.keys(pt).filter((k) => k.startsWith('nucleo.dashboard.'))
const enKeys = () => Object.keys(en).filter((k) => k.startsWith('nucleo.dashboard.'))
const esKeys = () => Object.keys(es).filter((k) => k.startsWith('nucleo.dashboard.'))
const has = (loc: FlatLocale, k: string) => k in loc || `${k}_one` in loc || `${k}_other` in loc

describe('i18n paridade — nucleo-global/dashboard-global', () => {
  it('toda key t(nucleo.dashboard.*) usada no src/ existe em pt.json', () => {
    const missing = [...usedKeys].filter((k) => !has(pt, k))
    expect(missing, `Keys chamadas mas sem entry em pt.json:\n${missing.join('\n')}`).toEqual([])
  })

  it('pt.json -> en.json: nenhuma key nucleo.dashboard.* faltante', () => {
    const missing = ptKeys().filter((k) => !(k in en))
    expect(missing, `Keys em pt sem traducao em en:\n${missing.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('pt.json -> es.json: nenhuma key nucleo.dashboard.* faltante', () => {
    const missing = ptKeys().filter((k) => !(k in es))
    expect(missing, `Keys em pt sem traducao em es:\n${missing.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('en.json: nenhuma key nucleo.dashboard.* orfa', () => {
    const orphans = enKeys().filter((k) => !(k in pt))
    expect(orphans, `Orfas em en:\n${orphans.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('es.json: nenhuma key nucleo.dashboard.* orfa', () => {
    const orphans = esKeys().filter((k) => !(k in pt))
    expect(orphans, `Orfas em es:\n${orphans.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('nenhum valor vazio em nucleo.dashboard.* (pt/en/es)', () => {
    const empty = (loc: FlatLocale, name: string) =>
      Object.entries(loc).filter(([k, v]) => k.startsWith('nucleo.dashboard.') && v === '').map(([k]) => `${name}:${k}`)
    const all = [...empty(pt, 'pt'), ...empty(en, 'en'), ...empty(es, 'es')]
    expect(all, `Vazios:\n${all.join('\n')}`).toEqual([])
  })

  it('variaveis {{var}} preservadas entre pt/en/es', () => {
    const mismatches: string[] = []
    for (const k of ptKeys()) {
      const ptVars = extractInterpolations(pt[k])
      if (ptVars.length === 0) continue
      for (const [name, loc] of [['en', en], ['es', es]] as const) {
        const v = loc[k]
        if (v === undefined) continue
        const locVars = extractInterpolations(v)
        if (JSON.stringify(ptVars) !== JSON.stringify(locVars)) {
          mismatches.push(`${k} [${name}] pt=${JSON.stringify(ptVars)} ${name}=${JSON.stringify(locVars)}`)
        }
      }
    }
    expect(mismatches, `Variaveis divergentes:\n${mismatches.slice(0, 10).join('\n')}`).toEqual([])
  })
})
