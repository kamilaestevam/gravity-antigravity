/**
 * ListaPedidos.tsx — Tela principal do produto Pedido
 *
 * Grid hierarquico usando TabelaCamadasGlobal:
 *  - Pai: Pedido (11+ colunas do legado DATI)
 *  - Filho: PedidoItem (6 colunas de saldo + UoM)
 *
 * Referencia visual: screenshots do PDF pedido.pdf (paginas 7-8)
 * Referencia de codigo: produto/processo/client/src/pages/pedidos/PedidosPage.tsx
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  Eye,
  PencilSimple,
  Trash,
  Copy,
  CurrencyDollar,
  Scales,
  Cube,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaCamadasGlobal } from '@nucleo/tabela-camadas-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { TCGColuna, TCGAcao } from '@nucleo/tabela-camadas-global'
import { useCardPreferences } from '../shared/useCardPreferences'
import './ListaPedidos.css'
import type { Pedido, PedidoItem } from '../shared/types'
import {
  STATUS_PEDIDO_LABELS,
  fmtQuantidade,
  fmtMoeda,
  fmtData,
} from '../shared/types'

// ── Mock data ─────────────────────────────────────────────────────────────────

const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 'pedi_id_0000001/26',
    tenant_id: 'tenant-001',
    company_id: 'company-001',
    tipo_operacao: 'importacao',
    numero_pedido: 'OTT109001',
    status: 'aberto',
    importacao_exportador_id: 'exp-001',
    exportacao_importador_id: null,
    exportador_nome: 'ABC Shipper',
    fabricante_nome: 'Abc Shpper',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 35000.00,
    casas_decimais_total_pedido: 2,
    quantidade_total_pedido: 1000,
    casas_decimais_quantidade_total_pedido: 2,
    unidade_comercializada_pedido: 'UN',
    cobertura_cambial: 'com_cobertura',
    condicao_pagamento: '30% Antecipado',
    data_emissao_pedido: '2023-04-22',
    numero_proforma: '20230126',
    numero_invoice: '20230126',
    referencia_importador: '20230126',
    referencia_exportador: '09XZA',
    referencia_fabricante: '09XZA',
    itens: [
      {
        id: 'pite_id_00001/26',
        tenant_id: 'tenant-001',
        company_id: 'company-001',
        pedido_id: 'pedi_id_0000001/26',
        sequencia_item: 1,
        part_number: 'PCB-X200',
        ncm: '8542.31.90',
        descricao: 'Placa controladora PCB modelo X-200',
        unidade_comercializada_item: 'Unidade',
        quantidade_inicial: 1000.00,
        quantidade_atual: 1000.00,
        quantidade_pronta: 1000.00,
        quantidade_transferida: 0,
        quantidade_cancelada: 0,
        casas_decimais_quantidade: 2,
        moeda_item: 'USD',
        valor_item: 35000.00,
        valor_unitario: 35.00,
        casas_decimais_total_item: 2,
      },
    ],
    created_at: '2023-04-22T00:00:00Z',
    updated_at: '2023-04-22T00:00:00Z',
  },
  {
    id: 'pedi_id_0000002/26',
    tenant_id: 'tenant-001',
    company_id: 'company-001',
    tipo_operacao: 'importacao',
    numero_pedido: 'OTT109002',
    status: 'aberto',
    importacao_exportador_id: 'exp-002',
    exportacao_importador_id: null,
    exportador_nome: 'Chiandong Xu',
    fabricante_nome: 'Chiandong Xu',
    incoterm: 'CIF',
    moeda_pedido: 'USD',
    valor_total_pedido: 52000.00,
    casas_decimais_total_pedido: 2,
    quantidade_total_pedido: 2000,
    casas_decimais_quantidade_total_pedido: 2,
    unidade_comercializada_pedido: 'MT',
    cobertura_cambial: 'com_cobertura',
    condicao_pagamento: null,
    data_emissao_pedido: '2023-05-10',
    numero_proforma: '20230127',
    numero_invoice: '20230127',
    referencia_importador: '20230127',
    referencia_exportador: '1564056441',
    referencia_fabricante: '1564056441',
    itens: [
      {
        id: 'pite_id_00002/26',
        tenant_id: 'tenant-001',
        company_id: 'company-001',
        pedido_id: 'pedi_id_0000002/26',
        sequencia_item: 1,
        part_number: 'TEX-440',
        ncm: '5407.61.00',
        descricao: 'Tecido poliester 440g/m2',
        unidade_comercializada_item: 'Metro',
        quantidade_inicial: 2000.00,
        quantidade_atual: 2000.00,
        quantidade_pronta: 0,
        quantidade_transferida: 0,
        quantidade_cancelada: 0,
        casas_decimais_quantidade: 2,
        moeda_item: 'USD',
        valor_item: 52000.00,
        valor_unitario: 26.00,
        casas_decimais_total_item: 2,
      },
    ],
    created_at: '2023-05-10T00:00:00Z',
    updated_at: '2023-05-10T00:00:00Z',
  },
  {
    id: 'pedi_id_0000003/26',
    tenant_id: 'tenant-001',
    company_id: 'company-001',
    tipo_operacao: 'importacao',
    numero_pedido: 'OTT109033',
    status: 'transferencia',
    importacao_exportador_id: 'exp-002',
    exportacao_importador_id: null,
    exportador_nome: 'Chiandong Xu',
    fabricante_nome: 'Calimero del',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 4200.00,
    casas_decimais_total_pedido: 2,
    quantidade_total_pedido: 20,
    casas_decimais_quantidade_total_pedido: 2,
    unidade_comercializada_pedido: 'MT',
    cobertura_cambial: 'com_cobertura',
    condicao_pagamento: null,
    data_emissao_pedido: '2023-05-10',
    numero_proforma: '20230024',
    numero_invoice: '20230024',
    referencia_importador: '20230024',
    referencia_exportador: 'CAL202399',
    referencia_fabricante: 'CAL202399',
    itens: [
      {
        id: 'pite_id_00003/26',
        tenant_id: 'tenant-001',
        company_id: 'company-001',
        pedido_id: 'pedi_id_0000003/26',
        sequencia_item: 1,
        part_number: 'MRB-20',
        ncm: '6802.93.00',
        descricao: 'Marmore polido 60x60cm',
        unidade_comercializada_item: 'Metro',
        quantidade_inicial: 20.00,
        quantidade_atual: 20.00,
        quantidade_pronta: 0,
        quantidade_transferida: 0,
        quantidade_cancelada: 0,
        casas_decimais_quantidade: 2,
        moeda_item: 'USD',
        valor_item: 4200.00,
        valor_unitario: 210.00,
        casas_decimais_total_item: 2,
      },
    ],
    created_at: '2023-05-10T00:00:00Z',
    updated_at: '2023-05-10T00:00:00Z',
  },
  {
    id: 'pedi_id_0000004/26',
    tenant_id: 'tenant-001',
    company_id: 'company-001',
    tipo_operacao: 'importacao',
    numero_pedido: 'OTT109055',
    status: 'aberto',
    importacao_exportador_id: 'exp-002',
    exportacao_importador_id: null,
    exportador_nome: 'Chiandong Xu',
    fabricante_nome: 'Chiandong Xu',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 75000.00,
    casas_decimais_total_pedido: 2,
    quantidade_total_pedido: 15000,
    casas_decimais_quantidade_total_pedido: 2,
    unidade_comercializada_pedido: 'LT',
    cobertura_cambial: 'com_cobertura',
    condicao_pagamento: null,
    data_emissao_pedido: '2023-05-15',
    numero_proforma: '20230100',
    numero_invoice: '20230100',
    referencia_importador: '20230100',
    referencia_exportador: '1564056442',
    referencia_fabricante: '1564056442',
    itens: [
      {
        id: 'pite_id_00004/26',
        tenant_id: 'tenant-001',
        company_id: 'company-001',
        pedido_id: 'pedi_id_0000004/26',
        sequencia_item: 1,
        part_number: 'OIL-15K',
        ncm: '2710.19.99',
        descricao: 'Oleo lubrificante industrial 15W-40',
        unidade_comercializada_item: 'Litro',
        quantidade_inicial: 15000.00,
        quantidade_atual: 15000.00,
        quantidade_pronta: 15000.00,
        quantidade_transferida: 0,
        quantidade_cancelada: 0,
        casas_decimais_quantidade: 2,
        moeda_item: 'USD',
        valor_item: 75000.00,
        valor_unitario: 5.00,
        casas_decimais_total_item: 2,
      },
    ],
    created_at: '2023-05-15T00:00:00Z',
    updated_at: '2023-05-15T00:00:00Z',
  },
]

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

const colunasPai: TCGColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: 'Pedido/Item',
    tipo: 'texto',
    filtravel: true,
    naoOcultavel: true,
    tooltipTitulo: 'Numero do Pedido',
    tooltipDescricao: 'Identificador unico do documento comercial (PO/SO)',
  },
  {
    key: 'tipo_operacao',
    label: 'P.O Tipo',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Tipo de Operacao',
    tooltipDescricao: 'Importacao (Purchase Order) ou Exportacao (Sales Order)',
    render: (_val: string, row: Pedido) => (
      <span>{row.tipo_operacao === 'importacao' ? 'Manaus' : 'Exportacao'}</span>
    ),
  },
  {
    key: 'exportador_nome',
    label: 'Importador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Importador',
    tooltipDescricao: 'Entidade legal importadora (tenant/company)',
    render: () => <span>Ottis</span>,
  },
  {
    key: 'referencia_importador',
    label: 'Ref. Importador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referencia do Importador',
    tooltipDescricao: 'Codigo de referencia interna do importador para o pedido',
  },
  {
    key: 'exportador_nome',
    label: 'Exportador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Exportador',
    tooltipDescricao: 'Fornecedor estrangeiro (na importacao) ou entidade exportadora',
  },
  {
    key: 'referencia_exportador',
    label: 'Ref. Exportador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referencia do Exportador',
    tooltipDescricao: 'Codigo de referencia utilizado pelo exportador',
  },
  {
    key: 'fabricante_nome',
    label: 'Fabricante',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Fabricante',
    tooltipDescricao: 'Identificacao da origem produtiva (Fabrica)',
  },
  {
    key: 'referencia_fabricante',
    label: 'Ref. Fabricante',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referencia do Fabricante',
    tooltipDescricao: 'Codigo identificador especifico do fabricante',
  },
  {
    key: 'numero_proforma',
    label: 'Numero Proforma',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Numero Proforma',
    tooltipDescricao: 'Referencia da Proforma Invoice vinculada',
  },
  {
    key: 'numero_invoice',
    label: 'Numero Invoice',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Numero Invoice',
    tooltipDescricao: 'Identificador da Commercial Invoice (Fatura)',
  },
  {
    key: 'data_emissao_pedido',
    label: 'Data P.O',
    tipo: 'periodo',
    filtravel: true,
    tooltipTitulo: 'Data do Pedido',
    tooltipDescricao: 'Data de registro ou emissao da Purchase Order',
    render: (_val: string, row: Pedido) => <span>{fmtData(row.data_emissao_pedido)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Status do Pedido',
    tooltipDescricao: 'Ciclo de vida: Draft, Aberto, Em Transferencia, Consolidado, Cancelado',
    render: (_val: string, row: Pedido) => (
      <StatusBadgeGlobal
        valor={STATUS_PEDIDO_LABELS[row.status] ?? row.status}
        genero="masculino"
      />
    ),
    oculta: true,
  },
]

// ── Colunas filha (PedidoItem — saldo) ────────────────────────────────────────

const colunasFilha: TCGColuna<PedidoItem>[] = [
  {
    key: 'quantidade_inicial',
    label: 'Quantidade Inicial',
    tipo: 'numero',
    filtravel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Inicial',
    tooltipDescricao: 'Quantidade original do item no momento da criacao — valor imutavel',
    render: (_val: number, row: PedidoItem) => (
      <span>{fmtQuantidade(row.quantidade_inicial, row.casas_decimais_quantidade)}</span>
    ),
  },
  {
    key: 'quantidade_atual',
    label: 'Quantidade Atual',
    tipo: 'numero',
    filtravel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Atual',
    tooltipDescricao: 'Saldo vivo disponivel para alocacao em processos logisticos',
    render: (_val: number, row: PedidoItem) => (
      <span style={{
        fontWeight: row.quantidade_atual === 0 ? 400 : 600,
        color: row.quantidade_atual === 0 ? 'var(--text-muted)' : undefined,
      }}>
        {fmtQuantidade(row.quantidade_atual, row.casas_decimais_quantidade)}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida',
    label: 'Quantidade Transferida',
    tipo: 'numero',
    filtravel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Transferida',
    tooltipDescricao: 'Total ja alocado em processos logisticos (embarques)',
    render: (_val: number, row: PedidoItem) => (
      <span>{fmtQuantidade(row.quantidade_transferida, row.casas_decimais_quantidade)}</span>
    ),
  },
  {
    key: 'quantidade_pronta',
    label: 'Quantidade Pronta',
    tipo: 'numero',
    filtravel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Pronta',
    tooltipDescricao: 'Montante produzido pela fabrica e validado para o proximo embarque',
    render: (_val: number, row: PedidoItem) => (
      <span>{fmtQuantidade(row.quantidade_pronta, row.casas_decimais_quantidade)}</span>
    ),
  },
  {
    key: 'quantidade_para_transferir',
    label: 'Quantidade Para Transferir',
    tipo: 'numero',
    filtravel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Para Transferir',
    tooltipDescricao: 'Campo de entrada para alocar quantidade em um novo processo',
    render: (_val: unknown, _row: PedidoItem) => (
      <input
        type="number"
        defaultValue={0}
        min={0}
        step="0.01"
        style={{
          width: '5rem',
          textAlign: 'right',
          background: 'var(--bg-surface, #1e1e2e)',
          border: '1px solid var(--border-subtle, #333)',
          borderRadius: '0.25rem',
          color: 'var(--text-primary, #e2e8f0)',
          padding: '0.25rem 0.5rem',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-mono, monospace)',
        }}
        onClick={(e) => e.stopPropagation()}
      />
    ),
  },
  {
    key: 'unidade_comercializada_item',
    label: 'Descricao Quantidade',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Unidade de Medida',
    tooltipDescricao: 'Unidade de medida do item (Unidade, Metro, Litro, cm3, Metro Quadrado)',
    render: (_val: string | null, row: PedidoItem) => (
      <span>{row.unidade_comercializada_item ?? '—'}</span>
    ),
  },
]

// ── Acoes pai ─────────────────────────────────────────────────────────────────

const acoesPai: TCGAcao<Pedido>[] = [
  {
    id: 'ver',
    tooltip: 'Ver detalhes do pedido',
    icone: <Eye size={16} weight="duotone" />,
    onClick: (row: Pedido) => {
      console.log('[Pedido] Ver:', row.id)
    },
  },
  {
    id: 'editar',
    tooltip: 'Editar dados do pedido',
    icone: <PencilSimple size={16} weight="duotone" />,
    onClick: (row: Pedido) => {
      console.log('[Pedido] Editar:', row.id)
    },
  },
  {
    id: 'copiar',
    tooltip: 'Duplicar pedido',
    icone: <Copy size={16} weight="duotone" />,
    onClick: (row: Pedido) => {
      console.log('[Pedido] Duplicar:', row.id)
    },
  },
  {
    id: 'deletar',
    tooltip: 'Deletar pedido (somente Draft)',
    icone: <Trash size={16} weight="duotone" />,
    onClick: (row: Pedido) => {
      console.log('[Pedido] Deletar:', row.id)
    },
  },
]

// ── Componente ────────────────────────────────────────────────────────────────

export default function ListaPedidos() {
  const { t } = useTranslation()
  const [carregando] = useState(false)
  const pedidos = PEDIDOS_MOCK
  const { visiveis: cardsVisiveis } = useCardPreferences()

  // Stats calculados
  const totalPedidos = pedidos.length
  const totalItens = pedidos.reduce((acc, p) => acc + p.itens.length, 0)
  const valorTotal = pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)
  const qtdTotal = pedidos.reduce((acc, p) => acc + (p.quantidade_total_pedido ?? 0), 0)

  return (
    <div className="ws-fade-up lp-page">

      {/* ── KPI cards + ações ── */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          {cardsVisiveis.map(pref => {
            if (pref.id === 'total_pedidos') return (
              <CardBasicoGlobal key="total_pedidos"
                titulo={t('pedido.total_pedidos')}
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
                valor={totalPedidos}
                subtexto={`${totalItens} ${t('pedido.itens_total')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.abertos')}</span><strong>{pedidos.filter(p => p.status === 'aberto').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.em_andamento')}</span><strong>{pedidos.filter(p => p.status === 'em_andamento').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.concluidos')}</span><strong>{pedidos.filter(p => p.status === 'concluido').length}</strong></p>
                </>}
              />
            )
            if (pref.id === 'valor_total') return (
              <CardBasicoGlobal key="valor_total"
                titulo={t('pedido.valor_total')}
                icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={fmtMoeda(valorTotal)}
                variante="sucesso"
                subtexto={t('pedido.soma_pedidos')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.moeda')}</span><strong>USD</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_por_pedido')}</span><strong>{fmtMoeda(totalPedidos ? valorTotal / totalPedidos : 0)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'qtd_total') return (
              <CardBasicoGlobal key="qtd_total"
                titulo={t('pedido.qtd_total')}
                icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                valor={fmtQuantidade(qtdTotal)}
                variante="aviso"
                subtexto={t('pedido.qtd_acumulada')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.total_itens_distintos')}</span><strong>{totalItens}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_itens_pedido')}</span><strong>{totalPedidos ? (totalItens / totalPedidos).toFixed(1) : 0}</strong></p>
                </>}
              />
            )
            return null
          })}
        </div>
        <div className="lp-acoes">
          <BotaoGlobal variante="primario" icone={<Plus size={16} />}
            onClick={() => console.log('[Pedido] Novo')}>
            {t('pedido.novo_pedido')}
          </BotaoGlobal>
        </div>
      </div>

      {/* ── Tabela ── */}
      <TabelaCamadasGlobal<Pedido, PedidoItem>
        id="pedido-lista-principal"
        dados={pedidos}
        colunas={colunasPai}
        colunasFilhas={colunasFilha}
        filhos={(pedido) => pedido.itens ?? []}
        acoes={acoesPai}
        itemId={(pedido) => pedido.id}
        placeholderBusca={t('pedido.buscar')}
        campoBusca="numero_pedido"
        carregando={carregando}
        itensPorPagina={20}
        emptyIcon={<Package weight="duotone" size={24} />}
        emptyTitle={t('pedido.vazio')}
        emptyDescription={t('pedido.vazio_filtro')}
        emptyAction={
          <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
            {t('pedido.criar_primeiro')}
          </BotaoGlobal>
        }
      />

    </div>
  )
}
