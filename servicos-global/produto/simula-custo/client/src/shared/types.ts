/**
 * types.ts — Labels de UI do Simula Custo.
 * Tipos e enums do domínio vivem em schemas-simula-custo.ts (contrato Zod).
 */
import type {
  TipoOperacaoSimulaCusto,
  DetalheOperacaoSimulaCusto,
  StatusSimulaCusto,
  TipoCobrancaSimulaCusto,
  TipoDocumentoSimulaCusto,
  TipoValorPrazoPagamentoSimulaCusto,
  MomentoPrazoPagamentoSimulaCusto,
  FatoGeradorPrazoPagamentoSimulaCusto,
} from './schemas-simula-custo'

export const OPERACAO_LABELS: Record<TipoOperacaoSimulaCusto, string> = {
  IMPORTACAO: 'Importação',
  EXPORTACAO: 'Exportação',
}

/** Conta e Ordem + Encomenda unificados na UI como "Trading" (mesmo conceito comercial). */
export const DETALHE_OPERACAO_LABELS: Record<DetalheOperacaoSimulaCusto, string> = {
  DIRETA: 'Direta',
  CONTA_ORDEM: 'Trading',
  ENCOMENDA: 'Trading',
  COMERCIAL_EXPORTADORA: 'Comercial Exportadora',
}

/** Códigos legados que a UI trata como a modalidade Trading. */
export const DETALHES_OPERACAO_TRADING: readonly DetalheOperacaoSimulaCusto[] = [
  'CONTA_ORDEM',
  'ENCOMENDA',
]

/** Valor persistido ao escolher Trading (enum do banco ainda distingue os legados). */
export const DETALHE_OPERACAO_TRADING_PADRAO: DetalheOperacaoSimulaCusto = 'CONTA_ORDEM'

export function ehModalidadeTrading(detalhe: DetalheOperacaoSimulaCusto): boolean {
  return DETALHES_OPERACAO_TRADING.includes(detalhe)
}

export const STATUS_LABELS: Record<StatusSimulaCusto, string> = {
  EM_CRIACAO: 'Em Criação',
  CRIADA: 'Criada',
  ARQUIVADA: 'Arquivada',
}

export const STATUS_BADGE: Record<StatusSimulaCusto, 'warning' | 'success' | 'default'> = {
  EM_CRIACAO: 'warning',
  CRIADA: 'success',
  ARQUIVADA: 'default',
}

export const DOCUMENTO_LABELS: Record<TipoDocumentoSimulaCusto, string> = {
  PEDIDO_COMPRA: 'Pedido de Compra',
  PEDIDO_VENDA: 'Pedido de Venda',
  PROFORMA: 'Proforma Invoice',
  INVOICE: 'Commercial Invoice',
  OUTRO: 'Outro',
}

export const TIPO_VALOR_PRAZO_LABELS: Record<TipoValorPrazoPagamentoSimulaCusto, string> = {
  VALOR: 'Valor',
  PERCENTUAL: '%',
}

export const MOMENTO_PRAZO_LABELS: Record<MomentoPrazoPagamentoSimulaCusto, string> = {
  NO_DIA: 'No dia',
  ANTES: 'Antes',
  DEPOIS: 'Depois',
}

export const FATO_GERADOR_PRAZO_LABELS: Record<FatoGeradorPrazoPagamentoSimulaCusto, string> = {
  PRODUCAO: 'Produção',
  ENTREGA_NA_ORIGEM: 'Entrega na origem',
  ENTREGA_NO_PORTO_DE_ORIGEM: 'Entrega no porto de origem',
  ENTREGA_NO_LOCAL_DE_ORIGEM: 'Entrega no local de origem',
  ENTREGA_NO_DESTINO: 'Entrega no destino',
  NO_BL: 'No BL',
  ENTREGA_NO_PORTO_DE_DESTINO: 'Entrega no porto de destino',
  ENTREGA_NO_LOCAL_DE_DESTINO: 'Entrega no local de destino',
  EMBARQUE_NO_DESTINO: 'Embarque na origem',
  CHEGADA_NO_DESTINO: 'Chegada no destino',
}

export const FATOS_GERADOR_PRAZO_ORDEM: FatoGeradorPrazoPagamentoSimulaCusto[] = [
  'PRODUCAO',
  'ENTREGA_NA_ORIGEM',
  'ENTREGA_NO_PORTO_DE_ORIGEM',
  'ENTREGA_NO_LOCAL_DE_ORIGEM',
  'ENTREGA_NO_DESTINO',
  'NO_BL',
  'ENTREGA_NO_PORTO_DE_DESTINO',
  'ENTREGA_NO_LOCAL_DE_DESTINO',
  'EMBARQUE_NO_DESTINO',
  'CHEGADA_NO_DESTINO',
]

export const COBRANCA_LABELS: Record<TipoCobrancaSimulaCusto, string> = {
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
  TipoOperacaoSimulaCusto,
  DetalheOperacaoSimulaCusto,
  StatusSimulaCusto,
  TipoCobrancaSimulaCusto,
  TipoDocumentoSimulaCusto,
  SimulaCusto,
  SimulaCustoDetalhe,
  EntradaSimulaCusto,
  EntradaSimulacaoSimulaCusto,
  KpisSimulaCusto,
  ResultadoSimulacaoSimulaCusto,
} from './schemas-simula-custo'
