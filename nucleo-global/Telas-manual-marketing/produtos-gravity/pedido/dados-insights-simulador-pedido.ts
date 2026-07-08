import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'

export type LinhaTooltipKpiPedido = {
  rotulo: string
  valor: string
}

export type KpiStatusPedidoSimulador = {
  id: 'rascunho' | 'aberto' | 'andamento' | 'consolidado'
  titulo: string
  count: number
  valorAberto: number
  detalhe: string
  sub: string
  variante: 'padrao' | 'primario' | 'aviso' | 'sucesso'
}

export type RankingGlobalPedidoSimulador = {
  pos: number
  cidade: string
  pedidos: number
  pais: string
  codigo: string
}

export type AlertaPedidoSimulador = {
  rotulo: string
  valor: number
  descricao: string
  cor: 'red' | 'yellow' | 'green' | 'orange'
}

export type HudRankingPedidoSimulador = {
  rank: number
  flag: string
  name: string
  code: string
  count: number
}

export type HudModaisPedidoSimulador = {
  key: 'importacao' | 'exportacao'
  label: string
  count: number
  pct: number
}

export type FunilPedidoSimulador = {
  rotulo: string
  pct: number
  cor: string
  count: number
}

export type PedidoMesSimulador = {
  mes: string
  total: number
  aprovadas: number
  emAndamento: number
  recusadas: number
  destaque?: boolean
}

export type DistribuicaoOperacaoPedidoSimulador = {
  rotulo: string
  valor: number
  pct: number
  cor: string
}

export type MoedaPedidoSimulador = {
  moeda: string
  pedidos: number
  pct: number
}

export type IncotermPedidoSimulador = {
  codigo: string
  valor: number
  pct: number
}

export type TaxaAprovacaoPedidoSimulador = {
  emTempo: number
  atrasadas: number
  semResposta: number
}

export type InsightsPedidoEmpresaSimulador = {
  id: string
  totalPedidos: number
  kpis: KpiStatusPedidoSimulador[]
  rankings: Omit<RankingGlobalPedidoSimulador, 'pos'>[]
  alertas: AlertaPedidoSimulador[]
  funil: Omit<FunilPedidoSimulador, 'pct'>[]
  pedidosPorMes: Omit<PedidoMesSimulador, 'destaque'>[]
  distribuicaoOperacao: Omit<DistribuicaoOperacaoPedidoSimulador, 'pct'>[]
  moedas: Omit<MoedaPedidoSimulador, 'pct'>[]
  incoterms: Omit<IncotermPedidoSimulador, 'pct'>[]
  taxaAprovacao: TaxaAprovacaoPedidoSimulador
  maiorPedidoValor: string
  maiorPedidoChip: string
  hudOrigens: Omit<HudRankingPedidoSimulador, 'rank'>[]
  hudDestinos: Omit<HudRankingPedidoSimulador, 'rank'>[]
}

export type InsightsPedidoEscopoSimulador = {
  totalPedidos: number
  kpis: KpiStatusPedidoSimulador[]
  rankings: RankingGlobalPedidoSimulador[]
  alertas: AlertaPedidoSimulador[]
  funil: FunilPedidoSimulador[]
  pedidosPorMes: PedidoMesSimulador[]
  distribuicaoOperacao: DistribuicaoOperacaoPedidoSimulador[]
  moedas: MoedaPedidoSimulador[]
  incoterms: IncotermPedidoSimulador[]
  taxaAprovacao: TaxaAprovacaoPedidoSimulador
  maiorPedidoValor: string
  maiorPedidoChip: string
  hudOrigens: HudRankingPedidoSimulador[]
  hudDestinos: HudRankingPedidoSimulador[]
  hudModais: HudModaisPedidoSimulador[]
}

function fmtMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

const FLAG_POR_CODIGO: Record<string, string> = {
  AR: '🇦🇷',
  BR: '🇧🇷',
  CN: '🇨🇳',
  DE: '🇩🇪',
  FR: '🇫🇷',
  GB: '🇬🇧',
  IT: '🇮🇹',
  JP: '🇯🇵',
  NL: '🇳🇱',
  US: '🇺🇸',
}

