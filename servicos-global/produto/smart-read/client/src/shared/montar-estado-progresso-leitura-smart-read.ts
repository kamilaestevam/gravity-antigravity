/**
 * Monta estado persistível do wizard (passo + leitura) a partir dos arquivos locais.
 */
import {
  consolidarLeituraDeArquivosLocais,
  montarLeituraMinimaProcessamentoDeArquivosLocais,
  todosArquivosAnaliseCompleta,
} from './tipo-arquivo-nova-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import type { EstadoSalvoLeitura } from './persistencia-leitura-smart-read'

export function montarEstadoProgressoLeituraSmartRead(params: {
  arquivos: ArquivoLocalNovaLeitura[]
  passo: number
  nomeLeitura: string
  idLeituraExistente: string | null
}): EstadoSalvoLeitura | null {
  const { arquivos, passo, nomeLeitura, idLeituraExistente } = params
  const idLeitura = idLeituraExistente ?? arquivos.find((a) => a.id_leitura)?.id_leitura ?? null
  if (!idLeitura || passo < 2) return null

  const nomeEfetivo = nomeLeitura.trim() || nomeLeitura

  if (todosArquivosAnaliseCompleta(arquivos)) {
    const leituraBase = consolidarLeituraDeArquivosLocais(arquivos)
    if (!leituraBase || leituraBase.arquivos.length === 0) return null
    const temExtracao = leituraBase.arquivos.some(
      (arquivo) => (arquivo.resultado_extracao?.length ?? 0) > 0,
    )
    if (passo >= 3 && !temExtracao) return null
    return {
      passo,
      nome: nomeEfetivo,
      leitura: { ...leituraBase, nome_leitura: nomeEfetivo },
    }
  }

  if (passo === 2) {
    const leituraParcial = montarLeituraMinimaProcessamentoDeArquivosLocais(
      idLeitura,
      nomeEfetivo,
      arquivos,
    )
    if (!leituraParcial || leituraParcial.arquivos.length === 0) return null
    return {
      passo,
      nome: nomeEfetivo,
      leitura: leituraParcial,
    }
  }

  return null
}
