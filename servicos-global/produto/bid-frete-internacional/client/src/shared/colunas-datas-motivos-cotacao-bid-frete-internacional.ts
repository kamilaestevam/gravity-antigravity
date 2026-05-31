/**
 * Colunas espelhadas — prazo, aprovação, cancelamento e motivos da cotação.
 * Mesmos campos e formatação na lista de cotações e na aba Disparos do detalhe.
 */
import type { ReactNode } from 'react'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { TabelaGlobalColuna } from '@nucleo/tabela-global'
import type { Cotacao, DisparoCotacaoBidFreteInternacional } from './types'
import { formatarDataBidFrete } from './formato-data-bid-frete'

export const CAMPOS_ESPELHO_DATAS_MOTIVOS_COTACAO = [
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
  'motivo_reprovacao_cotacao_bid_frete_internacional',
  'motivo_cancelamento_cotacao_bid_frete_internacional',
] as const

export type CampoEspelhoDatasMotivosCotacao = (typeof CAMPOS_ESPELHO_DATAS_MOTIVOS_COTACAO)[number]

export type DisparoComEspelhoDatasMotivosCotacao = DisparoCotacaoBidFreteInternacional &
  Pick<Cotacao, CampoEspelhoDatasMotivosCotacao>

export interface RotulosColunasDatasMotivosCotacao {
  data_limite_resposta_cotacao_bid_frete_internacional: string
  data_aprovacao_cotacao_bid_frete_internacional: string
  data_cancelamento_cotacao_bid_frete_internacional: string
  motivo_reprovacao_cotacao_bid_frete_internacional: string
  motivo_cancelamento_cotacao_bid_frete_internacional: string
}

export const ROTULOS_PADRAO_COLUNAS_DATAS_MOTIVOS: RotulosColunasDatasMotivosCotacao = {
  data_limite_resposta_cotacao_bid_frete_internacional: 'Prazo resposta',
  data_aprovacao_cotacao_bid_frete_internacional: 'Data aprovação',
  data_cancelamento_cotacao_bid_frete_internacional: 'Data cancelamento',
  motivo_reprovacao_cotacao_bid_frete_internacional: 'Motivo reprovação',
  motivo_cancelamento_cotacao_bid_frete_internacional: 'Motivo cancelamento',
}

export function fmtDataCotacaoBidFrete(iso: string | null | undefined): string {
  return formatarDataBidFrete(iso)
}

function renderTextoMotivo(val: unknown): ReactNode {
  const texto = val as string | null | undefined
  return texto?.trim() ? texto : '—'
}

export function valoresEspelhoDatasMotivosCotacao(
  cotacao: Cotacao | null | undefined,
): Pick<Cotacao, CampoEspelhoDatasMotivosCotacao> {
  return {
    data_limite_resposta_cotacao_bid_frete_internacional:
      cotacao?.data_limite_resposta_cotacao_bid_frete_internacional ?? null,
    data_aprovacao_cotacao_bid_frete_internacional:
      cotacao?.data_aprovacao_cotacao_bid_frete_internacional ?? null,
    data_cancelamento_cotacao_bid_frete_internacional:
      cotacao?.data_cancelamento_cotacao_bid_frete_internacional ?? null,
    motivo_reprovacao_cotacao_bid_frete_internacional:
      cotacao?.motivo_reprovacao_cotacao_bid_frete_internacional ?? null,
    motivo_cancelamento_cotacao_bid_frete_internacional:
      cotacao?.motivo_cancelamento_cotacao_bid_frete_internacional ?? null,
  }
}

/** Injeta campos da cotação em cada disparo (fonte única — atualiza lista e detalhe juntos). */
export function espelharDatasMotivosCotacaoEmDisparos(
  disparos: DisparoCotacaoBidFreteInternacional[],
  cotacao: Cotacao | null | undefined,
): DisparoComEspelhoDatasMotivosCotacao[] {
  const espelho = valoresEspelhoDatasMotivosCotacao(cotacao)
  return disparos.map((disparo) => ({ ...disparo, ...espelho }))
}

export function criarColunasDatasMotivosCotacaoLista(
  rotulos: RotulosColunasDatasMotivosCotacao = ROTULOS_PADRAO_COLUNAS_DATAS_MOTIVOS,
): GTColuna<Cotacao>[] {
  return [
    {
      key: 'data_limite_resposta_cotacao_bid_frete_internacional',
      label: rotulos.data_limite_resposta_cotacao_bid_frete_internacional,
      tipo: 'periodo',
      render: (val: unknown) => fmtDataCotacaoBidFrete(val as string),
    },
    {
      key: 'data_aprovacao_cotacao_bid_frete_internacional',
      label: rotulos.data_aprovacao_cotacao_bid_frete_internacional,
      tipo: 'periodo',
      align: 'center',
      render: (val: unknown) => fmtDataCotacaoBidFrete(val as string),
    },
    {
      key: 'data_cancelamento_cotacao_bid_frete_internacional',
      label: rotulos.data_cancelamento_cotacao_bid_frete_internacional,
      tipo: 'periodo',
      render: (val: unknown) => fmtDataCotacaoBidFrete(val as string),
    },
    {
      key: 'motivo_reprovacao_cotacao_bid_frete_internacional',
      label: rotulos.motivo_reprovacao_cotacao_bid_frete_internacional,
      tipo: 'texto',
      render: renderTextoMotivo,
    },
    {
      key: 'motivo_cancelamento_cotacao_bid_frete_internacional',
      label: rotulos.motivo_cancelamento_cotacao_bid_frete_internacional,
      tipo: 'texto',
      render: renderTextoMotivo,
    },
  ]
}

export function criarColunasDatasMotivosDisparoTabelaGlobal(
  rotulos: RotulosColunasDatasMotivosCotacao = ROTULOS_PADRAO_COLUNAS_DATAS_MOTIVOS,
  opcoes?: { larguraData?: number; larguraTexto?: number },
): TabelaGlobalColuna<DisparoComEspelhoDatasMotivosCotacao>[] {
  const larguraData = opcoes?.larguraData ?? 130
  const larguraTexto = opcoes?.larguraTexto ?? 160
  return [
    {
      key: 'data_limite_resposta_cotacao_bid_frete_internacional',
      label: rotulos.data_limite_resposta_cotacao_bid_frete_internacional,
      tipo: 'periodo',
      largura: larguraData,
      render: (valor: unknown) => fmtDataCotacaoBidFrete(valor as string | null),
    },
    {
      key: 'data_aprovacao_cotacao_bid_frete_internacional',
      label: rotulos.data_aprovacao_cotacao_bid_frete_internacional,
      tipo: 'periodo',
      largura: larguraData,
      align: 'center',
      render: (valor: unknown) => fmtDataCotacaoBidFrete(valor as string | null),
    },
    {
      key: 'data_cancelamento_cotacao_bid_frete_internacional',
      label: rotulos.data_cancelamento_cotacao_bid_frete_internacional,
      tipo: 'periodo',
      largura: larguraData,
      render: (valor: unknown) => fmtDataCotacaoBidFrete(valor as string | null),
    },
    {
      key: 'motivo_reprovacao_cotacao_bid_frete_internacional',
      label: rotulos.motivo_reprovacao_cotacao_bid_frete_internacional,
      tipo: 'texto',
      largura: larguraTexto,
      render: renderTextoMotivo,
    },
    {
      key: 'motivo_cancelamento_cotacao_bid_frete_internacional',
      label: rotulos.motivo_cancelamento_cotacao_bid_frete_internacional,
      tipo: 'texto',
      largura: larguraTexto,
      render: renderTextoMotivo,
    },
  ]
}
