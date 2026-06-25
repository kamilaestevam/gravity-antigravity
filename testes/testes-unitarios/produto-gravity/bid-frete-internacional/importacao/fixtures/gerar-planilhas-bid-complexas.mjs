/**
 * Gera planilhas fictícias de teste — importação BID Frete Internacional.
 * Saída principal: um .xlsx com várias ABAS (BID Aereo - EUROPA, etc.).
 * Uso: node gerar-planilhas-bid-complexas.mjs [pastaDestino]
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '../../../../../servicos-global/configurador/package.json'))
const XLSX = require('xlsx')

const __dir = dirname(fileURLToPath(import.meta.url))
const destinoBase = process.argv[2] ?? join(__dir, 'planilhas-bid-complexas')

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'CFR', 'FAS']
const MERCADORIAS = [
  'Componentes eletronicos SMT — placas e modulos',
  'Pecas automotivas — injecao plastico e metal',
  'Maquinas industriais desmontadas em modulos',
  'Quimicos industriais nao perigosos — solventes',
  'Tecidos tecnicos para aeronautica',
  'Equipamentos medicos hospitalares',
  'Linha branca — compressores e motores',
  'Ferramentas de corte e insertos CNC',
  'Polimeros e resinas termoplasticas',
  'Acessorios de couro e sintetico — mix SKUs',
  'Semicondutores e memoria DDR5',
  'Pneus radiais — novo em pallets',
  'Painel solar fotovoltaico 550W',
  'Autopartes leves — cross-border',
  'Cafe verde arabica — sacaria 60kg',
  'Oleo vegetal degomado — flexitank',
  'Moveis flat-pack MDF',
  'Robos colaborativos industriais',
  'Amostras farmaceuticas — cadeia fria',
  'Valvulas e conexoes hidraulicas',
]

const NCMS = [
  '8708.99.90', '8457.10.00', '8542.31.90', '3814.00.90', '5903.20.00',
  '9018.90.99', '8414.30.00', '8207.90.00', '3907.30.00', '6403.99.90',
  '8542.32.29', '4011.20.90', '8541.40.20', '8708.29.99', '0901.11.10',
  '1507.90.90', '9403.60.00', '8479.50.00', '3004.90.99', '8481.80.99',
]

/** Cenários: cada um vira uma ABA do Excel */
const CENARIOS = [
  {
    aba: 'BID Aereo - EUROPA',
    modal: 'AEREO',
    linhas: 130,
    headers: [
      'Ref. interna RFQ',
      'Imp ou Exp? (*obrig)',
      'Meio transp. intl.',
      'Aeroporto origem — cod LOCODE/IATA',
      'Nome cidade/aeroporto partida',
      'Aeroporto destino — cod LOCODE/IATA',
      'Nome cidade/aeroporto chegada',
      'Descricao detalhada mercadoria',
      'Incoterms 2020 (3 letras)',
      'Qtd volumes / pkgs',
      'NCM ou HS Code',
      'Peso bruto (kg)',
      'SLA resposta cotação',
      'Observacao comercial',
      'Contato forwarder',
    ],
    map: {
      tipo: 1, modal: 2, origemCod: 3, origemNome: 4, destinoCod: 5, destinoNome: 6,
      mercadoria: 7, incoterm: 8, qty: 9, ncm: 10,
    },
    rotas: [
      ['IMPORTACAO', 'BRGRU', 'Guarulhos', 'DEFRA', 'Frankfurt'],
      ['IMPORTACAO', 'BRVCP', 'Viracopos', 'NLAMS', 'Amsterdam'],
      ['IMPORTACAO', 'BRGRU', 'Guarulhos', 'FRCDG', 'Paris CDG'],
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'GBLHR', 'London Heathrow'],
      ['IMPORTACAO', 'BRGRU', 'Guarulhos', 'ESMAD', 'Madrid'],
      ['EXPORTACAO', 'BRGRU', 'Guarulhos', 'DEFRA', 'Frankfurt'],
      ['EXPORTACAO', 'BRVCP', 'Viracopos', 'ITMXP', 'Milano Malpensa'],
      ['IMPORTACAO', 'BRGRU', 'Guarulhos', 'PLWAW', 'Warsaw'],
    ],
  },
  {
    aba: 'BID Maritimo - ASIA',
    modal: 'MARITIMO',
    linhas: 150,
    headers: [
      'No. linha cliente',
      'Sentido da operacao comercial',
      'Modalidade frete (mar/aer/rod)',
      'Cod. porto embarque UNLOCODE',
      'Porto/aeroporto de loading — nome',
      'Cod. porto descarga UNLOCODE',
      'Porto de discharge — nome completo',
      'Mercadoria / commodity description',
      'Termo entrega — condicao comercial',
      'Quantidade de volumes',
      'Codigo tarifario NCM',
      'CBM estimado',
      'Free time destino (dias)',
      'Transit time desejado',
      'IMO class (se aplicavel)',
    ],
    map: {
      tipo: 1, modal: 2, origemCod: 3, origemNome: 4, destinoCod: 5, destinoNome: 6,
      mercadoria: 7, incoterm: 8, qty: 9, ncm: 10,
    },
    rotas: [
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'CNSHA', 'Shanghai'],
      ['IMPORTACAO', 'BRIOA', 'Itapoa', 'KRPUS', 'Busan'],
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'SGSIN', 'Singapore'],
      ['IMPORTACAO', 'BRPNG', 'Paranagua', 'JPYOK', 'Yokohama'],
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'CNQDG', 'Qingdao'],
      ['IMPORTACAO', 'BRFOR', 'Fortaleza', 'INNSA', 'Nhava Sheva'],
      ['EXPORTACAO', 'BRSSZ', 'Santos', 'CNSHA', 'Shanghai'],
      ['IMPORTACAO', 'BRMAO', 'Manaus', 'MYPKG', 'Port Klang'],
    ],
  },
  {
    aba: 'BID Maritimo - AMERICAS',
    modal: 'MARITIMO',
    linhas: 120,
    headers: [
      'RFQ-ID',
      'Import/Export flag',
      'Transport mode code',
      'Origin locode',
      'Origin port/city label',
      'Destination locode',
      'Dest port/city label',
      'Goods / cargo text',
      'Commercial terms (incoterm)',
      'Package count',
      'Tariff NCM HS',
      'Gross weight KG',
      'Container type hint',
      'Need customs broker?',
      'Target ETD week',
    ],
    map: {
      tipo: 1, modal: 2, origemCod: 3, origemNome: 4, destinoCod: 5, destinoNome: 6,
      mercadoria: 7, incoterm: 8, qty: 9, ncm: 10,
    },
    rotas: [
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'USNYC', 'New York'],
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'USLAX', 'Los Angeles'],
      ['IMPORTACAO', 'BRIOA', 'Itapoa', 'COBUN', 'Buenaventura'],
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'MXZLO', 'Manzanillo'],
      ['EXPORTACAO', 'BRSSZ', 'Santos', 'USMIA', 'Miami'],
      ['EXPORTACAO', 'BRPNG', 'Paranagua', 'ARBUE', 'Buenos Aires'],
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'CAVAN', 'Vancouver'],
      ['IMPORTACAO', 'BRFOR', 'Fortaleza', 'USHOA', 'Houston'],
    ],
  },
  {
    aba: 'BID Rodo - MERCOSUL',
    modal: 'RODOVIARIO',
    linhas: 110,
    headers: [
      'Seq. cotação',
      'Tipo operacao (IMP/EXP)',
      'Tipo frete rodoviario',
      'Fronteira/ponto origem — cod',
      'Cidade origem fronteira',
      'Fronteira/ponto destino — cod',
      'Cidade destino fronteira',
      'Descricao carga rodoviaria',
      'Condicao entrega Incoterms',
      'Qtde embalagens',
      'NCM fiscal',
      'Placa/carreta prevista',
      'Seguro RCTR-C?',
      'Prazo coleta',
      'Obs logistica seca',
    ],
    map: {
      tipo: 1, modal: 2, origemCod: 3, origemNome: 4, destinoCod: 5, destinoNome: 6,
      mercadoria: 7, incoterm: 8, qty: 9, ncm: 10,
    },
    rotas: [
      ['IMPORTACAO', 'BRUAI', 'Uruguaiana', 'ARBSU', 'Buenos Aires'],
      ['IMPORTACAO', 'BRUAI', 'Uruguaiana', 'ARROS', 'Rosario'],
      ['EXPORTACAO', 'BRUAI', 'Uruguaiana', 'UYMVD', 'Montevideo'],
      ['IMPORTACAO', 'BRUAI', 'Uruguaiana', 'PYASU', 'Asuncion'],
      ['IMPORTACAO', 'BRUAI', 'Uruguaiana', 'ARBUE', 'Buenos Aires'],
      ['EXPORTACAO', 'BRUAI', 'Uruguaiana', 'ARBUE', 'Buenos Aires'],
    ],
  },
  {
    aba: 'BID Multimodal - GLOBAL',
    modal: 'MIX', // alterna por linha
    linhas: 140,
    headers: [
      '* Ref projeto',
      'Direcao fluxo (importacao/exportacao)',
      'Modal principal cotacao',
      'LOC origem (5 chars)',
      'Label origem humano',
      'LOC destino (5 chars)',
      'Label destino humano',
      'Texto livre — o que transportar',
      'Incoterm negociado',
      'Volumes totais',
      'HS/NCM quando houver',
      'Valor mercadoria USD',
      'Stackable Y/N',
      'Dangerous goods flag',
      'Buyer reference PO',
    ],
    map: {
      tipo: 1, modal: 2, origemCod: 3, origemNome: 4, destinoCod: 5, destinoNome: 6,
      mercadoria: 7, incoterm: 8, qty: 9, ncm: 10,
    },
    rotas: [
      ['IMPORTACAO', 'MARITIMO', 'BRSSZ', 'Santos', 'ZADUR', 'Durban'],
      ['IMPORTACAO', 'AEREO', 'BRGRU', 'Guarulhos', 'AEDXB', 'Dubai'],
      ['IMPORTACAO', 'MARITIMO', 'BRIOA', 'Itapoa', 'BEANR', 'Antwerp'],
      ['EXPORTACAO', 'MARITIMO', 'BRSSZ', 'Santos', 'AEDXB', 'Jebel Ali'],
      ['IMPORTACAO', 'RODOVIARIO', 'BRUAI', 'Uruguaiana', 'ARROS', 'Rosario'],
      ['IMPORTACAO', 'AEREO', 'BRVCP', 'Viracopos', 'HKHKG', 'Hong Kong'],
      ['IMPORTACAO', 'MARITIMO', 'BRSSZ', 'Santos', 'AUMEL', 'Melbourne'],
      ['EXPORTACAO', 'MARITIMO', 'BRPNG', 'Paranagua', 'EGPSD', 'Port Said'],
    ],
    rotasMultimodal: true,
  },
  {
    aba: 'BID Gravity - Template',
    modal: 'MARITIMO',
    linhas: 50,
    gravity: true,
    headers: [
      'tipo_operacao_cotacao_bid_frete_internacional',
      'modal_cotacao_bid_frete_internacional',
      'origem_codigo_cotacao_bid_frete_internacional',
      'origem_nome_cotacao_bid_frete_internacional',
      'destino_codigo_cotacao_bid_frete_internacional',
      'destino_nome_cotacao_bid_frete_internacional',
      'descricao_mercadoria_cotacao_bid_frete_internacional',
      'incoterm_cotacao_bid_frete_internacional',
      'quantidade_volume_cotacao_bid_frete_internacional',
      'ncm_cotacao_bid_frete_internacional',
    ],
    map: {
      tipo: 0, modal: 1, origemCod: 2, origemNome: 3, destinoCod: 4, destinoNome: 5,
      mercadoria: 6, incoterm: 7, qty: 8, ncm: 9,
    },
    rotas: [
      ['IMPORTACAO', 'BRSSZ', 'Santos', 'CNSHA', 'Shanghai'],
      ['IMPORTACAO', 'BRIOA', 'Itapoa', 'DEHAM', 'Hamburg'],
      ['EXPORTACAO', 'BRSSZ', 'Santos', 'NLRTM', 'Rotterdam'],
    ],
  },
]

