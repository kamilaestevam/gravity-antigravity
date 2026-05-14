// @vitest-environment node
/**
 * Verifica que o proxy do api-cockpit no Configurador usa getApiCockpitUrl()
 * (que lê API_COCKPIT_SERVICE_URL) em vez da variável fantasma API_COCKPIT_URL.
 *
 * Contexto: bug de 2026-05-14 — 4 ocorrências de API_COCKPIT_URL não declarada
 * causavam ReferenceError em runtime → banner vermelho no frontend.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const filePath = path.resolve(
  __dirname,
  '../../../servicos-global/configurador/server/routes/api-cockpit.ts',
)
const content = readFileSync(filePath, 'utf-8')

describe('api-cockpit.ts — proxy URL consistency', () => {
  it('não contém referência direta a variável API_COCKPIT_URL (variável fantasma)', () => {
    const regex = /(?<!function\s)(?<!process\.env\.)API_COCKPIT_URL(?!\s*[:=])/g
    const matches = content.match(regex)

    const falsePositives = ['getApiCockpitUrl', 'API_COCKPIT_SERVICE_URL']
    const realMatches = (matches || []).filter((m) => {
      const idx = content.indexOf(m)
      const surrounding = content.slice(Math.max(0, idx - 30), idx + m.length + 30)
      return !falsePositives.some((fp) => surrounding.includes(fp))
    })

    expect(realMatches).toHaveLength(0)
  })

  it('getApiCockpitUrl() está declarada e lê API_COCKPIT_SERVICE_URL', () => {
    expect(content).toContain('function getApiCockpitUrl()')
    expect(content).toContain('API_COCKPIT_SERVICE_URL')
  })

  it('funções proxy usam getApiCockpitUrl() para construir URLs', () => {
    const callsToGetUrl = content.match(/getApiCockpitUrl\(\)/g) || []
    expect(callsToGetUrl.length).toBeGreaterThanOrEqual(5)
  })
})
