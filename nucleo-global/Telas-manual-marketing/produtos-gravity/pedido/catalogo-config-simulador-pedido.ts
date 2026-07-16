import type { KanbanPreferenciasSimulador } from './dados-kanban-simulador-pedido'

export type CategoriaConfigSimuladorPedido =
  | 'cards'
  | 'tabela'
  | 'colunas-casas-decimais'
  | 'colunas-formato-data'
  | 'colunas-personalizadas'
  | 'colunas-campos-calculados'
  | 'kanban-colunas'
  | 'kanban-card'
  | 'kanban-modal'
  | 'status'
  | 'numeracao'
  | 'templates-pdf'

export type TipoColunaPersonalizadaSimulador =
  | 'texto'
  | 'numero'
  | 'data'
  | 'select'
  | 'checkbox'
  | 'percentual'
  | 'tipo_documento'
  | 'formula'

export type ColunaPersonalizadaSimulador = {
  id: string
  chave: string
  nome: string
  tipo: TipoColunaPersonalizadaSimulador
  visivel: boolean
  ordem: number
}

export type StatusConfigSimulador = {
  id: string
  nome: string
  rotulo: string
  cor: string
  ordem: number
  is_sistema: boolean
}

export type CardPeriodoSimulador = '7d' | '30d' | '6m' | '1a' | 'tudo'

export type CardPreferenciaSimulador = {
  id: string
  visivel: boolean
  ordem: number
}

export type CardDefinicaoSimulador = {
  id: string
  nome: string
  descricao: string
  origem: 'Pedido' | 'Item'
  tipoAgg: 'Contagem' | 'Soma' | 'Média'
  cor: string
}

export type TabelaConfigSimulador = {
  linhasPorPagina: 25 | 50 | 100 | 200
  destacarAtrasados: boolean
}

export type NumeracaoConfigSimulador = {
  prefixo: string
  incluirAno: boolean
  digitosSequencia: number
  reiniciar: 'nunca' | 'ano' | 'mes'
  automaticoCriar: boolean
  automaticoDuplicar: boolean
  automaticoConsolidar: boolean
}

export type TemplatePdfSimulador = {
  id: string
  nome: string
  conteudo: string
  criadoEm: string
}

export type FormatoDataSimulador =
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD'
  | 'DD.MM.YYYY'
  | 'DD/MM/YY'

export const FORMATOS_DATA_OPCOES: Array<{
  id: FormatoDataSimulador
  label: string
  exemplo: string
  regiao: string
}> = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/AAAA', exemplo: '13/04/2026', regiao: 'Brasil, Europa' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/AAAA', exemplo: '04/13/2026', regiao: 'EUA' },
  { id: 'YYYY-MM-DD', label: 'AAAA-MM-DD', exemplo: '2026-04-13', regiao: 'ISO 8601, Ásia' },
  { id: 'DD.MM.YYYY', label: 'DD.MM.AAAA', exemplo: '13.04.2026', regiao: 'Alemanha, Rússia' },
  { id: 'DD/MM/YY', label: 'DD/MM/AA', exemplo: '13/04/26', regiao: 'Compacto' },
]

