/**
 * backfill-produto-workspace-default-habilitado.ts
 *
 * BACKFILL — produtos já contratados ganham linha habilitada em TODOS os
 * workspaces ATIVOS da org (decisão dono 2026-05-12: contratar = habilita
 * em todo workspace).
 *
 * Aplica apenas a produtos com assinatura ATIVA ou EM_TESTE. Idempotente:
 * workspaces que já têm linha não são modificados.
 *
 * Também propaga Portão 3 (CP6 auto-sync) para os Standards/Fornecedores
 * dos workspaces tocados.
 *
 * USO:
 *   npx tsx server/scripts/backfill-produto-workspace-default-habilitado.ts          # dry-run
 *   npx tsx server/scripts/backfill-produto-workspace-default-habilitado.ts --apply  # executa
 */

import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'
import { aoHabilitarProdutoNoWorkspace } from '../services/sincronizar-acesso-usuario-produtos-service.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const dryRun = !process.argv.includes('--apply')

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  BACKFILL — produtos contratados → todos workspaces habilitados')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  Modo: ${dryRun ? '🟡 DRY-RUN' : '🔴 APPLY'}`)
  console.log()

  // Assinaturas ATIVAS/EM_TESTE de todas as orgs
  const assinaturas = await prisma.produtoGravityAssinatura.findMany({
    where: { status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] } },
    select: {
      id_organizacao: true,
      id_produto_gravity: true,
      produto: { select: { slug_produto_gravity: true } },
    },
  })
  console.log(`📋 Assinaturas ATIVA/EM_TESTE: ${assinaturas.length}`)

  let totalLinhasCriadas = 0
  let totalLinhasReativadas = 0
  let totalLinhasJaOk = 0
  let totalPropagado = 0

  for (const a of assinaturas) {
    // Workspaces ATIVOS da org
    const workspaces = await prisma.workspace.findMany({
      where: { id_organizacao: a.id_organizacao, status_workspace: 'ATIVO' },
      select: { id_workspace: true, nome_workspace: true },
    })
    if (workspaces.length === 0) continue

    for (const ws of workspaces) {
      const existente = await prisma.produtoGravityWorkspace.findUnique({
        where: {
          id_workspace_id_produto_gravity: {
            id_workspace: ws.id_workspace,
            id_produto_gravity: a.id_produto_gravity,
          },
        },
        select: { ativo_produto_gravity_workspace: true },
      })

      let acao: 'criada' | 'reativada' | 'ja-ok' = 'ja-ok'

      if (!existente) {
        acao = 'criada'
        if (!dryRun) {
          await prisma.produtoGravityWorkspace.create({
            data: {
              id_organizacao: a.id_organizacao,
              id_workspace: ws.id_workspace,
              id_produto_gravity: a.id_produto_gravity,
              ativo_produto_gravity_workspace: true,
            },
          })
        }
        totalLinhasCriadas++
      } else if (!existente.ativo_produto_gravity_workspace) {
        acao = 'reativada'
        if (!dryRun) {
          await prisma.produtoGravityWorkspace.update({
            where: {
              id_workspace_id_produto_gravity: {
                id_workspace: ws.id_workspace,
                id_produto_gravity: a.id_produto_gravity,
              },
            },
            data: { ativo_produto_gravity_workspace: true },
          })
        }
        totalLinhasReativadas++
      } else {
        totalLinhasJaOk++
      }

      // Propaga Portão 3 se houve mudança
      if (acao !== 'ja-ok' && !dryRun) {
        const r = await aoHabilitarProdutoNoWorkspace({
          id_organizacao: a.id_organizacao,
          id_workspace: ws.id_workspace,
          id_produto_gravity: a.id_produto_gravity,
          slug_produto: a.produto.slug_produto_gravity,
        })
        totalPropagado += r.linhasCriadas
      }

      console.log(
        `  ${dryRun ? '[DRY]' : '✓'} ${a.produto.slug_produto_gravity} @ ${ws.nome_workspace}: ${acao}`,
      )
    }
  }

  console.log()
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  RESULTADO')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`  Linhas criadas:        ${totalLinhasCriadas}`)
  console.log(`  Linhas reativadas:     ${totalLinhasReativadas}`)
  console.log(`  Linhas já OK:          ${totalLinhasJaOk}`)
  if (!dryRun) {
    console.log(`  Portão 3 propagado:    ${totalPropagado} chaves criadas`)
  }
  console.log()
  if (dryRun) {
    console.log('🟡 Nada foi escrito. Para aplicar:')
    console.log('   npx tsx server/scripts/backfill-produto-workspace-default-habilitado.ts --apply')
  }
}

main()
  .catch((err) => {
    console.error('❌ Erro:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
