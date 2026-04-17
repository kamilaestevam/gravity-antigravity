// add-extra-coluna-pai-en-es.cjs
// Gera as 126 traduções (OPE + datas draft/original) em en e es e insere
// dentro de pedido.coluna_pai de cada arquivo. Terminologia COMEX:
// OPE = Foreign Trade Operator / Operador Extranjero (cadastro Siscomex BR).

const fs = require('fs');

// ── Geradores ─────────────────────────────────────────────────────────────

const opeEn = {
  cnpj_raiz_empresa_responsavel: [
    'Root CNPJ of Responsible Company',
    'Root CNPJ of the Responsible Company',
    'Root CNPJ (first 8 digits) of the Brazilian company responsible for the Foreign Operator',
  ],
  codigo_ope: [
    'Foreign Operator Code',
    'Foreign Operator (OPE) Code',
    'Foreign Operator (OPE) identification code in Siscomex',
  ],
  situacao_ope: [
    'Foreign Operator Status',
    'Foreign Operator (OPE) Status',
    'OPE registration status in Siscomex: Active, Suspended, Deactivated',
  ],
  versao_ope: [
    'Foreign Operator Version',
    'Foreign Operator (OPE) Version',
    'Current version of the Foreign Operator registration',
  ],
  nome_ope: [
    'Foreign Operator Name',
    'Foreign Operator (OPE) Name',
    'Legal name of the Foreign Operator registered in Siscomex',
  ],
  pais_ope: [
    'Foreign Operator Country',
    'Foreign Operator (OPE) Country',
    'Country where the Foreign Operator is based',
  ],
  estado_ope: [
    'Foreign Operator State',
    'Foreign Operator (OPE) State/Province',
    'State or province of the Foreign Operator',
  ],
  cidade_ope: [
    'Foreign Operator City',
    'Foreign Operator (OPE) City',
    'City of the Foreign Operator',
  ],
  endereco_ope: [
    'Foreign Operator Address',
    'Foreign Operator (OPE) Address',
    'Full address of the Foreign Operator',
  ],
  zip_code_ope: [
    'Foreign Operator Zip Code',
    'Foreign Operator (OPE) Postal Code',
    'Postal code of the Foreign Operator',
  ],
  tin_ope: [
    'Foreign Operator TIN',
    'Foreign Operator (OPE) TIN',
    'Tax Identification Number — fiscal identifier of the OPE in its country of origin',
  ],
  email_ope: [
    'Foreign Operator Email',
    'Foreign Operator (OPE) Email',
    'Foreign Operator contact email',
  ],
};

const opeEs = {
  cnpj_raiz_empresa_responsavel: [
    'CNPJ Raíz de Empresa Responsable',
    'CNPJ Raíz de la Empresa Responsable',
    'CNPJ raíz (primeros 8 dígitos) de la empresa brasileña responsable del Operador Extranjero',
  ],
  codigo_ope: [
    'Código del Operador Extranjero',
    'Código del Operador Extranjero (OPE)',
    'Código identificador del OPE (Operador Extranjero) en Siscomex',
  ],
  situacao_ope: [
    'Situación del Operador Extranjero',
    'Situación del Operador Extranjero (OPE)',
    'Situación registral del OPE en Siscomex: Activo, Suspendido, Desactivado',
  ],
  versao_ope: [
    'Versión del Operador Extranjero',
    'Versión del Operador Extranjero (OPE)',
    'Versión vigente del registro del Operador Extranjero',
  ],
  nome_ope: [
    'Nombre del Operador Extranjero',
    'Nombre del Operador Extranjero (OPE)',
    'Razón social del Operador Extranjero registrado en Siscomex',
  ],
  pais_ope: [
    'País del Operador Extranjero',
    'País del Operador Extranjero (OPE)',
    'País sede del Operador Extranjero',
  ],
  estado_ope: [
    'Estado del Operador Extranjero',
    'Estado/Provincia del Operador Extranjero (OPE)',
    'Estado o provincia del Operador Extranjero',
  ],
  cidade_ope: [
    'Ciudad del Operador Extranjero',
    'Ciudad del Operador Extranjero (OPE)',
    'Ciudad del Operador Extranjero',
  ],
  endereco_ope: [
    'Dirección del Operador Extranjero',
    'Dirección del Operador Extranjero (OPE)',
    'Dirección completa del Operador Extranjero',
  ],
  zip_code_ope: [
    'Código Postal del Operador Extranjero',
    'Código Postal del Operador Extranjero (OPE)',
    'Código postal del Operador Extranjero',
  ],
  tin_ope: [
    'TIN del Operador Extranjero',
    'TIN del Operador Extranjero (OPE)',
    'Tax Identification Number — identificador fiscal del OPE en su país de origen',
  ],
  email_ope: [
    'Email del Operador Extranjero',
    'Email del Operador Extranjero (OPE)',
    'Email de contacto del Operador Extranjero',
  ],
};

