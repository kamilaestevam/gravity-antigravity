/**
 * agrupar-campos-por-dia-insights-smart-read.ts — série temporal de campos extraídos
 */

import type { TransacaoLeitura } from '../../shared/schemas'
import type { DocumentoInsightsSmartRead } from './extrair-dados-documento-leitura-smart-read'

export type PresetDiasCamposPorDiaInsights = 7 | 30 | 60 | 90

export type FiltroPeriodoCamposPorDiaInsights =
  | { modo: 'preset'; dias: PresetDiasCamposPorDiaInsights }
  | { modo: 'intervalo'; data_inicio: string; data_fim: string }

export type GranularidadeCamposPeriodoInsights = 'dia' | 'semana' | 'mes'

export const PRESETS_DIAS_CAMPOS_POR_DIA: PresetDiasCamposPorDiaInsights[] = [7, 30, 60, 90]

export const GRANULARIDADES_CAMPOS_PERIODO: GranularidadeCamposPeriodoInsights[] = ['dia', 'semana', 'mes']

export const FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA: FiltroPeriodoCamposPorDiaInsights = {
  modo: 'preset',
  dias: 7,
}

export const GRANULARIDADE_PADRAO_CAMPOS_PERIODO: GranularidadeCamposPeriodoInsights = 'dia'

export type MetricaSerieTemporalInsightsSmartRead = 'campos' | 'documentos'

export const METRICA_SERIE_TEMPORAL_PADRAO: MetricaSerieTemporalInsightsSmartRead = 'campos'

export type PontoCamposPorDiaInsights = {
  chave_periodo: string
  rotulo_periodo: string
  total_campos: number
  campos_corretos: number
  campos_errados: number
  documentos: number
  documentos_sem_erro: number
  documentos_com_erro: number
}

function formatarRotuloDia(chaveDia: string): string {
  const [, mes, dia] = chaveDia.split('-')
  return `${dia}/${mes}`
}

function chaveDiaUtc(data: Date): string {
  return data.toISOString().slice(0, 10)
}

function criarPontoVazio(chave: string, rotulo: string): PontoCamposPorDiaInsights {
  return {
    chave_periodo: chave,
    rotulo_periodo: rotulo,
    total_campos: 0,
    campos_corretos: 0,
    campos_errados: 0,
    documentos: 0,
    documentos_sem_erro: 0,
    documentos_com_erro: 0,
  }
}

function criarPontoVazioDia(chaveDia: string): PontoCamposPorDiaInsights {
  return criarPontoVazio(chaveDia, formatarRotuloDia(chaveDia))
}

function somarPonto(
  acumulado: PontoCamposPorDiaInsights,
  doc: DocumentoInsightsSmartRead,
): PontoCamposPorDiaInsights {
  const docComErro = doc.campos_errados > 0 ? 1 : 0
  const docSemErro = docComErro ? 0 : 1
  return {
    ...acumulado,
    total_campos: acumulado.total_campos + doc.total_campos,
    campos_corretos: acumulado.campos_corretos + doc.campos_corretos,
    campos_errados: acumulado.campos_errados + doc.campos_errados,
    documentos: acumulado.documentos + 1,
    documentos_sem_erro: acumulado.documentos_sem_erro + docSemErro,
    documentos_com_erro: acumulado.documentos_com_erro + docComErro,
  }
}

