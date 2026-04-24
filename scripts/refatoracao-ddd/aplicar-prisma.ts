// =====================================================================
// Refatoração DDD — aplica o plano no fragment.prisma de um serviço
// =====================================================================
// - RENAME de model e de campo (REGRA 02: sem @map / @@map — nome Prisma
//   idêntico ao nome PostgreSQL).
// - DELETE de campo (remove a linha inteira do model correspondente).
// - CREATE de campo (insere nova linha no model antes do `@@`/`}`).
//
// Uso:
//   tsx scripts/refatoracao-ddd/aplicar-prisma.ts <nome-servico> [--dry]
// Exemplo:
//   tsx scripts/refatoracao-ddd/aplicar-prisma.ts Cadastros --dry
//   tsx scripts/refatoracao-ddd/aplicar-prisma.ts Cadastros
//
// Descobre o fragment.prisma via heurística (maps de serviço abaixo)
// ou pelo campo `arquivoFragment` do ModelRefactor quando presente.
// =====================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  PlanoCompleto,
  PlanoServico,
  CampoRefactor,
  ModelRefactor,
} from './tipos.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..', '..')

// Mapa servico → fragment.prisma canônico
const FRAGMENT_POR_SERVICO: Record<string, string> = {
  Configurador: 'servicos-global/configurador/prisma/schema.prisma',
  Cadastros: 'servicos-global/tenant/cadastros/prisma/fragment.prisma',
  Tenant: 'servicos-global/tenant/prisma/fragment.prisma', // pode variar
  'Produto - Pedido': 'produto/pedido/server/prisma/fragment.prisma',
  'Produto - SimulaCusto': 'produtos/simulacusto/server/prisma/fragment.prisma',
  'Produto - LPCO': 'produto/lpco/server/prisma/fragment.prisma',
  'Produto - NF Importacao': 'produto/nf-importacao/server/prisma/fragment.prisma',
}

// ---------------------------------------------------------------------
// Mapea tipo DDD → Prisma
// ---------------------------------------------------------------------
function tipoPrisma(tipo: string, obrigatorio: boolean): string {
  const t = (tipo || '').toLowerCase()
  const base = (() => {
    if (t.includes('int')) return 'Int'
    if (t.includes('float') || t.includes('decimal') || t.includes('numer')) return 'Float'
    if (t.includes('bool')) return 'Boolean'
    if (t.includes('date') || t.includes('timestamp')) return 'DateTime'
    if (t.includes('json')) return 'Json'
    if (t.includes('enum')) return 'String' // enum real exige nome do enum — resolver manualmente
    return 'String'
  })()
  return obrigatorio ? base : base + '?'
}

// ---------------------------------------------------------------------
// Editor de texto Prisma (regex-based, preservando formatação)
// ---------------------------------------------------------------------
function renameModel(src: string, antigo: string, novo: string): string {
  if (antigo === novo) return src
  // Declaração `model X {`
  src = src.replace(new RegExp(`\\bmodel\\s+${antigo}\\b`, 'g'), `model ${novo}`)
  // Referências de tipo em outros models (ex: `usuarios Usuario[]`).
  // Restrito a contextos de tipo: após whitespace e antes de whitespace/?/[].
  src = src.replace(new RegExp(`(\\s)${antigo}(\\s|\\?|\\[\\])`, 'g'), `$1${novo}$2`)
  return src
}

function transformModelBlock(
  src: string,
  model: string,
  transform: (body: string) => string,
): string {
  const re = new RegExp(`(model\\s+${model}\\s*\\{)([\\s\\S]*?)(\\n\\})`, '')
  return src.replace(re, (_m, head, body, tail) => head + transform(body) + tail)
}

function renameFieldInModel(
  src: string,
  model: string,
  antigo: string,
  novo: string,
): string {
  if (antigo === novo) return src
  return transformModelBlock(src, model, (body) =>
    body
      // 1) Declaração do campo: começo da linha + indentação + nome + WS (não toca comentários/strings)
      .replace(new RegExp(`^(\\s+)${antigo}(\\s)`, 'gm'), `$1${novo}$2`)
      // 2) Referências em @@unique / @@index / @@id / @@fulltext arrays
      .replace(
        new RegExp(`(@@\\w+\\s*\\(\\s*\\[[^\\]]*?)\\b${antigo}\\b`, 'g'),
        `$1${novo}`,
      )
      // 3) Referências em atributos de relação (@relation(fields: [x], references: [y]))
      .replace(
        new RegExp(`(@relation\\([^)]*?\\b(?:fields|references)\\s*:\\s*\\[[^\\]]*?)\\b${antigo}\\b`, 'g'),
        `$1${novo}`,
      ),
  )
}

function deleteFieldInModel(src: string, model: string, campo: string): string {
  return transformModelBlock(src, model, (body) =>
    body.replace(new RegExp(`\\n[ \\t]+${campo}\\s+[^\\n]+`, ''), ''),
  )
}

