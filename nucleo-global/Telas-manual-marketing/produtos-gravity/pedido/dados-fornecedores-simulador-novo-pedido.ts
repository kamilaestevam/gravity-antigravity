export type FornecedorSimuladorNovoPedido = {
  id_fornecedor: string
  nome_fornecedor: string
  pais_fornecedor: string
  pode_importador: boolean
  pode_exportador: boolean
  pode_fabricante: boolean
}

export const EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO = {
  id_empresa: 'gravity-org',
  nome_empresa: 'Gravity',
  cnpj_empresa: '32.964.709/0001-01',
}

export const FORNECEDORES_SIMULADOR_NOVO_PEDIDO_INICIAIS: FornecedorSimuladorNovoPedido[] = [
  {
    id_fornecedor: 'london-metals',
    nome_fornecedor: 'London Metals',
    pais_fornecedor: 'GB',
    pode_importador: true,
    pode_exportador: true,
    pode_fabricante: true,
  },
  {
    id_fornecedor: 'shanghai-tech',
    nome_fornecedor: 'Shanghai Tech Co.',
    pais_fornecedor: 'CN',
    pode_importador: true,
    pode_exportador: true,
    pode_fabricante: true,
  },
  {
    id_fornecedor: 'berlin-ind',
    nome_fornecedor: 'Berlin Industrial GmbH',
    pais_fornecedor: 'DE',
    pode_importador: true,
    pode_exportador: true,
    pode_fabricante: false,
  },
  {
    id_fornecedor: 'fabrica-sp',
    nome_fornecedor: 'Fábrica Nacional SP',
    pais_fornecedor: 'BR',
    pode_importador: false,
    pode_exportador: false,
    pode_fabricante: true,
  },
]

/** Lista completa Incoterms 2020 — paridade com cadastros.incoterm (SSOT). */
export const INCOTERMS_SIMULADOR_NOVO_PEDIDO = [
  { valor: 'EXW', label: 'EXW — Ex Works' },
  { valor: 'FCA', label: 'FCA — Free Carrier' },
  { valor: 'CPT', label: 'CPT — Carriage Paid To' },
  { valor: 'CIP', label: 'CIP — Carriage and Insurance Paid To' },
  { valor: 'DAP', label: 'DAP — Delivered At Place' },
  { valor: 'DPU', label: 'DPU — Delivered at Place Unloaded' },
  { valor: 'DDP', label: 'DDP — Delivered Duty Paid' },
  { valor: 'FAS', label: 'FAS — Free Alongside Ship' },
  { valor: 'FOB', label: 'FOB — Free On Board' },
  { valor: 'CFR', label: 'CFR — Cost and Freight' },
  { valor: 'CIF', label: 'CIF — Cost Insurance and Freight' },
] as const

export const MOEDAS_SIMULADOR_NOVO_PEDIDO = [
  { valor: 'USD', rotulo: 'USD', descricao: 'Dólar americano' },
  { valor: 'EUR', rotulo: 'EUR', descricao: 'Euro' },
  { valor: 'BRL', rotulo: 'BRL', descricao: 'Real brasileiro' },
  { valor: 'GBP', rotulo: 'GBP', descricao: 'Libra esterlina' },
]

export const PAISES_SIMULADOR_CADASTRO_EMPRESA = [
  { codigo: 'BR', nome: 'Brasil' },
  { codigo: 'US', nome: 'Estados Unidos' },
  { codigo: 'CN', nome: 'China' },
  { codigo: 'DE', nome: 'Alemanha' },
  { codigo: 'GB', nome: 'Reino Unido' },
  { codigo: 'JP', nome: 'Japão' },
  { codigo: 'KR', nome: 'Coreia do Sul' },
  { codigo: 'IN', nome: 'Índia' },
]

export type PapelFornecedorSimuladorNovoPedido = 'importador' | 'exportador' | 'fabricante'

export function rotuloPapelCadastroEmpresaSimulador(papel: PapelFornecedorSimuladorNovoPedido): string {
  if (papel === 'importador') return 'Importador'
  if (papel === 'exportador') return 'Exportador'
  return 'Fabricante'
}

export function resolverForcarEstrangeiroCadastroEmpresaSimulador(
  papel: PapelFornecedorSimuladorNovoPedido,
  tipoOperacao: 'importacao' | 'exportacao',
): boolean {
  if (papel === 'exportador' && tipoOperacao === 'importacao') return true
  if (papel === 'importador' && tipoOperacao === 'exportacao') return true
  if (papel === 'fabricante' && tipoOperacao === 'importacao') return true
  return false
}

export function opcoesFornecedorSimulador(
  fornecedores: FornecedorSimuladorNovoPedido[],
  papel: PapelFornecedorSimuladorNovoPedido,
  tipoOperacao: 'importacao' | 'exportacao',
): Array<{ valor: string; rotulo: string }> {
  return fornecedores
    .filter((f) => {
      if (papel === 'importador' && !f.pode_importador) return false
      if (papel === 'exportador' && !f.pode_exportador) return false
      if (papel === 'fabricante' && !f.pode_fabricante) return false
      if (papel === 'exportador' && tipoOperacao === 'importacao' && f.pais_fornecedor === 'BR') {
        return false
      }
      if (papel === 'importador' && tipoOperacao === 'exportacao' && f.pais_fornecedor === 'BR') {
        return false
      }
      if (papel === 'fabricante' && tipoOperacao === 'importacao' && f.pais_fornecedor === 'BR') {
        return false
      }
      return true
    })
    .map((f) => ({
      valor: f.id_fornecedor,
      rotulo: `${f.nome_fornecedor} (${f.pais_fornecedor})`,
    }))
}
