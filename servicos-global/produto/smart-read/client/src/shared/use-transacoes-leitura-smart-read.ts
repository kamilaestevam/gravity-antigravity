import { useCallback, useEffect, useState } from 'react'
import { smartReadApi } from './api'
import { mensagemDeExcecao } from './extrair-mensagem-erro-api'
import type { TransacaoLeitura } from './schemas'

export type SegmentoListaLeitura = 'envios' | 'transacoes-api'

export function filtrarTransacoesPorSegmento(
  transacoes: TransacaoLeitura[],
  segmento: SegmentoListaLeitura,
): TransacaoLeitura[] {
  if (segmento === 'transacoes-api') {
    return transacoes.filter((item) => item.origem_leitura === 'API')
  }
  return transacoes
}

export function useTransacoesLeituraSmartRead() {
  const [transacoes, setTransacoes] = useState<TransacaoLeitura[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [termoBusca, setTermoBusca] = useState('')
  const [termoAplicado, setTermoAplicado] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [metricaLeituras, setMetricaLeituras] = useState<number | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      const [lista, metrica] = await Promise.all([
        smartReadApi.listarTransacoes({
          pagina,
          limite: 50,
          termo_busca: termoAplicado || undefined,
        }),
        smartReadApi.obterMetricaLeitura('readings').catch(() => null),
      ])
      setTransacoes(lista.transacoes)
      setTotal(lista.paginacao.total)
      setMetricaLeituras(metrica?.valor ?? lista.paginacao.total)
    } catch (exc) {
      setErro(mensagemDeExcecao(exc))
      setTransacoes([])
      setTotal(0)
      setMetricaLeituras(null)
    } finally {
      setCarregando(false)
    }
  }, [pagina, termoAplicado])

  useEffect(() => {
    void carregar()
  }, [carregar])

  function aplicarBusca(termo: string) {
    setPagina(1)
    setTermoAplicado(termo.trim())
  }

  return {
    transacoes,
    total,
    pagina,
    setPagina,
    termoBusca,
    setTermoBusca,
    termoAplicado,
    aplicarBusca,
    carregando,
    erro,
    metricaLeituras,
    recarregar: carregar,
  }
}
