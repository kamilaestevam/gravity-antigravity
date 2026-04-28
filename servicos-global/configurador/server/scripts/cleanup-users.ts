/**
 * cleanup-users.ts
 *
 * Exclui TODOS os usuários exceto dmmltda@gmail.com (Super Admin)
 * de: Clerk (frontend auth) + Banco Configurador (Usuario, UsuarioPermissao, UsuarioWorkspace, OrganizacaoFornecedor)
 *
 * Uso:
 *   cd servicos-global/configurador
 *   npx tsx server/scripts/cleanup-users.ts --dry-run    # simular primeiro
 *   npx tsx server/scripts/cleanup-users.ts              # executar de verdade
 */

import 'dotenv/config'
import { createClerkClient } from '@clerk/clerk-sdk-node'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const PROTECTED_EMAIL = 'dmmltda@gmail.com'
const DRY_RUN = process.argv.includes('--dry-run')

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
})

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  console.log(`\n=== CLEANUP USERS ${DRY_RUN ? '(DRY RUN)' : '!! EXECUCAO REAL'} ===\n`)

  // 1. Listar todos os usuários do Clerk
  console.log('Buscando usuarios no Clerk...')
  const allClerkUsers: Array<{ id: string; emailAddresses: Array<{ emailAddress: string }> }> = []
  let offset = 0
  const limit = 100

  while (true) {
    const batch = await clerk.users.getUserList({ limit, offset })
    if (!batch.data || batch.data.length === 0) break
    allClerkUsers.push(...batch.data.map(u => ({
      id: u.id,
      emailAddresses: u.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
    })))
    if (batch.data.length < limit) break
    offset += limit
  }

  console.log(`   Total de usuarios no Clerk: ${allClerkUsers.length}`)

  // Separar protegido dos que serão excluídos
  const toDelete: typeof allClerkUsers = []
  let protectedUser: (typeof allClerkUsers)[0] | null = null

  for (const user of allClerkUsers) {
    const emails = user.emailAddresses.map(e => e.emailAddress.toLowerCase())
    if (emails.includes(PROTECTED_EMAIL.toLowerCase())) {
      protectedUser = user
      console.log(`   PROTEGIDO: ${PROTECTED_EMAIL} (clerk_id: ${user.id})`)
    } else {
      toDelete.push(user)
    }
  }

  if (!protectedUser) {
    console.log(`   AVISO: Usuario ${PROTECTED_EMAIL} NAO encontrado no Clerk. Continuando mesmo assim...`)
  }

  console.log(`   Usuarios a excluir: ${toDelete.length}`)

  if (toDelete.length === 0) {
    console.log('\nNenhum usuario para excluir. Saindo.')
    return
  }

  // Listar quem será excluído
  console.log('\n--- Usuarios que serao EXCLUIDOS ---')
  for (const u of toDelete) {
    const emails = u.emailAddresses.map(e => e.emailAddress).join(', ')
    console.log(`   - ${emails} (clerk_id: ${u.id})`)
  }

  if (DRY_RUN) {
    console.log('\nDRY RUN — verificando banco...')

    const dbUsers = await prisma.usuario.count({
      where: { clerk_user_id: { in: toDelete.map(u => u.id) } },
    })
    const dbPermissions = await prisma.usuarioPermissao.count({
      where: { user: { clerk_user_id: { in: toDelete.map(u => u.id) } } },
    })
    // ↑ relação `user` é tipada — não usa nome físico de coluna
    const dbMemberships = await prisma.usuarioWorkspace.count({
      where: { user: { clerk_user_id: { in: toDelete.map(u => u.id) } } },
    })
    const dbSupplier = await prisma.organizacaoFornecedor.count({
      where: { clerk_user_id: { in: toDelete.map(u => u.id) } },
    })

    console.log(`\n--- Impacto no banco ---`)
    console.log(`   Usuario:                 ${dbUsers} registros`)
    console.log(`   UsuarioPermissao:       ${dbPermissions} registros`)
    console.log(`   UsuarioWorkspace:       ${dbMemberships} registros`)
    console.log(`   OrganizacaoFornecedor: ${dbSupplier} registros`)
    console.log(`\nDRY RUN completo. Execute sem --dry-run para aplicar.`)
    return
  }

  // 2. Excluir do banco (cascade via Prisma relations)
  console.log('\nExcluindo do banco...')
  const clerkIds = toDelete.map(u => u.id)

  const deleted = await prisma.$transaction(async (tx) => {
    const sup = await tx.organizacaoFornecedor.deleteMany({
      where: { clerk_user_id: { in: clerkIds } },
    })
    const users = await tx.usuario.deleteMany({
      where: { clerk_user_id: { in: clerkIds } },
    })
    return { users: users.count, supplier: sup.count }
  })

  console.log(`   Banco: ${deleted.users} Usuario(s) + ${deleted.supplier} OrganizacaoFornecedor excluidos`)

  // 3. Excluir do Clerk
  console.log('\nExcluindo do Clerk...')
  let clerkDeleted = 0
  let clerkErrors = 0

  for (const user of toDelete) {
    try {
      await clerk.users.deleteUser(user.id)
      clerkDeleted++
      const email = user.emailAddresses[0]?.emailAddress || user.id
      console.log(`   OK: ${email}`)
    } catch (err: unknown) {
      clerkErrors++
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`   ERRO: ${user.id}: ${msg}`)
    }
  }

  console.log(`\n=== RESULTADO FINAL ===`)
  console.log(`   Clerk:  ${clerkDeleted} excluidos, ${clerkErrors} erros`)
  console.log(`   Banco:  ${deleted.users} Users, ${deleted.supplier} SupplierAccess`)
  console.log(`   Protegido: ${PROTECTED_EMAIL}`)
  console.log(`Limpeza concluida.\n`)
}

main()
  .catch((err) => {
    console.error('Erro fatal:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
