/**
 * Itens de produto da simula — UI multi-linha (persistência legada via campos agregados).
 */
import { formatarNcmDisplaySimulaCusto } from './ultimos-ncm-simula-custo'
import type { EntradaSimulaCusto, ItemProdutoEntradaSimulaCusto } from './schemas-simula-custo'

export interface ItemProdutoEntradaSimulaCusto {
  ncm_item_produto_simula_custo: string
  descricao_ncm_item_produto_simula_custo?: string
  moeda_item_produto_simula_custo: string
  valor_unitario_item_produto_simula_custo: number
  quantidade_item_produto_simula_custo: number
}

export const ITEM_PRODUTO_VAZIO_SIMULA_CUSTO: ItemProdutoEntradaSimulaCusto = {
  ncm_item_produto_simula_custo: '',
  moeda_item_produto_simula_custo: 'USD',
  valor_unitario_item_produto_simula_custo: 0,
  quantidade_item_produto_simula_custo: 1,
}

export type FormularioComItensSimulaCusto = EntradaSimulaCusto & {
  itens_produto_simula_custo: ItemProdutoEntradaSimulaCusto[]
}

const CHAVE_STORAGE_ITENS = 'simula-custo-itens-simula-custo'

export function chaveStorageItensSimulaCusto(idSimula?: string | null): string {
  return `${CHAVE_STORAGE_ITENS}:${idSimula?.trim() || 'nova'}`
}

export function calcularTotalItemProdutoSimulaCusto(
  item: ItemProdutoEntradaSimulaCusto,
): number {
  return item.valor_unitario_item_produto_simula_custo * item.quantidade_item_produto_simula_custo
}

/** Mais de uma linha na tabela — exige unitário × quantidade por item. */
export function ehModoMultiItensProdutoSimulaCusto(
  itens: ItemProdutoEntradaSimulaCusto[],
): boolean {
  return itens.length > 1
}

/** Garante que o 1º item reflita NCM (passo Alíquotas) e valor total simples antes de abrir a tabela. */
export function normalizarItemUnicoParaMultiItensSimulaCusto(
  form: Pick<
    FormularioComItensSimulaCusto,
    | 'itens_produto_simula_custo'
    | 'ncm_simula_custo'
    | 'descricao_ncm_simula_custo'
    | 'moeda_produto_simula_custo'
    | 'valor_produto_simula_custo'
  >,
): ItemProdutoEntradaSimulaCusto {
  const atual = form.itens_produto_simula_custo[0] ?? { ...ITEM_PRODUTO_VAZIO_SIMULA_CUSTO }
  const ncmDigitos = (
    atual.ncm_item_produto_simula_custo.replace(/\D/g, '')
    || form.ncm_simula_custo.replace(/\D/g, '')
  ).slice(0, 8)
  const moeda = atual.moeda_item_produto_simula_custo.trim()
    || form.moeda_produto_simula_custo.trim()
    || 'USD'
  const quantidade = atual.quantidade_item_produto_simula_custo > 0
    ? atual.quantidade_item_produto_simula_custo
    : 1
  let valorUnitario = atual.valor_unitario_item_produto_simula_custo
  if (valorUnitario <= 0 && form.valor_produto_simula_custo > 0) {
    valorUnitario = form.valor_produto_simula_custo / quantidade
  }

  return {
    ...atual,
    ncm_item_produto_simula_custo: ncmDigitos,
    descricao_ncm_item_produto_simula_custo:
      atual.descricao_ncm_item_produto_simula_custo ?? form.descricao_ncm_simula_custo,
    moeda_item_produto_simula_custo: moeda,
    valor_unitario_item_produto_simula_custo: valorUnitario,
    quantidade_item_produto_simula_custo: quantidade,
  }
}

/** Modo 1 item — valor total direto (qty implícita = 1). */
export function aplicarValorProdutoSimplesSimulaCusto(
  form: FormularioComItensSimulaCusto,
  patch: { moeda?: string; valor?: number },
): FormularioComItensSimulaCusto {
  const moeda = (patch.moeda ?? form.moeda_produto_simula_custo).trim() || 'USD'
  const valor = patch.valor ?? form.valor_produto_simula_custo
  const atual = form.itens_produto_simula_custo[0] ?? { ...ITEM_PRODUTO_VAZIO_SIMULA_CUSTO }
  const ncmDigitos = (
    atual.ncm_item_produto_simula_custo.replace(/\D/g, '')
    || form.ncm_simula_custo.replace(/\D/g, '')
  ).slice(0, 8)

  return {
    ...form,
    moeda_produto_simula_custo: moeda,
    valor_produto_simula_custo: valor,
    itens_produto_simula_custo: [{
      ...atual,
      ncm_item_produto_simula_custo: ncmDigitos,
      descricao_ncm_item_produto_simula_custo:
        atual.descricao_ncm_item_produto_simula_custo ?? form.descricao_ncm_simula_custo,
      moeda_item_produto_simula_custo: moeda,
      valor_unitario_item_produto_simula_custo: valor,
      quantidade_item_produto_simula_custo: 1,
    }],
  }
}

