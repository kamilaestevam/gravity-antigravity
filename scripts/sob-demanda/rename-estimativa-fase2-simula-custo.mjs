#!/usr/bin/env node
/**
 * Fase 2 — rotas, i18n, variáveis e mensagens (estimativa → simula)
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
  // Prisma relation filter
  ['estimativa:', 'simula:'],
  // Rotas SPA
  ["'estimativas/nova'", "'simulas/nova'"],
  ['"estimativas/nova"', '"simulas/nova"'],
  ["'estimativas'", "'simulas'"],
  ['path="estimativas/', 'path="simulas/'],
  ['rk === \'estimativas/nova\'', "rk === 'simulas/nova'"],
  ['/estimativas\\/', '/simulas\\/'],
  ['/^estimativas\\/', '/^simulas\\/'],
  ['/simula-custo\\/estimativas\\//', '/simula-custo/simulas//'],
  ['/estimativas\\//', '/simulas//'],
  // i18n keys
  ['simulacusto.estimativas.', 'simulacusto.simulas.'],
  // Variáveis / state
  ['estimativaParaExcluir', 'simulaParaExcluir'],
  ['setEstimativaParaExcluir', 'setSimulaParaExcluir'],
  ['idEstimativa', 'idSimula'],
  ['chaveStorageItensSimulaCusto(idSimula', 'chaveStorageItensSimulaCusto(idSimula'], // noop guard
  // Mensagens backend
  ['Estimativa original não encontrada', 'Simula original não encontrada'],
  ['Estimativa não encontrada', 'Simula não encontrada'],
  // Variável local comum
  ['const estimativa = await', 'const simula = await'],
  ['const { taxas_origem, taxas_destino, tributos, documentos, prazos_pagamento, ...linha } = estimativa', 'const { taxas_origem, taxas_destino, tributos, documentos, prazos_pagamento, ...linha } = simula'],
  ['calculada ?? estimativa', 'calculada ?? simula'],
  ['if (!estimativa)', 'if (!simula)'],
  ['Number(estimativa.', 'Number(simula.'],
  ['estimativa.modalidade', 'simula.modalidade'],
  ['estimativa.usa_beneficio', 'simula.usa_beneficio'],
  ['estimativa.enviar_solicitacao', 'simula.enviar_solicitacao'],
  ['estimativa.id_simula_custo', 'simula.id_simula_custo'],
  // CSS
  ['nc-campo-frete-estimativa', 'nc-campo-frete-simula'],
  // Rotas tipo Segmento
  ["| 'estimativas/nova'", "| 'simulas/nova'"],
  ['/estimativas/${idSimulaCusto}', '/simulas/${idSimulaCusto}'],
  // Labels App breadcrumbs
  ["'estimativas':   'Estimativas'", "'simulas':   'Simulas'"],
  ["'nova':          'Nova Estimativa'", "'nova':          'Nova Simula'"],
  // Comentários seção API
  ['// ─── Estimativas CRUD', '// ─── Simulas CRUD'],
  ['estimativas mais recentes', 'simulas mais recentes'],
  ['tabela de estimativas', 'tabela de simulas'],
  ['Número total de estimativas', 'Número total de simulas'],
  ['Estimativas ainda em elaboração', 'Simulas ainda em elaboração'],
  ['Estimativas finalizadas', 'Simulas finalizadas'],
  ['Estimativas arquivadas', 'Simulas arquivadas'],
  ['congelar na estimativa', 'congelar na simula'],
  ['resultado fiscal da estimativa', 'resultado fiscal da simula'],
  ['«Nova Estimativa»', '«Nova Simula»'],
  ['Nova Estimativa de Custo', 'Nova Simula de Custo'],
  ['Editar Estimativa de Custo', 'Editar Simula de Custo'],
  ['Estimativas organizadas por status', 'Simulas organizadas por status'],
  ['da estimativa', 'da simula'],
  ['estimativa sem storage', 'simula sem storage'],
  ['estimativa existente', 'simula existente'],
  ['Estimativa não encontrada', 'Simula não encontrada'],
  ['alíquotas da estimativa', 'alíquotas da simula'],
  ['mesma estimativa', 'mesma simula'],
  ['Nenhuma estimativa', 'Nenhuma simula'],
  ['primeira estimativa', 'primeira simula'],
  ['Excluir estimativa', 'Excluir simula'],
  ['esta estimativa', 'esta simula'],
  ['Total de Estimativas', 'Total de Simulas'],
  ['Todas as estimativas', 'Todas as simulas'],
  ['paridade mockup Estimativa de Custo', 'paridade mockup Simula de Custo'],
  ['Wizard Nova/Editar Estimativa', 'Wizard Nova/Editar Simula'],
  ['Itens de produto da estimativa', 'Itens de produto da simula'],
  ['interface LinhaEstimativa', 'interface LinhaSimula'],
  ['let estimativas:', 'let simulas:'],
  ['estimativas.filter', 'simulas.filter'],
  ['estimativas.push', 'simulas.push'],
  ['estimativas = estimativas', 'simulas = simulas'],
  ['estimativas = []', 'simulas = []'],
  ['estimativas[0]', 'simulas[0]'],
  ['enxerga estimativas', 'enxerga simulas'],
  ['estimativas da org', 'simulas da org'],
  ['estimativas_ativas', 'simulas_ativas'],
]

const EXT = new Set(['.ts', '.tsx', '.css', '.md', '.sql'])

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
console.log(`Fase 2: ${changed} arquivos atualizados.`)
