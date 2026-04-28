// =====================================================================
// Refatoração DDD — codemod seguro para renomear propriedades em .ts/.tsx
// =====================================================================
// ESTRATÉGIA PÓS-PoC:
// 1. Dicionário PER-TABELA (nunca flat) — elimina colisão quando duas
//    tabelas têm campo com mesmo nome (suid, email, ativo, etc.).
// 2. Roteamento por nome de arquivo: `empresas.ts`, `empresa.schema.ts`
//    recebem só o dict da tabela Empresa. Arquivos cross-cutting (sem
//    match claro) são LOGADOS e pulados — usuário faz manual.
// 3. Single-pass regex com alternação ordenada por tamanho (maior primeiro),
//    para não cascatear substituições.
// 4. Negative lookahead `(?!\s*\()` para NÃO tocar chamadas de método
//    (ex: `.email(...)` do Zod, `.nullable(...)`, etc.).
// 5. String/comment exclusion preservada (existing logic).
//
// Models e enums (não ambíguos) ficam em dicionário GLOBAL — aplicado a
// todos os arquivos do serviço.
//
// Uso:
//   tsx aplicar-codigo.ts <servico> [--dry]
// =====================================================================

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PlanoCompleto, PlanoServico, CampoRefactor } from './tipos.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..', '..')

const ROOTS_POR_SERVICO: Record<string, string[]> = {
  Configurador: ['servicos-global/configurador'],
  Cadastros: ['servicos-global/tenant/cadastros'],
  Tenant: ['servicos-global/tenant', 'servicos-global/shell'],
  'Produto - Pedido': ['produto/pedido'],
  'Produto - SimulaCusto': ['produtos/simulacusto'],
  'Produto - LPCO': ['produto/lpco'],
  'Produto - NF Importacao': ['produto/nf-importacao'],
}

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  'generated',
  '.turbo',
  '.claude',
  'coverage',
])

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = []
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (IGNORE_DIRS.has(name)) continue
    const full = join(dir, name)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) walk(full, out)
    else if (st.isFile()) {
      const ext = extname(full)
      if (ext === '.ts' || ext === '.tsx') out.push(full)
    }
  }
  return out
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------
// String/comment-aware line replacer
// ---------------------------------------------------------------------
function replaceOutsideStrings(line: string, re: RegExp, dict: Map<string, string>): string {
  const segs: { code: boolean; text: string }[] = []
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = findStringEnd(line, i)
      segs.push({ code: false, text: line.slice(i, end + 1) })
      i = end + 1
    } else if (ch === '/' && line[i + 1] === '/') {
      segs.push({ code: false, text: line.slice(i) })
      i = line.length
    } else {
      const next = nextStringStart(line, i)
      segs.push({ code: true, text: line.slice(i, next) })
      i = next
    }
  }
  return segs
    .map((s) => (s.code ? s.text.replace(re, (m) => dict.get(m) || m) : s.text))
    .join('')
}

// Renomeia accessors no formato `prisma.nCM` / `tx.historicoStatusOPE`
// — só substitui quando o identificador aparece após `prisma.` ou `tx.`.
// Ignora strings e comentários `//`.
function replaceAccessorsOutsideStrings(
  line: string,
  accessors: Map<string, string>,
): string {
  const segs: { code: boolean; text: string }[] = []
  let i = 0
  while (i < line.length) {
    const ch = line[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = findStringEnd(line, i)
      segs.push({ code: false, text: line.slice(i, end + 1) })
      i = end + 1
    } else if (ch === '/' && line[i + 1] === '/') {
      segs.push({ code: false, text: line.slice(i) })
      i = line.length
    } else {
      const next = nextStringStart(line, i)
      segs.push({ code: true, text: line.slice(i, next) })
      i = next
    }
  }
  const keys = Array.from(accessors.keys()).sort((a, b) => b.length - a.length)
  const re = new RegExp(`\\b(prisma|tx)\\.(${keys.map(escapeRegex).join('|')})\\b`, 'g')
  return segs
    .map((s) =>
      s.code
        ? s.text.replace(re, (_m, obj, acc) => `${obj}.${accessors.get(acc) || acc}`)
        : s.text,
    )
    .join('')
}

function findStringEnd(line: string, start: number): number {
  const quote = line[start]
  let i = start + 1
  while (i < line.length) {
    const ch = line[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === quote) return i
    i++
  }
  return line.length - 1
}

