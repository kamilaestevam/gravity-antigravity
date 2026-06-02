/**
 * ColunasFilhaLista.tsx — Colunas unificadas das camadas 2 (Pedido) e 3 (Item).
 */
import type { TFunction } from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import type { FilhoLinhaLista } from '../../shared/lista/mockListaHierarquica'
import { fmtDataLista, fmtMoedaLista } from '../../shared/lista/mockListaHierarquica'
import { fmtQuantidade } from '../../shared/lista/pedidoTypes'
import { getStatusCor, getStatusLabel } from './ColunasPai'

export function buildColunasFilhaLista(t: TFunction): GTColuna<FilhoLinhaLista>[] {
  return [
    {
      key: 'camada',
      label: 'Nível',
      align: 'center',
      render: (_v, l) => (
        <span className={`pl-camada pl-camada--${l.camada}`}>
          {l.camada === 'pedido' ? 'Pedido' : 'Item'}
        </span>
      ),
    },
    {
      key: 'identificador',
      label: 'Número / Part Number',
      sortavel: true,
      render: (_v, l) => {
        if (l.camada === 'pedido') {
          return <span style={{ fontWeight: 600 }}>{l.pedido.numero_pedido}</span>
        }
        return <span style={{ fontFamily: 'monospace' }}>{l.item.part_number}</span>
      },
    },
    {
      key: 'status_ou_ncm',
      label: 'Status / NCM',
      align: 'center',
      render: (_v, l) => {
        if (l.camada === 'pedido') {
          return (
            <StatusBadgeGlobal
              label={getStatusLabel(l.pedido.status, t)}
              cor={getStatusCor(l.pedido.status)}
            />
          )
        }
        return <span style={{ fontFamily: 'monospace' }}>{l.item.ncm}</span>
      },
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (_v, l) => (
        l.camada === 'pedido'
          ? (l.pedido.nome_exportador ?? '—')
          : l.item.descricao_item
      ),
    },
    {
      key: 'quantidade_ou_valor',
      label: 'Qtd / Valor',
      align: 'right',
      render: (_v, l) => {
        if (l.camada === 'pedido') {
          const moeda = l.pedido.moeda_pedido ?? 'USD'
          const valor = l.pedido.valor_total_pedido ?? 0
          return fmtMoedaLista(valor, moeda)
        }
        return fmtQuantidade(l.item.quantidade_atual_pedido, l.item.casas_decimais_quantidade_item)
      },
    },
    {
      key: 'data',
      label: 'Data',
      render: (_v, l) => {
        if (l.camada === 'pedido') {
          return fmtDataLista(l.pedido.data_emissao_pedido ?? undefined)
        }
        return fmtDataLista(l.item.data_emissao_pedido ?? undefined)
      },
    },
  ]
}
