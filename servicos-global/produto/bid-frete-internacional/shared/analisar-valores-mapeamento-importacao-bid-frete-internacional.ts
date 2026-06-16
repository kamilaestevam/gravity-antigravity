/**
 * Valida valores extraídos no mapeamento — mesma SSOT do preview (validar-linha + payload).
 * Confiança 99% = coluna reconhecida; este módulo valida se o conteúdo bate no catálogo/select.
 */
import type { CampoImportacaoBidFreteInternacional, ColunaMapeadaBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'
import { aplicarMapeamentoImportacaoBid } from './parsear-planilha-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from './rota-cotacao-bid-frete-internacional'
import { montarLinhasPreviewImportacaoBid } from './validar-preview-importacao-bid-frete-internacional'

export interface ErroValorCampoMapeamentoImportacaoBid {
  campo: CampoImportacaoBidFreteInternacional
  linhasComErro: number
  mensagemExemplo: string
}

export interface AnaliseValoresMapeamentoImportacaoBid {
  errosPorCampo: ErroValorCampoMapeamentoImportacaoBid[]
  totalLinhasComErro: number
  totalLinhas: number
  /** Bloqueia avanço do mapeamento se houver linha com erro de valor/catálogo. */
  bloqueiaAvanco: boolean
}

export function analisarValoresMapeamentoImportacaoBid(
  linhasBrutas: Record<string, string>[],
  mapeamento: ColunaMapeadaBidFreteInternacional[],
  ctx: ContextoCatalogoRota = {},
): AnaliseValoresMapeamentoImportacaoBid {
  if (linhasBrutas.length === 0 || mapeamento.length === 0) {
    return {
      errosPorCampo: [],
      totalLinhasComErro: 0,
      totalLinhas: 0,
      bloqueiaAvanco: false,
    }
  }

  const linhas = aplicarMapeamentoImportacaoBid(linhasBrutas, mapeamento)
  const previews = montarLinhasPreviewImportacaoBid(linhas, ctx)

  const acumulado = new Map<CampoImportacaoBidFreteInternacional, { linhas: Set<number>, mensagem: string }>()

  for (const preview of previews) {
    if (preview.status !== 'erro') continue
    for (const alerta of preview.alertas.filter(a => a.nivel === 'erro')) {
      const campo = alerta.campo as CampoImportacaoBidFreteInternacional
      const atual = acumulado.get(campo) ?? { linhas: new Set<number>(), mensagem: alerta.mensagem }
      atual.linhas.add(preview.linha_arquivo)
      if (!atual.mensagem) atual.mensagem = alerta.mensagem
      acumulado.set(campo, atual)
    }
  }

  const errosPorCampo = [...acumulado.entries()]
    .map(([campo, info]) => ({
      campo,
      linhasComErro: info.linhas.size,
      mensagemExemplo: info.mensagem,
    }))
    .sort((a, b) => b.linhasComErro - a.linhasComErro)

  const totalLinhasComErro = previews.filter(p => p.status === 'erro').length

  return {
    errosPorCampo,
    totalLinhasComErro,
    totalLinhas: previews.length,
    bloqueiaAvanco: totalLinhasComErro > 0,
  }
}

export function erroValorCampoMapeamento(
  campo: CampoImportacaoBidFreteInternacional | null | undefined,
  analise: AnaliseValoresMapeamentoImportacaoBid,
): ErroValorCampoMapeamentoImportacaoBid | null {
  if (!campo) return null
  return analise.errosPorCampo.find(e => e.campo === campo) ?? null
}
