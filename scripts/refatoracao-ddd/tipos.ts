// =====================================================================
// Refatoração DDD — tipos compartilhados
// =====================================================================
// Fonte: planilha_geral_gravity (abas 1-5).
// Gerado em 2026-04-23 para a Fase 06 DDD.
// =====================================================================

export type AcaoCampo = 'RENAME' | 'DELETE' | 'CREATE'

export interface CampoRefactor {
  linha: number               // nº da linha na planilha (para auditoria)
  acao: AcaoCampo
  servico: string             // Configurador | Cadastros | Tenant | Produto - X
  tabela: string              // nome do model Prisma
  pgAtual: string             // nome atual no PostgreSQL
  pgNovo: string              // nome DDD no PostgreSQL
  prismaAtual: string         // nome atual no Prisma
  prismaNovo: string          // nome DDD no Prisma (= pgNovo por REGRA 02)
  backAtual: string           // nome atual em propriedades do backend
  backNovo: string            // nome DDD no backend
  frontAtual: string          // nome atual em propriedades do frontend
  frontNovo: string           // nome DDD no frontend
  descricao: string
  tipoDado: string            // Enum | Text | Int | Boolean | etc.
  obrigatorio: boolean
  valorPadrao: string
}

export type AcaoModel = 'RENAME' | 'DELETE'

export interface ModelRefactor {
  linha: number
  acao: AcaoModel
  servico: string
  pgAtual: string
  pgNovo: string
  prismaAtual: string
  prismaNovo: string
  descricao: string
  arquivoFragment: string
}

export interface EnumRefactor {
  linha: number
  servico: string
  nomeAtual: string
  nomeNovo: string
  valoresAtuais: string[]     // ex: ['ACTIVE', 'SUSPENDED', 'CANCELLED']
  // REGRA 07: valores mantidos em EN UPPER_SNAKE. A planilha sugere PT-BR mas
  // a skill ddd-nomenclatura prevalece — só o NOME do enum é traduzido.
}

export type AcaoRota = 'RENAME' | 'DELETE'

export interface RotaRefactor {
  linha: number
  acao: AcaoRota
  metodo: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  servico: string
  rotaAtual: string
  rotaNova: string
  prefixoMount: string
  arquivoRota: string
  descricao: string
}

export interface PlanoServico {
  servico: string
  campos: CampoRefactor[]
  models: ModelRefactor[]
  enums: EnumRefactor[]
  rotas: RotaRefactor[]
  contagem: {
    renameCampos: number
    deleteCampos: number
    createCampos: number
    renameModels: number
    deleteModels: number
    renameEnums: number
    renameRotas: number
    deleteRotas: number
  }
}

export interface PlanoCompleto {
  geradoEm: string
  planilha: string
  servicos: Record<string, PlanoServico>
  totalGeral: {
    campos: number
    models: number
    enums: number
    rotas: number
  }
}
