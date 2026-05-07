/**
 * campos-pedido-ddd.ts — Fonte unica de verdade dos campos do Pedido + PedidoItem
 * com seus rotulos canonical em PT-BR conforme REGRA 9 da skill ddd-nomenclatura.
 *
 * Modulo puro: zero dependencias de cliente ou servidor.
 * Importado por:
 *   - produto/pedido/server/src/routes/importacoes-inteligentes-pedido.ts (gerador da planilha modelo)
 *   - (consumidor potencial) produto/pedido/client/src/components/ModalPedidosEdicaoMassa.tsx
 *   - (futuros consumidores: validacao Zod do upload, Smart Import labels, etc.)
 *
 * Cada entrada mapeia:
 *   - campo:  nome fisico DDD (paridade Prisma) — chave tecnica
 *   - rotulo: label canonical PT-BR (REGRA 9) — o que aparece em tela/planilha
 *   - tipo:   tipo de dado para formatacao (Excel numFmt, validacao, render)
 *   - nivel:  'pedido' (1 linha em negrito por pedido) | 'item' (N linhas abaixo do pedido)
 *   - grupo:  agrupamento visual (Identificacao, Exportador, Datas, Fisico, etc.)
 *   - opcoesSelect: valores validos quando tipo = 'select'
 *
 * Quando adicionar campo novo:
 *   1. Adicione aqui (com rotulo canonical PT-BR conforme planilha mestre DDD).
 *   2. Modal de edicao em massa e planilha modelo se atualizam de graca.
 */

export type TipoCampoDDD = 'texto' | 'numero' | 'data' | 'select' | 'usuario'

export interface CampoPedidoDDD {
  /** Nome fisico DDD (paridade Prisma — REGRA 1) */
  campo: string
  /** Label canonical PT-BR (REGRA 9) */
  rotulo: string
  /** Tipo de dado — usado para formatacao em Excel e validacao */
  tipo: TipoCampoDDD
  /** Nivel na hierarquia master-detail */
  nivel: 'pedido' | 'item'
  /** Agrupamento visual (Identificacao, Exportador, Datas, etc.) */
  grupo?: string
  /** Valores validos quando tipo = 'select' */
  opcoesSelect?: string[]
}

// ── Campos do Pedido (master) ─────────────────────────────────────────────────

