/**
 * Propaga edição do valor extraído (mapeamento) para linhasBrutas.
 * 1) Substitui células iguais ao valor antigo (case/accent insensitive).
 * 2) Substitui todas as linhas que ainda falham validação no campo mapeado.
 * 3) Se nada foi tocado, atualiza a 1ª linha da coluna.
 */
import { aplicarMapeamentoImportacaoBid } from './parsear-planilha-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from './rota-cotacao-bid-frete-internacional'
import type {
  CampoImportacaoBidFreteInternacional,
  ColunaMapeadaBidFreteInternacional,
} from './tipos-importacao-bid-frete-internacional'
import { montarLinhasPreviewImportacaoBid } from './validar-preview-importacao-bid-frete-internacional'

export interface OpcoesAplicarEdicaoValorColunaImportacaoBid {
  mapeamento: ColunaMapeadaBidFreteInternacional[]
  ctx: ContextoCatalogoRota
  campoSistema: CampoImportacaoBidFreteInternacional
}

export function aplicarEdicaoValorColunaImportacaoBid(
  linhasBrutas: Record<string, string>[],
  nomeColuna: string,
  valorAntigo: string | null,
  valorNovo: string,
  opcoes?: OpcoesAplicarEdicaoValorColunaImportacaoBid,
): Record<string, string>[] {
  if (linhasBrutas.length === 0) return linhasBrutas

  const indicesParaAtualizar = new Set<number>()
  const antigoNorm = (valorAntigo ?? '').trim()

  linhasBrutas.forEach((linha, idx) => {
    const atual = (linha[nomeColuna] ?? '').trim()
    const bateAntigo = antigoNorm.length > 0
      && atual.localeCompare(antigoNorm, undefined, { sensitivity: 'accent' }) === 0
    if (bateAntigo) indicesParaAtualizar.add(idx)
  })

  if (opcoes) {
    const linhasNorm = aplicarMapeamentoImportacaoBid(linhasBrutas, opcoes.mapeamento)
    const previews = montarLinhasPreviewImportacaoBid(linhasNorm, opcoes.ctx)
    for (const preview of previews) {
      const temErroCampo = preview.alertas.some(
        a => a.nivel === 'erro' && a.campo === opcoes.campoSistema,
      )
      if (temErroCampo) {
        indicesParaAtualizar.add(preview.linha_arquivo - 1)
      }
    }
  }

  if (indicesParaAtualizar.size === 0) {
    return linhasBrutas.map((linha, idx) =>
      idx === 0 ? { ...linha, [nomeColuna]: valorNovo } : linha,
    )
  }

  return linhasBrutas.map((linha, idx) =>
    indicesParaAtualizar.has(idx) ? { ...linha, [nomeColuna]: valorNovo } : linha,
  )
}
