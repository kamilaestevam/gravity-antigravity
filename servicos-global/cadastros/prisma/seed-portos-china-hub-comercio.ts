/**
 * Upsert dos hubs portuários chineses no catálogo Cadastros (tabela `porto`).
 * Garante visibilidade nos dropdowns dos produtos (Bid Frete, Pedido, etc.).
 *
 * Execução:
 *   CADASTROS_DATABASE_URL=<URL> npx tsx servicos-global/cadastros/prisma/seed-portos-china-hub-comercio.ts
 */
import { PrismaClient } from '../generated/index.js'
import { PORTOS_CHINA_HUB_COMERCIO } from './data/portos-china-hub-comercio.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-portos-china] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  let upserted = 0
  for (const p of PORTOS_CHINA_HUB_COMERCIO) {
    const codigo_local_porto = p.codigo_unlocode_porto.slice(2)
    await prisma.porto.upsert({
      where: { codigo_unlocode_porto: p.codigo_unlocode_porto },
      create: {
        codigo_unlocode_porto: p.codigo_unlocode_porto,
        codigo_pais_porto: 'CN',
        codigo_local_porto,
        nome_porto: p.nome_porto,
        nome_ascii_porto: p.nome_porto,
        latitude_porto: p.latitude_porto,
        longitude_porto: p.longitude_porto,
        ativo_porto: true,
      },
      update: {
        nome_porto: p.nome_porto,
        nome_ascii_porto: p.nome_porto,
        latitude_porto: p.latitude_porto,
        longitude_porto: p.longitude_porto,
        ativo_porto: true,
      },
    })
    upserted++
  }
  console.log(`[seed-portos-china] ${upserted} portos upserted (ativo_porto=true)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
