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
  { local: 'Produto - bid-cambio', produto: 'bid-cambio', file: 'servicos-global/organizacao/bid-cambio/server/prisma/fragment.prisma' },
  { local: 'Produto - bid-frete', produto: 'bid-frete', file: 'servicos-global/organizacao/bid-frete/server/prisma/fragment.prisma' },
  { local: 'Produto - financeiro-comex', produto: 'financeiro-comex', file: 'servicos-global/organizacao/financeiro-comex/server/prisma/fragment.prisma' },
  { local: 'Produto - lpco', produto: 'lpco', file: 'servicos-global/organizacao/lpco/server/prisma/fragment.prisma' },
  { local: 'Produto - nf-importacao', produto: 'nf-importacao', file: 'servicos-global/organizacao/nf-importacao/server/prisma/fragment.prisma' },
  { local: 'Produto - pedido', produto: 'pedido', file: 'servicos-global/organizacao/pedido/server/prisma/fragment.prisma' },
  { local: 'Produto - processo', produto: 'processo', file: 'servicos-global/organizacao/processo/server/prisma/fragment.prisma' },
  { local: 'Produto - simula-custo', produto: 'simula-custo', file: 'servicos-global/organizacao/simula-custo/server/prisma/fragment.prisma' },
]

const columns = [
  'Local',
  'Nome no PostgreSQL',
  'Nome no Prisma',
  'Nome DDD',
  'Nome no back - Atual',
  'Nome no back - DDD',
  'Nome no front - Atual',
  'Nome no front - DDD',
  'Nome em tela - Atual',
  'Nome em tela - DDD',
  'Entidade',
  'Tipo',
  'Produto Gravity',
  'Natureza',
  'Descricao',
  'O que faz / Proposito',
  'Tem tenant_id?',
  'Chave primaria',
  'Qtd FKs',
  'Relacoes (lista)',
  'Qtd indices',
  'Indices (lista)',
  'Soft delete?',
  'Auditoria?',
  'Qtd de campos',
  'Volume estimado',
  'Origem do dado',
  'Consumidores principais',
  'Escritores principais',
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

function extractModels(text) {
  const models = []
  const regex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g
  let m
  while ((m = regex.exec(text)) !== null) {
    const name = m[1]
    const body = m[2]
    models.push({ name, body })
  }
  return models
}

function analyze(model) {
  const lines = model.body.split('\n').map(l => l.trim()).filter(Boolean)
  const fieldLines = lines.filter(l => !l.startsWith('//') && !l.startsWith('@@'))
  const attrLines = lines.filter(l => l.startsWith('@@'))

  const mapLine = attrLines.find(l => l.startsWith('@@map('))
  const postgresName = mapLine ? (mapLine.match(/@@map\("([^"]+)"\)/)?.[1] ?? model.name) : model.name

  const hasTenantId = fieldLines.some(l => /^tenant_id\b/.test(l))
  const hasCreatedAt = fieldLines.some(l => /^(created_at|createdAt)\b/.test(l))
  const hasUpdatedAt = fieldLines.some(l => /^(updated_at|updatedAt)\b/.test(l))
  const hasDeletedAt = fieldLines.some(l => /^(deleted_at|deletedAt)\b/.test(l))
  const auditoria = [hasCreatedAt && 'created_at', hasUpdatedAt && 'updated_at'].filter(Boolean).join('+') || 'Nao'

  const pkLine = fieldLines.find(l => l.includes('@id'))
  const pk = pkLine ? pkLine.split(/\s+/)[0] : (attrLines.find(l => l.startsWith('@@id('))?.match(/@@id\(\[([^\]]+)\]/)?.[1] ?? '')

  const fks = fieldLines.filter(l => l.includes('@relation')).map(l => l.split(/\s+/)[0])
  const relacoes = fks.join('; ')

  const indices = attrLines.filter(l => l.startsWith('@@index(')).map(l => {
    const inner = l.match(/@@index\(\[([^\]]+)\]/)?.[1] ?? ''
    return inner
  })

  const fieldCount = fieldLines.filter(l => /^[a-z_A-Z]/.test(l) && !l.startsWith('@')).length

  return {
    postgresName,
    hasTenantId,
    auditoria,
    pk,
    fkCount: fks.length,
    relacoes,
    indexCount: indices.length,
    indices: indices.join(' | '),
    softDelete: hasDeletedAt ? 'Sim' : 'Nao',
    fieldCount,
  }
}

const rows = [columns.join(',')]
let total = 0

for (const src of sources) {
  const abs = path.join(ROOT, src.file).replace(/\\/g, '/')
  if (!fs.existsSync(abs)) {
    console.error('MISSING:', abs)
    continue
  }
  const text = fs.readFileSync(abs, 'utf8')
  const models = extractModels(text)
  for (const model of models) {
    const a = analyze(model)
    total++
    const row = [
      src.local,
      a.postgresName,
      model.name,
      '', // Nome DDD
      '', // back atual
      '', // back DDD
      '', // front atual
      '', // front DDD
      '', // tela atual
      '', // tela DDD
      '', // Entidade
      'Tabela',
      src.produto,
      '', // Natureza
      '', // Descricao
      '', // O que faz
      a.hasTenantId ? 'Sim' : 'Nao',
      a.pk,
      a.fkCount,
      a.relacoes,
      a.indexCount,
      a.indices,
      a.softDelete,
      a.auditoria,
      a.fieldCount,
      '', // Volume
      '', // Origem
      '', // Consumidores
      '', // Escritores
      src.file,
      '', // Status DDD
      '', // Observacoes
    ]
    rows.push(row.map(csvEscape).join(','))
  }
}

const out = path.join(ROOT, 'documentos-tecnicos/mapa-models.csv').replace(/\\/g, '/')
fs.writeFileSync(out, rows.join('\n') + '\n', 'utf8')
console.log(`Wrote ${total} models to ${out}`)
