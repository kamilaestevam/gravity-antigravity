'use strict'

/**
 * Launcher PM2 para backends no Windows.
 *
 * PM2 já esconde a janela do processo pai, mas `tsx watch` cria filhos Node
 * que abrem console visível. Este script re-spawna tsx com windowsHide: true.
 *
 * Variáveis (definidas no ecosystem.config.cjs):
 *   PM2_DEV_ENTRY       — entrypoint relativo ao cwd (ex: server/src/index.ts)
 *   PM2_DEV_ENV_FILES   — paths --env-file separados por |
 */

const { spawn } = require('child_process')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const TSX = path.join(ROOT, 'node_modules/tsx/dist/cli.mjs')

const entry = process.env.PM2_DEV_ENTRY
const envFiles = (process.env.PM2_DEV_ENV_FILES ?? '')
  .split('|')
  .map((f) => f.trim())
  .filter(Boolean)

if (!entry) {
  console.error('[pm2-dev-launcher] PM2_DEV_ENTRY ausente')
  process.exit(1)
}

const args = ['watch']
for (const envFile of envFiles) {
  args.push('--env-file', envFile)
}
args.push(entry)

const child = spawn(process.execPath, [TSX, ...args], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

function forwardSignal(signal) {
  if (!child.killed) {
    child.kill(signal)
  }
}

process.on('SIGINT', () => forwardSignal('SIGINT'))
process.on('SIGTERM', () => forwardSignal('SIGTERM'))

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})

child.on('error', (err) => {
  console.error('[pm2-dev-launcher]', err.message)
  process.exit(1)
})