function pick(arr, i) {
  return arr[i % arr.length]
}

function gerarLinha(cenario, idx) {
  const rota = cenario.rotasMultimodal
    ? (() => {
        const r = pick(cenario.rotas, idx)
        return [r[0], r[1], r[2], r[3], r[4], r[5]]
      })()
    : (() => {
        const r = pick(cenario.rotas, idx)
        return [r[0], cenario.modal, r[1], r[2], r[3], r[4]]
      })()

  const [tipo, modal, origemCod, origemNome, destinoCod, destinoNome] = rota
  const mercadoria = pick(MERCADORIAS, idx + 3)
  const incoterm = pick(INCOTERMS, idx + 7)
  const qty = String(1 + ((idx * 17 + 11) % 180))
  const ncm = pick(NCMS, idx + 2)
  const ref = `${cenario.aba.slice(0, 3).toUpperCase().replace(/\s/g, '')}-2026-${String(idx + 1).padStart(4, '0')}`

  if (cenario.gravity) {
    return [tipo, modal, origemCod, origemNome, destinoCod, destinoNome, mercadoria, incoterm, qty, ncm]
  }

  const row = new Array(cenario.headers.length).fill('')
  row[0] = ref
  row[cenario.map.tipo] = tipo
  row[cenario.map.modal] = modal
  row[cenario.map.origemCod] = origemCod
  row[cenario.map.origemNome] = origemNome
  row[cenario.map.destinoCod] = destinoCod
  row[cenario.map.destinoNome] = destinoNome
  row[cenario.map.mercadoria] = mercadoria
  row[cenario.map.incoterm] = incoterm
  row[cenario.map.qty] = qty
  row[cenario.map.ncm] = ncm

  // ruído — colunas extras preenchidas
  if (cenario.headers.length > 11) row[11] = String(500 + (idx * 137) % 45000)
  if (cenario.headers.length > 12) row[12] = idx % 3 === 0 ? 'Y' : 'N'
  if (cenario.headers.length > 13) row[13] = idx % 7 === 0 ? 'DG' : ''
  if (cenario.headers.length > 14) row[14] = `PO-${2026000 + idx}`

  // ~3% linhas com erro proposital (ultimas 3 de cada arquivo)
  const errosRestantes = cenario.linhas - idx
  if (errosRestantes === 3) row[cenario.map.incoterm] = 'ZZZ'
  if (errosRestantes === 2) row[cenario.map.qty] = '0'
  if (errosRestantes === 1) row[cenario.map.origemCod] = ''

  return row
}

