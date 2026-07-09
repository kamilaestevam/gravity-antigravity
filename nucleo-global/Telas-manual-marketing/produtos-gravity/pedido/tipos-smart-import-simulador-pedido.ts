export type ColunaMapeadaSimulador = {
  coluna_arquivo: string
  campo_sistema: string | null
  confianca: number
  nivel: 'auto' | 'confirmado' | 'manual' | 'ignorado'
  inferido_por: 'ia' | 'dados' | 'memoria' | 'usuario'
  valor_exemplo_coluna_pedido?: string | null
}

export type SmartImportLinhaRawSimulador = {
  linha: number
  valores: Record<string, string>
}

export type SmartImportAlertaSimulador = {
  campo: string
  tipo: 'obrigatorio_ausente' | 'formato_invalido' | 'valor_negativo' | 'duplicado_sistema' | 'duplicado_arquivo'
  mensagem: string
  nivel: 'aviso' | 'erro'
}

export type SmartImportLinhaSimulador = {
  linha_arquivo: number
  numero_pedido: string | null
  status: 'ok' | 'aviso' | 'erro'
  alertas: SmartImportAlertaSimulador[]
  dados: Record<string, unknown>
}

export type SmartImportPreviewSimulador = {
  preview_id: string
  total_linhas: number
  total_pedidos: number
  total_itens: number
  mapeamento: ColunaMapeadaSimulador[]
  confianca_global: number
  memoria_aplicada: boolean
  linhas: SmartImportLinhaSimulador[]
  dados_brutos?: SmartImportLinhaRawSimulador[]
  extrator_usado?: string
}

export type DecisaoDuplicataSimulador = 'sobrescrever' | 'criar' | 'pular'

export type SmartImportConfirmarSimulador = {
  preview_id: string
  mapeamento_confirmado: ColunaMapeadaSimulador[]
  decisoes_duplicatas: Record<string, DecisaoDuplicataSimulador>
  linhas_incluidas: number[]
  salvar_mapeamento: boolean
  numeros_editados?: Record<number, string>
  linhas: SmartImportLinhaSimulador[]
}

export type SmartImportResultadoSimulador = {
  criados: number
  atualizados: number
  pulados: number
  erros: { linha: number; motivo: string }[]
  ids_criados: string[]
}

export type ErroDetalhadoUploadSimulador = {
  code: string
  titulo: string
  mensagem: string
  causa?: string
  sugestoes: string[]
  retryable: boolean
  acoes?: Array<{ label: string; tipo: 'baixar_template' | 'recarregar' }>
}
