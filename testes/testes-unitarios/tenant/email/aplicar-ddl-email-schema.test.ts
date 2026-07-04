/**
 * Guarda de contrato do repair de drift do Email (pós-mortem outage 04/07/2026).
 *
 * Valida que o mapa de renomeações de aplicar-ddl-email-schema.ts cobre TODAS
 * as colunas legado criadas pela migration ddd_final e que todo destino de
 * rename existe de fato no fragment.prisma — se o fragment mudar sem atualizar
 * o repair (ou vice-versa), este teste quebra antes do P2022 chegar em prod.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  TABELAS_EMAIL,
  RENOMEACOES_ENUM,
} from '../../../../servicos-global/servicos-plataforma/email/server/lib/aplicar-ddl-email-schema.js'

const RAIZ = path.resolve(__dirname, '../../../..')
const FRAGMENT = readFileSync(
  path.join(RAIZ, 'servicos-global/servicos-plataforma/email/prisma/fragment.prisma'),
  'utf8',
)
const MIGRATION_DDD_FINAL = readFileSync(
  path.join(RAIZ, 'servicos-global/servicos-plataforma/prisma/migrations/20260419000001_ddd_final/migration.sql'),
  'utf8',
)

/** Extrai os nomes de model do fragment (para excluir campos de relação). */
function extrairNomesModels(schema: string): Set<string> {
  return new Set([...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1]))
}

/** Extrai colunas escalares (inclui enums, exclui relações) de um model pelo @@map. */
function extrairColunasPorTabela(schema: string, tabela: string): Set<string> {
  const models = extrairNomesModels(schema)
  const blocos = [...schema.matchAll(/model\s+\w+\s*\{([\s\S]*?)\n\}/g)]
  for (const bloco of blocos) {
    const corpo = bloco[1]
    if (!new RegExp(`@@map\\("${tabela}"\\)`).test(corpo)) continue
    const colunas = new Set<string>()
    for (const linha of corpo.split('\n')) {
      const m = linha.trim().match(/^(\w+)\s+(\w+)(\[\])?[?]?/)
      if (!m) continue
      const [, campo, tipo, lista] = m
      if (campo.startsWith('@@')) continue
      if (models.has(tipo)) continue // relação — não é coluna
      if (lista && models.has(tipo)) continue
      colunas.add(campo)
    }
    return colunas
  }
  throw new Error(`model com @@map("${tabela}") não encontrado no fragment`)
}

/** Extrai as colunas do CREATE TABLE legado na migration ddd_final. */
function extrairColunasLegadoMigration(sql: string, tabela: string): Set<string> {
  const m = sql.match(new RegExp(`CREATE TABLE "${tabela}" \\(([\\s\\S]*?)\\n\\);`))
  if (!m) throw new Error(`CREATE TABLE "${tabela}" não encontrado na migration ddd_final`)
  const colunas = new Set<string>()
  for (const linha of m[1].split('\n')) {
    const col = linha.trim().match(/^"([^"]+)"\s/)
    if (col) colunas.add(col[1])
  }
  return colunas
}

describe('aplicar-ddl-email-schema — contrato com fragment.prisma e ddd_final', () => {
  for (const { tabela, colunasCanonicas, renomeacoes } of TABELAS_EMAIL) {
    describe(tabela, () => {
      const colunasFragment = extrairColunasPorTabela(FRAGMENT, tabela)
      const colunasLegado = extrairColunasLegadoMigration(MIGRATION_DDD_FINAL, tabela)
      const destinos = new Set(renomeacoes.map(([, para]) => para))

      it('todo destino de rename existe no fragment.prisma', () => {
        for (const [de, para] of renomeacoes) {
          expect(colunasFragment.has(para), `destino ausente no fragment: ${de} → ${para}`).toBe(true)
        }
      })

      it('nenhuma origem de rename existe no fragment (senão o rename nunca aplica)', () => {
        for (const [de] of renomeacoes) {
          expect(colunasFragment.has(de), `origem legado ainda existe no fragment: ${de}`).toBe(false)
        }
      })

      it('toda coluna legado da ddd_final tem rename mapeado (nenhum P2022 possível)', () => {
        for (const colunaLegado of colunasLegado) {
          const coberta = destinos.has(colunaLegado)
            || renomeacoes.some(([de]) => de === colunaLegado)
            || colunasFragment.has(colunaLegado)
          expect(coberta, `coluna legado sem mapeamento: ${tabela}.${colunaLegado}`).toBe(true)
        }
      })

      it('toda coluna do fragment é alcançável (canônica de fábrica ou destino de rename)', () => {
        for (const coluna of colunasFragment) {
          const alcancavel = destinos.has(coluna) || colunasLegado.has(coluna)
          expect(alcancavel, `coluna do fragment inatingível a partir do legado: ${tabela}.${coluna}`).toBe(true)
        }
      })

      it('colunas canônicas de verificação existem no fragment', () => {
        for (const coluna of colunasCanonicas) {
          expect(colunasFragment.has(coluna), `coluna canônica ausente no fragment: ${coluna}`).toBe(true)
        }
      })
    })
  }

  it('renomeações de enum apontam para enums existentes no fragment', () => {
    for (const [, para] of RENOMEACOES_ENUM) {
      expect(new RegExp(`enum\\s+${para}\\s*\\{`).test(FRAGMENT), `enum ausente no fragment: ${para}`).toBe(true)
    }
  })
})
