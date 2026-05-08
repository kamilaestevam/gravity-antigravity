/**
 * Script pontual: faz o link Organizacao.suid_empresa_organizacao para a
 * empresa-da-org no Cadastros — workaround para orgs criadas antes do
 * onboarding ter esse passo.
 *
 * Uso: npx tsx scripts/sob-demanda/link-empresa-organizacao-cde.ts
 */
import { PrismaClient } from '../../configurador/generated/index.js'

const prisma = new PrismaClient()

async function main() {
  const ID_ORG = 'cmoarq22a000l1358c1p2qfqt'
  const SUID_EMPRESA = 'BR-CDE-00013'

  const atualizada = await prisma.organizacao.update({
    where: { id_organizacao: ID_ORG },
    data: { suid_empresa_organizacao: SUID_EMPRESA },
    select: { id_organizacao: true, nome_organizacao: true, suid_empresa_organizacao: true },
  })

  console.log('Organização atualizada:', atualizada)
}

main()
  .catch((err) => {
    console.error('Erro:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
