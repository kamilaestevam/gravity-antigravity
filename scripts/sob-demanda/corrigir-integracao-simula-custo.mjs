#!/usr/bin/env node
/**
 * Corrige referências legadas estimativa_* fora do pacote simula-custo
 * (dashboard, i18n, gabi, lgpd, skill ddd-nomenclatura).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')

function patch(path, replacements) {
  const full = join(ROOT, path)
  if (!existsSync(full)) return
  let text = readFileSync(full, 'utf8')
  const before = text
  for (const [from, to] of replacements) text = text.split(from).join(to)
  if (text !== before) {
    writeFileSync(full, text, 'utf8')
    console.log('[patch]', path)
  }
}

// ─── Dashboard plataforma ─────────────────────────────────────────────────────
const dashReplacements = [
  ['simula-custo.estimativas_ativas', 'simula-custo.simulas_ativas'],
  ['estimativas_ativas', 'simulas_ativas'],
  ["title: 'Estimativas Ativas'", "title: 'Simulas Ativas'"],
  ["label: 'Estimativas Ativas'", "label: 'Simulas Ativas'"],
  ['Estimativas Ativas', 'Simulas Ativas'],
  ['das estimativas no período', 'das simulas no período'],
]

patch('servicos-global/servicos-plataforma/dashboard/server/lib/catalog.ts', dashReplacements)
patch('servicos-global/servicos-plataforma/dashboard/server/lib/widget-registry.ts', dashReplacements)

// ─── LGPD ─────────────────────────────────────────────────────────────────────
patch('servicos-global/configurador/server/services/lgpd-service.ts', [
  ["'simula-custo': ['Estimativa', 'TaxaEstimativa', 'TributoEstimativa']",
   "'simula-custo': ['SimulaCusto', 'TaxaOrigemSimulaCusto', 'TaxaDestinoSimulaCusto', 'TributoSimulaCusto']"],
])

// ─── Gabi knowledge ───────────────────────────────────────────────────────────
const apiReplacements = [
  ['#### CRUD de Estimativas', '#### CRUD de Simulas'],
  ['/api/v1/simula-custo/estimativas', '/api/v1/simula-custo/simulas-custo'],
  ['Criar estimativa (numero auto', 'Criar simula (numero auto'],
  ['Listar estimativas (busca', 'Listar simulas (busca'],
  ['Detalhe de uma estimativa', 'Detalhe de uma simula'],
  ['Duplicar estimativa existente', 'Duplicar simula existente'],
  ['estimativas_ativas', 'simulas_ativas'],
]

patch('servicos-global/servicos-plataforma/gabi/server/knowledge/segments/simula-custo.txt', apiReplacements)
patch('servicos-global/servicos-plataforma/gabi/server/knowledge/segments/dashboard.txt', [
  ['simula-custo.estimativas_ativas', 'simula-custo.simulas_ativas'],
  ['estimativas_ativas', 'simulas_ativas'],
  ['Estimativas Ativas', 'Simulas Ativas'],
])
patch('servicos-global/servicos-plataforma/gabi/server/knowledge/gravity-knowledge-base.txt', [
  ['simula-custo.estimativas_ativas', 'simula-custo.simulas_ativas'],
  ['/api/v1/simula-custo/estimativas', '/api/v1/simula-custo/simulas-custo'],
  ['Estimativas Ativas', 'Simulas Ativas'],
  ['estimativas_ativas', 'simulas_ativas'],
])

// ─── Skill DDD ────────────────────────────────────────────────────────────────
patch('skills/governanca/lei/ddd-nomenclatura/SKILL.md', [
  ['Enums do Estimativa Custo (`TipoOperacaoEstimativaCusto`, `DetalheOperacaoEstimativaCusto`, `StatusEstimativaCusto`, `TipoCobrancaEstimativaCusto`, `TipoDocumentoEstimativaCusto`)',
   'Enums do Simula Custo (`TipoOperacaoSimulaCusto`, `DetalheOperacaoSimulaCusto`, `StatusSimulaCusto`, `TipoCobrancaSimulaCusto`, `TipoDocumentoSimulaCusto`)'],
  ['`TipoTributoEstimativaCusto`', '`TipoTributoSimulaCusto`'],
])

// ─── Docs dashboard ───────────────────────────────────────────────────────────
for (const doc of [
  'documentos-tecnicos/produtos-gravity/dashboard/HANDOFF.md',
  'documentos-tecnicos/produtos-gravity/dashboard/CATALOGO-METRICAS.md',
  'documentos-tecnicos/produtos-gravity/dashboard/ARQUITETURA.md',
  'documentos-tecnicos/produtos-gravity/dashboard/PRD.md',
]) {
  patch(doc, [
    ['simula-custo.estimativas_ativas', 'simula-custo.simulas_ativas'],
    ['estimativas_ativas', 'simulas_ativas'],
    ['Estimativas Ativas', 'Simulas Ativas'],
  ])
}

// ─── i18n pt / en / es ────────────────────────────────────────────────────────
function patchSimulacustoLocale(localePath) {
  const full = join(ROOT, localePath)
  const data = JSON.parse(readFileSync(full, 'utf8'))
  const sc = data.simulacusto
  if (!sc) return

  if (sc.estimativas && !sc.simulas) {
    sc.simulas = sc.estimativas
    delete sc.estimativas
  }

  if (sc.kanban?.total_estimativas && !sc.kanban.total_simulas) {
    sc.kanban.total_simulas = sc.kanban.total_estimativas
    delete sc.kanban.total_estimativas
  }

  if (sc.formulario?.salvar_estimativa && !sc.formulario.salvar_simula) {
    sc.formulario.salvar_simula = sc.formulario.salvar_estimativa
    delete sc.formulario.salvar_estimativa
  }

  if (sc.nav && !sc.nav.simulas) {
    sc.nav.simulas = sc.nav.estimativas ?? 'Simulas'
    delete sc.nav.estimativas
  }

  const isPt = localePath.includes('pt.json')
  if (isPt) {
    sc.dashboard.distribuicao_status = 'Simulas por status'
    sc.insights.subtitulo = 'Resumo das simulas de custo de importação'
    sc.insights.kpi_total = 'Total de Simulas'
    sc.insights.recentes = 'Simulas recentes'
    sc.insights.kpi.tributos.subtexto = 'II + IPI + PIS + COFINS + ICMS das simulas calculadas'
    sc.insights.kpi.tributos.tooltip = 'Soma dos tributos de todas as simulas'
    sc.kanban.subtitulo = 'Simulas organizadas por status'
    sc.kanban.localizar = 'Localizar simula...'
    if (sc.kanban.total_simulas) sc.kanban.total_simulas = '{{count}} simulas'

    Object.assign(sc.simulas, {
      titulo: 'Simulas de Custo',
      subtitulo: 'Gerencie suas simulas de custo nacionalizado',
      nova: 'Nova Simula',
      nova_titulo: 'Nova Simula de Custo',
      editar_titulo: 'Editar Simula',
      total: 'Total de Simulas',
      confirmar_exclusao: 'Excluir esta simula definitivamente?',
      excluir_titulo: 'Excluir simula',
      duplicada_sucesso: 'Simula duplicada com sucesso.',
      duplicada_erro: 'Não foi possível duplicar a simula.',
      arquivada_sucesso: 'Simula arquivada.',
      arquivada_erro: 'Não foi possível arquivar a simula.',
      excluida_sucesso: 'Simula excluída definitivamente.',
      excluida_erro: 'Não foi possível excluir a simula.',
      vazio: 'Nenhuma simula encontrada',
      vazio_descricao: 'Crie sua primeira simula de custo de importação.',
      aria_tabela: 'Tabela de simulas de custo',
      todas: 'Todas as simulas',
      kpi_total: 'Total de Simulas',
      lista_titulo: 'Simulas de Custo',
      lista_subtitulo: 'Todas as simulas de custo em tabela',
      export_titulo: 'Simulas de Custo',
    })
    sc.simulas.acoes.duplicar = 'Duplicar simula'
    sc.formulario.titulo_editar = 'Simula de Custo'
    sc.formulario.subtitulo_editar = 'Detalhes, taxas e resultado fiscal da simula'
    sc.formulario.nao_encontrada = 'Simula não encontrada'
    if (sc.formulario.salvar_simula) sc.formulario.salvar_simula = 'Salvar Simula'
  }

  writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('[i18n]', localePath)
}

patchSimulacustoLocale('nucleo-global/Utilidades/Localization/locales/pt.json')
patchSimulacustoLocale('nucleo-global/Utilidades/Localization/locales/en.json')
patchSimulacustoLocale('nucleo-global/Utilidades/Localization/locales/es.json')

console.log('Integração simula-custo corrigida.')
