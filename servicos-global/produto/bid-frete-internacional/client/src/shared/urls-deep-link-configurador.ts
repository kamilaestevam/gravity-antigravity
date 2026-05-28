/**
 * Deep-links BID Frete Internacional → Configurador (Cadastros / Empresas e Parceiros).
 *
 * O cadastro de fornecedores de frete usa o modal canônico "Nova Empresa e Parceiro"
 * (ModalEditarEmpresa), não um formulário próprio do produto.
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

/** Abre o modal canônico de nova empresa/parceiro (Cadastros). */
export function urlCriarParceiroFreteInternacional(): string {
  const retorno = urlRetornoFornecedoresBidFrete()
  return `${urlBaseConfigurador()}/empresas-e-parceiros?criar=parceiro-frete-internacional&retorno=${retorno}`
}

/** Editar parceiro existente no Cadastros (por id_fornecedor do Cadastros). */
export function urlEditarParceiroFreteInternacional(idFornecedorCadastros: string): string {
  const retorno = urlRetornoFornecedoresBidFrete()
  return `${urlBaseConfigurador()}/empresas-e-parceiros?id=${idFornecedorCadastros}&retorno=${retorno}`
}
