import type {
  ColunaMapeadaSimulador,
  SmartImportAlertaSimulador,
  SmartImportLinhaSimulador,
  SmartImportPreviewSimulador,
} from './tipos-smart-import-simulador-pedido'
import {
  CAMPOS_PEDIDO_DDD_TODOS,
  ROTULO_POR_CAMPO,
  prioridadeDeCampo,
} from '../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd'

export const LIMITE_LINHAS_IMPORTACAO_SIMULADOR = 1000

/** Formatos aceitos no Smart Import (sem PDF — leitura de PDF é via Smart Docs). */
export const EXTENSOES_IMPORTACAO_SIMULADOR = ['xlsx', 'xls', 'csv', 'xml', 'json', 'txt'] as const

export const FORMATOS_ICONE_IMPORTACAO_SIMULADOR = [
  { ext: 'xlsx', label: 'Excel' },
  { ext: 'csv', label: 'CSV' },
  { ext: 'xml', label: 'XML' },
  { ext: 'json', label: 'JSON' },
  { ext: 'txt', label: 'TXT' },
] as const

export type CampoSistemaOpcaoSimulador = {
  valor: string
  rotulo: string
  nivel: 'pedido' | 'item'
  obrigatorio?: boolean
  essencial?: boolean
}

export const CAMPOS_SISTEMA_SMART_IMPORT_SIMULADOR: CampoSistemaOpcaoSimulador[] = CAMPOS_PEDIDO_DDD_TODOS.map((c) => ({
  valor: c.campo,
  rotulo: c.rotulo,
  nivel: c.nivel,
  obrigatorio: c.obrigatorio,
  essencial: prioridadeDeCampo(c) !== 'secundaria',
}))

export const ROTULO_CAMPO_SMART_IMPORT_SIMULADOR: Record<string, string> = {
  ...ROTULO_POR_CAMPO,
}

/** Mapeamento legado do mock DEV do produto real → campos DDD da lista. */
export const ALIAS_CAMPO_IMPORTACAO_SIMULADOR: Record<string, string> = {
  exportador: 'nome_exportador',
  part_number: 'part_number_item',
  ncm: 'ncm_item',
  incoterm: 'incoterm_pedido',
  tipo_operacao: 'tipo_operacao_pedido',
  quantidade_inicial_pedido: 'quantidade_inicial_item',
  unidade: 'unidade_comercializada_item',
  unidade_comercializada_pedido: 'unidade_comercializada_item',
  data_embarque: 'data_emissao_pedido',
}

export function rotuloCampoSmartImportSimulador(campo: string): string {
  return ROTULO_POR_CAMPO[campo] ?? campo.replace(/_/g, ' ')
}

