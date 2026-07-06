export type LocalizacaoComplementarResumoNovaCotacaoBidFrete = {
  paisCodigo?: string | null
  paisNome?: string | null
  estadoProvincia?: string | null
  cidade?: string | null
  endereco?: string | null
}

export function montarPartesLocalizacaoComplementarResumoNovaCotacaoBidFrete(
  dados: LocalizacaoComplementarResumoNovaCotacaoBidFrete,
): { pais: string; estadoProvincia: string; cidade: string; endereco: string } {
  return {
    pais: (dados.paisNome ?? dados.paisCodigo ?? '').trim(),
    estadoProvincia: (dados.estadoProvincia ?? '').trim(),
    cidade: (dados.cidade ?? '').trim(),
    endereco: (dados.endereco ?? '').trim(),
  }
}

export function temLocalizacaoComplementarResumoNovaCotacaoBidFrete(
  dados: LocalizacaoComplementarResumoNovaCotacaoBidFrete,
): boolean {
  const partes = montarPartesLocalizacaoComplementarResumoNovaCotacaoBidFrete(dados)
  return !!(partes.pais || partes.estadoProvincia || partes.cidade || partes.endereco)
}
