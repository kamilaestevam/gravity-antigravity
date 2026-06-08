/**
 * seed-cambio-siscomex.ts — Popula cambio_siscomex (cobertura cambial + modalidade pagamento).
 *
 * Execução:
 *   CADASTROS_DATABASE_URL=<URL> npx tsx servicos-global/cadastros/prisma/seed-cambio-siscomex.ts
 */
import { PrismaClient } from '../generated/index.js'
import { CAMBIO_SISCOMEX_CANONICOS } from './data/cambio-siscomex-canonicos.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-cambio-siscomex] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  console.log(`[seed-cambio-siscomex] iniciando — ${CAMBIO_SISCOMEX_CANONICOS.length} registros`)
  let inseridas = 0
  let atualizadas = 0

  for (const c of CAMBIO_SISCOMEX_CANONICOS) {
    const dados = {
      codigo_cambio_siscomex: c.codigo,
      tipo_cambio_siscomex: c.tipo,
      nome_cambio_siscomex: c.nome,
      descricao_cambio_siscomex: c.descricao ?? null,
      ordem_cambio_siscomex: c.ordem,
      ativo_cambio_siscomex: true,
    }
    const existia = await prisma.cambioSiscomex.findUnique({
      where: { codigo_cambio_siscomex: c.codigo },
    })
    await prisma.cambioSiscomex.upsert({
      where: { codigo_cambio_siscomex: c.codigo },
      create: dados,
      update: {
        tipo_cambio_siscomex: dados.tipo_cambio_siscomex,
        nome_cambio_siscomex: dados.nome_cambio_siscomex,
        descricao_cambio_siscomex: dados.descricao_cambio_siscomex,
        ordem_cambio_siscomex: dados.ordem_cambio_siscomex,
        ativo_cambio_siscomex: dados.ativo_cambio_siscomex,
      },
    })
    if (existia) atualizadas += 1
    else inseridas += 1
  }

  const total = await prisma.cambioSiscomex.count()
  console.log(`[seed-cambio-siscomex] inseridas=${inseridas} atualizadas=${atualizadas} total=${total}`)
}

main()
  .catch((err) => {
    console.error('[seed-cambio-siscomex] ERRO:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
