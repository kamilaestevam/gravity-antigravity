/**
 * Opções de unidade de comprimento para dimensões de cubagem — SSOT Cadastros/unidade.
 */
import { useMemo } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { useUnidades } from '../../../../../../nucleo-global/Modais/modal-tabela-unidades/src/useUnidades'

export interface UseOpcoesUnidadeComprimentoCubagemBidFreteInternacionalResult {
  opcoes: SelectOpcao[]
  loading: boolean
  erro: string | null
  indisponivel: boolean
}

export function useOpcoesUnidadeComprimentoCubagemBidFreteInternacional(): UseOpcoesUnidadeComprimentoCubagemBidFreteInternacionalResult {
  const { unidades, loading, erro } = useUnidades()

  const opcoes = useMemo(
    () =>
      unidades
        .filter((u) => u.ativo_unidade && u.tipo_unidade === 'comprimento')
        .map(
          (u): SelectOpcao => ({
            valor: u.codigo_unidade,
            rotulo: `${u.nome_unidade} (${u.codigo_unidade})`,
          }),
        ),
    [unidades],
  )

  const indisponivel = !loading && (erro !== null || opcoes.length === 0)

  return { opcoes, loading, erro, indisponivel }
}
