/**
 * Saving do wizard Nova Leitura — base manual (SSOT) − tempo de leitura (cronômetro).
 */
import { calcularRecursosReduzidosPorTempoLeituraSmartRead } from '../../../shared/metricas-transacao-leitura-smart-read'
import {
  consolidarLeituraDeArquivosLocais,
  type ArquivoLocalNovaLeitura,
} from './tipo-arquivo-nova-leitura-smart-read'

export type SavingNovaLeituraSmartRead = {
  minutos: number | null
  brl: number | null
}

export function calcularSavingNovaLeituraSmartRead(
  itens: ArquivoLocalNovaLeitura[],
  opcoes?: {
    tempoLeituraSegundos?: number | null
    inicioMs?: number | null
    fimMs?: number | null
  },
): SavingNovaLeituraSmartRead {
  const leitura = consolidarLeituraDeArquivosLocais(itens)
  if (!leitura) return { minutos: null, brl: null }

  const documentos = itens.flatMap((arquivo) => arquivo.resultado_extracao ?? [])
  if (documentos.length <= 0) return { minutos: null, brl: null }

  const tempoLeituraSegundos =
    opcoes?.tempoLeituraSegundos ??
    (opcoes?.inicioMs != null && opcoes?.fimMs != null
      ? Math.max(0, Math.floor((opcoes.fimMs - opcoes.inicioMs) / 1000))
      : null)

  if (tempoLeituraSegundos == null) return { minutos: null, brl: null }

  const saving = calcularRecursosReduzidosPorTempoLeituraSmartRead(documentos, tempoLeituraSegundos)
  if (!saving) return { minutos: null, brl: null }

  return { minutos: saving.saving_total_minutos, brl: saving.saving_total_brl }
}
