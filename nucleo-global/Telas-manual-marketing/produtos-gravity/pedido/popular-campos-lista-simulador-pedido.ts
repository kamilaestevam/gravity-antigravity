import { CHAVES_COLUNAS_BUILTIN_SIMULADOR_PEDIDO } from './colunas-lista-simulador-pedido'
import type { StatusListaPedidoSimulador } from './dados-lista-simulador-pedido'

function formatarValorLista(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export type ContextoCamposPedidoListaSimulador = {
  id: string
  numeroPedido: string
  tipoOperacao: 'IMPORTAÇÃO' | 'EXPORTAÇÃO'
  status: StatusListaPedidoSimulador
  workspace: string
  exportador: string
  vincularExportador: boolean
  incoterm: string
  alertaIncoterm: boolean
  portoOrigem: string
  valorFob: number
  moeda: string
  dataAbertura: string
  qtdItens: number
}

export type ContextoCamposItemListaSimulador = ContextoCamposPedidoListaSimulador & {
  sequencia: number
  numeroItem: string
}

const CAMPOS_SEMPRE_PREENCHIDOS = new Set([
  'numero_pedido',
  'tipo_operacao',
  'status',
  'id_workspace',
])

const CAMPOS_SOMENTE_ITEM = new Set([
  'descricao_item',
  'ncm',
  'valor_por_unidade_item',
])

const IDS_COLUNAS_MANUAIS = [
  'coluna_usuario:obs_comercial',
  'coluna_usuario:prioridade_embarque',
  'coluna_usuario:centro_custo',
  'coluna_usuario:responsavel_interno',
  'coluna_usuario:canal_origem',
  'coluna_usuario:projeto',
  'coluna_usuario:tag_risco',
  'coluna_usuario:sla_dias',
  'coluna_usuario:frete_estimado',
  'coluna_usuario:margem_prevista',
  'coluna_usuario:comprador',
  'coluna_usuario:analista_comex',
  'coluna_usuario:referencia_cliente',
  'coluna_usuario:tipo_embalagem_extra',
  'coluna_usuario:inspecao_obrigatoria',
  'coluna_usuario:obs_logistica',
  'coluna_usuario:score_fornecedor',
]

const PAIS_POR_PORTO: Record<string, string> = {
  SHENZHEN: 'CHINA',
  YOKOHAMA: 'JAPÃO',
  TOKYO: 'JAPÃO',
  HAMBURG: 'ALEMANHA',
  ROTTERDAM: 'HOLANDA',
  LONDON: 'REINO UNIDO',
  GOTHENBURG: 'SUÉCIA',
  'LE HAVRE': 'FRANÇA',
  GENOVA: 'ITÁLIA',
  OSLO: 'NORUEGA',
  RECIFE: 'BRASIL',
  SANTOS: 'BRASIL',
  PARANAGUÁ: 'BRASIL',
  KAOHSIUNG: 'TAIWAN',
  BUSAN: 'COREIA DO SUL',
}

const AEROPORTOS = ['GRU', 'VCP', 'MIA', 'FRA', 'PVG', 'NRT', 'LHR']
const ESTADOS = ['SP', 'PR', 'SC', 'RJ', 'BY', 'CA', 'TX']
const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']
const COBERTURAS = ['ACC', 'ACE', 'ACD', '—']
const RELACOES_FAB = ['Mesmo grupo', 'Terceiro', 'Intermediário']
const NCM_DEMO = ['8471.30.12', '8409.99.99', '8517.62.55', '7308.90.00', '3926.90.90']
const DESCRICOES_DEMO = [
  'Motor elétrico industrial',
  'Placa de circuito SMD',
  'Válvula hidráulica',
  'Parafusos inox A2-70',
  'Embalagem plástica técnica',
]
const CONTATOS = ['James Miller', 'Anna Schmidt', 'Yuki Tanaka', 'Maria Rossi', 'Chen Wei']
const CARGOS = ['Sales Manager', 'Export Director', 'Account Executive', 'Logistics Lead']
const DEPTOS = ['Comercial', 'Export', 'Supply Chain', 'Financeiro']

function hashSimples(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i += 1) h = (h * 31 + texto.charCodeAt(i)) % 10000
  return h
}

/** Taxa 65–70% por entidade (pedido ou item), estável entre recargas. */
function taxaPreenchimentoEntidade(id: string): number {
  return 65 + (hashSimples(id) % 6)
}

function devePreencherCampo(idEntidade: string, chave: string): boolean {
  if (CAMPOS_SEMPRE_PREENCHIDOS.has(chave)) return true
  const taxa = taxaPreenchimentoEntidade(idEntidade)
  return hashSimples(`${idEntidade}|${chave}`) % 100 < taxa
}

function escolher<T>(lista: T[], h: number): T {
  return lista[h % lista.length] as T
}

