// scripts/ativamente/check-imports-produto-irmao.ts
//
// Detecta imports quebrados entre produtos irmãos em servicos-global/produto/.
// Bug real (2026-05-24): Pedido crashou com ERR_MODULE_NOT_FOUND porque
// lista-pedido-kpis.ts usou:
//   ../../../../../servicos-global/produto/processos-core/...
// a partir de server/src/routes/ — sobe 5 níveis, cai DENTRO de servicos-global/,
// e o segmento servicos-global/ no import duplica o caminho.
//
// REGRAS (arquivos em servicos-global/produto/<pkg>/, exceto processos-core):
//   1. Proibido import relativo contendo `servicos-global/produto/` — usar irmão
//      ex: `../../../../processos-core/src/...` (copiar importacao-pedido-wrapper.ts)
//   2. Proibido `servicos-global/servicos-global` em qualquer import
//
// USO:
//   npx tsx scripts/ativamente/check-imports-produto-irmao.ts
//   npx tsx scripts/ativamente/check-imports-produto-irmao.ts arq1.ts arq2.ts  # lint-staged
//
// Skill: skills/governanca/convencao-tecnica/monorepo/SKILL.md §1.ter

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')

const PREFIXO_PRODUTO = ['servicos-global', 'produto'].join('/')
const REGEX_IMPORT = /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g
const REGEX_SERVICOS_GLOBAL_DUP = /servicos-global\/servicos-global/
const REGEX_PRODUTO_ABSOLUTO = /servicos-global\/produto\//

interface Achado {
  arquivo: string
  linha: number
  motivo: string
  trecho: string
}

function normalizar(p: string): string {
  return p.replace(/\\/g, '/')
}

function estaEmProdutoIrmao(caminho: string): boolean {
  const rel = normalizar(relative(repoRoot, caminho))
  if (!rel.startsWith(`${PREFIXO_PRODUTO}/`)) return false
  if (rel.startsWith(`${PREFIXO_PRODUTO}/processos-core/`)) return false
  return true
}

function escanearArquivo(caminho: string): Achado[] {
  if (!caminho.endsWith('.ts') && !caminho.endsWith('.tsx')) return []
  if (!estaEmProdutoIrmao(caminho)) return []

  let conteudo: string
  try { conteudo = readFileSync(caminho, 'utf-8') } catch { return [] }

  const achados: Achado[] = []
  const linhas = conteudo.split('\n')

  for (let i = 0; i < linhas.length; i++) {
    const raw = linhas[i]
    if (raw === undefined) continue
    if (!raw.includes('servicos-global')) continue

    REGEX_IMPORT.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = REGEX_IMPORT.exec(raw)) !== null) {
      const spec = m[1]
      if (!spec.startsWith('.')) continue

      if (REGEX_SERVICOS_GLOBAL_DUP.test(spec)) {
        achados.push({
          arquivo: caminho,
          linha: i + 1,
          motivo: 'Caminho duplica servicos-global (servicos-global/servicos-global)',
          trecho: raw.trim().slice(0, 160),
        })
        continue
      }

      if (REGEX_PRODUTO_ABSOLUTO.test(spec)) {
        achados.push({
          arquivo: caminho,
          linha: i + 1,
          motivo: 'Use import relativo ao irmão (ex: ../../../../processos-core/...) — não repita servicos-global/produto/ dentro de servicos-global/produto/',
          trecho: raw.trim().slice(0, 160),
        })
      }
    }
  }

  return achados
}

function listarTs(raiz: string, acc: string[] = []): string[] {
  let entradas: string[]
  try { entradas = readdirSync(raiz) } catch { return acc }

  for (const nome of entradas) {
    if (nome === 'node_modules' || nome === '.git' || nome === 'dist' || nome === 'generated') continue
    const caminho = join(raiz, nome)
    let st
    try { st = statSync(caminho) } catch { continue }
    if (st.isDirectory()) {
      listarTs(caminho, acc)
    } else if (caminho.endsWith('.ts') || caminho.endsWith('.tsx')) {
      if (!caminho.endsWith('.d.ts')) acc.push(caminho)
    }
  }
  return acc
}

const argv = process.argv.slice(2)
const arquivos = argv.length > 0
  ? argv.map(a => (a.startsWith('/') || /^[A-Za-z]:/.test(a) ? a : join(process.cwd(), a)))
  : listarTs(join(repoRoot, 'servicos-global', 'produto'))

const todosAchados: Achado[] = []
for (const arq of arquivos) {
  todosAchados.push(...escanearArquivo(arq))
}

if (todosAchados.length === 0) {
  console.log(`[check-imports-produto-irmao] OK — ${arquivos.length} arquivo(s), nenhum import proibido entre produtos irmãos.`)
  process.exit(0)
}

console.error(`[check-imports-produto-irmao] ${todosAchados.length} violação(ões):\n`)
for (const a of todosAchados) {
  const rel = relative(repoRoot, a.arquivo).replace(/\\/g, '/')
  console.error(`  ${rel}:${a.linha}`)
  console.error(`    ${a.motivo}`)
  console.error(`    ${a.trecho}\n`)
}

console.error(
  'Referência: servicos-global/produto/pedido/server/src/routes/importacao-pedido-wrapper.ts\n' +
  'Skill: skills/governanca/convencao-tecnica/monorepo/SKILL.md §1.ter\n',
)
process.exit(1)
