/**
 * ColunasAvo.tsx — Colunas da camada 1 (Processo) na lista hierárquica.
 */
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'
import { Globe, Anchor } from '@phosphor-icons/react'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'
import { fmtDataLista, fmtMoedaLista, fmtPesoLista } from '../../shared/lista/mockListaHierarquica'
import { rotaDetalheProcessoLista } from '../../shared/lista/rotaProcessoLista'
import { ETAPAS_COR, ETAPAS_LABEL } from '../../pages/todos/_mocks'

export function buildColunasAvo(_t: TFunction): GTColuna<ProcessoAvoLinha>[] {
  return [
    {
      key: 'numero_processo',
      label: 'Nº Processo',
      tipo: 'texto',
      sortavel: true,
      filtravel: true,
      naoOcultavel: true,
      editavel: true,
      render: (_v, p) => (
        <Link
          to={rotaDetalheProcessoLista(p)}
          className="pl-processo-link tp-numero-processo"
          onClick={(e) => e.stopPropagation()}
        >
          {p.numero_processo}
        </Link>
      ),
    },
    {
      key: 'nome_importador',
      label: 'Importador',
      sortavel: true,
      filtravel: true,
    },
    {
      key: 'nome_exportador',
      label: 'Exportador',
      sortavel: true,
      filtravel: true,
    },
    {
      key: 'pais_origem',
      label: 'Origem',
      tipo: 'badge',
      align: 'center',
      sortavel: true,
      filtravel: true,
      render: (_v, p) => (
        <span className="tp-pill-pais">
          <Globe weight="duotone" size={11} />
          {p.pais_origem}
        </span>
      ),
    },
    {
      key: 'pais_destino',
      label: 'Destino',
      tipo: 'badge',
      align: 'center',
      sortavel: true,
      filtravel: true,
      render: (_v, p) => (
        <span className="tp-pill-pais">
          <Anchor weight="duotone" size={11} />
          {p.pais_destino}
        </span>
      ),
    },
    {
      key: 'incoterm',
      label: 'Incoterm',
      tipo: 'badge',
      align: 'center',
      sortavel: true,
      filtravel: true,
      render: (_v, p) => <span className="tp-pill-incoterm">{p.incoterm}</span>,
    },
    {
      key: 'via_transporte',
      label: 'Via',
      sortavel: true,
      filtravel: true,
    },
    {
      key: 'valor_total_agregado',
      label: 'Valor FOB',
      tipo: 'numero',
      align: 'right',
      sortavel: true,
      render: (_v, p) => (
        <strong style={{ color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>
          {fmtMoedaLista(p.valor_total_agregado, p.moeda_agregada)}
        </strong>
      ),
    },
    {
      key: 'peso_bruto_agregado',
      label: 'Peso Bruto',
      tipo: 'numero',
      align: 'right',
      sortavel: true,
      render: (_v, p) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtPesoLista(p.peso_bruto_agregado)}
        </span>
      ),
    },
    {
      key: 'data_criacao_processo',
      label: 'Abertura',
      tipo: 'periodo',
      sortavel: true,
      render: (_v, p) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtDataLista(p.data_criacao_processo)}
        </span>
      ),
    },
    {
      key: 'data_embarque',
      label: 'Embarque',
      tipo: 'periodo',
      sortavel: true,
      render: (_v, p) => p.data_embarque
        ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDataLista(p.data_embarque)}</span>
        : <span style={{ opacity: 0.4 }}>—</span>,
    },
    {
      key: 'etapa_atual',
      label: 'Etapa Atual',
      tipo: 'badge',
      align: 'center',
      sortavel: true,
      filtravel: true,
      render: (_v, p) => (
        <span
          className="tp-pill-etapa"
          style={{
            background: `${ETAPAS_COR[p.etapa_atual]}22`,
            color: ETAPAS_COR[p.etapa_atual],
          }}
        >
          {ETAPAS_LABEL[p.etapa_atual]}
        </span>
      ),
    },
    {
      key: 'responsavel_processo',
      label: 'Responsável',
      sortavel: true,
      filtravel: true,
      editavel: true,
    },
  ]
}
