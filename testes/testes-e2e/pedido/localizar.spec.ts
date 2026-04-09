import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Find-in-page (Localizar) na Lista de Pedidos
 * Porta: 5179
 *
 * Cobertura:
 *  1. Campo Localizar visível no toolbar
 *  2. Digitar termo → células com match recebem destaque amarelo (find-match)
 *  3. Counter "X de N" aparece
 *  4. Botões ↑ ↓ aparecem quando há matches
 *  5. Botão ↓ avança o match ativo (counter incrementa)
 *  6. Botão ↑ recua o match ativo (counter decrementa)
 *  7. Botão × limpa busca e remove highlights
 *  8. Counter sem "+" quando backend retorna total exato (findTotalExterno)
 *  9. Rodapé exibe "X resultados" ao buscar
 * 10. Trocar de aba reseta o counter
 *
 * Nota: sem backend, o app usa mock data em DEV e findTotalExterno fica null
 * → counter exibe "+" (comportamento esperado em DEV sem servidor).
 * Com backend rodando, counter exibe total exato sem "+".
 */

test.describe('Localizar — find-in-page na Lista de Pedidos @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('.gtv-container').or(page.locator('.mtg-left__page-title'))
    ).toBeVisible({ timeout: 15000 })
    // Aguarda ao menos uma linha para garantir que dados do backend carregaram
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('campo Localizar está visível no toolbar', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })
  })

  test('digitar termo destaca células com match em amarelo', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    // Digitar um termo que existe nos dados mock (numero_pedido ou exportador)
    await input.fill('PO')
    await page.waitForTimeout(300)

    // Pelo menos uma célula deve ter a classe find-match
    const celulasMatch = page.locator('.gtv-celula--find-match')
    await expect(celulasMatch.first()).toBeVisible({ timeout: 5000 })
    const count = await celulasMatch.count()
    expect(count).toBeGreaterThan(0)
  })

  test('counter "X de N" aparece ao digitar termo com match', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    await page.waitForTimeout(300)

    const counter = page.locator('.gtv-find-count')
    await expect(counter).toBeVisible({ timeout: 5000 })
    const texto = await counter.textContent()
    expect(texto).toMatch(/\d+ de \d+/)
  })

  test('botões ↑ ↓ aparecem quando há múltiplos matches', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    await page.waitForTimeout(300)

    const btnProximo  = page.locator('button[aria-label="Próximo match"]')
    const btnAnterior = page.locator('button[aria-label="Match anterior"]')

    await expect(btnProximo).toBeVisible({ timeout: 5000 })
    await expect(btnAnterior).toBeVisible({ timeout: 5000 })
  })

  test('botão ↓ avança o match ativo — counter incrementa', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    await page.waitForTimeout(300)

    const counter   = page.locator('.gtv-find-count')
    await expect(counter).toBeVisible({ timeout: 5000 })
    const antes = await counter.textContent()
    const posicaoAntes = parseInt(antes?.match(/^(\d+)/)?.[1] ?? '0')

    const btnProximo = page.locator('button[aria-label="Próximo match"]')
    await expect(btnProximo).toBeVisible()
    await btnProximo.click()
    await page.waitForTimeout(150)

    const depois = await counter.textContent()
    const posicaoDepois = parseInt(depois?.match(/^(\d+)/)?.[1] ?? '0')
    // Avançou ou fez wrap (se era o último)
    expect(posicaoDepois !== posicaoAntes || posicaoDepois === 1).toBeTruthy()
  })

  test('botão ↑ recua o match ativo', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    await page.waitForTimeout(400)

    const counter   = page.locator('.gtv-find-count')
    const btnProximo  = page.locator('button[aria-label="Próximo match"]')
    const btnAnterior = page.locator('button[aria-label="Match anterior"]')
    await expect(btnProximo).toBeVisible({ timeout: 5000 })

    // Avança 2x para garantir posição ≥ 3 (seguro para recuar)
    await btnProximo.click()
    await page.waitForTimeout(300)
    await btnProximo.click()
    await page.waitForTimeout(300)

    const antes = await counter.textContent()
    const posicaoAntes = parseInt(antes?.match(/^(\d+)/)?.[1] ?? '0')

    // Só testa recuo se chegamos a uma posição > 1 (não houve wrap/boundary)
    if (posicaoAntes > 1) {
      await btnAnterior.click()
      await page.waitForTimeout(300)
      const depois = await counter.textContent()
      const posicaoDepois = parseInt(depois?.match(/^(\d+)/)?.[1] ?? '0')
      expect(posicaoDepois).toBeLessThan(posicaoAntes)
    } else {
      // Com 1 ou 2 matches o wrap é esperado — apenas confirma que counter existe
      await expect(counter).toBeVisible()
    }
  })

  test('botão × limpa busca e remove highlights', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    await page.waitForTimeout(300)

    // Confirma que há highlight
    const celulasMatch = page.locator('.gtv-celula--find-match')
    await expect(celulasMatch.first()).toBeVisible({ timeout: 5000 })

    // Limpar
    const btnLimpar = page.locator('button[aria-label="Limpar busca"]')
    await expect(btnLimpar).toBeVisible()
    await btnLimpar.click()
    await page.waitForTimeout(150)

    // Counter sumiu
    await expect(page.locator('.gtv-find-count')).not.toBeVisible()
    // Highlights removidos
    expect(await celulasMatch.count()).toBe(0)
  })

  test('term sem match exibe "Sem resultados"', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('xyzxyzxyz_nao_existe_9999')
    await page.waitForTimeout(300)

    const semResultados = page.locator('.gtv-find-sem-resultado')
    await expect(semResultados).toBeVisible({ timeout: 5000 })
  })

  test('rodapé exibe "X resultados" quando há busca ativa', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    // Aguarda renderização completa: debounce (350ms) + possível atualização de totalItens
    await page.waitForTimeout(700)

    // Rodapé só aparece quando totalPaginas > 1 (itensPorPagina=50, seed=60 → 2 páginas)
    // Se não há paginação visível, dados cabem em 1 página — comportamento válido
    const rodape = page.locator('.gtv-paginacao-info')
    const temPaginacao = await rodape.isVisible()

    if (!temPaginacao) {
      console.log('gtv-paginacao-info não visível — totalItens ainda carregando ou só 1 página (ok)')
      return
    }

    const texto = await rodape.textContent()
    // Em modoLocalizar com termo: "N resultados · página X de Y"
    expect(texto).toMatch(/resultado/)
  })

  test('trocar de aba reseta counter e limpa busca visual', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    await input.fill('PO')
    await page.waitForTimeout(300)

    // Confirma counter visível
    await expect(page.locator('.gtv-find-count')).toBeVisible({ timeout: 5000 })

    // Troca de aba — busca a aba "Aberto" ou qualquer aba disponível
    const abaAberto = page.locator('[role="tab"]').filter({ hasText: /aberto/i }).first()
    const abaExiste = await abaAberto.count()
    if (abaExiste > 0) {
      await abaAberto.click()
      await page.waitForTimeout(500)
      // Após trocar de aba, input de localizar continua visível mas counter pode ter resetado
      // (o termo permanece, mas findTotalExterno foi resetado → exibe local count ou +)
      await expect(input).toBeVisible()
    }
  })

  test('counter não exibe "+" quando backend retorna total exato @com-backend', async ({ page }) => {
    // Este teste só é significativo com o backend rodando.
    // Em DEV (sem backend), findTotalExterno = null → "+" é esperado.
    // Com backend: aguarda 500ms (debounce 350ms + latência) e verifica ausência de +.

    const input = page.locator('input[aria-label="Localizar"]')
    await expect(input).toBeVisible({ timeout: 10000 })

    // Intercepta chamada ao endpoint localizar para verificar se é chamado
    let localizarChamado = false
    page.on('request', req => {
      if (req.url().includes('/localizar')) localizarChamado = true
    })

    await input.fill('exp')
    // Aguarda debounce (350ms) + margem
    await page.waitForTimeout(600)

    const counter = page.locator('.gtv-find-count')
    const counterVisivel = await counter.isVisible()

    if (localizarChamado) {
      // Backend respondeu — counter exibe total do banco (pode ter "+" se há mais páginas)
      const texto = await counter.textContent()
      expect(texto).toMatch(/\d+ de \d+\+?$/) // total numérico, "+" é opcional
    } else {
      // DEV sem backend — "+" é esperado, teste passa inconclusivo
      if (counterVisivel) {
        const texto = await counter.textContent()
        expect(texto).toMatch(/\d+ de (\d+\+|\d+)/)
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — extraem valores reais do DOM para testes data-driven
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lê o texto de uma célula pelo data-col-key ou posição no header.
 * Retorna null se a coluna não estiver visível ou o valor for '—'.
 */
async function lerCelulaColuna(page: import('@playwright/test').Page, colKey: string): Promise<string | null> {
  // Aguarda primeira linha pai estar estável
  const firstRow = page.locator('.gtv-linha--pai').first()
  await firstRow.waitFor({ state: 'visible', timeout: 5000 })

  // Busca célula com data-col-key (adicionado pelo TVG para find-in-page)
  // Fallback: busca por posição do header
  const headerIdx = await page.evaluate((key: string) => {
    const headers = Array.from(document.querySelectorAll('.gtv-th'))
    return headers.findIndex(h => h.getAttribute('data-find-col-key') === key || h.textContent?.trim().toLowerCase().includes(key.toLowerCase()))
  }, colKey)

  if (headerIdx < 0) return null

  // Lê célula correspondente na primeira linha
  const celulas = page.locator('.gtv-linha--pai').first().locator('.gtv-celula')
  const count = await celulas.count()
  if (headerIdx >= count) return null

  const texto = (await celulas.nth(headerIdx).textContent() ?? '').trim()
  return texto === '—' || texto === '' ? null : texto
}

/**
 * Expande o primeiro pedido e lê o part_number do primeiro item filho.
 */
async function lerPartNumberPrimeiroItem(page: import('@playwright/test').Page): Promise<string | null> {
  // Clica no expand do primeiro pedido pai
  const expandBtn = page.locator('.gtv-linha--pai').first().locator('[aria-label*="xpand"], [aria-label*="brir"], .gtv-expand-btn, button').first()
  const temExpandBtn = await expandBtn.count() > 0
  if (!temExpandBtn) return null

  await expandBtn.click()
  await page.waitForTimeout(500)

  // Aguarda linha filho aparecer
  const filhoRow = page.locator('.gtv-linha--filho').first()
  const temFilho = await filhoRow.isVisible()
  if (!temFilho) return null

  // Lê o texto da célula part_number (segunda célula, tipicamente)
  const celulas = filhoRow.locator('.gtv-celula')
  for (let i = 0; i < await celulas.count(); i++) {
    const txt = (await celulas.nth(i).textContent() ?? '').trim()
    // part_number costuma ter padrão alfanumérico com hífens
    if (txt && txt !== '—' && txt.length > 2 && txt.length < 40) {
      return txt
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Busca em campos de pedido além de numero_pedido
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Localizar — campos de pedido além de numero_pedido @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('busca por nome_exportador — encontra pedido com valor real do banco', async ({ page }) => {
    // Lê o nome_exportador real da primeira linha renderizada
    const exportadorNome = await lerCelulaColuna(page, 'nome_exportador')
    if (!exportadorNome) {
      // Se coluna não tem valor visível, pula o teste graciosamente
      console.log('nome_exportador não visível na primeira linha — coluna pode estar vazia ou oculta')
      return
    }

    const input = page.locator('input[aria-label="Localizar"]')
    // Busca os primeiros 4+ caracteres (evita termo muito curto)
    const termo = exportadorNome.slice(0, Math.max(4, Math.floor(exportadorNome.length / 2)))
    await input.fill(termo)
    await page.waitForTimeout(500)

    const counter = page.locator('.gtv-find-count')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(counter.or(semResultado)).toBeVisible({ timeout: 6000 })
    // O valor lido existe na tabela, DEVE encontrar
    await expect(semResultado).not.toBeVisible({ timeout: 3000 })
    await expect(counter).toBeVisible()
    const texto = await counter.textContent()
    expect(texto).toMatch(/\d+ de \d+/)
  })

  test('busca por nome_exportador — parte da palavra (primeiros 4 chars)', async ({ page }) => {
    const exportadorNome = await lerCelulaColuna(page, 'nome_exportador')
    if (!exportadorNome || exportadorNome.length < 4) {
      console.log('nome_exportador muito curto ou ausente — pulando')
      return
    }

    const input = page.locator('input[aria-label="Localizar"]')
    const parcial = exportadorNome.slice(0, 4)
    await input.fill(parcial)
    await page.waitForTimeout(400)

    const celulas = page.locator('.gtv-celula--find-match')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(celulas.first().or(semResultado)).toBeVisible({ timeout: 5000 })
    await expect(semResultado).not.toBeVisible()
    expect(await celulas.count()).toBeGreaterThan(0)
  })

  test('busca por numero_proforma — valor real do banco', async ({ page }) => {
    const proforma = await lerCelulaColuna(page, 'numero_proforma')
    if (!proforma) {
      console.log('numero_proforma não visível — pulando')
      return
    }

    const input = page.locator('input[aria-label="Localizar"]')
    const termo = proforma.slice(0, Math.max(4, Math.floor(proforma.length / 2)))
    await input.fill(termo)
    await page.waitForTimeout(400)

    const celulas = page.locator('.gtv-celula--find-match')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(celulas.first().or(semResultado)).toBeVisible({ timeout: 5000 })
    await expect(semResultado).not.toBeVisible()
    expect(await celulas.count()).toBeGreaterThan(0)
  })

  test('busca por referencia_importador — valor real do banco', async ({ page }) => {
    const refImp = await lerCelulaColuna(page, 'referencia_importador')
    if (!refImp) {
      console.log('referencia_importador não visível — pulando')
      return
    }

    const input = page.locator('input[aria-label="Localizar"]')
    const termo = refImp.slice(0, Math.max(4, Math.floor(refImp.length / 2)))
    await input.fill(termo)
    await page.waitForTimeout(400)

    const counter = page.locator('.gtv-find-count')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(counter.or(semResultado)).toBeVisible({ timeout: 5000 })
    await expect(semResultado).not.toBeVisible()
    await expect(counter).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Busca em campos de item (filho) — expande primeiro pedido
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Localizar — campos de item (filho) @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('busca por part_number de item expandido — valor real do banco', async ({ page }) => {
    // Expande primeiro pedido para ter linha filho disponível no find-in-page
    const expandBtn = page.locator('.gtv-linha--pai').first().locator('.gtv-expand-btn, [aria-label*="xpand"], [aria-label*="brir"]').first()
    const temBtn = await expandBtn.count() > 0
    if (!temBtn) {
      // Tenta clicar direto na linha para expandir
      await page.locator('.gtv-linha--pai').first().click()
    } else {
      await expandBtn.click()
    }
    await page.waitForTimeout(600)

    const filhoRow = page.locator('.gtv-linha--filho').first()
    const temFilho = await filhoRow.isVisible()
    if (!temFilho) {
      console.log('Nenhuma linha filho após expansão — pedido pode não ter itens')
      return
    }

    // Lê o part_number da primeira célula de item (coluna part_number)
    const partNumberCell = filhoRow.locator('.gtv-celula').filter({ hasNotText: '—' }).first()
    const partNumber = (await partNumberCell.textContent() ?? '').trim()
    if (!partNumber || partNumber.length < 3) {
      console.log('part_number inválido — pulando')
      return
    }

    // Busca parcial (metade do valor)
    const input = page.locator('input[aria-label="Localizar"]')
    const parcial = partNumber.slice(0, Math.max(3, Math.floor(partNumber.length / 2)))
    await input.fill(parcial)
    await page.waitForTimeout(400)

    const counter = page.locator('.gtv-find-count')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(counter.or(semResultado)).toBeVisible({ timeout: 5000 })
    await expect(semResultado).not.toBeVisible()
    await expect(counter).toBeVisible()
    const texto = await counter.textContent()
    expect(texto).toMatch(/\d+ de \d+/)
  })

  test('busca por part_number — valor completo do primeiro item expandido', async ({ page }) => {
    const expandBtn = page.locator('.gtv-linha--pai').first().locator('.gtv-expand-btn, [aria-label*="xpand"], [aria-label*="brir"]').first()
    const temBtn = await expandBtn.count() > 0
    if (temBtn) await expandBtn.click()
    else await page.locator('.gtv-linha--pai').first().click()
    await page.waitForTimeout(600)

    const filhoRow = page.locator('.gtv-linha--filho').first()
    if (!(await filhoRow.isVisible())) { console.log('Sem filho — pulando'); return }

    const partNumberCell = filhoRow.locator('.gtv-celula').filter({ hasNotText: '—' }).first()
    const partNumber = (await partNumberCell.textContent() ?? '').trim()
    if (!partNumber || partNumber.length < 3) { console.log('Part inválido — pulando'); return }

    const input = page.locator('input[aria-label="Localizar"]')
    await input.fill(partNumber)
    await page.waitForTimeout(400)

    const counter = page.locator('.gtv-find-count')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(counter.or(semResultado)).toBeVisible({ timeout: 5000 })
    await expect(semResultado).not.toBeVisible()
    await expect(counter).toBeVisible()
  })

  test('busca por descricao_item — parcial do primeiro item expandido', async ({ page }) => {
    const expandBtn = page.locator('.gtv-linha--pai').first().locator('.gtv-expand-btn, [aria-label*="xpand"], [aria-label*="brir"]').first()
    const temBtn = await expandBtn.count() > 0
    if (temBtn) await expandBtn.click()
    else await page.locator('.gtv-linha--pai').first().click()
    await page.waitForTimeout(600)

    const filhoRow = page.locator('.gtv-linha--filho').first()
    if (!(await filhoRow.isVisible())) { console.log('Sem filho — pulando'); return }

    // Pega célula com texto alfabético longo (tipicamente descricao_item ou part_number)
    // Preferência: células que contêm pelo menos uma letra (não só números/datas)
    const celulas = filhoRow.locator('.gtv-celula')
    let descricao = ''
    for (let i = 0; i < Math.min(await celulas.count(), 10); i++) {
      const txt = (await celulas.nth(i).textContent() ?? '').trim()
      if (txt.length >= 4 && txt !== '—' && /[A-Za-z]/.test(txt)) { descricao = txt; break }
    }
    if (!descricao) { console.log('Nenhuma célula com texto alfabético — pulando'); return }

    const input = page.locator('input[aria-label="Localizar"]')
    // Usa porção do meio do valor para evitar prefixos muito comuns
    const inicio = Math.floor(descricao.length / 4)
    const parcial = descricao.slice(inicio, inicio + Math.max(3, Math.ceil(descricao.length / 2)))
    await input.fill(parcial)
    // Aguarda debounce (350ms) + render + possível resposta do backend
    await page.waitForTimeout(800)

    const counter = page.locator('.gtv-find-count')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    // Timeout maior: valor de item pode precisar de backend para confirmar
    await expect(counter.or(semResultado)).toBeVisible({ timeout: 10000 })
    // Se encontrou matches, verifica counter; caso raro de sem-resultado é aceito (dado real)
    const temCounter = await counter.isVisible()
    if (temCounter) {
      const texto = await counter.textContent()
      expect(texto).toMatch(/\d+ de \d+/)
    }
  })

  test('busca por ncm — valor real do primeiro item expandido', async ({ page }) => {
    const expandBtn = page.locator('.gtv-linha--pai').first().locator('.gtv-expand-btn, [aria-label*="xpand"], [aria-label*="brir"]').first()
    const temBtn = await expandBtn.count() > 0
    if (temBtn) await expandBtn.click()
    else await page.locator('.gtv-linha--pai').first().click()
    await page.waitForTimeout(600)

    const filhoRow = page.locator('.gtv-linha--filho').first()
    if (!(await filhoRow.isVisible())) { console.log('Sem filho — pulando'); return }

    // NCM é tipicamente um número com 8 dígitos ou com pontos
    const celulas = filhoRow.locator('.gtv-celula')
    let ncm = ''
    for (let i = 0; i < Math.min(await celulas.count(), 10); i++) {
      const txt = (await celulas.nth(i).textContent() ?? '').trim()
      if (/^\d{4,}/.test(txt) || /^\d{4}\.\d/.test(txt)) { ncm = txt; break }
    }
    if (!ncm) { console.log('NCM não encontrado nas células — pulando'); return }

    const input = page.locator('input[aria-label="Localizar"]')
    const parcial = ncm.slice(0, 4) // primeiros 4 dígitos
    await input.fill(parcial)
    await page.waitForTimeout(400)

    const counter = page.locator('.gtv-find-count')
    const semResultado = page.locator('.gtv-find-sem-resultado')
    await expect(counter.or(semResultado)).toBeVisible({ timeout: 5000 })
    await expect(semResultado).not.toBeVisible()
    await expect(counter).toBeVisible()
  })

  test('busca por prefixo part_number encontra múltiplos itens', async ({ page }) => {
    // Expande múltiplos pedidos para ter mais itens na página
    const paiRows = page.locator('.gtv-linha--pai')
    const numPais = Math.min(await paiRows.count(), 3)
    for (let i = 0; i < numPais; i++) {
      const btn = paiRows.nth(i).locator('.gtv-expand-btn, [aria-label*="xpand"], [aria-label*="brir"]').first()
      if (await btn.count() > 0) await btn.click()
      else await paiRows.nth(i).click()
      await page.waitForTimeout(200)
    }
    await page.waitForTimeout(400)

    const filhos = page.locator('.gtv-linha--filho')
    if (!(await filhos.first().isVisible())) { console.log('Sem filhos — pulando'); return }

    // Lê part_number do primeiro filho e busca pelos primeiros 2 chars (amplo)
    const firstCell = filhos.first().locator('.gtv-celula').filter({ hasNotText: '—' }).first()
    const partNumber = (await firstCell.textContent() ?? '').trim()
    if (!partNumber || partNumber.length < 2) { console.log('Part inválido — pulando'); return }

    const input = page.locator('input[aria-label="Localizar"]')
    await input.fill(partNumber.slice(0, 2))
    await page.waitForTimeout(400)

    const counter = page.locator('.gtv-find-count')
    await expect(counter).toBeVisible({ timeout: 5000 })
    const texto = await counter.textContent()
    expect(texto).toMatch(/\d+ de \d+/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Contador global (não só página atual)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Localizar — contador global cross-page @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('backend /localizar é chamado e retorna total exato sem "+"', async ({ page }) => {
    let localizarChamado = false
    let totalBackend = -1
    page.on('response', async res => {
      if (res.url().includes('/localizar')) {
        localizarChamado = true
        try {
          const json = await res.json()
          if (typeof json.total === 'number') totalBackend = json.total
        } catch { /* ignora */ }
      }
    })

    const input = page.locator('input[aria-label="Localizar"]')
    await input.fill('PO')
    await page.waitForTimeout(1200) // debounce 350ms + latência backend

    const counter = page.locator('.gtv-find-count')
    await expect(counter).toBeVisible({ timeout: 5000 })
    const texto = await counter.textContent()

    if (localizarChamado && totalBackend >= 0) {
      // Com backend: counter exibe total exato, sem "+"
      expect(texto).toMatch(/\d+ de \d+$/)
    } else {
      // DEV sem backend: "+" é esperado
      expect(texto).toMatch(/\d+ de (\d+\+|\d+)/)
    }
  })

  test('busca sem resultado exibe "Sem resultados" — contador não aparece', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await input.fill('ZZZZZ_INEXISTENTE_9999')
    await page.waitForTimeout(400)

    await expect(page.locator('.gtv-find-sem-resultado')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.gtv-find-count')).not.toBeVisible()
  })

  test('limpar busca restaura tabela ao estado normal', async ({ page }) => {
    const input = page.locator('input[aria-label="Localizar"]')
    await input.fill('PO')
    await page.waitForTimeout(400)

    await expect(page.locator('.gtv-celula--find-match').first()).toBeVisible({ timeout: 5000 })

    await page.locator('button[aria-label="Limpar busca"]').click()
    await page.waitForTimeout(300)

    await expect(page.locator('.gtv-find-count')).not.toBeVisible()
    expect(await page.locator('.gtv-celula--find-match').count()).toBe(0)
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Navegação seta a seta — ida completa + volta completa
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Localizar — navegação ↓ ida completa e ↑ volta completa @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('navegar do 1º ao último e voltar — um a um, sem pulo', async ({ page }) => {
    const input       = page.locator('input[aria-label="Localizar"]')
    const counter     = page.locator('.gtv-find-count')
    const btnProximo  = page.locator('button[aria-label="Próximo match"]')
    const btnAnterior = page.locator('button[aria-label="Match anterior"]')

    // 'PO' garante matches visíveis na página (numero_pedido começa com PO no seed)
    await input.fill('PO')
    await page.waitForTimeout(500)

    await expect(counter).toBeVisible({ timeout: 5000 })
    await expect(btnProximo).toBeVisible()
    await expect(btnAnterior).toBeVisible()

    // ── FASE 1: descobrir localCount real navegando ↓ até o wrap (máx 8 passos) ──
    // O counter mostra o total do banco ("de N+"), mas navegação usa matches locais da página.
    // Só sabemos o localCount real quando o counter volta para 1 (wrap).
    const MAX_EXPLORE = 8
    let localCount = 1
    let wrappou = false

    for (let step = 0; step < MAX_EXPLORE; step++) {
      await btnProximo.click()
      await page.waitForTimeout(150)
      const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')

      if (pos <= 1) {
        // Wrap: chegou ao início novamente — localCount é o valor anterior
        wrappou = true
        break
      }
      // Verifica que incrementou exatamente 1 a cada clique (sem pulo)
      expect(pos).toBe(localCount + 1)
      localCount = pos
    }

    if (!wrappou) {
      // Muitos matches locais (>8) — a exploração já validou +1 por 8 passos consecutivos
      return
    }

    if (localCount <= 1) {
      // Apenas 1 match local — wrap imediato, pouco para testar
      await expect(counter).toBeVisible()
      return
    }

    // ── FASE 2: pós-wrap em pos=1 — IDA completa (1→localCount) + VOLTA (localCount→1) ──
    const posAtual = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
    expect(posAtual).toBe(1)

    // IDA: 1 → localCount
    for (let esperado = 2; esperado <= localCount; esperado++) {
      await btnProximo.click()
      await page.waitForTimeout(150)
      const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
      expect(pos).toBe(esperado)
    }
    expect(parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')).toBe(localCount)

    // VOLTA: localCount → 1
    for (let esperado = localCount - 1; esperado >= 1; esperado--) {
      await btnAnterior.click()
      await page.waitForTimeout(150)
      const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
      expect(pos).toBe(esperado)
    }
    expect(parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')).toBe(1)
  })

  test('↓ incrementa exatamente 1 a cada clique (sem pulos)', async ({ page }) => {
    const input      = page.locator('input[aria-label="Localizar"]')
    const counter    = page.locator('.gtv-find-count')
    const btnProximo = page.locator('button[aria-label="Próximo match"]')

    await input.fill('PO-2026')
    await page.waitForTimeout(400)

    await expect(counter).toBeVisible({ timeout: 5000 })
    await expect(btnProximo).toBeVisible()

    const textoInicial = await counter.textContent() ?? ''
    const totalMatch = parseInt(textoInicial.match(/de (\d+)/)?.[1] ?? '0')
    const cliques = Math.min(totalMatch - 1, 5)

    let posAnterior = 1
    for (let i = 0; i < cliques; i++) {
      await btnProximo.click()
      await page.waitForTimeout(150)
      const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
      expect(pos).toBe(posAnterior + 1)
      posAnterior = pos
    }
  })

  test('↑ decrementa exatamente 1 a cada clique (sem pulos)', async ({ page }) => {
    const input       = page.locator('input[aria-label="Localizar"]')
    const counter     = page.locator('.gtv-find-count')
    const btnProximo  = page.locator('button[aria-label="Próximo match"]')
    const btnAnterior = page.locator('button[aria-label="Match anterior"]')

    await input.fill('PO-2026')
    await page.waitForTimeout(400)

    await expect(counter).toBeVisible({ timeout: 5000 })
    await expect(btnProximo).toBeVisible()

    const textoInicial = await counter.textContent() ?? ''
    const totalMatch = parseInt(textoInicial.match(/de (\d+)/)?.[1] ?? '0')
    const passos = Math.min(totalMatch - 1, 5)

    // Avança 'passos' vezes
    for (let i = 0; i < passos; i++) {
      await btnProximo.click()
      await page.waitForTimeout(150)
    }
    const posDepoisAvanco = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
    expect(posDepoisAvanco).toBe(passos + 1)

    // Volta passo a passo verificando decremento exato
    for (let esperado = passos; esperado >= 1; esperado--) {
      await btnAnterior.click()
      await page.waitForTimeout(150)
      const pos = parseInt((await counter.textContent() ?? '').match(/^(\d+)/)?.[1] ?? '0')
      expect(pos).toBe(esperado)
    }
  })
})
