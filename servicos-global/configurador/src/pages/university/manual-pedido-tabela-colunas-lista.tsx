import React from 'react'
import { ManualPedidoAccordionColunasLista } from './manual-pedido-accordion-colunas-lista'
import { TOTAL_COLUNAS_CATALOGO_PEDIDO } from './manual-pedido-catalogo-colunas-dados'

type ColunaPadraoLista = {
  ordem: number
  coluna: string
  descricao: string
  fixa?: boolean
}

type GrupoColunasPadraoLista = {
  id: string
  titulo: string
  nivel: 'pedido' | 'item'
  colunas: ColunaPadraoLista[]
}

/** SSOT — colunas iniciais visíveis na Lista (`_COLUNAS_PADRAO_SEQUENCIA` em Pedidos.tsx). */
const GRUPOS_COLUNAS_PADRAO_LISTA_PEDIDO: GrupoColunasPadraoLista[] = [
  {
    id: 'padrao-identificacao',
    titulo: 'Identificação e status',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 1,
        coluna: 'Nº pedido',
        descricao: 'Identificador do PO; **link** abre o drawer de edição do pedido.',
        fixa: true,
      },
      {
        ordem: 2,
        coluna: 'Tipo de operação',
        descricao: 'Pill **Importação** ou **Exportação**.',
      },
      {
        ordem: 3,
        coluna: 'Status',
        descricao: 'Pill com o status configurado do pedido (Aberto, Em andamento, etc.).',
      },
      {
        ordem: 4,
        coluna: 'Workspace',
        descricao: 'Filial à qual o pedido pertence.',
      },
    ],
  },
  {
    id: 'padrao-partes',
    titulo: 'Partes comerciais',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 5,
        coluna: 'Importador',
        descricao: 'Nome do importador no cabeçalho do pedido.',
      },
      {
        ordem: 6,
        coluna: 'Exportador',
        descricao: 'Nome do exportador no cabeçalho do pedido.',
      },
      {
        ordem: 7,
        coluna: 'Referência importador',
        descricao: 'Referência comercial do lado importador.',
      },
    ],
  },
  {
    id: 'padrao-logistica',
    titulo: 'Logística',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 8,
        coluna: 'Incoterm',
        descricao: 'Termo comercial (FOB, CIF, etc.).',
      },
      {
        ordem: 9,
        coluna: 'Porto origem',
        descricao: 'Porto de embarque do pedido.',
      },
      {
        ordem: 10,
        coluna: 'Porto destino',
        descricao: 'Porto de desembarque do pedido.',
      },
    ],
  },
  {
    id: 'padrao-item',
    titulo: 'Linha filha',
    nivel: 'item',
    colunas: [
      {
        ordem: 11,
        coluna: 'Descrição item',
        descricao: 'Descrição da linha de produto (visível nas linhas filhas).',
      },
      {
        ordem: 12,
        coluna: 'NCM',
        descricao: 'Nomenclatura do item na linha filha.',
      },
    ],
  },
  {
    id: 'padrao-valores',
    titulo: 'Valores e saldos',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 13,
        coluna: 'Moeda',
        descricao: 'Moeda do pedido (ex.: USD, BRL).',
      },
      {
        ordem: 14,
        coluna: 'Valor total',
        descricao: 'Valor total do PO na moeda informada.',
      },
      {
        ordem: 15,
        coluna: 'Saldo itens',
        descricao: 'Quantidade ainda em aberto nos itens do pedido.',
      },
    ],
  },
]

const TOTAL_COLUNAS_PADRAO = GRUPOS_COLUNAS_PADRAO_LISTA_PEDIDO.reduce(
  (acc, grupo) => acc + grupo.colunas.length,
  0,
)

export function ManualPedidoTabelaColunasPadraoLista() {
  return (
    <>
      <ManualPedidoAccordionColunasLista
        titulo="Colunas padrão da Lista"
        badge={`${TOTAL_COLUNAS_PADRAO} visíveis`}
        grupos={GRUPOS_COLUNAS_PADRAO_LISTA_PEDIDO}
        totalColunas={TOTAL_COLUNAS_PADRAO}
        abertoPorPadrao={false}
        accent="amber"
      />
      <p style={{
        margin: '12px 0 0',
        padding: '0 4px',
        fontSize: '.68rem',
        lineHeight: 1.55,
        color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)',
      }}>
        Estas são as colunas da primeira visita. O catálogo completo tem <strong style={{ color: '#cbd5e1' }}>{TOTAL_COLUNAS_CATALOGO_PEDIDO} colunas nativas</strong> no bloco acima (não confundir com os 111 campos da edição em massa no pedido). Expanda os grupos ou filtre por nome; use o menu{' '}
        <strong style={{ color: '#cbd5e1' }}>Colunas</strong> para exibir, ocultar e reordenar.
      </p>
    </>
  )
}
