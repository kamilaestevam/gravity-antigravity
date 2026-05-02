#!/usr/bin/env node
// Gera 4 CSVs: mapa-paginas (limpo), mapa-modais, mapa-nucleo-global, mapa-componentes-locais
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/danie/gravity-antigravity'

const scanRoots = [
  { local: 'Configurador', produto: 'Configurador', root: 'servicos-global/configurador/src' },
  { local: 'Marketplace', produto: 'marketplace', root: 'servicos-global/marketplace/src' },
  { local: 'Shell', produto: 'shell', root: 'servicos-global/shell' },
  { local: 'Tenant', produto: 'agendamento', root: 'servicos-global/tenant/agendamento/src' },
  { local: 'Tenant', produto: 'api-cockpit', root: 'servicos-global/tenant/api-cockpit/src' },
  { local: 'Tenant', produto: 'atividades', root: 'servicos-global/tenant/atividades/src' },
  { local: 'Tenant', produto: 'cadastros', root: 'servicos-global/tenant/cadastros/src' },
  { local: 'Tenant', produto: 'conector-erp', root: 'servicos-global/tenant/conector-erp/src' },
  { local: 'Tenant', produto: 'cronometro', root: 'servicos-global/tenant/cronometro/src' },
  { local: 'Tenant', produto: 'dashboard', root: 'servicos-global/tenant/dashboard/src' },
  { local: 'Tenant', produto: 'email', root: 'servicos-global/tenant/email/src' },
  { local: 'Tenant', produto: 'gabi', root: 'servicos-global/tenant/gabi/src' },
  { local: 'Tenant', produto: 'historico-global', root: 'servicos-global/tenant/historico-global/src' },
  { local: 'Tenant', produto: 'ncm-sync', root: 'servicos-global/tenant/ncm-sync/src' },
  { local: 'Tenant', produto: 'notificacoes', root: 'servicos-global/tenant/notificacoes/src' },
  { local: 'Tenant', produto: 'preferencias-usuario', root: 'servicos-global/tenant/preferencias-usuario/src' },
  { local: 'Tenant', produto: 'relatorios', root: 'servicos-global/tenant/relatorios/src' },
  { local: 'Tenant', produto: 'whatsapp', root: 'servicos-global/tenant/whatsapp/src' },
  { local: 'Produto', produto: 'bid-cambio', root: 'servicos-global/produto/bid-cambio/client/src' },
  { local: 'Produto', produto: 'bid-frete', root: 'servicos-global/produto/bid-frete/client/src' },
  { local: 'Produto', produto: 'financeiro-comex', root: 'servicos-global/produto/financeiro-comex/client/src' },
  { local: 'Produto', produto: 'lpco', root: 'servicos-global/produto/lpco/client/src' },
  { local: 'Produto', produto: 'nf-importacao', root: 'servicos-global/produto/nf-importacao/client/src' },
  { local: 'Produto', produto: 'pedido', root: 'servicos-global/produto/pedido/client/src' },
  { local: 'Produto', produto: 'processo', root: 'servicos-global/produto/processo/client/src' },
  { local: 'Produto', produto: 'simula-custo', root: 'servicos-global/produto/simula-custo/client/src' },
]

// ═════════════════════════════════════════════════════════════════
// Util
// ═════════════════════════════════════════════════════════════════

