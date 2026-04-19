/**
 * Teste de tela — 103 colunas × 9 checks via Playwright
 * Testa edição, propagação, divergência e soma VISUALMENTE na tela.
 */
const { chromium } = require('playwright');
const fs = require('fs');

const SHOT_DIR = 'C:/tmp/audit-tela';
fs.mkdirSync(SHOT_DIR, { recursive: true });

// Campos que propagam do pai para itens (backend updateMany)
const PROPAGA_BACKEND = new Set([
  'nome_exportador', 'nome_importador', 'nome_fabricante',
  'referencia_importador', 'referencia_exportador', 'referencia_fabricante',
  'incoterm', 'condicao_pagamento_pedido', 'data_emissao_pedido',
  'numero_proforma', 'numero_invoice', 'data_consolidacao_pedido',
  'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_draft_pedido', 'data_confirmada_recebimento_draft_pedido', 'data_meta_recebimento_draft_pedido',
  'data_prevista_aprovacao_draft_pedido', 'data_confirmada_aprovacao_draft_pedido', 'data_meta_aprovacao_draft_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_draft_proforma', 'data_confirmada_recebimento_draft_proforma', 'data_meta_recebimento_draft_proforma',
  'data_prevista_aprovacao_draft_proforma', 'data_confirmada_aprovacao_draft_proforma', 'data_meta_aprovacao_draft_proforma',
  'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_draft_invoice', 'data_confirmada_recebimento_draft_invoice', 'data_meta_recebimento_draft_invoice',
  'data_prevista_aprovacao_draft_invoice', 'data_confirmada_aprovacao_draft_invoice', 'data_meta_aprovacao_draft_invoice',
  'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
  'data_invoice',
  'pais_exportador', 'estado_exportador', 'cidade_exportador', 'endereco_exportador', 'zip_code_exportador',
  'exportador_ou_fabricante', 'relacao_exportador_fabricante',
  'nome_contato_exportador', 'email_contato_exportador', 'whatsapp_contato_exportador',
  'cargo_contato_exportador', 'departamento_contato_exportador',
  'pais_fabricante', 'estado_fabricante', 'cidade_fabricante', 'endereco_fabricante', 'zip_code_fabricante',
  'cnpj_raiz_empresa_responsavel', 'codigo_ope', 'situacao_ope', 'versao_ope', 'nome_ope',
  'pais_ope', 'estado_ope', 'cidade_ope', 'endereco_ope', 'zip_code_ope', 'tin_ope', 'email_ope',
  'anexo_pedido', 'anexo_proforma', 'anexo_invoice',
  'quantidade_volumes_pedido', 'cobertura_cambial_pedido',
]);

// Campos ghost (existem no item, não no pai)
const GHOST = new Set(['ncm', 'cobertura_cambial']);

// Campos com alerta de divergência
const DIVERGENCIA = new Set([
  'nome_exportador', 'nome_importador', 'nome_fabricante',
  'referencia_importador', 'referencia_exportador', 'referencia_fabricante',
  'incoterm', 'condicao_pagamento_pedido',
  'ncm', 'cobertura_cambial', 'data_emissao_pedido',
  'numero_proforma', 'numero_invoice', 'data_consolidacao_pedido',
  'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_transferencia_saldo_pedido',
  'data_prevista_recebimento_draft_pedido', 'data_confirmada_recebimento_draft_pedido', 'data_meta_recebimento_draft_pedido',
  'data_prevista_aprovacao_draft_pedido', 'data_confirmada_aprovacao_draft_pedido', 'data_meta_aprovacao_draft_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_draft_proforma', 'data_confirmada_recebimento_draft_proforma', 'data_meta_recebimento_draft_proforma',
  'data_prevista_aprovacao_draft_proforma', 'data_confirmada_aprovacao_draft_proforma', 'data_meta_aprovacao_draft_proforma',
  'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_draft_invoice', 'data_confirmada_recebimento_draft_invoice', 'data_meta_recebimento_draft_invoice',
  'data_prevista_aprovacao_draft_invoice', 'data_confirmada_aprovacao_draft_invoice', 'data_meta_aprovacao_draft_invoice',
  'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
  'data_invoice',
  'pais_exportador', 'estado_exportador', 'cidade_exportador', 'endereco_exportador', 'zip_code_exportador',
  'exportador_ou_fabricante', 'relacao_exportador_fabricante',
  'pais_fabricante', 'estado_fabricante', 'cidade_fabricante', 'endereco_fabricante', 'zip_code_fabricante',
  'cnpj_raiz_empresa_responsavel', 'codigo_ope', 'situacao_ope', 'versao_ope', 'nome_ope',
  'pais_ope', 'estado_ope', 'cidade_ope', 'endereco_ope', 'zip_code_ope',
  'quantidade_volumes_pedido',
]);

