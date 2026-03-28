// @vitest-environment node

/**
 * Testes funcionais — Atividades fragment.prisma @relation directives
 * Localização: testes/testes-funcionais/schema-relations.test.ts
 *
 * Verifica que o fragment Prisma do serviço de Atividades (CRM) contém
 * as diretivas @relation corretas nos campos de FK, garantindo integridade
 * referencial no schema composto.
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const FRAGMENT_PATH = path.resolve(
  __dirname,
  '../../servicos-global/tenant/atividades/prisma/fragment.prisma'
)
const fragmentContent = fs.readFileSync(FRAGMENT_PATH, 'utf-8')

// ─── Helper ──────────────────────────────────────────────────────────────────────

/** Extracts a model block from the prisma schema text */
function extractModel(modelName: string): string {
  const regex = new RegExp(`model\\s+${modelName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm')
  const match = fragmentContent.match(regex)
  if (!match) throw new Error(`Model ${modelName} not found in fragment.prisma`)
  return match[1]
}

// ─── 1. Contato has @relation to Empresa ─────────────────────────────────────────

describe('fragment.prisma — Contato @relation', () => {
  it('Contato model contains empresa_id field', () => {
    const contato = extractModel('Contato')
    expect(contato).toContain('empresa_id')
  })

  it('Contato has @relation(fields: [empresa_id], references: [id]) on empresa', () => {
    const contato = extractModel('Contato')
    expect(contato).toContain('@relation(fields: [empresa_id], references: [id])')
  })

  it('Contato empresa field references Empresa type', () => {
    const contato = extractModel('Contato')
    // Match: empresa    Empresa? @relation(...)
    expect(contato).toMatch(/empresa\s+Empresa\??\s+@relation/)
  })
})

// ─── 2. Atividade has @relation to Empresa and Contato ───────────────────────────

describe('fragment.prisma — Atividade @relation', () => {
  it('Atividade model contains empresa_id and contato_id fields', () => {
    const atividade = extractModel('Atividade')
    expect(atividade).toContain('empresa_id')
    expect(atividade).toContain('contato_id')
  })

  it('Atividade has @relation to Empresa via empresa_id', () => {
    const atividade = extractModel('Atividade')
    expect(atividade).toContain('@relation(fields: [empresa_id], references: [id])')
  })

  it('Atividade has @relation to Contato via contato_id', () => {
    const atividade = extractModel('Atividade')
    expect(atividade).toContain('@relation(fields: [contato_id], references: [id])')
  })

  it('Atividade has @relation to Pipeline via pipeline_id', () => {
    const atividade = extractModel('Atividade')
    expect(atividade).toContain('@relation(fields: [pipeline_id], references: [id])')
  })
})

// ─── 3. Pipeline has @relation to Empresa and Contato ────────────────────────────

describe('fragment.prisma — Pipeline @relation', () => {
  it('Pipeline has @relation to Empresa via empresa_id', () => {
    const pipeline = extractModel('Pipeline')
    expect(pipeline).toContain('@relation(fields: [empresa_id], references: [id])')
  })

  it('Pipeline has @relation to Contato via contato_id', () => {
    const pipeline = extractModel('Pipeline')
    expect(pipeline).toContain('@relation(fields: [contato_id], references: [id])')
  })
})

// ─── 4. KanbanCard has @relation to Empresa, Contato, and Atividade ──────────────

describe('fragment.prisma — KanbanCard @relation', () => {
  it('KanbanCard has @relation to Atividade via atividade_id', () => {
    const kanban = extractModel('KanbanCard')
    expect(kanban).toContain('@relation(fields: [atividade_id], references: [id])')
  })

  it('KanbanCard has @relation to Empresa via empresa_id', () => {
    const kanban = extractModel('KanbanCard')
    expect(kanban).toContain('@relation(fields: [empresa_id], references: [id])')
  })

  it('KanbanCard has @relation to Contato via contato_id', () => {
    const kanban = extractModel('KanbanCard')
    expect(kanban).toContain('@relation(fields: [contato_id], references: [id])')
  })
})

// ─── 5. All empresa_id fields across models have @relation ──────────────────────

describe('fragment.prisma — all empresa_id fields have @relation', () => {
  it('every model with empresa_id has a corresponding @relation directive', () => {
    const modelsWithEmpresaId = ['Contato', 'Atividade', 'Pipeline', 'KanbanCard']

    for (const modelName of modelsWithEmpresaId) {
      const model = extractModel(modelName)
      expect(model, `${modelName} should have empresa_id`).toContain('empresa_id')
      expect(model, `${modelName} should have @relation on empresa`).toContain(
        '@relation(fields: [empresa_id], references: [id])'
      )
    }
  })
})