export const CARDS_CATALOGO_SIMULADOR: CardDefinicaoSimulador[] = [
  { id: 'total_pedidos', nome: 'Total de Pedidos', descricao: 'Quantidade total de pedidos', origem: 'Pedido', tipoAgg: 'Contagem', cor: '#818cf8' },
  { id: 'valor_total', nome: 'Valor Total', descricao: 'Soma do valor total dos pedidos', origem: 'Pedido', tipoAgg: 'Soma', cor: '#34d399' },
  { id: 'qtd_total', nome: 'Quantidade Total', descricao: 'Soma das quantidades iniciais', origem: 'Pedido', tipoAgg: 'Soma', cor: '#fbbf24' },
  { id: 'valor_total_brl', nome: 'Total Pedidos - BRL', descricao: 'Todos os pedidos convertidos para R$', origem: 'Pedido', tipoAgg: 'Soma', cor: '#34d399' },
  { id: 'pedidos_atrasados', nome: 'Pedidos Atrasados', descricao: 'Pedidos com data vencida', origem: 'Pedido', tipoAgg: 'Contagem', cor: '#f87171' },
  { id: 'pedidos_abertos', nome: 'Pedidos Abertos', descricao: 'Pedidos com status aberto', origem: 'Pedido', tipoAgg: 'Contagem', cor: '#60a5fa' },
  { id: 'pedidos_andamento', nome: 'Em Andamento', descricao: 'Pedidos em processo de transferência', origem: 'Pedido', tipoAgg: 'Contagem', cor: '#fb923c' },
  { id: 'cobertura_pendente', nome: 'Cobertura Pendente', descricao: 'Valor aguardando cobertura central', origem: 'Pedido', tipoAgg: 'Soma', cor: '#f472b6' },
  { id: 'alertas_total', nome: 'Alertas Total', descricao: 'Quantidade total de alertas', origem: 'Pedido', tipoAgg: 'Contagem', cor: '#fbbf24' },
  { id: 'alertas_pedido', nome: 'Alertas Pedido', descricao: 'Alertas no nível do pedido', origem: 'Pedido', tipoAgg: 'Contagem', cor: '#fbbf24' },
  { id: 'alertas_item', nome: 'Alertas Item', descricao: 'Alertas no nível do item', origem: 'Item', tipoAgg: 'Contagem', cor: '#fbbf24' },
  { id: 'itens_prontos', nome: 'Itens Prontos', descricao: 'Itens com produção concluída', origem: 'Item', tipoAgg: 'Soma', cor: '#34d399' },
  { id: 'saldo_atual', nome: 'Saldo Atual', descricao: 'Soma do saldo disponível de todos os itens', origem: 'Item', tipoAgg: 'Soma', cor: '#818cf8' },
  { id: 'qtd_transferida', nome: 'Qtd. Transferida', descricao: 'Total alocado em processos logísticos', origem: 'Item', tipoAgg: 'Soma', cor: '#2dd4bf' },
  { id: 'qtd_inicial_total', nome: 'Qtd. Inicial Total', descricao: 'Soma das quantidades originais', origem: 'Item', tipoAgg: 'Soma', cor: '#94a3b8' },
  { id: 'valor_itens_total', nome: 'Valor Total dos Itens', descricao: 'Soma do valor de todos os itens', origem: 'Item', tipoAgg: 'Soma', cor: '#34d399' },
]

export const CARDS_PADRAO_ATIVOS: CardPreferenciaSimulador[] = [
  { id: 'total_pedidos', visivel: true, ordem: 0 },
  { id: 'valor_total', visivel: true, ordem: 1 },
  { id: 'qtd_total', visivel: true, ordem: 2 },
]

export const CAMPOS_CASAS_DECIMAIS: Array<{ chave: string; label: string; grupo: 'PEDIDO' | 'PERSONALIZADAS' }> = [
  { chave: 'valor_total_pedido', label: 'Valor Total do Pedido', grupo: 'PEDIDO' },
  { chave: 'valor_unitario_item', label: 'Valor Unitário do Item', grupo: 'PEDIDO' },
  { chave: 'quantidade_total_pedido', label: 'Qtd. Inicial do Pedido', grupo: 'PEDIDO' },
  { chave: 'quantidade_pronta_itens_pedido_total', label: 'Qtd. Pronta do Pedido', grupo: 'PEDIDO' },
  { chave: 'saldo_itens_do_pedido', label: 'Saldo do Pedido', grupo: 'PEDIDO' },
  { chave: 'quantidade_transferida_total', label: 'Qtd. Transferida do Pedido', grupo: 'PEDIDO' },
  { chave: 'quantidade_cancelada_total_pedido', label: 'Qtd. Cancelada do Pedido', grupo: 'PEDIDO' },
  { chave: 'peso_liquido_total_pedido', label: 'Peso Líquido Total do Pedido', grupo: 'PEDIDO' },
  { chave: 'peso_bruto_total_pedido', label: 'Peso Bruto Total do Pedido', grupo: 'PEDIDO' },
  { chave: 'cubagem_total_pedido', label: 'Cubagem Total do Pedido', grupo: 'PEDIDO' },
  { chave: 'formula_qt_pedido', label: 'FORMULA QT PEDIDO', grupo: 'PERSONALIZADAS' },
  { chave: 'formula', label: 'FORMULA', grupo: 'PERSONALIZADAS' },
]