const dateBases = [
  ['prevista', 'recebimento', 'draft', 'pedido'],
  ['confirmada', 'recebimento', 'draft', 'pedido'],
  ['meta', 'recebimento', 'draft', 'pedido'],
  ['prevista', 'aprovacao', 'draft', 'pedido'],
  ['confirmada', 'aprovacao', 'draft', 'pedido'],
  ['meta', 'aprovacao', 'draft', 'pedido'],
  ['prevista', 'recebimento', 'draft', 'proforma'],
  ['confirmada', 'recebimento', 'draft', 'proforma'],
  ['meta', 'recebimento', 'draft', 'proforma'],
  ['prevista', 'aprovacao', 'draft', 'proforma'],
  ['confirmada', 'aprovacao', 'draft', 'proforma'],
  ['meta', 'aprovacao', 'draft', 'proforma'],
  ['prevista', 'envio', 'original', 'proforma'],
  ['confirmada', 'envio', 'original', 'proforma'],
  ['meta', 'envio', 'original', 'proforma'],
  ['prevista', 'recebimento', 'original', 'proforma'],
  ['confirmada', 'recebimento', 'original', 'proforma'],
  ['meta', 'recebimento', 'original', 'proforma'],
  ['prevista', 'recebimento', 'draft', 'invoice'],
  ['confirmada', 'recebimento', 'draft', 'invoice'],
  ['meta', 'recebimento', 'draft', 'invoice'],
  ['prevista', 'aprovacao', 'draft', 'invoice'],
  ['confirmada', 'aprovacao', 'draft', 'invoice'],
  ['meta', 'aprovacao', 'draft', 'invoice'],
  ['prevista', 'envio', 'original', 'invoice'],
  ['confirmada', 'envio', 'original', 'invoice'],
  ['meta', 'envio', 'original', 'invoice'],
  ['prevista', 'recebimento', 'original', 'invoice'],
  ['confirmada', 'recebimento', 'original', 'invoice'],
  ['meta', 'recebimento', 'original', 'invoice'],
];

// English labels
const enVariant = { prevista: 'Estimated', confirmada: 'Confirmed', meta: 'Target' };
const enAction = { recebimento: 'Receipt', aprovacao: 'Approval', envio: 'Sending' };
const enType = { draft: 'Draft', original: 'Original' };
const enDocShort = { pedido: 'Order', proforma: 'Proforma', invoice: 'Invoice' };
const enDocOf = { pedido: 'of the Order', proforma: 'of the Proforma', invoice: 'of the Invoice' };

// Spanish labels
const esVariant = { prevista: 'Estimada', confirmada: 'Confirmada', meta: 'Meta' };
const esAction = { recebimento: 'Recepción', aprovacao: 'Aprobación', envio: 'Envío' };
const esType = { draft: 'Draft', original: 'Original' };
const esDocShort = { pedido: 'Pedido', proforma: 'Proforma', invoice: 'Invoice' };
const esDocOf = { pedido: 'del Pedido', proforma: 'de la Proforma', invoice: 'de la Invoice' };

