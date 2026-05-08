/**
 * Pools de dados realistas para gerar pedidos de teste de carga.
 * Sem dependencias externas — todos os dados embutidos.
 */

export const NCMS_REAIS = [
  { codigo: '8517.62.59', desc: 'Roteador Wi-Fi 6 dual-band' },
  { codigo: '8528.59.20', desc: 'Painel LCD para monitor/notebook' },
  { codigo: '9027.50.20', desc: 'Sensor de pressao industrial' },
  { codigo: '9025.19.10', desc: 'Sensor de temperatura digital' },
  { codigo: '8528.72.00', desc: 'Monitor LED Full HD' },
  { codigo: '6403.99.90', desc: 'Tenis esportivo' },
  { codigo: '9011.20.20', desc: 'Microscopio binocular' },
  { codigo: '8507.60.00', desc: 'Bateria de litio LiFePO4' },
  { codigo: '8504.40.20', desc: 'BMS para bateria com bluetooth' },
  { codigo: '8544.42.00', desc: 'Cabo de potencia' },
  { codigo: '1201.90.00', desc: 'Soja em graos' },
  { codigo: '8517.13.00', desc: 'Smartphone' },
  { codigo: '9102.12.10', desc: 'Smartwatch GPS' },
  { codigo: '8518.30.00', desc: 'Fone Bluetooth' },
  { codigo: '8504.40.90', desc: 'Powerbank/Carregador USB-C' },
  { codigo: '8467.21.00', desc: 'Furadeira de impacto a bateria' },
  { codigo: '8467.22.00', desc: 'Parafusadeira a bateria' },
  { codigo: '0901.21.00', desc: 'Cafe arabica torrado moido' },
  { codigo: '0901.22.00', desc: 'Cafe robusta torrado em graos' },
  { codigo: '0901.30.00', desc: 'Cafe descafeinado torrado' },
  { codigo: '2101.11.10', desc: 'Capsulas de cafe espresso' },
  { codigo: '7321.11.00', desc: 'Fogao de mesa a gas' },
  { codigo: '8418.21.00', desc: 'Refrigerador domestico' },
  { codigo: '8421.21.00', desc: 'Filtro de agua' },
  { codigo: '9403.30.00', desc: 'Mobiliario de escritorio' },
] as const

export const FORNECEDORES_INT = [
  { suid: 'FXC-CN', nome: 'Foxconn Industrial Internet', pais: 'CN' },
  { suid: 'BSCH-DE', nome: 'Robert Bosch GmbH', pais: 'DE' },
  { suid: 'SMSG-KR', nome: 'Samsung Electronics Co Ltd', pais: 'KR' },
  { suid: 'MTSH-JP', nome: 'Mitsubishi Electric Corporation', pais: 'JP' },
  { suid: 'BYDA-CN', nome: 'BYD Auto Industry Co Ltd', pais: 'CN' },
  { suid: 'XIAO-CN', nome: 'Xiaomi Communications Co Ltd', pais: 'CN' },
  { suid: 'MAGN-DE', nome: 'Magnusson Tools GmbH', pais: 'DE' },
  { suid: 'MAKE-JP', nome: 'Makita Corporation', pais: 'JP' },
  { suid: 'HITC-JP', nome: 'Hitachi Tools Ltd', pais: 'JP' },
  { suid: 'SIEM-DE', nome: 'Siemens AG', pais: 'DE' },
  { suid: 'LG-KR',   nome: 'LG Electronics Inc', pais: 'KR' },
  { suid: 'PHIL-NL', nome: 'Koninklijke Philips NV', pais: 'NL' },
  { suid: 'BORG-DE', nome: 'BorgWarner Inc', pais: 'DE' },
  { suid: 'TYRX-FR', nome: 'Tyrex Pneus SAS', pais: 'FR' },
] as const

export const COMPRADORES_EXP = [
  { suid: 'ACME-US',     nome: 'Acme Trading LLC', pais: 'US' },
  { suid: 'EUROIMP-DE',  nome: 'EuroImp Trading GmbH', pais: 'DE' },
  { suid: 'TARG-US',     nome: 'Target Corp Importing Division', pais: 'US' },
  { suid: 'WALMT-US',    nome: 'Walmart International Sourcing', pais: 'US' },
  { suid: 'CARR-FR',     nome: 'Carrefour SA Sourcing Division', pais: 'FR' },
  { suid: 'MAERSK-DK',   nome: 'A.P. Moller Maersk Trading', pais: 'DK' },
  { suid: 'COSTCO-US',   nome: 'Costco Wholesale Sourcing', pais: 'US' },
  { suid: 'METRO-DE',    nome: 'Metro AG Importing', pais: 'DE' },
] as const

export const INCOTERMS = ['FOB', 'CIF', 'CIP', 'CFR', 'EXW', 'FCA', 'CPT', 'DDP', 'DAP'] as const

export const MOEDAS_PESO: Array<{ codigo: string; peso: number; taxaBrl: number }> = [
  { codigo: 'USD', peso: 60, taxaBrl: 5.4250 },
  { codigo: 'EUR', peso: 25, taxaBrl: 5.8900 },
  { codigo: 'CNY', peso: 10, taxaBrl: 0.7530 },
  { codigo: 'JPY', peso: 5,  taxaBrl: 0.0364 },
]

export const STATUS_PESO: Array<{ valor: string; peso: number }> = [
  { valor: 'rascunho',       peso: 25 },
  { valor: 'aberto',         peso: 25 },
  { valor: 'em_andamento',   peso: 20 },
  { valor: 'aprovado',       peso: 15 },
  { valor: 'transferencia',  peso: 8  },
  { valor: 'consolidado',    peso: 5  },
  { valor: 'cancelado',      peso: 2  },
]

export const TIPO_OP_PESO: Array<{ valor: 'importacao' | 'exportacao'; peso: number }> = [
  { valor: 'importacao', peso: 70 },
  { valor: 'exportacao', peso: 30 },
]

export const UNIDADES = ['PCS', 'PAR', 'UN', 'CX', 'KG', 'TON', 'M', 'M2', 'M3', 'L'] as const

export const COBERTURAS = ['com_cobertura', 'sem_cobertura'] as const

export const CONDICOES_PAGAMENTO = [
  '30 days T/T',
  '60 days L/C',
  'Cash in advance 100%',
  '30/60/90 days T/T',
  'L/C at sight',
  'Cash on delivery',
  'TT 30%/70% before shipment',
  'Open account 60 days',
  'Net 90',
  'Documentary collection',
] as const
