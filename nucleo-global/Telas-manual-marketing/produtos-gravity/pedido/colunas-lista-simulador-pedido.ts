export type ColunaListaSimuladorPedido = {
  id: string
  label: string
  manual: boolean
  visivel: boolean
}

export const COLUNAS_LISTA_SIMULADOR_PEDIDO: ColunaListaSimuladorPedido[] = [
  {
    "id": "numero_pedido",
    "label": "Nº Pedido / Nº Item",
    "manual": false,
    "visivel": true
  },
  {
    "id": "tipo_operacao",
    "label": "Tipo de Operação",
    "manual": false,
    "visivel": true
  },
  {
    "id": "status",
    "label": "Status",
    "manual": false,
    "visivel": true
  },
  {
    "id": "id_workspace",
    "label": "Workspace",
    "manual": false,
    "visivel": true
  },
  {
    "id": "nome_importador",
    "label": "Importador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "nome_exportador",
    "label": "Exportador",
    "manual": false,
    "visivel": true
  },
  {
    "id": "referencia_importador",
    "label": "Ref. Importador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "referencia_exportador",
    "label": "Ref. Exportador",
    "manual": false,
    "visivel": true
  },
  {
    "id": "incoterm",
    "label": "Incoterm",
    "manual": false,
    "visivel": true
  },
  {
    "id": "porto_origem",
    "label": "Porto de Origem",
    "manual": false,
    "visivel": true
  },
  {
    "id": "porto_destino",
    "label": "Porto de Destino",
    "manual": false,
    "visivel": true
  },
  {
    "id": "local_de_origem",
    "label": "País de Origem",
    "manual": false,
    "visivel": true
  },
  {
    "id": "local_de_destino",
    "label": "País de Destino",
    "manual": false,
    "visivel": false
  },
  {
    "id": "aeroporto_origem",
    "label": "Aeroporto de Origem",
    "manual": false,
    "visivel": false
  },
  {
    "id": "aeroporto_destino",
    "label": "Aeroporto de Destino",
    "manual": false,
    "visivel": false
  },
  {
    "id": "descricao_item",
    "label": "Descrição Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "ncm",
    "label": "NCM",
    "manual": false,
    "visivel": false
  },
  {
    "id": "moeda_pedido",
    "label": "Moeda do Pedido/Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "valor_por_unidade_item",
    "label": "Valor Unitário do Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "quantidade_total_pedido",
    "label": "Qtd. Inicial do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "valor_total_pedido",
    "label": "Valor Total do Pedido/Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "quantidade_pronta_itens_pedido_total",
    "label": "Qtd. Pronta do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "unidade_comercializada_pedido",
    "label": "Unidade Comercializada",
    "manual": false,
    "visivel": false
  },
  {
    "id": "tipo_volume_pedido",
    "label": "Tipo Volume Pedido/Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "quantidade_transferida_total",
    "label": "Qtd. Transferida do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "saldo_itens_do_pedido",
    "label": "Saldo do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "quantidade_cancelada_total_pedido",
    "label": "Qtd. Cancelada do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "quantidade_volumes_pedido",
    "label": "Qtd. de Volumes do Pedido/Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "peso_liquido_total_pedido",
    "label": "Peso Líquido Total",
    "manual": false,
    "visivel": false
  },
  {
    "id": "peso_bruto_total_pedido",
    "label": "Peso Bruto Total",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cubagem_total_pedido",
    "label": "Cubagem Total",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cnpj_importador",
    "label": "CNPJ do Importador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cnpj_exportador",
    "label": "CNPJ do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "endereco_exportador",
    "label": "Endereço do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "estado_exportador",
    "label": "Estado/Província do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cidade_exportador",
    "label": "Cidade do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "pais_exportador",
    "label": "País do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "zip_code_exportador",
    "label": "CEP do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "nome_contato_exportador",
    "label": "Contato do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cargo_contato_exportador",
    "label": "Cargo do Contato no Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "departamento_contato_exportador",
    "label": "Departamento do Contato no Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "referencia_fabricante",
    "label": "Ref. Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "relacao_exportador_fabricante",
    "label": "Relação Exportador e Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "exportador_ou_fabricante",
    "label": "Exportador/Fabricante?",
    "manual": false,
    "visivel": false
  },
  {
    "id": "nome_fabricante",
    "label": "Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "endereco_fabricante",
    "label": "Endereço do Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cidade_fabricante",
    "label": "Cidade do Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "pais_fabricante",
    "label": "País do Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "zip_code_fabricante",
    "label": "CEP do Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cobertura_cambial",
    "label": "Cobertura Cambial do Pedido/Item",
    "manual": false,
    "visivel": false
  },
  {
    "id": "condicao_pagamento",
    "label": "Condição de Pagamento",
    "manual": false,
    "visivel": false
  },
  {
    "id": "moeda_cambio_pedido",
    "label": "Moeda Câmbio",
    "manual": false,
    "visivel": false
  },
  {
    "id": "valor_total_cambio_pedido",
    "label": "Valor Total Câmbio",
    "manual": false,
    "visivel": false
  },
  {
    "id": "contrato_cambio_id_pedido",
    "label": "Contrato de Câmbio",
    "manual": false,
    "visivel": false
  },
  {
    "id": "taxa_cambio_estimada",
    "label": "Taxa Câmbio Estimada",
    "manual": false,
    "visivel": false
  },
  {
    "id": "numero_proforma",
    "label": "Nº Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "numero_invoice",
    "label": "Nº Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_emissao_pedido",
    "label": "Data do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_transferencia_saldo_pedido",
    "label": "Data de Transferência de Saldo",
    "manual": false,
    "visivel": false
  },
  {
    "id": "estado_fabricante",
    "label": "Estado/Província do Fabricante",
    "manual": false,
    "visivel": false
  },
  {
    "id": "whatsapp_contato_exportador",
    "label": "WhatsApp do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_pedido_pronto",
    "label": "Data Prevista — Pedido Pronto",
    "manual": false,
    "visivel": false
  },
  {
    "id": "email_contato_exportador",
    "label": "Email do Exportador",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_pedido_pronto",
    "label": "Data Confirmada — Pedido Pronto",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_pedido_pronto",
    "label": "Data Meta — Pedido Pronto",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_inspecao_pedido",
    "label": "Data Prevista — Inspeção",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_inspecao_pedido",
    "label": "Data Confirmada — Inspeção",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_inspecao_pedido",
    "label": "Data Meta — Inspeção",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_coleta_pedido",
    "label": "Data Prevista — Coleta",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_coleta_pedido",
    "label": "Data Confirmada — Coleta",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_coleta_pedido",
    "label": "Data Meta — Coleta",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_recebimento_rascunho_pedido",
    "label": "Data Prevista — Recebimento Draft Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_recebimento_rascunho_pedido",
    "label": "Data Confirmada — Recebimento Draft Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_recebimento_rascunho_pedido",
    "label": "Data Meta — Recebimento Draft Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_consolidacao_pedido",
    "label": "Data de Consolidação do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_aprovacao_rascunho_pedido",
    "label": "Data Prevista — Aprovação Draft Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_aprovacao_rascunho_pedido",
    "label": "Data Confirmada — Aprovação Draft Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_aprovacao_rascunho_pedido",
    "label": "Data Meta — Aprovação Draft Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_documento_pedido",
    "label": "Data do Documento do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "anexo_pedido",
    "label": "Anexo do Pedido",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_documento_proforma",
    "label": "Data Doc. Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_recebimento_rascunho_proforma",
    "label": "Data Prevista — Recebimento Draft Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_recebimento_rascunho_proforma",
    "label": "Data Confirmada — Recebimento Draft Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_recebimento_rascunho_proforma",
    "label": "Data Meta — Recebimento Draft Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_aprovacao_rascunho_proforma",
    "label": "Data Prevista — Aprovação Draft Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_aprovacao_rascunho_proforma",
    "label": "Data Confirmada — Aprovação Draft Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_aprovacao_rascunho_proforma",
    "label": "Data Meta — Aprovação Draft Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_envio_original_proforma",
    "label": "Data Prevista — Envio Original Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_envio_original_proforma",
    "label": "Data Confirmada — Envio Original Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_envio_original_proforma",
    "label": "Data Meta — Envio Original Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_recebimento_original_proforma",
    "label": "Data Prevista — Recebimento Original Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_recebimento_original_proforma",
    "label": "Data Confirmada — Recebimento Original Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_recebimento_original_proforma",
    "label": "Data Meta — Recebimento Original Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "anexo_proforma",
    "label": "Anexo da Proforma",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_documento_invoice",
    "label": "Data Doc. Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_recebimento_rascunho_invoice",
    "label": "Data Prevista — Recebimento Draft Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_recebimento_rascunho_invoice",
    "label": "Data Confirmada — Recebimento Draft Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_recebimento_rascunho_invoice",
    "label": "Data Meta — Recebimento Draft Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_aprovacao_rascunho_invoice",
    "label": "Data Prevista — Aprovação Draft Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_aprovacao_rascunho_invoice",
    "label": "Data Confirmada — Aprovação Draft Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_aprovacao_rascunho_invoice",
    "label": "Data Meta — Aprovação Draft Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_envio_original_invoice",
    "label": "Data Prevista — Envio Original Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_envio_original_invoice",
    "label": "Data Confirmada — Envio Original Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_envio_original_invoice",
    "label": "Data Meta — Envio Original Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_prevista_recebimento_original_invoice",
    "label": "Data Prevista — Recebimento Original Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_confirmada_recebimento_original_invoice",
    "label": "Data Confirmada — Recebimento Original Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "data_meta_recebimento_original_invoice",
    "label": "Data Meta — Recebimento Original Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "anexo_invoice",
    "label": "Anexo da Invoice",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cnpj_raiz_empresa_responsavel",
    "label": "CNPJ Raiz Empresa Responsável",
    "manual": false,
    "visivel": false
  },
  {
    "id": "codigo_ope",
    "label": "Código do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "situacao_ope",
    "label": "Situação do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "versao_ope",
    "label": "Versão do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "nome_ope",
    "label": "Nome do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "pais_ope",
    "label": "País do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "estado_ope",
    "label": "Estado do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "cidade_ope",
    "label": "Cidade do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "endereco_ope",
    "label": "Endereço do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "zip_code_ope",
    "label": "CEP do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "tin_ope",
    "label": "TIN do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "email_ope",
    "label": "Email do OPE",
    "manual": false,
    "visivel": false
  },
  {
    "id": "condicao_pagamento_siscomex",
    "label": "Modalidade Siscomex",
    "manual": false,
    "visivel": false
  },
  {
    "id": "coluna_usuario:obs_comercial",
    "label": "Observação Comercial",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:prioridade_embarque",
    "label": "Prioridade de Embarque",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:centro_custo",
    "label": "Centro de Custo",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:responsavel_interno",
    "label": "Responsável Interno",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:canal_origem",
    "label": "Canal de Origem",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:projeto",
    "label": "Projeto",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:tag_risco",
    "label": "Tag de Risco",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:sla_dias",
    "label": "SLA (dias)",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:frete_estimado",
    "label": "Frete Estimado",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:margem_prevista",
    "label": "Margem Prevista (%)",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:comprador",
    "label": "Comprador",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:analista_comex",
    "label": "Analista COMEX",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:referencia_cliente",
    "label": "Referência do Cliente",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:tipo_embalagem_extra",
    "label": "Tipo Embalagem Extra",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:inspecao_obrigatoria",
    "label": "Inspeção Obrigatória",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:obs_logistica",
    "label": "Observação Logística",
    "manual": true,
    "visivel": false
  },
  {
    "id": "coluna_usuario:score_fornecedor",
    "label": "Score do Fornecedor",
    "manual": true,
    "visivel": false
  }
]

