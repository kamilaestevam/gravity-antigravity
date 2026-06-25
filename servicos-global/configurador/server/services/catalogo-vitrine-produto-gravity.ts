/**
 * Catálogo vitrine Store + HUB — SSOT (Admin ProdutoGravity).
 * Ordem e lista vêm do banco (ATIVO/EM_BREVE); ordenação até campo ordem no Admin (Coordenador).
 */

import { prisma } from '../lib/prisma.js'
import { STACK_ORDER_PRODUTOS_GRAVITY } from '../../shared/stack-order-produtos-gravity.js'

/** DTO compacto — mesmo contrato em /hub/init, /hub/catalogo e GET /produtos-gravity. */
export interface CatalogoVitrineProdutoGravityDto {
  id: string
  name: string
  slug: string
  description: string
  status: string
}

const STATUS_VITRINE = ['ATIVO', 'EM_BREVE'] as const

/**
 * Ordem do puzzle stack — SSOT `shared/stack-order-produtos-gravity.ts`.
 */
export const ORDEM_STACK_SLUGS_CANONICOS: readonly string[] = STACK_ORDER_PRODUTOS_GRAVITY

export function slugCanonicoProdutoGravityServidor(slug: string): string {
  if (slug === 'bid-frete-internacional') return 'bid-frete'
  if (slug === 'nf-import') return 'nf-importacao'
  if (slug === 'smart-trnsito') return 'smart-transito'
  if (slug === 'catlogo-de-produtos') return 'catalogo-produto'
  if (slug === 'smart-read-') return 'smart-read'
  return slug
}

function indiceOrdemVitrine(slug: string): number {
  const canon = slugCanonicoProdutoGravityServidor(slug)
  const i = ORDEM_STACK_SLUGS_CANONICOS.indexOf(canon)
  if (i >= 0) return i
  return ORDEM_STACK_SLUGS_CANONICOS.length
}

type LinhaVitrine = {
  id_produto_gravity: string
  nome_produto_gravity: string
  slug_produto_gravity: string
  descricao_produto_gravity: string
  status_produto_gravity: string
}

function ordenarLinhasVitrine(rows: LinhaVitrine[]): LinhaVitrine[] {
  return [...rows].sort((a, b) => {
    const diff = indiceOrdemVitrine(a.slug_produto_gravity) - indiceOrdemVitrine(b.slug_produto_gravity)
    if (diff !== 0) return diff
    return a.nome_produto_gravity.localeCompare(b.nome_produto_gravity, 'pt-BR')
  })
}

/** Uma peça por slug canônico (ex.: bid-frete-internacional → bid-frete). */
function deduplicarLinhasVitrine(rows: LinhaVitrine[]): LinhaVitrine[] {
  const vistos = new Set<string>()
  const out: LinhaVitrine[] = []
  for (const row of rows) {
    const canon = slugCanonicoProdutoGravityServidor(row.slug_produto_gravity)
    if (vistos.has(canon)) continue
    vistos.add(canon)
    out.push(row)
  }
  return out
}

function toDto(row: LinhaVitrine): CatalogoVitrineProdutoGravityDto {
  return {
    id: row.id_produto_gravity,
    name: row.nome_produto_gravity,
    slug: row.slug_produto_gravity,
    description: row.descricao_produto_gravity,
    status: row.status_produto_gravity,
  }
}

/**
 * Lista catálogo para Store, HUB e vitrine pública — fonte única.
 */
export async function listarCatalogoVitrineProdutoGravity(): Promise<CatalogoVitrineProdutoGravityDto[]> {
  const rows = await prisma.produtoGravity.findMany({
    where: {
      status_produto_gravity: { in: [...STATUS_VITRINE] },
      data_remocao_produto_gravity: null,
    },
    select: {
      id_produto_gravity: true,
      nome_produto_gravity: true,
      slug_produto_gravity: true,
      descricao_produto_gravity: true,
      status_produto_gravity: true,
    },
  })

  return deduplicarLinhasVitrine(ordenarLinhasVitrine(rows)).map(toDto)
}
