import { useMemo } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { useUnidades } from '../../../../../../nucleo-global/Modais/modal-tabela-unidades/src/useUnidades'

const TIPOS_UNIDADE_EMBALAGEM = new Set(['contagem', 'quantidade', 'embalagem', 'caixa'])

export function useOpcoesUnidadeEmbalagemBidFreteInternacional(): {
  opcoes: SelectOpcao[]
  loading: boolean
  erro: string | null
  rotuloPorCodigo: (codigo: string | null | undefined) => string
} {
  const { unidades, loading, erro } = useUnidades()

  const opcoes = useMemo(
    () =>
      unidades
        .filter((unidade) => unidade.ativo_unidade && TIPOS_UNIDADE_EMBALAGEM.has(unidade.tipo_unidade))
        .map((unidade) => ({
          valor: unidade.codigo_unidade,
          rotulo: `${unidade.nome_unidade} (${unidade.codigo_unidade})`,
        })),
    [unidades],
  )

  const rotulosPorCodigo = useMemo(
    () => new Map(opcoes.map((opcao) => [opcao.valor, opcao.rotulo])),
    [opcoes],
  )

  return {
    opcoes,
    loading,
    erro,
    rotuloPorCodigo: (codigo) => {
      if (!codigo?.trim()) return ''
      return rotulosPorCodigo.get(codigo) ?? codigo
    },
  }
}
