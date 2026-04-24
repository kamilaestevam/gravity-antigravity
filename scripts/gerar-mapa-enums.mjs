#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/danie/gravity-antigravity'

const sources = [
  { local: 'Configurador', produto: 'Configurador', file: 'configurador/prisma/schema.prisma' },
  { local: 'Cadastros', produto: 'Cadastros (tenant)', file: 'servicos-global/tenant/cadastros/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'agendamento', file: 'servicos-global/tenant/agendamento/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'api-cockpit', file: 'servicos-global/tenant/api-cockpit/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'atividades', file: 'servicos-global/tenant/atividades/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'conector-erp', file: 'servicos-global/tenant/conector-erp/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'cronometro', file: 'servicos-global/tenant/cronometro/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'dashboard', file: 'servicos-global/tenant/dashboard/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'email', file: 'servicos-global/tenant/email/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'gabi', file: 'servicos-global/tenant/gabi/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'historico-global', file: 'servicos-global/tenant/historico-global/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'ncm-sync', file: 'servicos-global/tenant/ncm-sync/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'notificacoes', file: 'servicos-global/tenant/notificacoes/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'preferencias-usuario', file: 'servicos-global/tenant/preferencias-usuario/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'relatorios', file: 'servicos-global/tenant/relatorios/prisma/fragment.prisma' },
  { local: 'Tenant', produto: 'whatsapp', file: 'servicos-global/tenant/whatsapp/prisma/fragment.prisma' },
  { local: 'Produto - Helpdesk (template)', produto: 'helpdesk', file: 'servicos-global/produto/helpdesk/prisma/fragment.prisma' },
  { local: 'Produto - bid-cambio', produto: 'bid-cambio', file: 'produto/bid-cambio/server/prisma/fragment.prisma' },
  { local: 'Produto - bid-frete', produto: 'bid-frete', file: 'produto/bid-frete/server/prisma/fragment.prisma' },
  { local: 'Produto - financeiro-comex', produto: 'financeiro-comex', file: 'produto/financeiro-comex/server/prisma/fragment.prisma' },
  { local: 'Produto - lpco', produto: 'lpco', file: 'produto/lpco/server/prisma/fragment.prisma' },
  { local: 'Produto - nf-importacao', produto: 'nf-importacao', file: 'produto/nf-importacao/server/prisma/fragment.prisma' },
  { local: 'Produto - pedido', produto: 'pedido', file: 'produto/pedido/server/prisma/fragment.prisma' },
  { local: 'Produto - processo', produto: 'processo', file: 'produto/processo/server/prisma/fragment.prisma' },
  { local: 'Produto - simula-custo', produto: 'simula-custo', file: 'produto/simula-custo/server/prisma/fragment.prisma' },
]

const columns = [
  'Local',
  'Nome do Enum - Prisma',
  'Nome do Enum - DDD',
  'Valor - PostgreSQL',
  'Valor - Prisma',
  'Valor - DDD',
  'Nome no back - Atual',
  'Nome no back - DDD',
  'Nome no front - Atual',
  'Nome no front - DDD',
  'Label em tela - Atual',
  'Label em tela - DDD',
  'Local Tela',
  'Descricao',
  'Produto Gravity',
  'Usado em (models)',
  'Usado em (campos)',
  'Ordem de exibicao',
  'Cor / Badge',
  'Icone',
  'E valor padrao?',
  'Deprecated?',
  'Arquivo fragment',
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

function extractEnums(text) {
  const enums = []
  const regex = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g
  let m
  while ((m = regex.exec(text)) !== null) {
    const values = m[2]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))
      .map(l => l.split(/\s+/)[0])
    enums.push({ name: m[1], values })
  }
  return enums
}

function extractModels(text) {
  const models = []
  const regex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g
  let m
  while ((m = regex.exec(text)) !== null) {
    models.push({ name: m[1], body: m[2] })
  }
  return models
}

// Build index: enumName -> [{model, field, default}]
function buildUsageIndex(allText) {
  const usage = {}
  const allModels = []
  for (const src of sources) {
    const abs = path.join(ROOT, src.file).replace(/\\/g, '/')
    if (!fs.existsSync(abs)) continue
    const text = fs.readFileSync(abs, 'utf8')
    const models = extractModels(text)
    for (const model of models) {
      const fieldLines = model.body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('@@'))
      for (const fl of fieldLines) {
        const parts = fl.split(/\s+/)
        if (parts.length < 2) continue
        const fieldName = parts[0]
        const fieldType = parts[1].replace('?', '').replace('[]', '')
        if (!usage[fieldType]) usage[fieldType] = []
        usage[fieldType].push({ model: model.name, field: fieldName, line: fl })
      }
    }
  }
  return usage
}

const usageIndex = buildUsageIndex()

const rows = [columns.join(',')]
let total = 0

for (const src of sources) {
  const abs = path.join(ROOT, src.file).replace(/\\/g, '/')
  if (!fs.existsSync(abs)) continue
  const text = fs.readFileSync(abs, 'utf8')
  const enums = extractEnums(text)
  for (const e of enums) {
    const uses = usageIndex[e.name] || []
    const models = [...new Set(uses.map(u => u.model))].join(' | ')
    const campos = [...new Set(uses.map(u => u.field))].join(' | ')
    let order = 0
    for (const v of e.values) {
      order++
      // detect default
      const isDefault = uses.some(u => u.line.includes(`@default(${v})`))
      total++
      const row = [
        src.local,
        e.name,
        '', // DDD
        v,
        v,
        '', // valor DDD
        '', '', '', '', // back/front atual/DDD
        '', '', // label tela atual/DDD
        '', // local tela
        '', // descricao
        src.produto,
        models,
        campos,
        order,
        '', // cor
        '', // icone
        isDefault ? 'Sim' : 'Nao',
        '', // deprecated
        src.file,
        '', // status DDD
        '', // observacoes
      ]
      rows.push(row.map(csvEscape).join(','))
    }
  }
}

const out = path.join(ROOT, 'documentos-tecnicos/mapa-enums.csv').replace(/\\/g, '/')
fs.writeFileSync(out, rows.join('\n') + '\n', 'utf8')
console.log(`Wrote ${total} enum values to ${out}`)