export const CHAVES_COLUNAS_BUILTIN_SIMULADOR_PEDIDO: string[] = [
  "numero_pedido",
  "tipo_operacao",
  "status",
  "id_workspace",
  "nome_importador",
  "nome_exportador",
  "referencia_importador",
  "referencia_exportador",
  "incoterm",
  "porto_origem",
  "porto_destino",
  "local_de_origem",
  "local_de_destino",
  "aeroporto_origem",
  "aeroporto_destino",
  "descricao_item",
  "ncm",
  "moeda_pedido",
  "valor_por_unidade_item",
  "quantidade_total_pedido",
  "valor_total_pedido",
  "quantidade_pronta_itens_pedido_total",
  "unidade_comercializada_pedido",
  "tipo_volume_pedido",
  "quantidade_transferida_total",
  "saldo_itens_do_pedido",
  "quantidade_cancelada_total_pedido",
  "quantidade_volumes_pedido",
  "peso_liquido_total_pedido",
  "peso_bruto_total_pedido",
  "cubagem_total_pedido",
  "cnpj_importador",
  "cnpj_exportador",
  "endereco_exportador",
  "estado_exportador",
  "cidade_exportador",
  "pais_exportador",
  "zip_code_exportador",
  "nome_contato_exportador",
  "cargo_contato_exportador",
  "departamento_contato_exportador",
  "referencia_fabricante",
  "relacao_exportador_fabricante",
  "exportador_ou_fabricante",
  "nome_fabricante",
  "endereco_fabricante",
  "cidade_fabricante",
  "pais_fabricante",
  "zip_code_fabricante",
  "cobertura_cambial",
  "condicao_pagamento",
  "moeda_cambio_pedido",
  "valor_total_cambio_pedido",
  "contrato_cambio_id_pedido",
  "taxa_cambio_estimada",
  "numero_proforma",
  "numero_invoice",
  "data_emissao_pedido",
  "data_transferencia_saldo_pedido",
  "estado_fabricante",
  "whatsapp_contato_exportador",
  "data_prevista_pedido_pronto",
  "email_contato_exportador",
  "data_confirmada_pedido_pronto",
  "data_meta_pedido_pronto",
  "data_prevista_inspecao_pedido",
  "data_confirmada_inspecao_pedido",
  "data_meta_inspecao_pedido",
  "data_prevista_coleta_pedido",
  "data_confirmada_coleta_pedido",
  "data_meta_coleta_pedido",
  "data_prevista_recebimento_rascunho_pedido",
  "data_confirmada_recebimento_rascunho_pedido",
  "data_meta_recebimento_rascunho_pedido",
  "data_consolidacao_pedido",
  "data_prevista_aprovacao_rascunho_pedido",
  "data_confirmada_aprovacao_rascunho_pedido",
  "data_meta_aprovacao_rascunho_pedido",
  "data_documento_pedido",
  "anexo_pedido",
  "data_documento_proforma",
  "data_prevista_recebimento_rascunho_proforma",
  "data_confirmada_recebimento_rascunho_proforma",
  "data_meta_recebimento_rascunho_proforma",
  "data_prevista_aprovacao_rascunho_proforma",
  "data_confirmada_aprovacao_rascunho_proforma",
  "data_meta_aprovacao_rascunho_proforma",
  "data_prevista_envio_original_proforma",
  "data_confirmada_envio_original_proforma",
  "data_meta_envio_original_proforma",
  "data_prevista_recebimento_original_proforma",
  "data_confirmada_recebimento_original_proforma",
  "data_meta_recebimento_original_proforma",
  "anexo_proforma",
  "data_documento_invoice",
  "data_prevista_recebimento_rascunho_invoice",
  "data_confirmada_recebimento_rascunho_invoice",
  "data_meta_recebimento_rascunho_invoice",
  "data_prevista_aprovacao_rascunho_invoice",
  "data_confirmada_aprovacao_rascunho_invoice",
  "data_meta_aprovacao_rascunho_invoice",
  "data_prevista_envio_original_invoice",
  "data_confirmada_envio_original_invoice",
  "data_meta_envio_original_invoice",
  "data_prevista_recebimento_original_invoice",
  "data_confirmada_recebimento_original_invoice",
  "data_meta_recebimento_original_invoice",
  "anexo_invoice",
  "cnpj_raiz_empresa_responsavel",
  "codigo_ope",
  "situacao_ope",
  "versao_ope",
  "nome_ope",
  "pais_ope",
  "estado_ope",
  "cidade_ope",
  "endereco_ope",
  "zip_code_ope",
  "tin_ope",
  "email_ope",
  "condicao_pagamento_siscomex"
]

export function criarEstadoColunasListaSimuladorPedido(): ColunaListaSimuladorPedido[] {
  return COLUNAS_LISTA_SIMULADOR_PEDIDO.map((c) => ({ ...c }))
}