export const CASAS_DECIMAIS_PADRAO: Record<string, number> = {
  valor_total_pedido: 3,
  valor_unitario_item: 2,
  quantidade_total_pedido: 2,
  quantidade_pronta_itens_pedido_total: 2,
  saldo_itens_do_pedido: 2,
  quantidade_transferida_total: 2,
  quantidade_cancelada_total_pedido: 2,
  peso_liquido_total_pedido: 3,
  peso_bruto_total_pedido: 3,
  cubagem_total_pedido: 3,
  formula_qt_pedido: 2,
  formula: 2,
}

export const STATUS_PADRAO_SIMULADOR: StatusConfigSimulador[] = [
  { id: 'st-rascunho', nome: 'rascunho', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 0, is_sistema: true },
  { id: 'st-aberto', nome: 'aberto', rotulo: 'Aberto', cor: '#3b82f6', ordem: 1, is_sistema: true },
  { id: 'st-em-andamento', nome: 'em_andamento', rotulo: 'Em Andamento', cor: '#f97316', ordem: 2, is_sistema: true },
  { id: 'st-aprovado', nome: 'aprovado', rotulo: 'Aprovado', cor: '#facc15', ordem: 3, is_sistema: true },
  { id: 'st-transferencia', nome: 'transferencia', rotulo: 'Transferido', cor: '#2dd4bf', ordem: 4, is_sistema: true },
  { id: 'st-consolidado', nome: 'consolidado', rotulo: 'Consolidado', cor: '#a78bfa', ordem: 5, is_sistema: true },
  { id: 'st-cancelado', nome: 'cancelado', rotulo: 'Cancelado', cor: '#ef4444', ordem: 6, is_sistema: true },
]

export const COLUNAS_PERSONALIZADAS_PADRAO: ColunaPersonalizadaSimulador[] = [
  { id: 'cp-1', chave: 'teste_data_v2', nome: 'TESTE DATA V2', tipo: 'data', visivel: true, ordem: 0 },
  { id: 'cp-2', chave: 'teste_checkbox', nome: 'TESTE CHECKBOX', tipo: 'checkbox', visivel: true, ordem: 1 },
  { id: 'cp-3', chave: 'teste_salvar_v2', nome: 'TESTE SALVAR V2', tipo: 'texto', visivel: true, ordem: 2 },
  { id: 'cp-4', chave: 'formula_qt_pedido', nome: 'FORMULA QT PEDIDO', tipo: 'formula', visivel: true, ordem: 3 },
  { id: 'cp-5', chave: 'formula', nome: 'FORMULA', tipo: 'formula', visivel: true, ordem: 4 },
]

export const TIPOS_COLUNA_PERSONALIZADA: Array<{ id: TipoColunaPersonalizadaSimulador; label: string }> = [
  { id: 'texto', label: 'Texto' },
  { id: 'numero', label: 'Número' },
  { id: 'data', label: 'Data' },
  { id: 'select', label: 'Seleção' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'percentual', label: 'Percentual' },
  { id: 'tipo_documento', label: 'Tipo documento' },
  { id: 'formula', label: 'Fórmula' },
]

export const KANBAN_CARD_CAMPOS_DISPONIVEIS = [
  { campo: 'nome_importador', label: 'Importador', grupo: 'Parceiro' },
  { campo: 'quantidade_total_pedido', label: 'Nº de itens', grupo: 'Pedido' },
  { campo: 'numero_invoice', label: 'Nº Invoice', grupo: 'Documentos' },
  { campo: 'numero_proforma', label: 'Nº Proforma', grupo: 'Documentos' },
  { campo: 'status', label: 'Status', grupo: 'Status e Progresso' },
  { campo: 'saldo_itens_do_pedido', label: 'Saldo (barra)', grupo: 'Status e Progresso' },
]

