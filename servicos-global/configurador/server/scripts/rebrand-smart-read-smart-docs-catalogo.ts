/**
 * Atualiza o catálogo Admin (produto_gravity) de Smart Read → Smart Docs.
 * Idempotente — só altera slug smart-read ou nome/descrição legados.
 *
 *   npx tsx --env-file=.env server/scripts/rebrand-smart-read-smart-docs-catalogo.ts
 *   npx tsx --env-file=.env server/scripts/rebrand-smart-read-smart-docs-catalogo.ts --apply
 */
import { prisma } from '../lib/prisma.js'

const NOME_NOVO = 'Smart Docs'
const DESCRICAO_NOVA =
  'Inteligência documental para COMEX — extração, conferência, riscos e Q&A com IA'

const apply = process.argv.includes('--apply')

async function main() {
  const candidatos = await prisma.produtoGravity.findMany({
    where: {
      OR: [
        { slug_produto_gravity: 'smart-read' },
        { nome_produto_gravity: { contains: 'Smart Read', mode: 'insensitive' } },
        { descricao_produto_gravity: { contains: 'Smart Read', mode: 'insensitive' } },
      ],
      data_remocao_produto_gravity: null,
    },
    select: {
      id_produto_gravity: true,
      nome_produto_gravity: true,
      slug_produto_gravity: true,
      descricao_produto_gravity: true,
    },
  })

  if (candidatos.length === 0) {
    console.log('[rebrand] Nenhum registro smart-read / Smart Read no catálogo.')
    return
  }

  console.log(`[rebrand] ${candidatos.length} registro(s) encontrado(s):`)
  for (const p of candidatos) {
    const precisaNome = p.nome_produto_gravity !== NOME_NOVO
    const precisaDesc =
      p.descricao_produto_gravity !== DESCRICAO_NOVA &&
      (p.descricao_produto_gravity.includes('Smart Read') ||
        p.descricao_produto_gravity.toLowerCase().includes('leitura inteligente'))
    console.log(
      `  - ${p.slug_produto_gravity} | nome: "${p.nome_produto_gravity}" → ${precisaNome ? NOME_NOVO : '(ok)'}`,
    )
    if (precisaDesc) {
      console.log(`    desc: "${p.descricao_produto_gravity.slice(0, 60)}…" → ${DESCRICAO_NOVA.slice(0, 60)}…`)
    }
  }

  if (!apply) {
    console.log('\n[rebrand] Dry-run. Use --apply para gravar.')
    return
  }

  let atualizados = 0
  for (const p of candidatos) {
    const data: { nome_produto_gravity?: string; descricao_produto_gravity?: string } = {}
    if (p.nome_produto_gravity !== NOME_NOVO) {
      data.nome_produto_gravity = NOME_NOVO
    }
    const descLegada =
      p.descricao_produto_gravity.includes('Smart Read') ||
      p.descricao_produto_gravity.toLowerCase().includes('leitura inteligente')
    if (descLegada && p.descricao_produto_gravity !== DESCRICAO_NOVA) {
      data.descricao_produto_gravity = DESCRICAO_NOVA
    }
    if (Object.keys(data).length === 0) continue

    await prisma.produtoGravity.update({
      where: { id_produto_gravity: p.id_produto_gravity },
      data,
    })
    atualizados++
  }

  console.log(`\n[rebrand] ${atualizados} registro(s) atualizado(s).`)
}

main()
  .catch((erro) => {
    console.error('[rebrand] Falha:', erro)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
