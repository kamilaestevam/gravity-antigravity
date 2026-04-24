#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/danie/gravity-antigravity'

const scanRoots = [
  { local: 'Configurador', produto: 'Configurador', root: 'servicos-global/configurador/src' },
  { local: 'Marketplace', produto: 'marketplace', root: 'servicos-global/marketplace/src' },
  { local: 'Shell', produto: 'shell', root: 'servicos-global/shell/src' },
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
  { local: 'Produto', produto: 'bid-cambio', root: 'produto/bid-cambio/client/src' },
  { local: 'Produto', produto: 'bid-frete', root: 'produto/bid-frete/client/src' },
  { local: 'Produto', produto: 'financeiro-comex', root: 'produto/financeiro-comex/client/src' },
  { local: 'Produto', produto: 'lpco', root: 'produto/lpco/client/src' },
  { local: 'Produto', produto: 'nf-importacao', root: 'produto/nf-importacao/client/src' },
  { local: 'Produto', produto: 'pedido', root: 'produto/pedido/client/src' },
  { local: 'Produto', produto: 'processo', root: 'produto/processo/client/src' },
  { local: 'Produto', produto: 'simula-custo', root: 'produto/simula-custo/client/src' },
]

const columns = [
  'Local',
  'URL rota - Atual',
  'URL rota - DDD',
  'Titulo exibido - Atual',
  'Titulo exibido - DDD',
  'Nome do arquivo',
  'Nome do arquivo - DDD',
  'Nome do componente',
  'Nome do componente - DDD',
  'Produto Gravity',
  'Area',
  'Tipo de view',
  'Breadcrumb',
  'Autenticacao',
  'Patente minima',
  'Rotas de API consumidas',
  'Models lidos (heuristico)',
  'Modais/Drawers abertos',
  'E mobile-ready?',
  'Arquivo',
  'Status DDD',
  'Observacoes',
]

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
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'generated' || entry.name === 'build') continue
    const full = path.join(dir, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function extractRoutesFromApp(text) {
  // Returns map: ComponentName -> path
  const routes = {}
  const re = /<Route\s+[^>]*path=\{?['"`]([^'"`]+)['"`]\}?[^>]*element=\{\s*<(\w+)/g
  let m
  while ((m = re.exec(text)) !== null) {
    routes[m[2]] = m[1]
  }
  // Alt syntax: element={<Comp />}
  const re2 = /<Route\s+[^>]*path=\{?['"`]([^'"`]+)['"`]\}?[\s\S]*?element=\{[\s\S]*?<(\w+)/g
  let m2
  while ((m2 = re2.exec(text)) !== null) {
    if (!routes[m2[2]]) routes[m2[2]] = m2[1]
  }
  return routes
}

function extractComponentName(text, fallback) {
  const m = text.match(/export\s+default\s+function\s+(\w+)/)
  if (m) return m[1]
  const m2 = text.match(/function\s+(\w+)[^{]*\{[\s\S]*?export\s+default\s+\1/)
  if (m2) return m2[1]
  const m3 = text.match(/const\s+(\w+)\s*[:=][\s\S]*?export\s+default\s+\1/)
  if (m3) return m3[1]
  const m4 = text.match(/export\s+default\s+(\w+)/)
  if (m4) return m4[1]
  return fallback
}

function extractTitle(text) {
  // Look for PageHeader title= or first <h1>
  const ph = text.match(/<PageHeader[^>]*title=\{?['"`]([^'"`]+)['"`]/)
  if (ph) return ph[1]
  const h1 = text.match(/<h1[^>]*>\s*([^<{]+?)\s*</)
  if (h1) return h1[1].trim()
  const ttl = text.match(/<title>\s*([^<{]+?)\s*</)
  if (ttl) return ttl[1].trim()
  return ''
}

function extractApiRoutes(text) {
  const routes = new Set()
  const patterns = [
    /['"`](\/api\/(?:v\d+|internal|admin)\/[^'"`?\s]+)/g,
    /apiClient\s*\.\s*(?:get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)/g,
    /fetch\s*\(\s*['"`]([^'"`]+)/g,
  ]
  for (const p of patterns) {
    let m
    while ((m = p.exec(text)) !== null) {
      if (/^\/api\//.test(m[1]) || /^\/v\d+\//.test(m[1])) routes.add(m[1])
    }
  }
  return [...routes].slice(0, 10).join(' | ')
}

function extractModalsOpened(text) {
  const modals = new Set()
  // Match JSX components ending in Modal / Drawer / Dialog / Popover
  const re = /<(\w+(?:Modal|Drawer|Dialog|Popover))\b/g
  let m
  while ((m = re.exec(text)) !== null) modals.add(m[1])
  return [...modals].slice(0, 8).join(' | ')
}

function extractModels(text) {
  // Heuristic: Zod schema names referenced, or TS interfaces with capitalized domain-like names
  const names = new Set()
  const patterns = [
    /import\s+type\s*\{\s*([^}]+)\s*\}\s*from/g,
    /(\w+Schema)\s*\.\s*parse/g,
  ]
  for (const p of patterns) {
    let m
    while ((m = p.exec(text)) !== null) {
      m[1].split(',').map(s=>s.trim()).forEach(n => {
        if (/^[A-Z]\w+$/.test(n) && !/^(React|FC|Props|Type|Route)/.test(n)) names.add(n)
      })
    }
  }
  return [...names].slice(0, 6).join(' | ')
}

function inferArea(filePath) {
  if (/\/admin\//i.test(filePath)) return 'Admin'
  if (/\/marketplace\//i.test(filePath)) return 'Marketing'
  if (/\/shell\//i.test(filePath)) return 'Shell'
  if (/\/configurador\//i.test(filePath)) return 'Configurador'
  if (/\/produto\//i.test(filePath)) return 'Produto'
  if (/\/tenant\//i.test(filePath)) return 'Tenant'
  return ''
}

function inferViewType(compName, text) {
  const lc = compName.toLowerCase()
  if (/kanban/i.test(lc)) return 'Kanban'
  if (/dashboard|painel/i.test(lc)) return 'Dashboard'
  if (/lista|list|tabela|grid/i.test(lc)) return 'Lista'
  if (/detalhe|detail|visualizar/i.test(lc)) return 'Detalhe'
  if (/form|novo|criar|editar/i.test(lc)) return 'Formulario'
  if (/config|setting|preferenc/i.test(lc)) return 'Configuração'
  if (/login|auth|onboarding/i.test(lc)) return 'Autenticação'
  if (/<Kanban/.test(text)) return 'Kanban'
  if (/<DataTable|<Table|<Tabela/.test(text)) return 'Lista'
  return ''
}

function inferAuth(text, filePath) {
  if (/\/marketplace\//.test(filePath)) return 'Publica'
  if (/PrivateRoute|RequireAuth|useAuth|useClerk/.test(text)) return 'Logado'
  if (/PublicRoute/.test(text)) return 'Publica'
  return ''
}

const rows = [columns.join(',')]
let total = 0

for (const src of scanRoots) {
  const base = path.join(ROOT, src.root).replace(/\\/g, '/')
  const files = walk(base)
  if (files.length === 0) continue

  // Find App.tsx / routes files to map component -> path
  const appFiles = files.filter(f => /(App|Routes|routes?)\.(tsx|jsx)$/i.test(f))
  const routeMap = {}
  for (const af of appFiles) {
    try {
      const txt = fs.readFileSync(af, 'utf8')
      Object.assign(routeMap, extractRoutesFromApp(txt))
    } catch {}
  }

  // Only page-like files
  const pageFiles = files.filter(f => /\/pages\//.test(f) || /\/routes\//.test(f) || /(Page|Screen)\.(tsx|jsx)$/.test(f))
  for (const f of pageFiles) {
    const text = fs.readFileSync(f, 'utf8')
    const fname = path.basename(f)
    const compName = extractComponentName(text, fname.replace(/\.(tsx|jsx)$/, ''))
    const relPath = f.replace(ROOT + '/', '')
    const url = routeMap[compName] || ''
    const title = extractTitle(text)
    const area = inferArea(relPath)
    const view = inferViewType(compName, text)
    const auth = inferAuth(text, relPath)
    const apiRoutes = extractApiRoutes(text)
    const modals = extractModalsOpened(text)
    const models = extractModels(text)

    total++
    const row = [
      src.local,
      url,
      '', // URL DDD
      title,
      '', // Titulo DDD
      fname,
      '', // arquivo DDD
      compName,
      '', // comp DDD
      src.produto,
      area,
      view,
      '', // breadcrumb
      auth,
      '', // patente
      apiRoutes,
      models,
      modals,
      '', // mobile
      relPath,
      '', // status DDD
      '', // obs
    ]
    rows.push(row.map(csvEscape).join(','))
  }
}

const out = path.join(ROOT, 'documentos-tecnicos/mapa-paginas.csv').replace(/\\/g, '/')
fs.writeFileSync(out, rows.join('\n') + '\n', 'utf8')
console.log(`Wrote ${total} pages to ${out}`)
