/**
 * Deep-links BID Frete Internacional → Configurador (Cadastros / Fornecedores).
 *
 * O cadastro de fornecedores de frete usa o modal canônico "Novo Fornecedor"
 * (ModalEditarFornecedor), não um formulário próprio do produto.
 */

const ORIGEM_SHELL_DEV = 'http://localhost:8000'

function bidFreteStandaloneDev(): boolean {
  return import.meta.env.DEV
    && typeof window !== 'undefined'
    && (window.location.port === '5181' || window.location.port === '5179')
}

function urlBaseConfigurador(): string {
  if (bidFreteStandaloneDev()) {
    return `${ORIGEM_SHELL_DEV}/configurador`
  }
  return '/configurador'
}

function urlRetornoFornecedoresBidFrete(): string {
  return encodeURIComponent(window.location.href)
}

/** Abre o modal canônico de novo fornecedor (Cadastros). */
export function urlCriarFornecedorFreteInternacional(): string {
  const retorno = urlRetornoFornecedoresBidFrete()
  return `${urlBaseConfigurador()}/fornecedores?criar=fornecedor-frete-internacional&retorno=${retorno}`
}

/** @deprecated Use urlCriarFornecedorFreteInternacional */
export const urlCriarParceiroFreteInternacional = urlCriarFornecedorFreteInternacional

/** Editar fornecedor existente no Cadastros (por id_fornecedor do Cadastros). */
export function urlEditarFornecedorFreteInternacional(idFornecedorCadastros: string): string {
  const retorno = urlRetornoFornecedoresBidFrete()
  return `${urlBaseConfigurador()}/fornecedores?id=${idFornecedorCadastros}&retorno=${retorno}`
}

/** @deprecated Use urlEditarFornecedorFreteInternacional */
export const urlEditarParceiroFreteInternacional = urlEditarFornecedorFreteInternacional
