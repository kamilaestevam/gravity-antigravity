/**
 * Opções de moeda para SelectGlobal — SSOT `cadastros.moeda` via `/api/v1/cadastros/moedas`.
 * Mesmo contrato do Pedido (useMoedas + rotulo/descricao no dropdown buscável).
 */
import { useMemo } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { useMoedas } from '../../../../../../nucleo-global/Modais/modal-tabela-moeda/src/useMoedas'

export interface UseOpcoesMoedaCadastrosBidFreteInternacionalResult {
  opcoes: SelectOpcao[]
  loading: boolean
  erro: string | null
  /** Erro de rede/Zod ou catálogo vazio após o load — select deve ficar desabilitado. */
  indisponivel: boolean
}

export function useOpcoesMoedaCadastrosBidFreteInternacional(): UseOpcoesMoedaCadastrosBidFreteInternacionalResult {
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
