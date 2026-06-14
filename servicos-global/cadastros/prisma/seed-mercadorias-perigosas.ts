/**
 * seed-mercadorias-perigosas.ts — Popula mercadoria_perigosa (lista ONU canônica).
 *
 * Execução:
 *   DATABASE_URL=<URL> npx tsx servicos-global/cadastros/prisma/seed-mercadorias-perigosas.ts
 */

import { PrismaClient } from '../generated/index.js'
import {
  MERCADORIAS_PERIGOSAS_CANONICAS,
  nomeAsciiMercadoriaPerigosa,
} from './data/mercadorias-perigosas-canonicas.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-mercadorias-perigosas] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })
const VERSAO_FONTE = '2025'

async function main() {
  console.log(`[seed-mercadorias-perigosas] iniciando — ${MERCADORIAS_PERIGOSAS_CANONICAS.length} entradas`)

  let inseridas = 0
  let atualizadas = 0

  for (const item of MERCADORIAS_PERIGOSAS_CANONICAS) {
    const nomeAscii = nomeAsciiMercadoriaPerigosa(item.nome_tecnico_embarque)
    const grupo = item.grupo_embalagem ?? null

    const existia = await prisma.mercadoriaPerigosa.findFirst({
      where: {
        numero_onu_mercadoria_perigosa: item.numero_onu,
        nome_ascii_mercadoria_perigosa: nomeAscii,
        grupo_embalagem_mercadoria_perigosa: grupo,
      },
    })

    const dados = {
      numero_onu_mercadoria_perigosa: item.numero_onu,
      nome_tecnico_embarque_mercadoria_perigosa: item.nome_tecnico_embarque,
      nome_ascii_mercadoria_perigosa: nomeAscii,
      nome_ingles_mercadoria_perigosa: item.nome_ingles,
      classe_mercadoria_perigosa: item.classe,
      divisao_mercadoria_perigosa: item.divisao ?? null,
      grupo_embalagem_mercadoria_perigosa: grupo,
      versao_fonte_mercadoria_perigosa: VERSAO_FONTE,
      ativo_mercadoria_perigosa: true,
    }

    if (existia) {
      await prisma.mercadoriaPerigosa.update({
        where: { id_mercadoria_perigosa: existia.id_mercadoria_perigosa },
        data: dados,
      })
      atualizadas += 1
    } else {
      await prisma.mercadoriaPerigosa.create({ data: dados })
      inseridas += 1
    }
  }

  const total = await prisma.mercadoriaPerigosa.count()
  console.log(`[seed-mercadorias-perigosas] inseridas: ${inseridas}, atualizadas: ${atualizadas}, total: ${total}`)
}

main()
  .catch((err) => {
    console.error('[seed-mercadorias-perigosas] ERRO:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
