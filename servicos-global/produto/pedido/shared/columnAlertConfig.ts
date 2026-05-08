/**
 * columnAlertConfig.ts — Fonte única de verdade para alertas de divergência pai/filho.
 *
 * Módulo puro: zero dependências de cliente ou servidor.
 * Importado por:
 *   - produto/pedido/client/src/shared/columnBehaviorConfig.ts (re-export)
 *   - servicos-global/tenant/processos-core/src/routes/pedidos.ts (referência)
 *
 * Regra: um campo é "alertável" quando pode divergir entre o Pedido pai e os
 * seus PedidoItem filhos, e essa divergência deve ser sinalizada visualmente.
 *
 * Exclusões intencionais (alerta = não):
 *   - Contactos do exportador (nome_contato, email_contato, whatsapp, cargo, departamento)
 *   - tin_ope, email_ope
 *   - Anexos (anexo_pedido, anexo_proforma, anexo_invoice)
 *   - Campos ghost (ncm, cobertura_cambial, data_emissao_pedido) — tratados separadamente
 *
 * Merge das duas listas anteriores:
 *   - Servidor (~68 campos): base autoritativa
 *   - Cliente (8 campos omitidos do servidor): nome_exportador, nome_importador,
 *     nome_fabricante, referencia_importador, referencia_exportador,
 *     referencia_fabricante, incoterm, condicao_pagamento_pedido
 */

const CAMPOS_ALERTAVEIS = new Set([
  // Identificadores de documentos (3)
  'numero_proforma',
  'numero_invoice',
  'data_consolidacao_pedido',

  // Parceiros — campos omitidos do servidor mas presentes no cliente (8)
  'nome_exportador',
  'nome_importador',
  'nome_fabricante',
  'referencia_importador',
  'referencia_exportador',
  'referencia_fabricante',
  'incoterm',
  'condicao_pagamento_pedido',

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
  // Datas — transferência e documento (2)
  'data_transferencia_saldo_pedido',
  'data_documento_pedido',
  // Datas — rascunho pedido (6)
  'data_prevista_recebimento_rascunho_pedido',
  'data_confirmada_recebimento_rascunho_pedido',
  'data_meta_recebimento_rascunho_pedido',
  'data_prevista_aprovacao_rascunho_pedido',
  'data_confirmada_aprovacao_rascunho_pedido',
  'data_meta_aprovacao_rascunho_pedido',
  // Datas — proforma (13)
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
  // Datas — invoice (13)
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

  // Partes — exportador (7)
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'endereco_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  // Partes — fabricante (5)
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'endereco_fabricante',
  'zip_code_fabricante',
  // Partes — empresa responsável e OPE (9 — exclui tin_ope e email_ope)
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

  // Outros (1)
  'quantidade_volumes_pedido',
])

/** Retorna true se o campo deve exibir alerta de divergência entre pai e filhos. */
export function isAlertavel(campo: string): boolean {
  return CAMPOS_ALERTAVEIS.has(campo)
}

/** Lista completa de campos alertáveis — usada para iterar na função calcularDivergencias. */
export function getAlertavelKeys(): readonly string[] {
  return [...CAMPOS_ALERTAVEIS]
}
