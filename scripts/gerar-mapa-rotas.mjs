#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/danie/gravity-antigravity'

const serviceRoots = [
  { local: 'Configurador', produto: 'Configurador', root: 'servicos-global/configurador/server' },
  { local: 'Tenant', produto: 'agendamento', root: 'servicos-global/tenant/agendamento/server' },
  { local: 'Tenant', produto: 'api-cockpit', root: 'servicos-global/tenant/api-cockpit/server' },
  { local: 'Tenant', produto: 'atividades', root: 'servicos-global/tenant/atividades/server' },
  { local: 'Tenant', produto: 'cadastros', root: 'servicos-global/tenant/cadastros/server' },
  { local: 'Tenant', produto: 'conector-erp', root: 'servicos-global/tenant/conector-erp/server' },
  { local: 'Tenant', produto: 'configurador (tenant)', root: 'servicos-global/tenant/configurador/server' },
  { local: 'Tenant', produto: 'cronometro', root: 'servicos-global/tenant/cronometro/server' },
  { local: 'Tenant', produto: 'dashboard', root: 'servicos-global/tenant/dashboard/server' },
  { local: 'Tenant', produto: 'email', root: 'servicos-global/tenant/email/server' },
  { local: 'Tenant', produto: 'gabi', root: 'servicos-global/tenant/gabi/server' },
  { local: 'Tenant', produto: 'ncm-sync', root: 'servicos-global/tenant/ncm-sync/server' },
  { local: 'Tenant', produto: 'notificacoes', root: 'servicos-global/tenant/notificacoes/server' },
  { local: 'Tenant', produto: 'preferencias-usuario', root: 'servicos-global/tenant/preferencias-usuario/server' },
  { local: 'Tenant', produto: 'processos-core', root: 'servicos-global/tenant/processos-core' },
  { local: 'Tenant', produto: 'relatorios', root: 'servicos-global/tenant/relatorios/server' },
  { local: 'Tenant', produto: 'whatsapp', root: 'servicos-global/tenant/whatsapp/server' },
  { local: 'Produto', produto: 'bid-cambio', root: 'servicos-global/produto/bid-cambio/server' },
  { local: 'Produto', produto: 'bid-frete', root: 'servicos-global/produto/bid-frete/server' },
  { local: 'Produto', produto: 'financeiro-comex', root: 'servicos-global/produto/financeiro-comex/server' },
  { local: 'Produto', produto: 'lpco', root: 'servicos-global/produto/lpco/server' },
  { local: 'Produto', produto: 'nf-importacao', root: 'servicos-global/produto/nf-importacao/server' },
  { local: 'Produto', produto: 'pedido', root: 'servicos-global/produto/pedido/server' },
  { local: 'Produto', produto: 'processo', root: 'servicos-global/produto/processo/server' },
  { local: 'Produto', produto: 'simula-custo', root: 'servicos-global/produto/simula-custo/server' },
]

const columns = [
  'Metodo',
  'Rota Completa (Atual)',
  'Rota Completa - DDD',
  'Prefixo Mount',
  'Path no arquivo',
  'Local',
  'Produto / Servico',
  'Arquivo da rota',
  'Variavel Router',
  'Middleware detectado',
  'Request Schema (Zod)',
  'Response Schema',
  'Model Prisma principal',
  'Entidade retornada',
  'Consumidor',
  'Descricao',
  'Conforme DDD?',
  'Patente minima',
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
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'generated') continue
    const full = path.join(dir, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.isFile() && /\.(ts|mts|cts)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function extractMounts(allFiles) {
  // map routerVarName -> mount prefix
  const mounts = {}
  const re = /\b(?:app|router)\s*\.\s*use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)\s*\)/g
  for (const f of allFiles) {
    const text = fs.readFileSync(f, 'utf8')
    let m
    while ((m = re.exec(text)) !== null) {
      mounts[m[2]] = m[1]
    }
  }
  return mounts
}

function extractRoutes(text, filePath) {
  const results = []
  // pattern: xxxRouter.get('/path', ...)
  const re = /\b(\w+)\s*\.\s*(get|post|put|patch|delete|all|options|head)\s*\(\s*['"`]([^'"`]*)['"`]/g
  let m
  while ((m = re.exec(text)) !== null) {
    if (['app','express','server'].includes(m[1])) continue
    // find nearby middleware mentions & schema parse within ~40 lines after the match
    const tail = text.slice(m.index, m.index + 2000)
    const mw = []
    if (/withTenantIsolation|withTenant\(/.test(tail)) mw.push('tenant')
    if (/requireAuth|ClerkExpressRequireAuth|authMiddleware/.test(tail)) mw.push('auth')
    if (/requireInternalKey|x-internal-key/i.test(tail)) mw.push('s2s')
    if (/requireAdmin|gravity_admin/.test(tail)) mw.push('admin')
    const zodMatch = tail.match(/(\w+Schema)\s*\.\s*parse\s*\(/)
    const prismaMatch = tail.match(/(?:prisma|db)\s*\.\s*(\w+)\s*\.\s*(findMany|findFirst|findUnique|create|update|delete|upsert|count|aggregate)/)
    results.push({
      routerVar: m[1],
      method: m[2].toUpperCase(),
      path: m[3] || '/',
      middleware: mw.join('+'),
      requestSchema: zodMatch ? zodMatch[1] : '',
      modelPrisma: prismaMatch ? prismaMatch[1] : '',
    })
  }
  return results
}

const rows = [columns.join(',')]
let total = 0

for (const svc of serviceRoots) {
  const base = path.join(ROOT, svc.root).replace(/\\/g, '/')
  const files = walk(base)
  if (files.length === 0) continue
  const mounts = extractMounts(files)

  // Only route files (inside routes folder)
  const routeFiles = files.filter(f => /\/routes\//.test(f))
  for (const f of routeFiles) {
    const text = fs.readFileSync(f, 'utf8')
    const routes = extractRoutes(text, f)
    const rel = f.replace(ROOT + '/', '')
    for (const r of routes) {
      const prefix = mounts[r.routerVar] || ''
      const fullPath = (prefix + r.path).replace(/\/+/g, '/').replace(/\/$/, '') || '/'
      total++
      const row = [
        r.method,
        fullPath,
        '', // DDD
        prefix,
        r.path,
        svc.local,
        svc.produto,
        rel,
        r.routerVar,
        r.middleware,
        r.requestSchema,
        '', // response schema
        r.modelPrisma,
        '', // entidade
        '', // consumidor
        '', // descricao
        '', // conforme DDD
        '', // patente
        '', // status DDD
        '', // observacoes
      ]
      rows.push(row.map(csvEscape).join(','))
    }
  }
}

const out = path.join(ROOT, 'documentos-tecnicos/mapa-rotas.csv').replace(/\\/g, '/')
fs.writeFileSync(out, rows.join('\n') + '\n', 'utf8')
console.log(`Wrote ${total} routes to ${out}`)
