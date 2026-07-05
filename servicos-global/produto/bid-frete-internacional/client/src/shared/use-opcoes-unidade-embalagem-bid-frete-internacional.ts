/**
 * Opções de tipo de volume/embalagem — SSOT Cadastros/unidade.
 */
import { useMemo } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { useUnidades } from '../../../../../../nucleo-global/Modais/modal-tabela-unidades/src/useUnidades'

const TIPOS_UNIDADE_EMBALAGEM = new Set(['contagem', 'quantidade', 'embalagem', 'caixa'])

export interface UseOpcoesUnidadeEmbalagemBidFreteInternacionalResult {
  opcoes: SelectOpcao[]
  loading: boolean
  erro: string | null
  indisponivel: boolean
}

export function useOpcoesUnidadeEmbalagemBidFreteInternacional(): UseOpcoesUnidadeEmbalagemBidFreteInternacionalResult {
  const { unidades, loading, erro } = useUnidades()

  const opcoes = useMemo(
    () =>
      unidades
        .filter((u) => u.ativo_unidade && TIPOS_UNIDADE_EMBALAGEM.has(u.tipo_unidade))
        .map(
          (u): SelectOpcao => ({
            valor: u.codigo_unidade,
            rotulo: `${u.nome_unidade} (${u.codigo_unidade})`,
            descricao: u.tipo_unidade,
          }),
        ),
    [unidades],
  )

  const indisponivel = !loading && (erro !== null || opcoes.length === 0)

  return { opcoes, loading, erro, indisponivel }
}
