/**
 * seed-incoterms.ts — Popula a tabela `incoterm` do Cadastros com os 11
 * termos canônicos do Incoterms 2020 (ICC).
 *
 * SSOT (Single Source of Truth):
 *   - Banco `cadastros.incoterm` (preenchido por este seed)
 *   - Frontend lê via hook `useIncoterms()` em `@nucleo/modal-tabela-incoterm`
 *   - Produto Pedido consulta para validação cruzada (Mandamento 06+09)
 *   - Substitui as 5 cópias hardcoded que existiam (kind-ui-pedido.ts,
 *     ModalPedidoNovo.tsx, smartImportService.ts, seed.ts, auditarSeed.ts)
 *
 * Padrão internacional fixo — não muda por organização. Quando a ICC
 * publicar Incoterms 2030, adicionar novas linhas com versao_incoterm
 * = '2030' e manter as 2020 ativas para pedidos históricos.
 *
 * Idempotente — usa upsert por `codigo_incoterm` (sigla).
 *
 * Execução:
 *   DATABASE_URL=<URL>  npx tsx servicos-global/cadastros/prisma/seed-incoterms.ts
 */

import { PrismaClient } from '../generated/index.js'
import { INCOTERMS_CANONICOS } from './data/incoterms-canonicos.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-incoterms] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  if (!Array.isArray(INCOTERMS_CANONICOS) || INCOTERMS_CANONICOS.length === 0) {
    throw new Error('Lista INCOTERMS_CANONICOS vazia — verifique data/incoterms-canonicos.ts')
  }

  console.log(`[seed-incoterms] iniciando — ${INCOTERMS_CANONICOS.length} incoterms a processar`)

  const inicio = Date.now()
  let inseridas = 0
  let atualizadas = 0

  for (const i of INCOTERMS_CANONICOS) {
    const dados = {
      codigo_incoterm: i.sigla,
      nome_incoterm: i.nome,
      descricao_incoterm: i.descricao,
      modal_transporte: i.modal,
      versao_incoterm: '2020',
      ativo_incoterm: true,
    }
    const existia = await prisma.incoterm.findUnique({ where: { codigo_incoterm: i.sigla } })
    await prisma.incoterm.upsert({
      where: { codigo_incoterm: i.sigla },
      create: dados,
      update: {
        nome_incoterm: dados.nome_incoterm,
        descricao_incoterm: dados.descricao_incoterm,
        modal_transporte: dados.modal_transporte,
        versao_incoterm: dados.versao_incoterm,
        ativo_incoterm: dados.ativo_incoterm,
      },
    })
    if (existia) atualizadas += 1
    else inseridas += 1
  }

  const total = await prisma.incoterm.count()
  console.log(`[seed-incoterms] concluído em ${Date.now() - inicio}ms`)
  console.log(`[seed-incoterms]   inseridas:   ${inseridas}`)
  console.log(`[seed-incoterms]   atualizadas: ${atualizadas}`)
  console.log(`[seed-incoterms]   total no banco: ${total}`)
}

main()
  .catch((err) => {
    console.error('[seed-incoterms] ERRO:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
