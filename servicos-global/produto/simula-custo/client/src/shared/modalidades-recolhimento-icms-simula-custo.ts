import type { ModalidadeRecolhimentoIcmsSimulaCusto } from './schemas-simula-custo'

export const MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO: readonly ModalidadeRecolhimentoIcmsSimulaCusto[] = [
  'INTEGRAL',
  'REDUCAO',
  'ISENTO',
  'DIFERIDO',
]

export const RECOLHIMENTO_ICMS_LABELS: Record<ModalidadeRecolhimentoIcmsSimulaCusto, string> = {
  INTEGRAL: 'Integral',
  REDUCAO: 'Redução',
  ISENTO: 'Isento',
  DIFERIDO: 'Diferido',
}

export const RECOLHIMENTO_ICMS_HINTS: Record<ModalidadeRecolhimentoIcmsSimulaCusto, string> = {
  INTEGRAL: 'Recolhimento antecipado no desembaraço (alíquota integral da UF).',
  REDUCAO: 'Benefício fiscal com redução de base — gross-up com alíquota interna da UF; imposto com alíquota efetiva (TTD/convênio).',
  ISENTO: 'Operação isenta de ICMS na importação (alíquota 0%).',
  DIFERIDO: 'ICMS diferido (ex.: GLME) — não entra no custo nacionalizado imediato.',
}
