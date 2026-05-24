/**
 * @deprecated Use fornecedor.schema.ts — aliases mantidos só para imports legados em migração.
 */
export {
  criarFornecedorSchema as criarEmpresaSchema,
  atualizarFornecedorSchema as atualizarEmpresaSchema,
  fornecedorSchema as empresaSchema,
  listaFornecedoresSchema as listaEmpresasSchema,
  fornecedorAdminSchema as empresaAdminSchema,
  listaFornecedoresAdminSchema as listaEmpresasAdminSchema,
  type Fornecedor as Empresa,
  type FornecedorAdmin as EmpresaAdmin,
  type CriarFornecedorInput as CriarEmpresaInput,
  type AtualizarFornecedorInput as AtualizarEmpresaInput,
  type ListaFornecedores as ListaEmpresas,
  type ListaFornecedoresAdmin as ListaEmpresasAdmin,
} from './fornecedor.schema.js'
