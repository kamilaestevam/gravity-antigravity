/**
 * select-lista-estimativa-custo.ts — Select Prisma + serialização da EstimativaCusto.
 * Mantém o payload da lista enxuto e converte Decimal → number no contrato público.
 */
import type { Prisma } from '@prisma/client'

export const selectListaEstimativaCusto = {
  id_estimativa_custo: true,
  numero_estimativa_custo: true,
  referencia_estimativa_custo: true,
  tipo_operacao_estimativa_custo: true,
  detalhe_operacao_estimativa_custo: true,
  status_estimativa_custo: true,
  ncm_estimativa_custo: true,
  descricao_ncm_estimativa_custo: true,
  incoterm_estimativa_custo: true,
  quantidade_estimativa_custo: true,
  moeda_produto_estimativa_custo: true,
  valor_produto_estimativa_custo: true,
  moeda_frete_estimativa_custo: true,
  valor_frete_estimativa_custo: true,
  moeda_seguro_estimativa_custo: true,
  valor_seguro_estimativa_custo: true,
  uf_desembaraco_estimativa_custo: true,
  ptax_utilizada_estimativa_custo: true,
  valor_aduaneiro_estimativa_custo: true,
  total_tributos_estimativa_custo: true,
  custo_nacionalizado_brl_estimativa_custo: true,
  fonte_calculo_estimativa_custo: true,
  id_usuario: true,
  data_criacao_estimativa_custo: true,
  data_atualizacao_estimativa_custo: true,
} satisfies Prisma.EstimativaCustoSelect

type Decimalish = { toNumber(): number } | number | null | undefined

function paraNumero(valor: Decimalish): number | null {
  if (valor === null || valor === undefined) return null
  return typeof valor === 'number' ? valor : valor.toNumber()
}

/** Serializa a linha Prisma para o contrato público (Decimal → number, Date → ISO). */
export function serializarEstimativaCusto(linha: Record<string, unknown>) {
  const e = linha as Record<string, never>
  return {
    id_estimativa_custo: e['id_estimativa_custo'] as string,
    numero_estimativa_custo: e['numero_estimativa_custo'] as string,
    referencia_estimativa_custo: (e['referencia_estimativa_custo'] ?? null) as string | null,
    tipo_operacao_estimativa_custo: e['tipo_operacao_estimativa_custo'] as string,
    detalhe_operacao_estimativa_custo: e['detalhe_operacao_estimativa_custo'] as string,
    status_estimativa_custo: e['status_estimativa_custo'] as string,
    ncm_estimativa_custo: e['ncm_estimativa_custo'] as string,
    descricao_ncm_estimativa_custo: (e['descricao_ncm_estimativa_custo'] ?? null) as string | null,
    incoterm_estimativa_custo: e['incoterm_estimativa_custo'] as string,
    quantidade_estimativa_custo: paraNumero(e['quantidade_estimativa_custo']),
    moeda_produto_estimativa_custo: e['moeda_produto_estimativa_custo'] as string,
    valor_produto_estimativa_custo: paraNumero(e['valor_produto_estimativa_custo']),
    moeda_frete_estimativa_custo: e['moeda_frete_estimativa_custo'] as string,
    valor_frete_estimativa_custo: paraNumero(e['valor_frete_estimativa_custo']),
    moeda_seguro_estimativa_custo: e['moeda_seguro_estimativa_custo'] as string,
    valor_seguro_estimativa_custo: paraNumero(e['valor_seguro_estimativa_custo']),
    uf_desembaraco_estimativa_custo: e['uf_desembaraco_estimativa_custo'] as string,
    ptax_utilizada_estimativa_custo: paraNumero(e['ptax_utilizada_estimativa_custo']),
    valor_aduaneiro_estimativa_custo: paraNumero(e['valor_aduaneiro_estimativa_custo']),
    total_tributos_estimativa_custo: paraNumero(e['total_tributos_estimativa_custo']),
    custo_nacionalizado_brl_estimativa_custo: paraNumero(e['custo_nacionalizado_brl_estimativa_custo']),
    fonte_calculo_estimativa_custo: (e['fonte_calculo_estimativa_custo'] ?? null) as string | null,
    id_usuario: (e['id_usuario'] ?? null) as string | null,
    data_criacao_estimativa_custo: (e['data_criacao_estimativa_custo'] as Date | undefined)?.toISOString() ?? null,
    data_atualizacao_estimativa_custo: (e['data_atualizacao_estimativa_custo'] as Date | undefined)?.toISOString() ?? null,
  }
}

export type EstimativaCustoSerializada = ReturnType<typeof serializarEstimativaCusto>
