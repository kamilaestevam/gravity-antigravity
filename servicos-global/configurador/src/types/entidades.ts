/**
 * tipos/entidades.ts
 * Definições core das entidades da plataforma vinculadas aos serviços globais (Onda 3).
 */

export type StatusGlobal = 'Ativo' | 'Suspenso' | 'Em Breve' | 'Legado' | 'Inativo'

export interface Preco {
  valor: string // formatado ex: "1.234,56"
  moeda: string // ex: "BRL", "USD"
}

export interface FaixaPreco {
  id: string
  de: number
  ate?: number
  valor: string
  moeda: string
}

export interface ProdutoCatalogo {
  id: string
  nome: string
  descricao: string
  slug: string // identificador único para rotas e APIs
  status: StatusGlobal
  dataLancamento?: string
  
  // Configuração de Setup
  temSetup: boolean
  precoSetup?: Preco

  // Configuração de Cobranca (Franquia/Processos)
  tipoCobranca: string // ex: "Mensalidade", "Por Processo"
  precoUnitario: Preco
  precoMinimo: Preco
  precoTotal?: Preco

  // Configuração de Usuários
  limiteUsuarios: 'ilimitada' | 'limitada'
  qtdUsuariosBase?: number
  precoUsuarioAdicional?: Preco

  // Configuração de Atendimento
  horasHelpDesk: number
  precoHoraAdicional?: Preco

  // Metadados de Link
  moduloBackend?: string // ex: "simula-custo", "atividades"
  publicoAlvo?: string
  faixasPreco?: FaixaPreco[] // Adicionado para precificação por camadas (Tiers)
}

export interface NegociacaoEspecial {
  id: string
  produtoId: string
  tenantId: string // ID da Organização (Clerk/Gravity)
  tenantNome: string // Nome para display facilitado
  acordo: string // Descrição da condição (ex: "Desconto 20%")
  inicio?: string // ISO date
  fim?: string // ISO date
  ilimitada: boolean
}

export interface Tenant {
  id: string
  name: string
  slug: string
  status: 'Ativa' | 'Suspensa'
  created_at: string
  plan?: string // Plano base (Enterprise, Pro, etc)
  _count?: {
    users: number
    companies: number
  }
}
