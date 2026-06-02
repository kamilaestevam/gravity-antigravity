/**
 * Agregação server-side da Visão Geral (Insights) — evita transferir N pedidos completos
 * ao client quando o escopo multi-workspace é amplo.
 */

export const LIMITE_PEDIDOS_VISAO_GERAL_AGREGADO = 1000

export const ESCOPO_MINIMO_PARA_AGREGADO_SERVIDOR = 4

export interface PedidoVisaoGeralResumoInput {
  status: string
  valor_total_pedido: unknown
  tipo_operacao?: string | null
  incoterm?: string | null
  moeda_pedido?: string | null
  data_emissao_pedido: string
  data_prevista_pedido_pronto?: string | null
  data_meta_pedido_pronto?: string | null
  created_at?: string | null
  numero_pedido?: string | null
}

export interface VisaoGeralKpisResumo {
  andamento_count: number
  andamento_valor: number
  concluido_count: number
  concluido_valor: number
  valor_total: number
  ticket_medio: number
  taxa_atraso_pct: number
  atrasados_count: number
}

export interface VisaoGeralResumoAgregado {
  total: number
  kpis: VisaoGeralKpisResumo
  aprovacao: { percentual_em_tempo: number; percentual_atraso: number; nao_respondidas: number }
  mensal: Array<{ mes: string; aprovadas: number; andamento: number; recusadas: number }>
  modal: Array<{ key: string; label: string; count: number; pct: number; cor: string }>
  funil: Array<{ label: string; count: number; color: string }>
  incoterms: Array<{ incoterm: string; count: number; pct: number }>
  alertas: Array<{ tipo: string; count: number; cor: string }>
  moedas: Array<{ codigo: string; quantidade: number; pct: number }>
  sparkAndamento: number[]
  sparkConcluido: number[]
  maiorPedido: { numero: string; valor: number; moeda: string } | null
}

const BUCKET_CONCLUIDO = new Set(['aprovado', 'transferencia', 'consolidado'])
const BUCKET_CANCELADO = new Set(['cancelado'])
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const STATUS_CORES: Record<string, string> = {
  rascunho: '#94a3b8',
  aberto: '#f59e0b',
  em_andamento: '#fbbf24',
  aprovado: '#34d399',
  transferencia: '#818cf8',
  consolidado: '#a78bfa',
  cancelado: '#f87171',
}
const STATUS_ROTULO: Record<string, string> = {
  rascunho: 'Rascunho',
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  aprovado: 'Aprovado',
  transferencia: 'Transferido',
  consolidado: 'Consolidado',
  cancelado: 'Cancelado',
}
const ORDEM_STATUS = ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado']

function toNumero(valor: unknown): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function diasEntre(data: string | null | undefined, base: Date): number | null {
  if (!data) return null
  const d = new Date(data)
  if (Number.isNaN(d.getTime())) return null
  return Math.floor((d.getTime() - base.getTime()) / 86_400_000)
}

function estaAtrasado(p: PedidoVisaoGeralResumoInput, hoje: Date): boolean {
  if (BUCKET_CONCLUIDO.has(p.status) || BUCKET_CANCELADO.has(p.status)) return false
  const prevista = p.data_prevista_pedido_pronto ?? p.data_meta_pedido_pronto
  const dias = diasEntre(prevista, hoje)
  return dias !== null && dias < 0
}

