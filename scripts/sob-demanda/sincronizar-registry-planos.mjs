/**
 * Sincroniza planoFile no registry com arquivos reais em testes/.
 * Uso: node scripts/sob-demanda/sincronizar-registry-planos.mjs
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
} from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'

const ROOT = join(import.meta.dirname, '../..')
const TESTES = join(ROOT, 'testes')
const REGISTRY_PATH = join(TESTES, 'test-plans-registry.json')

const TIPO_PASTA = {
  UNI: 'testes-unitarios',
  FUN: 'testes-funcionais',
  E2E: 'testes-e2e',
  CRO: 'testes-cross-organizacao',
  EMT: 'testes-em-tela',
}

const NOTA =
  '> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.\n'

function relTestes(abs) {
  return abs.replace(/\\/g, '/').slice(TESTES.length + 1)
}

function resolveAbs(relPath) {
  if (!relPath) return null
  const n = relPath.replace(/\\/g, '/').replace(/^testes\//, '')
  for (const p of [join(TESTES, n), join(TESTES, relPath), join(ROOT, relPath)]) {
    if (existsSync(p)) return p
  }
  return null
}

function candidatosPlano(entry) {
  const out = []
  const push = p => {
    if (p && existsSync(p) && !out.includes(p)) out.push(p)
  }

  if (entry.planoFile) push(resolveAbs(entry.planoFile))

  const suffix = entry.id.match(/\d{6}$/)?.[0]
  if (entry.sublocal && entry.tipo && TIPO_PASTA[entry.tipo]) {
    const base = join(TESTES, TIPO_PASTA[entry.tipo], ...entry.sublocal.split('/'))
    for (const sub of ['plano-teste', 'plano-de-teste', '']) {
      if (entry.planoFile) push(join(base, sub, basename(entry.planoFile.replace(/^testes\//, ''))))
      push(join(base, sub, `${entry.id}.md`))
      push(join(base, sub, `${entry.id}.json`))
      if (entry.planoFile?.endsWith('.md')) {
        push(join(base, sub, basename(entry.planoFile).replace(/^testes\//, '')))
      }
    }
  }

  if (entry.specFile) {
    const specAbs = resolveAbs(entry.specFile) ?? join(ROOT, entry.specFile)
    if (existsSync(specAbs)) {
      const dir = dirname(specAbs)
      const specBase = basename(specAbs, extname(specAbs))
      for (const sub of ['plano-teste', 'plano-de-teste']) {
        push(join(dir, sub, `${entry.id}.md`))
        push(join(dir, sub, `${specBase}.md`))
        push(join(dir, sub, `${specBase.replace(/\.test$/, '')}.md`))
      }
    }
  }

  // Mapeamentos conhecidos (legado)
  const MAP = {
    'TST-UNI-PEDIDO-000001': 'testes-unitarios/produto-gravity/pedido/dashboard/plano-teste/TST-UNI-PEDIDO-000001.md',
    'TST-E2E-PEDIDO-000002': 'testes-e2e/produto-gravity/pedido/dashboard/plano-teste/TST-E2E-PEDIDO-000002.md',
    'TST-UNI-TENANT-000003': 'testes-unitarios/historico/plano-teste/TST-UNI-TENANT-000003.md',
    'TST-UNI-TENANT-000004': 'testes-unitarios/historico/plano-teste/TST-UNI-TENANT-000004.md',
    'TST-UNI-ADMIN-000021': 'testes-unitarios/admin/visao-geral/plano-teste/TST-UNI-ADMIN-000021.md',
    'TST-FUN-ADMIN-000020': 'testes-funcionais/admin/visao-geral/plano-teste/TST-FUN-ADMIN-000020.md',
    'TST-CRO-ADMIN-000022': 'testes-cross-organizacao/admin/visao-geral/plano-teste/TST-CRO-ADMIN-000022.md',
    'TST-UNI-PEDIDO-000029': 'testes-unitarios/produto-gravity/pedido/lista/editar-salvar/plano-teste/editar-salvar-unitario.md',
    'TST-FUN-PEDIDO-000030': 'testes-funcionais/produto-gravity/pedido/Lista/editar-salvar/plano-de-teste/editar-salvar-funcional.md',
    'TST-E2E-PEDIDO-000031': 'testes-e2e/produto-gravity/pedido/Lista/editar-salvar/plano-teste/editar-salvar-e2e.md',
    'TST-UNI-PEDIDO-000032': 'testes-unitarios/produto-gravity/pedido/lista/consolidar/consolidar-unitario.md',
    'TST-FUN-PEDIDO-000033': 'testes-funcionais/produto-gravity/pedido/Lista/consolidar/consolidar-funcional.md',
    'TST-E2E-PEDIDO-000034': 'testes-e2e/produto-gravity/pedido/Lista/consolidar/consolidar-e2e.md',
    'TST-UNI-PEDIDO-000035': 'testes-unitarios/produto-gravity/pedido/lista/transferir/transferir-unitario.md',
    'TST-FUN-PEDIDO-000036': 'testes-funcionais/produto-gravity/pedido/Lista/transferir/transferir-funcional.md',
    'TST-E2E-PEDIDO-000037': 'testes-e2e/produto-gravity/pedido/Lista/transferir/transferir-e2e.md',
    'TST-UNI-LOGIN-000038': 'testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.md',
    'TST-FUN-LOGIN-000039': 'testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.md',
    'TST-E2E-PEDIDO-000044': 'testes-e2e/produto-gravity/pedido/configuracao/status/status-e2e.md',
    'TST-UNI-PEDIDO-000042': 'testes-unitarios/produto-gravity/pedido/configuracoes/status/status-unitario.md',
    'TST-FUN-PEDIDO-000043': 'testes-funcionais/produto-gravity/pedido/configuracoes/status/status-funcional.md',
    'TST-UNI-PEDIDO-000061': 'testes-unitarios/produto-gravity/pedido/painel-lista/painel-lista-unitario.md',
    'TST-FUN-PEDIDO-000062': 'testes-funcionais/produto-gravity/pedido/painel-lista/painel-lista-funcional.md',
    'TST-E2E-PEDIDO-000063': 'testes-e2e/produto-gravity/pedido/painel-lista/painel-lista-e2e.md',
    'TST-UNI-STORE-000064': 'testes-unitarios/gravity-store/plano-teste/TST-UNI-STORE-000064.md',
    'TST-UNI-STORE-000065': 'testes-unitarios/gravity-store/plano-teste/TST-UNI-STORE-000065.md',
    'TST-UNI-STORE-000066': 'testes-unitarios/gravity-store/plano-teste/TST-UNI-STORE-000066.md',
    'TST-UNI-STORE-000067': 'testes-unitarios/gravity-store/plano-teste/TST-UNI-STORE-000067.md',
    'TST-FUN-STORE-000068': 'testes-funcionais/gravity-store/plano-teste/TST-FUN-STORE-000068.md',
    'TST-FUN-STORE-000069': 'testes-funcionais/gravity-store/plano-teste/TST-FUN-STORE-000069.md',
    'TST-E2E-STORE-000070': 'testes-e2e/gravity-store/plano-teste/TST-E2E-STORE-000070.md',
    'TST-CRO-STORE-000071': 'testes-cross-organizacao/gravity-store/plano-teste/TST-CRO-STORE-000071.md',
    'TST-FUN-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000077':
      'testes-funcionais/menu-botoes/seletor-produtos-gravity/plano-de-teste/seletor-produtos-gravity-funcional.md',
    'TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000078':
      'testes-e2e/menu-botoes/seletor-produtos-gravity/plano-de-teste/seletor-produtos-gravity-e2e.md',
    'TST-CRO-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000080':
      'testes-cross-organizacao/menu-botoes/seletor-produtos-gravity/plano-de-teste/seletor-produtos-gravity-cross.md',
    'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045':
      'testes-em-tela/produto-gravity/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md',
    'TST-EMT-EDICAO-EM-MASSA-PEDIDO-LISTA-000081':
      'testes-em-tela/produto-gravity/pedido/lista/edicao-em-massa/plano-de-teste/plano-teste-em-tela.md',
    'TST-EMT-STORE-CATALOGO-VALIDACAO-000072': 'testes-em-tela/gravity-store/PLANO-EM-TELA.md',
  }
  if (MAP[entry.id]) push(join(TESTES, MAP[entry.id]))

  for (let i = 46; i <= 60; i++) {
    if (entry.id !== `TST-UNI-MBOTO-0000${i}` && entry.id !== `TST-FUN-MBOTO-0000${i}` && entry.id !== `TST-E2E-MBOTO-0000${i}`) {
      /* handled per entry.id below */
    }
  }

  if (/^TST-(UNI|FUN|E2E)-MBOTO-0000(46|47|48|49|50|51|52|53|54|55|56|57|58|59|60)$/.test(entry.id)) {
    const tipo = entry.id.match(/^TST-(UNI|FUN|E2E)/)[1]
    const pasta = TIPO_PASTA[tipo]
    const sub =
      entry.id === 'TST-UNI-MBOTO-000048'
        ? 'pedido/plano-teste'
        : 'menu-botoes/seletor-universal-visoes/plano-teste'
    push(join(TESTES, pasta, sub, `${entry.id}.md`))
  }

  for (let n = 73; n <= 76; n++) {
    if (entry.id === `TST-UNI-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-0000${n}`) {
      push(
        join(
          TESTES,
          'testes-unitarios/menu-botoes/seletor-produtos-gravity/plano-teste',
          `${entry.id}.md`,
        ),
      )
    }
  }

  return out
}

