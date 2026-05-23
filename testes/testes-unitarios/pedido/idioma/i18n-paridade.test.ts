/**
 * i18n-paridade.test.ts — Garante a paridade i18n do produto Pedido.
 *
 * Roda no CI a cada PR e bloqueia merge se:
 *   - Algum `t('pedido.*')` chamado em client/src nao tem entry em pt.json
 *   - pt.json tem keys `pedido.*` que faltam em en.json ou es.json
 *   - Existem valores vazios em `pedido.*` em qualquer locale
 *   - Variaveis `{{var}}` divergem entre pt/en/es para a mesma key
 *   - en/es tem keys `pedido.*` orfas (sem source em pt.json)
 *
 * Quando essa suite falhar:
 *   - Key chamada mas faltando -> adicione em pt.json + rode `npm run translate`
 *   - Faltando em en/es -> rode `npm run translate` (Gemini preenche)
 *   - Orfas em en/es -> cleanup com script ou remova manualmente (autorizado pelo dono)
 *   - Variavel divergente -> ajuste pt para usar a mesma interpolacao
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT_REPO = path.resolve(__dirname, '../../../..')
const PT_PATH = path.join(ROOT_REPO, 'nucleo-global/Utilidades/Localization/locales/pt.json')
const EN_PATH = path.join(ROOT_REPO, 'nucleo-global/Utilidades/Localization/locales/en.json')
const ES_PATH = path.join(ROOT_REPO, 'nucleo-global/Utilidades/Localization/locales/es.json')
const CLIENT_SRC = path.join(ROOT_REPO, 'servicos-global/produto/pedido/client/src')

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
  const re = /t\(\s*['"`](pedido\.[a-zA-Z0-9_.]+)['"`]/g
  for (const file of walk(CLIENT_SRC)) {
    const txt = readFileSync(file, 'utf8')
    let m
    while ((m = re.exec(txt))) usedKeys.add(m[1])
  }
})

const ptKeys = () => Object.keys(pt).filter((k) => k.startsWith('pedido.'))
const enKeys = () => Object.keys(en).filter((k) => k.startsWith('pedido.'))
const esKeys = () => Object.keys(es).filter((k) => k.startsWith('pedido.'))
const has = (loc: FlatLocale, k: string) => k in loc || `${k}_one` in loc || `${k}_other` in loc

describe('i18n paridade — produto Pedido', () => {
  it('toda key t(pedido.*) usada no client/src existe em pt.json', () => {
    const missing = [...usedKeys].filter((k) => !has(pt, k))
    expect(missing, `Keys chamadas mas sem entry em pt.json:\n${missing.join('\n')}`).toEqual([])
  })

  it('pt.json -> en.json: nenhuma key pedido.* faltante', () => {
    const missing = ptKeys().filter((k) => !(k in en))
    expect(missing, `Keys em pt.json sem traducao em en.json:\n${missing.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('pt.json -> es.json: nenhuma key pedido.* faltante', () => {
    const missing = ptKeys().filter((k) => !(k in es))
    expect(missing, `Keys em pt.json sem traducao em es.json:\n${missing.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('en.json: nenhuma key pedido.* orfa (sem source em pt)', () => {
    const orphans = enKeys().filter((k) => !(k in pt))
    expect(orphans, `Keys orfas em en.json:\n${orphans.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('es.json: nenhuma key pedido.* orfa', () => {
    const orphans = esKeys().filter((k) => !(k in pt))
    expect(orphans, `Keys orfas em es.json:\n${orphans.slice(0, 20).join('\n')}`).toEqual([])
  })

  it('nenhum valor vazio em pedido.* (pt/en/es)', () => {
    const empty = (loc: FlatLocale, name: string) =>
      Object.entries(loc).filter(([k, v]) => k.startsWith('pedido.') && v === '').map(([k]) => `${name}:${k}`)
    const all = [...empty(pt, 'pt'), ...empty(en, 'en'), ...empty(es, 'es')]
    expect(all, `Keys com valor vazio:\n${all.join('\n')}`).toEqual([])
  })

  it('variaveis {{var}} preservadas entre pt/en/es', () => {
    const mismatches: string[] = []
    for (const k of ptKeys()) {
      const ptVars = extractInterpolations(pt[k])
      if (ptVars.length === 0) continue
      for (const [name, loc] of [['en', en], ['es', es]] as const) {
        const v = loc[k]
        if (v === undefined) continue // ja coberto pelo teste de paridade
        const locVars = extractInterpolations(v)
        if (JSON.stringify(ptVars) !== JSON.stringify(locVars)) {
          mismatches.push(`${k} [${name}] pt=${JSON.stringify(ptVars)} ${name}=${JSON.stringify(locVars)}`)
        }
      }
    }
    expect(mismatches, `Variaveis divergentes:\n${mismatches.slice(0, 10).join('\n')}`).toEqual([])
  })
})
