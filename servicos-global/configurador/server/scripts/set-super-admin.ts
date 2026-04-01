/**
 * set-super-admin.ts
 *
 * Define o role SUPER_ADMIN para um usuário no banco do Configurador.
 * Usado para bootstrap inicial — após isso, promoções são feitas pelo endpoint
 * POST /api/v1/admin/users/:userId/promote (que exige SUPER_ADMIN autenticado).
 *
 * Uso:
 *   cd servicos-global/configurador
 *   npx tsx server/scripts/set-super-admin.ts dmmltda@gmail.com
 *   npx tsx server/scripts/set-super-admin.ts dmmltda@gmail.com ADMIN
 */

import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

async function main() {
  const email = process.argv[2]
  const role = (process.argv[3] ?? 'SUPER_ADMIN') as 'SUPER_ADMIN' | 'ADMIN'

  if (!email) {
    console.error('Uso: npx tsx server/scripts/set-super-admin.ts <email> [SUPER_ADMIN|ADMIN]')
    process.exit(1)
  }

  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    console.error('Role inválido. Use SUPER_ADMIN ou ADMIN.')
    process.exit(1)
  }

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, email: true, role: true, tenant_id: true },
  })

  if (!user) {
    console.error(`Usuário ${email} não encontrado no banco.`)
    process.exit(1)
  }

  console.log(`\nUsuário encontrado:`)
  console.log(`  ID:       ${user.id}`)
  console.log(`  Email:    ${user.email}`)
  console.log(`  Role atual: ${user.role}`)
  console.log(`  TenantID: ${user.tenant_id}`)

  if (user.role === role) {
    console.log(`\nNada a fazer — usuário já possui role ${role}.`)
    return
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: { id: true, email: true, role: true },
  })

  console.log(`\n✓ Role atualizado: ${user.role} → ${updated.role}`)
  console.log(`  Usuário: ${updated.email}`)
}

main()
  .catch((err) => {
    console.error('Erro:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
