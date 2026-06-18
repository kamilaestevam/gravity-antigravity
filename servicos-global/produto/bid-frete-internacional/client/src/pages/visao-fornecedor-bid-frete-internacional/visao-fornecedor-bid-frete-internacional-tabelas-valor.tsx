/**
 * Tabelas de valor — Portal do Fornecedor: lista de rotas (TabelaGlobal)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../../shared/pagina-carregando-bid-frete-internacional'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import {
  CurrencyDollar,
  Plus,
  Trash,
  Anchor,
  AirplaneTilt,
  Van,
} from '@phosphor-icons/react'

import {
  getVisaoFornecedorBidFreteInternacionalTabelasValor,
  excluirVisaoFornecedorBidFreteInternacionalTabelaValor,
} from '../../shared/api'
import type { TabelaBidFreteInternacional, ModalFrete } from '../../shared/types'
import { MODAL_LABELS } from '../../shared/types'

const MODAL_ICON_MAP: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={14} />,
  AEREO: <AirplaneTilt weight="duotone" size={14} />,
  RODOVIARIO: <Van weight="duotone" size={14} />,
}

const fmtMoeda = (val: number) => {
  if (!Number.isFinite(val)) return '—'
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}

const fmtData = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function rotuloRota(row: TabelaBidFreteInternacional): string {
  const origem = row.origem_nome_tabela_bid_frete_internacional
  const destino = row.destino_nome_tabela_bid_frete_internacional
  if (!origem && !destino) return '—'
  return `${origem ?? '—'} → ${destino ?? '—'}`
}

export default function VisaoFornecedorBidFreteInternacionalTabelasValor() {
  const { t } = useTranslation()
  const [precos, setPrecos] = useState<TabelaBidFreteInternacional[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getVisaoFornecedorBidFreteInternacionalTabelasValor()
      setPrecos(data)
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useSincronizarTituloPaginaTopo(useMemo(() => {
    if (carregando) {
      return criarTituloCarregandoTopo(<CurrencyDollar weight="duotone" size={22} />, t)
    }
    return {
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.titulo'),
      icone: <CurrencyDollar weight="duotone" size={22} />,
      subtitulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.subtitulo', { count: precos.length }),
    }
  }, [carregando, t, precos.length]))

  const handleExcluir = useCallback(async (item: TabelaBidFreteInternacional) => {
    try {
      await excluirVisaoFornecedorBidFreteInternacionalTabelaValor(item.id_tabela_bid_frete_internacional)
      await carregar()
    } catch {
      // silencioso
    }
  }, [carregar])

  const colunas: TabelaGlobalColuna<TabelaBidFreteInternacional>[] = useMemo(() => [
    {
      key: 'rota',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.col_rota'),
      tipo: 'texto',
      largura: 220,
      getValorBruto: rotuloRota,
      render: (_val: unknown, row: TabelaBidFreteInternacional) => (
        <span className="tv-cell">{rotuloRota(row)}</span>
      ),
    },
    {
      key: 'modal_tabela_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.col_modal'),
      tipo: 'texto',
      largura: 120,
      getValorBruto: (row) => MODAL_LABELS[row.modal_tabela_bid_frete_internacional],
      renderFiltroLabel: (val) => val,
      render: (val: unknown) => (
        <span className="tv-cell tv-cell--modal">
          {MODAL_ICON_MAP[val as ModalFrete]}
          {MODAL_LABELS[val as ModalFrete]}
        </span>
      ),
    },
    {
      key: 'moeda_tabela_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.col_moeda'),
      tipo: 'texto',
      largura: 80,
      align: 'center',
      render: (val: unknown) => (
        <span className="tv-cell tv-cell--mono">{String(val ?? '—')}</span>
      ),
    },
    {
      key: 'valor_total_tabela_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.col_total'),
      tipo: 'numero',
      largura: 140,
      align: 'right',
      getValorBruto: (row) => String(row.valor_total_tabela_bid_frete_internacional ?? 0),
      render: (_val: unknown, row: TabelaBidFreteInternacional) => (
        <span className="tv-cell tv-cell--mono tv-cell--valor">
          {row.moeda_tabela_bid_frete_internacional} {fmtMoeda(row.valor_total_tabela_bid_frete_internacional)}
        </span>
      ),
    },
    {
      key: 'dias_transito_tabela_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.col_transit'),
      tipo: 'numero',
      largura: 100,
      align: 'center',
      render: (val: unknown) => {
        const dias = Number(val)
        if (!Number.isFinite(dias) || dias <= 0) {
          return <span className="tv-cell tv-cell--mono">—</span>
        }
        return (
          <span className="tv-cell tv-cell--mono">
            {t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.dias', { val: dias })}
          </span>
        )
      },
    },
    {
      key: 'validade_fim_tabela_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.col_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (val: unknown) => (
        <span className="tv-cell">{fmtData(val as string)}</span>
      ),
    },
  ], [t])

  const acoes: TabelaGlobalAcao<TabelaBidFreteInternacional>[] = useMemo(() => [
    {
      id: 'excluir',
      icone: <Trash weight="duotone" size={16} />,
      tooltip: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.tooltip_excluir'),
      confirmarExclusao: {
        titulo: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.modal_excluir_titulo'),
        descricao: t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.modal_excluir_desc'),
        nomeItem: rotuloRota,
      },
      onClick: handleExcluir,
    },
  ], [handleExcluir, t])

  return (
    <PaginaGlobal className="tv-page bid-frete-page-shell">
      <div className="tv-toolbar">
        <BotaoGlobal variante="primario" disabled>
          <Plus weight="bold" size={14} />
          {t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.nova_rota')}
        </BotaoGlobal>
      </div>

      {carregando ? (
        <ConteudoCarregandoBidFreteInternacional />
      ) : (
        <TabelaGlobal
          dados={precos}
          colunas={colunas}
          acoes={acoes}
          idKey="id_tabela_bid_frete_internacional"
          mensagemVazio={t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.vazio')}
          tooltipBusca={t('bidfrete.visao_fornecedor_bid_frete_internacional.tabelas_valor.buscar')}
        />
      )}

      <style>{`
        .tv-toolbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .tv-cell {
          font-size: 0.8125rem;
          font-family: inherit;
          color: var(--text-primary, #f1f5f9);
        }
        .tv-cell--mono {
          font-family: 'DM Mono', ui-monospace, monospace;
        }
        .tv-cell--valor {
          font-weight: 600;
        }
        .tv-cell--modal {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
      `}</style>
    </PaginaGlobal>
  )
}