function nextStringStart(line: string, from: number): number {
  for (let i = from; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"' || ch === "'" || ch === '`') return i
    if (ch === '/' && line[i + 1] === '/') return i
  }
  return line.length
}

// ---------------------------------------------------------------------
// Constrói regex alternado da maior chave para a menor,
// com lookahead para ignorar chamadas de método (`\s*\(`)
// ---------------------------------------------------------------------
function buildRegex(dict: Map<string, string>): RegExp | null {
  if (dict.size === 0) return null
  const keys = Array.from(dict.keys()).sort((a, b) => b.length - a.length)
  return new RegExp(`\\b(${keys.map(escapeRegex).join('|')})\\b(?!\\s*\\()`, 'g')
}

// ---------------------------------------------------------------------
// Heurística: descobre a tabela a partir do nome do arquivo
// ---------------------------------------------------------------------
function detectarTabelaDoArquivo(
  filePath: string,
  tabelas: string[],
): string | null {
  const base = basename(filePath).toLowerCase()
  // Match mais específico primeiro: 'empresa.schema.ts' > 'empresa'
  const candidatos = tabelas
    .map((t) => ({ tab: t, lower: t.toLowerCase() }))
    .sort((a, b) => b.lower.length - a.lower.length)
  for (const { tab, lower } of candidatos) {
    // Formatos aceitos: x.ts, xs.ts, x.schema.ts, x.test.ts, x.route.ts
    const re = new RegExp(`^${escapeRegex(lower)}s?\\.(ts|tsx|test\\.ts|schema\\.ts|route\\.ts)$`)
    if (re.test(base)) return tab
  }
  // Fallback: arquivo CONTÉM nome da tabela
  for (const { tab, lower } of candidatos) {
    if (base.includes(lower)) return tab
  }
  return null
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------
function main() {
  const servicoAlvo = process.argv[2]
  const dry = process.argv.includes('--dry')
  if (!servicoAlvo) {
    console.error('Uso: tsx aplicar-codigo.ts <nome-servico> [--dry]')
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

  // Dicionário global (enums): aplicado em TODOS os arquivos
  // NÃO inclui renomeações de model — quebraria `export type Empresa = ...`
  // do Zod. Accessors de client Prisma (prisma.nCM → prisma.ncm) são tratados
  // separadamente pelo dict `prismaAccessors` com contexto `prisma.`/`tx.`.
  const globalDict = new Map<string, string>()
  for (const e of p.enums) {
    if (e.nomeAtual !== e.nomeNovo) globalDict.set(e.nomeAtual, e.nomeNovo)
  }
  // Accessors Prisma client: first-letter-lower do nome do model.
  // Só trocam quando precedidos de `prisma.` ou `tx.` (evitar colisão com
  // variáveis locais como `const empresa = ...`).
  const prismaAccessors = new Map<string, string>()
  function firstLower(s: string): string {
    return s.length ? s[0].toLowerCase() + s.slice(1) : s
  }
  for (const m of p.models) {
    if (m.acao !== 'RENAME') continue
    const oldAcc = firstLower(m.prismaAtual)
    const newAcc = firstLower(m.prismaNovo)
    if (oldAcc !== newAcc) prismaAccessors.set(oldAcc, newAcc)
  }

  // Dicionário per-tabela (campos): aplicado só nos arquivos daquela tabela
  const dictPorTabela = new Map<string, Map<string, string>>()
  for (const c of p.campos) {
    if (c.acao !== 'RENAME') continue
    if (!dictPorTabela.has(c.tabela)) dictPorTabela.set(c.tabela, new Map())
    const d = dictPorTabela.get(c.tabela)!
    if (c.pgAtual && c.pgNovo && c.pgAtual !== c.pgNovo) d.set(c.pgAtual, c.pgNovo)
    if (c.backAtual && c.backNovo && c.backAtual !== c.backNovo) d.set(c.backAtual, c.backNovo)
    if (c.frontAtual && c.frontNovo && c.frontAtual !== c.frontNovo) d.set(c.frontAtual, c.frontNovo)
  }

  const tabelas = p.models.map((m) => m.pgAtual)

  console.log(`[aplicar-codigo] serviço: ${servico}`)
  console.log(`[aplicar-codigo] dict global (models+enums): ${globalDict.size}`)
  console.log(`[aplicar-codigo] dicts per-tabela: ${dictPorTabela.size}`)

  const roots = ROOTS_POR_SERVICO[servico]
  if (!roots) {
    console.error(`Sem ROOTS_POR_SERVICO para "${servico}". Edite o script.`)
    process.exit(1)
  }

  let arquivosTocados = 0
  let arquivosVarridos = 0
  let arquivosPulados: string[] = []
  for (const rel of roots) {
    const abs = resolve(ROOT, rel)
    const files = walk(abs)
    console.log(`[aplicar-codigo] varrendo ${abs} (${files.length} arquivos)`)
    for (const f of files) {
      arquivosVarridos++
      const tabela = detectarTabelaDoArquivo(f, tabelas)

      // Dict efetivo: global + (campos da tabela, se detectada)
      const effective = new Map(globalDict)
      if (tabela && dictPorTabela.has(tabela)) {
        for (const [k, v] of dictPorTabela.get(tabela)!) effective.set(k, v)
      }

      // Se não detectou tabela e o arquivo tem .schema./.route./.test. — cross-cutting → pula
      const base = basename(f)
      const temEscopoTabela = tabela !== null
      const ehAmbiguo = !temEscopoTabela && /\.(schema|test|route)\.ts$/.test(base)

      if (ehAmbiguo) {
        arquivosPulados.push(f)
        continue
      }

      const src = readFileSync(f, 'utf8')
      let novo = src

      // 1) Accessors Prisma (contexto obrigatório: `prisma.` ou `tx.`)
      if (prismaAccessors.size > 0) {
        novo = novo
          .split('\n')
          .map((l) => replaceAccessorsOutsideStrings(l, prismaAccessors))
          .join('\n')
      }

      // 2) Campos + enums (escopo de tabela + global)
      if (effective.size > 0) {
        const re = buildRegex(effective)!
        novo = novo
          .split('\n')
          .map((l) => replaceOutsideStrings(l, re, effective))
          .join('\n')
      }

      if (prismaAccessors.size === 0 && effective.size === 0) continue

      if (novo !== src) {
        arquivosTocados++
        if (!dry) writeFileSync(f, novo, 'utf8')
        const tabLabel = tabela ? `[${tabela}]` : '[global-only]'
        console.log(`  ${dry ? '[dry]' : '[ok ]'} ${tabLabel} ${f.replace(ROOT, '.')}`)
      }
    }
  }

  console.log(`\n${arquivosTocados}/${arquivosVarridos} arquivos alterados.`)
  if (arquivosPulados.length) {
    console.log(`\n⚠️  ${arquivosPulados.length} arquivos cross-cutting PULADOS (revisão manual):`)
    for (const f of arquivosPulados) {
      console.log(`  - ${f.replace(ROOT, '.')}`)
    }
  }
  if (dry) console.log('\n(dry-run — nada foi salvo)')
}

main()
