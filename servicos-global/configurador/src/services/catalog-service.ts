/**
 * services/catalogService.ts
 *
 * SHIM de compatibilidade — encaminha para `catalogApiService` (catalogAdapter.ts).
 * Existe enquanto os consumidores legados (`Financeiro.tsx`, `Assinaturas.tsx`)
 * não migrarem direto para `catalogApiService`. Quando isso acontecer, este
 * arquivo pode ser deletado.
 *
 * O serviço antigo apontava para `/api/v1/produtos-gravity` (rota inexistente) e usava
 * tipos legados — substituído pelo wrapper que retorna nomes Prisma.
 */

import { catalogApiService } from './catalog-adapter'
import type { ProdutoCatalogo, NegociacaoEspecial } from '../types/entidades'

export const catalogService = {
  async getProdutos(): Promise<ProdutoCatalogo[]> {
    // Tela self-service (Master/Standard) NÃO pode chamar /api/v1/admin/*.
    // Usa catálogo público — mesmos campos via toProductDto do back.
    return catalogApiService.getCatalogoPublico()
  },

  async saveProduto(produto: ProdutoCatalogo, _getToken: () => Promise<string | null>): Promise<void> {
    const isNew = !produto.id_produto_gravity
    return catalogApiService.saveProduto(produto, { isNew })
  },

  async toggleProdutoStatus(id_produto_gravity: string, _novoStatus: string, _getToken: () => Promise<string | null>): Promise<void> {
    return catalogApiService.toggleProdutoStatus(id_produto_gravity)
  },

  async deleteProduto(id_produto_gravity: string, _getToken: () => Promise<string | null>): Promise<void> {
    return catalogApiService.deleteProduto(id_produto_gravity)
  },

  // Síncrono (compat) — retorna lista vazia. Quem precisa de negociações deve
  // usar catalogApiService.getNegociacoes() (assíncrono).
  getNegociacoes(): NegociacaoEspecial[] {
    return []
  },
}
