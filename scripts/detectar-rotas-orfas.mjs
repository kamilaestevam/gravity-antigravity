#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/danie/gravity-antigravity'

// 1. Build map: serviceRoot -> [modelNames from its fragment]
const services = [
  { name: 'Configurador', routeRoot: 'servicos-global/configurador/server/routes', prismaFile: 'configurador/prisma/schema.prisma' },
  { name: 'agendamento', routeRoot: 'servicos-global/tenant/agendamento/server/routes', prismaFile: 'servicos-global/tenant/agendamento/prisma/fragment.prisma' },
  { name: 'api-cockpit', routeRoot: 'servicos-global/tenant/api-cockpit/server/src/routes', prismaFile: 'servicos-global/tenant/api-cockpit/prisma/fragment.prisma' },
  { name: 'atividades', routeRoot: 'servicos-global/tenant/atividades/server/routes', prismaFile: 'servicos-global/tenant/atividades/prisma/fragment.prisma' },
  { name: 'cadastros', routeRoot: 'servicos-global/tenant/cadastros/server/src/routes', prismaFile: 'servicos-global/tenant/cadastros/prisma/fragment.prisma' },
  { name: 'conector-erp', routeRoot: 'servicos-global/tenant/conector-erp/server/routes', prismaFile: 'servicos-global/tenant/conector-erp/prisma/fragment.prisma' },
  { name: 'cronometro', routeRoot: 'servicos-global/tenant/cronometro/server/routes', prismaFile: 'servicos-global/tenant/cronometro/prisma/fragment.prisma' },
  { name: 'dashboard', routeRoot: 'servicos-global/tenant/dashboard/server/routes', prismaFile: 'servicos-global/tenant/dashboard/prisma/fragment.prisma' },
  { name: 'email', routeRoot: 'servicos-global/tenant/email/server/routes', prismaFile: 'servicos-global/tenant/email/prisma/fragment.prisma' },
  { name: 'gabi', routeRoot: 'servicos-global/tenant/gabi/server/routes', prismaFile: 'servicos-global/tenant/gabi/prisma/fragment.prisma' },
  { name: 'ncm-sync', routeRoot: 'servicos-global/tenant/ncm-sync/server/routes', prismaFile: 'servicos-global/tenant/ncm-sync/prisma/fragment.prisma' },
  { name: 'notificacoes', routeRoot: 'servicos-global/tenant/notificacoes/server/routes', prismaFile: 'servicos-global/tenant/notificacoes/prisma/fragment.prisma' },
  { name: 'preferencias-usuario', routeRoot: 'servicos-global/tenant/preferencias-usuario/server/routes', prismaFile: 'servicos-global/tenant/preferencias-usuario/prisma/fragment.prisma' },
  { name: 'relatorios', routeRoot: 'servicos-global/tenant/relatorios/server/routes', prismaFile: 'servicos-global/tenant/relatorios/prisma/fragment.prisma' },
  { name: 'whatsapp', routeRoot: 'servicos-global/tenant/whatsapp/server/routes', prismaFile: 'servicos-global/tenant/whatsapp/prisma/fragment.prisma' },
  { name: 'historico-global', routeRoot: 'servicos-global/tenant/historico-global/server/routes', prismaFile: 'servicos-global/tenant/historico-global/prisma/fragment.prisma' },
  { name: 'bid-cambio', routeRoot: 'servicos-global/produto/bid-cambio/server/src/routes', prismaFile: 'servicos-global/produto/bid-cambio/server/prisma/fragment.prisma' },
  { name: 'bid-frete', routeRoot: 'servicos-global/produto/bid-frete/server/src/routes', prismaFile: 'servicos-global/produto/bid-frete/server/prisma/fragment.prisma' },
  { name: 'financeiro-comex', routeRoot: 'servicos-global/produto/financeiro-comex/server/src/routes', prismaFile: 'servicos-global/produto/financeiro-comex/server/prisma/fragment.prisma' },
  { name: 'lpco', routeRoot: 'servicos-global/produto/lpco/server/src/routes', prismaFile: 'servicos-global/produto/lpco/server/prisma/fragment.prisma' },
  { name: 'nf-importacao', routeRoot: 'servicos-global/produto/nf-importacao/server/src/routes', prismaFile: 'servicos-global/produto/nf-importacao/server/prisma/fragment.prisma' },
  { name: 'pedido', routeRoot: 'servicos-global/produto/pedido/server/src/routes', prismaFile: 'servicos-global/produto/pedido/server/prisma/fragment.prisma' },
  { name: 'processo', routeRoot: 'servicos-global/produto/processo/server/src/routes', prismaFile: 'servicos-global/produto/processo/server/prisma/fragment.prisma' },
  { name: 'simula-custo', routeRoot: 'servicos-global/produto/simula-custo/server/src/routes', prismaFile: 'servicos-global/produto/simula-custo/server/prisma/fragment.prisma' },
]

