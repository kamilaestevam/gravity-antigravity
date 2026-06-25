/**
 * SSOT de TransacaoLeitura para testes de Insights (calcular-metricas + agrupar-campos).
 */
import type { TransacaoLeitura } from '../../../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'
import { metricasTransacaoLeituraVazias } from '../../../../../servicos-global/produto/smart-read/shared/metricas-transacao-leitura-smart-read.ts'

export const REFERENCIA_INSIGHTS_TESTE = new Date('2026-06-20T12:00:00.000Z')

export function dataEnvioDiasAtras(dias: number, referencia = REFERENCIA_INSIGHTS_TESTE): string {
  const data = new Date(referencia)
  data.setUTCDate(data.getUTCDate() - dias)
  return `${data.toISOString().slice(0, 10)}T14:00:00.000Z`
}

const baseTransacao = (
  id: string,
  nome: string,
  dataEnvio: string,
  origem: 'INTERFACE' | 'API',
): Omit<TransacaoLeitura, keyof ReturnType<typeof metricasTransacaoLeituraVazias>> => ({
  id_leitura: id,
  nome_leitura: nome,
  status_leitura: 'COMPLETED',
  total_arquivos: 2,
  media_acertos: null,
  data_envio: dataEnvio,
  origem_leitura: origem,
  nome_arquivo: 'pacote.pdf',
  mensagem_erro: null,
})

/** Transações alinhadas a LEITURAS_FIXTURE_INSIGHTS — métricas vazias (path com leitura detalhada). */
export const TRANSACOES_FIXTURE_INSIGHTS: TransacaoLeitura[] = [
  {
    ...baseTransacao(
      'mock-leitura-bl-importacao',
      'Embarque BL',
      dataEnvioDiasAtras(5),
      'INTERFACE',
    ),
    ...metricasTransacaoLeituraVazias(),
    tempo_processo_total_ms: 90_000,
  },
  {
    ...baseTransacao(
      'mock-leitura-invoice-api',
      'Invoice API',
      dataEnvioDiasAtras(2),
      'API',
    ),
    total_arquivos: 1,
    ...metricasTransacaoLeituraVazias(),
    tempo_processo_total_ms: 60_000,
  },
]

/** Mesmos ids/datas — métricas preenchidas (fallback quando leiturasDetalhe vazio). */
export const TRANSACOES_FIXTURE_INSIGHTS_COM_METRICAS: TransacaoLeitura[] = [
  {
    ...baseTransacao(
      'mock-leitura-bl-importacao',
      'Embarque BL',
      dataEnvioDiasAtras(5),
      'INTERFACE',
    ),
    ...metricasTransacaoLeituraVazias(),
    total_documentos: 4,
    total_campos_extraidos: 88,
    total_campos_corretos: 72,
    total_campos_errados: 16,
    tipos_documento: 'Bill of Lading · Invoice · Packing List',
    tempo_processo_total_ms: 120_000,
    saving_total_minutos: 32,
    saving_total_brl: 96,
  },
  {
    ...baseTransacao(
      'mock-leitura-invoice-api',
      'Invoice API',
      dataEnvioDiasAtras(2),
      'API',
    ),
    total_arquivos: 1,
    ...metricasTransacaoLeituraVazias(),
    total_documentos: 1,
    total_campos_extraidos: 24,
    total_campos_corretos: 20,
    total_campos_errados: 4,
    tipos_documento: 'Invoice',
    tempo_processo_total_ms: 60_000,
  },
]
