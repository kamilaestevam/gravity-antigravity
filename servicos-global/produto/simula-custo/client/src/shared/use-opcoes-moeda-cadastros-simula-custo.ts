/**
 * Opções de moeda para SelectGlobal — SSOT `cadastros.moeda` via useMoedas (núcleo).
 * Paridade Bid Frete / Pedido.
 */
import { useMemo } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { useMoedas } from '@nucleo/modal-tabela-moeda'

export interface UseOpcoesMoedaCadastrosSimulaCustoResult {
  opcoes: SelectOpcao[]
  loading: boolean
  erro: string | null
  /** Erro ou catálogo vazio após o load — select deve ficar desabilitado. */
  indisponivel: boolean
}

export function useOpcoesMoedaCadastrosSimulaCusto(): UseOpcoesMoedaCadastrosSimulaCustoResult {
  const { moedas, loading, erro } = useMoedas()

  const opcoes = useMemo(
    () =>
      moedas
        .filter((m) => m.ativo_moeda)
        .map(
          (m): SelectOpcao => ({
            valor: m.codigo_moeda,
            rotulo: m.codigo_moeda,
            descricao: m.nome_moeda,
          }),
        ),
    [moedas],
  )

  const indisponivel = !loading && (erro !== null || opcoes.length === 0)

  return { opcoes, loading, erro, indisponivel }
}
