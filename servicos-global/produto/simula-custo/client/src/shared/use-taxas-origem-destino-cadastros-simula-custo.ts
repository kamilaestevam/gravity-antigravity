/**
 * Catálogo Cadastros.taxa_origem_destino via proxy do Simula Custo (SSOT).
 */
import { useEffect, useMemo, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { listarTaxasOrigemDestinoCadastroSimulaCusto } from './api'
import type { TaxaOrigemDestinoCadastro, TipoTaxaOrigemDestino } from './schemas-simula-custo'

function ehTaxaLegada(item: TaxaOrigemDestinoCadastro): boolean {
  if (item.legado_taxa_origem_destino === true) return true
  const codigo = (item.codigo_taxa_origem_destino ?? '').trim().toUpperCase()
  return codigo.startsWith('LEG_')
}

export function useTaxasOrigemDestinoCadastrosSimulaCusto(
  tipo: TipoTaxaOrigemDestino,
  ativo = true,
) {
  const [taxas, setTaxas] = useState<TaxaOrigemDestinoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!ativo) {
      setTaxas([])
      return
    }
    let cancelado = false
    setCarregando(true)
    setErro(null)
    void listarTaxasOrigemDestinoCadastroSimulaCusto({ tipo, limit: 500 })
      .then((itens) => {
        if (!cancelado) {
          setTaxas(itens.filter((t) => t.ativo_taxa_origem_destino !== false && !ehTaxaLegada(t)))
        }
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setTaxas([])
          setErro(e instanceof Error ? e.message : 'Erro ao carregar taxas')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => { cancelado = true }
  }, [tipo, ativo])

  const opcoes = useMemo((): SelectOpcao[] =>
    taxas.map((t) => ({
      valor: t.id_taxa_origem_destino,
      rotulo: t.nome_taxa_origem_destino,
    })),
  [taxas])

  return { taxas, opcoes, carregando, erro }
}

/** Inclui a taxa já salva na linha (edição) mesmo se sumiu do catálogo ativo. */
export function opcoesSelectTaxaSimulaCusto(
  opcoes: SelectOpcao[],
  linha?: { id_taxa_origem_destino?: string | null; nome: string },
): SelectOpcao[] {
  const idAtual = linha?.id_taxa_origem_destino
  if (!idAtual || opcoes.some((o) => o.valor === idAtual)) return opcoes
  return [
    { valor: idAtual, rotulo: linha?.nome?.trim() || idAtual },
    ...opcoes,
  ]
}