function gerarPlanilha(cenario) {
  const rows = [cenario.headers]
  for (let i = 0; i < cenario.linhas; i++) {
    rows.push(gerarLinha(cenario, i))
  }
  return rows
}

function abaParaNomeArquivo(aba) {
  return aba
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function rowsParaWorkbookAbas(cenariosComRows) {
  const wb = XLSX.utils.book_new()
  for (const { cenario, rows } of cenariosComRows) {
    const ws = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, cenario.aba.slice(0, 31))
  }
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

function rowsParaCsv(rows) {
  return rows.map(row =>
    row.map(cell => {
      const s = String(cell ?? '')
      return s.includes(';') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }).join(';'),
  ).join('\n')
}

mkdirSync(destinoBase, { recursive: true })

let totalLinhas = 0
const manifest = []
const cenariosComRows = []

for (const cenario of CENARIOS) {
  const rows = gerarPlanilha(cenario)
  cenariosComRows.push({ cenario, rows })
  totalLinhas += cenario.linhas
  manifest.push({ aba: cenario.aba, linhas: cenario.linhas })
}

const arquivoWorkbook = 'bid-importacao-testes-complexo.xlsx'
writeFileSync(join(destinoBase, arquivoWorkbook), rowsParaWorkbookAbas(cenariosComRows))
console.log(`OK ${arquivoWorkbook} — ${CENARIOS.length} abas, ${totalLinhas} cotacoes`)

for (const { cenario, rows } of cenariosComRows) {
  const csvNome = `${abaParaNomeArquivo(cenario.aba)}.csv`
  writeFileSync(join(destinoBase, csvNome), `\uFEFF${rowsParaCsv(rows)}`, 'utf8')
  console.log(`   aba "${cenario.aba}" -> ${csvNome} (${cenario.linhas} linhas)`)
}

writeFileSync(
  join(destinoBase, 'LEIA-ME.txt'),
  [
    'Planilhas ficticias — teste importacao BID Frete Internacional',
    '',
    `Arquivo principal: ${arquivoWorkbook}`,
    `  ${CENARIOS.length} ABAS no mesmo Excel (Google Sheets / Excel):`,
    ...manifest.map(m => `    - ${m.aba} (${m.linhas} cotacoes)`),
    `  Total: ${totalLinhas} cotacoes`,
    '',
    'CSVs separados (um por aba) — para upload direto no Gravity:',
    ...manifest.map(m => `  - ${abaParaNomeArquivo(m.aba)}.csv`),
    '',
    'Gravity hoje importa UMA aba por vez — use o CSV da aba desejada,',
    'ou no Google Sheets exporte só a aba ativa como CSV (;).',
    '',
    'Modo wizard: SUA PLANILHA (aba Gravity = Planilha Base Gravity)',
    'Cada aba inclui 3 linhas com erro proposital no final.',
  ].join('\n'),
)

console.log(`\nTotal: ${totalLinhas} cotacoes -> ${destinoBase}`)
