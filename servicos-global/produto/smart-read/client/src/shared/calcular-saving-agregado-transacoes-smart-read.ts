/**
 * Saving agregado de transações — re-export do SSOT compartilhado (client + BFF).
 * A implementação vive em shared/calcular-saving-agregado-transacoes-smart-read.ts.
 */
export {
  calcularSavingAgregadoTransacoesSmartRead,
} from '../../../shared/calcular-saving-agregado-transacoes-smart-read'
export type {
  SavingAgregadoTransacoesSmartRead,
  TransacaoEntradaSavingAgregadoSmartRead,
} from '../../../shared/calcular-saving-agregado-transacoes-smart-read'
