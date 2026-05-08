/**
 * seed-moedas.ts — Popula a tabela `moeda` do Cadastros com a lista canônica
 * de moedas ISO 4217 / Siscomex (~134 entradas).
 *
 * Por que existe: a migration `20260424144828_fix_model_casing_revert`
 * (Pascal→snake_case) fez DROP+CREATE da tabela e apagou os dados que
 * existiam. Este seed é o ponto único de repopulação.
 *
 * Esta lista é a SSOT (Single Source of Truth) das moedas no Gravity:
 *   - Banco `cadastros.moeda` (preenchido por este seed)
 *   - Frontend lê do banco via hook `useMoedas()` em `@nucleo/modal-tabela-moeda`
 *   - Snapshot de Pedido/LPCO/NF/Financeiro também lê do banco
 *   - Não há mais constantes hardcoded em código (Mandamento 09, contratos
 *     bilaterais respeitados via banco como fonte)
 *
 * Idempotente — usa upsert por `codigo_moeda` (alpha-3 ISO 4217).
 *
 * Mapeamento (decisão do dono em 2026-05-08):
 *   - codigo_moeda  ← sigla     (alpha-3 ISO, ex: USD)
 *   - nome_moeda    ← descricao (ex: "Dólar dos Estados Unidos")
 *   - simbolo_moeda ← sigla     (símbolo = sigla pra todas — pode evoluir depois)
 *   - ativo_moeda   ← true
 *
 * Execução:
 *   DATABASE_URL=<URL>  npx tsx servicos-global/cadastros/prisma/seed-moedas.ts
 *   ou:
 *   CADASTROS_DATABASE_URL=<URL>  npx tsx servicos-global/cadastros/prisma/seed-moedas.ts
 *
 * Mandamento 08: falha alta — se DATABASE_URL ausente, lança erro explícito.
 */

import { PrismaClient } from '../generated/index.js'
import { MOEDAS_CANONICAS } from './data/moedas-canonicas.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-moedas] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })


async function main() {
  if (!Array.isArray(MOEDAS_CANONICAS) || MOEDAS_CANONICAS.length === 0) {
    throw new Error('Lista MOEDAS_CANONICAS vazia — verifique a constante MOEDAS_CANONICAS no seed.')
  }

  console.log(`[seed-moedas] iniciando — ${MOEDAS_CANONICAS.length} moedas a processar`)

  const inicio = Date.now()
  let inseridas = 0
  let atualizadas = 0

  for (const m of MOEDAS_CANONICAS) {
    const dados = {
      codigo_moeda: m.sigla,
      nome_moeda: m.descricao,
      simbolo_moeda: m.sigla,
      ativo_moeda: true,
    }
    const existia = await prisma.moeda.findUnique({ where: { codigo_moeda: m.sigla } })
    await prisma.moeda.upsert({
      where: { codigo_moeda: m.sigla },
      create: dados,
      update: {
        nome_moeda: dados.nome_moeda,
        simbolo_moeda: dados.simbolo_moeda,
        ativo_moeda: dados.ativo_moeda,
      },
    })
    if (existia) atualizadas += 1
    else inseridas += 1
  }

  const total = await prisma.moeda.count()
  console.log(`[seed-moedas] concluído em ${Date.now() - inicio}ms`)
  console.log(`[seed-moedas]   inseridas:   ${inseridas}`)
  console.log(`[seed-moedas]   atualizadas: ${atualizadas}`)
  console.log(`[seed-moedas]   total no banco: ${total}`)
}

main()
  .catch((err) => {
    console.error('[seed-moedas] ERRO:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
