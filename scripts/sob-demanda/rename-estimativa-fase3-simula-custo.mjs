#!/usr/bin/env node
/**
 * Fase 3 — constantes *_ESTIMATIVA_CUSTO, tipos Kanban e state estimativas
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const DIRS = [
  join(ROOT, 'servicos-global/produto/simula-custo'),
  join(ROOT, 'testes/testes-unitarios/produto-gravity/simula-custo'),
  join(ROOT, 'testes/testes-funcionais/produto-gravity/simula-custo'),
  join(ROOT, 'documentos-tecnicos/ddd-atlas/simula-custo'),
]

const REPLACEMENTS = [
  ['_ESTIMATIVA_CUSTO', '_SIMULA_CUSTO'],
  ['LinhaEstimativa', 'LinhaSimula'],
  ['EstimativaKanbanItem', 'SimulaKanbanItem'],
  ['CardEstimativaKanban', 'CardSimulaKanban'],
  ['estimativas, setEstimativas', 'simulas, setSimulas'],
  ['setEstimativas', 'setSimulas'],
  ['[estimativas]', '[simulas]'],
  ['(estimativas)', '(simulas)'],
  [' estimativas ', ' simulas '],
  ['estimativas.map', 'simulas.map'],
  ['estimativas.filter', 'simulas.filter'],
  ['estimativas =', 'simulas ='],
  ['estimativa =>', 'simula =>'],
  ['({ estimativa })', '({ simula })'],
  ['item.estimativa', 'item.simula'],
  ['estimativa={item.estimativa}', 'simula={item.simula}'],
  ['estimativa: SimulaCusto', 'simula: SimulaCusto'],
  ['estimativa,', 'simula,'],
  ['estimativa.', 'simula.'],
  ['estimativa)', 'simula)'],
  ['estimativa:', 'simula:'],
  ['estimativa ', 'simula '],
  ['estimativa}', 'simula}'],
  ['estimativa]', 'simula]'],
  ['function CardSimulaKanban({ estimativa', 'function CardSimulaKanban({ simula'],
  ["'simulas':   'Estimativas'", "'simulas':   'Simulas'"],
  ['Estimativas por status', 'Simulas por status'],
  ['Estimativas recentes', 'Simulas recentes'],
  ['todas as estimativas', 'todas as simulas'],
  ['Localizar estimativa', 'Localizar simula'],
  ['{{count}} estimativas', '{{count}} simulas'],
  ['estimativas calculadas', 'simulas calculadas'],
  ['Nova Estimativa', 'Nova Simula'],
  ['estimativas recentes', 'simulas recentes'],
  ["simulacusto.nav.estimativas", "simulacusto.nav.simulas"],
  ["'Estimativas'", "'Simulas'"],
  ['Estimativa de Custo', 'Simula de Custo'],
  ['Salvar Estimativa', 'Salvar Simula'],
  ['ANÁLISE DA ESTIMATIVA', 'ANÁLISE DA SIMULA'],
  ['salvar_estimativa', 'salvar_simula'],
  ['analise_estimativa', 'analise_simula'],
  ['Média BRL por estimativa', 'Média BRL por simula'],
  ['Soma de todas as estimativas', 'Soma de todas as simulas'],
  ['mockup Estimativa de Custo', 'mockup Simula de Custo'],
  ['CATALOGO_STATUS_ESTIMATIVA_CUSTO', 'CATALOGO_STATUS_SIMULA_CUSTO'],
  ['METRICAS_DASHBOARD_ESTIMATIVA_CUSTO', 'METRICAS_DASHBOARD_SIMULA_CUSTO'],
  // docs atlas — relação Prisma
  ['| estimativa_id |', '| id_simula_custo (legado estimativa_id) |'],
  ['| estimativa | N:1 | SimulaCusto | Estimativa dona', '| simula | N:1 | SimulaCusto | Simula dona'],
  ['estimativa de custo de importação', 'simula de custo de importação'],
]

const EXT = new Set(['.ts', '.tsx', '.css', '.md'])

function walk(dir, files = []) {
  if (!existsSync(dir)) return files
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(p, files)
    } else files.push(p)
  }
  return files
}

let changed = 0
for (const dir of DIRS) {
  for (const file of walk(dir)) {
    const ext = file.slice(file.lastIndexOf('.'))
    if (!EXT.has(ext)) continue
    const raw = readFileSync(file, 'utf8')
    let out = raw
    for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to)
    if (out !== raw) {
      writeFileSync(file, out, 'utf8')
      changed++
    }
  }
}
console.log(`Fase 3: ${changed} arquivos atualizados.`)
