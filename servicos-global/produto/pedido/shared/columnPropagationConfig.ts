/**
 * columnPropagationConfig.ts — Fonte única de verdade para propagação pai → filhos.
 *
 * Módulo puro: zero dependências de cliente ou servidor.
 * Importado por:
 *   - produto/pedido/client/src/shared/columnBehaviorConfig.ts (re-export)
 *   - servicos-global/tenant/processos-core/src/routes/pedidos.ts (autoridade de escrita)
 *
 * Regra: quando o Pedido pai tem um campo propagável alterado, o servidor executa
 * pedidoItem.updateMany para replicar o valor em todos os itens filhos.
 */

// Campos do Pedido (pai) que propagam para PedidoItem (filhos) via updateMany no servidor.
// Nota: nome_exportador / nome_importador / nome_fabricante são armazenados em
// detalhes_operacionais (JSON) e requerem lógica especial — ficam fora desta lista.
const CAMPOS_PROPAGAVEIS = new Set([
  // BUG FIX: tipo_operacao agora propaga (badge do item reflecte tipo do pai)
  'tipo_operacao',
  // Identificadores de documentos
  'numero_proforma',
  'numero_invoice',
  'data_consolidacao_pedido',
  // Datas — pedido pronto (3)
  'data_prevista_pedido_pronto',
  'data_confirmada_pedido_pronto',
  'data_meta_pedido_pronto',
  // Datas — inspecao (3)
  'data_prevista_inspecao_pedido',
  'data_confirmada_inspecao_pedido',
  'data_meta_inspecao_pedido',
  // Datas — coleta (3)
  'data_prevista_coleta_pedido',
  'data_confirmada_coleta_pedido',
  'data_meta_coleta_pedido',
  // Datas — transferência e documento
  'data_transferencia_saldo_pedido',
  'data_documento_pedido',
  // Datas — rascunho pedido (3)
  'data_prevista_recebimento_rascunho_pedido',
  'data_confirmada_recebimento_rascunho_pedido',
  'data_meta_recebimento_rascunho_pedido',
  // Datas — aprovação rascunho pedido (3)
  'data_prevista_aprovacao_rascunho_pedido',
  'data_confirmada_aprovacao_rascunho_pedido',
  'data_meta_aprovacao_rascunho_pedido',
  // Datas — proforma (9)
  'data_prevista_recebimento_rascunho_proforma',
  'data_confirmada_recebimento_rascunho_proforma',
  'data_meta_recebimento_rascunho_proforma',
  'data_prevista_aprovacao_rascunho_proforma',
  'data_confirmada_aprovacao_rascunho_proforma',
  'data_meta_aprovacao_rascunho_proforma',
  'data_prevista_envio_original_proforma',
  'data_confirmada_envio_original_proforma',
  'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma',
  'data_confirmada_recebimento_original_proforma',
  'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  // Datas — invoice (9)
  'data_prevista_recebimento_rascunho_invoice',
  'data_confirmada_recebimento_rascunho_invoice',
  'data_meta_recebimento_rascunho_invoice',
  'data_prevista_aprovacao_rascunho_invoice',
  'data_confirmada_aprovacao_rascunho_invoice',
  'data_meta_aprovacao_rascunho_invoice',
  'data_prevista_envio_original_invoice',
  'data_confirmada_envio_original_invoice',
  'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice',
  'data_confirmada_recebimento_original_invoice',
  'data_meta_recebimento_original_invoice',
  'data_invoice',
  // Partes — exportador (6)
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'endereco_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  // Partes — contacto exportador (5)
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  // Partes — fabricante (5)
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'endereco_fabricante',
  'zip_code_fabricante',
  // Partes — empresa responsável e OPE (10)
  'cnpj_raiz_empresa_responsavel',
  'codigo_ope',
  'situacao_ope',
  'versao_ope',
  'nome_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'endereco_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  // Anexos (3)
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  // Outros (2)
  'cobertura_cambial_pedido',
  'quantidade_volumes_pedido',
])

/** Retorna true se o campo do Pedido pai deve ser replicado nos PedidoItem filhos. */
export function isPropagavel(campo: string): boolean {
  return CAMPOS_PROPAGAVEIS.has(campo)
}
