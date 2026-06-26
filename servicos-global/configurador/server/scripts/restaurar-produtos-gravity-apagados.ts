/**
 * Restaura produtos do catálogo apagados pelo ensureMissingProducts legado (hard-delete).
 * Idempotente — só cria slugs que não existem.
 *
 *   npx tsx --env-file=.env server/scripts/restaurar-produtos-gravity-apagados.ts
 *   npx tsx --env-file=.env server/scripts/restaurar-produtos-gravity-apagados.ts --apply
 */
import type { Prisma } from '../../../../configurador/generated/index.js'
import { prisma } from '../lib/prisma.js'

const apply = process.argv.includes('--apply')

const PRODUTOS_RESTAURAR: Prisma.ProdutoGravityUncheckedCreateInput[] = [
  {
    nome_produto_gravity: 'Catálogo de Produtos',
    slug_produto_gravity: 'catlogo-de-produtos',
    descricao_produto_gravity: 'Catálogo de produtos para operações COMEX',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'POR_PRODUTO',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'catalogo-produto',
  },
  {
    nome_produto_gravity: 'DUE',
    slug_produto_gravity: 'due',
    descricao_produto_gravity: 'Declaração Única de Exportação',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'POR_DUE',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'due',
  },
  {
    nome_produto_gravity: 'DUIMP',
    slug_produto_gravity: 'duimp',
    descricao_produto_gravity: 'Declaração Única de Importação',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'POR_DI_DUIMP',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'duimp',
  },
  {
    nome_produto_gravity: 'Financeiro Comex',
    slug_produto_gravity: 'financeiro-comex',
    descricao_produto_gravity: 'Gestão financeira de operações de comércio exterior',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'MENSAL',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'financeiro-comex',
  },
  {
    nome_produto_gravity: 'LPCO',
    slug_produto_gravity: 'lpco',
    descricao_produto_gravity: 'Licenças, Permissões, Certificados e Outros',
    status_produto_gravity: 'ATIVO',
    tipo_cobranca_produto_gravity: 'POR_LPCO',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'lpco',
  },
  {
    nome_produto_gravity: 'Orkestra',
    slug_produto_gravity: 'orkestra',
    descricao_produto_gravity: 'Orquestração de processos COMEX',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'POR_FLUXO',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'orkestra',
  },
  {
    nome_produto_gravity: 'Smart Docs',
    slug_produto_gravity: 'smart-read',
    descricao_produto_gravity: 'Inteligência documental para COMEX — extração, conferência, riscos e Q&A com IA',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'POR_DOCUMENTO',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'smart-read',
  },
  {
    nome_produto_gravity: 'Smart Trânsito',
    slug_produto_gravity: 'smart-trnsito',
    descricao_produto_gravity: 'Rastreamento e gestão de trânsito aduaneiro',
    status_produto_gravity: 'EM_BREVE',
    tipo_cobranca_produto_gravity: 'POR_PROCESSO',
    preco_unitario_produto_gravity: 1.99,
    modulo_backend_produto_gravity: 'smart-transito',
  },
]

let criados = 0
let ignorados = 0

for (const data of PRODUTOS_RESTAURAR) {
  const slug = data.slug_produto_gravity as string
  const existente = await prisma.produtoGravity.findFirst({
    where: { slug_produto_gravity: slug, data_remocao_produto_gravity: null },
  })
  if (existente) {
    console.log(`[skip] ${slug} já existe (${existente.status_produto_gravity})`)
    ignorados++
    continue
  }
  if (!apply) {
    console.log(`[dry-run] criaria ${slug} (${data.status_produto_gravity})`)
    criados++
    continue
  }
  await prisma.produtoGravity.create({ data })
  console.log(`[ok] criado ${slug} (${data.status_produto_gravity})`)
  criados++
}

const total = await prisma.produtoGravity.count({ where: { data_remocao_produto_gravity: null } })
console.log(
  apply
    ? `\nConcluído: ${criados} criado(s), ${ignorados} já existiam. Total catálogo: ${total}`
    : `\nDry-run: ${criados} seriam criados. Rode com --apply para gravar.`,
)

await prisma.$disconnect()