function agregarHudRankings(
  perfis: InsightsPedidoEmpresaSimulador[],
  campo: 'hudOrigens' | 'hudDestinos',
): HudRankingPedidoSimulador[] {
  const map = new Map<string, Omit<HudRankingPedidoSimulador, 'rank'>>()
  for (const perfil of perfis) {
    for (const item of perfil[campo]) {
      const chave = `${item.code}|${item.name}`
      const atual = map.get(chave)
      if (!atual) {
        map.set(chave, { ...item })
        continue
      }
      map.set(chave, { ...atual, count: atual.count + item.count })
    }
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

function montarHudModais(distribuicao: DistribuicaoOperacaoPedidoSimulador[]): HudModaisPedidoSimulador[] {
  return distribuicao.map((item) => ({
    key: item.rotulo === 'Exportação' ? 'exportacao' : 'importacao',
    label: item.rotulo,
    count: item.valor,
    pct: item.pct,
  }))
}

function montarKpisEmpresa(
  counts: { rascunho: number; aberto: number; andamento: number; consolidado: number },
  ticketMedio: number,
): KpiStatusPedidoSimulador[] {
  const valorRascunho = counts.rascunho * ticketMedio * 1.05
  const valorAberto = counts.aberto * ticketMedio * 1.2
  const valorAndamento = counts.andamento * ticketMedio
  const valorConsolidado = counts.consolidado * ticketMedio * 0.9

  return [
    {
      id: 'rascunho',
      titulo: 'RASCUNHO',
      count: counts.rascunho,
      valorAberto: valorRascunho,
      detalhe: '+3 sem.',
      sub: `${fmtMoeda(valorRascunho)} em aberto`,
      variante: 'padrao',
    },
    {
      id: 'aberto',
      titulo: 'ABERTO',
      count: counts.aberto,
      valorAberto: valorAberto,
      detalhe: '+12% mês',
      sub: `${fmtMoeda(valorAberto)} total`,
      variante: 'primario',
    },
    {
      id: 'andamento',
      titulo: 'EM ANDAMENTO',
      count: counts.andamento,
      valorAberto: valorAndamento,
      detalhe: '+2.3pp',
      sub: `Ticket médio ${fmtMoeda(ticketMedio)}`,
      variante: 'aviso',
    },
    {
      id: 'consolidado',
      titulo: 'CONSOLIDADO',
      count: counts.consolidado,
      valorAberto: valorConsolidado,
      detalhe: '-0.8d',
      sub: `${fmtMoeda(valorConsolidado)} em aberto`,
      variante: 'sucesso',
    },
  ]
}

/** 500 pedidos no consolidado — distribuição fixa pseudoaleatória entre os 5 workspaces. */
export const INSIGHTS_PEDIDO_POR_EMPRESA_SIMULADOR: Record<string, InsightsPedidoEmpresaSimulador> = {
  'filial-sc-importador': {
    id: 'filial-sc-importador',
    totalPedidos: 127,
    kpis: montarKpisEmpresa({ rascunho: 117, aberto: 8, andamento: 1, consolidado: 1 }, 3180),
    rankings: [
      { cidade: 'Recife, BR', pedidos: 31, pais: 'Brasil', codigo: 'BR' },
      { cidade: 'Shenzhen, CN', pedidos: 14, pais: 'China', codigo: 'CN' },
      { cidade: 'Tóquio, JP', pedidos: 11, pais: 'Japão', codigo: 'JP' },
    ],
    alertas: [
      { rotulo: 'Pedidos atrasados', valor: 52, descricao: 'Pedidos com prazo vencido na Filial SC', cor: 'red' },
      { rotulo: 'Vencem em 7 dias', valor: 3, descricao: 'Pedidos com vencimento nos próximos 7 dias', cor: 'yellow' },
      { rotulo: 'Em rascunho', valor: 117, descricao: 'Pedidos ainda não publicados para operação', cor: 'orange' },
      { rotulo: 'Novos pedidos (7 dias)', valor: 9, descricao: 'Pedidos criados na última semana', cor: 'green' },
    ],
    funil: [
      { rotulo: 'Rascunho', cor: '#94a3b8', count: 117 },
      { rotulo: 'Aberto', cor: '#818cf8', count: 8 },
      { rotulo: 'Em Andamento', cor: '#fbbf24', count: 1 },
      { rotulo: 'Transferido', cor: '#34d399', count: 1 },
    ],
    pedidosPorMes: [
      { mes: 'Fev', total: 10, aprovadas: 4, emAndamento: 3, recusadas: 3 },
      { mes: 'Mar', total: 10, aprovadas: 5, emAndamento: 3, recusadas: 2 },
      { mes: 'Abr', total: 11, aprovadas: 5, emAndamento: 4, recusadas: 2 },
      { mes: 'Mai', total: 12, aprovadas: 6, emAndamento: 4, recusadas: 2 },
      { mes: 'Jun', total: 14, aprovadas: 4, emAndamento: 8, recusadas: 2 },
      { mes: 'Jul', total: 10, aprovadas: 5, emAndamento: 4, recusadas: 1 },
    ],
    distribuicaoOperacao: [
      { rotulo: 'Importação', valor: 98, cor: '#f97316' },
      { rotulo: 'Exportação', valor: 29, cor: '#fbbf24' },
    ],
    moedas: [
      { moeda: 'USD', pedidos: 28 },
      { moeda: 'BRL', pedidos: 24 },
      { moeda: 'EUR', pedidos: 19 },
      { moeda: 'CNY', pedidos: 18 },
    ],
    incoterms: [
      { codigo: 'DAP', valor: 22 },
      { codigo: 'CIF', valor: 16 },
      { codigo: 'FOB', valor: 14 },
    ],
    taxaAprovacao: { emTempo: 2, atrasadas: 84, semResposta: 14 },
    maiorPedidoValor: 'USD 420.000',
    maiorPedidoChip: '2 ITENS TRANSFERIDOS',
    hudOrigens: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Recife', code: 'BR', count: 31 },
      { flag: FLAG_POR_CODIGO.CN, name: 'Shenzhen', code: 'CN', count: 14 },
      { flag: FLAG_POR_CODIGO.JP, name: 'Tóquio', code: 'JP', count: 11 },
    ],
    hudDestinos: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Santos', code: 'BR', count: 24 },
      { flag: FLAG_POR_CODIGO.NL, name: 'Rotterdam', code: 'NL', count: 16 },
      { flag: FLAG_POR_CODIGO.US, name: 'Los Angeles', code: 'US', count: 12 },
    ],
  },
  'matriz-sp-importador': {
    id: 'matriz-sp-importador',
    totalPedidos: 103,
    kpis: montarKpisEmpresa({ rascunho: 94, aberto: 7, andamento: 1, consolidado: 1 }, 3420),
    rankings: [
      { cidade: 'São Paulo, BR', pedidos: 24, pais: 'Brasil', codigo: 'BR' },
      { cidade: 'Londres, GB', pedidos: 12, pais: 'Reino Unido', codigo: 'GB' },
      { cidade: 'Rotterdam, NL', pedidos: 10, pais: 'Holanda', codigo: 'NL' },
    ],
    alertas: [
      { rotulo: 'Pedidos atrasados', valor: 41, descricao: 'Pedidos com prazo vencido na Matriz SP', cor: 'red' },
      { rotulo: 'Vencem em 7 dias', valor: 2, descricao: 'Pedidos com vencimento nos próximos 7 dias', cor: 'yellow' },
      { rotulo: 'Em rascunho', valor: 94, descricao: 'Pedidos ainda não publicados para operação', cor: 'orange' },
      { rotulo: 'Novos pedidos (7 dias)', valor: 7, descricao: 'Pedidos criados na última semana', cor: 'green' },
    ],
    funil: [
      { rotulo: 'Rascunho', cor: '#94a3b8', count: 94 },
      { rotulo: 'Aberto', cor: '#818cf8', count: 7 },
      { rotulo: 'Em Andamento', cor: '#fbbf24', count: 1 },
      { rotulo: 'Transferido', cor: '#34d399', count: 1 },
    ],
    pedidosPorMes: [
      { mes: 'Fev', total: 8, aprovadas: 4, emAndamento: 2, recusadas: 2 },
      { mes: 'Mar', total: 9, aprovadas: 4, emAndamento: 3, recusadas: 2 },
      { mes: 'Abr', total: 9, aprovadas: 4, emAndamento: 3, recusadas: 2 },
      { mes: 'Mai', total: 10, aprovadas: 5, emAndamento: 3, recusadas: 2 },
      { mes: 'Jun', total: 11, aprovadas: 3, emAndamento: 6, recusadas: 2 },
      { mes: 'Jul', total: 9, aprovadas: 4, emAndamento: 4, recusadas: 1 },
    ],
    distribuicaoOperacao: [
      { rotulo: 'Importação', valor: 81, cor: '#f97316' },
      { rotulo: 'Exportação', valor: 22, cor: '#fbbf24' },
    ],
    moedas: [
      { moeda: 'GBP', pedidos: 22 },
      { moeda: 'USD', pedidos: 19 },
      { moeda: 'EUR', pedidos: 16 },
    ],
    incoterms: [
      { codigo: 'CIF', valor: 18 },
      { codigo: 'EXW', valor: 14 },
      { codigo: 'DAP', valor: 12 },
    ],
    taxaAprovacao: { emTempo: 1, atrasadas: 86, semResposta: 13 },
    maiorPedidoValor: 'GBP 199.800',
    maiorPedidoChip: '3 ITENS TRANSFERIDOS',
    hudOrigens: [
      { flag: FLAG_POR_CODIGO.BR, name: 'São Paulo', code: 'BR', count: 24 },
      { flag: FLAG_POR_CODIGO.GB, name: 'Londres', code: 'GB', count: 12 },
      { flag: FLAG_POR_CODIGO.NL, name: 'Rotterdam', code: 'NL', count: 10 },
    ],
    hudDestinos: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Santos', code: 'BR', count: 18 },
      { flag: FLAG_POR_CODIGO.DE, name: 'Hamburgo', code: 'DE', count: 14 },
      { flag: FLAG_POR_CODIGO.FR, name: 'Le Havre', code: 'FR', count: 9 },
    ],
  },
  'filial-pr-exportador': {
    id: 'filial-pr-exportador',
    totalPedidos: 89,
    kpis: montarKpisEmpresa({ rascunho: 81, aberto: 6, andamento: 1, consolidado: 1 }, 2950),
    rankings: [
      { cidade: 'Paranaguá, BR', pedidos: 19, pais: 'Brasil', codigo: 'BR' },
      { cidade: 'Detroit, US', pedidos: 11, pais: 'Estados Unidos', codigo: 'US' },
      { cidade: 'Buenos Aires, AR', pedidos: 9, pais: 'Argentina', codigo: 'AR' },
    ],
    alertas: [
      { rotulo: 'Pedidos atrasados', valor: 36, descricao: 'Pedidos com prazo vencido na Filial PR', cor: 'red' },
      { rotulo: 'Vencem em 7 dias', valor: 1, descricao: 'Pedidos com vencimento nos próximos 7 dias', cor: 'yellow' },
      { rotulo: 'Em rascunho', valor: 81, descricao: 'Pedidos ainda não publicados para operação', cor: 'orange' },
      { rotulo: 'Novos pedidos (7 dias)', valor: 6, descricao: 'Pedidos criados na última semana', cor: 'green' },
    ],
    funil: [
      { rotulo: 'Rascunho', cor: '#94a3b8', count: 81 },
      { rotulo: 'Aberto', cor: '#818cf8', count: 6 },
      { rotulo: 'Em Andamento', cor: '#fbbf24', count: 1 },
      { rotulo: 'Transferido', cor: '#34d399', count: 1 },
    ],
    pedidosPorMes: [
      { mes: 'Fev', total: 7, aprovadas: 3, emAndamento: 2, recusadas: 2 },
      { mes: 'Mar', total: 7, aprovadas: 3, emAndamento: 2, recusadas: 2 },
      { mes: 'Abr', total: 8, aprovadas: 3, emAndamento: 3, recusadas: 2 },
      { mes: 'Mai', total: 8, aprovadas: 4, emAndamento: 2, recusadas: 2 },
      { mes: 'Jun', total: 9, aprovadas: 3, emAndamento: 5, recusadas: 1 },
      { mes: 'Jul', total: 8, aprovadas: 4, emAndamento: 3, recusadas: 1 },
    ],
    distribuicaoOperacao: [
      { rotulo: 'Exportação', valor: 52, cor: '#fbbf24' },
      { rotulo: 'Importação', valor: 37, cor: '#f97316' },
    ],
    moedas: [
      { moeda: 'USD', pedidos: 18 },
      { moeda: 'BRL', pedidos: 15 },
      { moeda: 'EUR', pedidos: 12 },
    ],
    incoterms: [
      { codigo: 'FOB', valor: 16 },
      { codigo: 'CPT', valor: 11 },
      { codigo: 'EXW', valor: 9 },
    ],
    taxaAprovacao: { emTempo: 1, atrasadas: 89, semResposta: 10 },
    maiorPedidoValor: 'USD 310.000',
    maiorPedidoChip: '1 ITEM TRANSFERIDO',
    hudOrigens: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Paranaguá', code: 'BR', count: 19 },
      { flag: FLAG_POR_CODIGO.US, name: 'Detroit', code: 'US', count: 11 },
      { flag: FLAG_POR_CODIGO.AR, name: 'Buenos Aires', code: 'AR', count: 9 },
    ],
    hudDestinos: [
      { flag: FLAG_POR_CODIGO.US, name: 'Miami', code: 'US', count: 15 },
      { flag: FLAG_POR_CODIGO.BR, name: 'Santos', code: 'BR', count: 12 },
      { flag: FLAG_POR_CODIGO.AR, name: 'Rosario', code: 'AR', count: 8 },
    ],
  },
  'importador-ltda': {
    id: 'importador-ltda',
    totalPedidos: 118,
    kpis: montarKpisEmpresa({ rascunho: 109, aberto: 7, andamento: 1, consolidado: 1 }, 3280),
    rankings: [
      { cidade: 'Recife, BR', pedidos: 20, pais: 'Brasil', codigo: 'BR' },
      { cidade: 'Paris, FR', pedidos: 13, pais: 'França', codigo: 'FR' },
      { cidade: 'Hamburgo, DE', pedidos: 11, pais: 'Alemanha', codigo: 'DE' },
    ],
    alertas: [
      { rotulo: 'Pedidos atrasados', valor: 48, descricao: 'Pedidos com prazo vencido no Importador Ltda', cor: 'red' },
      { rotulo: 'Vencem em 7 dias', valor: 2, descricao: 'Pedidos com vencimento nos próximos 7 dias', cor: 'yellow' },
      { rotulo: 'Em rascunho', valor: 109, descricao: 'Pedidos ainda não publicados para operação', cor: 'orange' },
      { rotulo: 'Novos pedidos (7 dias)', valor: 8, descricao: 'Pedidos criados na última semana', cor: 'green' },
    ],
    funil: [
      { rotulo: 'Rascunho', cor: '#94a3b8', count: 109 },
      { rotulo: 'Aberto', cor: '#818cf8', count: 7 },
      { rotulo: 'Em Andamento', cor: '#fbbf24', count: 1 },
      { rotulo: 'Transferido', cor: '#34d399', count: 1 },
    ],
    pedidosPorMes: [
      { mes: 'Fev', total: 9, aprovadas: 4, emAndamento: 3, recusadas: 2 },
      { mes: 'Mar', total: 10, aprovadas: 5, emAndamento: 3, recusadas: 2 },
      { mes: 'Abr', total: 10, aprovadas: 5, emAndamento: 3, recusadas: 2 },
      { mes: 'Mai', total: 11, aprovadas: 5, emAndamento: 4, recusadas: 2 },
      { mes: 'Jun', total: 12, aprovadas: 4, emAndamento: 6, recusadas: 2 },
      { mes: 'Jul', total: 11, aprovadas: 5, emAndamento: 4, recusadas: 2 },
    ],
    distribuicaoOperacao: [
      { rotulo: 'Importação', valor: 91, cor: '#f97316' },
      { rotulo: 'Exportação', valor: 27, cor: '#fbbf24' },
    ],
    moedas: [
      { moeda: 'EUR', pedidos: 24 },
      { moeda: 'GBP', pedidos: 21 },
      { moeda: 'USD', pedidos: 19 },
    ],
    incoterms: [
      { codigo: 'DAP', valor: 20 },
      { codigo: 'CPT', valor: 14 },
      { codigo: 'CIF', valor: 12 },
    ],
    taxaAprovacao: { emTempo: 1, atrasadas: 87, semResposta: 12 },
    maiorPedidoValor: 'EUR 180.000',
    maiorPedidoChip: '2 ITENS TRANSFERIDOS',
    hudOrigens: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Recife', code: 'BR', count: 20 },
      { flag: FLAG_POR_CODIGO.FR, name: 'Paris', code: 'FR', count: 13 },
      { flag: FLAG_POR_CODIGO.DE, name: 'Hamburgo', code: 'DE', count: 11 },
    ],
    hudDestinos: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Santos', code: 'BR', count: 22 },
      { flag: FLAG_POR_CODIGO.FR, name: 'Le Havre', code: 'FR', count: 16 },
      { flag: FLAG_POR_CODIGO.DE, name: 'Bremerhaven', code: 'DE', count: 11 },
    ],
  },
  'exportador-ltda': {
    id: 'exportador-ltda',
    totalPedidos: 63,
    kpis: montarKpisEmpresa({ rascunho: 59, aberto: 3, andamento: 0, consolidado: 1 }, 2760),
    rankings: [
      { cidade: 'Santos, BR', pedidos: 14, pais: 'Brasil', codigo: 'BR' },
      { cidade: 'Paris, FR', pedidos: 9, pais: 'França', codigo: 'FR' },
      { cidade: 'Milão, IT', pedidos: 8, pais: 'Itália', codigo: 'IT' },
    ],
    alertas: [
      { rotulo: 'Pedidos atrasados', valor: 20, descricao: 'Pedidos com prazo vencido no Exportador Ltda', cor: 'red' },
      { rotulo: 'Vencem em 7 dias', valor: 0, descricao: 'Pedidos com vencimento nos próximos 7 dias', cor: 'yellow' },
      { rotulo: 'Em rascunho', valor: 59, descricao: 'Pedidos ainda não publicados para operação', cor: 'orange' },
      { rotulo: 'Novos pedidos (7 dias)', valor: 4, descricao: 'Pedidos criados na última semana', cor: 'green' },
    ],
    funil: [
      { rotulo: 'Rascunho', cor: '#94a3b8', count: 59 },
      { rotulo: 'Aberto', cor: '#818cf8', count: 3 },
      { rotulo: 'Em Andamento', cor: '#fbbf24', count: 0 },
      { rotulo: 'Transferido', cor: '#34d399', count: 1 },
    ],
    pedidosPorMes: [
      { mes: 'Fev', total: 6, aprovadas: 3, emAndamento: 2, recusadas: 1 },
      { mes: 'Mar', total: 6, aprovadas: 3, emAndamento: 2, recusadas: 1 },
      { mes: 'Abr', total: 6, aprovadas: 3, emAndamento: 2, recusadas: 1 },
      { mes: 'Mai', total: 5, aprovadas: 2, emAndamento: 2, recusadas: 1 },
      { mes: 'Jun', total: 6, aprovadas: 2, emAndamento: 3, recusadas: 1 },
      { mes: 'Jul', total: 6, aprovadas: 3, emAndamento: 2, recusadas: 1 },
    ],
    distribuicaoOperacao: [
      { rotulo: 'Exportação', valor: 41, cor: '#fbbf24' },
      { rotulo: 'Importação', valor: 22, cor: '#f97316' },
    ],
    moedas: [
      { moeda: 'GBP', pedidos: 14 },
      { moeda: 'EUR', pedidos: 12 },
      { moeda: 'USD', pedidos: 10 },
    ],
    incoterms: [
      { codigo: 'FOB', valor: 12 },
      { codigo: 'EXW', valor: 9 },
      { codigo: 'DAP', valor: 8 },
    ],
    taxaAprovacao: { emTempo: 0, atrasadas: 91, semResposta: 9 },
    maiorPedidoValor: 'GBP 142.500',
    maiorPedidoChip: '1 ITEM TRANSFERIDO',
    hudOrigens: [
      { flag: FLAG_POR_CODIGO.BR, name: 'Santos', code: 'BR', count: 14 },
      { flag: FLAG_POR_CODIGO.FR, name: 'Paris', code: 'FR', count: 9 },
      { flag: FLAG_POR_CODIGO.IT, name: 'Milão', code: 'IT', count: 8 },
    ],
    hudDestinos: [
      { flag: FLAG_POR_CODIGO.FR, name: 'Marseille', code: 'FR', count: 11 },
      { flag: FLAG_POR_CODIGO.GB, name: 'Felixstowe', code: 'GB', count: 9 },
      { flag: FLAG_POR_CODIGO.IT, name: 'Gênova', code: 'IT', count: 7 },
    ],
  },
}

