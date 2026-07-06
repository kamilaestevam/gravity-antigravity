/** Tipos mínimos para colunas personalizadas — paridade Pedido, escopo cotação BID Frete. */
export type TipoColunaUsuario =
  | 'texto'
  | 'numero'
  | 'data'
  | 'percentual'
  | 'select'
  | 'checkbox'
  | 'tipo_documento'
  | 'formula'
  | 'anexo'

export type EscopoColunaUsuario = 'pedido' | 'item' | 'ambos'
export type VisibilidadeColunaUsuario = 'todos' | 'roles' | 'privado'

export interface ColunaUsuario {
  id: string
  chave: string
  nome: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade: VisibilidadeColunaUsuario
  obrigatorio: boolean
  valor_padrao: string
  descricao: string
  opcoes: string[]
  formula_expressao?: string
  ativo: boolean
  ordem?: number
  alerta_divergencia_itens?: boolean
}

export interface PayloadSalvarColunaUsuarioBidFreteInternacional {
  nome: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade: VisibilidadeColunaUsuario
  obrigatorio: boolean
  valor_padrao: string
  descricao: string
  opcoes: string[]
  formula_expressao?: string
  ativo: boolean
  alerta_divergencia_itens?: boolean
}
