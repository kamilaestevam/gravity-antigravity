/**
 * ColunasAvo.tsx — Colunas da camada 1 (Processo) na lista hierárquica.
 */
import type { TFunction } from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'
import { fmtDataLista, fmtMoedaLista, fmtPesoLista } from '../../shared/lista/mockListaHierarquica'

export function buildColunasAvo(_t: TFunction): GTColuna<ProcessoAvoLinha>[] {
  return [
    {
      key: 'numero_processo',
      label: 'Processo',
      sortavel: true,
      filtravel: true,
      naoOcultavel: true,
      render: (_v, p) => (
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{p.numero_processo}</span>
      ),
    },
    {
      key: 'tipo_operacao_processo',
      label: 'Operação',
      sortavel: true,
      filtravel: true,
      render: (_v, p) => (p.tipo_operacao_processo === 'importacao' ? 'Importação' : 'Exportação'),
    },
    {
      key: 'status_processo',
      label: 'Status',
      tipo: 'badge',
      align: 'center',
      sortavel: true,
      filtravel: true,
      render: (_v, p) => (
        <StatusBadgeGlobal
          valor={p.rotulo_status_processo}
          style={{
            color: p.cor_status_processo,
            background: `${p.cor_status_processo}20`,
            border: `1px solid ${p.cor_status_processo}33`,
          }}
        />
      ),
    },
    {
      key: 'referencia_interna_processo',
      label: 'Ref. interna',
      sortavel: true,
      filtravel: true,
      editavel: true,
      render: (_v, p) => p.referencia_interna_processo ?? '—',
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
      key: 'valor_total_agregado',
      label: 'Valor FOB',
      tipo: 'numero',
      align: 'right',
      sortavel: true,
      render: (_v, p) => fmtMoedaLista(p.valor_total_agregado, p.moeda_agregada),
    },
    {
      key: 'peso_bruto_agregado',
      label: 'Peso bruto',
      tipo: 'numero',
      align: 'right',
      sortavel: true,
      render: (_v, p) => fmtPesoLista(p.peso_bruto_agregado),
    },
    {
      key: 'data_criacao_processo',
      label: 'Abertura',
      tipo: 'periodo',
      sortavel: true,
      render: (_v, p) => fmtDataLista(p.data_criacao_processo),
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