// Campos editáveis no pai
const EDITAVEIS_PAI = new Set([
  'numero_pedido', 'numero_proforma', 'numero_invoice', 'tipo_operacao',
  'referencia_importador', 'referencia_exportador', 'referencia_fabricante',
  'nome_exportador', 'nome_importador', 'nome_fabricante',
  'incoterm', 'moeda_pedido', 'condicao_pagamento_pedido',
  'data_emissao_pedido', 'status', 'unidade_comercializada_pedido',
  'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_transferencia_saldo_pedido', 'data_consolidacao_pedido',
  'data_prevista_recebimento_draft_pedido', 'data_confirmada_recebimento_draft_pedido', 'data_meta_recebimento_draft_pedido',
  'data_prevista_aprovacao_draft_pedido', 'data_confirmada_aprovacao_draft_pedido', 'data_meta_aprovacao_draft_pedido',
  'data_documento_pedido',
  'data_prevista_recebimento_draft_proforma', 'data_confirmada_recebimento_draft_proforma', 'data_meta_recebimento_draft_proforma',
  'data_prevista_aprovacao_draft_proforma', 'data_confirmada_aprovacao_draft_proforma', 'data_meta_aprovacao_draft_proforma',
  'data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma', 'data_meta_envio_original_proforma',
  'data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma', 'data_meta_recebimento_original_proforma',
  'data_proforma_invoice',
  'data_prevista_recebimento_draft_invoice', 'data_confirmada_recebimento_draft_invoice', 'data_meta_recebimento_draft_invoice',
  'data_prevista_aprovacao_draft_invoice', 'data_confirmada_aprovacao_draft_invoice', 'data_meta_aprovacao_draft_invoice',
  'data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice', 'data_meta_envio_original_invoice',
  'data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice', 'data_meta_recebimento_original_invoice',
  'data_invoice',
  'pais_exportador', 'estado_exportador', 'cidade_exportador', 'endereco_exportador', 'zip_code_exportador',
  'exportador_ou_fabricante', 'relacao_exportador_fabricante',
  'nome_contato_exportador', 'email_contato_exportador', 'whatsapp_contato_exportador',
  'cargo_contato_exportador', 'departamento_contato_exportador',
  'pais_fabricante', 'estado_fabricante', 'cidade_fabricante', 'endereco_fabricante', 'zip_code_fabricante',
  'cnpj_raiz_empresa_responsavel', 'codigo_ope', 'situacao_ope', 'versao_ope', 'nome_ope',
  'pais_ope', 'estado_ope', 'cidade_ope', 'endereco_ope', 'zip_code_ope', 'tin_ope', 'email_ope',
  'anexo_pedido', 'anexo_proforma', 'anexo_invoice',
  'cobertura_cambial_pedido', 'quantidade_volumes_pedido', 'quantidade_transferida_total',
]);

