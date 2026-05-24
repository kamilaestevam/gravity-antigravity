#!/usr/bin/env node
/**
 * start-all-servers.mjs — Launch all backend servers in parallel
 *
 * Servers:
 *   [Configurador] servicos-global/configurador/dist/server.mjs  (port 8005)
 *   [Pedido]       servicos-global/produto/pedido/dist/server.mjs (port 8030)
 *   [Cadastros]    servicos-global/cadastros/dist/server.mjs      (port 8031)
 *
 * Each server's stdout/stderr is prefixed with its name for easy log filtering.
 * SIGTERM/SIGINT are forwarded to all child processes for graceful shutdown.
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '..')

const servers = [
  {
    name: 'Configurador',
    script: resolve(root, 'servicos-global/configurador/dist/server.mjs'),
  },
  {
    name: 'Pedido',
    script: resolve(root, 'servicos-global/produto/pedido/dist/server.mjs'),
  },
  {
    name: 'Cadastros',
    script: resolve(root, 'servicos-global/cadastros/dist/server.mjs'),
  },
]

const children = []

function prefixStream(stream, prefix) {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep incomplete last line
    for (const line of lines) {
      process.stdout.write(`${prefix} ${line}\n`)
    }
  })
  stream.on('end', () => {
    if (buffer) process.stdout.write(`${prefix} ${buffer}\n`)
  })
}

function startServer({ name, script }) {
  const label = `[${name}]`
  console.log(`${label} Starting: node ${script}`)

  const child = spawn('node', [script], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  prefixStream(child.stdout, label)
  prefixStream(child.stderr, label)

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${label} Exited via signal ${signal}`)
    } else {
      console.log(`${label} Exited with code ${code}`)
      if (code !== 0) {
        console.error(`${label} Non-zero exit — shutting down all servers`)
        shutdown(1)
      }
    }
  })

  child.on('error', (err) => {
    console.error(`${label} Failed to start: ${err.message}`)
    shutdown(1)
  })

  return child
}

function shutdown(exitCode = 0) {
  console.log('[start-all-servers] Shutting down all servers...')
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }
  // Give processes time to exit gracefully, then force-quit
  setTimeout(() => process.exit(exitCode), 5000).unref()
}

process.on('SIGTERM', () => {
  console.log('[start-all-servers] Received SIGTERM')
  shutdown(0)
})

process.on('SIGINT', () => {
  console.log('[start-all-servers] Received SIGINT')
  shutdown(0)
})

// Start all servers
for (const server of servers) {
  children.push(startServer(server))
}

console.log(`[start-all-servers] All ${servers.length} servers launched`)
