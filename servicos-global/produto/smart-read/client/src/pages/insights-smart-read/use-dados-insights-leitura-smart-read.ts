import { useCallback, useEffect, useState } from 'react'
import { smartReadApi } from '../../shared/api'
import { mensagemDeExcecao } from '../../shared/extrair-mensagem-erro-api'
import type { Leitura } from '../../shared/schemas'
import { useTransacoesLeituraSmartRead } from '../../shared/use-transacoes-leitura-smart-read'

export function useDadosInsightsLeituraSmartRead() {
  const lista = useTransacoesLeituraSmartRead()
  const [leiturasDetalhe, setLeiturasDetalhe] = useState<Leitura[]>([])
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false)

  const carregarDetalhes = useCallback(async () => {
    const ids = lista.transacoes
      .filter((t) => t.status_leitura === 'COMPLETED' || t.status_leitura === 'PROCESSING')
      .map((t) => t.id_leitura)

    if (ids.length === 0) {
      setLeiturasDetalhe([])
      return
    }

    setCarregandoDetalhe(true)
    try {
      const resultados = await Promise.allSettled(ids.map((id) => smartReadApi.obterLeitura(id)))
      const leituras: Leitura[] = []
      const falhas: string[] = []
      for (let i = 0; i < resultados.length; i++) {
        const resultado = resultados[i]
        if (resultado.status === 'fulfilled') {
          leituras.push(resultado.value)
        } else {
          falhas.push(ids[i])
        }
      }
      if (falhas.length > 0) {
        console.warn('[SmartRead Insights] detalhe indisponível para leituras', falhas)
      }
      setLeiturasDetalhe(leituras)
    } catch (exc) {
      setLeiturasDetalhe([])
      console.warn('[SmartRead Insights] falha ao carregar detalhes', mensagemDeExcecao(exc))
    } finally {
      setCarregandoDetalhe(false)
    }
  }, [lista.transacoes])

  useEffect(() => {
    if (lista.carregando) return
    void carregarDetalhes()
  }, [carregarDetalhes, lista.carregando])

  return {
    ...lista,
    leiturasDetalhe,
    carregando: lista.carregando || carregandoDetalhe,
    recarregarTudo: async () => {
      await lista.recarregar()
      await carregarDetalhes()
    },
  }
}
