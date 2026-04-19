/**
 * relink-clerk-user.ts
 *
 * Atualiza o clerk_user_id de um usuário do banco pelo email.
 * Usado quando a sessão ativa do Clerk está com user_id diferente do que
 * está no banco (re-signup, migração, etc.) e o fallback automático do
 * requireAuth não consegue resolver.
 *
 * Uso:
 *   npx tsx server/scripts/relink-clerk-user.ts <email> <novo_clerk_user_id>
 *
 * Exemplo:
 *   npx tsx server/scripts/relink-clerk-user.ts dmmltda@gmail.com user_3Xyz...
 */

import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const email = process.argv[2]
  const newClerkId = process.argv[3]

  if (!email || !newClerkId) {
    console.error('Uso: npx tsx server/scripts/relink-clerk-user.ts <email> <novo_clerk_user_id>')
    process.exit(1)
  }

  const user = await prisma.usuario.findFirst({
    where: { email },
    select: { id: true, email: true, role: true, clerk_user_id: true, tenant_id: true },
  })

  if (!user) {
    console.error(`Usuário ${email} não encontrado.`)
    process.exit(1)
  }

  console.log(`\nAntes:`)
  console.log(`  id:            ${user.id}`)
  console.log(`  email:         ${user.email}`)
  console.log(`  role:          ${user.role}`)
  console.log(`  tenant_id:     ${user.tenant_id}`)
  console.log(`  clerk_user_id: ${user.clerk_user_id}`)

  if (user.clerk_user_id === newClerkId) {
    console.log(`\nNada a fazer — clerk_user_id já é ${newClerkId}.`)
    return
  }

  const updated = await prisma.usuario.update({
    where: { id: user.id },
    data: { clerk_user_id: newClerkId },
    select: { id: true, email: true, clerk_user_id: true },
  })

  console.log(`\n✓ Atualizado:`)
  console.log(`  clerk_user_id: ${user.clerk_user_id} → ${updated.clerk_user_id}`)
  console.log(`\nReinicie o backend (ou espere o cache TTL expirar) para o requireAuth pegar o novo link.`)
}

main()
  .catch(err => {
    console.error('Erro:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
