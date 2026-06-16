import type { TFunction } from 'i18next'
import type { StatusKanbanFornecedorBidFreteInternacional } from './kanban-fornecedor-bid-frete-internacional'

export type AbaFunilFornecedor = 'TODAS' | StatusKanbanFornecedorBidFreteInternacional

const ORDEM_ABAS: AbaFunilFornecedor[] = [
  'TODAS',
  'AGUARDANDO_RESPOSTA',
  'EM_ANALISE',
  'APROVADA',
  'REPROVADA',
  'EXPIRADA',
]

const LABEL_KEYS: Record<Exclude<AbaFunilFornecedor, 'TODAS'>, string> = {
  AGUARDANDO_RESPOSTA: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.aguardando_resposta',
  EM_ANALISE: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.em_analise',
  APROVADA: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.aprovada',
  REPROVADA: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.reprovada',
  EXPIRADA: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.expirada',
}

/** Opções de status (funil) para filtros de coluna na lista fornecedor. */
export function gerarOpcoesStatusFiltroListaFornecedor(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return ORDEM_ABAS
    .filter((aba): aba is Exclude<AbaFunilFornecedor, 'TODAS'> => aba !== 'TODAS')
    .map(aba => ({
      valor: aba,
      label: t(LABEL_KEYS[aba]),
    }))
}

export function gerarAbasListaFornecedor(t: TFunction): Array<{ valor: string; label: string }> {
  return ORDEM_ABAS.map((aba) => {
    if (aba === 'TODAS') {
      return {
        valor: 'TODAS',
        label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.aba_todas', 'Todas as oportunidades'),
      }
    }
    return {
      valor: aba,
      label: t(LABEL_KEYS[aba]),
    }
  })
}
