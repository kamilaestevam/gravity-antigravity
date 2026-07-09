/** Fator linear dimensão → metro (SSOT conversão para m³). */
export const FATOR_METROS_POR_CODIGO_UNIDADE_CUBAGEM: Readonly<Record<string, number>> = {
  CM: 0.01,
  M: 1,
  IN: 0.0254,
  FT: 0.3048,
}

export function calcularCubagemM3DimensoesBidFreteInternacional(
  comprimento: number,
  largura: number,
  altura: number,
  codigoUnidade: string,
): number | null {
  const fator = FATOR_METROS_POR_CODIGO_UNIDADE_CUBAGEM[codigoUnidade.trim().toUpperCase()]
  if (fator == null) return null
  if (!Number.isFinite(comprimento) || !Number.isFinite(largura) || !Number.isFinite(altura)) {
    return null
  }
  if (comprimento <= 0 || largura <= 0 || altura <= 0) return null

  const comprimentoMetros = comprimento * fator
  const larguraMetros = largura * fator
  const alturaMetros = altura * fator
  return comprimentoMetros * larguraMetros * alturaMetros
}

export function formatarCubagemM3CalculadaBidFreteInternacional(m3: number): string {
  const arredondado = Math.round(m3 * 10_000) / 10_000
  return String(arredondado)
}

export function calcularCubagemM3AutoDimensoesBidFreteInternacional(params: {
  comprimento: string
  largura: string
  altura: string
  codigo_unidade: string
}): string | null {
  const comprimento = parseFloat(params.comprimento)
  const largura = parseFloat(params.largura)
  const altura = parseFloat(params.altura)
  const codigo = params.codigo_unidade.trim()
  if (!codigo) return null

  const m3 = calcularCubagemM3DimensoesBidFreteInternacional(comprimento, largura, altura, codigo)
  if (m3 == null) return null
  return formatarCubagemM3CalculadaBidFreteInternacional(m3)
}

/** Divisor IATA para peso cubado aéreo com dimensões em CM (cm³ ÷ 6000). */
export const DIVISOR_PESO_CUBADO_AEREO_CM_BID = 6_000

/**
 * Cubagem por modal:
 * - AÉREO + unidade CM → (C × L × A em cm) ÷ 6000 (fator IATA).
 * - Demais modais (ou aéreo em outra unidade) → C × L × A convertido para m³.
 */
export function calcularCubagemAutoDimensoesPorModalBidFreteInternacional(params: {
  comprimento: string
  largura: string
  altura: string
  codigo_unidade: string
  modal: string
}): string | null {
  const codigo = params.codigo_unidade.trim().toUpperCase()
  if (params.modal.trim().toUpperCase() === 'AEREO' && codigo === 'CM') {
    const comprimento = parseFloat(params.comprimento)
    const largura = parseFloat(params.largura)
    const altura = parseFloat(params.altura)
    if (!Number.isFinite(comprimento) || !Number.isFinite(largura) || !Number.isFinite(altura)) {
      return null
    }
    if (comprimento <= 0 || largura <= 0 || altura <= 0) return null
    return formatarCubagemM3CalculadaBidFreteInternacional(
      (comprimento * largura * altura) / DIVISOR_PESO_CUBADO_AEREO_CM_BID,
    )
  }
  return calcularCubagemM3AutoDimensoesBidFreteInternacional(params)
}
