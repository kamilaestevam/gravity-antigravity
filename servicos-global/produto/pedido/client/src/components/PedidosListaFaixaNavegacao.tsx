/**
 * PedidosListaFaixaNavegacao — painéis + status na faixa da lista.
 */
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { GTAbaTipo } from '@nucleo/tabela-virtual-global'
import { PedidosListaPainelBar, type PedidosListaPainelBarProps } from './PedidosListaPainelBar'
import {
  resolverCorAbaStatus,
  resolverEstiloBadgeContagem,
  resolverEstiloPillAbaStatus,
} from '../shared/listaStatusAbaEstilo'

export interface PedidosListaFaixaNavegacaoProps extends PedidosListaPainelBarProps {
  abas: GTAbaTipo[]
  abaAtiva: string
  onMudarAba: (aba: string) => void
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
  const cor = resolverCorAbaStatus(aba.valor, aba.cor)
  const ehTodos = aba.valor === 'todos'
  const pillCheia = ativa && !ehTodos
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      data-testid={`lista-status-tab-${aba.valor}`}
      className={[
        'lp-status-pill',
        pillCheia ? 'lp-status-pill--ativa' : '',
        ehTodos ? 'lp-status-pill--todos' : '',
        ehTodos && ativa ? 'lp-status-pill--todos-selecionado' : '',
      ].filter(Boolean).join(' ')}
      style={resolverEstiloPillAbaStatus(aba.valor, aba.cor, ativa)}
      onClick={() => onSelect(aba.valor)}
      title={aba.label}
    >
      <span className="lp-status-pill__dot" style={{ background: cor }} aria-hidden="true" />
      <span className="lp-status-pill__label">{aba.label}</span>
      {aba.contagem != null && (
        <span
          className="lp-status-pill__contagem"
          style={resolverEstiloBadgeContagem(aba.valor, aba.cor, ativa)}
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

export function PedidosListaFaixaNavegacao({
  abas,
  abaAtiva,
  onMudarAba,
  paineis,
  carregando,
  ...painelProps
}: PedidosListaFaixaNavegacaoProps) {
  const { t } = useTranslation()
  const paineisVisiveis = paineis.filter(p => p.is_visivel)
  // Faixa de painéis sempre visível na lista (evita sumir após falha/API lenta).
  const exibirLinhaPaineis = true

  return (
    <nav
      className={`lp-faixa-navegacao${exibirLinhaPaineis ? '' : ' lp-faixa-navegacao--sem-paineis'}`}
      aria-label={t('pedido.lista.faixa_navegacao', { defaultValue: 'Painéis e status da lista' })}
      data-testid="lista-faixa-navegacao"
    >
      {exibirLinhaPaineis && (
        <section
          className="lp-faixa-navegacao__paineis"
          aria-label={t('pedido.lista.paineis_secao', { defaultValue: 'Painéis da lista' })}
        >
          <PedidosListaPainelBar
            {...painelProps}
            paineis={paineis}
            carregando={carregando}
            variant="unificado"
          />
        </section>
      )}
      <section
        className="lp-faixa-navegacao__status"
        aria-label={t('pedido.lista.abas_status', { defaultValue: 'Filtrar por status' })}
      >
        <span
          id="lista-faixa-status-label"
          className="lp-faixa-navegacao__secao-label"
          title={t('pedido.lista.status_secao', { defaultValue: 'Status do pedido' })}
        >
          {t('pedido.lista.status_secao_curto', { defaultValue: 'Status' })}
        </span>
        <ListaStatusTabs abas={abas} abaAtiva={abaAtiva} onMudarAba={onMudarAba} />
      </section>
    </nav>
  )
}
