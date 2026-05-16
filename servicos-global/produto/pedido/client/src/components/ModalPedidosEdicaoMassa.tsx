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
import { Warning, Spinner, Plus, X, CheckCircle, MagnifyingGlass, CaretDown, CaretRight, Clock, Info, PencilSimpleLine } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ResultadoAcao } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useShellStore } from '@gravity/shell'
import { useHasMixedTipos } from '../shared/state/selecaoStore'
import { useIncotermsPedido } from '../shared/useIncotermsPedido'
import { useMoedasPedido } from '../shared/useMoedasPedido'
import { useUnidadesPedido } from '../shared/useUnidadesPedido'
import type {
  Pedido,
  CampoEdicaoMassa,
  EdicaoMassaPayload,
  EdicaoMassaPreview,
  EdicaoMassaResultado,
  OperacaoCampo,
  TipoCampoEdicao,
} from '../shared/types'
import { CAMPOS_BLOQUEADOS_PEDIDO, CAMPOS_BLOQUEADOS_ITEM } from '../shared/types'
import { pedidoEdicaoMassaApi } from '../shared/api'
import { cadastrosApi } from '../shared/cadastrosApi'

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
  // Para tipo='select' — valores válidos do enum
  opcoes?: { valor: string; rotulo: string }[]
  // Se definido, o campo só aparece quando a condição for verdadeira para os pedidos selecionados
  visivel?: (pedidos: Pedido[]) => boolean
}

