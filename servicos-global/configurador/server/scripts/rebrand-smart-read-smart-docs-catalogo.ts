/**
 * Atualiza o catálogo Admin (produto_gravity) de Smart Read → Smart Docs.
 * Idempotente — slug técnico permanece smart-read; arquiva duplicatas de catálogo.
 *
 *   npx tsx --env-file=.env server/scripts/rebrand-smart-read-smart-docs-catalogo.ts
 *   npx tsx --env-file=.env server/scripts/rebrand-smart-read-smart-docs-catalogo.ts --apply
 *   npx tsx --env-file=.env server/scripts/rebrand-smart-read-smart-docs-catalogo.ts --apply --arquivar-duplicatas
 */
import { prisma } from '../lib/prisma.js'

const SLUG_CANONICO = 'smart-read'
const NOME_NOVO = 'Smart Docs'
const DESCRICAO_NOVA =
  'Inteligência documental para COMEX — extração, conferência, riscos e Q&A com IA'

const apply = process.argv.includes('--apply')
const aplicarArquivarDuplicatas = process.argv.includes('--arquivar-duplicatas')

function descricaoLegada(descricao: string): boolean {
  return (
    descricao.includes('Smart Read') ||
    descricao.toLowerCase().includes('leitura inteligente')
  )
}

async function renomearLegadoSmartRead() {
  const candidatos = await prisma.produtoGravity.findMany({
    where: {
      OR: [
        { slug_produto_gravity: SLUG_CANONICO },
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
    return 0
  }

  console.log(`[rebrand] ${candidatos.length} registro(s) legado(s):`)
  for (const p of candidatos) {
    const precisaNome = p.nome_produto_gravity !== NOME_NOVO
    const precisaDesc =
      p.descricao_produto_gravity !== DESCRICAO_NOVA && descricaoLegada(p.descricao_produto_gravity)
    console.log(
      `  - ${p.slug_produto_gravity} | nome: "${p.nome_produto_gravity}" → ${precisaNome ? NOME_NOVO : '(ok)'}`,
    )
    if (precisaDesc) {
      console.log(`    desc: "${p.descricao_produto_gravity.slice(0, 60)}…" → ${DESCRICAO_NOVA.slice(0, 60)}…`)
    }
  }

  if (!apply) return 0

  let atualizados = 0
  for (const p of candidatos) {
    const data: { nome_produto_gravity?: string; descricao_produto_gravity?: string } = {}
    if (p.nome_produto_gravity !== NOME_NOVO) {
      data.nome_produto_gravity = NOME_NOVO
    }
    if (descricaoLegada(p.descricao_produto_gravity) && p.descricao_produto_gravity !== DESCRICAO_NOVA) {
      data.descricao_produto_gravity = DESCRICAO_NOVA
    }
    if (Object.keys(data).length === 0) continue

    await prisma.produtoGravity.update({
      where: { id_produto_gravity: p.id_produto_gravity },
      data,
    })
    atualizados++
  }

  console.log(`[rebrand] ${atualizados} registro(s) legado(s) atualizado(s).`)
  return atualizados
}

async function listarDuplicatasSmartDocs() {
  const duplicatas = await prisma.produtoGravity.findMany({
    where: {
      data_remocao_produto_gravity: null,
      slug_produto_gravity: { not: SLUG_CANONICO },
      OR: [
        { nome_produto_gravity: { contains: 'Smart Docs', mode: 'insensitive' } },
        { nome_produto_gravity: { contains: 'Smart Read', mode: 'insensitive' } },
        { slug_produto_gravity: { contains: 'smart', mode: 'insensitive' } },
      ],
    },
    select: {
      id_produto_gravity: true,
      nome_produto_gravity: true,
      slug_produto_gravity: true,
      _count: {
        select: {
          assinaturas_produto_gravity: {
            where: { status_assinatura_produto_gravity: { not: 'CANCELADA' } },
          },
        },
      },
    },
  })

  if (duplicatas.length === 0) {
    console.log('[rebrand] Nenhuma duplicata de catálogo (slug ≠ smart-read).')
    return []
  }

  console.log(`[rebrand] ${duplicatas.length} duplicata(s) de catálogo (slug ≠ ${SLUG_CANONICO}):`)
  for (const p of duplicatas) {
    console.log(
      `  - ${p.slug_produto_gravity} | "${p.nome_produto_gravity}" | assinaturas ativas: ${p._count.assinaturas_produto_gravity}`,
    )
  }
  return duplicatas
}

async function arquivarDuplicatas(
  duplicatas: Awaited<ReturnType<typeof listarDuplicatasSmartDocs>>,
) {
  if (duplicatas.length === 0) return 0

  let arquivados = 0
  for (const p of duplicatas) {
    const assinaturasAtivas = await prisma.produtoGravityAssinatura.findMany({
      where: {
        id_produto_gravity: p.id_produto_gravity,
        status_assinatura_produto_gravity: { not: 'CANCELADA' },
      },
      select: {
        id_assinatura_produto_gravity: true,
        id_organizacao: true,
        status_assinatura_produto_gravity: true,
      },
    })

    for (const a of assinaturasAtivas) {
      await prisma.produtoGravityAssinatura.update({
        where: { id_assinatura_produto_gravity: a.id_assinatura_produto_gravity },
        data: {
          status_assinatura_produto_gravity: 'CANCELADA',
          data_cancelamento_assinatura_produto_gravity: new Date(),
        },
      })
      console.log(
        `  [assinatura] cancelada org ${a.id_organizacao} → duplicata ${p.slug_produto_gravity}`,
      )
    }

    await prisma.produtoGravity.update({
      where: { id_produto_gravity: p.id_produto_gravity },
      data: { data_remocao_produto_gravity: new Date() },
    })
    console.log(`  [catalogo] arquivado ${p.slug_produto_gravity}`)
    arquivados++
  }

  return arquivados
}

async function main() {
  await renomearLegadoSmartRead()
  const duplicatas = await listarDuplicatasSmartDocs()

  if (!apply) {
    console.log('\n[rebrand] Dry-run. Use --apply para gravar.')
    if (duplicatas.length > 0) {
      console.log('[rebrand] Com duplicatas, use também --arquivar-duplicatas no --apply.')
    }
    return
  }

  if (duplicatas.length > 0 && aplicarArquivarDuplicatas) {
    const n = await arquivarDuplicatas(duplicatas)
    console.log(`\n[rebrand] ${n} duplicata(s) arquivada(s).`)
  } else if (duplicatas.length > 0) {
    console.log('\n[rebrand] Duplicatas detectadas — rode com --arquivar-duplicatas para cancelar assinaturas e arquivar.')
  }
}

main()
  .catch((erro) => {
    console.error('[rebrand] Falha:', erro)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
