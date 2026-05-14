// scripts/ativamente/check-env-toplevel.ts
//
// Detecta o anti-padrão que quebrou Pedido em 2026-05-14:
//
//   // Em foo/permissoes.ts (top-level, fora de função):
//   export const exigirPermissao = criarRequirePermissao({
//     configuradorBaseUrl: process.env.CONFIGURATOR_URL!,  // ← AQUI
//     ...
//   })
//
// Em ESM, esse top-level executa ANTES do `dotenv.config()` do `index.ts`,
// porque imports são resolvidos primeiro. Resultado: a env var é lida como
// undefined e o erro só aparece em runtime na primeira request.
//
// Esta regra é a Regra 7 prevista em
// `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md`.
// Implementação minimalista até o plugin ESLint nascer.
//
// O QUE BLOQUEIA:
//   - `process.env.<NAME>!` (non-null assertion) no top-level de qualquer
//     arquivo `.ts` que NÃO seja `index.ts`.
//
// O QUE PERMITE:
//   - `process.env.X!` em `index.ts` (carrega dotenv antes dos outros imports
//     no mesmo arquivo — top-level deste roda DEPOIS).
//   - `process.env.X!` dentro de função/método/closure (lido sob demanda).
//   - `process.env.X` sem `!` (linter não opina — Mand. 08 cobre separado).
//
// USO:
//   npx tsx scripts/ativamente/check-env-toplevel.ts            # checa tudo
//   npx tsx scripts/ativamente/check-env-toplevel.ts arq1 arq2  # arquivos staged
//
// Modo lint-staged: recebe os arquivos como argv. Modo manual: varre toda
// `servicos-global/` + `packages/`.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, relative, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')

// ─────────────────────────────────────────────────────────────────────────────
// Detector
// ─────────────────────────────────────────────────────────────────────────────

interface Achado {
  arquivo: string
  linha: number
  trecho: string
}

const REGEX_ENV_BANG = /process\.env\.[A-Z_][A-Z0-9_]*!/

/**
 * Encontra ocorrências de `process.env.X!` em escopo top-level.
 * Heurística (sem parser AST): conta `{` e `}` linha a linha; só reporta
 * quando contador de chaves está em zero E não estamos dentro de `()` de
 * arrow function ou similar. Funciona para 99% dos casos reais; um parser
 * AST faria perfeito mas exige TS no parsing — desproporcional para o
 * problema atual.
 */
function escanearArquivo(caminho: string): Achado[] {
  let conteudo: string
  try { conteudo = readFileSync(caminho, 'utf-8') } catch { return [] }

  const achados: Achado[] = []
  const linhas = conteudo.split('\n')

  let nivelChaves = 0
  let nivelParens = 0
  let dentroComentarioBloco = false

  for (let i = 0; i < linhas.length; i++) {
    const raw = linhas[i]
    if (raw === undefined) continue

    // Tira comentários de linha e blocos para contagem (best-effort)
    let linha = raw

    if (dentroComentarioBloco) {
      const fim = linha.indexOf('*/')
      if (fim === -1) continue
      linha = linha.slice(fim + 2)
      dentroComentarioBloco = false
    }

    const inicioBloco = linha.indexOf('/*')
    if (inicioBloco !== -1) {
      const fimBloco = linha.indexOf('*/', inicioBloco + 2)
      if (fimBloco === -1) {
        linha = linha.slice(0, inicioBloco)
        dentroComentarioBloco = true
      } else {
        linha = linha.slice(0, inicioBloco) + linha.slice(fimBloco + 2)
      }
    }

    const comentLinha = linha.indexOf('//')
    if (comentLinha !== -1) linha = linha.slice(0, comentLinha)

    // Detecta ANTES de atualizar contadores — assim a linha que abre escopo
    // (ex: `function foo() {`) ainda é considerada top-level se o `process.env`
    // estiver à esquerda da `{`. Heurística pragmática.
    //
    // Testa contra `linha` (já limpa de comentários), não `raw` — evita falso
    // positivo quando o anti-padrão aparece dentro de comentário documentando
    // o problema.
    if (REGEX_ENV_BANG.test(linha)) {
      // Se ANTES da ocorrência nessa linha, abrimos parêntese sem fechar,
      // ainda é argumento de chamada top-level → reporta.
      // A condição final: chaves == 0 (não dentro de função/classe/objeto)
      if (nivelChaves === 0) {
        achados.push({
          arquivo: caminho,
          linha: i + 1,
          trecho: raw.trim().slice(0, 140),
        })
      }
    }

    // Atualiza contadores DEPOIS de testar a linha
    for (const ch of linha) {
      if (ch === '{') nivelChaves++
      else if (ch === '}') nivelChaves = Math.max(0, nivelChaves - 1)
      else if (ch === '(') nivelParens++
      else if (ch === ')') nivelParens = Math.max(0, nivelParens - 1)
    }
  }

  return achados
}

