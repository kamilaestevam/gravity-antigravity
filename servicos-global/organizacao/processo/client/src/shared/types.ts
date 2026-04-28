/**
 * types.ts — Tipos do domínio Processo
 * Skill: antigravity-criar-produto (Passo 1 — shared/types.ts)
 *
 * Interfaces TypeScript alinhadas com os modelos Prisma do servidor.
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export type StatusProcesso =
  | 'rascunho'
  | 'em_andamento'
  | 'aguardando_documentos'
  | 'em_desembaraco'
  | 'concluido'
  | 'cancelado'

export type StatusPedido =
  | 'pendente'
  | 'confirmado'
  | 'em_transito'
  | 'desembaracado'
  | 'entregue'
  | 'cancelado'

export type StatusLI = 'pendente' | 'deferida' | 'indeferida' | 'dispensada'

export type TipoFollowUp =
  | 'comentario'
  | 'alteracao_status'
  | 'documento'
  | 'email'
  | 'sistema'

export type CategoriaFollowUp =
  | 'geral'
  | 'financeiro'
  | 'documental'
  | 'operacional'
  | 'cliente'

export type TipoDocumento =
  | 'invoice'
  | 'packing_list'
  | 'bl'
  | 'certificado_origem'
  | 'li'
  | 'di'
  | 'duimp'
  | 'outros'

// ─── Entidades Principais ───────────────────────────────────────────────────

export interface Processo {
  id: string
  id_organizacao: string
  numero: string
  referencia_cliente?: string
  importador_nome: string
  importador_cnpj: string
  exportador_nome: string
  exportador_pais: string
  status: StatusProcesso
  etapa_atual?: string
  modal_transporte?: string
  incoterm?: string
  canal?: string
  regime?: string
  valor_fob_total: number
  moeda_fob: string
  peso_bruto_total: number
  data_abertura: string
  data_embarque?: string
  data_chegada?: string
  data_registro_di?: string
  data_desembaraco?: string
  data_entrega?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ProcessoEtapa {
  id: string
  processo_id: string
  nome: string
  ordem: number
  status: 'pendente' | 'em_andamento' | 'concluida' | 'pulada'
  data_inicio?: string
  data_conclusao?: string
  responsavel?: string
  observacoes?: string
  created_at: string
}

export interface Pedido {
  id: string
  processo_id: string
  id_organizacao: string
  numero: string
  exportador_nome: string
  exportador_pais: string
  status: StatusPedido
  valor_fob: number
  moeda: string
  peso_bruto: number
  data_pedido: string
  data_embarque_prevista?: string
  observacoes?: string
  created_at: string
  updated_at: string
  itens?: PedidoItem[]
}

export interface PedidoItem {
  id: string
  pedido_id: string
  numero_item: number
  descricao: string
  ncm: string
  quantidade: number
  unidade: string
  valor_unitario: number
  valor_total: number
  peso_liquido: number
  peso_bruto: number
  status_li: StatusLI
  numero_li?: string
  observacoes?: string
  created_at: string
}

export interface FollowUp {
  id: string
  processo_id: string
  id_organizacao: string
  user_id: string
  user_nome: string
  tipo: TipoFollowUp
  categoria: CategoriaFollowUp
  titulo: string
  descricao: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Documento {
  id: string
  processo_id: string
  id_organizacao: string
  tipo: TipoDocumento
  nome: string
  arquivo_url: string
  tamanho_bytes: number
  mime_type: string
  uploaded_by: string
  observacoes?: string
  created_at: string
}

export interface EstimativaCusto {
  id: string
  processo_id: string
  id_organizacao: string
  categoria: string
  descricao: string
  valor_estimado: number
  valor_real?: number
  moeda: string
  status: 'estimado' | 'confirmado' | 'pago'
  data_vencimento?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface DadosTecnicos {
  id: string
  processo_id: string
  id_organizacao: string
  // Importador
  importador_nome: string
  importador_cnpj: string
  importador_endereco?: string
  importador_cidade?: string
  importador_uf?: string
  // Exportador
  exportador_nome: string
  exportador_endereco?: string
  exportador_cidade?: string
  exportador_pais: string
  // Transporte Internacional
  via_transporte: string
  tipo_carga: string
  porto_embarque?: string
  porto_destino?: string
  companhia_transporte?: string
  numero_bl_awb?: string
  // Despacho Aduaneiro
  incoterm: string
  canal: string
  regime_tributario: string
  recinto_alfandegado?: string
  urfa?: string
  // Seguro
  seguradora?: string
  numero_apolice?: string
  valor_segurado?: number
  moeda_seguro?: string
  created_at: string
  updated_at: string
}

// ─── Tipos Compostos ────────────────────────────────────────────────────────

export interface ProcessoDetail extends Processo {
  etapas: ProcessoEtapa[]
  pedidos: Pedido[]
  followUps: FollowUp[]
  documentos: Documento[]
  estimativasCusto: EstimativaCusto[]
  dadosTecnicos?: DadosTecnicos
}

// ─── Filtros ────────────────────────────────────────────────────────────────

export interface FilterFollowUp {
  tipo?: string
  categoria?: string
}

// ─── Input Types ────────────────────────────────────────────────────────────

export interface CreateProcessoInput {
  numero: string
  referencia_cliente?: string
  importador_nome: string
  importador_cnpj: string
  exportador_nome: string
  exportador_pais: string
  modal_transporte?: string
  incoterm?: string
  regime?: string
  valor_fob_total: number
  moeda_fob: string
  peso_bruto_total: number
  observacoes?: string
}

export interface CreateFollowUpInput {
  tipo: TipoFollowUp
  categoria: CategoriaFollowUp
  titulo: string
  descricao: string
  metadata?: Record<string, unknown>
}

export interface UploadDocumentoInput {
  tipo: TipoDocumento
  nome: string
  arquivo: File
  observacoes?: string
}

// ─── Pedido (novo modelo rico) ───────────────────────────────────────────────

export interface PedidoRico {
  id: string
  id_organizacao: string
  numero: string              // numero PO
  exportador_nome?: string
  exportador_pais?: string
  status: string
  status_id?: string
  valor_fob: string           // Decimal vem como string do Prisma
  moeda: string
  peso_bruto: string          // Decimal
  data_pedido?: string
  campos_custom?: Record<string, unknown>
  created_at: string
  updated_at: string
  itens?: PedidoItemRico[]
}

export interface PedidoItemRico {
  id: string
  pedido_id: string
  numero_item: string
  descricao: string
  ncm?: string
  quantidade: string          // Decimal
  unidade: string
  valor_unitario: string      // Decimal
  valor_total: string         // Decimal
  moeda: string
  status_li: string
  campos_custom?: Record<string, unknown>
}

export interface PedidoStatusConfig {
  id: string
  nome: string
  rotulo: string
  cor: string
  icone?: string
  ordem: number
  is_padrao: boolean
  is_sistema: boolean
}

export interface PedidoColunaConfig {
  id: string
  nome: string
  rotulo: string
  tipo: 'texto' | 'numero' | 'data' | 'select' | 'booleano'
  casas_decimais: number
  opcoes?: { valor: string; rotulo: string }[]
  ordem: number
  filtravel: boolean
  exibida_padrao: boolean
  index_criado: boolean
}

export interface PedidoPreferencias {
  colunas_visiveis: string[]
  colunas_largura?: Record<string, number>
}

export interface PedidosListResponse {
  data: PedidoRico[]
  cursor_proximo?: string
  tem_mais: boolean
}
