/**
 * Helpers puros do agregado de histórico do workspace (GET /leituras/agregado-workspace):
 * mediana de tempo de análise (calibra a barra de estimativa do passo 2) e
 * data de início do histórico espelhado (rótulo «desde DD/MM/AAAA»).
 */

export function calcularMedianaTempoAnaliseMsSmartRead(
  tempos: Array<number | null | undefined>,
): number | null {
  const validos = tempos
    .filter((tempo): tempo is number => typeof tempo === 'number' && Number.isFinite(tempo) && tempo > 0)
    .sort((a, b) => a - b)
  if (validos.length === 0) return null

  const meio = Math.floor(validos.length / 2)
  const mediana =
    validos.length % 2 === 1 ? validos[meio] : (validos[meio - 1] + validos[meio]) / 2
  return Math.round(mediana)
}

export function resolverDataInicioHistoricoSmartRead(
  datas: Array<string | null | undefined>,
): string | null {
  let inicio: string | null = null
  for (const data of datas) {
    if (!data) continue
    if (Number.isNaN(Date.parse(data))) continue
    if (inicio === null || data < inicio) inicio = data
  }
  return inicio
}
