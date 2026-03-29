/**
 * services/catalogService.ts
 * Consome a API real do Configurador (Porta 8005) conectada ao Railway.
 * Substitui o antigo localStorage para garantir SSOT (Single Source of Truth).
 */

import { ProdutoCatalogo, NegociacaoEspecial } from '../types/entidades'

const API_URL = '/api/v1/products'

export const catalogService = {
  // --- Produtos ---
  async getProdutos(): Promise<ProdutoCatalogo[]> {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Erro ao buscar produtos')
      const data = await response.json()
      
      // Adaptador para o formato do Frontend (Mapeia GlobalProduct do Prisma -> ProdutoCatalogo do UI)
      return data.products.map((p: any) => ({
        id: p.id,
        nome: p.name,
        descricao: p.description || '',
        slug: p.slug,
        status: p.status,
        tipoCobranca: p.type_billing || 'Mensalidade',
        temSetup: Number(p.setup_price) > 0,
        precoSetup: { valor: String(p.setup_price), moeda: p.currency },
        precoUnitario: { valor: String(p.unit_price), moeda: p.currency },
        precoMinimo: { valor: String(p.min_price), moeda: p.currency },
        precoTotal: { valor: String(p.total_price), moeda: p.currency },
        limiteUsuarios: p.limit_users === 'ilimitada' ? 'ilimitada' : 'limitada', 
        qtdUsuariosBase: p.base_users,
        horasHelpDesk: p.help_desk_hours,
        moduloBackend: p.backend_module || '',
        faixasPreco: typeof p.pricing_tiers === 'string' ? JSON.parse(p.pricing_tiers) : p.pricing_tiers
      }))
    } catch (error) {
      console.error('[catalogService] Erro ao carregar catálogo real:', error)
      return []
    }
  },

  async saveProduto(produto: ProdutoCatalogo, getToken: () => Promise<string | null>): Promise<void> {
    const token = await getToken()
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: produto.id.startsWith('p') ? undefined : produto.id, // O Prisma gera se for novo
        name: produto.nome,
        description: produto.descricao,
        status: produto.status,
        type_billing: produto.tipoCobranca,
        setup_price: Number(produto.precoSetup?.valor.replace('.', '').replace(',', '.') || 0),
        unit_price: Number(produto.precoUnitario.valor.replace('.', '').replace(',', '.') || 0),
        min_price: Number(produto.precoMinimo.valor.replace('.', '').replace(',', '.') || 0),
        total_price: Number(produto.precoTotal?.valor.replace('.', '').replace(',', '.') || 0),
        currency: produto.precoUnitario.moeda || 'BRL',
        limit_users: produto.limiteUsuarios,
        base_users: produto.qtdUsuariosBase || 0,
        help_desk_hours: produto.horasHelpDesk || 0,
        backend_module: produto.moduloBackend,
        pricing_tiers: JSON.stringify(produto.faixasPreco || [])
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao salvar produto')
    }
  },

  async toggleProdutoStatus(id: string, novoStatus: string, getToken: () => Promise<string | null>): Promise<void> {
    const token = await getToken()
    // Como ainda não temos rota de PATCH específica, usamos o POST que faz upsert ou criamos uma pequena rota rápida
    // Por enquanto, vamos implementar a deleção e recriação ou apenas marcar como suspenso via API de POST
    const produtos = await this.getProdutos()
    const p = produtos.find(item => item.id === id)
    if (p) {
      p.status = novoStatus as any
      await this.saveProduto(p, getToken)
    }
  },

  async deleteProduto(id: string, getToken: () => Promise<string | null>): Promise<void> {
    const token = await getToken()
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Erro ao excluir produto')
  },

  // --- Negociações (Em breve migrar para a tabela correspondente) ---
  getNegociacoes(): NegociacaoEspecial[] {
    return [] // Retorna vazio no Admin até a conexão de Billing estar pronta
  }
}
