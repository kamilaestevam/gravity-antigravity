import { fetchCadastrosJson } from '../lib/cadastros-client.js'
import type { FornecedorCadastrosDisparo } from './resolver-contatos-disparo-bid-frete-internacional.js'

export async function buscarFornecedorCadastrosParaDisparo(
  id_fornecedor: string,
  id_organizacao: string,
): Promise<FornecedorCadastrosDisparo | null> {
  try {
    return await fetchCadastrosJson<FornecedorCadastrosDisparo>(
      `/api/v1/fornecedores/${encodeURIComponent(id_fornecedor)}`,
      undefined,
      { idOrganizacao: id_organizacao },
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[motor-bid] Cadastros indisponível para contatos do fornecedor — fallback espelho BID:', {
      id_fornecedor,
      msg,
    })
    return null
  }
}
