/**
 * seed-unidades.ts — Popula a tabela `unidade` do Cadastros com a lista
 * canônica de unidades de medida (~60 entradas, 10 categorias).
 *
 * Por que existe: a migration `20260424144828_fix_model_casing_revert`
 * (Pascal→snake_case) fez DROP+CREATE da tabela e apagou os dados que
 * existiam (mesmo destino da `moeda`). Este seed é o ponto único de
 * repopulação.
 *
 * Esta lista é a SSOT (Single Source of Truth) das unidades no Gravity:
 *   - Banco `cadastros.unidade` (preenchido por este seed)
 *   - Frontend lê do banco via hook `useUnidades()` em
 *     `@nucleo/modal-tabela-unidades`
 *   - Não há mais constantes hardcoded em código
 *
 * Idempotente — usa upsert por `codigo_unidade`.
 *
 * Mapeamento (decisão do dono em 2026-05-08, Caminho A):
 *   - codigo_unidade ← sigla     (coluna ERP do master, ex: KG, CX10)
 *   - nome_unidade   ← descricao (ex: "Quilograma")
 *   - tipo_unidade   ← categoria (ex: "peso", "embalagem")
 *   - ativo_unidade  ← true
 *
 * Execução:
 *   DATABASE_URL=<URL>  npx tsx servicos-global/cadastros/prisma/seed-unidades.ts
 *
 * Mandamento 08: falha alta — se DATABASE_URL ausente, lança erro explícito.
 */

import { PrismaClient } from '../generated/index.js'
import { UNIDADES_CANONICAS } from './data/unidades-canonicas.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-unidades] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  if (!Array.isArray(UNIDADES_CANONICAS) || UNIDADES_CANONICAS.length === 0) {
    throw new Error('Lista UNIDADES_CANONICAS vazia — verifique data/unidades-canonicas.ts')
  }

  console.log(`[seed-unidades] iniciando — ${UNIDADES_CANONICAS.length} unidades a processar`)

  const inicio = Date.now()
  let inseridas = 0
  let atualizadas = 0

  for (const u of UNIDADES_CANONICAS) {
    const dados = {
      codigo_unidade: u.sigla,
      nome_unidade: u.descricao,
      tipo_unidade: u.categoria,
      ativo_unidade: true,
    }
    const existia = await prisma.unidade.findUnique({ where: { codigo_unidade: u.sigla } })
    await prisma.unidade.upsert({
      where: { codigo_unidade: u.sigla },
      create: dados,
      update: {
        nome_unidade: dados.nome_unidade,
        tipo_unidade: dados.tipo_unidade,
        ativo_unidade: dados.ativo_unidade,
      },
    })
    if (existia) atualizadas += 1
    else inseridas += 1
  }

  const total = await prisma.unidade.count()
  console.log(`[seed-unidades] concluído em ${Date.now() - inicio}ms`)
  console.log(`[seed-unidades]   inseridas:   ${inseridas}`)
  console.log(`[seed-unidades]   atualizadas: ${atualizadas}`)
  console.log(`[seed-unidades]   total no banco: ${total}`)
}

main()
  .catch((err) => {
    console.error('[seed-unidades] ERRO:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