function extractModelNames(prismaText) {
  const names = new Set()
  const re = /^model\s+(\w+)\s*\{/gm
  let m
  while ((m = re.exec(prismaText)) !== null) {
    names.add(m[1])
    // Also add camelCase version (prisma auto-generates camelCase accessors)
    names.add(m[1].charAt(0).toLowerCase() + m[1].slice(1))
  }
  return names
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue
    const full = path.join(dir, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.isFile() && /\.ts$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function extractPrismaCalls(text) {
  const calls = new Set()
  // Match: prisma.XYZ.method or db.XYZ.method
  const re = /\b(?:prisma|db|tx|ctx\.prisma)\s*\.\s*(\w+)\s*\.\s*(?:findMany|findFirst|findUnique|findFirstOrThrow|findUniqueOrThrow|create|createMany|update|updateMany|upsert|delete|deleteMany|count|aggregate|groupBy)\b/g
  let m
  while ((m = re.exec(text)) !== null) {
    if (!['$transaction','$queryRaw','$executeRaw'].includes(m[1])) calls.add(m[1])
  }
  return calls
}

console.log('\n🔎 ROTAS ÓRFÃS — referenciam models Prisma inexistentes no serviço\n')
console.log('='.repeat(80))

const orphans = []
for (const svc of services) {
  const prismaPath = path.join(ROOT, svc.prismaFile).replace(/\\/g,'/')
  if (!fs.existsSync(prismaPath)) continue
  const models = extractModelNames(fs.readFileSync(prismaPath, 'utf8'))

  const routeBase = path.join(ROOT, svc.routeRoot).replace(/\\/g,'/')
  const routeFiles = walk(routeBase)

  for (const f of routeFiles) {
    const text = fs.readFileSync(f, 'utf8')
    const calls = extractPrismaCalls(text)
    for (const c of calls) {
      if (!models.has(c) && !models.has(c.charAt(0).toUpperCase() + c.slice(1))) {
        const rel = f.replace(ROOT+'/','')
        orphans.push({ service: svc.name, file: rel, model: c })
      }
    }
  }
}

// Group by service + file + model
const uniq = {}
for (const o of orphans) {
  const k = `${o.service}|${o.file}|${o.model}`
  uniq[k] = o
}

const byFile = {}
for (const o of Object.values(uniq)) {
  const k = o.service + '::' + o.file
  if (!byFile[k]) byFile[k] = []
  byFile[k].push(o.model)
}

for (const [k, models] of Object.entries(byFile)) {
  const [svc, file] = k.split('::')
  console.log(`\n[${svc}] ${file}`)
  console.log(`   → Models inexistentes: ${models.join(', ')}`)
}

console.log('\n\nTotal de rotas órfãs (arquivos): ' + Object.keys(byFile).length)
console.log('Total de referências órfãs distintas: ' + Object.keys(uniq).length)
