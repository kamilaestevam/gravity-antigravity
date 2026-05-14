// scripts/ativamente/dev-reset.ts
//
// Reset do ambiente local de desenvolvimento. Limpa o estado que dá problema
// recorrente quando vários agentes editam código em paralelo:
//
//   1. Mata processos node "zombis" que ficaram segurando porta após tsx watch
//      crashar (sintoma: EADDRINUSE no próximo `npm run dev`).
//   2. Apaga o cache do Vite (`node_modules/.vite`) em TODOS os pacotes com
//      `vite.config.ts` — vita cache stale após mudança de estrutura
//      (sintoma: "X is not defined" mesmo com código correto).
//
// Uso:   npm run dev:reset
// Pré-requisito: Windows (usa `netstat` e `taskkill`). Para Linux/Mac
//                portar para `lsof` + `kill`.
//
// Não toca em `.env`, banco, schema, nada destrutivo de dados. Só caches +
// processos.

import { execSync } from 'node:child_process'
import { rmSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Portas conhecidas dos serviços do dev master (ver `dev` no package.json).
// Mantida estática para evitar parsing do package.json a cada execução.
const PORTAS_DEV = [
  3001,  // Plataforma (ORG)
  8000,  // Configurador front
  8005,  // Configurador back
  8016,  // API-Cockpit
  8020,  // Simula-Custo
  8026,  // Processo
  8030,  // Pedido
  8031,  // Cadastros
] as const

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')

// ─────────────────────────────────────────────────────────────────────────────
// Passo 1 — matar processos nas portas conhecidas
// ─────────────────────────────────────────────────────────────────────────────

function matarProcessoNaPorta(porta: number): { porta: number; pid?: number; status: string } {
  try {
    // `netstat -ano | findstr :PORTA` retorna linhas tipo:
    // "  TCP    0.0.0.0:8030    0.0.0.0:0    LISTENING    11176"
    const saida = execSync(`netstat -ano -p TCP | findstr LISTENING | findstr :${porta} `, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const match = saida.match(/LISTENING\s+(\d+)/)
    if (!match) return { porta, status: 'livre' }
    const pid = Number(match[1])
    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
    return { porta, pid, status: 'morto' }
  } catch {
    return { porta, status: 'livre' }
  }
}

console.log('[dev-reset] Matando processos nas portas do dev master…')
for (const porta of PORTAS_DEV) {
  const r = matarProcessoNaPorta(porta)
  const tag = r.status === 'morto' ? `morto (PID ${r.pid})` : 'já livre'
  console.log(`  porta ${r.porta}  → ${tag}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Passo 2 — limpar caches do Vite em todos os pacotes
// ─────────────────────────────────────────────────────────────────────────────

function acharCachesVite(raiz: string, profundidadeRestante = 6): string[] {
  // Procura pastas `node_modules/.vite` em qualquer subdiretório.
  // Ignora node_modules ANINHADO (caches dentro de deps não nos interessam).
  const achados: string[] = []
  if (profundidadeRestante < 0) return achados

  let entradas: string[]
  try {
    entradas = readdirSync(raiz)
  } catch {
    return achados
  }

  for (const nome of entradas) {
    if (nome === '.git') continue
    const caminho = join(raiz, nome)
    let st
    try { st = statSync(caminho) } catch { continue }
    if (!st.isDirectory()) continue

    if (nome === 'node_modules') {
      const cacheVite = join(caminho, '.vite')
      if (existsSync(cacheVite)) achados.push(cacheVite)
      // Não desce em node_modules (caches de deps)
      continue
    }

    achados.push(...acharCachesVite(caminho, profundidadeRestante - 1))
  }
  return achados
}

console.log('\n[dev-reset] Procurando caches do Vite…')
const caches = acharCachesVite(repoRoot)
if (caches.length === 0) {
  console.log('  nenhum cache encontrado')
} else {
  for (const c of caches) {
    try {
      rmSync(c, { recursive: true, force: true })
      console.log(`  apagado: ${c.replace(repoRoot, '.')}`)
    } catch (err) {
      console.log(`  erro:    ${c.replace(repoRoot, '.')}  (${String(err)})`)
    }
  }
}

console.log('\n[dev-reset] Reset concluído. Rode `npm run dev`.')
