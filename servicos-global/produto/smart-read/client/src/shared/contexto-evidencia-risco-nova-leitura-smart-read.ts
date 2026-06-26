/**
 * Contexto para abrir o documento com destaque do risco na evidência.
 */

export type ContextoEvidenciaRiscoNovaLeitura = {
  idArquivoLocal: string
  tituloRisco: string
  motivo: string
  analise: string
  correcao?: string
  campo?: string
  valorAtual?: string | null
  documento: string
}
