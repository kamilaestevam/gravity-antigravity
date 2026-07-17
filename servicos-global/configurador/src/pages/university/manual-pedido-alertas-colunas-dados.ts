/** Gerado por servicos-global/configurador/scripts/gerar-manual-pedido-alertas-colunas.ts — não editar manualmente. */
export type ManualPedidoLinhaAlertaLista = {
  key: string
  coluna: string
  nivel: string
  tipoAlerta: string
  acionamento: string
}

export type ManualPedidoGrupoAlertasLista = {
  id: string
  titulo: string
  colunas: ManualPedidoLinhaAlertaLista[]
}

export const TOTAL_ALERTAS_COLUNAS_PEDIDO_LISTA = 112

export const GRUPOS_ALERTAS_COLUNAS_PEDIDO_LISTA: ManualPedidoGrupoAlertasLista[] = [
  {
    "id": "identificacao",
    "titulo": "Identificação",
    "colunas": [
      {
        "key": "data_consolidacao_item",
        "coluna": "Data de Consolidação do Item",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_transferencia_item",
        "coluna": "Data de Transferência do Item",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_emissao_pedido",
        "coluna": "Data do Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_embarque_item",
        "coluna": "Data Embarque",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "numero_invoice",
        "coluna": "Nº Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "numero_pedido",
        "coluna": "Nº Pedido / Nº Item",
        "nivel": "Pedido e item",
        "tipoAlerta": "Part Number duplicado · Divergência",
        "acionamento": "Na **linha do pedido**: ícone âmbar quando **Part Numbers se repetem** entre itens. Na **linha do item**: alerta de divergência padrão quando o identificador difere."
      },
      {
        "key": "numero_proforma",
        "coluna": "Nº Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "part_number",
        "coluna": "Part Number",
        "nivel": "Item",
        "tipoAlerta": "Part Number duplicado",
        "acionamento": "Ícone âmbar na **linha do pedido** quando dois ou mais **itens** compartilham o mesmo Part Number."
      },
      {
        "key": "referencia_exportador",
        "coluna": "Ref. Exportador",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "referencia_fabricante",
        "coluna": "Ref. Fabricante",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "referencia_importador",
        "coluna": "Ref. Importador",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "status",
        "coluna": "Status",
        "nivel": "Pedido e item",
        "tipoAlerta": "Status divergente",
        "acionamento": "Ícone âmbar quando o **status do pedido** difere do status efetivo de algum item, ou quando **itens** têm statuses distintos (visível mesmo com pedido colapsado)."
      }
    ]
  },
  {
    "id": "partes",
    "titulo": "Partes",
    "colunas": [
      {
        "key": "nome_exportador",
        "coluna": "Exportador",
        "nivel": "Pedido",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "nome_fabricante",
        "coluna": "Fabricante",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "nome_importador",
        "coluna": "Importador",
        "nivel": "Pedido",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      }
    ]
  },
  {
    "id": "quantidades",
    "titulo": "Quantidades",
    "colunas": [
      {
        "key": "condicao_pagamento",
        "coluna": "Condição de Pagamento do Pedido/Item: Comercial",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "condicao_pagamento_siscomex",
        "coluna": "Condição de Pagamento do Pedido/Item: Siscomex",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "incoterm",
        "coluna": "Incoterm",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "moeda_item",
        "coluna": "Moeda do Item",
        "nivel": "Pedido",
        "tipoAlerta": "Moeda comercial (quantidades)",
        "acionamento": "Ícone âmbar quando a **moeda comercial** dos itens diverge (quantidades sensíveis à moeda)."
      },
      {
        "key": "quantidade_cancelada_total_pedido",
        "coluna": "Qtd. Cancelada do Pedido",
        "nivel": "Pedido",
        "tipoAlerta": "Unidade comercializada",
        "acionamento": "Ícone âmbar quando itens usam **unidades comercializadas diferentes**: totais, saldos e transferências não agregam."
      },
      {
        "key": "quantidade_volumes_pedido",
        "coluna": "Qtd. de Volumes do Pedido/Item",
        "nivel": "Pedido",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "quantidade_total_pedido",
        "coluna": "Qtd. Inicial do Pedido",
        "nivel": "Pedido",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "quantidade_pronta_itens_pedido_total",
        "coluna": "Qtd. Pronta do Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Moeda comercial",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si. Ícone âmbar quando itens usam **moedas comerciais diferentes**: o pedido não soma totais até homogeneizar."
      },
      {
        "key": "quantidade_transferida_total",
        "coluna": "Qtd. Transferida do Pedido",
        "nivel": "Pedido",
        "tipoAlerta": "Unidade comercializada",
        "acionamento": "Ícone âmbar quando itens usam **unidades comercializadas diferentes**: totais, saldos e transferências não agregam."
      },
      {
        "key": "saldo_itens_do_pedido",
        "coluna": "Saldo do Pedido",
        "nivel": "Pedido",
        "tipoAlerta": "Unidade comercializada",
        "acionamento": "Ícone âmbar quando itens usam **unidades comercializadas diferentes**: totais, saldos e transferências não agregam."
      },
      {
        "key": "tipo_volume_pedido",
        "coluna": "Tipo Volume Pedido/Item",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "unidade_comercializada_pedido",
        "coluna": "Unidade Comercializada",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      }
    ]
  },
  {
    "id": "financeiro",
    "titulo": "Financeiro",
    "colunas": [
      {
        "key": "cobertura_cambial",
        "coluna": "Cobertura Cambial do Pedido/Item",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "valor_total_pedido",
        "coluna": "Valor Total do Pedido/Item",
        "nivel": "Pedido",
        "tipoAlerta": "Moeda comercial (quantidades)",
        "acionamento": "Ícone âmbar quando a **moeda comercial** dos itens diverge (quantidades sensíveis à moeda)."
      },
      {
        "key": "valor_por_unidade_item",
        "coluna": "Valor Unitário do Item",
        "nivel": "Pedido",
        "tipoAlerta": "Moeda comercial",
        "acionamento": "Ícone âmbar quando itens usam **moedas comerciais diferentes**: o pedido não soma totais até homogeneizar."
      }
    ]
  },
  {
    "id": "cambio",
    "titulo": "Câmbio",
    "colunas": [
      {
        "key": "contrato_cambio_id_pedido",
        "coluna": "Contrato de Câmbio",
        "nivel": "Pedido",
        "tipoAlerta": "Moeda comercial",
        "acionamento": "Ícone âmbar quando itens usam **moedas comerciais diferentes**: o pedido não soma totais até homogeneizar."
      },
      {
        "key": "moeda_cambio_pedido",
        "coluna": "Moeda Câmbio",
        "nivel": "Pedido",
        "tipoAlerta": "Moeda comercial",
        "acionamento": "Ícone âmbar quando itens usam **moedas comerciais diferentes**: o pedido não soma totais até homogeneizar."
      }
    ]
  },
  {
    "id": "dados-fisicos",
    "titulo": "Dados Físicos",
    "colunas": [
      {
        "key": "cubagem_total_pedido",
        "coluna": "Cubagem Total",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "peso_bruto_total_pedido",
        "coluna": "Peso Bruto Total",
        "nivel": "Pedido e item",
        "tipoAlerta": "Unidade de peso",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si. Ícone âmbar quando itens usam **unidades de peso diferentes**: peso total do pedido não agrega."
      },
      {
        "key": "peso_liquido_total_pedido",
        "coluna": "Peso Líquido Total",
        "nivel": "Pedido e item",
        "tipoAlerta": "Unidade de peso",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si. Ícone âmbar quando itens usam **unidades de peso diferentes**: peso total do pedido não agrega."
      }
    ]
  },
  {
    "id": "duimp-fiscal",
    "titulo": "DUIMP / Fiscal",
    "colunas": [
      {
        "key": "data_confirmada_aprovacao_draft_cert_origem",
        "coluna": "Conf. Aprov. Draft Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_envio_original_cert_origem",
        "coluna": "Conf. Envio Original Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_draft_cert_origem",
        "coluna": "Conf. Rec. Draft Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_original_cert_origem",
        "coluna": "Conf. Rec. Original Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_certificado_origem",
        "coluna": "Data do Cert. de Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_resultado_analise_lpco",
        "coluna": "Dt Conf. Análise da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_aprovacao_draft_lpco",
        "coluna": "Dt Conf. Aprovação Draft LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_conferencia_draft_lpco",
        "coluna": "Dt Conf. Conferência Draft LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_deferimento_lpco",
        "coluna": "Dt Conf. Deferimento da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_exigencia_lpco",
        "coluna": "Dt Conf. Exigência da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_indeferimento_lpco",
        "coluna": "Dt Conf. Indeferimento da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_registro_lpco",
        "coluna": "Dt Conf. Registro da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_aprovacao_draft_lpco",
        "coluna": "Dt Meta Aprovação Draft LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_conferencia_draft_lpco",
        "coluna": "Dt Meta Conferência Draft LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_resultado_analise_lpco",
        "coluna": "Dt Meta. Análise da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_deferimento_lpco",
        "coluna": "Dt Meta. Deferimento da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_registro_lpco",
        "coluna": "Dt Meta. Registro da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_resultado_analise_lpco",
        "coluna": "Dt Prev. Análise da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_aprovacao_draft_lpco",
        "coluna": "Dt Prev. Aprovação Draft LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_conferencia_draft_lpco",
        "coluna": "Dt Prev. Conferência Draft LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_deferimento_lpco",
        "coluna": "Dt Prev. Deferimento da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_registro_lpco",
        "coluna": "Dt Prev. Registro da LPCO",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_aprovacao_draft_cert_origem",
        "coluna": "Meta Aprov. Draft Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_envio_original_cert_origem",
        "coluna": "Meta Envio Original Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_draft_cert_origem",
        "coluna": "Meta Rec. Draft Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_original_cert_origem",
        "coluna": "Meta Rec. Original Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_aprovacao_draft_cert_origem",
        "coluna": "Prev. Aprov. Draft Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_envio_original_cert_origem",
        "coluna": "Prev. Envio Original Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_draft_cert_origem",
        "coluna": "Prev. Rec. Draft Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_original_cert_origem",
        "coluna": "Prev. Rec. Original Cert. Origem",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      }
    ]
  },
  {
    "id": "datas",
    "titulo": "Datas",
    "colunas": [
      {
        "key": "data_confirmada_aprovacao_rascunho_invoice",
        "coluna": "Data Confirmada: Aprovação Draft Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_aprovacao_rascunho_pedido",
        "coluna": "Data Confirmada: Aprovação Draft Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_aprovacao_rascunho_proforma",
        "coluna": "Data Confirmada: Aprovação Draft Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_coleta_pedido",
        "coluna": "Data Confirmada: Coleta",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_envio_original_invoice",
        "coluna": "Data Confirmada: Envio Original Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_envio_original_proforma",
        "coluna": "Data Confirmada: Envio Original Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_inspecao_pedido",
        "coluna": "Data Confirmada: Inspeção",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_pedido_pronto",
        "coluna": "Data Confirmada: Pedido Pronto",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_rascunho_invoice",
        "coluna": "Data Confirmada: Recebimento Draft Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_rascunho_pedido",
        "coluna": "Data Confirmada: Recebimento Draft Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_rascunho_proforma",
        "coluna": "Data Confirmada: Recebimento Draft Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_original_invoice",
        "coluna": "Data Confirmada: Recebimento Original Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_confirmada_recebimento_original_proforma",
        "coluna": "Data Confirmada: Recebimento Original Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_consolidacao_pedido",
        "coluna": "Data de Consolidação do Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_transferencia_saldo_pedido",
        "coluna": "Data de Transferência de Saldo",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_invoice",
        "coluna": "Data do Documento da Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_proforma_invoice",
        "coluna": "Data do Documento da Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_documento_pedido",
        "coluna": "Data do Documento do Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_documento_invoice",
        "coluna": "Data Doc. Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_documento_proforma",
        "coluna": "Data Doc. Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_aprovacao_rascunho_invoice",
        "coluna": "Data Meta: Aprovação Draft Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_aprovacao_rascunho_pedido",
        "coluna": "Data Meta: Aprovação Draft Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_aprovacao_rascunho_proforma",
        "coluna": "Data Meta: Aprovação Draft Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_coleta_pedido",
        "coluna": "Data Meta: Coleta",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_envio_original_invoice",
        "coluna": "Data Meta: Envio Original Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_envio_original_proforma",
        "coluna": "Data Meta: Envio Original Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_inspecao_pedido",
        "coluna": "Data Meta: Inspeção",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_pedido_pronto",
        "coluna": "Data Meta: Pedido Pronto",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_rascunho_invoice",
        "coluna": "Data Meta: Recebimento Draft Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_rascunho_pedido",
        "coluna": "Data Meta: Recebimento Draft Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_rascunho_proforma",
        "coluna": "Data Meta: Recebimento Draft Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_original_invoice",
        "coluna": "Data Meta: Recebimento Original Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_meta_recebimento_original_proforma",
        "coluna": "Data Meta: Recebimento Original Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_aprovacao_rascunho_invoice",
        "coluna": "Data Prevista: Aprovação Draft Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_aprovacao_rascunho_pedido",
        "coluna": "Data Prevista: Aprovação Draft Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_aprovacao_rascunho_proforma",
        "coluna": "Data Prevista: Aprovação Draft Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_coleta_pedido",
        "coluna": "Data Prevista: Coleta",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_envio_original_invoice",
        "coluna": "Data Prevista: Envio Original Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_envio_original_proforma",
        "coluna": "Data Prevista: Envio Original Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_inspecao_pedido",
        "coluna": "Data Prevista: Inspeção",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_pedido_pronto",
        "coluna": "Data Prevista: Pedido Pronto",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_rascunho_invoice",
        "coluna": "Data Prevista: Recebimento Draft Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_rascunho_pedido",
        "coluna": "Data Prevista: Recebimento Draft Pedido",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_rascunho_proforma",
        "coluna": "Data Prevista: Recebimento Draft Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_original_invoice",
        "coluna": "Data Prevista: Recebimento Original Invoice",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      },
      {
        "key": "data_prevista_recebimento_original_proforma",
        "coluna": "Data Prevista: Recebimento Original Proforma",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si."
      }
    ]
  },
  {
    "id": "personalizadas",
    "titulo": "Personalizadas",
    "colunas": [
      {
        "key": "_colunas_usuario",
        "coluna": "Colunas personalizadas",
        "nivel": "Pedido e item",
        "tipoAlerta": "Divergência pedido × itens",
        "acionamento": "Ícone âmbar quando valores de colunas **customizadas** (texto, número, data, fórmula) divergem entre pedido e itens, ou entre itens."
      }
    ]
  }
]
