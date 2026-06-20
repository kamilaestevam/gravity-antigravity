import type { StatusLeitura, TransacaoLeitura } from '../../shared/schemas'

export type MetricasInsightsLeituraSmartRead = {
  porStatus: Record<StatusLeitura, number>
  totalArquivos: number
  mediaAcertos: number | null
  taxaConclusao: number | null
  porOrigem: { api: number; interface: number }
  recentes: TransacaoLeitura[]
}

const STATUS_ORDEM: StatusLeitura[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

function calcularMediaAcertos(transacoes: TransacaoLeitura[]): number | null {
  const valores = transacoes
    .map((t) => t.media_acertos)
    .filter((v): v is number => v != null && Number.isFinite(v))
  if (valores.length === 0) return null
  return valores.reduce((acc, v) => acc + v, 0) / valores.length
}

export function calcularMetricasInsightsLeituraSmartRead(
  transacoes: TransacaoLeitura[],
): MetricasInsightsLeituraSmartRead {
  const porStatus = STATUS_ORDEM.reduce(
    (acc, status) => {
      acc[status] = transacoes.filter((t) => t.status_leitura === status).length
      return acc
    },
    {} as Record<StatusLeitura, number>,
  )

  const totalArquivos = transacoes.reduce((acc, t) => acc + t.total_arquivos, 0)
  const mediaAcertos = calcularMediaAcertos(transacoes)
  const amostra = transacoes.length
  const taxaConclusao =
    amostra > 0 ? porStatus.COMPLETED / amostra : null

  const porOrigem = transacoes.reduce(
    (acc, t) => {
      if (t.origem_leitura === 'API') acc.api += 1
      else acc.interface += 1
      return acc
    },
    { api: 0, interface: 0 },
  )

  const recentes = [...transacoes]
    .sort((a, b) => {
      const ta = a.data_envio ? Date.parse(a.data_envio) : 0
      const tb = b.data_envio ? Date.parse(b.data_envio) : 0
      return tb - ta
    })
    .slice(0, 5)

  return {
    porStatus,
    totalArquivos,
    mediaAcertos,
    taxaConclusao,
    porOrigem,
    recentes,
  }
}