function buildDateEntriesEn() {
  const out = {};
  for (const [v, a, t, d] of dateBases) {
    const key = `data_${v}_${a}_${t}_${d}`;
    const label = `${enVariant[v]} Date — ${enType[t]} ${enDocShort[d]} ${enAction[a]}`;
    const titulo = `${enVariant[v]} Date — ${enAction[a]} of ${enType[t]} ${enDocShort[d]}`;
    const typeWord = enType[t] === 'Draft' ? 'draft' : 'original';
    const verb =
      a === 'recebimento' ? 'receipt of the' :
      a === 'aprovacao'   ? 'approval of the' :
                            'sending of the';
    const varPrefix =
      v === 'prevista'   ? 'Estimated date for' :
      v === 'confirmada' ? 'Confirmed date for' :
                           'Target date for';
    const desc = `${varPrefix} ${verb} ${typeWord} ${enDocOf[d].replace('of the ', '').replace('of the ', '')}`
      .replace('  ', ' ');
    // Descrição mais natural:
    const natural = `${varPrefix} ${verb} ${typeWord} ${enDocShort[d]}`;
    out[key] = label;
    out[key + '_titulo'] = titulo;
    out[key + '_desc'] = natural;
  }
  return out;
}

function buildDateEntriesEs() {
  const out = {};
  for (const [v, a, t, d] of dateBases) {
    const key = `data_${v}_${a}_${t}_${d}`;
    const label = `Fecha ${esVariant[v]} — ${esAction[a]} ${esType[t]} ${esDocShort[d]}`;
    const titulo = `Fecha ${esVariant[v]} — ${esAction[a]} del ${esType[t]} ${esDocOf[d].replace('del ', '').replace('de la ', '')}`;
    const typeWord = esType[t] === 'Draft' ? 'draft (borrador)' : 'original';
    const verbNoun =
      a === 'recebimento' ? 'recepción del' :
      a === 'aprovacao'   ? 'aprobación del' :
                            'envío del';
    const varPrefix =
      v === 'prevista'   ? 'Fecha estimada para' :
      v === 'confirmada' ? 'Fecha confirmada para' :
                           'Fecha meta para';
    const desc = `${varPrefix} ${verbNoun} ${typeWord} ${esDocOf[d]}`;
    out[key] = label;
    out[key + '_titulo'] = titulo;
    out[key + '_desc'] = desc;
  }
  return out;
}

function buildOpeEntries(opeLabels) {
  const out = {};
  for (const [k, [label, titulo, desc]] of Object.entries(opeLabels)) {
    out[k] = label;
    out[k + '_titulo'] = titulo;
    out[k + '_desc'] = desc;
  }
  return out;
}

function buildFullBlock(opeLabels, dateBuilder) {
  return { ...buildOpeEntries(opeLabels), ...dateBuilder() };
}

// ── Inserção no arquivo ───────────────────────────────────────────────────

function serializeEntries(obj, indent = '      ') {
  return Object.entries(obj)
    .map(([k, v]) => `${indent}${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(',\n');
}

function insertIntoLocale(path, entries) {
  const text = fs.readFileSync(path, 'utf8');

  // Encontra o bloco coluna_pai e sua última entrada (data_invoice_desc).
  // Padrão: a linha '      "data_invoice_desc": "..."' seguida de '\n    }'
  // (fecho do coluna_pai).
  const anchor = /("data_invoice_desc":\s*"[^"\\]*(?:\\.[^"\\]*)*")\s*(\n\s*\})/;
  const match = text.match(anchor);
  if (!match) throw new Error(`${path}: âncora data_invoice_desc + } não encontrada`);

  const newEntriesText = serializeEntries(entries);
  const replacement = `${match[1]},\n${newEntriesText}${match[2]}`;
  const newText = text.replace(anchor, replacement);

  // Validação
  const parsed = JSON.parse(newText);
  const colunaPaiCount = Object.keys(parsed.pedido.coluna_pai).length;
  const added = Object.keys(entries).length;

  fs.writeFileSync(path, newText);
  console.log(
    `${path}: OK — ${added} chaves inseridas, coluna_pai agora com ${colunaPaiCount} chaves`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

const enEntries = buildFullBlock(opeEn, buildDateEntriesEn);
const esEntries = buildFullBlock(opeEs, buildDateEntriesEs);

console.log(`Gerado: ${Object.keys(enEntries).length} chaves en, ${Object.keys(esEntries).length} chaves es`);

insertIntoLocale('./nucleo-global/Utilidades/Localization/locales/en.json', enEntries);
insertIntoLocale('./nucleo-global/Utilidades/Localization/locales/es.json', esEntries);