function createFieldInModel(
  src: string,
  model: string,
  campo: CampoRefactor,
): string {
  const tipo = tipoPrisma(campo.tipoDado, campo.obrigatorio)
  const def = campo.valorPadrao && campo.valorPadrao !== '-'
    ? ` @default(${formatDefault(campo.valorPadrao, tipo)})`
    : ''
  const linhaNova = `  ${campo.pgNovo.padEnd(28)} ${tipo}${def}`
  return transformModelBlock(src, model, (body) => {
    // Insere antes do primeiro `@@` ou no final do body
    const idx = body.search(/\n\s*@@/)
    if (idx >= 0) {
      return body.slice(0, idx) + '\n' + linhaNova + body.slice(idx)
    }
    return body + '\n' + linhaNova
  })
}

function formatDefault(valor: string, tipo: string): string {
  const v = valor.trim()
  if (tipo.startsWith('Boolean')) return /true|sim|1/i.test(v) ? 'true' : 'false'
  if (tipo.startsWith('Int') || tipo.startsWith('Float')) return v
  if (tipo.startsWith('DateTime') && /now/i.test(v)) return 'now()'
  return `"${v.replace(/"/g, '\\"')}"`
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------
function main() {
  const servicoAlvo = process.argv[2]
  const dry = process.argv.includes('--dry')
  if (!servicoAlvo) {
    console.error('Uso: tsx aplicar-prisma.ts <nome-servico> [--dry]')
    process.exit(1)
  }

  const plano = JSON.parse(
    readFileSync(resolve(__dirname, 'plano.json'), 'utf8'),
  ) as PlanoCompleto

  const servicos = Object.keys(plano.servicos)
  const servico =
    servicos.find((s) => s === servicoAlvo) ||
    servicos.find((s) => s.toLowerCase() === servicoAlvo.toLowerCase()) ||
    servicos.find((s) => s.toLowerCase().includes(servicoAlvo.toLowerCase()))
  if (!servico) {
    console.error(`Serviço não encontrado: ${servicoAlvo}`)
    process.exit(1)
  }
  const p: PlanoServico = plano.servicos[servico]

  const fragRel = FRAGMENT_POR_SERVICO[servico]
  if (!fragRel) {
    console.error(`Sem mapeamento de fragment.prisma para "${servico}". Edite FRAGMENT_POR_SERVICO.`)
    process.exit(1)
  }
  const fragPath = resolve(ROOT, fragRel)
  if (!existsSync(fragPath)) {
    console.error(`Fragment não encontrado: ${fragPath}`)
    process.exit(1)
  }

  let src = readFileSync(fragPath, 'utf8')
  const original = src

  // 1) Renames de model primeiro (afetam campos/FKs)
  for (const m of p.models) {
    if (m.acao === 'RENAME' && m.prismaAtual && m.prismaNovo) {
      src = renameModel(src, m.prismaAtual, m.prismaNovo)
      console.log(`  [model RENAME] ${m.prismaAtual} → ${m.prismaNovo}`)
    }
  }

  // 2) Renames/deletes/creates de campos
  for (const c of p.campos) {
    // Nome do model no arquivo pode ter sido renomeado na etapa 1 →
    // procura primeiro pelo novo nome, depois pelo antigo.
    const modelRenamed = p.models.find(
      (m) => m.acao === 'RENAME' && (m.prismaAtual === c.tabela || m.pgAtual === c.tabela),
    )
    const modelName = modelRenamed?.prismaNovo || c.tabela

    if (c.acao === 'RENAME' && c.prismaAtual !== c.prismaNovo) {
      src = renameFieldInModel(src, modelName, c.prismaAtual, c.prismaNovo)
      console.log(`  [campo RENAME] ${modelName}.${c.prismaAtual} → ${c.prismaNovo}`)
    } else if (c.acao === 'DELETE') {
      src = deleteFieldInModel(src, modelName, c.prismaAtual)
      console.log(`  [campo DELETE] ${modelName}.${c.prismaAtual}`)
    } else if (c.acao === 'CREATE') {
      src = createFieldInModel(src, modelName, c)
      console.log(`  [campo CREATE] ${modelName}.${c.pgNovo}`)
    }
  }

  // 3) Renames de enum
  for (const e of p.enums) {
    if (e.nomeAtual === e.nomeNovo) continue
    src = src.replace(new RegExp(`\\benum\\s+${e.nomeAtual}\\b`, 'g'), `enum ${e.nomeNovo}`)
    // Referências em types de campo
    src = src.replace(
      new RegExp(`(\\s)${e.nomeAtual}(\\s|\\?|\\[\\])`, 'g'),
      `$1${e.nomeNovo}$2`,
    )
    console.log(`  [enum RENAME] ${e.nomeAtual} → ${e.nomeNovo}`)
  }

  if (src === original) {
    console.log('Nenhuma mudança aplicada (plano vazio ou alvo já está DDD).')
    return
  }

  if (dry) {
    console.log('\n--- DRY RUN (diff não salvo) ---')
    console.log(`Arquivo: ${fragPath}`)
    console.log(`Tamanho original: ${original.length}`)
    console.log(`Tamanho final:    ${src.length}`)
    console.log('Use sem --dry para aplicar.')
  } else {
    writeFileSync(fragPath, src, 'utf8')
    console.log(`\n✅ Fragment atualizado: ${fragPath}`)
  }
}

main()
