// scripts/ativamente/pedido-cadeia-up.ts
//
// Garante cfg-back (8005) + pedido (8030) prontos para testar a lista.
// Uso rápido antes de testes em tela / após editar código do Pedido.
//
//   npm run pedido:ok

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

const HEALTH_TIMEOUT_MS = 5_000
const PEDIDO_RETRY = 4
const PEDIDO_RETRY_WAIT_MS = 12_000
const CFG_BACK_WAIT_MS = 22_000

const PM2_CONFLITO_CFG_BACK = ['pedido', 'cadastros', 'bid-frete', 'cockpit', 'proc-back'] as const

function execIgnorar(cmd: string): void {
  try {
    execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch {
    /* PM2 pode retornar exit != 0 em stop de processo já parado */
  }
}

async function health(port: number): Promise<'ok' | 'down' | 'degraded'> {
  const url = `http://127.0.0.1:${port}/health`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (res.ok) return 'ok'
    return 'degraded'
  } catch {
    return 'down'
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  console.log('[pedido:ok] Cadeia Configurador → Pedido')

  let cfg = await health(8005)
  if (cfg !== 'ok') {
    console.log('[pedido:ok] cfg-back fora — sequência segura PM2 …')
    execIgnorar(`npx pm2 stop ${PM2_CONFLITO_CFG_BACK.join(' ')}`)
    execIgnorar('npx pm2 restart cfg-back --update-env')
    await sleep(CFG_BACK_WAIT_MS)
    cfg = await health(8005)
  }

  let ped = await health(8030)
  for (let i = 1; ped !== 'ok' && i <= PEDIDO_RETRY; i++) {
    console.log(`[pedido:ok] pedido fora — restart ${i}/${PEDIDO_RETRY} …`)
    execIgnorar('npx pm2 restart pedido --update-env')
    await sleep(PEDIDO_RETRY_WAIT_MS)
    ped = await health(8030)
  }

  const ok = cfg === 'ok' && ped === 'ok'
  console.log(`[pedido:ok] cfg-back:8005 → ${cfg} | pedido:8030 → ${ped}`)

  if (!ok) {
    console.error('[pedido:ok] Falhou. Logs: npx pm2 logs cfg-back pedido')
    process.exit(1)
  }

  console.log('[pedido:ok] ✓ Pronto — http://localhost:8000/pedido/pedidos/lista')
  process.exit(0)
}

main().catch((err: unknown) => {
  console.error('[pedido:ok] Erro fatal:', err)
  process.exit(2)
})
