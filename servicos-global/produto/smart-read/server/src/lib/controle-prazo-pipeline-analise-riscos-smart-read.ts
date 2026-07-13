/**
 * controle-prazo-pipeline-analise-riscos-smart-read.ts — rede de segurança anti-travamento (não é meta de UX)
 */

/** Meta de UX da fase rápida (código + Receita + NCM) — não interrompe a requisição. */
export const PRAZO_FASE_RAPIDA_ANALISE_RISCOS_MS = 3_000

/** Teto de segurança do pipeline HTTP — evita requisição pendurada; não sacrifica qualidade da IA. */
export const PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS = 70_000

/** Timeout de rede por chamada Gemini (margem para documentos grandes). */
export const PRAZO_GEMINI_ANALISE_RISCOS_MS = 45_000

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
