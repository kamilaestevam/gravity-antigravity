// scripts/ativamente/servidores-up.ts
//
// Sobe todos os servidores PM2 do dev local e reporta quais estavam fora.
//
// Uso:
//   npm run servidores              — diagnóstico + sobe o que faltar
//   npm run servidores -- --status  — só diagnóstico (não inicia/reinicia)
//
// Saída: tabela legível + última linha JSON (para o agente parsear).

import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  MODULOS_SERVIDOR_PLATAFORMA,
  SERVIDORES_PM2,
  type ServidorDev,
} from './servidores-registry.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

const SOMENTE_STATUS = process.argv.includes('--status')
const HEALTH_TIMEOUT_MS = 4_000
const BOOT_WAIT_MS = 12_000
const CFG_BACK_BOOT_WAIT_MS = 20_000
const POLL_INTERVAL_MS = 2_000
const POLL_MAX_MS = 30_000

/**
 * Portas disputadas quando cfg-back sobe sidecars embutidos (modo Railway).
 * Com GRAVITY_DEV_PM2=1 no ecosystem, cfg-back não as usa — parar antes do restart
 * evita EADDRINUSE e boot lento durante a transição.
 */
const PM2_CONFLITO_CFG_BACK = [
  'pedido',
  'cadastros',
  'bid-frete',
  'cockpit',
  'proc-back',
] as const

type StatusHttp = 'ok' | 'down' | 'degraded'
type StatusPm2 = 'online' | 'stopped' | 'errored' | 'missing' | 'launching' | 'unknown'

interface ResultadoServidor {
  pm2Name: string
  label: string
  port: number
  grupo: ServidorDev['grupo']
  pm2: StatusPm2
  http: StatusHttp
  estavaFora: boolean
  acao?: 'iniciado' | 'reiniciado' | 'nenhuma'
  erro?: string
}

interface Pm2Proc {
  name?: string
  pm2_env?: { status?: string; pm_uptime?: number; restart_time?: number }
}

function exec(cmd: string): string {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function execIgnorarErro(cmd: string): string {
  try {
    return exec(cmd)
  } catch {
    return ''
  }
}

function lerPm2(): Map<string, StatusPm2> {
  const raw = execIgnorarErro('npx pm2 jlist')
  if (!raw) return new Map()

  let lista: Pm2Proc[]
  try {
    lista = JSON.parse(raw) as Pm2Proc[]
  } catch {
    return new Map()
  }

  const map = new Map<string, StatusPm2>()
  for (const proc of lista) {
    const name = proc.name
    if (!name) continue
    const status = proc.pm2_env?.status ?? 'unknown'
    if (status === 'online') map.set(name, 'online')
    else if (status === 'stopped') map.set(name, 'stopped')
    else if (status === 'errored' || status === 'waiting restart') map.set(name, 'errored')
    else if (status === 'launching') map.set(name, 'launching')
    else map.set(name, 'unknown')
  }
  return map
}

async function checarHttp(port: number, healthPath: string): Promise<{ http: StatusHttp; erro?: string }> {
  const url = `http://127.0.0.1:${port}${healthPath}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (res.ok || (healthPath === '/' && res.status < 500)) {
      return { http: 'ok' }
    }
    return { http: 'degraded', erro: `HTTP ${res.status}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { http: 'down', erro: msg.includes('abort') ? 'timeout' : msg }
  } finally {
    clearTimeout(timer)
  }
}

function pm2StartEcosystem(): void {
  exec('npx pm2 start ecosystem.config.cjs')
}

function pm2Restart(nome: string): void {
  execIgnorarErro(`npx pm2 restart ${nome}`)
}

function pm2Stop(nomes: readonly string[]): void {
  if (nomes.length === 0) return
  execIgnorarErro(`npx pm2 stop ${nomes.join(' ')}`)
}

/** Reinicia cfg-back com GRAVITY_DEV_PM2 e sem disputa de porta com sidecars PM2. */
function pm2RestartCfgBackSeguro(): void {
  pm2Stop([...PM2_CONFLITO_CFG_BACK])
  execIgnorarErro('npx pm2 restart cfg-back --update-env')
  for (const nome of PM2_CONFLITO_CFG_BACK) {
    pm2StartOnly(nome)
  }
}

