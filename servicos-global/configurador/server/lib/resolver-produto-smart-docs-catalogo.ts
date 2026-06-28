/**
 * Resolve o produto Smart Docs ativo no catálogo Admin após rebrand/arquivamento de duplicatas.
 */
import { prisma } from './prisma.js'
import { slugCanonicoProdutoGravityServidor } from '../services/catalogo-vitrine-produto-gravity.js'
import { SLUG_PRODUTO_SMART_READ } from './resolver-vinculo-smart-read-legado.js'

export function ehReferenciaProdutoSmartDocsNoCatalogo(slug: string): boolean {
  const bruto = slug.trim().toLowerCase()
  if (!bruto) return false
  if (slugCanonicoProdutoGravityServidor(slug) === SLUG_PRODUTO_SMART_READ) return true
  return bruto.includes('smart-read') || bruto.includes('smart-docs')
}

export async function buscarProdutoSmartDocsAtivoNoCatalogo<T extends object>(include: T) {
  return prisma.produtoGravity.findFirst({
    where: {
      data_remocao_produto_gravity: null,
      OR: [
        { slug_produto_gravity: SLUG_PRODUTO_SMART_READ },
        { nome_produto_gravity: { equals: 'Smart Docs', mode: 'insensitive' } },
        { nome_produto_gravity: { contains: 'Smart Read', mode: 'insensitive' } },
      ],
    },
    include,
  })
}

/** Slug canônico para APIs de assinatura e modal (sempre smart-read quando for Smart Docs). */
export function slugCatalogoExibicaoAssinaturaSmartDocs(slug: string, nome?: string): string {
  if (ehReferenciaProdutoSmartDocsNoCatalogo(slug)) return SLUG_PRODUTO_SMART_READ
  const nomeNorm = (nome ?? '').trim().toLowerCase()
  if (nomeNorm.includes('smart docs') || nomeNorm.includes('smart read')) {
    return SLUG_PRODUTO_SMART_READ
  }
  return slugCanonicoProdutoGravityServidor(slug)
}