export const KANBAN_MODAL_CAMPOS_DISPONIVEIS = [
  { campo: 'nome_importador', label: 'Importador', aba: 'pedido' as const },
  { campo: 'referencia_exportador', label: 'Ref. Exportador', aba: 'pedido' as const },
  { campo: 'referencia_importador', label: 'Ref. Importador', aba: 'pedido' as const },
  { campo: 'condicao_pagamento', label: 'Cond. Pagamento', aba: 'pedido' as const },
  { campo: 'peso_liquido_total_pedido', label: 'Peso Líquido', aba: 'quantidades' as const },
  { campo: 'peso_bruto_total_pedido', label: 'Peso Bruto', aba: 'quantidades' as const },
  { campo: 'data_prevista_inspecao_pedido', label: 'Prev. Inspeção', aba: 'datas' as const },
]

export const SALDO_FORMULA_PADRAO =
  '[Quantidade Inicial] - [Quantidade Transferida] - [Quantidade Cancelada]'

export function criarKanbanPrefsPadrao(): KanbanPreferenciasSimulador {
  return {
    card: {
      campos: [
        { campo: 'numero_pedido', label: 'Nº do Pedido', visivel: true, ordem: 0 },
        { campo: 'nome_exportador', label: 'Exportador', visivel: true, ordem: 1 },
        { campo: 'valor_total_pedido', label: 'Valor Total', visivel: true, ordem: 2 },
        { campo: 'incoterm', label: 'Incoterm', visivel: true, ordem: 3 },
        { campo: 'saldo_itens_do_pedido', label: 'Saldo (barra)', visivel: true, ordem: 4 },
      ],
      dataCritica: 'data_prevista_coleta_pedido',
    },
    abas: [
      {
        aba: 'pedido',
        campos: [
          { campo: 'numero_pedido', label: 'Nº Pedido', visivel: true, ordem: 0 },
          { campo: 'tipo_operacao', label: 'Tipo de Operação', visivel: true, ordem: 1 },
          { campo: 'nome_exportador', label: 'Exportador', visivel: true, ordem: 2 },
          { campo: 'valor_total_pedido', label: 'Valor Total', visivel: true, ordem: 3 },
          { campo: 'moeda_pedido', label: 'Moeda do Pedido/Item', visivel: true, ordem: 4 },
          { campo: 'incoterm', label: 'Incoterm', visivel: true, ordem: 5 },
          { campo: 'numero_invoice', label: 'Nº Invoice', visivel: true, ordem: 6 },
          { campo: 'numero_proforma', label: 'Nº Proforma', visivel: true, ordem: 7 },
        ],
      },
      {
        aba: 'quantidades',
        campos: [
          { campo: 'quantidade_total_pedido', label: 'Qtd. Inicial', visivel: true, ordem: 0 },
          { campo: 'quantidade_pronta_itens_pedido_total', label: 'Qtd. Pronta', visivel: true, ordem: 1 },
          { campo: 'quantidade_transferida_total', label: 'Qtd. Transferida', visivel: true, ordem: 2 },
          { campo: 'quantidade_cancelada_total_pedido', label: 'Qtd. Cancelada', visivel: true, ordem: 3 },
          { campo: 'saldo_itens_do_pedido', label: 'Saldo', visivel: true, ordem: 4 },
        ],
      },
      {
        aba: 'datas',
        campos: [
          { campo: 'data_emissao_pedido', label: 'Data P.O.', visivel: true, ordem: 0 },
          { campo: 'data_prevista_coleta_pedido', label: 'Prev. Coleta', visivel: true, ordem: 1 },
          { campo: 'data_confirmada_coleta_pedido', label: 'Conf. Coleta', visivel: true, ordem: 2 },
          { campo: 'data_prevista_pedido_pronto', label: 'Prev. Pronto', visivel: true, ordem: 3 },
        ],
      },
    ],
  }
}

export function statusParaListaValor(nome: string): string {
  const mapa: Record<string, string> = {
    rascunho: 'RASCUNHO',
    aberto: 'ABERTO',
    em_andamento: 'EM ANDAMENTO',
    aprovado: 'APROVADO',
    transferencia: 'TRANSFERIDO',
    consolidado: 'CONSOLIDADO',
    cancelado: 'CANCELADO',
  }
  return mapa[nome] ?? nome.toUpperCase().replace(/\s+/g, ' ')
}
