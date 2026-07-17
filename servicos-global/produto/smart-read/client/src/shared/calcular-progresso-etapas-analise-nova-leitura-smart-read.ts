/**
 * Progresso honesto do pipeline do passo 2 — nada na tela afirma progresso que
 * não aconteceu:
 *  1. «Envio dos arquivos»    — REAL: bytes enviados (eventos XHR de upload).
 *  2. «Análise dos documentos» — ESTIMATIVA rotulada: tempo decorrido ÷ mediana
 *     histórica do workspace (fallback 30s/arquivo), teto 95% até o DATI concluir.
 *  3. «Consolidação dos resultados» — REAL: fração de arquivos com análise completa.
 * Arquivos com erro saem das médias (não são cobrados nem concluem).
 */

import type { StatusArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'

export type EtapaAnaliseProgresso = {
  id: number
  rotulo: string
  progresso: number
  status: 'pendente' | 'andamento' | 'completo'
  /** Barra calibrada por mediana histórica — a UI rotula como estimativa. */
  estimativa?: boolean
}

export type ArquivoProgressoEtapasEntrada = {
  status_arquivo_local: StatusArquivoLocalNovaLeitura
  progresso_envio?: number | null
  inicio_analise_ms?: number | null
}

/** Custo fixo medido do DATI por arquivo — fallback quando não há histórico. */
export const TEMPO_ANALISE_PADRAO_ARQUIVO_MS = 30_000

/** Teto da estimativa enquanto o DATI não confirma conclusão. */
export const PROGRESSO_MAXIMO_ESTIMATIVA_ANALISE = 95

const ROTULO_ENVIO = 'Envio dos arquivos'
const ROTULO_ANALISE = 'Análise dos documentos'
const ROTULO_CONSOLIDACAO = 'Consolidação dos resultados'

function progressoEnvioArquivo(arquivo: ArquivoProgressoEtapasEntrada): number {
  if (arquivo.status_arquivo_local === 'anexado') return 0
  if (arquivo.status_arquivo_local === 'enviando') {
    return Math.max(0, Math.min(100, arquivo.progresso_envio ?? 0))
  }
  return 100
}

function progressoAnaliseArquivo(
  arquivo: ArquivoProgressoEtapasEntrada,
  agoraMs: number,
  tempoMedianoAnaliseMs: number | null,
): number {
  if (arquivo.status_arquivo_local === 'completo') return 100
  if (arquivo.status_arquivo_local !== 'analisando') return 0

  const tempoEsperadoMs =
    tempoMedianoAnaliseMs != null && tempoMedianoAnaliseMs > 0
      ? tempoMedianoAnaliseMs
      : TEMPO_ANALISE_PADRAO_ARQUIVO_MS
  const decorridoMs = Math.max(0, agoraMs - (arquivo.inicio_analise_ms ?? agoraMs))
  return Math.min(
    PROGRESSO_MAXIMO_ESTIMATIVA_ANALISE,
    Math.round((decorridoMs / tempoEsperadoMs) * 100),
  )
}

function media(valores: number[]): number {
  if (valores.length === 0) return 0
  return Math.round(valores.reduce((acc, valor) => acc + valor, 0) / valores.length)
}

function statusDeProgresso(progresso: number): EtapaAnaliseProgresso['status'] {
  if (progresso >= 100) return 'completo'
  return progresso > 0 ? 'andamento' : 'pendente'
}

export function calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
  arquivos: ArquivoProgressoEtapasEntrada[],
  agoraMs: number,
  tempoMedianoAnaliseMs: number | null,
  analiseCompleta: boolean,
  processamentoComErro: boolean,
): EtapaAnaliseProgresso[] {
  if (processamentoComErro) {
    return [
      { id: 1, rotulo: ROTULO_ENVIO, progresso: 0, status: 'pendente' },
      { id: 2, rotulo: ROTULO_ANALISE, progresso: 0, status: 'pendente', estimativa: false },
      { id: 3, rotulo: ROTULO_CONSOLIDACAO, progresso: 0, status: 'pendente' },
    ]
  }

  if (analiseCompleta) {
    return [
      { id: 1, rotulo: ROTULO_ENVIO, progresso: 100, status: 'completo' },
      { id: 2, rotulo: ROTULO_ANALISE, progresso: 100, status: 'completo', estimativa: false },
      { id: 3, rotulo: ROTULO_CONSOLIDACAO, progresso: 100, status: 'completo' },
    ]
  }

  // Arquivos com erro não contam nas médias: não serão cobrados nem concluídos,
  // e mantê-los travaria as barras abaixo de 100% para sempre.
  const considerados = arquivos.filter((arquivo) => arquivo.status_arquivo_local !== 'erro')

  const envio = media(considerados.map(progressoEnvioArquivo))
  const analise = media(
    considerados.map((arquivo) => progressoAnaliseArquivo(arquivo, agoraMs, tempoMedianoAnaliseMs)),
  )
  const completos = considerados.filter((arquivo) => arquivo.status_arquivo_local === 'completo').length
  const consolidacao =
    considerados.length > 0 ? Math.round((completos / considerados.length) * 100) : 0

  const statusAnalise = statusDeProgresso(analise)
  return [
    { id: 1, rotulo: ROTULO_ENVIO, progresso: envio, status: statusDeProgresso(envio) },
    {
      id: 2,
      rotulo: ROTULO_ANALISE,
      progresso: analise,
      status: statusAnalise,
      estimativa: statusAnalise === 'andamento',
    },
    {
      id: 3,
      rotulo: ROTULO_CONSOLIDACAO,
      progresso: consolidacao,
      // Consolidação só fecha quando a análise completa confirma — antes disso,
      // 100% parcial (todos os N atuais completos) segue como andamento.
      status: consolidacao >= 100 ? 'andamento' : statusDeProgresso(consolidacao),
    },
  ]
}
