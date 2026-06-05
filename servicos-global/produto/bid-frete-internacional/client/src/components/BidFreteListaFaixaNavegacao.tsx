/**
 * BidFreteListaFaixaNavegacao — painéis + status na faixa da lista (paridade Pedido).
 */
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { GTAbaTipo } from '@nucleo/tabela-virtual-global'
import { BidFreteListaPainelBar, type BidFreteListaPainelBarProps } from './BidFreteListaPainelBar'
import {
  resolverCorAbaStatusBidFrete,
  resolverEstiloBadgeContagemBidFrete,
  resolverEstiloPillAbaStatusBidFrete,
} from '../shared/lista-status-aba-estilo-bid-frete-internacional'

export interface BidFreteListaFaixaNavegacaoProps extends Partial<BidFreteListaPainelBarProps> {
  abas: GTAbaTipo[]
  abaAtiva: string
  onMudarAba: (aba: string) => void
  /** false na visão fornecedor (só status na faixa). Default: true */
  exibirLinhaPaineis?: boolean
}

function StatusPill({
  aba,
  ativa,
  onSelect,
}: {
  aba: GTAbaTipo
  ativa: boolean
  onSelect: (valor: string) => void
}) {
  const cor = resolverCorAbaStatusBidFrete(aba.valor, aba.cor)
  const ehTodas = aba.valor === 'TODAS'
  const pillCheia = ativa && !ehTodas
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      data-testid={`lista-status-tab-${aba.valor}`}
      className={[
        'lp-status-pill',
        pillCheia ? 'lp-status-pill--ativa' : '',
        ehTodas ? 'lp-status-pill--todos' : '',
        ehTodas && ativa ? 'lp-status-pill--todos-selecionado' : '',
      ].filter(Boolean).join(' ')}
      style={resolverEstiloPillAbaStatusBidFrete(aba.valor, aba.cor, ativa)}
      onClick={() => onSelect(aba.valor)}
      title={aba.label}
    >
      <span className="lp-status-pill__dot" style={{ background: cor }} aria-hidden="true" />
      <span className="lp-status-pill__label">{aba.label}</span>
      {aba.contagem != null && (
        <span
          className="lp-status-pill__contagem"
          style={resolverEstiloBadgeContagemBidFrete(aba.valor, aba.cor, ativa)}
        >
          {aba.contagem}
        </span>
      )}
    </button>
  )
}

const ListaStatusTabs = memo(function ListaStatusTabs({
  abas,
  abaAtiva,
  onMudarAba,
}: {
  abas: GTAbaTipo[]
  abaAtiva: string
  onMudarAba: (aba: string) => void
}) {
  if (abas.length === 0) return null

  return (
    <div className="lp-status-pills-row">
      <div className="lp-status-pills" role="tablist" aria-labelledby="lista-faixa-status-label">
        {abas.map(aba => (
          <StatusPill
            key={aba.valor}
            aba={aba}
            ativa={abaAtiva === aba.valor}
            onSelect={onMudarAba}
          />
        ))}
      </div>
    </div>
  )
})

export function BidFreteListaFaixaNavegacao({
  abas,
  abaAtiva,
  onMudarAba,
  exibirLinhaPaineis = true,
  paineis = [],
  carregando,
  ...painelProps
}: BidFreteListaFaixaNavegacaoProps) {
  const { t } = useTranslation()

  return (
    <nav
      className={`lp-faixa-navegacao${exibirLinhaPaineis ? '' : ' lp-faixa-navegacao--sem-paineis'}`}
      aria-label={t('bid_frete_internacional.lista.faixa_navegacao', {
        defaultValue: 'Painéis e status da lista',
      })}
      data-testid="lista-faixa-navegacao"
    >
      {exibirLinhaPaineis && (
        <section
          className="lp-faixa-navegacao__paineis"
          aria-label={t('bid_frete_internacional.lista.paineis_secao', { defaultValue: 'Painéis da lista' })}
        >
          <BidFreteListaPainelBar
            {...painelProps}
            paineis={paineis}
            painelAtualId={painelProps.painelAtualId ?? null}
            setPaineis={painelProps.setPaineis ?? (() => undefined)}
            setPainelAtualId={painelProps.setPainelAtualId ?? (() => undefined)}
            onTrocarPainel={painelProps.onTrocarPainel ?? (() => undefined)}
            onCriarPainel={painelProps.onCriarPainel ?? (async () => false)}
            carregando={carregando}
            variant="unificado"
          />
        </section>
      )}
      <section
        className="lp-faixa-navegacao__status"
        aria-label={t('bid_frete_internacional.lista.abas_status', { defaultValue: 'Filtrar por status' })}
      >
        <span
          id="lista-faixa-status-label"
          className="lp-faixa-navegacao__secao-label"
          title={t('bid_frete_internacional.lista.status_secao', { defaultValue: 'Status da cotação' })}
        >
          {t('bid_frete_internacional.lista.status_secao_curto', { defaultValue: 'Status' })}
        </span>
        <ListaStatusTabs abas={abas} abaAtiva={abaAtiva} onMudarAba={onMudarAba} />
      </section>
    </nav>
  )
}
