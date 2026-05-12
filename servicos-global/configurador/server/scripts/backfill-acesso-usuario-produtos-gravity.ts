/**
 * backfill-acesso-usuario-produtos-gravity.ts
 *
 * PORTÃO 3 — Backfill estratégia α (rapa-tapete)
 *
 * Cria linhas `<slug>:acesso_usuario_produtos_gravity:permitido` em
 * `usuario_permissao` para TODOS os PADRAO/FORNECEDOR existentes, cobrindo
 * cada (usuário, workspace ativo, produto habilitado).
 *
 * Decisão dono 2026-05-12: estratégia α — zero quebra para usuários atuais.
 * Master/SAdmin/Admin não recebem linhas (bypass natural Mand. 04).
 *
 * IDEMPOTENTE — pode rodar várias vezes sem duplicar (skipDuplicates).
 * REVERSÍVEL — basta deletar linhas com
 *   permissao_usuario_concedido_por = 'SISTEMA_BACKFILL_PORTAO_3_2026_05_12'
 *
 * USO:
 *   npx tsx server/scripts/backfill-acesso-usuario-produtos-gravity.ts          # dry-run (default)
 *   npx tsx server/scripts/backfill-acesso-usuario-produtos-gravity.ts --apply  # executa de verdade
 */

import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'
import { buildAcessoUsuarioProdutosGravityString } from '../../shared/permissoes-canonicas.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

const ATOR_BACKFILL = 'SISTEMA_BACKFILL_PORTAO_3_2026_05_12'
const TIPOS_QUE_RECEBEM_BACKFILL = ['PADRAO', 'FORNECEDOR'] as const

async function main() {
  const dryRun = !process.argv.includes('--apply')

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  PORTÃO 3 — Backfill α (acesso_usuario_produtos_gravity)')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  Modo: ${dryRun ? '🟡 DRY-RUN (sem escrita)' : '🔴 APPLY (escreve no banco)'}`)
  console.log(`  Ator: ${ATOR_BACKFILL}`)
  console.log()

  // 1. Busca todos os usuários PADRAO/FORNECEDOR ativos
  const usuarios = await prisma.usuario.findMany({
    where: { tipo_usuario: { in: [...TIPOS_QUE_RECEBEM_BACKFILL] } },
    select: {
      id_usuario: true,
      id_organizacao: true,
      email_usuario: true,
      tipo_usuario: true,
    },
  })
  console.log(`📋 Usuários PADRAO/FORNECEDOR encontrados: ${usuarios.length}`)

  if (usuarios.length === 0) {
    console.log('Nada para fazer.')
    return
  }

  let totalLinhasCriadas = 0
  let totalLinhasIgnoradas = 0 // já existentes (idempotência)
  let totalUsuariosTocados = 0
  let totalUsuariosVazios = 0 // sem nenhum workspace ativo

  for (const usuario of usuarios) {
    // 2. Workspaces ativos do usuário
    const memberships = await prisma.usuarioWorkspace.findMany({
      where: {
        id_usuario: usuario.id_usuario,
        id_organizacao: usuario.id_organizacao,
        ativo_usuario_workspace: true,
      },
      select: { id_workspace: true },
    })

    if (memberships.length === 0) {
      totalUsuariosVazios++
      continue
    }

    // 3. Para cada workspace, produtos habilitados + com assinatura ATIVA/EM_TESTE
    let linhasParaCriar: Array<{
      id_organizacao: string
      id_workspace: string
      id_usuario: string
      id_produto_gravity: string
      permissao_usuario: string
      permissao_usuario_concedido_por: string
    }> = []

    for (const m of memberships) {
      const produtosDoWs = await prisma.produtoGravityWorkspace.findMany({
        where: {
          id_workspace: m.id_workspace,
          id_organizacao: usuario.id_organizacao,
          ativo_produto_gravity_workspace: true,
          produto: {
            assinaturas_produto_gravity: {
              some: {
                id_organizacao: usuario.id_organizacao,
                status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] },
              },
            },
          },
        },
        select: {
          id_produto_gravity: true,
          produto: { select: { slug_produto_gravity: true } },
        },
      })

      for (const pgw of produtosDoWs) {
        linhasParaCriar.push({
          id_organizacao: usuario.id_organizacao,
          id_workspace: m.id_workspace,
          id_usuario: usuario.id_usuario,
          id_produto_gravity: pgw.id_produto_gravity,
          permissao_usuario: buildAcessoUsuarioProdutosGravityString(pgw.produto.slug_produto_gravity),
          permissao_usuario_concedido_por: ATOR_BACKFILL,
        })
      }
    }

    if (linhasParaCriar.length === 0) continue

    if (dryRun) {
      console.log(
        `  [DRY] ${usuario.email_usuario} (${usuario.tipo_usuario}) — ${linhasParaCriar.length} linhas`,
      )
      totalLinhasCriadas += linhasParaCriar.length
      totalUsuariosTocados++
      continue
    }

    // 4. Insere (idempotente via skipDuplicates + unique constraint)
    const result = await prisma.usuarioPermissao.createMany({
      data: linhasParaCriar,
      skipDuplicates: true,
    })
    totalLinhasCriadas += result.count
    totalLinhasIgnoradas += linhasParaCriar.length - result.count
    totalUsuariosTocados++
    console.log(
      `  ✓ ${usuario.email_usuario} (${usuario.tipo_usuario}) — ${result.count} criadas, ${linhasParaCriar.length - result.count} já existiam`,
    )
  }

  console.log()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  RESULTADO')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  Usuários processados:        ${totalUsuariosTocados}`)
  console.log(`  Usuários sem workspaces:     ${totalUsuariosVazios}`)
  console.log(`  Linhas ${dryRun ? 'que SERIAM criadas' : 'criadas'}:   ${totalLinhasCriadas}`)
  if (!dryRun) {
    console.log(`  Linhas já existentes:        ${totalLinhasIgnoradas} (idempotência)`)
  }
  console.log()
  if (dryRun) {
    console.log('🟡 Nada foi escrito. Para executar de verdade:')
    console.log('   npx tsx server/scripts/backfill-acesso-usuario-produtos-gravity.ts --apply')
  } else {
    console.log('✅ Backfill concluído. Para reverter:')
    console.log(`   DELETE FROM usuario_permissao WHERE permissao_usuario_concedido_por = '${ATOR_BACKFILL}'`)
  }
}

main()
  .catch(err => {
    console.error('❌ Erro:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
