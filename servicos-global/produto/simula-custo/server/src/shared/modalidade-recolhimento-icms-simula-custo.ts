/**
 * Modalidade de recolhimento do ICMS na importação (termo fiscal COMEX).
 * INTEGRAL: antecipado no desembaraço | DIFERIDO: GLME / pagamento posterior
 * ISENTO: isenção | REDUCAO: benefício ou base reduzida (alíquota nominal do usuário).
 */
export const MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO = [
  'INTEGRAL',
  'REDUCAO',
  'ISENTO',
  'DIFERIDO',
] as const

export type ModalidadeRecolhimentoIcmsSimulaCusto =
  (typeof MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO)[number]

export function resolverAliquotaIcmsParaCalculoSimulaCusto(
  modalidade: ModalidadeRecolhimentoIcmsSimulaCusto,
  aliquotaNominal: number,
): number {
  if (modalidade === 'ISENTO' || modalidade === 'DIFERIDO') return 0
  return aliquotaNominal
}

export function icmsCompoeNacionalizadoSimulaCusto(
  modalidade: ModalidadeRecolhimentoIcmsSimulaCusto,
): boolean {
  return modalidade === 'INTEGRAL' || modalidade === 'REDUCAO'
}