const CAMPOS_PEDIDO_EDITAVEIS: DefinicaoCampo[] = [
  // Identificação
  { campo: 'numero_pedido',                           rotulo: 'Número do Pedido',                       tipo: 'texto',  nivel: 'pedido', grupo: 'Identificação' },
  { campo: 'tipo_operacao_pedido',                    rotulo: 'Tipo de Operação',                       tipo: 'select', nivel: 'pedido', grupo: 'Identificação',
    opcoes: [
      { valor: 'importacao', rotulo: 'Importação' },
      { valor: 'exportacao', rotulo: 'Exportação' },
    ] },

  // Exportador
  // exportador_nome: editável somente em importacao (fornecedor estrangeiro)
  { campo: 'nome_exportador',                         rotulo: 'Exportador — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador',
    visivel: (pedidos: Pedido[]) => pedidos.every(p => p.tipo_operacao === 'importacao') },
  // nome_importador: editável somente em exportacao (cliente estrangeiro)
  { campo: 'nome_importador',                         rotulo: 'Importador — Nome',                      tipo: 'texto',  nivel: 'pedido', grupo: 'Importador',
    visivel: (pedidos: Pedido[]) => pedidos.every(p => p.tipo_operacao === 'exportacao') },
  { campo: 'endereco_exportador',                     rotulo: 'Exportador — Endereço',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Exportador' },
  { campo: 'pais_exportador',                         rotulo: 'Exportador — País',                      tipo: 'select', nivel: 'pedido', grupo: 'Exportador' },
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
  { campo: 'pais_fabricante',                         rotulo: 'Fabricante — País',                      tipo: 'select', nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'estado_fabricante',                       rotulo: 'Fabricante — Estado',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'cidade_fabricante',                       rotulo: 'Fabricante — Cidade',                    tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },
  { campo: 'zip_code_fabricante',                     rotulo: 'Fabricante — ZIP Code',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Fabricante' },

  // OPE
  { campo: 'codigo_ope',                              rotulo: 'OPE — Código',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'nome_ope',                                rotulo: 'OPE — Nome',                             tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'endereco_ope',                            rotulo: 'OPE — Endereço',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'pais_ope',                                rotulo: 'OPE — País',                             tipo: 'select', nivel: 'pedido', grupo: 'OPE' },
  { campo: 'estado_ope',                              rotulo: 'OPE — Estado',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'cidade_ope',                              rotulo: 'OPE — Cidade',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'zip_code_ope',                            rotulo: 'OPE — ZIP Code',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'tin_ope',                                 rotulo: 'OPE — TIN',                              tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'email_ope',                               rotulo: 'OPE — Email',                            tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'situacao_ope',                            rotulo: 'OPE — Situação',                         tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'versao_ope',                              rotulo: 'OPE — Versão',                           tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },
  { campo: 'cnpj_raiz_empresa_responsavel',           rotulo: 'CNPJ Raiz Empresa Responsável',          tipo: 'texto',  nivel: 'pedido', grupo: 'OPE' },

  // Dados comerciais
  { campo: 'moeda_pedido',                            rotulo: 'Moeda',                                  tipo: 'select', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'unidade_comercializada_pedido',           rotulo: 'Unidade Comercializada',                 tipo: 'select', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'incoterm_pedido',                         rotulo: 'Incoterm',                               tipo: 'select', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'quantidade_volumes_pedido',               rotulo: 'Qtd. Volumes',                           tipo: 'numero', nivel: 'pedido', grupo: 'Comercial' },
  { campo: 'cobertura_cambial_item',                  rotulo: 'Cobertura Cambial',                      tipo: 'select', nivel: 'item',   grupo: 'Comercial',
    opcoes: [
      { valor: 'com_cobertura', rotulo: 'Com Cobertura' },
      { valor: 'sem_cobertura', rotulo: 'Sem Cobertura' },
    ] },
  { campo: 'nome_exportador_item',                    rotulo: 'Nome do Exportador (por item)',           tipo: 'texto',  nivel: 'item',   grupo: 'Partes' },
  { campo: 'nome_importador_item',                    rotulo: 'Nome do Importador (por item)',           tipo: 'texto',  nivel: 'item',   grupo: 'Partes' },
  { campo: 'condicao_pagamento_pedido',               rotulo: 'Cond. Pagamento',                        tipo: 'texto',  nivel: 'pedido', grupo: 'Comercial' },

  // Câmbio
  { campo: 'valor_total_cambio_pedido',               rotulo: 'Valor Total Câmbio',                     tipo: 'numero', nivel: 'pedido', grupo: 'Câmbio' },
  { campo: 'moeda_cambio_pedido',                     rotulo: 'Moeda Câmbio',                           tipo: 'select', nivel: 'pedido', grupo: 'Câmbio' },
  { campo: 'taxa_cambio_estimada_pedido',             rotulo: 'Taxa Câmbio Estimada',                   tipo: 'numero', nivel: 'pedido', grupo: 'Câmbio' },
  { campo: 'contrato_cambio_id_pedido',               rotulo: 'Contrato de Câmbio',                     tipo: 'texto',  nivel: 'pedido', grupo: 'Câmbio' },

  // Dados físicos — campos UNITÁRIOS por item (peso/cubagem total do pedido
  // são agregados derivados, calculados server-side por
  // `recalcularAgregadosPedido`. Editá-los direto causaria divergência com
  // a soma real dos itens — bloqueado pelo backend desde Onda A3.)
  { campo: 'peso_liquido_unitario_item',              rotulo: 'Peso Líquido Unitário',                  tipo: 'numero', nivel: 'item',   grupo: 'Físico' },
  { campo: 'peso_bruto_unitario_item',                rotulo: 'Peso Bruto Unitário',                    tipo: 'numero', nivel: 'item',   grupo: 'Físico' },
  { campo: 'cubagem_unitaria_item',                   rotulo: 'Cubagem Unitária',                       tipo: 'numero', nivel: 'item',   grupo: 'Físico' },

  // Documentos
  { campo: 'numero_proforma_pedido',                  rotulo: 'Nº Proforma',                            tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'numero_invoice_pedido',                   rotulo: 'Nº Invoice',                             tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_importador_pedido',            rotulo: 'Referência Importador',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_exportador_pedido',            rotulo: 'Referência Exportador',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },
  { campo: 'referencia_fabricante_pedido',            rotulo: 'Referência Fabricante',                  tipo: 'texto',  nivel: 'pedido', grupo: 'Documentos' },

  // Portos / Logística
  { campo: 'porto_origem',                            rotulo: 'Porto Origem',                           tipo: 'texto',  nivel: 'pedido', grupo: 'Logística' },
  { campo: 'porto_destino',                           rotulo: 'Porto Destino',                          tipo: 'texto',  nivel: 'pedido', grupo: 'Logística' },

  // Datas principais
  { campo: 'data_emissao_pedido',                     rotulo: 'Data de Emissão',                        tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_embarque_origem',                    rotulo: 'Data de Embarque',                       tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
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
  { campo: 'data_documento_proforma_pedido',          rotulo: 'Data Documento Proforma',                tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },
  { campo: 'data_documento_invoice_pedido',           rotulo: 'Data Documento Invoice',                 tipo: 'data',   nivel: 'pedido', grupo: 'Datas' },

  // Datas — Draft Pedido
  { campo: 'data_previsao_recebimento_rascunho_pedido',  rotulo: 'Draft Pedido — Prev. Receb.',            tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_confirmacao_recebimento_rascunho_pedido',rotulo:'Draft Pedido — Conf. Receb.',             tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_meta_recebimento_rascunho_pedido',      rotulo: 'Draft Pedido — Meta Receb.',             tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_previsao_aprovacao_rascunho_pedido',    rotulo: 'Draft Pedido — Prev. Aprovação',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_confirmacao_aprovacao_rascunho_pedido', rotulo: 'Draft Pedido — Conf. Aprovação',         tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },
  { campo: 'data_meta_aprovacao_rascunho_pedido',        rotulo: 'Draft Pedido — Meta Aprovação',          tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Pedido' },

  // Datas — Draft Proforma
  { campo: 'data_previsao_recebimento_rascunho_proforma_pedido',  rotulo: 'Draft Proforma — Prev. Receb.', tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_recebimento_rascunho_proforma_pedido',rotulo:'Draft Proforma — Conf. Receb.', tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_recebimento_rascunho_proforma_pedido',      rotulo: 'Draft Proforma — Meta Receb.', tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_previsao_aprovacao_rascunho_proforma_pedido',    rotulo: 'Draft Proforma — Prev. Aprovação', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_aprovacao_rascunho_proforma_pedido', rotulo: 'Draft Proforma — Conf. Aprovação', tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_aprovacao_rascunho_proforma_pedido',        rotulo: 'Draft Proforma — Meta Aprovação',  tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_previsao_envio_original_proforma_pedido',   rotulo: 'Original Proforma — Prev. Envio',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_envio_original_proforma_pedido', rotulo: 'Original Proforma — Conf. Envio', tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_envio_original_proforma_pedido',       rotulo: 'Original Proforma — Meta Envio',   tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_previsao_recebimento_original_proforma_pedido', rotulo:'Original Proforma — Prev. Receb.',tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_confirmacao_recebimento_original_proforma_pedido',rotulo:'Original Proforma — Conf. Receb.',tipo:'data',nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_meta_recebimento_original_proforma_pedido', rotulo: 'Original Proforma — Meta Receb.',   tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },
  { campo: 'data_proforma_invoice',                   rotulo: 'Data Proforma Invoice',                  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Proforma' },

  // Datas — Draft Invoice
  { campo: 'data_previsao_recebimento_rascunho_invoice_pedido',  rotulo: 'Draft Invoice — Prev. Receb.',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmacao_recebimento_rascunho_invoice_pedido',rotulo:'Draft Invoice — Conf. Receb.',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_recebimento_rascunho_invoice_pedido',      rotulo: 'Draft Invoice — Meta Receb.',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_previsao_aprovacao_rascunho_invoice_pedido',    rotulo: 'Draft Invoice — Prev. Aprovação',tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmacao_aprovacao_rascunho_invoice_pedido', rotulo: 'Draft Invoice — Conf. Aprovação',tipo: 'data', nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_aprovacao_rascunho_invoice_pedido',        rotulo: 'Draft Invoice — Meta Aprovação',tipo: 'data',  nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_previsao_envio_original_invoice_pedido',    rotulo: 'Original Invoice — Prev. Envio',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmacao_envio_original_invoice_pedido', rotulo: 'Original Invoice — Conf. Envio',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_envio_original_invoice_pedido',        rotulo: 'Original Invoice — Meta Envio',   tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_previsao_recebimento_original_invoice_pedido',rotulo:'Original Invoice — Prev. Receb.',tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_confirmacao_recebimento_original_invoice_pedido',rotulo:'Original Invoice — Conf. Receb.',tipo:'data',  nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_meta_recebimento_original_invoice_pedido',  rotulo: 'Original Invoice — Meta Receb.',  tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
  { campo: 'data_invoice',                            rotulo: 'Data Invoice',                           tipo: 'data',   nivel: 'pedido', grupo: 'Datas Draft Invoice' },
]

const CAMPOS_ITEM_EDITAVEIS: DefinicaoCampo[] = [
  // Identificação do produto
  { campo: 'part_number_item',                        rotulo: 'Part Number',                            tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'ncm_item',                                rotulo: 'NCM',                                    tipo: 'ncm',    nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_item',                          rotulo: 'Descrição do Item',                      tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_pt',              rotulo: 'Descrição Completa',                     tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_en',              rotulo: 'Descrição (EN)',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_es',              rotulo: 'Descrição (ES)',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'descricao_completa_item_nf',              rotulo: 'Descrição Espelho NF',                   tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'texto_posicao_ncm',                       rotulo: 'Texto Posição NCM',                      tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'grupo_item',                              rotulo: 'Grupo Produto',                          tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'subgrupo_item',                           rotulo: 'Subgrupo Produto',                       tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'campo_especial_item',                     rotulo: 'Campo Especial',                         tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'atributos_catalogo',                      rotulo: 'Atributos Catálogo',                     tipo: 'texto',  nivel: 'item', grupo: 'Produto' },
  { campo: 'tipo_operacao_item',                      rotulo: 'Tipo de Operação (Item)',                tipo: 'select', nivel: 'item', grupo: 'Produto',
    opcoes: [
      { valor: 'importacao', rotulo: 'Importação' },
      { valor: 'exportacao', rotulo: 'Exportação' },
    ] },
  { campo: 'unidade_comercializada_item',             rotulo: 'Unidade Comercializada (Item)',          tipo: 'select', nivel: 'item', grupo: 'Produto' },

  // Quantidades
  { campo: 'quantidade_inicial_item',                 rotulo: 'Qtd. Inicial',                           tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_pronta_item',                  rotulo: 'Qtd. Pronta',                            tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'quantidade_cancelada_item',               rotulo: 'Qtd. Cancelada',                         tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },
  { campo: 'casas_decimais_quantidade_item',          rotulo: 'Casas Decimais — Qtd.',                  tipo: 'numero', nivel: 'item', grupo: 'Quantidades' },

  // Financeiro / Comercial do Item
  { campo: 'moeda_item',                              rotulo: 'Moeda (Item)',                           tipo: 'select', nivel: 'item', grupo: 'Comercial' },
  { campo: 'incoterm_item',                           rotulo: 'Incoterm (Item)',                        tipo: 'select', nivel: 'item', grupo: 'Comercial' },
  { campo: 'condicao_pagamento_item',                 rotulo: 'Cond. Pagamento (Item)',                 tipo: 'texto',  nivel: 'item', grupo: 'Comercial' },
  { campo: 'data_emissao_item',                       rotulo: 'Data Emissão (Item)',                    tipo: 'data',   nivel: 'item', grupo: 'Datas' },

  // Pesos e cubagem
  { campo: 'peso_liquido_unitario_item',              rotulo: 'Peso Líquido Unitário',                  tipo: 'numero', nivel: 'item', grupo: 'Físico' },
  { campo: 'peso_bruto_unitario_item',                rotulo: 'Peso Bruto Unitário',                    tipo: 'numero', nivel: 'item', grupo: 'Físico' },
  { campo: 'cubagem_unitaria_item',                   rotulo: 'Cubagem Unitária',                       tipo: 'numero', nivel: 'item', grupo: 'Físico' },

  // Referências do item
  { campo: 'referencia_importador_item',              rotulo: 'Referência Importador',                  tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'referencia_exportador_item',              rotulo: 'Referência Exportador',                  tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },
  { campo: 'referencia_fabricante_item',              rotulo: 'Referência Fabricante',                  tipo: 'texto',  nivel: 'item', grupo: 'Documentos' },

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
  ncm:     ['substituir'],
  numero:  ['substituir', 'somar', 'subtrair', 'percentual'],
  data:    ['substituir', 'avancar_dias', 'recuar_dias'],
}

/**
 * formataNcm — máscara de NCM (0000.00.00).
 * Recebe entrada bruta, descarta não-dígitos, limita a 8 dígitos e formata.
 */
function formataNcm(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`
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

// ── Campos com @@unique no schema — protegidos contra atribuição em massa ────
//
// Auditoria de unique constraints do Pedido (2026-05-12):
//   - Pedido.@@unique([id_organizacao, numero_pedido])
//   - Demais @@unique do schema estão em models de sistema/config não expostos
//     em edição em massa (StatusPedido, PreferenciaUsuarioColunaPedido,
//     KanbanPreferenciasGlobal, etc.)
//
// Regra: aplicar o mesmo valor a >1 pedido viola @@unique → P2002 no Postgres.
// Operação "substituir" com >1 pedido é IMPOSSÍVEL por design. Bloqueamos no
// frontend (input disabled + tooltip) e no backend (Zod custom 422 + try/catch
// P2002 como defesa em profundidade).
//
// **Convenção:** ao expor novo campo `@@unique` em CAMPOS_*_EDITAVEIS,
// adicionar a entrada aqui também.
const CAMPOS_UNIQUE = new Set<string>([
  'numero_pedido',
])

// Campos que exigem processamento individual por pedido (merge JSON no backend)
// Deve espelhar CAMPOS_DETALHES_OPERACIONAIS em edicaoEmMassaService.ts
const CAMPOS_DETALHES_OPERACIONAIS_LENTO = new Set([
  // Exportador
  'nome_exportador',
  'endereco_exportador',
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'zip_code_exportador',
  'exportador_ou_fabricante',
  'relacao_exportador_fabricante',
  'nome_contato_exportador',
  'email_contato_exportador',
  'whatsapp_contato_exportador',
  'cargo_contato_exportador',
  'departamento_contato_exportador',
  // Importador
  'nome_importador',
  // Fabricante
  'nome_fabricante',
  'endereco_fabricante',
  'pais_fabricante',
  'estado_fabricante',
  'cidade_fabricante',
  'zip_code_fabricante',
  // OPE
  'codigo_ope',
  'nome_ope',
  'endereco_ope',
  'pais_ope',
  'estado_ope',
  'cidade_ope',
  'zip_code_ope',
  'tin_ope',
  'email_ope',
  'situacao_ope',
  'versao_ope',
  'cnpj_raiz_empresa_responsavel',
])

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

interface OpcoesDinamicas {
  incoterms?: { valor: string; rotulo: string }[]
  paises?: { valor: string; rotulo: string }[]
  moedas?: { valor: string; rotulo: string }[]
  unidades?: { valor: string; rotulo: string }[]
}

const CAMPOS_PAIS = new Set(['pais_exportador', 'pais_fabricante', 'pais_ope'])
const CAMPOS_MOEDA = new Set(['moeda_pedido', 'moeda_item', 'moeda_cambio_pedido'])
const CAMPOS_UNIDADE = new Set(['unidade_comercializada_pedido', 'unidade_comercializada_item'])

function injetarOpcoesDinamicas(campos: DefinicaoCampo[], opcoes: OpcoesDinamicas): DefinicaoCampo[] {
  return campos.map(d => {
    if ((d.campo === 'incoterm_pedido' || d.campo === 'incoterm_item') && opcoes.incoterms?.length) {
      return { ...d, opcoes: opcoes.incoterms }
    }
    if (CAMPOS_PAIS.has(d.campo) && opcoes.paises?.length) {
      return { ...d, opcoes: opcoes.paises }
    }
    if (CAMPOS_MOEDA.has(d.campo) && opcoes.moedas?.length) {
      return { ...d, opcoes: opcoes.moedas }
    }
    if (CAMPOS_UNIDADE.has(d.campo) && opcoes.unidades?.length) {
      return { ...d, opcoes: opcoes.unidades }
    }
    return d
  })
}

function camposParaNivel(nivel: NivelEdicao, pedidos: Pedido[] = [], opcoesDinamicas: OpcoesDinamicas = {}): DefinicaoCampo[] {
  const filtrar = (lista: DefinicaoCampo[]) =>
    lista.filter(d => !d.visivel || d.visivel(pedidos))
  const injetar = (lista: DefinicaoCampo[]) => injetarOpcoesDinamicas(filtrar(lista), opcoesDinamicas)
  if (nivel === 'pedido')   return injetar(CAMPOS_PEDIDO_EDITAVEIS)
  if (nivel === 'item')     return injetar(CAMPOS_ITEM_EDITAVEIS)
  return injetar([...CAMPOS_PEDIDO_EDITAVEIS, ...CAMPOS_ITEM_EDITAVEIS])
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
        d.rotulo.toLowerCase().includes(busca.toLowerCase()) ||
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
              {defAtual.rotulo}
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
                        <span className="modal-edicao-massa__combobox-item-rotulo">{item.rotulo}</span>
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
        const rotulo = disponiveis.find(d => d.campo === campo)?.rotulo ?? campo
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

// ── Select buscável para campos com muitas opções (países, moedas, unidades) ─

function SelectBuscavelValor({
  opcoes,
  valor,
  disabled,
  placeholder,
  onChange,
}: {
  opcoes: { valor: string; rotulo: string }[]
  valor: string
  disabled?: boolean
  placeholder?: string
  onChange: (v: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtradas = busca.trim() === ''
    ? opcoes
    : opcoes.filter(o =>
        o.rotulo.toLowerCase().includes(busca.toLowerCase()) ||
        o.valor.toLowerCase().includes(busca.toLowerCase())
      )

  const rotuloSelecionado = opcoes.find(o => o.valor === valor)?.rotulo

  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  return (
    <div ref={wrapperRef} className="modal-edicao-massa__select-buscavel" style={{ position: 'relative' }}>
      <button
        type="button"
        className="modal-edicao-massa__select"
        disabled={disabled}
        onClick={() => { setAberto(!aberto); setBusca('') }}
        style={{ textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer', width: '100%' }}
      >
        {rotuloSelecionado || <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{placeholder}</span>}
      </button>
      {aberto && (
        <div className="modal-edicao-massa__select-buscavel-dropdown" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: 'var(--bg-base, #1e293b)', border: '1.5px solid rgba(129,140,248,.25)',
          borderRadius: '8px', marginTop: '4px',
          boxShadow: '0 16px 48px rgba(0,0,0,.65), 0 4px 16px rgba(0,0,0,.4)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.5rem', borderBottom: '1px solid rgba(129,140,248,.15)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <MagnifyingGlass size={14} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            <input
              autoFocus
              className="modal-edicao-massa__input"
              style={{ border: 'none', padding: '0.25rem 0', background: 'transparent', flex: 1 }}
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar..."
            />
          </div>
          <ul style={{
            listStyle: 'none', margin: 0, padding: '0.25rem',
            maxHeight: '220px', overflowY: 'auto',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.1) transparent',
          }}>
            {filtradas.length === 0 && (
              <li style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
                Nenhum resultado
              </li>
            )}
            {filtradas.map(o => (
              <li
                key={o.valor}
                onClick={() => { onChange(o.valor); setAberto(false); setBusca('') }}
                style={{
                  padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '0.875rem', color: 'var(--text-primary, #f1f5f9)',
                  background: o.valor === valor ? 'rgba(129,140,248,.12)' : undefined,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,.05)' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = o.valor === valor ? 'rgba(129,140,248,.12)' : '' }}
              >
                {o.rotulo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Tradução de mensagens técnicas → amigáveis ──────────────────────────────

const MENSAGENS_AMIGAVEIS: [RegExp, string][] = [
  [/x-id-workspace ausente/i, 'Nenhum workspace selecionado. Selecione um workspace no topo da tela antes de editar.'],
  [/Portão \d/i, ''],  // Remove referências a "Portão" — são internas
  [/WORKSPACE_NAO_INFORMADO/i, 'Nenhum workspace selecionado. Selecione um workspace no topo da tela antes de editar.'],
  [/VALIDATION_ERROR/i, ''],
]

function traduzirErro(mensagem: string): string {
  for (const [regex, amigavel] of MENSAGENS_AMIGAVEIS) {
    if (regex.test(mensagem)) {
      return amigavel || mensagem
    }
  }
  return mensagem
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalEdicaoMassaPedidos({ pedidos, onFechar, onConcluido }: ModalEdicaoMassaPedidosProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()
  const hasMixedTipos = useHasMixedTipos()
  const { incotermsOpcoes, loading: incotermLoading, erro: incotermErro } = useIncotermsPedido()
  const { moedasOpcoes } = useMoedasPedido()
  const { unidadesComercializadas } = useUnidadesPedido()
  const [paisesOpcoes, setPaisesOpcoes] = useState<{ valor: string; rotulo: string }[]>([])
  useEffect(() => {
    cadastrosApi.listarPaises()
      .then(r => setPaisesOpcoes(r.itens.map(p => ({
        valor: p.nome_pais_portugues,
        rotulo: `${p.nome_pais_portugues}${p.codigo_pais_iso_alpha2 ? ` (${p.codigo_pais_iso_alpha2})` : ''}`,
      }))))
      .catch(() => {})
  }, [])
  const opcoesDinamicas: OpcoesDinamicas = {
    incoterms: incotermsOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    paises: paisesOpcoes,
    moedas: moedasOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    unidades: unidadesComercializadas.map(o => ({ valor: o.sigla, rotulo: o.rotulo })),
  }
  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [resultado, setResultado] = useState<EdicaoMassaResultado | null>(null)
  const [nivel, setNivel] = useState<NivelEdicao>('combinado')
  const [campos, setCampos] = useState<CampoEmEdicao[]>([])
  const [preview, setPreview] = useState<EdicaoMassaPreview | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inicializar com primeiro campo disponível
  useEffect(() => {
    const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas)
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
        setErroGeral(traduzirErro(err instanceof Error ? err.message : t('pedido.modal_massa.erro_preview')))
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
    const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas)
    if (disponiveis.length > 0) {
      setCampos(prev => [...prev, criarCampoVazio(disponiveis[0])])
    }
  }, [nivel])

  const handleRemoverCampo = useCallback((uid: string) => {
    setCampos(prev => prev.filter(c => c.uid !== uid))
  }, [])

  const handleMudarCampoDef = useCallback((uid: string, novoCampo: string) => {
    const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas)
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
      const result = await pedidoEdicaoMassaApi.confirmar(payload)
      setSalvando(false)
      setFeedbackBotao('sucesso')
      setResultado(result)
      await new Promise(r => setTimeout(r, 1200))
      setFeedbackBotao(null)
      setPasso(3)
      return
    } catch (err: unknown) {
      const msg = traduzirErro(err instanceof Error ? err.message : t('pedido.modal_massa.erro_aplicar'))
      setSalvando(false)
      setFeedbackBotao('erro')
      setErroSalvar(msg)
      addNotification({ type: 'error', message: `Falha na edição em massa: ${msg}`, duration: 4000 })
      setTimeout(() => { setFeedbackBotao(null) }, 1500)
      return
    }
  }, [campos, pedidos, nivel, onConcluido, addNotification])

  // ── Render helpers ────────────────────────────────────────────────────────────

  const camposValidos = campos.filter(c => c.valor.trim() !== '')
  const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas)

  // Algum campo está bloqueado por @@unique (substituir + >1 pedido)?
  // Se sim, bloqueia o botão de revisar/aplicar para falhar ruidoso.
  const temCampoUniqueBloqueado = campos.some(c =>
    CAMPOS_UNIQUE.has(c.campo) && c.operacao === 'substituir' && pedidos.length > 1,
  )

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
          {(['combinado', 'pedido', 'item'] as NivelEdicao[]).map(n => (
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

      {incotermErro && (
        <div className="modal-edicao-massa__aviso modal-edicao-massa__aviso--warn" role="alert">
          <Warning size={16} weight="bold" />
          <span>Incoterms indisponíveis — o campo ficará desabilitado até a lista carregar. ({incotermErro})</span>
        </div>
      )}

      {/* Lista de campos */}
      <div className="modal-edicao-massa__secao">
        <p className="modal-edicao-massa__secao-titulo">{t('pedido.modal_massa.secao_campos')}</p>
        <div className="modal-edicao-massa__campos-lista">
          {campos.map(campo => {
            const ops = OPERACOES_POR_TIPO[campo.tipo]
            const temMultiplos = campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)
            const placeholder = inputPlaceholder(campo, pedidos, t)
            // Campo @@unique + substituir + >1 pedido = colisão garantida (P2002).
            // Bloqueia o input no frontend e avisa o usuário.
            const bloqueadoUnique =
              CAMPOS_UNIQUE.has(campo.campo) &&
              campo.operacao === 'substituir' &&
              pedidos.length > 1
            const tooltipUnique = bloqueadoUnique
              ? `"${disponiveis.find(d => d.campo === campo.campo)?.rotulo ?? campo.campo}" é único por organização — não é possível atribuir o mesmo valor a múltiplos pedidos. Selecione apenas 1 pedido para editar este campo.`
              : undefined

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
                <SelectGlobal
                  buscavel={false}
                  tamanho="compacto"
                  opcoes={ops.map(op => ({ valor: op, rotulo: t(OP_NOME_KEYS[op]) }))}
                  valor={campo.operacao}
                  aoMudarValor={v => v != null && handleMudarOperacao(campo.uid, v as OperacaoCampo)}
                  aria-label={`Operação para ${campo.campo}`}
                />

                {/* Input de valor — renderiza por tipo do campo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} title={tooltipUnique}>
                  {campo.tipo === 'select' ? (() => {
                    const def = disponiveis.find(d => d.campo === campo.campo)
                    const opcoes = def?.opcoes ?? []
                    const semOpcoesDinamicas = opcoes.length === 0 && (
                      campo.campo === 'incoterm_pedido' || campo.campo === 'incoterm_item' ||
                      CAMPOS_PAIS.has(campo.campo) || CAMPOS_MOEDA.has(campo.campo) || CAMPOS_UNIDADE.has(campo.campo)
                    )
                    if (opcoes.length > 10) {
                      return (
                        <SelectBuscavelValor
                          opcoes={opcoes}
                          valor={campo.valor}
                          disabled={bloqueadoUnique}
                          placeholder={t('pedido.modal_massa.valor_placeholder')}
                          onChange={v => handleMudarValor(campo.uid, v)}
                        />
                      )
                    }
                    return (
                      <SelectGlobal
                        buscavel={false}
                        tamanho="compacto"
                        desabilitado={bloqueadoUnique || semOpcoesDinamicas}
                        carregando={semOpcoesDinamicas}
                        placeholder={semOpcoesDinamicas ? 'Carregando...' : t('pedido.modal_massa.valor_placeholder')}
                        opcoes={opcoes.map(o => ({ valor: o.valor, rotulo: o.rotulo }))}
                        valor={campo.valor || null}
                        aoMudarValor={v => handleMudarValor(campo.uid, v != null ? String(v) : '')}
                        aria-label={`Valor para ${campo.campo}`}
                      />
                    )
                  })() : campo.tipo === 'ncm' ? (
                    <input
                      className="modal-edicao-massa__input"
                      type="text"
                      inputMode="numeric"
                      value={campo.valor}
                      disabled={bloqueadoUnique}
                      onChange={e => handleMudarValor(campo.uid, formataNcm(String(e.target.value)))}
                      placeholder="0000.00.00"
                      maxLength={10}
                      aria-label={`Valor para ${campo.campo}`}
                      style={{ fontFamily: 'var(--font-mono, monospace)' }}
                    />
                  ) : (
                    <input
                      className="modal-edicao-massa__input"
                      type={campo.tipo === 'data' && campo.operacao === 'substituir' ? 'date'
                        : campo.tipo === 'numero' || campo.operacao !== 'substituir' ? 'number'
                        : 'text'}
                      value={campo.valor}
                      disabled={bloqueadoUnique}
                      onChange={e => handleMudarValor(campo.uid, e.target.value)}
                      placeholder={bloqueadoUnique ? 'Bloqueado — campo único' : (placeholder || t('pedido.modal_massa.valor_placeholder'))}
                      aria-label={`Valor para ${campo.campo}`}
                    />
                  )}
                  {bloqueadoUnique && (
                    <span className="modal-edicao-massa__badge-multiplos" style={{ color: 'var(--danger, #ef4444)' }}>
                      <Warning size={11} weight="fill" aria-hidden="true" />
                      Único por organização — selecione 1 pedido
                    </span>
                  )}
                  {temMultiplos && !bloqueadoUnique && (
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
              {(preview.campos_pedido_alterados ?? 0) > 0 && (
                <div className="modal-edicao-massa__preview-stat">
                  <strong>{preview.campos_pedido_alterados}</strong>
                  <span>campos pedido</span>
                </div>
              )}
              {(preview.campos_item_alterados ?? 0) > 0 && (
                <div className="modal-edicao-massa__preview-stat">
                  <strong>{preview.campos_item_alterados}</strong>
                  <span>campos item</span>
                </div>
              )}
            </div>

            {preview.campos.length > 0 && (
              <div className="modal-edicao-massa__preview-campos">
                {preview.campos.map((c, i) => (
                  <div key={i} className="modal-edicao-massa__preview-campo">
                    <span className="modal-edicao-massa__preview-campo-nome">
                      {disponiveis.find(d => d.campo === c.campo)?.rotulo ?? c.campo}
                    </span>
                    <span className="modal-edicao-massa__preview-campo-op">
                      {t(OP_LABEL_KEYS[c.operacao])}
                    </span>
                    <span className="modal-edicao-massa__preview-campo-valor">{disponiveis.find(d => d.campo === c.campo)?.opcoes?.find(o => o.valor === String(c.valor))?.rotulo ?? String(c.valor)}</span>
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
      {/* Alerta reforçado quando tipos de operação mistos.
          O banner do topo já informou; aqui antes de aplicar a mudança final
          repetimos com destaque para evitar erro humano. */}
      {hasMixedTipos && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Warning weight="fill" size={18} color="var(--warning, #f59e0b)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              Atenção — tipos de operação diferentes
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              Você está prestes a alterar pedidos de <strong>importação</strong> e <strong>exportação</strong> juntos. Confirme que isso é intencional antes de aplicar.
            </p>
          </div>
        </div>
      )}

      {/* C2-a: Auto-fill ao trocar tipo_operacao — banner azul informativo */}
      {preview?.workspaces_auto_fill && preview.workspaces_auto_fill.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--primary, #6366f1) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--primary, #6366f1) 30%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Info weight="fill" size={18} color="var(--primary, #6366f1)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--primary, #6366f1)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              Auto-preenchimento ao trocar tipo de operação
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              O nome e CNPJ do lado nacional serão preenchidos automaticamente com dados do workspace de cada pedido:
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {preview.workspaces_auto_fill.map(w => (
                <li key={w.id_workspace}>
                  <strong>{w.nome_workspace}</strong>
                  {w.cnpj_workspace ? <> · CNPJ {w.cnpj_workspace}</> : <> · <em>sem CNPJ</em></>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* C2-b: Workspaces sem CNPJ — banner amarelo informativo */}
      {preview?.aviso_workspace_sem_cnpj && preview.aviso_workspace_sem_cnpj.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Warning weight="fill" size={18} color="var(--warning, #f59e0b)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              Workspace sem CNPJ
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {preview.aviso_workspace_sem_cnpj.length} pedido(s) têm workspace sem CNPJ cadastrado. O CNPJ ficará vazio nos pedidos afetados — você pode preencher no Cadastros antes ou seguir mesmo assim.
            </p>
          </div>
        </div>
      )}

      {/* C2-c: Status crítico — banner laranja informativo */}
      {preview?.aviso_status_critico && preview.aviso_status_critico.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, #fb923c 12%, transparent)',
          border: '1px solid color-mix(in srgb, #fb923c 40%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Warning weight="fill" size={18} color="#fb923c" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: '#fb923c', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              Pedidos com status crítico
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {preview.aviso_status_critico.length} pedido(s) com status diferente de <em>rascunho</em>/<em>aberto</em>: alterar tipo de operação pode causar inconsistência com documentos legais já emitidos. Status afetados:{' '}
              <strong>{[...new Set(preview.aviso_status_critico.map(p => p.status_pedido))].join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* C3: Aviso quando edição manual sobrescreve auto-fill */}
      {(() => {
        const trocandoTipo = camposValidos.some(c => c.campo === 'tipo_operacao_pedido' && c.operacao === 'substituir')
        const camposManualLadoNacional = camposValidos.filter(c =>
          ['nome_exportador', 'nome_importador', 'cnpj_exportador', 'cnpj_importador'].includes(c.campo),
        )
        if (!trocandoTipo || camposManualLadoNacional.length === 0) return null
        return (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, transparent)',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '1rem',
          }}>
            <Warning weight="fill" size={18} color="var(--warning, #f59e0b)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                Edição manual sobrescreve auto-fill
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                Você editou manualmente {camposManualLadoNacional.map(c => <strong key={c.campo}>{disponiveis.find(d => d.campo === c.campo)?.rotulo ?? c.campo}</strong>).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ', ', curr], [] as React.ReactNode[])}. Esse(s) valor(es) sobrescreverão o auto-preenchimento do workspace.
              </p>
            </div>
          </div>
        )
      })()}

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

      {/* Lista de campos — como está → como vai ficar */}
      <div className="modal-edicao-massa__confirmacao-lista">
        {camposValidos.map(c => {
          const def = disponiveis.find(d => d.campo === c.campo)
          const rotulo = def?.rotulo ?? c.campo
          const previewCampo = preview?.campos.find(p => p.campo === c.campo)
          const valoresAtuais = previewCampo?.valores_distintos ?? []
          const multiplos = valoresAtuais.length > 1
          const valorAtualExib = multiplos
            ? `${valoresAtuais.length} valores distintos`
            : valoresAtuais[0] || '(vazio)'

          return (
            <div key={c.uid} style={{
              display: 'flex', flexDirection: 'column', gap: '0.375rem',
              padding: '0.75rem 0.875rem',
              background: 'var(--surface-2, #1e293b)',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #334155)',
            }}>
              {/* Header: campo + nível */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{rotulo}</span>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase',
                  padding: '0.125rem 0.5rem', borderRadius: '9999px',
                  background: c.nivel === 'pedido'
                    ? 'color-mix(in srgb, var(--primary, #6366f1) 15%, transparent)'
                    : 'color-mix(in srgb, var(--success, #22c55e) 15%, transparent)',
                  color: c.nivel === 'pedido' ? 'var(--primary, #818cf8)' : 'var(--success, #4ade80)',
                }}>
                  {c.nivel}
                </span>
              </div>

              {/* De → Para */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{
                  flex: 1, padding: '0.375rem 0.5rem',
                  background: 'color-mix(in srgb, var(--destructive, #ef4444) 8%, transparent)',
                  borderRadius: 'var(--radius-xs, 4px)',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontStyle: multiplos ? 'italic' : 'normal',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {valorAtualExib}
                </span>
                <span style={{ color: 'var(--text-tertiary, #64748b)', flexShrink: 0, fontSize: '0.75rem' }}>→</span>
                <span style={{
                  flex: 1, padding: '0.375rem 0.5rem',
                  background: 'color-mix(in srgb, var(--success, #22c55e) 8%, transparent)',
                  borderRadius: 'var(--radius-xs, 4px)',
                  color: 'var(--text-primary, #e2e8f0)',
                  fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t(OP_LABEL_KEYS[c.operacao])}: {def?.opcoes?.find(o => o.valor === c.valor)?.rotulo ?? c.valor}
                </span>
              </div>

              {/* Valores distintos expandidos quando >1 */}
              {multiplos && (
                <div style={{
                  fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)',
                  padding: '0.25rem 0.5rem',
                  background: 'color-mix(in srgb, var(--warning, #f59e0b) 6%, transparent)',
                  borderRadius: 'var(--radius-xs, 4px)',
                }}>
                  Valores atuais: {valoresAtuais.slice(0, 5).map(v => v || '(vazio)').join(', ')}
                  {valoresAtuais.length > 5 && ` +${valoresAtuais.length - 5} mais`}
                </div>
              )}

              {/* Alerta cascade */}
              {previewCampo?.cascade_para && (
                <div style={{
                  fontSize: '0.75rem', color: 'var(--primary, #818cf8)',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                  ↳ Também altera {disponiveis.find(d => d.campo === previewCampo.cascade_para)?.rotulo ?? previewCampo.cascade_para} nos itens
                  {(previewCampo.overrides_sobrescritos ?? 0) > 0 &&
                    ` · ${previewCampo.overrides_sobrescritos} itens serão sobrescritos`}
                </div>
              )}
            </div>
          )
        })}
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

  const renderPasso3 = () => {
    if (!resultado) return null
    const temErros = resultado.erros && resultado.erros.length > 0
    const totalPedidos = pedidos.length
    const sucessos = resultado.pedidos_atualizados
    const falhas = resultado.erros?.length ?? 0
    const camposEditados = campos.filter(c => c.valor.trim() !== '')

    return (
      <div className="modal-edicao-massa__confirmacao">
        {/* Resumo geral */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem',
          background: temErros
            ? 'color-mix(in srgb, var(--warning, #f59e0b) 10%, transparent)'
            : 'color-mix(in srgb, var(--success, #22c55e) 10%, transparent)',
          border: `1px solid ${temErros
            ? 'color-mix(in srgb, var(--warning, #f59e0b) 35%, transparent)'
            : 'color-mix(in srgb, var(--success, #22c55e) 35%, transparent)'}`,
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          {temErros
            ? <Warning weight="fill" size={20} color="var(--warning, #f59e0b)" />
            : <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />}
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
              {temErros
                ? `${sucessos} de ${totalPedidos} pedido(s) atualizados — ${falhas} com erro`
                : `${sucessos} pedido(s) atualizados · ${resultado.itens_atualizados} itens`}
            </p>
          </div>
        </div>

        {/* Status por campo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Campos editados
          </p>
          {camposEditados.map(c => {
            const def = disponiveis.find(d => d.campo === c.campo)
            const rotulo = def?.rotulo ?? c.campo
            const estaNosAlterados = resultado.campos_alterados?.includes(c.campo) ?? false
            const ok = estaNosAlterados && sucessos > 0
            return (
              <div
                key={c.uid}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--surface-2, #1e293b)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #334155)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{rotulo}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)' }}>
                    {c.operacao} → {c.valor}
                  </span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: ok ? 'var(--success, #22c55e)' : 'var(--destructive, #ef4444)',
                }}>
                  {ok
                    ? <><CheckCircle size={14} weight="fill" /> OK</>
                    : <><Warning size={14} weight="fill" /> Erro</>}
                </span>
              </div>
            )
          })}
        </div>

        {/* Erros detalhados */}
        {temErros && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--destructive, #ef4444)' }}>
              Pedidos com erro
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {resultado.erros.map((e, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.5rem 0.75rem',
                    background: 'color-mix(in srgb, var(--destructive, #ef4444) 8%, transparent)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid color-mix(in srgb, var(--destructive, #ef4444) 25%, transparent)',
                    color: 'var(--text-primary, #e2e8f0)',
                  }}
                >
                  <strong>{e.pedido_id.slice(0, 12)}…</strong>: {e.motivo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PencilSimpleLine size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 id="modal-edicao-massa-titulo" className="modal-edicao-massa__titulo">
                {t('pedido.modal_massa.titulo', { count: pedidos.length, s: pedidos.length !== 1 ? 's' : '' })}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Selecione os campos que deseja alterar em lote</p>
          </div>
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
          {passo === 1 ? renderPasso1() : passo === 2 ? renderPasso2() : renderPasso3()}
        </div>

        {/* Footer */}
        <div className="modal-edicao-massa__footer">
          {/* Indicador de passos */}
          <div className="modal-edicao-massa__passos" aria-label={t('pedido.modal_massa.aria_passo_atual')}>
            <span
              className={`modal-edicao-massa__passo${passo === 1 ? ' modal-edicao-massa__passo--ativo' : ' modal-edicao-massa__passo--concluido'}`}
              aria-current={passo === 1 ? 'step' : undefined}
            >
              {passo >= 2 ? <CheckCircle size={12} weight="fill" aria-hidden="true" /> : '1'}
            </span>
            <span className="modal-edicao-massa__passo-separador" />
            <span
              className={`modal-edicao-massa__passo${passo === 2 ? ' modal-edicao-massa__passo--ativo' : passo === 3 ? ' modal-edicao-massa__passo--concluido' : ''}`}
              aria-current={passo === 2 ? 'step' : undefined}
            >
              {passo === 3 ? <CheckCircle size={12} weight="fill" aria-hidden="true" /> : '2'}
            </span>
            <span className="modal-edicao-massa__passo-separador" />
            <span
              className={`modal-edicao-massa__passo${passo === 3 ? ' modal-edicao-massa__passo--ativo' : ''}`}
              aria-current={passo === 3 ? 'step' : undefined}
            >
              3
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

            {passo !== 3 && (
              <BotaoGlobal
                variante="secundario"
                tamanho="medio"
                onClick={onFechar}
                disabled={salvando || feedbackBotao !== null}
              >
                {t('pedido.modal_massa.cancelar')}
              </BotaoGlobal>
            )}

            {passo === 1 ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleAvancar}
                disabled={camposValidos.length === 0 || carregandoPreview || temCampoUniqueBloqueado}
              >
                {t('pedido.modal_massa.revisar')}
              </BotaoGlobal>
            ) : passo === 2 ? (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={handleConfirmar}
                disabled={salvando || feedbackBotao !== null}
                carregando={salvando}
                textoCarregando={t('pedido.modal_massa.aplicando')}
                resultadoAcao={feedbackBotao}
                icone={<PencilSimpleLine size={14} weight="bold" />}
              >
                {feedbackBotao === 'sucesso' ? 'Aplicado' : feedbackBotao === 'erro' ? 'Falhou' : t('pedido.modal_massa.aplicar')}
              </BotaoGlobal>
            ) : (
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                onClick={() => { onConcluido() }}
              >
                Fechar
              </BotaoGlobal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
