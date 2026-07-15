import {
  ArrowsDownUp,
  Buildings,
  CircleDashed,
  Flag,
  MapPin,
  Warehouse,
  type Icon,
} from '@phosphor-icons/react'
import type { CampoGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import type { CampoFiltroMapaPedidoId } from './manual-pedido-mock-filtros-mapa-simulador'

type CampoFiltroMapaPedido = CampoGuiaAoVivo<CampoFiltroMapaPedidoId>

export const CAMPOS_FILTROS_MAPA_PEDIDO: CampoFiltroMapaPedido[] = [
  {
    id: 'operacao',
    num: '01',
    rotulo: 'Operação',
    paragrafoGuia:
      'Defina **Importação** e **Exportação** e controle o fluxo de pedidos visível no mapa. Por padrão, ambos vêm selecionados.',
    descricaoPontos: ['Importação', 'Exportação'],
    obrigatorio: false,
    obrigatorioNota: 'Opcional: desmarque para ocultar um fluxo inteiro',
    habilitaPassosPosteriores: [
      'Trilhos e cores no mapa (laranja = importação, roxo = exportação)',
      'Recorte cumulativo com **Origem**, **Destino** e demais filtros',
    ],
    icone: ArrowsDownUp,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.32)',
    fundo: 'rgba(239,68,68,.08)',
  },
  {
    id: 'origem',
    num: '02',
    rotulo: 'Origem',
    paragrafoGuia:
      'Selecione o **país de origem** e focalize rotas a partir desse ponto. Use a busca para localizar países com mais pedidos.',
    descricaoPontos: ['China', 'Japão', 'Reino Unido', 'Países Baixos', 'França', 'Alemanha', 'Brasil'],
    obrigatorio: false,
    habilitaPassosPosteriores: [
      'Pins de saída destacados no globo',
      'Cruzamento com **Destino** e **Exportador**',
    ],
    icone: MapPin,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    id: 'destino',
    num: '03',
    rotulo: 'Destino',
    paragrafoGuia:
      'Aplique o critério na **chegada**. O mapa destaca só trechos compatíveis com os países marcados.',
    descricaoPontos: ['Brasil', 'Estados Unidos', 'França', 'Reino Unido'],
    obrigatorio: false,
    habilitaPassosPosteriores: [
      'Rotas filtradas em tempo real',
      'Combinação com **Origem** e **Status**',
    ],
    icone: Flag,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    id: 'exportador',
    num: '04',
    rotulo: 'Exportador',
    paragrafoGuia:
      'Filtre por **exportador** cadastrado no workspace. Cada nome representa um fornecedor com pedidos ativos no escopo.',
    descricaoPontos: [
      'Shenzhen Components',
      'Asia Pacific Ltd',
      'EuroParts GmbH',
      'Nordic Supply',
      'Agro Export PR',
      'Café Santos Export',
    ],
    obrigatorio: false,
    habilitaPassosPosteriores: [
      'Pins vinculados ao exportador escolhido',
      'Leitura por parceiro comercial no mapa',
    ],
    icone: Buildings,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    id: 'importador',
    num: '05',
    rotulo: 'Importador',
    paragrafoGuia:
      'Filtre por **importador** cadastrado no workspace e refine os pins exibidos para cada filial ou parceiro.',
    descricaoPontos: [
      'Filial SC Importador',
      'Matriz SP Importador',
      'Importador Ltda',
      'Detroit Motors LLC',
      'Santos Trading',
    ],
    obrigatorio: false,
    habilitaPassosPosteriores: [
      'Visão por destinatário dos pedidos',
      'Cruzamento com **Operação** e **Status**',
    ],
    icone: Warehouse,
    cor: '#fb923c',
    borda: 'rgba(251,146,60,.32)',
    fundo: 'rgba(249,115,22,.08)',
  },
  {
    id: 'status',
    num: '06',
    rotulo: 'Status',
    paragrafoGuia:
      'Filtre **status do pedido** e combine com as demais dimensões do painel. Rascunho, Aberto, Em andamento e Consolidado podem ser marcados em conjunto.',
    descricaoPontos: ['Rascunho', 'Aberto', 'Em andamento', 'Consolidado'],
    obrigatorio: false,
    habilitaPassosPosteriores: [
      'Mapa só com pedidos no status escolhido',
      'Filtros cumulativos: use **Limpar** para restaurar tudo',
    ],
    icone: CircleDashed,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
]

export const ORDEM_AFFORDANCE_FILTROS_MAPA_PEDIDO: CampoFiltroMapaPedidoId[] = [
  'operacao',
  'origem',
  'destino',
  'exportador',
  'importador',
  'status',
]

export const MANUAL_PILARES_FILTROS_MAPA_PEDIDO_GUIA: Record<
  CampoFiltroMapaPedidoId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = Object.fromEntries(
  CAMPOS_FILTROS_MAPA_PEDIDO.map((campo) => [
    campo.id,
    { icone: campo.icone, cor: campo.cor, borda: campo.borda, fundo: campo.fundo },
  ]),
) as Record<CampoFiltroMapaPedidoId, { icone: Icon; cor: string; borda: string; fundo: string }>
