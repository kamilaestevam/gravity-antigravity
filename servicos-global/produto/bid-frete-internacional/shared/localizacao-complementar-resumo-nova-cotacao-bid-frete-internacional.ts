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

/** Complemento de endereço (País/Cidade/Endereço) — exige pelo menos estado, cidade ou endereço. */
export function temLocalizacaoComplementarEmailDisparoBidFrete(
  dados: LocalizacaoComplementarResumoNovaCotacaoBidFrete,
): boolean {
  const partes = montarPartesLocalizacaoComplementarResumoNovaCotacaoBidFrete(dados)
  return !!(partes.estadoProvincia || partes.cidade || partes.endereco)
}

export function montarTextoLocalizacaoComplementarEmailDisparoBidFrete(
  dados: LocalizacaoComplementarResumoNovaCotacaoBidFrete,
): string | null {
  if (!temLocalizacaoComplementarEmailDisparoBidFrete(dados)) return null
  const partes = montarPartesLocalizacaoComplementarResumoNovaCotacaoBidFrete(dados)
  const linhas: string[] = []
  if (partes.pais) linhas.push(`País: ${partes.pais}`)
  if (partes.estadoProvincia) linhas.push(`Estado/Província: ${partes.estadoProvincia}`)
  if (partes.cidade) linhas.push(`Cidade: ${partes.cidade}`)
  if (partes.endereco) linhas.push(`Endereço: ${partes.endereco}`)
  return linhas.length > 0 ? linhas.join(' · ') : null
}