function dataOffset(dataBase: string, dias: number): string {
  const [d, m, y] = dataBase.split('/').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + dias)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${dt.getFullYear()}`
}

function refExportador(numero: string): string {
  const m = numero.match(/(\d+)/)
  return m ? `D-${m[1].slice(-4)}` : `D-${hashSimples(numero) % 9999}`
}

function valorManual(id: string, h: number): string {
  const mapa: Record<string, string[]> = {
    'coluna_usuario:obs_comercial': ['Aguardar confirmação do fornecedor', 'Priorizar embarque Q3', 'Revisar incoterm'],
    'coluna_usuario:prioridade_embarque': ['Alta', 'Média', 'Baixa'],
    'coluna_usuario:centro_custo': ['CC-IMP-01', 'CC-EXP-02', 'CC-COMEX'],
    'coluna_usuario:responsavel_interno': ['Ana Costa', 'Bruno Lima', 'Carla Mendes'],
    'coluna_usuario:canal_origem': ['E-mail', 'EDI', 'Portal'],
    'coluna_usuario:projeto': ['Projeto Atlas', 'Projeto Orion', 'Projeto Vega'],
    'coluna_usuario:tag_risco': ['Baixo', 'Médio', 'Alto'],
    'coluna_usuario:sla_dias': ['15', '30', '45'],
    'coluna_usuario:frete_estimado': ['12.400,00', '8.900,00', '21.300,00'],
    'coluna_usuario:margem_prevista': ['18%', '22%', '12%'],
    'coluna_usuario:comprador': ['Equipe SP', 'Equipe PR', 'Equipe SC'],
    'coluna_usuario:analista_comex': ['Marina R.', 'Pedro T.', 'Julia F.'],
    'coluna_usuario:referencia_cliente': ['CLI-2026/88', 'CLI-2026/91', 'CLI-2026/104'],
    'coluna_usuario:tipo_embalagem_extra': ['Pallet', 'Caixa', 'Container'],
    'coluna_usuario:inspecao_obrigatoria': ['Sim', 'Não'],
    'coluna_usuario:obs_logistica': ['Coleta agendada', 'Aguardando booking', 'Draft pendente'],
    'coluna_usuario:score_fornecedor': ['92', '85', '78'],
  }
  return escolher(mapa[id] ?? ['—'], h)
}

function candidatoCampoPedido(
  chave: string,
  ctx: ContextoCamposPedidoListaSimulador,
  h: number,
): string | null {
  const porto = ctx.portoOrigem === '—' ? escolher(['HAMBURG', 'SANTOS', 'SHENZHEN', 'ROTTERDAM'], h) : ctx.portoOrigem
  const pais = PAIS_POR_PORTO[porto] ?? escolher(['ALEMANHA', 'CHINA', 'BRASIL', 'EUA'], h)
  const qtd = Math.max(ctx.qtdItens, 1)
  const saldo = Math.max(qtd * 10 - h % 40, 0)
  const pronta = Math.floor(saldo * 0.6)
  const transferida = ctx.status === 'TRANSFERIDO' ? Math.floor(qtd * 8) : Math.floor(qtd * 2)
  const cancelada = ctx.status === 'RASCUNHO' ? 0 : h % 5
  const incoterm = ctx.incoterm === '—' ? escolher(INCOTERMS, h) : ctx.incoterm
  const exportador = ctx.vincularExportador ? null : ctx.exportador
  const fabricante = exportador ?? escolher(['Global Parts GmbH', 'Pacific Mfg Ltd', 'Nordic Steel AB'], h)

  switch (chave) {
    case 'numero_pedido':
      return ctx.numeroPedido
    case 'tipo_operacao':
      return ctx.tipoOperacao
    case 'status':
      return ctx.status
    case 'id_workspace':
      return ctx.workspace
    case 'nome_exportador':
      return exportador
    case 'nome_importador':
      return ctx.tipoOperacao === 'EXPORTAÇÃO' ? escolher(['Midwest Foods US', 'London Importers', 'Tokyo Trading'], h) : escolher(['Importador — Nome', 'Gravity Importações'], h)
    case 'referencia_exportador':
      return refExportador(ctx.numeroPedido)
    case 'referencia_importador':
      return `IMP-${1000 + (h % 8999)}`
    case 'incoterm':
      return incoterm
    case 'porto_origem':
      return porto
    case 'porto_destino':
      return ctx.tipoOperacao === 'IMPORTAÇÃO' ? escolher(['SANTOS', 'PARANAGUÁ', 'ITAJAÍ'], h) : porto
    case 'local_de_origem':
      return pais
    case 'local_de_destino':
      return ctx.tipoOperacao === 'IMPORTAÇÃO' ? 'BRASIL' : escolher(['EUA', 'ALEMANHA', 'FRANÇA'], h)
    case 'aeroporto_origem':
      return escolher(AEROPORTOS, h)
    case 'aeroporto_destino':
      return escolher(AEROPORTOS, h + 3)
    case 'descricao_item':
    case 'ncm':
    case 'valor_por_unidade_item':
      return null
    case 'moeda_pedido':
      return ctx.moeda
    case 'valor_total_pedido':
      return ctx.valorFob > 0 ? `${ctx.moeda} ${formatarValorLista(ctx.valorFob)}` : `${ctx.moeda} ${formatarValorLista(1000 + (h % 50000))}`
    case 'quantidade_total_pedido':
      return String(qtd * 10)
    case 'quantidade_pronta_itens_pedido_total':
      return String(pronta)
    case 'saldo_itens_do_pedido':
      return String(saldo)
    case 'quantidade_transferida_total':
      return String(transferida)
    case 'quantidade_cancelada_total_pedido':
      return String(cancelada)
    case 'unidade_comercializada_pedido':
      return escolher(['UN', 'KG', 'MT', 'PAR'], h)
    case 'tipo_volume_pedido':
      return escolher(['CAIXA', 'PALLET', 'CONTAINER', 'SACO'], h)
    case 'quantidade_volumes_pedido':
      return String(Math.max(1, Math.floor(qtd / 2) + (h % 5)))
    case 'peso_liquido_total_pedido':
      return `${(qtd * 120 + h % 500).toLocaleString('pt-BR')} KG`
    case 'peso_bruto_total_pedido':
      return `${(qtd * 140 + h % 600).toLocaleString('pt-BR')} KG`
    case 'cubagem_total_pedido':
      return `${(qtd * 0.8 + (h % 50) / 10).toFixed(2)} M³`
    case 'cnpj_importador':
      return ctx.tipoOperacao === 'IMPORTAÇÃO' ? '12.345.678/0001-90' : null
    case 'cnpj_exportador':
      return ctx.tipoOperacao === 'EXPORTAÇÃO' ? '98.765.432/0001-10' : null
    case 'pais_exportador':
      return pais
    case 'estado_exportador':
      return escolher(ESTADOS, h)
    case 'cidade_exportador':
      return porto
    case 'endereco_exportador':
      return `${100 + (h % 900)} Harbor Street`
    case 'zip_code_exportador':
      return `${10000 + (h % 89999)}`
    case 'nome_contato_exportador':
      return escolher(CONTATOS, h)
    case 'email_contato_exportador':
      return `contato${h % 99}@export.demo`
    case 'whatsapp_contato_exportador':
      return `+1 555 ${1000 + (h % 8999)}`
    case 'cargo_contato_exportador':
      return escolher(CARGOS, h)
    case 'departamento_contato_exportador':
      return escolher(DEPTOS, h)
    case 'nome_fabricante':
      return fabricante
    case 'referencia_fabricante':
      return `FAB-${2000 + (h % 7999)}`
    case 'relacao_exportador_fabricante':
      return escolher(RELACOES_FAB, h)
    case 'exportador_ou_fabricante':
      return escolher(['Exportador', 'Fabricante', 'Ambos'], h)
    case 'endereco_fabricante':
      return `${50 + (h % 450)} Industrial Park`
    case 'cidade_fabricante':
      return escolher(['Shenzhen', 'Stuttgart', 'Detroit', 'Milan'], h)
    case 'pais_fabricante':
      return pais
    case 'estado_fabricante':
      return escolher(ESTADOS, h + 1)
    case 'zip_code_fabricante':
      return `${20000 + (h % 79999)}`
    case 'cobertura_cambial':
      return escolher(COBERTURAS.filter((c) => c !== '—'), h)
    case 'condicao_pagamento':
      return escolher(['30/60/90 dias', 'À vista', '50% antecipado', 'LC 90 dias'], h)
    case 'condicao_pagamento_siscomex':
      return escolher(['01', '02', '14', '21'], h)
    case 'moeda_cambio_pedido':
      return escolher([ctx.moeda, 'USD', 'EUR', 'GBP'], h)
    case 'taxa_cambio_estimada':
      return (5.0 + (h % 80) / 100).toFixed(4)
    case 'valor_total_cambio_pedido':
      return formatarValorLista((ctx.valorFob > 0 ? ctx.valorFob : 10000 + h) * 5.2)
    case 'contrato_cambio_id_pedido':
      return `CAMB-${1000 + (h % 8999)}`
    case 'numero_proforma':
      return `PF-${ctx.numeroPedido.replace(/\D/g, '').slice(-4) || h % 9999}`
    case 'numero_invoice':
      return `INV-${ctx.numeroPedido.replace(/\D/g, '').slice(-4) || h % 9999}`
    case 'data_emissao_pedido':
    case 'data_documento_pedido':
      return ctx.dataAbertura
    case 'data_consolidacao_pedido':
      return dataOffset(ctx.dataAbertura, -(h % 10))
    case 'data_transferencia_saldo_pedido':
      return dataOffset(ctx.dataAbertura, -(h % 15))
    case 'anexo_pedido':
    case 'anexo_proforma':
    case 'anexo_invoice':
      return `${1 + (h % 3)} arquivo${h % 3 > 0 ? 's' : ''}`
    case 'cnpj_raiz_empresa_responsavel':
      return `${10000000 + (h % 89999999)}`.slice(0, 8)
    case 'codigo_ope':
      return `OPE${1000 + (h % 8999)}`
    case 'situacao_ope':
      return escolher(['ATIVO', 'ATIVO', 'SUSPENSO'], h)
    case 'versao_ope':
      return String(1 + (h % 5))
    case 'nome_ope':
      return exportador ?? 'Operador Exterior Demo'
    case 'pais_ope':
      return pais
    case 'estado_ope':
      return escolher(ESTADOS, h + 2)
    case 'cidade_ope':
      return escolher(['Berlin', 'Shanghai', 'Chicago', 'Rotterdam'], h)
    case 'endereco_ope':
      return `${10 + (h % 90)} Trade Avenue`
    case 'zip_code_ope':
      return `${30000 + (h % 69999)}`
    case 'tin_ope':
      return `TIN${100000 + (h % 899999)}`
    case 'email_ope':
      return `ope${h % 99}@exterior.demo`
    default:
      if (chave.startsWith('data_')) {
        return dataOffset(ctx.dataAbertura, (h % 60) - 30)
      }
      return `Valor ${chave.split('_').slice(-2).join(' ')}`
  }
}

function candidatoCampoItem(
  chave: string,
  ctx: ContextoCamposItemListaSimulador,
  h: number,
): string | null {
  if (chave === 'numero_pedido') return ctx.numeroItem
  if (chave === 'descricao_item') return escolher(DESCRICOES_DEMO, h)
  if (chave === 'ncm') return escolher(NCM_DEMO, h)
  if (chave === 'valor_por_unidade_item') {
    const unit = ctx.valorFob > 0
      ? ctx.valorFob / Math.max(ctx.qtdItens, 1) / 10
      : 100 + (h % 500)
    return `${ctx.moeda} ${formatarValorLista(unit)}`
  }
  if (chave === 'quantidade_total_pedido') return String(8 + (h % 12))
  if (chave === 'saldo_itens_do_pedido') return String(6 + (h % 8))
  if (chave === 'quantidade_pronta_itens_pedido_total') return String(3 + (h % 6))
  if (chave === 'quantidade_transferida_total') {
    return ctx.status === 'TRANSFERIDO' ? String(6 + (h % 4)) : String(h % 3)
  }
  return candidatoCampoPedido(chave, ctx, h)
}

function aplicarTaxaPreenchimento(
  idEntidade: string,
  chave: string,
  candidato: string | null,
  forcarVazio = false,
): string | null {
  if (forcarVazio) return null
  if (candidato === null || candidato === '') return null
  if (!devePreencherCampo(idEntidade, chave)) return null
  return candidato
}

export function popularCamposPedidoListaSimulador(
  ctx: ContextoCamposPedidoListaSimulador,
): Record<string, string | null> {
  const h = hashSimples(ctx.id)
  const campos: Record<string, string | null> = {}

  for (const chave of CHAVES_COLUNAS_BUILTIN_SIMULADOR_PEDIDO) {
    const forcarVazio =
      CAMPOS_SOMENTE_ITEM.has(chave)
      || (chave === 'nome_exportador' && ctx.vincularExportador)
    campos[chave] = aplicarTaxaPreenchimento(
      ctx.id,
      chave,
      candidatoCampoPedido(chave, ctx, h + hashSimples(chave)),
      forcarVazio,
    )
  }

  for (const id of IDS_COLUNAS_MANUAIS) {
    campos[id] = aplicarTaxaPreenchimento(ctx.id, id, valorManual(id, h + hashSimples(id)))
  }

  return campos
}

export function popularCamposItemListaSimulador(
  ctx: ContextoCamposItemListaSimulador,
): Record<string, string | null> {
  const idItem = `${ctx.id}-item-${ctx.sequencia}`
  const h = hashSimples(idItem)
  const campos: Record<string, string | null> = {}

  for (const chave of CHAVES_COLUNAS_BUILTIN_SIMULADOR_PEDIDO) {
    campos[chave] = aplicarTaxaPreenchimento(
      idItem,
      chave,
      candidatoCampoItem(chave, ctx, h + hashSimples(chave)),
    )
  }

  for (const id of IDS_COLUNAS_MANUAIS) {
    campos[id] = aplicarTaxaPreenchimento(idItem, id, valorManual(id, h + hashSimples(id)))
  }

  return campos
}
