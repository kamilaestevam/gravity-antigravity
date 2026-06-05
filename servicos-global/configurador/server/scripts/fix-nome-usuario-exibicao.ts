/**
 * Atualiza nome_usuario no banco (exibição no HUB e produtos).
 *
 * Uso (servicos-global/configurador):
 *   npx tsx server/scripts/fix-nome-usuario-exibicao.ts --email=dmmltda+prodmaster01@gmail.com --nome="Usuário Teste Gravity"
 */
import 'dotenv/config'
import { PrismaClient } from '../../../../configurador/generated/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.CONFIGURADOR_DATABASE_URL } },
})

function getArg(flag: string): string | undefined {
  const match = process.argv.find(a => a.startsWith(`--${flag}=`))
  return match?.slice(flag.length + 3)
}

async function main() {
  const email = getArg('email')
  const nome = getArg('nome')
  if (!email || !nome) {
    console.error('Uso: --email=... --nome="..."')
    process.exit(1)
  }

  const usuario = await prisma.usuario.findFirst({
    where: { email_usuario: email },
    select: { id_usuario: true, nome_usuario: true, email_usuario: true },
  })

  if (!usuario) {
    console.error(`Usuário não encontrado: ${email}`)
    process.exit(1)
  }

  await prisma.usuario.update({
    where: { id_usuario: usuario.id_usuario },
    data: { nome_usuario: nome },
  })

  console.log(`✔ ${usuario.email_usuario}`)
  console.log(`  antes: ${usuario.nome_usuario}`)
  console.log(`  depois: ${nome}`)
}

main()
  .catch((err: Error) => {
    console.error(err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
