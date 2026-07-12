/**
 * controle-prazo-pipeline-analise-riscos-smart-read.ts — SLA do wizard (≤75s) com margem no BFF
 */

/** Prazo da fase rápida (código + Receita + NCM) — meta ≤3s no wizard. */
export const PRAZO_FASE_RAPIDA_ANALISE_RISCOS_MS = 3_000

/** Prazo máximo do pipeline HTTP — alinhado ao SLA do wizard (75s) com margem no cliente (55s). */
export const PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS = 70_000

const MENSAGEM_PRAZO_ESGOTADO =
  'Pipeline interrompido — prazo máximo de análise (70s) atingido. Regras de código já avaliadas; reprocesse para concluir IA.'

export type ControlePrazoPipelineAnaliseRiscos = {
  esgotado(): boolean
  restanteMs(): number
  marcarAvisoEsgotado(avisoAtual: string | null): string
}

export function criarControlePrazoPipelineAnaliseRiscos(
  prazoMs = PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS,
): ControlePrazoPipelineAnaliseRiscos {
  const inicio = Date.now()

  return {
    esgotado() {
      return Date.now() - inicio >= prazoMs
    },
    restanteMs() {
      return Math.max(0, prazoMs - (Date.now() - inicio))
    },
    marcarAvisoEsgotado(avisoAtual) {
      return avisoAtual ?? MENSAGEM_PRAZO_ESGOTADO
    },
  }
}
