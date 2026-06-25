/**
 * Entrada para agregação SR medido — leitura em andamento no wizard (passo 2+).
 */
import { calcularMetricasTransacaoLeituraSmartRead } from '../../../shared/metricas-transacao-leitura-smart-read'
import type { EntradaAgregacaoTempoExtracaoIaSmartRead } from '../../../shared/metricas-transacao-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'
import {
  consolidarLeituraDeArquivosLocais,
  type ArquivoLocalNovaLeitura,
} from './tipo-arquivo-nova-leitura-smart-read'

export function montarEntradaAgregacaoNovaLeituraEmAndamentoSmartRead(
  arquivos: ArquivoLocalNovaLeitura[],
): EntradaAgregacaoTempoExtracaoIaSmartRead | null {
  const leitura = consolidarLeituraDeArquivosLocais(arquivos)
  if (!leitura?.arquivos.some((arquivo) => (arquivo.resultado_extracao?.length ?? 0) > 0)) {
    return null
  }

  const metricas = calcularMetricasTransacaoLeituraSmartRead(leitura, {
    created_at: null,
    completed_at: null,
  })

  if (
    metricas.total_documentos <= 0 ||
    metricas.tempo_extracao_ia_ms == null ||
    metricas.tempo_extracao_ia_ms <= 0
  ) {
    return null
  }

  return {
    total_documentos: metricas.total_documentos,
    tempo_extracao_ia_ms: metricas.tempo_extracao_ia_ms,
    tipos_documento: metricas.tipos_documento,
  }
}

export function mesclarTransacoesAgregacaoBaseCalculoSmartRead(
  historico: TransacaoLeitura[],
  entradaAtual: EntradaAgregacaoTempoExtracaoIaSmartRead | null,
  idLeituraAtual: string | null,
): EntradaAgregacaoTempoExtracaoIaSmartRead[] {
  const base = historico
    .filter((item) => !idLeituraAtual || item.id_leitura !== idLeituraAtual)
    .map((item) => ({
      total_documentos: item.total_documentos,
      tempo_extracao_ia_ms: item.tempo_extracao_ia_ms,
      tipos_documento: item.tipos_documento,
    }))

  return entradaAtual ? [...base, entradaAtual] : base
}