function pm2StartOnly(nome: string): void {
  execIgnorarErro(`npx pm2 start ecosystem.config.cjs --only ${nome}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function diagnosticar(pm2Map: Map<string, StatusPm2>): Promise<ResultadoServidor[]> {
  const resultados: ResultadoServidor[] = []
  for (const srv of SERVIDORES_PM2) {
    const pm2 = pm2Map.get(srv.pm2Name) ?? 'missing'
    const healthPath = srv.healthPath ?? '/health'
    const { http, erro } = await checarHttp(srv.port, healthPath)
    const estavaFora = pm2 !== 'online' || http !== 'ok'
    resultados.push({
      pm2Name: srv.pm2Name,
      label: srv.label,
      port: srv.port,
      grupo: srv.grupo,
      pm2,
      http,
      estavaFora,
      erro,
    })
  }
  return resultados
}

function imprimirTabela(resultados: ResultadoServidor[], titulo: string): void {
  console.log(`\n${titulo}`)
  console.log('─'.repeat(72))
  const col = (s: string, w: number) => s.padEnd(w).slice(0, w)
  console.log(
    `${col('PM2', 14)} ${col('Porta', 6)} ${col('PM2', 10)} ${col('HTTP', 10)} ${col('Serviço', 28)}`,
  )
  console.log('─'.repeat(72))
  for (const r of resultados) {
    const icone = r.http === 'ok' && r.pm2 === 'online' ? '✓' : '✗'
    console.log(
      `${icone} ${col(r.pm2Name, 12)} ${col(String(r.port), 6)} ${col(r.pm2, 10)} ${col(r.http, 10)} ${col(r.label, 28)}`,
    )
    if (r.erro && r.http !== 'ok') {
      console.log(`    └─ ${r.erro}`)
    }
    if (r.acao) {
      console.log(`    └─ ação: ${r.acao}`)
    }
  }
  console.log('─'.repeat(72))
  console.log(
    `Módulos dentro de org:3001 → ${MODULOS_SERVIDOR_PLATAFORMA.join(', ')}`,
  )
}

async function main(): Promise<void> {
  console.log('[servidores] Gravity — diagnóstico de servidores locais')
  console.log(`[servidores] Modo: ${SOMENTE_STATUS ? 'somente status' : 'subir + status'}`)

  let pm2Map = lerPm2()
  const antes = await diagnosticar(pm2Map)

  const foraAntes = antes.filter((r) => r.estavaFora)
  if (foraAntes.length > 0) {
    console.log(`\n[servidores] ${foraAntes.length}/${antes.length} fora antes da ação:`)
    for (const r of foraAntes) {
      console.log(`  • ${r.pm2Name} (:${r.port}) — pm2=${r.pm2} http=${r.http}`)
    }
  } else {
    console.log(`\n[servidores] Todos os ${antes.length} processos respondendo antes da ação.`)
  }

  let acoes = { iniciados: 0, reiniciados: 0 }

  if (!SOMENTE_STATUS && foraAntes.length > 0) {
    const nenhumPm2 = pm2Map.size === 0
    if (nenhumPm2) {
      console.log('\n[servidores] PM2 vazio — iniciando ecosystem.config.cjs …')
      pm2StartEcosystem()
      acoes.iniciados = SERVIDORES_PM2.length
    } else {
      for (const r of foraAntes) {
        const pm2 = pm2Map.get(r.pm2Name) ?? 'missing'
        if (pm2 === 'missing') {
          console.log(`[servidores] Iniciando ${r.pm2Name} …`)
          pm2StartOnly(r.pm2Name)
          r.acao = 'iniciado'
          acoes.iniciados++
        } else if (
          pm2 === 'errored'
          || pm2 === 'stopped'
          || pm2 === 'launching'
          || pm2 === 'unknown'
          || r.http !== 'ok'
        ) {
          if (r.pm2Name === 'cfg-back') {
            console.log('[servidores] Reiniciando cfg-back (sequência segura PM2) …')
            pm2RestartCfgBackSeguro()
          } else {
            console.log(`[servidores] Reiniciando ${r.pm2Name} …`)
            pm2Restart(r.pm2Name)
          }
          r.acao = 'reiniciado'
          acoes.reiniciados++
        }
      }
    }

    const cfgBackReiniciado = foraAntes.some((r) => r.pm2Name === 'cfg-back' && r.acao === 'reiniciado')
    const esperaMs = cfgBackReiniciado ? CFG_BACK_BOOT_WAIT_MS : BOOT_WAIT_MS
    console.log(`\n[servidores] Aguardando ${esperaMs / 1000}s para boot …`)
    await sleep(esperaMs)

    const deadline = Date.now() + POLL_MAX_MS
    let depois = await diagnosticar(lerPm2())
    while (depois.some((r) => r.estavaFora) && Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS)
      depois = await diagnosticar(lerPm2())
    }

    pm2Map = lerPm2()
    const final = await diagnosticar(pm2Map)
    for (const r of final) {
      const prev = foraAntes.find((x) => x.pm2Name === r.pm2Name)
      if (prev?.acao) r.acao = prev.acao
    }

    imprimirTabela(final, '[servidores] Status final')

    const ok = final.filter((r) => !r.estavaFora).length
    const down = final.filter((r) => r.estavaFora).length

    if (down > 0) {
      console.log(`\n[servidores] ⚠ ${down} ainda fora. Ver logs: npx pm2 logs ${final.find((r) => r.estavaFora)?.pm2Name}`)
    } else {
      console.log(`\n[servidores] ✓ Todos os ${ok} servidores online.`)
    }

    const payload = {
      ok,
      down,
      total: final.length,
      acoes,
      servidores: final.map((r) => ({
        pm2Name: r.pm2Name,
        label: r.label,
        port: r.port,
        pm2: r.pm2,
        http: r.http,
        online: !r.estavaFora,
        acao: r.acao ?? null,
        erro: r.erro ?? null,
      })),
      modulosOrg3001: [...MODULOS_SERVIDOR_PLATAFORMA],
    }
    console.log(JSON.stringify(payload))
    process.exit(down > 0 ? 1 : 0)
  }

  imprimirTabela(antes, '[servidores] Status atual')
  const ok = antes.filter((r) => !r.estavaFora).length
  const down = antes.filter((r) => r.estavaFora).length
  console.log(JSON.stringify({
    ok,
    down,
    total: antes.length,
    acoes: null,
    servidores: antes.map((r) => ({
      pm2Name: r.pm2Name,
      label: r.label,
      port: r.port,
      pm2: r.pm2,
      http: r.http,
      online: !r.estavaFora,
      acao: null,
      erro: r.erro ?? null,
    })),
    modulosOrg3001: [...MODULOS_SERVIDOR_PLATAFORMA],
  }))
  process.exit(down > 0 ? 1 : 0)
}

main().catch((err: unknown) => {
  console.error('[servidores] Erro fatal:', err)
  process.exit(2)
})