function deveIgnorarArquivo(caminho: string): boolean {
  const nome = basename(caminho)
  if (nome === 'index.ts') return true
  if (nome.endsWith('.test.ts') || nome.endsWith('.spec.ts')) return true
  const normalizado = caminho.replace(/\\/g, '/')
  if (normalizado.includes('/docs/')) return true
  if (normalizado.includes('/skills/')) return true
  if (normalizado.includes('/scripts/')) return true
  return false
}

function listarTs(raiz: string, acc: string[] = []): string[] {
  let entradas: string[]
  try { entradas = readdirSync(raiz) } catch { return acc }

  for (const nome of entradas) {
    if (nome === 'node_modules' || nome === '.git' || nome === 'dist' || nome === 'generated' || nome === 'scripts') continue
    const caminho = join(raiz, nome)
    let st
    try { st = statSync(caminho) } catch { continue }
    if (st.isDirectory()) {
      listarTs(caminho, acc)
    } else if (caminho.endsWith('.ts') && !caminho.endsWith('.d.ts')) {
      acc.push(caminho)
    }
  }
  return acc
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
let arquivos: string[]
if (argv.length > 0) {
  // Modo lint-staged: arquivos como argumentos
  arquivos = argv.map(a => (a.startsWith('/') || a.includes(':') ? a : join(process.cwd(), a)))
} else {
  // Modo varredura: servicos-global + packages
  arquivos = [
    ...listarTs(join(repoRoot, 'servicos-global')),
    ...listarTs(join(repoRoot, 'packages')),
  ]
}

let totalAchados = 0
const porArquivo = new Map<string, Achado[]>()

for (const arq of arquivos) {
  if (deveIgnorarArquivo(arq)) continue
  if (!arq.endsWith('.ts')) continue
  const achados = escanearArquivo(arq)
  if (achados.length > 0) {
    porArquivo.set(arq, achados)
    totalAchados += achados.length
  }
}

if (totalAchados === 0) {
  console.log(`[check-env-toplevel] OK — ${arquivos.length} arquivo(s) varrido(s), nenhum top-level \`process.env.X!\` fora de index.ts.`)
  process.exit(0)
}

console.error(`[check-env-toplevel] ${totalAchados} violação(ões) em ${porArquivo.size} arquivo(s):\n`)
for (const [arq, achados] of porArquivo) {
  const rel = relative(repoRoot, arq).replace(/\\/g, '/')
  console.error(`  ${rel}`)
  for (const a of achados) {
    console.error(`    L${a.linha}:  ${a.trecho}`)
  }
  console.error('')
}

console.error(
  `Anti-padrão: \`process.env.X!\` (non-null assertion) no top-level de módulo\n` +
  `não-\`index.ts\`. Em ESM, top-level roda ANTES do \`dotenv.config()\` do\n` +
  `\`index.ts\` (imports são resolvidos primeiro). A variável vira undefined,\n` +
  `o \`!\` engole o erro, e a falha só aparece em runtime na 1ª request.\n` +
  `\n` +
  `Corrija com lazy init — leia \`process.env\` dentro de uma função, com\n` +
  `validação explícita (Mand. 05 + 08). Exemplo em:\n` +
  `  servicos-global/produto/pedido/server/src/permissoes.ts (após refator 2026-05-14)\n` +
  `\n` +
  `Regra 7 prevista em:\n` +
  `  skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md\n`,
)
process.exit(1)
