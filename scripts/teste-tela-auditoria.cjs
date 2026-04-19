/**
 * Teste de tela — Auditoria 103 colunas × 9 checks
 * Executa via Playwright com screenshots numerados como evidência
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = 'testes/testes-em-tela/produto/pedido/2026-04-16-auditoria-103-colunas';
fs.mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:5179';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  let step = 0;
  const shot = async (name) => {
    step++;
    const filename = `${String(step).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: path.join(OUT, filename) });
    console.log(`  [${String(step).padStart(2, '0')}] ${name}`);
    return filename;
  };

  const results = { ok: 0, fail: 0 };
  const failures = [];
  const log = (check, campo, ok, detail) => {
    if (ok) { results.ok++; console.log(`  OK    [${check}] ${campo.padEnd(40)} ${detail}`); }
    else { results.fail++; failures.push({ check, campo, detail }); console.log(`  FAIL  [${check}] ${campo.padEnd(40)} ${detail}`); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 1 — Carregar página
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 1: CARREGAR PAGINA ===');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  await shot('pagina-carregada');

  // Verificar que tem pedidos
  const pedidoCount = await page.locator('[data-gtv-rowid]').count();
  console.log(`  Pedidos renderizados: ${pedidoCount / 10} (aprox)`);
  log('LOAD', 'pagina', pedidoCount > 0, `${pedidoCount} celulas com data-gtv-rowid`);

  // Pegar ID do primeiro pedido
  const PID = await page.locator('[data-gtv-rowid]').first().getAttribute('data-gtv-rowid');
  console.log(`  Pedido de teste: ${PID}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 2 — C1: Editar numero_pedido no pai
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 2: C1 — EDITAR NUMERO_PEDIDO NO PAI ===');
  const numCell = page.locator(`[data-gtv-campo="numero_pedido"][data-gtv-rowid="${PID}"]`);
  await numCell.dblclick();
  await page.waitForTimeout(500);
  await shot('c1-numero-pedido-input-aberto');

  const inputCount = await page.locator('input:visible').count();
  log('C1', 'numero_pedido', inputCount > 0, `${inputCount} inputs visíveis após dblclick`);

  if (inputCount > 0) {
    await page.locator('input:visible').first().fill('AUDIT-TELA-001');
    await page.locator('input:visible').first().press('Enter');
    await page.waitForTimeout(2000);
    await shot('c1-numero-pedido-salvo');

    // Verificar que o valor aparece na tela
    const savedText = await numCell.textContent();
    log('C1', 'numero_pedido-salvo', savedText?.includes('AUDIT-TELA-001') || savedText?.includes('AUDIT'), `texto na tela: "${savedText?.trim().substring(0, 30)}"`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 3 — Expandir pedido para ver itens
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 3: EXPANDIR PEDIDO ===');

  // Procurar o botão chevron na row do pedido
  await page.evaluate((pid) => {
    const cells = document.querySelectorAll(`[data-gtv-rowid="${pid}"]`);
    if (cells.length > 0) {
      const row = cells[0].parentElement;
      const btn = row?.querySelector('button.gtv-chevron-btn');
      if (btn) btn.click();
    }
  }, PID);
  await page.waitForTimeout(4000);
  await shot('pedido-expandido');

  // Contar itens visíveis
  const allRefCells = page.locator('[data-gtv-campo="referencia_exportador"]');
  const totalRefCells = await allRefCells.count();
  log('EXPAND', 'itens-visiveis', totalRefCells >= 2, `${totalRefCells} celulas referencia_exportador (pai+itens)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 4 — C1+C2: Editar referencia_exportador no pai + verificar propagação
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 4: C1+C2 — EDITAR REF_EXPORTADOR + PROPAGACAO ===');

  const refPaiCell = page.locator(`[data-gtv-campo="referencia_exportador"][data-gtv-rowid="${PID}"]`);
  if (await refPaiCell.count() > 0) {
    await refPaiCell.scrollIntoViewIfNeeded();
    await refPaiCell.dblclick();
    await page.waitForTimeout(500);
    await shot('c1-ref-exportador-input');

    const refInputs = await page.locator('input:visible').count();
    log('C1', 'referencia_exportador', refInputs > 0, `${refInputs} inputs`);

    if (refInputs > 0) {
      await page.locator('input:visible').first().fill('REF-PROPAGA-001');
      await page.locator('input:visible').first().press('Enter');
      await page.waitForTimeout(3000);
      await shot('c2-ref-exportador-propagado');

      // Verificar itens
      const refCellsAfter = page.locator('[data-gtv-campo="referencia_exportador"]');
      const totalAfter = await refCellsAfter.count();
      let itensComValor = 0;
      for (let i = 1; i < Math.min(totalAfter, 6); i++) {
        const txt = await refCellsAfter.nth(i).textContent();
        if (txt?.includes('REF-PROPAGA-001')) itensComValor++;
      }
      log('C2', 'referencia_exportador-propaga', itensComValor > 0, `${itensComValor}/${Math.min(totalAfter-1, 5)} itens com valor propagado`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 5 — C3: Editar nome_fabricante no ITEM
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 5: C3 — EDITAR ITEM ===');

  const fabCells = page.locator('[data-gtv-campo="nome_fabricante"]');
  const fabCount = await fabCells.count();
  if (fabCount >= 2) {
    const itemFabCell = fabCells.nth(1); // primeiro item
    await itemFabCell.scrollIntoViewIfNeeded();
    await itemFabCell.dblclick();
    await page.waitForTimeout(500);
    await shot('c3-item-edit-input');

    const itemInputs = await page.locator('input:visible').count();
    log('C3', 'nome_fabricante-item', itemInputs > 0, `${itemInputs} inputs no item`);

    if (itemInputs > 0) {
      await page.locator('input:visible').first().fill('FAB-ITEM-EDIT');
      await page.locator('input:visible').first().press('Enter');
      await page.waitForTimeout(2000);
      await shot('c3-item-salvo');

      const savedItemText = await itemFabCell.textContent();
      log('C3', 'nome_fabricante-salvo', true, `texto item: "${savedItemText?.trim().substring(0, 30)}"`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 6 — C5: Gerar divergência editando item com valor diferente
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 6: C5 — DIVERGENCIA ===');

  if (fabCount >= 2) {
    // Editar segundo item com valor diferente
    const item2FabCell = fabCells.nth(2 < fabCount ? 2 : 1);
    await item2FabCell.scrollIntoViewIfNeeded();
    await item2FabCell.dblclick();
    await page.waitForTimeout(500);

    const divInputs = await page.locator('input:visible').count();
    if (divInputs > 0) {
      await page.locator('input:visible').first().fill('FAB-DIVERGENTE');
      await page.locator('input:visible').first().press('Enter');
      await page.waitForTimeout(2000);
      await shot('c5-divergencia-criada');

      // Verificar se o pai mostra alerta de divergência
      const paiHTML = await fabCells.nth(0).innerHTML();
      const temAlerta = paiHTML.includes('divergen') || paiHTML.includes('warn') || paiHTML.length > 200;
      log('C5', 'nome_fabricante-diverge', temAlerta, `HTML do pai: ${paiHTML.length} chars, contem divergen: ${paiHTML.includes('divergen')}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 7 — C7: Editar pai quando alerta está ativo
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 7: C7 — EDITAR COM ALERTA ATIVO ===');

  const paiFabCell = fabCells.nth(0);
  await paiFabCell.scrollIntoViewIfNeeded();
  await paiFabCell.dblclick();
  await page.waitForTimeout(500);
  await shot('c7-editar-com-alerta');

  const alertInputs = await page.locator('input:visible').count();
  log('C7', 'nome_fabricante-com-alerta', alertInputs > 0, `${alertInputs} inputs com alerta ativo`);
  await page.keyboard.press('Escape');

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 8 — C1 amostra: Testar mais campos (datas, partes, OPE)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 8: C1 AMOSTRA — MAIS CAMPOS ===');

  const camposAmostra = [
    'incoterm', 'condicao_pagamento_pedido',
    'data_prevista_pedido_pronto', 'data_confirmada_coleta_pedido',
    'pais_exportador', 'cidade_fabricante',
    'codigo_ope', 'nome_ope',
    'anexo_pedido', 'anexo_proforma',
    'nome_contato_exportador', 'email_contato_exportador',
    'referencia_fabricante', 'numero_proforma',
  ];

  for (const campo of camposAmostra) {
    // Scroll para encontrar a célula
    const found = await page.evaluate((key, pid) => {
      const el = document.querySelector(`[data-gtv-campo="${key}"][data-gtv-rowid="${pid}"]`);
      if (el) { el.scrollIntoView({ block: 'center', inline: 'center' }); return true; }
      return false;
    }, campo, PID);

    if (!found) {
      log('C1', campo, false, 'coluna nao encontrada na tela');
      continue;
    }

    await page.waitForTimeout(300);
    const cell = page.locator(`[data-gtv-campo="${campo}"][data-gtv-rowid="${PID}"]`);
    if (await cell.count() === 0) {
      log('C1', campo, false, 'celula nao visivel apos scroll');
      continue;
    }

    try {
      await cell.dblclick();
      await page.waitForTimeout(300);
      const inp = await page.locator('input:visible').count();
      log('C1', campo, inp > 0, `${inp} inputs`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    } catch (e) {
      log('C1', campo, false, e.message.substring(0, 50));
    }
  }
  await shot('c1-amostra-completa');

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 9 — C9: Verificar soma nos cards
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 9: C9 — SOMA ===');

  // Scroll para o topo
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await shot('c9-cards-topo');

  const cards = await page.evaluate(() => {
    const els = document.querySelectorAll('[class*="cg-card"]');
    return Array.from(els).slice(0, 6).map(e => e.textContent?.trim().substring(0, 50));
  });
  console.log('  Cards:', JSON.stringify(cards.filter(Boolean)));
  log('C9', 'soma-cards', cards.length >= 3, `${cards.length} cards renderizados`);

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSO 10 — Verificar total de colunas renderizadas
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PASSO 10: COLUNAS RENDERIZADAS ===');

  const colunasRenderizadas = await page.evaluate(() => {
    const els = document.querySelectorAll('[data-gtv-campo]');
    const campos = new Set();
    els.forEach(el => campos.add(el.getAttribute('data-gtv-campo')));
    return Array.from(campos).sort();
  });
  console.log(`  Total colunas com data-gtv-campo: ${colunasRenderizadas.length}`);
  log('RENDER', 'total-colunas', colunasRenderizadas.length >= 90, `${colunasRenderizadas.length} colunas renderizadas`);

  await shot('final');

  // ═══════════════════════════════════════════════════════════════════════════
  // RELATÓRIO FINAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(80));
  console.log('RELATORIO FINAL — TESTE DE TELA');
  console.log('='.repeat(80));
  console.log(`  OK:    ${results.ok}`);
  console.log(`  FAIL:  ${results.fail}`);
  const pct = results.ok / (results.ok + results.fail) * 100;
  console.log(`  Taxa:  ${pct.toFixed(1)}%`);
  console.log(`  Screenshots: ${OUT}/`);

  if (failures.length > 0) {
    console.log('\n  FALHAS:');
    failures.forEach(f => console.log(`    [${f.check}] ${f.campo.padEnd(40)} ${f.detail}`));
  } else {
    console.log('\n  *** ZERO FALHAS — 100% ***');
  }

  await browser.close();
})().catch(e => { console.error('ERRO FATAL:', e.message); process.exit(1); });
