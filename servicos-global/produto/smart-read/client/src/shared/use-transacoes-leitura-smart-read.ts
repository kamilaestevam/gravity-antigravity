import { useCallback, useEffect, useState } from 'react'
import { smartReadApi } from './api'
import { mensagemDeExcecao } from './extrair-mensagem-erro-api'
import type { OrigemLeitura, TransacaoLeitura } from './schemas'

export type SegmentoListaLeitura = 'envios' | 'transacoes-api'

export function origemLeituraDoSegmento(segmento: SegmentoListaLeitura): OrigemLeitura | undefined {
  if (segmento === 'transacoes-api') return 'API'
  return undefined
}

export function filtrarTransacoesPorSegmento(
  transacoes: TransacaoLeitura[],
  segmento: SegmentoListaLeitura,
): TransacaoLeitura[] {
  if (segmento === 'transacoes-api') {
    return transacoes.filter((item) => item.origem_leitura === 'API')
  }
  return transacoes
}

export function useTransacoesLeituraSmartRead(segmento: SegmentoListaLeitura = 'envios') {
  const [transacoes, setTransacoes] = useState<TransacaoLeitura[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [termoBusca, setTermoBusca] = useState('')
  const [termoAplicado, setTermoAplicado] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [metricaLeituras, setMetricaLeituras] = useState<number | null>(null)

  const origemLeitura = origemLeituraDoSegmento(segmento)

  useEffect(() => {
    setPagina(1)
  }, [segmento])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      const [lista, metrica] = await Promise.all([
        smartReadApi.listarTransacoes({
          pagina,
          limite: 50,
          termo_busca: termoAplicado || undefined,
          origem_leitura: origemLeitura,
        }),
        segmento === 'envios'
          ? smartReadApi.obterMetricaLeitura('readings').catch(() => null)
          : Promise.resolve(null),
      ])
      setTransacoes(lista.transacoes)
      setTotal(lista.paginacao.total)
      setMetricaLeituras(
        segmento === 'envios' ? (metrica?.valor ?? lista.paginacao.total) : lista.paginacao.total,
      )
    } catch (exc) {
      setErro(mensagemDeExcecao(exc))
      setTransacoes([])
      setTotal(0)
      setMetricaLeituras(null)
    } finally {
      setCarregando(false)
    }
  }, [pagina, termoAplicado, origemLeitura, segmento])

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
