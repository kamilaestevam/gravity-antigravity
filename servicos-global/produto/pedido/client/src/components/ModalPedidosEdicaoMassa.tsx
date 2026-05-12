/**
 * ModalEdicaoEmMassa.tsx — Modal de edição em massa de pedidos
 *
 * Fluxo em 2 passos:
 *   Passo 1 — Selecionar campos + valores + preview em tempo real (debounce 300ms)
 *   Passo 2 — Confirmar: resumo com X pedidos · Y itens · Z campos + lista campo→valor
 *
 * Regras de negócio:
 *   - Campos bloqueados (calculados) nunca aparecem na lista editável
 *   - Campos com múltiplos valores entre pedidos: placeholder "Múltiplos valores"
 *   - Toggle de nível: Pedido / Item / Combinado
 *   - Preview em tempo real com debounce 300ms
 *   - Preview "de/para" colapsável por campo, mostrando valor atual → novo por pedido
 *   - Fechar com Escape
 */

import React, { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Warning, Spinner, Plus, X, CheckCircle, MagnifyingGlass, CaretDown, CaretRight, Clock, Info } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { useHasMixedTipos } from '../shared/state/selecaoStore'
import type {
  Pedido,
  CampoEdicaoMassa,
  EdicaoMassaPayload,
  EdicaoMassaPreview,
  OperacaoCampo,
  TipoCampoEdicao,
} from '../shared/types'
import { CAMPOS_BLOQUEADOS_PEDIDO, CAMPOS_BLOQUEADOS_ITEM } from '../shared/types'
import { pedidoEdicaoMassaApi } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalEdicaoMassaPedidosProps {
  pedidos: Pedido[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Definição de campos disponíveis para edição ───────────────────────────────

interface DefinicaoCampo {
  campo: string
  rotulo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  grupo?: string
  // Se definido, o campo só aparece quando a condição for verdadeira para os pedidos selecionados
  visivel?: (pedidos: Pedido[]) => boolean
}

const CAMPOS_PEDIDO_EDITAVEIS: DefinicaoCampo[] = [
  // Identificação
  { campo: 'numero_pedido',                           rotulo: 'Número do Pedido',                       tipo: 'texto',  nivel: 'pedido', grupo: 'Identificação' },
  { campo: 'tipo_operacao',                           rotulo: 'Tipo de Operação',                       tipo: 'select', nivel: 'pedido', grupo: 'Identificação' },

  // Exportador
  // exportador_nome: editável somente em importacao (fornecedor estrangeiro)
  { campo: 'nome_exportador',                         rotulo: 'Exportador — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador',
    visivel: (pedidos: Pedido[]) => pedidos.every(p => p.tipo_operacao === 'importacao') },
  // nome_importador: editável somente em exportacao (cliente estrangeiro)
  { campo: 'nome_importador',                         rotulo: 'Importador — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Importador',
    visivel: (pedidos: Pedido[]) => pedidos.every(p => p.tipo_operacao === 'exportacao') },
  { campo: 'endereco_exportador',                     rotulo: 'Exportador — Endereço',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'pais_exportador',                         rotulo: 'Exportador — País',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'estado_exportador',                       rotulo: 'Exportador — Estado',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'cidade_exportador',                       rotulo: 'Exportador — Cidade',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'zip_code_exportador',                     rotulo: 'Exportador — ZIP Code',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'exportador_ou_fabricante',                rotulo: 'Exportador ou Fabricante',               tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'relacao_exportador_fabricante',           rotulo: 'Relação Export./Fabric.',                tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'nome_contato_exportador',                 rotulo: 'Contato Export. — Nome',                 tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'email_contato_exportador',                rotulo: 'Contato Export. — Email',                tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'whatsapp_contato_exportador',             rotulo: 'Contato Export. — WhatsApp',             tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'cargo_contato_exportador',                rotulo: 'Contato Export. — Cargo',                tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'departamento_contato_exportador',         rotulo: 'Contato Export. — Depto.',               tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },

  // Fabricante
  { campo: 'nome_fabricante',                         rotulo: 'Fabricante — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'endereco_fabricante',                     rotulo: 'Fabricante — Endereço',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'pais_fabricante',                         rotulo: 'Fabricante — País',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'estado_fabricante',                       rotulo: 'Fabricante — Estado',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'cidade_fabricante',                       rotulo: 'Fabricante — Cidade',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'zip_code_fabricante',                     rotulo: 'Fabricante — ZIP Code',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },

  // OPE
  { campo: 'codigo_ope',                              rotulo: 'OPE — Código',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'nome_ope',                                rotulo: 'OPE — Nome',                             tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'endereco_ope',                            rotulo: 'OPE — Endereço',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'pais_ope',                                rotulo: 'OPE — País',                             tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'estado_ope',                              rotulo: 'OPE — Estado',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'cidade_ope',                              rotulo: 'OPE — Cidade',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'zip_code_ope',                            rotulo: 'OPE — ZIP Code',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'tin_ope',                                 rotulo: 'OPE — TIN',                              tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'email_ope',                               rotulo: 'OPE — Email',                            tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'situacao_ope',                            rotulo: 'OPE — Situação',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'versao_ope',                              rotulo: 'OPE — Versão',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'cnpj_raiz_empresa_responsavel',           rotulo: 'CNPJ Raiz Empresa Responsável',          tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },

  // Dados comerciais
  { campo: 'incoterm',                                rotulo: 'Incoterm',                               tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'quantidade_volumes_pedido',               rotulo: 'Qtd. Volumes',                           tipo: 'numero', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'cobertura_cambial',                       rotulo: 'Cobertura Cambial',                      tipo: 'texto',  nivel: 'item',   grupo: 'Comercial' },
  { campo: 'nome_exportador',                         rotulo: 'Nome do Exportador (por item)',           tipo: 'texto',  nivel: 'item',   grupo: 'Partes' },
  { campo: 'nome_importador',                         rotulo: 'Nome do Importador (por item)',           tipo: 'texto',  nivel: 'item',   grupo: 'Partes' },
  { campo: 'condicao_pagamento',               rotulo: 'Cond. Pagamento',                        tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },

  // Dados físicos — campos UNITÁRIOS por item (peso/cubagem total do pedido
  // são agregados derivados, calculados server-side por
  // `recalcularAgregadosPedido`. Editá-los direto causaria divergência com
  // a soma real dos itens — bloqueado pelo backend desde Onda A3.)
  { campo: 'peso_liquido_unitario',                   rotulo: 'Peso Líquido Unitário',                  tipo: 'numero', nivel: 'item',   grupo: 'Físico' },
  { campo: 'peso_bruto_unitario',                     rotulo: 'Peso Bruto Unitário',                    tipo: 'numero', nivel: 'item',   grupo: 'Físico' },
  { campo: 'cubagem_unitaria',                        rotulo: 'Cubagem Unitária',                       tipo: 'numero', nivel: 'item',   grupo: 'Físico' },

  // Documentos
  { campo: 'numero_proforma',                         rotulo: 'Nº Proforma',                            tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'numero_invoice',                          rotulo: 'Nº Invoice',                             tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_importador',                   rotulo: 'Referência Importador',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_exportador',                   rotulo: 'Referência Exportador',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_fabricante',                   rotulo: 'Referência Fabricante',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },

  // Portos / Logística
  { campo: 'porto_origem',                            rotulo: 'Porto Origem',                           tipo: 'texto',  nivel: 'pedido', grupo: 'Logística' },
  { campo: 'porto_destino',                           rotulo: 'Porto Destino',                          tipo: 'texto',  nivel: 'pedido', grupo: 'Logística' },

  // Datas principais
  { campo: 'data_emissao_pedido',                     rotulo: 'Data de Emissão',                        tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_embarque',                           rotulo: 'Data de Embarque',                       tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_prevista_pedido_pronto',             rotulo: 'Data Prevista — Pedido Pronto',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_confirmada_pedido_pronto',           rotulo: 'Data Confirmada — Pedido Pronto',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_meta_pedido_pronto',                 rotulo: 'Data Meta — Pedido Pronto',              tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_prevista_inspecao_pedido',           rotulo: 'Data Prevista — Inspeção',               tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_confirmada_inspecao_pedido',         rotulo: 'Data Confirmada — Inspeção',             tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_meta_inspecao_pedido',               rotulo: 'Data Meta — Inspeção',                   tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_prevista_coleta_pedido',             rotulo: 'Data Prevista — Coleta',                 tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_confirmada_coleta_pedido',           rotulo: 'Data Confirmada — Coleta',               tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_meta_coleta_pedido',                 rotulo: 'Data Meta — Coleta',                     tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_consolidacao_pedido',                rotulo: 'Data Consolidação',                      tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_transferencia_saldo_pedido',         rotulo: 'Data Transferência Saldo',               tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_documento_pedido',                   rotulo: 'Data Documento Pedido',                  tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },

  // Datas — Draft Pedido
  { campo: 'data_prevista_recebimento_rascunho_pedido',  rotulo: 'Draft Pedido — Prev. Receb.',            tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_confirmada_recebimento_rascunho_pedido',rotulo: 'Draft Pedido — Conf. Receb.',            tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_meta_recebimento_rascunho_pedido',      rotulo: 'Draft Pedido — Meta Receb.',             tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_prevista_aprovacao_rascunho_pedido',    rotulo: 'Draft Pedido — Prev. Aprovação',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_confirmada_aprovacao_rascunho_pedido',  rotulo: 'Draft Pedido — Conf. Aprovação',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_meta_aprovacao_rascunho_pedido',        rotulo: 'Draft Pedido — Meta Aprovação',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },

  // Datas — Draft Proforma
  { campo: 'data_prevista_recebimento_rascunho_proforma',rotulo: 'Draft Proforma — Prev. Receb.',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmada_recebimento_rascunho_proforma',rotulo:'Draft Proforma — Conf. Receb.',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_recebimento_rascunho_proforma',    rotulo: 'Draft Proforma — Meta Receb.',           tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_prevista_aprovacao_rascunho_proforma',  rotulo: 'Draft Proforma — Prev. Aprovação',       tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmada_aprovacao_rascunho_proforma',rotulo: 'Draft Proforma — Conf. Aprovação',       tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_aprovacao_rascunho_proforma',      rotulo: 'Draft Proforma — Meta Aprovação',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_prevista_envio_original_proforma',   rotulo: 'Original Proforma — Prev. Envio',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmada_envio_original_proforma', rotulo: 'Original Proforma — Conf. Envio',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_envio_original_proforma',       rotulo: 'Original Proforma — Meta Envio',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_prevista_recebimento_original_proforma',rotulo:'Original Proforma — Prev. Receb.',     tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmada_recebimento_original_proforma',rotulo:'Original Proforma — Conf. Receb.',   tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_recebimento_original_proforma', rotulo: 'Original Proforma — Meta Receb.',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_proforma_invoice',                   rotulo: 'Data Proforma Invoice',                  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },

  // Datas — Draft Invoice
  { campo: 'data_prevista_recebimento_rascunho_invoice', rotulo: 'Draft Invoice — Prev. Receb.',           tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmada_recebimento_rascunho_invoice',rotulo:'Draft Invoice — Conf. Receb.',           tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_recebimento_rascunho_invoice',     rotulo: 'Draft Invoice — Meta Receb.',            tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_prevista_aprovacao_rascunho_invoice',   rotulo: 'Draft Invoice — Prev. Aprovação',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmada_aprovacao_rascunho_invoice', rotulo: 'Draft Invoice — Conf. Aprovação',        tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_aprovacao_rascunho_invoice',       rotulo: 'Draft Invoice — Meta Aprovação',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_prevista_envio_original_invoice',    rotulo: 'Original Invoice — Prev. Envio',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmada_envio_original_invoice',  rotulo: 'Original Invoice — Conf. Envio',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_envio_original_invoice',        rotulo: 'Original Invoice — Meta Envio',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_prevista_recebimento_original_invoice',rotulo:'Original Invoice — Prev. Receb.',       tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmada_recebimento_original_invoice',rotulo:'Original Invoice — Conf. Receb.',     tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_recebimento_original_invoice',  rotulo: 'Original Invoice — Meta Receb.',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_invoice',                            rotulo: 'Data Invoice',                           tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
]

const CAMPOS_ITEM_EDITAVEIS: DefinicaoCampo[] = [
  // Identificação do produto
  { campo: 'part_number',                             rotulo: 'Part Number',                            tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'ncm',                                     rotulo: 'NCM',                                    tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_item',                          rotulo: 'Descrição do Item',                      tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_pt',               rotulo: 'Descrição Completa',                     tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_en',              rotulo: 'Descrição (EN)',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_es',              rotulo: 'Descrição (ES)',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_nf',              rotulo: 'Descrição Espelho NF',                   tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'texto_posicao_ncm',                       rotulo: 'Texto Posição NCM',                      tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'grupo_item',                              rotulo: 'Grupo Produto',                          tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'subgrupo_item',                           rotulo: 'Subgrupo Produto',                       tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'campo_especial_item',                     rotulo: 'Campo Especial',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'atributos_catalogo',                      rotulo: 'Atributos Catálogo',                     tipo: 'texto',  nivel: 'item', grupo: 'Produto' },

  // Quantidades
  { campo: 'quantidade_inicial_pedido',           rotulo: 'Qtd. Inicial',                           tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_transferida_pedido',       rotulo: 'Qtd. Transferida',                       tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_pronta_total_item_pedido',     rotulo: 'Qtd. Pronta',                            tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_cancelada_pedido',        rotulo: 'Qtd. Cancelada',                         tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'casas_decimais_quantidade_item',           rotulo: 'Casas Decimais — Qtd.',                  tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },

  // Financeiro

  // Pesos e cubagem
  { campo: 'peso_liquido_unitario',               rotulo: 'Peso Líquido Unitário',                  tipo: 'numero', nivel: 'item', grupo: 'Físico' },
  { campo: 'peso_bruto_unitario',                rotulo: 'Peso Bruto Unitário',                    tipo: 'numero', nivel: 'item', grupo: 'Físico' },
  { campo: 'cubagem_unitaria',                   rotulo: 'Cubagem Unitária',                       tipo: 'numero', nivel: 'item', grupo: 'Físico' },

  // Embalagem e documentos
  { campo: 'tipo_embalagem',                          rotulo: 'Tipo Embalagem',                         tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'numero_lpco',                             rotulo: 'Nº LPCO',                                tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'numero_certificado_origem',               rotulo: 'Nº Cert. Origem',                        tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'data_certificado_origem',                 rotulo: 'Data Cert. Origem',                      tipo: 'data',   nivel: 'item', grupo: 'Documentos' },

  // Datas do item
  { campo: 'data_embarque_item',                      rotulo: 'Data Embarque (Item)',                   tipo: 'data',   nivel: 'item', grupo: 'Datas' },
]

const OPERACOES_POR_TIPO: Record<TipoCampoEdicao, OperacaoCampo[]> = {
  texto:   ['substituir'],
  select:  ['substituir'],
  usuario: ['substituir'],
  numero:  ['substituir', 'somar', 'subtrair', 'percentual'],
  data:    ['substituir', 'avancar_dias', 'recuar_dias'],
}

const OP_NOME_KEYS: Record<OperacaoCampo, string> = {
  substituir:   'pedido.modal_massa.op_substituir',
  somar:        'pedido.modal_massa.op_somar',
  subtrair:     'pedido.modal_massa.op_subtrair',
  percentual:   'pedido.modal_massa.op_percentual',
  avancar_dias: 'pedido.modal_massa.op_avancar_dias',
  recuar_dias:  'pedido.modal_massa.op_recuar_dias',
}

const OP_LABEL_KEYS: Record<OperacaoCampo, string> = {
  substituir:   'pedido.modal_massa.op_label_substituir',
  somar:        'pedido.modal_massa.op_label_somar',
  subtrair:     'pedido.modal_massa.op_label_subtrair',
  percentual:   'pedido.modal_massa.op_label_percentual',
  avancar_dias: 'pedido.modal_massa.op_label_avancar',
  recuar_dias:  'pedido.modal_massa.op_label_recuar',
}

// Campos que exigem processamento individual por pedido (merge JSON no backend)
// Deve espelhar CAMPOS_DETALHES_OPERACIONAIS em edicaoEmMassaService.ts
const CAMPOS_DETALHES_OPERACIONAIS_LENTO = new Set(['nome_exportador', 'nome_importador', 'nome_fabricante'])

// ── Estado de um campo em edição ─────────────────────────────────────────────

interface CampoEmEdicao {
  uid: string             // chave única no UI (não é o campo em si)
  campo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string
}

function criarCampoVazio(def: DefinicaoCampo): CampoEmEdicao {
  const operacoes = OPERACOES_POR_TIPO[def.tipo]
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    campo: def.campo,
    tipo: def.tipo,
    nivel: def.nivel,
    operacao: operacoes[0],
    valor: '',
  }
}

// ── Tipo de nível ─────────────────────────────────────────────────────────────

type NivelEdicao = 'pedido' | 'item' | 'combinado'

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectarMultiplosValores(pedidos: Pedido[], campo: string): boolean {
  const valores = pedidos.map(p => String((p as Record<string, unknown>)[campo] ?? ''))
  return new Set(valores).size > 1
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string

function inputPlaceholder(campo: CampoEmEdicao, pedidos: Pedido[], t: TFunc): string {
  if (campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)) {
    return t('pedido.modal_massa.multiplos_valores')
  }
  return ''
}

function camposParaNivel(nivel: NivelEdicao, pedidos: Pedido[] = []): DefinicaoCampo[] {
  const filtrar = (lista: DefinicaoCampo[]) =>
    lista.filter(d => !d.visivel || d.visivel(pedidos))
  if (nivel === 'pedido')   return filtrar(CAMPOS_PEDIDO_EDITAVEIS)
  if (nivel === 'item')     return filtrar(CAMPOS_ITEM_EDITAVEIS)
  return filtrar([...CAMPOS_PEDIDO_EDITAVEIS, ...CAMPOS_ITEM_EDITAVEIS])
}

function estasBloqueado(campo: string, nivel: 'pedido' | 'item'): boolean {
  if (nivel === 'pedido') return CAMPOS_BLOQUEADOS_PEDIDO.has(campo)
  return CAMPOS_BLOQUEADOS_ITEM.has(campo)
}

function formatarValorExibicao(valor: string | number | null, t: TFunc): string {
  if (valor === null || valor === undefined || valor === '') return t('pedido.modal_massa.valor_vazio')
  return String(valor)
}

// ── ComboboxCampo — seletor de campo com busca ────────────────────────────────

interface ComboboxCampoProps {
  disponiveis: DefinicaoCampo[]
  valorAtual: string
  uid: string
  onChange: (uid: string, novoCampo: string) => void
}

function ComboboxCampo({ disponiveis, valorAtual, uid, onChange }: ComboboxCampoProps) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [indiceFocado, setIndiceFocado] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)

  const defAtual = disponiveis.find(d => d.campo === valorAtual)

  const filtrados = busca.trim() === ''
    ? disponiveis
    : disponiveis.filter(d =>
        t(`pedido.massa_campos.${d.campo}`).toLowerCase().includes(busca.toLowerCase()) ||
        d.campo.toLowerCase().includes(busca.toLowerCase()) ||
        (d.grupo ?? '').toLowerCase().includes(busca.toLowerCase())
      )

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
        setBusca('')
      }
    }
    if (aberto) {
      document.addEventListener('mousedown', handleClickFora)
    }
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [aberto])

  // Scroll automático para item focado
  useEffect(() => {
    if (!aberto || !listaRef.current) return
    const item = listaRef.current.querySelector(`[data-index="${indiceFocado}"]`) as HTMLElement | null
    item?.scrollIntoView({ block: 'nearest' })
  }, [indiceFocado, aberto])

  // Resetar foco quando busca muda
  useEffect(() => {
    setIndiceFocado(0)
  }, [busca])

  const handleAbrirFechar = () => {
    const novoAberto = !aberto
    setAberto(novoAberto)
    setBusca('')
    if (novoAberto) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleSelecionar = (campo: string) => {
    onChange(uid, campo)
    setAberto(false)
    setBusca('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setIndiceFocado(i => Math.min(i + 1, filtrados.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setIndiceFocado(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filtrados[indiceFocado]) {
          handleSelecionar(filtrados[indiceFocado].campo)
        }
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        setAberto(false)
        setBusca('')
        break
    }
  }

  // Agrupar filtrados por grupo
  const grupos: { grupo: string; itens: DefinicaoCampo[] }[] = []
  filtrados.forEach(d => {
    const g = d.grupo ?? 'Outros'
    const existing = grupos.find(grp => grp.grupo === g)
    if (existing) {
      existing.itens.push(d)
    } else {
      grupos.push({ grupo: g, itens: [d] })
    }
  })

  // Mapear índice global para cada item
  let globalIndex = 0
  const itemsComIndex = grupos.flatMap(g => g.itens.map(item => ({ ...item, globalIndex: globalIndex++ })))

  return (
    <div
      ref={containerRef}
      className="modal-edicao-massa__combobox"
      role="combobox"
      aria-expanded={aberto}
      aria-haspopup="listbox"
    >
      {/* Trigger */}
      <button
        type="button"
        className="modal-edicao-massa__combobox-trigger"
        onClick={handleAbrirFechar}
        aria-label={t('pedido.modal_massa.aria_selecionar_campo')}
      >
        <span className="modal-edicao-massa__combobox-valor">
          {defAtual ? (
            <>
              {t(`pedido.massa_campos.${defAtual.campo}`)}
              {defAtual.nivel === 'item' && (
                <span className="modal-edicao-massa__combobox-badge">(item)</span>
              )}
            </>
          ) : (
            <span style={{ color: 'var(--color-text-muted, #64748b)' }}>{t('pedido.modal_massa.campo_placeholder')}</span>
          )}
        </span>
        <CaretDown
          size={12}
          className={`modal-edicao-massa__combobox-caret${aberto ? ' modal-edicao-massa__combobox-caret--aberto' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="modal-edicao-massa__combobox-dropdown">
          {/* Busca */}
          <div className="modal-edicao-massa__combobox-busca">
            <MagnifyingGlass size={13} className="modal-edicao-massa__combobox-busca-icone" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="modal-edicao-massa__combobox-busca-input"
              placeholder={t('pedido.modal_massa.buscar_campo')}
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={t('pedido.modal_massa.buscar_campo')}
              aria-autocomplete="list"
              autoComplete="off"
            />
          </div>

          {/* Lista */}
          {filtrados.length === 0 ? (
            <div className="modal-edicao-massa__combobox-vazio">
              {t('pedido.modal_massa.nenhum_campo')}
            </div>
          ) : (
            <ul
              ref={listaRef}
              className="modal-edicao-massa__combobox-lista"
              role="listbox"
              aria-label={t('pedido.modal_massa.aria_campos_disponiveis')}
            >
              {grupos.map(grupo => (
                <React.Fragment key={grupo.grupo}>
                  <li
                    className="modal-edicao-massa__combobox-grupo"
                    role="presentation"
                    aria-hidden="true"
                  >
                    {grupo.grupo}
                  </li>
                  {grupo.itens.map(item => {
                    const idx = itemsComIndex.find(i => i.campo === item.campo)?.globalIndex ?? 0
                    const selecionado = item.campo === valorAtual
                    const focado = idx === indiceFocado
                    return (
                      <li
                        key={item.campo}
                        data-index={idx}
                        role="option"
                        aria-selected={selecionado}
                        className={[
                          'modal-edicao-massa__combobox-item',
                          selecionado ? 'modal-edicao-massa__combobox-item--selecionado' : '',
                          focado ? 'modal-edicao-massa__combobox-item--focado' : '',
                        ].join(' ')}
                        onMouseDown={e => {
                          e.preventDefault()
                          handleSelecionar(item.campo)
                        }}
                        onMouseEnter={() => setIndiceFocado(idx)}
                      >
                        <span className="modal-edicao-massa__combobox-item-rotulo">{t(`pedido.massa_campos.${item.campo}`)}</span>
                      </li>
                    )
                  })}
                </React.Fragment>
              ))}
            </ul>
          )}

          {/* Contador */}
          <div className="modal-edicao-massa__combobox-contador" aria-live="polite">
            {filtrados.length} campo{filtrados.length !== 1 ? 's' : ''}
            {busca && ` para "${busca}"`}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PreviewDePara — seção de-para colapsável ─────────────────────────────────

interface PreviewDeparaProps {
  preview: EdicaoMassaPreview
  disponiveis: DefinicaoCampo[]
}

function PreviewDepara({ preview, disponiveis }: PreviewDeparaProps) {
  const { t } = useTranslation()
  const [campoExpandido, setCampoExpandido] = useState<string | null>(null)

  if (!preview.por_pedido || preview.por_pedido.length === 0) return null

  // Coletar todos os campos únicos que têm alterações
  const camposComAlteracoes = preview.campos.map(c => c.campo)

  if (camposComAlteracoes.length === 0) return null

  const toggleCampo = (campo: string) => {
    setCampoExpandido(prev => prev === campo ? null : campo)
  }

  return (
    <div className="modal-edicao-massa__depara">
      <p className="modal-edicao-massa__depara-titulo">{t('pedido.modal_massa.depara_titulo')}</p>
      {camposComAlteracoes.map(campo => {
        const rotulo = t(`pedido.massa_campos.${campo}`)
        const expandido = campoExpandido === campo

        const linhas = preview.por_pedido!.flatMap(pp =>
          pp.alteracoes
            .filter(a => a.campo === campo)
            .map(a => ({ pedido_id: pp.pedido_id, numero_pedido: pp.numero_pedido, ...a }))
        )

        if (linhas.length === 0) return null

        const semAlteracao = linhas.filter(l =>
          String(l.valor_atual ?? '') === String(l.valor_novo ?? '')
        ).length

        return (
          <div key={campo} className="modal-edicao-massa__depara-campo">
            <button
              type="button"
              className="modal-edicao-massa__depara-campo-header"
              onClick={() => toggleCampo(campo)}
              aria-expanded={expandido}
              aria-controls={`depara-${campo}`}
            >
              <span className="modal-edicao-massa__depara-campo-caret" aria-hidden="true">
                {expandido ? <CaretDown size={12} /> : <CaretRight size={12} />}
              </span>
              <span className="modal-edicao-massa__depara-campo-nome">{rotulo}</span>
              <span className="modal-edicao-massa__depara-campo-stat">
                {linhas.length - semAlteracao} alteração{linhas.length - semAlteracao !== 1 ? 'ões' : ''}
                {semAlteracao > 0 && ` · ${semAlteracao} ${t('pedido.modal_massa.depara_sem_alteracao')}`}
              </span>
            </button>

            {expandido && (
              <ul
                id={`depara-${campo}`}
                className="modal-edicao-massa__depara-lista"
                aria-label={`Alterações de ${rotulo} por pedido`}
              >
                {linhas.map(linha => {
                  const semMudanca = String(linha.valor_atual ?? '') === String(linha.valor_novo ?? '')
                  return (
                    <li
                      key={linha.pedido_id}
                      className={`modal-edicao-massa__depara-linha${semMudanca ? ' modal-edicao-massa__depara-linha--igual' : ''}`}
                    >
                      <span className="modal-edicao-massa__depara-linha-numero">
                        {linha.numero_pedido}
                      </span>
                      <span className="modal-edicao-massa__depara-linha-de">
                        &ldquo;{formatarValorExibicao(linha.valor_atual, t)}&rdquo;
                      </span>
                      <span className="modal-edicao-massa__depara-linha-seta" aria-hidden="true">→</span>
                      <span className={`modal-edicao-massa__depara-linha-para${semMudanca ? ' modal-edicao-massa__depara-linha-para--igual' : ''}`}>
                        &ldquo;{formatarValorExibicao(linha.valor_novo, t)}&rdquo;
                      </span>
                      {semMudanca && (
                        <span className="modal-edicao-massa__depara-linha-badge">{t('pedido.modal_massa.depara_sem_alteracao')}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalEdicaoMassaPedidos({ pedidos, onFechar, onConcluido }: ModalEdicaoMassaPedidosProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()
  const hasMixedTipos = useHasMixedTipos()
  const [passo, setPasso] = useState<1 | 2>(1)
  const [nivel, setNivel] = useState<NivelEdicao>('pedido')
  const [campos, setCampos] = useState<CampoEmEdicao[]>([])
  const [preview, setPreview] = useState<EdicaoMassaPreview | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inicializar com primeiro campo disponível
  useEffect(() => {
    const disponiveis = camposParaNivel(nivel, pedidos)
    if (disponiveis.length > 0) {
      setCampos([criarCampoVazio(disponiveis[0])])
    }
    setPreview(null)
  }, [nivel])

  // Fechar com Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onFechar])

  // Preview em tempo real com debounce 300ms
  const solicitarPreview = useCallback(() => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '' && !estasBloqueado(c.campo, c.nivel))
    if (camposValidos.length === 0) {
      setPreview(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setCarregandoPreview(true)
      try {
        const payload: EdicaoMassaPayload = {
          pedido_ids: pedidos.map(p => p.id),
          campos: camposValidos.map(c => ({
            campo: c.campo,
            tipo: c.tipo,
            nivel: c.nivel,
            operacao: c.operacao,
            valor: c.tipo === 'numero' || c.operacao !== 'substituir' ? Number(c.valor) : c.valor,
          })),
          nivel,
        }
        const result = await pedidoEdicaoMassaApi.preview(payload)
        setPreview(result)
        setErroGeral(null)
      } catch (err: unknown) {
        setErroGeral(err instanceof Error ? err.message : t('pedido.modal_massa.erro_preview'))
      } finally {
        setCarregandoPreview(false)
      }
    }, 300)
  }, [campos, pedidos, nivel])

  // Reacionar a mudanças nos campos
  useEffect(() => {
    solicitarPreview()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [solicitarPreview])

  // ── Handlers de campos ───────────────────────────────────────────────────────

  const handleAdicionarCampo = useCallback(() => {
    const disponiveis = camposParaNivel(nivel, pedidos)
    if (disponiveis.length > 0) {
      setCampos(prev => [...prev, criarCampoVazio(disponiveis[0])])
    }
  }, [nivel])

  const handleRemoverCampo = useCallback((uid: string) => {
    setCampos(prev => prev.filter(c => c.uid !== uid))
  }, [])

  const handleMudarCampoDef = useCallback((uid: string, novoCampo: string) => {
    const disponiveis = camposParaNivel(nivel, pedidos)
    const def = disponiveis.find(d => d.campo === novoCampo)
    if (!def) return
    setCampos(prev => prev.map(c => {
      if (c.uid !== uid) return c
      const ops = OPERACOES_POR_TIPO[def.tipo]
      return { ...c, campo: def.campo, tipo: def.tipo, nivel: def.nivel, operacao: ops[0], valor: '' }
    }))
  }, [nivel])

  const handleMudarOperacao = useCallback((uid: string, operacao: OperacaoCampo) => {
    setCampos(prev => prev.map(c => c.uid === uid ? { ...c, operacao } : c))
  }, [])

  const handleMudarValor = useCallback((uid: string, valor: string) => {
    setCampos(prev => prev.map(c => c.uid === uid ? { ...c, valor } : c))
  }, [])

  // ── Avancar para passo 2 ──────────────────────────────────────────────────────

  const handleAvancar = useCallback(() => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '')
    if (camposValidos.length === 0) {
      setErroGeral(t('pedido.modal_massa.erro_campo_obrigatorio'))
      return
    }
    setErroGeral(null)
    setPasso(2)
  }, [campos])

  // ── Confirmar edição em massa ─────────────────────────────────────────────────

  const handleConfirmar = useCallback(async () => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '' && !estasBloqueado(c.campo, c.nivel))
    if (camposValidos.length === 0) return

    setSalvando(true)
    setErroSalvar(null)

    const payload: EdicaoMassaPayload = {
      pedido_ids: pedidos.map(p => p.id),
      campos: camposValidos.map(c => ({
        campo: c.campo,
        tipo: c.tipo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.tipo === 'numero' || c.operacao !== 'substituir' ? Number(c.valor) : c.valor,
      })),
      nivel,
    }

    try {
      await pedidoEdicaoMassaApi.confirmar(payload)
      const camposNomes = camposValidos.map(c => c.campo).join(', ')
      addNotification({ type: 'success', message: `${camposNomes} atualizado(s) em ${pedidos.length} PO(s).`, duration: 4000 })
      onConcluido()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('pedido.modal_massa.erro_aplicar')
      setErroSalvar(msg)
      addNotification({ type: 'error', message: `Falha na edição em massa: ${msg}`, duration: 4000 })
    } finally {
      setSalvando(false)
    }
  }, [campos, pedidos, nivel, onConcluido, addNotification])

  // ── Render helpers ────────────────────────────────────────────────────────────

  const camposValidos = campos.filter(c => c.valor.trim() !== '')
  const disponiveis = camposParaNivel(nivel, pedidos)

  // Detecta caminho lento: espelha a lógica do backend (todosCamposPedidoSaoRapidos).
  // Lento = qualquer campo com operação diferente de substituir, campo em
  // detalhes_operacionais, ou qualquer campo de nível item.
  const isCaminhoLento = camposValidos.some(c =>
    c.nivel === 'item' ||
    c.operacao !== 'substituir' ||
    CAMPOS_DETALHES_OPERACIONAIS_LENTO.has(c.campo),
  )
  const estimadoSegundos = Math.max(5, Math.round(pedidos.length * 0.5))
  const mostrarAvisoPerformance = isCaminhoLento && pedidos.length > 5

  const renderPasso1 = () => (
    <>
      {/* Toggle de nível */}
      <div className="modal-edicao-massa__secao">
        <div className="modal-edicao-massa__nivel-toggle" role="group" aria-label={t('pedido.modal_massa.aria_nivel_edicao')}>
          {(['pedido', 'item', 'combinado'] as NivelEdicao[]).map(n => (
            <button
              key={n}
              type="button"
              className={`modal-edicao-massa__nivel-btn${nivel === n ? ' modal-edicao-massa__nivel-btn--ativo' : ''}`}
              onClick={() => setNivel(n)}
              aria-pressed={nivel === n}
            >
              {n === 'pedido' ? t('pedido.modal_massa.nivel_pedido') : n === 'item' ? t('pedido.modal_massa.nivel_item') : t('pedido.modal_massa.nivel_combinado')}
            </button>
          ))}
        </div>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      {/* Lista de campos */}
      <div className="modal-edicao-massa__secao">
        <p className="modal-edicao-massa__secao-titulo">{t('pedido.modal_massa.secao_campos')}</p>
        <div className="modal-edicao-massa__campos-lista">
          {campos.map(campo => {
            const ops = OPERACOES_POR_TIPO[campo.tipo]
            const temMultiplos = campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)
            const placeholder = inputPlaceholder(campo, pedidos, t)

            return (
              <div key={campo.uid} className="modal-edicao-massa__campo-linha">
                {/* Seletor de campo — combobox com busca */}
                <ComboboxCampo
                  disponiveis={disponiveis}
                  valorAtual={campo.campo}
                  uid={campo.uid}
                  onChange={handleMudarCampoDef}
                />

                {/* Seletor de operação */}
                <select
                  className="modal-edicao-massa__select"
                  value={campo.operacao}
                  onChange={e => handleMudarOperacao(campo.uid, e.target.value as OperacaoCampo)}
                  aria-label={`Operação para ${campo.campo}`}
                >
                  {ops.map(op => (
                    <option key={op} value={op}>{t(OP_NOME_KEYS[op])}</option>
                  ))}
                </select>

                {/* Input de valor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <input
                    className="modal-edicao-massa__input"
                    type={campo.tipo === 'data' && campo.operacao === 'substituir' ? 'date'
                      : campo.tipo === 'numero' || campo.operacao !== 'substituir' ? 'number'
                      : 'text'}
                    value={campo.valor}
                    onChange={e => handleMudarValor(campo.uid, e.target.value)}
                    placeholder={placeholder || t('pedido.modal_massa.valor_placeholder')}
                    aria-label={`Valor para ${campo.campo}`}
                  />
                  {temMultiplos && (
                    <span className="modal-edicao-massa__badge-multiplos">
                      <Warning size={11} weight="fill" aria-hidden="true" />
                      {t('pedido.modal_massa.multiplos_valores')}
                    </span>
                  )}
                </div>

                {/* Botão remover */}
                {campos.length > 1 && (
                  <button
                    type="button"
                    className="modal-edicao-massa__remover-campo"
                    onClick={() => handleRemoverCampo(campo.uid)}
                    aria-label={`Remover campo ${campo.campo}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Botão adicionar campo */}
        <button
          type="button"
          className="modal-edicao-massa__adicionar-campo"
          onClick={handleAdicionarCampo}
        >
          <Plus size={14} />
          {t('pedido.modal_massa.adicionar_campo')}
        </button>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      {/* Preview em tempo real */}
      <div className="modal-edicao-massa__preview" aria-live="polite">
        <p className="modal-edicao-massa__preview-titulo">{t('pedido.modal_massa.preview_titulo')}</p>

        {carregandoPreview ? (
          <div className="modal-edicao-massa__preview-loading">
            <Spinner size={14} className="modal-edicao-massa__spinner" aria-hidden="true" />
            <span>{t('pedido.modal_massa.preview_calculando')}</span>
          </div>
        ) : preview ? (
          <>
            <div className="modal-edicao-massa__preview-resumo">
              <div className="modal-edicao-massa__preview-stat">
                <strong>{preview.pedidos_afetados}</strong>
                <span>{t('pedido.modal_massa.preview_pedidos')}</span>
              </div>
              {preview.itens_afetados > 0 && (
                <div className="modal-edicao-massa__preview-stat">
                  <strong>{preview.itens_afetados}</strong>
                  <span>{t('pedido.modal_massa.preview_itens')}</span>
                </div>
              )}
              <div className="modal-edicao-massa__preview-stat">
                <strong>{preview.campos.length}</strong>
                <span>{t('pedido.modal_massa.preview_campos')}</span>
              </div>
            </div>

            {preview.campos.length > 0 && (
              <div className="modal-edicao-massa__preview-campos">
                {preview.campos.map((c, i) => (
                  <div key={i} className="modal-edicao-massa__preview-campo">
                    <span className="modal-edicao-massa__preview-campo-nome">{c.campo}</span>
                    <span className="modal-edicao-massa__preview-campo-op">
                      {t(OP_LABEL_KEYS[c.operacao])}
                    </span>
                    <span className="modal-edicao-massa__preview-campo-valor">{String(c.valor)}</span>
                    {c.multiplos_valores && (
                      <span className="modal-edicao-massa__badge-multiplos">
                        <Warning size={11} weight="fill" aria-hidden="true" />
                        múltiplos valores
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Detalhe de/para por pedido */}
            <PreviewDepara preview={preview} disponiveis={disponiveis} />

            {preview.alertas_globais.length > 0 && preview.alertas_globais.map((alerta, i) => (
              <div key={i} className="modal-edicao-massa__alerta">
                <Warning size={14} weight="fill" aria-hidden="true" />
                {alerta}
              </div>
            ))}
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted, #64748b)' }}>
            {t('pedido.modal_massa.preview_vazio')}
          </span>
        )}
      </div>

      {erroGeral && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroGeral}
        </div>
      )}
    </>
  )

  const renderPasso2 = () => (
    <div className="modal-edicao-massa__confirmacao">
      {/* Resumo */}
      <div className="modal-edicao-massa__confirmacao-resumo" aria-label={t('pedido.modal_massa.aria_resumo')}>
        <div className="modal-edicao-massa__confirmacao-stat">
          <strong>{preview?.pedidos_afetados ?? pedidos.length}</strong> {t('pedido.modal_massa.confirm_pedidos')}
        </div>
        {(preview?.itens_afetados ?? 0) > 0 && (
          <div className="modal-edicao-massa__confirmacao-stat">
            <strong>{preview?.itens_afetados}</strong> {t('pedido.modal_massa.confirm_itens')}
          </div>
        )}
        <div className="modal-edicao-massa__confirmacao-stat">
          <strong>{camposValidos.length}</strong> {t('pedido.modal_massa.confirm_campos')}
        </div>
      </div>

      {/* Lista de campos */}
      <div className="modal-edicao-massa__confirmacao-lista">
        {camposValidos.map(c => (
          <div key={c.uid} className="modal-edicao-massa__confirmacao-item">
            <span className="modal-edicao-massa__confirmacao-item-campo">
              {t(`pedido.massa_campos.${c.campo}`)}
            </span>
            <span className="modal-edicao-massa__confirmacao-item-op">
              {t(OP_LABEL_KEYS[c.operacao])}
            </span>
            <span className="modal-edicao-massa__confirmacao-item-valor">{c.valor}</span>
            <span className="modal-edicao-massa__confirmacao-item-nivel">
              {c.nivel}
            </span>
          </div>
        ))}
      </div>

      {/* Detalhe de/para na confirmação */}
      {preview && <PreviewDepara preview={preview} disponiveis={disponiveis} />}

      {preview?.alertas_globais && preview.alertas_globais.length > 0 && (
        preview.alertas_globais.map((alerta, i) => (
          <div key={i} className="modal-edicao-massa__alerta">
            <Warning size={14} weight="fill" aria-hidden="true" />
            {alerta}
          </div>
        ))
      )}

      {mostrarAvisoPerformance && (
        <div className="modal-edicao-massa__alerta" role="note">
          <Clock size={14} weight="fill" aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            {t('pedido.modal_massa.aviso_lento', { count: pedidos.length, segundos: estimadoSegundos })}
          </span>
        </div>
      )}

      {erroSalvar && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroSalvar}
        </div>
      )}
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className="modal-edicao-massa__overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edicao-massa-titulo"
    >
      <div className="modal-edicao-massa__container">
        {/* Header */}
        <div className="modal-edicao-massa__header">
          <h2 id="modal-edicao-massa-titulo" className="modal-edicao-massa__titulo">
            {t('pedido.modal_massa.titulo', { count: pedidos.length, s: pedidos.length !== 1 ? 's' : '' })}
          </h2>
          <button
            className="modal-edicao-massa__fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_massa.aria_fechar')}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Corpo */}
        <div className="modal-edicao-massa__corpo">
          {/* Banner informativo: pedidos de tipos diferentes selecionados */}
          {hasMixedTipos && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}>
              <Info weight="duotone" size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                  {t('pedido.modal_massa.mixed_tipos_titulo')}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                  {t('pedido.modal_massa.mixed_tipos_msg')}
                </p>
              </div>
            </div>
          )}
          {passo === 1 ? renderPasso1() : renderPasso2()}
        </div>

        {/* Footer */}
        <div className="modal-edicao-massa__footer">
          {/* Indicador de passos */}
          <div className="modal-edicao-massa__passos" aria-label={t('pedido.modal_massa.aria_passo_atual')}>
            <span
              className={`modal-edicao-massa__passo${passo === 1 ? ' modal-edicao-massa__passo--ativo' : ' modal-edicao-massa__passo--concluido'}`}
              aria-current={passo === 1 ? 'step' : undefined}
            >
              {passo === 1 ? '1' : <CheckCircle size={12} weight="fill" aria-hidden="true" />}
            </span>
            <span className="modal-edicao-massa__passo-separador" />
            <span
              className={`modal-edicao-massa__passo${passo === 2 ? ' modal-edicao-massa__passo--ativo' : ''}`}
              aria-current={passo === 2 ? 'step' : undefined}
            >
              2
            </span>
          </div>

          <div className="modal-edicao-massa__footer-direita">
            {passo === 2 && (
              <BotaoGlobal
                variante="secundario"
                tamanho="medio"
                onClick={() => setPasso(1)}
                disabled={salvando}
              >
                {t('pedido.modal_massa.voltar')}
              </BotaoGlobal>
            )}

            <BotaoGlobal
              variante="secundario"
              tamanho="medio"
              onClick={onFechar}
              disabled={salvando}
            >
              {t('pedido.modal_massa.cancelar')}
            </BotaoGlobal>

            {passo === 1 ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleAvancar}
                disabled={camposValidos.length === 0 || carregandoPreview}
              >
                {t('pedido.modal_massa.revisar')}
              </BotaoGlobal>
            ) : (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleConfirmar}
                disabled={salvando}
                aria-busy={salvando}
              >
                {salvando ? t('pedido.modal_massa.aplicando') : t('pedido.modal_massa.aplicar')}
              </BotaoGlobal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
