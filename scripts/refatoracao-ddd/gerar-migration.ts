// =====================================================================
// Refatoração DDD — gera arquivo SQL de migration para um serviço
// =====================================================================
// Emite comandos:
//   - ALTER TABLE ... RENAME TO ...               (model RENAME)
//   - ALTER TABLE ... RENAME COLUMN ... TO ...    (campo RENAME)
//   - ALTER TABLE ... DROP COLUMN ...             (campo DELETE)
//   - ALTER TABLE ... ADD COLUMN ...              (campo CREATE — ghost)
//   - ALTER TYPE ... RENAME TO ...                (enum RENAME)
//
// O SQL é salvo em scripts/refatoracao-ddd/migrations/<servico>.sql
// para aplicação manual via `psql` ou prisma migrate diff. Não executa.
//
// Uso:
//   tsx scripts/refatoracao-ddd/gerar-migration.ts <nome-servico>
// =====================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PlanoCompleto, PlanoServico, CampoRefactor } from './tipos.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function sqlTipo(tipo: string, obrigatorio: boolean, valorPadrao: string): string {
  const t = (tipo || '').toLowerCase()
  const pg = (() => {
    if (t.includes('int')) return 'INTEGER'
    if (t.includes('float') || t.includes('decimal') || t.includes('numer')) return 'DOUBLE PRECISION'
    if (t.includes('bool')) return 'BOOLEAN'
    if (t.includes('date') || t.includes('timestamp')) return 'TIMESTAMP(3)'
    if (t.includes('json')) return 'JSONB'
    return 'TEXT'
  })()
  const notNull = obrigatorio ? ' NOT NULL' : ''
  const def = valorPadrao ? ` DEFAULT ${sqlDefault(valorPadrao, pg)}` : ''
  return `${pg}${def}${notNull}`
}

function sqlDefault(valor: string, pgType: string): string {
  const v = valor.trim()
  if (pgType === 'BOOLEAN') return /true|sim|1/i.test(v) ? 'TRUE' : 'FALSE'
  if (pgType === 'INTEGER' || pgType === 'DOUBLE PRECISION') return v
  if (pgType.startsWith('TIMESTAMP') && /now/i.test(v)) return 'CURRENT_TIMESTAMP'
  return `'${v.replace(/'/g, "''")}'`
}

// PG name = Prisma name (REGRA 02, sem @@map). Não faz lowercase —
// PG preserva case quando o identificador vai quoted com aspas duplas.

function main() {
  const servicoAlvo = process.argv[2]
  if (!servicoAlvo) {
    console.error('Uso: tsx gerar-migration.ts <nome-servico>')
    process.exit(1)
  }
  const plano = JSON.parse(
    readFileSync(resolve(__dirname, 'plano.json'), 'utf8'),
  ) as PlanoCompleto
  const servicos = Object.keys(plano.servicos)
  const servico =
    servicos.find((s) => s.toLowerCase().includes(servicoAlvo.toLowerCase())) || servicoAlvo
  const p: PlanoServico = plano.servicos[servico]
  if (!p) {
    console.error(`Serviço não encontrado: ${servicoAlvo}`)
    process.exit(1)
  }

  const lines: string[] = []
  lines.push('-- =====================================================================')
  lines.push(`-- Migration DDD — serviço: ${servico}`)
  lines.push(`-- Gerado em: ${new Date().toISOString()}`)
  lines.push(`-- Fonte: ${plano.planilha}`)
  lines.push('-- =====================================================================')
  lines.push('BEGIN;')
  lines.push('')

  // Mapa {nome antigo → nome novo} de tabelas para resolver o nome
  // correto ao renomear colunas (tabela já foi renomeada).
  const renameTabela = new Map<string, string>()
  for (const m of p.models) {
    if (m.acao === 'RENAME') renameTabela.set(m.pgAtual, m.pgNovo)
  }
  const tabelaAtual = (nomeOriginal: string) =>
    renameTabela.get(nomeOriginal) || nomeOriginal

  // 1) Enums primeiro
  for (const e of p.enums) {
    if (e.nomeAtual !== e.nomeNovo) {
      lines.push(`ALTER TYPE "${e.nomeAtual}" RENAME TO "${e.nomeNovo}";`)
    }
  }

  // 2) RENAME de tabela (precisa vir antes dos column ops)
  for (const m of p.models) {
    if (m.acao === 'RENAME' && m.pgAtual !== m.pgNovo) {
      lines.push(`ALTER TABLE "${m.pgAtual}" RENAME TO "${m.pgNovo}";`)
    }
  }

  // 3) Renames de coluna (usando nome NOVO da tabela)
  for (const c of p.campos) {
    if (c.acao !== 'RENAME' || c.pgAtual === c.pgNovo) continue
    lines.push(
      `ALTER TABLE "${tabelaAtual(c.tabela)}" RENAME COLUMN "${c.pgAtual}" TO "${c.pgNovo}";`,
    )
  }

  // 4) Deletes
  for (const c of p.campos) {
    if (c.acao !== 'DELETE') continue
    lines.push(
      `ALTER TABLE "${tabelaAtual(c.tabela)}" DROP COLUMN IF EXISTS "${c.pgAtual}";`,
    )
  }

  // 5) Creates (ghost fields)
  for (const c of p.campos) {
    if (c.acao !== 'CREATE') continue
    const def = sqlTipo(c.tipoDado, c.obrigatorio, c.valorPadrao)
    lines.push(
      `ALTER TABLE "${tabelaAtual(c.tabela)}" ADD COLUMN IF NOT EXISTS "${c.pgNovo}" ${def};`,
    )
  }

  // 6) DROP de tabelas marcadas para delete
  for (const m of p.models) {
    if (m.acao === 'DELETE') {
      lines.push(`DROP TABLE IF EXISTS "${m.pgAtual}" CASCADE;`)
    }
  }

  lines.push('')
  lines.push('COMMIT;')
  lines.push('')

  const outDir = resolve(__dirname, 'migrations')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const slug = servico.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = resolve(outDir, `${ts}_${slug}.sql`)
  writeFileSync(outPath, lines.join('\n'), 'utf8')
  console.log(`✅ Migration gerada: ${outPath}`)
  console.log(`   ${lines.length} linhas`)
}

main()
