// scripts/ativamente/compose-pedido-schema.ts
// COORDENADOR — Script de composição do schema do produto Pedido
//
// Combina schema.base.prisma + fragment.prisma do produto pedido em
// produto/pedido/server/prisma/schema.prisma
//
// Banco-alvo: gravity-pedido-* (Railway), conectado via env DATABASE_URL
//
// NUNCA editar schema.prisma manualmente — sempre sobrescrito por este script.
//
// Uso:
//   npx tsx scripts/ativamente/compose-pedido-schema.ts
//   npx tsx scripts/ativamente/compose-pedido-schema.ts --strict   (aborta se fragment faltar)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../..')
const PEDIDO_DIR = path.join(ROOT_DIR, 'produto', 'pedido')
const PRISMA_DIR = path.join(PEDIDO_DIR, 'server', 'prisma')
const OUTPUT_SCHEMA = path.join(PRISMA_DIR, 'schema.prisma')
const BASE_SCHEMA = path.join(PRISMA_DIR, 'schema.base.prisma')
const FRAGMENT_PATH = path.join(PRISMA_DIR, 'fragment.prisma')

function composePedidoSchema(options: { strict?: boolean } = {}): void {
  const { strict = false } = options

  console.log('[compose-pedido-schema] Iniciando composição do schema pedido...')

  if (!fs.existsSync(BASE_SCHEMA)) {
    throw new Error(
      `[compose-pedido-schema] ERRO: schema.base.prisma não encontrado em: ${BASE_SCHEMA}`
    )
  }
  const base = fs.readFileSync(BASE_SCHEMA, 'utf8')

  if (!fs.existsSync(FRAGMENT_PATH)) {
    const msg = `[compose-pedido-schema] ERRO: fragment.prisma não encontrado em: ${FRAGMENT_PATH}`
    if (strict) {
      throw new Error(msg)
    } else {
      console.warn(msg)
      console.warn('[compose-pedido-schema] Composição abortada — sem fragment não há schema.')
      process.exit(1)
    }
  }
  const fragment = fs.readFileSync(FRAGMENT_PATH, 'utf8')

  const header = [
    '// ============================================================================',
    '// schema.prisma — GERADO AUTOMATICAMENTE',
    '// NÃO EDITAR MANUALMENTE — será sobrescrito na próxima execução de compose.',
    `// Gerado em: ${new Date().toISOString()}`,
    '// Banco: gravity-pedido-* (Railway)',
    '// Produto: produto/pedido',
    '// ============================================================================',
  ].join('\n')

  const composed = [
    header,
    base,
    `// --- Fragment: pedido ---`,
    fragment,
  ].join('\n\n')

  fs.writeFileSync(OUTPUT_SCHEMA, composed, 'utf8')

  console.log('[compose-pedido-schema] ✅ Schema composto com sucesso em:', OUTPUT_SCHEMA)
}

const isStrict = process.argv.includes('--strict')
composePedidoSchema({ strict: isStrict })