function recalcPct<T extends { valor: number }>(itens: T[], total: number): (T & { pct: number })[] {
  return itens.map((item) => ({
    ...item,
    pct: total > 0 ? Math.round((item.valor / total) * 100) : 0,
  }))
}

function recalcPctMoedas(itens: Omit<MoedaPedidoSimulador, 'pct'>[], total: number): MoedaPedidoSimulador[] {
  return itens.map((item) => ({
    ...item,
    pct: total > 0 ? Math.round((item.pedidos / total) * 100) : 0,
  }))
}

function recalcPctIncoterms(itens: Omit<IncotermPedidoSimulador, 'pct'>[], total: number): IncotermPedidoSimulador[] {
  return itens.map((item) => ({
    ...item,
    pct: total > 0 ? Math.round((item.valor / total) * 100) : 0,
  }))
}

export function agregarInsightsPedidosEmpresasSimulador(
  empresas: PerfilEmpresaSimulador[],
): InsightsPedidoEscopoSimulador {
  const perfis = empresas
    .map((empresa) => INSIGHTS_PEDIDO_POR_EMPRESA_SIMULADOR[empresa.id])
    .filter((perfil): perfil is InsightsPedidoEmpresaSimulador => Boolean(perfil))

  if (perfis.length === 0) {
    const fallback = INSIGHTS_PEDIDO_POR_EMPRESA_SIMULADOR['filial-sc-importador']
    return agregarInsightsPedidosEmpresasSimulador([{ id: fallback.id } as PerfilEmpresaSimulador])
  }

  const totalPedidos = perfis.reduce((s, p) => s + p.totalPedidos, 0)

  const kpiMap = new Map<KpiStatusPedidoSimulador['id'], KpiStatusPedidoSimulador>()
  for (const perfil of perfis) {
    for (const kpi of perfil.kpis) {
      const atual = kpiMap.get(kpi.id)
      if (!atual) {
        kpiMap.set(kpi.id, { ...kpi })
        continue
      }
      kpiMap.set(kpi.id, {
        ...atual,
        count: atual.count + kpi.count,
        valorAberto: atual.valorAberto + kpi.valorAberto,
      })
    }
  }
  const kpis = [...kpiMap.values()].map((kpi) => {
    let sub = kpi.sub
    if (kpi.id === 'andamento') {
      sub = `Ticket médio ${fmtMoeda(kpi.valorAberto / Math.max(1, kpi.count))}`
    } else if (kpi.id === 'rascunho' || kpi.id === 'consolidado') {
      sub = `${fmtMoeda(kpi.valorAberto)} em aberto`
    } else if (kpi.id === 'aberto') {
      sub = `${fmtMoeda(kpi.valorAberto)} total`
    }
    return { ...kpi, sub }
  })

  const rankingMap = new Map<string, Omit<RankingGlobalPedidoSimulador, 'pos'>>()
  for (const perfil of perfis) {
    for (const item of perfil.rankings) {
      const atual = rankingMap.get(item.cidade)
      if (!atual) {
        rankingMap.set(item.cidade, { ...item })
        continue
      }
      rankingMap.set(item.cidade, { ...atual, pedidos: atual.pedidos + item.pedidos })
    }
  }
  const rankings = [...rankingMap.values()]
    .sort((a, b) => b.pedidos - a.pedidos)
    .slice(0, 6)
    .map((item, index) => ({ ...item, pos: index + 1 }))

  const alertaMap = new Map<string, AlertaPedidoSimulador>()
  for (const perfil of perfis) {
    for (const alerta of perfil.alertas) {
      const atual = alertaMap.get(alerta.rotulo)
      if (!atual) {
        alertaMap.set(alerta.rotulo, { ...alerta })
        continue
      }
      alertaMap.set(alerta.rotulo, {
        ...atual,
        valor: atual.valor + alerta.valor,
        descricao:
          perfis.length > 1
            ? 'Pedidos no escopo consolidado selecionado'
            : atual.descricao,
      })
    }
  }
  const alertas = [...alertaMap.values()]

  const funilMap = new Map<string, Omit<FunilPedidoSimulador, 'pct'>>()
  for (const perfil of perfis) {
    for (const item of perfil.funil) {
      const atual = funilMap.get(item.rotulo)
      if (!atual) {
        funilMap.set(item.rotulo, { ...item })
        continue
      }
      funilMap.set(item.rotulo, { ...atual, count: atual.count + item.count })
    }
  }
  const funilTotal = [...funilMap.values()].reduce((s, f) => s + f.count, 0)
  const funil: FunilPedidoSimulador[] = [...funilMap.values()].map((item) => ({
    ...item,
    pct: funilTotal > 0 ? Math.round((item.count / funilTotal) * 100) : 0,
  }))

  const mesMap = new Map<string, Omit<PedidoMesSimulador, 'destaque'>>()
  for (const perfil of perfis) {
    for (const mes of perfil.pedidosPorMes) {
      const atual = mesMap.get(mes.mes)
      if (!atual) {
        mesMap.set(mes.mes, { ...mes })
        continue
      }
      mesMap.set(mes.mes, {
        mes: mes.mes,
        total: atual.total + mes.total,
        aprovadas: atual.aprovadas + mes.aprovadas,
        emAndamento: atual.emAndamento + mes.emAndamento,
        recusadas: atual.recusadas + mes.recusadas,
      })
    }
  }
  const ordemMeses = ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']
  const maxMesTotal = Math.max(...[...mesMap.values()].map((m) => m.total), 1)
  const pedidosPorMes: PedidoMesSimulador[] = ordemMeses
    .filter((mes) => mesMap.has(mes))
    .map((mes) => {
      const item = mesMap.get(mes)!
      return {
        ...item,
        destaque: item.total === maxMesTotal,
      }
    })

  const operacaoMap = new Map<string, Omit<DistribuicaoOperacaoPedidoSimulador, 'pct'>>()
  for (const perfil of perfis) {
    for (const item of perfil.distribuicaoOperacao) {
      const atual = operacaoMap.get(item.rotulo)
      if (!atual) {
        operacaoMap.set(item.rotulo, { ...item })
        continue
      }
      operacaoMap.set(item.rotulo, { ...atual, valor: atual.valor + item.valor })
    }
  }
  const operacaoTotal = [...operacaoMap.values()].reduce((s, o) => s + o.valor, 0)
  const distribuicaoOperacao = recalcPct([...operacaoMap.values()], operacaoTotal)

  const moedaMap = new Map<string, Omit<MoedaPedidoSimulador, 'pct'>>()
  for (const perfil of perfis) {
    for (const item of perfil.moedas) {
      const atual = moedaMap.get(item.moeda)
      if (!atual) {
        moedaMap.set(item.moeda, { ...item })
        continue
      }
      moedaMap.set(item.moeda, { ...atual, pedidos: atual.pedidos + item.pedidos })
    }
  }
  const moedaTotal = [...moedaMap.values()].reduce((s, m) => s + m.pedidos, 0)
  const moedas = recalcPctMoedas(
    [...moedaMap.values()].sort((a, b) => b.pedidos - a.pedidos),
    moedaTotal,
  )

  const incotermMap = new Map<string, Omit<IncotermPedidoSimulador, 'pct'>>()
  for (const perfil of perfis) {
    for (const item of perfil.incoterms) {
      const atual = incotermMap.get(item.codigo)
      if (!atual) {
        incotermMap.set(item.codigo, { ...item })
        continue
      }
      incotermMap.set(item.codigo, { ...atual, valor: atual.valor + item.valor })
    }
  }
  const incotermTotal = [...incotermMap.values()].reduce((s, i) => s + i.valor, 0)
  const incoterms = recalcPctIncoterms(
    [...incotermMap.values()].sort((a, b) => b.valor - a.valor).slice(0, 5),
    incotermTotal,
  )

  const pesoTotal = perfis.reduce((s, p) => s + p.totalPedidos, 0)
  const taxaAprovacao: TaxaAprovacaoPedidoSimulador = perfis.reduce(
    (acc, perfil) => {
      const peso = perfil.totalPedidos / pesoTotal
      return {
        emTempo: Math.round(acc.emTempo + perfil.taxaAprovacao.emTempo * peso),
        atrasadas: Math.round(acc.atrasadas + perfil.taxaAprovacao.atrasadas * peso),
        semResposta: Math.round(acc.semResposta + perfil.taxaAprovacao.semResposta * peso),
      }
    },
    { emTempo: 0, atrasadas: 0, semResposta: 0 },
  )

  const maiorPerfil = [...perfis].sort((a, b) => b.totalPedidos - a.totalPedidos)[0]
  const hudOrigens = agregarHudRankings(perfis, 'hudOrigens')
  const hudDestinos = agregarHudRankings(perfis, 'hudDestinos')
  const hudModais = montarHudModais(distribuicaoOperacao)

  return {
    totalPedidos,
    kpis,
    rankings,
    alertas,
    funil,
    pedidosPorMes,
    distribuicaoOperacao,
    moedas,
    incoterms,
    taxaAprovacao,
    maiorPedidoValor: maiorPerfil.maiorPedidoValor,
    maiorPedidoChip: maiorPerfil.maiorPedidoChip,
    hudOrigens,
    hudDestinos,
    hudModais,
  }
}

export function montarLinhasTooltipKpiPedido(kpi: KpiStatusPedidoSimulador, totalPedidos: number): LinhaTooltipKpiPedido[] {
  const funilPct = totalPedidos > 0 ? Math.round((kpi.count / totalPedidos) * 100) : 0
  return [
    { rotulo: `Pedidos ${kpi.titulo.toLowerCase()}`, valor: String(kpi.count) },
    {
      rotulo: kpi.id === 'andamento' ? 'Ticket médio' : 'Valor em aberto',
      valor: kpi.id === 'andamento' ? fmtMoeda(kpi.valorAberto / Math.max(1, kpi.count)) : fmtMoeda(kpi.valorAberto),
    },
    { rotulo: 'Tendência', valor: kpi.detalhe },
    { rotulo: 'Share do funil', valor: `${funilPct}%` },
  ]
}
