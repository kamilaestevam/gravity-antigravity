// populate-logs.mjs
// Lê o playwright JSON existente e popula o arquivo de test-logs do dia
// Executa diretamente via: node populate-logs.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'

const TEST_LOGS_DIR = join('C:', 'Users', 'danie', 'gravity-antigravity', 'servicos-global', 'configurador', 'data', 'test-logs')
const TODAY = new Date().toISOString().slice(0, 10)

// Status map
const PW_STATUS_MAP = {
  passed:      'APROVADO',
  failed:      'REPROVADO',
  timedOut:    'ERRO',
  skipped:     'REPROVADO',
  interrupted: 'ERRO',
}

function walkSuite(suite, entries) {
  for (const sub of suite.suites ?? []) {
    walkSuite(sub, entries)
  }
  for (const spec of suite.specs ?? []) {
    const test    = spec.tests?.[0]
    const result0 = test?.results?.[0]
    const status  = result0?.status ?? 'failed'
    const dur     = result0?.duration ?? 0
    const errMsg  = result0?.error?.message ?? result0?.error?.stack ?? null

    const module = (test?.projectName ?? suite.title ?? 'unknown')
      .replace(/\\/g, '/')
      .split('/').pop() ?? 'unknown'

    entries.push({
      type:      'E2E',
      module,
      test_name: spec.title,
      result:    PW_STATUS_MAP[status] ?? 'REPROVADO',
      duration:  `${dur}ms`,
      error_log: errMsg ? String(errMsg).slice(0, 500) : null,
    })
  }
}

// Encontra o arquivo playwright-run mais recente
const pwFiles = readdirSync(TEST_LOGS_DIR).filter(f => f.startsWith('playwright-run-') && f.endsWith('.json'))
if (pwFiles.length === 0) {
  console.error('Nenhum arquivo playwright-run-*.json encontrado em', TEST_LOGS_DIR)
  process.exit(1)
}
pwFiles.sort().reverse()
const pwFile = join(TEST_LOGS_DIR, pwFiles[0])
console.log('Usando arquivo:', pwFile)

const data = JSON.parse(readFileSync(pwFile, 'utf-8'))
const entries = []
for (const suite of (data.suites ?? [])) {
  walkSuite(suite, entries)
}
console.log(`Encontradas ${entries.length} entradas`)

// Salva no arquivo do dia
const created_at = new Date().toISOString()
const filePath = join(TEST_LOGS_DIR, `${TODAY}.json`)
const novosLogs = entries.map((e, i) => ({
  id: `${Date.now()}-${i}`,
  created_at,
  ...e,
  ai_analysis: null,
}))

mkdirSync(TEST_LOGS_DIR, { recursive: true })
writeFileSync(filePath, JSON.stringify(novosLogs, null, 2))
console.log(`Salvo em: ${filePath}`)
console.log(`Total: ${novosLogs.length} entradas`)

const e2e = novosLogs.filter(l => l.type === 'E2E')
console.log(`E2E: ${e2e.length}`)
console.log(`APROVADO: ${e2e.filter(l => l.result === 'APROVADO').length}`)
console.log(`REPROVADO: ${e2e.filter(l => l.result === 'REPROVADO').length}`)
console.log(`ERRO: ${e2e.filter(l => l.result === 'ERRO').length}`)