function buildMinimalPlano(entry, specContent) {
  const rows = []
  const itRe = /it\s*\(\s*['"`]([^'"`]+)['"`]/g
  let m
  while ((m = itRe.exec(specContent ?? '')) !== null) {
    rows.push({ passo: `C${rows.length + 1}`, acao: m[1], aprovado: 'asserções passam' })
  }
  if (rows.length === 0) {
    rows.push({ passo: entry.id, acao: entry.modulo ?? entry.id, aprovado: 'conforme spec' })
  }
  let md = `# Plano — ${entry.modulo ?? entry.id}\n\n**ID:** ${entry.id}\n\n`
  md += `${NOTA}\n**Objetivo geral:** ${entry.modulo ?? entry.id}\n\n---\n\n## Roteiro de execução\n\n`
  md += `### ETAPA 1 — ${entry.modulo ?? entry.id}\n\n| Passo | Ação | APROVADO quando |\n|-------|------|-----------------|\n`
  for (const r of rows) {
    md += `| **${r.passo}** | ${r.acao.replace(/\|/g, '\\|')} | ${r.aprovado} |\n`
  }
  md += '\n'
  return md
}

const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
let fixed = 0
let created = 0

for (const entry of registry.planos) {
  if (!entry.planoFile && entry.tipo === 'EMT') continue

  const found = candidatosPlano(entry)
  if (found.length > 0) {
    const rel = relTestes(found[0])
    if (entry.planoFile !== rel) {
      entry.planoFile = rel
      fixed++
    }
    continue
  }

  if (!entry.planoFile || !['UNI', 'FUN', 'E2E', 'CRO'].includes(entry.tipo)) continue

  const specAbs = entry.specFile ? resolveAbs(entry.specFile) : null
  const dest = entry.sublocal
    ? join(
        TESTES,
        TIPO_PASTA[entry.tipo],
        ...entry.sublocal.split('/'),
        'plano-teste',
        `${entry.id}.md`,
      )
    : join(TESTES, TIPO_PASTA[entry.tipo], 'plano-teste', `${entry.id}.md`)

  const spec = specAbs && existsSync(specAbs) ? readFileSync(specAbs, 'utf8') : ''
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buildMinimalPlano(entry, spec), 'utf8')
  entry.planoFile = relTestes(dest)
  created++
}

// Corrigir IDs EMT inválidos
const emtMenu = registry.planos.find(p => p.id === 'TST-EMB-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY')
if (emtMenu) {
  emtMenu.id = 'TST-EMT-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000105'
  emtMenu.planoFile = 'testes-em-tela/menu-botoes/seletor-produtos-gravity/plano-de-teste/plano-teste-em-tela.md'
  registry.deletados = (registry.deletados ?? []).filter(
    d => (typeof d === 'string' ? d : d.id) !== 'TST-EMB-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY',
  )
}

const emtExcluir = registry.planos.find(
  p => p.id === 'TST-EMT-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001',
)
if (emtExcluir) {
  emtExcluir.id = 'TST-EMT-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-000106'
  emtExcluir.planoFile =
    'testes-em-tela/produto-gravity/pedido/configuracoes/colunas/personalizadas/plano-de-teste/plano-teste-em-tela.md'
}

// STORE entries sem planoFile
for (const id of ['TST-FUN-STORE-000068', 'TST-FUN-STORE-000069']) {
  const e = registry.planos.find(p => p.id === id)
  if (e && !e.planoFile) {
    e.planoFile = `testes-funcionais/gravity-store/plano-teste/${id}.md`
  }
}

// Novos planos BID Frete Internacional — lista duplicar/excluir
const BID_NOVOS = [
  {
    id: 'TST-UNI-BIDFRT-000101',
    tipo: 'UNI',
    escopo: 'BIDFRT',
    sublocal: 'lista',
    modulo: 'motivoBloqueioExclusaoCotacao',
    specFile: 'testes-unitarios/produto-gravity/bid-frete-internacional/lista/exclusao-regra-bloqueio-bid-frete-internacional.test.ts',
    planoFile: 'testes-unitarios/produto-gravity/bid-frete-internacional/lista/plano-teste/TST-UNI-BIDFRT-000101.md',
    componenteFile:
      'servicos-global/produto/bid-frete-internacional/server/src/routes/exclusoes-bid-frete-internacional.ts',
  },
  {
    id: 'TST-FUN-BIDFRT-000102',
    tipo: 'FUN',
    escopo: 'BIDFRT',
    sublocal: 'lista',
    modulo: 'duplicacoes e exclusoes em lote (rotas)',
    specFile: 'testes-funcionais/produto-gravity/bid-frete-internacional/lista/duplicacoes-exclusoes-routes.test.ts',
    planoFile: 'testes-funcionais/produto-gravity/bid-frete-internacional/lista/plano-teste/TST-FUN-BIDFRT-000102.md',
    componenteFile:
      'servicos-global/produto/bid-frete-internacional/server/src/routes/exclusoes-bid-frete-internacional.ts',
  },
  {
    id: 'TST-E2E-BIDFRT-000103',
    tipo: 'E2E',
    escopo: 'BIDFRT',
    sublocal: 'lista',
    modulo: 'modal excluir lista com preview',
    specFile: 'testes-e2e/produto-gravity/bid-frete-internacional/lista/TST-E2E-BIDFRT-000103.spec.ts',
    planoFile: 'testes-e2e/produto-gravity/bid-frete-internacional/lista/plano-teste/TST-E2E-BIDFRT-000103.md',
    componenteFile:
      'servicos-global/produto/bid-frete-internacional/client/src/pages/modal-excluir-lista-bid-frete-internacional.tsx',
  },
  {
    id: 'TST-CRO-BIDFRT-000104',
    tipo: 'CRO',
    escopo: 'BIDFRT',
    sublocal: 'lista',
    modulo: 'isolamento exclusao cross-org',
    specFile: 'testes-cross-organizacao/produto-gravity/bid-frete-internacional/lista/TST-CRO-BIDFRT-000104.test.ts',
    planoFile: 'testes-cross-organizacao/produto-gravity/bid-frete-internacional/lista/plano-teste/TST-CRO-BIDFRT-000104.md',
    componenteFile:
      'servicos-global/produto/bid-frete-internacional/server/src/routes/exclusoes-bid-frete-internacional.ts',
  },
]

for (const novo of BID_NOVOS) {
  if (registry.planos.some(p => p.id === novo.id)) continue
  registry.planos.push({
    ...novo,
    criticidade: 'alta',
    status: 'aprovado',
    criadoEm: new Date().toISOString(),
    ultimaExecucao: null,
    ultimoResultado: null,
  })
}

// Renomear MBOTO 000006 → 000107 (sufixo global único)
const mboto6Path = join(
  TESTES,
  'testes-unitarios/menu-botoes/seletor-universal-visoes/TST-UNI-MBOTO-000006.test.ts',
)
if (existsSync(mboto6Path) && !registry.planos.some(p => p.id === 'TST-UNI-MBOTO-000107')) {
  const content = readFileSync(mboto6Path, 'utf8').replace(/000006/g, '000107')
  const newPath = mboto6Path.replace('000006', '000107')
  writeFileSync(newPath, content, 'utf8')
  registry.planos.push({
    id: 'TST-UNI-MBOTO-000107',
    tipo: 'UNI',
    escopo: 'MBOTO',
    sublocal: 'menu-botoes/seletor-universal-visoes',
    modulo: 'SLA 1s helper',
    planoFile:
      'testes-unitarios/menu-botoes/seletor-universal-visoes/plano-teste/TST-UNI-MBOTO-000107.md',
    specFile:
      'testes-unitarios/menu-botoes/seletor-universal-visoes/TST-UNI-MBOTO-000107.test.ts',
    componenteFile: 'testes/testes-e2e/menu-botoes/seletor-universal-visoes/helpers/sla-1s-core.ts',
    criticidade: 'media',
    status: 'aprovado',
    criadoEm: new Date().toISOString(),
    ultimaExecucao: null,
    ultimoResultado: null,
  })
}

registry.atualizadoEm = new Date().toISOString()
writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
console.log({ fixed, created })
