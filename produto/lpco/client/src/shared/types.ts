/**
 * types.ts — Tipos do dominio LPCO
 * Espelha enums do Prisma + labels para UI
 */

// ── Enums ─────────────────────────────────────────────────────────────────────

export type LpcoStatus =
  | 'rascunho'
  | 'para_analise'
  | 'em_analise'
  | 'em_exigencia'
  | 'resposta_exigencia'
  | 'deferida'
  | 'indeferida'
  | 'cancelada'

export type TipoOperacao = 'IMPORTACAO' | 'EXPORTACAO'

export type TipoLpco = 'POR_OPERACAO' | 'FLEX' | 'TAXA'

export type CanalEntrada = 'MANUAL' | 'PLANILHA' | 'PEDIDO' | 'SMART_READ' | 'DUPLICAR' | 'API'

// ── Labels ────────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<LpcoStatus, string> = {
  rascunho: 'Rascunho',
  para_analise: 'Para Analise',
  em_analise: 'Em Analise',
  em_exigencia: 'Em Exigencia',
  resposta_exigencia: 'Resposta Enviada',
  deferida: 'Deferida',
  indeferida: 'Indeferida',
  cancelada: 'Cancelada',
}

export const STATUS_BADGE: Record<LpcoStatus, string> = {
  rascunho: 'bg-gray-100 text-gray-800',
  para_analise: 'bg-blue-100 text-blue-800',
  em_analise: 'bg-blue-100 text-blue-800',
  em_exigencia: 'bg-yellow-100 text-yellow-800',
  resposta_exigencia: 'bg-purple-100 text-purple-800',
  deferida: 'bg-green-100 text-green-800',
  indeferida: 'bg-red-100 text-red-800',
  cancelada: 'bg-gray-100 text-gray-500',
}

export const TIPO_OPERACAO_LABELS: Record<TipoOperacao, string> = {
  IMPORTACAO: 'Importacao',
  EXPORTACAO: 'Exportacao',
}

export const TIPO_LPCO_LABELS: Record<TipoLpco, string> = {
  POR_OPERACAO: 'Por Operacao',
  FLEX: 'Flex (Guarda-chuva)',
  TAXA: 'Taxa',
}

export const CANAL_ENTRADA_LABELS: Record<CanalEntrada, string> = {
  MANUAL: 'Digitacao Manual',
  PLANILHA: 'Planilha Excel/CSV',
  PEDIDO: 'A partir do Pedido',
  SMART_READ: 'Smart Read (OCR+IA)',
  DUPLICAR: 'Duplicado de existente',
  API: 'Integracao via API',
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Lpco {
  id: string
  tenant_id: string
  company_id: string
  tipo_operacao: TipoOperacao
  tipo_lpco: TipoLpco
  orgao_anuente: string
  modelo_lpco: string
  numero_portal: string | null
  pais_procedencia: string
  fundamento_legal: string
  importacao_exportador_id: string | null
  exportacao_importador_id: string | null
  canal_entrada: CanalEntrada
  pedido_origem_id: string | null
  status: LpcoStatus
  data_registro: string | null
  data_deferimento: string | null
  data_vigencia_inicio: string | null
  data_vigencia_fim: string | null
  quantidade_deferida: number | null
  unidade_medida_saldo: string | null
  created_by: string
  created_at: string
  updated_at: string
  itens?: LpcoItem[]
  exigencias?: LpcoExigencia[]
  vinculos?: LpcoVinculo[]
}

export interface LpcoItem {
  id: string
  lpco_id: string
  ncm: string
  catalogo_produto_id: string | null
  descricao_produto: string
  fabricante: string | null
  quantidade_estatistica: number
  unidade_medida: string
  peso_liquido: number
  vmle: number
  moeda: string
  condicao_venda: string | null
  atributos: LpcoAtributo[] | null
}

export interface LpcoAtributo {
  codigo: string
  nome: string
  tipo: 'texto' | 'numero' | 'data' | 'selecao' | 'booleano' | 'composto'
  obrigatorio: boolean
  valor: string | number | boolean | Record<string, unknown>
  dependeDe?: string
}

export interface LpcoExigencia {
  id: string
  lpco_id: string
  numero_exigencia: number
  descricao_exigencia: string
  data_exigencia: string
  prazo_resposta: string | null
  resposta: string | null
  data_resposta: string | null
  status: 'pendente' | 'respondida' | 'aceita' | 'rejeitada'
}

export interface LpcoVinculo {
  id: string
  lpco_id: string
  processo_id: string
  tipo_documento: 'DUIMP' | 'DUE'
  numero_documento: string | null
  quantidade_vinculada: number | null
  unidade_medida: string | null
  status: 'ativo' | 'cancelado'
}

export interface LpcoHistoricoEvento {
  id: string
  lpco_id: string
  evento: string
  status_anterior: string | null
  status_novo: string | null
  descricao: string
  user_nome: string | null
  created_at: string
}

// ── Orgaos Anuentes ───────────────────────────────────────────────────────────

export const ORGAOS_ANUENTES = [
  { sigla: 'ANVISA', nome: 'Agencia Nacional de Vigilancia Sanitaria' },
  { sigla: 'MAPA', nome: 'Ministerio da Agricultura e Pecuaria' },
  { sigla: 'IBAMA', nome: 'Instituto Brasileiro do Meio Ambiente' },
  { sigla: 'INMETRO', nome: 'Instituto Nacional de Metrologia' },
  { sigla: 'ANP', nome: 'Agencia Nacional do Petroleo' },
  { sigla: 'DECEX', nome: 'Departamento de Operacoes de COMEX' },
  { sigla: 'DPF', nome: 'Departamento de Policia Federal' },
  { sigla: 'DFPC', nome: 'Diretoria de Fiscalizacao de Produtos Controlados' },
  { sigla: 'CNEN', nome: 'Comissao Nacional de Energia Nuclear' },
  { sigla: 'CNPq', nome: 'Conselho Nacional de Desenv. Cientifico' },
  { sigla: 'MCTI', nome: 'Ministerio de Ciencia e Tecnologia' },
  { sigla: 'ANM', nome: 'Agencia Nacional de Mineracao' },
  { sigla: 'ANEEL', nome: 'Agencia Nacional de Energia Eletrica' },
  { sigla: 'ANCINE', nome: 'Agencia Nacional do Cinema' },
  { sigla: 'ECT', nome: 'Correios' },
  { sigla: 'SUFRAMA', nome: 'Superintendencia Zona Franca de Manaus' },
] as const
