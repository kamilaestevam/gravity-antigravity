/**
 * types.ts — Labels de UI do Estimativa Custo.
 * Tipos e enums do domínio vivem em schemas-estimativa-custo.ts (contrato Zod).
 */
import type {
  TipoOperacaoEstimativaCusto,
  DetalheOperacaoEstimativaCusto,
  StatusEstimativaCusto,
  TipoCobrancaEstimativaCusto,
  TipoDocumentoEstimativaCusto,
} from './schemas-estimativa-custo'

export const OPERACAO_LABELS: Record<TipoOperacaoEstimativaCusto, string> = {
  IMPORTACAO: 'Importação',
  EXPORTACAO: 'Exportação',
}

export const DETALHE_OPERACAO_LABELS: Record<DetalheOperacaoEstimativaCusto, string> = {
  DIRETA: 'Direta',
  CONTA_ORDEM: 'Conta e Ordem',
  ENCOMENDA: 'Encomenda',
  COMERCIAL_EXPORTADORA: 'Comercial Exportadora',
}

export const STATUS_LABELS: Record<StatusEstimativaCusto, string> = {
  EM_CRIACAO: 'Em Criação',
  CRIADA: 'Criada',
  ARQUIVADA: 'Arquivada',
}

export const STATUS_BADGE: Record<StatusEstimativaCusto, 'warning' | 'success' | 'default'> = {
  EM_CRIACAO: 'warning',
  CRIADA: 'success',
  ARQUIVADA: 'default',
}

export const DOCUMENTO_LABELS: Record<TipoDocumentoEstimativaCusto, string> = {
  PEDIDO_COMPRA: 'Pedido de Compra',
  PEDIDO_VENDA: 'Pedido de Venda',
  PROFORMA: 'Proforma Invoice',
  INVOICE: 'Commercial Invoice',
  OUTRO: 'Outro',
}

export const COBRANCA_LABELS: Record<TipoCobrancaEstimativaCusto, string> = {
  PROCESSO: 'Por Processo',
  CONTAINER: 'Por Container',
  AWB: 'Por AWB',
  BL: 'Por BL',
  CRT: 'Por CRT',
  KGS: 'Por Kg',
  TON: 'Por Tonelada',
  CAIXA: 'Por Caixa',
  M3: 'Por m³',
}

export type {
  TipoOperacaoEstimativaCusto,
  DetalheOperacaoEstimativaCusto,
  StatusEstimativaCusto,
  TipoCobrancaEstimativaCusto,
  TipoDocumentoEstimativaCusto,
  EstimativaCusto,
  EstimativaCustoDetalhe,
  EntradaEstimativaCusto,
  EntradaSimulacaoEstimativaCusto,
  KpisEstimativaCusto,
  ResultadoSimulacaoEstimativaCusto,
} from './schemas-estimativa-custo'