function csvEscape(v) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes(';')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules','dist','generated','build','.turbo','.next'].includes(entry.name)) continue
    const full = path.join(dir, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function extractComponentName(text, fallback) {
  const m = text.match(/export\s+default\s+function\s+(\w+)/)
  if (m) return m[1]
  const m4 = text.match(/export\s+default\s+(\w+)/)
  if (m4) return m4[1]
  const m3 = text.match(/(?:const|function)\s+(\w+)\s*[:=(]/)
  if (m3) return m3[1]
  return fallback
}

function extractTitle(text) {
  const ph = text.match(/<PageHeader[^>]*title=\{?['"`]([^'"`]+)['"`]/)
  if (ph) return ph[1]
  const h1 = text.match(/<h1[^>]*>\s*([^<{]+?)\s*</)
  if (h1) return h1[1].trim()
  return ''
}

function extractApiRoutes(text) {
  const routes = new Set()
  const patterns = [
    /['"`](\/api\/(?:v\d+|internal|admin)\/[^'"`?\s]+)/g,
    /apiClient\s*\.\s*(?:get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)/g,
  ]
  for (const p of patterns) {
    let m
    while ((m = p.exec(text)) !== null) {
      if (/^\/(api|v\d+)\//.test(m[1])) routes.add(m[1])
    }
  }
  return [...routes].slice(0, 8).join(' | ')
}

function extractModalsOpened(text) {
  const modals = new Set()
  const re = /<(\w+(?:Modal|Drawer|Dialog|Popover|Sheet))\b/g
  let m
  while ((m = re.exec(text)) !== null) modals.add(m[1])
  return [...modals].slice(0, 6).join(' | ')
}

function inferArea(filePath) {
  if (/\/admin\//i.test(filePath)) return 'Admin'
  if (/\/marketplace\//i.test(filePath)) return 'Marketing'
  if (/\/shell\//i.test(filePath)) return 'Shell'
  if (/\/configurador\//i.test(filePath)) return 'Configurador'
  if (/\/produto\//i.test(filePath)) return 'Produto'
  if (/\/tenant\//i.test(filePath)) return 'Tenant'
  if (/\/nucleo-global\//i.test(filePath)) return 'Design System'
  return ''
}

function inferViewType(compName, text) {
  if (/kanban/i.test(compName)) return 'Kanban'
  if (/dashboard|painel/i.test(compName)) return 'Dashboard'
  if (/lista|list|tabela|grid/i.test(compName)) return 'Lista'
  if (/detalhe|detail|visualizar/i.test(compName)) return 'Detalhe'
  if (/form|novo|nova|criar|editar/i.test(compName)) return 'Formulario'
  if (/config|setting|preferenc/i.test(compName)) return 'Configuração'
  if (/login|auth|onboarding/i.test(compName)) return 'Autenticação'
  if (/<Kanban/.test(text)) return 'Kanban'
  if (/<DataTable|<Tabela/.test(text)) return 'Lista'
  return ''
}

function inferAuth(text, filePath) {
  if (/\/marketplace\//.test(filePath)) return 'Publica'
  if (/PrivateRoute|RequireAuth|useAuth|useClerk/.test(text)) return 'Logado'
  return ''
}

function getFileType(filePath, compName, text) {
  const base = path.basename(filePath).replace(/\.tsx$/, '')
  // Overlays
  if (/^Modal/i.test(base)) return 'Modal'
  if (/Modal$/i.test(base)) return 'Modal'
  if (/Drawer/i.test(base)) return 'Drawer'
  if (/Popover/i.test(base)) return 'Popover'
  if (/Dialog/i.test(base)) return 'Dialog'
  // Layouts
  if (/Layout$/i.test(base) && !/ExportLayout/.test(base)) return 'Layout'
  // Harness / tests
  if (/Harness$|\.test\.$|\.spec\.$/.test(base)) return 'TestHarness'
  // Page / Component
  if (/\/pages\//.test(filePath)) return 'Pagina'
  if (/\/nucleo-global\//.test(filePath)) return 'ComponenteDSL'
  if (/\/components\//.test(filePath)) return 'ComponenteLocal'
  if (/\/widgets\//.test(filePath)) return 'Widget'
  return 'Outro'
}

function extractProps(text) {
  // Count distinct prop names in props interface/type
  const m = text.match(/(?:interface|type)\s+\w*Props\s*(?:=\s*)?\{([\s\S]*?)\n\}/)
  if (!m) return 0
  const propLines = m[1].split('\n').map(l=>l.trim()).filter(l => /^\w+[?:]/.test(l))
  return propLines.length
}

function extractDSLCategory(filePath) {
  // Infer from nucleo-global folder structure
  const m = filePath.match(/\/nucleo-global\/([^/]+)\//)
  if (m) return m[1]
  return ''
}

function extractOnSaveCancel(text) {
  const actions = []
  if (/onSave|handleSave|handleSubmit|onSubmit/.test(text)) actions.push('salvar')
  if (/onCancel|handleCancel|onClose|handleClose/.test(text)) actions.push('cancelar')
  if (/onDelete|handleDelete|onExclude/.test(text)) actions.push('excluir')
  if (/onConfirm|handleConfirm/.test(text)) actions.push('confirmar')
  return actions.join('+')
}

function extractRoutesFromApp(text) {
  const routes = {}
  const re = /<Route\s+[^>]*path=\{?['"`]([^'"`]+)['"`]\}?[^>]*element=\{\s*<(\w+)/g
  let m
  while ((m = re.exec(text)) !== null) {
    routes[m[2]] = m[1]
  }
  const re2 = /<Route\s+[^>]*path=\{?['"`]([^'"`]+)['"`]\}?[\s\S]*?element=\{[\s\S]*?<(\w+)/g
  let m2
  while ((m2 = re2.exec(text)) !== null) {
    if (!routes[m2[2]]) routes[m2[2]] = m2[1]
  }
  return routes
}

// ═════════════════════════════════════════════════════════════════
// Walk + classify all
// ═════════════════════════════════════════════════════════════════

// Also scan nucleo-global
const allRoots = [
  ...scanRoots,
  { local: 'Nucleo Global', produto: 'nucleo-global', root: 'nucleo-global' },
]

// Build usage index for DSL components (which pages/produtos use each DSL component)
const dslUsage = {}  // compName -> Set of produtos

// First pass — collect all files
const fileIndex = []
for (const src of allRoots) {
  const base = path.join(ROOT, src.root).replace(/\\/g, '/')
  const files = walk(base)

  // Build route map by reading App/Routes files
  const appFiles = files.filter(f => /\/(App|Routes|routes?)\.(tsx|jsx)$/i.test(f))
  const routeMap = {}
  for (const af of appFiles) {
    try {
      const txt = fs.readFileSync(af, 'utf8')
      Object.assign(routeMap, extractRoutesFromApp(txt))
    } catch {}
  }

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8')
    const fname = path.basename(f)
    const compName = extractComponentName(text, fname.replace(/\.(tsx|jsx)$/, ''))
    const fileType = getFileType(f, compName, text)
    fileIndex.push({ src, f, text, fname, compName, fileType, routeMap })
  }
}

// Second pass — build DSL usage index
for (const item of fileIndex) {
  if (item.src.produto === 'nucleo-global') continue
  // find imports from '@nucleo/' or similar
  const imports = [...item.text.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"](@nucleo|@gravity\/nucleo|nucleo-global)[^'"]*['"]/g)]
  for (const imp of imports) {
    const names = imp[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)
    for (const n of names) {
      if (!dslUsage[n]) dslUsage[n] = new Set()
      dslUsage[n].add(item.src.produto)
    }
  }
}

// Also build "which pages open which modals"
const modalOpenedBy = {}  // modalName -> Set(pageFile)
for (const item of fileIndex) {
  if (item.fileType !== 'Pagina' && item.fileType !== 'Layout') continue
  const re = /<(\w+(?:Modal|Drawer|Dialog|Popover|Sheet))\b/g
  let m
  while ((m = re.exec(item.text)) !== null) {
    if (!modalOpenedBy[m[1]]) modalOpenedBy[m[1]] = new Set()
    modalOpenedBy[m[1]].add(item.fname)
  }
}

// ═════════════════════════════════════════════════════════════════
// Generate: mapa-paginas (only real pages)
// ═════════════════════════════════════════════════════════════════

const PAGE_COLS = [
  'Local','URL rota - Atual','URL rota - DDD','Titulo exibido - Atual','Titulo exibido - DDD',
  'Nome do arquivo','Nome do arquivo - DDD','Nome do componente','Nome do componente - DDD',
  'Produto Gravity','Area','Tipo de view','Breadcrumb','Autenticacao','Patente minima',
  'Rotas de API consumidas','Models lidos (heuristico)','Modais/Drawers abertos',
  'E mobile-ready?','Arquivo','Status DDD','Observacoes',
]

const pageRows = [PAGE_COLS.join(',')]
let pageCount = 0
for (const item of fileIndex) {
  if (item.fileType !== 'Pagina') continue
  const { src, f, text, fname, compName, routeMap } = item
  const rel = f.replace(ROOT + '/', '')
  const url = routeMap[compName] || ''
  const title = extractTitle(text)
  const area = inferArea(rel)
  const view = inferViewType(compName, text)
  const auth = inferAuth(text, rel)
  const apiRoutes = extractApiRoutes(text)
  const modals = extractModalsOpened(text)
  pageCount++
  pageRows.push([
    src.local, url, '', title, '',
    fname, '', compName, '',
    src.produto, area, view, '', auth, '',
    apiRoutes, '', modals, '', rel, '', '',
  ].map(csvEscape).join(','))
}
fs.writeFileSync(path.join(ROOT, 'documentos-tecnicos/mapa-paginas.csv'), pageRows.join('\n')+'\n', 'utf8')

// ═════════════════════════════════════════════════════════════════
// Generate: mapa-modais
// ═════════════════════════════════════════════════════════════════

const MODAL_COLS = [
  'Local','Nome do arquivo','Nome do arquivo - DDD','Nome do componente','Nome do componente - DDD',
  'Produto Gravity','Tipo','Paginas que abrem',
  'Acoes','Rotas de API consumidas','Models lidos (heuristico)','Patente minima',
  'Arquivo','Status DDD','Observacoes',
]

const modalRows = [MODAL_COLS.join(',')]
let modalCount = 0
for (const item of fileIndex) {
  if (!['Modal','Drawer','Popover','Dialog'].includes(item.fileType)) continue
  const { src, f, text, fname, compName, fileType } = item
  const rel = f.replace(ROOT + '/', '')
  const apiRoutes = extractApiRoutes(text)
  const actions = extractOnSaveCancel(text)
  const openedBy = [...(modalOpenedBy[compName] || [])].slice(0, 5).join(' | ')
  modalCount++
  modalRows.push([
    src.local, fname, '', compName, '',
    src.produto, fileType, openedBy,
    actions, apiRoutes, '', '',
    rel, '', '',
  ].map(csvEscape).join(','))
}
fs.writeFileSync(path.join(ROOT, 'documentos-tecnicos/mapa-modais.csv'), modalRows.join('\n')+'\n', 'utf8')

// ═════════════════════════════════════════════════════════════════
// Generate: mapa-nucleo-global
// ═════════════════════════════════════════════════════════════════

const DSL_COLS = [
  'Nome do componente','Nome do componente - DDD','Categoria (pasta)',
  'Qtd props detectados','Tipo (Modal/Form/Display/...)','Usado por (produtos/servicos)',
  'Qtd usos','Arquivo','Status DDD','Observacoes',
]

const dslRows = [DSL_COLS.join(',')]
let dslCount = 0
for (const item of fileIndex) {
  if (item.src.produto !== 'nucleo-global') continue
  const { f, text, fname, compName, fileType } = item
  const rel = f.replace(ROOT + '/', '')
  const category = extractDSLCategory(rel)
  const props = extractProps(text)
  const usedBy = [...(dslUsage[compName] || [])]
  dslCount++
  dslRows.push([
    compName, '', category,
    props, fileType, usedBy.join(' | '),
    usedBy.length, rel, '', '',
  ].map(csvEscape).join(','))
}
fs.writeFileSync(path.join(ROOT, 'documentos-tecnicos/mapa-nucleo-global.csv'), dslRows.join('\n')+'\n', 'utf8')

// ═════════════════════════════════════════════════════════════════
// Generate: mapa-componentes-locais
// ═════════════════════════════════════════════════════════════════

const LOCAL_COLS = [
  'Local','Nome do arquivo','Nome do arquivo - DDD','Nome do componente','Nome do componente - DDD',
  'Produto Gravity','Pasta','Qtd props detectados',
  'Rotas de API consumidas','Models lidos (heuristico)','Usado por (paginas)',
  'Arquivo','Status DDD','Observacoes',
]

// Also build "which pages/modals use each local component"
const localUsage = {}
const localComps = fileIndex.filter(x => x.fileType === 'ComponenteLocal' || x.fileType === 'Widget' || x.fileType === 'Layout' || x.fileType === 'TestHarness')
for (const item of fileIndex) {
  if (item.fileType !== 'Pagina' && item.fileType !== 'Modal') continue
  for (const lc of localComps) {
    const re = new RegExp('<' + lc.compName + '\\b')
    if (re.test(item.text)) {
      if (!localUsage[lc.compName]) localUsage[lc.compName] = new Set()
      localUsage[lc.compName].add(item.fname)
    }
  }
}

const localRows = [LOCAL_COLS.join(',')]
let localCount = 0
for (const item of localComps) {
  const { src, f, text, fname, compName, fileType } = item
  const rel = f.replace(ROOT + '/', '')
  const pasta = rel.includes('/components/') ? 'components' :
                rel.includes('/widgets/') ? 'widgets' :
                rel.includes('Layout') ? 'layout' : 'outro'
  const props = extractProps(text)
  const apiRoutes = extractApiRoutes(text)
  const usedBy = [...(localUsage[compName] || [])].slice(0, 5).join(' | ')
  localCount++
  localRows.push([
    src.local, fname, '', compName, '',
    src.produto, pasta, props,
    apiRoutes, '', usedBy,
    rel, fileType === 'TestHarness' ? 'Revisar — harness de teste' : '', '',
  ].map(csvEscape).join(','))
}
fs.writeFileSync(path.join(ROOT, 'documentos-tecnicos/mapa-componentes-locais.csv'), localRows.join('\n')+'\n', 'utf8')

console.log(`
✅ Gerados 4 CSVs:
   mapa-paginas.csv:             ${pageCount} páginas
   mapa-modais.csv:               ${modalCount} modais/drawers/popovers
   mapa-nucleo-global.csv:        ${dslCount} componentes do design system
   mapa-componentes-locais.csv:   ${localCount} componentes locais + layouts + widgets
   ─────────────────────────
   TOTAL:                         ${pageCount+modalCount+dslCount+localCount} arquivos .tsx mapeados
`)
