#!/usr/bin/env node
/**
 * Rename DDD estimativa_custo → simula_custo (TASK-000427)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, rmSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')

const CONTENT_REPLACEMENTS = [
  ['ModalidadeRecolhimentoIcmsEstimativaCusto', 'ModalidadeRecolhimentoIcmsSimulaCusto'],
  ['FatoGeradorPrazoPagamentoEstimativaCusto', 'FatoGeradorPrazoPagamentoSimulaCusto'],
  ['MomentoPrazoPagamentoEstimativaCusto', 'MomentoPrazoPagamentoSimulaCusto'],
  ['TipoValorPrazoPagamentoEstimativaCusto', 'TipoValorPrazoPagamentoSimulaCusto'],
  ['PrazoPagamentoEstimativaCusto', 'PrazoPagamentoSimulaCusto'],
  ['DetalheOperacaoEstimativaCusto', 'DetalheOperacaoSimulaCusto'],
  ['TipoOperacaoEstimativaCusto', 'TipoOperacaoSimulaCusto'],
  ['TipoCobrancaEstimativaCusto', 'TipoCobrancaSimulaCusto'],
  ['TipoDocumentoEstimativaCusto', 'TipoDocumentoSimulaCusto'],
  ['TipoTributoEstimativaCusto', 'TipoTributoSimulaCusto'],
  ['TaxaOrigemEstimativaCusto', 'TaxaOrigemSimulaCusto'],
  ['TaxaDestinoEstimativaCusto', 'TaxaDestinoSimulaCusto'],
  ['DocumentoEstimativaCusto', 'DocumentoSimulaCusto'],
  ['SequenciaEstimativaCusto', 'SequenciaSimulaCusto'],
  ['TributoEstimativaCusto', 'TributoSimulaCusto'],
  ['StatusEstimativaCusto', 'StatusSimulaCusto'],
  ['EstimativaCusto', 'SimulaCusto'],
  ['estimativaCusto', 'simulaCusto'],
  ['estimativas_custo', 'simulas_custo'],
  ['estimativa_custo', 'simula_custo'],
  ['estimativas-custo', 'simulas-custo'],
  ['estimativa-custo', 'simula-custo'],
  ['estimativasCusto', 'simulasCusto'],
  ['EstimativasCusto', 'SimulasCusto'],
  ['serializarEstimativa', 'serializarSimula'],
  ['ListarEstimativas', 'ListarSimulas'],
  ['CriarEstimativa', 'CriarSimula'],
  ['AtualizarEstimativa', 'AtualizarSimula'],
  ['AtualizarStatusEstimativa', 'AtualizarStatusSimula'],
  ['SimularEstimativa', 'SimularSimula'],
  ['selectListaEstimativa', 'selectListaSimula'],
  ['exigirContextoEstimativa', 'exigirContextoSimula'],
  ['PrazoPagamentoEntradaEstimativa', 'PrazoPagamentoEntradaSimula'],
  ['derivarDadosResultadoEstimativa', 'derivarDadosResultadoSimula'],
  ['motorCalculoEstimativa', 'motorCalculoSimula'],
  ['cacheDashboardEstimativa', 'cacheDashboardSimula'],
  ['dashboardEstimativa', 'dashboardSimula'],
  ['masterDataEstimativa', 'masterDataSimula'],
  ['configStatusEstimativa', 'configStatusSimula'],
  ['simularEstimativa', 'simularSimula'],
  ['estimativa SimulaCusto', 'simula SimulaCusto'],
  ['WidgetsDashboardEstimativaCusto', 'WidgetsDashboardSimulaCusto'],
  ['KpisDashboardEstimativaCusto', 'KpisDashboardSimulaCusto'],
  ['SimulaCustoRecente', 'SimulaCustoRecente'],
  ['ConfigStatusEstimativaCusto', 'ConfigStatusSimulaCusto'],
  ['listarEstimativasCusto', 'listarSimulasCusto'],
  ['atualizarStatusEstimativaCusto', 'atualizarStatusSimulaCusto'],
  ['obterConfigStatusEstimativaCusto', 'obterConfigStatusSimulaCusto'],
  ['rotaDetalheEstimativaCusto', 'rotaDetalheSimulaCusto'],
  ['usePreferenciasKanbanEstimativaCusto', 'usePreferenciasKanbanSimulaCusto'],
  ['ConteudoCarregandoEstimativaCusto', 'ConteudoCarregandoSimulaCusto'],
  ['KanbanEstimativaCusto', 'KanbanSimulaCusto'],
  ['FormularioEstimativaCusto', 'FormularioSimulaCusto'],
  ['ListaEstimativaCusto', 'ListaSimulaCusto'],
  ['DashboardEstimativaCusto', 'DashboardSimulaCusto'],
  ['InsightsEstimativaCusto', 'InsightsSimulaCusto'],
  ['ResultadoEstimativaCusto', 'ResultadoSimulaCusto'],
  ['ConfiguracoesEstimativaCusto', 'ConfiguracoesSimulaCusto'],
  ['SimulaCustoVisualizacao', 'SimulaCustoVisualizacao'],
  ['entidade canônica: simula_custo', 'entidade canônica: simula_custo'],
  ['Estimativa Custo', 'Simula Custo'],
  ['init_ddd_estimativa_custo', 'init_ddd_simula_custo'],
  ['total_estimativas', 'total_simulas'],
  ['estimativas_ativas', 'simulas_ativas'],
]

const SCAN_DIRS = [
  join(ROOT, 'servicos-global/produto/simula-custo'),
  join(ROOT, 'testes/testes-unitarios/produto-gravity/simula-custo'),
  join(ROOT, 'testes/testes-funcionais/produto-gravity/simula-custo'),
  join(ROOT, 'documentos-tecnicos/ddd-atlas/simula-custo'),
]

const EXT = new Set(['.ts', '.tsx', '.css', '.prisma', '.sql', '.md', '.json', '.js', '.mjs'])

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

function applyContent(text) {
  let out = text
  for (const [from, to] of CONTENT_REPLACEMENTS) out = out.split(from).join(to)
  return out
}

function targetName(name) {
  return name
    .replace(/estimativas-custo/g, 'simulas-custo')
    .replace(/estimativa-custo/g, 'simula-custo')
    .replace(/EstimativaCusto/g, 'SimulaCusto')
}

// 1. Content
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const ext = file.slice(file.lastIndexOf('.'))
    if (!EXT.has(ext)) continue
    const raw = readFileSync(file, 'utf8')
    const next = applyContent(raw)
    if (next !== raw) writeFileSync(file, next, 'utf8')
  }
}

// 2. Rename files (deepest first)
const allFiles = SCAN_DIRS.flatMap((d) => walk(d))
const renames = allFiles
  .filter((f) => basename(f) !== targetName(basename(f)))
  .sort((a, b) => b.length - a.length)

for (const oldPath of renames) {
  const dir = dirname(oldPath)
  const newPath = join(dir, targetName(basename(oldPath)))
  if (existsSync(newPath)) {
    rmSync(oldPath, { force: true })
    console.log('[dup-del]', oldPath)
  } else {
    renameSync(oldPath, newPath)
    console.log('[rename]', basename(oldPath), '→', basename(newPath))
  }
}

console.log('Done.')