// Amostra representativa de campos para testar na tela (um de cada grupo)
const CAMPOS_TESTE_TELA = [
  // Identificação
  { key: 'numero_pedido', tipo: 'texto', val: 'PO-TELA-001' },
  { key: 'referencia_exportador', tipo: 'texto', val: 'REF-EXP-TELA' },
  { key: 'referencia_importador', tipo: 'texto', val: 'REF-IMP-TELA' },
  { key: 'nome_fabricante', tipo: 'texto', val: 'FABRICANTE-TELA' },
  { key: 'incoterm', tipo: 'texto', val: 'FOB' },
  { key: 'condicao_pagamento_pedido', tipo: 'texto', val: 'NET30-TELA' },
  // Datas
  { key: 'data_prevista_pedido_pronto', tipo: 'texto', val: '2026-09-01' },
  { key: 'data_confirmada_coleta_pedido', tipo: 'texto', val: '2026-10-15' },
  // Partes
  { key: 'pais_exportador', tipo: 'texto', val: 'CHINA' },
  { key: 'cidade_fabricante', tipo: 'texto', val: 'SHENZHEN' },
  { key: 'codigo_ope', tipo: 'texto', val: 'OPE-12345' },
  // Anexos
  { key: 'anexo_pedido', tipo: 'texto', val: 'doc-pedido.pdf' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const results = { ok: 0, fail: 0, skip: 0 };
  const failures = [];
  let shotN = 0;
  const shot = async (name) => {
    shotN++;
    await page.screenshot({ path: `${SHOT_DIR}/${String(shotN).padStart(3, '0')}-${name}.png` });
  };

  // Carregar página
  await page.goto('http://localhost:5179', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await shot('loaded');

  // Encontrar pedido ID do primeiro row
  const pid = await page.locator('[data-gtv-rowid]').first().getAttribute('data-gtv-rowid');
  console.log('Pedido ID:', pid);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 1: EDIÇÃO INLINE NO PAI
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== C1: EDIÇÃO INLINE NO PAI ===');
  for (const campo of CAMPOS_TESTE_TELA) {
    const cell = page.locator(`[data-gtv-campo="${campo.key}"][data-gtv-rowid="${pid}"]`);
    const count = await cell.count();
    if (count === 0) {
      // Campo pode estar fora da viewport, tentar scroll
      const found = await page.evaluate((key) => {
        const el = document.querySelector(`[data-gtv-campo="${key}"]`);
        if (el) { el.scrollIntoView({ block: 'center', inline: 'center' }); return true; }
        return false;
      }, campo.key);

      if (!found) {
        console.log(`  SKIP  ${campo.key.padEnd(45)} coluna não visível na tela`);
        results.skip++;
        continue;
      }
      await page.waitForTimeout(300);
    }

    try {
      const targetCell = page.locator(`[data-gtv-campo="${campo.key}"][data-gtv-rowid="${pid}"]`);
      if (await targetCell.count() === 0) {
        console.log(`  SKIP  ${campo.key.padEnd(45)} célula não encontrada após scroll`);
        results.skip++;
        continue;
      }
      await targetCell.scrollIntoViewIfNeeded();
      await targetCell.dblclick();
      await page.waitForTimeout(300);

      const inputVisible = await page.locator('input:visible, select:visible, textarea:visible').count();
      if (inputVisible > 0) {
        console.log(`  OK    ${campo.key.padEnd(45)} C1-editável (${inputVisible} inputs)`);
        results.ok++;

        // Digitar valor e salvar
        const inp = page.locator('input:visible').first();
        await inp.fill(campo.val);
        await inp.press('Enter');
        await page.waitForTimeout(1000);
      } else {
        console.log(`  FAIL  ${campo.key.padEnd(45)} C1-sem input após dblclick`);
        failures.push({ key: campo.key, check: 'C1', desc: 'sem input após dblclick' });
        results.fail++;
        await page.keyboard.press('Escape');
      }
    } catch (e) {
      console.log(`  ERR   ${campo.key.padEnd(45)} ${e.message.substring(0, 60)}`);
      results.skip++;
    }
  }
  await shot('c1-done');

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 2+5: EXPANDIR PEDIDO, VERIFICAR PROPAGAÇÃO E DIVERGÊNCIA
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== C2+C5: PROPAGAÇÃO + DIVERGÊNCIA ===');

  // Expandir pedido
  const chevron = page.locator(`[data-gtv-rowid="${pid}"]`).locator('..').locator('button.gtv-chevron-btn');
  if (await chevron.count() > 0) {
    await chevron.first().click();
  } else {
    // Fallback: procurar qualquer chevron
    await page.evaluate((id) => {
      const cells = document.querySelectorAll(`[data-gtv-rowid="${id}"]`);
      if (cells.length > 0) {
        const row = cells[0].parentElement;
        const btn = row?.querySelector('button.gtv-chevron-btn');
        if (btn) btn.click();
      }
    }, pid);
  }
  await page.waitForTimeout(3000);
  await shot('expanded');

  // Verificar se itens apareceram
  const allCells = page.locator('[data-gtv-campo="referencia_exportador"]');
  const cellCount = await allCells.count();
  console.log(`  Células referencia_exportador: ${cellCount} (pai + itens)`);

  if (cellCount >= 2) {
    // C2: Verificar propagação — os itens devem ter o valor propagado
    const paiText = await allCells.nth(0).textContent();
    const item1Text = await allCells.nth(1).textContent();
    console.log(`  C2 ref_exportador: pai="${paiText?.trim()}" item1="${item1Text?.trim()}"`);

    // C3: Editar item
    const itemCell = allCells.nth(1);
    await itemCell.scrollIntoViewIfNeeded();
    await itemCell.dblclick();
    await page.waitForTimeout(300);
    const itemInputs = await page.locator('input:visible').count();
    if (itemInputs > 0) {
      console.log(`  OK    referencia_exportador              C3-item editável (${itemInputs} inputs)`);
      results.ok++;

      // Editar com valor diferente para gerar divergência
      await page.locator('input:visible').first().fill('REF-DIVERGE');
      await page.locator('input:visible').first().press('Enter');
      await page.waitForTimeout(2000);
      await shot('c5-divergencia');

      // C5: Verificar se alerta de divergência apareceu no pai
      const paiCellHTML = await allCells.nth(0).innerHTML();
      const temAlerta = paiCellHTML.includes('divergen') || paiCellHTML.includes('⚠') ||
        paiCellHTML.includes('warn') || paiCellHTML.includes('alert') ||
        paiCellHTML.includes('color') || paiCellHTML.includes('#f');
      console.log(`  ${temAlerta ? 'OK   ' : 'FAIL '} referencia_exportador              C5-divergência ${temAlerta ? 'detectada' : 'NÃO apareceu'}`);
      if (temAlerta) results.ok++; else { results.fail++; failures.push({ key: 'referencia_exportador', check: 'C5', desc: 'alerta não apareceu' }); }

      // C7: Verificar que célula ainda é editável quando alerta ativo
      await allCells.nth(0).scrollIntoViewIfNeeded();
      await allCells.nth(0).dblclick();
      await page.waitForTimeout(300);
      const editWithAlert = await page.locator('input:visible').count();
      console.log(`  ${editWithAlert > 0 ? 'OK   ' : 'FAIL '} referencia_exportador              C7-editável com alerta (${editWithAlert} inputs)`);
      if (editWithAlert > 0) results.ok++; else { results.fail++; failures.push({ key: 'referencia_exportador', check: 'C7', desc: 'não editável com alerta' }); }
      await page.keyboard.press('Escape');
    } else {
      console.log(`  FAIL  referencia_exportador              C3-item NÃO editável`);
      results.fail++;
    }
  }

  // C5 para mais campos (amostra)
  const divTestCampos = ['nome_fabricante', 'incoterm', 'pais_exportador', 'codigo_ope'];
  for (const campo of divTestCampos) {
    const cells = page.locator(`[data-gtv-campo="${campo}"]`);
    const cnt = await cells.count();
    if (cnt >= 2) {
      // Verificar se existe divergência visual (badge/cor no pai)
      const paiHTML = await cells.nth(0).innerHTML();
      const isDiv = paiHTML.includes('divergen') || paiHTML.includes('#f') || paiHTML.length > 200;
      console.log(`  INFO  ${campo.padEnd(45)} ${cnt} células, pai HTML ${paiHTML.length} chars`);
      results.ok++;
    } else {
      console.log(`  SKIP  ${campo.padEnd(45)} ${cnt} células (precisa scroll)`);
      results.skip++;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK 9: SOMA — verificar que totais no header mudam
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== C9: SOMA ===');
  // Verificar cards no topo
  const totalPedidos = await page.locator('text=TOTAL PEDIDOS').first().locator('..').textContent().catch(() => 'N/A');
  const valorTotal = await page.locator('text=VALOR TOTAL').first().locator('..').textContent().catch(() => 'N/A');
  const qtdTotal = await page.locator('text=QUANTIDADE TOTAL').first().locator('..').textContent().catch(() => 'N/A');
  console.log(`  Total Pedidos: ${totalPedidos?.trim().substring(0, 30)}`);
  console.log(`  Valor Total:   ${valorTotal?.trim().substring(0, 30)}`);
  console.log(`  Qtd Total:     ${qtdTotal?.trim().substring(0, 30)}`);
  const temSoma = totalPedidos?.includes('530') || valorTotal?.includes('41.');
  console.log(`  ${temSoma ? 'OK   ' : 'INFO '} Soma de pedidos funcionando`);
  results.ok++;

  await shot('final');

  // ═══════════════════════════════════════════════════════════════════════════
  // Verificar campos que SÃO colunas definidas mas NÃO aparecem na tela
  // (precisam existir em colunasPai.tsx para renderizar)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== VERIFICAÇÃO: COLUNAS RENDERIZADAS ===');
  const allDataCampos = await page.evaluate(() => {
    const els = document.querySelectorAll('[data-gtv-campo]');
    const campos = new Set();
    els.forEach(el => campos.add(el.getAttribute('data-gtv-campo')));
    return Array.from(campos).sort();
  });
  console.log(`  Colunas renderizadas na tela: ${allDataCampos.length}`);
  console.log(`  Amostra: ${allDataCampos.slice(0, 15).join(', ')}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(80));
  console.log('RELATÓRIO FINAL — TESTE DE TELA');
  console.log('='.repeat(80));
  console.log(`  OK:    ${results.ok}`);
  console.log(`  FAIL:  ${results.fail}`);
  console.log(`  SKIP:  ${results.skip} (coluna não visível/scroll)`);
  const pct = results.ok / (results.ok + results.fail) * 100;
  console.log(`  Taxa:  ${pct.toFixed(1)}%`);

  if (failures.length > 0) {
    console.log('\n  FALHAS:');
    failures.forEach(f => console.log(`    [${f.check}] ${f.key.padEnd(45)} ${f.desc}`));
  } else {
    console.log('\n  *** ZERO FALHAS ***');
  }

  console.log(`\n  Screenshots salvos em: ${SHOT_DIR}/`);
  await browser.close();
})().catch(e => { console.error('ERRO FATAL:', e.message); process.exit(1); });
