/**
 * relink-clerk-user.ts
 *
 * Atualiza o clerk_user_id de um usuário do banco pelo email.
 * Usado quando a sessão ativa do Clerk está com id_usuario diferente do que
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
    where: { email_usuario: email },
    select: { id_usuario: true, email_usuario: true, tipo_usuario: true, id_clerk_usuario: true, id_organizacao: true },
  })

  if (!user) {
    console.error(`Usuário ${email} não encontrado.`)
    process.exit(1)
  }

  console.log(`\nAntes:`)
  console.log(`  id:            ${user.id_usuario}`)
  console.log(`  email:         ${user.email_usuario}`)
  console.log(`  role:          ${user.tipo_usuario}`)
  console.log(`  tenant_id:     ${user.id_organizacao}`)
  console.log(`  id_clerk_usuario: ${user.id_clerk_usuario}`)

  if (user.id_clerk_usuario === newClerkId) {
    console.log(`\nNada a fazer — clerk_user_id já é ${newClerkId}.`)
    return
  }

  const updated = await prisma.usuario.update({
    where: { id_usuario: user.id_usuario },
    data: { id_clerk_usuario: newClerkId },
    select: { id_usuario: true, email_usuario: true, id_clerk_usuario: true },
  })

  console.log(`\n✓ Atualizado:`)
  console.log(`  id_clerk_usuario: ${user.id_clerk_usuario} → ${updated.id_clerk_usuario}`)
  console.log(`\nReinicie o backend (ou espere o cache TTL expirar) para o requireAuth pegar o novo link.`)
}

main()
  .catch(err => {
    console.error('Erro:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
