/**
 * seed-containers.ts — Popula a tabela `container` do Cadastros com os 26
 * tipos canônicos ISO 6346.
 *
 * SSOT (Single Source of Truth):
 *   - Banco `cadastros.container` (preenchido por este seed)
 *   - Frontend lê via `useContainersCadastros()` / `cadastrosApi.listarContainers()`
 *   - Substitui listas estáticas legadas nos produtos BID Frete
 *
 * Idempotente — upsert por `codigo_iso_container`.
 *
 * Execução:
 *   DATABASE_URL=<URL>  npx tsx servicos-global/cadastros/prisma/seed-containers.ts
 */

import { PrismaClient } from '../generated/index.js'
import { CONTAINERS_CANONICOS } from './data/containers-canonicos.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-containers] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  if (!Array.isArray(CONTAINERS_CANONICOS) || CONTAINERS_CANONICOS.length === 0) {
    throw new Error('Lista CONTAINERS_CANONICOS vazia — verifique data/containers-canonicos.ts')
  }

  console.log(`[seed-containers] iniciando — ${CONTAINERS_CANONICOS.length} containers a processar`)

  const inicio = Date.now()
  let inseridas = 0
  let atualizadas = 0

  for (const c of CONTAINERS_CANONICOS) {
    const dados = {
      tipo_container: c.tipo_container,
      tamanho_container: c.tamanho_container,
      codigo_iso_container: c.codigo_iso_container,
      armador_dono_container: null,
      ativo_container: true,
    }

    const existia = await prisma.container.findUnique({
      where: { codigo_iso_container: c.codigo_iso_container },
    })

    await prisma.container.upsert({
      where: { codigo_iso_container: c.codigo_iso_container },
      create: dados,
      update: {
        tipo_container: dados.tipo_container,
        tamanho_container: dados.tamanho_container,
        ativo_container: dados.ativo_container,
      },
    })

    if (existia) atualizadas += 1
    else inseridas += 1
  }

  const total = await prisma.container.count()
  console.log(`[seed-containers] concluído em ${Date.now() - inicio}ms`)
  console.log(`[seed-containers]   inseridas:   ${inseridas}`)
  console.log(`[seed-containers]   atualizadas: ${atualizadas}`)
  console.log(`[seed-containers]   total no banco: ${total}`)
}

main()
  .catch((err) => {
    console.error('[seed-containers] ERRO:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