export function passoValoresCompletoSimulaCusto(
  form: FormularioComItensSimulaCusto,
): boolean {
  const itens = form.itens_produto_simula_custo ?? []
  if (ehModoMultiItensProdutoSimulaCusto(itens)) {
    return itens.some(itemProdutoSimulaCustoValido)
  }
  return form.valor_produto_simula_custo > 0
}

export function itemProdutoSimulaCustoValido(
  item: ItemProdutoEntradaSimulaCusto,
): boolean {
  const ncm = item.ncm_item_produto_simula_custo.replace(/\D/g, '')
  return (
    /^\d{8}$/.test(ncm)
    && item.valor_unitario_item_produto_simula_custo > 0
    && item.quantidade_item_produto_simula_custo > 0
  )
}

export function rotuloItemProdutoResumoSimulaCusto(
  item: ItemProdutoEntradaSimulaCusto,
  rotuloBase: string,
): string {
  const ncm = formatarNcmDisplaySimulaCusto(item.ncm_item_produto_simula_custo)
  const descricao = item.descricao_ncm_item_produto_simula_custo?.trim()
  if (descricao) return `${rotuloBase} · ${ncm} — ${descricao}`
  return `${rotuloBase} · ${ncm}`
}

/** Reconstrói itens a partir dos campos legados (edição / simula sem storage). */
export function itensProdutoFromLegadoSimulaCusto(
  form: Pick<
    EntradaSimulaCusto,
    | 'ncm_simula_custo'
    | 'descricao_ncm_simula_custo'
    | 'moeda_produto_simula_custo'
    | 'valor_produto_simula_custo'
    | 'quantidade_simula_custo'
  >,
): ItemProdutoEntradaSimulaCusto[] {
  const quantidade = form.quantidade_simula_custo > 0 ? form.quantidade_simula_custo : 1
  const valorUnitario =
    form.valor_produto_simula_custo > 0
      ? form.valor_produto_simula_custo / quantidade
      : 0

  if (!form.ncm_simula_custo && valorUnitario <= 0) {
    return [{ ...ITEM_PRODUTO_VAZIO_SIMULA_CUSTO }]
  }

  return [{
    ncm_item_produto_simula_custo: form.ncm_simula_custo,
    descricao_ncm_item_produto_simula_custo: form.descricao_ncm_simula_custo,
    moeda_item_produto_simula_custo: form.moeda_produto_simula_custo || 'USD',
    valor_unitario_item_produto_simula_custo: valorUnitario,
    quantidade_item_produto_simula_custo: quantidade,
  }]
}

export function lerItensProdutoStorageSimulaCusto(
  idSimula?: string | null,
): ItemProdutoEntradaSimulaCusto[] | null {
  try {
    const raw = sessionStorage.getItem(chaveStorageItensSimulaCusto(idSimula))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed as ItemProdutoEntradaSimulaCusto[]
  } catch {
    return null
  }
}

export function salvarItensProdutoStorageSimulaCusto(
  itens: ItemProdutoEntradaSimulaCusto[],
  idSimula?: string | null,
): void {
  try {
    sessionStorage.setItem(chaveStorageItensSimulaCusto(idSimula), JSON.stringify(itens))
  } catch {
    /* quota / privado */
  }
}

/** Agrega itens nos campos legados exigidos pela API de simulação/salvamento. */
export function sincronizarProdutoLegadoSimulaCusto(
  form: FormularioComItensSimulaCusto,
): EntradaSimulaCusto {
  const itens = form.itens_produto_simula_custo
  if (itens.length === 0) {
    const { itens_produto_simula_custo: _, ...legado } = form
    return legado
  }

  const principal = itens[0]
  const ncm = principal.ncm_item_produto_simula_custo.replace(/\D/g, '').slice(0, 8)
  const moedaPrincipal = principal.moeda_item_produto_simula_custo.trim() || 'USD'

  let valorTotalMoedaPrincipal = 0
  let quantidadeTotal = 0
  for (const item of itens) {
    quantidadeTotal += item.quantidade_item_produto_simula_custo
    if ((item.moeda_item_produto_simula_custo.trim() || 'USD') === moedaPrincipal) {
      valorTotalMoedaPrincipal += calcularTotalItemProdutoSimulaCusto(item)
    }
  }
  if (valorTotalMoedaPrincipal <= 0) {
    valorTotalMoedaPrincipal = calcularTotalItemProdutoSimulaCusto(principal)
  }

  const { itens_produto_simula_custo: _, ...base } = form
  return {
    ...base,
    ncm_simula_custo: ncm || base.ncm_simula_custo,
    descricao_ncm_simula_custo:
      principal.descricao_ncm_item_produto_simula_custo ?? base.descricao_ncm_simula_custo,
    moeda_produto_simula_custo: moedaPrincipal,
    valor_produto_simula_custo: valorTotalMoedaPrincipal,
    quantidade_simula_custo: quantidadeTotal,
  }
}
