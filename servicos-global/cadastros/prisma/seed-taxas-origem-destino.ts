import { PrismaClient } from '../generated/index.js'
import { TAXAS_ORIGEM_DESTINO_CANONICAS } from './data/taxas-origem-destino-canonicas.js'

const url = process.env.DATABASE_URL ?? process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('[seed-taxas-origem-destino] DATABASE_URL ou CADASTROS_DATABASE_URL ausente.')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

async function main() {
  for (const t of TAXAS_ORIGEM_DESTINO_CANONICAS) {
    const dados = {
      nome_taxa_origem_destino: t.nome,
      descricao_taxa_origem_destino: t.descricao ?? null,
      tipo_taxa_origem_destino: t.tipo,
      codigo_taxa_origem_destino: t.codigo,
      ativo_taxa_origem_destino: true,
    }
    await prisma.taxaOrigemDestino.upsert({
      where: { codigo_taxa_origem_destino: t.codigo },
      create: dados,
      update: {
        nome_taxa_origem_destino: dados.nome_taxa_origem_destino,
        descricao_taxa_origem_destino: dados.descricao_taxa_origem_destino,
        tipo_taxa_origem_destino: dados.tipo_taxa_origem_destino,
        ativo_taxa_origem_destino: dados.ativo_taxa_origem_destino,
      },
    })
  }
  console.log(`[seed-taxas-origem-destino] total=${await prisma.taxaOrigemDestino.count()}`)
}

main()
  .catch((err) => {
    console.error('[seed-taxas-origem-destino] ERRO:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