export const CAMPOS_PEDIDO_DDD: CampoPedidoDDD[] = [
  // Identificacao
  // tipo_linha: marca obrigatoria para o parser identificar Pedido (master) vs Item (detail).
  // PEDIDO -> linha de Pedido (preenche colunas de Pedido, deixa colunas de Item vazias).
  // ITEM   -> linha de Item   (vincula ao Pedido imediatamente acima OU por numero_pedido).
  { campo: 'tipo_linha',                                   rotulo: 'Tipo Linha',                             tipo: 'select', nivel: 'pedido', grupo: 'Identificacao', opcoesSelect: ['PEDIDO', 'ITEM'] },
  { campo: 'numero_pedido',                                rotulo: 'Numero do Pedido',                       tipo: 'texto',  nivel: 'pedido', grupo: 'Identificacao' },
  { campo: 'tipo_operacao',                                rotulo: 'Tipo de Operacao',                       tipo: 'select', nivel: 'pedido', grupo: 'Identificacao', opcoesSelect: ['importacao', 'exportacao'] },

  // Exportador
  { campo: 'nome_exportador',                              rotulo: 'Exportador — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'endereco_exportador',                          rotulo: 'Exportador — Endereco',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'pais_exportador',                              rotulo: 'Exportador — Pais',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'estado_exportador',                            rotulo: 'Exportador — Estado',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'cidade_exportador',                            rotulo: 'Exportador — Cidade',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'zip_code_exportador',                          rotulo: 'Exportador — ZIP Code',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'exportador_ou_fabricante',                     rotulo: 'Exportador ou Fabricante',               tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'relacao_exportador_fabricante',                rotulo: 'Relacao Export./Fabric.',                tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'nome_contato_exportador',                      rotulo: 'Contato Export. — Nome',                 tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'email_contato_exportador',                     rotulo: 'Contato Export. — Email',                tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'whatsapp_contato_exportador',                  rotulo: 'Contato Export. — WhatsApp',             tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'cargo_contato_exportador',                     rotulo: 'Contato Export. — Cargo',                tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'departamento_contato_exportador',              rotulo: 'Contato Export. — Depto.',               tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },

  // Importador
  { campo: 'nome_importador',                              rotulo: 'Importador — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Importador' },
  { campo: 'cnpj_importador_pedido',                       rotulo: 'Importador — CNPJ',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Importador' },

  // Fabricante
  { campo: 'nome_fabricante',                              rotulo: 'Fabricante — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'endereco_fabricante',                          rotulo: 'Fabricante — Endereco',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'pais_fabricante',                              rotulo: 'Fabricante — Pais',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'estado_fabricante',                            rotulo: 'Fabricante — Estado',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'cidade_fabricante',                            rotulo: 'Fabricante — Cidade',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'zip_code_fabricante',                          rotulo: 'Fabricante — ZIP Code',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },

  // OPE
  { campo: 'codigo_ope',                                   rotulo: 'OPE — Codigo',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'nome_ope',                                     rotulo: 'OPE — Nome',                             tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'endereco_ope',                                 rotulo: 'OPE — Endereco',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'pais_ope',                                     rotulo: 'OPE — Pais',                             tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'estado_ope',                                   rotulo: 'OPE — Estado',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'cidade_ope',                                   rotulo: 'OPE — Cidade',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'zip_code_ope',                                 rotulo: 'OPE — ZIP Code',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'tin_ope',                                      rotulo: 'OPE — TIN',                              tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'email_ope',                                    rotulo: 'OPE — Email',                            tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'situacao_ope',                                 rotulo: 'OPE — Situacao',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'versao_ope',                                   rotulo: 'OPE — Versao',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'cnpj_raiz_empresa_responsavel',                rotulo: 'CNPJ Raiz Empresa Responsavel',          tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },

  // Comercial
  { campo: 'incoterm_pedido',                              rotulo: 'Incoterm',                               tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'moeda_pedido',                                 rotulo: 'Moeda',                                  tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'valor_total_pedido',                           rotulo: 'Valor Total do Pedido',                  tipo: 'numero', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'quantidade_total_pedido',                      rotulo: 'Quantidade Total do Pedido',             tipo: 'numero', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'unidade_comercializada_pedido',                rotulo: 'Unidade Comercializada',                 tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'condicao_pagamento_pedido',                    rotulo: 'Condicao de Pagamento',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'quantidade_volumes_pedido',                    rotulo: 'Qtd. de Volumes',                        tipo: 'numero', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'cobertura_cambial_pedido',                     rotulo: 'Cobertura Cambial',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },

  // Cambio
  { campo: 'valor_total_cambio_pedido',                    rotulo: 'Valor Total Cambio',                     tipo: 'numero', nivel: 'pedido', grupo: 'Cambio' },
  { campo: 'moeda_cambio_pedido',                          rotulo: 'Moeda Cambio',                           tipo: 'texto',  nivel: 'pedido', grupo: 'Cambio' },
  { campo: 'taxa_cambio_estimada_pedido',                  rotulo: 'Taxa Cambio Estimada',                   tipo: 'numero', nivel: 'pedido', grupo: 'Cambio' },
  { campo: 'contrato_cambio_id_pedido',                    rotulo: 'Contrato de Cambio (ID)',                tipo: 'texto',  nivel: 'pedido', grupo: 'Cambio' },

  // Fisico
  { campo: 'peso_liquido_total_pedido',                    rotulo: 'Peso Liquido Total',                     tipo: 'numero', nivel: 'pedido', grupo: 'Fisico' },
  { campo: 'peso_bruto_total_pedido',                      rotulo: 'Peso Bruto Total',                       tipo: 'numero', nivel: 'pedido', grupo: 'Fisico' },
  { campo: 'cubagem_total_pedido',                         rotulo: 'Cubagem Total',                          tipo: 'numero', nivel: 'pedido', grupo: 'Fisico' },

  // Documentos
  { campo: 'numero_proforma_pedido',                       rotulo: 'No Proforma',                            tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'numero_invoice_pedido',                        rotulo: 'No Invoice',                             tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_importador_pedido',                 rotulo: 'Referencia Importador',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_exportador_pedido',                 rotulo: 'Referencia Exportador',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_fabricante_pedido',                 rotulo: 'Referencia Fabricante',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },

  // Logistica
  { campo: 'porto_origem_pedido',                          rotulo: 'Porto de Origem',                        tipo: 'texto',  nivel: 'pedido', grupo: 'Logistica' },
  { campo: 'porto_destino_pedido',                         rotulo: 'Porto de Destino',                       tipo: 'texto',  nivel: 'pedido', grupo: 'Logistica' },

  // Datas principais
  { campo: 'data_emissao_pedido',                          rotulo: 'Data de Emissao',                        tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_documento_pedido',                        rotulo: 'Data do Documento',                      tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_documento_proforma_pedido',               rotulo: 'Data do Documento Proforma',             tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_documento_invoice_pedido',                rotulo: 'Data do Documento Invoice',              tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_consolidacao_pedido',                     rotulo: 'Data de Consolidacao',                   tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_prevista_pedido_pronto',                  rotulo: 'Data Prevista — Pedido Pronto',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_confirmada_pedido_pronto',                rotulo: 'Data Confirmada — Pedido Pronto',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_meta_pedido_pronto',                      rotulo: 'Data Meta — Pedido Pronto',              tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_prevista_inspecao_pedido',                rotulo: 'Data Prevista — Inspecao',               tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_confirmada_inspecao_pedido',              rotulo: 'Data Confirmada — Inspecao',             tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_meta_inspecao_pedido',                    rotulo: 'Data Meta — Inspecao',                   tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_prevista_coleta_pedido',                  rotulo: 'Data Prevista — Coleta',                 tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_confirmada_coleta_pedido',                rotulo: 'Data Confirmada — Coleta',               tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_meta_coleta_pedido',                      rotulo: 'Data Meta — Coleta',                     tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },

  // Datas — Draft Pedido
  { campo: 'data_previsao_recebimento_draft_pedido',       rotulo: 'Draft Pedido — Prev. Recebimento',       tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_confirmacao_recebimento_draft_pedido',    rotulo: 'Draft Pedido — Conf. Recebimento',       tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_meta_recebimento_draft_pedido',           rotulo: 'Draft Pedido — Meta Recebimento',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_previsao_aprovacao_draft_pedido',         rotulo: 'Draft Pedido — Prev. Aprovacao',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_confirmacao_aprovacao_draft_pedido',      rotulo: 'Draft Pedido — Conf. Aprovacao',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_meta_aprovacao_draft_pedido',             rotulo: 'Draft Pedido — Meta Aprovacao',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },

  // Datas — Draft Proforma
  { campo: 'data_previsao_recebimento_draft_proforma_pedido',    rotulo: 'Draft Proforma — Prev. Recebimento', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_recebimento_draft_proforma_pedido', rotulo: 'Draft Proforma — Conf. Recebimento', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_recebimento_draft_proforma_pedido',        rotulo: 'Draft Proforma — Meta Recebimento',  tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_previsao_aprovacao_draft_proforma_pedido',      rotulo: 'Draft Proforma — Prev. Aprovacao',   tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_aprovacao_draft_proforma_pedido',   rotulo: 'Draft Proforma — Conf. Aprovacao',   tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_aprovacao_draft_proforma_pedido',          rotulo: 'Draft Proforma — Meta Aprovacao',    tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_previsao_envio_original_proforma_pedido',       rotulo: 'Original Proforma — Prev. Envio',    tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_envio_original_proforma_pedido',    rotulo: 'Original Proforma — Conf. Envio',    tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_envio_original_proforma_pedido',           rotulo: 'Original Proforma — Meta Envio',     tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_previsao_recebimento_original_proforma_pedido', rotulo: 'Original Proforma — Prev. Recebimento', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_recebimento_original_proforma_pedido', rotulo: 'Original Proforma — Conf. Recebimento', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_recebimento_original_proforma_pedido',     rotulo: 'Original Proforma — Meta Recebimento', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },

  // Datas — Draft Invoice
  { campo: 'data_previsao_recebimento_draft_invoice_pedido',     rotulo: 'Draft Invoice — Prev. Recebimento',  tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmacao_recebimento_draft_invoice_pedido',  rotulo: 'Draft Invoice — Conf. Recebimento',  tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_recebimento_draft_invoice_pedido',         rotulo: 'Draft Invoice — Meta Recebimento',   tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_previsao_aprovacao_draft_invoice_pedido',       rotulo: 'Draft Invoice — Prev. Aprovacao',    tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmacao_aprovacao_draft_invoice_pedido',    rotulo: 'Draft Invoice — Conf. Aprovacao',    tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_aprovacao_draft_invoice_pedido',           rotulo: 'Draft Invoice — Meta Aprovacao',     tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_previsao_envio_original_invoice_pedido',        rotulo: 'Original Invoice — Prev. Envio',     tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
]

// ── Campos do Item (detail) ───────────────────────────────────────────────────

export const CAMPOS_ITEM_DDD: CampoPedidoDDD[] = [
  // Identificacao do produto
  { campo: 'part_number_item_pedido',                      rotulo: 'Part Number',                            tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'ncm_item_pedido',                              rotulo: 'NCM',                                    tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_item_pedido',                        rotulo: 'Descricao do Item',                      tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_pt_pedido',            rotulo: 'Descricao Completa (PT)',                tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_en_pedido',            rotulo: 'Descricao Completa (EN)',                tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_es_pedido',            rotulo: 'Descricao Completa (ES)',                tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_nf_pedido',            rotulo: 'Descricao Espelho NF',                   tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'texto_posicao_ncm_item_pedido',                rotulo: 'Texto Posicao NCM',                      tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'grupo_item_pedido',                            rotulo: 'Grupo do Produto',                       tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'subgrupo_item_pedido',                         rotulo: 'Subgrupo do Produto',                    tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'campo_especial_item_pedido',                   rotulo: 'Campo Especial',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'atributos_catalogo_item_pedido',               rotulo: 'Atributos do Catalogo',                  tipo: 'texto',  nivel: 'item', grupo: 'Produto' },

  // Quantidades
  { campo: 'quantidade_inicial_item_pedido',               rotulo: 'Qtd. Inicial',                           tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_transferida_item_pedido',           rotulo: 'Qtd. Transferida',                       tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_pronta_total_item_pedido',          rotulo: 'Qtd. Pronta',                            tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_cancelada_item_pedido',             rotulo: 'Qtd. Cancelada',                         tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'casas_decimais_quantidade_item_pedido',        rotulo: 'Casas Decimais — Qtd.',                  tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },

  // Financeiro
  { campo: 'valor_unitario_item_pedido',                   rotulo: 'Valor Unitario',                         tipo: 'numero', nivel: 'item', grupo: 'Financeiro' },
  { campo: 'valor_total_item_pedido',                      rotulo: 'Valor Total do Item',                    tipo: 'numero', nivel: 'item', grupo: 'Financeiro' },
  { campo: 'casas_decimais_valor_item_pedido',             rotulo: 'Casas Decimais — Valor',                 tipo: 'numero', nivel: 'item', grupo: 'Financeiro' },

  // Fisico
  { campo: 'peso_liquido_unitario_item_pedido',            rotulo: 'Peso Liquido Unitario',                  tipo: 'numero', nivel: 'item', grupo: 'Fisico' },
  { campo: 'peso_bruto_unitario_item_pedido',              rotulo: 'Peso Bruto Unitario',                    tipo: 'numero', nivel: 'item', grupo: 'Fisico' },
  { campo: 'cubagem_unitaria_item_pedido',                 rotulo: 'Cubagem Unitaria',                       tipo: 'numero', nivel: 'item', grupo: 'Fisico' },

  // Embalagem e documentos
  { campo: 'tipo_embalagem_item_pedido',                   rotulo: 'Tipo de Embalagem',                      tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'numero_lpco_item_pedido',                      rotulo: 'No LPCO',                                tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'numero_certificado_origem_item_pedido',        rotulo: 'No Certificado de Origem',               tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'data_certificado_origem_item_pedido',          rotulo: 'Data Certificado de Origem',             tipo: 'data',   nivel: 'item', grupo: 'Documentos' },

  // Datas do item
  { campo: 'data_embarque_item_pedido',                    rotulo: 'Data de Embarque (Item)',                tipo: 'data',   nivel: 'item', grupo: 'Datas' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Todos os campos (Pedido + Item) numa lista unica. */
export const CAMPOS_PEDIDO_DDD_TODOS: CampoPedidoDDD[] = [...CAMPOS_PEDIDO_DDD, ...CAMPOS_ITEM_DDD]

/** Mapa campo -> rotulo PT-BR (lookup rapido). */
export const ROTULO_POR_CAMPO: Record<string, string> = Object.fromEntries(
  CAMPOS_PEDIDO_DDD_TODOS.map(c => [c.campo, c.rotulo]),
)

/** Mapa de tipo DDD -> formato Excel (numFmt). */
export const FORMATO_EXCEL_POR_TIPO: Record<TipoCampoDDD, string | undefined> = {
  texto:   undefined,
  numero:  '#,##0.00',
  data:    'dd/mm/yyyy',
  select:  undefined,
  usuario: undefined,
}
