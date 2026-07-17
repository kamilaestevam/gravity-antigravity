/**
 * Catálogo nativo da Lista BID Frete — edição inline.
 * Fonte: colunas-lista-bid-frete-internacional.tsx + salvar-campo-cotacao-bid-frete-internacional.ts
 */
export type ManualBidFreteColunaCatalogo = {
  ordem: number
  coluna: string
  descricao: string
  edicao: string
  fixa?: boolean
  visivelPadrao?: boolean
}

export type ManualBidFreteGrupoCatalogoColunas = {
  id: string
  titulo: string
  nivel: 'pedido'
  colunas: ManualBidFreteColunaCatalogo[]
}

export const TOTAL_COLUNAS_CATALOGO_BID_FRETE_LISTA = 44
export const TOTAL_COLUNAS_PADRAO_LISTA_BID_FRETE = 41

export const GRUPOS_CATALOGO_COLUNAS_BID_FRETE_LISTA: ManualBidFreteGrupoCatalogoColunas[] = [
  {
    id: 'cotacao-identificacao',
    titulo: 'Identificação',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 1,
        coluna: 'Nº da cotação',
        descricao: 'Identificador da cotação; ícone ao lado abre o **Painel da Cotação**.',
        edicao: 'Sim',
        fixa: true,
        visivelPadrao: true,
      },
      {
        ordem: 2,
        coluna: 'Status',
        descricao: 'Fluxo da cotação (rótulos configuráveis em **Configurações**).',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 3,
        coluna: 'Operação',
        descricao: 'Importação ou Exportação.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 4,
        coluna: 'Referência Interna',
        descricao: 'Código de referência interno do workspace.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 5,
        coluna: 'Organização',
        descricao: 'Organização proprietária da cotação.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 6,
        coluna: 'Workspace',
        descricao: 'Filial vinculada à cotação.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 7,
        coluna: 'ID',
        descricao: 'Identificador técnico (oculto por padrão).',
        edicao: 'Não',
        visivelPadrao: false,
      },
      {
        ordem: 8,
        coluna: 'Produto Gravity',
        descricao: 'Produto de origem (oculto por padrão).',
        edicao: 'Sim',
        visivelPadrao: false,
      },
      {
        ordem: 9,
        coluna: 'Usuário',
        descricao: 'Usuário solicitante (oculto por padrão).',
        edicao: 'Sim',
        visivelPadrao: false,
      },
    ],
  },
  {
    id: 'cotacao-modal-visibilidade',
    titulo: 'Modal e visibilidade',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 10,
        coluna: 'Modal',
        descricao: 'Marítimo, Aéreo ou Rodoviário: define quais colunas logísticas aceitam edição.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 11,
        coluna: 'Modalidade',
        descricao: 'FCL, LCL ou carga solta conforme o modal.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 12,
        coluna: 'Visibilidade',
        descricao: 'Aberta ou Direcionada para fornecedores.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 13,
        coluna: 'Anônima',
        descricao: 'Oculta identidade do solicitante na disputa.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
    ],
  },
  {
    id: 'cotacao-logistica',
    titulo: 'Logística',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 14,
        coluna: 'Porto destino',
        descricao: 'Porto de destino: editável quando o **Modal** é **Marítimo**.',
        edicao: 'Sim: modal Marítimo',
        visivelPadrao: true,
      },
      {
        ordem: 15,
        coluna: 'Porto origem',
        descricao: 'Porto de origem: editável quando o **Modal** é **Marítimo**.',
        edicao: 'Sim: modal Marítimo',
        visivelPadrao: true,
      },
      {
        ordem: 16,
        coluna: 'Aeroporto origem',
        descricao: 'Aeroporto de origem: editável quando o **Modal** é **Aéreo**.',
        edicao: 'Sim: modal Aéreo',
        visivelPadrao: true,
      },
      {
        ordem: 17,
        coluna: 'Aeroporto destino',
        descricao: 'Aeroporto de destino: editável quando o **Modal** é **Aéreo**.',
        edicao: 'Sim: modal Aéreo',
        visivelPadrao: true,
      },
      {
        ordem: 18,
        coluna: 'Origem',
        descricao: 'Rótulo derivado de porto/aeroporto ou endereço: **somente leitura** na lista.',
        edicao: 'Não: somente leitura',
        visivelPadrao: true,
      },
      {
        ordem: 19,
        coluna: 'Destino',
        descricao: 'Rótulo derivado de porto/aeroporto ou endereço: **somente leitura** na lista.',
        edicao: 'Não: somente leitura',
        visivelPadrao: true,
      },
      {
        ordem: 20,
        coluna: 'Endereço origem',
        descricao: 'Endereço textual de origem (rodoviário ou complemento).',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 21,
        coluna: 'País origem',
        descricao: 'País de origem.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 22,
        coluna: 'Zipcode origem',
        descricao: 'CEP ou código postal de origem.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 23,
        coluna: 'Endereço destino',
        descricao: 'Endereço textual de destino.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 24,
        coluna: 'País destino',
        descricao: 'País de destino.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 25,
        coluna: 'Zipcode destino',
        descricao: 'CEP ou código postal de destino.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
    ],
  },
  {
    id: 'cotacao-carga',
    titulo: 'Carga',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 26,
        coluna: 'Descrição mercadoria',
        descricao: 'Texto da mercadoria cotada.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 27,
        coluna: 'NCM',
        descricao: 'Classificação fiscal da mercadoria.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 28,
        coluna: 'Quantidade de Volumes',
        descricao: 'Quantidade de volumes ou containers.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 29,
        coluna: 'Tipo container',
        descricao: 'Tipo de container ou embalagem conforme modalidade.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 30,
        coluna: 'Peso (kg)',
        descricao: 'Peso bruto em quilogramas.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 31,
        coluna: 'Volume (m³)',
        descricao: 'Cubagem em metros cúbicos.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 32,
        coluna: 'Incoterm',
        descricao: 'Termo de comércio internacional (FOB, CIF, etc.).',
        edicao: 'Sim',
        visivelPadrao: true,
      },
    ],
  },
  {
    id: 'cotacao-financeiro',
    titulo: 'Financeiro',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 33,
        coluna: 'Moeda meta',
        descricao: 'Moeda do valor meta da cotação.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 34,
        coluna: 'Valor meta',
        descricao: 'Valor alvo da negociação.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 35,
        coluna: 'Ganho estimado',
        descricao: 'Economia estimada em relação ao valor meta.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 36,
        coluna: 'Ganho (%)',
        descricao: 'Percentual de ganho estimado.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
    ],
  },
  {
    id: 'cotacao-prazos-resultado',
    titulo: 'Prazos e resultado',
    nivel: 'pedido',
    colunas: [
      {
        ordem: 37,
        coluna: 'Prazo resposta',
        descricao: 'Data limite para resposta dos fornecedores.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 38,
        coluna: 'Data da cotação',
        descricao: 'Data de criação do registro.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 39,
        coluna: 'Última atualização',
        descricao: 'Atualizada automaticamente pelo sistema ao salvar alterações.',
        edicao: 'Não: automático',
        visivelPadrao: true,
      },
      {
        ordem: 40,
        coluna: 'Data aprovação',
        descricao: 'Data em que a proposta foi aprovada.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 41,
        coluna: 'Data cancelamento',
        descricao: 'Data de cancelamento da cotação.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 42,
        coluna: 'Motivo reprovação',
        descricao: 'Texto do motivo quando a cotação é reprovada.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 43,
        coluna: 'Motivo cancelamento',
        descricao: 'Texto do motivo de cancelamento.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
      {
        ordem: 44,
        coluna: 'Fornecedor vencedor',
        descricao: 'Fornecedor cuja proposta foi aprovada.',
        edicao: 'Sim',
        visivelPadrao: true,
      },
    ],
  },
]
