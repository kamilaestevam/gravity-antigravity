/**
 * controle-prazo-pipeline-analise-riscos-smart-read.ts — SLA do enriquecimento no wizard (≤10s)
 */

/** Prazo da fase rápida (código + Receita + NCM) — meta ≤3s no wizard. */
export const PRAZO_FASE_RAPIDA_ANALISE_RISCOS_MS = 3_000

/** Prazo máximo total do enriquecimento (API + LLM) — meta ≤10s no wizard. */
export const PRAZO_MAXIMO_ENRIQUECIMENTO_ANALISE_RISCOS_MS = 10_000

/** Prazo da fase LLM em background (após fase rápida). */
export const PRAZO_FASE_LLM_ANALISE_RISCOS_MS =
  PRAZO_MAXIMO_ENRIQUECIMENTO_ANALISE_RISCOS_MS - PRAZO_FASE_RAPIDA_ANALISE_RISCOS_MS

/** Timeout por chamada Gemini na fase LLM (margem para overhead de rede). */
export const PRAZO_GEMINI_ANALISE_RISCOS_MS = 6_000

/** Alias legado — pipeline monolítico usa o teto total de 10s. */
export const PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS = PRAZO_MAXIMO_ENRIQUECIMENTO_ANALISE_RISCOS_MS

const MENSAGEM_PRAZO_ESGOTADO =
  'Pipeline interrompido — prazo máximo de análise (10s) atingido. Regras de código já avaliadas; reprocesse para concluir IA.'

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