export function criarPreviewSmartImportSimulador(nomeArquivo: string): SmartImportPreviewSimulador {
  void nomeArquivo

  const colunasMock: Array<{
    coluna: string
    campo: string | null
    conf: number
    exemplo: string | null
  }> = [
    { coluna: 'PO Number', campo: 'numero_pedido', conf: 97, exemplo: '021597-00' },
    { coluna: 'Supplier', campo: 'nome_exportador', conf: 88, exemplo: 'STORK THERMEQ B.V.' },
    { coluna: 'NCM', campo: 'ncm', conf: 95, exemplo: '8471.30.19' },
    { coluna: 'Part No.', campo: 'part_number_item', conf: 91, exemplo: 'STE-A4-001' },
    { coluna: 'Description', campo: 'descricao_item', conf: 85, exemplo: 'Heat exchanger plate' },
    { coluna: 'Qty', campo: 'quantidade_inicial_item', conf: 78, exemplo: '100' },
    { coluna: 'Unit', campo: 'unidade_comercializada_pedido', conf: 72, exemplo: 'UN' },
    { coluna: 'Unit Price', campo: 'valor_por_unidade_item', conf: 83, exemplo: '330,00' },
    { coluna: 'Currency', campo: 'moeda_pedido', conf: 90, exemplo: 'USD' },
    { coluna: 'Incoterms', campo: 'incoterm', conf: 94, exemplo: 'FOB' },
    { coluna: 'Ship Date', campo: 'data_emissao_pedido', conf: 67, exemplo: '30/05/2023' },
    { coluna: 'Internal Ref', campo: null, conf: 15, exemplo: 'HPB-2023-042' },
  ]

  const mapeamento: ColunaMapeadaSimulador[] = colunasMock.map((c) => ({
    coluna_arquivo: c.coluna,
    campo_sistema: c.campo,
    confianca: c.conf,
    nivel: c.conf >= 90 ? 'auto' : c.conf >= 50 ? 'confirmado' : 'ignorado',
    inferido_por: c.conf >= 90 ? 'ia' : c.conf >= 50 ? 'dados' : 'ia',
    valor_exemplo_coluna_pedido: c.exemplo,
  }))

  const alertasDuplicata: SmartImportAlertaSimulador[] = [{
    campo: 'numero_pedido',
    tipo: 'duplicado_sistema',
    mensagem: 'Pedido PO-2026/003 já existe no sistema',
    nivel: 'aviso',
  }]

  const linhas: SmartImportLinhaSimulador[] = [
    {
      linha_arquivo: 2,
      numero_pedido: '021597-00',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: '021597-00',
        nome_exportador: 'STORK THERMEQ B.V.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        data_emissao_pedido: '30/05/2023',
        part_number_item: 'STE-A4-001',
        descricao_item: 'Heat exchanger plate',
        quantidade_inicial_item: 100,
        unidade_comercializada_pedido: 'UN',
        valor_por_unidade_item: 330,
        ncm: '8471.30.19',
        tipo_operacao: 'importacao',
      },
    },
    {
      linha_arquivo: 3,
      numero_pedido: 'PO-2026/011',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: 'PO-2026/011',
        nome_exportador: 'Dongguan Electronics Ltd.',
        incoterm: 'CIF',
        moeda_pedido: 'USD',
        part_number_item: 'DGL-7700',
        descricao_item: 'Motor controller board',
        quantidade_inicial_item: 50,
        unidade_comercializada_pedido: 'UN',
        valor_por_unidade_item: 85,
        ncm: '8544.42.90',
        tipo_operacao: 'importacao',
      },
    },
    {
      linha_arquivo: 4,
      numero_pedido: 'PO-2026/003',
      status: 'aviso',
      alertas: alertasDuplicata,
      dados: {
        numero_pedido: 'PO-2026/003',
        nome_exportador: 'Berlin GmbH',
        incoterm: 'DAP',
        moeda_pedido: 'EUR',
        part_number_item: 'BRL-220V',
        descricao_item: 'Power supply unit',
        quantidade_inicial_item: 200,
        unidade_comercializada_pedido: 'UN',
        valor_por_unidade_item: 45,
        tipo_operacao: 'importacao',
      },
    },
    {
      linha_arquivo: 5,
      numero_pedido: 'PO-2026/012',
      status: 'aviso',
      alertas: [{
        campo: 'ncm',
        tipo: 'formato_invalido',
        mensagem: 'NCM "8471" parece incompleto (esperado 8 dígitos)',
        nivel: 'aviso',
      }],
      dados: {
        numero_pedido: 'PO-2026/012',
        nome_exportador: 'Guangzhou Supplies Co.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        part_number_item: 'GZH-CAB-001',
        descricao_item: 'Cable assembly',
        quantidade_inicial_item: 500,
        unidade_comercializada_pedido: 'MT',
        valor_por_unidade_item: 3.2,
        ncm: '8471',
        tipo_operacao: 'importacao',
      },
    },
    {
      linha_arquivo: 6,
      numero_pedido: null,
      status: 'erro',
      alertas: [{
        campo: 'quantidade_inicial_item',
        tipo: 'valor_negativo',
        mensagem: 'Quantidade deve ser maior que zero',
        nivel: 'erro',
      }],
      dados: {
        quantidade_inicial_item: -5,
        nome_exportador: 'Unknown Supplier',
        tipo_operacao: 'importacao',
      },
    },
  ]

  const dados_brutos = linhas.map((l) => ({
    linha: l.linha_arquivo,
    valores: Object.fromEntries(
      Object.entries(l.dados).map(([k, v]) => [k, String(v ?? '')]),
    ),
  }))

  return {
    preview_id: `sim-preview-${Date.now()}`,
    total_linhas: linhas.length,
    total_pedidos: 4,
    total_itens: linhas.filter((l) => l.status !== 'erro').length,
    mapeamento,
    confianca_global: 83,
    memoria_aplicada: false,
    linhas,
    dados_brutos,
    extrator_usado: 'xlsx',
  }
}
