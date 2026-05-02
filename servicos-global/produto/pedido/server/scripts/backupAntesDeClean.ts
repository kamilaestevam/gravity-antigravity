/**
 * backupAntesDeClean.ts
 *
 * Faz um snapshot JSON de todos os pedidos+itens de um tenant antes do --clean.
 * Salva em produto/pedido/server/backups/{tenantId}-{timestamp}.json
 *
 * Uso (standalone):
 *   TENANT_ID=tenant-x npx tsx scripts/backupAntesDeClean.ts
 *
 * Uso programático (do seed.ts):
 *   import { fazerBackup } from './scripts/backupAntesDeClean.js'
 *   await fazerBackup(prisma, tenantId)
 */

import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function fazerBackup(prisma: PrismaClient, tenantId: string): Promise<string | null> {
  const pedidos = await prisma.pedido.findMany({
    where: { tenant_id: tenantId },
    include: { itens: true },
  })

  if (pedidos.length === 0) {
    console.log(`[backup] tenant ${tenantId} sem pedidos — nada a salvar`)
    return null
  }

  const dir = path.resolve(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(dir, `${tenantId}-${timestamp}.json`)

  fs.writeFileSync(file, JSON.stringify({
    tenant_id: tenantId,
    backup_at: new Date().toISOString(),
    total_pedidos: pedidos.length,
    total_itens: pedidos.reduce((s, p) => s + (p.itens?.length ?? 0), 0),
    pedidos,
  }, null, 2))

  console.log(`[backup] salvo: ${file}`)
  return file
}

// Execução standalone — guarda compatível com ESM
const isMainModule = (() => {
  try {
    return process.argv[1] && process.argv[1].endsWith('backupAntesDeClean.ts')
  } catch { return false }
})()

if (isMainModule) {
  const tenantId = process.env.TENANT_ID
  if (!tenantId) {
    console.error('TENANT_ID obrigatório')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  fazerBackup(prisma, tenantId)
    .then(() => prisma.$disconnect())
    .catch((e) => { console.error(e); process.exit(1) })
}
