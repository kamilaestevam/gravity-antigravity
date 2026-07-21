export function serializarAnexoDocumentoSimulaCusto(anexo: {
  id_anexo_documento_simula_custo: string
  nome_arquivo_anexo_documento_simula_custo: string
  nome_original_anexo_documento_simula_custo: string
  tipo_arquivo_anexo_documento_simula_custo: string
  tamanho_bytes_anexo_documento_simula_custo: number
  categoria_anexo_documento_simula_custo: string | null
  enviado_por_anexo_documento_simula_custo: string
  data_criacao_anexo_documento_simula_custo: Date
}) {
  return {
    id_anexo_documento_simula_custo: anexo.id_anexo_documento_simula_custo,
    nome_arquivo_anexo_documento_simula_custo: anexo.nome_arquivo_anexo_documento_simula_custo,
    nome_original_anexo_documento_simula_custo: anexo.nome_original_anexo_documento_simula_custo,
    tipo_arquivo_anexo_documento_simula_custo: anexo.tipo_arquivo_anexo_documento_simula_custo,
    tamanho_bytes_anexo_documento_simula_custo: anexo.tamanho_bytes_anexo_documento_simula_custo,
    categoria_anexo_documento_simula_custo: anexo.categoria_anexo_documento_simula_custo,
    enviado_por_anexo_documento_simula_custo: anexo.enviado_por_anexo_documento_simula_custo,
    data_criacao_anexo_documento_simula_custo: anexo.data_criacao_anexo_documento_simula_custo.toISOString(),
  }
}
