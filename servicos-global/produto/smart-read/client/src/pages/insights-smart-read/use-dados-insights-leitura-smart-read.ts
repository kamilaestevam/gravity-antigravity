import { useCallback, useEffect, useState } from 'react'
import { smartReadApi } from '../../shared/api'
import {
  deveUsarMockListaSmartReadClient,
  obterLeituraMockSmartRead,
} from '../../shared/dados-mock-lista-smart-read'
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
      const resultados: Leitura[] = []
      for (const id of ids) {
        if (deveUsarMockListaSmartReadClient()) {
          const mock = obterLeituraMockSmartRead(id)
          if (mock) resultados.push(mock)
          continue
        }
        try {
          const leitura = await smartReadApi.obterLeitura(id)
          resultados.push(leitura)
        } catch {
          // ignora leitura individual — insights usa amostra parcial
        }
      }
      setLeiturasDetalhe(resultados)
    } catch (exc) {
      if (deveUsarMockListaSmartReadClient()) {
        setLeiturasDetalhe(
          ids
            .map((id) => obterLeituraMockSmartRead(id))
            .filter((item): item is Leitura => item != null),
        )
      } else {
        setLeiturasDetalhe([])
        console.warn('[SmartRead Insights] falha ao carregar detalhes', mensagemDeExcecao(exc))
      }
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
