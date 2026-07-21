/**
 * select-lista-simula-custo.ts — Select Prisma + serialização da SimulaCusto.
 * Mantém o payload da lista enxuto e converte Decimal → number no contrato público.
 */
import type { Prisma } from '@prisma/client'

export const selectListaSimulaCusto = {
  id_simula_custo: true,
  numero_simula_custo: true,
  referencia_simula_custo: true,
  tipo_operacao_simula_custo: true,
  detalhe_operacao_simula_custo: true,
  status_simula_custo: true,
  ncm_simula_custo: true,
  descricao_ncm_simula_custo: true,
  incoterm_simula_custo: true,
  quantidade_simula_custo: true,
  moeda_produto_simula_custo: true,
  valor_produto_simula_custo: true,
  moeda_frete_simula_custo: true,
  valor_frete_simula_custo: true,
  moeda_seguro_simula_custo: true,
  valor_seguro_simula_custo: true,
  uf_desembaraco_simula_custo: true,
  ptax_utilizada_simula_custo: true,
  valor_aduaneiro_simula_custo: true,
  total_tributos_simula_custo: true,
  custo_nacionalizado_brl_simula_custo: true,
  fonte_calculo_simula_custo: true,
  aliquota_ii_simula_custo: true,
  base_calculo_ii_simula_custo: true,
  valor_ii_simula_custo: true,
  aliquota_ipi_simula_custo: true,
  base_calculo_ipi_simula_custo: true,
  valor_ipi_simula_custo: true,
  aliquota_pis_simula_custo: true,
  base_calculo_pis_simula_custo: true,
  valor_pis_simula_custo: true,
  aliquota_cofins_simula_custo: true,
  base_calculo_cofins_simula_custo: true,
  valor_cofins_simula_custo: true,
  aliquota_icms_simula_custo: true,
  base_calculo_icms_simula_custo: true,
  valor_icms_simula_custo: true,
  reducao_ii_simula_custo: true,
  id_usuario: true,
  data_criacao_simula_custo: true,
  data_atualizacao_simula_custo: true,
} satisfies Prisma.SimulaCustoSelect

type Decimalish = { toNumber(): number } | number | null | undefined

function paraNumero(valor: Decimalish): number | null {
  if (valor === null || valor === undefined) return null
  return typeof valor === 'number' ? valor : valor.toNumber()
}

/** Serializa a linha Prisma para o contrato público (Decimal → number, Date → ISO). */
export function serializarSimulaCusto(linha: Record<string, unknown>) {
  const e = linha as Record<string, never>
  return {
    id_simula_custo: e['id_simula_custo'] as string,
    numero_simula_custo: e['numero_simula_custo'] as string,
    referencia_simula_custo: (e['referencia_simula_custo'] ?? null) as string | null,
    tipo_operacao_simula_custo: e['tipo_operacao_simula_custo'] as string,
    detalhe_operacao_simula_custo: e['detalhe_operacao_simula_custo'] as string,
    status_simula_custo: e['status_simula_custo'] as string,
    ncm_simula_custo: e['ncm_simula_custo'] as string,
    descricao_ncm_simula_custo: (e['descricao_ncm_simula_custo'] ?? null) as string | null,
    incoterm_simula_custo: e['incoterm_simula_custo'] as string,
    quantidade_simula_custo: paraNumero(e['quantidade_simula_custo']),
    moeda_produto_simula_custo: e['moeda_produto_simula_custo'] as string,
    valor_produto_simula_custo: paraNumero(e['valor_produto_simula_custo']),
    moeda_frete_simula_custo: e['moeda_frete_simula_custo'] as string,
    valor_frete_simula_custo: paraNumero(e['valor_frete_simula_custo']),
    moeda_seguro_simula_custo: e['moeda_seguro_simula_custo'] as string,
    valor_seguro_simula_custo: paraNumero(e['valor_seguro_simula_custo']),
    uf_desembaraco_simula_custo: e['uf_desembaraco_simula_custo'] as string,
    ptax_utilizada_simula_custo: paraNumero(e['ptax_utilizada_simula_custo']),
    valor_aduaneiro_simula_custo: paraNumero(e['valor_aduaneiro_simula_custo']),
    total_tributos_simula_custo: paraNumero(e['total_tributos_simula_custo']),
    custo_nacionalizado_brl_simula_custo: paraNumero(e['custo_nacionalizado_brl_simula_custo']),
    fonte_calculo_simula_custo: (e['fonte_calculo_simula_custo'] ?? null) as string | null,
    id_usuario: (e['id_usuario'] ?? null) as string | null,
    data_criacao_simula_custo: (e['data_criacao_simula_custo'] as Date | undefined)?.toISOString() ?? null,
    data_atualizacao_simula_custo: (e['data_atualizacao_simula_custo'] as Date | undefined)?.toISOString() ?? null,
  }
}

export type SimulaCustoSerializada = ReturnType<typeof serializarSimulaCusto>