export function gerarChavesDiasPeriodoCamposInsights(
  janela: FiltroPeriodoCamposPorDiaInsights,
  referencia = new Date(),
): string[] {
  if (janela.modo === 'preset') {
    const chaves: string[] = []
    for (let offset = janela.dias - 1; offset >= 0; offset -= 1) {
      const data = new Date(referencia)
      data.setUTCDate(data.getUTCDate() - offset)
      chaves.push(chaveDiaUtc(data))
    }
    return chaves
  }

  const inicio = new Date(`${janela.data_inicio}T00:00:00.000Z`)
  const fim = new Date(`${janela.data_fim}T00:00:00.000Z`)
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || inicio > fim) {
    return []
  }

  const chaves: string[] = []
  const cursor = new Date(inicio)
  while (cursor <= fim) {
    chaves.push(chaveDiaUtc(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return chaves
}

function chaveSemanaIso(chaveDia: string): string {
  const data = new Date(`${chaveDia}T12:00:00.000Z`)
  const diaSemana = data.getUTCDay() || 7
  const segunda = new Date(data)
  segunda.setUTCDate(data.getUTCDate() - (diaSemana - 1))
  return chaveDiaUtc(segunda)
}

function rotuloSemana(chaveSemana: string): string {
  const inicio = new Date(`${chaveSemana}T12:00:00.000Z`)
  const fim = new Date(inicio)
  fim.setUTCDate(inicio.getUTCDate() + 6)
  return `${formatarRotuloDia(chaveDiaUtc(inicio))}–${formatarRotuloDia(chaveDiaUtc(fim))}`
}

function chaveMes(chaveDia: string): string {
  return chaveDia.slice(0, 7)
}

const ROTULO_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function rotuloMes(chaveMes: string): string {
  const [ano, mes] = chaveMes.split('-')
  const indice = Number(mes) - 1
  if (indice < 0 || indice > 11) return chaveMes
  return `${ROTULO_MES[indice]}/${ano.slice(2)}`
}

function agregarSerieDiaria(
  serieDiaria: PontoCamposPorDiaInsights[],
  granularidade: GranularidadeCamposPeriodoInsights,
): PontoCamposPorDiaInsights[] {
  if (granularidade === 'dia') return serieDiaria

  const mapa = new Map<string, PontoCamposPorDiaInsights>()

  for (const ponto of serieDiaria) {
    const chave =
      granularidade === 'semana' ? chaveSemanaIso(ponto.chave_periodo) : chaveMes(ponto.chave_periodo)
    const rotulo = granularidade === 'semana' ? rotuloSemana(chave) : rotuloMes(chave)
    const atual = mapa.get(chave) ?? criarPontoVazio(chave, rotulo)
    mapa.set(chave, {
      chave_periodo: chave,
      rotulo_periodo: rotulo,
      total_campos: atual.total_campos + ponto.total_campos,
      campos_corretos: atual.campos_corretos + ponto.campos_corretos,
      campos_errados: atual.campos_errados + ponto.campos_errados,
      documentos: atual.documentos + ponto.documentos,
      documentos_sem_erro: atual.documentos_sem_erro + ponto.documentos_sem_erro,
      documentos_com_erro: atual.documentos_com_erro + ponto.documentos_com_erro,
    })
  }

  return [...mapa.values()]
}

function mapaDataPorLeitura(transacoes: TransacaoLeitura[]): Map<string, string> {
  return new Map(
    transacoes
      .filter((t) => t.data_envio)
      .map((t) => [t.id_leitura, t.data_envio!.slice(0, 10)] as const),
  )
}

export function listarDatasExtracaoAmostra(
  documentos: DocumentoInsightsSmartRead[],
  transacoes: TransacaoLeitura[],
): string[] {
  const dataPorLeitura = mapaDataPorLeitura(transacoes)
  const datas = new Set<string>()
  for (const doc of documentos) {
    const chave = dataPorLeitura.get(doc.id_leitura)
    if (chave) datas.add(chave)
  }
  return [...datas].sort()
}

export function montarSerieCamposPorDiaInsights(
  documentos: DocumentoInsightsSmartRead[],
  transacoes: TransacaoLeitura[],
  janela: FiltroPeriodoCamposPorDiaInsights = FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA,
  granularidade: GranularidadeCamposPeriodoInsights = GRANULARIDADE_PADRAO_CAMPOS_PERIODO,
): PontoCamposPorDiaInsights[] {
  const dataPorLeitura = mapaDataPorLeitura(transacoes)
  const mapaDiario = new Map<string, PontoCamposPorDiaInsights>()

  for (const doc of documentos) {
    const chaveDia = dataPorLeitura.get(doc.id_leitura)
    if (!chaveDia) continue
    const ponto = mapaDiario.get(chaveDia) ?? criarPontoVazioDia(chaveDia)
    mapaDiario.set(chaveDia, somarPonto(ponto, doc))
  }

  const chaves = gerarChavesDiasPeriodoCamposInsights(janela)
  const serieDiaria = chaves.map((chave) => {
    const ponto = mapaDiario.get(chave) ?? criarPontoVazioDia(chave)
    return { ...ponto, chave_periodo: chave, rotulo_periodo: formatarRotuloDia(chave) }
  })

  return agregarSerieDiaria(serieDiaria, granularidade)
}

export function rotuloPeriodoCamposPorDiaInsights(
  janela: FiltroPeriodoCamposPorDiaInsights,
  granularidade: GranularidadeCamposPeriodoInsights = 'dia',
): string {
  const base =
    janela.modo === 'preset'
      ? `Últimos ${janela.dias} dias`
      : `${formatarRotuloDia(janela.data_inicio)} — ${formatarRotuloDia(janela.data_fim)}`

  if (granularidade === 'dia') return base
  if (granularidade === 'semana') return `${base} · por semana`
  return `${base} · por mês`
}

export function rotuloGranularidadeCamposPeriodo(granularidade: GranularidadeCamposPeriodoInsights): string {
  if (granularidade === 'dia') return 'Dia'
  if (granularidade === 'semana') return 'Semana'
  return 'Mês'
}

export function tituloPainelCamposPeriodo(granularidade: GranularidadeCamposPeriodoInsights): string {
  if (granularidade === 'dia') return 'Campos por dia'
  if (granularidade === 'semana') return 'Campos por semana'
  return 'Campos por mês'
}

export function valorTotalPontoSerieTemporal(
  ponto: PontoCamposPorDiaInsights,
  metrica: MetricaSerieTemporalInsightsSmartRead,
): number {
  return metrica === 'campos' ? ponto.total_campos : ponto.documentos
}

export function valorAcertoPontoSerieTemporal(
  ponto: PontoCamposPorDiaInsights,
  metrica: MetricaSerieTemporalInsightsSmartRead,
): number {
  return metrica === 'campos' ? ponto.campos_corretos : ponto.documentos_sem_erro
}

export function valorErroPontoSerieTemporal(
  ponto: PontoCamposPorDiaInsights,
  metrica: MetricaSerieTemporalInsightsSmartRead,
): number {
  return metrica === 'campos' ? ponto.campos_errados : ponto.documentos_com_erro
}

export function serieTemporalTemDados(
  serie: PontoCamposPorDiaInsights[],
  metrica: MetricaSerieTemporalInsightsSmartRead,
): boolean {
  return serie.some((p) => valorTotalPontoSerieTemporal(p, metrica) > 0)
}

export function limitesJanelaPeriodoCamposInsights(
  janela: FiltroPeriodoCamposPorDiaInsights,
  referencia = new Date(),
): { inicio: string; fim: string } {
  const chaves = gerarChavesDiasPeriodoCamposInsights(janela, referencia)
  if (chaves.length === 0) return { inicio: '', fim: '' }
  return { inicio: chaves[0]!, fim: chaves[chaves.length - 1]! }
}
