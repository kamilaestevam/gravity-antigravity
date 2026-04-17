// merge-pedido-locales.cjs
// Mescla os dois blocos top-level "pedido" duplicados em en.json e es.json.
// O segundo bloco vence em conflitos (preserva comportamento runtime atual do i18next,
// que silenciosamente descarta o primeiro bloco).
// Resultado: um único bloco "pedido" contendo a união das chaves dos dois originais,
// habilitando coluna_pai (que estava sombreado no primeiro bloco).

const fs = require('fs');

function deepMerge(a, b) {
  if (typeof a !== 'object' || a === null || Array.isArray(a)) return b;
  if (typeof b !== 'object' || b === null || Array.isArray(b)) return b;
  const out = { ...a };
  for (const k of Object.keys(b)) {
    out[k] = (k in a) ? deepMerge(a[k], b[k]) : b[k];
  }
  return out;
}

function findPedidoBlocks(text) {
  const blocks = [];
  const re = /\n  "pedido": \{/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const openBrace = m.index + m[0].length - 1;
    let depth = 1;
    let i = openBrace + 1;
    let inStr = false;
    let esc = false;
    while (i < text.length && depth > 0) {
      const c = text[i];
      if (esc) {
        esc = false;
      } else if (c === '\\' && inStr) {
        esc = true;
      } else if (c === '"') {
        inStr = !inStr;
      } else if (!inStr) {
        if (c === '{') depth++;
        else if (c === '}') depth--;
      }
      i++;
    }
    const closeBrace = i - 1;
    const keyStart = m.index + 1;
    let endIncludingComma = closeBrace + 1;
    if (text[endIncludingComma] === ',') endIncludingComma++;
    blocks.push({ keyStart, openBrace, closeBrace, endIncludingComma });
  }
  return blocks;
}

function extractPedidoContent(text, block) {
  const inner = text.slice(block.openBrace, block.closeBrace + 1);
  return JSON.parse(inner);
}

function serializePedido(obj) {
  const raw = JSON.stringify(obj, null, 2);
  const lines = raw.split('\n').map((ln, i) => (i === 0 ? ln : '  ' + ln));
  return '  "pedido": ' + lines.join('\n');
}

function fixFile(path) {
  const text = fs.readFileSync(path, 'utf8');
  const blocks = findPedidoBlocks(text);
  if (blocks.length !== 2) {
    throw new Error(`${path}: esperado 2 blocos pedido, achou ${blocks.length}`);
  }
  const obj1 = extractPedidoContent(text, blocks[0]);
  const obj2 = extractPedidoContent(text, blocks[1]);
  const merged = deepMerge(obj1, obj2);

  const mergedText = serializePedido(merged);
  const hadComma1 = text[blocks[0].closeBrace + 1] === ',';
  const hadComma2 = text[blocks[1].closeBrace + 1] === ',';
  const replacement1 = mergedText + (hadComma1 ? ',' : '');

  const before = text.slice(0, blocks[0].keyStart);
  let between = text.slice(blocks[0].endIncludingComma, blocks[1].keyStart);
  const after = text.slice(blocks[1].endIncludingComma);

  // Se o segundo bloco NÃO tinha vírgula (era o último), então o bloco anterior
  // a ele (ou seja, o último no "between") pode ter vírgula sobrando após sumirmos o segundo bloco.
  if (!hadComma2) {
    between = between.replace(/,(\s*)$/, '$1');
  }

  const newText = before + replacement1 + between + after;

  // Validação: parse completo tem que funcionar
  const parsed = JSON.parse(newText);

  fs.writeFileSync(path, newText);

  const countOld1 = Object.keys(obj1).length;
  const countOld2 = Object.keys(obj2).length;
  const countNew = Object.keys(parsed.pedido).length;
  const colunaPaiCount = parsed.pedido.coluna_pai ? Object.keys(parsed.pedido.coluna_pai).length : 0;
  // Conta ocorrências restantes
  const remaining = (newText.match(/\n  "pedido": \{/g) || []).length;
  console.log(
    `${path}: OK — bloco1=${countOld1} + bloco2=${countOld2} → merged=${countNew} subkeys ` +
    `(coluna_pai=${colunaPaiCount} chaves, blocos top-level "pedido" restantes=${remaining})`
  );
}

fixFile('./nucleo-global/Utilidades/Localization/locales/en.json');
fixFile('./nucleo-global/Utilidades/Localization/locales/es.json');
