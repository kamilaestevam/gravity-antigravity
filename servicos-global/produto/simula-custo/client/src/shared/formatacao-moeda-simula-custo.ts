/** Formatação monetária e percentual — Simula Custo (pt-BR). */

export function formatarBrlSimulaCusto(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export function formatarPctSimulaCusto(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

export function formatarMoedaEstrangeiraSimulaCusto(
  valor: number,
  moeda: string,
): string {
  const simbolo = moeda === 'USD' ? 'US$' : moeda === 'EUR' ? '€' : moeda
  const formatado = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
  return `${simbolo} ${formatado}`
}

export function formatarPtaxSimulaCusto(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(valor)
}

export function formatarFatorImportacaoSimulaCusto(valor: number): string {
  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)}×`
}