export function agregarVisaoGeralResumo(
  pedidos: readonly PedidoVisaoGeralResumoInput[],
): VisaoGeralResumoAgregado {
  const hoje = new Date()
  const concluidos = pedidos.filter(p => BUCKET_CONCLUIDO.has(p.status))
  const andamento = pedidos.filter(
    p => !BUCKET_CONCLUIDO.has(p.status) && !BUCKET_CANCELADO.has(p.status),
  )
  const atrasados = pedidos.filter(p => estaAtrasado(p, hoje))

  const somaValor = (lista: readonly PedidoVisaoGeralResumoInput[]) =>
    lista.reduce((s, p) => s + toNumero(p.valor_total_pedido), 0)
  const valorTotal = somaValor(pedidos)

  const kpis: VisaoGeralKpisResumo = {
    andamento_count: andamento.length,
    andamento_valor: somaValor(andamento),
    concluido_count: concluidos.length,
    concluido_valor: somaValor(concluidos),
    valor_total: valorTotal,
    ticket_medio: pedidos.length > 0 ? valorTotal / pedidos.length : 0,
    taxa_atraso_pct: pedidos.length > 0 ? Math.round((atrasados.length / pedidos.length) * 100) : 0,
    atrasados_count: atrasados.length,
  }

  const pctEmTempo = pedidos.length > 0 ? Math.round((concluidos.length / pedidos.length) * 100) : 0
  const pctAtraso = pedidos.length > 0 ? Math.round((atrasados.length / pedidos.length) * 100) : 0

  const mensal: VisaoGeralResumoAgregado['mensal'] = []
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const chave = `${ref.getFullYear()}-${ref.getMonth()}`
    const doMes = pedidos.filter(p => {
      const d = new Date(p.data_emissao_pedido)
      return !Number.isNaN(d.getTime()) && `${d.getFullYear()}-${d.getMonth()}` === chave
    })
    mensal.push({
      mes: MESES[ref.getMonth()],
      aprovadas: doMes.filter(p => BUCKET_CONCLUIDO.has(p.status)).length,
      andamento: doMes.filter(
        p => !BUCKET_CONCLUIDO.has(p.status) && !BUCKET_CANCELADO.has(p.status),
      ).length,
      recusadas: doMes.filter(p => BUCKET_CANCELADO.has(p.status)).length,
    })
  }

  const impCount = pedidos.filter(p => p.tipo_operacao === 'importacao').length
  const expCount = pedidos.filter(p => p.tipo_operacao === 'exportacao').length
  const totalModal = impCount + expCount
  const modal = [
    {
      key: 'importacao',
      label: 'Importação',
      count: impCount,
      cor: '#f59e0b',
      pct: totalModal ? Math.round((impCount / totalModal) * 100) : 0,
    },
    {
      key: 'exportacao',
      label: 'Exportação',
      count: expCount,
      cor: '#fbbf24',
      pct: totalModal ? Math.round((expCount / totalModal) * 100) : 0,
    },
  ]

  const funil = ORDEM_STATUS.map(st => ({
    label: STATUS_ROTULO[st] ?? st,
    count: pedidos.filter(p => p.status === st).length,
    color: STATUS_CORES[st] ?? '#94a3b8',
  })).filter(f => f.count > 0)

  const incotermMap = new Map<string, number>()
  for (const p of pedidos) {
    const inc = (p.incoterm ?? '').trim().toUpperCase()
    if (!inc) continue
    incotermMap.set(inc, (incotermMap.get(inc) ?? 0) + 1)
  }
  const totalInc = [...incotermMap.values()].reduce((s, n) => s + n, 0)
  const incoterms = [...incotermMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([incoterm, count]) => ({
      incoterm,
      count,
      pct: totalInc ? Math.round((count / totalInc) * 100) : 0,
    }))

  const moedaMap = new Map<string, number>()
  for (const p of pedidos) {
    const m = (p.moeda_pedido ?? '').trim().toUpperCase() || 'BRL'
    moedaMap.set(m, (moedaMap.get(m) ?? 0) + 1)
  }
  const moedas = [...moedaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([codigo, quantidade]) => ({
      codigo,
      quantidade,
      pct: pedidos.length ? Math.round((quantidade / pedidos.length) * 100) : 0,
    }))

  const rascunhos = pedidos.filter(p => p.status === 'rascunho').length
  const vencendo7 = pedidos.filter(p => {
    const dias = diasEntre(p.data_prevista_pedido_pronto, hoje)
    return dias !== null && dias >= 0 && dias <= 7 && !BUCKET_CONCLUIDO.has(p.status)
  }).length
  const novos7 = pedidos.filter(p => {
    const dias = diasEntre(p.created_at, hoje)
    return dias !== null && dias >= -7 && dias <= 0
  }).length

  const alertas = [
    { tipo: 'atrasados', count: atrasados.length, cor: 'red' },
    { tipo: 'vencendo_7', count: vencendo7, cor: 'orange' },
    { tipo: 'rascunho', count: rascunhos, cor: 'yellow' },
    { tipo: 'novos_7', count: novos7, cor: 'green' },
  ]

  let maiorPedido: VisaoGeralResumoAgregado['maiorPedido'] = null
  for (const p of pedidos) {
    const v = toNumero(p.valor_total_pedido)
    if (!maiorPedido || v > maiorPedido.valor) {
      maiorPedido = {
        numero: p.numero_pedido ?? '—',
        valor: v,
        moeda: p.moeda_pedido ?? 'BRL',
      }
    }
  }

  return {
    total: pedidos.length,
    kpis,
    aprovacao: {
      percentual_em_tempo: pctEmTempo,
      percentual_atraso: pctAtraso,
      nao_respondidas: Math.max(0, 100 - pctEmTempo - pctAtraso),
    },
    mensal,
    modal,
    funil,
    incoterms,
    alertas,
    moedas,
    sparkAndamento: mensal.map(m => m.andamento),
    sparkConcluido: mensal.map(m => m.aprovadas),
    maiorPedido,
  }
}
