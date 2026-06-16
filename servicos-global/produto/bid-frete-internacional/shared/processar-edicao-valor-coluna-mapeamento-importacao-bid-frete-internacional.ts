/**
 * Edição do valor extraído no mapeamento + revalidação imediata (SSOT).
 */
import { analisarValoresMapeamentoImportacaoBid } from './analisar-valores-mapeamento-importacao-bid-frete-internacional'
import { aplicarEdicaoValorColunaImportacaoBid } from './aplicar-edicao-valor-coluna-importacao-bid-frete-internacional'
import { calcularConfiancaGlobalMapeamento, calcularScoreEssenciaisBid } from './mapear-colunas-importacao-bid-frete-internacional'
import { aplicarMapeamentoImportacaoBid } from './parsear-planilha-importacao-bid-frete-internacional'
import type { ContextoCatalogoRota } from './rota-cotacao-bid-frete-internacional'
import type { ColunaMapeadaBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'
import { montarLinhasPreviewImportacaoBid, type LinhaPreviewImportacaoBid } from './validar-preview-importacao-bid-frete-internacional'

export interface ResultadoEdicaoValorColunaMapeamentoImportacaoBid {
  novoMapeamento: ColunaMapeadaBidFreteInternacional[]
  novasLinhas: Record<string, string>[]
  rows: LinhaPreviewImportacaoBid[]
  confiancaGlobal: number
  scoreEssenciais: number
  resultadoCampo: 'ok' | 'erro'
  linhasComErroCampo: number
}

export function processarEdicaoValorColunaMapeamentoImportacaoBid(
  mapeamento: ColunaMapeadaBidFreteInternacional[],
  linhasBrutas: Record<string, string>[],
  indexColuna: number,
  valorAntigo: string | null,
  valorNovo: string,
  ctx: ContextoCatalogoRota,
): ResultadoEdicaoValorColunaMapeamentoImportacaoBid | null {
  const col = mapeamento[indexColuna]
  if (!col) return null

  const novoMapeamento = mapeamento.map((c, i) =>
    i === indexColuna
      ? {
          ...c,
          valor_exemplo: valorNovo || null,
          inferido_por: 'usuario' as const,
        }
      : c,
  )

  const novasLinhas = aplicarEdicaoValorColunaImportacaoBid(
    linhasBrutas,
    col.coluna_arquivo,
    valorAntigo,
    valorNovo,
    col.campo_sistema
      ? {
          mapeamento: novoMapeamento,
          ctx,
          campoSistema: col.campo_sistema,
        }
      : undefined,
  )

  const linhas = aplicarMapeamentoImportacaoBid(novasLinhas, novoMapeamento)
  const rows = montarLinhasPreviewImportacaoBid(linhas, ctx)
  const analise = analisarValoresMapeamentoImportacaoBid(novasLinhas, novoMapeamento, ctx)
  const erroCampo = col.campo_sistema
    ? analise.errosPorCampo.find(e => e.campo === col.campo_sistema)
    : null

  return {
    novoMapeamento,
    novasLinhas,
    rows,
    confiancaGlobal: calcularConfiancaGlobalMapeamento(novoMapeamento),
    scoreEssenciais: calcularScoreEssenciaisBid(novoMapeamento),
    resultadoCampo: erroCampo ? 'erro' : 'ok',
    linhasComErroCampo: erroCampo?.linhasComErro ?? 0,
  }
}
