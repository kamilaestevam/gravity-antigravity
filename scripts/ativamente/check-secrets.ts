// scripts/ativamente/check-secrets.ts
//
// Pre-commit hook: detecta segredos acidentais em arquivos staged.
//
// Padroes bloqueados:
//   - postgresql://...:...@   (URLs de banco com senha)
//   - sk_live_*, sk_test_*    (Stripe secret keys)
//   - pk_live_*, pk_test_*    (Clerk publishable keys)
//   - re_*                    (Resend API keys)
//   - AIzaSy*                 (Google API keys)
//   - chaves hex 64+ chars    (possivel ENCRYPTION_KEY, private key, etc.)
//
// Exceções:
//   - Arquivos .env.example (template, nunca contem valores reais)
//   - Arquivos em node_modules/, dist/, generated/, .git/
//   - Linhas que sao comentarios (// ou #)
//   - Linhas com placeholder vazio (KEY= sem valor, KEY="")
//
// USO:
//   npx tsx scripts/ativamente/check-secrets.ts            # varre tudo
//   npx tsx scripts/ativamente/check-secrets.ts arq1 arq2  # arquivos staged (lint-staged)

import { readFileSync } from 'node:fs'
import { join, relative, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')

// ─────────────────────────────────────────────────────────────────────────────
// Padroes de segredo
// ─────────────────────────────────────────────────────────────────────────────

interface Padrao {
  nome: string
  regex: RegExp
}

const PADROES: Padrao[] = [
  {
    nome: 'Database URL com senha',
    regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@/i,
  },
  {
    nome: 'Stripe secret key',
    regex: /sk_(?:live|test)_[A-Za-z0-9]{10,}/,
  },
  {
    nome: 'Clerk publishable key',
    regex: /pk_(?:live|test)_[A-Za-z0-9]{10,}/,
  },
  {
    nome: 'Resend API key',
    regex: /re_[A-Za-z0-9]{20,}/,
  },
  {
    nome: 'Google API key',
    regex: /AIzaSy[A-Za-z0-9_-]{30,}/,
  },
  {
    nome: 'Chave hex longa (possivel encryption key ou private key)',
    regex: /(?:KEY|SECRET|TOKEN|PASSWORD)\s*=\s*['"]?[0-9a-fA-F]{64,}['"]?/,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Detector
// ─────────────────────────────────────────────────────────────────────────────

interface Achado {
  arquivo: string
  linha: number
  trecho: string
  padrao: string
}

function deveIgnorarArquivo(caminho: string): boolean {
  const normalizado = caminho.replace(/\\/g, '/')
  if (normalizado.includes('/node_modules/')) return true
  if (normalizado.includes('/dist/')) return true
  if (normalizado.includes('/generated/')) return true
  if (normalizado.includes('/.git/')) return true
  const nome = basename(caminho)
  if (nome === '.env.example') return true
  if (nome.endsWith('.lock')) return true
  if (nome.endsWith('.png') || nome.endsWith('.jpg') || nome.endsWith('.gif') || nome.endsWith('.ico')) return true
  if (nome.endsWith('.woff') || nome.endsWith('.woff2') || nome.endsWith('.ttf')) return true
  return false
}

function linhaEhComentario(linha: string): boolean {
  const trimmed = linha.trim()
  return trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*') || trimmed.startsWith('/*')
}

function linhaEhPlaceholderVazio(linha: string): boolean {
  // KEY= ou KEY="" ou KEY='' (sem valor real)
  return /=\s*['"]?\s*['"]?\s*$/.test(linha)
}

function escanearArquivo(caminho: string): Achado[] {
  let conteudo: string
  try { conteudo = readFileSync(caminho, 'utf-8') } catch { return [] }

  const achados: Achado[] = []
  const linhas = conteudo.split('\n')

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]
    if (linha === undefined) continue
    if (linhaEhComentario(linha)) continue
    if (linhaEhPlaceholderVazio(linha)) continue

    for (const padrao of PADROES) {
      if (padrao.regex.test(linha)) {
        achados.push({
          arquivo: caminho,
          linha: i + 1,
          trecho: linha.trim().slice(0, 100),
          padrao: padrao.nome,
        })
        break // uma violacao por linha basta
      }
    }
  }

  return achados
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
let arquivos: string[]
if (argv.length > 0) {
  arquivos = argv.map(a => (a.startsWith('/') || a.includes(':') ? a : join(process.cwd(), a)))
} else {
  console.log('[check-secrets] Nenhum arquivo recebido. Use via lint-staged ou passe arquivos como argumento.')
  process.exit(0)
}

// Filtra arquivos que devem ser ignorados
arquivos = arquivos.filter(a => !deveIgnorarArquivo(a))

let totalAchados = 0
const porArquivo = new Map<string, Achado[]>()

for (const arq of arquivos) {
  const achados = escanearArquivo(arq)
  if (achados.length > 0) {
    porArquivo.set(arq, achados)
    totalAchados += achados.length
  }
}

if (totalAchados === 0) {
  console.log(`[check-secrets] OK — ${arquivos.length} arquivo(s) varrido(s), nenhum segredo detectado.`)
  process.exit(0)
}

console.error(`\n[check-secrets] BLOQUEADO — ${totalAchados} possivel(is) segredo(s) em ${porArquivo.size} arquivo(s):\n`)
for (const [arq, achados] of porArquivo) {
  const rel = relative(repoRoot, arq).replace(/\\/g, '/')
  console.error(`  ${rel}`)
  for (const a of achados) {
    console.error(`    L${a.linha} [${a.padrao}]:  ${a.trecho}`)
  }
  console.error('')
}

console.error(
  `Segredos nao devem ser commitados. Se o valor e um placeholder ou\n` +
  `exemplo, mova para .env.example (sem valor real). Se e um segredo\n` +
  `de verdade, use variaveis de ambiente ou um vault.\n` +
  `\n` +
  `Para forcar o commit (CUIDADO): git commit --no-verify\n`,
)
process.exit(1)
