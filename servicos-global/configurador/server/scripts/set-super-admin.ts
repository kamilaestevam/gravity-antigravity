/**
 * set-super-admin.ts
 *
 * Define o role SUPER_ADMIN para um usuário no banco do Configurador.
 * Usado para bootstrap inicial — após isso, promoções são feitas pelo endpoint
 * POST /api/v1/admin/usuarios/:id_usuario/promover (que exige SUPER_ADMIN autenticado).
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

  const user = await prisma.usuario.findFirst({
    where: { email_usuario: email },
    select: { id_usuario: true, email_usuario: true, tipo_usuario: true, id_organizacao: true, id_clerk_usuario: true },
  })

  if (!user) {
    console.error(`Usuário ${email} não encontrado no banco.`)
    process.exit(1)
  }

  console.log(`\nUsuário encontrado:`)
  console.log(`  ID:       ${user.id_usuario}`)
  console.log(`  Email:    ${user.email_usuario}`)
  console.log(`  Role atual: ${user.tipo_usuario}`)
  console.log(`  TenantID: ${user.id_organizacao}`)

  if (user.tipo_usuario === role) {
    console.log(`\nNada a fazer — usuário já possui role ${role}.`)
    return
  }

  const updated = await prisma.usuario.update({
    where: { id_usuario: user.id_usuario },
    data: { tipo_usuario: role },
    select: { id_usuario: true, email_usuario: true, tipo_usuario: true },
  })

  console.log(`\n✓ Role atualizado: ${user.tipo_usuario} → ${updated.tipo_usuario}`)
  console.log(`  Usuário: ${updated.email_usuario}`)
  console.log(`  Frontend lerá o novo role na próxima chamada a /api/v1/me`)
}

main()
  .catch((err) => {
    console.error('Erro:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
