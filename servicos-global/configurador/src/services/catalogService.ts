/**
 * services/catalogService.ts
 * "Database local" persistente (localStorage) para centralizar os vínculos de produtos reais.
 */

import { ProdutoCatalogo, NegociacaoEspecial, Tenant, Preco } from '../types/entidades'

const KEYS = {
  PRODUTOS: 'gravity_catalog_produtos',
  NEGOCIACOES: 'gravity_catalog_negociacoes',
  TENANTS: 'gravity_catalog_tenants'
}

// ─── Dados Iniciais (O Portfólio Real) ────────────────────────────────────────

const PRODUTOS_INICIAIS: ProdutoCatalogo[] = [
  {
    id: 'p1',
    nome: 'SimulaCusto',
    descricao: 'Gestão de custos estimados de exportação e importação',
    slug: 'simula-custo',
    status: 'Ativo',
    tipoCobranca: 'Por Estimativa',
    temSetup: false,
    precoUnitario: { valor: '10,99', moeda: 'BRL' },
    precoMinimo: { valor: '0,00', moeda: 'BRL' },
    limiteUsuarios: 'limitada',
    qtdUsuariosBase: 10, // Até 10 estimativas free
    horasHelpDesk: 0,
    publicoAlvo: 'Importadores, exportadores e despachantes aduaneiros',
    moduloBackend: 'simula-custo'
  },
  {
    id: 'p2',
    nome: 'Smart Read',
    descricao: 'Leitura inteligente de documentos via OCR e IA',
    slug: 'smart-read',
    status: 'Ativo',
    tipoCobranca: 'Por Documento',
    temSetup: false,
    precoUnitario: { valor: '5,99', moeda: 'BRL' },
    precoMinimo: { valor: '0,00', moeda: 'BRL' },
    limiteUsuarios: 'ilimitada',
    horasHelpDesk: 0,
    publicoAlvo: 'Logística, Financeiro e Aduaneiro',
    moduloBackend: 'smart-read',
    faixasPreco: [
      { id: 'f1', de: 10, ate: 100, valor: '5,99', moeda: 'BRL' },
      { id: 'f2', de: 100, ate: 500, valor: '2,99', moeda: 'BRL' },
      { id: 'f3', de: 500, valor: '1,99', moeda: 'BRL' },
    ]
  },
  {
    id: 'p3',
    nome: 'BID Frete Internacional',
    descricao: 'Licitação inteligente de fretes internacionais com análise de fornecedores, ranking automático e cálculo de savings',
    slug: 'bid-frete',
    status: 'Ativo',
    tipoCobranca: 'Por Processo',
    temSetup: true,
    precoUnitario: { valor: '1,99', moeda: 'BRL' },
    precoMinimo: { valor: '199,00', moeda: 'BRL' },
    limiteUsuarios: 'ilimitada',
    horasHelpDesk: 0,
    publicoAlvo: 'Importadores, exportadores e despachantes aduaneiros',
    moduloBackend: 'bid-frete'
  }
]

const NEGOCIACOES_INICIAIS: NegociacaoEspecial[] = []

// ─── Lógica do Serviço ─────────────────────────────────────────────────────────

export const catalogService = {
  // --- Produtos ---
  getProdutos(): ProdutoCatalogo[] {
    const data = localStorage.getItem(KEYS.PRODUTOS)
    if (!data) {
      this.resetParaIniciais()
      return PRODUTOS_INICIAIS
    }
    return JSON.parse(data)
  },

  saveProduto(produto: ProdutoCatalogo): void {
    const produtos = this.getProdutos()
    const index = produtos.findIndex(p => p.id === produto.id)
    if (index >= 0) {
      produtos[index] = produto
    } else {
      produtos.push(produto)
    }
    localStorage.setItem(KEYS.PRODUTOS, JSON.stringify(produtos))
  },

  toggleProdutoStatus(id: string): void {
    const produtos = this.getProdutos()
    const p = produtos.find(item => item.id === id)
    if (p) {
      p.status = p.status === 'Ativo' ? 'Suspenso' : 'Ativo'
      localStorage.setItem(KEYS.PRODUTOS, JSON.stringify(produtos))
    }
  },

  deleteProduto(id: string): void {
    const produtos = this.getProdutos().filter(p => p.id !== id)
    localStorage.setItem(KEYS.PRODUTOS, JSON.stringify(produtos))
  },

  // --- Negociações ---
  getNegociacoes(): NegociacaoEspecial[] {
    const data = localStorage.getItem(KEYS.NEGOCIACOES)
    return data ? JSON.parse(data) : NEGOCIACOES_INICIAIS
  },

  saveNegociacao(negociacao: NegociacaoEspecial): void {
    const negociacoes = this.getNegociacoes()
    negociacoes.push(negociacao)
    localStorage.setItem(KEYS.NEGOCIACOES, JSON.stringify(negociacoes))
  },

  // --- Reset ---
  resetParaIniciais(): void {
    localStorage.setItem(KEYS.PRODUTOS, JSON.stringify(PRODUTOS_INICIAIS))
    localStorage.setItem(KEYS.NEGOCIACOES, JSON.stringify(NEGOCIACOES_INICIAIS))
  }
}
